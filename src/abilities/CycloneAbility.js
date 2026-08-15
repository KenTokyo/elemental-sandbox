import { Mesh, Vector3, Quaternion } from 'three';
import { Ability, AbilityPhase } from './Ability.js';
import { ShardCloud } from './support/ShardCloud.js';
import { StrandBundle } from './support/StrandBundle.js';
import { ZoneField } from './support/ZoneField.js';
import { StrandMode } from '../materials/StrandMaterial.js';
import { createGlacierMaterial } from '../materials/GlacierMaterial.js';
import { createMeteorMaterial } from '../materials/MeteorMaterial.js';
import { VolumetricFireMaterial, fireHullReach } from '../materials/VolumetricFireMaterial.js';
import { RibbonGeometry, RibbonMode } from '../effects/RibbonGeometry.js';
import { createCrystalGeometry, createAsteroidGeometry } from '../assets/ProceduralGeometry.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { RateEmitter } from '../particles/ParticleEngine.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER } from '../core/Layers.js';
import { frame } from '../core/FrameUniforms.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';
import { saturate, lerp, Easing, randRange } from '../utils/math.js';
import { TAU, _emit, _pos, _dir } from './cyclone-scratch.js';
import { cycloneFx } from './cyclone-fx.js';

/** Hard ceiling on debris per cast. The editor's `shardCount` clamps here. */
const MAX_SHARDS = 240;
const VARIANTS = 3;
const SLOTS = Math.ceil(MAX_SHARDS / VARIANTS);
/** Ribbons wound through the cone. */
const MAX_STRANDS = 32;
/** Samples along the dust column's proxy hull. */
const COLUMN_NODES = 12;

const _axis = new Vector3();
const _spin = new Quaternion();

/**
 * CYCLONE — a funnel standing in the footprint, with solid debris orbiting it.
 *
 * Two signatures run on this engine and they are deliberately opposites:
 *
 *   **Shard Cyclone** is glass. A tall, tight cone turning fast, loaded with
 *   crystal blades, clear enough to see the far side through.
 *
 *   **Sandstorm Coil** is stone. A squat, wide cone turning slowly, loaded with
 *   rock, with a raymarched wall of dust standing inside it so the column
 *   *occludes* instead of sparkling.
 *
 * Everything that separates them is a number, with two exceptions that could not
 * be: `shardMaterial` picks the material and the generated silhouette (crystal
 * or asteroid), and `funnelVolume` decides whether the dust column is drawn at
 * all. Both are read live.
 *
 * **The cone is a law, not a path.** A shard record holds dice — a bearing, a
 * height offset, a climb rate and a handful of jitters. Where it actually *is*
 * comes out of `settings[element]` every frame: the seat radius is
 * `mix(funnelBase, funnelTop, h^funnelCurve) × zoneRadius`, the angular velocity
 * is `spin` sheared toward `spinFalloff` with height, and the climb wraps at the
 * crest. Dragging `funnelCurve` re-winds a column that is already turning, with
 * the clock stopped.
 *
 * Three beats: the front runs out to the point, the cone opens over `snapTime`
 * and stands for `lifetime`, then it spins down and the debris drops out of it
 * over `fadeTime`.
 */
export class CycloneAbility extends Ability {
  constructor(context, element = 'cyclone') {
    super(element, context);
  }

  /* ------------------------------------------------------------------ */
  /* Construction                                                        */
  /* ------------------------------------------------------------------ */

  /** Whether this element throws glass or stone around. Read once, at build. */
  get isCrystal() {
    return (this.config.shardMaterial ?? 'crystal') === 'crystal';
  }

