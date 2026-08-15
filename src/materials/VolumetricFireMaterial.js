import {
  ShaderMaterial,
  CustomBlending,
  AddEquation,
  OneFactor,
  OneMinusSrcAlphaFactor,
  Color,
  DoubleSide
} from 'three';
import { FIRE_VERTEX_GLSL, FIRE_FRAGMENT_GLSL } from './volumetric-fire-glsl.js';
import { sharedUniforms } from '../core/FrameUniforms.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';

/**
 * How far past the nominal tube radius the fringe shred can push density,
 * before the low-frequency bulge is taken into account. Matches the
 * `smoothstep(REACH_LO, REACH_HI, q)` cutoff in the fragment shader.
 */
export const FIRE_SHRED_REACH = 1.55;

/**
 * Total outward reach of the volume in units of the nominal tube radius.
 *
 * The proxy hull has to *contain* the density field: anything the field can
 * reach and the hull cannot is sliced off along a dead straight edge. The bulge
 * scales the local radius directly, so it multiplies the shred reach.
 */
export function fireHullReach(element = 'meteor') {
  // The 1.3 is margin, not slop. The hull is a flat strip and the volume it has
  // to contain is a stretched capsule, so matching the two exactly leaves the
  // cap's silhouette sitting on the hull's terminal edge — and a volume that
  // ends one pixel outside its proxy is sliced off along a dead straight line,
  // which is the single most obvious way this technique fails.
  return FIRE_SHRED_REACH * (1 + settings[element].trailBulge) * 1.3;
}


/**
 * The meteor's burning wake, raymarched as a black-body volume.
 *
 * Brought over wholesale from the freehand firebending sandbox and re-aimed at
 * the meteor's arc: it is the same volume renderer, driven by `settings.meteor`'s
 * `trail*` block instead of that project's `fire` block.
 *
 * The mesh this material is applied to is *not* the flame — it is only a
 * camera-facing proxy hull around the flight path (see RibbonGeometry's `frame`
 * option). Every fragment reconstructs the curve's local frame from
 * `aCenter` / `aTangent`, fires a ray from the camera through itself and
 * integrates emission and absorption through the field described below.
 *
 * The field is built in four layers, coarsest first, because that is the order
 * in which the eye reads a real fireball:
 *
 *  1. *silhouette* — a capsule around the flight path, teardrop in cross
 *     section (buoyancy stretches it upward), whose local radius is modulated
 *     by one very low frequency noise octave. That last part is not decoration:
 *     a fireball's outline is dominated by lobes metres across, and multi-octave
 *     turbulence at flame-detail frequency can only nibble at the edge of a
 *     capsule — the result still reads as a shaded tube.
 *  2. *vortex roll-up* — hot gas sheds ring vortices that travel back down the
 *     wake and grow as they age. Rotating the noise domain in the (streamwise,
 *     vertical) plane by a travelling wave folds the field over on itself, which
 *     is what produces the curling, mushrooming billows. Plain fbm, however many
 *     octaves, makes clouds; it never makes curls.
 *  3. *turbulence* — 5 progressively domain-warped octaves, rotated between
 *     octaves to kill lattice alignment, each drifting upward faster than the
 *     last so fine detail outruns the coarse shapes it rides on and tears into
 *     upward-licking tongues.
 *  4. *shred* — the erosion is weak on the axis and violent at the fringe, so
 *     the flame keeps a solid burning heart while its edge dissolves into the
 *     strands and detached wisps a real flame has.
 *
 * Shading is temperature-driven rather than gradient-driven:
 *
 *   temperature  carried by the capsule falloff — geometry — and only *nudged*
 *                by the two coarsest noise octaves, so a tongue stays hot along
 *                its own spine without the noise drawing itself. It flattens out
 *                with age, because spent gas has mixed and no longer has a hot
 *                axis and a cool skin.
 *   emission     Planckian black-body colour at that temperature, radiated as
 *                (T/Tcore)^3. Fire is not a palette, it is a temperature: the
 *                red fringe → orange body → white core continuum, and the vast
 *                brightness range across it, both fall out of the physics.
 *   scattering   cool gas near the burning core is bathed in its light. Without
 *                this the sooty fringe goes flat black instead of glowing.
 *   absorption   soot extinction. Cold smoke occludes hard, but even the hottest
 *                gas keeps a floor of it (`uCoreClarity`): without that floor the
 *                march integrates the entire depth of the fireball into one
 *                clipped white blob instead of showing its near face.
 *
 * A warning that cost a lot of renders to learn, since it governs three separate
 * decisions in here (the coarse-only heat field, the modest `uHeatFollow`, the
 * age flattening): radiated power goes as a high power of temperature, so
 * whatever drives the temperature has its contrast multiplied several-fold on
 * screen. Point that amplifier at a turbulent field and it lands on the field's
 * level sets, which are nested closed loops, and the flame renders as polished
 * agate — dense contour lines wrapping every blob. No amount of colour tuning
 * fixes it; the fix is always to make the temperature blunter.
 *
 * That last point is why the blend mode is premultiplied "over" rather than the
 * additive blending the rest of the VFX use: a real flame both emits and blocks.
 * The march is clipped by the opaque depth prepass, so the volume is occluded by
 * the ground and the character and fades softly where it touches them.
 */
