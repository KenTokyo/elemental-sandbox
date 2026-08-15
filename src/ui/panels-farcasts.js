/**
 * panels-farcasts.js — the hand-written folders for the two far casts.

 * Voltaic Snare and Glacial Crown. Both are aimed with the circle rather than
 * the arrow, which is why both folders open on `zoneRadius` — the one control
 * that reaches outside the ability, since the indicator has to measure out
 * exactly the footprint the effect will land in.
 *
 * Split out of `Editor.js` under the 800-line rule in `AGENTS.md`, verbatim
 * apart from becoming functions: each took no arguments and read nothing off the
 * instance but `gui`, so each now takes the editor and is called from a
 * one-line method that keeps the old name.
 */
import { settings } from '../config/settings.js';
import { range, castAnimation, gradient } from './controls.js';

export function buildSnare(editor) {
  const folder = editor.gui.addFolder('◈  Voltaic Snare');
  const c = settings.snare;
  const R = range;

  const cast = folder.addFolder('The cast');
  R(cast, c, 'zoneRadius', 0.5, 14, 0.05, 'footprint radius');
  R(cast, c, 'range', 2, 50, 0.1, 'max range');
  R(cast, c, 'minRange', 0, 10, 0.1, 'min range');
  R(cast, c, 'speed', 5, 300, 1, 'leash speed');
  R(cast, c, 'snapTime', 0.02, 1.5, 0.01, 'snap-open time');
  R(cast, c, 'lifetime', 0.1, 12, 0.05, 'hold time');
  R(cast, c, 'fadeTime', 0.05, 4, 0.01, 'collapse time');
  R(cast, c, 'cooldown', 0, 8, 0.05, 'cooldown');
  castAnimation(cast, c);

  const leash = folder.addFolder('The leash');
  R(leash, c, 'handHeight', 0, 3, 0.01, 'hand height');
  R(leash, c, 'handForward', -1, 3, 0.01, 'hand forward');
  R(leash, c, 'handSide', -1.5, 1.5, 0.01, 'hand lateral');
  R(leash, c, 'leashStrands', 0, 6, 1, 'filaments');
  R(leash, c, 'leashSag', -3, 3, 0.01, 'mid-span bow');
  R(leash, c, 'leashSpread', 0, 2, 0.01, 'fan');
  R(leash, c, 'leashCling', 0, 1.5, 0.01, 'height at the tip');
  R(leash, c, 'leashKink', 0, 2, 0.01, 'kink amplitude');
  R(leash, c, 'leashWidth', 0.1, 4, 0.01, 'ribbon width');

  const column = folder.addFolder('The column');
  R(column, c, 'strands', 0, 16, 1, 'filaments');
  R(column, c, 'height', 0.5, 24, 0.1, 'height');
  R(column, c, 'heightCurve', 0.1, 4, 0.01, 'climb curve');
  R(column, c, 'throat', 0.005, 1, 0.005, 'throat, × footprint');
  R(column, c, 'columnSpread', 0.01, 1, 0.005, 'top, × footprint');
  R(column, c, 'columnCurve', 0.1, 5, 0.01, 'opening curve');
  R(column, c, 'columnFlare', 0, 1, 0.005, 'top flare');
  R(column, c, 'columnTwist', -4, 4, 0.01, 'twist over height');
  R(column, c, 'columnSpin', -4, 4, 0.01, 'spin');
  R(column, c, 'columnKink', 0, 2, 0.01, 'kink amplitude');
  R(column, c, 'columnWidth', 0.1, 6, 0.01, 'ribbon width');
  R(column, c, 'columnTaper', 0.05, 2, 0.01, 'taper to the top');

  const tendrils = folder.addFolder('The tendrils');
  R(tendrils, c, 'tendrils', 0, 20, 1, 'tendrils');
  R(tendrils, c, 'tendrilInner', 0, 1, 0.005, 'start, × footprint');
  R(tendrils, c, 'tendrilReach', 0.05, 1.6, 0.01, 'end, × footprint');
  R(tendrils, c, 'tendrilCurve', 0.1, 4, 0.01, 'reach curve');
  R(tendrils, c, 'tendrilWander', 0, 4, 0.01, 'veer');
  R(tendrils, c, 'tendrilArch', 0, 3, 0.01, 'hop off the floor');
  R(tendrils, c, 'tendrilHug', 0.005, 1, 0.005, 'floor clearance');
  R(tendrils, c, 'tendrilSpin', -2, 2, 0.005, 'fan rotation');
  R(tendrils, c, 'tendrilKink', 0, 2, 0.01, 'kink amplitude');
  R(tendrils, c, 'tendrilWidth', 0.05, 4, 0.01, 'ribbon width');
  R(tendrils, c, 'tendrilDim', 0, 1, 0.01, 'dim vs the column');

  const rim = folder.addFolder('The rim arcs');
  R(rim, c, 'rimArcs', 0, 14, 1, 'arcs');
  R(rim, c, 'rimSpan', 0.01, 1, 0.005, 'arc span, × the circle');
  R(rim, c, 'rimSpeed', -3, 3, 0.01, 'travel speed');
  R(rim, c, 'rimHeight', 0, 3, 0.01, 'hop height');
  R(rim, c, 'rimJitter', 0, 1, 0.01, 'radial wobble');
  R(rim, c, 'rimKink', 0, 2, 0.01, 'kink amplitude');
  R(rim, c, 'rimWidth', 0.05, 4, 0.01, 'ribbon width');
  R(rim, c, 'rimDim', 0, 1, 0.01, 'dim vs the column');

  const shape = folder.addFolder('Filaments & flicker');
  R(shape, c, 'jitter', 0, 4, 0.01, 'kink master');
  R(shape, c, 'jitterScale', 0.05, 8, 0.01, 'kinks / metre');
  R(shape, c, 'octaves', 1, 5, 1, 'octaves');
  R(shape, c, 'jitterFalloff', 0.1, 0.95, 0.01, 'octave falloff');
  R(shape, c, 'crawl', -20, 20, 0.1, 'kink crawl');
  R(shape, c, 'pinch', 0.01, 0.5, 0.005, 'end pinch');
  R(shape, c, 'restrike', 0.5, 90, 0.5, 'restrikes / sec');
  R(shape, c, 'flicker', 0, 1, 0.01, 'brightness stutter');
  R(shape, c, 'flickerSpeed', 1, 120, 1, 'stutter rate');
  R(shape, c, 'strandFlash', 0, 1, 0.01, 'filament blink');

  const ribbon = folder.addFolder('The ribbon & colour');
  R(ribbon, c, 'width', 0.005, 0.4, 0.001, 'filament width');
  R(ribbon, c, 'coreSharp', 0.5, 12, 0.05, 'core sharpness');
  R(ribbon, c, 'glowWidth', 1, 30, 0.1, 'halo width');
  R(ribbon, c, 'glowFalloff', 0.2, 8, 0.05, 'halo falloff');
  R(ribbon, c, 'glowOpacity', 0, 2, 0.01, 'halo opacity');
  R(ribbon, c, 'softFade', 0.02, 3, 0.01, 'soft intersection');
  R(ribbon, c, 'glow', 0, 8, 0.01, 'glow');
  R(ribbon, c, 'opacity', 0, 2, 0.01, 'opacity');
  ribbon.addColor(c, 'colorCore').name('core');
  ribbon.addColor(c, 'colorInner').name('inner');
  ribbon.addColor(c, 'colorOuter').name('outer');
  ribbon.addColor(c, 'colorHalo').name('halo');

  const field = folder.addFolder('The field on the floor');
  R(field, c, 'fieldBoundary', 0.02, 2, 0.01, 'band thickness');
  R(field, c, 'fieldBoundaryGlow', 0, 8, 0.05, 'band glow');
  R(field, c, 'fieldFill', 0, 2, 0.01, 'interior fill');
  R(field, c, 'fieldFalloff', 0.1, 5, 0.05, 'fill falloff');
  R(field, c, 'fieldVeins', 0, 3, 0.01, 'burnt veins');
  R(field, c, 'fieldVeinScale', 0.1, 8, 0.05, 'veins / metre');
  R(field, c, 'fieldVeinSharp', 0, 1, 0.01, 'vein sharpness');
  R(field, c, 'fieldWarp', 0, 2, 0.01, 'domain warp');
  R(field, c, 'fieldCrawl', -4, 4, 0.01, 'vein crawl');
  R(field, c, 'fieldRings', 0, 12, 0.1, 'pressure rings');
  R(field, c, 'fieldRingSpeed', -6, 6, 0.01, 'ring speed');
  R(field, c, 'fieldSpokes', 0, 96, 1, 'boundary ticks');
  R(field, c, 'fieldSpokeLength', 0.05, 3, 0.01, 'tick length');
  R(field, c, 'fieldSpin', -2, 2, 0.005, 'tick spin');
  R(field, c, 'fieldCore', 0, 4, 0.01, 'centre pool');
  R(field, c, 'fieldCoreSize', 0.02, 1, 0.005, 'pool size, × footprint');
  R(field, c, 'fieldPulse', 0, 1, 0.01, 'pulse');
  R(field, c, 'fieldPulseSpeed', 0, 10, 0.05, 'pulse speed');
  R(field, c, 'fieldOpacity', 0, 2, 0.01, 'opacity');
  R(field, c, 'fieldHeight', 0.005, 0.4, 0.005, 'hover height');
  field.addColor(c, 'colorField').name('field');
  field.addColor(c, 'colorFieldEdge').name('band & pool');

  const ground = folder.addFolder('Burns on the ground');
  R(ground, c, 'arcRate', 0, 30, 0.1, 'rim burns / sec');
  R(ground, c, 'arcRadius', 0.1, 8, 0.05, 'burn radius');
  R(ground, c, 'arcLife', 0.05, 5, 0.05, 'burn lifetime');
  R(ground, c, 'arcIntensity', 0, 3, 0.01, 'burn intensity');
  R(ground, c, 'arcBranches', 0, 3, 0.01, 'branch detail');
  R(ground, c, 'trailRate', 0.05, 8, 0.05, 'leash burns / metre');
  R(ground, c, 'scorchRadius', 0.05, 8, 0.05, 'scorch radius');
  R(ground, c, 'scorchLife', 0.5, 20, 0.1, 'scorch lifetime');
  R(ground, c, 'scorchIntensity', 0, 2, 0.01, 'scorch intensity');
  R(ground, c, 'shockRadius', 0.5, 25, 0.1, 'shockwave radius');
  R(ground, c, 'ringRate', 0, 12, 0.1, 'dust rings / sec');
  ground.addColor(c, 'colorArc').name('burn');
  ground.addColor(c, 'colorEmber').name('ember');
  ground.addColor(c, 'colorScorch').name('scorch');
  ground.addColor(c, 'colorShockA').name('shockwave ring');
  ground.addColor(c, 'colorShockB').name('shockwave crest');

  const sparks = folder.addFolder('Sparks & updraft');
  R(sparks, c, 'sparkRate', 0, 1200, 1, 'spark rate');
  R(sparks, c, 'sparkSize', 0.005, 0.8, 0.005, 'spark size');
  R(sparks, c, 'sparkSpeed', 0, 40, 0.1, 'spark speed');
  R(sparks, c, 'sparkLifetime', 0.05, 4, 0.01, 'spark lifetime');
  R(sparks, c, 'sparkGravity', -50, 5, 0.1, 'spark gravity');
  R(sparks, c, 'sparkStretch', 0, 3, 0.01, 'spark stretch');
  R(sparks, c, 'updraftRate', 0, 900, 1, 'updraft rate');
  R(sparks, c, 'updraftSize', 0.005, 0.4, 0.005, 'updraft size');
  R(sparks, c, 'updraftSpeed', 0, 25, 0.1, 'pull-in speed');
  R(sparks, c, 'updraftLifetime', 0.1, 8, 0.05, 'updraft lifetime');
  R(sparks, c, 'updraftRise', -5, 25, 0.1, 'lift');
  R(sparks, c, 'updraftInset', 0, 0.95, 0.01, 'pick-up inset');
  R(sparks, c, 'updraftTurbulence', 0, 3, 0.01, 'updraft swirl');
  gradient(sparks, c, 'colorSpark', 'Spark colour');
  gradient(sparks, c, 'colorUpdraft', 'Updraft colour');

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

  const impact = folder.addFolder('Throw, snap & hold');
  R(impact, c, 'muzzleSize', 0.05, 6, 0.05, 'muzzle size');
  R(impact, c, 'muzzleIntensity', 0, 5, 0.01, 'muzzle intensity');
  R(impact, c, 'castFlash', 0, 2, 0.01, 'flash on release');
  R(impact, c, 'burstSize', 0.2, 14, 0.05, 'snap shell size');
  R(impact, c, 'burstIntensity', 0, 5, 0.01, 'snap shell intensity');
  R(impact, c, 'burstSparks', 0, 600, 1, 'snap sparks');
  R(impact, c, 'burstDebris', 0, 300, 1, 'snap debris');
  R(impact, c, 'pulseRate', 0, 12, 0.1, 'hold shells / sec');
  R(impact, c, 'pulseSize', 0.1, 10, 0.05, 'hold shell size');
  R(impact, c, 'pulseIntensity', 0, 5, 0.01, 'hold shell intensity');
  R(impact, c, 'impactShake', 0, 3, 0.01, 'shake');
  R(impact, c, 'shakeDuration', 0.1, 4, 0.01, 'shake duration');
  R(impact, c, 'holdShake', 0, 0.5, 0.005, 'hold rumble');
  R(impact, c, 'impactFlash', 0, 2, 0.01, 'screen flash');
  R(impact, c, 'rumble', 0, 0.5, 0.005, 'travel rumble');
  impact.addColor(c, 'colorCastFlash').name('release flash colour');
  impact.addColor(c, 'colorBurstA').name('shell');
  impact.addColor(c, 'colorBurstB').name('shell body');
  impact.addColor(c, 'colorBurstC').name('shell arcs');
  impact.addColor(c, 'colorFlash').name('snap flash colour');

  const light = folder.addFolder('Dynamic light');
  R(light, c, 'lightIntensity', 0, 120, 0.5, 'light intensity');
  R(light, c, 'lightRadius', 0.5, 50, 0.1, 'light radius');
  R(light, c, 'lightHeight', 0, 1, 0.01, 'height up the column');
  R(light, c, 'lightFlicker', 0, 1, 0.01, 'light gutter');
  R(light, c, 'lightFlickerSpeed', 1, 90, 1, 'gutter rate');
  light.addColor(c, 'lightColor').name('light colour');

  editor.snareFolder = folder;
}


