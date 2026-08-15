import { Mesh, IcosahedronGeometry, Vector3 } from 'three';
import { Ability, AbilityPhase } from './Ability.js';
import { StrandBundle } from './support/StrandBundle.js';
import { ZoneField } from './support/ZoneField.js';
import { StrandMode } from '../materials/StrandMaterial.js';
import { createShellMaterial, ShellMode } from '../materials/ShellMaterial.js';
import { VolumetricFireMaterial, fireHullReach } from '../materials/VolumetricFireMaterial.js';
import { RibbonGeometry, RibbonMode } from '../effects/RibbonGeometry.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { RateEmitter } from '../particles/ParticleEngine.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER } from '../core/Layers.js';
import { frame } from '../core/FrameUniforms.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';
import { saturate, lerp, Easing, randRange } from '../utils/math.js';

/** Hard ceilings. The editor's `petals` / `strands` sliders clamp here. */
const MAX_PETALS = 6;
const MAX_STRANDS = 20;
/** Samples along one petal's proxy hull. */
const PETAL_NODES = 14;

const TAU = Math.PI * 2;

const _emit = {};
const _pos = new Vector3();
const _dir = new Vector3();

/**
 * PLASMA BLOOM — a flower opening in the footprint.
 *
 * The counterweight to Absolute Zero: same footprint, same three beats, and the
 * exact opposite of everything else. Where the dome closes over the ground and
 * stops, this one opens out of it and keeps moving — a churning core, six
 * volumetric arms thrown out of it on a stagger, and great circles of arc
 * whipping around the whole thing.
 *
 * Three renderers, one silhouette:
 *
 *   - the core is `ShellMaterial`'s PLASMA_CORE body — ridged filaments under a
 *     bright rim, throbbing on `corePulse`
 *   - each petal is the Cinder Fall's raymarched flame along an *arc* rather
 *     than a flight path: it rises to `petalLift`, then droops back toward the
 *     floor at its tip
 *   - the arcs are `StrandMode.ARC`, great circles on random axes about the core
 *
 * Every petal owns a `VolumetricFireMaterial`. Six raymarchers is the most
 * expensive thing in the library and it is the reason `MAX_PETALS` is six: a
 * shared material would give every arm the same seed, and a flower with six
 * identical arms reads as a decal.
 *
 * **The rule that makes the editor work.** A cast captures a seed and the age
 * each petal opened at. The arc a petal follows, how far it reaches, how far it
 * lifts and how hard it droops are recomputed from `settings[element]` every
 * frame, so dragging `petalCurve` re-bends arms that are already in the air.
 */
export class BloomAbility extends Ability {
  constructor(context, element = 'plasma') {
    super(element, context);
  }

  /* ------------------------------------------------------------------ */
  /* Construction                                                        */
  /* ------------------------------------------------------------------ */

  createShaders() {
    /* ---- the body in the middle ---- */
    this.coreGeometry = new IcosahedronGeometry(1, 4);
    this.coreMaterial = createShellMaterial(ShellMode.PLASMA_CORE);
    this.core = new Mesh(this.coreGeometry, this.coreMaterial);
    this.core.name = 'PlasmaCore';
    this.core.frustumCulled = false;
    this.core.layers.set(LAYER.VFX);
    this.core.renderOrder = 12;
    this.core.visible = false;
    this.group.add(this.core);

    /* ---- the volumetric arms ---- */
    this.petals = [];
    for (let i = 0; i < MAX_PETALS; i++) {
      const ribbon = new RibbonGeometry(PETAL_NODES + 2, { frame: true });
      const material = new VolumetricFireMaterial(this.element);
      material.uniforms.uSeed.value = Math.random() * 20;
      const mesh = new Mesh(ribbon.geometry, material);
      mesh.frustumCulled = false;
      mesh.matrixAutoUpdate = false;
      mesh.layers.set(LAYER.VFX);
      mesh.renderOrder = 11;
      mesh.visible = false;
      this.group.add(mesh);

      const points = [];
      for (let p = 0; p < PETAL_NODES + 2; p++) points.push(new Vector3());

      this.petals.push({ ribbon, material, mesh, points, openedAt: -1 });
    }

    /* ---- the arcs whipping around it ---- */
    this.arcs = new StrandBundle(this.group, StrandMode.ARC, {
      nodes: 44,
      capacity: MAX_STRANDS,
      renderOrder: 13
    });

    /* ---- the lit disc under it ---- */
    this.field = new ZoneField(this.group, this.element);

    this._seed = 0;
    this._openTime = 0;
    this._phase = 0; // bearing the first petal opens on
    this._centre = new Vector3();
    this._look = {};
  }

