import {
  AdditiveBlending,
  Color,
  DoubleSide,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Vector3
} from 'three';
import { Ability, AbilityPhase } from './Ability.js';
import { createBoltBody, disposeBoltBody, BOLT_FORWARD } from './bolt-bodies.js';
import { boltFx } from './bolt-fx.js';
import { MAX_SUBSTEPS, _from, _to, _heading, _ahead, _behind, _quat } from './bolt-scratch.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { RateEmitter } from '../particles/ParticleEngine.js';
import { settings } from '../config/settings.js';
import { clamp, lerp, saturate } from '../utils/math.js';

const TAU = Math.PI * 2;

/** Half-width of the numeric-difference window used for headings and speeds. */
const EPS = 0.004;

/**
 * BOLT — a body thrown along the aimed line that can miss.
 *
 * Every other engine in this library resolves at the end of its cast line,
 * because the end of the line is the only place it *can* resolve: there was
 * nothing on the stage to touch and no state to change, so an impact was a point
 * in time rather than an event. A bolt is the opposite. It is a real object with
 * a real flight time, its swept path is tested against the training effigy piece
 * by piece, and the two things it can do — connect, or sail past — are different
 * events with different vocabularies. The whole point of the group is that the
 * second one is possible.
 *
 * **How it hooks into the base class without touching it.** `Ability#update`
 * calls `advance(dt)` and, on the frame that returns `true`, moves to the impact
 * phase and calls `onImpact()`. That is exactly the contract a projectile wants,
 * so `advance` is overridden to return `true` on *either* ending: at the target
 * point, or the moment a substep touches something. `onImpact` then reads
 * `_hitTarget` to decide which of the two just happened. Nothing else in the
 * project changes, and none of the eighty existing signatures shares a line of
 * this file.
 *
 * **Damage lands exactly once, or not at all.** `_damaged` is set inside
 * `onImpact` before `applyDamage` is called and cleared only by a fresh
 * `onSpawn`. `destroy()` — which `AbilityManager` fires on the oldest bolt when
 * a fourth is cast — never runs any of it. There is no other path from this
 * class to the effigy's health.
 *
 * **The path is a function, never a recording.** `_pathPoint(s)` resolves every
 * metre out of the live settings block, so dragging `arc` or `weaveAmp` re-bends
 * a projectile that is already halfway downrange — collision included, because
 * the substeps are taken on the curve rather than on the straight line under it.
 * The only state a cast carries is how far along it is.
 */
export class BoltAbility extends Ability {
  constructor(context, element = 'lancet') {
    super(element, context);
  }

  /* ------------------------------------------------------------------ */
  /* Construction                                                        */
  /* ------------------------------------------------------------------ */

  createShaders() {
    /*
     * Four materials, shared by every part of whichever body is built below and
     * re-synced from the settings block every frame — so a colour dragged in the
     * editor moves on a body that is already in the air.
     */
    this.bodyMaterial = new MeshStandardMaterial({
      color: new Color(1, 1, 1),
      emissive: new Color(1, 1, 1),
      emissiveIntensity: 1,
      roughness: 0.5,
      metalness: 0.1
    });
    this.edgeMaterial = new MeshStandardMaterial({
      color: new Color(1, 1, 1),
      emissive: new Color(1, 1, 1),
      emissiveIntensity: 1.6,
      roughness: 0.4,
      metalness: 0.2
    });

    /** The lit core and the halo: additive, unlit, never in the depth prepass. */
    const additive = (opacity) =>
      new MeshBasicMaterial({
        color: new Color(1, 1, 1),
        transparent: true,
        opacity,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        side: DoubleSide
      });
    this.coreMaterial = additive(0.9);
    this.shellMaterial = additive(0.3);

    this.materials = {
      body: this.bodyMaterial,
      edge: this.edgeMaterial,
      core: this.coreMaterial,
      shell: this.shellMaterial
    };

    /** Which builder is currently assembled, so `shape` stays a live control. */
    this._shapeKey = '';
    /** Base scales the builder gave the core and the halo, multiplied not replaced. */
    this._coreBase = new Vector3(1, 1, 1);
    this._shellBase = new Vector3(1, 1, 1);
    this.body = null;
    this._buildBody();

    this._createTrail();

    /* --- flight state; all of it reset by `onSpawn` --- */
    /** Metres of the *axis* covered so far — the path parameter, in metres. */
    this._travelled = 0;
    /** Where the last frame paid its wake out from, in `s`. */
    this._lastS = 0;
    /** The target this body touched, or null while it is still flying / missed. */
    this._hitTarget = null;
    /** Health has been removed for this cast. Never true twice. */
    this._damaged = false;
    /** Where on the path the contact happened, 0..1. */
    this._hitS = 1;
    /** The contact point in world space — the anchor for every impact effect. */
    this._contact = new Vector3();
    this._bodyVisible = false;
  }

