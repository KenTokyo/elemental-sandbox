import { Mesh, Vector3, Quaternion } from 'three';
import { Ability, AbilityPhase } from './Ability.js';
import { ShardCloud } from './support/ShardCloud.js';
import { createMeteorMaterial } from '../materials/MeteorMaterial.js';
import { VolumetricFireMaterial, fireHullReach } from '../materials/VolumetricFireMaterial.js';
import { RibbonGeometry, RibbonMode } from '../effects/RibbonGeometry.js';
import { createAsteroidGeometry } from '../assets/ProceduralGeometry.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { RateEmitter } from '../particles/ParticleEngine.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER } from '../core/Layers.js';
import { frame } from '../core/FrameUniforms.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';
import { saturate, lerp, Easing, randRange } from '../utils/math.js';

/** Hard ceilings. The editor's `basaltCount` / `jets` / `riftNodes` clamp here. */
const MAX_BASALT = 150;
const MAX_JETS = 6;
const MAX_NODES = 8;
const VARIANTS = 3;
const SLOTS = Math.ceil(MAX_BASALT / VARIANTS);
/** Samples along one jet's proxy hull. */
const JET_NODES = 10;

const TAU = Math.PI * 2;

const _emit = {};
const _pos = new Vector3();
const _dir = new Vector3();
const _quat = new Quaternion();
const _up = new Vector3(0, 1, 0);

/**
 * MAGMA RIFT — the floor torn open along the aimed line.
 *
 * The only signature in the library that works *downward*. Everything else in
 * the twenty puts something into the air; this one takes the ground away and
 * lets what is underneath come up through the gap. Three layers, in the order
 * they arrive:
 *
 *   1. **the tear** — crack networks from `effects/GroundFissures.js`, laid down
 *      one node at a time as the front walks the line. They are the project's
 *      existing system, re-aimed: the Cinder Fall spawns one at its impact, this
 *      one spawns a chain of them and the chain *is* the ability's silhouette.
 *   2. **the basalt** — chunks of floor heaved up along both lips, sinking back
 *      as the tear closes. Solid, shadow-casting geometry, so the rift has a
 *      real edge instead of a painted one.
 *   3. **the jets** — standing columns of raymarched flame in the gap, lighting
 *      on a stagger behind the front.
 *
 * Each jet owns its own `VolumetricFireMaterial`. That is the expensive decision
 * in this file and it is deliberate: one shared material would give every column
 * the same seed, and four identical flames in a row down a straight line read as
 * a repeated sprite immediately. `MAX_JETS` is capped at six for that reason.
 *
 * **The rule that makes the editor work.** A node captures the age it was torn
 * at; a basalt chunk captures dice. Where the tear runs, how wide the lips are,
 * how tall the jets stand and how long they burn are all resolved from
 * `settings[element]` every frame.
 */
export class RiftAbility extends Ability {
  constructor(context, element = 'magma') {
    super(element, context);
  }

  /* ------------------------------------------------------------------ */
  /* Construction                                                        */
  /* ------------------------------------------------------------------ */