  createParticles() {
    const particles = this.ctx.particles;

    this.embers = particles.get('bloom.embers', {
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

    this.sparks = particles.get('bloom.sparks', {
      capacity: 3600,
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

    this.smoke = particles.get('bloom.smoke', {
      capacity: 1600,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 1.1
    });
    this.smoke.uniforms.uDrag.value = 1.8;
    this.smoke.uniforms.uEndSize.value = 2.8;
    this.smoke.uniforms.uSizeIn.value = 0.12;
    this.smoke.uniforms.uFadeIn.value = 0.16;
    this.smoke.uniforms.uFadeOut.value = 0.3;

    this.emberEmitter = new RateEmitter();
    this.sparkEmitter = new RateEmitter();
    this.smokeEmitter = new RateEmitter();
  }

  /* ------------------------------------------------------------------ */
  /* Timing                                                              */
  /* ------------------------------------------------------------------ */

  get instanceCount() {
    let open = 0;
    for (const petal of this.petals) if (petal.mesh.visible) open++;
    return open + this.arcs.count * 2 + 1;
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

  /** Plasma gutters — the light is a discharge's, not a fire's. */
  lightShimmer() {
    const c = this.config;
    const step = Math.floor(this.age * Math.max(1, c.lightFlickerSpeed));
    const noise = Math.abs(Math.sin(step * 57.3) * 43758.5453) % 1;
    return 1 - saturate(c.lightFlicker) * noise;
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

  _openAmount() {
    return Easing.outCubic(saturate(this._openTime / Math.max(0.02, this.config.snapTime)));
  }

  /** Where the core hangs, world space. */
  _corePoint(out) {
    return out.copy(this._centre).setY(this.config.coreHeight);
  }

  /* ------------------------------------------------------------------ */
  /* The petals                                                          */
  /* ------------------------------------------------------------------ */

  /**
   * A point on petal `index`'s arc, `u` from the core to the tip.
   *
   * The arc rises to `petalLift` and comes back down: `petalCurve` below one
   * throws the crest early, which is what makes an arm look flung rather than
   * lobbed, and `petalDroop` pulls the tip back toward the floor so the flower
   * closes over instead of standing up like a fountain.
   */
  _petalPoint(index, count, u, reach, out) {
    const c = this.config;
    const angle = this._phase + (index / Math.max(1, count)) * TAU;
    const d = u * reach;
    const lift = c.petalLift * Math.sin(Math.PI * Math.pow(saturate(u), Math.max(0.05, c.petalCurve)));
    const droop = c.petalDroop * c.petalLift * u;
    return out.set(
      this._centre.x + Math.cos(angle) * d,
      Math.max(0.05, c.coreHeight + lift - droop),
      this._centre.z + Math.sin(angle) * d
    );
  }

  /** Rebuild the proxy hull every petal is raymarched inside. */
  _updatePetals(open, fade) {
    const c = this.config;
    const wanted = Math.min(MAX_PETALS, Math.max(0, Math.round(c.petals)));
    const reachFactor = fireHullReach(this.element);

    for (const [index, petal] of this.petals.entries()) {
      if (index >= wanted || open <= 0.001) {
        petal.mesh.visible = false;
        petal.ribbon.clear();
        continue;
      }

      if (petal.openedAt < 0) petal.openedAt = this.age + index * c.petalStagger;
      const elapsed = this.age - petal.openedAt;
      if (elapsed < 0) {
        petal.mesh.visible = false;
        petal.ribbon.clear();
        continue;
      }

      const grow = Easing.outCubic(saturate(elapsed / Math.max(0.02, c.petalOpen)));
      const reach = Math.max(0.1, c.petalSpan) * grow * fade;
      if (reach < 0.25 || fade < 0.02) {
        petal.mesh.visible = false;
        petal.ribbon.clear();
        continue;
      }

      const radius = Math.max(0.03, c.petalWidth * fade);
      const pad = radius * reachFactor;
      const count = PETAL_NODES;

      // Cap padding along the arc's own heading at each end.
      this._petalPoint(index, wanted, 0, reach, _pos);
      this._petalPoint(index, wanted, 0.02, reach, _dir);
      petal.points[0].copy(_pos).addScaledVector(_dir.sub(_pos).normalize(), -pad);

      let length = 0;
      for (let i = 0; i < count; i++) {
        this._petalPoint(index, wanted, i / (count - 1), reach, petal.points[i + 1]);
        if (i > 0) length += petal.points[i + 1].distanceTo(petal.points[i]);
      }

      this._petalPoint(index, wanted, 0.98, reach, _pos);
      this._petalPoint(index, wanted, 1, reach, _dir);
      petal.points[count + 1].copy(_dir).addScaledVector(_dir.clone().sub(_pos).normalize(), pad);

      if (length < 1e-3) {
        petal.mesh.visible = false;
        petal.ribbon.clear();
        continue;
      }

      petal.material.sync();
      const u = petal.material.uniforms;
      u.uRadius.value = radius;
      u.uStreamLength.value = length;
      u.uArcLength.value = length + pad * 2;
      u.uTailPad.value = pad;
      u.uOpacity.value = c.trailOpacity * fade * settings.global.opacity;

      const cover = 1.1 * reachFactor * Math.max(1, c.trailPlume);
      petal.ribbon.build(petal.points, {
        count: count + 2,
        width: 2 * radius * c.trailHeadSize * cover,
        mode: RibbonMode.BILLBOARD,
        cameraPosition: this.ctx.camera.position
      });
      petal.mesh.visible = true;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Casting                                                             */
  /* ------------------------------------------------------------------ */

  onSpawn() {
    this.emberEmitter.reset();
    this.sparkEmitter.reset();
    this.smokeEmitter.reset();

    this._openTime = 0;
    this._seed = Math.random() * 100;
    this._phase = Math.random() * TAU;
    this.field.reseed();
    this.arcs.set('uSeed', this._seed);
    this.coreMaterial.uniforms.uSeed.value = this._seed;

    for (const petal of this.petals) {
      petal.openedAt = -1;
      petal.mesh.visible = false;
      petal.ribbon.clear();
    }

    this.core.visible = false;
    this.field.setVisible(false);
    this.arcs.setVisible(false);

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
      this.core.visible = false;
      this.arcs.setVisible(false);
      this.field.setVisible(false);
      for (const petal of this.petals) {
        petal.mesh.visible = false;
        petal.ribbon.clear();
      }
    } else {
      this._syncCore(open, fade);
      this._updatePetals(open, fade);
      this._syncArcs(open, fade);
      this.field.setVisible(fade > 0.004);
      this.field.update(this._centre, this.radius * Math.max(0.05, open), fade, c.fieldHeight ?? 0.03);
    }

    /* --- the three particle systems --- */
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

  _syncCore(open, fade) {
    const c = this.config;
    const g = settings.global;

    const size = Math.max(0.01, c.coreSize * Easing.outBack(open) * fade);
    this._corePoint(_pos);
    this.core.position.copy(_pos);
    this.core.scale.setScalar(size);
    this.core.visible = fade > 0.004 && size > 0.02;

    const u = this.coreMaterial.uniforms;
    u.uProgress.value = open;
    u.uAge.value = this.age;
    u.uScale.value = c.coreScale * g.noiseFrequency;
    u.uSpeed.value = c.coreFlow * g.noiseSpeed;
    u.uTurbulence.value = c.coreTurbulence * g.turbulence;
    u.uBands.value = c.coreBands * g.noiseFrequency;
    u.uPlates.value = 0.9;
    u.uRim.value = c.coreRim;
    u.uRimGain.value = 2.2 * g.fresnel;
    u.uPulse.value = c.corePulse;
    u.uPulseSpeed.value = c.corePulseSpeed * g.noiseSpeed;
    u.uDissolve.value = 1 - fade;
    u.uOpacity.value = c.coreOpacity * g.opacity;
    u.uGlow.value = c.coreGlow * g.glow;
    u.uColorA.value.copy(getColor(c.colorCoreA));
    u.uColorB.value.copy(getColor(c.colorCoreB));
    u.uColorC.value.copy(getColor(c.colorCoreC));
  }

  _syncArcs(open, fade) {
    const c = this.config;
    const bundle = this.arcs;

    bundle.setCount(Math.min(MAX_STRANDS, Math.round(c.strands)));
    bundle.setVisible(fade > 0.004 && open > 0.02);
    if (bundle.count <= 0) return;

    bundle.set('uOrigin', this._centre);
    bundle.set('uForward', this.direction);
    bundle.set('uSideAxis', this.side);
    bundle.set('uAge', this.age);
    bundle.set('uProgress', open);
    bundle.set('uFade', fade);
    bundle.set('uHeight', c.coreHeight);
    bundle.set('uRadius', this.radius * c.strandRadius * Easing.outCubic(open));
    bundle.set('uTilt', c.strandTilt);
    bundle.set('uSpeed', c.strandSpeed);
    bundle.set('uSpan', c.strandSpan);
    bundle.set('uJitter', 0.05 * settings.global.randomness);
    bundle.set('uJitterScale', 3.0);
    bundle.set('uCrawl', 2.4);

    const look = this._look;
    look.core = getColor(c.colorStrandCore);
    look.edge = getColor(c.colorStrandEdge);
    look.halo = getColor(c.colorStrandHalo);
    look.width = c.strandWidth;
    look.glow = c.strandGlow * settings.global.glow;
    look.opacity = settings.global.opacity;
    look.dim = c.strandDim;
    look.flicker = 0.2;
    look.flickerSpeed = 22;
    bundle.syncLook(look);
  }

  _muzzleFx() {
    const c = this.config;
    const g = settings.global;
    if (c.muzzleSize > 0) {
      this._handPoint(_pos);
      this.ctx.bursts.spawn(BurstMode.FIRE, _pos, {
        radius: c.muzzleSize * 0.25,
        endRadius: c.muzzleSize * g.explosionIntensity,
        life: 0.35,
        intensity: c.muzzleIntensity,
        opacity: 0.85,
        fresnel: 1.3,
        displace: 0.5,
        colorA: getColor(c.colorHot),
        colorB: getColor(c.colorFlameMid),
        colorC: getColor(c.colorFlameEdge)
      });
    }

    this.ctx.flash.trigger(getColor(c.colorCastFlash), c.castFlash * g.explosionIntensity);
    this.lightBoost = c.lightIntensity * 0.35 * g.explosionIntensity;
  }

  /** What the open bloom sheds. */
  _bloomFx(dt, scale) {
    const c = this.config;
    const g = settings.global;
    const time = frame.uTime.value;
    const wanted = Math.max(1, Math.round(c.petals));

    /* --- embers shed off the arms, along their whole length --- */
    const emberCount = Math.round(this.emberEmitter.tick(dt, c.emberRate * scale) * g.particleCount);
    if (emberCount > 0) {
      const index = Math.floor(Math.random() * wanted);
      this._petalPoint(index, wanted, Math.random(), c.petalSpan, _pos);
      _emit.position = _pos;
      _emit.radius = c.petalWidth * 1.4;
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = c.emberSpeed;
      _emit.speedVariance = 0.8;
      _emit.spread = 0.9;
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

    /* --- sparks thrown off the core --- */
    const sparkCount = Math.round(this.sparkEmitter.tick(dt, c.sparkRate * scale) * g.particleCount);
    if (sparkCount > 0) {
      this._corePoint(_pos);
      _emit.position = _pos;
      _emit.radius = c.coreSize * 1.1;
      _emit.direction = _dir
        .set(randRange(-1, 1), randRange(-0.2, 1), randRange(-1, 1))
        .normalize();
      _emit.speed = c.sparkSpeed;
      _emit.speedVariance = 0.85;
      _emit.spread = 1.0;
      _emit.size = 0.15;
      _emit.sizeVariance = 0.7;
      _emit.life = c.sparkLifetime;
      _emit.lifeVariance = 0.55;
      _emit.spin = 0;
      _emit.time = time;
      this.sparks.emit(sparkCount, _emit);
    }

    /* --- the little haze it makes --- */
    const smokeCount = Math.round(this.smokeEmitter.tick(dt, c.smokeRate * scale) * g.particleCount);
    if (smokeCount > 0) {
      const a = Math.random() * TAU;
      const r = this.radius * Math.sqrt(Math.random());
      _pos.set(this._centre.x + Math.cos(a) * r, 0.2, this._centre.z + Math.sin(a) * r);
      _emit.position = _pos;
      _emit.radius = this.radius * 0.2;
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = c.smokeSpeed;
      _emit.speedVariance = 0.7;
      _emit.spread = 0.85;
      _emit.size = 0.9;
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
    this._sync(1);
    this.position.y = 0.3;
    this.ctx.shake.rumble(this.config.rumble * settings.global.cameraShake, dt);
  }

  onImpact() {
    const c = this.config;
    const g = settings.global;

    this._openTime = 0;
    for (const petal of this.petals) petal.openedAt = -1;

    this._centrePoint(_pos);
    this.ctx.decals.spawn(DecalType.SHOCKWAVE, _pos, {
      radius: c.shockRadius * g.explosionIntensity,
      life: 0.6,
      width: 0.05,
      intensity: 1.0,
      colorA: getColor(c.colorShockA),
      colorB: getColor(c.colorShockB)
    });

    this.ctx.decals.spawn(DecalType.SCORCH, _pos, {
      radius: c.scorchRadius,
      life: c.scorchLife,
      intensity: c.scorchIntensity,
      colorA: getColor(c.colorScorch),
      colorB: getColor(c.colorFlameMid),
      height: 0.012
    });

    this._corePoint(_pos);
    this.ctx.bursts.spawn(BurstMode.FIRE, _pos, {
      radius: c.burstSize * 0.18,
      endRadius: c.burstSize * g.explosionIntensity,
      life: 0.6,
      intensity: c.burstIntensity,
      opacity: 0.85,
      fresnel: 1.4,
      displace: 0.65,
      colorA: getColor(c.colorHot),
      colorB: getColor(c.colorFlameMid),
      colorC: getColor(c.colorFlameEdge)
    });

    _emit.position = _pos;
    _emit.radius = c.coreSize;
    _emit.direction = _dir.set(0, 1, 0);
    _emit.speed = c.emberSpeed * 2.0;
    _emit.speedVariance = 0.85;
    _emit.spread = 1.0;
    _emit.inherit = null;
    _emit.anchor = null;
    _emit.size = 0.12;
    _emit.sizeVariance = 0.7;
    _emit.life = c.emberLifetime * 1.3;
    _emit.lifeVariance = 0.5;
    _emit.spin = 0;
    _emit.tint = null;
    _emit.time = frame.uTime.value;
    this.embers.emit(Math.round(c.burstEmbers * g.particleCount), _emit);

    _emit.speed = c.sparkSpeed * 2.4;
    _emit.size = 0.2;
    _emit.life = c.sparkLifetime * 1.5;
    this.sparks.emit(Math.round(c.burstSparks * g.particleCount), _emit);

    this.ctx.shake.add(
      c.impactShake * g.explosionIntensity * g.cameraShake,
      1 / Math.max(0.1, c.shakeDuration),
      24
    );
    this.ctx.flash.trigger(getColor(c.colorFlash), c.impactFlash * g.explosionIntensity);
    this.lightBoost = c.lightIntensity * 1.4 * g.explosionIntensity;
  }

  onFade(dt, t) {
    const c = this.config;
    this._openTime += dt;

    const fade = t <= 1 ? 1 : 1 - Easing.inCubic(saturate(t - 1));
    this._sync(fade);

    this.position.copy(this._centre);
    this.position.y = lerp(0, c.coreHeight, 1);

    this._bloomFx(dt, fade * (t <= 1 ? 1 : 0.4));
    this.ctx.shake.rumble(c.rumble * fade * settings.global.cameraShake, dt);
  }

  onDestroy() {
    this.core.visible = false;
    this.arcs.setVisible(false);
    this.field.setVisible(false);
    for (const petal of this.petals) {
      petal.mesh.visible = false;
      petal.ribbon.clear();
      petal.openedAt = -1;
    }
  }

  dispose() {
    this.arcs.dispose();
    this.field.dispose();
    this.coreGeometry.dispose();
    this.coreMaterial.dispose();
    for (const petal of this.petals) {
      petal.ribbon.dispose();
      petal.material.dispose();
    }
    super.dispose();
  }
}
