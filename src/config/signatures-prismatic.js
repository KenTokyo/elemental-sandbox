/**
 * signatures-prismatic.js — the Prismatic Assembly, five of the twenty added in V3.2.
 *
 * The group with no hue of its own. Every other group in the library is a
 * colour before it is a shape — amber, rime, void, patina, ash, violet. This
 * one is *white*, and its colour only exists where the light comes apart:
 * dispersion splits, coil edges, spark gradients. The rule that holds it
 * together is that the core of every one of these five is `#ffffff` and the
 * character lives entirely in what happens at the rim.
 *
 *   Prism Cascade   ← Glacial Crown   (GlacierAbility)
 *   Refraction Fan  ← Spectral Blades (BladesAbility)
 *   Lumen Spire     ← Nova Beam       (BeamAbility)
 *   Halation Bloom  ← Plasma Bloom    (BloomAbility)
 *   Caustic Rain    ← Celestial Rain  (RainAbility)
 *
 * These are also the fastest five in the library. Three of them are over inside
 * a second and a half, which is deliberate: an effect made of white light has to
 * resolve before the eye starts reading it as a flat highlight.
 *
 * Same two rules as everywhere else: derive from the sibling that already runs
 * on the engine, so no key family can be missing, and move the silhouette, the
 * timing *and* the palette — a signature is a different ability, not a recolour.
 * Where a value sits on an engine ceiling the comment says so.
 */

import { derive } from './variants.js';

