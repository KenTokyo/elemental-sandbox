import { Vector3 } from 'three';
import { Ability, AbilityPhase } from './Ability.js';
import { StrandBundle } from './support/StrandBundle.js';
import { ZoneField } from './support/ZoneField.js';
import { StrandMode } from '../materials/StrandMaterial.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { RateEmitter } from '../particles/ParticleEngine.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { frame } from '../core/FrameUniforms.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';
import { saturate, Easing, randRange } from '../utils/math.js';

/** Shafts in flight at once. The editor's `shafts` clamps here. */
const MAX_SHAFTS = 48;
/** Landings serviced in one frame, however long the frame was. */
const MAX_LANDINGS_PER_FRAME = 6;

const TAU = Math.PI * 2;

const _emit = {};
const _pos = new Vector3();
const _dir = new Vector3();

/**
 * CELESTIAL RAIN — the longest and quietest cast in the library, and the only
 * one with no single impact.
 *
 * Everything else resolves: it lands, it detonates, it fades. This one is a
 * *rhythm*. Shafts fall into the footprint one after another for the whole of
 * `lifetime`, each landing with its own small burst and ring, and the ability
 * ends by thinning out rather than by stopping.
 *
 * The hard part is that the shafts live entirely in the vertex shader
 * (`StrandMode.SHAFT`) while the landings — bursts, rings, sparks, the light
 * bump — have to happen on the CPU, at the right place, at the right moment.
 * Rather than have the CPU drive the shafts (which would put a metre of falling
 * geometry in a JS array every frame) or have the shader spawn effects (which
 * it cannot), **both sides evaluate the same closed form**:
 *
 *     period = shafts × interval
 *     x      = (hold − s × interval) / period
 *     cycle  = floor(x)                       ← which drop this strand is on
 *     seedA  = s × 37 + cycle × 91
 *     rr     = sqrt(hash11(seedA + seed)) × radius × inset
 *     aa     = hash11(seedA + 5.3 + seed) × TAU
 *
 * `_landPoint` below is that, in JS, character for character against the SHAFT
 * branch of `StrandMaterial`. The two must be edited together or the bursts
 * come off the shafts — which is the single most likely way this file breaks.
 *
 * `sqrt` on the radius is not decoration: without it the landings crowd the
 * middle, because uniform sampling of a *radius* is not uniform sampling of a
 * *disc*.
 */
export class RainAbility extends Ability {
  constructor(context, element = 'rain') {
    super(element, context);
  }

  /* ------------------------------------------------------------------ */
  /* Construction                                                        */
  /* ------------------------------------------------------------------ */

  createShaders() {
    this.shafts = new StrandBundle(this.group, StrandMode.SHAFT, {
      nodes: 24, // a shaft is nearly straight; it does not need samples
      capacity: MAX_SHAFTS,
      renderOrder: 12
    });

    this.field = new ZoneField(this.group, this.element);

    this._seed = 0;
    this._holdTime = 0;
    this._centre = new Vector3();
    this._look = {};
    /** Last drop each strand was seen to land, by strand index. */
    this._lastCycle = new Int32Array(MAX_SHAFTS).fill(-1);
  }

  createParticles() {
    const particles = this.ctx.particles;

    this.sparks = particles.get('rain.sparks', {
      capacity: 4000,
      shape: ParticleShape.STREAK,
      additive: true,
      stretch: true,
      softFade: 0.25
    });
    this.sparks.uniforms.uDrag.value = 1.8;
    this.sparks.uniforms.uEndSize.value = 0.12;
    this.sparks.uniforms.uSizeIn.value = 0.02;
    this.sparks.uniforms.uFadeIn.value = 0.03;
    this.sparks.uniforms.uFadeOut.value = 0.4;

    // Motes lifting off the lit ground — the slow half of the effect, and what
    // keeps the footprint alive between landings.
    this.updraft = particles.get('rain.updraft', {
      capacity: 3000,
      shape: ParticleShape.SOFT,
      additive: true,
      curl: true,
      softFade: 0.6
    });
    this.updraft.uniforms.uDrag.value = 0.9;
    this.updraft.uniforms.uEndSize.value = 0.5;
    this.updraft.uniforms.uSizeIn.value = 0.08;
    this.updraft.uniforms.uFadeIn.value = 0.2;
    this.updraft.uniforms.uFadeOut.value = 0.5;

    this.sparkEmitter = new RateEmitter();
    this.updraftEmitter = new RateEmitter();
    this.ringEmitter = new RateEmitter();
  }

