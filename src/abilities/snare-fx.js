import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { frame } from '../core/FrameUniforms.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';
import { saturate, randRange } from '../utils/math.js';
import { SPARK_BATCHES, UPDRAFT_BATCHES, TAU, _emit, _pos, _dir } from './snare-scratch.js';

/**
 * Voltaic Snare emission — everything it throws off, as a prototype mixin.
 *
 * The muzzle burst at the hand, the arc that runs down the leash while it holds, and the caged field at the far end with its updraught.
 *
 * Mixed into the engine's prototype at the bottom of its file, so these are
 * ordinary methods: `this` is the ability, and each one is free to call the
 * geometry and simulation methods that stayed behind. Split out under the
 * 800-line rule in `AGENTS.md`; not a line of any body changed.
 */
export const snareFx = {
  _muzzleFx() {
    const c = this.config;
    const g = settings.global;

    this._handPoint(_pos);

    this.ctx.bursts.spawn(BurstMode.STORM, _pos, {
      radius: c.muzzleSize * 0.2,
      endRadius: c.muzzleSize * g.explosionIntensity,
      life: 0.3,
      intensity: c.muzzleIntensity,
      opacity: 0.9,
      fresnel: 1.5,
      displace: 0.5,
      colorA: getColor(c.colorBurstA),
      colorB: getColor(c.colorBurstB),
      colorC: getColor(c.colorBurstC)
    });

    _emit.position = _pos;
    _emit.radius = 0.16;
    _emit.direction = _dir.copy(this.direction);
    _emit.speed = c.sparkSpeed * 1.4;
    _emit.speedVariance = 0.8;
    _emit.spread = 0.8;
    _emit.inherit = null;
    _emit.anchor = null;
    _emit.size = 0.18;
    _emit.sizeVariance = 0.7;
    _emit.life = c.sparkLifetime;
    _emit.lifeVariance = 0.5;
    _emit.spin = 0;
    _emit.tint = null;
    _emit.time = frame.uTime.value;
    this.sparks.emit(Math.round(34 * g.particleCount), _emit);

    this.ctx.flash.trigger(getColor(c.colorCastFlash), c.castFlash * g.explosionIntensity);
    this.lightBoost = c.lightIntensity * 0.7 * g.explosionIntensity;
  },

  _leashFx(dt) {
    const c = this.config;
    const g = settings.global;
    const time = frame.uTime.value;

    const sparkCount = Math.round(this.sparkEmitter.tick(dt, c.sparkRate * 0.5) * g.particleCount);
    if (sparkCount > 0) {
      _emit.direction = _dir.copy(this.direction).multiplyScalar(0.4).setY(0.6).normalize();
      _emit.speed = c.sparkSpeed * 0.8;
      _emit.speedVariance = 0.85;
      _emit.spread = 1.0;
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.14;
      _emit.sizeVariance = 0.7;
      _emit.life = c.sparkLifetime * 0.8;
      _emit.lifeVariance = 0.55;
      _emit.spin = 0;
      _emit.tint = null;
      _emit.time = time;

      let remaining = sparkCount;
      const per = Math.ceil(sparkCount / Math.min(sparkCount, SPARK_BATCHES));
      while (remaining > 0) {
        this.pointAt(randRange(0.1, 1) * this.u, _pos).setY(c.leashCling + 0.05);
        _emit.position = _pos;
        _emit.radius = 0.22;
        this.sparks.emit(Math.min(per, remaining), _emit);
        remaining -= per;
      }
    }

    // Burns paid out per metre of travel, jittered off the line so they do not
    // read as a dotted trail.
    const step = 1 / Math.max(0.05, c.trailRate);
    while (this.front - this._burnDistance >= step) {
      this._burnDistance += step;
      const s = saturate(this._burnDistance / this.length);
      this.pointAt(s, _pos);
      _pos.x += this.side.x * randRange(-0.4, 0.4);
      _pos.z += this.side.z * randRange(-0.4, 0.4);

      this.ctx.decals.spawn(DecalType.ARC, _pos, {
        radius: c.arcRadius * randRange(0.5, 0.85),
        life: c.arcLife * 0.7,
        width: c.arcBranches,
        intensity: c.arcIntensity * 0.8,
        colorA: getColor(c.colorEmber),
        colorB: getColor(c.colorArc)
      });
    }
  },

  _fieldFx(dt, scale) {
    const c = this.config;
    const g = settings.global;
    const time = frame.uTime.value;
    const centre = this._state.centre;
    const radius = this._state.radius;
    const height = this._state.height;

    /* --- sparks, thrown off the column and off the rim --- */
    let sparkCount = Math.round(this.sparkEmitter.tick(dt, c.sparkRate * scale) * g.particleCount);
    if (sparkCount > 0) {
      _emit.speed = c.sparkSpeed;
      _emit.speedVariance = 0.85;
      _emit.spread = 1.0;
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.16;
      _emit.sizeVariance = 0.7;
      _emit.life = c.sparkLifetime;
      _emit.lifeVariance = 0.55;
      _emit.spin = 0;
      _emit.tint = null;
      _emit.time = time;

      const per = Math.ceil(sparkCount / Math.min(sparkCount, SPARK_BATCHES));
      while (sparkCount > 0) {
        // Two thirds up the pillar, one third off the boundary — the column is
        // the loud part, but a rim with no sparks reads as painted on.
        if (Math.random() < 0.66) {
          _pos.copy(centre).setY(randRange(0.1, 1) * height);
          _emit.radius = radius * c.columnSpread * 1.4 + 0.1;
          _emit.direction = _dir.set(0, 1, 0);
        } else {
          const a = Math.random() * TAU;
          _pos.set(centre.x + Math.cos(a) * radius, 0.08, centre.z + Math.sin(a) * radius);
          _emit.radius = 0.25;
          _emit.direction = _dir.set(Math.cos(a) * 0.4, 1, Math.sin(a) * 0.4).normalize();
        }
        _emit.position = _pos;
        this.sparks.emit(Math.min(per, sparkCount), _emit);
        sparkCount -= per;
      }
    }

    /* --- the updraft: picked up off the disc, hauled in and up --- */
    let updraftCount = Math.round(
      this.updraftEmitter.tick(dt, c.updraftRate * scale) * g.particleCount
    );
    if (updraftCount > 0) {
      _emit.speed = c.updraftSpeed;
      _emit.speedVariance = 0.5;
      _emit.spread = 0.25; // tight: these are being pulled, not thrown
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.09;
      _emit.sizeVariance = 0.6;
      _emit.life = c.updraftLifetime;
      _emit.lifeVariance = 0.45;
      _emit.spin = 0;
      _emit.tint = null;
      _emit.time = time;

      const per = Math.ceil(updraftCount / Math.min(updraftCount, UPDRAFT_BATCHES));
      while (updraftCount > 0) {
        const a = Math.random() * TAU;
        const r = radius * (1 - c.updraftInset) * Math.sqrt(Math.random());
        _pos.set(centre.x + Math.cos(a) * r, randRange(0.05, 0.5), centre.z + Math.sin(a) * r);
        _emit.position = _pos;
        _emit.radius = 0.2;
        // Inward and up — the swirl comes from the curl noise, not from a
        // tangential velocity, so it stays soft rather than reading as a fan.
        _emit.direction = _dir
          .set(centre.x - _pos.x, 0, centre.z - _pos.z)
          .normalize()
          .multiplyScalar(0.8)
          .setY(1)
          .normalize();
        this.updraft.emit(Math.min(per, updraftCount), _emit);
        updraftCount -= per;
      }
    }

    /* --- haze off the burnt floor --- */
    const smokeCount = Math.round(this.smokeEmitter.tick(dt, c.smokeRate * scale) * g.particleCount);
    if (smokeCount > 0) {
      const a = Math.random() * TAU;
      const r = radius * Math.sqrt(Math.random());
      _pos.set(centre.x + Math.cos(a) * r, 0.15, centre.z + Math.sin(a) * r);
      _emit.position = _pos;
      _emit.radius = radius * 0.25;
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = c.smokeSpeed;
      _emit.speedVariance = 0.7;
      _emit.spread = 0.9;
      _emit.size = 0.8;
      _emit.sizeVariance = 0.5;
      _emit.life = c.smokeLifetime;
      _emit.lifeVariance = 0.4;
      _emit.spin = 0.4;
      _emit.time = time;
      this.smoke.emit(smokeCount, _emit);
    }

    /* --- chips torn off the floor --- */
    const debrisCount = Math.round(
      this.debrisEmitter.tick(dt, c.debrisRate * scale) * g.particleCount
    );
    if (debrisCount > 0) {
      const a = Math.random() * TAU;
      const r = radius * Math.sqrt(Math.random());
      _pos.set(centre.x + Math.cos(a) * r, 0.06, centre.z + Math.sin(a) * r);
      _emit.position = _pos;
      _emit.radius = 0.3;
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = c.debrisSpeed;
      _emit.speedVariance = 0.75;
      _emit.spread = 0.7;
      _emit.size = 0.1;
      _emit.sizeVariance = 0.7;
      _emit.life = c.debrisLifetime;
      _emit.lifeVariance = 0.5;
      _emit.spin = 8;
      _emit.time = time;
      this.debris.emit(debrisCount, _emit);
    }

    /* --- burns walking around the boundary --- */
    const arcCount = this.arcEmitter.tick(dt, c.arcRate * scale);
    for (let i = 0; i < arcCount; i++) {
      const a = Math.random() * TAU;
      const r = radius * randRange(0.72, 1.02);
      _pos.set(centre.x + Math.cos(a) * r, 0, centre.z + Math.sin(a) * r);
      this.ctx.decals.spawn(DecalType.ARC, _pos, {
        radius: c.arcRadius * randRange(0.7, 1.25),
        life: c.arcLife,
        width: c.arcBranches,
        intensity: c.arcIntensity,
        colorA: getColor(c.colorEmber),
        colorB: getColor(c.colorArc)
      });
    }

    /* --- pressure shells shed off the foot of the pillar --- */
    // Kept low, small and faint on purpose. A shell this size released halfway
    // up the column hangs in the air as a faceted glass dome — it needs the
    // floor under it to read as pressure coming off the strike rather than as
    // a bubble parked in mid-air.
    const pulseCount = this.pulseEmitter.tick(dt, c.pulseRate * scale);
    for (let i = 0; i < pulseCount; i++) {
      _pos.copy(centre).setY(height * randRange(0.02, 0.14));
      this.ctx.bursts.spawn(BurstMode.STORM, _pos, {
        radius: c.pulseSize * 0.25,
        endRadius: c.pulseSize * g.explosionIntensity,
        life: 0.42,
        intensity: c.pulseIntensity,
        opacity: 0.3,
        fresnel: 2.2,
        displace: 0.5,
        squash: 0.45, // flattened: pressure spreading over the floor
        colorA: getColor(c.colorBurstA),
        colorB: getColor(c.colorBurstB),
        colorC: getColor(c.colorBurstC)
      });
    }

    /* --- dust rings pushed out across the floor --- */
    const ringCount = this.ringEmitter.tick(dt, c.ringRate * scale);
    for (let i = 0; i < ringCount; i++) {
      this.ctx.decals.spawn(DecalType.SHOCKWAVE, centre, {
        radius: radius * 1.05,
        life: 0.7,
        width: 0.06,
        intensity: 0.6,
        colorA: getColor(c.colorShockA),
        colorB: getColor(c.colorShockB)
      });
    }
  }
};