/**
 * Glacial Crown — the far cast that comes out of the floor.
 *
 * `zoneRadius` is again the control that reaches outside the ability: it is
 * read by the circle indicator *and* by the ring of blades, the sheet and the
 * curtain, so dragging it re-scales what you aim with and what you get
 * together. After that the two groups that carry the cast are **The bloom**,
 * where `sweepTime` decides how the ring closes, and **Freeze front &
 * shatter**, which is how the ice arrives and how it leaves.
 */
export function buildGlacier(editor) {
  const folder = editor.gui.addFolder('❆  Glacial Crown');
  const c = settings.glacier;
  const R = range;

  const cast = folder.addFolder('The cast');
  R(cast, c, 'zoneRadius', 0.5, 14, 0.05, 'footprint radius');
  R(cast, c, 'range', 2, 50, 0.1, 'max range');
  R(cast, c, 'minRange', 0, 10, 0.1, 'min range');
  R(cast, c, 'speed', 5, 200, 1, 'front speed');
  R(cast, c, 'snapTime', 0.02, 1.5, 0.01, 'freeze-out time');
  R(cast, c, 'lifetime', 0.2, 14, 0.05, 'hold time');
  R(cast, c, 'shatterDelay', 0, 4, 0.01, 'delay before it breaks');
  R(cast, c, 'shatterStagger', 0, 3, 0.01, 'break stagger');
  R(cast, c, 'sinkTime', 0.05, 5, 0.01, 'crumble time');
  R(cast, c, 'cooldown', 0, 8, 0.05, 'cooldown');
  castAnimation(cast, c);

  const hand = folder.addFolder('Where the front leaves the hand');
  R(hand, c, 'handHeight', 0, 3, 0.01, 'hand height');
  R(hand, c, 'handForward', -1, 3, 0.01, 'hand forward');
  R(hand, c, 'handSide', -1.5, 1.5, 0.01, 'hand lateral');
  R(hand, c, 'muzzleSize', 0.05, 6, 0.05, 'muzzle size');
  R(hand, c, 'muzzleIntensity', 0, 5, 0.01, 'muzzle intensity');
  R(hand, c, 'castFlash', 0, 2, 0.01, 'flash on release');
  hand.addColor(c, 'colorCastFlash').name('release flash colour');

  const fill = folder.addFolder('Filling the footprint');
  R(fill, c, 'spikeCount', 1, 320, 1, 'shards');
  R(fill, c, 'density', 0.1, 2, 0.01, 'density');
  R(fill, c, 'ringShare', 0, 1, 0.01, 'share on the wall');
  R(fill, c, 'coreShare', 0, 0.5, 0.01, 'share on the spire');
  R(fill, c, 'lateShare', 0, 0.5, 0.01, 'share held back');
  R(fill, c, 'ringSeat', 0.2, 1.4, 0.01, 'wall seat, × footprint');
  R(fill, c, 'ringScatter', 0, 0.6, 0.005, 'wall jitter, × footprint');
  R(fill, c, 'skirtSeat', 0, 1.4, 0.01, 'skirt inner lip, × footprint');
  R(fill, c, 'skirtBand', 0.02, 1.4, 0.01, 'skirt width, × footprint');
  R(fill, c, 'skirtBias', 0.2, 3, 0.01, 'skirt crowding');
  R(fill, c, 'coreSpread', 0.01, 0.6, 0.005, 'spire cluster, × footprint');

  const shape = folder.addFolder('Silhouette');
  R(shape, c, 'ringHeight', 0.2, 12, 0.05, 'wall height');
  R(shape, c, 'ringWave', 0, 1, 0.01, 'crest unevenness');
  R(shape, c, 'skirtHeight', 0.05, 6, 0.05, 'skirt height');
  R(shape, c, 'coreHeight', 0.2, 12, 0.05, 'spire height');
  R(shape, c, 'heightJitter', 0, 1.5, 0.01, 'height jitter');
  R(shape, c, 'ringLean', -1.5, 1.5, 0.01, 'wall lean (0 = a fence)');
  R(shape, c, 'skirtLean', -1.5, 1.5, 0.01, 'skirt lean');
  R(shape, c, 'coreLean', -1.5, 1.5, 0.01, 'spire lean');
  R(shape, c, 'leanJitter', 0, 3, 0.01, 'lean jitter');
  R(shape, c, 'fan', 0, 1.6, 0.01, 'splay off the radius');
  R(shape, c, 'twist', 0, 1, 0.01, 'random yaw');
  R(shape, c, 'rubble', 0, 1, 0.01, 'rubble fraction');
  R(shape, c, 'rubbleScale', 0.05, 1, 0.01, 'rubble height');

  const crystal = folder.addFolder('The crystal');
  R(crystal, c, 'radius', 0.05, 1.2, 0.005, 'base radius');
  R(crystal, c, 'radiusJitter', 0, 1.5, 0.01, 'radius jitter');
  R(crystal, c, 'taper', 0.01, 0.9, 0.01, 'tip taper');
  R(crystal, c, 'facets', 3, 12, 1, 'facets');
  R(crystal, c, 'roughness', 0, 1, 0.01, 'facet roughness');
  R(crystal, c, 'bend', 0, 1.5, 0.01, 'bend');

  const bloom = folder.addFolder('The bloom');
  R(bloom, c, 'sweepTime', 0, 3, 0.01, 'sweep around the ring');
  R(bloom, c, 'skirtDelay', 0, 2, 0.01, 'skirt delay');
  R(bloom, c, 'skirtWave', 0, 2, 0.01, 'skirt wave');
  R(bloom, c, 'coreDelay', 0, 2, 0.01, 'spire delay');
  R(bloom, c, 'stagger', 0, 1, 0.005, 'random stagger');
  R(bloom, c, 'bloomSpread', 0, 1, 0.01, 'late shards spread');
  R(bloom, c, 'riseTime', 0.02, 1.5, 0.01, 'rise time');
  R(bloom, c, 'riseOvershoot', 0, 1.5, 0.01, 'punch overshoot');
  R(bloom, c, 'settle', 0.05, 2, 0.01, 'settle');

  const material = folder.addFolder('Prismatic glass');
  R(material, c, 'opacity', 0, 1, 0.01, 'opacity');
  R(material, c, 'body', 0, 2, 0.01, 'body (0 = pure edges)');
  R(material, c, 'edgePower', 0.5, 8, 0.01, 'edge tightness');
  R(material, c, 'edgeGain', 0, 6, 0.01, 'edge gain');
  R(material, c, 'dispersion', 0, 1, 0.01, 'chromatic split');
  R(material, c, 'pipe', 0, 5, 0.01, 'piped light');
  R(material, c, 'tipBias', 0.2, 6, 0.01, 'crowding to the point');
  R(material, c, 'bands', 0, 8, 0.05, 'travelling bands');
  R(material, c, 'pulseSpeed', -4, 4, 0.01, 'band speed');
  R(material, c, 'tipStart', 0, 1, 0.01, 'tip start');
  R(material, c, 'tipGlow', 0, 6, 0.01, 'tip glow');
  R(material, c, 'stria', 0, 3, 0.01, 'flow lines');
  R(material, c, 'striaScale', 0.5, 24, 0.1, 'flow line scale');
  R(material, c, 'envIntensity', 0, 3, 0.01, 'env reflection');
  R(material, c, 'specular', 0, 8, 0.05, 'sun glint');
  R(material, c, 'glow', 0, 4, 0.01, 'glow');
  R(material, c, 'birthGlow', 0, 6, 0.01, 'birth flash');
  R(material, c, 'birthFade', 0.02, 3, 0.01, 'birth fade');
  material.addColor(c, 'colorGlass').name('body');
  material.addColor(c, 'colorEdge').name('edge & glint');
  material.addColor(c, 'colorPrismA').name('dispersion A');
  material.addColor(c, 'colorPrismB').name('dispersion B');
  material.addColor(c, 'colorCore').name('piped light');
  material.addColor(c, 'colorTip').name('tip');

  const growth = folder.addFolder('Freeze front & shatter');
  R(growth, c, 'frontRough', 0, 1.5, 0.01, 'front raggedness');
  R(growth, c, 'frontWidth', 0.01, 0.8, 0.01, 'front width');
  R(growth, c, 'frontGlow', 0, 8, 0.05, 'front glow');
  R(growth, c, 'shatterScale', 1, 24, 0.1, 'break-up cells');
  R(growth, c, 'shatterEdge', 0.005, 0.4, 0.005, 'break edge width');
  R(growth, c, 'shatterGlow', 0, 8, 0.05, 'break glow');

  const field = folder.addFolder('The sheet on the floor');
  R(field, c, 'fieldBoundary', 0.02, 2, 0.01, 'band thickness');
  R(field, c, 'fieldBoundaryGlow', 0, 8, 0.05, 'band glow');
  R(field, c, 'fieldFill', 0, 2, 0.01, 'interior fill');
  R(field, c, 'fieldFalloff', 0.1, 5, 0.05, 'fill falloff');
  R(field, c, 'fieldPlates', 0, 3, 0.01, 'plate break-up');
  R(field, c, 'fieldPlateScale', 0.2, 10, 0.05, 'plates / metre');
  R(field, c, 'fieldSeam', 0, 3, 0.01, 'seam rime');
  R(field, c, 'fieldFingers', 0, 3, 0.01, 'frost fingers');
  R(field, c, 'fieldFingerScale', 0.1, 8, 0.05, 'fingers / metre');
  R(field, c, 'fieldWarp', 0, 2, 0.01, 'domain warp');
  R(field, c, 'fieldCrawl', -4, 4, 0.01, 'finger crawl');
  R(field, c, 'fieldRings', 0, 12, 0.1, 'pressure rings');
  R(field, c, 'fieldRingSpeed', -6, 6, 0.01, 'ring speed');
  R(field, c, 'fieldSweep', 0, 3, 0.01, 'cold sweep');
  R(field, c, 'fieldSweepSpeed', -2, 2, 0.01, 'sweep speed');
  R(field, c, 'fieldCore', 0, 4, 0.01, 'centre pool');
  R(field, c, 'fieldCoreSize', 0.02, 1, 0.005, 'pool size, × footprint');
  R(field, c, 'fieldPulse', 0, 1, 0.01, 'pulse');
  R(field, c, 'fieldPulseSpeed', 0, 10, 0.05, 'pulse speed');
  R(field, c, 'fieldOpacity', 0, 2, 0.01, 'opacity');
  R(field, c, 'fieldHeight', 0.005, 0.4, 0.005, 'hover height');
  field.addColor(c, 'colorField').name('sheet');
  field.addColor(c, 'colorFieldEdge').name('band & seams');

  const veil = folder.addFolder('The curtain of cold');
  R(veil, c, 'veil', 0, 2, 0.01, 'opacity (0 hides it)');
  R(veil, c, 'veilHeight', 0.1, 8, 0.05, 'height');
  R(veil, c, 'veilRadius', 0.5, 1.6, 0.005, 'seat, × footprint');
  R(veil, c, 'veilFlare', -0.5, 1.5, 0.01, 'outward lean');
  R(veil, c, 'veilBillow', 0, 1.5, 0.01, 'silhouette lobes');
  R(veil, c, 'veilScale', 0.1, 6, 0.05, 'noise / metre');
  R(veil, c, 'veilStretch', 0.05, 3, 0.01, 'vertical stretch');
  R(veil, c, 'veilFlow', -4, 4, 0.01, 'fall speed');
  R(veil, c, 'veilErode', 0, 1, 0.01, 'erosion with height');
  R(veil, c, 'veilFalloff', 0.2, 6, 0.05, 'thinning with height');
  R(veil, c, 'veilSpin', -1, 1, 0.005, 'rotation');
  R(veil, c, 'veilSoftFade', 0.02, 3, 0.01, 'soft intersection');
  veil.addColor(c, 'colorVeil').name('curtain');
  veil.addColor(c, 'colorVeilCrest').name('crest');

  const ground = folder.addFolder('Rime');
  R(ground, c, 'trailFrostRate', 0.05, 10, 0.05, 'trail rime / metre');
  R(ground, c, 'trailFrostRadius', 0.05, 6, 0.05, 'trail rime radius');
  R(ground, c, 'frostSpread', 0.2, 4, 0.05, 'impact rime, × footprint');
  R(ground, c, 'frostLife', 0.5, 20, 0.1, 'rime lifetime');
  R(ground, c, 'frostIntensity', 0, 2, 0.01, 'rime intensity');
  R(ground, c, 'frostCrystals', 0, 4, 0.01, 'snow grain');
  R(ground, c, 'frostCollar', 0, 8, 0.05, 'collar, × shard radius');
  R(ground, c, 'rimeRate', 0, 20, 0.1, 'rim rime / sec');
  R(ground, c, 'rimeRadius', 0.05, 6, 0.05, 'rim rime radius');
  R(ground, c, 'shockRadius', 0.5, 25, 0.1, 'shockwave radius');
  R(ground, c, 'ringRate', 0, 12, 0.1, 'pressure rings / sec');
  ground.addColor(c, 'colorFrost').name('snow');
  ground.addColor(c, 'colorFrostEdge').name('snow shadow');
  ground.addColor(c, 'colorShockA').name('shockwave ring');
  ground.addColor(c, 'colorShockB').name('shockwave crest');

  const air = folder.addFolder('Mist, glitter & snow');
  R(air, c, 'mistRate', 0, 900, 1, 'mist rate');
  R(air, c, 'mistSize', 0.05, 4, 0.01, 'mist size');
  R(air, c, 'mistSpeed', 0, 8, 0.05, 'mist speed');
  R(air, c, 'mistLifetime', 0.2, 8, 0.05, 'mist lifetime');
  R(air, c, 'mistOpacity', 0, 1, 0.005, 'mist opacity');
  R(air, c, 'mistRise', -3, 3, 0.01, 'mist rise (− falls)');
  R(air, c, 'mistTurbulence', 0, 3, 0.01, 'mist swirl');
  R(air, c, 'glitterRate', 0, 900, 1, 'glitter rate');
  R(air, c, 'glitterSize', 0.005, 0.4, 0.005, 'glitter size');
  R(air, c, 'glitterSpeed', 0, 20, 0.1, 'glitter speed');
  R(air, c, 'glitterLifetime', 0.1, 8, 0.05, 'glitter lifetime');
  R(air, c, 'glitterRise', -3, 8, 0.01, 'glitter lift');
  R(air, c, 'glitterTurbulence', 0, 3, 0.01, 'glitter swirl');
  R(air, c, 'glitterGlow', 0, 4, 0.01, 'glitter glow');
  R(air, c, 'snowRate', 0, 600, 1, 'snow rate');
  R(air, c, 'snowSize', 0.005, 0.4, 0.005, 'snow size');
  R(air, c, 'snowSpeed', 0, 10, 0.05, 'initial push');
  R(air, c, 'snowLifetime', 0.2, 10, 0.05, 'snow lifetime');
  R(air, c, 'snowFall', -12, 2, 0.05, 'snow gravity');
  R(air, c, 'snowTurbulence', 0, 3, 0.01, 'snow drift');
  R(air, c, 'snowGlow', 0, 4, 0.01, 'snow glow');
  R(air, c, 'snowInset', 0.05, 1.4, 0.01, 'fall inset, × footprint');
  R(air, c, 'snowHeight', 0.2, 4, 0.05, 'fall height, × wall');
  gradient(air, c, 'colorMist', 'Mist colour');
  gradient(air, c, 'colorGlitter', 'Glitter colour');
  gradient(air, c, 'colorSnow', 'Snow colour');

  const chips = folder.addFolder('Ice chips');
  R(chips, c, 'shardSize', 0.005, 0.5, 0.005, 'chip size');
  R(chips, c, 'shardSpeed', 0, 30, 0.1, 'chip speed');
  R(chips, c, 'shardLifetime', 0.1, 6, 0.05, 'chip lifetime');
  R(chips, c, 'shardGravity', -50, 0, 0.1, 'chip gravity');
  R(chips, c, 'breachShards', 0, 30, 1, 'chips on breach');
  R(chips, c, 'shatterShards', 0, 30, 1, 'chips on break-up');
  gradient(chips, c, 'colorShard', 'Chip colour');

  const impact = folder.addFolder('Bloom & hold');
  R(impact, c, 'burstSize', 0.2, 14, 0.05, 'vapour shell size');
  R(impact, c, 'burstIntensity', 0, 5, 0.01, 'vapour shell intensity');
  R(impact, c, 'burstShards', 0, 600, 1, 'bloom chips');
  R(impact, c, 'burstMist', 0, 400, 1, 'bloom mist');
  R(impact, c, 'burstGlitter', 0, 600, 1, 'bloom glitter');
  R(impact, c, 'vapourRate', 0, 12, 0.05, 'hold shells / sec');
  R(impact, c, 'vapourSize', 0.1, 10, 0.05, 'hold shell size');
  R(impact, c, 'vapourIntensity', 0, 5, 0.01, 'hold shell intensity');
  R(impact, c, 'impactShake', 0, 3, 0.01, 'shake');
  R(impact, c, 'shakeDuration', 0.1, 4, 0.01, 'shake duration');
  R(impact, c, 'holdShake', 0, 0.5, 0.005, 'hold rumble');
  R(impact, c, 'impactFlash', 0, 2, 0.01, 'screen flash');
  R(impact, c, 'rumble', 0, 0.5, 0.005, 'travel rumble');
  impact.addColor(c, 'colorBurstA').name('shell');
  impact.addColor(c, 'colorBurstB').name('shell body');
  impact.addColor(c, 'colorBurstC').name('shell plates');
  impact.addColor(c, 'colorFlash').name('bloom flash colour');

  const light = folder.addFolder('Dynamic light');
  R(light, c, 'lightIntensity', 0, 120, 0.5, 'light intensity');
  R(light, c, 'lightRadius', 0.5, 50, 0.1, 'light radius');
  R(light, c, 'lightHeight', 0, 1, 0.01, 'height up the crown');
  light.addColor(c, 'lightColor').name('light colour');

  editor.glacierFolder = folder;
}