  createParticles() {
    const particles = this.ctx.particles;

    // Both systems are shared by all ten bolts: they are re-gradiented from the
    // live block every frame, which is the same arrangement the five meteors run
    // on, and the alternative is twenty pools for three concurrent casts.
    this.embers = particles.get('bolt.embers', {
      capacity: 3600,
      shape: ParticleShape.SOFT,
      additive: true,
      curl: true,
      softFade: 0.35
    });
    this.embers.uniforms.uDrag.value = 1.4;
    this.embers.uniforms.uEndSize.value = 0.05;
    this.embers.uniforms.uSizeIn.value = 0.04;
    this.embers.uniforms.uFadeIn.value = 0.04;
    this.embers.uniforms.uFadeOut.value = 0.34;

    this.sparks = particles.get('bolt.sparks', {
      capacity: 3000,
      shape: ParticleShape.STREAK,
      additive: true,
      stretch: true,
      softFade: 0.22
    });
    this.sparks.uniforms.uDrag.value = 0.8;
    this.sparks.uniforms.uEndSize.value = 0.22;
    this.sparks.uniforms.uSizeIn.value = 0.02;
    this.sparks.uniforms.uFadeOut.value = 0.5;

    this.emberEmitter = new RateEmitter();
    this.sparkEmitter = new RateEmitter();
  }

  /** Assemble the body named by `shape`, disposing whatever was there before. */
  _buildBody() {
    const c = this.config;
    if (c.shape === this._shapeKey && this.body) return;
    this._shapeKey = c.shape;

    if (this.body) {
      this.group.remove(this.body.group);
      disposeBoltBody(this.body);
    }

    this.body = createBoltBody(c.shape, this.materials);
    this.body.group.visible = this._bodyVisible;
    this.group.add(this.body.group);

    // The builders shape the halo themselves (a chakram's is a torus, a
    // spindle's is stretched twice as long as it is wide). `shellSize` scales
    // that, it does not overwrite it.
    if (this.body.core) this._coreBase.copy(this.body.core.scale);
    else this._coreBase.set(1, 1, 1);
    if (this.body.shell) this._shellBase.copy(this.body.shell.scale);
    else this._shellBase.set(1, 1, 1);
  }

  /* ------------------------------------------------------------------ */
  /* Timing                                                              */
  /* ------------------------------------------------------------------ */

  /** One body in the air, and nothing at all once it is gone. */
  get instanceCount() {
    return this._bodyVisible ? 1 : 0;
  }

  get impactDuration() {
    return Math.max(0.15, this.config.lifetime * settings.global.lifetime);
  }

  get fadeDuration() {
    return Math.max(0.15, this.config.fadeTime);
  }

  /** Seconds since the body stopped — whichever way it stopped. */
  get _sinceImpact() {
    if (this.phase === AbilityPhase.FADE) return this.impactDuration + this.fadeTime;
    return this.phase === AbilityPhase.IMPACT ? this.impactTime : 0;
  }

  lightShimmer() {
    const c = this.config;
    const rate = Math.max(0.1, c.lightFlickerSpeed);
    const wobble = Math.sin(this.age * rate) * Math.sin(this.age * rate * 0.41 + 1.3);
    return 1 - saturate(c.lightFlicker) * (0.5 + 0.5 * wobble);
  }

