import { Mesh, Vector3 } from 'three';
import { AbilityPhase } from './Ability.js';
import { TRAIL_NODES, _pos, _dir, _heading, _mark, _emit } from './bolt-scratch.js';
import { RibbonGeometry, RibbonMode } from '../effects/RibbonGeometry.js';
import { BoltTrailMaterial } from '../materials/BoltTrailMaterial.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { DecalType } from '../effects/GroundDecals.js';
import { frame } from '../core/FrameUniforms.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';
import { lerp, saturate } from '../utils/math.js';

/** How many points along the covered path a frame's wake is paid out from. */
const TRAIL_BATCHES = 3;

/**
 * Bolt presentation — the wake and the four one-shot effects, as a prototype
 * mixin.
 *
 * `BoltAbility` keeps the path, the collision and the phase logic; everything
 * that is only *look* lives here. They are ordinary methods on the same
 * prototype — `this` is the ability and each one is free to call `_pathPoint`,
 * `_headingAt` and the rest — so the split is nothing but the 800-line rule in
 * `AGENTS.md`.
 *
 * The four one-shots are the reason this file is worth reading. A bolt has two
 * possible endings and they are deliberately built out of different vocabularies:
 * `_contactFx` is a burst, a shockwave ring, a screen flash, camera shake and a
 * mark burnt into the floor; `_fizzleFx` is a soft shell of motes and nothing
 * else — no ring, no shake, no flash, no decal. The single most important thing
 * this ability has to communicate is whether it hit, and that has to be legible
 * from across the room with the sound off.
 */