export class VolumetricFireMaterial extends ShaderMaterial {
  constructor(element = 'meteor') {
    super({
      transparent: true,
      depthWrite: false,
      // Per-sample scene-depth clipping inside the march does the occlusion job
      // properly; testing the flat proxy hull's own depth would slice the volume.
      depthTest: false,
      blending: CustomBlending,
      blendEquation: AddEquation,
      blendSrc: OneFactor,
      blendDst: OneMinusSrcAlphaFactor,
      blendSrcAlpha: OneFactor,
      blendDstAlpha: OneMinusSrcAlphaFactor,
      side: DoubleSide,
      toneMapped: false,
      uniforms: sharedUniforms({
        /* shape */
        uRadius: { value: 0.95 },
        uHeadSize: { value: 2.1 },
        uPlume: { value: 1.8 },
        uWakeSpread: { value: 1.1 },
        uStreamLength: { value: 6.0 },
        uArcLength: { value: 7.0 },
        uTailPad: { value: 0.3 },
        uDetachment: { value: 0.5 },
        uSoftness: { value: 0.45 },
        uShred: { value: 1.35 },
        uBulge: { value: 0.28 },
        uBulgeScale: { value: 0.5 },
        /* motion */
        uFlow: { value: 2.4 },
        uBuoyancy: { value: 2.6 },
        uSwirl: { value: 0.45 },
        uSwirlSpeed: { value: 0.9 },
        uVortex: { value: 1.15 },
        uRingFreq: { value: 0.55 },
        uRingSpeed: { value: 1.6 },
        uNoiseFrequency: { value: 3.2 },
        uNoiseStrength: { value: 0.9 },
        uWarp: { value: 0.2 },
        uTongue: { value: 0.5 },
        uStreamStretch: { value: 0.3 },
        uWisp: { value: 0.0 },
        uFlicker: { value: 0.45 },
        uLick: { value: 3.2 },
        uOctaves: { value: 5 },
        /* temperature & radiance */
        uTempCore: { value: 3500 },
        uTempEdge: { value: 1550 },
        uEmissionCurve: { value: 2.6 },
        uHeatFocus: { value: 1.0 },
        uHeatFalloff: { value: 1.15 },
        uHeatFollow: { value: 0.2 },
        uTailHeat: { value: 0.5 },
        uPalette: { value: 0.0 },
        uScatter: { value: 0.9 },
        uScatterFalloff: { value: 2.2 },
        /* rendering */
        uDensity: { value: 1.35 },
        uSoot: { value: 1.5 },
        uCoreClarity: { value: 0.62 },
        uEmission: { value: 6.5 },
        uOpacity: { value: 1 },
        uSteps: { value: 44 },
        uSeed: { value: Math.random() * 20 },
        uHeadFade: { value: 0 },
        uTailFade: { value: 0.1 },
        uColorCore: { value: new Color(1, 0.96, 0.82) },
        uColorMid: { value: new Color(1, 0.69, 0.18) },
        uColorEdge: { value: new Color(1, 0.24, 0.06) },
        uColorSmoke: { value: new Color(0.14, 0.1, 0.09) }
      }),
      vertexShader: FIRE_VERTEX_GLSL,
      fragmentShader: FIRE_FRAGMENT_GLSL
    });

    /**
     * Which settings block this volume reads its `trail*` controls from.
     *
     * The renderer itself has no idea what is burning: the meteor's wake, the
     * jets standing in a magma rift and the petals of a plasma bloom are the
     * same integrator pointed at three different blocks.
     */
    this.element = element;
  }

