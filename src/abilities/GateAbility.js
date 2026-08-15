import { Mesh, CircleGeometry, Vector3, Quaternion, Matrix4 } from 'three';
import { Ability, AbilityPhase } from './Ability.js';
import { ShardCloud } from './support/ShardCloud.js';
import { StrandBundle } from './support/StrandBundle.js';
import { ZoneField } from './support/ZoneField.js';
import { StrandMode } from '../materials/StrandMaterial.js';
import { createShellMaterial, ShellMode } from '../materials/ShellMaterial.js';
import { createGlacierMaterial } from '../materials/GlacierMaterial.js';
import { createCrystalGeometry } from '../assets/ProceduralGeometry.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { RateEmitter } from '../particles/ParticleEngine.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER } from '../core/Layers.js';
import { frame } from '../core/FrameUniforms.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';
import { saturate, lerp, Easing, randRange } from '../utils/math.js';

/** Hard ceiling on blades in the frame. The editor's `ringShards` clamps here. */
const MAX_SHARDS = 140;
const VARIANTS = 3;
const SLOTS = Math.ceil(MAX_SHARDS / VARIANTS);
const MAX_RAYS = 16;

const TAU = Math.PI * 2;

const _emit = {};
const _pos = new Vector3();
const _dir = new Vector3();
const _scale = new Vector3();
const _e1 = new Vector3();
const _e2 = new Vector3();
const _normal = new Vector3();
const _quat = new Quaternion();
const _matrix = new Matrix4();
const _up = new Vector3(0, 1, 0);

/**
 * BOREAL GATE — the library's one *vertical, framed* signature.
 *
 * Everything else in the twenty fills a volume or covers a floor. This one draws
 * a **plane**: a ring of ice stood upright in the footprint and turned to face
 * the caster, with a lit membrane stretched across it and shafts of light thrown
 * out through the opening.
 *
 * That decision is what the whole engine is built around. The frame, the sheet
 * and the rays all live in one basis — `side` across, a `gateTilt`-raked up, and
 * their cross product out toward the caster — so raking the gate back moves all
 * three together and they can never come apart. The sheet is `ShellMaterial`'s
 * MEMBRANE body on a unit disc, which is the only one of the four shell modes
 * that is shaded rather than displaced, precisely because a disc pushed around
 * in its own plane would tear away from the ring it is stretched across.
 *
 * Three beats: the front runs out to the point, the frame closes around the
 * opening over `gateOpen` while the membrane lights, and after `lifetime` the
 * blades fall out of the ring and the sheet goes with them.
 *
 * **The rule that makes the editor work.** A blade record holds a bearing and a
 * few jitters. Where it stands, how far it is thrown out of the plane and when
 * it arrives all come out of `settings[element]` every frame — dragging
 * `gateRadius` re-scales a gate that is already standing, with the clock
 * stopped.
 */
export class GateAbility extends Ability {
  constructor(context, element = 'gate') {
    super(element, context);
  }

  /* ------------------------------------------------------------------ */
  /* Construction                                                        */
  /* ------------------------------------------------------------------ */

