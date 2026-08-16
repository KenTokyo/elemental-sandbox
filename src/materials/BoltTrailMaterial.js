import { ShaderMaterial, AdditiveBlending, Color, DoubleSide } from 'three';
import { LAYER } from '../core/Layers.js';

/**
 * The wake behind a V4 bolt: one additive strip with a soft edge and a tail
 * that runs out to nothing.
 *
 * Deliberately the smallest shader in the project. Every other trail-like
 * effect here raymarches, warps or shreds a noise field, and all of them are
 * describing something that *stands still and burns*. A bolt's wake is the
 * opposite problem: it is only ever on screen for a quarter of a second at
 * fifty metres a second, so the only two properties that survive that are the
 * silhouette and the gradient along it. Anything more elaborate is thrown away
 * by motion before it can be seen, and costs a fill-rate heavy pass to do it.
 *
 * Two of these are drawn per bolt on the same centre line — a narrow bright
 * core and a wide faint sheath — which is what gives the wake depth without a
 * volume. See `bolt-fx.js#_updateTrail`.
 *
 * The geometry comes from `RibbonGeometry` in **world space**, so the mesh must
 * be left at an identity matrix (`matrixAutoUpdate = false`).
 */
const VERTEX = /* glsl */ `
  attribute float aDist;

  varying float vAlong;
  varying float vAcross;

  void main() {
    vAlong = aDist;   // 0 at the tail, 1 at the head
    vAcross = uv.y;   // 0..1 across the ribbon
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3  uColorA;   // at the head
  uniform vec3  uColorB;   // at the tail
  uniform float uOpacity;
  uniform float uGlow;
  uniform float uTaper;    // >1 pulls the tail to a point faster
  uniform float uSoftness; // width of the feather on both lips, 0..1

  varying float vAlong;
  varying float vAcross;

  void main() {
    // Distance from the ribbon's centre line, 0 in the middle, 1 at the lips.
    float across = abs(vAcross * 2.0 - 1.0);
    float soft = clamp(uSoftness, 0.02, 0.98);
    float edge = 1.0 - smoothstep(1.0 - soft, 1.0, across);

    // The bright filament down the middle. Squared rather than linear so the
    // strip keeps a readable spine when it is only three pixels wide.
    float spine = pow(1.0 - across, 3.0);

    float along = pow(clamp(vAlong, 0.0, 1.0), max(0.05, uTaper));

    vec3 tint = mix(uColorB, uColorA, along);
    float alpha = edge * along * uOpacity;

    gl_FragColor = vec4(tint * uGlow * (0.55 + 0.9 * spine + 0.35 * along), alpha);
  }
`;

export class BoltTrailMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uColorA: { value: new Color(1, 1, 1) },
        uColorB: { value: new Color(0.2, 0.5, 1) },
        uOpacity: { value: 0.8 },
        uGlow: { value: 2.0 },
        uTaper: { value: 2.0 },
        uSoftness: { value: 0.5 }
      },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: AdditiveBlending,
      side: DoubleSide,
      toneMapped: false
    });
  }

  /** @param {import('three').Mesh} mesh put it on the VFX layer, at identity */
  static prepare(mesh) {
    mesh.frustumCulled = false;
    mesh.matrixAutoUpdate = false;
    mesh.layers.set(LAYER.VFX);
    mesh.renderOrder = 12;
    return mesh;
  }
}
