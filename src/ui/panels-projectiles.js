/**
 * panels-projectiles.js — the hand-written folders for the two travelling casts.

 * Cinder Fall and Nova Beam, the two abilities whose folders are dominated by
 * what happens *between* the hand and the target: the arc and the trail on one,
 * the wind-up and the column on the other.
 *
 * Split out of `Editor.js` under the 800-line rule in `AGENTS.md`, verbatim
 * apart from becoming functions: each took no arguments and read nothing off the
 * instance but `gui`, so each now takes the editor and is called from a
 * one-line method that keeps the old name.
 */
import { settings } from '../config/settings.js';
import { range, castAnimation, gradient } from './controls.js';

/**
 * Cinder Fall.
 *
 * The seven controls under "The rock" regenerate real geometry — see
 * `MeteorAbility#_syncGeometry` — and everything else is read by a shader or
 * resolved from scratch on the frame it changes, so the whole folder reshapes
 * a meteor that is already in the air. The ones worth reaching for first are
 * `arc` (how hard it is lobbed), `crackWidth` and `chargeCurve` (how the lava
 * seams open on the way in), `trailSpan` and `trailWidth` (how much fire
 * streams off it) and `chunkSpeed` (how far the wreckage is thrown).
 */
export function buildMeteor(editor) {
  const folder = editor.gui.addFolder('☄  Cinder Fall');
  const c = settings.meteor;
  const R = range;

  const cast = folder.addFolder('The cast');
  R(cast, c, 'range', 2, 60, 0.1, 'max range');
  R(cast, c, 'minRange', 0, 10, 0.1, 'min range');
  R(cast, c, 'speed', 3, 90, 0.5, 'travel speed');
  R(cast, c, 'lifetime', 0.2, 10, 0.1, 'crater lifetime');
  R(cast, c, 'fadeTime', 0.1, 6, 0.05, 'clear-out time');
  R(cast, c, 'cooldown', 0, 6, 0.05, 'cooldown');
  castAnimation(cast, c);

  const path = folder.addFolder('The flight path');
  R(path, c, 'handHeight', 0, 3, 0.01, 'hand height');
  R(path, c, 'handForward', -1, 3, 0.01, 'hand forward');
  R(path, c, 'handSide', -1.5, 1.5, 0.01, 'hand lateral');
  R(path, c, 'endHeight', 0, 4, 0.01, 'height at target');
  R(path, c, 'arc', -4, 12, 0.05, 'lob height');
  R(path, c, 'arcCurve', 0.1, 4, 0.01, 'lob curve');

  // Everything down to `craterSize` rebuilds the asteroid geometry. `cuts` is
  // the one that decides whether it reads as stone: it slices flat fracture
  // faces off the ball, which no amount of noise can fake.
  const rock = folder.addFolder('The rock');
  R(rock, c, 'radius', 0.05, 3, 0.01, 'radius');
  R(rock, c, 'facets', 0, 3, 1, 'subdivisions');
  R(rock, c, 'lumpiness', 0, 0.8, 0.01, 'lumpiness');
  R(rock, c, 'lumpScale', 0.2, 6, 0.05, 'lumps / radius');
  R(rock, c, 'surfaceRoughness', 0, 1, 0.01, 'surface roughness');
  R(rock, c, 'cuts', 0, 16, 1, 'fracture faces');
  R(rock, c, 'cutDepth', 0, 0.5, 0.01, 'fracture depth');
  R(rock, c, 'craters', 0, 14, 1, 'craters');
  R(rock, c, 'craterDepth', 0, 0.6, 0.01, 'crater depth');
  R(rock, c, 'craterSize', 0.05, 1.4, 0.01, 'crater size');
  R(rock, c, 'spin', -20, 20, 0.1, 'tumble rate');

  const seams = folder.addFolder('Lava seams');
  R(seams, c, 'chargeCurve', 0.1, 5, 0.01, 'heat-up curve');
  R(seams, c, 'crackScale', 0.3, 10, 0.05, 'seams / radius');
  R(seams, c, 'crackWidth', 0.005, 0.5, 0.005, 'seam width');
  R(seams, c, 'crackBranches', 0, 1.5, 0.01, 'branch seams');
  R(seams, c, 'crackGlow', 0, 10, 0.05, 'seam glow');
  R(seams, c, 'crackFlow', 0, 1, 0.01, 'magma crawl');
  R(seams, c, 'crackFlowSpeed', 0, 5, 0.01, 'crawl speed');
  R(seams, c, 'rockScale', 0.2, 10, 0.05, 'rock mottling');
  R(seams, c, 'facetTint', 0, 1.2, 0.01, 'per-facet tint');
  R(seams, c, 'cavity', 0, 1, 0.01, 'cavity shading');
  R(seams, c, 'soot', 0, 1.5, 0.01, 'soot around seams');
  R(seams, c, 'rimHeat', 0, 4, 0.01, 'heat sheath');
  R(seams, c, 'leadGlow', 0, 6, 0.01, 'leading-face heat');
  R(seams, c, 'leadSharp', 0.5, 8, 0.05, 'leading-face falloff');
  R(seams, c, 'glow', 0, 4, 0.01, 'glow');
  R(seams, c, 'envIntensity', 0, 3, 0.01, 'reflection');
  seams.addColor(c, 'colorRock').name('rock');
  seams.addColor(c, 'colorChar').name('char');
  seams.addColor(c, 'colorCrack').name('seam');
  seams.addColor(c, 'colorHot').name('white hot');

  // The trail is a raymarched volume, so these are volume parameters, not
  // surface ones — see `materials/VolumetricFireMaterial.js`. `trailWidth`,
  // `trailPlume` and `trailSpan` set its shape; `trailSteps` is the cost dial.
  const trail = folder.addFolder('The fire trail');
  R(trail, c, 'trailSpan', 0.5, 30, 0.1, 'trail length');
  R(trail, c, 'trailWidth', 0.02, 2, 0.01, 'tube radius');
  R(trail, c, 'trailHeadSize', 0.5, 5, 0.01, 'head size');
  R(trail, c, 'trailPlume', 0.3, 4, 0.01, 'upward stretch');
  R(trail, c, 'trailWakeSpread', 0, 3, 0.01, 'wake spread');
  R(trail, c, 'trailRise', 0, 3, 0.01, 'wake rise');
  R(trail, c, 'trailDetachment', 0, 1.5, 0.01, 'tail break-up');
  R(trail, c, 'trailSoftness', 0.05, 1, 0.01, 'surface softness');
  R(trail, c, 'trailBurnout', 0.05, 4, 0.05, 'burn-out time');
  R(trail, c, 'trailTailFade', 0.01, 0.8, 0.01, 'tail burn-out');

  // Metre-scale lobes. Without these the outline stays a capsule no matter how
  // much fine turbulence is piled on top of it.
  const silhouette = trail.addFolder('Silhouette');
  R(silhouette, c, 'trailBulge', 0, 1, 0.01, 'lobe depth');
  R(silhouette, c, 'trailBulgeScale', 0.05, 2, 0.01, 'lobes / metre');
  R(silhouette, c, 'trailShred', 0, 4, 0.01, 'fringe shred');
  R(silhouette, c, 'trailWisps', 0, 2, 0.01, 'wisps');
  R(silhouette, c, 'trailLick', 0, 8, 0.05, 'radial shear');

  const motion = trail.addFolder('Motion & turbulence');
  R(motion, c, 'trailSpeed', 0, 12, 0.01, 'flow speed');
  R(motion, c, 'trailBuoyancy', 0, 10, 0.01, 'buoyancy');
  R(motion, c, 'trailTurbulence', 0, 8, 0.01, 'turbulence');
  R(motion, c, 'trailNoiseStrength', 0, 4, 0.01, 'noise strength');
  R(motion, c, 'trailNoiseFrequency', 0.1, 10, 0.01, 'noise frequency');
  R(motion, c, 'trailWarp', 0, 1.5, 0.01, 'domain warp');
  R(motion, c, 'trailCurl', 0, 3, 0.01, 'axial swirl');
  R(motion, c, 'trailVortex', 0, 2, 0.01, 'vortex roll-up');
  R(motion, c, 'trailRingFrequency', 0, 3, 0.01, 'rings / metre');
  R(motion, c, 'trailRingSpeed', 0, 10, 0.05, 'ring speed');
  R(motion, c, 'trailTongue', 0.2, 3, 0.01, 'tongue stretch');
  R(motion, c, 'trailStreamStretch', 0.2, 3, 0.01, 'streamwise stretch');
  R(motion, c, 'trailFlicker', 0, 2, 0.01, 'flicker');
  R(motion, c, 'trailOctaves', 1, 5, 1, 'detail octaves');

  // The flame is shaded as a Planckian radiator: colour comes out of the
  // temperature. `trailPalette` blends toward the hand-authored stops instead.
  const heat = trail.addFolder('Temperature & radiance');
  R(heat, c, 'trailTempCore', 1000, 5000, 10, 'core temperature (K)');
  R(heat, c, 'trailTempEdge', 1000, 4000, 10, 'edge temperature (K)');
  R(heat, c, 'trailEmissionCurve', 1, 6, 0.01, 'radiance exponent');
  R(heat, c, 'trailHeatFocus', 0.05, 3, 0.01, 'heat focus');
  R(heat, c, 'trailHeatFalloff', 0.05, 4, 0.01, 'heat falloff');
  R(heat, c, 'trailHeatFollow', 0, 1, 0.01, 'heat follows noise');
  R(heat, c, 'trailTailHeat', 0, 1, 0.01, 'spent-gas heat');
  R(heat, c, 'trailScatter', 0, 4, 0.01, 'scatter');
  R(heat, c, 'trailScatterFalloff', 0.2, 8, 0.05, 'scatter falloff');
  R(heat, c, 'trailPalette', 0, 1, 0.01, 'palette vs physics');
  heat.addColor(c, 'colorFlameMid').name('flame mid');
  heat.addColor(c, 'colorFlameEdge').name('flame edge');
  heat.addColor(c, 'colorFlameSmoke').name('flame smoke');

  const march = trail.addFolder('Volume rendering');
  R(march, c, 'trailDensity', 0, 6, 0.01, 'density');
  R(march, c, 'trailSoot', 0, 5, 0.01, 'soot absorption');
  R(march, c, 'trailCoreClarity', 0, 1, 0.01, 'core clarity');
  R(march, c, 'trailGlow', 0, 8, 0.01, 'glow');
  R(march, c, 'trailOpacity', 0, 2, 0.01, 'opacity');
  R(march, c, 'trailSteps', 6, 72, 1, 'raymarch steps');

  const chunks = folder.addFolder('The wreckage');
  R(chunks, c, 'chunkCount', 0, 28, 1, 'chunks');
  R(chunks, c, 'chunkScale', 0.05, 0.8, 0.01, 'chunk size');
  R(chunks, c, 'chunkSpeed', 0, 30, 0.1, 'throw speed');
  R(chunks, c, 'chunkForward', 0, 2, 0.01, 'downrange bias');
  R(chunks, c, 'chunkLoft', 0, 1.5, 0.01, 'loft');
  R(chunks, c, 'chunkGravity', -50, -1, 0.1, 'gravity');
  R(chunks, c, 'chunkSpin', 0, 20, 0.1, 'tumble rate');
  R(chunks, c, 'chunkCool', 0.1, 8, 0.05, 'cool-down time');
  R(chunks, c, 'chunkLinger', 0, 4, 0.05, 'hold before sinking');
  R(chunks, c, 'chunkSink', 0.1, 4, 0.05, 'sink time');

  const embers = folder.addFolder('Embers & sparks');
  R(embers, c, 'emberRate', 0, 900, 1, 'ember rate');
  R(embers, c, 'emberSize', 0.005, 0.5, 0.005, 'ember size');
  R(embers, c, 'emberSpeed', 0, 15, 0.05, 'ember speed');
  R(embers, c, 'emberLifetime', 0.1, 8, 0.05, 'ember lifetime');
  R(embers, c, 'emberRise', -3, 8, 0.05, 'ember rise');
  R(embers, c, 'emberGlow', 0, 4, 0.01, 'ember glow');
  R(embers, c, 'emberTurbulence', 0, 3, 0.01, 'ember turbulence');
  R(embers, c, 'sparkRate', 0, 900, 1, 'spark rate');
  R(embers, c, 'sparkSize', 0.005, 0.8, 0.005, 'spark size');
  R(embers, c, 'sparkSpeed', 0, 40, 0.1, 'spark speed');
  R(embers, c, 'sparkLifetime', 0.05, 4, 0.01, 'spark lifetime');
  R(embers, c, 'sparkGravity', -50, 5, 0.1, 'spark gravity');
  R(embers, c, 'sparkStretch', 0, 3, 0.01, 'spark stretch');
  gradient(embers, c, 'colorEmber', 'Ember colour');
  gradient(embers, c, 'colorSpark', 'Spark colour');

  const dust = folder.addFolder('Smoke & grit');
  R(dust, c, 'smokeRate', 0, 500, 1, 'smoke rate');
  R(dust, c, 'smokeSize', 0.05, 4, 0.01, 'smoke size');
  R(dust, c, 'smokeSpeed', 0, 8, 0.05, 'smoke speed');
  R(dust, c, 'smokeLifetime', 0.2, 10, 0.05, 'smoke lifetime');
  R(dust, c, 'smokeOpacity', 0, 1, 0.005, 'smoke opacity');
  R(dust, c, 'smokeRise', -2, 5, 0.01, 'smoke rise');
  R(dust, c, 'debrisSize', 0.005, 0.4, 0.005, 'grit size');
  R(dust, c, 'debrisSpeed', 0, 25, 0.1, 'grit speed');
  R(dust, c, 'debrisLifetime', 0.1, 5, 0.05, 'grit lifetime');
  R(dust, c, 'debrisGravity', -50, 0, 0.1, 'grit gravity');
  gradient(dust, c, 'colorSmoke', 'Smoke colour');
  gradient(dust, c, 'colorDebris', 'Grit colour');

  const cracks = folder.addFolder('Molten cracks');
  R(cracks, c, 'fissureRadius', 0.5, 16, 0.05, 'reach');
  R(cracks, c, 'fissureLife', 0.5, 25, 0.1, 'lifetime');
  R(cracks, c, 'fissureArms', 2, 12, 1, 'main cracks');
  R(cracks, c, 'fissureWander', 0, 6, 0.05, 'meander');
  R(cracks, c, 'fissureBranches', 0, 1, 0.01, 'branch density');
  R(cracks, c, 'fissureBranchLength', 0, 1, 0.01, 'branch length');
  R(cracks, c, 'fissureWidth', 0.01, 1, 0.005, 'seam width');
  R(cracks, c, 'fissureHeat', 0, 4, 0.01, 'core heat');
  R(cracks, c, 'fissurePulse', 0, 5, 0.01, 'heat-wave speed');
  R(cracks, c, 'fissureGrowth', 0.5, 40, 0.1, 'spread speed');
  R(cracks, c, 'fissureRockSize', 0, 1.2, 0.01, 'lip rubble size');

  const ground = folder.addFolder('The crater');
  R(ground, c, 'scorchRadius', 0.2, 12, 0.05, 'scorch radius');
  R(ground, c, 'scorchLife', 0.5, 20, 0.1, 'scorch lifetime');
  R(ground, c, 'scorchIntensity', 0, 2, 0.01, 'scorch intensity');
  R(ground, c, 'shockRadius', 0.5, 25, 0.1, 'shockwave radius');
  ground.addColor(c, 'colorScorch').name('scorch');
  ground.addColor(c, 'colorShockA').name('shockwave ring');
  ground.addColor(c, 'colorShockB').name('shockwave crest');

  const impact = folder.addFolder('Launch & detonation');
  R(impact, c, 'muzzleSize', 0, 6, 0.05, 'launch flare'); // 0 = no flare
  R(impact, c, 'muzzleIntensity', 0, 5, 0.01, 'launch intensity');
  R(impact, c, 'castFlash', 0, 2, 0.01, 'flash on release');
  impact.addColor(c, 'colorCastFlash').name('release flash colour');
  R(impact, c, 'burstSize', 0.2, 18, 0.05, 'fireball size');
  R(impact, c, 'burstIntensity', 0, 5, 0.01, 'fireball intensity');
  R(impact, c, 'burstTurbulence', 0, 4, 0.01, 'fireball turbulence');
  R(impact, c, 'burstEmbers', 0, 800, 1, 'burst embers');
  R(impact, c, 'burstSparks', 0, 600, 1, 'burst sparks');
  R(impact, c, 'burstDebris', 0, 400, 1, 'burst grit');
  R(impact, c, 'burstSmoke', 0, 300, 1, 'burst smoke');
  R(impact, c, 'impactShake', 0, 3, 0.01, 'shake');
  R(impact, c, 'shakeDuration', 0.1, 4, 0.01, 'shake duration');
  R(impact, c, 'impactFlash', 0, 2, 0.01, 'screen flash');
  R(impact, c, 'rumble', 0, 0.5, 0.005, 'travel rumble');
  impact.addColor(c, 'colorFlash').name('impact flash colour');

  const light = folder.addFolder('Dynamic light');
  R(light, c, 'lightIntensity', 0, 120, 0.5, 'light intensity');
  R(light, c, 'lightRadius', 0.5, 50, 0.1, 'light radius');
  R(light, c, 'lightFlicker', 0, 1, 0.01, 'light gutter');
  R(light, c, 'lightFlickerSpeed', 1, 60, 0.5, 'gutter rate');
  light.addColor(c, 'lightColor').name('light colour');

  editor.meteorFolder = folder;
}


