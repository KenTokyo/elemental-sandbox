/**
 * signatures-conclave.js — the Verdigris Conclave, five of the twenty added in V3.2.
 *
 * The library's one *metal* group. Everything else in the sixty is ice, fire,
 * light, water or void; this one is cast bronze gone green — patina, jade,
 * brass — and it is built out of the machinery of a temple rather than out of an
 * element. That single decision drives every material number below: `body` goes
 * up (metal is not empty glass), `dispersion` comes down (metal barely splits
 * light), `specular` and `envIntensity` go up (it is a polished reflector), and
 * `translucency` is taken almost to zero.
 *
 *   Bell Rose      ← Absolute Zero   (DomeAbility)
 *   Censer Coil    ← Shard Cyclone   (CycloneAbility, crystal branch)
 *   Orrery Gate    ← Boreal Gate     (GateAbility)
 *   Verdigris Seam ← Frost Lance     (IceAbility)
 *   Pendulum Fall  ← Solar Spear     (SpearAbility)
 *
 * Each block derives from the sibling that already runs on its engine, so it
 * inherits exactly the control surface that engine reads and cannot be short a
 * key family — and `pnpm audit:settings` proves that rather than taking it on
 * trust.
 *
 * The rule from `variants.js` still holds and is the whole job: **a signature is
 * a different ability, not a recolour.** Every block moves the silhouette
 * (footprint, height, count, curvature), the timing (travel, hold, release) and
 * the palette away from the sibling it came from, and each doc comment says
 * which read it is going for. Where a value is pinned by an engine ceiling
 * (`MAX_SHARDS`, `MAX_SPIKES`, …) the comment says so, because a number above
 * the cap is silently clamped and would read as a knob that does nothing.
 */

import { derive } from './variants.js';

