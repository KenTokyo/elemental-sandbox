import { Mesh, IcosahedronGeometry, PlaneGeometry, CylinderGeometry, Vector3, Quaternion } from 'three';
import { Ability, AbilityPhase } from './Ability.js';
import { ShardCloud } from './support/ShardCloud.js';
import { createShellMaterial, ShellMode } from '../materials/ShellMaterial.js';
import { createGlacierMaterial } from '../materials/GlacierMaterial.js';
import { createFrostFieldMaterial, createFrostVeilMaterial } from '../materials/FrostFieldMaterial.js';
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

/** Hard ceiling on blades in the rim. The editor's `rimShards` clamps here. */
const MAX_SHARDS = 180;
const VARIANTS = 3;
const SLOTS = Math.ceil(MAX_SHARDS / VARIANTS);

const TAU = Math.PI * 2;

const _emit = {};
const _pos = new Vector3();
const _dir = new Vector3();
const _scale = new Vector3();
const _quat = new Quaternion();
const _up = new Vector3(0, 1, 0);

/**
 * ABSOLUTE ZERO — the library's one *dome*, and its quietest cast.
 *
 * Cold runs out along the floor, the air over the footprint freezes into a shell
 * and everything inside it stops. Almost nothing moves for the whole of the
 * hold: no orbit, no rhythm, no re-strike — the shell crystallises, the rim of
 * blades stands, and that is the entire second act. It is the deliberate
 * counterweight to Plasma Bloom, which does the opposite with the same footprint.
 *
 * The resolution is where the ability spends its budget. `ShellMaterial`'s
 * FROST_DOME body carries a voronoi cell field, and the fade walks a threshold
 * across it, so the shell comes apart **one plate at a time** — each cell
 * flaring as its edge is crossed and then going — rather than dimming as a whole.
 * That is what `domeShatter` buys, and it is why the shell is a shaded surface
 * rather than a particle system.
 *
 * **The rule that makes the editor work.** A blade record holds a bearing and
 * two jitters; the shell holds nothing at all. Radius, squash, plate density and
 * the rim's seat are read from `settings[element]` every frame, so dragging
 * `domeSquash` re-bells a shell that is already standing, with the clock stopped.
 */
export class DomeAbility extends Ability {
  constructor(context, element = 'zero') {
    super(element, context);
  }

  /* ------------------------------------------------------------------ */
  /* Construction                                                        */
  /* ------------------------------------------------------------------ */

