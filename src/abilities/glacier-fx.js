import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { frame } from '../core/FrameUniforms.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';
import { saturate, randRange } from '../utils/math.js';
import { TAU, Role, _emit, _pos, _dir } from './glacier-scratch.js';

/**
 * Glacial Spikes emission — everything it throws off, as a prototype mixin.
 *
 * The muzzle burst at the hand, the frost the front pushes ahead of itself, the breach as each spike comes through the ground, the crumble as it goes back down, and the standing field between them.
 *
 * Mixed into the engine's prototype at the bottom of its file, so these are
 * ordinary methods: `this` is the ability, and each one is free to call the
 * geometry and simulation methods that stayed behind. Split out under the
 * 800-line rule in `AGENTS.md`; not a line of any body changed.
 */
export const glacierFx = {
  _muzzleFx() {
    const c = this.config;
    const g = settings.global;

    this._handPoint(_pos);

    this.ctx.bursts.spawn(BurstMode.FROST, _pos, {
      radius: c.muzzleSize * 0.25,
      endRadius: c.muzzleSize * g.explosionIntensity,
      life: 0.45,
      intensity: c.muzzleIntensity,
      opacity: 0.75,
      fresnel: 1.4,
      displace: 0.5,
      colorA: getColor(c.colorBurstA),
      colorB: getColor(c.colorBurstB),
      colorC: getColor(c.colorBurstC)
    });

    _emit.position = _pos;
    _emit.radius = 0.18;
    _emit.direction = _dir.copy(this.direction).multiplyScalar(0.6).setY(0.4).normalize();
    _emit.speed = c.shardSpeed * 0.9;
    _emit.speedVariance = 0.8;
    _emit.spread = 0.85;
    _emit.inherit = null;
    _emit.anchor = null;
    _emit.size = 0.12;
    _emit.sizeVariance = 0.7;
    _emit.life = c.shardLifetime * 0.8;
    _emit.lifeVariance = 0.5;
    _emit.spin = 7;
    _emit.tint = null;
    _emit.time = frame.uTime.value;
    this.shards.emit(Math.round(20 * g.particleCount), _emit);

    _emit.speed = c.glitterSpeed * 0.8;
    _emit.spread = 0.9;
    _emit.size = 0.09;
    _emit.life = c.glitterLifetime * 0.7;
    _emit.spin = 0;
    this.glitter.emit(Math.round(30 * g.particleCount), _emit);

    this.ctx.flash.trigger(getColor(c.colorCastFlash), c.castFlash * g.explosionIntensity);
    this.lightBoost = c.lightIntensity * 0.5 * g.explosionIntensity;
  },

  _frontFx(dt) {
    const c = this.config;
    const g = settings.global;
    const time = frame.uTime.value;

    /* --- fog boiling off the freezing floor --- */
    const mistCount = Math.round(this.mistEmitter.tick(dt, c.mistRate * 0.5) * g.particleCount);
    if (mistCount > 0) {
      _emit.position = _pos.copy(this.position).setY(0.12);
      _emit.radius = 0.5;
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = c.mistSpeed;
      _emit.speedVariance = 0.7;
      _emit.spread = 1.0;
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.7;
      _emit.sizeVariance = 0.5;
      _emit.life = c.mistLifetime * 0.8;
      _emit.lifeVariance = 0.4;
      _emit.spin = 0.5;
      _emit.tint = null;
      _emit.time = time;
      this.mist.emit(mistCount, _emit);
    }

    /* --- glitter thrown up off the fracture --- */
    const glitterCount = Math.round(
      this.glitterEmitter.tick(dt, c.glitterRate * 0.4) * g.particleCount
    );
    if (glitterCount > 0) {
      _emit.position = _pos.copy(this.position).setY(0.3);
      _emit.radius = 0.4;
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = c.glitterSpeed;
      _emit.speedVariance = 0.8;
      _emit.spread = 0.85;
      _emit.size = 0.08;
      _emit.sizeVariance = 0.6;
      _emit.life = c.glitterLifetime * 0.8;
      _emit.lifeVariance = 0.5;
      _emit.spin = 0;
      _emit.time = time;
      this.glitter.emit(glitterCount, _emit);
    }

    /* --- rime laid on the floor as the front passes over it --- */
    const frostStep = 1 / Math.max(0.05, c.trailFrostRate);
    while (this.front - this._frostDistance >= frostStep) {
      this._frostDistance += frostStep;
      const s = saturate(this._frostDistance / this.length);
      this.pointAt(s, _pos);
      _pos.x += this.side.x * randRange(-0.9, 0.9);
      _pos.z += this.side.z * randRange(-0.9, 0.9);

      this.ctx.decals.spawn(DecalType.FROST, _pos, {
        radius: c.trailFrostRadius * randRange(0.55, 1.1),
        life: c.frostLife * 0.8,
        width: c.frostCrystals,
        intensity: c.frostIntensity,
        colorA: getColor(c.colorFrost),
        colorB: getColor(c.colorFrostEdge)
      });
    }
  },

  _breachFx(record, c, g, radius) {
    const time = frame.uTime.value;

    this._spikePosition(record, c, _pos).setY(0.08);

    _emit.position = _pos;
    _emit.radius = radius * 0.9;
    // Chips are thrown outward, away from the middle of the crown — the same
    // direction the shard itself leans.
    _emit.direction = _dir
      .set(Math.cos(record.angle) * 0.55, 1, Math.sin(record.angle) * 0.55)
      .normalize();
    _emit.speed = c.shardSpeed;
    _emit.speedVariance = 0.7;
    _emit.spread = 0.7;
    _emit.inherit = null;
    _emit.anchor = null;
    _emit.size = 0.1;
    _emit.sizeVariance = 0.7;
    _emit.life = c.shardLifetime;
    _emit.lifeVariance = 0.45;
    _emit.spin = 7;
    _emit.tint = null;
    _emit.time = time;
    this.shards.emit(Math.round(c.breachShards * g.particleCount), _emit);

    // Only some shards puff: a few hundred steaming at once buries the crown in
    // haze and hides the silhouette that is the whole point.
    if (Math.random() < 0.35) {
      _emit.speed = c.mistSpeed * 0.8;
      _emit.spread = 1.0;
      _emit.size = 0.55;
      _emit.sizeVariance = 0.5;
      _emit.life = c.mistLifetime * 0.7;
      _emit.spin = 0.5;
      this.mist.emit(Math.round(2 * g.particleCount), _emit);
    }

    // A collar of rime around the foot of a ring blade, so the wall is seated on
    // the ground rather than stuck through it.
    if (record.role === Role.RING && Math.random() < 0.5) {
      this._spikePosition(record, c, _pos);
      this.ctx.decals.spawn(DecalType.FROST, _pos, {
        radius: radius * c.frostCollar * randRange(0.7, 1.3),
        life: c.frostLife,
        width: c.frostCrystals,
        intensity: c.frostIntensity * 0.9,
        colorA: getColor(c.colorFrost),
        colorB: getColor(c.colorFrostEdge)
      });
    }
  },

  _crumbleFx(record, c, g, radius, height) {
    const time = frame.uTime.value;

    this._spikePosition(record, c, _pos).setY(height * 0.45);

    _emit.position = _pos;
    _emit.radius = radius * 1.1;
    _emit.direction = _dir
      .set(Math.cos(record.angle) * 0.7, 0.7, Math.sin(record.angle) * 0.7)
      .normalize();
    _emit.speed = c.shardSpeed * 0.75;
    _emit.speedVariance = 0.85;
    _emit.spread = 0.9;
    _emit.inherit = null;
    _emit.anchor = null;
    _emit.size = 0.13;
    _emit.sizeVariance = 0.8;
    _emit.life = c.shardLifetime * 1.2;
    _emit.lifeVariance = 0.5;
    _emit.spin = 9;
    _emit.tint = null;
    _emit.time = time;
    this.shards.emit(Math.round(c.shatterShards * g.particleCount), _emit);

    if (Math.random() < 0.5) {
      _emit.speed = c.glitterSpeed * 0.6;
      _emit.spread = 1.0;
      _emit.size = 0.07;
      _emit.life = c.glitterLifetime;
      _emit.spin = 0;
      this.glitter.emit(Math.round(6 * g.particleCount), _emit);
    }
  },

  _fieldFx(dt, scale) {
    const c = this.config;
    const g = settings.global;
    const time = frame.uTime.value;
    const centre = this._state.centre;
    const radius = this.radius;
    const open = this._openAmount();

    /* --- cold air pouring off the rim and out across the floor --- */
    const mistCount = Math.round(this.mistEmitter.tick(dt, c.mistRate * scale) * g.particleCount);
    if (mistCount > 0) {
      const a = Math.random() * TAU;
      const r = radius * randRange(0.75, 1.05);
      _pos.set(centre.x + Math.cos(a) * r, randRange(0.05, 0.5), centre.z + Math.sin(a) * r);
      _emit.position = _pos;
      _emit.radius = radius * 0.18;
      // Outward and barely up: this is heavy air falling off a wall of ice, not
      // smoke rising off a fire.
      _emit.direction = _dir.set(Math.cos(a), 0.18, Math.sin(a)).normalize();
      _emit.speed = c.mistSpeed;
      _emit.speedVariance = 0.7;
      _emit.spread = 0.6;
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.85;
      _emit.sizeVariance = 0.5;
      _emit.life = c.mistLifetime;
      _emit.lifeVariance = 0.4;
      _emit.spin = 0.4;
      _emit.tint = null;
      _emit.time = time;
      this.mist.emit(mistCount, _emit);
    }

    /* --- glitter lifting off the sheet --- */
    const glitterCount = Math.round(
      this.glitterEmitter.tick(dt, c.glitterRate * scale) * g.particleCount
    );
    if (glitterCount > 0) {
      const a = Math.random() * TAU;
      const r = radius * Math.sqrt(Math.random());
      _pos.set(centre.x + Math.cos(a) * r, randRange(0.05, 0.6), centre.z + Math.sin(a) * r);
      _emit.position = _pos;
      _emit.radius = radius * 0.15;
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = c.glitterSpeed;
      _emit.speedVariance = 0.8;
      _emit.spread = 0.8;
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.08;
      _emit.sizeVariance = 0.6;
      _emit.life = c.glitterLifetime;
      _emit.lifeVariance = 0.5;
      _emit.spin = 0;
      _emit.tint = null;
      _emit.time = time;
      this.glitter.emit(glitterCount, _emit);
    }

    /* --- and ice dust falling back through it --- */
    const snowCount = Math.round(this.snowEmitter.tick(dt, c.snowRate * scale) * g.particleCount);
    if (snowCount > 0) {
      const a = Math.random() * TAU;
      const r = radius * c.snowInset * Math.sqrt(Math.random());
      _pos.set(
        centre.x + Math.cos(a) * r,
        c.ringHeight * c.snowHeight * open,
        centre.z + Math.sin(a) * r
      );
      _emit.position = _pos;
      _emit.radius = radius * 0.25;
      _emit.direction = _dir.set(0, -1, 0);
      _emit.speed = c.snowSpeed;
      _emit.speedVariance = 0.6;
      _emit.spread = 0.5;
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.07;
      _emit.sizeVariance = 0.7;
      _emit.life = c.snowLifetime;
      _emit.lifeVariance = 0.45;
      _emit.spin = 0;
      _emit.tint = null;
      _emit.time = time;
      this.snow.emit(snowCount, _emit);
    }

    /* --- rime creeping around the boundary --- */
    const rimeCount = this.rimeEmitter.tick(dt, c.rimeRate * scale);
    for (let i = 0; i < rimeCount; i++) {
      const a = Math.random() * TAU;
      const r = radius * randRange(0.7, 1.05);
      _pos.set(centre.x + Math.cos(a) * r, 0, centre.z + Math.sin(a) * r);
      this.ctx.decals.spawn(DecalType.FROST, _pos, {
        radius: c.rimeRadius * randRange(0.7, 1.3),
        life: c.frostLife,
        width: c.frostCrystals,
        intensity: c.frostIntensity,
        colorA: getColor(c.colorFrost),
        colorB: getColor(c.colorFrostEdge)
      });
    }

    /* --- vapour shells shed off the wall --- */
    // Kept low and squashed on purpose: a shell released halfway up the blades
    // hangs in the air as a glass dome, and it needs the floor under it to read
    // as cold coming off the ice rather than as a bubble parked in mid-air.
    const vapourCount = this.vapourEmitter.tick(dt, c.vapourRate * scale);
    for (let i = 0; i < vapourCount; i++) {
      const a = Math.random() * TAU;
      _pos.set(
        centre.x + Math.cos(a) * radius * randRange(0.5, 0.95),
        c.ringHeight * randRange(0.05, 0.3) * open,
        centre.z + Math.sin(a) * radius * randRange(0.5, 0.95)
      );
      this.ctx.bursts.spawn(BurstMode.FROST, _pos, {
        radius: c.vapourSize * 0.3,
        endRadius: c.vapourSize * g.explosionIntensity,
        life: 0.75,
        intensity: c.vapourIntensity,
        opacity: 0.28,
        fresnel: 1.8,
        displace: 0.55,
        squash: 0.5,
        colorA: getColor(c.colorBurstA),
        colorB: getColor(c.colorBurstB),
        colorC: getColor(c.colorBurstC)
      });
    }

    /* --- pressure rings pushed out across the floor --- */
    const ringCount = this.ringEmitter.tick(dt, c.ringRate * scale);
    for (let i = 0; i < ringCount; i++) {
      this.ctx.decals.spawn(DecalType.SHOCKWAVE, centre, {
        radius: radius * 1.08,
        life: 0.8,
        width: 0.05,
        intensity: 0.55,
        colorA: getColor(c.colorShockA),
        colorB: getColor(c.colorShockB)
      });
    }
  }
};