  /* ------------------------------------------------------------------ */
  /* Timing                                                              */
  /* ------------------------------------------------------------------ */

  get instanceCount() {
    return this.shafts.count * 2 + 1;
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

  /** Live shafts, clamped to what the bundle can draw. */
  get shaftCount() {
    return Math.max(1, Math.min(MAX_SHAFTS, Math.round(this.config.shafts)));
  }

  /** Seconds between two consecutive shafts leaving. */
  get shaftInterval() {
    return 1 / Math.max(0.05, this.config.shaftRate);
  }

  /** Seconds a shaft spends falling, from release to the floor. */
  get fallTime() {
    return this.config.shaftHeight / Math.max(0.1, this.config.shaftFall);
  }

  /** Daylight does not gutter. The light moves only on landings. */
  lightShimmer() {
    return 1;
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

  /** How far the footprint has opened, 0..1. */
  _openAmount() {
    return Easing.outCubic(saturate(this._holdTime / Math.max(0.02, this.config.snapTime)));
  }

  /* ------------------------------------------------------------------ */
  /* The shader's schedule, mirrored                                     */
  /* ------------------------------------------------------------------ */

  /**
   * `hash11` from `shaders/lib/noise.glsl.js`, verbatim.
   *
   * NOT `utils/math.js#hash11` — that is a different formula. Substituting it
   * puts every burst somewhere else in the circle than the shaft it belongs to,
   * and the effect still *looks* plausible, which is why this is called out.
   *
   * JS evaluates this in fp64 and the GPU in fp32, so the two answers differ by
   * roughly 4e-4 — a landing point off by well under a millimetre. Fine.
   */
  _hash11(p) {
    p = _fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return _fract(p);
  }

  /**
   * Where strand `s` lands on drop `cycle`, world space.
   *
   * The SHAFT branch of `StrandMaterial`, transcribed. Keep them together.
   */
  _landPoint(s, cycle, out) {
    const c = this.config;
    const seedA = s * 37 + cycle * 91;
    const rr = Math.sqrt(this._hash11(seedA + this._seed)) * this.radius * c.shaftInset;
    const aa = this._hash11(seedA + 5.3 + this._seed) * TAU;

    return out
      .copy(this._centre)
      .addScaledVector(this.side, Math.cos(aa) * rr)
      .addScaledVector(this.direction, Math.sin(aa) * rr);
  }

  /**
   * Service every shaft that has touched down since the last frame.
   *
   * A strand is stamped with the cycle it was last seen landing on, so a long
   * frame that skipped whole drops resolves as *one* landing rather than as a
   * backlog fired at once — dropping missed drops is right here, because the
   * shafts for them were never drawn either.
   */
  _pumpLandings(scale) {
    const total = this.shaftCount;
    const interval = this.shaftInterval;
    const period = Math.max(1e-3, total * interval);
    const land = this.fallTime;
    let serviced = 0;

    for (let s = 0; s < total; s++) {
      const x = (this._holdTime - s * interval) / period;
      if (x < 0) continue;

      const cycle = Math.floor(x);
      if (cycle <= this._lastCycle[s]) continue;
      // Released, but still in the air.
      if ((x - cycle) * period < land) continue;

      this._lastCycle[s] = cycle;
      if (serviced++ < MAX_LANDINGS_PER_FRAME) {
        this._landingFx(this._landPoint(s, cycle, _pos), scale);
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* Casting                                                             */
  /* ------------------------------------------------------------------ */

  onSpawn() {
    this.sparkEmitter.reset();
    this.updraftEmitter.reset();
    this.ringEmitter.reset();

    this._seed = Math.random() * 100;
    this._holdTime = 0;
    this._lastCycle.fill(-1);

    this.field.reseed();
    this.shafts.set('uSeed', this._seed);

    this.field.setVisible(false);
    this.shafts.setVisible(false);

    this._sync(1);
    this._muzzleFx();
  }

  /* ------------------------------------------------------------------ */
  /* Feedback                                                            */
  /* ------------------------------------------------------------------ */

  _sync(fade) {
    const c = this.config;
    const g = settings.global;
    const travelling = this.phase === AbilityPhase.TRAVEL;

    this._centrePoint(this._centre);
    const open = travelling ? 0 : this._openAmount();

    if (travelling) {
      this.shafts.setVisible(false);
      this.field.setVisible(false);
    } else {
      this._syncShafts(open, fade);
      this.field.setVisible(fade > 0.004);
      this.field.update(this._centre, this.radius * Math.max(0.05, open), fade, c.fieldHeight ?? 0.03);
    }

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

    this.updraft.setGradient(
      getColor(c.colorUpdraftA),
      getColor(c.colorUpdraftB),
      getColor(c.colorUpdraftC),
      getColor(c.colorUpdraftD)
    );
    this.updraft.uniforms.uGravity.value.set(0, c.updraftRise, 0);
    this.updraft.uniforms.uSizeScale.value = c.sparkSize * g.particleSize * 5;
    this.updraft.uniforms.uLifeScale.value = c.updraftLifetime * 0.5 * g.particleLifetime;
    this.updraft.uniforms.uSpeedScale.value = c.updraftSpeed * g.particleSpeed;
    this.updraft.uniforms.uOpacity.value = 0.75 * g.opacity;
    this.updraft.uniforms.uGlow.value = c.glow * 0.5 * g.glow;
    this.updraft.uniforms.uTurbulence.value = c.updraftTurbulence * g.turbulence;
  }

  _syncShafts(open, fade) {
    const c = this.config;
    const g = settings.global;
    const bundle = this.shafts;

    bundle.setCount(this.shaftCount);
    bundle.setVisible(fade > 0.004);
    if (bundle.count <= 0) return;

    bundle.set('uOrigin', this._centre);
    bundle.set('uForward', this.direction);
    bundle.set('uSideAxis', this.side);

    // The clock the CPU mirror reads. Everything about where a shaft is, and
    // where its burst goes, follows from this one number.
    bundle.set('uAge', this._holdTime);
    bundle.set('uProgress', open);
    bundle.set('uFade', fade);

    bundle.set('uCount', this.shaftCount);
    bundle.set('uInterval', this.shaftInterval);
    bundle.set('uRadius', this.radius);
    bundle.set('uInset', c.shaftInset);
    bundle.set('uHeight', c.shaftHeight);
    bundle.set('uSpeed', c.shaftFall);
    bundle.set('uLength', c.shaftLength);
    bundle.set('uLean', c.shaftTilt);

    bundle.set('uWidthTip', c.shaftTaper);
    bundle.set('uWidthCurve', 1.2);
    bundle.set('uJitter', c.jitter * 0.04 * g.randomness);
    bundle.set('uJitterScale', c.jitterScale);
    bundle.set('uCrawl', c.crawl);

    const look = this._look;
    look.core = getColor(c.colorShaftCore);
    look.edge = getColor(c.colorShaftEdge);
    look.halo = getColor(c.colorShaftHalo);
    look.width = c.shaftWidth;
    look.glow = c.shaftGlow * g.glow;
    look.opacity = g.opacity;
    look.dim = c.shaftDim;
    look.flicker = c.flicker * 0.4;
    look.flickerSpeed = c.flickerSpeed;
    bundle.syncLook(look);
  }

  _muzzleFx() {
    const c = this.config;
    const g = settings.global;

    this._handPoint(_pos);
    this.ctx.bursts.spawn(BurstMode.AIR, _pos, {
      radius: c.muzzleSize * 0.2,
      endRadius: c.muzzleSize * g.explosionIntensity,
      life: 0.3,
      intensity: c.muzzleIntensity,
      opacity: 0.7,
      fresnel: 2.0,
      displace: 0.25,
      colorA: getColor(c.colorBurstA),
      colorB: getColor(c.colorBurstB),
      colorC: getColor(c.colorBurstC)
    });

    this.ctx.flash.trigger(getColor(c.colorCastFlash), c.castFlash * g.explosionIntensity);
    this.lightBoost = c.lightIntensity * 0.25 * g.explosionIntensity;
  }

  /**
   * One shaft touching down.
   *
   * Deliberately small — this fires several times a second for five seconds, so
   * anything with weight here would turn a quiet ability into a barrage. The
   * shake and the flash are a twentieth of what an impact elsewhere spends.
   */
  _landingFx(point, scale) {
    const c = this.config;
    const g = settings.global;

    this.ctx.bursts.spawn(BurstMode.STORM, point, {
      radius: c.landingBurst * 0.15,
      endRadius: c.landingBurst * g.explosionIntensity,
      life: 0.3,
      intensity: 1.0,
      opacity: 0.6,
      fresnel: 1.8,
      displace: 0.3,
      colorA: getColor(c.colorBurstA),
      colorB: getColor(c.colorBurstB),
      colorC: getColor(c.colorBurstC)
    });

    this.ctx.decals.spawn(DecalType.RIPPLE, point, {
      radius: c.landingRing * g.explosionIntensity,
      life: c.landingRingLife,
      width: 0.08,
      intensity: 0.8,
      colorA: getColor(c.colorShockA),
      colorB: getColor(c.colorShockB)
    });

    const count = Math.round(c.landingSparks * scale * g.particleCount);
    if (count > 0) {
      _emit.position = point;
      _emit.radius = 0.12;
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = c.sparkSpeed;
      _emit.speedVariance = 0.7;
      _emit.spread = 1.1; // splashed out and up, not thrown
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.1;
      _emit.sizeVariance = 0.6;
      _emit.life = c.sparkLifetime;
      _emit.lifeVariance = 0.5;
      _emit.spin = 0;
      _emit.tint = null;
      _emit.time = frame.uTime.value;
      this.sparks.emit(count, _emit);
    }

    this.ctx.shake.add(
      c.landingShake * g.explosionIntensity * g.cameraShake,
      1 / Math.max(0.1, c.shakeDuration),
      22
    );
    this.ctx.flash.trigger(getColor(c.colorFlash), c.landingFlash * g.explosionIntensity);
    // Additive rather than assigned: several shafts landing on one frame should
    // read as brighter, and the base class decays whatever is left.
    this.lightBoost += c.landingLight * scale * g.explosionIntensity;
  }

  /** The slow half: motes off the lit floor, and the occasional wide ring. */
  _fieldFx(dt, scale) {
    const c = this.config;
    const g = settings.global;
    const centre = this._centre;

    const updraftCount = Math.round(
      this.updraftEmitter.tick(dt, c.updraftRate * scale) * g.particleCount
    );
    if (updraftCount > 0) {
      const a = Math.random() * TAU;
      // sqrt again: the same disc, sampled the same way as the landings.
      const r = Math.sqrt(Math.random()) * this.radius;
      _pos.set(centre.x + Math.cos(a) * r, 0.05, centre.z + Math.sin(a) * r);
      _emit.position = _pos;
      _emit.radius = this.radius * 0.12;
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = c.updraftSpeed;
      _emit.speedVariance = 0.7;
      _emit.spread = 0.35;
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.14;
      _emit.sizeVariance = 0.8;
      _emit.life = c.updraftLifetime;
      _emit.lifeVariance = 0.5;
      _emit.spin = 0;
      _emit.tint = null;
      _emit.time = frame.uTime.value;
      this.updraft.emit(updraftCount, _emit);
    }

    const ringCount = Math.round(this.ringEmitter.tick(dt, c.ringRate * scale));
    for (let i = 0; i < ringCount; i++) {
      this.ctx.decals.spawn(DecalType.RIPPLE, centre, {
        radius: this.radius * 1.05 * g.explosionIntensity,
        life: 1.2,
        width: 0.04,
        intensity: 0.5,
        colorA: getColor(c.colorField),
        colorB: getColor(c.colorFieldEdge)
      });
    }

    const sparkCount = Math.round(this.sparkEmitter.tick(dt, c.sparkRate * scale) * g.particleCount);
    if (sparkCount > 0) {
      const a = Math.random() * TAU;
      const r = Math.sqrt(Math.random()) * this.radius;
      _pos.set(centre.x + Math.cos(a) * r, randRange(0.1, 1.2), centre.z + Math.sin(a) * r);
      _emit.position = _pos;
      _emit.radius = 0.2;
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = c.sparkSpeed * 0.3;
      _emit.speedVariance = 0.9;
      _emit.spread = 1.0;
      _emit.size = 0.07;
      _emit.sizeVariance = 0.7;
      _emit.life = c.sparkLifetime * 0.8;
      _emit.lifeVariance = 0.6;
      _emit.time = frame.uTime.value;
      this.sparks.emit(sparkCount, _emit);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Phases                                                              */
  /* ------------------------------------------------------------------ */

  onTravel(dt) {
    this._sync(1);
    this.position.y = 0.4;
    this.ctx.shake.rumble(this.config.rumble * settings.global.cameraShake, dt);
  }

  onImpact() {
    const c = this.config;
    const g = settings.global;

    this._holdTime = 0;
    this._lastCycle.fill(-1);
    this._centrePoint(_pos);

    this.ctx.decals.spawn(DecalType.SHOCKWAVE, _pos, {
      radius: c.shockRadius * g.explosionIntensity,
      life: 0.8,
      width: 0.04,
      intensity: 0.8,
      colorA: getColor(c.colorShockA),
      colorB: getColor(c.colorShockB)
    });

    this.ctx.shake.add(
      c.impactShake * g.explosionIntensity * g.cameraShake,
      1 / Math.max(0.1, c.shakeDuration),
      18
    );
    this.ctx.flash.trigger(getColor(c.colorFlash), c.impactFlash * g.explosionIntensity);
    this.lightBoost = c.lightIntensity * 0.5 * g.explosionIntensity;
  }

  onFade(dt, t) {
    const c = this.config;
    this._holdTime += dt;

    // Thins out rather than dimming: the shafts keep their brightness and simply
    // stop arriving, which is what makes the ending read as weather passing.
    const fade = t <= 1 ? 1 : 1 - Easing.inQuad(saturate(t - 1));
    this._sync(fade);

    // No new drops once the fade has started — the ones in the air still land.
    if (t <= 1) this._pumpLandings(fade);

    this._fieldFx(dt, fade);

    this.position.copy(this._centre);
    this.position.y = c.lightHeight * c.shaftHeight;
    this.ctx.shake.rumble(c.holdShake * fade * settings.global.cameraShake, dt);
  }

  onDestroy() {
    this.shafts.setVisible(false);
    this.field.setVisible(false);
  }

  dispose() {
    this.shafts.dispose();
    this.field.dispose();
    super.dispose();
  }
}

/** GLSL `fract`. */
function _fract(x) {
  return x - Math.floor(x);
}
