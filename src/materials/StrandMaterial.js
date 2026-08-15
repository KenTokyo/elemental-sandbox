import { ShaderMaterial, AdditiveBlending, Color, Vector3, DoubleSide } from 'three';
import { noiseGLSL } from '../shaders/lib/noise.glsl.js';
import { commonGLSL } from '../shaders/lib/common.glsl.js';
import { sharedUniforms } from '../core/FrameUniforms.js';

/**
 * One instanced ribbon, six different paths.
 *
 * The Storm Lance and the Voltaic Snare each solved the same problem — draw N
 * filaments with one draw call, and put the *entire* path in the vertex shader
 * so the CPU never holds a metre of it. This material generalises that solution
 * to the shapes the V20.3 signatures needed and that nothing in the project
 * could already draw:
 *
 *   HELIX     ribbons wound around a vertical cone     Shard Cyclone, Sandstorm Coil
 *   CRESCENT  arcs cut through the air on a beat       Spectral Blades
 *   SHAFT     streaks falling into a footprint         Celestial Rain
 *   RAY       shafts thrown through a standing plane   Boreal Gate
 *   ORBIT     ribbons spiralling in a raked disc       Gravity Well
 *   ARC       great circles whipping around a body     Plasma Bloom
 *
 * The geometry is the bolt's strip — `position = (t, side, 0)` with `aStrand`
 * as the instance index — so a strand's identity is a *hash of its index* and
 * nothing else. That is what keeps every one of these free of per-frame CPU
 * work and, more importantly, live under the editor: dragging the cone's
 * curvature re-winds ribbons that are already in the air, with the clock
 * stopped, because there is no captured path to be stale.
 *
 * Two passes per effect, exactly as the bolt does it: a narrow hot CORE and a
 * wide, faint GLOW behind it. Stacking one shader at two widths is what gives
 * a filament a halo without a second geometry or a blur.
 *
 * Uniform names are shared across modes; where a mode reads one differently it
 * is called out in the table at the uniform block.
 */
export const StrandMode = Object.freeze({
  HELIX: 0,
  CRESCENT: 1,
  SHAFT: 2,
  RAY: 3,
  ORBIT: 4,
  ARC: 5
});

export const StrandPass = Object.freeze({
  CORE: 0,
  GLOW: 1
});