  createShaders() {
    /* ---- the shell ---- */
    this.domeGeometry = new IcosahedronGeometry(1, 4);
    this.domeMaterial = createShellMaterial(ShellMode.FROST_DOME);
    this.dome = new Mesh(this.domeGeometry, this.domeMaterial);
    this.dome.name = 'FrostDome';
    this.dome.frustumCulled = false;
    this.dome.layers.set(LAYER.VFX);
    this.dome.renderOrder = 10;
    this.dome.visible = false;
    this.group.add(this.dome);

    /* ---- the ring of blades it is seated on ---- */
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
          seed: 8.9 + variant * 12.7,
          sides: this.config.facets,
          taper: this.config.taper,
          roughness: this.config.roughness,
          bend: this.config.bend
        }),
      shapeKey: () => {
        const c = this.config;
        return `${Math.round(c.facets)}|${c.taper.toFixed(3)}|${c.roughness.toFixed(3)}|${c.bend.toFixed(3)}`;
      }
    });

    /* ---- the sheet of ice under it ---- */
    this.fieldGeometry = new PlaneGeometry(1, 1, 1, 1).rotateX(-Math.PI / 2);
    this.fieldMaterial = createFrostFieldMaterial(this.element);
    this.field = new Mesh(this.fieldGeometry, this.fieldMaterial);
    this.field.name = 'ZeroField';
    this.field.layers.set(LAYER.VFX);
    this.field.renderOrder = 7;
    this.field.frustumCulled = false;
    this.field.visible = false;
    this.group.add(this.field);

    /* ---- the curtain of cold standing on the boundary ---- */
    this.veilGeometry = new CylinderGeometry(1, 1, 1, 72, 12, true);
    this.veilMaterial = createFrostVeilMaterial(this.element);
    this.veil = new Mesh(this.veilGeometry, this.veilMaterial);
    this.veil.name = 'ZeroVeil';
    this.veil.layers.set(LAYER.VFX);
    this.veil.renderOrder = 9;
    this.veil.frustumCulled = false;
    this.veil.visible = false;
    this.group.add(this.veil);

    this.records = [];
    for (let i = 0; i < MAX_SHARDS; i++) {
      this.records.push({ bearing: 0, seat: 0, scale: 0, lean: 0, stagger: 0 });
    }

    this._activeCount = 0;
    this._seed = 0;
    this._openTime = 0;
    this._frostDistance = 0;
    this._centre = new Vector3();
    this._fieldState = { radius: 1, quadSize: 1, freeze: 0, fade: 1, seed: 0 };
    this._veilState = { fade: 1, seed: 0 };
  }

  createParticles() {
    const particles = this.ctx.particles;

    this.mist = particles.get('zero.mist', {
      capacity: 4000,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 1.2
    });
    this.mist.uniforms.uDrag.value = 2.2;
    this.mist.uniforms.uEndSize.value = 3.8;
    this.mist.uniforms.uSizeIn.value = 0.1;
    this.mist.uniforms.uFadeIn.value = 0.16;
    this.mist.uniforms.uFadeOut.value = 0.26;

    this.snow = particles.get('zero.snow', {
      capacity: 3000,
      shape: ParticleShape.SOFT,
      additive: true,
      curl: true,
      softFade: 0.5
    });
    this.snow.uniforms.uDrag.value = 1.7;
    this.snow.uniforms.uEndSize.value = 0.5;
    this.snow.uniforms.uSizeIn.value = 0.08;
    this.snow.uniforms.uFadeIn.value = 0.14;
    this.snow.uniforms.uFadeOut.value = 0.5;

    this.glitter = particles.get('zero.glitter', {
      capacity: 2400,
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

    this.shards = particles.get('zero.shards', {
      capacity: 2600,
      shape: ParticleShape.CHIP,
      additive: false,
      lit: true,
      softFade: 0.25
    });
    this.shards.uniforms.uDrag.value = 0.2;
    this.shards.uniforms.uEndSize.value = 0.8;
    this.shards.uniforms.uFadeOut.value = 0.74;

    this.mistEmitter = new RateEmitter();
    this.snowEmitter = new RateEmitter();
    this.glitterEmitter = new RateEmitter();
    this.rimeEmitter = new RateEmitter();
    this.ringEmitter = new RateEmitter();
  }

  /* ------------------------------------------------------------------ */
  /* Timing                                                              */
  /* ------------------------------------------------------------------ */

  get instanceCount() {
    return this.cloud.count + 1;
  }

  get impactDuration() {
    return Math.max(0.2, this.config.lifetime * settings.global.lifetime);
  }

  get fadeDuration() {
    return Math.max(0.2, this.config.fadeTime);
  }

  get radius() {
    return Math.max(0.05, this.config.zoneRadius);
  }

  /** The dome barely moves — a long, slow breath rather than a shimmer. */
  lightShimmer() {
    return 0.94 + 0.06 * Math.sin(this.age * 1.3);
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

  /** How far the shell has closed over the footprint, 0..1. */
  _riseAmount() {
    return Easing.outCubic(saturate(this._openTime / Math.max(0.02, this.config.domeRise)));
  }

  /**
   * How far the shell has come apart, 0..1.
   *
   * Zero for the whole hold, then walked across the plate field over the first
   * `domeShatter` of the fade — the shell breaks up and *then* what is left of
   * it goes, which is what stops the resolution reading as a dissolve.
   */
  _dissolveAmount(t) {
    if (t <= 1) return 0;
    return saturate((t - 1) / Math.max(0.05, this.config.domeShatter));
  }

  /* ------------------------------------------------------------------ */
  /* The rim                                                             */
  /* ------------------------------------------------------------------ */

  _updateRim(open, fade) {
    const c = this.config;
    const g = settings.global;
    const centre = this._centre;
    const R = this.radius;

    this.cloud.syncShape();
    this.cloud.begin();

    for (let i = 0; i < this._activeCount; i++) {
      const record = this.records[i];

      // The rim closes as a ring, not a sweep: this ability has no direction and
      // giving it one would import the Glacial Crown's read.
      const arrived = saturate((open - record.stagger * 0.35) / 0.3);
      if (arrived <= 0.001) continue;

      const seat = R * (c.rimSeat + record.seat * c.rimScatter);
      const cos = Math.cos(record.bearing);
      const sin = Math.sin(record.bearing);
      _pos.set(centre.x + cos * seat, 0, centre.z + sin * seat);

      // Leaning outward, away from the shell, so the blades frame it instead of
      // pushing through it.
      _dir.set(cos * Math.sin(c.rimLean), Math.cos(c.rimLean), sin * Math.sin(c.rimLean)).normalize();
      _quat.setFromUnitVectors(_up, _dir);

      const size =
        Math.max(0.01, c.radius * c.rimShardScale) *
        (1 + record.scale * c.radiusJitter * g.randomness) *
        Easing.outBack(arrived) *
        fade;

      _pos.y = -size * 0.4 * (1 - arrived);
      this.cloud.push(_pos, _quat, _scale.set(size, size * 3.4, size), 1 - arrived, RIM_EXTRAS);
    }

    this.cloud.end();
  }

  /* ------------------------------------------------------------------ */
  /* Casting                                                             */
  /* ------------------------------------------------------------------ */

  onSpawn() {
    const c = this.config;

    this.mistEmitter.reset();
    this.snowEmitter.reset();
    this.glitterEmitter.reset();
    this.rimeEmitter.reset();
    this.ringEmitter.reset();

    this._openTime = 0;
    this._frostDistance = 0;
    this._seed = Math.random() * 100;
    this.domeMaterial.uniforms.uSeed.value = this._seed;

    this._activeCount = Math.min(MAX_SHARDS, Math.max(0, Math.round(c.rimShards)));
    for (let i = 0; i < this._activeCount; i++) {
      const record = this.records[i];
      record.bearing = ((i + randRange(-0.4, 0.4)) / Math.max(1, this._activeCount)) * TAU;
      record.seat = randRange(-1, 1);
      record.scale = randRange(-1, 1);
      record.lean = randRange(-1, 1);
      record.stagger = Math.random();
    }

    this.cloud.clear();
    this.dome.visible = false;
    this.field.visible = false;
    this.veil.visible = false;

    this._sync(1, 0);
    this._muzzleFx();
  }

  /* ------------------------------------------------------------------ */
  /* Feedback                                                            */
  /* ------------------------------------------------------------------ */

  _sync(fade, dissolve) {
    const c = this.config;
    const g = settings.global;
    const travelling = this.phase === AbilityPhase.TRAVEL;

    this._centrePoint(this._centre);
    this.shardMaterial.userData.sync();

    const open = travelling ? 0 : this._riseAmount();
    const centre = this._centre;
    const R = this.radius;

    if (travelling) {
      this.cloud.clear();
      this.dome.visible = false;
      this.field.visible = false;
      this.veil.visible = false;
    } else {
      this._updateRim(open, fade);

      /* --- the shell --- */
      const domeR = R * c.domeRadius * lerp(0.25, 1, Easing.outCubic(open));
      this.dome.position.set(centre.x, 0, centre.z);
      this.dome.scale.set(domeR, domeR * c.domeSquash, domeR);
      this.dome.visible = fade > 0.004 && dissolve < 0.999;

      const u = this.domeMaterial.uniforms;
      u.uProgress.value = open;
      u.uAge.value = this.age;
      u.uScale.value = c.domeScale * g.noiseFrequency;
      u.uSpeed.value = c.domeSpeed * g.noiseSpeed;
      u.uTurbulence.value = 0.1 * g.turbulence;
      u.uPlates.value = c.domePlates;
      u.uRim.value = c.domeRim;
      u.uRimGain.value = 2.4 * g.fresnel;
      u.uDissolve.value = dissolve;
      u.uOpacity.value = c.domeOpacity * fade * g.opacity;
      u.uGlow.value = c.domeGlow * g.glow;
      u.uColorA.value.copy(getColor(c.colorDomeA));
      u.uColorB.value.copy(getColor(c.colorDomeB));
      u.uColorC.value.copy(getColor(c.colorDomeC));

      /* --- the sheet --- */
      const fieldState = this._fieldState;
      fieldState.radius = R;
      fieldState.quadSize = (R + c.fieldBoundary + 0.8) * 2;
      fieldState.freeze = open;
      fieldState.fade = fade;
      fieldState.seed = this._seed;
      this.fieldMaterial.userData.sync(fieldState);
      this.field.visible = open > 0.002 && fade > 0.002;
      this.field.position.set(centre.x, c.fieldHeight, centre.z);
      this.field.scale.set(fieldState.quadSize, 1, fieldState.quadSize);

      /* --- the curtain --- */
      const veilHeight = Math.max(0.05, c.veilHeight * Easing.outCubic(open));
      const veilState = this._veilState;
      veilState.fade = fade;
      veilState.seed = this._seed;
      this.veilMaterial.userData.sync(veilState);
      this.veil.visible = c.veil > 0.001 && open > 0.02 && fade > 0.004;
      this.veil.position.set(centre.x, veilHeight * 0.5, centre.z);
      this.veil.scale.set(R * c.veilRadius, veilHeight, R * c.veilRadius);
      this.veil.rotation.y = this._seed + this.age * c.veilSpin * TAU;
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

  _muzzleFx() {
    const c = this.config;
    const g = settings.global;

    this._handPoint(_pos);
    this.ctx.bursts.spawn(BurstMode.FROST, _pos, {
      radius: c.muzzleSize * 0.25,
      endRadius: c.muzzleSize * g.explosionIntensity,
      life: 0.5,
      intensity: c.muzzleIntensity,
      opacity: 0.7,
      fresnel: 1.4,
      displace: 0.5,
      colorA: getColor(c.colorBurstA),
      colorB: getColor(c.colorBurstB),
      colorC: getColor(c.colorBurstC)
    });

    this.ctx.flash.trigger(getColor(c.colorCastFlash), c.castFlash * g.explosionIntensity);
    this.lightBoost = c.lightIntensity * 0.4 * g.explosionIntensity;
  }

  /** Rime laid under the front while it walks out to the point. */
  _frontFx(dt) {
    const c = this.config;
    const g = settings.global;

    const mistCount = Math.round(this.mistEmitter.tick(dt, c.mistRate * 0.35) * g.particleCount);
    if (mistCount > 0) {
      _emit.position = _pos.copy(this.position).setY(0.1);
      _emit.radius = 0.6;
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = c.mistSpeed;
      _emit.speedVariance = 0.7;
      _emit.spread = 1.0;
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 0.75;
      _emit.sizeVariance = 0.5;
      _emit.life = c.mistLifetime * 0.8;
      _emit.lifeVariance = 0.4;
      _emit.spin = 0.4;
      _emit.tint = null;
      _emit.time = frame.uTime.value;
      this.mist.emit(mistCount, _emit);
    }

    const step = 1 / Math.max(0.05, c.trailFrostRate);
    while (this.front - this._frostDistance >= step) {
      this._frostDistance += step;
      const s = saturate(this._frostDistance / this.length);
      this.pointAt(s, _pos);
      _pos.x += this.side.x * randRange(-1.0, 1.0);
      _pos.z += this.side.z * randRange(-1.0, 1.0);
      this.ctx.decals.spawn(DecalType.FROST, _pos, {
        radius: c.trailFrostRadius * randRange(0.6, 1.2),
        life: c.frostLife * 0.8,
        width: c.frostCrystals,
        intensity: c.frostIntensity,
        colorA: getColor(c.colorFrost),
        colorB: getColor(c.colorFrostEdge)
      });
    }
  }

  /**
   * What the standing dome sheds. Deliberately thin: this is the one ability in
   * the library whose hold is supposed to be *still*.
   */
  _fieldFx(dt, scale) {
    const c = this.config;
    const g = settings.global;
    const time = frame.uTime.value;
    const centre = this._centre;
    const R = this.radius;

    const mistCount = Math.round(this.mistEmitter.tick(dt, c.mistRate * scale) * g.particleCount);
    if (mistCount > 0) {
      const a = Math.random() * TAU;
      const r = R * randRange(0.8, 1.05);
      _pos.set(centre.x + Math.cos(a) * r, randRange(0.05, 0.4), centre.z + Math.sin(a) * r);
      _emit.position = _pos;
      _emit.radius = R * 0.2;
      // Outward and *down*: heavy air falling off a shell, never rising.
      _emit.direction = _dir.set(Math.cos(a), -0.1, Math.sin(a)).normalize();
      _emit.speed = c.mistSpeed;
      _emit.speedVariance = 0.65;
      _emit.spread = 0.5;
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.size = 1.0;
      _emit.sizeVariance = 0.5;
      _emit.life = c.mistLifetime;
      _emit.lifeVariance = 0.4;
      _emit.spin = 0.3;
      _emit.tint = null;
      _emit.time = time;
      this.mist.emit(mistCount, _emit);
    }

    const snowCount = Math.round(this.snowEmitter.tick(dt, c.snowRate * scale) * g.particleCount);
    if (snowCount > 0) {
      const a = Math.random() * TAU;
      const r = R * c.snowInset * Math.sqrt(Math.random());
      _pos.set(
        centre.x + Math.cos(a) * r,
        R * c.domeRadius * c.domeSquash * randRange(0.3, 0.95),
        centre.z + Math.sin(a) * r
      );
      _emit.position = _pos;
      _emit.radius = R * 0.2;
      _emit.direction = _dir.set(0, -1, 0);
      _emit.speed = c.snowSpeed;
      _emit.speedVariance = 0.5;
      _emit.spread = 0.35;
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

    const glitterCount = Math.round(
      this.glitterEmitter.tick(dt, c.glitterRate * scale) * g.particleCount
    );
    if (glitterCount > 0) {
      const a = Math.random() * TAU;
      const r = R * Math.sqrt(Math.random());
      _pos.set(centre.x + Math.cos(a) * r, randRange(0.05, 0.5), centre.z + Math.sin(a) * r);
      _emit.position = _pos;
      _emit.radius = R * 0.15;
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = c.glitterSpeed * 0.5;
      _emit.speedVariance = 0.7;
      _emit.spread = 0.7;
      _emit.size = 0.08;
      _emit.sizeVariance = 0.6;
      _emit.life = c.glitterLifetime;
      _emit.lifeVariance = 0.5;
      _emit.spin = 0;
      _emit.time = time;
      this.glitter.emit(glitterCount, _emit);
    }

    const rimeCount = this.rimeEmitter.tick(dt, c.rimeRate * scale);
    for (let i = 0; i < rimeCount; i++) {
      const a = Math.random() * TAU;
      const r = R * randRange(0.6, 1.1);
      _pos.set(centre.x + Math.cos(a) * r, 0, centre.z + Math.sin(a) * r);
      this.ctx.decals.spawn(DecalType.FROST, _pos, {
        radius: c.rimeRadius * randRange(0.8, 1.5),
        life: c.frostLife,
        width: c.frostCrystals,
        intensity: c.frostIntensity,
        colorA: getColor(c.colorFrost),
        colorB: getColor(c.colorFrostEdge)
      });
    }

    const ringCount = this.ringEmitter.tick(dt, c.ringRate * scale);
    for (let i = 0; i < ringCount; i++) {
      this.ctx.decals.spawn(DecalType.SHOCKWAVE, centre, {
        radius: R * 1.05,
        life: 1.0,
        width: 0.04,
        intensity: 0.45,
        colorA: getColor(c.colorShockA),
        colorB: getColor(c.colorShockB)
      });
    }
  }

  /** The plates coming away, as chips, while the shell breaks up. */
  _shatterFx(dt, dissolve) {
    const c = this.config;
    const g = settings.global;
    if (dissolve <= 0.001 || dissolve >= 0.999) return;

    const count = Math.round(this.glitterEmitter.tick(dt, 220) * g.particleCount);
    if (count <= 0) return;

    const centre = this._centre;
    const R = this.radius * c.domeRadius;
    const a = Math.random() * TAU;
    const e = Math.acos(randRange(0, 1)); // upper hemisphere only
    const s = Math.sin(e);
    _dir.set(Math.cos(a) * s, Math.cos(e), Math.sin(a) * s);
    _pos.set(centre.x + _dir.x * R, _dir.y * R * c.domeSquash, centre.z + _dir.z * R);

    _emit.position = _pos;
    _emit.radius = 0.3;
    _emit.direction = _dir;
    _emit.speed = c.shardSpeed * 0.7;
    _emit.speedVariance = 0.8;
    _emit.spread = 0.6;
    _emit.inherit = null;
    _emit.anchor = null;
    _emit.size = 0.12;
    _emit.sizeVariance = 0.8;
    _emit.life = c.shardLifetime;
    _emit.lifeVariance = 0.5;
    _emit.spin = 8;
    _emit.tint = null;
    _emit.time = frame.uTime.value;
    this.shards.emit(count, _emit);
  }

  /* ------------------------------------------------------------------ */
  /* Phases                                                              */
  /* ------------------------------------------------------------------ */

  onTravel(dt) {
    this._sync(1, 0);
    this.position.y = 0.3;
    this._frontFx(dt);
    this.ctx.shake.rumble(this.config.rumble * settings.global.cameraShake, dt);
  }

  onImpact() {
    const c = this.config;
    const g = settings.global;

    this._openTime = 0;
    this._centrePoint(_pos);

    this.ctx.decals.spawn(DecalType.SHOCKWAVE, _pos, {
      radius: c.shockRadius * g.explosionIntensity,
      life: 1.1,
      width: 0.05,
      intensity: 1.0,
      colorA: getColor(c.colorShockA),
      colorB: getColor(c.colorShockB)
    });

    this.ctx.decals.spawn(DecalType.FROST, _pos, {
      radius: this.radius * c.frostSpread,
      life: c.frostLife * 1.6,
      width: c.frostCrystals,
      intensity: c.frostIntensity,
      colorA: getColor(c.colorFrost),
      colorB: getColor(c.colorFrostEdge)
    });

    _pos.y = 0.6;
    this.ctx.bursts.spawn(BurstMode.FROST, _pos, {
      radius: c.burstSize * 0.2,
      endRadius: c.burstSize * g.explosionIntensity,
      life: 1.1,
      intensity: c.burstIntensity,
      opacity: 0.7,
      fresnel: 1.4,
      displace: 0.55,
      squash: 0.62,
      colorA: getColor(c.colorBurstA),
      colorB: getColor(c.colorBurstB),
      colorC: getColor(c.colorBurstC)
    });

    this._centrePoint(_pos).setY(0.4);
    _emit.position = _pos;
    _emit.radius = this.radius * 0.6;
    _emit.direction = _dir.set(0, 1, 0);
    _emit.speed = c.shardSpeed * 1.5;
    _emit.speedVariance = 0.8;
    _emit.spread = 1.0;
    _emit.inherit = null;
    _emit.anchor = null;
    _emit.size = 0.14;
    _emit.sizeVariance = 0.8;
    _emit.life = c.shardLifetime * 1.3;
    _emit.lifeVariance = 0.5;
    _emit.spin = 8;
    _emit.tint = null;
    _emit.time = frame.uTime.value;
    this.shards.emit(Math.round(c.burstShards * g.particleCount), _emit);

    _emit.radius = this.radius * 0.9;
    _emit.speed = c.mistSpeed * 2.0;
    _emit.size = 1.5;
    _emit.life = c.mistLifetime * 1.4;
    _emit.spin = 0.5;
    this.mist.emit(Math.round(c.burstMist * g.particleCount), _emit);

    this.ctx.shake.add(
      c.impactShake * g.explosionIntensity * g.cameraShake,
      1 / Math.max(0.1, c.shakeDuration),
      16
    );
    this.ctx.flash.trigger(getColor(c.colorFlash), c.impactFlash * g.explosionIntensity);
    this.lightBoost = c.lightIntensity * 1.4 * g.explosionIntensity;
  }

  onFade(dt, t) {
    const c = this.config;
    this._openTime += dt;

    const dissolve = this._dissolveAmount(t);
    // The shell holds its brightness while it breaks and only then goes: the
    // plates are the resolution, so they must not be dimmed out from under it.
    const fade = t <= 1 ? 1 : 1 - Easing.inCubic(saturate(t - 1));
    this._sync(fade, dissolve);

    this.position.copy(this._centre);
    this.position.y = this.radius * c.domeRadius * c.domeSquash * saturate(c.lightHeight);

    this._fieldFx(dt, fade * (t <= 1 ? 1 : 0.3));
    this._shatterFx(dt, dissolve);
    this.ctx.shake.rumble(c.holdShake * fade * settings.global.cameraShake, dt);
  }

  onDestroy() {
    this._activeCount = 0;
    this.cloud.clear();
    this.dome.visible = false;
    this.field.visible = false;
    this.veil.visible = false;
  }

  dispose() {
    this.cloud.dispose();
    this.domeGeometry.dispose();
    this.domeMaterial.dispose();
    this.fieldGeometry.dispose();
    this.fieldMaterial.dispose();
    this.veilGeometry.dispose();
    this.veilMaterial.dispose();
    this.shardMaterial.dispose();
    super.dispose();
  }
}

/** Fully grown, never shattered — the blades break with the shell, not before. */
const RIM_EXTRAS = [1, 0];
