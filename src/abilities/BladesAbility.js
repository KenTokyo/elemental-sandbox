import { Vector3 } from 'three';
import { Ability } from './Ability.js';
import { StrandBundle } from './support/StrandBundle.js';
import { StrandMode } from '../materials/StrandMaterial.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { RateEmitter } from '../particles/ParticleEngine.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { frame } from '../core/FrameUniforms.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';
import { saturate, Easing, randRange } from '../utils/math.js';

/** Crescents in one cast. The editor's `slashes` clamps here. */
const MAX_SLASHES = 14;

const _emit = {};
const _pos = new Vector3();
const _dir = new Vector3();
const _e1 = new Vector3();
const _e2 = new Vector3();

/**
 * SPECTRAL BLADES — the one signature in the library made of *strokes*.
 *
 * Everything else here is a thing that stands somewhere: a column, a dome, a
 * hole. This is a sequence of cuts, and the whole design follows from that one
 * difference — it has a *rhythm*, and the rhythm is the effect.
 *
 * The schedule lives in `StrandMode.CRESCENT` and nowhere else: stroke `s`
 * starts at `s × slashInterval` and is lit for `slashLife`, both derived from
 * the instance index inside the vertex shader. The CPU holds no queue, no
 * array of pending strokes and no captured path — it only ever *reads* the
 * same closed form to decide where to throw a burst of sparks, which is why
 * dragging `slashInterval` in the editor re-times blades that are already in
 * the air instead of desynchronising the sparks from them.
 *
 * `_strokeCentre` mirrors the shader's `strandConstants` down to the hash, so
 * a stroke's sparks are born on the blade rather than near it. That mirror is
 * the fragile part of this file: `_rnd` must stay the shader's `rnd`.
 *
 * The afterimage is a second bundle at the same uniforms with the clock pushed
 * back by `echoDelay`, widened by `echoSpread` and dimmed to `echo`. A trailing
 * copy of the *shape function* is much cheaper than any history buffer, and it
 * cannot ever lag out of alignment with the blade it is trailing.
 */
export class BladesAbility extends Ability {
  constructor(context, element = 'blades') {
    super(element, context);
  }

  /* ------------------------------------------------------------------ */
  /* Construction                                                        */
  /* ------------------------------------------------------------------ */

  createShaders() {
    // The blade itself, and one afterimage behind it. Same mode, same uniforms,
    // different clock — see `_syncBundle`.
    this.blades = new StrandBundle(this.group, StrandMode.CRESCENT, {
      nodes: 52,
      capacity: MAX_SLASHES,
      renderOrder: 13
    });

    this.echo = new StrandBundle(this.group, StrandMode.CRESCENT, {
      nodes: 40,
      capacity: MAX_SLASHES,
      renderOrder: 11 // behind the blade, so the blade always reads as the edge
    });

    this._seed = 0;
    this._nextStroke = 0;
    this._look = {};
    this._echoLook = {};
  }

  createParticles() {
    const particles = this.ctx.particles;

    // Struck off the edge as it cuts — this ability's only real particle system.
    this.sparks = particles.get('blades.sparks', {
      capacity: 4000,
      shape: ParticleShape.STREAK,
      additive: true,
      stretch: true,
      softFade: 0.25
    });
    this.sparks.uniforms.uDrag.value = 2.2;
    this.sparks.uniforms.uEndSize.value = 0.1;
    this.sparks.uniforms.uSizeIn.value = 0.02;
    this.sparks.uniforms.uFadeIn.value = 0.02;
    this.sparks.uniforms.uFadeOut.value = 0.4;

    // The haze a cut leaves hanging in the air where it passed.
    this.trail = particles.get('blades.trail', {
      capacity: 2400,
      shape: ParticleShape.SOFT,
      additive: true,
      curl: true,
      softFade: 0.5
    });
    this.trail.uniforms.uDrag.value = 3.0;
    this.trail.uniforms.uEndSize.value = 1.4;
    this.trail.uniforms.uSizeIn.value = 0.1;
    this.trail.uniforms.uFadeIn.value = 0.05;
    this.trail.uniforms.uFadeOut.value = 0.5;

    this.sparkEmitter = new RateEmitter();
    this.trailEmitter = new RateEmitter();
  }

  /* ------------------------------------------------------------------ */
  /* Timing                                                              */
  /* ------------------------------------------------------------------ */