  createShaders() {
    const crystal = this.isCrystal;

    this.shardMaterial = crystal
      ? createGlacierMaterial(this.element)
      : createMeteorMaterial(this.ctx.environment, this.element);

    this.cloud = new ShardCloud({
      parent: this.group,
      material: this.shardMaterial,
      // The two materials have different per-instance contracts; handing the
      // wrong list over is the one way this draws black.
      extras: crystal ? ['aGrow', 'aShatter'] : ['aHeat'],
      slots: SLOTS,
      variants: VARIANTS,
      shadows: true,
      layer: LAYER.WORLD,
      build: (variant) => this._buildShard(variant),
      shapeKey: () => this._shapeKey()
    });

    /* ---- the wind wound around the cone ---- */
    this.strands = new StrandBundle(this.group, StrandMode.HELIX, {
      nodes: 48,
      capacity: MAX_STRANDS,
      renderOrder: 11
    });

    /* ---- the lit disc it stands on ---- */
    this.field = new ZoneField(this.group, this.element);

    /* ---- the dust wall, for the elements that want one ---- */
    this.column = new RibbonGeometry(COLUMN_NODES + 2, { frame: true });
    this.columnPoints = [];
    for (let i = 0; i < COLUMN_NODES + 2; i++) this.columnPoints.push(new Vector3());
    this.columnMaterial = new VolumetricFireMaterial(this.element);
    this.columnMesh = new Mesh(this.column.geometry, this.columnMaterial);
    this.columnMesh.frustumCulled = false;
    this.columnMesh.matrixAutoUpdate = false;
    this.columnMesh.layers.set(LAYER.VFX);
    this.columnMesh.renderOrder = 10; // behind the additive strands, over the field
    this.columnMesh.visible = false;
    this.group.add(this.columnMesh);

    /**
     * Fixed-size record pool — a cast allocates nothing. Dice only: not one
     * metre, radian or second is captured here.
     */
    this.records = [];
    for (let i = 0; i < MAX_SHARDS; i++) {
      this.records.push({
        bearing: 0, // where on the circle it started, radians
        base: 0, // 0..1 height it entered the cone at
        scale: 0, // -1..1 size jitter
        climb: 0, // -1..1 climb-rate jitter
        spin: 0, // -1..1 angular-velocity jitter
        wobble: 0, // phase of its own radial breathing
        tumble: new Vector3(0, 1, 0)
      });
    }

    this._activeCount = 0;
    this._seed = 0;
    /** Seconds since the cone started opening. Drives the snap, nothing else. */
    this._openTime = 0;
    this._centre = new Vector3();
    this._look = { core: null, edge: null, halo: null, width: 0, glow: 0 };
  }

  /** One piece of debris. Variant index only perturbs the seed. */
  _buildShard(variant) {
    const c = this.config;
    if (this.isCrystal) {
      return createCrystalGeometry({
        seed: 7.3 + variant * 13.9,
        sides: c.facets,
        taper: c.taper,
        roughness: c.roughness,
        bend: c.bend
      });
    }
    return createAsteroidGeometry({
      seed: 5.1 + variant * 11.3,
      detail: 1, // one instance is a chip in a storm, not the hero rock
      lumpiness: c.lumpiness,
      noiseScale: c.lumpScale,
      roughness: c.surfaceRoughness,
      cuts: c.cuts,
      cutDepth: c.cutDepth,
      craters: c.craters,
      craterDepth: c.craterDepth,
      craterSize: c.craterSize
    });
  }

  /** Signature of the *shape* controls, so a rebuild only happens on a change. */
  _shapeKey() {
    const c = this.config;
    return this.isCrystal
      ? `c|${Math.round(c.facets)}|${c.taper.toFixed(3)}|${c.roughness.toFixed(3)}|${c.bend.toFixed(3)}`
      : `r|${c.lumpiness.toFixed(3)}|${c.surfaceRoughness.toFixed(3)}|${Math.round(c.cuts)}|${Math.round(c.craters)}`;
  }

  createParticles() {
    const particles = this.ctx.particles;

    // Haze. Non-additive so a dense column genuinely hides what is behind it —
    // the difference between the two signatures is almost entirely this rate.
    this.dust = particles.get('cyclone.dust', {
      capacity: 3600,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 1.1
    });
    this.dust.uniforms.uDrag.value = 1.9;
    this.dust.uniforms.uEndSize.value = 3.2;
    this.dust.uniforms.uSizeIn.value = 0.12;
    this.dust.uniforms.uFadeIn.value = 0.16;
    this.dust.uniforms.uFadeOut.value = 0.3;

    // The glints riding the wind up the cone.
    this.motes = particles.get('cyclone.motes', {
      capacity: 3600,
      shape: ParticleShape.SOFT,
      additive: true,
      curl: true,
      softFade: 0.4
    });
    this.motes.uniforms.uDrag.value = 1.0;
    this.motes.uniforms.uEndSize.value = 0.18;
    this.motes.uniforms.uSizeIn.value = 0.05;
    this.motes.uniforms.uFadeIn.value = 0.07;
    this.motes.uniforms.uFadeOut.value = 0.38;

    // Chips thrown off the throat and out over the rim.
    this.grit = particles.get('cyclone.grit', {
      capacity: 2400,
      shape: ParticleShape.CHIP,
      additive: false,
      lit: true,
      softFade: 0.25
    });
    this.grit.uniforms.uDrag.value = 0.25;
    this.grit.uniforms.uEndSize.value = 0.8;
    this.grit.uniforms.uFadeOut.value = 0.7;

    this.dustEmitter = new RateEmitter();
    this.moteEmitter = new RateEmitter();
    this.gritEmitter = new RateEmitter();
    this.ringEmitter = new RateEmitter();
  }