  /**
   * Pull live editor values (called once per frame by the ability).
   *
   * `uRadius`, `uStreamLength`, `uArcLength` and `uTailPad` are deliberately not
   * touched here: they describe the hull the ability has just built and are
   * written by it straight afterwards.
   */
  sync() {
    const c = settings[this.element];
    const g = settings.global;
    const u = this.uniforms;

    u.uRadius.value = c.trailWidth;
    u.uHeadSize.value = c.trailHeadSize;
    u.uPlume.value = c.trailPlume;
    u.uWakeSpread.value = c.trailWakeSpread;
    u.uDetachment.value = c.trailDetachment;
    u.uSoftness.value = c.trailSoftness;
    u.uShred.value = c.trailShred;
    u.uBulge.value = c.trailBulge;
    u.uBulgeScale.value = c.trailBulgeScale;

    u.uFlow.value = c.trailSpeed * g.noiseSpeed;
    u.uBuoyancy.value = c.trailBuoyancy * g.noiseSpeed;
    u.uSwirl.value = c.trailCurl * g.turbulence;
    u.uSwirlSpeed.value = c.trailSpeed * 0.35 * g.noiseSpeed;
    u.uVortex.value = c.trailVortex * g.turbulence;
    u.uRingFreq.value = c.trailRingFrequency;
    u.uRingSpeed.value = c.trailRingSpeed * g.noiseSpeed;
    u.uNoiseFrequency.value = c.trailNoiseFrequency * g.noiseFrequency;
    u.uNoiseStrength.value =
      0.28 * c.trailTurbulence * c.trailNoiseStrength * g.turbulence * g.noiseStrength;
    u.uWarp.value = c.trailWarp * g.turbulence;
    u.uTongue.value = c.trailTongue;
    u.uStreamStretch.value = c.trailStreamStretch;
    u.uWisp.value = c.trailWisps;
    u.uFlicker.value = c.trailFlicker;
    u.uLick.value = c.trailLick;
    u.uOctaves.value = c.trailOctaves;

    u.uTempCore.value = c.trailTempCore;
    u.uTempEdge.value = c.trailTempEdge;
    u.uEmissionCurve.value = c.trailEmissionCurve;
    u.uHeatFocus.value = c.trailHeatFocus;
    u.uHeatFalloff.value = c.trailHeatFalloff;
    u.uHeatFollow.value = c.trailHeatFollow;
    u.uTailHeat.value = c.trailTailHeat;
    u.uPalette.value = c.trailPalette;
    u.uScatter.value = c.trailScatter;
    u.uScatterFalloff.value = c.trailScatterFalloff;

    u.uDensity.value = c.trailDensity;
    u.uSoot.value = c.trailSoot;
    u.uCoreClarity.value = c.trailCoreClarity;
    u.uEmission.value = c.trailGlow * 2.4;
    u.uOpacity.value = c.trailOpacity * g.opacity;
    u.uSteps.value = c.trailSteps;
    u.uTailFade.value = c.trailTailFade;

    // The palette is shared with the rock's seams and the detonation, so the
    // whole ability stays one temperature range when a colour is dragged.
    u.uColorCore.value.copy(getColor(c.colorHot));
    u.uColorMid.value.copy(getColor(c.colorFlameMid));
    u.uColorEdge.value.copy(getColor(c.colorFlameEdge));
    u.uColorSmoke.value.copy(getColor(c.colorFlameSmoke));
  }
}
