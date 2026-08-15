import { InstancedMesh, InstancedBufferAttribute, Mesh, Vector3 } from 'three';
import { createMeteorMaterial } from '../materials/MeteorMaterial.js';
import { VolumetricFireMaterial } from '../materials/VolumetricFireMaterial.js';
import { createAsteroidGeometry } from '../assets/ProceduralGeometry.js';
import { RibbonGeometry } from '../effects/RibbonGeometry.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { RateEmitter } from '../particles/ParticleEngine.js';
import { LAYER } from '../core/Layers.js';
import { frame } from '../core/FrameUniforms.js';
import { settings } from '../config/settings.js';
import { MAX_CHUNKS, SLOTS, TRAIL_NODES } from './meteor-scratch.js';

/**
 * Meteor Strike construction — the build-once half, as a prototype mixin.
 *
 * The head and its chunk instances, the ribbon the wake is drawn on, and the particle systems the trail and the crater draw from.
 *
 * These run once per cast from the base class's construction path, so they are
 * mixed onto the prototype at the bottom of the engine's file, before anything
 * is ever instantiated. Split out under the 800-line rule in `AGENTS.md`.
 */
export const meteorSetup = {
  createShaders() {
    this.material = createMeteorMaterial(this.ctx.environment, this.element);

    /** Signature of the geometry controls, so a rebuild only happens on a change. */
    this._shapeKey = '';
    this.geometry = this._buildGeometry();

    this.seeds = new InstancedBufferAttribute(new Float32Array(SLOTS), 1);
    this.heats = new InstancedBufferAttribute(new Float32Array(SLOTS), 1);
    for (let i = 0; i < SLOTS; i++) this.seeds.array[i] = Math.random() * 10;
    this.geometry.setAttribute('aSeed', this.seeds);
    this.geometry.setAttribute('aHeat', this.heats);

    // One instanced mesh for the meteor *and* its debris: same rock, same
    // shading, one draw call, and the chunks differ only by `aSeed`, which
    // offsets the crack field so no two are split the same way.
    this.rock = new InstancedMesh(this.geometry, this.material, SLOTS);
    this.rock.castShadow = true;
    this.rock.receiveShadow = true;
    this.rock.frustumCulled = false;
    this.rock.count = 0;
    // Solid world geometry: it belongs in the depth prepass so the smoke and the
    // embers fade softly where they intersect it.
    this.rock.layers.set(LAYER.WORLD);
    this.rock.renderOrder = 2;
    this.group.add(this.rock);

    /*
     * The fire trail: a burning volume along the section of arc behind the rock.
     *
     * The mesh below is *not* the flame. It is only a camera-facing proxy hull
     * around the flight path; `VolumetricFireMaterial` reconstructs the arc's
     * local frame per fragment off the ribbon's `aCenter` / `aTangent`, fires a
     * ray from the camera and integrates emission and soot absorption through
     * the field described in that file. The hull's one job is to *contain* the
     * volume — see `_updateTrail` for the padding that guarantees it.
     *
     * The centre line is *derived* from `_arcPoint`, not recorded, so the trail
     * is a live function of the trajectory settings: dragging `arc` re-lofts the
     * fire that is already in the air along with the rock making it.
     *
     * Two points beyond the sampled window pad the hull so the volume's end caps
     * are covered by geometry, hence the `+ 2` on the segment budget.
     */
    this.ribbon = new RibbonGeometry(TRAIL_NODES + 2, { frame: true });
    this.trailPoints = [];
    for (let i = 0; i <= TRAIL_NODES; i++) this.trailPoints.push(new Vector3());
    this.hullPoints = [];
    for (let i = 0; i <= TRAIL_NODES + 2; i++) this.hullPoints.push(new Vector3());
    this.trailCount = 0;

    this.trailMaterial = new VolumetricFireMaterial(this.element);
    this.trailMesh = new Mesh(this.ribbon.geometry, this.trailMaterial);
    this.trailMesh.frustumCulled = false;
    this.trailMesh.matrixAutoUpdate = false;
    this.trailMesh.layers.set(LAYER.VFX);
    // After the non-additive smoke (10) so the plume can occlude it, before the
    // additive particles (12) so embers in front are not dimmed by its
    // absorption.
    this.trailMesh.renderOrder = 11;
    this.group.add(this.trailMesh);

    /**
     * Fixed-size record pool — an impact allocates nothing.
     *
     * See the class comment: dice only, no dimensions.
     */
    this.chunks = [];
    for (let i = 0; i < MAX_CHUNKS; i++) {
      this.chunks.push({
        angle: 0, // bearing of the ejecta, radians
        elevation: 0, // 0..1 of the loft cone
        speed: 0, // 0..1 speed jitter
        size: 0, // 0..1 size jitter
        spin: 0, // -1..1 tumble rate
        spinAxis: new Vector3(0, 1, 0)
      });
    }

    this._chunkCount = 0;
    this._used = 0;
    this._seed = 0;
    this._tumbleAxis = new Vector3(0, 1, 0);
    /** How far along the line the trail was last paid out from. */
    this._lastU = 0;
  },

  _buildGeometry() {
    const c = this.config;
    return createAsteroidGeometry({
      seed: 11.7,
      detail: c.facets,
      lumpiness: c.lumpiness,
      noiseScale: c.lumpScale,
      roughness: c.surfaceRoughness,
      cuts: c.cuts,
      cutDepth: c.cutDepth,
      craters: c.craters,
      craterDepth: c.craterDepth,
      craterSize: c.craterSize
    });
  },

  _syncGeometry() {
    const c = this.config;
    const key = [
      Math.round(c.facets),
      c.lumpiness.toFixed(3),
      c.lumpScale.toFixed(3),
      c.surfaceRoughness.toFixed(3),
      Math.round(c.cuts),
      c.cutDepth.toFixed(3),
      Math.round(c.craters),
      c.craterDepth.toFixed(3),
      c.craterSize.toFixed(3)
    ].join('|');
    if (key === this._shapeKey) return;
    this._shapeKey = key;

    const previous = this.geometry;
    this.geometry = this._buildGeometry();
    // The per-instance attributes are state, not shape — carry them over.
    this.geometry.setAttribute('aSeed', this.seeds);
    this.geometry.setAttribute('aHeat', this.heats);
    this.rock.geometry = this.geometry;
    previous.dispose();
  },

  createParticles() {
    const particles = this.ctx.particles;

    // Embers streaming off the rock. Buoyant, so the trail rises and hangs.
    this.embers = particles.get('meteor.embers', {
      capacity: 4000,
      shape: ParticleShape.SOFT,
      additive: true,
      curl: true,
      softFade: 0.4
    });
    this.embers.uniforms.uDrag.value = 1.2;
    this.embers.uniforms.uEndSize.value = 0.06;
    this.embers.uniforms.uSizeIn.value = 0.05;
    this.embers.uniforms.uFadeIn.value = 0.05;
    this.embers.uniforms.uFadeOut.value = 0.3;

    // Sparks: velocity-stretched streaks under gravity.
    this.sparks = particles.get('meteor.sparks', {
      capacity: 3000,
      shape: ParticleShape.STREAK,
      additive: true,
      stretch: true,
      softFade: 0.25
    });
    this.sparks.uniforms.uDrag.value = 0.7;
    this.sparks.uniforms.uEndSize.value = 0.25;
    this.sparks.uniforms.uSizeIn.value = 0.02;
    this.sparks.uniforms.uFadeOut.value = 0.5;

    // The smoke column. Non-additive: it has to *occlude*, which is what gives
    // the trail and the crater depth.
    this.smoke = particles.get('meteor.smoke', {
      capacity: 2600,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 1.2
    });
    this.smoke.uniforms.uDrag.value = 1.7;
    this.smoke.uniforms.uEndSize.value = 3.6;
    this.smoke.uniforms.uSizeIn.value = 0.12;
    this.smoke.uniforms.uFadeIn.value = 0.18;
    this.smoke.uniforms.uFadeOut.value = 0.32;

    // Grit blown off the floor. Lit, so it reads as rock rather than as light.
    this.debris = particles.get('meteor.debris', {
      capacity: 1800,
      shape: ParticleShape.CHIP,
      additive: false,
      lit: true,
      softFade: 0.25
    });
    this.debris.uniforms.uDrag.value = 0.25;
    this.debris.uniforms.uEndSize.value = 0.85;
    this.debris.uniforms.uFadeOut.value = 0.72;

    this.emberEmitter = new RateEmitter();
    this.sparkEmitter = new RateEmitter();
    this.smokeEmitter = new RateEmitter();
  }
};