  /* ------------------------------------------------------------------ */
  /* The path — every metre resolved from live settings                   */
  /* ------------------------------------------------------------------ */

  /**
   * Metres of *axis* between the hand and the target point.
   *
   * Read live rather than captured at spawn: `handForward` is a slider, and the
   * whole family's rule is that a control moved mid-flight moves the shot that
   * is already in the air. The floor of half a metre keeps a point-blank cast
   * from dividing the parameterisation by nothing.
   */
  get _axisSpan() {
    return Math.max(0.5, this.length - this.config.handForward);
  }

  /**
   * A point on the flight path. `s` runs 0 (leaving the hand) to 1 (the target).
   *
   * Three superimposed terms, in this order: the straight line from the hand to
   * the target point, the lob, and the weave. The last two are both pinned to
   * zero at *both* ends — the arc by `sin(sπ)`, the weave by `√sin(sπ)` — so
   * however hard either is driven, the body still leaves the caster's hand and
   * still arrives at the point that was aimed at. That is what keeps a corkscrew
   * aimable.
   */
  _pathPoint(s, out) {
    const c = this.config;
    const t = saturate(s);

    out
      .copy(this.origin)
      .addScaledVector(this.direction, lerp(c.handForward, this.length, t))
      .addScaledVector(this.side, c.handSide * (1 - t));
    out.y =
      lerp(c.handHeight, c.endHeight, t) +
      c.arc * Math.pow(Math.sin(t * Math.PI), Math.max(0.05, c.arcCurve));

    // √sin rather than sin: the weave is meant to be at full width for most of
    // the flight and only collapse at the very ends, where a plain sine spends
    // half the shot ramping up.
    const bend = c.weaveAmp * Math.sqrt(Math.max(0, Math.sin(t * Math.PI)));
    if (bend > 1e-5) {
      // Cycles per *metre travelled*, so the helix keeps its pitch whether the
      // shot is five metres or thirty.
      const phase = t * this._axisSpan * c.weaveFreq * TAU;
      // Driving both gains at once puts the two displacements a quarter cycle
      // apart, which is a helix rather than a diagonal swing.
      out.addScaledVector(this.side, Math.sin(phase) * bend * c.weaveLateral);
      out.y += Math.cos(phase) * bend * c.weaveVertical;
    }
    return out;
  }

  /** A window of width `2·EPS` inside [0,1], so the ends are not one-sided. */
  _window(s) {
    return clamp(s - EPS, 0, Math.max(0, 1 - 2 * EPS));
  }

  /**
   * Unit direction of travel at `s`.
   *
   * Differentiated numerically off `_pathPoint` rather than by hand: the arc and
   * the weave are live sliders, and a hand-written derivative is one more thing
   * that silently stops matching them.
   */
  _headingAt(s, out) {
    const lo = this._window(s);
    this._pathPoint(lo, _behind);
    this._pathPoint(lo + 2 * EPS, _ahead);
    out.subVectors(_ahead, _behind);
    if (out.lengthSq() < 1e-10) return out.copy(this.direction);
    return out.normalize();
  }

  /**
   * World metres of path per unit of `s` — the conversion `advance` runs on.
   *
   * Without it, `speed` would be a speed along the *axis* rather than along the
   * path, and a tightly wound quill would cross the room several times faster
   * than a lancet set to the same number. It is also what sizes the substeps: a
   * weave adds real distance, and the collision has to be split over the path
   * that was actually flown, not over its shadow on the floor.
   */
  _pathRate(s) {
    const lo = this._window(s);
    this._pathPoint(lo, _behind);
    this._pathPoint(lo + 2 * EPS, _ahead);
    return _ahead.distanceTo(_behind) / (2 * EPS);
  }

  /* ------------------------------------------------------------------ */
  /* Flight and collision                                                */
  /* ------------------------------------------------------------------ */

