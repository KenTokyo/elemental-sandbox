import { Mesh, IcosahedronGeometry, Vector3 } from 'three';
import { Ability, AbilityPhase } from './Ability.js';
import { StrandBundle } from './support/StrandBundle.js';
import { ZoneField } from './support/ZoneField.js';
import { StrandMode } from '../materials/StrandMaterial.js';
import { createShellMaterial, ShellMode } from '../materials/ShellMaterial.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { RateEmitter } from '../particles/ParticleEngine.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER } from '../core/Layers.js';
import { frame } from '../core/FrameUniforms.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';
import { saturate, lerp, Easing, randRange } from '../utils/math.js';

/** Ribbons in the accretion disc. The editor's `discStrands` clamps here. */
const MAX_STRANDS = 36;
/** How many points one frame's infall is split between. */
const PULL_BATCHES = 5;

const TAU = Math.PI * 2;

const _emit = {};
const _pos = new Vector3();
const _dir = new Vector3();

/**
 * GRAVITY WELL — a hole opened over the footprint, and the one signature in the
 * library that *subtracts*.
 *
 * Everything else here adds light. This one takes it away: `ShellMaterial`'s
 * HORIZON body is drawn with normal blending and an alpha it drives itself, so
 * the body genuinely removes what is behind it and all you see of the thing is
 * the ring where light is bent around its edge. That is the whole reason the
 * shell material has a non-additive mode at all.
 *
 * Three things then run *inward*, which is the other half of the inversion:
 *
 *   - the accretion disc (`StrandMode.ORBIT`) spirals its ribbons down toward
 *     the inner lip and speeds up as the radius drops, so it reads as falling in
 *     rather than as a spinning plate
 *   - the infall is emitted on a shell at `pullRadius` and thrown *at* the
 *     horizon, with `pullSwirl` giving it the tangential component that turns a
 *     straight fall into a spiral
 *   - the ground disc's veins crawl inward (`fieldCrawl` is negative) and its
 *     middle goes black (`fieldFalloff` is high)
 *
 * The resolution is a collapse and one hard release rather than a fade: the
 * horizon implodes over `horizonCollapse` of the fade and everything it had
 * swallowed comes back out at once.
 */
export class WellAbility extends Ability {
  constructor(context, element = 'gravity') {
    super(element, context);
  }

  /* ------------------------------------------------------------------ */
  /* Construction                                                        */
  /* ------------------------------------------------------------------ */

  createShaders() {
    /* ---- the body in the middle ---- */
    this.horizonGeometry = new IcosahedronGeometry(1, 4);
    this.horizonMaterial = createShellMaterial(ShellMode.HORIZON);
    this.horizon = new Mesh(this.horizonGeometry, this.horizonMaterial);
    this.horizon.name = 'EventHorizon';
    this.horizon.frustumCulled = false;
    this.horizon.layers.set(LAYER.VFX);
    // Ahead of the additive ribbons: the disc has to be able to pass *behind*
    // the body and be occluded by it, which is what gives the hole its depth.
    this.horizon.renderOrder = 8;
    this.horizon.visible = false;
    this.group.add(this.horizon);

    /* ---- the accretion disc ---- */
    this.disc = new StrandBundle(this.group, StrandMode.ORBIT, {
      nodes: 40,
      capacity: MAX_STRANDS,
      renderOrder: 11
    });

    /* ---- the lit disc on the floor ---- */
    this.field = new ZoneField(this.group, this.element);

    this._seed = 0;
    this._openTime = 0;
    this._released = false;
    this._centre = new Vector3();
    this._look = {};
  }