export function buildPrismaticSignatures(settings) {
  const { glacier, blades, beam, plasma, rain } = settings;

  return {
    /* ================================================================== */
    /* PRISMATIC ASSEMBLY                                                  */
    /* ================================================================== */

    /**
     * PRISM CASCADE — the crown drawn as needles instead of blades.
     *
     * Every other signature on this engine is built out of *wedges*: the Glacial
     * Crown's blunt blades, Quartz Bastion's forty-six monoliths, Abyssal Vault's
     * flattened lid. This one runs the crystal generator at the opposite end of
     * its range — `radius` 0.14 with `taper` 0.06, which is a true needle — and
     * spends three hundred of them, near the 320 ceiling, standing almost
     * vertical in a wide scattered band.
     *
     * The timing is the other half. A quarter of the field is held back
     * (`lateShare` 0.24) and scattered over most of the hold, so the ring does
     * not bloom once and stand: it keeps arriving. And it leaves fast —
     * `shatterDelay` 0.2 against the Crown's 0.5, `sinkTime` 0.8 against 1.15.
     *
     * The material is pushed to the point where there is no body left at all:
     * `body` 0.35, `dispersion` at 1.6 with the two prism stops set a full half
     * turn apart in hue, so the split fringe is magenta against green rather than
     * the usual cyan against blue.
     */
    prism: derive(glacier, {
      range: 20.0,
      minRange: 0.0,
      zoneRadius: 5.0,
      speed: 58.0,
      snapTime: 0.16,
      lifetime: 3.4,
      shatterDelay: 0.2,
      shatterStagger: 0.8,
      sinkTime: 0.8,
      cooldown: 1.8,
      castAnim: 'cast2',
      // No `fadeTime` here: the Crown's block does not own one. A glacier
      // resolves through `shatterDelay` → `shatterStagger` → `sinkTime`, and a
      // key the base does not have would be a slider no engine reads.

      spikeCount: 300, // MAX_SPIKES is 320 — a cascade has to be dense
      ringShare: 0.72,
      coreShare: 0.0, // the middle stays open, as on the Crown
      lateShare: 0.24, // a quarter of it keeps arriving during the hold
      ringSeat: 0.88,
      ringScatter: 0.34,
      skirtSeat: 0.4,
      skirtBand: 0.7,
      skirtBias: 1.4,

      ringHeight: 3.4,
      ringWave: 0.9,
      skirtHeight: 2.2,
      heightJitter: 1.0,
      ringLean: 0.06, // near vertical: a colonnade, not a crown
      skirtLean: 0.14,
      leanJitter: 0.9,
      fan: 0.28,
      twist: 1.0,
      rubble: 0.18,
      rubbleScale: 0.22,

      radius: 0.14, // the thinnest crystal in the library
      radiusJitter: 0.6,
      taper: 0.06, // ... and the only true needle
      facets: 8,
      roughness: 0.0,
      bend: 0.0,

      riseTime: 0.12,
      riseOvershoot: 0.55,
      settle: 0.35,
      sweepTime: 0.2,
      skirtDelay: 0.03,
      skirtWave: 0.5,
      stagger: 0.05,
      bloomSpread: 0.85,

      colorGlass: '#0a1420', // very nearly nothing
      colorEdge: '#ffffff',
      colorPrismA: '#ff5fd0', // the two ends of the split, half a turn apart
      colorPrismB: '#5fffc8',
      colorCore: '#eaf6ff',
      colorTip: '#ffffff',
      body: 0.35, // pure edges
      edgePower: 0.85,
      edgeGain: 1.5,
      dispersion: 1.6,
      pipe: 1.6,
      tipBias: 2.4,
      bands: 3.2,
      pulseSpeed: 2.2,
      tipStart: 0.35,
      tipGlow: 2.6,
      stria: 1.4,
      striaScale: 12.0,
      envIntensity: 1.5,
      specular: 4.5,
      glow: 1.3,
      opacity: 0.6,

      frontRough: 0.15,
      frontWidth: 0.06,
      frontGlow: 4.0,
      shatterScale: 12.0,
      shatterEdge: 0.04,
      shatterGlow: 4.5,

      fieldBoundary: 0.18,
      fieldBoundaryGlow: 3.4,
      fieldFill: 0.14,
      fieldFalloff: 2.2,
      fieldPlates: 0.3,
      fieldPlateScale: 4.0,
      fieldSeam: 0.25,
      fieldFingers: 1.6,
      fieldFingerScale: 3.0,
      fieldCrawl: 0.4,
      fieldRings: 5.0,
      fieldRingSpeed: 1.8,
      fieldSweep: 0.7,
      fieldSweepSpeed: 0.4,
      fieldCore: 0.3,
      colorField: '#bfe4ff',
      colorFieldEdge: '#ffffff',

      veil: 0.25,
      veilHeight: 3.4,
      veilRadius: 1.06,
      veilFlare: 0.1,
      veilFlow: 1.2,
      veilErode: 0.7,
      colorVeil: '#dcd0ff',
      colorVeilCrest: '#ffffff',

      frostSpread: 1.2,
      frostLife: 5.0,
      frostIntensity: 0.35,
      rimeRate: 1.5,
      colorFrost: '#eef6ff',
      colorFrostEdge: '#8fa8c8',
      shockRadius: 6.5,
      ringRate: 1.4,
      colorShockA: '#9fd8ff',
      colorShockB: '#ffffff',

      mistRate: 140,
      mistOpacity: 0.03,
      mistRise: 0.5,
      shardSize: 0.05,
      shardSpeed: 9.0,
      breachShards: 5,
      shatterShards: 8,
      colorShardA: '#ffffff',
      colorShardB: '#ffbff0',
      colorShardC: '#9fffe0',
      colorShardD: '#0a1420',
      glitterRate: 420, // the brightest sparkle in the library
      glitterSize: 0.04,
      glitterRise: 3.0,
      glitterTurbulence: 1.1,
      glitterGlow: 1.8,
      colorGlitterA: '#ffffff',
      colorGlitterB: '#ff9fe0',
      colorGlitterC: '#9fffe0',
      colorGlitterD: '#0a1420',
      snowRate: 0,

      lightIntensity: 18,
      lightRadius: 16,
      lightHeight: 0.55,
      lightColor: '#cfe8ff',

      burstSize: 3.2,
      burstIntensity: 1.5,
      burstShards: 200,
      burstGlitter: 260,
      burstMist: 40,
      vapourRate: 0.8,
      impactShake: 0.6,
      shakeDuration: 0.6,
      holdShake: 0.02,
      impactFlash: 0.28,
      rumble: 0.03,
      colorBurstA: '#bfe4ff',
      colorBurstB: '#ffd8f4',
      colorBurstC: '#ffffff',
      colorFlash: '#ffffff'
    }),

    /**
     * REFRACTION FAN — the same stroke, cut fourteen times.
     *
     * Spectral Blades rolls seven crescents to seven different angles so they
     * read as a flurry; Ember Reap cuts three enormous ones so you count them.
     * This runs the engine at its ceiling — fourteen slashes, `MAX_SLASHES` — and
     * then throws away the variation: `slashTilt` 0.12, `slashPitch` 0.05,
     * `slashRadiusJitter` 0.05. Every stroke lands on nearly the same plane, on
     * the fastest beat in the library (45 ms), so the fourteen stack into one
     * fanned edge rather than into a flurry.
     *
     * It is also the only cast in the library with `jitter` at zero. A blade
     * drawn by this engine normally carries a little noise; a refracted edge must
     * not, because the read is that it is *clean*. The echo does the colour work
     * instead — nearly full strength, offset wide, so each stroke drags its own
     * fringe.
     */
    refraction: derive(blades, {
      range: 19.0,
      minRange: 2.0,
      speed: 62.0,
      lifetime: 1.1,
      fadeTime: 0.7,
      cooldown: 1.3,
      castAnim: 'cast1',

      slashes: 14, // MAX_SLASHES
      slashInterval: 0.045, // the fastest beat in the library
      slashLife: 0.3,
      slashSpan: 1.6,
      slashRadius: 1.9,
      slashRadiusJitter: 0.05,
      slashTilt: 0.12, // almost no roll: they stack into one plane
      slashPitch: 0.05,
      slashHeight: 1.5,
      slashHeightJitter: 0.12,
      slashSweep: 3.4,
      slashWidth: 0.05,
      slashTaper: 0.02,
      slashCurve: 2.2,
      slashLead: 0.9,

      echo: 0.95, // the fringe each edge drags behind it
      echoDelay: 0.045,
      echoSpread: 0.9,

      width: 0.028,
      coreSharp: 5.0,
      glowWidth: 3.4,
      glowFalloff: 3.0,
      glowOpacity: 0.7,
      jitter: 0.0, // the only zero in the library: a refracted edge is clean
      jitterScale: 0.6,
      octaves: 1,
      crawl: 0.0,
      flicker: 0.0,
      flickerSpeed: 8,
      strandFlash: 0.0,

      colorCore: '#ffffff',
      colorInner: '#ffd0f4',
      colorOuter: '#7fd0ff',
      colorHalo: '#3a0f6b',
      glow: 3.4,
      opacity: 1.0,

      trailRate: 2.4,
      arcRadius: 0.6,
      arcLife: 0.25,
      arcIntensity: 0.5,
      colorArc: '#cfe0ff',
      colorEmber: '#9fd8ff',
      scorchRadius: 0.2,
      scorchLife: 3.0,
      scorchIntensity: 0.18,
      colorScorch: '#0a0a14',
      shockRadius: 3.0,
      colorShockA: '#9fd8ff',
      colorShockB: '#ffffff',

      sparkRate: 380,
      sparkSize: 0.09,
      sparkSpeed: 13.0,
      sparkLifetime: 0.3,
      sparkGravity: -8.0,
      sparkStretch: 0.4,
      colorSparkA: '#ffffff',
      colorSparkB: '#bfffe8',
      colorSparkC: '#ff8fe0',
      colorSparkD: '#20124a',

      lightIntensity: 20,
      lightRadius: 11,
      lightHeight: 0.55,
      lightColor: '#cfe0ff',
      lightFlicker: 0.35,
      lightFlickerSpeed: 48,

      muzzleSize: 0.3,
      muzzleIntensity: 1.6,
      castFlash: 0.14,
      colorCastFlash: '#e4d8ff',
      burstSize: 1.8,
      burstIntensity: 1.4,
      burstSparks: 240,
      impactShake: 0.35,
      shakeDuration: 0.3,
      impactFlash: 0.2,
      colorBurstA: '#7fd0ff',
      colorBurstB: '#ffd0f4',
      colorBurstC: '#ffffff',
      colorFlash: '#e4d8ff'
    }),

    /**
     * LUMEN SPIRE — the beam with the hold taken out of it.
     *
     * Four signatures already run on this engine and every one of them is about
     * *duration*: the Nova Beam burns for a second, Choral Ray for three, Eclipse
     * Column for four and a half, Void Rail is at least a hard half-second
     * stroke. This one lives for **0.28 s** — the shortest cast in the library —
     * over fourteen metres, at 260 m/s. It is a flashbulb.
     *
     * Because there is no time to read a silhouette, everything else is inverted
     * to compensate. `radiusCurve` is exactly 1.0, which makes it the only true
     * parallel cylinder on the engine; the core is opaque and fat (`coreFill`
     * 1.0, `coreWidth` 0.5) where the Nova Beam's is deliberately thin; and the
     * coil cage runs at `MAX_COILS` with four turns at nearly four revolutions a
     * second, so the one thing that *is* readable at this exposure is the cage
     * spinning. The disc train runs at the ceiling too, six trips a second.
     */
    lumen: derive(beam, {
      range: 14.0,
      minRange: 2.0,
      charge: 0.34,
      speed: 260.0,
      lifetime: 0.28, // the shortest cast in the library
      fadeTime: 0.9,
      cooldown: 1.5,
      castAnim: 'cast2',
      endHeight: 1.4,

      radiusNear: 0.4,
      radius: 0.34,
      radiusCurve: 1.0, // a true parallel cylinder — the only one on the engine
      flare: 0.2,
      flareWidth: 0.3,
      throb: 0.0,
      wander: 0.0,

      coreWidth: 0.5, // fat and opaque: there is no time for a glassy read
      coreSharp: 0.9,
      coreFill: 1.0,
      shellWidth: 1.1,
      shellRim: 0.8,
      shellFill: 0.5,
      shellOpacity: 1.0,
      haloWidth: 5.5,
      haloRim: 2.0,
      haloOpacity: 0.35,
      edgePower: 1.4,
      opacity: 0.7,
      glow: 1.9,

      ripple: 0.0,
      streak: 0.2,
      streakGlow: 0.3,
      flowSpeed: 22.0,
      mouthGlow: 3.0,
      mouthLength: 0.06,
      tipGlow: 2.2,
      tipLength: 0.05,

      coils: 8, // MAX_COILS — the cage is the only readable motion
      coilTurns: 4.2,
      coilSpeed: -3.4,
      coilRadius: 3.6,
      coilFlare: 0.0,
      coilWidth: 0.045,
      coilWidthTip: 1.0,
      coilSharp: 3.2,
      coilPulse: 0.9,
      coilPulseFreq: 6.0,
      coilPulseSpeed: 5.0,
      coilGlow: 9.0,
      coilOpacity: 2.2,
      colorCoil: '#ffffff',
      colorCoilEdge: '#7fd0ff',

      rings: 12, // MAX_RINGS
      ringSpeed: 6.0, // ... at the fastest the engine has ever been asked for
      ringInner: 4.0,
      ringOuter: 4.3,
      ringSwell: 0.1,
      ringFade: 0.9,
      ringSharp: 3.0,
      ringGlow: 4.0,
      colorRing: '#ffd0f4',

      orbSize: 0.24,
      orbThrob: 0.4,
      orbThrobSpeed: 14.0,
      orbBands: 9.0,
      orbGlow: 4.0,

      colorCore: '#ffffff',
      colorInner: '#ffffff',
      colorOuter: '#dfe8ff',
      colorHalo: '#7f3fff',

      scorchRate: 0.4,
      scorchRadius: 0.3,
      scorchLife: 4.0,
      scorchIntensity: 0.2,
      colorScorch: '#0a0c16',
      colorEmber: '#bfd8ff',
      dustRate: 12.0,
      dustRadius: 1.8,
      colorDustA: '#3a4a6a',
      colorDustB: '#e0ecff',
      shockRate: 6.0,
      shockRadius: 6.0,
      colorShockA: '#dfe8ff',
      colorShockB: '#ffffff',

      sparkRate: 420,
      sparkSize: 0.11,
      sparkSpeed: 15.0,
      sparkLifetime: 0.25,
      sparkForward: 1.2,
      colorSparkA: '#ffffff',
      colorSparkB: '#ffd0f4',
      colorSparkC: '#9fffe0',
      colorSparkD: '#241a5c',
      moteRate: 60,
      colorMoteA: '#ffffff',
      colorMoteB: '#dfe8ff',
      colorMoteC: '#9f8fff',
      colorMoteD: '#120c30',
      intakeRate: 340,
      intakeSpeed: 11.0,
      smokeRate: 30,
      smokeOpacity: 0.04,

      lightIntensity: 60, // the brightest light in the library
      lightRadius: 22,
      lightColor: '#ffffff',
      lightPulse: 0.0,
      muzzleLightIntensity: 34,

      chargeShake: 0.05,
      castFlash: 0.5,
      muzzleSize: 1.8,
      muzzleIntensity: 2.6,
      colorCastFlash: '#ffffff',
      burstSize: 5.4,
      burstIntensity: 2.6,
      burstSparks: 300,
      burstDebris: 40,
      pulseRate: 0.0,
      splashRate: 320,
      impactShake: 0.6,
      shakeDuration: 0.35,
      burnShake: 0.0,
      impactFlash: 0.55,
      rumble: 0.0,
      colorBurstA: '#dfe8ff',
      colorBurstB: '#ffffff',
      colorBurstC: '#ffffff',
      colorFlash: '#ffffff'
    }),

    /**
     * HALATION BLOOM — the flower opened flat, all at once.
     *
     * Plasma Bloom stages its six petals 70 ms apart and lifts them two and a
     * half metres; Nightshade Bloom opens four slowly and lets them droop back to
     * the floor. This one sets `petalStagger` to **zero** — the only simultaneous
     * bloom in the library — opens in 0.12 s, throws the arms nearly seven metres
     * *outward* rather than upward (`petalLift` 0.5, `petalDroop` 0.02) and rings
     * them with twenty strands at `MAX_STRANDS`, tilted almost coplanar so they
     * read as a halo rather than as a cage.
     *
     * The volume is run at 3400 K — the hottest in the library — with the soot
     * taken almost off, because halation is the *absence* of absorption: light
     * bleeding past the edge of the thing that emitted it.
     *
     * Note `plasma` inherits from the Cinder Fall and therefore has no
     * `colorBurst*` family; its shells tint straight off the flame palette, so
     * there is nothing to override here and adding one would be a dead key.
     */
    halation: derive(plasma, {
      range: 18.0,
      minRange: 0.0,
      zoneRadius: 6.0,
      speed: 70.0,
      snapTime: 0.1,
      lifetime: 2.2,
      fadeTime: 1.4,
      cooldown: 2.2,
      castAnim: 'cast1',

      coreSize: 1.9,
      coreHeight: 0.9, // it sits low, so the arms sweep the floor
      corePulse: 0.35,
      corePulseSpeed: 9.0,
      coreTurbulence: 0.2,
      coreScale: 1.4,
      coreFlow: 2.4,
      coreBands: 9.0,
      coreRim: 1.2,
      coreGlow: 5.0,
      coreOpacity: 0.7,
      colorCoreA: '#ffffff',
      colorCoreB: '#bfe0ff',
      colorCoreC: '#ffffff',

      petals: 6, // MAX_PETALS
      petalSpan: 6.8,
      petalWidth: 1.1,
      petalLift: 0.5, // thrown outward, not upward
      petalCurve: 0.3,
      petalStagger: 0.0, // the only simultaneous bloom in the library
      petalOpen: 0.12,
      petalDroop: 0.02,

      strands: 20, // MAX_STRANDS
      strandRadius: 1.1,
      strandWidth: 0.03,
      strandTilt: 0.15, // almost coplanar: a halo, not a cage
      strandSpeed: 4.5,
      strandSpan: 0.9,
      strandDim: 0.9,
      strandGlow: 4.2,
      colorStrandCore: '#ffffff',
      colorStrandEdge: '#ffd0f4',
      colorStrandHalo: '#4f2fb0',

      trailWidth: 0.85,
      trailHeadSize: 1.2,
      trailPlume: 0.5,
      trailWakeSpread: 1.2,
      trailTurbulence: 1.2,
      trailWisps: 0.35,
      trailShred: 0.5,
      trailSpeed: 2.0,
      trailBuoyancy: 0.4,
      trailDensity: 1.2,
      trailSoot: 0.2, // halation is the absence of absorption
      trailCoreClarity: 0.9,
      trailGlow: 5.0,
      trailOpacity: 0.8,
      trailTempCore: 3400, // the hottest volume in the library
      trailTempEdge: 2900,
      trailPalette: 0.95,
      trailTailFade: 0.6,
      trailBurnout: 0.6,
      trailSteps: 28,
      colorHot: '#ffffff',
      colorFlameMid: '#cfe0ff',
      colorFlameEdge: '#9f7fff',
      colorFlameSmoke: '#101426',

      fieldBoundary: 0.5,
      fieldBoundaryGlow: 4.0,
      fieldFill: 0.12,
      fieldFalloff: 3.4,
      fieldVeins: 0.6,
      fieldVeinScale: 1.4,
      fieldRings: 6.0,
      fieldRingSpeed: 3.0,
      fieldSpokes: 48,
      fieldSpokeLength: 0.35,
      fieldCore: 2.6,
      fieldCoreSize: 0.3,
      colorField: '#9fc8ff',
      colorFieldEdge: '#ffffff',

      emberRate: 120,
      emberSize: 0.07,
      emberRise: 3.4,
      emberGlow: 2.4,
      colorEmberA: '#ffffff',
      colorEmberB: '#dfe8ff',
      colorEmberC: '#9f7fff',
      colorEmberD: '#141a34',
      sparkRate: 320,
      sparkSpeed: 12.0,
      colorSparkA: '#ffffff',
      colorSparkB: '#ffffff',
      colorSparkC: '#bfe0ff',
      colorSparkD: '#2a2060',
      smokeRate: 0,

      scorchRadius: 1.2,
      scorchIntensity: 0.15,
      colorScorch: '#0c0e18',
      shockRadius: 10.0,
      colorShockA: '#bfe0ff',
      colorShockB: '#ffffff',
      fissureRadius: 0.0,
      chunkCount: 0,

      lightIntensity: 40,
      lightRadius: 24,
      lightColor: '#dfe8ff',
      lightFlicker: 0.08,
      lightFlickerSpeed: 30,

      muzzleSize: 0.0,
      castFlash: 0.3,
      colorCastFlash: '#dfe8ff',
      burstSize: 6.4,
      burstIntensity: 2.4,
      burstTurbulence: 1.2,
      burstEmbers: 200,
      burstSparks: 360,
      burstDebris: 0,
      burstSmoke: 0,
      impactShake: 0.7,
      shakeDuration: 0.5,
      impactFlash: 0.5,
      rumble: 0.0,
      colorFlash: '#ffffff'
    }),

    /**
     * CAUSTIC RAIN — the rhythm run so fast it stops being a rhythm.
     *
     * Celestial Rain drops twenty-six shafts at seven a second and Ashen Deluge
     * drops nine heavy slabs at under two. This one runs the engine at
     * `MAX_SHAFTS` — forty-eight in flight — at twenty-six a second, from half
     * the height, falling at 46 m/s, each one 3.5 cm wide and two metres long.
     * Individually they are almost nothing; together they are a *shimmer*, which
     * is what a caustic is.
     *
     * Everything at the landing end is scaled down to match: a 30 cm burst, four
     * sparks, a flash of 0.005. The read is not the impacts, it is the floor —
     * so `fieldFalloff` goes *below* one, which is the only block in the library
     * where the ground wash is brightest in the middle instead of at the rim, and
     * `fieldCrawl` is pushed to 1.4 so the veins writhe like light on water.
     * The footprint is the widest in the library at seven metres.
     */
    caustic: derive(rain, {
      range: 24.0,
      minRange: 0.0,
      zoneRadius: 7.0, // the widest footprint in the library
      speed: 66.0,
      snapTime: 0.14,
      lifetime: 6.0,
      fadeTime: 1.6,
      cooldown: 2.6,
      castAnim: 'cast2',

      shafts: 48, // MAX_SHAFTS
      shaftRate: 26.0,
      shaftHeight: 12.0,
      shaftFall: 46.0,
      shaftWidth: 0.035,
      shaftTaper: 1.0, // no taper: a thread, not a spear
      shaftLength: 2.4,
      shaftTilt: 0.34,
      shaftInset: 1.0,
      shaftDim: 0.95,
      shaftGlow: 4.0,
      colorShaftCore: '#ffffff',
      colorShaftEdge: '#9fffe4',
      colorShaftHalo: '#2f6bd8',

      landingBurst: 0.3,
      landingRing: 0.7,
      landingRingLife: 0.4,
      landingSparks: 4,
      landingFlash: 0.005,
      landingShake: 0.008,
      landingLight: 1.2,

      fieldBoundary: 0.12,
      fieldBoundaryGlow: 2.8,
      fieldFill: 0.24,
      fieldFalloff: 0.8, // <1: the wash is brightest in the middle — a lit pool
      fieldVeins: 3.4,
      fieldVeinScale: 3.4,
      fieldVeinSharp: 0.35,
      fieldWarp: 1.1,
      fieldCrawl: 1.4, // light moving on water
      fieldRings: 1.2,
      fieldRingSpeed: 0.3,
      fieldSpokes: 64,
      fieldSpokeLength: 0.22,
      fieldSpin: 0.04,
      fieldCore: 0.2,
      fieldCoreSize: 0.08,
      fieldPulse: 0.35,
      fieldPulseSpeed: 2.4,
      colorField: '#6fe8d8',
      colorFieldEdge: '#ffffff',

      colorCore: '#ffffff',
      colorInner: '#dffff4',
      colorOuter: '#5fe0ff',
      colorHalo: '#0f3a6b',
      glow: 2.4,
      width: 0.02,

      trailRate: 0.4,
      colorArc: '#a8fff0',
      colorEmber: '#5fe0ff',
      shockRadius: 8.0,
      colorShockA: '#5fe0ff',
      colorShockB: '#ffffff',

      sparkRate: 100,
      sparkSize: 0.07,
      sparkSpeed: 4.0,
      sparkLifetime: 0.6,
      colorSparkA: '#ffffff',
      colorSparkB: '#dffff4',
      colorSparkC: '#5fe0ff',
      colorSparkD: '#0b2a4a',
      updraftRate: 260,
      updraftRise: 3.2,
      updraftSpeed: 1.6,
      updraftLifetime: 2.2,
      updraftTurbulence: 1.1,
      colorUpdraftA: '#ffffff',
      colorUpdraftB: '#9fffe4',
      colorUpdraftC: '#3fc8ff',
      colorUpdraftD: '#082038',

      lightIntensity: 14,
      lightRadius: 24,
      lightHeight: 0.08,
      lightColor: '#8ff0e0',

      muzzleSize: 0.3,
      castFlash: 0.06,
      colorCastFlash: '#dffff4',
      burstSize: 2.4,
      burstIntensity: 0.7,
      burstSparks: 70,
      ringRate: 1.6,
      impactShake: 0.25,
      shakeDuration: 0.4,
      impactFlash: 0.1,
      rumble: 0.005,
      colorBurstA: '#5fe0ff',
      colorBurstB: '#dffff4',
      colorBurstC: '#ffffff',
      colorFlash: '#dffff4'
    }),
  };
}