const STRAND_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uAge;          // seconds since the cast started
  uniform float uProgress;     // 0..1 build-out of the whole effect
  uniform float uFade;         // 1 → 0 as it leaves
  uniform float uSeed;

  uniform vec3  uOrigin;       // the effect's anchor, on the floor
  uniform vec3  uForward;      // unit, flat
  uniform vec3  uSideAxis;     // unit, flat, = forward × up

  uniform float uCount;        // live strands, for spacing derived from the index
  uniform float uRadius;       // HELIX/RAY/ORBIT/ARC: the footprint  SHAFT: the disc
  uniform float uHeight;       // HELIX: cone height  SHAFT: release height  ORBIT/ARC: hover
  uniform float uLength;       // CRESCENT: cast length  SHAFT/RAY: streak length
  uniform float uBase;         // HELIX: floor radius ×  ORBIT: inner lip ×
  uniform float uTop;          // HELIX: crest radius ×  ORBIT: outer lip ×
  uniform float uCurve;        // HELIX: how late the cone opens
  uniform float uLean;         // HELIX: downrange lean  SHAFT: tilt off vertical
  uniform float uTurns;        // HELIX: turns over the climb
  uniform float uSpin;         // HELIX: angular velocity left at the crest
  uniform float uSpeed;        // turns/second, or metres/second for SHAFT
  uniform float uSpan;         // CRESCENT/ORBIT/ARC: arc covered  RAY: cone spread
  uniform float uTilt;         // CRESCENT: roll spread  ORBIT: rake  ARC: inclination
  uniform float uSweep;        // CRESCENT: radians travelled while lit
  uniform float uInterval;     // CRESCENT: seconds between strokes  SHAFT: 1/rate
  uniform float uLife;         // CRESCENT: seconds one stroke is lit
  uniform float uPhase;        // whole-effect angular offset (drives the echo pass)
  uniform float uInset;        // SHAFT: how far inside the boundary one may land

  uniform float uWidth;        // half-width, metres
  uniform float uWidthTip;     // ... at the far end, as a multiple
  uniform float uWidthCurve;
  uniform float uJitter;       // kink amplitude, metres
  uniform float uJitterScale;
  uniform float uCrawl;        // how fast the kinks slide along a strand
  uniform float uDim;          // how much dimmer an outer/late strand is

  attribute float aStrand;

  varying float vT;
  varying float vSide;
  varying float vBright;
  varying float vRandom;
  varying float vViewZ;

  ${noiseGLSL}

  const float TAU = 6.283185307;
  const vec3  UP  = vec3(0.0, 1.0, 0.0);

  float rnd(float n) { return hash11(n * 1.7 + uSeed * 13.3); }

  /* ------------------------------------------------------------------ */
  /* Per-strand constants                                                */
  /* ------------------------------------------------------------------ */

  /**
   * Everything a strand needs to know about itself, packed into two vectors.
   * Derived from the index, never uploaded: the CPU cannot desynchronise from
   * something it does not hold.
   *
   *   a.x  primary phase / roll     a.y  radius or reach     a.z  timing offset
   *   a.w  brightness bias          b.x  secondary angle     b.y  extra jitter
   */
  void strandConstants(float s, out vec4 a, out vec4 b) {
    a.x = rnd(s + 1.0) * TAU;
    a.y = rnd(s + 2.0);
    a.z = rnd(s + 3.0);
    a.w = 0.55 + 0.45 * rnd(s + 4.0);
    b.x = rnd(s + 5.0) * TAU;
    b.y = rnd(s + 6.0) * 2.0 - 1.0;
    b.z = rnd(s + 7.0);
    b.w = rnd(s + 8.0);
  }

  /** The kink every strand carries, so nothing here is a clean mathematical wire. */
  vec3 kink(float t, float s, vec3 tangent) {
    if (uJitter <= 0.0) return vec3(0.0);
    vec3 n1 = normalize(cross(tangent, UP) + vec3(1e-4));
    vec3 n2 = normalize(cross(tangent, n1));
    float p = t * uJitterScale + uTime * uCrawl + s * 7.3 + uSeed;
    // Pinched at both ends: a strand is pulled straight where it is anchored.
    float pinch = smoothstep(0.0, 0.14, t) * smoothstep(0.0, 0.14, 1.0 - t);
    return (n1 * snoise(vec3(p, s * 3.1, 0.0)) + n2 * snoise(vec3(0.0, s * 5.7, p))) *
           uJitter * pinch;
  }

  /* ------------------------------------------------------------------ */
  /* The paths                                                           */
  /* ------------------------------------------------------------------ */

  vec3 pathAt(float t, float s, vec4 a, vec4 b, out float bright) {
    t = clamp(t, 0.0, 1.0);
    bright = a.w;
    vec3 p = uOrigin;

    #if STRAND_MODE == 0                                   /* HELIX */
      // A cone that opens with height, sheared: fast at the floor, slower at
      // the crest, which is what makes a column read as *turning* rather than
      // as a rotating solid.
      float h = t;
      float r = mix(uBase, uTop, pow(h, uCurve)) * uRadius;
      r *= 1.0 + uJitter * 0.6 * sin(h * uJitterScale * TAU + a.x + uTime * uCrawl);
      float shear = mix(1.0, uSpin, h);
      float ang = a.x + uPhase + uTurns * h * TAU + uTime * uSpeed * TAU * shear;
      p += uSideAxis * (cos(ang) * r) + uForward * (sin(ang) * r);
      p.y += h * uHeight;
      p += uForward * (uLean * h * uHeight);
      // The build-out climbs: the ribbons are drawn out of the floor.
      bright *= smoothstep(uProgress + 0.05, uProgress - 0.35, h);

    #elif STRAND_MODE == 1                                 /* CRESCENT */
      // One stroke per strand, arriving on its own beat. The whole schedule is
      // a function of the index, so the CPU holds no queue at all.
      float start = s * uInterval;
      float local = (uAge - start) / max(uLife, 1e-3);
      bright *= smoothstep(0.0, 0.12, local) * (1.0 - smoothstep(0.45, 1.0, local));
      bright *= step(0.0, local);

      float along = (s + 0.85) / max(uCount, 1.0);
      vec3 centre = uOrigin + uForward * (along * uLength) + UP * (uHeight + b.y * 0.6);

      float roll = (a.y * 2.0 - 1.0) * uTilt + uPhase;
      float pitch = b.y * uSpan * 0.18;
      vec3 e1 = uSideAxis * cos(roll) + UP * sin(roll);
      vec3 e2 = -uSideAxis * sin(roll) + UP * cos(roll);
      e2 = normalize(e2 * cos(pitch) + uForward * sin(pitch));

      float travel = uSweep * clamp(local, 0.0, 1.2);
      float theta = (t - 0.5) * uSpan + travel + a.x * 0.15;
      float radius = uRadius * (0.75 + 0.5 * a.y);
      p = centre + (e1 * cos(theta) + e2 * sin(theta)) * radius;

    #elif STRAND_MODE == 2                                 /* SHAFT */
      // Each strand falls again and again; which drop it is on is arithmetic on
      // the clock, so a shaft and the burst the ability spawns where it lands
      // are computed from the same closed form on both sides.
      float period = max(uCount * uInterval, 1e-3);
      float x = (uAge - s * uInterval) / period;
      float cycle = floor(x);
      float local = (x - cycle) * period;
      bright *= step(0.0, x);

      float seedA = s * 37.0 + cycle * 91.0;
      float rr = sqrt(hash11(seedA + uSeed)) * uRadius * uInset;
      float aa = hash11(seedA + 5.3 + uSeed) * TAU;
      vec3 landing = uOrigin + uSideAxis * (cos(aa) * rr) + uForward * (sin(aa) * rr);

      float headY = uHeight - local * uSpeed;
      // t = 0 at the head, 1 at the tail, so the taper reads as motion blur.
      float y = headY + t * uLength;
      vec3 tilt = uForward * (uLean * y);
      p = landing + UP * max(y, 0.0) + tilt;
      // Lit while it falls, gone shortly after the head reaches the floor.
      bright *= (1.0 - smoothstep(-0.15, -0.55, headY)) * smoothstep(uHeight + 0.5, uHeight - 1.5, y);

    #elif STRAND_MODE == 3                                 /* RAY */
      // Shafts thrown out of a standing plane, spreading into a shallow cone.
      float rr = sqrt(a.y) * uRadius * 0.72;
      float aa = b.x + uTime * uSpeed * 0.35;
      vec3 offset = uSideAxis * (cos(aa) * rr) + UP * (sin(aa) * rr);
      float reach = t * uLength;
      p = uOrigin + UP * uHeight + offset * (1.0 + uSpan * t) + uForward * reach;
      // A slow sweep so the shafts pulse rather than stand still.
      bright *= 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * uSpeed * TAU + a.x), 2.0);
      bright *= smoothstep(0.0, 0.25, uProgress) * (1.0 - smoothstep(0.75, 1.0, t));

    #elif STRAND_MODE == 4                                 /* ORBIT */
      // An inclined disc whose ribbons spiral inward. The angular velocity goes
      // up as the radius comes down, which is the shear that makes a disc read
      // as accreting instead of as a spinning plate.
      float fall = fract(a.z + uAge * 0.22);
      float r = mix(uTop, uBase, fall) * uRadius;
      vec3 e1 = uSideAxis;
      vec3 e2 = normalize(uForward * cos(uTilt) + UP * sin(uTilt));
      float ang = a.x + uPhase + t * uSpan + uTime * uSpeed * TAU * (uBase * uRadius / max(r, 0.35));
      p = uOrigin + UP * uHeight + (e1 * cos(ang) + e2 * sin(ang)) * r;
      p += UP * (b.y * uJitter * 0.5);
      bright *= (1.0 - fall * 0.55) * smoothstep(0.0, 0.3, uProgress);

    #else                                                  /* ARC */
      // Great circles on random axes — the arcs whipping around a bloom.
      float incl = (a.y * 2.0 - 1.0) * uTilt;
      vec3 axis = normalize(uForward * cos(b.x) + uSideAxis * sin(b.x) + UP * incl);
      vec3 e1 = normalize(cross(axis, UP) + vec3(1e-4));
      vec3 e2 = normalize(cross(axis, e1));
      float ang = a.x + uPhase + (t - 0.5) * uSpan * TAU + uTime * uSpeed * TAU;
      float r = uRadius * (0.7 + 0.5 * b.z);
      p = uOrigin + UP * uHeight + (e1 * cos(ang) + e2 * sin(ang)) * r;
      bright *= smoothstep(0.0, 0.2, uProgress);
    #endif

    return p;
  }

  void main() {
    float t = position.x;
    float side = position.y;
    float s = aStrand;

    vec4 a, b;
    strandConstants(s, a, b);

    float bright;
    vec3 p = pathAt(t, s, a, b, bright);

    // Tangent from a second evaluation — the paths are cheap and this keeps the
    // ribbon square to its own curve however the shape is being dragged.
    float eps = 0.012;
    float ignored;
    vec3 ahead = pathAt(min(t + eps, 1.0), s, a, b, ignored);
    vec3 behind = pathAt(max(t - eps, 0.0), s, a, b, ignored);
    vec3 tangent = normalize(ahead - behind + vec3(1e-5));

    p += kink(t, s, tangent);

    // Camera-facing: the ribbon is a strip, so it has to be rolled to face the
    // viewer or it disappears edge-on at exactly the angles you look from.
    vec3 view = normalize(cameraPosition - p);
    vec3 across = normalize(cross(tangent, view) + vec3(1e-5));

    #if STRAND_MODE == 1
      // A blade is thickest at its belly and comes to a point at both ends.
      float w = uWidth * mix(uWidthTip, 1.0, pow(sin(t * 3.14159), uWidthCurve));
    #else
      float w = uWidth * mix(1.0, uWidthTip, pow(t, uWidthCurve));
    #endif

    p += across * (side * w);

    vT = t;
    vSide = side;
    vRandom = a.z;
    vBright = max(bright, 0.0) * uFade * mix(1.0, uDim, b.w);

    vec4 mv = viewMatrix * vec4(p, 1.0);
    vViewZ = mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const STRAND_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform vec3  uColorCore;
  uniform vec3  uColorInner;
  uniform vec3  uColorOuter;
  uniform vec3  uColorHalo;
  uniform float uGlow;
  uniform float uOpacity;
  uniform float uCoreSharp;
  uniform float uGlowFalloff;
  uniform float uGlowOpacity;
  uniform float uFlicker;
  uniform float uFlickerSpeed;
  uniform float uSoftFade;
  uniform float uGlobalGlow;
  uniform float uShaderIntensity;
  uniform vec2  uResolution;
  uniform sampler2D uSceneDepth;
  uniform float uCameraNear;
  uniform float uCameraFar;

  varying float vT;
  varying float vSide;
  varying float vBright;
  varying float vRandom;
  varying float vViewZ;

  ${noiseGLSL}
  ${commonGLSL}

  void main() {
    if (vBright <= 0.001) discard;

    float across = clamp(abs(vSide), 0.0, 1.0);

    // A gutter shared by every strand plus a per-strand blink, so a bundle
    // never reads as one solid object breathing in unison.
    float flick = 1.0 - uFlicker * (0.5 + 0.5 * sin(uTime * uFlickerSpeed + vRandom * 31.0));

    vec3 color;
    float alpha;

    #ifdef GLOW_PASS
      float halo = pow(1.0 - across, uGlowFalloff);
      color = mix(uColorHalo, uColorOuter, halo * 0.65);
      alpha = halo * uGlowOpacity;
    #else
      float core = pow(1.0 - across, uCoreSharp);
      color = mix(uColorOuter, uColorInner, clamp(core * 1.4, 0.0, 1.0));
      color = mix(color, uColorCore, pow(core, 2.5));
      alpha = clamp(core * 1.15 + 0.05, 0.0, 1.0);
    #endif

    alpha *= vBright * uOpacity * flick;
    if (alpha < 0.003) discard;

    vec2 screenUV = gl_FragCoord.xy / uResolution;
    alpha *= softFade(uSceneDepth, screenUV, vViewZ, uCameraNear, uCameraFar, uSoftFade);
    if (alpha < 0.003) discard;

    color *= uGlow * uGlobalGlow * mix(0.75, 1.0, uShaderIntensity);
    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * @param {number} mode StrandMode.*
 * @param {number} pass StrandPass.*
 */
export function createStrandMaterial(mode = StrandMode.HELIX, pass = StrandPass.CORE) {
  const defines = { STRAND_MODE: mode };
  if (pass === StrandPass.GLOW) defines.GLOW_PASS = '';

  return new ShaderMaterial({
    defines,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: AdditiveBlending,
    side: DoubleSide,
    toneMapped: false,
    uniforms: sharedUniforms({
      uAge: { value: 0 },
      uProgress: { value: 1 },
      uFade: { value: 1 },
      uSeed: { value: Math.random() * 10 },

      uOrigin: { value: new Vector3() },
      uForward: { value: new Vector3(0, 0, 1) },
      uSideAxis: { value: new Vector3(1, 0, 0) },

      uCount: { value: 12 },
      uRadius: { value: 4 },
      uHeight: { value: 6 },
      uLength: { value: 8 },
      uBase: { value: 0.3 },
      uTop: { value: 1 },
      uCurve: { value: 1.4 },
      uLean: { value: 0 },
      uTurns: { value: 1.2 },
      uSpin: { value: 0.5 },
      uSpeed: { value: 1 },
      uSpan: { value: 2.4 },
      uTilt: { value: 0.6 },
      uSweep: { value: 2.4 },
      uInterval: { value: 0.1 },
      uLife: { value: 0.5 },
      uPhase: { value: 0 },
      uInset: { value: 0.9 },

      uWidth: { value: 0.06 },
      uWidthTip: { value: 0.6 },
      uWidthCurve: { value: 1 },
      uJitter: { value: 0.05 },
      uJitterScale: { value: 3 },
      uCrawl: { value: 1.4 },
      uDim: { value: 0.75 },

      uColorCore: { value: new Color(1, 1, 1) },
      uColorInner: { value: new Color(0.8, 0.95, 1) },
      uColorOuter: { value: new Color(0.3, 0.7, 1) },
      uColorHalo: { value: new Color(0.05, 0.2, 0.6) },
      uGlow: { value: 2 },
      uOpacity: { value: 1 },
      uCoreSharp: { value: 3.4 },
      uGlowFalloff: { value: 2.2 },
      uGlowOpacity: { value: 0.45 },
      uFlicker: { value: 0.12 },
      uFlickerSpeed: { value: 18 },
      uSoftFade: { value: 0.7 }
    }),
    vertexShader: STRAND_VERTEX,
    fragmentShader: STRAND_FRAGMENT
  });
}

/**
 * Push the shared half of the look — palette, ribbon width, glow — into the
 * `[core, glow]` pair of one effect.
 *
 * The two passes are the same numbers at two scales: the halo is roughly five
 * times as wide and half as hot, which is the ratio the Storm Lance settled on
 * and the one that keeps a filament reading as a filament with a bloom around
 * it rather than as two ribbons. Everything path-shaped stays the ability's job.
 *
 * @param {ShaderMaterial[]} passes  [core, glow]
 * @param {object} look
 * @param {THREE.Color} look.core    centre of a strand
 * @param {THREE.Color} look.edge    its outside
 * @param {THREE.Color} look.halo    the wide bloom
 * @param {number} look.width        half-width of the core pass, metres
 * @param {number} look.glow         emissive gain
 * @param {number} look.opacity
 * @param {number} [look.dim]        how much dimmer a back-rank strand is
 * @param {number} [look.haloWidth]  the halo, × the core width
 */
export function syncStrandLook(passes, look) {
  const {
    core,
    edge,
    halo,
    width,
    glow,
    opacity = 1,
    dim = 0.75,
    haloWidth = 5.4,
    haloOpacity = 0.5,
    coreSharp = 3.4,
    glowFalloff = 2.2,
    flicker = 0.12,
    flickerSpeed = 18,
    softFade = 0.7
  } = look;

  for (const [index, material] of passes.entries()) {
    const wide = index === 1;
    const u = material.uniforms;
    u.uWidth.value = width * (wide ? haloWidth : 1);
    u.uGlow.value = glow * (wide ? 0.5 : 1);
    u.uOpacity.value = opacity;
    u.uDim.value = dim;
    u.uCoreSharp.value = coreSharp;
    u.uGlowFalloff.value = glowFalloff;
    u.uGlowOpacity.value = haloOpacity;
    u.uFlicker.value = flicker;
    u.uFlickerSpeed.value = flickerSpeed;
    u.uSoftFade.value = softFade;
    u.uColorCore.value.copy(core);
    u.uColorInner.value.copy(edge);
    u.uColorOuter.value.copy(edge);
    u.uColorHalo.value.copy(halo);
  }
}
