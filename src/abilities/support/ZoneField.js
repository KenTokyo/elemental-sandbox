import { Mesh, PlaneGeometry, Vector3 } from 'three';
import { createSnareFieldMaterial } from '../../materials/SnareMaterial.js';
import { LAYER } from '../../core/Layers.js';

const _centre = new Vector3();

/**
 * The lit disc a far cast burns into the floor.
 *
 * The Voltaic Snare introduced it and every far cast since has wanted the same
 * thing: the circle the indicator drew, made real, re-scaled from `zoneRadius`
 * *while the ability is standing* rather than captured at spawn. That is the
 * whole reason it is an ability-owned mesh instead of a decal, and it is why it
 * is worth having once here instead of six times.
 *
 * The quad is a little wider than the footprint so the boundary band and the
 * ticks that hang outside it are not clipped by their own geometry.
 */
export class ZoneField {
  /**
   * @param {THREE.Object3D} parent  the ability's group
   * @param {string} element         which settings block the `field*` family is read from
   */
  constructor(parent, element) {
    this.geometry = new PlaneGeometry(1, 1, 1, 1).rotateX(-Math.PI / 2);
    this.material = createSnareFieldMaterial(element);
    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.name = `ZoneField:${element}`;
    this.mesh.layers.set(LAYER.VFX);
    this.mesh.renderOrder = 7; // over the ground decals, under everything lit
    this.mesh.frustumCulled = false;
    parent.add(this.mesh);

    this._state = { radius: 1, quadSize: 1, fade: 1, seed: 0 };
    this.seed = 0;
  }

  /** Re-roll the disc's noise. One number per cast — the only thing captured. */
  reseed() {
    this.seed = Math.random() * 100;
    this.mesh.rotation.y = Math.random() * Math.PI * 2;
  }

  /**
   * @param {THREE.Vector3} centre on the floor
   * @param {number} radius        metres
   * @param {number} fade          1 while lit, → 0 as it goes
   * @param {number} [height]      hover distance above the floor
   */
  update(centre, radius, fade, height = 0.03) {
    const quad = Math.max(0.2, radius * 2.42);
    _centre.copy(centre);

    this.mesh.position.set(_centre.x, height, _centre.z);
    this.mesh.scale.set(quad, 1, quad);

    const state = this._state;
    state.radius = radius;
    state.quadSize = quad;
    state.fade = fade;
    state.seed = this.seed;
    this.material.userData.sync(state);
  }

  setVisible(visible) {
    this.mesh.visible = visible;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.mesh.parent?.remove(this.mesh);
  }
}