  createParticles() {
    const particles = this.ctx.particles;

    // The infall — this ability's signature system, and the only one in the
    // project whose particles are thrown *at* something.
    this.pull = particles.get('well.pull', {
      capacity: 4000,
      shape: ParticleShape.SOFT,
      additive: true,
      curl: true,
      softFade: 0.4
    });
    this.pull.uniforms.uDrag.value = 0.55; // low: nothing slows down on the way in
    this.pull.uniforms.uEndSize.value = 0.05; // and it shrinks as it is swallowed
    this.pull.uniforms.uSizeIn.value = 0.04;
    this.pull.uniforms.uFadeIn.value = 0.06;
    this.pull.uniforms.uFadeOut.value = 0.55;

    this.sparks = particles.get('well.sparks', {
      capacity: 3000,
      shape: ParticleShape.STREAK,
      additive: true,
      stretch: true,
      softFade: 0.25
    });
    this.sparks.uniforms.uDrag.value = 1.4;
    this.sparks.uniforms.uEndSize.value = 0.22;
    this.sparks.uniforms.uSizeIn.value = 0.02;
    this.sparks.uniforms.uFadeIn.value = 0.03;
    this.sparks.uniforms.uFadeOut.value = 0.45;

    this.smoke = particles.get('well.smoke', {
      capacity: 1800,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 1.1
    });
    this.smoke.uniforms.uDrag.value = 1.8;
    this.smoke.uniforms.uEndSize.value = 2.6;
    this.smoke.uniforms.uSizeIn.value = 0.12;
    this.smoke.uniforms.uFadeIn.value = 0.16;
    this.smoke.uniforms.uFadeOut.value = 0.3;

    this.debris = particles.get('well.debris', {
      capacity: 1600,
      shape: ParticleShape.CHIP,
      additive: false,
      lit: true,
      softFade: 0.25
    });
    this.debris.uniforms.uDrag.value = 0.25;
    this.debris.uniforms.uEndSize.value = 0.6;
    this.debris.uniforms.uFadeOut.value = 0.7;

    this.pullEmitter = new RateEmitter();
    this.sparkEmitter = new RateEmitter();
    this.smokeEmitter = new RateEmitter();
    this.debrisEmitter = new RateEmitter();
  }

  /* ------------------------------------------------------------------ */
  /* Timing                                                              */
  /* ------------------------------------------------------------------ */

  get instanceCount() {
    return this.disc.count * 2 + 1;
  }

  get impactDuration() {
    return Math.max(0.2, this.config.lifetime * settings.global.lifetime);
  }

  get fadeDuration() {
    return Math.max(0.1, this.config.fadeTime);
  }

  get radius() {
    return Math.max(0.05, this.config.zoneRadius);
  }

