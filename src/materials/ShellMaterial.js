import {
  ShaderMaterial,
  AdditiveBlending,
  NormalBlending,
  Color,
  DoubleSide,
  FrontSide
} from 'three';
import { noiseGLSL } from '../shaders/lib/noise.glsl.js';
import { commonGLSL } from '../shaders/lib/common.glsl.js';
import { sharedUniforms } from '../core/FrameUniforms.js';

/**
 * One surface shader, four bodies.
 *
 * The V20.3 signatures needed four things the project could not draw: a shell
 * of freezing air *standing* over a footprint, a hole that subtracts light, a
 * churning plasma core, and a lit membrane stretched across a ring. All four
 * are the same problem — a closed surface eroded by noise, lit almost entirely
 * by its own silhouette — so they are the same material at four `#define`s.
 *
 *   FROST_DOME  Absolute Zero   crystallises into plates, then breaks up
 *   HORIZON     Gravity Well    near-black body, one hard ring of light
 *   PLASMA_CORE Plasma Bloom    filaments churning under a bright rim
 *   MEMBRANE    Boreal Gate     a flat sheet with an aurora wound through it
 *
 * Blending is part of the body, not a caller's choice: the dome and the core
 * *add* light, the horizon and the membrane have to be able to take it away, so
 * those two use normal blending with an alpha they drive themselves. Both write
 * into a half-float target, so a rim can still be brighter than white.
 *
 * Geometry expectations: the three volumes want a unit icosphere (the ability
 * scales it to metres); MEMBRANE wants a unit disc in its own XY plane.
 */
export const ShellMode = Object.freeze({
  FROST_DOME: 0,
  HORIZON: 1,
  PLASMA_CORE: 2,
  MEMBRANE: 3
});