  createShaders() {
    this.shardMaterial = createGlacierMaterial(this.element);

    this.cloud = new ShardCloud({
      parent: this.group,
      material: this.shardMaterial,
      extras: ['aGrow', 'aShatter'],
      slots: SLOTS,
      variants: VARIANTS,
      shadows: true,
      layer: LAYER.WORLD,
      build: (variant) =>
        createCrystalGeometry({
          seed: 4.7 + variant * 15.1,
          sides: this.config.facets,
          taper: this.config.taper,
          roughness: 0.3,
          bend: 0.18
        }),
      shapeKey: () => `${Math.round(this.config.facets)}|${this.config.taper.toFixed(3)}`
    });

    /* ---- the sheet stretched across the ring ---- */
    // A unit disc in its own XY plane: MEMBRANE reads `vLocal.xy` straight, so
    // the aurora is wound about the centre of the opening rather than about the
    // world origin.
    this.membraneGeometry = new CircleGeometry(1, 96);
    this.membraneMaterial = createShellMaterial(ShellMode.MEMBRANE);
    this.membrane = new Mesh(this.membraneGeometry, this.membraneMaterial);
    this.membrane.name = 'GateMembrane';
    this.membrane.frustumCulled = false;
    this.membrane.matrixAutoUpdate = false;
    this.membrane.layers.set(LAYER.VFX);
    this.membrane.renderOrder = 9; // under the frame, over the ground disc
    this.group.add(this.membrane);

    /* ---- what comes through it ---- */
    this.rays = new StrandBundle(this.group, StrandMode.RAY, {
      nodes: 32,
      capacity: MAX_RAYS,
      renderOrder: 12
    });

    /* ---- the lit disc under it ---- */
    this.field = new ZoneField(this.group, this.element);

    this.records = [];
    for (let i = 0; i < MAX_SHARDS; i++) {
      this.records.push({
        bearing: 0, // where on the ring it sits, radians
        seat: 0, // -1..1 radial jitter
        lean: 0, // -1..1 how far out of the plane it is thrown
        fan: 0, // -1..1 splay around the ring
        scale: 0, // -1..1 size jitter
        roll: 0 // spin about its own axis
      });
    }

    this._activeCount = 0;
    this._seed = 0;
    this._openTime = 0;
    this._centre = new Vector3();
    this._gateCentre = new Vector3();
    this._look = {};
  }

  createParticles() {
    const particles = this.ctx.particles;

    this.mist = particles.get('gate.mist', {
      capacity: 3000,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 1.2
    });
    this.mist.uniforms.uDrag.value = 2.0;
    this.mist.uniforms.uEndSize.value = 3.2;
    this.mist.uniforms.uSizeIn.value = 0.1;
    this.mist.uniforms.uFadeIn.value = 0.14;
    this.mist.uniforms.uFadeOut.value = 0.3;

    this.glitter = particles.get('gate.glitter', {
      capacity: 3000,
      shape: ParticleShape.SOFT,
      additive: true,
      curl: true,
      softFade: 0.4
    });
    this.glitter.uniforms.uDrag.value = 1.1;
    this.glitter.uniforms.uEndSize.value = 0.18;
    this.glitter.uniforms.uSizeIn.value = 0.05;
    this.glitter.uniforms.uFadeIn.value = 0.06;
    this.glitter.uniforms.uFadeOut.value = 0.35;

    // Ice dust falling *through* the opening — the read that says the far side
    // is a different, colder place.
    this.snow = particles.get('gate.snow', {
      capacity: 2400,
      shape: ParticleShape.SOFT,
      additive: true,
      curl: true,
      softFade: 0.5
    });
    this.snow.uniforms.uDrag.value = 1.6;
    this.snow.uniforms.uEndSize.value = 0.5;
    this.snow.uniforms.uSizeIn.value = 0.08;
    this.snow.uniforms.uFadeIn.value = 0.12;
    this.snow.uniforms.uFadeOut.value = 0.5;

    this.shards = particles.get('gate.shards', {
      capacity: 2000,
      shape: ParticleShape.CHIP,
      additive: false,
      lit: true,
      softFade: 0.25
    });
    this.shards.uniforms.uDrag.value = 0.2;
    this.shards.uniforms.uEndSize.value = 0.8;
    this.shards.uniforms.uFadeOut.value = 0.74;

    this.mistEmitter = new RateEmitter();
    this.glitterEmitter = new RateEmitter();
    this.snowEmitter = new RateEmitter();
    this.rimeEmitter = new RateEmitter();
  }

  /* ------------------------------------------------------------------ */
  /* Timing & frame                                                      */
  /* ------------------------------------------------------------------ */

