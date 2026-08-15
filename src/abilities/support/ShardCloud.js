import { InstancedMesh, InstancedBufferAttribute, Matrix4, Quaternion, Vector3, Euler } from 'three';
import { LAYER } from '../../core/Layers.js';

const _matrix = new Matrix4();
const _quaternion = new Quaternion();
const _euler = new Euler();
const _scale = new Vector3();

/**
 * A pool of solid, instanced debris — the piece four of the new signatures had
 * in common.
 *
 * The Frost Lance and the Glacial Crown each own a bespoke version of this:
 * a handful of `InstancedMesh`es sharing one material, a per-instance `aSeed`
 * and `aBirth` attribute, and a rebuild whenever a *shape* control moves
 * (facet count, taper, bend — things no per-instance transform can express).
 * Written out four more times it would have been four more chances to get the
 * attribute carry-over wrong, so it lives here once.
 *
 * What it is not: a placement law. Where the shards go, how they move and when
 * they leave is the ability's business — this class only holds the buffers and
 * takes matrices.
 *
 * Usage per frame:
 *   cloud.begin();
 *   for (...) cloud.push(position, quaternion, scale, birth);
 *   cloud.end();
 *
 * Instances are dealt round-robin across `variants` meshes, so a field is built
 * out of several different generated shapes rather than one repeated silhouette.
 *
 * **Attribute contracts differ per material**, which is the one thing that has
 * to be got right here: `GlacierMaterial` reads `aSeed`/`aBirth`/`aGrow`/
 * `aShatter`, `MeteorMaterial` reads `aSeed`/`aHeat`, `IceMaterial` only
 * `aSeed`/`aBirth`. `aSeed` and `aBirth` are always present; anything else is
 * declared through `extras` and written per instance through `push`'s last
 * argument, in the same order. A material whose attribute is missing does not
 * fail loudly — it draws black — so the list is deliberately explicit.
 */
export class ShardCloud {
  /**
   * @param {object} options
   * @param {THREE.Object3D} options.parent   group the meshes are added to
   * @param {THREE.Material} options.material shared by every variant
   * @param {(variant:number) => THREE.BufferGeometry} options.build
   * @param {() => string} [options.shapeKey] signature of the shape controls
   * @param {string[]} [options.extras]       extra per-instance float attributes
   * @param {number} [options.slots]          capacity *per variant*
   * @param {number} [options.variants]       how many generated shapes to mix
   * @param {boolean} [options.shadows]       cast/receive the stage's shadows
   * @param {number} [options.layer]          LAYER.WORLD for solids
   */
  constructor({
    parent,
    material,
    build,
    shapeKey = null,
    extras = [],
    slots = 128,
    variants = 3,
    shadows = true,
    layer = LAYER.WORLD,
    renderOrder = 2
  }) {
    this.material = material;
    this.build = build;
    this.shapeKey = shapeKey;
    this.slots = slots;
    this.variants = variants;
    this.extraNames = extras;

    this.meshes = [];
    this.seeds = [];
    this.births = [];
    /** `[variant][extraIndex]` — same order as `extras`. */
    this.extras = [];
    this._counts = new Int32Array(variants);
    this._cursor = 0;
    this._shapeKey = '';

    for (let v = 0; v < variants; v++) {
      const geometry = this.build(v);

      const seeds = new InstancedBufferAttribute(new Float32Array(slots), 1);
      const births = new InstancedBufferAttribute(new Float32Array(slots), 1);
      for (let i = 0; i < slots; i++) seeds.array[i] = Math.random() * 10;
      geometry.setAttribute('aSeed', seeds);
      geometry.setAttribute('aBirth', births);

      const extraAttributes = [];
      for (const name of extras) {
        const attribute = new InstancedBufferAttribute(new Float32Array(slots), 1);
        geometry.setAttribute(name, attribute);
        extraAttributes.push(attribute);
      }
      this.extras.push(extraAttributes);

      const mesh = new InstancedMesh(geometry, material, slots);
      mesh.castShadow = shadows;
      mesh.receiveShadow = shadows;
      mesh.frustumCulled = false;
      mesh.count = 0;
      mesh.layers.set(layer);
      mesh.renderOrder = renderOrder;
      parent.add(mesh);

      this.meshes.push(mesh);
      this.seeds.push(seeds);
      this.births.push(births);
    }
  }

