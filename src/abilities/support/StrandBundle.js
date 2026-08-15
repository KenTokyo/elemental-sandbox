import { Mesh } from 'three';
import { createBoltRibbonGeometry } from '../../assets/ProceduralGeometry.js';
import { createStrandMaterial, syncStrandLook, StrandPass } from '../../materials/StrandMaterial.js';
import { LAYER } from '../../core/Layers.js';

/**
 * A bundle of instanced ribbons drawn twice — hot cores over a wide halo.
 *
 * Five of the new signatures draw filaments of some kind, and all five want the
 * same three things: one strip geometry shared by both passes, a live instance
 * count, and one place to write a uniform so the two passes can never drift.
 * `set()` is deliberately the only way in: writing a path uniform to the core
 * pass and forgetting the glow is the classic way this technique produces a
 * halo that has come off its filament.
 */
export class StrandBundle {
  /**
   * @param {THREE.Object3D} parent
   * @param {number} mode      StrandMode.*
   * @param {object} [options]
   * @param {number} [options.nodes]     samples along one strand
   * @param {number} [options.capacity]  instance ceiling
   */
  constructor(parent, mode, { nodes = 56, capacity = 32, renderOrder = 11 } = {}) {
    this.geometry = createBoltRibbonGeometry(nodes, capacity);
    this.capacity = capacity;

    this.glow = createStrandMaterial(mode, StrandPass.GLOW);
    this.core = createStrandMaterial(mode, StrandPass.CORE);
    this.passes = [this.core, this.glow];

    this.meshes = [];
    // Halo first so the cores land on top of it.
    for (const [index, material] of [this.glow, this.core].entries()) {
      const mesh = new Mesh(this.geometry, material);
      mesh.frustumCulled = false;
      mesh.matrixAutoUpdate = false;
      mesh.layers.set(LAYER.VFX);
      mesh.renderOrder = renderOrder + index * 2;
      parent.add(mesh);
      this.meshes.push(mesh);
    }

    this.count = capacity;
  }

  /** Live strand count. Everything above it simply is not drawn. */
  setCount(count) {
    this.count = Math.max(0, Math.min(this.capacity, Math.round(count)));
    this.geometry.instanceCount = this.count;
    this.set('uCount', Math.max(1, this.count));
    for (const mesh of this.meshes) mesh.visible = this.count > 0;
  }

  /** Write one uniform to both passes. */
  set(name, value) {
    for (const material of this.passes) {
      const uniform = material.uniforms[name];
      if (!uniform) continue;
      if (uniform.value && uniform.value.copy && typeof value === 'object') uniform.value.copy(value);
      else uniform.value = value;
    }
  }

  /** Palette, width and glow — see `syncStrandLook`. */
  syncLook(look) {
    syncStrandLook(this.passes, look);
  }

  setVisible(visible) {
    for (const mesh of this.meshes) mesh.visible = visible && this.count > 0;
  }

  dispose() {
    this.geometry.dispose();
    for (const material of this.passes) material.dispose();
    for (const mesh of this.meshes) mesh.parent?.remove(mesh);
    this.meshes.length = 0;
  }
}