  get instanceCount() {
    return this.cloud.count + this.rays.count * 2 + 1;
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

  /** Radius of the opening itself, metres. */
  get gateRadius() {
    return Math.max(0.05, this.radius * this.config.gateRadius);
  }

  /**
   * The gate's basis, written into `_e1` / `_e2` / `_normal`.
   *
   * `_e1` runs across the opening, `_e2` up it (raked back by `gateTilt`), and
   * `_normal` out of it toward the caster. Everything the ability draws is
   * placed in this frame, which is why raking the gate cannot break it apart.
   */
  _basis() {
    const tilt = this.config.gateTilt;
    _e1.copy(this.side);
    _e2.copy(_up).multiplyScalar(Math.cos(tilt)).addScaledVector(this.direction, Math.sin(tilt)).normalize();
    _normal.crossVectors(_e1, _e2).normalize();
    // Face the caster: the arrow was aimed downrange, so the opening looks back.
    if (_normal.dot(this.direction) > 0) _normal.negate();
  }

  /** Middle of the opening, world space. */
  _gatePoint(out) {
    this.pointAt(1, out).setY(0);
    const c = this.config;
    out.y = c.gateLift + this.gateRadius;
    // Raking the ring back also walks its centre downrange, so the foot stays
    // where the indicator drew it instead of sliding toward the caster.
    out.addScaledVector(this.direction, Math.sin(c.gateTilt) * this.gateRadius);
    return out;
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

  /** How far the frame has closed, 0..1. A pure function of `_openTime`. */
  _openAmount() {
    return Easing.outCubic(saturate(this._openTime / Math.max(0.02, this.config.gateOpen)));
  }

  /* ------------------------------------------------------------------ */
  /* The frame                                                           */
  /* ------------------------------------------------------------------ */

  /**
   * Place every blade in the ring.
   *
   * The frame closes as a *sweep*: it starts at the foot of the ring and the two
   * arms run up both sides to meet at the crown, so the gate reads as being
   * drawn rather than as appearing.
   */
  _updateFrame(open, fade) {
    const c = this.config;
    const g = settings.global;
    const R = this.gateRadius;
    const centre = this._gateCentre;

    this.cloud.syncShape();
    this.cloud.begin();

    for (let i = 0; i < this._activeCount; i++) {
      const record = this.records[i];

      // 0 at the foot, 1 at the crown — the order the sweep closes in.
      const fromFoot = Math.abs(((record.bearing + Math.PI / 2) % TAU + TAU) % TAU - Math.PI) / Math.PI;
      const arrived = saturate((open - fromFoot * 0.85) / 0.15);
      if (arrived <= 0.001) continue;

      const seat = R * (1 + record.seat * 0.04 * c.ringShardJitter);
      const cos = Math.cos(record.bearing);
      const sin = Math.sin(record.bearing);

      _pos.copy(centre).addScaledVector(_e1, cos * seat).addScaledVector(_e2, sin * seat);

      // The blade points outward along its own radius, thrown out of the plane
      // by `ringShardLean` and splayed around it by `ringShardFan`. The splay is
      // what makes the frame a starburst rather than a picket fence bent into a
      // circle.
      const fan = record.fan * c.ringShardFan;
      _dir
        .copy(_e1)
        .multiplyScalar(Math.cos(record.bearing + fan))
        .addScaledVector(_e2, Math.sin(record.bearing + fan))
        .addScaledVector(_normal, Math.tan(c.ringShardLean) * record.lean)
        .normalize();
      _quat.setFromUnitVectors(_up, _dir);

      const size =
        Math.max(0.01, c.radius * c.ringShardScale) *
        (1 + record.scale * 0.5 * g.randomness) *
        Easing.outBack(arrived) *
        fade;

      // Seated *on* the ring: the crystal grows out of the circle, so it is
      // pushed back by half its own length before it is drawn.
      _pos.addScaledVector(_dir, -size * 0.35);

      this.cloud.push(_pos, _quat, _scale.set(size, size * 3.6, size), 1 - arrived, FRAME_EXTRAS);
    }

    this.cloud.end();
  }

  /* ------------------------------------------------------------------ */
  /* Casting                                                             */
  /* ------------------------------------------------------------------ */

  onSpawn() {
    const c = this.config;

    this.mistEmitter.reset();
    this.glitterEmitter.reset();
    this.snowEmitter.reset();
    this.rimeEmitter.reset();

    this._openTime = 0;
    this._seed = Math.random() * 100;
    this.field.reseed();
    this.rays.set('uSeed', this._seed);
    this.membraneMaterial.uniforms.uSeed.value = this._seed;

    this._activeCount = Math.min(MAX_SHARDS, Math.max(0, Math.round(c.ringShards)));
    for (let i = 0; i < this._activeCount; i++) {
      const record = this.records[i];
      record.bearing = ((i + randRange(-0.35, 0.35)) / Math.max(1, this._activeCount)) * TAU;
      record.seat = randRange(-1, 1);
      record.lean = randRange(0.3, 1);
      record.fan = randRange(-1, 1);
      record.scale = randRange(-1, 1);
      record.roll = Math.random() * TAU;
    }

    this.cloud.clear();
    this.membrane.visible = false;
    this.field.setVisible(false);

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

    this.pointAt(1, this._centre).setY(0);
    this._basis();
    this._gatePoint(this._gateCentre);
    this.shardMaterial.userData.sync();

    const open = travelling ? 0 : this._openAmount();

    if (travelling) {
      this.cloud.clear();
      this.membrane.visible = false;
      this.rays.setVisible(false);
      this.field.setVisible(false);
    } else {
      this._updateFrame(open, fade);
      this._syncMembrane(open, fade);
      this._syncRays(open, fade);
      this.field.setVisible(fade > 0.004);
      this.field.update(this._centre, this.radius * Math.max(0.05, open), fade, c.fieldHeight ?? 0.03);
    }

    /* --- the four particle systems --- */
    this.mist.setGradient(
      getColor(c.colorMistA),
      getColor(c.colorMistB),
      getColor(c.colorMistC),
      getColor(c.colorMistD)
    );
    this.mist.uniforms.uGravity.value.set(0, c.mistRise, 0);
    this.mist.uniforms.uSizeScale.value = c.mistSize * g.particleSize;
    this.mist.uniforms.uLifeScale.value = c.mistLifetime * 0.5 * g.particleLifetime;
    this.mist.uniforms.uSpeedScale.value = c.mistSpeed * g.particleSpeed;
    this.mist.uniforms.uOpacity.value = c.mistOpacity * g.opacity;
    this.mist.uniforms.uTurbulence.value = c.mistTurbulence * g.turbulence;

    this.glitter.setGradient(
      getColor(c.colorGlitterA),
      getColor(c.colorGlitterB),
      getColor(c.colorGlitterC),
      getColor(c.colorGlitterD)
    );
    this.glitter.uniforms.uGravity.value.set(0, c.glitterRise, 0);
    this.glitter.uniforms.uSizeScale.value = c.glitterSize * g.particleSize * 7;
    this.glitter.uniforms.uLifeScale.value = c.glitterLifetime * 0.5 * g.particleLifetime;
    this.glitter.uniforms.uSpeedScale.value = g.particleSpeed;
    this.glitter.uniforms.uOpacity.value = g.opacity;
    this.glitter.uniforms.uGlow.value = c.glitterGlow * g.glow;
    this.glitter.uniforms.uTurbulence.value = c.glitterTurbulence * g.turbulence;

    this.snow.setGradient(
      getColor(c.colorSnowA),
      getColor(c.colorSnowB),
      getColor(c.colorSnowC),
      getColor(c.colorSnowD)
    );
    this.snow.uniforms.uGravity.value.set(0, c.snowFall, 0);
    this.snow.uniforms.uSizeScale.value = c.snowSize * g.particleSize * 7;
    this.snow.uniforms.uLifeScale.value = c.snowLifetime * 0.5 * g.particleLifetime;
    this.snow.uniforms.uSpeedScale.value = g.particleSpeed;
    this.snow.uniforms.uOpacity.value = g.opacity;
    this.snow.uniforms.uGlow.value = c.snowGlow * g.glow;
    this.snow.uniforms.uTurbulence.value = c.snowTurbulence * g.turbulence;

    this.shards.setGradient(
      getColor(c.colorShardA),
      getColor(c.colorShardB),
      getColor(c.colorShardC),
      getColor(c.colorShardD)
    );
    this.shards.uniforms.uGravity.value.set(0, c.shardGravity, 0);
    this.shards.uniforms.uSizeScale.value = c.shardSize * g.particleSize * 7;
    this.shards.uniforms.uLifeScale.value = g.particleLifetime;
    this.shards.uniforms.uSpeedScale.value = g.particleSpeed;
    this.shards.uniforms.uOpacity.value = g.opacity;
  }

  /** Place and shade the sheet. */
  _syncMembrane(open, fade) {
    const c = this.config;
    const g = settings.global;
    const R = this.gateRadius * lerp(0.35, 1, Easing.outCubic(open));

    // Built straight from the gate's basis: the sheet cannot drift off the ring
    // because it is not placed independently of it.
    _matrix.makeBasis(_e1, _e2, _normal);
    _matrix.scale(_scale.set(R, R, 1));
    _matrix.setPosition(this._gateCentre);
    this.membrane.matrix.copy(_matrix);
    this.membrane.matrixWorldNeedsUpdate = true;
    this.membrane.visible = fade > 0.004 && open > 0.02;

    const u = this.membraneMaterial.uniforms;
    u.uProgress.value = open;
    u.uAge.value = this.age;
    u.uScale.value = c.membraneScale * g.noiseFrequency;
    u.uSpeed.value = c.membraneSpeed * g.noiseSpeed;
    u.uWarp.value = c.membraneSwirl;
    u.uSpin.value = c.membraneSpeed * 0.35 * g.noiseSpeed;
    u.uRings.value = c.membraneRings;
    u.uRingSpeed.value = c.membraneRingSpeed * g.noiseSpeed;
    u.uDepth.value = c.membraneDepth;
    u.uDissolve.value = 1 - fade;
    u.uOpacity.value = c.membraneOpacity * g.opacity;
    u.uGlow.value = c.membraneGlow * g.glow;
    u.uColorA.value.copy(getColor(c.colorMembraneA));
    u.uColorB.value.copy(getColor(c.colorMembraneB));
    u.uColorC.value.copy(getColor(c.colorMembraneC));
  }

  /** The shafts thrown out through the opening. */
  _syncRays(open, fade) {
    const c = this.config;
    const bundle = this.rays;

    bundle.setCount(Math.min(MAX_RAYS, Math.round(c.rays)));
    bundle.setVisible(fade > 0.004 && open > 0.05);
    if (bundle.count <= 0) return;

    bundle.set('uOrigin', this._centre);
    bundle.set('uForward', _normal); // out of the opening, toward the caster
    bundle.set('uSideAxis', _e1);
    bundle.set('uAge', this.age);
    bundle.set('uProgress', open);
    bundle.set('uFade', fade);
    bundle.set('uHeight', this._gateCentre.y);
    bundle.set('uRadius', this.gateRadius);
    bundle.set('uLength', c.rayLength * open);
    bundle.set('uSpan', c.raySpread);
    bundle.set('uSpeed', c.raySpeed);
    bundle.set('uJitter', 0.04 * settings.global.randomness);
    bundle.set('uJitterScale', 2.0);
    bundle.set('uCrawl', 0.8);

    const look = this._look;
    look.core = getColor(c.colorRayCore);
    look.edge = getColor(c.colorRayEdge);
    look.halo = getColor(c.colorRayHalo);
    look.width = c.rayWidth;
    look.glow = c.rayGlow * settings.global.glow;
    look.opacity = settings.global.opacity;
    look.dim = c.rayDim;
    look.haloOpacity = 0.32;
    look.softFade = 1.0;
    bundle.syncLook(look);
  }

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

    this.ctx.flash.trigger(getColor(c.colorCastFlash), c.castFlash * g.explosionIntensity);
    this.lightBoost = c.lightIntensity * 0.4 * g.explosionIntensity;
  }

  /** What the standing gate sheds. */
  _fieldFx(dt, scale) {
    const c = this.config;
    const g = settings.global;
    const time = frame.uTime.value;
    const gate = this._gateCentre;
    const R = this.gateRadius;

    /* --- cold pouring off the bottom of the ring and out over the floor --- */
    const mistCount = Math.round(this.mistEmitter.tick(dt, c.mistRate * scale) * g.particleCount);
    if (mistCount > 0) {
      const a = randRange(Math.PI * 1.15, Math.PI * 1.85); // the lower arc only
      _pos.copy(gate).addScaledVector(_e1, Math.cos(a) * R).addScaledVector(_e2, Math.sin(a) * R);
      _emit.position = _pos;
      _emit.radius = R * 0.2;
      _emit.direction = _dir.copy(_normal).multiplyScalar(0.6).setY(-0.5).normalize();
      _emit.speed = c.mistSpeed;
      _emit.speedVariance = 0.7;
      _emit.spread = 0.7;
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

    /* --- glitter drawn through the sheet and out of it --- */
    const glitterCount = Math.round(
      this.glitterEmitter.tick(dt, c.glitterRate * scale) * g.particleCount
    );
    if (glitterCount > 0) {
      const a = Math.random() * TAU;
      const r = R * Math.sqrt(Math.random()) * 0.9;
      _pos.copy(gate).addScaledVector(_e1, Math.cos(a) * r).addScaledVector(_e2, Math.sin(a) * r);
      _emit.position = _pos;
      _emit.radius = 0.2;
      _emit.direction = _dir.copy(_normal);
      _emit.speed = c.glitterSpeed;
      _emit.speedVariance = 0.8;
      _emit.spread = 0.45;
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

    /* --- snow falling out of the opening onto the floor in front of it --- */
    const snowCount = Math.round(this.snowEmitter.tick(dt, c.snowRate * scale) * g.particleCount);
    if (snowCount > 0) {
      const a = Math.random() * TAU;
      const r = R * Math.sqrt(Math.random());
      _pos.copy(gate).addScaledVector(_e1, Math.cos(a) * r).addScaledVector(_e2, Math.sin(a) * r);
      _emit.position = _pos;
      _emit.radius = 0.25;
      _emit.direction = _dir.copy(_normal).multiplyScalar(0.35).setY(-1).normalize();
      _emit.speed = c.snowSpeed;
      _emit.speedVariance = 0.6;
      _emit.spread = 0.5;
      _emit.size = 0.07;
      _emit.sizeVariance = 0.7;
      _emit.life = c.snowLifetime;
      _emit.lifeVariance = 0.45;
      _emit.spin = 0;
      _emit.time = time;
      this.snow.emit(snowCount, _emit);
    }

    /* --- rime creeping around the foot of the frame --- */
    const rimeCount = this.rimeEmitter.tick(dt, c.rimeRate * scale);
    for (let i = 0; i < rimeCount; i++) {
      const a = Math.random() * TAU;
      const r = this.radius * randRange(0.35, 1.0);
      _pos.set(this._centre.x + Math.cos(a) * r, 0, this._centre.z + Math.sin(a) * r);
      this.ctx.decals.spawn(DecalType.FROST, _pos, {
        radius: c.rimeRadius * randRange(0.7, 1.3),
        life: c.frostLife,
        width: c.frostCrystals,
        intensity: c.frostIntensity,
        colorA: getColor(c.colorFrost),
        colorB: getColor(c.colorFrostEdge)
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Phases                                                              */
  /* ------------------------------------------------------------------ */

  onTravel(dt) {
    this._sync(1);
    this.position.y = 0.35;
    this.ctx.shake.rumble(this.config.rumble * settings.global.cameraShake, dt);
  }

  onImpact() {
    const c = this.config;
    const g = settings.global;

    this._openTime = 0;
    this._gatePoint(_pos);

    /* the shell of freezing vapour thrown off as the ring seats itself */
    this.ctx.bursts.spawn(BurstMode.FROST, _pos, {
      radius: c.burstSize * 0.25,
      endRadius: c.burstSize * g.explosionIntensity,
      life: 0.9,
      intensity: c.burstIntensity,
      opacity: 0.75,
      fresnel: 1.5,
      displace: 0.6,
      colorA: getColor(c.colorBurstA),
      colorB: getColor(c.colorBurstB),
      colorC: getColor(c.colorBurstC)
    });

    this.pointAt(1, _pos).setY(0);
    this.ctx.decals.spawn(DecalType.SHOCKWAVE, _pos, {
      radius: c.shockRadius * g.explosionIntensity,
      life: 0.75,
      width: 0.05,
      intensity: 1.0,
      colorA: getColor(c.colorShockA),
      colorB: getColor(c.colorShockB)
    });

    this.ctx.decals.spawn(DecalType.FROST, _pos, {
      radius: this.radius * c.frostSpread,
      life: c.frostLife * 1.3,
      width: c.frostCrystals,
      intensity: c.frostIntensity,
      colorA: getColor(c.colorFrost),
      colorB: getColor(c.colorFrostEdge)
    });

    /* chips blown out of the ring as it closes */
    this._gatePoint(_pos);
    _emit.position = _pos;
    _emit.radius = this.gateRadius * 0.8;
    _emit.direction = _dir.copy(_normal).multiplyScalar(0.5).setY(0.6).normalize();
    _emit.speed = c.shardSpeed * 1.5;
    _emit.speedVariance = 0.8;
    _emit.spread = 1.0;
    _emit.inherit = null;
    _emit.anchor = null;
    _emit.size = 0.13;
    _emit.sizeVariance = 0.8;
    _emit.life = c.shardLifetime * 1.2;
    _emit.lifeVariance = 0.5;
    _emit.spin = 8;
    _emit.tint = null;
    _emit.time = frame.uTime.value;
    this.shards.emit(Math.round(c.burstShards * g.particleCount), _emit);

    this.ctx.shake.add(
      c.impactShake * g.explosionIntensity * g.cameraShake,
      1 / Math.max(0.1, c.shakeDuration),
      20
    );
    this.ctx.flash.trigger(getColor(c.colorFlash), c.impactFlash * g.explosionIntensity);
    this.lightBoost = c.lightIntensity * 1.3 * g.explosionIntensity;
  }

  onFade(dt, t) {
    const c = this.config;
    this._openTime += dt;

    const fade = t <= 1 ? 1 : 1 - Easing.inCubic(saturate(t - 1));
    this._sync(fade);

    // The light sits in the opening, which is where the ability's read is.
    this.position.copy(this._gateCentre);

    this._fieldFx(dt, fade * (t <= 1 ? 1 : 0.35));
    this.ctx.shake.rumble(c.holdShake * fade * settings.global.cameraShake, dt);
  }

  onDestroy() {
    this._activeCount = 0;
    this.cloud.clear();
    this.membrane.visible = false;
    this.rays.setVisible(false);
    this.field.setVisible(false);
  }

  dispose() {
    this.cloud.dispose();
    this.rays.dispose();
    this.field.dispose();
    this.membraneGeometry.dispose();
    this.membraneMaterial.dispose();
    this.shardMaterial.dispose();
    super.dispose();
  }
}

/** Fully grown, never shattered. */
const FRAME_EXTRAS = [1, 0];