export const boltFx = {
  /* ------------------------------------------------------------------ */
  /* Construction                                                        */
  /* ------------------------------------------------------------------ */

  /**
   * The wake: two ribbons on one centre line.
   *
   * A narrow bright core inside a wide faint sheath, which is what gives the
   * trail depth without a volume — and a volume is the wrong tool here anyway:
   * a bolt's wake is on screen for a quarter of a second at fifty metres a
   * second, so the only two properties that survive the motion are the
   * silhouette and the gradient along it. See `BoltTrailMaterial`.
   *
   * The centre line is *sampled off the path*, never recorded from past frames,
   * so it re-bends live with the trajectory it belongs to — with the clock
   * paused included.
   */
  _createTrail() {
    this.trailPoints = [];
    for (let i = 0; i <= TRAIL_NODES; i++) this.trailPoints.push(new Vector3());

    this.coreRibbon = new RibbonGeometry(TRAIL_NODES);
    this.sheathRibbon = new RibbonGeometry(TRAIL_NODES);

    this.coreTrailMaterial = new BoltTrailMaterial();
    this.sheathTrailMaterial = new BoltTrailMaterial();
    this.coreTrailMaterial.uniforms.uSoftness.value = 0.35;
    this.sheathTrailMaterial.uniforms.uSoftness.value = 0.9;

    this.sheathTrail = BoltTrailMaterial.prepare(
      new Mesh(this.sheathRibbon.geometry, this.sheathTrailMaterial)
    );
    this.coreTrail = BoltTrailMaterial.prepare(
      new Mesh(this.coreRibbon.geometry, this.coreTrailMaterial)
    );
    // The sheath is the outer, dimmer strip: drawn first so the core reads as
    // sitting inside it rather than behind it.
    this.sheathTrail.renderOrder = 11;
    this.sheathTrail.visible = false;
    this.coreTrail.visible = false;
    this.group.add(this.sheathTrail, this.coreTrail);

    // One reused options record and one reused profile closure: `build()` runs
    // twice a frame per bolt, and neither may allocate.
    this._trailTaper = 2;
    this._ribbonOptions = {
      count: TRAIL_NODES + 1,
      width: 0.2,
      mode: RibbonMode.BILLBOARD,
      cameraPosition: this.ctx.camera.position,
      widthProfile: (t) => Math.pow(t, this._trailTaper),
      twist: 0
    };
  },

  /* ------------------------------------------------------------------ */
  /* Per-frame state                                                     */
  /* ------------------------------------------------------------------ */

  /**
   * Push the live settings into the body's four materials and both particle
   * systems.
   *
   * Every frame, unconditionally — that is the whole reason a colour dragged in
   * the editor moves on a body that is already halfway downrange.
   *
   * @param {number} burn 0 while the body is flying, → 1 as the wake dies
   */
  _syncMaterials(burn) {
    const c = this.config;
    const g = settings.global;

    // `shape` is a live control like everything else: swapping the builder in
    // the editor re-assembles the body on the next frame, mid-flight included.
    this._buildBody();

    /* --- the solid parts --- */
    const body = this.bodyMaterial;
    body.color.copy(getColor(c.colorBody));
    body.emissive.copy(getColor(c.colorBody));
    body.emissiveIntensity = c.emissive * g.glow;
    body.roughness = c.roughness;
    body.metalness = c.metalness;
    body.envMapIntensity = c.envIntensity;

    const edge = this.edgeMaterial;
    edge.color.copy(getColor(c.colorEdge));
    edge.emissive.copy(getColor(c.colorEdge));
    // The trim is the part that has to stay legible against a bright floor, so
    // it runs hotter than the body it is bolted to.
    edge.emissiveIntensity = c.emissive * 1.8 * g.glow;
    edge.roughness = c.roughness * 0.7;
    edge.metalness = c.metalness;
    edge.envMapIntensity = c.envIntensity;

    /* --- the lit core and the halo --- */
    const alive = 1 - burn;
    const core = this.body?.core;
    if (core) {
      const size = Math.max(0, c.coreSize);
      core.scale.copy(this._coreBase).multiplyScalar(size);
      core.visible = size > 1e-4 && c.coreOpacity > 1e-4;
    }
    this.coreMaterial.color.copy(getColor(c.colorCore));
    this.coreMaterial.opacity = c.coreOpacity * g.opacity * alive;

    const shell = this.body?.shell;
    if (shell) {
      const size = Math.max(0, c.shellSize);
      shell.scale.copy(this._shellBase).multiplyScalar(size);
      shell.visible = size > 1e-4 && c.shellOpacity > 1e-4;
    }
    this.shellMaterial.color.copy(getColor(c.colorGlow));
    this.shellMaterial.opacity = c.shellOpacity * g.opacity * alive;

    /* --- the two particle systems --- */
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
    this.sparks.uniforms.uGlow.value = c.emberGlow * 0.8 * g.glow;
    this.sparks.uniforms.uStretch.value = c.sparkStretch;
  },

  /**
   * Rebuild both ribbons from the section of path behind the body.
   *
   * @param {number} burn 0 while it flies, 0 → 1 as the wake burns back
   */
  _updateTrail(burn) {
    const c = this.config;
    const g = settings.global;

    const head = this.phase === AbilityPhase.TRAVEL ? saturate(this.u) : this._hitS;
    const axis = this._axisSpan;
    // `trailSpan` is metres of path; the parameterisation is the axis, so the
    // window is converted once here rather than per node.
    const window = Math.max(0.05, c.trailSpan) / axis;
    // Once the body is gone the tail eats its way up to the head.
    const tail = saturate(head - window * (1 - burn));

    const visible = (head - tail) * axis > 0.06;
    this.coreTrail.visible = visible;
    this.sheathTrail.visible = visible;
    if (!visible) {
      this.coreRibbon.clear();
      this.sheathRibbon.clear();
      return;
    }

    const count = TRAIL_NODES + 1;
    for (let i = 0; i < count; i++) {
      this._pathPoint(lerp(tail, head, i / (count - 1)), this.trailPoints[i]);
    }

    const taper = Math.max(0.05, c.trailTaper);
    const width = Math.max(0.005, c.trailWidth) * (1 - burn * 0.5);

    this._trailTaper = taper;
    const options = this._ribbonOptions;
    options.count = count;
    options.twist = c.trailTwist;

    options.width = 2 * width;
    this.coreRibbon.build(this.trailPoints, options);
    options.width = 2 * width * Math.max(1, c.trailSheath);
    this.sheathRibbon.build(this.trailPoints, options);

    const headTint = getColor(c.colorTrailA);
    const tailTint = getColor(c.colorTrailB);
    const opacity = c.trailOpacity * g.opacity * (1 - burn);
    const glow = c.trailGlow * g.glow;

    for (const [material, scale] of [
      [this.coreTrailMaterial, 1],
      [this.sheathTrailMaterial, 0.34]
    ]) {
      const u = material.uniforms;
      u.uColorA.value.copy(headTint);
      u.uColorB.value.copy(tailTint);
      u.uOpacity.value = opacity * scale;
      u.uGlow.value = glow * scale;
      u.uTaper.value = taper;
    }
  },

  /* ------------------------------------------------------------------ */
  /* Feedback                                                            */
  /* ------------------------------------------------------------------ */

  /**
   * Embers and sparks shed along the section of path covered this frame.
   *
   * Spread over several points between where the body was last frame and where
   * it is now, rather than all fired from the head: a sabot covers more than a
   * metre between frames, and firing from one point leaves the wake visibly
   * beaded at exactly the speeds where it matters most.
   */
  _trailFx(dt) {
    const c = this.config;
    const g = settings.global;
    const time = frame.uTime.value;
    const from = this._lastS;
    const to = saturate(this.u);

    // Everything is thrown off the *back* of the body.
    this._headingAt(to, _heading);

    let emberCount = Math.round(this.emberEmitter.tick(dt, c.emberRate) * g.particleCount);
    if (emberCount > 0) {
      _emit.direction = _dir.copy(_heading).multiplyScalar(-1);
      _emit.direction.y += 0.25;
      _emit.direction.normalize();
      _emit.speed = c.emberSpeed;
      _emit.speedVariance = 0.65;
      _emit.spread = c.emberSpread;
      _emit.inherit = null;
      _emit.anchor = null;
      _emit.radius = Math.max(0.02, c.bodySize * 0.45);
      _emit.size = 0.12;
      _emit.sizeVariance = 0.55;
      _emit.life = c.emberLifetime;
      _emit.lifeVariance = 0.45;
      _emit.spin = 0;
      _emit.tint = null;
      _emit.time = time;

      const batches = Math.min(emberCount, TRAIL_BATCHES);
      const per = Math.ceil(emberCount / batches);
      while (emberCount > 0) {
        this._pathPoint(lerp(from, to, Math.random()), _pos);
        _emit.position = _pos;
        this.embers.emit(Math.min(per, emberCount), _emit);
        emberCount -= per;
      }
    }

    const sparkCount = Math.round(this.sparkEmitter.tick(dt, c.sparkRate) * g.particleCount);
    if (sparkCount > 0) {
      this._pathPoint(lerp(from, to, Math.random()), _pos);
      _emit.position = _pos;
      _emit.radius = Math.max(0.02, c.bodySize * 0.35);
      _emit.direction = _dir.copy(_heading).multiplyScalar(-1);
      _emit.direction.y += 0.15;
      _emit.direction.normalize();
      _emit.speed = c.sparkSpeed;
      _emit.speedVariance = 0.8;
      _emit.spread = c.emberSpread * 1.2;
      _emit.size = 0.14;
      _emit.sizeVariance = 0.65;
      _emit.life = c.sparkLifetime;
      _emit.lifeVariance = 0.5;
      _emit.spin = 0;
      _emit.time = time;
      this.sparks.emit(sparkCount, _emit);
    }
  },

  /** The release: a shell off the hand, a spray of sparks and a short kick. */
  _launchFx() {
    const c = this.config;
    const g = settings.global;

    this._pathPoint(0, _pos);
    this._headingAt(0, _heading);

    if (c.muzzleSize > 0) {
      this.ctx.bursts.spawn(Math.round(c.muzzleMode), _pos, {
        radius: c.muzzleSize * 0.3,
        endRadius: c.muzzleSize * g.explosionIntensity,
        life: 0.3,
        intensity: c.muzzleIntensity,
        opacity: 0.85,
        fresnel: 1.2,
        displace: 0.4,
        turbulence: 0.9,
        colorA: getColor(c.colorCastFlash),
        colorB: getColor(c.colorCore),
        colorC: getColor(c.colorGlow)
      });
    }

    _emit.position = _pos;
    _emit.radius = 0.18;
    // Along the shot rather than back down it: this is the thing being thrown,
    // not something coming off a surface.
    _emit.direction = _dir.copy(_heading);
    _emit.direction.y += 0.25;
    _emit.direction.normalize();
    _emit.speed = c.sparkSpeed * 1.1;
    _emit.speedVariance = 0.75;
    _emit.spread = 0.6;
    _emit.inherit = null;
    _emit.anchor = null;
    _emit.size = 0.15;
    _emit.sizeVariance = 0.6;
    _emit.life = c.sparkLifetime * 0.8;
    _emit.lifeVariance = 0.5;
    _emit.spin = 0;
    _emit.tint = null;
    _emit.time = frame.uTime.value;
    this.sparks.emit(Math.round(c.muzzleSparks * g.particleCount), _emit);

    this.ctx.flash.trigger(getColor(c.colorCastFlash), c.castFlash * g.explosionIntensity);
    this.ctx.shake.add(c.castShake * g.explosionIntensity * g.cameraShake, 5.0, 24);
    this.lightBoost = c.lightIntensity * 0.5 * g.explosionIntensity;
  },

  /**
   * The contact: everything a hit is allowed to do, and nothing a miss may.
   *
   * Anchored on `_contact` — the point the sweep actually returned, on the
   * surface of the target's collision sphere — rather than on the target's
   * centre or the end of the cast line. That is what makes a graze read as a
   * graze.
   */
  _contactFx() {
    const c = this.config;
    const g = settings.global;
    const time = frame.uTime.value;
    const mode = Math.round(c.impactMode);
    const scale = c.burstSize * g.explosionIntensity;

    // Recomputed rather than inherited from `onImpact`: the spray comes off the
    // plate along the shot, and this method must stand on its own.
    this._headingAt(this._hitS, _heading);

    const shock = getColor(c.colorShockA);
    const rim = getColor(c.colorShockB);

    /* the shell, and a faster inner flash that gives the hit its snap */
    this.ctx.bursts.spawn(mode, this._contact, {
      radius: scale * 0.2,
      endRadius: scale,
      life: 0.55,
      intensity: c.burstIntensity,
      opacity: 0.95,
      fresnel: 1.1,
      displace: 0.5,
      turbulence: c.burstTurbulence,
      colorA: rim,
      colorB: shock,
      colorC: getColor(c.colorGlow)
    });
    this.ctx.bursts.spawn(mode, this._contact, {
      radius: scale * 0.08,
      endRadius: scale * 0.5,
      life: 0.24,
      intensity: c.burstIntensity * 2.0,
      opacity: 1.0,
      displace: 0.18,
      turbulence: c.burstTurbulence * 0.5,
      colorA: rim,
      colorB: rim,
      colorC: shock
    });

    /* the ring across the floor under the contact */
    _mark.copy(this._contact).setY(0);
    this.ctx.decals.spawn(DecalType.SHOCKWAVE, _mark, {
      radius: c.impactRing * g.explosionIntensity,
      life: 0.55,
      width: 0.06,
      intensity: 1.2,
      colorA: shock,
      colorB: rim
    });

    /* everything thrown off the plate */
    _emit.position = this._contact;
    _emit.radius = scale * 0.16;
    _emit.direction = _dir.copy(_heading).multiplyScalar(-1);
    _emit.direction.y += 0.5;
    _emit.direction.normalize();
    _emit.speed = c.sparkSpeed * 2.2;
    _emit.speedVariance = 0.8;
    _emit.spread = 0.95;
    _emit.inherit = null;
    _emit.anchor = null;
    _emit.size = 0.19;
    _emit.sizeVariance = 0.7;
    _emit.life = c.sparkLifetime * 1.5;
    _emit.lifeVariance = 0.55;
    _emit.spin = 0;
    _emit.tint = null;
    _emit.time = time;
    this.sparks.emit(Math.round(c.burstSparks * g.particleCount), _emit);

    _emit.speed = c.emberSpeed * 2.4;
    _emit.spread = 1.0;
    _emit.size = 0.17;
    _emit.life = c.emberLifetime * 1.4;
    this.embers.emit(Math.round(c.burstEmbers * g.particleCount), _emit);

    this.ctx.shake.add(
      c.impactShake * g.explosionIntensity * g.cameraShake,
      1 / Math.max(0.1, c.shakeDuration),
      22
    );
    this.ctx.flash.trigger(getColor(c.colorFlash), c.impactFlash * g.explosionIntensity);
    this.lightBoost = c.impactLight * g.explosionIntensity;
  },

  /**
   * The miss: the body comes apart at the target point, and that is all.
   *
   * No ring, no camera shake, no screen flash, no mark on the floor, and a fixed
   * `BurstMode.AIR` shell rather than the block's `impactMode` — the vocabulary
   * of the ending is itself the readout. If a miss looked like a smaller hit,
   * the ten skills would be back to being unaimable.
   */
  _fizzleFx() {
    const c = this.config;
    const g = settings.global;

    this._headingAt(this._hitS, _heading);

    this.ctx.bursts.spawn(BurstMode.AIR, this._contact, {
      radius: c.fizzleSize * 0.25,
      endRadius: c.fizzleSize,
      life: 0.45,
      intensity: 0.7,
      opacity: 0.4,
      fresnel: 1.4,
      displace: 0.3,
      turbulence: 0.8,
      colorA: getColor(c.colorGlow),
      colorB: getColor(c.colorTrailB),
      colorC: getColor(c.colorScorch)
    });

    _emit.position = this._contact;
    _emit.radius = Math.max(0.05, c.fizzleSize * 0.3);
    _emit.direction = _dir.copy(_heading);
    _emit.speed = c.emberSpeed * 0.8;
    _emit.speedVariance = 0.7;
    _emit.spread = c.fizzleSpread;
    _emit.inherit = null;
    _emit.anchor = null;
    _emit.size = 0.11;
    _emit.sizeVariance = 0.6;
    _emit.life = c.emberLifetime * 0.9;
    _emit.lifeVariance = 0.5;
    _emit.spin = 0;
    _emit.tint = null;
    _emit.time = frame.uTime.value;
    this.embers.emit(Math.round(c.fizzleMotes * g.particleCount), _emit);
  },

  /** The mark burnt into the floor under a contact. Hits only, by design. */
  _groundMark() {
    const c = this.config;
    const g = settings.global;

    _mark.copy(this._contact).setY(0);
    // The blocks name their mark by number (`DecalType.FROST` is 6) so the whole
    // family shares one key surface — see `blocks-bolts-a.js`.
    this.ctx.decals.spawn(Math.round(c.decalType), _mark, {
      radius: c.scorchRadius * g.explosionIntensity,
      life: c.scorchLife,
      intensity: c.scorchIntensity,
      colorA: getColor(c.colorScorch),
      colorB: getColor(c.colorGlow),
      height: 0.014
    });
  }
};