  /* ------------------------------------------------------------------ */
  /* Timing                                                              */
  /* ------------------------------------------------------------------ */

  get instanceCount() {
    return this.cloud.count + this.strands.count * 2;
  }

  get impactDuration() {
    return Math.max(0.2, this.config.lifetime * settings.global.lifetime);
  }

  get fadeDuration() {
    return Math.max(0.1, this.config.fadeTime);
  }

  /** The live footprint, metres. What the indicator measured out. */
  get radius() {
    return Math.max(0.05, this.config.zoneRadius);
  }

  /** How far open the cone is, 0..1. A pure function of `_openTime`. */
  _openAmount() {
    const snap = Math.max(0.02, this.config.snapTime);
    return Easing.outCubic(saturate(this._openTime / snap));
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

  /* ------------------------------------------------------------------ */
  /* The cone — every metre resolved from live settings                   */
  /* ------------------------------------------------------------------ */

  /** Seat radius of the cone at height fraction `h`, metres. */
  _coneRadius(h, c) {
    return lerp(c.funnelBase, c.funnelTop, Math.pow(saturate(h), Math.max(0.05, c.funnelCurve))) * this.radius;
  }

  /**
   * Place every shard from the live settings.
   *
   * @param {number} open   0..1 how far the cone has stood up
   * @param {number} fade   1 while it turns, → 0 as it spins down
   */
  _updateShards(open, fade) {
    const c = this.config;
    const g = settings.global;
    const crystal = this.isCrystal;
    const centre = this._centre;
    const height = Math.max(0.05, c.funnelHeight) * open;
    const wanted = Math.min(MAX_SHARDS, Math.max(0, Math.round(c.shardCount * c.density)));

    this.cloud.syncShape();
    this.cloud.begin();

    for (let i = 0; i < Math.min(wanted, this._activeCount); i++) {
      const record = this.records[i];

      // Climb wraps at the crest, so the cone is continuously fed rather than
      // emptying out — which is what makes it read as *turning* rather than as
      // a fixed set of objects on rails.
      const rate = c.climb * (1 + record.climb * c.climbJitter * g.randomness);
      const h = ((record.base + this.age * rate) % 1 + 1) % 1;

      let r = this._coneRadius(h, c);
      r *= 1 + c.wobble * Math.sin(h * c.wobbleScale * TAU + record.wobble + this.age * 1.7);

      const omega = c.spin * lerp(1, c.spinFalloff, h) * (1 + record.spin * c.spinJitter * g.randomness);
      const angle = record.bearing + omega * this.age * TAU;

      const y = h * height;
      _pos.set(
        centre.x + Math.cos(angle) * r + this.direction.x * c.funnelLean * y,
        y,
        centre.z + Math.sin(angle) * r + this.direction.z * c.funnelLean * y
      );

      // Faded in at the floor and out at the crest: a shard that pops into
      // existence halfway up the cone is the one thing that gives the wrap away.
      const ends = Math.min(saturate(h / 0.09), saturate((1 - h) / 0.14));
      const size =
        Math.max(0.01, c.radius * c.shardScale) *
        (1 + record.scale * c.shardScaleJitter * g.randomness) *
        ends *
        fade;

      _spin.setFromAxisAngle(record.tumble, this.age * c.tumble * (1 + record.spin * 0.4));

      if (crystal) {
        // Unit crystal: base ring at y = 0, apex at y = 1. Scaled into a blade.
        _pos.y += size * 0.8;
        this.cloud.push(_pos, _spin, _axis.set(size, size * 3.2, size), 0, CRYSTAL_EXTRAS);
      } else {
        this.cloud.push(_pos, _spin, size * 1.35, 0, ROCK_EXTRAS);
      }
    }

    this.cloud.end();
  }

  /**
   * Rebuild the proxy hull the dust column is raymarched inside.
   *
   * A straight vertical centre line, which is the whole of the difference from
   * the Cinder Fall's arc. The hull only has to *contain* the density field, so
   * it is padded by the same reach the flame's is — a hull one pixel too narrow
   * slices the volume along a dead straight edge.
   */
  _updateColumn(open, fade) {
    const c = this.config;
    const amount = c.funnelVolume ?? 0;
    const height = Math.max(0.05, c.funnelHeight) * open;

    const visible = amount > 0.002 && fade > 0.01 && height > 0.4;
    this.columnMesh.visible = visible;
    if (!visible) {
      this.column.clear();
      return;
    }

    const centre = this._centre;
    const radius = Math.max(0.05, this._coneRadius(0.5, c) * 0.72);
    const reach = fireHullReach(this.element);
    const pad = radius * reach;
    const count = COLUMN_NODES;

    // Padding caps at both ends, along the column's own axis.
    this.columnPoints[0].set(centre.x, -pad, centre.z);
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const y = t * height;
      this.columnPoints[i + 1].set(
        centre.x + this.direction.x * c.funnelLean * y,
        y,
        centre.z + this.direction.z * c.funnelLean * y
      );
    }
    this.columnPoints[count + 1]
      .copy(this.columnPoints[count])
      .setY(this.columnPoints[count].y + pad);

    const u = this.columnMaterial.uniforms;
    u.uRadius.value = radius;
    u.uStreamLength.value = height;
    u.uArcLength.value = height + pad * 2;
    u.uTailPad.value = pad;
    u.uOpacity.value = c.trailOpacity * amount * fade * settings.global.opacity;

    // Wide enough for the shred, the bulge and the plume together.
    const cover = 1.1 * reach * Math.max(1, c.trailPlume);
    const flare = Math.max(1, c.funnelTop / Math.max(0.05, c.funnelBase));

    this.column.build(this.columnPoints, {
      count: count + 2,
      width: 2 * radius * c.trailHeadSize * cover * flare,
      mode: RibbonMode.BILLBOARD,
      cameraPosition: this.ctx.camera.position,
      // Opens with height exactly as the cone does, so the dust is inside the
      // debris rather than a cylinder with blades orbiting outside it.
      widthProfile: (t) => lerp(1, flare, saturate((t * (height + pad * 2) - pad) / Math.max(0.05, height)))
    });
  }

