/**
 * signatures-stormglass.js — the Stormglass Ascendancy, five of the twenty added in V3.2.
 *
 * Violet discharge over black glass. The group is built on one idea: charge
 * running through something that does not conduct — so every block pairs a hard
 * electric palette (`#7f4cff` through `#dcd0ff` to white) with a *material* read
 * that is dense and dark. It is the loudest of the four new groups and it is
 * meant to be; the Ashfall Legion next to it is the quiet one.
 *
 *   Tempest Fan        ← Storm Lance    (ThunderAbility)
 *   Arc Light          ← Void Rail      (BeamAbility)
 *   Stormglass Bastion ← Tidal Prism    (GlacierAbility)
 *   Dynamo Coil        ← Sandstorm Coil (CycloneAbility, rock branch)
 *   Thunderhead        ← Absolute Zero  (DomeAbility)
 *
 * Four of the five sit at an engine ceiling on purpose — `MAX_STRANDS` on the
 * Storm Lance, `MAX_RINGS` on the beam, `MAX_SHARDS` and `MAX_STRANDS` on the
 * cyclone — because the read of this group is *saturation*: more filaments, more
 * discs, more debris than the sibling, moving faster.
 *
 * Same two rules as everywhere else: derive from the sibling that already runs
 * on the engine, and move silhouette, timing *and* palette. Where a value sits
 * on a ceiling the comment says so, because a number above the cap is silently
 * clamped and would read as a knob that does nothing.
 */

import { derive } from './variants.js';
import { buildStormglassCells } from './signatures-stormglass-cells.js';

