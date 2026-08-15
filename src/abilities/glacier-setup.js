import { InstancedMesh, InstancedBufferAttribute, Mesh, PlaneGeometry, CylinderGeometry, Vector3 } from 'three';
import { createGlacierMaterial } from '../materials/GlacierMaterial.js';
import { createFrostFieldMaterial, createFrostVeilMaterial } from '../materials/FrostFieldMaterial.js';
import { createCrystalGeometry } from '../assets/ProceduralGeometry.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { RateEmitter } from '../particles/ParticleEngine.js';
import { LAYER } from '../core/Layers.js';
import { frame } from '../core/FrameUniforms.js';
import { MAX_SPIKES, VARIANTS, SLOTS, Role } from './glacier-scratch.js';

/**
 * Glacial Spikes construction — the build-once half, as a prototype mixin.
 *
 * The three shard variants and their instanced meshes, the material set they are drawn with, and the particle systems the field keeps fed.
 *
 * These run once per cast from the base class's construction path, so they are
 * mixed onto the prototype at the bottom of the engine's file, before anything
 * is ever instantiated. Split out under the 800-line rule in `AGENTS.md`.
 */
export const glacierSetup = {
  createShaders() {
    const environment = this.ctx.environment;

    this.material = createGlacierMaterial(this.element);

    /** Signature of the geometry controls, so a rebuild only happens on a change. */
    this._shapeKey = '';

    this.meshes = [];
    this.seedAttributes = [];
    this.birthAttributes = [];
    this.growAttributes = [];
    this.shatterAttributes = [];

    for (let v = 0; v < VARIANTS; v++) {
      const geometry = this._buildGeometry(v);

      const seeds = new InstancedBufferAttribute(new Float32Array(SLOTS), 1);
      const births = new InstancedBufferAttribute(new Float32Array(SLOTS), 1);
      const grows = new InstancedBufferAttribute(new Float32Array(SLOTS), 1);
      const shatters = new InstancedBufferAttribute(new Float32Array(SLOTS), 1);
      for (let i = 0; i < SLOTS; i++) seeds.array[i] = Math.random() * 10;
      geometry.setAttribute('aSeed', seeds);
      geometry.setAttribute('aBirth', births);
      geometry.setAttribute('aGrow', grows);
      geometry.setAttribute('aShatter', shatters);

      const mesh = new InstancedMesh(geometry, this.material, SLOTS);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      mesh.count = 0;
      // Solid world geometry: it belongs in the depth prepass so the mist, the
      // snow and the curtain all fade softly where they intersect it.
      mesh.layers.set(LAYER.WORLD);
      mesh.renderOrder = 2;
      this.group.add(mesh);

      this.meshes.push(mesh);
      this.seedAttributes.push(seeds);
      this.birthAttributes.push(births);
      this.growAttributes.push(grows);
      this.shatterAttributes.push(shatters);
    }

    /* ---- the sheet of ice on the floor ---- */
    this.fieldGeometry = new PlaneGeometry(1, 1, 1, 1).rotateX(-Math.PI / 2);
    this.fieldMaterial = createFrostFieldMaterial(this.element);
    this.field = new Mesh(this.fieldGeometry, this.fieldMaterial);
    this.field.name = 'FrostField';
    this.field.layers.set(LAYER.VFX);
    this.field.renderOrder = 7; // over the decals, under the crystals
    this.field.frustumCulled = false;
    this.field.visible = false;
    this.group.add(this.field);

    /* ---- the curtain of cold air standing on the boundary ---- */
    // Open-ended unit cylinder: radius 1, height 1 about the origin, so placing
    // it is a scale and a lift. The flare and the billow happen in the shader.
    this.veilGeometry = new CylinderGeometry(1, 1, 1, 72, 12, true);
    this.veilMaterial = createFrostVeilMaterial(this.element);
    this.veil = new Mesh(this.veilGeometry, this.veilMaterial);
    this.veil.name = 'FrostVeil';
    this.veil.layers.set(LAYER.VFX);
    this.veil.renderOrder = 9;
    this.veil.frustumCulled = false;
    this.veil.visible = false;
    this.group.add(this.veil);

    /**
     * Fixed-size record pool — a cast allocates nothing.
     *
     * See the class comment: dice only, no dimensions.
     */
    this.records = [];
    for (let i = 0; i < MAX_SPIKES; i++) {
      this.records.push({
        role: Role.SKIRT,
        angle: 0, // bearing about the centre, radians
        radial: 0, // RING: -1..1 seat jitter. SKIRT: 0..1 across the band. CORE: 0..1 out
        late: false, // held back to push up during the hold
        rubble: false, // demoted to ankle-height wreckage
        heightJitter: 0,
        radiusJitter: 0,
        leanJitter: 0,
        fanJitter: 0, // -1..1 splay off its own radius
        yaw: 0,
        stagger: 0, // 0..1 of the per-role scatter
        eruptTime: -1, // absolute age it was triggered at, or -1
        breached: false,
        crumbled: false
      });
    }

    this._activeCount = 0;
    this._drawn = 0;
    /** Re-rolled per cast so no two crowns draw the same ring. */
    this._seed = 0;
    /** Seconds since the crown started opening. Drives the bloom, nothing else. */
    this._openTime = 0;
    /** Bearing the front arrived on — where the sweep starts. */
    this._entryAngle = 0;
    this._frostDistance = 0;

    // Scratch state handed to the two shaders each frame. One object apiece,
    // reused — syncing a standing crown allocates nothing.
    this._state = { centre: new Vector3() };
    this._fieldState = { radius: 1, quadSize: 1, freeze: 0, fade: 1, seed: 0 };
    this._veilState = { fade: 1, seed: 0 };
  },

  _buildGeometry(variant) {
    const c = this.config;
    return createCrystalGeometry({
      seed: 3.9 + variant * 17.3,
      sides: c.facets,
      taper: c.taper,
      roughness: c.roughness,
      bend: c.bend
    });
  },

  _syncGeometry() {
    const c = this.config;
    const key = `${Math.round(c.facets)}|${c.taper.toFixed(3)}|${c.roughness.toFixed(3)}|${c.bend.toFixed(3)}`;
    if (key === this._shapeKey) return;
    this._shapeKey = key;

    for (let v = 0; v < VARIANTS; v++) {
      const mesh = this.meshes[v];
      const previous = mesh.geometry;
      const geometry = this._buildGeometry(v);
      // The per-instance attributes are state, not shape — carry them over.
      geometry.setAttribute('aSeed', this.seedAttributes[v]);
      geometry.setAttribute('aBirth', this.birthAttributes[v]);
      geometry.setAttribute('aGrow', this.growAttributes[v]);
      geometry.setAttribute('aShatter', this.shatterAttributes[v]);
      mesh.geometry = geometry;
      previous.dispose();
    }
  },

  createParticles() {
    const particles = this.ctx.particles;

    // Cold air rolling off the ice. Non-additive: it has to *occlude*, which is
    // what gives the crown depth from the outside.
    this.mist = particles.get('glacier.mist', {
      capacity: 3600,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 1.2
    });
    this.mist.uniforms.uDrag.value = 2.1;
    this.mist.uniforms.uEndSize.value = 3.6;
    this.mist.uniforms.uSizeIn.value = 0.1;
    this.mist.uniforms.uFadeIn.value = 0.14;
    this.mist.uniforms.uFadeOut.value = 0.28;

    // Chips torn off the shards as they punch through the floor, and again as
    // they break up.
    this.shards = particles.get('glacier.shards', {
      capacity: 3000,
      shape: ParticleShape.CHIP,
      additive: false,
      lit: true,
      softFade: 0.25
    });
    this.shards.uniforms.uDrag.value = 0.2;
    this.shards.uniforms.uEndSize.value = 0.8;
    this.shards.uniforms.uFadeOut.value = 0.74;

    // The glitter lifting off the field — the same read as the Frost Lance's
    // plume, kept inside the ring here.
    this.glitter = particles.get('glacier.glitter', {
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

    // This ability's signature system: ice dust falling *through* the crown from
    // above it. Everything else in the project is thrown upward, and a slow fall
    // inside the ring is what says the air over it is freezing rather than
    // burning.
    this.snow = particles.get('glacier.snow', {
      capacity: 2600,
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

    this.mistEmitter = new RateEmitter();
    this.glitterEmitter = new RateEmitter();
    this.snowEmitter = new RateEmitter();
    this.rimeEmitter = new RateEmitter();
    this.vapourEmitter = new RateEmitter();
    this.ringEmitter = new RateEmitter();
  }
};