const SHELL_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uAge;        // 0..1 through the shell's own life
  uniform float uProgress;   // 0..1 build-out
  uniform float uScale;      // noise features over the surface
  uniform float uSpeed;
  uniform float uTurbulence; // how far the noise pushes the surface off round
  uniform float uSeed;

  varying vec3  vLocal;
  varying vec3  vNormalW;
  varying vec3  vViewDir;
  varying float vDisp;
  varying float vViewZ;
  varying vec2  vUv;

  ${noiseGLSL}

  void main() {
    vUv = uv;
    vLocal = position;

    #if SHELL_MODE == 3
      // A flat sheet: it is not displaced at all, only shaded. Pushing a disc
      // around in its own plane would tear the silhouette off the ring it is
      // stretched across.
      float n = 0.0;
      vec3 pos = position;
    #else
      vec3 np = normal * uScale + vec3(uSeed * 7.0) + vec3(0.0, uTime * uSpeed, 0.0);
      float n = fbm4(np) * 0.65 + ridged(np * 1.4, 4) * 0.35 - 0.35;
      vec3 pos = position + normal * n * uTurbulence * (0.4 + 0.6 * uProgress);
    #endif

    vDisp = n;

    vec4 world = modelMatrix * vec4(pos, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = cameraPosition - world.xyz;

    vec4 mv = viewMatrix * world;
    vViewZ = mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const SHELL_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uAge;
  uniform float uProgress;
  uniform float uSeed;
  uniform float uScale;
  uniform float uSpeed;
  uniform float uPlates;     // FROST: crystallisation  PLASMA: filament sharpness
  uniform float uRim;        // fresnel exponent
  uniform float uRimGain;
  uniform float uWarp;       // HORIZON/MEMBRANE: how far the field is dragged round
  uniform float uSpin;       // turns/second the field rolls
  uniform float uDepth;      // MEMBRANE: how far into it you can see
  uniform float uRings;      // MEMBRANE: pressure rings across the sheet
  uniform float uRingSpeed;
  uniform float uBands;      // PLASMA: filament frequency
  uniform float uPulse;
  uniform float uPulseSpeed;
  uniform float uDissolve;   // 0..1 how far the surface has come apart
  uniform float uOpacity;
  uniform float uGlow;
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform vec3  uColorC;
  uniform float uSoftFade;
  uniform float uGlobalGlow;
  uniform float uShaderIntensity;
  uniform vec2  uResolution;
  uniform sampler2D uSceneDepth;
  uniform float uCameraNear;
  uniform float uCameraFar;

  varying vec3  vLocal;
  varying vec3  vNormalW;
  varying vec3  vViewDir;
  varying float vDisp;
  varying float vViewZ;
  varying vec2  vUv;

  ${noiseGLSL}
  ${commonGLSL}

  const float TAU = 6.283185307;

  void main() {
    float fres = fresnelTerm(vViewDir, vNormalW, uRim, 1.0);
    float heat = clamp(vDisp * 0.5 + 0.5, 0.0, 1.0);

    vec3 color;
    float alpha;

    #if SHELL_MODE == 0                                  /* FROST_DOME */
      // Vapour that has frozen: the shell is empty between plates and glassy on
      // them, so it reads as something the cold *built* rather than as a bubble.
      vec2 cell = voronoi2(vNormalW.xy * uScale * 2.2 + vNormalW.z * 3.0 + uSeed);
      float plates = smoothstep(0.55, 0.05, cell.x) * uPlates;
      float rime = smoothstep(0.35, 0.9, heat);
      float rim = pow(clamp(fres, 0.0, 1.0), 1.0) * uRimGain;

      // The plates come away one cell at a time on the way out.
      float gone = step(cell.y, uDissolve);
      float breaking = smoothstep(0.0, 0.12, uDissolve - cell.y) * (1.0 - step(cell.y + 0.14, uDissolve));

      color = mix(uColorA, uColorB, rime * 0.85 + plates * 0.5);
      color += uColorC * (rim + plates * 0.35 + breaking * 2.2);
      alpha = (0.06 + rim * 0.9 + plates * 0.55 + rime * 0.18) * (1.0 - gone);
      alpha *= smoothstep(0.0, 0.25, uProgress);

    #elif SHELL_MODE == 1                                /* HORIZON */
      // A hole: the body is very nearly black and *opaque*, and everything you
      // can see is the ring where light is bent around it. Normal blending, so
      // this genuinely removes the scene behind it.
      float ndv = clamp(dot(normalize(vNormalW), normalize(vViewDir)), 0.0, 1.0);
      float ring = pow(1.0 - ndv, uRim);
      float swirl = fbm3(vec3(vLocal.xy * uScale + vec2(uTime * uSpin), vLocal.z * uScale + uSeed));
      float smear = smoothstep(0.2, 0.95, ring + swirl * uWarp * 0.5);

      color = mix(uColorA, uColorB, smear * 0.8);
      color += uColorC * pow(ring, 1.6) * uRimGain;
      // Opaque through the middle, feathered at the very edge so the ring has
      // something to sit on instead of ending on a hard circle.
      alpha = clamp(0.35 + 0.85 * ndv + ring * 0.6, 0.0, 1.0);
      alpha *= smoothstep(0.0, 0.2, uProgress) * (1.0 - uDissolve);

    #elif SHELL_MODE == 2                                /* PLASMA_CORE */
      float throb = 1.0 + uPulse * sin(uTime * uPulseSpeed + uSeed * 5.0);
      float fil = ridged(vNormalW * uBands + vec3(0.0, uTime * uSpeed * 2.0, 0.0) + uSeed, 4);
      float threads = smoothstep(0.62, 0.96, fil) * uPlates;
      float rim = pow(clamp(fres, 0.0, 1.0), 1.0) * uRimGain;

      color = mix(uColorA, uColorB, heat * 0.7 + threads * 0.6);
      color += uColorC * (rim * 0.9 + threads * 1.6);
      color *= throb;
      alpha = clamp(0.4 + rim * 0.7 + threads * 0.5, 0.0, 1.0);
      alpha *= smoothstep(0.0, 0.15, uProgress) * (1.0 - uDissolve);

    #else                                                /* MEMBRANE */
      // A sheet stretched across a ring: an aurora wound about its own centre,
      // over an interior dark enough to read as somewhere else.
      vec2 q = vLocal.xy;
      float r = clamp(length(q), 0.0, 1.0);
      float a = atan(q.y, q.x);

      // Winding the lookup by radius is what turns fbm into a vortex rather
      // than a cloud stuck to a disc.
      float wound = a + uWarp * (1.0 - r) * TAU * 0.5 + uTime * uSpin * TAU;
      vec2 p = vec2(cos(wound), sin(wound)) * r * uScale;
      float curtain = fbm3(vec3(p, uTime * uSpeed + uSeed));
      float sheets = smoothstep(0.0, 0.55, curtain) * (1.0 - r * 0.35);

      float rings = smoothstep(0.82, 1.0, sin((r * uRings - uTime * uRingSpeed) * TAU) * 0.5 + 0.5);
      float edge = smoothstep(1.0, 0.86, r) * smoothstep(0.86, 0.99, r);
      float interior = 1.0 - smoothstep(0.9, 1.0, r);

      color = mix(uColorA, uColorB, sheets * uDepth);
      color += uColorC * (rings * 0.8 + edge * 2.4 + pow(sheets, 2.0) * 1.2);
      alpha = interior * (0.55 + sheets * 0.5 + rings * 0.3) + edge * 0.9;
      alpha *= smoothstep(0.0, 0.3, uProgress) * (1.0 - uDissolve);
    #endif

    alpha = clamp(alpha * uOpacity, 0.0, 1.0);
    if (alpha < 0.004) discard;

    vec2 screenUV = gl_FragCoord.xy / uResolution;
    alpha *= softFade(uSceneDepth, screenUV, vViewZ, uCameraNear, uCameraFar, uSoftFade);
    if (alpha < 0.004) discard;

    color *= uGlow * uGlobalGlow * mix(0.7, 1.0, uShaderIntensity);
    gl_FragColor = vec4(color, alpha);
  }
`;

/** @param {number} mode ShellMode.* */
export function createShellMaterial(mode = ShellMode.FROST_DOME) {
  // The two bodies that have to be able to *remove* light cannot be additive.
  const subtractive = mode === ShellMode.HORIZON || mode === ShellMode.MEMBRANE;

  return new ShaderMaterial({
    defines: { SHELL_MODE: mode },
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: subtractive ? NormalBlending : AdditiveBlending,
    side: mode === ShellMode.HORIZON ? FrontSide : DoubleSide,
    toneMapped: false,
    uniforms: sharedUniforms({
      uAge: { value: 0 },
      uProgress: { value: 0 },
      uSeed: { value: Math.random() * 10 },
      uScale: { value: 2.2 },
      uSpeed: { value: 0.4 },
      uTurbulence: { value: 0.18 },
      uPlates: { value: 0.8 },
      uRim: { value: 2.4 },
      uRimGain: { value: 2.0 },
      uWarp: { value: 0.6 },
      uSpin: { value: 0.15 },
      uDepth: { value: 0.85 },
      uRings: { value: 3.0 },
      uRingSpeed: { value: 0.6 },
      uBands: { value: 5.0 },
      uPulse: { value: 0.12 },
      uPulseSpeed: { value: 5.0 },
      uDissolve: { value: 0 },
      uOpacity: { value: 1 },
      uGlow: { value: 1.4 },
      uColorA: { value: new Color(0.05, 0.2, 0.35) },
      uColorB: { value: new Color(0.55, 0.9, 1) },
      uColorC: { value: new Color(1, 1, 1) },
      uSoftFade: { value: 0.8 }
    }),
    vertexShader: SHELL_VERTEX,
    fragmentShader: SHELL_FRAGMENT
  });
}