export function buildStormglassSignatures(settings) {
  // `sandstorm` and `zero` are destructured in the cells module, not here.
  const { thunder, voidrail, tidal } = settings;

  return {
    /* ================================================================== */
    /* STORMGLASS ASCENDANCY                                               */
    /* ================================================================== */

    /**
     * TEMPEST FAN — the bolt that refuses to converge.
     *
     * The Storm Lance throws nine filaments twenty-four metres and pulls them
     * hard onto the target (`converge` 0.8); Dusk Weave slows the same bundle
     * until it hangs in the air as fabric. This one is a **shotgun**: twenty-four
     * strands at `MAX_STRANDS`, fanning to 3.4 m — the widest spread in the
     * library — starting from more than half a metre of spread at the hand
     * (`spreadCurve` 0.42 opens it immediately), with `converge` taken down to
     * 0.15 so nothing gathers back up at the far end.
     *
     * The range comes down to thirteen metres to pay for it, and the whole thing
     * is over in 0.22 s at a restrike of sixty a second — three times the Storm
     * Lance's — so it reads as one violent sheet of discharge rather than as a
     * bolt you can follow.
     */
    tempest: derive(thunder, {
      range: 13.0, // the shortest line cast in the library
      minRange: 1.5,
      speed: 150.0,
      lifetime: 0.22,
      fadeTime: 0.34,
      cooldown: 0.8,
      castAnim: 'cast2',

      handHeight: 1.3,
      handForward: 0.5,
      handSide: 0.2,
      endHeight: 0.6,
      sag: -0.5, // it sprays downward rather than bowing up

      strands: 24, // MAX_STRANDS
      spread: 3.4, // the widest fan in the library
      spreadNear: 0.55,
      spreadCurve: 0.42, // it opens at the hand, not at the target
      twist: 1.4,
      twistSpeed: 2.6,
      branchDim: 0.9,

      jitter: 0.62,
      jitterScale: 1.6,
      octaves: 5,
      jitterFalloff: 0.7,
      crawl: 8.0,
      pinch: 0.05,
      converge: 0.15, // the whole point: nothing gathers back onto the target

      width: 0.02,
      widthTip: 1.4, // wider where it lands than where it leaves
      widthCurve: 0.7,
      coreWidth: 1.0,
      coreSharp: 6.0,
      glowWidth: 4.2,
      glowFalloff: 3.0,
      glowOpacity: 0.6,
      softFade: 0.5,

      restrike: 60, // the fastest re-roll in the library
      flicker: 0.55,
      flickerSpeed: 60,
      strandFlash: 0.75,
      tipGlow: 3.0,
      tipLength: 0.16,

      colorCore: '#ffffff',
      colorInner: '#dcd0ff',
      colorOuter: '#7f4cff',
      colorHalo: '#1a0a5e',
      glow: 3.0,

      arcRate: 3.0,
      arcRadius: 1.1,
      arcLife: 0.4,
      arcIntensity: 1.2,
      arcBranches: 0.85,
      scorchRadius: 0.35,
      scorchLife: 5.0,
      scorchIntensity: 0.35,
      colorArc: '#c8b0ff',
      colorScorch: '#0a0714',
      colorEmber: '#8f5cff',
      shockRadius: 4.5,
      colorShockA: '#7f4cff',
      colorShockB: '#ffffff',

      sparkRate: 480,
      sparkSize: 0.11,
      sparkSpeed: 14.0,
      sparkLifetime: 0.3,
      sparkGravity: -16.0,
      sparkStretch: 0.32,
      colorSparkA: '#ffffff',
      colorSparkB: '#dcd0ff',
      colorSparkC: '#7f4cff',
      colorSparkD: '#180a4a',
      moteRate: 40,
      colorMoteA: '#ffffff',
      colorMoteB: '#c8b0ff',
      colorMoteC: '#7f4cff',
      colorMoteD: '#12063a',
      smokeRate: 20,
      smokeOpacity: 0.04,
      debrisRate: 40,

      lightIntensity: 34,
      lightRadius: 13,
      lightColor: '#a87fff',
      lightFlicker: 0.6,
      lightFlickerSpeed: 52,

      muzzleSize: 1.1,
      muzzleIntensity: 3.0,
      castFlash: 0.3,
      colorMuzzleA: '#7f4cff',
      colorMuzzleB: '#dcd0ff',
      colorMuzzleC: '#ffffff',
      colorCastFlash: '#c8b0ff',
      burstSize: 2.0,
      burstIntensity: 1.0,
      burstSparks: 240,
      burstDebris: 60,
      impactShake: 0.5,
      shakeDuration: 0.3,
      impactFlash: 0.3,
      rumble: 0.0,
      colorBurstA: '#7f4cff',
      colorBurstB: '#dcd0ff',
      colorBurstC: '#ffffff',
      colorFlash: '#c8b0ff'
    }),

    /**
     * ARC LIGHT — the rail drawn out to its limit.
     *
     * Void Rail crosses thirty metres as a dark stroke with a magenta edge. This
     * one crosses **thirty-six** — the longest reach in the library — at 420 m/s,
     * which is the fastest anything travels here, and it does it as a hairline:
     * `radius` 0.2 with `radiusCurve` exactly 1.0, so there is no taper and no
     * bell, only length. Everything the eye can hold onto is therefore *on* the
     * rail rather than in its shape: a hard strobe running the span
     * (`throb` 0.35 at seven a second), the disc train at `MAX_RINGS` doing eight
     * and a half trips a second, and four coils barely wound (0.25 turns) but
     * rolling backwards at five and a half revolutions a second.
     *
     * Where Void Rail is near-black with a hot edge, this is white-cored and
     * cold-blue, with the violet only in the halo and the coil edge — the two
     * never read as the same cast even though they share the engine and the hue
     * family.
     */
    arclight: derive(voidrail, {
      range: 36.0, // the longest reach in the library
      minRange: 5.0,
      charge: 0.2,
      speed: 420.0, // ... and the fastest thing in it
      lifetime: 0.85,
      fadeTime: 0.5,
      cooldown: 1.7,
      castAnim: 'cast1',
      endHeight: 1.3,

      radiusNear: 0.06,
      radius: 0.2,
      radiusCurve: 1.0, // no taper, no bell: the read is length
      flare: 3.6,
      flareWidth: 0.03,

      coreWidth: 0.55,
      coreSharp: 4.5,
      coreFill: 1.0,
      shellWidth: 1.6,
      shellRim: 3.2,
      shellFill: 0.02,
      shellOpacity: 0.9,
      haloWidth: 4.6,
      haloRim: 6.5,
      haloOpacity: 0.22,
      edgePower: 2.6,
      opacity: 0.8,
      glow: 1.7,

      throb: 0.35, // a hard strobe running the whole span
      throbScale: 9.0,
      throbSpeed: 7.0,
      wander: 0.0,

      ripple: 0.02,
      rippleBands: 1.0,
      streak: 2.2,
      streakSharp: 0.95,
      streakScale: 16.0,
      streakBands: 1.0,
      streakGlow: 2.0,
      flowSpeed: 34.0,
      mouthGlow: 2.6,
      mouthLength: 0.05,
      tipGlow: 2.4,
      tipLength: 0.04,
      softFade: 0.4,

      colorCore: '#ffffff',
      colorInner: '#cfe4ff',
      colorOuter: '#5f8cff',
      colorHalo: '#2a0b8c',

      coils: 4,
      coilTurns: 0.25, // barely wound — they are hoops travelling, not a screw
      coilSpeed: -5.5,
      coilRadius: 4.8,
      coilFlare: 1.4,
      coilWidth: 0.035,
      coilWidthTip: 2.6,
      coilSharp: 3.4,
      coilPulse: 0.85,
      coilPulseFreq: 8.0,
      coilPulseSpeed: 6.5,
      coilGlow: 7.0,
      coilOpacity: 1.8,
      colorCoil: '#e0f0ff',
      colorCoilEdge: '#7f4cff',

      rings: 12, // MAX_RINGS
      ringSpeed: 8.5,
      ringInner: 3.2,
      ringOuter: 3.4,
      ringSwell: 0.05,
      ringFade: 0.85,
      ringSharp: 2.6,
      ringGlow: 3.6,
      ringOpacity: 0.9,
      colorRing: '#a8c8ff',

      orbSize: 0.14,
      orbThrob: 0.5,
      orbThrobSpeed: 18.0,
      orbTurbulence: 0.7,
      orbBands: 8.0,
      orbGlow: 3.0,

      scorchRate: 2.4,
      scorchRadius: 0.22,
      scorchLife: 6.0,
      scorchIntensity: 0.4,
      colorScorch: '#080a14',
      colorEmber: '#6f9cff',
      dustRate: 5.0,
      dustRadius: 1.6,
      colorDustA: '#2a3450',
      colorDustB: '#c8dcff',
      shockRate: 2.0,
      shockRadius: 5.5,
      colorShockA: '#5f8cff',
      colorShockB: '#ffffff',

      sparkRate: 340,
      sparkSpeed: 16.0,
      sparkLifetime: 0.28,
      sparkForward: 1.4,
      colorSparkA: '#ffffff',
      colorSparkB: '#cfe4ff',
      colorSparkC: '#5f8cff',
      colorSparkD: '#0d1a5e',
      moteRate: 50,
      colorMoteA: '#ffffff',
      colorMoteB: '#a8c8ff',
      colorMoteC: '#5f8cff',
      colorMoteD: '#0a1240',
      intakeRate: 120,

      lightIntensity: 30,
      lightRadius: 18,
      lightColor: '#8fb4ff',
      lightPulse: 0.35,
      lightPulseSpeed: 12.0,
      muzzleLightIntensity: 22,

      chargeShake: 0.03,
      castFlash: 0.22,
      muzzleSize: 0.75,
      burstSize: 2.6,
      burstIntensity: 1.7,
      burstSparks: 220,
      pulseRate: 0.0,
      splashRate: 180,
      impactShake: 0.65,
      shakeDuration: 0.4,
      burnShake: 0.03,
      impactFlash: 0.3,
      colorBurstA: '#5f8cff',
      colorBurstB: '#cfe4ff',
      colorBurstC: '#ffffff',
      colorFlash: '#cfe4ff',
      colorCastFlash: '#a8c8ff'
    }),

    /**
     * STORMGLASS BASTION — panes, where every sibling has blades.
     *
     * Four signatures already stand crystals in a ring on this engine and all of
     * them are made of *edges*: the Glacial Crown's blunt wedges, Tidal Prism's
     * inward-curling wave, Abyssal Vault's flattened lid, Prism Cascade's three
     * hundred needles. This one spends **sixty-four** instances at a base radius
     * of 1.15 m with `taper` 0.9 — parallel-sided slabs, four facets, almost no
     * lean and almost no fan. What stands is a tight palisade of broad black
     * panes, and unlike the Crown the middle is *not* left open: `coreShare` 0.22
     * puts a lit spire nearly seven metres tall inside it.
     *
     * The glass is black with a violet split and light piped hard up the body
     * (`pipe` 1.8), so each pane reads as charged rather than lit, and the veil
     * runs at 0.9 — the heaviest curtain in the library — because the whole read
     * is a storm standing inside a wall.
     */
    stormglass: derive(tidal, {
      range: 17.0,
      minRange: 0.0,
      zoneRadius: 4.0,
      speed: 40.0,
      snapTime: 0.34,
      lifetime: 6.0,
      shatterDelay: 0.6,
      shatterStagger: 0.3,
      sinkTime: 1.0,
      cooldown: 2.4,
      castAnim: 'cast2',
      // No `fadeTime`: Tidal Prism inherits the Crown's block, which resolves
      // through `shatterDelay` → `shatterStagger` → `sinkTime` instead.

      spikeCount: 64, // few and enormous — panes, not a thicket
      ringShare: 0.62,
      coreShare: 0.22, // and the middle is filled, unlike the Crown
      lateShare: 0.06,
      ringSeat: 1.0,
      ringScatter: 0.05,
      skirtSeat: 0.78,
      skirtBand: 0.3,
      skirtBias: 1.1,
      coreSpread: 0.1,

      ringHeight: 4.2,
      ringWave: 0.25,
      skirtHeight: 1.4,
      coreHeight: 6.8,
      heightJitter: 0.35,
      ringLean: -0.08,
      skirtLean: 0.5,
      coreLean: 0.0,
      leanJitter: 0.5,
      fan: 0.12, // they do not cross: a palisade reads as a wall
      twist: 0.35,
      rubble: 0.3,
      rubbleScale: 0.3,

      radius: 1.15, // the broadest crystal in the library
      radiusJitter: 0.35,
      taper: 0.9, // parallel-sided slabs
      facets: 4,
      roughness: 0.05,
      bend: 0.0,

      riseTime: 0.36,
      riseOvershoot: 0.12,
      settle: 0.6,
      sweepTime: 0.6,
      skirtDelay: 0.16,
      skirtWave: 0.3,
      coreDelay: 0.4,
      stagger: 0.1,
      bloomSpread: 0.4,

      colorGlass: '#0a0616',
      colorEdge: '#dcd0ff',
      colorPrismA: '#8f5cff',
      colorPrismB: '#4fd8ff',
      colorCore: '#b08fff',
      colorTip: '#ffffff',
      body: 1.7,
      edgePower: 1.9,
      edgeGain: 1.4,
      dispersion: 1.25,
      pipe: 1.8, // charge running up the pane
      tipBias: 0.9,
      bands: 1.1,
      pulseSpeed: 2.8,
      tipStart: 0.45,
      tipGlow: 2.4,
      stria: 0.35,
      striaScale: 3.0,
      envIntensity: 1.2,
      specular: 4.0,
      glow: 1.1,
      opacity: 0.95,

      frontRough: 0.2,
      frontWidth: 0.2,
      frontGlow: 3.4,
      shatterScale: 3.2, // a pane breaks into a few big pieces
      shatterEdge: 0.14,
      shatterGlow: 4.0,

      fieldBoundary: 0.6,
      fieldBoundaryGlow: 3.2,
      fieldFill: 0.34,
      fieldFalloff: 1.8,
      fieldPlates: 1.4,
      fieldPlateScale: 1.1,
      fieldSeam: 1.2,
      fieldFingers: 0.5,
      fieldFingerScale: 0.8,
      fieldWarp: 0.7,
      fieldCrawl: 0.25,
      fieldRings: 1.8,
      fieldRingSpeed: -0.9,
      fieldSweep: 0.8,
      fieldSweepSpeed: 0.3,
      fieldCore: 1.8,
      fieldCoreSize: 0.18,
      fieldPulse: 0.4,
      fieldPulseSpeed: 3.2,
      colorField: '#7f4cff',
      colorFieldEdge: '#e0d0ff',

      veil: 0.9, // the heaviest curtain in the library
      veilHeight: 4.4,
      veilRadius: 1.1,
      veilFlare: 0.16,
      veilBillow: 0.5,
      veilScale: 1.0,
      veilStretch: 0.35,
      veilFlow: 1.6,
      veilErode: 0.7,
      veilFalloff: 1.2,
      veilSpin: 0.06,
      colorVeil: '#8f6bff',
      colorVeilCrest: '#e0f0ff',

      frostSpread: 1.4,
      frostLife: 8.0,
      frostIntensity: 0.4,
      frostCrystals: 2.0,
      frostCollar: 1.8,
      rimeRate: 2.0,
      colorFrost: '#c4b8e8',
      colorFrostEdge: '#332a52',
      shockRadius: 7.0,
      ringRate: 1.1,
      colorShockA: '#7f4cff',
      colorShockB: '#ffffff',

      mistRate: 300,
      mistSize: 1.4,
      mistOpacity: 0.06,
      mistRise: 0.25,
      colorMistA: '#e0d0ff',
      colorMistB: '#a88fe8',
      colorMistC: '#4f3a8c',
      colorMistD: '#0a0618',
      shardSize: 0.11,
      shardSpeed: 8.0,
      breachShards: 4,
      shatterShards: 7,
      colorShardA: '#ffffff',
      colorShardB: '#dcd0ff',
      colorShardC: '#8f5cff',
      colorShardD: '#180a3a',
      glitterRate: 200,
      glitterRise: 2.0,
      colorGlitterA: '#ffffff',
      colorGlitterB: '#b08fff',
      colorGlitterC: '#5fd8ff',
      colorGlitterD: '#0d0620',
      snowRate: 0,

      lightIntensity: 20,
      lightRadius: 18,
      lightHeight: 0.5,
      lightColor: '#9f6bff',

      burstSize: 4.0,
      burstIntensity: 1.6,
      burstShards: 130,
      burstMist: 90,
      burstGlitter: 160,
      vapourRate: 1.4,
      impactShake: 1.1,
      shakeDuration: 1.0,
      holdShake: 0.04,
      impactFlash: 0.3,
      rumble: 0.05,
      colorBurstA: '#7f4cff',
      colorBurstB: '#dcd0ff',
      colorBurstC: '#ffffff',
      colorFlash: '#d8c8ff'
    }),

    // Dynamo Coil and Thunderhead live in `signatures-stormglass-cells.js`; the
    // five blocks of this group did not fit one file under the 800-line rule.
    ...buildStormglassCells(settings)
  };
}