  _centrePoint(out) {
    return this.pointAt(1, out).setY(0);
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

  /** How far the hole has opened, 0..1. A pure function of `_openTime`. */
  _openAmount() {
    return Easing.outCubic(saturate(this._openTime / Math.max(0.02, this.config.snapTime)));
  }

  /**
   * How far the horizon has imploded, 0..1.
   *
   * Only ever non-zero in the fade, and finished before the fade is: the hole
   * closes and *then* the release happens, so the two beats do not overlap.
   */
  _collapseAmount(t) {
    if (t <= 1) return 0;
    return saturate((t - 1) / Math.max(0.05, this.config.horizonCollapse));
  }

  /** Where the hole hangs, world space. */
  _horizonPoint(out) {
    return out.copy(this._centre).setY(this.config.horizonHeight);
  }

  /* ------------------------------------------------------------------ */
  /* Casting                                                             */
  /* ------------------------------------------------------------------ */

  onSpawn() {
    this.pullEmitter.reset();
    this.sparkEmitter.reset();
    this.smokeEmitter.reset();
    this.debrisEmitter.reset();

    this._openTime = 0;
    this._released = false;
    this._seed = Math.random() * 100;
    this.field.reseed();
    this.disc.set('uSeed', this._seed);
    this.horizonMaterial.uniforms.uSeed.value = this._seed;

    this.horizon.visible = false;
    this.field.setVisible(false);
    this.disc.setVisible(false);

    this._sync(1, 0);
    this._muzzleFx();
  }

  /* ------------------------------------------------------------------ */
  /* Feedback                                                            */
  /* ------------------------------------------------------------------ */

  _sync(fade, collapse) {
    const c = this.config;
    const g = settings.global;
    const travelling = this.phase === AbilityPhase.TRAVEL;

    this._centrePoint(this._centre);
    const open = travelling ? 0 : this._openAmount();

    if (travelling) {
      this.horizon.visible = false;
      this.disc.setVisible(false);
      this.field.setVisible(false);
    } else {
      this._syncHorizon(open, fade, collapse);
      this._syncDisc(open, fade, collapse);
      this.field.setVisible(fade > 0.004);
      this.field.update(this._centre, this.radius * Math.max(0.05, open), fade, c.fieldHeight ?? 0.03);
    }

    /* --- the four particle systems --- */
    this.pull.setGradient(
      getColor(c.colorPullA),
      getColor(c.colorPullB),
      getColor(c.colorPullC),
      getColor(c.colorPullD)
    );
    // Negative: the infall sinks toward the disc plane on the way in. This is
    // the one gravity in the project that is doing what its name says.
    this.pull.uniforms.uGravity.value.set(0, c.pullCollapse * 3.5, 0);
    this.pull.uniforms.uSizeScale.value = c.pullSize * g.particleSize * 7;
    this.pull.uniforms.uLifeScale.value = c.pullLifetime * 0.5 * g.particleLifetime;
    this.pull.uniforms.uSpeedScale.value = g.particleSpeed;
    this.pull.uniforms.uOpacity.value = g.opacity;
    this.pull.uniforms.uGlow.value = 1.3 * g.glow;
    this.pull.uniforms.uTurbulence.value = 0.3 * g.turbulence;

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
    this.sparks.uniforms.uGlow.value = c.glow * 0.6 * g.glow;
    this.sparks.uniforms.uStretch.value = c.sparkStretch;

    this.smoke.setGradient(
      getColor(c.colorSmokeA),
      getColor(c.colorSmokeB),
      getColor(c.colorSmokeC),
      getColor(c.colorSmokeD)
    );
    this.smoke.uniforms.uGravity.value.set(0, c.smokeRise, 0);
    this.smoke.uniforms.uSizeScale.value = c.smokeSize * g.particleSize;
    this.smoke.uniforms.uLifeScale.value = c.smokeLifetime * 0.5 * g.particleLifetime;
    this.smoke.uniforms.uSpeedScale.value = c.smokeSpeed * g.particleSpeed;
    this.smoke.uniforms.uOpacity.value = c.smokeOpacity * g.opacity;
    this.smoke.uniforms.uTurbulence.value = 0.35 * g.turbulence;

    this.debris.setGradient(
      getColor(c.colorDebrisA),
      getColor(c.colorDebrisB),
      getColor(c.colorDebrisC),
      getColor(c.colorDebrisD)
    );
    this.debris.uniforms.uGravity.value.set(0, c.debrisGravity, 0);
    this.debris.uniforms.uSizeScale.value = c.debrisSize * g.particleSize * 7;
    this.debris.uniforms.uLifeScale.value = g.particleLifetime;
    this.debris.uniforms.uSpeedScale.value = g.particleSpeed;
    this.debris.uniforms.uOpacity.value = g.opacity;
  }

  _syncHorizon(open, fade, collapse) {
    const c = this.config;
    const g = settings.global;

    // Opens fast, then implodes past nothing. The squash is applied to the
    // body's own Y so the hole can be a lens rather than a ball.
    const scale = Math.max(0.001, c.horizonRadius * Easing.outCubic(open) * (1 - Easing.inCubic(collapse)));
    this._horizonPoint(_pos);
    this.horizon.position.copy(_pos);
    this.horizon.scale.set(scale, scale * c.horizonSquash, scale);
    this.horizon.visible = fade > 0.004 && scale > 0.01;

    const u = this.horizonMaterial.uniforms;
    u.uProgress.value = open;
    u.uAge.value = this.age;
    u.uScale.value = c.horizonScale * g.noiseFrequency;
    u.uSpeed.value = c.horizonSpin * g.noiseSpeed;
    u.uSpin.value = c.horizonSpin * g.noiseSpeed;
    u.uWarp.value = c.horizonWarp;
    u.uTurbulence.value = 0.06 * g.turbulence;
    u.uRim.value = c.horizonRim;
    u.uRimGain.value = c.horizonRimGain * g.fresnel;
    u.uDissolve.value = 0; // a hole does not dissolve; it shrinks
    u.uOpacity.value = c.horizonOpacity * fade;
    u.uGlow.value = c.horizonGlow * g.glow;
    u.uColorA.value.copy(getColor(c.colorHorizonA));
    u.uColorB.value.copy(getColor(c.colorHorizonB));
    u.uColorC.value.copy(getColor(c.colorHorizonC));
  }

  _syncDisc(open, fade, collapse) {
    const c = this.config;
    const bundle = this.disc;

    bundle.setCount(Math.min(MAX_STRANDS, Math.round(c.discStrands)));
    bundle.setVisible(fade > 0.004);
    if (bundle.count <= 0) return;

    this._horizonPoint(_pos);
    bundle.set('uOrigin', this._centre);
    bundle.set('uForward', this.direction);
    bundle.set('uSideAxis', this.side);
    bundle.set('uAge', this.age);
    bundle.set('uProgress', open);
    bundle.set('uFade', fade * (1 - collapse));
    bundle.set('uHeight', c.horizonHeight);

    // The disc shrinks with the horizon on the way out, so the whole thing goes
    // down the hole rather than the hole vanishing out of a standing ring.
    const shrink = 1 - Easing.inCubic(collapse);
    bundle.set('uRadius', this.radius * shrink);
    bundle.set('uBase', c.discInner);
    bundle.set('uTop', c.discOuter);
    bundle.set('uTilt', c.discTilt);
    bundle.set('uSpeed', c.discSpin);
    bundle.set('uSpan', TAU * 0.7); // how much of a turn one ribbon covers
    bundle.set('uJitter', c.discWobble * settings.global.randomness);
    bundle.set('uJitterScale', 2.2);
    bundle.set('uCrawl', 1.6);
    bundle.set('uWidthTip', 1 / Math.max(0.1, c.discTaper));
    bundle.set('uWidthCurve', 1.4);

    const look = this._look;
    look.core = getColor(c.colorDiscCore);
    look.edge = getColor(c.colorDiscEdge);
    look.halo = getColor(c.colorDiscHalo);
    look.width = c.discWidth;
    look.glow = c.discGlow * settings.global.glow;
    look.opacity = settings.global.opacity;
    look.dim = c.discDim;
    bundle.syncLook(look);
  }

  _muzzleFx() {
    const c = this.config;
    const g = settings.global;

    this._handPoint(_pos);
    this.ctx.bursts.spawn(BurstMode.STORM, _pos, {
      radius: c.muzzleSize * 0.2,
      endRadius: c.muzzleSize * g.explosionIntensity,
      life: 0.3,
      intensity: c.muzzleIntensity,
      opacity: 0.85,
      fresnel: 1.6,
      displace: 0.4,
      colorA: getColor(c.colorBurstA),
      colorB: getColor(c.colorBurstB),
      colorC: getColor(c.colorBurstC)
    });

    this.ctx.flash.trigger(getColor(c.colorCastFlash), c.castFlash * g.explosionIntensity);
    this.lightBoost = c.lightIntensity * 0.5 * g.explosionIntensity;
  }

  /**
   * Everything the standing hole drags in.
   *
   * The infall is emitted on a shell at `pullRadius × zoneRadius` and aimed at
   * the horizon, with `pullSwirl` mixed in tangentially. Splitting one frame's
   * batch across several bearings is what stops it reading as a hose: a single
   * origin per frame makes the whole thing a stream.
   */
  _wellFx(dt, scale) {
    const c = this.config;
    const g = settings.global;
    const time = frame.uTime.value;
    const centre = this._centre;
    this._horizonPoint(_pos);
    const targetY = _pos.y;

    let pullCount = Math.round(this.pullEmitter.tick(dt, c.pullRate * scale) * g.particleCount);
    if (pullCount > 0) {
      _emit.radius = 0.25;
      _emit.speedVariance = 0.4;
      _emit.spread = 0.18; // tight: these are being pulled, not thrown
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.08;
      _emit.sizeVariance = 0.6;
      _emit.spin = 0;
      _emit.tint = null;
      _emit.time = time;

      const shell = this.radius * c.pullRadius;
      const per = Math.ceil(pullCount / Math.min(pullCount, PULL_BATCHES));

      while (pullCount > 0) {
        const a = Math.random() * TAU;
        const h = randRange(0.05, targetY * 2.2);
        const px = centre.x + Math.cos(a) * shell;
        const pz = centre.z + Math.sin(a) * shell;
        _pos.set(px, h, pz);
        _emit.position = _pos;

        // Inward, plus a tangential component so the fall is a spiral. The
        // ratio is `pullSwirl` against the straight-line speed, which is why
        // turning the swirl up widens the spiral rather than speeding it up.
        _dir
          .set(centre.x - px, targetY - h, centre.z - pz)
          .normalize()
          .addScaledVector(_tangent(a, _tangentScratch), c.pullSwirl / Math.max(1, c.pullSpeed))
          .normalize();
        _emit.direction = _dir;
        _emit.speed = c.pullSpeed;
        _emit.life = c.pullLifetime;
        _emit.lifeVariance = 0.3;
        this.pull.emit(Math.min(per, pullCount), _emit);
        pullCount -= per;
      }
    }

    /* --- sparks torn off the disc --- */
    const sparkCount = Math.round(this.sparkEmitter.tick(dt, c.sparkRate * scale) * g.particleCount);
    if (sparkCount > 0) {
      const a = Math.random() * TAU;
      const r = this.radius * randRange(c.discInner, c.discOuter);
      _pos.set(centre.x + Math.cos(a) * r, targetY + randRange(-0.4, 0.4), centre.z + Math.sin(a) * r);
      _emit.position = _pos;
      _emit.radius = 0.2;
      _emit.direction = _tangent(a, _dir);
      _emit.speed = c.sparkSpeed;
      _emit.speedVariance = 0.8;
      _emit.spread = 0.4;
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.14;
      _emit.sizeVariance = 0.7;
      _emit.life = c.sparkLifetime;
      _emit.lifeVariance = 0.55;
      _emit.spin = 0;
      _emit.tint = null;
      _emit.time = time;
      this.sparks.emit(sparkCount, _emit);
    }

    /* --- chips lifted off the floor and dragged in --- */
    const debrisCount = Math.round(
      this.debrisEmitter.tick(dt, c.debrisRate * scale) * g.particleCount
    );
    if (debrisCount > 0) {
      const a = Math.random() * TAU;
      const r = this.radius * randRange(0.5, 1.1);
      const px = centre.x + Math.cos(a) * r;
      const pz = centre.z + Math.sin(a) * r;
      _pos.set(px, 0.08, pz);
      _emit.position = _pos;
      _emit.radius = 0.3;
      _emit.direction = _dir.set(centre.x - px, targetY * 0.8, centre.z - pz).normalize();
      _emit.speed = c.debrisSpeed;
      _emit.speedVariance = 0.6;
      _emit.spread = 0.35;
      _emit.size = 0.1;
      _emit.sizeVariance = 0.7;
      _emit.life = c.debrisLifetime;
      _emit.lifeVariance = 0.4;
      _emit.spin = 8;
      _emit.time = time;
      this.debris.emit(debrisCount, _emit);
    }

    /* --- haze crawling in over the floor --- */
    const smokeCount = Math.round(this.smokeEmitter.tick(dt, c.smokeRate * scale) * g.particleCount);
    if (smokeCount > 0) {
      const a = Math.random() * TAU;
      const r = this.radius * randRange(0.8, 1.2);
      const px = centre.x + Math.cos(a) * r;
      const pz = centre.z + Math.sin(a) * r;
      _pos.set(px, 0.2, pz);
      _emit.position = _pos;
      _emit.radius = this.radius * 0.2;
      _emit.direction = _dir.set(centre.x - px, 0.25, centre.z - pz).normalize();
      _emit.speed = c.smokeSpeed;
      _emit.speedVariance = 0.6;
      _emit.spread = 0.4;
      _emit.size = 0.9;
      _emit.sizeVariance = 0.5;
      _emit.life = c.smokeLifetime;
      _emit.lifeVariance = 0.4;
      _emit.spin = 0.4;
      _emit.time = time;
      this.smoke.emit(smokeCount, _emit);
    }
  }

  /** The release: everything the hole swallowed comes back out at once. */
  _releaseFx() {
    const c = this.config;
    const g = settings.global;

    this._horizonPoint(_pos);

    this.ctx.bursts.spawn(BurstMode.STORM, _pos, {
      radius: c.burstSize * 0.12,
      endRadius: c.burstSize * g.explosionIntensity,
      life: 0.55,
      intensity: c.burstIntensity,
      opacity: 0.85,
      fresnel: 1.5,
      displace: 0.7,
      colorA: getColor(c.colorBurstA),
      colorB: getColor(c.colorBurstB),
      colorC: getColor(c.colorBurstC)
    });

    this._centrePoint(_dir);
    this.ctx.decals.spawn(DecalType.SHOCKWAVE, _dir, {
      radius: c.shockRadius * g.explosionIntensity,
      life: 0.55,
      width: 0.05,
      intensity: 1.0,
      colorA: getColor(c.colorShockA),
      colorB: getColor(c.colorShockB)
    });

    _emit.position = _pos;
    _emit.radius = 0.3;
    _emit.direction = _dir.set(0, 1, 0);
    _emit.speed = c.sparkSpeed * 3.2;
    _emit.speedVariance = 0.9;
    _emit.spread = 1.0;
    _emit.inherit = null;
    _emit.anchor = null;
    _emit.size = 0.2;
    _emit.sizeVariance = 0.8;
    _emit.life = c.sparkLifetime * 1.5;
    _emit.lifeVariance = 0.6;
    _emit.spin = 0;
    _emit.tint = null;
    _emit.time = frame.uTime.value;
    this.sparks.emit(Math.round(c.burstSparks * g.particleCount), _emit);

    this.ctx.shake.add(
      c.impactShake * 1.6 * g.explosionIntensity * g.cameraShake,
      1 / Math.max(0.1, c.shakeDuration),
      26
    );
    this.ctx.flash.trigger(getColor(c.colorFlash), c.impactFlash * 1.8 * g.explosionIntensity);
    this.lightBoost = c.lightIntensity * 2.0 * g.explosionIntensity;
  }

  /* ------------------------------------------------------------------ */
  /* Phases                                                              */
  /* ------------------------------------------------------------------ */

  onTravel(dt) {
    this._sync(1, 0);
    this.position.y = 0.3;
    this.ctx.shake.rumble(this.config.rumble * settings.global.cameraShake, dt);
  }

  onImpact() {
    const c = this.config;
    const g = settings.global;

    this._openTime = 0;
    this._centrePoint(_pos);

    this.ctx.decals.spawn(DecalType.SHOCKWAVE, _pos, {
      radius: c.shockRadius * 0.6 * g.explosionIntensity,
      life: 0.7,
      width: 0.05,
      intensity: 0.9,
      colorA: getColor(c.colorShockA),
      colorB: getColor(c.colorShockB)
    });

    this.ctx.decals.spawn(DecalType.SCORCH, _pos, {
      radius: c.scorchRadius,
      life: c.scorchLife,
      intensity: c.scorchIntensity,
      colorA: getColor(c.colorScorch),
      colorB: getColor(c.colorEmber),
      height: 0.012
    });

    // The air is pulled *in* as the hole opens, so the shell is a collapse, not
    // an explosion: it starts wide and ends at nothing.
    this._horizonPoint(_pos);
    this.ctx.bursts.spawn(BurstMode.STORM, _pos, {
      radius: c.burstSize * 0.9,
      endRadius: c.burstSize * 0.15,
      life: 0.5,
      intensity: c.burstIntensity * 0.7,
      opacity: 0.5,
      fresnel: 2.2,
      displace: 0.35,
      colorA: getColor(c.colorBurstA),
      colorB: getColor(c.colorBurstB),
      colorC: getColor(c.colorBurstC)
    });

    this.ctx.shake.add(
      c.impactShake * g.explosionIntensity * g.cameraShake,
      1 / Math.max(0.1, c.shakeDuration),
      20
    );
    this.ctx.flash.trigger(getColor(c.colorFlash), c.impactFlash * g.explosionIntensity);
    this.lightBoost = c.lightIntensity * 0.9 * g.explosionIntensity;
  }

  onFade(dt, t) {
    const c = this.config;
    this._openTime += dt;

    const collapse = this._collapseAmount(t);
    // The light does not dim with the hole — it goes out with the release.
    const fade = t <= 1 ? 1 : 1 - Easing.inQuad(saturate((t - 1 - c.horizonCollapse) / Math.max(0.05, 1 - c.horizonCollapse)));
    this._sync(fade, collapse);

    if (!this._released && collapse >= 1) {
      this._released = true;
      this._releaseFx();
    }

    this.position.copy(this._centre);
    this.position.y = lerp(0, c.horizonHeight, saturate(c.lightHeight) * 2);

    this._wellFx(dt, (t <= 1 ? 1 : 1 - collapse) * fade);
    this.ctx.shake.rumble(c.holdShake * fade * settings.global.cameraShake, dt);
  }

  onDestroy() {
    this.horizon.visible = false;
    this.disc.setVisible(false);
    this.field.setVisible(false);
  }

  dispose() {
    this.disc.dispose();
    this.field.dispose();
    this.horizonGeometry.dispose();
    this.horizonMaterial.dispose();
    super.dispose();
  }
}

/** Unit tangent at bearing `a` about +Y. */
function _tangent(a, out) {
  return out.set(-Math.sin(a), 0, Math.cos(a));
}

const _tangentScratch = new Vector3();