  /** Total instances written since the last `begin()`. */
  get count() {
    let total = 0;
    for (let v = 0; v < this.variants; v++) total += this._counts[v];
    return total;
  }

  /**
   * Regenerate the geometry when a shape control moves.
   *
   * Cheap enough to simply rebuild — a seven-sided crystal is ~130 triangles —
   * which is what keeps facet count, taper and bend live sliders rather than
   * spawn-time constants. The per-instance attributes are state, not shape, so
   * they are carried across to the new geometry.
   */
  syncShape() {
    if (!this.shapeKey) return;
    const key = this.shapeKey();
    if (key === this._shapeKey) return;
    this._shapeKey = key;

    for (let v = 0; v < this.variants; v++) {
      const mesh = this.meshes[v];
      const previous = mesh.geometry;
      const geometry = this.build(v);
      geometry.setAttribute('aSeed', this.seeds[v]);
      geometry.setAttribute('aBirth', this.births[v]);
      for (const [index, name] of this.extraNames.entries()) {
        geometry.setAttribute(name, this.extras[v][index]);
      }
      mesh.geometry = geometry;
      previous.dispose();
    }
  }

  /** Start a frame. Counts go to zero; nothing is allocated. */
  begin() {
    this._counts.fill(0);
    this._cursor = 0;
  }

  /**
   * Place one instance.
   *
   * @param {Vector3} position
   * @param {Quaternion|Euler|null} rotation
   * @param {Vector3|number} scale        uniform when a number
   * @param {number} [birth]              0..1 birth-flash amount
   * @param {number[]} [extras]           one value per name in `options.extras`
   * @returns {boolean} false when every variant is full
   */
  push(position, rotation, scale, birth = 0, extras = null) {
    const variant = this._cursor % this.variants;
    this._cursor++;
    const index = this._counts[variant];
    if (index >= this.slots) return false;
    this._counts[variant] = index + 1;

    if (rotation instanceof Euler) _quaternion.setFromEuler(rotation);
    else if (rotation) _quaternion.copy(rotation);
    else _quaternion.identity();

    if (typeof scale === 'number') _scale.setScalar(scale);
    else _scale.copy(scale);

    _matrix.compose(position, _quaternion, _scale);
    this.meshes[variant].setMatrixAt(index, _matrix);
    this.births[variant].array[index] = birth;
    if (extras) {
      const buffers = this.extras[variant];
      for (let e = 0; e < buffers.length; e++) buffers[e].array[index] = extras[e] ?? 0;
    }
    return true;
  }

  /** Convenience: yaw / pitch / roll without building an Euler at the call site. */
  pushEuler(position, yaw, pitch, roll, scale, birth = 0, extras = null) {
    _euler.set(pitch, yaw, roll, 'YXZ');
    return this.push(position, _euler, scale, birth, extras);
  }

  /** Publish the frame. */
  end() {
    for (let v = 0; v < this.variants; v++) {
      const mesh = this.meshes[v];
      mesh.count = this._counts[v];
      mesh.instanceMatrix.needsUpdate = true;
      this.births[v].needsUpdate = true;
      for (const attribute of this.extras[v]) attribute.needsUpdate = true;
    }
  }

  /** Hide everything without touching the buffers. */
  clear() {
    this._counts.fill(0);
    for (const mesh of this.meshes) mesh.count = 0;
  }

  setVisible(visible) {
    for (const mesh of this.meshes) mesh.visible = visible;
  }

  dispose() {
    for (const mesh of this.meshes) {
      mesh.geometry.dispose();
      mesh.parent?.remove(mesh);
    }
    this.meshes.length = 0;
  }
}
