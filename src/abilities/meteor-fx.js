import { BurstMode } from '../effects/BurstSphere.js';
import { frame } from '../core/FrameUniforms.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';
import { lerp } from '../utils/math.js';
import { TRAIL_BATCHES, _emit, _pos, _dir, _back, _heading, _impact } from './meteor-scratch.js';

/**
 * Meteor Strike emission — everything it throws off, as a prototype mixin.
 *
 * The launch off the hand, the wake it drags the whole way down, and the crater it leaves once it has landed.
 *
 * Mixed into the engine's prototype at the bottom of its file, so these are
 * ordinary methods: `this` is the ability, and each one is free to call the
 * geometry and simulation methods that stayed behind. Split out under the
 * 800-line rule in `AGENTS.md`; not a line of any body changed.
 */
export const meteorFx = {
  _launchFx() {
    const c = this.config;
    const g = settings.global;

    this._launchPoint(_pos);

    // Off by default: an expanding shell this close to the camera-facing side of
    // the body reads as a ball stuck to the caster rather than as a flare, and
    // the sparks below plus the screen flash already sell the release. Dial
    // `muzzleSize` up if you want it back.
    if (c.muzzleSize > 0) {
      this.ctx.bursts.spawn(BurstMode.FIRE, _pos, {
        radius: c.muzzleSize * 0.25,
        endRadius: c.muzzleSize * g.explosionIntensity,
        life: 0.4,
        intensity: c.muzzleIntensity,
        opacity: 0.85,
        fresnel: 1.2,
        displace: 0.45,
        colorA: getColor(c.colorHot),
        colorB: getColor(c.colorFlameMid),
        colorC: getColor(c.colorFlameEdge)
      });
    }

    _emit.position = _pos;
    _emit.radius = 0.22;
    _emit.direction = _dir.copy(this.direction).multiplyScalar(0.5).setY(0.7).normalize();
    _emit.speed = c.sparkSpeed * 0.9;
    _emit.speedVariance = 0.8;
    _emit.spread = 0.9;
    _emit.inherit = null;
    _emit.anchor = null;
    _emit.size = 0.16;
    _emit.sizeVariance = 0.7;
    _emit.life = c.sparkLifetime * 0.8;
    _emit.lifeVariance = 0.5;
    _emit.spin = 0;
    _emit.tint = null;
    _emit.time = frame.uTime.value;
    this.sparks.emit(Math.round(30 * g.particleCount), _emit);

    this.ctx.flash.trigger(getColor(c.colorCastFlash), c.castFlash * g.explosionIntensity);
    this.lightBoost = c.lightIntensity * 0.6 * g.explosionIntensity;
  },

  _trailFx(dt) {
    const c = this.config;
    const g = settings.global;
    const time = frame.uTime.value;
    const radius = this._radius();

    // The trail is pushed off the *back* of the rock, and the rock is gone.
    this._headingAt(this.u, _heading);
    _back.copy(_heading).multiplyScalar(-1);

    let emberCount = Math.round(this.emberEmitter.tick(dt, c.emberRate) * g.particleCount);
    if (emberCount > 0) {
      _emit.direction = _dir.copy(_back).setY(_back.y + 0.35).normalize();
      _emit.speed = c.emberSpeed;
      _emit.speedVariance = 0.7;
      _emit.spread = 0.85;
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.13;
      _emit.sizeVariance = 0.6;
      _emit.life = c.emberLifetime;
      _emit.lifeVariance = 0.45;
      _emit.spin = 0;
      _emit.tint = null;
      _emit.time = time;

      const batches = Math.min(emberCount, TRAIL_BATCHES);
      const per = Math.ceil(emberCount / batches);
      while (emberCount > 0) {
        this._arcPoint(lerp(this._lastU, this.u, Math.random()), _pos);
        _emit.position = _pos;
        _emit.radius = radius * 0.9;
        this.embers.emit(Math.min(per, emberCount), _emit);
        emberCount -= per;
      }
    }

    const sparkCount = Math.round(this.sparkEmitter.tick(dt, c.sparkRate) * g.particleCount);
    if (sparkCount > 0) {
      this._arcPoint(lerp(this._lastU, this.u, Math.random()), _pos);
      _emit.position = _pos;
      _emit.radius = radius * 0.7;
      _emit.direction = _dir.copy(_back).setY(_back.y + 0.2).normalize();
      _emit.speed = c.sparkSpeed;
      _emit.speedVariance = 0.85;
      _emit.spread = 0.95;
      _emit.size = 0.15;
      _emit.sizeVariance = 0.7;
      _emit.life = c.sparkLifetime;
      _emit.lifeVariance = 0.55;
      _emit.spin = 0;
      _emit.time = time;
      this.sparks.emit(sparkCount, _emit);
    }

    const smokeCount = Math.round(this.smokeEmitter.tick(dt, c.smokeRate) * g.particleCount);
    if (smokeCount > 0) {
      this._arcPoint(lerp(this._lastU, this.u, Math.random()), _pos);
      _emit.position = _pos;
      _emit.radius = radius * 1.1;
      _emit.direction = _dir.copy(_back);
      _emit.speed = c.smokeSpeed;
      _emit.speedVariance = 0.6;
      _emit.spread = 0.75;
      _emit.size = 0.85;
      _emit.sizeVariance = 0.5;
      _emit.life = c.smokeLifetime;
      _emit.lifeVariance = 0.4;
      _emit.spin = 0.5;
      _emit.time = time;
      this.smoke.emit(smokeCount, _emit);
    }
  },

  _craterFx(dt, scale) {
    const c = this.config;
    const g = settings.global;
    const time = frame.uTime.value;

    this._arcPoint(1, _impact);

    const emberCount = Math.round(this.emberEmitter.tick(dt, c.emberRate * 0.5 * scale) * g.particleCount);
    if (emberCount > 0) {
      _emit.position = _pos.copy(_impact).setY(0.25);
      _emit.radius = c.scorchRadius * 0.9;
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = c.emberSpeed * 0.8;
      _emit.speedVariance = 0.75;
      _emit.spread = 0.9;
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.14;
      _emit.sizeVariance = 0.6;
      _emit.life = c.emberLifetime * 1.2;
      _emit.lifeVariance = 0.5;
      _emit.spin = 0;
      _emit.tint = null;
      _emit.time = time;
      this.embers.emit(emberCount, _emit);
    }

    const smokeCount = Math.round(this.smokeEmitter.tick(dt, c.smokeRate * 0.8 * scale) * g.particleCount);
    if (smokeCount > 0) {
      _emit.position = _pos.copy(_impact).setY(0.2);
      _emit.radius = c.scorchRadius * 1.1;
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = c.smokeSpeed * 1.2;
      _emit.speedVariance = 0.6;
      _emit.spread = 0.85;
      _emit.size = 1.3;
      _emit.sizeVariance = 0.5;
      _emit.life = c.smokeLifetime * 1.4;
      _emit.lifeVariance = 0.4;
      _emit.spin = 0.6;
      _emit.time = time;
      this.smoke.emit(smokeCount, _emit);
    }
  }
};