  createShaders() {
    this.rockMaterial = createMeteorMaterial(this.ctx.environment, this.element);

    this.cloud = new ShardCloud({
      parent: this.group,
      material: this.rockMaterial,
      extras: ['aHeat'],
      slots: SLOTS,
      variants: VARIANTS,
      shadows: true,
      layer: LAYER.WORLD,
      build: (variant) =>
        createAsteroidGeometry({
          seed: 21.3 + variant * 9.7,
          detail: 1,
          lumpiness: this.config.lumpiness,
          noiseScale: this.config.lumpScale,
          roughness: this.config.surfaceRoughness,
          cuts: this.config.cuts,
          cutDepth: this.config.cutDepth,
          craters: 0, // quarried, not impacted: these came off a floor
          craterDepth: 0,
          craterSize: 0
        }),
      shapeKey: () => {
        const c = this.config;
        return `${c.lumpiness.toFixed(3)}|${c.surfaceRoughness.toFixed(3)}|${Math.round(c.cuts)}`;
      }
    });

    /* ---- the standing flame ---- */
    this.jets = [];
    for (let i = 0; i < MAX_JETS; i++) {
      const ribbon = new RibbonGeometry(JET_NODES + 2, { frame: true });
      const material = new VolumetricFireMaterial(this.element);
      // Its own seed, so no two columns burn in step. This is the whole reason
      // the jets are not one shared material.
      material.uniforms.uSeed.value = Math.random() * 20;
      const mesh = new Mesh(ribbon.geometry, material);
      mesh.frustumCulled = false;
      mesh.matrixAutoUpdate = false;
      mesh.layers.set(LAYER.VFX);
      mesh.renderOrder = 11;
      mesh.visible = false;
      this.group.add(mesh);

      const points = [];
      for (let p = 0; p < JET_NODES + 2; p++) points.push(new Vector3());

      this.jets.push({ ribbon, material, mesh, points, s: 0, litAt: -1 });
    }

    this.records = [];
    for (let i = 0; i < MAX_BASALT; i++) {
      this.records.push({
        along: 0, // 0..1 down the line
        side: 0, // -1..1 across it
        lift: 0, // -1..1 height jitter
        scale: 0, // -1..1 size jitter
        yaw: 0,
        pitch: 0,
        stagger: 0, // 0..1 of the heave delay
        heavedAt: -1 // absolute age the floor gave way under it, or -1
      });
    }

    /** Nodes of the tear, and the age each was opened at. */
    this.nodes = new Float32Array(MAX_NODES).fill(-1);

    this._activeCount = 0;
    this._nodeCount = 0;
    this._seed = 0;
    /** Seconds since the front reached the end. Drives the burn-down. */
    this._holdTime = 0;
  }