  /* ------------------------------------------------------------------ */
  /* Casting                                                             */
  /* ------------------------------------------------------------------ */

  onSpawn() {
    const c = this.config;

    this.dustEmitter.reset();
    this.moteEmitter.reset();
    this.gritEmitter.reset();
    this.ringEmitter.reset();

    this._openTime = 0;
    this._seed = Math.random() * 100;
    this.field.reseed();
    this.strands.set('uSeed', this._seed);

    this._activeCount = Math.min(MAX_SHARDS, Math.max(0, Math.round(c.shardCount * c.density)));
    for (let i = 0; i < this._activeCount; i++) {
      const record = this.records[i];
      record.bearing = Math.random() * TAU;
      record.base = Math.random();
      record.scale = randRange(-1, 1);
      record.climb = randRange(-1, 1);
      record.spin = randRange(-1, 1);
      record.wobble = Math.random() * TAU;
      record.tumble
        .set(randRange(-1, 1), randRange(-1, 1), randRange(-1, 1))
        .normalize();
    }

    this.cloud.clear();
    this.field.setVisible(false);
    this.columnMesh.visible = false;

    this._sync(1);
    this._muzzleFx();
  }

  /* ------------------------------------------------------------------ */
  /* Feedback                                                            */
  /* ------------------------------------------------------------------ */