  get instanceCount() {
    return (this.blades.count + this.echo.count) * 2;
  }

  get impactDuration() {
    return Math.max(0.2, this.config.lifetime * settings.global.lifetime);
  }

  get fadeDuration() {
    return Math.max(0.1, this.config.fadeTime);
  }

  /** Live strokes, clamped to what the bundles can draw. */
  get strokeCount() {
    return Math.max(1, Math.min(MAX_SLASHES, Math.round(this.config.slashes)));
  }

  /** A blade gutters as it cuts rather than shimmering like ice. */
  lightShimmer() {
    const c = this.config;
    return 1 - c.lightFlicker * (0.5 + 0.5 * Math.sin(this.age * c.lightFlickerSpeed));
  }

  _handPoint(out) {
    const c = this.config;
    out
      .copy(this.origin)
      .addScaledVector(this.direction, c.handForward)
      .addScaledVector(this.side, c.handSide);
    out.y = c.handHeight;
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* The shader's schedule, mirrored                                     */
  /* ------------------------------------------------------------------ */

  /**
   * `hash11` from `shaders/lib/noise.glsl.js`, verbatim.
   *
   * NOT `utils/math.js#hash11` — that is a different formula, and using it here
   * would put every spark a metre away from the blade that threw it.
   */
  _hash11(p) {
    p = _fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return _fract(p);
  }

  /** `rnd(n)` from the strand shader — the seeded wrapper around `_hash11`. */
  _rnd(n) {
    return this._hash11(n * 1.7 + this._seed * 13.3);
  }

  /** When stroke `s` starts, seconds since the cast. */
  _strokeStart(s) {
    return s * this.config.slashInterval;
  }

  /**
   * Where stroke `s` is cut, world space.
   *
   * Mirrors the CRESCENT branch: `along = (s + 0.85) / count` down the cast
   * line, lifted to `slashHeight` and offset by the strand's own `b.y`.
   */
  _strokeCentre(s, out) {
    const c = this.config;
    const along = (s + 0.85) / this.strokeCount;
    const bY = this._rnd(s + 6) * 2 - 1;
    out
      .copy(this.origin)
      .addScaledVector(this.direction, along * this.length);
    out.y = c.slashHeight + bY * 0.6;
    return out;
  }

  /** How wide stroke `s` cut — the shader's `uRadius * (0.75 + 0.5 * a.y)`. */
  _strokeRadius(s) {
    const aY = this._rnd(s + 2);
    return this.config.slashRadius * (0.75 + 0.5 * aY);
  }

  /** The roll of stroke `s` about the cast line, radians. */
  _strokeRoll(s) {
    const aY = this._rnd(s + 2);
    return (aY * 2 - 1) * this.config.slashTilt;
  }

  /**
   * The two basis vectors a crescent is drawn in, into the `_e1`/`_e2`
   * scratch pair — the shader's `e1`/`e2`, minus the pitch term.
   *
   * `side` is flat, so rolling it about the cast line is one cosine and one
   * addition on Y rather than a quaternion.
   */
  _strokePlane(roll) {
    _e1.copy(this.side).multiplyScalar(Math.cos(roll));
    _e1.y += Math.sin(roll);
    _e2.copy(this.side).multiplyScalar(-Math.sin(roll));
    _e2.y += Math.cos(roll);
  }

  /* ------------------------------------------------------------------ */
  /* Casting                                                             */
  /* ------------------------------------------------------------------ */

  onSpawn() {
    this.sparkEmitter.reset();
    this.trailEmitter.reset();

    this._seed = Math.random() * 100;
    this._nextStroke = 0;

    this.blades.set('uSeed', this._seed);
    this.echo.set('uSeed', this._seed);

    this._sync(1);
    this._muzzleFx();
  }

  /* ------------------------------------------------------------------ */
  /* Feedback                                                            */
  /* ------------------------------------------------------------------ */

  _sync(fade) {
    const c = this.config;
    const g = settings.global;

    this._syncBundle(this.blades, fade, 0);
    this._syncBundle(this.echo, fade * c.echo, c.echoDelay);

    this.sparks.setGradient(
      getColor(c.colorSparkA),
      getColor(c.colorSparkB),
      getColor(c.colorSparkC),
      getColor(c.colorSparkD)
    );
    this.sparks.uniforms.uGravity.value.set(0, c.sparkGravity, 0);
    this.sparks.uniforms.uSizeScale.value = c.sparkSize * g.particleSize * 7;
    this.sparks.uniforms.uLifeScale.value = c.sparkLifetime * 0.5 * g.particleLifetime;
    this.sparks.uniforms.uSpeedScale.value = g.particleSpeed;
    this.sparks.uniforms.uOpacity.value = g.opacity;
    this.sparks.uniforms.uGlow.value = c.glow * 0.7 * g.glow;
    this.sparks.uniforms.uStretch.value = c.sparkStretch;

    this.trail.setGradient(
      getColor(c.colorCore),
      getColor(c.colorInner),
      getColor(c.colorOuter),
      getColor(c.colorHalo)
    );
    this.trail.uniforms.uGravity.value.set(0, 0.2, 0);
    this.trail.uniforms.uSizeScale.value = c.sparkSize * g.particleSize * 5;
    this.trail.uniforms.uLifeScale.value = 0.5 * g.particleLifetime;
    this.trail.uniforms.uSpeedScale.value = g.particleSpeed;
    this.trail.uniforms.uOpacity.value = 0.6 * g.opacity;
    this.trail.uniforms.uGlow.value = c.glow * 0.5 * g.glow;
    this.trail.uniforms.uTurbulence.value = 0.4 * g.turbulence;
  }

  /**
   * One bundle's worth of uniforms.
   *
   * The echo differs in exactly three numbers — a delayed clock, a wider ribbon
   * and a lower opacity — so it is the same call with a lag rather than a second
   * implementation of the same shape.
   */
  _syncBundle(bundle, fade, lag) {
    const c = this.config;
    const g = settings.global;
    const isEcho = bundle === this.echo;

    bundle.setCount(this.strokeCount);
    bundle.setVisible(fade > 0.004);
    if (bundle.count <= 0) return;

    bundle.set('uOrigin', this.origin);
    bundle.set('uForward', this.direction);
    bundle.set('uSideAxis', this.side);

    // The whole schedule hangs off this one number.
    bundle.set('uAge', Math.max(0, this.age - lag));
    bundle.set('uProgress', 1);
    bundle.set('uFade', fade);

    bundle.set('uLength', this.length);
    bundle.set('uInterval', c.slashInterval);
    bundle.set('uLife', c.slashLife);
    bundle.set('uSpan', c.slashSpan);
    bundle.set('uRadius', c.slashRadius * (isEcho ? 1 + c.echoSpread * 0.12 : 1));
    bundle.set('uTilt', c.slashTilt);
    bundle.set('uSweep', c.slashSweep);
    bundle.set('uHeight', c.slashHeight);
    // The echo is rolled slightly off the blade so it reads as a smear rather
    // than as a second blade sitting exactly on the first.
    bundle.set('uPhase', isEcho ? c.echoSpread * 0.25 : 0);

    bundle.set('uWidthTip', c.slashTaper);
    bundle.set('uWidthCurve', c.slashCurve);
    bundle.set('uJitter', c.jitter * 0.1 * g.randomness);
    bundle.set('uJitterScale', c.jitterScale);
    bundle.set('uCrawl', c.crawl);

    const look = isEcho ? this._echoLook : this._look;
    look.core = getColor(c.colorCore);
    look.edge = getColor(c.colorOuter);
    look.halo = getColor(c.colorHalo);
    look.width = c.slashWidth * (isEcho ? 1 + c.echoSpread : 1);
    look.glow = c.glow * (isEcho ? 0.55 : 1) * g.glow;
    look.opacity = g.opacity;
    look.dim = 1 - c.slashLead * 0.5;
    look.haloWidth = c.glowWidth;
    look.haloOpacity = c.glowOpacity;
    look.coreSharp = c.coreSharp;
    look.glowFalloff = c.glowFalloff;
    look.flicker = c.flicker;
    look.flickerSpeed = c.flickerSpeed;
    bundle.syncLook(look);
  }

  _muzzleFx() {
    const c = this.config;
    const g = settings.global;

    this._handPoint(_pos);
    this.ctx.bursts.spawn(BurstMode.STORM, _pos, {
      radius: c.muzzleSize * 0.2,
      endRadius: c.muzzleSize * g.explosionIntensity,
      life: 0.22,
      intensity: c.muzzleIntensity,
      opacity: 0.8,
      fresnel: 1.8,
      displace: 0.3,
      colorA: getColor(c.colorBurstA),
      colorB: getColor(c.colorBurstB),
      colorC: getColor(c.colorBurstC)
    });

    this.ctx.flash.trigger(getColor(c.colorCastFlash), c.castFlash * g.explosionIntensity);
    this.lightBoost = c.lightIntensity * 0.4 * g.explosionIntensity;
  }

  /**
   * Fire every stroke whose start time has now passed.
   *
   * A loop rather than a single step because a long frame can cover more than
   * one beat at `slashInterval = 0.085`, and skipping the ones in between would
   * silently drop sparks off blades that are visibly being cut.
   */
  _pumpStrokes() {
    const total = this.strokeCount;
    while (this._nextStroke < total && this.age >= this._strokeStart(this._nextStroke)) {
      this._strokeFx(this._nextStroke);
      this._nextStroke++;
    }
  }

  /**
   * One cut: a burst on the blade's belly and a fan of sparks thrown along the
   * plane it is sweeping through.
   *
   * The spark fan is built in the stroke's own frame (`e1`, `e2` are the same
   * two basis vectors the shader rolls the crescent into), so sparks leave
   * *along the edge* instead of spraying isotropically off a point.
   */
  _strokeFx(s) {
    const c = this.config;
    const g = settings.global;

    this._strokeCentre(s, _pos);
    const radius = this._strokeRadius(s);
    const roll = this._strokeRoll(s);

    // The crescent's plane: side/up rolled about the cast line.
    this._strokePlane(roll);

    this.ctx.bursts.spawn(BurstMode.STORM, _pos, {
      radius: c.burstSize * 0.08,
      endRadius: c.burstSize * (0.5 + c.slashLead) * g.explosionIntensity,
      life: 0.28,
      intensity: c.burstIntensity,
      opacity: 0.55,
      fresnel: 2.0,
      displace: 0.5,
      colorA: getColor(c.colorBurstA),
      colorB: getColor(c.colorBurstB),
      colorC: getColor(c.colorBurstC)
    });

    // Sparks fanned out around the arc the blade is about to travel.
    const count = Math.round((c.burstSparks / this.strokeCount) * g.particleCount);
    if (count > 0) {
      const theta = randRange(-0.5, 0.5) * c.slashSpan + c.slashSweep * 0.5;
      _dir
        .copy(_e1)
        .multiplyScalar(Math.cos(theta))
        .addScaledVector(_e2, Math.sin(theta))
        .normalize();

      _emit.position = _pos;
      _emit.radius = radius * (0.6 + c.slashRadiusJitter);
      _emit.direction = _dir;
      _emit.speed = c.sparkSpeed;
      _emit.speedVariance = 0.9;
      _emit.spread = 0.55;
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.12;
      _emit.sizeVariance = 0.7;
      _emit.life = c.sparkLifetime;
      _emit.lifeVariance = 0.5;
      _emit.spin = 0;
      _emit.tint = null;
      _emit.time = frame.uTime.value;
      this.sparks.emit(count, _emit);
    }

    // A scorch under the cut, but only for the strokes low enough to reach the
    // floor — a blade cut at head height does not mark the ground.
    if (c.scorchRadius > 0 && _pos.y - radius < 0.6) {
      _dir.copy(_pos).setY(0);
      this.ctx.decals.spawn(DecalType.ARC, _dir, {
        radius: c.arcRadius * (0.8 + c.slashRadiusJitter),
        life: c.arcLife,
        intensity: c.arcIntensity,
        colorA: getColor(c.colorArc),
        colorB: getColor(c.colorEmber)
      });
    }

    this.ctx.shake.add(
      c.impactShake * 0.25 * g.explosionIntensity * g.cameraShake,
      1 / Math.max(0.1, c.shakeDuration),
      24
    );
    this.lightBoost = Math.max(this.lightBoost, c.lightIntensity * 0.35 * g.explosionIntensity);
  }

  /**
   * The haze hanging along the strokes that are currently lit.
   *
   * Emitted from a stroke chosen at random among the live ones rather than from
   * all of them: one origin per frame is what stops this reading as a hose, and
   * over `slashLife` every lit stroke gets its share.
   */
  _airFx(dt, scale) {
    const c = this.config;
    const g = settings.global;
    const total = this.strokeCount;

    // Which strokes are still inside their `slashLife` window.
    const first = Math.max(0, Math.ceil((this.age - c.slashLife) / Math.max(1e-3, c.slashInterval)));
    const last = Math.min(total - 1, this._nextStroke - 1);
    if (last < first) return;

    const sparkCount = Math.round(this.sparkEmitter.tick(dt, c.sparkRate * scale) * g.particleCount);
    const trailCount = Math.round(this.trailEmitter.tick(dt, c.trailRate * 40 * scale) * g.particleCount);
    if (sparkCount <= 0 && trailCount <= 0) return;

    const s = first + Math.floor(Math.random() * (last - first + 1));
    this._strokeCentre(s, _pos);
    const radius = this._strokeRadius(s);
    const roll = this._strokeRoll(s);
    const theta = randRange(-0.5, 0.5) * c.slashSpan;

    this._strokePlane(roll);

    // A point on the arc itself, not at its centre.
    _pos.addScaledVector(_e1, Math.cos(theta) * radius);
    _pos.addScaledVector(_e2, Math.sin(theta) * radius);
    _pos.y += randRange(-1, 1) * c.slashHeightJitter * 0.2;

    _emit.position = _pos;
    _emit.radius = 0.12;
    _emit.inherit = null;
    _emit.anchor = null;
    _emit.spin = 0;
    _emit.tint = null;
    _emit.time = frame.uTime.value;

    if (sparkCount > 0) {
      // Tangential: shed off the edge in the direction it is sweeping.
      _dir
        .copy(_e1)
        .multiplyScalar(-Math.sin(theta))
        .addScaledVector(_e2, Math.cos(theta))
        .normalize();
      _emit.direction = _dir;
      _emit.speed = c.sparkSpeed * 0.35;
      _emit.speedVariance = 0.8;
      _emit.spread = 0.7;
      _emit.size = 0.09;
      _emit.sizeVariance = 0.6;
      _emit.life = c.sparkLifetime * 0.7;
      _emit.lifeVariance = 0.5;
      this.sparks.emit(sparkCount, _emit);
    }

    if (trailCount > 0) {
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = 0.6;
      _emit.speedVariance = 0.9;
      _emit.spread = 1.0;
      _emit.size = 0.22;
      _emit.sizeVariance = 0.8;
      _emit.life = 0.55;
      _emit.lifeVariance = 0.5;
      this.trail.emit(trailCount, _emit);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Phases                                                              */
  /* ------------------------------------------------------------------ */

  onTravel(dt) {
    // The strokes are already being cut while the front runs downrange — this
    // is the one ability whose signature starts before its impact.
    this._sync(1);
    this._pumpStrokes();
    this._airFx(dt, 1);
  }

  onImpact() {
    const c = this.config;
    const g = settings.global;

    this.pointAt(1, _pos).setY(0);
    this.ctx.decals.spawn(DecalType.SHOCKWAVE, _pos, {
      radius: c.shockRadius * g.explosionIntensity,
      life: 0.45,
      width: 0.04,
      intensity: 0.9,
      colorA: getColor(c.colorShockA),
      colorB: getColor(c.colorShockB)
    });

    this.ctx.shake.add(
      c.impactShake * g.explosionIntensity * g.cameraShake,
      1 / Math.max(0.1, c.shakeDuration),
      26
    );
    this.ctx.flash.trigger(getColor(c.colorFlash), c.impactFlash * g.explosionIntensity);
    this.lightBoost = c.lightIntensity * 0.8 * g.explosionIntensity;
  }

  onFade(dt, t) {
    // Holds while the last strokes are still being cut, then goes at once: a
    // blade does not dim, it stops being there.
    const fade = t <= 1 ? 1 : 1 - Easing.inQuad(saturate(t - 1));

    this._pumpStrokes();
    this._sync(fade);
    this._airFx(dt, fade);

    // The light rides the newest stroke rather than the dead front.
    const live = Math.max(0, this._nextStroke - 1);
    this._strokeCentre(live, _pos);
    this.position.lerp(_pos, saturate(dt * 12));
  }

  onDestroy() {
    this.blades.setVisible(false);
    this.echo.setVisible(false);
  }

  dispose() {
    this.blades.dispose();
    this.echo.dispose();
    super.dispose();
  }
}

/** GLSL `fract`. */
function _fract(x) {
  return x - Math.floor(x);
}