  createParticles() {
    const particles = this.ctx.particles;

    this.embers = particles.get('rift.embers', {
      capacity: 4000,
      shape: ParticleShape.SOFT,
      additive: true,
      curl: true,
      softFade: 0.4
    });
    this.embers.uniforms.uDrag.value = 1.0;
    this.embers.uniforms.uEndSize.value = 0.12;
    this.embers.uniforms.uSizeIn.value = 0.05;
    this.embers.uniforms.uFadeIn.value = 0.07;
    this.embers.uniforms.uFadeOut.value = 0.4;

    this.sparks = particles.get('rift.sparks', {
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

    this.smoke = particles.get('rift.smoke', {
      capacity: 2600,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 1.1
    });
    this.smoke.uniforms.uDrag.value = 1.8;
    this.smoke.uniforms.uEndSize.value = 3.4;
    this.smoke.uniforms.uSizeIn.value = 0.12;
    this.smoke.uniforms.uFadeIn.value = 0.18;
    this.smoke.uniforms.uFadeOut.value = 0.3;

    this.emberEmitter = new RateEmitter();
    this.sparkEmitter = new RateEmitter();
    this.smokeEmitter = new RateEmitter();
  }

  /* ------------------------------------------------------------------ */
  /* Timing                                                              */
  /* ------------------------------------------------------------------ */

  get instanceCount() {
    return this.cloud.count + this._litJets();
  }

  get impactDuration() {
    return Math.max(0.2, this.config.lifetime * settings.global.lifetime);
  }

  get fadeDuration() {
    return Math.max(0.2, this.config.fadeTime);
  }

  /** A rift gutters — the light is a fire's, not a crystal's. */
  lightShimmer() {
    const c = this.config;
    const step = Math.floor(this.age * Math.max(1, c.lightFlickerSpeed));
    const noise = Math.abs(Math.sin(step * 91.7) * 43758.5453) % 1;
    return 1 - saturate(c.lightFlicker) * noise;
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

  /** How far along the line node `i` sits, 0..1. */
  _nodeAt(i, count) {
    return count <= 1 ? 1 : (i + 0.5) / count;
  }

  _litJets() {
    let total = 0;
    for (const jet of this.jets) if (jet.mesh.visible) total++;
    return total;
  }

  /* ------------------------------------------------------------------ */
  /* The tear                                                            */
  /* ------------------------------------------------------------------ */

  /**
   * Open any node the front has now reached.
   *
   * The chain is paid out against the front's *position*, not against a timer,
   * so slowing the cast down with `speed` spreads the tear out rather than
   * compressing it — the eye reads the crack racing ahead of itself either way.
   */
  _openNodes() {
    const c = this.config;
    const g = settings.global;

    for (let i = 0; i < this._nodeCount; i++) {
      if (this.nodes[i] >= 0) continue;
      const s = this._nodeAt(i, this._nodeCount);
      if (this.u < s) continue;

      this.nodes[i] = this.age + i * c.riftStagger;
      this.pointAt(s, _pos);
      _pos.x += this.side.x * randRange(-c.riftSpread, c.riftSpread);
      _pos.z += this.side.z * randRange(-c.riftSpread, c.riftSpread);

      this.ctx.fissures.spawn(_pos, {
        element: this.element,
        radius: c.riftRadius,
        life: c.fissureLife
      });

      this.ctx.decals.spawn(DecalType.SCORCH, _pos, {
        radius: c.scorchRadius * randRange(0.8, 1.2),
        life: c.scorchLife,
        intensity: c.scorchIntensity,
        colorA: getColor(c.colorScorch),
        colorB: getColor(c.colorCrack),
        height: 0.014
      });

      // Each node is a small, real event: the floor gives way, chips fly.
      _emit.position = _pos;
      _emit.radius = c.riftRadius * 0.4;
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = c.sparkSpeed * 1.3;
      _emit.speedVariance = 0.85;
      _emit.spread = 0.85;
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.18;
      _emit.sizeVariance = 0.8;
      _emit.life = c.sparkLifetime;
      _emit.lifeVariance = 0.5;
      _emit.spin = 0;
      _emit.tint = null;
      _emit.time = frame.uTime.value;
      this.sparks.emit(Math.round(50 * g.particleCount), _emit);

      this.lightBoost = Math.max(this.lightBoost, c.lightIntensity * 0.35 * g.explosionIntensity);
    }
  }

  /**
   * Heave the basalt up out of the lips, and drop it back as the tear closes.
   *
   * A chunk goes up the moment the front passes over it, plus its own stagger.
   * Nothing is captured but that timestamp — the lateral spread, the size and
   * the sink are all live.
   */
  _updateBasalt(fade) {
    const c = this.config;
    const g = settings.global;
    const sink = this.phase === AbilityPhase.FADE
      ? Easing.inCubic(saturate(this.fadeTime / Math.max(0.05, c.basaltSink)))
      : 0;

    this.cloud.syncShape();
    this.cloud.begin();

    for (let i = 0; i < this._activeCount; i++) {
      const record = this.records[i];

      if (record.heavedAt < 0) {
        if (this.u < record.along) continue;
        record.heavedAt = this.age + record.stagger * c.riftStagger * 2;
      }
      const elapsed = this.age - record.heavedAt;
      if (elapsed < 0) continue;

      const rise = Easing.outBack(saturate(elapsed / Math.max(0.02, c.basaltRise)));
      const size =
        Math.max(0.01, c.basaltScale) * (1 + record.scale * 0.6 * g.randomness) * fade;

      // Banked along the lips: the chunks sit *beside* the tear, not in it, so
      // the gap in the middle stays readable.
      const across = record.side * c.basaltSpread * c.riftRadius;
      this.pointAt(record.along, _pos);
      _pos.x += this.side.x * across;
      _pos.z += this.side.z * across;
      _pos.y = (rise - 1) * size * 1.6 + record.lift * size * 0.3 - sink * (size * 2.4 + 0.3);

      // Tipped away from the tear, as ground pushed up from underneath is.
      _dir
        .set(this.side.x * record.side, 0, this.side.z * record.side)
        .normalize()
        .multiplyScalar(Math.sin(c.basaltLean))
        .setY(Math.cos(c.basaltLean))
        .normalize();
      _quat.setFromUnitVectors(_up, _dir);

      // Hot where it was torn, cooling as the rift dies.
      const heat = saturate(1 - elapsed / Math.max(0.3, c.lifetime)) * (1 - sink);
      this.cloud.push(_pos, _quat, size, 0, [heat]);
    }

    this.cloud.end();
  }

  /**
   * Rebuild the proxy hulls the jets are raymarched inside.
   *
   * One straight, raked centre line per jet. The hull only has to *contain* the
   * density field: it is padded at both ends by the reach the shred can push
   * density out to, exactly as the Cinder Fall's trail is.
   */
  _updateJets(fade) {
    const c = this.config;
    const wanted = Math.min(MAX_JETS, Math.max(0, Math.round(c.jets)));
    const reach = fireHullReach(this.element);

    for (const [index, jet] of this.jets.entries()) {
      if (index >= wanted) {
        jet.mesh.visible = false;
        jet.ribbon.clear();
        continue;
      }

      // Lit on a stagger behind the front, and burning for `jetLife` after the
      // tear stops growing.
      const s = this._nodeAt(index, wanted);
      jet.s = s;
      if (jet.litAt < 0) {
        if (this.u < s) {
          jet.mesh.visible = false;
          jet.ribbon.clear();
          continue;
        }
        jet.litAt = this.age + index * c.jetStagger;
      }
      const elapsed = this.age - jet.litAt;
      if (elapsed < 0) {
        jet.mesh.visible = false;
        jet.ribbon.clear();
        continue;
      }

      // Grows fast, then burns down over `jetLife` once the hold is over.
      const grow = Easing.outCubic(saturate(elapsed / 0.28));
      const burn =
        this.phase === AbilityPhase.FADE
          ? saturate(this.fadeTime / Math.max(0.05, c.jetLife))
          : 0;
      const alive = fade * (1 - burn);
      const height = Math.max(0.05, c.jetHeight) * grow * (1 - burn * 0.7);

      if (alive < 0.01 || height < 0.3) {
        jet.mesh.visible = false;
        jet.ribbon.clear();
        continue;
      }

      const radius = Math.max(0.03, c.jetWidth * (1 - burn * 0.55));
      const pad = radius * reach;
      const count = JET_NODES;

      this.pointAt(s, _pos).setY(0);
      jet.points[0].set(_pos.x, -pad, _pos.z);
      for (let i = 0; i < count; i++) {
        const y = (i / (count - 1)) * height;
        jet.points[i + 1].set(
          _pos.x + this.direction.x * c.jetLean * y,
          y,
          _pos.z + this.direction.z * c.jetLean * y
        );
      }
      jet.points[count + 1]
        .copy(jet.points[count])
        .addScaledVector(this.direction, c.jetLean * pad)
        .setY(jet.points[count].y + pad);

      jet.material.sync();
      const u = jet.material.uniforms;
      u.uRadius.value = radius;
      u.uStreamLength.value = height;
      u.uArcLength.value = height + pad * 2;
      u.uTailPad.value = pad;
      u.uOpacity.value = c.trailOpacity * alive * settings.global.opacity;

      const cover = 1.1 * reach * Math.max(1, c.trailPlume);
      jet.ribbon.build(jet.points, {
        count: count + 2,
        width: 2 * radius * c.trailHeadSize * cover,
        mode: RibbonMode.BILLBOARD,
        cameraPosition: this.ctx.camera.position
      });
      jet.mesh.visible = true;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Casting                                                             */
  /* ------------------------------------------------------------------ */

  onSpawn() {
    const c = this.config;

    this.emberEmitter.reset();
    this.sparkEmitter.reset();
    this.smokeEmitter.reset();

    this._holdTime = 0;
    this._seed = Math.random() * 100;
    this.nodes.fill(-1);
    this._nodeCount = Math.min(MAX_NODES, Math.max(1, Math.round(c.riftNodes)));

    for (const jet of this.jets) {
      jet.litAt = -1;
      jet.mesh.visible = false;
      jet.ribbon.clear();
    }

    this._activeCount = Math.min(MAX_BASALT, Math.max(0, Math.round(c.basaltCount)));
    for (let i = 0; i < this._activeCount; i++) {
      const record = this.records[i];
      record.along = Math.random();
      // Two banks with a gap in the middle: `sign × (0.35 … 1)`, so nothing is
      // ever planted in the tear itself.
      record.side = (Math.random() < 0.5 ? -1 : 1) * randRange(0.35, 1);
      record.lift = randRange(-1, 1);
      record.scale = randRange(-1, 1);
      record.yaw = Math.random() * TAU;
      record.pitch = randRange(-0.4, 0.4);
      record.stagger = Math.random();
      record.heavedAt = -1;
    }

    this.cloud.clear();
    this._sync(1);
    this._muzzleFx();
  }

  /* ------------------------------------------------------------------ */
  /* Feedback                                                            */
  /* ------------------------------------------------------------------ */

  _sync(fade) {
    const c = this.config;
    const g = settings.global;

    this.rockMaterial.userData.sync(0, this.direction);
    this._updateBasalt(fade);
    this._updateJets(fade);

    this.embers.setGradient(
      getColor(c.colorEmberA),
      getColor(c.colorEmberB),
      getColor(c.colorEmberC),
      getColor(c.colorEmberD)
    );
    this.embers.uniforms.uGravity.value.set(0, c.emberRise, 0);
    this.embers.uniforms.uSizeScale.value = c.emberSize * g.particleSize * 7;
    this.embers.uniforms.uLifeScale.value = c.emberLifetime * 0.5 * g.particleLifetime;
    this.embers.uniforms.uSpeedScale.value = g.particleSpeed;
    this.embers.uniforms.uOpacity.value = g.opacity;
    this.embers.uniforms.uGlow.value = c.emberGlow * g.glow;
    this.embers.uniforms.uTurbulence.value = c.emberTurbulence * g.turbulence;

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
    this.smoke.uniforms.uTurbulence.value = 0.4 * g.turbulence;
  }

  _muzzleFx() {
    const c = this.config;
    const g = settings.global;

    this._handPoint(_pos);
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

    this.ctx.flash.trigger(getColor(c.colorCastFlash), c.castFlash * g.explosionIntensity);
    this.lightBoost = c.lightIntensity * 0.4 * g.explosionIntensity;
  }

  /** What the open tear sheds along its whole length. */
  _riftFx(dt, scale) {
    const c = this.config;
    const g = settings.global;
    const time = frame.uTime.value;
    // Only the part of the line that has actually been torn open may shed.
    const reach = this.phase === AbilityPhase.TRAVEL ? Math.max(0.02, this.u) : 1;

    const emberCount = Math.round(this.emberEmitter.tick(dt, c.emberRate * scale) * g.particleCount);
    if (emberCount > 0) {
      this.pointAt(Math.random() * reach, _pos).setY(0.1);
      _emit.position = _pos;
      _emit.radius = c.riftRadius * 0.5;
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = c.emberSpeed;
      _emit.speedVariance = 0.8;
      _emit.spread = 0.6;
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.1;
      _emit.sizeVariance = 0.6;
      _emit.life = c.emberLifetime;
      _emit.lifeVariance = 0.5;
      _emit.spin = 0;
      _emit.tint = null;
      _emit.time = time;
      this.embers.emit(emberCount, _emit);
    }

    const sparkCount = Math.round(this.sparkEmitter.tick(dt, c.sparkRate * scale) * g.particleCount);
    if (sparkCount > 0) {
      this.pointAt(Math.random() * reach, _pos).setY(0.15);
      _emit.position = _pos;
      _emit.radius = c.riftRadius * 0.35;
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = c.sparkSpeed;
      _emit.speedVariance = 0.85;
      _emit.spread = 0.7;
      _emit.size = 0.15;
      _emit.sizeVariance = 0.7;
      _emit.life = c.sparkLifetime;
      _emit.lifeVariance = 0.55;
      _emit.spin = 0;
      _emit.time = time;
      this.sparks.emit(sparkCount, _emit);
    }

    const smokeCount = Math.round(this.smokeEmitter.tick(dt, c.smokeRate * scale) * g.particleCount);
    if (smokeCount > 0) {
      this.pointAt(Math.random() * reach, _pos).setY(0.2);
      _emit.position = _pos;
      _emit.radius = c.riftRadius * 0.8;
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = c.smokeSpeed;
      _emit.speedVariance = 0.7;
      _emit.spread = 0.75;
      _emit.size = 1.1;
      _emit.sizeVariance = 0.5;
      _emit.life = c.smokeLifetime;
      _emit.lifeVariance = 0.4;
      _emit.spin = 0.4;
      _emit.time = time;
      this.smoke.emit(smokeCount, _emit);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Phases                                                              */
  /* ------------------------------------------------------------------ */

  onTravel(dt) {
    this._openNodes();
    this._sync(1);

    // The light rides the head of the tear, just off the floor.
    this.position.y = 0.4;

    this._riftFx(dt, 1);
    this.ctx.shake.rumble(this.config.rumble * settings.global.cameraShake, dt);
  }

  onImpact() {
    const c = this.config;
    const g = settings.global;

    this._holdTime = 0;
    this._openNodes(); // anything the last frame's step jumped over
    this.pointAt(1, _pos).setY(0.4);

    this.ctx.bursts.spawn(BurstMode.FIRE, _pos, {
      radius: c.burstSize * 0.22,
      endRadius: c.burstSize * g.explosionIntensity,
      life: 0.8,
      intensity: c.burstIntensity,
      opacity: 0.9,
      fresnel: 1.3,
      displace: 0.6,
      squash: 0.7,
      colorA: getColor(c.colorHot),
      colorB: getColor(c.colorFlameMid),
      colorC: getColor(c.colorFlameEdge)
    });

    this.pointAt(1, _pos).setY(0);
    this.ctx.decals.spawn(DecalType.SHOCKWAVE, _pos, {
      radius: c.shockRadius * g.explosionIntensity,
      life: 0.7,
      width: 0.05,
      intensity: 1.0,
      colorA: getColor(c.colorShockA),
      colorB: getColor(c.colorShockB)
    });

    _emit.position = _pos;
    _emit.radius = c.riftRadius * 0.7;
    _emit.direction = _dir.set(0, 1, 0);
    _emit.speed = c.emberSpeed * 1.8;
    _emit.speedVariance = 0.85;
    _emit.spread = 0.9;
    _emit.inherit = null;
    _emit.anchor = null;
    _emit.size = 0.13;
    _emit.sizeVariance = 0.7;
    _emit.life = c.emberLifetime * 1.4;
    _emit.lifeVariance = 0.5;
    _emit.spin = 0;
    _emit.tint = null;
    _emit.time = frame.uTime.value;
    this.embers.emit(Math.round(c.burstEmbers * g.particleCount), _emit);

    _emit.speed = c.smokeSpeed * 2.2;
    _emit.spread = 1.0;
    _emit.size = 1.5;
    _emit.life = c.smokeLifetime * 1.2;
    _emit.spin = 0.5;
    this.smoke.emit(Math.round(c.burstSmoke * g.particleCount), _emit);

    this.ctx.shake.add(
      c.impactShake * g.explosionIntensity * g.cameraShake,
      1 / Math.max(0.1, c.shakeDuration),
      18
    );
    this.ctx.flash.trigger(getColor(c.colorFlash), c.impactFlash * g.explosionIntensity);
    this.lightBoost = c.lightIntensity * 1.2 * g.explosionIntensity;
  }

  onFade(dt, t) {
    const c = this.config;
    this._holdTime += dt;

    const fade = t <= 1 ? 1 : 1 - Easing.inQuad(saturate(t - 1));
    this._sync(fade);

    // The light walks up and down the open tear rather than sitting at one end:
    // a five-node rift lit from its far tip reads as a single fire.
    const s = 0.5 + 0.4 * Math.sin(this.age * 0.7);
    this.pointAt(s, this.position).setY(c.jetHeight * 0.22);

    this._riftFx(dt, fade);
    this.ctx.shake.rumble(c.rumble * fade * settings.global.cameraShake, dt);
  }

  onDestroy() {
    this._activeCount = 0;
    this.cloud.clear();
    for (const jet of this.jets) {
      jet.mesh.visible = false;
      jet.ribbon.clear();
      jet.litAt = -1;
    }
  }

  dispose() {
    this.cloud.dispose();
    for (const jet of this.jets) {
      jet.ribbon.dispose();
      jet.material.dispose();
    }
    this.rockMaterial.dispose();
    super.dispose();
  }
}