  /**
   * Push the live settings and the cast state into the debris, the ribbons, the
   * disc, the dust column and the three particle systems.
   */
  _sync(fade) {
    const c = this.config;
    const g = settings.global;
    const travelling = this.phase === AbilityPhase.TRAVEL;

    this._centrePoint(this._centre);
    if (this.isCrystal) this.shardMaterial.userData.sync();
    else this.shardMaterial.userData.sync(0, this.direction);

    const open = travelling ? 0 : this._openAmount();

    if (travelling) {
      this.cloud.clear();
      this.strands.setVisible(false);
      this.field.setVisible(false);
      this.columnMesh.visible = false;
      this.column.clear();
    } else {
      this._updateShards(open, fade);
      this._syncStrands(open, fade);
      this.field.setVisible(fade > 0.004);
      this.field.update(this._centre, this.radius * Math.max(0.05, open), fade, c.fieldHeight ?? 0.03);
      this.columnMaterial.sync();
      this._updateColumn(open, fade);
    }

    /* --- the three particle systems --- */
    this.dust.setGradient(
      getColor(c.colorDustA),
      getColor(c.colorDustB),
      getColor(c.colorDustC),
      getColor(c.colorDustD)
    );
    this.dust.uniforms.uGravity.value.set(0, c.dustRise, 0);
    this.dust.uniforms.uSizeScale.value = c.dustSize * g.particleSize;
    this.dust.uniforms.uLifeScale.value = c.dustLifetime * 0.5 * g.particleLifetime;
    this.dust.uniforms.uSpeedScale.value = c.dustSpeed * g.particleSpeed;
    this.dust.uniforms.uOpacity.value = c.dustOpacity * g.opacity;
    this.dust.uniforms.uTurbulence.value = c.dustTurbulence * g.turbulence;

    this.motes.setGradient(
      getColor(c.colorMoteA),
      getColor(c.colorMoteB),
      getColor(c.colorMoteC),
      getColor(c.colorMoteD)
    );
    this.motes.uniforms.uGravity.value.set(0, c.moteRise, 0);
    this.motes.uniforms.uSizeScale.value = c.moteSize * g.particleSize * 7;
    this.motes.uniforms.uLifeScale.value = c.moteLifetime * 0.5 * g.particleLifetime;
    this.motes.uniforms.uSpeedScale.value = g.particleSpeed;
    this.motes.uniforms.uOpacity.value = g.opacity;
    this.motes.uniforms.uGlow.value = c.moteGlow * g.glow;
    this.motes.uniforms.uTurbulence.value = c.moteTurbulence * g.turbulence;

    this.grit.setGradient(
      getColor(c.colorGritA),
      getColor(c.colorGritB),
      getColor(c.colorGritC),
      getColor(c.colorGritD)
    );
    this.grit.uniforms.uGravity.value.set(0, c.gritGravity, 0);
    this.grit.uniforms.uSizeScale.value = c.gritSize * g.particleSize * 7;
    this.grit.uniforms.uLifeScale.value = c.gritLifetime * 0.5 * g.particleLifetime;
    this.grit.uniforms.uSpeedScale.value = g.particleSpeed;
    this.grit.uniforms.uOpacity.value = g.opacity;
  }

  /** The wind: HELIX ribbons wound around exactly the cone the shards ride. */
  _syncStrands(open, fade) {
    const c = this.config;
    const bundle = this.strands;

    bundle.setCount(Math.min(MAX_STRANDS, Math.round(c.strands)));
    bundle.setVisible(fade > 0.004);
    if (bundle.count <= 0) return;

    bundle.set('uOrigin', this._centre);
    bundle.set('uForward', this.direction);
    bundle.set('uSideAxis', this.side);
    bundle.set('uAge', this.age);
    bundle.set('uProgress', 1);
    bundle.set('uFade', fade);

    bundle.set('uRadius', this.radius);
    bundle.set('uHeight', Math.max(0.05, c.funnelHeight) * open);
    bundle.set('uBase', c.funnelBase);
    bundle.set('uTop', c.funnelTop);
    bundle.set('uCurve', Math.max(0.05, c.funnelCurve));
    bundle.set('uLean', c.funnelLean);
    bundle.set('uTurns', c.strandTurns);
    bundle.set('uSpin', c.spinFalloff);
    bundle.set('uSpeed', c.strandSpeed);
    bundle.set('uJitter', c.strandJitter * settings.global.randomness);
    bundle.set('uJitterScale', 2.6);
    bundle.set('uCrawl', 1.2);

    const look = this._look;
    look.core = getColor(c.colorStrandCore);
    look.edge = getColor(c.colorStrandEdge);
    look.halo = getColor(c.colorStrandHalo);
    look.width = c.strandWidth;
    look.glow = c.strandGlow * settings.global.glow;
    look.opacity = settings.global.opacity;
    look.dim = c.strandDim;
    bundle.syncLook(look);
  }

  /** The puff at the caster's hand as the front leaves it. */

  /**
   * What the standing cone sheds: haze off its wall, glints riding the wind up,
   * chips thrown out over the rim, and pressure rings across the floor.
   */

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
    this._centrePoint(_pos);

