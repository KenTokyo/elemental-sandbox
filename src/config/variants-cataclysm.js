/**
 * variants-cataclysm.js — the Cataclysm Engine's five derived signatures.

 * Solar Spear, Magma Rift, Gravity Well, Void Rail and Plasma Bloom. Two pairs
 * share a base and are pulled apart on purpose: Solar Spear and Void Rail both
 * come off the Nova Beam, and Magma Rift and Plasma Bloom both come off the
 * Cinder Fall. Where two signatures share an engine the numbers are moved far
 * enough that the two never read as the same cast.
 *
 * Split out of `variants.js` under the 800-line rule in `AGENTS.md`; not one
 * number changed on the way out. Every block below derives from a *base* block —
 * one of the six written longhand in `blocks-*.js` — which is handed in rather
 * than imported, because `buildVariants` runs against the live `settings`
 * object and a derivation reads it after the six are already in place.
 */
import { derive, borrow, FIELD_KEYS } from './derive.js';

export function buildCataclysm({ meteor, beam, snare, snareField }) {
  return {
    /* ================================================================== */
    /* CATACLYSM ENGINE                                                    */
    /* ================================================================== */

    /**
     * SOLAR SPEAR — the Nova Beam's column, stood on end and dropped. The orb
     * winds up over the target instead of in the hands, and what lands is a
     * vertical shaft of daylight that burns a disc into the floor. Same engine,
     * completely different read: the beam is a horizontal line you fire *along*,
     * this is a weight you drop *onto* a place.
     *
     * Engine keys (`abilities/SpearAbility.js`):
     *   spearHeight  where the column starts, metres above the target
     *   spearTilt    radians it is raked away from vertical
     */
    solar: derive(beam, {
      ...borrow(snare, FIELD_KEYS),
      range: 21.0,
      minRange: 0.0,
      zoneRadius: 2.9,
      charge: 0.72, // a long, deliberate wind-up
      speed: 190.0,
      lifetime: 1.6,
      fadeTime: 0.55,
      cooldown: 2.4,
      castAnim: 'cast1',

      spearHeight: 26.0,
      spearTilt: 0.06,

      radiusNear: 0.34,
      radius: 1.05,
      radiusCurve: 0.75, // opens out early — a shaft, not a jet
      flare: 1.35,
      flareWidth: 0.14,

      coreWidth: 0.26,
      coreFill: 0.72,
      shellRim: 1.35,
      shellFill: 0.24,
      haloWidth: 3.4,
      haloOpacity: 0.2,

      colorCore: '#ffffff',
      colorInner: '#fff3cf',
      colorOuter: '#ffb63c',
      colorHalo: '#c0510a',
      glow: 1.0,
      opacity: 0.36,

      coils: 3,
      coilTurns: 0.85,
      coilSpeed: -0.4,
      coilRadius: 2.1,
      coilGlow: 6.0,
      colorCoil: '#fff6d8',
      colorCoilEdge: '#ff8a1c',

      rings: 12,
      ringSpeed: 1.9,
      ringInner: 2.1,
      ringOuter: 2.5,
      colorRing: '#ffd98c',

      orbSize: 0.62,
      orbGlow: 3.4,
      orbBands: 4.0,

      scorchRadius: 1.5,
      scorchLife: 9.0,
      scorchIntensity: 0.8,
      colorScorch: '#120b05',
      colorEmber: '#ffb03c',
      shockRadius: 8.0,
      colorShockA: '#ffb63c',
      colorShockB: '#fffbee',

      fieldBoundary: 0.3,
      fieldBoundaryGlow: 2.6,
      fieldFill: 0.24,
      fieldVeins: 1.8,
      fieldVeinScale: 1.6,
      fieldSpokes: 32,
      fieldSpin: -0.04,
      fieldCore: 1.4,
      fieldCoreSize: 0.3,
      colorField: '#ffb63c',
      colorFieldEdge: '#fffbee',

      colorSparkA: '#ffffff',
      colorSparkB: '#ffe6a8',
      colorSparkC: '#ff9a1c',
      colorSparkD: '#5c2202',
      colorMoteA: '#fffbee',
      colorMoteB: '#ffd27a',
      colorMoteC: '#ff8a1c',
      colorMoteD: '#3a1400',
      smokeRate: 120,
      colorSmokeA: '#6d5a45',
      colorSmokeB: '#4a3c30',

      lightIntensity: 34,
      lightRadius: 24,
      lightColor: '#ffc866',

      castFlash: 0.26,
      muzzleSize: 1.4,
      burstSize: 5.0,
      burstIntensity: 1.9,
      impactShake: 1.2,
      shakeDuration: 0.9,
      burnShake: 0.11,
      impactFlash: 0.4,
      colorBurstA: '#ffb63c',
      colorBurstB: '#ffe6a8',
      colorBurstC: '#ffffff',
      colorFlash: '#ffe6a8',
      colorCastFlash: '#fff3cf'
    }),

    /**
     * MAGMA RIFT — the floor is torn open along the aimed line and what is under
     * it comes up. Built on the Cinder Fall's block because that is where the
     * crack network (`fissure*`) and the volumetric flame (`trail*`) live; the
     * rock itself is only the basalt heaved along the lips.
     *
     * Engine keys (`abilities/RiftAbility.js`):
     *   rift*    how the tear is laid down along the line
     *   jet*     the standing columns of flame in it
     *   basalt*  the wreckage on the lips
     */
    magma: derive(meteor, {
      range: 18.0,
      minRange: 2.5,
      speed: 17.0, // the tear walks — you can watch it come
      lifetime: 4.4,
      fadeTime: 2.0,
      cooldown: 1.8,
      castAnim: 'cast1',

      riftNodes: 5, // crack networks laid down the line
      riftRadius: 2.6, // radius of one, metres
      riftSpread: 0.55, // lateral scatter of their centres, metres
      riftStagger: 0.06, // seconds of extra delay between them

      jets: 4, // standing columns of flame
      jetHeight: 4.6, // metres
      jetWidth: 0.72,
      jetStagger: 0.13, // seconds between them lighting
      jetLife: 2.6, // seconds one burns after the tear stops growing
      jetLean: 0.22, // radians they rake downrange

      basaltCount: 90,
      basaltScale: 0.34,
      basaltLean: 0.5,
      basaltSpread: 1.5, // × the rift radius
      basaltRise: 0.3, // seconds one takes to heave up
      basaltSink: 1.6,

      fissureRadius: 2.6,
      fissureLife: 7.5,
      fissureArms: 5,
      fissureWander: 1.9,
      fissureBranches: 0.85,
      fissureWidth: 0.19,
      fissureHeat: 2.0,
      fissurePulse: 1.3,
      fissureGrowth: 11.0,
      fissureRockSize: 0.34,

      trailSpan: 3.2,
      trailWidth: 0.9,
      trailHeadSize: 1.15,
      trailPlume: 1.9, // it stands up rather than streaming back
      trailRise: 0.9,
      trailBuoyancy: 5.2,
      trailSpeed: 2.4,
      trailTurbulence: 3.2,
      trailLick: 3.6,
      trailWisps: 0.95,
      trailDensity: 2.3,
      trailTempCore: 1980,
      trailTempEdge: 1520,
      trailPalette: 0.7,
      trailTailFade: 0.5,
      trailBurnout: 1.4,
      trailSteps: 32,

      colorRock: '#3d3129',
      colorChar: '#120c08',
      colorCrack: '#ff5a08',
      colorHot: '#ffe9b0',
      crackGlow: 2.8,
      crackWidth: 0.06,
      chargeCurve: 0.5,

      scorchRadius: 2.2,
      scorchLife: 10.0,
      scorchIntensity: 1.0,
      shockRadius: 7.0,

      emberRate: 320,
      emberRise: 2.4,
      emberLifetime: 2.0,
      sparkRate: 160,
      smokeRate: 130,
      smokeLifetime: 3.6,
      smokeOpacity: 0.14,

      lightIntensity: 22,
      lightRadius: 18,
      lightColor: '#ff7a28',
      lightFlicker: 0.34,
      lightFlickerSpeed: 15,

      chunkCount: 0, // there is no rock in flight — this one comes from below
      muzzleSize: 0.0,
      castFlash: 0.1,
      burstSize: 3.2,
      burstIntensity: 1.1,
      burstEmbers: 220,
      burstSmoke: 90,
      impactShake: 1.1,
      shakeDuration: 1.6,
      impactFlash: 0.24,
      rumble: 0.09, // the whole cast rumbles — the floor is being opened
      colorFlash: '#ff8a3c'
    }),

    /**
     * GRAVITY WELL — a hole opened in the middle of the footprint. Built on the
     * Voltaic Snare's block for its ground disc and its filament vocabulary, but
     * inverted at every level: the light is *subtracted* rather than added, the
     * particles fall inward instead of being thrown out, and the resolution is a
     * collapse followed by one hard release rather than a slow fade.
     *
     * Engine keys (`abilities/WellAbility.js`):
     *   horizon*  the body in the middle
     *   disc*     the accretion ribbons around it
     *   pull*     what is being dragged in
     */
    gravity: derive(snare, {
      range: 20.0,
      minRange: 0.0,
      zoneRadius: 4.8,
      speed: 58.0,
      snapTime: 0.28,
      lifetime: 3.4,
      fadeTime: 0.9,
      cooldown: 2.6,
      castAnim: 'cast2',

      horizonRadius: 1.15, // metres
      horizonHeight: 1.5, // where it hangs above the floor, metres
      horizonSquash: 1.0,
      horizonWarp: 0.55, // how far the surface is dragged around itself
      horizonSpin: 0.65, // turns/second
      horizonScale: 2.6,
      horizonRim: 3.2, // fresnel exponent of the ring of light around it
      horizonRimGain: 2.8,
      horizonOpacity: 1.0,
      horizonGlow: 1.0,
      horizonCollapse: 0.45, // fraction of the fade spent imploding
      colorHorizonA: '#05010c', // the body — very nearly nothing
      colorHorizonB: '#6b2bff', // what is smeared around it
      colorHorizonC: '#ffd6ff', // the ring at the silhouette

      discStrands: 26,
      discInner: 0.28, // × zoneRadius
      discOuter: 0.98,
      discTilt: 0.42, // radians the accretion plane is raked
      discSpin: -1.25, // turns/second (negative: against the horizon)
      discWidth: 0.05,
      discTaper: 2.4, // how much thinner a ribbon is at the inner lip
      discWobble: 0.22,
      discDim: 0.7,
      discGlow: 2.4,
      colorDiscCore: '#ffffff',
      colorDiscEdge: '#b06bff',
      colorDiscHalo: '#2a0b6e',

      pullRadius: 1.35, // where infalling matter is picked up, × zoneRadius
      pullRate: 320, // particles/second
      pullSpeed: 7.5,
      pullSwirl: 3.4, // radians/second they orbit on the way in
      pullCollapse: -0.88, // <0 draws the spiral inward (this is the whole trick)
      pullLifetime: 1.5,
      pullSize: 0.075,
      colorPullA: '#ffd6ff',
      colorPullB: '#b06bff',
      colorPullC: '#5a1fd8',
      colorPullD: '#0a0320',

      fieldBoundary: 0.05,
      fieldBoundaryGlow: 2.2,
      fieldFill: 0.5,
      fieldFalloff: 5.0, // the middle goes black — that is the point
      fieldVeins: 2.4,
      fieldVeinScale: 1.7,
      fieldWarp: 0.85,
      fieldCrawl: -0.8, // the veins are dragged inward
      fieldRings: 3.4,
      fieldRingSpeed: -1.3,
      fieldSpokes: 28,
      fieldSpin: -0.12,
      fieldCore: 0.0, // nothing stands in the middle but the hole
      colorField: '#7a3bff',
      colorFieldEdge: '#e2c4ff',

      strands: 0, // no column
      tendrils: 0,
      rimArcs: 10,
      rimSpeed: -2.6,
      rimHeight: 0.35,
      colorCore: '#ffffff',
      colorInner: '#e2c4ff',
      colorOuter: '#8f4bff',
      colorHalo: '#1b0350',

      sparkRate: 90,
      updraftRate: 0, // nothing rises here
      smokeRate: 40,
      debrisRate: 55,
      debrisSpeed: 2.0,

      lightIntensity: 15,
      lightRadius: 15,
      lightHeight: 0.5,
      lightColor: '#9b5bff',
      lightFlicker: 0.12,

      shockRadius: 9.5,
      burstSize: 3.6,
      burstIntensity: 1.8,
      burstSparks: 260,
      impactShake: 0.6,
      holdShake: 0.05,
      shakeDuration: 0.8,
      impactFlash: 0.18,
      colorBurstA: '#8f4bff',
      colorBurstB: '#e2c4ff',
      colorBurstC: '#ffffff',
      colorFlash: '#c9a4ff'
    }),

    /**
     * VOID RAIL — the Nova Beam's engine with the light taken out of it. Instead
     * of a white-hot column with gold coils it is a near-black rail with a
     * magenta edge, fired instantly (no wind-up worth the name) and gone almost
     * as fast. Where the Nova Beam lands and *holds*, this one is a single hard
     * stroke: the pair reads as generosity versus violence on the same hardware.
     */
    voidrail: derive(beam, {
      range: 30.0,
      minRange: 3.0,
      charge: 0.1, // barely a wind-up
      speed: 320.0,
      lifetime: 0.5,
      fadeTime: 0.34,
      cooldown: 1.2,
      castAnim: 'cast2',

      handHeight: 1.26,
      handForward: 0.66,
      handSide: 0.12,
      endHeight: 1.1,

      radiusNear: 0.1,
      radius: 0.42,
      radiusCurve: 1.9, // stays a rail almost the whole way, then opens
      flare: 2.4,
      flareWidth: 0.06,

      coreWidth: 0.34,
      coreSharp: 2.6,
      coreFill: 0.9,
      shellWidth: 1.0,
      shellRim: 2.4,
      shellFill: 0.04, // the sheath is empty: only its edges exist
      shellOpacity: 1.0,
      haloWidth: 2.2,
      haloRim: 5.6,
      haloOpacity: 0.1,
      edgePower: 3.0,

      colorCore: '#1a0326', // a dark rail — the read is the edge, not the body
      colorInner: '#7a1cff',
      colorOuter: '#ff3ce0',
      colorHalo: '#2b0140',
      glow: 1.35,
      opacity: 0.62,

      ripple: 0.06,
      streak: 1.6,
      streakSharp: 0.8,
      streakScale: 9.0,
      streakGlow: 1.2,
      flowSpeed: 16.0,
      tipGlow: 1.4,

      coils: 2,
      coilTurns: 0.4,
      coilSpeed: -2.2,
      coilRadius: 1.35,
      coilWidth: 0.05,
      coilGlow: 5.5,
      coilOpacity: 1.4,
      colorCoil: '#ff8cf0',
      colorCoilEdge: '#6a0dad',

      rings: 6,
      ringSpeed: 3.4,
      ringInner: 1.7,
      ringOuter: 1.9,
      ringGlow: 3.0,
      colorRing: '#ff5ce8',

      orbSize: 0.2,
      orbGlow: 2.2,
      orbTurbulence: 0.5,

      scorchRate: 1.6,
      scorchRadius: 0.4,
      scorchLife: 8.0,
      colorScorch: '#0a0410',
      colorEmber: '#c23cff',
      dustRate: 3.0,
      colorDustA: '#3a2050',
      colorDustB: '#e6a8ff',
      shockRate: 1.4,
      shockRadius: 5.0,
      colorShockA: '#a83cff',
      colorShockB: '#ffd6ff',

      sparkRate: 200,
      sparkSpeed: 12.0,
      sparkLifetime: 0.35,
      colorSparkA: '#ffd6ff',
      colorSparkB: '#ff5ce8',
      colorSparkC: '#7a1cff',
      colorSparkD: '#150128',
      moteRate: 70,
      colorMoteA: '#ffd6ff',
      colorMoteB: '#c23cff',
      colorMoteC: '#6a0dad',
      colorMoteD: '#0b0117',
      smokeRate: 40,
      smokeOpacity: 0.05,
      intakeRate: 90,

      lightIntensity: 22,
      lightRadius: 16,
      lightColor: '#c46bff',
      lightPulse: 0.05,

      chargeShake: 0.02,
      castFlash: 0.16,
      muzzleSize: 0.6,
      burstSize: 3.0,
      burstIntensity: 1.5,
      pulseRate: 0.0,
      splashRate: 120,
      impactShake: 0.7,
      shakeDuration: 0.35,
      burnShake: 0.02,
      impactFlash: 0.24,
      colorBurstA: '#a83cff',
      colorBurstB: '#ff5ce8',
      colorBurstC: '#ffd6ff',
      colorFlash: '#e2a8ff',
      colorCastFlash: '#ff8cf0'
    }),

    /**
     * PLASMA BLOOM — a flower of plasma opening in the footprint: a churning
     * core with volumetric petals arcing out of it and arcs whipping around the
     * lot. Built on the Cinder Fall's block for the volume renderer, with the
     * Snare's ground disc borrowed underneath it.
     *
     * Engine keys (`abilities/BloomAbility.js`):
     *   core*    the body in the middle
     *   petal*   the volumetric arms
     *   strand*  the arcs whipping around them
     */
    plasma: derive(meteor, {
      ...snareField,
      range: 19.0,
      minRange: 0.0,
      zoneRadius: 4.4,
      speed: 44.0,
      snapTime: 0.24,
      lifetime: 3.0,
      fadeTime: 1.0,
      cooldown: 2.0,
      castAnim: 'cast2',

      coreSize: 1.05, // metres
      coreHeight: 1.7, // where it hangs, metres
      corePulse: 0.16,
      corePulseSpeed: 5.4,
      coreTurbulence: 0.55,
      coreScale: 2.8,
      coreFlow: 1.3,
      coreBands: 5.5,
      coreRim: 2.2,
      coreGlow: 3.2,
      coreOpacity: 0.95,
      colorCoreA: '#ff3ca8',
      colorCoreB: '#ffe27a',
      colorCoreC: '#ffffff',

      petals: 6,
      petalSpan: 4.4, // metres of arc one petal covers
      petalWidth: 0.5,
      petalLift: 2.4, // metres the arc rises before it falls back
      petalCurve: 0.62, // <1 throws the arc outward early
      petalStagger: 0.07, // seconds between petals opening
      petalOpen: 0.42, // seconds one takes to reach full length
      petalDroop: 0.35, // how far the tip falls back toward the floor

      strands: 14, // arcs whipping around the bloom
      strandRadius: 0.85, // × zoneRadius
      strandWidth: 0.05,
      strandTilt: 1.1, // radians of random inclination
      strandSpeed: 1.9, // turns/second
      strandSpan: 0.42, // fraction of a full circle one arc covers
      strandDim: 0.8,
      strandGlow: 2.8,
      colorStrandCore: '#ffffff',
      colorStrandEdge: '#ff7ae0',
      colorStrandHalo: '#6a0a5e',

      trailWidth: 0.5,
      trailHeadSize: 1.5,
      trailPlume: 1.2,
      trailWakeSpread: 0.5,
      trailTurbulence: 2.4,
      trailWisps: 0.9,
      trailShred: 1.4,
      trailSpeed: 3.6,
      trailBuoyancy: 2.0,
      trailDensity: 1.9,
      trailSoot: 0.55, // plasma does not soot up
      trailCoreClarity: 0.7,
      trailGlow: 3.6,
      trailTempCore: 2600,
      trailTempEdge: 2050,
      trailPalette: 0.9, // almost entirely the stops below
      trailTailFade: 0.42,
      trailBurnout: 0.9,
      trailSteps: 30,
      colorHot: '#ffffff',
      colorFlameMid: '#ff6ad0',
      colorFlameEdge: '#8a2bff',
      colorFlameSmoke: '#1a0322',

      fieldBoundary: 0.24,
      fieldBoundaryGlow: 3.0,
      fieldFill: 0.34,
      fieldFalloff: 1.8,
      fieldVeins: 2.6,
      fieldVeinScale: 2.2,
      fieldRings: 3.0,
      fieldRingSpeed: 1.6,
      fieldSpokes: 24,
      fieldCore: 1.5,
      fieldCoreSize: 0.24,
      colorField: '#ff4fb8',
      colorFieldEdge: '#fff0ff',

      emberRate: 260,
      emberRise: 2.2,
      emberGlow: 1.6,
      colorEmberA: '#ffffff',
      colorEmberB: '#ff8ae0',
      colorEmberC: '#a02bff',
      colorEmberD: '#1c0330',
      sparkRate: 240,
      sparkSpeed: 9.0,
      colorSparkA: '#ffffff',
      colorSparkB: '#ffd6ff',
      colorSparkC: '#ff4fb8',
      colorSparkD: '#3a0350',
      smokeRate: 40,
      smokeOpacity: 0.05,
      colorSmokeA: '#4a2a55',
      colorSmokeB: '#2e1838',

      scorchRadius: 2.6,
      scorchIntensity: 0.5,
      colorScorch: '#12061a',
      shockRadius: 8.0,
      colorShockA: '#ff4fb8',
      colorShockB: '#ffffff',

      fissureRadius: 0.0, // no cracks — this one never touches the floor hard
      chunkCount: 0,

      lightIntensity: 26,
      lightRadius: 18,
      lightColor: '#ff6ad0',
      lightFlicker: 0.3,
      lightFlickerSpeed: 18,

      muzzleSize: 0.0,
      castFlash: 0.12,
      burstSize: 4.6,
      burstIntensity: 1.7,
      burstEmbers: 320,
      burstSparks: 280,
      burstDebris: 0,
      burstSmoke: 30,
      impactShake: 0.8,
      shakeDuration: 0.7,
      impactFlash: 0.3,
      rumble: 0.02,
      colorFlash: '#ffb0ee'
    }),
  };
}
