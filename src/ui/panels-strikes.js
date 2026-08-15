/**
 * panels-strikes.js — the hand-written folders for the two line strikes.

 * Frost Lance and Storm Lance. Every bound value lives in `settings.ice` and
 * `settings.thunder`; the shaders read those same fields each frame, so no
 * control here needs an onChange and every drag lands on the effect that is
 * already on screen.
 *
 * Split out of `Editor.js` under the 800-line rule in `AGENTS.md`, verbatim
 * apart from becoming functions: each took no arguments and read nothing off the
 * instance but `gui`, so each now takes the editor and is called from a
 * one-line method that keeps the old name.
 */
import { settings } from '../config/settings.js';
import { range, castAnimation, gradient } from './controls.js';

export function buildIce(editor) {
  const folder = editor.gui.addFolder('❄  Frost Lance');
  const c = settings.ice;
  const R = range;

  const cast = folder.addFolder('The cast');
  R(cast, c, 'range', 2, 40, 0.1, 'max range');
  R(cast, c, 'minRange', 0, 10, 0.1, 'min range');
  R(cast, c, 'speed', 2, 80, 0.5, 'front speed');
  R(cast, c, 'lifetime', 0.2, 12, 0.1, 'field lifetime');
  R(cast, c, 'cooldown', 0, 6, 0.05, 'cooldown');
  castAnimation(cast, c);

  const field = folder.addFolder('Footprint');
  R(field, c, 'widthNear', 0.05, 6, 0.01, 'width at caster');
  R(field, c, 'width', 0.1, 10, 0.05, 'width at target');
  R(field, c, 'widthCurve', 0.2, 4, 0.01, 'width curve');
  R(field, c, 'spikeCount', 4, 288, 1, 'crystal count');
  R(field, c, 'density', 0.05, 1, 0.01, 'density');
  R(field, c, 'clumping', 0.3, 4, 0.01, 'pull to centre');
  R(field, c, 'scatter', 0, 2, 0.01, 'lateral scatter');
  R(field, c, 'frontBias', 0.3, 3, 0.01, 'crowd toward target');

  const shape = folder.addFolder('Silhouette');
  R(shape, c, 'heightNear', 0.05, 6, 0.01, 'height at caster');
  R(shape, c, 'height', 0.1, 12, 0.05, 'height at target');
  R(shape, c, 'heightCurve', 0.2, 5, 0.01, 'height curve');
  R(shape, c, 'heightJitter', 0, 1.5, 0.01, 'height jitter');
  R(shape, c, 'crown', 0, 0.95, 0.01, 'flank falloff');
  R(shape, c, 'peak', 1, 4, 0.01, 'swell at target');
  R(shape, c, 'peakWidth', 0.02, 1, 0.01, 'swell width');
  R(shape, c, 'rubble', 0, 1, 0.01, 'rubble fraction');
  R(shape, c, 'rubbleScale', 0.05, 1, 0.01, 'rubble height');

  // These four regenerate the crystal geometry — see IceAbility#_syncGeometry.
  const crystal = folder.addFolder('The crystal');
  R(crystal, c, 'radius', 0.02, 1.5, 0.01, 'base radius');
  R(crystal, c, 'radiusJitter', 0, 1.5, 0.01, 'radius jitter');
  R(crystal, c, 'taper', 0.01, 0.8, 0.01, 'tip taper');
  R(crystal, c, 'facets', 3, 10, 1, 'facets');
  R(crystal, c, 'roughness', 0, 1, 0.01, 'surface roughness');
  R(crystal, c, 'bend', 0, 1.5, 0.01, 'bend');
  R(crystal, c, 'lean', 0, 1.4, 0.01, 'lean from caster');
  R(crystal, c, 'leanJitter', 0, 1.5, 0.01, 'lean jitter');
  R(crystal, c, 'twist', 0, 1, 0.01, 'random yaw');

  const rise = folder.addFolder('The eruption');
  R(rise, c, 'riseTime', 0.02, 1.5, 0.01, 'rise time');
  R(rise, c, 'riseOvershoot', 0, 1, 0.01, 'punch overshoot');
  R(rise, c, 'riseStagger', 0, 1, 0.005, 'stagger');
  R(rise, c, 'settle', 0.05, 2, 0.01, 'settle time');
  R(rise, c, 'shatterDelay', 0, 4, 0.05, 'hold before sinking');
  R(rise, c, 'sinkTime', 0.1, 4, 0.05, 'sink time');

  const material = folder.addFolder('Ice material');
  material.addColor(c, 'colorDeep').name('deep');
  material.addColor(c, 'colorIce').name('body');
  material.addColor(c, 'colorRim').name('rim');
  material.addColor(c, 'colorCore').name('inner light');
  R(material, c, 'opacity', 0, 1, 0.01, 'opacity');
  R(material, c, 'depthTint', 0, 3, 0.01, 'thickness tint');
  R(material, c, 'fresnel', 0, 6, 0.01, 'fresnel');
  R(material, c, 'fresnelPower', 0.5, 6, 0.05, 'fresnel power');
  R(material, c, 'translucency', 0, 4, 0.01, 'translucency');
  R(material, c, 'envIntensity', 0, 3, 0.01, 'reflection');
  R(material, c, 'facetSharp', 0, 1.5, 0.01, 'facet contrast');
  R(material, c, 'fracture', 0, 2, 0.01, 'internal cracks');
  R(material, c, 'fractureScale', 0.5, 20, 0.1, 'crack scale');
  R(material, c, 'veins', 0, 2, 0.01, 'feather frost');
  R(material, c, 'veinScale', 0.2, 10, 0.05, 'frost scale');
  R(material, c, 'glint', 0, 5, 0.01, 'surface glint');
  R(material, c, 'glintScale', 4, 90, 0.5, 'glint scale');
  R(material, c, 'glintSpeed', 0, 4, 0.01, 'glint speed');
  R(material, c, 'frostLine', 0, 1.5, 0.01, 'rime at the base');
  R(material, c, 'glow', 0, 5, 0.01, 'glow');
  R(material, c, 'edgeGlow', 0, 6, 0.01, 'edge glow');
  R(material, c, 'birthGlow', 0, 10, 0.05, 'birth flash');
  R(material, c, 'birthFade', 0.02, 2, 0.01, 'birth flash time');

  const ground = folder.addFolder('Frost on the ground');
  R(ground, c, 'frostSpread', 0.1, 5, 0.01, 'patch radius');
  R(ground, c, 'frostRate', 0.2, 12, 0.1, 'patches / metre');
  R(ground, c, 'frostLife', 0.5, 20, 0.1, 'patch lifetime');
  R(ground, c, 'frostIntensity', 0, 2, 0.01, 'intensity');
  R(ground, c, 'frostCrystals', 0, 4, 0.01, 'snow grain');
  R(ground, c, 'shockRadius', 0.5, 20, 0.1, 'shockwave radius');
  ground.addColor(c, 'colorFrost').name('snow');
  ground.addColor(c, 'colorFrostEdge').name('snow shadow');
  ground.addColor(c, 'colorShockA').name('shockwave ring');
  ground.addColor(c, 'colorShockB').name('shockwave crest');

  const mist = folder.addFolder('Mist, chips & glitter');
  R(mist, c, 'mistRate', 0, 900, 1, 'mist rate');
  R(mist, c, 'mistSize', 0.05, 4, 0.01, 'mist size');
  R(mist, c, 'mistSpeed', 0, 8, 0.05, 'mist speed');
  R(mist, c, 'mistLifetime', 0.2, 8, 0.05, 'mist lifetime');
  R(mist, c, 'mistOpacity', 0, 2, 0.01, 'mist opacity');
  R(mist, c, 'mistRise', -2, 4, 0.01, 'mist rise');
  // No `shardRate` control: the chips are burst-emitted at a fixed count, so
  // the key is inert here as well as on every block derived from this one.
  R(mist, c, 'shardSize', 0.005, 0.5, 0.005, 'chip size');
  R(mist, c, 'shardSpeed', 0, 25, 0.1, 'chip speed');
  R(mist, c, 'shardLifetime', 0.1, 5, 0.05, 'chip lifetime');
  R(mist, c, 'shardGravity', -40, 0, 0.1, 'chip gravity');
  R(mist, c, 'sparkleRate', 0, 600, 1, 'glitter rate');
  R(mist, c, 'sparkleSize', 0.005, 0.4, 0.005, 'glitter size');
  R(mist, c, 'sparkleSpeed', 0, 12, 0.05, 'glitter speed');
  R(mist, c, 'sparkleLifetime', 0.2, 8, 0.05, 'glitter lifetime');
  R(mist, c, 'sparkleRise', -2, 8, 0.05, 'glitter rise');
  R(mist, c, 'sparkleTurbulence', 0, 3, 0.01, 'glitter turbulence');
  gradient(mist, c, 'colorMist', 'Mist colour');
  gradient(mist, c, 'colorShard', 'Chip colour');
  gradient(mist, c, 'colorSparkle', 'Glitter colour');

  const impact = folder.addFolder('Impact');
  R(impact, c, 'burstSize', 0.2, 14, 0.05, 'burst size');
  R(impact, c, 'burstIntensity', 0, 4, 0.01, 'burst intensity');
  R(impact, c, 'burstShards', 0, 400, 1, 'burst chips');
  R(impact, c, 'impactShake', 0, 3, 0.01, 'shake');
  R(impact, c, 'shakeDuration', 0.1, 4, 0.01, 'shake duration');
  R(impact, c, 'impactFlash', 0, 2, 0.01, 'screen flash');
  R(impact, c, 'rumble', 0, 0.5, 0.005, 'travel rumble');
  impact.addColor(c, 'colorBurstA').name('vapour shell');
  impact.addColor(c, 'colorBurstB').name('shell body');
  impact.addColor(c, 'colorBurstC').name('plates & rim');
  impact.addColor(c, 'colorFlash').name('screen flash colour');

  const light = folder.addFolder('Dynamic light');
  R(light, c, 'lightIntensity', 0, 80, 0.1, 'light intensity');
  R(light, c, 'lightRadius', 0.5, 40, 0.1, 'light radius');
  light.addColor(c, 'lightColor').name('light colour');

  editor.iceFolder = folder;
}

