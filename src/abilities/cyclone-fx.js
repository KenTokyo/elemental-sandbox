import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';

import { frame } from '../core/FrameUniforms.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';
import { randRange } from '../utils/math.js';
import { TAU, _emit, _pos, _dir } from './cyclone-scratch.js';

/**
 * Shard Cyclone emission — everything it throws off, as a prototype mixin.
 *
 * The muzzle burst at the hand and the standing field at the target: the debris, the glitter and the updraught the column keeps feeding while it turns.
 *
 * Mixed into the engine's prototype at the bottom of its file, so these are
 * ordinary methods: `this` is the ability, and each one is free to call the
 * geometry and simulation methods that stayed behind. Split out under the
 * 800-line rule in `AGENTS.md`; not a line of any body changed.
 */
export const cycloneFx = {
  _muzzleFx() {
    const c = this.config;
    const g = settings.global;
    if (c.muzzleSize <= 0) return;

    this._handPoint(_pos);
    this.ctx.bursts.spawn(this.isCrystal ? BurstMode.FROST : BurstMode.EARTH, _pos, {
      radius: c.muzzleSize * 0.25,
      endRadius: c.muzzleSize * g.explosionIntensity,
      life: 0.4,
      intensity: c.muzzleIntensity,
      opacity: 0.8,
      fresnel: 1.5,
      displace: 0.5,
      colorA: getColor(c.colorBurstA),
      colorB: getColor(c.colorBurstB),
      colorC: getColor(c.colorBurstC)
    });

    this.ctx.flash.trigger(getColor(c.colorCastFlash), c.castFlash * g.explosionIntensity);
    this.lightBoost = c.lightIntensity * 0.4 * g.explosionIntensity;
  },

  _fieldFx(dt, scale) {
    const c = this.config;
    const g = settings.global;
    const time = frame.uTime.value;
    const centre = this._centre;
    const height = Math.max(0.05, c.funnelHeight) * this._openAmount();

    /* --- haze, picked up off the wall of the cone --- */
    const dustCount = Math.round(this.dustEmitter.tick(dt, c.dustRate * scale) * g.particleCount);
    if (dustCount > 0) {
      const h = Math.random();
      const a = Math.random() * TAU;
      const r = this._coneRadius(h, c) * randRange(0.55, 1.05);
      _pos.set(centre.x + Math.cos(a) * r, h * height, centre.z + Math.sin(a) * r);
      _emit.position = _pos;
      _emit.radius = r * 0.3;
      // Tangential: the haze is being *carried around*, which is what makes the
      // column read as turning even where no shard happens to be.
      _emit.direction = _dir.set(-Math.sin(a), 0.35, Math.cos(a)).normalize();
      _emit.speed = c.dustSpeed;
      _emit.speedVariance = 0.7;
      _emit.spread = 0.7;
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.9;
      _emit.sizeVariance = 0.5;
      _emit.life = c.dustLifetime;
      _emit.lifeVariance = 0.4;
      _emit.spin = 0.4;
      _emit.tint = null;
      _emit.time = time;
      this.dust.emit(dustCount, _emit);
    }

    /* --- glints riding the wind up the cone --- */
    const moteCount = Math.round(this.moteEmitter.tick(dt, c.moteRate * scale) * g.particleCount);
    if (moteCount > 0) {
      const h = Math.random() * 0.6;
      const a = Math.random() * TAU;
      const r = this._coneRadius(h, c) * randRange(0.4, 1.0);
      _pos.set(centre.x + Math.cos(a) * r, h * height + 0.15, centre.z + Math.sin(a) * r);
      _emit.position = _pos;
      _emit.radius = 0.25;
      _emit.direction = _dir.set(-Math.sin(a) * 0.8, 1, Math.cos(a) * 0.8).normalize();
      _emit.speed = c.moteSpeed;
      _emit.speedVariance = 0.7;
      _emit.spread = 0.5;
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.08;
      _emit.sizeVariance = 0.6;
      _emit.life = c.moteLifetime;
      _emit.lifeVariance = 0.5;
      _emit.spin = 0;
      _emit.tint = null;
      _emit.time = time;
      this.motes.emit(moteCount, _emit);
    }

    /* --- chips torn off the floor inside the throat --- */
    const gritCount = Math.round(this.gritEmitter.tick(dt, c.gritRate * scale) * g.particleCount);
    if (gritCount > 0) {
      const a = Math.random() * TAU;
      const r = this._coneRadius(0, c) * randRange(0.2, 1.4);
      _pos.set(centre.x + Math.cos(a) * r, 0.08, centre.z + Math.sin(a) * r);
      _emit.position = _pos;
      _emit.radius = 0.3;
      _emit.direction = _dir.set(-Math.sin(a) * 0.9, 1, Math.cos(a) * 0.9).normalize();
      _emit.speed = c.gritSpeed;
      _emit.speedVariance = 0.75;
      _emit.spread = 0.6;
      _emit.size = 0.1;
      _emit.sizeVariance = 0.7;
      _emit.life = c.gritLifetime;
      _emit.lifeVariance = 0.5;
      _emit.spin = 9;
      _emit.time = time;
      this.grit.emit(gritCount, _emit);
    }

    /* --- pressure rings walking out across the floor --- */
    const ringCount = this.ringEmitter.tick(dt, c.ringRate * scale);
    for (let i = 0; i < ringCount; i++) {
      this.ctx.decals.spawn(DecalType.SHOCKWAVE, centre, {
        radius: this.radius * 1.06,
        life: 0.7,
        width: 0.05,
        intensity: 0.55,
        colorA: getColor(c.colorShockA),
        colorB: getColor(c.colorShockB)
      });
    }
  }
};
