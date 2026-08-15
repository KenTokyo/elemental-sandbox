import { AbilityPhase } from './Ability.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { frame } from '../core/FrameUniforms.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';
import { saturate, lerp, randRange } from '../utils/math.js';
import { SPARK_BATCHES, TAU, _emit, _pos, _dir, _radial, _target } from './beam-scratch.js';

/**
 * Prism Beam emission — everything it throws off, as a prototype mixin.
 *
 * The intake drawn in at the hand before it fires, the release when it does, the sparks the column sheds along its length, and what the far end does to the ground it is standing on.
 *
 * Mixed into the engine's prototype at the bottom of its file, so these are
 * ordinary methods: `this` is the ability, and each one is free to call the
 * geometry and simulation methods that stayed behind. Split out under the
 * 800-line rule in `AGENTS.md`; not a line of any body changed.
 */
export const beamFx = {
  _intakeFx(dt) {
    const c = this.config;
    const g = settings.global;
    const charge = this.charge;
    const time = frame.uTime.value;

    let count = Math.round(this.intakeEmitter.tick(dt, c.intakeRate * (0.35 + charge)) * g.particleCount);
    if (count <= 0) return;

    this._handPoint(_target);
    _emit.radius = 0.12;
    _emit.speedVariance = 0.35;
    _emit.spread = 0.12;
    _emit.inherit = null;
    _emit.anchor = null;
    _emit.size = 0.09;
    _emit.sizeVariance = 0.6;
    _emit.lifeVariance = 0.3;
    _emit.spin = 0;
    _emit.tint = null;
    _emit.time = time;

    // The shell tightens as the orb fills, so the intake visibly closes in.
    const shell = c.intakeRadius * lerp(1, 0.45, charge);
    const per = Math.max(1, Math.round(count / 6));

    while (count > 0) {
      const theta = Math.random() * TAU;
      const phi = Math.acos(randRange(-1, 1));
      const s = Math.sin(phi);
      _dir.set(s * Math.cos(theta), Math.cos(phi) * 0.7, s * Math.sin(theta)).normalize();

      _pos.copy(_target).addScaledVector(_dir, shell * randRange(0.7, 1.15));
      _emit.position = _pos;
      _emit.direction = _dir.multiplyScalar(-1);
      _emit.speed = c.intakeSpeed;
      _emit.life = (shell / Math.max(0.5, c.intakeSpeed)) * 1.5;
      this.motes.emit(Math.min(per, count), _emit);
      count -= per;
    }
  },

  _releaseFx() {
    const c = this.config;
    const g = settings.global;

    this._handPoint(_pos);

    // A pressure shell rather than a fireball — nothing burns here, the air is
    // simply shoved out of the way.
    this.ctx.bursts.spawn(BurstMode.AIR, _pos, {
      radius: c.muzzleSize * 0.2,
      endRadius: c.muzzleSize * g.explosionIntensity,
      life: 0.4,
      intensity: c.muzzleIntensity,
      opacity: 0.9,
      fresnel: 2.0,
      displace: 0.35,
      colorA: getColor(c.colorBurstA),
      colorB: getColor(c.colorBurstC)
    });

    // ... and the same shove across the floor at the caster's feet.
    this.ctx.decals.spawn(DecalType.SHOCKWAVE, this.origin, {
      radius: c.muzzleSize * 2.2 * g.explosionIntensity,
      life: 0.5,
      width: 0.06,
      intensity: 0.9,
      colorA: getColor(c.colorShockA),
      colorB: getColor(c.colorShockB)
    });

    _emit.position = _pos;
    _emit.radius = 0.22;
    _emit.direction = _dir.copy(this.direction);
    _emit.speed = c.sparkSpeed * 1.8;
    _emit.speedVariance = 0.8;
    _emit.spread = 0.7;
    _emit.inherit = null;
    _emit.anchor = null;
    _emit.size = 0.2;
    _emit.sizeVariance = 0.7;
    _emit.life = c.sparkLifetime;
    _emit.lifeVariance = 0.5;
    _emit.spin = 0;
    _emit.tint = null;
    _emit.time = frame.uTime.value;
    this.sparks.emit(Math.round(70 * g.particleCount), _emit);

    this.ctx.flash.trigger(getColor(c.colorCastFlash), c.castFlash * g.explosionIntensity);
    this.ctx.shake.add(
      c.impactShake * 0.45 * g.explosionIntensity * g.cameraShake,
      1 / Math.max(0.1, c.shakeDuration),
      30
    );
    this.lightBoost = c.lightIntensity * 0.7 * g.explosionIntensity;
  },

  _columnFx(dt, scale) {
    const c = this.config;
    const g = settings.global;
    const time = frame.uTime.value;
    // Only the drawn part of the column is allowed to throw anything.
    const reach = this.phase === AbilityPhase.TRAVEL ? Math.max(0.02, this.u) : 1;

    let sparkCount = Math.round(this.sparkEmitter.tick(dt, c.sparkRate * scale) * g.particleCount);
    if (sparkCount > 0) {
      _emit.speed = c.sparkSpeed;
      _emit.speedVariance = 0.8;
      _emit.spread = 0.35;
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.15;
      _emit.sizeVariance = 0.7;
      _emit.life = c.sparkLifetime;
      _emit.lifeVariance = 0.55;
      _emit.spin = 0;
      _emit.tint = null;
      _emit.time = time;

      const per = Math.ceil(sparkCount / Math.min(sparkCount, SPARK_BATCHES));
      while (sparkCount > 0) {
        const s = randRange(0.04, 1) * reach;
        const radius = this._beamRadius(s);
        this._radialAt(Math.random() * TAU, _radial);
        this._axisPoint(s, _pos).addScaledVector(_radial, radius * randRange(0.8, 1.25));

        _emit.position = _pos;
        _emit.radius = radius * 0.3;
        // Thrown off the surface, then dragged downrange by the flow. This is
        // the read that says "pressure", and it is the one thing the sparks
        // must not share with the bolt's, which fall.
        _emit.direction = _dir
          .copy(_radial)
          .addScaledVector(this.direction, c.sparkForward)
          .normalize();
        this.sparks.emit(Math.min(per, sparkCount), _emit);
        sparkCount -= per;
      }
    }

    const moteCount = Math.round(this.moteEmitter.tick(dt, c.moteRate * scale) * g.particleCount);
    if (moteCount > 0) {
      const s = Math.random() * reach;
      this._axisPoint(s, _pos);
      _emit.position = _pos;
      _emit.radius = this._beamRadius(s) * 2.2;
      _emit.direction = _dir.copy(this.direction).multiplyScalar(0.5).setY(0.7).normalize();
      _emit.speed = c.moteSpeed;
      _emit.speedVariance = 0.8;
      _emit.spread = 0.9;
      _emit.size = 0.09;
      _emit.sizeVariance = 0.6;
      _emit.life = c.moteLifetime;
      _emit.lifeVariance = 0.5;
      _emit.spin = 0;
      _emit.time = time;
      this.motes.emit(moteCount, _emit);
    }

    const smokeCount = Math.round(this.smokeEmitter.tick(dt, c.smokeRate * scale) * g.particleCount);
    if (smokeCount > 0) {
      // Steam comes off the *floor*, not the column, and is blown out sideways
      // from under it rather than lifted.
      const s = Math.random() * reach;
      this._floorPoint(s, _pos).setY(0.12);
      this._radialAt(randRange(0, TAU), _radial).setY(Math.abs(_radial.y) * 0.35);
      _emit.position = _pos;
      _emit.radius = c.scorchRadius * 1.6;
      _emit.direction = _dir.copy(_radial).normalize();
      _emit.speed = c.smokeSpeed;
      _emit.speedVariance = 0.7;
      _emit.spread = 0.55;
      _emit.size = 0.9;
      _emit.sizeVariance = 0.5;
      _emit.life = c.smokeLifetime;
      _emit.lifeVariance = 0.4;
      _emit.spin = 0.4;
      _emit.time = time;
      this.smoke.emit(smokeCount, _emit);
    }

    const debrisCount = Math.round(this.debrisEmitter.tick(dt, c.debrisRate * scale) * g.particleCount);
    if (debrisCount > 0) {
      this._floorPoint(Math.random() * reach, _pos).setY(0.06);
      _emit.position = _pos;
      _emit.radius = c.scorchRadius * 1.4;
      _emit.direction = _dir.copy(this.direction).multiplyScalar(0.35).setY(1).normalize();
      _emit.speed = c.debrisSpeed;
      _emit.speedVariance = 0.75;
      _emit.spread = 0.8;
      _emit.size = 0.1;
      _emit.sizeVariance = 0.7;
      _emit.life = c.debrisLifetime;
      _emit.lifeVariance = 0.5;
      _emit.spin = 9;
      _emit.time = time;
      this.debris.emit(debrisCount, _emit);
    }
  },

  _groundFx() {
    const c = this.config;
    const step = 1 / Math.max(0.05, c.scorchRate);

    while (this.front - this._burnDistance >= step) {
      this._burnDistance += step;
      const s = saturate(this._burnDistance / this.length);
      this._floorPoint(s, _pos);
      // Jittered off the axis so the line does not read as a row of stamps.
      const wander = this._beamRadius(s) * 0.5;
      _pos.x += this.side.x * randRange(-wander, wander);
      _pos.z += this.side.z * randRange(-wander, wander);

      this.ctx.decals.spawn(DecalType.SCORCH, _pos, {
        radius: c.scorchRadius * randRange(0.8, 1.3),
        life: c.scorchLife,
        intensity: c.scorchIntensity,
        colorA: getColor(c.colorScorch),
        colorB: getColor(c.colorEmber),
        height: 0.015
      });
    }
  },

  _burnFx(dt, scale) {
    const c = this.config;
    const g = settings.global;
    const time = frame.uTime.value;

    this._impactPoint(_pos);
    this.pointAt(1, _target);

    const splash = Math.round(this.splashEmitter.tick(dt, c.splashRate * scale) * g.particleCount);
    if (splash > 0) {
      _emit.position = _pos;
      _emit.radius = this._beamRadius(1) * 0.7;
      // Back up the line and upward: the wash coming off something being
      // drilled, not an explosion leaving it.
      _emit.direction = _dir.copy(this.direction).multiplyScalar(-0.65).setY(0.75).normalize();
      _emit.speed = c.sparkSpeed * 1.4;
      _emit.speedVariance = 0.9;
      _emit.spread = 0.95;
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.18;
      _emit.sizeVariance = 0.8;
      _emit.life = c.sparkLifetime * 1.2;
      _emit.lifeVariance = 0.6;
      _emit.spin = 0;
      _emit.tint = null;
      _emit.time = time;
      this.sparks.emit(splash, _emit);
    }

    if (this.pulseEmitter.tick(dt, c.pulseRate * scale) > 0) {
      this.ctx.bursts.spawn(BurstMode.AIR, _pos, {
        radius: c.pulseSize * 0.25,
        endRadius: c.pulseSize * g.explosionIntensity,
        life: 0.45,
        intensity: c.pulseIntensity,
        opacity: 0.8,
        fresnel: 2.2,
        displace: 0.3,
        squash: 0.85,
        colorA: getColor(c.colorBurstA),
        colorB: getColor(c.colorBurstC)
      });
      this.lightBoost = Math.max(this.lightBoost, c.lightIntensity * 0.2 * g.explosionIntensity);
    }

    if (this.dustEmitter.tick(dt, c.dustRate * scale) > 0) {
      this.ctx.decals.spawn(DecalType.DUSTRING, _target, {
        radius: c.dustRadius * randRange(0.75, 1.15),
        life: c.dustLife,
        intensity: 0.7,
        colorA: getColor(c.colorDustA),
        colorB: getColor(c.colorDustB),
        height: 0.02
      });
    }

    if (this.shockEmitter.tick(dt, c.shockRate * scale) > 0) {
      this.ctx.decals.spawn(DecalType.SHOCKWAVE, _target, {
        radius: c.shockRadius * 0.55 * g.explosionIntensity,
        life: 0.45,
        width: 0.04,
        intensity: 0.8,
        colorA: getColor(c.colorShockA),
        colorB: getColor(c.colorShockB)
      });
    }
  }
};