/**
 * Nova Beam.
 *
 * Every control here is read by a shader on the frame it changes, so the whole
 * folder reshapes a beam that is already burning — pause with **P** halfway
 * through the hold and the entire panel stays live. The ones worth reaching
 * for first are `radius` and `flare` (how heavy the column reads), `charge`
 * and `lifetime` (the wind-up and the hold, which are what make this ability
 * different from the other three), `coils` / `coilTurns` (the ribbons around
 * it) and `streak` / `flowSpeed` (how hard the energy streams downrange).
 */
export function buildBeam(editor) {
  const folder = editor.gui.addFolder('✦  Nova Beam');
  const c = settings.beam;
  const R = range;

  const cast = folder.addFolder('The cast');
  R(cast, c, 'range', 2, 60, 0.1, 'max range');
  R(cast, c, 'minRange', 0, 10, 0.1, 'min range');
  R(cast, c, 'charge', 0, 3, 0.01, 'wind-up time');
  R(cast, c, 'speed', 5, 400, 1, 'travel speed');
  R(cast, c, 'lifetime', 0.05, 8, 0.01, 'burn time');
  R(cast, c, 'fadeTime', 0.05, 4, 0.01, 'collapse time');
  R(cast, c, 'cooldown', 0, 6, 0.05, 'cooldown');
  castAnimation(cast, c);

  const anchor = folder.addFolder('Where it leaves the hands');
  R(anchor, c, 'handHeight', 0, 3, 0.01, 'hand height');
  R(anchor, c, 'handForward', -1, 3, 0.01, 'hand forward');
  R(anchor, c, 'handSide', -1.5, 1.5, 0.01, 'hand lateral');
  R(anchor, c, 'endHeight', 0, 4, 0.01, 'height at target');

  const column = folder.addFolder('The column');
  R(column, c, 'radiusNear', 0.01, 3, 0.01, 'radius at hands');
  R(column, c, 'radius', 0.02, 5, 0.01, 'radius at target');
  R(column, c, 'radiusCurve', 0.1, 4, 0.01, 'radius curve');
  R(column, c, 'flare', 0, 4, 0.01, 'flare at target');
  R(column, c, 'flareWidth', 0.02, 1, 0.01, 'flare width');
  R(column, c, 'throb', 0, 0.6, 0.005, 'pressure waves');
  R(column, c, 'throbScale', 0, 12, 0.1, 'waves / length');
  R(column, c, 'throbSpeed', 0, 10, 0.05, 'wave speed');
  R(column, c, 'wander', 0, 1, 0.005, 'axis drift');
  R(column, c, 'wanderScale', 0.1, 6, 0.05, 'drift scale');
  R(column, c, 'wanderSpeed', 0, 5, 0.01, 'drift speed');

  // The three tube passes. `coreSharp` and `shellRim` are the pair that decide
  // whether the beam reads as a solid rod or as a lit pipe — see
  // `materials/BeamMaterial.js`.
  const layers = folder.addFolder('Core, sheath & halo');
  R(layers, c, 'coreWidth', 0.05, 1.5, 0.01, 'core width');
  R(layers, c, 'coreSharp', 0.1, 8, 0.05, 'core focus');
  R(layers, c, 'coreFill', 0, 3, 0.01, 'core fill');
  R(layers, c, 'shellWidth', 0.2, 3, 0.01, 'sheath width');
  R(layers, c, 'shellRim', 0, 3, 0.01, 'sheath rim');
  R(layers, c, 'shellFill', 0, 1.5, 0.01, 'sheath fill');
  R(layers, c, 'shellOpacity', 0, 2, 0.01, 'sheath opacity');
  R(layers, c, 'edgePower', 0.2, 8, 0.05, 'rim falloff');
  R(layers, c, 'haloWidth', 0.5, 8, 0.05, 'halo width');
  R(layers, c, 'haloRim', 0.5, 10, 0.05, 'halo falloff');
  R(layers, c, 'haloOpacity', 0, 2, 0.01, 'halo opacity');

  const surface = folder.addFolder('Surface & flow');
  R(surface, c, 'ripple', 0, 1, 0.005, 'surface ripple');
  R(surface, c, 'rippleBands', 0.1, 8, 0.05, 'ripples around');
  R(surface, c, 'rippleScale', 0.1, 12, 0.05, 'ripples along');
  R(surface, c, 'rippleSpeed', 0, 12, 0.05, 'ripple crawl');
  R(surface, c, 'streak', 0, 3, 0.01, 'filaments');
  R(surface, c, 'streakSharp', 0, 1, 0.01, 'filament sharpness');
  R(surface, c, 'streakScale', 0.2, 20, 0.1, 'filaments / length');
  R(surface, c, 'streakBands', 0.2, 10, 0.05, 'filaments around');
  R(surface, c, 'streakGlow', 0, 4, 0.01, 'filament heat');
  R(surface, c, 'flowSpeed', 0, 30, 0.1, 'flow speed');
  R(surface, c, 'mouthGlow', 0, 6, 0.05, 'muzzle heat');
  R(surface, c, 'mouthLength', 0.005, 0.5, 0.005, 'muzzle length');
  R(surface, c, 'tipGlow', 0, 6, 0.05, 'burning-end heat');
  R(surface, c, 'tipLength', 0.005, 0.5, 0.005, 'burning-end length');
  R(surface, c, 'softFade', 0.02, 3, 0.01, 'soft intersection');

  const material = folder.addFolder('Beam colour');
  material.addColor(c, 'colorCore').name('axis');
  material.addColor(c, 'colorInner').name('inner');
  material.addColor(c, 'colorOuter').name('sheath');
  material.addColor(c, 'colorHalo').name('halo');
  R(material, c, 'glow', 0, 8, 0.01, 'glow');
  R(material, c, 'opacity', 0, 2, 0.01, 'opacity');

  const coils = folder.addFolder('The coils');
  R(coils, c, 'coils', 0, 8, 1, 'ribbons');
  R(coils, c, 'coilTurns', -8, 8, 0.05, 'turns over length');
  R(coils, c, 'coilSpeed', -6, 6, 0.01, 'roll speed');
  R(coils, c, 'coilRadius', 0.2, 4, 0.01, 'ride radius');
  R(coils, c, 'coilFlare', 0, 4, 0.01, 'flare at target');
  R(coils, c, 'coilWidth', 0.005, 0.6, 0.005, 'width at hands');
  R(coils, c, 'coilWidthTip', 0.05, 6, 0.01, 'width at target');
  R(coils, c, 'coilSharp', 0.2, 8, 0.05, 'edge falloff');
  R(coils, c, 'coilPulse', 0, 1, 0.01, 'charge pulse');
  R(coils, c, 'coilPulseFreq', 0, 12, 0.05, 'pulses / length');
  R(coils, c, 'coilPulseSpeed', -8, 8, 0.05, 'pulse speed');
  // Headroom above the shipped values on purpose — they sit high, and a
  // control that starts pinned to its own maximum can only ever come down.
  R(coils, c, 'coilGlow', 0, 14, 0.01, 'glow');
  R(coils, c, 'coilOpacity', 0, 3, 0.01, 'opacity');
  coils.addColor(c, 'colorCoil').name('ribbon core');
  coils.addColor(c, 'colorCoilEdge').name('ribbon edge');

  const rings = folder.addFolder('Shock discs');
  R(rings, c, 'rings', 0, 12, 1, 'discs');
  R(rings, c, 'ringSpeed', 0, 6, 0.01, 'trips / second');
  R(rings, c, 'ringInner', 0.2, 4, 0.01, 'inner lip');
  R(rings, c, 'ringOuter', 0.3, 6, 0.01, 'outer lip');
  R(rings, c, 'ringSwell', 0, 3, 0.01, 'swell downrange');
  R(rings, c, 'ringFade', 0, 1, 0.01, 'fade downrange');
  R(rings, c, 'ringSharp', 0.2, 8, 0.05, 'band sharpness');
  R(rings, c, 'ringGlow', 0, 8, 0.01, 'glow');
  R(rings, c, 'ringOpacity', 0, 2, 0.01, 'opacity');
  rings.addColor(c, 'colorRing').name('disc colour');

  const orb = folder.addFolder('The charge');
  R(orb, c, 'orbSize', 0.02, 2, 0.01, 'orb radius');
  R(orb, c, 'orbThrob', 0, 0.6, 0.005, 'orb pulse');
  R(orb, c, 'orbThrobSpeed', 0, 20, 0.1, 'pulse rate');
  R(orb, c, 'orbTurbulence', 0, 1, 0.01, 'surface turbulence');
  R(orb, c, 'orbScale', 0.2, 8, 0.05, 'surface scale');
  R(orb, c, 'orbFlow', 0, 5, 0.01, 'surface crawl');
  R(orb, c, 'orbBands', 0.5, 15, 0.1, 'filament scale');
  R(orb, c, 'orbRim', 0.2, 6, 0.05, 'rim falloff');
  R(orb, c, 'orbGlow', 0, 8, 0.01, 'glow');
  R(orb, c, 'orbOpacity', 0, 2, 0.01, 'opacity');
  R(orb, c, 'intakeRate', 0, 900, 1, 'intake rate');
  R(orb, c, 'intakeRadius', 0.2, 8, 0.05, 'intake radius');
  R(orb, c, 'intakeSpeed', 0.5, 25, 0.1, 'intake speed');
  R(orb, c, 'chargeShake', 0, 0.5, 0.005, 'wind-up rumble');

  const ground = folder.addFolder('What the floor does');
  R(ground, c, 'scorchRate', 0.05, 8, 0.05, 'burns / metre');
  R(ground, c, 'scorchRadius', 0.05, 4, 0.05, 'burn radius');
  R(ground, c, 'scorchLife', 0.5, 20, 0.1, 'burn lifetime');
  R(ground, c, 'scorchIntensity', 0, 2, 0.01, 'burn intensity');
  R(ground, c, 'dustRate', 0, 20, 0.1, 'dust rings / sec');
  R(ground, c, 'dustRadius', 0.2, 10, 0.05, 'dust ring radius');
  R(ground, c, 'dustLife', 0.1, 5, 0.05, 'dust ring lifetime');
  R(ground, c, 'shockRate', 0, 20, 0.1, 'shock rings / sec');
  R(ground, c, 'shockRadius', 0.5, 25, 0.1, 'shockwave radius');
  ground.addColor(c, 'colorScorch').name('scorch');
  ground.addColor(c, 'colorEmber').name('ember');
  ground.addColor(c, 'colorDustA').name('dust');
  ground.addColor(c, 'colorDustB').name('dust crest');
  ground.addColor(c, 'colorShockA').name('shockwave ring');
  ground.addColor(c, 'colorShockB').name('shockwave crest');

  const sparks = folder.addFolder('Sparks & motes');
  R(sparks, c, 'sparkRate', 0, 1200, 1, 'spark rate');
  R(sparks, c, 'sparkSize', 0.005, 0.8, 0.005, 'spark size');
  R(sparks, c, 'sparkSpeed', 0, 40, 0.1, 'spark speed');
  R(sparks, c, 'sparkLifetime', 0.05, 4, 0.01, 'spark lifetime');
  R(sparks, c, 'sparkGravity', -50, 5, 0.1, 'spark gravity');
  R(sparks, c, 'sparkStretch', 0, 3, 0.01, 'spark stretch');
  R(sparks, c, 'sparkForward', 0, 4, 0.01, 'downrange drag');
  R(sparks, c, 'moteRate', 0, 600, 1, 'mote rate');
  R(sparks, c, 'moteSize', 0.005, 0.4, 0.005, 'mote size');
  R(sparks, c, 'moteSpeed', 0, 12, 0.05, 'mote speed');
  R(sparks, c, 'moteLifetime', 0.1, 8, 0.05, 'mote lifetime');
  R(sparks, c, 'moteRise', -3, 8, 0.05, 'mote rise');
  R(sparks, c, 'moteTurbulence', 0, 3, 0.01, 'mote turbulence');
  gradient(sparks, c, 'colorSpark', 'Spark colour');
  gradient(sparks, c, 'colorMote', 'Mote colour');

  const dust = folder.addFolder('Steam & debris');
  R(dust, c, 'smokeRate', 0, 500, 1, 'steam rate');
  R(dust, c, 'smokeSize', 0.05, 4, 0.01, 'steam size');
  R(dust, c, 'smokeSpeed', 0, 8, 0.05, 'steam speed');
  R(dust, c, 'smokeLifetime', 0.2, 8, 0.05, 'steam lifetime');
  R(dust, c, 'smokeOpacity', 0, 1, 0.005, 'steam opacity');
  R(dust, c, 'smokeRise', -2, 4, 0.01, 'steam rise');
  R(dust, c, 'debrisRate', 0, 300, 1, 'debris rate');
  R(dust, c, 'debrisSize', 0.005, 0.4, 0.005, 'debris size');
  R(dust, c, 'debrisSpeed', 0, 25, 0.1, 'debris speed');
  R(dust, c, 'debrisLifetime', 0.1, 5, 0.05, 'debris lifetime');
  R(dust, c, 'debrisGravity', -50, 0, 0.1, 'debris gravity');
  gradient(dust, c, 'colorSmoke', 'Steam colour');
  gradient(dust, c, 'colorDebris', 'Debris colour');

  const impact = folder.addFolder('Release, impact & burn');
  R(impact, c, 'muzzleSize', 0.05, 8, 0.05, 'release shell');
  R(impact, c, 'muzzleIntensity', 0, 5, 0.01, 'release intensity');
  R(impact, c, 'castFlash', 0, 2, 0.01, 'flash on release');
  impact.addColor(c, 'colorCastFlash').name('release flash colour');
  R(impact, c, 'burstSize', 0.2, 18, 0.05, 'impact shell');
  R(impact, c, 'burstIntensity', 0, 5, 0.01, 'impact intensity');
  R(impact, c, 'burstSparks', 0, 800, 1, 'impact sparks');
  R(impact, c, 'burstDebris', 0, 400, 1, 'impact debris');
  R(impact, c, 'pulseRate', 0, 12, 0.1, 'burn shells / sec');
  R(impact, c, 'pulseSize', 0.1, 10, 0.05, 'burn shell size');
  R(impact, c, 'pulseIntensity', 0, 5, 0.01, 'burn shell intensity');
  R(impact, c, 'splashRate', 0, 900, 1, 'back-splash rate');
  R(impact, c, 'impactShake', 0, 3, 0.01, 'shake');
  R(impact, c, 'shakeDuration', 0.1, 4, 0.01, 'shake duration');
  R(impact, c, 'impactFlash', 0, 2, 0.01, 'screen flash');
  R(impact, c, 'rumble', 0, 0.5, 0.005, 'travel rumble');
  R(impact, c, 'burnShake', 0, 0.5, 0.005, 'burn rumble');
  impact.addColor(c, 'colorBurstA').name('impact shell');
  impact.addColor(c, 'colorBurstB').name('impact body');
  impact.addColor(c, 'colorBurstC').name('impact arcs');
  impact.addColor(c, 'colorFlash').name('impact flash colour');

  const light = folder.addFolder('Dynamic light');
  R(light, c, 'lightIntensity', 0, 120, 0.5, 'beam intensity');
  R(light, c, 'lightRadius', 0.5, 60, 0.1, 'beam radius');
  R(light, c, 'lightPulse', 0, 1, 0.01, 'hum depth');
  R(light, c, 'lightPulseSpeed', 0, 30, 0.1, 'hum rate');
  R(light, c, 'muzzleLightIntensity', 0, 120, 0.5, 'hand intensity');
  R(light, c, 'muzzleLightRadius', 0.5, 40, 0.1, 'hand radius');
  light.addColor(c, 'lightColor').name('light colour');

  editor.beamFolder = folder;
}