  /**
   * Move the body, testing everything it passes through on the way.
   *
   * The one override that makes this family work. `Ability#update` treats a
   * `true` here as "the cast has arrived" and calls `onImpact()` on the same
   * frame, so returning `true` early — the moment a substep touches a target —
   * is what turns a timeline into a collision without the base class knowing
   * anything about it.
   *
   * The frame's movement is split into substeps no longer than `stepLength`
   * *of path*. That is not a nicety: the sabot covers 1.23 m in a 60 fps frame,
   * and the effigy's collision sphere is 0.86 m across, so a single test per
   * frame would let it pass clean through a target it visibly went into and
   * report a miss.
   *
   * @returns {boolean} true on the frame it connects, or reaches the target
   */
  advance(dt) {
    // A paused sandbox must neither move the body nor collide with anything —
    // the editor stays live while the clock is stopped, and re-reading the
    // settings must not be able to score a hit.
    if (dt <= 0) return false;

    const c = this.config;
    const span = this._axisSpan;
    const s0 = saturate(this._travelled / span);
    if (s0 >= 1) return false;

    // Muzzle speed at the hand, `accel` × that at the target, straight-line in
    // between: above 1 it is still gaining when it arrives, below 1 it is a lob
    // running out of energy.
    const speed =
      Math.max(0.1, c.speed) * lerp(1, Math.max(0.05, c.accel), s0) * settings.global.speed;
    const reach = speed * dt; // metres of path this frame

    const rate = Math.max(0.05, this._pathRate(s0));
    const ds = Math.min(1 - s0, reach / rate);
    const steps = clamp(
      Math.ceil((ds * rate) / Math.max(0.05, c.stepLength)),
      1,
      MAX_SUBSTEPS
    );

    const radius = Math.max(0.01, c.hitRadius);
    this._pathPoint(s0, _from);
    let sPrev = s0;

    for (let i = 1; i <= steps; i++) {
      const sNext = s0 + (ds * i) / steps;
      this._pathPoint(sNext, _to);

      const hit = this.ctx.combat?.sweep(_from, _to, radius);
      if (hit) {
        // Freeze the whole cast on the contact: the impact effects, the light
        // and the trail's head all read these three, and they have to agree.
        this._hitTarget = hit.target;
        this._contact.copy(hit.point);
        this._hitS = lerp(sPrev, sNext, hit.t);
        this._travelled = this._hitS * span;
        this.u = this._hitS;
        this.position.copy(this._contact);
        return true;
      }

      _from.copy(_to);
      sPrev = sNext;
    }

    this._travelled = Math.min(span, this._travelled + ds * span);
    const s = saturate(this._travelled / span);
    this.u = s;
    this._pathPoint(s, this.position);

    if (s >= 1) {
      // Nothing was touched anywhere along the line: the shot missed, and the
      // target point is only where it runs out.
      this._hitS = 1;
      this._contact.copy(this.position);
      return true;
    }
    return false;
  }

  /* ------------------------------------------------------------------ */
  /* The body                                                            */
  /* ------------------------------------------------------------------ */

  /**
   * Put the body on the path, pointed the way it is going.
   *
   * Three rotations compose here, and the order is the reason the bodies look
   * right: the heading first (every builder assembles along +Z), then the
   * end-over-end tumble about the horizontal axis across the shot, then the roll
   * about the body's *own* nose. Rolling last is what lets a chakram — a torus
   * whose axis is +Z — spin in its own plane with no extra frame.
   */
  _updateBody() {
    const c = this.config;
    if (!this.body) return;

    const s = this.phase === AbilityPhase.TRAVEL ? saturate(this.u) : this._hitS;
    const group = this.body.group;

    this._pathPoint(s, group.position);
    this._headingAt(s, _heading);

    group.quaternion.setFromUnitVectors(BOLT_FORWARD, _heading);
    if (c.tumble !== 0) {
      // About `side` — flat and across the shot — so a mortar turns nose over
      // tail the way a thrown rock does, rather than yawing about the vertical.
      _quat.setFromAxisAngle(this.side, this.age * c.tumble);
      group.quaternion.premultiply(_quat);
    }
    if (c.spin !== 0) {
      // Post-multiplied, so the roll is about the body's *own* nose whatever the
      // tumble has already done to it.
      _quat.setFromAxisAngle(BOLT_FORWARD, this.age * c.spin);
      group.quaternion.multiply(_quat);
    }

    // `bodyStretch` is the only non-uniform axis, and it is the heading — which
    // is why `bolt-bodies.js` keeps every live rotation about Z.
    const size = Math.max(0.01, c.bodySize);
    group.scale.set(size, size, size * Math.max(0.05, c.bodyStretch));

    this.body.animate(this.age, Math.max(0, c.wobble));
  }