/**
 * Storm Lance.
 *
 * Every control here is read by the vertex shader on the frame it changes, so
 * the whole folder reshapes a bolt that is already in the air. The ones worth
 * reaching for first are `jitter` and `jitterScale` (how violently it kinks),
 * `strands` and `spread` (how wide the bundle reads) and `restrike` (how hard
 * it strobes) — those four carry the character of the effect.
 */
export function buildThunder(editor) {
  const folder = editor.gui.addFolder('⚡  Storm Lance');
  const c = settings.thunder;
  const R = range;

  const cast = folder.addFolder('The cast');
  R(cast, c, 'range', 2, 60, 0.1, 'max range');
  R(cast, c, 'minRange', 0, 10, 0.1, 'min range');
  R(cast, c, 'speed', 5, 400, 1, 'strike speed');
  R(cast, c, 'lifetime', 0.05, 6, 0.01, 'bolt lifetime');
  R(cast, c, 'fadeTime', 0.05, 4, 0.01, 'blow-out time');
  R(cast, c, 'cooldown', 0, 6, 0.05, 'cooldown');
  castAnimation(cast, c);

  const anchor = folder.addFolder('Where it leaves the hand');
  R(anchor, c, 'handHeight', 0, 3, 0.01, 'hand height');
  R(anchor, c, 'handForward', -1, 3, 0.01, 'hand forward');
  R(anchor, c, 'handSide', -1.5, 1.5, 0.01, 'hand lateral');
  R(anchor, c, 'endHeight', 0, 4, 0.01, 'height at target');
  R(anchor, c, 'sag', -3, 3, 0.01, 'mid-span bow');

  const bundle = folder.addFolder('The bundle');
  R(bundle, c, 'strands', 1, 24, 1, 'filaments');
  R(bundle, c, 'spread', 0, 5, 0.01, 'fan at target');
  R(bundle, c, 'spreadNear', 0, 2, 0.01, 'fan at hand');
  R(bundle, c, 'spreadCurve', 0.2, 5, 0.01, 'fan curve');
  R(bundle, c, 'twist', -4, 4, 0.01, 'twist over length');
  R(bundle, c, 'twistSpeed', -6, 6, 0.01, 'twist speed');
  R(bundle, c, 'branchDim', 0, 1, 0.01, 'outer filament dim');

  const shape = folder.addFolder('The filament');
  R(shape, c, 'jitter', 0, 3, 0.01, 'kink amplitude');
  R(shape, c, 'jitterScale', 0.05, 6, 0.01, 'kinks / metre');
  R(shape, c, 'octaves', 1, 5, 1, 'octaves');
  R(shape, c, 'jitterFalloff', 0.1, 0.95, 0.01, 'octave falloff');
  R(shape, c, 'crawl', -20, 20, 0.1, 'kink crawl');
  R(shape, c, 'pinch', 0.01, 0.5, 0.005, 'end pinch');
  R(shape, c, 'converge', 0, 1, 0.01, 'lock onto target');

  const ribbon = folder.addFolder('The ribbon');
  R(ribbon, c, 'width', 0.005, 0.6, 0.005, 'width at hand');
  R(ribbon, c, 'widthTip', 0.02, 3, 0.01, 'width at target');
  R(ribbon, c, 'widthCurve', 0.1, 4, 0.01, 'taper curve');
  R(ribbon, c, 'coreWidth', 1, 6, 0.01, 'spine thickness');
  R(ribbon, c, 'coreSharp', 0.5, 12, 0.05, 'core sharpness');
  R(ribbon, c, 'glowWidth', 1, 30, 0.1, 'halo width');
  R(ribbon, c, 'glowFalloff', 0.2, 8, 0.05, 'halo falloff');
  R(ribbon, c, 'glowOpacity', 0, 2, 0.01, 'halo opacity');
  R(ribbon, c, 'softFade', 0.02, 3, 0.01, 'soft intersection');

  const strobe = folder.addFolder('Flicker & restrike');
  R(strobe, c, 'restrike', 0.5, 90, 0.5, 'restrikes / sec');
  R(strobe, c, 'flicker', 0, 1, 0.01, 'brightness stutter');
  R(strobe, c, 'flickerSpeed', 1, 120, 1, 'stutter rate');
  R(strobe, c, 'strandFlash', 0, 1, 0.01, 'filament blink');
  R(strobe, c, 'tipGlow', 0, 8, 0.05, 'leading-edge glow');
  R(strobe, c, 'tipLength', 0.005, 0.5, 0.005, 'leading-edge length');

  const material = folder.addFolder('Bolt colour');
  material.addColor(c, 'colorCore').name('core');
  material.addColor(c, 'colorInner').name('inner');
  material.addColor(c, 'colorOuter').name('outer');
  material.addColor(c, 'colorHalo').name('halo');
  R(material, c, 'glow', 0, 8, 0.01, 'glow');
  R(material, c, 'opacity', 0, 2, 0.01, 'opacity');

  const ground = folder.addFolder('Burns on the ground');
  R(ground, c, 'arcRate', 0.05, 8, 0.05, 'burns / metre');
  R(ground, c, 'arcRadius', 0.1, 8, 0.05, 'burn radius');
  R(ground, c, 'arcLife', 0.05, 5, 0.05, 'burn lifetime');
  R(ground, c, 'arcIntensity', 0, 3, 0.01, 'burn intensity');
  R(ground, c, 'arcBranches', 0, 3, 0.01, 'branch detail');
  R(ground, c, 'scorchRadius', 0.05, 4, 0.05, 'scorch radius');
  R(ground, c, 'scorchLife', 0.5, 20, 0.1, 'scorch lifetime');
  R(ground, c, 'scorchIntensity', 0, 2, 0.01, 'scorch intensity');
  R(ground, c, 'shockRadius', 0.5, 25, 0.1, 'shockwave radius');
  ground.addColor(c, 'colorArc').name('burn');
  ground.addColor(c, 'colorEmber').name('ember');
  ground.addColor(c, 'colorScorch').name('scorch');
  ground.addColor(c, 'colorShockA').name('shockwave ring');
  ground.addColor(c, 'colorShockB').name('shockwave crest');

  const sparks = folder.addFolder('Sparks & motes');
  R(sparks, c, 'sparkRate', 0, 1200, 1, 'spark rate');
  R(sparks, c, 'sparkSize', 0.005, 0.8, 0.005, 'spark size');
  R(sparks, c, 'sparkSpeed', 0, 40, 0.1, 'spark speed');
  R(sparks, c, 'sparkLifetime', 0.05, 4, 0.01, 'spark lifetime');
  R(sparks, c, 'sparkGravity', -50, 5, 0.1, 'spark gravity');
  R(sparks, c, 'sparkStretch', 0, 3, 0.01, 'spark stretch');
  R(sparks, c, 'moteRate', 0, 600, 1, 'mote rate');
  R(sparks, c, 'moteSize', 0.005, 0.4, 0.005, 'mote size');
  R(sparks, c, 'moteSpeed', 0, 12, 0.05, 'mote speed');
  R(sparks, c, 'moteLifetime', 0.1, 8, 0.05, 'mote lifetime');
  R(sparks, c, 'moteRise', -3, 8, 0.05, 'mote rise');
  R(sparks, c, 'moteTurbulence', 0, 3, 0.01, 'mote turbulence');
  gradient(sparks, c, 'colorSpark', 'Spark colour');
  gradient(sparks, c, 'colorMote', 'Mote colour');

  const dust = folder.addFolder('Smoke & debris');
  R(dust, c, 'smokeRate', 0, 500, 1, 'smoke rate');
  R(dust, c, 'smokeSize', 0.05, 4, 0.01, 'smoke size');
  R(dust, c, 'smokeSpeed', 0, 8, 0.05, 'smoke speed');
  R(dust, c, 'smokeLifetime', 0.2, 8, 0.05, 'smoke lifetime');
  R(dust, c, 'smokeOpacity', 0, 1, 0.005, 'smoke opacity');
  R(dust, c, 'smokeRise', -2, 4, 0.01, 'smoke rise');
  R(dust, c, 'debrisRate', 0, 300, 1, 'debris rate');
  R(dust, c, 'debrisSize', 0.005, 0.4, 0.005, 'debris size');
  R(dust, c, 'debrisSpeed', 0, 25, 0.1, 'debris speed');
  R(dust, c, 'debrisLifetime', 0.1, 5, 0.05, 'debris lifetime');
  R(dust, c, 'debrisGravity', -50, 0, 0.1, 'debris gravity');
  gradient(dust, c, 'colorSmoke', 'Smoke colour');
  gradient(dust, c, 'colorDebris', 'Debris colour');

  const impact = folder.addFolder('Muzzle & impact');
  R(impact, c, 'muzzleSize', 0.05, 6, 0.05, 'muzzle size');
  R(impact, c, 'muzzleIntensity', 0, 5, 0.01, 'muzzle intensity');
  R(impact, c, 'castFlash', 0, 2, 0.01, 'flash on release');
  impact.addColor(c, 'colorMuzzleA').name('muzzle shell');
  impact.addColor(c, 'colorMuzzleB').name('muzzle body');
  impact.addColor(c, 'colorMuzzleC').name('muzzle arcs');
  impact.addColor(c, 'colorCastFlash').name('release flash colour');
  R(impact, c, 'burstSize', 0.2, 14, 0.05, 'burst size');
  R(impact, c, 'burstIntensity', 0, 5, 0.01, 'burst intensity');
  R(impact, c, 'burstSparks', 0, 600, 1, 'burst sparks');
  R(impact, c, 'burstDebris', 0, 300, 1, 'burst debris');
  R(impact, c, 'impactShake', 0, 3, 0.01, 'shake');
  R(impact, c, 'shakeDuration', 0.1, 4, 0.01, 'shake duration');
  R(impact, c, 'impactFlash', 0, 2, 0.01, 'screen flash');
  R(impact, c, 'rumble', 0, 0.5, 0.005, 'travel rumble');
  impact.addColor(c, 'colorBurstA').name('burst shell');
  impact.addColor(c, 'colorBurstB').name('burst body');
  impact.addColor(c, 'colorBurstC').name('burst arcs');
  impact.addColor(c, 'colorFlash').name('impact flash colour');

  const light = folder.addFolder('Dynamic light');
  R(light, c, 'lightIntensity', 0, 120, 0.5, 'light intensity');
  R(light, c, 'lightRadius', 0.5, 50, 0.1, 'light radius');
  R(light, c, 'lightFlicker', 0, 1, 0.01, 'light gutter');
  R(light, c, 'lightFlickerSpeed', 1, 90, 1, 'gutter rate');
  light.addColor(c, 'lightColor').name('light colour');

  editor.thunderFolder = folder;
}