    /* the shell of displaced air the cone throws off as it stands up */
    _pos.y = 0.5;
    this.ctx.bursts.spawn(this.isCrystal ? BurstMode.FROST : BurstMode.EARTH, _pos, {
      radius: c.burstSize * 0.25,
      endRadius: c.burstSize * g.explosionIntensity,
      life: 0.8,
      intensity: c.burstIntensity,
      opacity: 0.7,
      fresnel: 1.5,
      displace: 0.6,
      squash: 0.6,
      colorA: getColor(c.colorBurstA),
      colorB: getColor(c.colorBurstB),
      colorC: getColor(c.colorBurstC)
    });

    /* and the ring that snaps outward across the floor with it */
    this._centrePoint(_pos);
    this.ctx.decals.spawn(DecalType.SHOCKWAVE, _pos, {
      radius: c.shockRadius * g.explosionIntensity,
      life: 0.75,
      width: 0.05,
      intensity: 1.0,
      colorA: getColor(c.colorShockA),
      colorB: getColor(c.colorShockB)
    });

    /* the throat scours the floor as it bites */
    _emit.position = _pos;
    _emit.radius = this.radius * 0.45;
    _emit.direction = _dir.set(0, 1, 0);
    _emit.speed = c.gritSpeed * 1.9;
    _emit.speedVariance = 0.85;
    _emit.spread = 0.9;
    _emit.inherit = null;
    _emit.anchor = null;
    _emit.size = 0.14;
    _emit.sizeVariance = 0.8;
    _emit.life = c.gritLifetime * 1.3;
    _emit.lifeVariance = 0.5;
    _emit.spin = 10;
    _emit.tint = null;
    _emit.time = frame.uTime.value;
    this.grit.emit(Math.round(120 * g.particleCount), _emit);

    _emit.radius = this.radius * 0.8;
    _emit.speed = c.dustSpeed * 2.4;
    _emit.spread = 1.0;
    _emit.size = 1.4;
    _emit.life = c.dustLifetime * 1.2;
    _emit.spin = 0.5;
    this.dust.emit(Math.round(90 * g.particleCount), _emit);

    this.ctx.shake.add(
      c.impactShake * g.explosionIntensity * g.cameraShake,
      1 / Math.max(0.1, c.shakeDuration),
      22
    );
    this.ctx.flash.trigger(getColor(c.colorFlash), c.impactFlash * g.explosionIntensity);
    this.lightBoost = c.lightIntensity * 1.2 * g.explosionIntensity;
  }

  onFade(dt, t) {
    const c = this.config;
    this._openTime += dt;

    // `t` runs 0..1 while the cone stands, then 1..2 while it spins down. Quad
    // on the way out: the debris drops rather than dissolving.
    const fade = t <= 1 ? 1 : 1 - Easing.inQuad(saturate(t - 1));
    this._sync(fade);

    // The light climbs into the column and stays there.
    this.position.copy(this._centre);
    this.position.y = c.funnelHeight * saturate(c.lightHeight) * this._openAmount();

    this._fieldFx(dt, fade * (t <= 1 ? 1 : 0.35));
    this.ctx.shake.rumble(c.holdShake * fade * settings.global.cameraShake, dt);
  }

  onDestroy() {
    this._activeCount = 0;
    this.cloud.clear();
    this.strands.setVisible(false);
    this.field.setVisible(false);
    this.columnMesh.visible = false;
    this.column.clear();
  }

  dispose() {
    this.cloud.dispose();
    this.strands.dispose();
    this.field.dispose();
    this.column.dispose();
    this.columnMaterial.dispose();
    this.shardMaterial.dispose();
    super.dispose();
  }
}

/** Fully grown, never shattered — the crystal material's per-instance state. */
const CRYSTAL_EXTRAS = [1, 0];
/** Barely warm: these are chips in a storm, not something that has re-entered. */
const ROCK_EXTRAS = [0.12];

/**
 * The emission half of this engine lives in `cyclone-fx.js`.
 *
 * CycloneAbility was past the 800-line rule in `AGENTS.md`. The bodies did not
 * change — they are still methods on this prototype, reached through `this` and
 * free to call the ones that stayed here. Splitting them off is the only reason
 * the file is two files.
 */
Object.assign(CycloneAbility.prototype, cycloneFx);