  /* ------------------------------------------------------------------ */
  /* Phases                                                              */
  /* ------------------------------------------------------------------ */

  onSpawn() {
    this._travelled = 0;
    this._lastS = 0;
    this._hitTarget = null;
    this._damaged = false;
    this._hitS = 1;
    this._contact.copy(this.origin);
    this._bodyVisible = true;

    this.emberEmitter.reset();
    this.sparkEmitter.reset();

    this._buildBody();
    this.body.group.visible = true;

    this._pathPoint(0, this.position);
    this._syncMaterials(0);
    this._updateBody();
    this._updateTrail(0);
    this._launchFx();
  }

  onTravel(dt) {
    this._syncMaterials(0);
    this._updateBody();
    this._updateTrail(0);
    this._trailFx(dt);
    this._lastS = saturate(this.u);
  }

  /**
   * The two endings.
   *
   * This is the only place in the class that can remove health, and it can only
   * do it once: `_damaged` is raised before `applyDamage` is called and is
   * cleared by nothing but a fresh cast. A body that was recycled by
   * `AbilityManager` to make room for a fourth shot never reaches this method at
   * all — `destroy()` does not call it.
   */
  onImpact() {
    const c = this.config;

    this._bodyVisible = false;
    if (this.body) this.body.group.visible = false;
    this.position.copy(this._contact);

    if (this._hitTarget && !this._damaged) {
      this._damaged = true;
      this._headingAt(this._hitS, _heading);
      this._hitTarget.applyDamage(c.damage, this._contact, _heading);
      this._contactFx();
      this._groundMark();
    } else {
      // It went past. Deliberately quiet — no ring, no shake, no screen flash:
      // a miss has to be readable as *nothing having happened*.
      this._fizzleFx();
    }

    this._updateTrail(0);
  }

  onFade(dt) {
    const c = this.config;
    // The wake is no longer being fed, so it burns back from the head.
    const burn = saturate(this._sinceImpact / Math.max(0.05, c.trailBurnout));
    this._syncMaterials(burn);
    this._updateTrail(burn);
    this.position.copy(this._contact);
  }

  onDestroy() {
    this._bodyVisible = false;
    this._hitTarget = null;
    if (this.body) this.body.group.visible = false;
    this.coreRibbon.clear();
    this.sheathRibbon.clear();
    this.coreTrail.visible = false;
    this.sheathTrail.visible = false;
  }

  dispose() {
    if (this.body) disposeBoltBody(this.body);
    this.coreRibbon.dispose();
    this.sheathRibbon.dispose();
    this.coreTrailMaterial.dispose();
    this.sheathTrailMaterial.dispose();
    this.bodyMaterial.dispose();
    this.edgeMaterial.dispose();
    this.coreMaterial.dispose();
    this.shellMaterial.dispose();
    super.dispose();
  }
}

/**
 * The other half of this engine lives in `bolt-fx.js`.
 *
 * `BoltAbility` was over the 800-line rule in `AGENTS.md` with the materials,
 * the wake and the four one-shot effects in it. The methods did not change —
 * they are still methods on this prototype, reached through `this`, and free to
 * call `_pathPoint`, `_headingAt` and the rest that stayed here. The split is
 * the only reason there are two files.
 */
Object.assign(BoltAbility.prototype, boltFx);