export function buildConclaveSignatures(settings) {
  const { zero, cyclone, gate, ice, solar } = settings;

  return {
    /* ================================================================== */
    /* VERDIGRIS CONCLAVE                                                  */
    /* ================================================================== */

    /**
     * BELL ROSE — the dome shrunk to a bell and struck once.
     *
     * Absolute Zero is the slowest thing in the library: a wide shell that takes
     * six tenths of a second to close and then holds, barely moving, for six.
     * This is the opposite gesture on the same engine — the *smallest* footprint
     * of any dome (3.6 m against 5.6 and 6.4), a shell that slams shut in two
     * tenths, and a hold of barely three seconds. It is nearly opaque and
     * crystallised to the ceiling (`domePlates` at 1.0, `domeScale` down to 0.9),
     * so it reads as a handful of enormous cast panels rather than as frozen air,
     * and `domeSpeed` is taken almost to zero because metal does not crawl.
     *
     * The foot is the other half of the read: 168 short upright shards seated
     * hard on the boundary with almost no scatter — the fluting around the lip of
     * a bell, which is the one place this shape is allowed to be regular.
     */
    bellrose: derive(zero, {
      range: 17.0,
      minRange: 0.0,
      zoneRadius: 3.6, // the smallest dome in the library
      speed: 48.0,
      snapTime: 0.18,
      lifetime: 3.2,
      fadeTime: 1.3,
      cooldown: 2.2,
      castAnim: 'cast1',

      domeRadius: 1.06,
      domeSquash: 1.15, // slightly taller than wide — a bell, not a lid
      domeRise: 0.22, // it is struck, not closed
      domeScale: 0.9, // few, enormous panels
      domeSpeed: 0.05, // cast metal does not crawl
      domePlates: 1.0, // fully crystallised into flats
      domeRim: 1.6,
      domeOpacity: 0.86, // nearly solid
      domeGlow: 2.2,
      domeShatter: 0.8, // it comes apart in panels
      colorDomeA: '#0d1a12',
      colorDomeB: '#4fa87a',
      colorDomeC: '#ffd9a0',

      rimShards: 168, // MAX_SHARDS is 180 — the fluting has to be continuous
      rimShardScale: 0.7,
      rimSeat: 1.0,
      rimScatter: 0.04, // mechanically even, on purpose
      rimLean: 0.05,

      spikeCount: 120,
      ringShare: 0.8,
      lateShare: 0.05,
      ringHeight: 1.1,
      skirtHeight: 0.6,
      ringWave: 0.2,
      sweepTime: 0.12, // the whole ring goes up on the same beat
      stagger: 0.03,

      radius: 0.34,
      radiusJitter: 0.4,
      taper: 0.88, // parallel-sided rods, like organ pipes
      facets: 5,
      roughness: 0.12,
      colorGlass: '#123024',
      colorEdge: '#ffe8c0',
      colorPrismA: '#7fe0b0',
      colorPrismB: '#ffcf8a',
      colorCore: '#bfe8c8',
      colorTip: '#fff0d0',
      body: 2.4, // it has a body — this is metal
      edgePower: 1.8,
      edgeGain: 1.1,
      dispersion: 0.25, // bronze barely splits light
      pipe: 0.7,
      stria: 1.4, // cast striations running up the flute
      striaScale: 9.0,
      envIntensity: 1.3,
      specular: 4.0,
      glow: 0.9,

      veil: 0.2,
      veilHeight: 1.2,
      veilFlow: 0.1,
      colorVeil: '#8fd0a8',
      colorVeilCrest: '#ffe8c0',

      frostSpread: 1.2,
      frostLife: 8.0,
      frostIntensity: 0.5,
      frostCrystals: 2.6,
      colorFrost: '#c8dcc0',
      colorFrostEdge: '#4a6b52',
      rimeRate: 2.0,
      shockRadius: 6.0,
      ringRate: 1.6, // the bell keeps ringing rings out across the floor

      mistRate: 160,
      mistOpacity: 0.035,
      mistRise: 0.2,
      colorMistA: '#e8f4e0',
      colorMistB: '#a8c8a8',
      colorMistC: '#5a7a5e',
      colorMistD: '#0d1a12',
      snowRate: 0, // nothing falls out of a bell
      glitterRate: 240,
      glitterRise: 1.6,
      colorGlitterA: '#fff0d0',
      colorGlitterB: '#ffcf8a',
      colorGlitterC: '#7fe0b0',
      colorGlitterD: '#1a2a18',
      shardSpeed: 7.5,
      colorShardA: '#ffe8c0',
      colorShardB: '#7fe0b0',
      colorShardC: '#3f8a68',
      colorShardD: '#0d1a12',

      lightIntensity: 18,
      lightRadius: 15,
      lightHeight: 0.4,
      lightColor: '#6fd0a0',

      burstSize: 3.6,
      burstIntensity: 1.6,
      burstShards: 90,
      impactShake: 1.4,
      shakeDuration: 1.1,
      holdShake: 0.02,
      impactFlash: 0.3,
      rumble: 0.03,
      colorShockA: '#4fb890',
      colorShockB: '#ffe8c0',
      colorBurstA: '#4fa87a',
      colorBurstB: '#bfe8c8',
      colorFlash: '#ffe8c0'
    }),

    /**
     * CENSER COIL — the spin slowed until the load hangs instead of climbing.
     *
     * Shard Cyclone is fast glass and Maelstrom is a wide slow body of water;
     * both carry a *crowd*. This one carries **fifty-four blocks** — the fewest
     * of any cyclone by a factor of three — at nearly three times the size, on a
     * tall near-cylindrical column that leans further than anything else in the
     * library. `climb` is taken down to 0.18 so the load does not ride up the
     * cone, and `spinFalloff` goes *above* one, which is the trick: the crest
     * turns faster than the floor, and the whole thing reads as a censer being
     * swung on a chain rather than as weather.
     *
     * It is also the only cyclone with its volume switched on and cold — the
     * dust column is jade smoke at `trailPalette` 1.0, no black-body physics.
     */
    censer: derive(cyclone, {
      range: 17.0,
      minRange: 0.0,
      zoneRadius: 3.0, // the narrowest footprint of the four cyclones
      speed: 46.0,
      snapTime: 0.5,
      lifetime: 6.5, // and the longest hold
      fadeTime: 1.8,
      cooldown: 2.6,
      castAnim: 'cast3',

      funnelHeight: 9.0,
      funnelBase: 0.5,
      funnelTop: 0.55, // base and top nearly equal: a chimney, not a cone
      funnelCurve: 0.8,
      funnelLean: 0.34, // the heaviest lean in the library — it swings

      spin: 0.55, // the slowest turn
      spinFalloff: 1.35, // >1: the crest outruns the floor, as a chain would
      spinJitter: 0.1,
      climb: 0.18, // the load hangs at height rather than riding up
      climbJitter: 0.25,

      shardCount: 54, // by far the fewest — you can count them
      shardScale: 1.7, // ... and by far the largest
      shardScaleJitter: 0.35,
      tumble: 0.9,
      wobble: 0.5,
      wobbleScale: 0.6,

      strands: 12,
      strandWidth: 0.11,
      strandTurns: 3.2, // the chain wound round the column
      strandSpeed: 0.35,
      strandJitter: 0.12,
      strandDim: 0.9,
      strandGlow: 1.2,
      colorStrandCore: '#fff2d8',
      colorStrandEdge: '#c8a24a',
      colorStrandHalo: '#2a3f2a',

      ringHeight: 1.2,
      skirtHeight: 0.8,
      radius: 0.5,
      radiusJitter: 0.5,
      taper: 0.55,
      facets: 5,
      heightJitter: 0.4,

      colorGlass: '#0a2a1e',
      colorEdge: '#ffe4b0',
      colorPrismA: '#3fd8a0',
      colorPrismB: '#c8a24a',
      colorCore: '#8fe0b8',
      colorTip: '#fff2d8',
      body: 2.6,
      edgeGain: 0.9,
      dispersion: 0.4,
      glow: 0.8,

      fieldBoundary: 0.4,
      fieldBoundaryGlow: 2.0,
      fieldFill: 0.34,
      fieldFalloff: 1.6,
      fieldVeins: 1.8,
      fieldVeinScale: 1.6,
      fieldRings: 1.6,
      fieldRingSpeed: 0.5,
      fieldSpokes: 8,
      fieldSpin: 0.12,
      fieldCore: 1.2,
      fieldCoreSize: 0.3,
      colorField: '#4fbf88',
      colorFieldEdge: '#ffe4b0',

      funnelVolume: 0.55, // the smoke a censer is for
      trailOpacity: 0.85,
      trailPalette: 1.0, // no black-body ramp — this is lit smoke
      trailTempCore: 0.3,
      trailTempEdge: 0.12,
      trailDensity: 1.7,
      trailSoot: 2.6,
      trailBuoyancy: 2.2,
      trailSpeed: 1.2,
      trailTurbulence: 2.0,
      trailPlume: 2.2,
      colorHot: '#e8fff0',
      colorFlameMid: '#6fbf8c',
      colorFlameEdge: '#2e6b4a',
      colorFlameSmoke: '#0d1c14',

      dustRate: 300,
      dustSize: 1.4,
      dustOpacity: 0.09,
      dustRise: 0.8,
      dustTurbulence: 0.7,
      colorDustA: '#c8e0c0',
      colorDustB: '#7fa885',
      colorDustC: '#456b4e',
      colorDustD: '#101c14',

      moteRate: 180,
      moteSize: 0.085,
      moteSpeed: 1.6,
      moteRise: 1.2,
      moteGlow: 1.1,
      colorMoteA: '#fff2d8',
      colorMoteB: '#ffcf8a',
      colorMoteC: '#7fbf90',
      colorMoteD: '#12200f',

      gritRate: 40,
      gritSpeed: 3.5,
      gritGravity: -7.0,
      colorGritA: '#c8a24a',
      colorGritB: '#7f8a52',
      colorGritC: '#3a4a32',
      colorGritD: '#101c14',

      mistRate: 200,
      mistRise: 0.35,
      glitterRate: 150,
      glitterRise: 1.2,

      lightIntensity: 12,
      lightRadius: 16,
      lightHeight: 0.6,
      lightColor: '#5fc898',

      shockRadius: 4.5,
      burstSize: 2.6,
      burstIntensity: 0.8,
      impactShake: 0.5,
      holdShake: 0.03,
      shakeDuration: 0.9,
      impactFlash: 0.1,
      rumble: 0.02,
      colorBurstA: '#4fbf88',
      colorBurstB: '#bfe0c0',
      colorBurstC: '#fff2d8',
      colorFlash: '#c8e8c8'
    }),

    /**
     * ORRERY GATE — the doorway rebuilt as an instrument.
     *
     * The Boreal Gate is a portal you look *through* and the Solar Aperture is a
     * lens; both have a membrane doing the work. This one is a **brass hoop
     * hanging in the air** with the membrane taken almost off (opacity 0.22,
     * swirl 0.05) and replaced by nine concentric rings — orbital tracks, not a
     * vortex. It is the only ring in the library that is deliberately *regular*:
     * `ringShardJitter` and `ringShardFan` are near zero and the shards are
     * parallel-sided rods laid flat in the plane of the hoop, so the frame reads
     * as machined rather than grown.
     *
     * It is also raked the wrong way — `gateTilt` is negative, so it leans toward
     * the caster — and it throws only five rays, but at 18 metres and almost
     * without spread: sight lines, not a spray.
     */
    orrery: derive(gate, {
      range: 21.0,
      minRange: 2.0,
      zoneRadius: 3.0,
      speed: 42.0,
      snapTime: 0.6,
      lifetime: 7.0, // the longest-standing gate
      fadeTime: 1.6,
      cooldown: 2.8,
      castAnim: 'cast3',

      gateRadius: 0.95,
      gateLift: 2.6, // it hangs well clear of the floor
      gateTilt: -0.22, // negative: it leans toward you
      gateOpen: 1.6, // a slow mechanical dilation

      ringShards: 140, // MAX_SHARDS — the hoop has to be continuous
      ringShardScale: 1.15,
      ringShardLean: 0.02, // flat in the plane of the hoop
      ringShardFan: 0.06,
      ringShardJitter: 0.05, // the one perfectly regular ring in the library

      membraneScale: 1.1,
      membraneSwirl: 0.05, // no vortex: concentric tracks
      membraneSpeed: 0.08,
      membraneRings: 9.0,
      membraneRingSpeed: 0.16,
      membraneDepth: 0.3,
      membraneOpacity: 0.22, // you read straight through it
      membraneGlow: 1.8,
      colorMembraneA: '#08150f',
      colorMembraneB: '#3fb890',
      colorMembraneC: '#ffe0a8',

      rays: 5, // few, long and nearly parallel — sight lines
      rayLength: 18.0,
      rayWidth: 0.06,
      raySpeed: 0.12,
      raySpread: 0.06,
      rayDim: 0.95,
      rayGlow: 2.2,
      colorRayCore: '#fff4dc',
      colorRayEdge: '#ffc46a',
      colorRayHalo: '#2a5c46',

      radius: 0.28,
      radiusJitter: 0.25,
      taper: 0.85, // parallel-sided spokes
      facets: 4,
      roughness: 0.0,
      bend: 0.0,
      colorGlass: '#123326',
      colorEdge: '#ffe8c0',
      colorPrismA: '#5fd8a8',
      colorPrismB: '#e0b45a',
      colorCore: '#bff0d4',
      colorTip: '#fffaf0',
      body: 2.2,
      dispersion: 0.3,
      specular: 3.6,
      envIntensity: 1.2,
      glow: 1.0,

      fieldBoundary: 0.26,
      fieldBoundaryGlow: 2.2,
      fieldFill: 0.16,
      fieldRings: 5.0, // the tracks, drawn on the floor as well
      fieldRingSpeed: 0.22,
      fieldSpokes: 12,
      fieldSpokeLength: 0.9,
      fieldSpin: -0.06,
      fieldCore: 0.9,
      colorField: '#4fbf90',
      colorFieldEdge: '#ffe8c0',

      mistRate: 120,
      mistRise: 0.15,
      glitterRate: 260,
      glitterRise: 1.4,
      colorGlitterA: '#fffaf0',
      colorGlitterB: '#ffc46a',
      colorGlitterC: '#5fd8a8',
      colorGlitterD: '#12261c',
      snowRate: 0,

      lightIntensity: 15,
      lightRadius: 20,
      lightHeight: 0.7,
      lightColor: '#7fd8b0',

      shockRadius: 4.0,
      burstSize: 2.4,
      burstIntensity: 1.0,
      impactShake: 0.4,
      holdShake: 0.015,
      shakeDuration: 1.2,
      impactFlash: 0.14,
      rumble: 0.02,
      colorShockA: '#4fbf90',
      colorShockB: '#ffe8c0',
      colorBurstA: '#3fb890',
      colorBurstB: '#bff0d4',
      colorFlash: '#d8f0d8'
    }),

    /**
     * VERDIGRIS SEAM — corrosion, at the speed corrosion actually works.
     *
     * Every other line cast on this engine is thrown: the Frost Lance at 26 m/s,
     * Brine Lance at 46, Obsidian Thorns at 15. This one **creeps** at 8, which
     * makes it the slowest cast in the library, and it spends the whole of a nine
     * second lifetime — also the longest — standing there going green. The band
     * barely widens along its run (1.2 → 1.8 m), so it reads as a *seam* rather
     * than a cone, and the height never clears a knee.
     *
     * The crystals are pushed all the way to `MAX_SPIKES`: 288 blunt, rough,
     * heavily leaned plates at three quarters rubble, which is the only way a
     * field this low reads as a crust rather than as gravel. The material is the
     * inverse of the Lance's — near-zero translucency, high depth tint, fine
     * fracture — because oxide is opaque and cracks fine.
     */
    verdigris: derive(ice, {
      range: 16.0,
      minRange: 2.0,
      speed: 8.0, // the slowest cast in the library
      lifetime: 9.0, // ... and the longest-standing line cast
      cooldown: 1.6,
      castAnim: 'cast1',

      widthNear: 1.2,
      width: 1.8, // barely opens: a seam, not a cone
      widthCurve: 1.0,
      spikeCount: 288, // MAX_SPIKES — a crust has to be continuous
      clumping: 0.7,
      scatter: 1.0,
      frontBias: 1.05,

      heightNear: 0.28,
      height: 0.9, // the lowest field in the library
      heightCurve: 0.8,
      heightJitter: 0.9,
      crown: 0.85,
      peak: 1.05,
      peakWidth: 0.5,
      rubble: 0.75,
      rubbleScale: 0.5,

      radius: 0.3,
      radiusJitter: 0.7,
      taper: 0.85, // blunt plates
      facets: 5,
      roughness: 0.42,
      bend: 0.1,
      lean: 0.55,
      leanJitter: 1.8,
      twist: 1.0,

      riseTime: 0.9, // it grows, it does not erupt
      riseOvershoot: 0.0,
      riseStagger: 0.9,
      settle: 1.4,
      shatterDelay: 2.4,
      sinkTime: 2.6,

      colorDeep: '#0d2a22',
      colorIce: '#3f9c78',
      colorRim: '#ffd9a0',
      colorCore: '#2a6b52',
      opacity: 0.98,
      depthTint: 1.8,
      fresnel: 1.4,
      fresnelPower: 3.2,
      translucency: 0.25, // oxide does not transmit
      envIntensity: 1.4,
      facetSharp: 0.9,
      fracture: 0.9,
      fractureScale: 12.0, // fine craquelure, not big planes
      veins: 0.85,
      veinScale: 7.0,
      glint: 1.6,
      glintScale: 52.0,
      glintSpeed: 0.25,
      frostLine: 1.0,
      glow: 0.45,
      edgeGlow: 1.4,
      birthGlow: 0.7,
      birthFade: 0.9,

      frostSpread: 2.0,
      frostRate: 8.0,
      frostLife: 14.0,
      frostIntensity: 0.7,
      frostCrystals: 2.4,
      colorFrost: '#a8c4a0',
      colorFrostEdge: '#3a5a44',
      shockRadius: 4.0,
      colorShockA: '#4fbf90',
      colorShockB: '#ffe4b0',

      mistRate: 180,
      mistSize: 1.3,
      mistSpeed: 0.7,
      mistLifetime: 4.0,
      mistOpacity: 0.035,
      mistRise: 0.15,
      colorMistA: '#dcecd4',
      colorMistB: '#a8c4a0',
      colorMistC: '#5a7a60',
      colorMistD: '#0d1a14',
      shardRate: 60,
      shardSize: 0.06,
      shardSpeed: 3.0,
      shardGravity: -9.0,
      colorShardA: '#ffd9a0',
      colorShardB: '#7fbf98',
      colorShardC: '#3a6b52',
      colorShardD: '#0d1a14',
      sparkleRate: 200,
      sparkleSize: 0.045,
      sparkleSpeed: 1.4,
      sparkleRise: 0.5,
      sparkleTurbulence: 0.35,
      colorSparkleA: '#ffe8c0',
      colorSparkleB: '#c8a24a',
      colorSparkleC: '#5fbf90',
      colorSparkleD: '#0e1a12',

      lightIntensity: 6,
      lightRadius: 12,
      lightColor: '#5fbf94',

      burstSize: 2.4,
      burstIntensity: 0.4,
      burstShards: 40,
      impactShake: 0.3,
      impactFlash: 0.05,
      shakeDuration: 1.6,
      rumble: 0.02,
      colorBurstA: '#3f9c78',
      colorBurstB: '#a8d8b8',
      colorBurstC: '#ffe4b0',
      colorFlash: '#c8e0c0'
    }),

    /**
     * PENDULUM FALL — the spear rebuilt as a plumb line.
     *
     * The Solar Spear drops a needle from twenty-six metres at 190 m/s and the
     * Sunforge Anvil drops a billet from twelve at 62. This one is thrown from
     * **thirty-four** and falls at **34**: the slowest descent on the engine by a
     * factor of two, with the longest wind-up in the library (1.15 s) in front of
     * it, so the whole cast is a swing and a drop.
     *
     * The shaft is the inversion of the Spear's: broad where it leaves the sky
     * and pinched to a *point* where it touches (`radiusCurve` 2.4), with an
     * enormous flare crammed into the last few per cent of the span — a plumb bob
     * on a thread. `spearTilt` is the steepest rake on the engine, because a
     * pendulum arrives off-plumb; the footprint is small because a plumb line
     * marks a point, not an area.
     */
    pendulum: derive(solar, {
      range: 22.0,
      minRange: 0.0,
      zoneRadius: 2.2, // it marks a point, not an area
      charge: 1.15, // the longest wind-up in the library — it swings first
      speed: 34.0, // ... and then the slowest fall
      lifetime: 0.9,
      fadeTime: 1.4,
      cooldown: 3.0,
      castAnim: 'cast3',

      spearHeight: 34.0, // the highest drop on the engine
      spearTilt: 0.42, // ... and the steepest rake

      radiusNear: 0.55, // broad where it leaves the sky
      radius: 0.14, // a point where it touches
      radiusCurve: 2.4, // stays broad, then pinches late
      flare: 5.5, // the bob
      flareWidth: 0.045,
      endHeight: 0.08,

      coreWidth: 0.2,
      coreSharp: 2.2,
      coreFill: 0.8,
      shellWidth: 0.9,
      shellRim: 1.6,
      shellFill: 0.12,
      haloWidth: 2.4,
      haloOpacity: 0.16,
      opacity: 0.5,
      throb: 0.0,

      coils: 1, // one thread wound round it, turning slowly
      coilTurns: 0.15,
      coilSpeed: 0.9,
      coilRadius: 3.4,
      coilWidth: 0.06,
      coilGlow: 4.0,
      colorCoil: '#ffe8c0',
      colorCoilEdge: '#3f9c78',

      rings: 4, // few, wide and slow
      ringSpeed: 0.35,
      ringInner: 4.5,
      ringOuter: 5.2,
      ringSwell: 1.6,
      ringGlow: 2.4,
      colorRing: '#ffd9a0',

      orbSize: 1.5, // the bob itself, held over the target while it swings
      orbThrob: 0.05,
      orbThrobSpeed: 1.2,
      orbTurbulence: 0.12,
      orbBands: 2.0,
      orbGlow: 2.6,

      colorCore: '#fff2d8',
      colorInner: '#c8e8c0',
      colorOuter: '#3f9c78',
      colorHalo: '#0d2a1c',
      glow: 0.9,

      scorchRadius: 0.5,
      scorchLife: 10.0,
      scorchIntensity: 0.7,
      colorScorch: '#0a1410',
      colorEmber: '#4fb890',
      shockRadius: 5.5,
      colorShockA: '#4fb890',
      colorShockB: '#fff2d8',

      fieldBoundary: 0.6,
      fieldBoundaryGlow: 2.0,
      fieldFill: 0.18,
      fieldRings: 1.2,
      fieldSpokes: 8,
      fieldSpokeLength: 1.1,
      fieldSpin: 0.01,
      fieldCore: 2.4,
      fieldCoreSize: 0.24,
      colorField: '#4fb890',
      colorFieldEdge: '#ffe4b0',

      colorSparkA: '#fff2d8',
      colorSparkB: '#ffd9a0',
      colorSparkC: '#4fb890',
      colorSparkD: '#0e2418',
      colorMoteA: '#ffe8c0',
      colorMoteB: '#7fd0a8',
      colorMoteC: '#3f9c78',
      colorMoteD: '#0a1c14',
      moteRate: 90,
      intakeRate: 320, // the swing pulls the air in around it
      intakeRadius: 3.4,
      smokeRate: 70,
      colorSmokeA: '#4a5a4c',
      colorSmokeB: '#33403a',

      lightIntensity: 26,
      lightRadius: 18,
      lightColor: '#7fd0a8',
      lightPulse: 0.06,
      lightPulseSpeed: 1.1,

      chargeShake: 0.12, // you feel it swinging before it drops
      castFlash: 0.12,
      muzzleSize: 0.9,
      burstSize: 3.0,
      burstIntensity: 2.2,
      impactShake: 1.8,
      shakeDuration: 1.2,
      burnShake: 0.02,
      impactFlash: 0.3,
      colorBurstA: '#3f9c78',
      colorBurstB: '#c8e8c0',
      colorBurstC: '#fff2d8',
      colorFlash: '#ffe4b0',
      colorCastFlash: '#c8e8c0'
    }),
  };
}
