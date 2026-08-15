/**
 * signatures-umbra.js — five of the ten signatures V3.1 adds after Forge.
 *
 * Same construction as `signatures-forge.js` and for the same reason: every
 * block below is derived from the *sibling that already runs on the same
 * engine*, so it inherits exactly the control surface that engine reads and no
 * derivation can be short a key family — which is why nothing here needs the
 * `borrow()` that `variants.js` depended on.
 *
 *   Eclipse Column   ← Void Rail        (BeamAbility, line cast)
 *   Singularity Maw  ← Gravity Well     (WellAbility)
 *   Nightshade Bloom ← Plasma Bloom     (BloomAbility)
 *   Grave Bind       ← Voltaic Snare    (SnareAbility)
 *   Dusk Weave       ← Storm Lance      (ThunderAbility)
 *
 * The other five are in `signatures-drowned.js`, split off only for length; the
 * two files are merged one after the other and follow identical rules.
 *
 * The rule from `variants.js` is still the whole job: **a signature is a
 * different ability, not a recolour.** Each block moves the silhouette
 * (footprint, height, count, curvature), the timing (travel, hold, release)
 * *and* the palette away from the sibling it came from.
 *
 * Two blocks across the two files are line casts on engines that never build a
 * `ZoneField` (`BeamAbility`, `IceAbility`), so those have no `field*` family
 * and need none. Everything with a footprint inherits the disc from its sibling.
 */

import { derive } from './variants.js';

export function buildUmbraSignatures(settings) {
  const { voidrail, gravity, plasma, snare, thunder } = settings;

  return {
    /* ================================================================== */
    /* UMBRAL COVENANT                                                     */
    /* ================================================================== */

    /**
     * ECLIPSE COLUMN — the Void Rail stopped dead and stood on the spot.
     *
     * The Rail is the fastest thing in the library: no wind-up, a hairline
     * stroke, gone in half a second. This is its inverse on the same engine — a
     * full second of charge, a column three metres wide that walks out at
     * jogging pace, and a hold long enough to be architecture. The body is
     * genuinely dark (`coreFill` and `shellFill` near zero, `colorCore` almost
     * black); what you read is the corona: a wide pale halo, a stack of slow
     * swelling rings and nothing else. No coils — a disc has no thread.
     */
    eclipse: derive(voidrail, {
      range: 12.0,
      minRange: 0.0,
      charge: 0.95, // the wind-up is most of the cast
      speed: 26.0,
      lifetime: 4.6,
      fadeTime: 2.2,
      cooldown: 3.6,
      castAnim: 'cast3',

      handHeight: 1.34,
      handForward: 0.5,
      handSide: 0.0,
      endHeight: 1.9, // it stands at chest height, not on the floor

      radiusNear: 1.6,
      radius: 3.2,
      radiusCurve: 0.35, // opens out immediately — a disc seen edge-on
      flare: 0.4,
      flareWidth: 0.55,

      coreWidth: 0.9,
      coreSharp: 0.7,
      coreFill: 0.06, // the body is the absence — this is the whole read
      shellWidth: 1.15,
      shellRim: 4.2,
      shellFill: 0.02,
      haloWidth: 5.2,
      haloRim: 1.6,
      haloOpacity: 0.55,
      edgePower: 1.2,

      colorCore: '#020104',
      colorInner: '#150a2e',
      colorOuter: '#6f5ad8',
      colorHalo: '#e8dcff', // the corona is the brightest thing in the block
      glow: 0.55,
      opacity: 0.9,
      throb: 0.34,
      throbSpeed: 0.5,

      ripple: 0.02,
      streak: 0.25,
      streakScale: 2.2,
      streakGlow: 0.4,
      flowSpeed: 1.4,
      tipGlow: 0.3,

      coils: 0, // a disc has no thread wound around it
      rings: 12, // MAX_RINGS — the corona is a stack, not a pulse
      ringSpeed: 0.35,
      ringInner: 3.4,
      ringOuter: 3.8,
      ringGlow: 4.4,
      colorRing: '#f4ecff',

      orbSize: 1.9,
      orbGlow: 0.8,
      orbTurbulence: 0.15,

      scorchRate: 0.4,
      scorchRadius: 3.6,
      scorchLife: 12.0,
      colorScorch: '#050208',
      colorEmber: '#8f7ae8',
      shockRate: 0.5,
      shockRadius: 10.0,
      colorShockA: '#3a2a6e',
      colorShockB: '#e8dcff',

      sparkRate: 30,
      sparkSpeed: 2.2,
      sparkLifetime: 1.8,
      colorSparkA: '#e8dcff',
      colorSparkB: '#8f7ae8',
      colorSparkC: '#3a2a6e',
      colorSparkD: '#050208',
      moteRate: 240,
      colorMoteA: '#c9b8ff',
      colorMoteB: '#6f5ad8',
      colorMoteC: '#2a1a5e',
      colorMoteD: '#040108',
      smokeRate: 130,
      smokeOpacity: 0.12,
      intakeRate: 280,

      lightIntensity: 6, // it darkens the stage more than it lights it
      lightRadius: 22,
      lightColor: '#7a5ce0',
      lightPulse: 0.3,

      chargeShake: 0.05,
      castFlash: 0.04,
      muzzleSize: 1.9,
      burstSize: 6.4,
      burstIntensity: 0.5,
      pulseRate: 0.7,
      impactShake: 0.4,
      shakeDuration: 2.0,
      burnShake: 0.05,
      impactFlash: 0.06,
      colorBurstA: '#1a0b3a',
      colorBurstB: '#6f5ad8',
      colorBurstC: '#e8dcff',
      colorFlash: '#2a1a5e',
      colorCastFlash: '#c9b8ff'
    }),

    /**
     * SINGULARITY MAW — the Gravity Well made small, tall and patient.
     *
     * The Well is a wide flat plate: a five-metre footprint, an accretion disc
     * raked barely off horizontal, three and a half seconds and one hard
     * release. This one is a throat. The footprint shrinks to three metres, the
     * body hangs at head height, and the disc is tilted almost to vertical so
     * you look *through* it rather than down at it. It reaches far outside its
     * own boundary for what it drags in (`pullRadius` well above 1) and takes
     * nearly twice as long to do it, then collapses over most of the fade.
     */
    singularity: derive(gravity, {
      range: 18.0,
      zoneRadius: 3.0,
      speed: 44.0,
      snapTime: 0.5,
      lifetime: 6.2, // the longest hold on this engine
      fadeTime: 1.6,
      cooldown: 3.4,
      castAnim: 'cast3',

      horizonRadius: 0.55,
      horizonHeight: 3.2, // head height, not knee height
      horizonSquash: 1.45, // drawn out vertically — a maw, not a marble
      horizonWarp: 1.1,
      horizonSpin: 0.22,
      horizonScale: 4.2,
      horizonRim: 5.0,
      horizonRimGain: 4.0,
      horizonCollapse: 0.82, // most of the fade is the implosion
      colorHorizonA: '#010305',
      colorHorizonB: '#0f6b6a',
      colorHorizonC: '#d8fff4',

      discStrands: 9, // few and wide, so the tilt is legible
      discInner: 0.12,
      discOuter: 0.62,
      discTilt: 1.32, // radians — very nearly edge-on
      discSpin: -0.35,
      discWidth: 0.14,
      discTaper: 1.1,
      discWobble: 0.55,
      discGlow: 1.8,
      colorDiscCore: '#d8fff4',
      colorDiscEdge: '#2fbfae',
      colorDiscHalo: '#03231f',

      pullRadius: 2.4, // it takes in far more than it stands on
      pullRate: 180,
      pullSpeed: 3.2,
      pullSwirl: 1.1,
      pullCollapse: -0.55,
      pullLifetime: 3.4,
      pullSize: 0.055,
      colorPullA: '#d8fff4',
      colorPullB: '#2fbfae',
      colorPullC: '#0a4a48',
      colorPullD: '#020a0c',

      fieldBoundary: 0.14,
      fieldFill: 0.28,
      fieldFalloff: 7.0, // the middle is a hole with a hard lip
      fieldVeins: 1.2,
      fieldVeinScale: 3.4,
      fieldCrawl: -1.6,
      fieldRings: 1.4,
      fieldRingSpeed: -0.5,
      fieldSpokes: 8,
      fieldSpin: -0.02,
      colorField: '#128a80',
      colorFieldEdge: '#aef2e6',

      rimArcs: 4,
      rimSpeed: -0.6,
      rimHeight: 0.12,
      colorCore: '#d8fff4',
      colorInner: '#7fe6d8',
      colorOuter: '#12857c',
      colorHalo: '#02201d',

      sparkRate: 30,
      debrisRate: 20,
      debrisSpeed: 1.1,
      smokeRate: 90,

      lightIntensity: 7,
      lightRadius: 12,
      lightHeight: 0.85,
      lightColor: '#2fbfae',
      lightFlicker: 0.04,

      shockRadius: 4.5,
      burstSize: 2.2,
      burstIntensity: 2.6, // nothing for six seconds, then all of it at once
      burstSparks: 420,
      impactShake: 0.25,
      holdShake: 0.02,
      shakeDuration: 1.5,
      impactFlash: 0.34,
      colorBurstA: '#0a4a48',
      colorBurstB: '#2fbfae',
      colorBurstC: '#d8fff4',
      colorFlash: '#aef2e6'
    }),

    /**
     * NIGHTSHADE BLOOM — the Plasma Bloom opened at a tenth of the speed.
     *
     * Plasma is six short arms thrown out in under half a second and a core that
     * churns. This is four arms, each nearly twice as long, opening over a full
     * second with a quarter-second between them, and drooping almost to the
     * floor at the tips — the read is a night flower under its own weight rather
     * than a detonation. The core is small and cold-lit, the arcs are slow, and
     * the volume renderer runs sooty instead of clear so the petals occlude each
     * other where they cross.
     */
    nightshade: derive(plasma, {
      range: 17.0,
      zoneRadius: 5.0,
      speed: 34.0,
      snapTime: 0.45,
      lifetime: 5.6,
      fadeTime: 1.8,
      cooldown: 3.0,
      castAnim: 'cast3',

      coreSize: 0.62,
      coreHeight: 1.1, // it sits low, under its own arms
      corePulse: 0.34,
      corePulseSpeed: 1.1,
      coreTurbulence: 0.22,
      coreScale: 1.4,
      coreFlow: 0.35,
      coreBands: 2.0,
      coreRim: 3.6,
      coreGlow: 1.6,
      coreOpacity: 0.8,
      colorCoreA: '#2a0b4a',
      colorCoreB: '#7fe6a8',
      colorCoreC: '#eaffe4',

      petals: 4,
      petalSpan: 7.4, // metres of arc — nearly twice the Bloom's
      petalWidth: 0.95,
      petalLift: 1.2,
      petalCurve: 1.45, // holds the arc in, then lets it out at the tip
      petalStagger: 0.26,
      petalOpen: 1.05,
      petalDroop: 0.88, // the tips come almost all the way back down

      strands: 5,
      strandRadius: 1.15,
      strandWidth: 0.11,
      strandTilt: 0.35,
      strandSpeed: 0.4,
      strandSpan: 0.78,
      strandDim: 0.9,
      strandGlow: 1.2,
      colorStrandCore: '#eaffe4',
      colorStrandEdge: '#4fbf7a',
      colorStrandHalo: '#160a3a',

      trailWidth: 1.1,
      trailHeadSize: 0.8,
      trailPlume: 0.4,
      trailTurbulence: 0.9,
      trailWisps: 0.35,
      trailShred: 0.4,
      trailSpeed: 0.9,
      trailBuoyancy: -0.6, // the volume sinks with the petals
      trailDensity: 2.6,
      trailSoot: 2.4, // heavy absorption: the arms occlude where they cross
      trailCoreClarity: 0.25,
      trailGlow: 1.1,
      trailTempCore: 1.0,
      trailTempEdge: 0.35,
      trailPalette: 1.0, // gradient, not blackbody — nothing here is burning
      trailTailFade: 0.7,
      trailBurnout: 2.4,
      colorHot: '#eaffe4',
      colorFlameMid: '#3f9c6a',
      colorFlameEdge: '#2a1055',
      colorFlameSmoke: '#0a0418',

      fieldBoundary: 0.6,
      fieldFill: 0.22,
      fieldFalloff: 0.9,
      fieldVeins: 3.4,
      fieldVeinScale: 3.2,
      fieldRings: 1.2,
      fieldRingSpeed: 0.3,
      fieldSpokes: 40,
      fieldCore: 0.5,
      colorField: '#3f9c6a',
      colorFieldEdge: '#d6ffd0',

      emberRate: 90,
      emberRise: 0.4,
      emberGlow: 0.8,
      colorEmberA: '#d6ffd0',
      colorEmberB: '#4fbf7a',
      colorEmberC: '#2a1055',
      colorEmberD: '#080312',
      sparkRate: 60,
      sparkSpeed: 2.4,
      smokeRate: 180,
      smokeOpacity: 0.13,
      colorSmokeA: '#2c2440',
      colorSmokeB: '#171128',

      scorchRadius: 4.6,
      scorchIntensity: 0.75,
      colorScorch: '#070312',
      shockRadius: 5.0,
      colorShockA: '#3f9c6a',
      colorShockB: '#eaffe4',

      lightIntensity: 9,
      lightRadius: 15,
      lightColor: '#5fd08f',
      lightFlicker: 0.06,

      burstSize: 2.4,
      burstIntensity: 0.6,
      burstEmbers: 120,
      burstSparks: 80,
      impactShake: 0.3,
      shakeDuration: 1.4,
      impactFlash: 0.08,
      colorFlash: '#9fe6b8'
    }),

    /**
     * GRAVE BIND — the Voltaic Snare with the column taken out of it.
     *
     * The Snare's read is vertical: a nine-metre pillar of current standing in a
     * four-metre ring. This one never leaves the floor. The pillar drops to knee
     * height and three filaments, the tendril fan more than doubles and is flung
     * a third past the boundary, and the arcs crawl instead of racing — a web
     * pinned flat over a footprint half again as wide, holding twice as long.
     * The palette goes bone and verdigris, which is the other half of telling it
     * apart from the violet cage at a glance.
     */
    gravebind: derive(snare, {
      range: 19.0,
      zoneRadius: 6.6,
      speed: 40.0,
      snapTime: 0.42,
      lifetime: 5.8,
      fadeTime: 1.5,
      cooldown: 2.8,
      castAnim: 'cast3',

      leashStrands: 2,
      leashSag: -0.6,
      leashCling: 0.04,

      strands: 3, // what is left of the column
      height: 1.6,
      heightCurve: 0.55,
      throat: 0.42,
      columnSpread: 0.55,
      columnCurve: 0.7,
      columnFlare: 0.0,
      columnSpin: 0.18,
      columnWidth: 1.1,

      tendrils: 42, // the signature: it is almost entirely ground filament
      tendrilInner: 0.08,
      tendrilReach: 1.34, // they run out past the burnt band
      tendrilCurve: 0.72,
      tendrilWander: 2.4,
      tendrilArch: 0.18, // barely lifts off the floor
      tendrilHug: 0.002,
      tendrilSpin: -0.04,
      tendrilKink: 1.15,
      tendrilWidth: 1.05,
      tendrilDim: 1.0,

      rimArcs: 22,
      rimSpan: 0.12,
      rimSpeed: -0.28, // a crawl, not a race
      rimHeight: 0.16,
      rimJitter: 0.06,

      jitter: 1.5,
      jitterScale: 0.75,
      crawl: 0.7,
      restrike: 5, // it holds its shape — that is what makes it read as a web
      flicker: 0.1,
      flickerSpeed: 8,
      strandFlash: 0.18,

      width: 0.026,
      coreSharp: 5.6,
      glowWidth: 4.2,
      glowOpacity: 0.3,

      colorCore: '#f2ffe8',
      colorInner: '#bfe8c0',
      colorOuter: '#3f9c72',
      colorHalo: '#0a2a24',
      glow: 1.5,

      fieldBoundary: 0.34,
      fieldBoundaryGlow: 1.4,
      fieldFill: 0.42,
      fieldFalloff: 1.1, // the wash reaches the middle here
      fieldVeins: 4.2,
      fieldVeinScale: 3.6,
      fieldVeinSharp: 0.95,
      fieldWarp: 1.2,
      fieldCrawl: 0.12,
      fieldRings: 0.8,
      fieldRingSpeed: 0.25,
      fieldSpokes: 48,
      fieldSpin: -0.01,
      fieldCore: 0.35,
      fieldCoreSize: 0.5,
      colorField: '#3f9c72',
      colorFieldEdge: '#e8ffd8',

      arcRate: 8.0,
      arcRadius: 2.2,
      arcLife: 1.6,
      trailRate: 1.6,
      scorchRadius: 4.4,
      scorchLife: 11.0,
      colorArc: '#9fe8b4',
      colorEmber: '#3f9c72',
      colorScorch: '#08120c',
      shockRadius: 9.5,
      colorShockA: '#3f9c72',
      colorShockB: '#f2ffe8',

      sparkRate: 110,
      sparkSpeed: 4.0,
      colorSparkA: '#f2ffe8',
      colorSparkB: '#9fe8b4',
      colorSparkC: '#3f9c72',
      colorSparkD: '#0a2a24',
      updraftRate: 60,
      updraftSpeed: 1.4,
      updraftRise: 0.8,
      colorUpdraftA: '#3f9c72',
      colorUpdraftB: '#bfe8c0',
      colorUpdraftC: '#f2ffe8',
      colorUpdraftD: '#08201a',
      smokeRate: 150,
      smokeOpacity: 0.1,
      smokeRise: 0.25,
      debrisRate: 55,

      lightIntensity: 11,
      lightRadius: 21,
      lightHeight: 0.08, // the light sits on the floor with the web
      lightColor: '#7fd8a0',
      lightFlicker: 0.1,

      muzzleSize: 0.35,
      castFlash: 0.05,
      burstSize: 4.2,
      burstIntensity: 0.8,
      pulseRate: 0.4,
      ringRate: 0.5,
      impactShake: 0.45,
      holdShake: 0.02,
      impactFlash: 0.12,
      colorBurstA: '#3f9c72',
      colorBurstB: '#bfe8c0',
      colorBurstC: '#f2ffe8',
      colorFlash: '#bfe8c0'
    }),

    /**
     * DUSK WEAVE — the Storm Lance, slowed until the bolt becomes a fabric.
     *
     * Everything that makes the Lance read as lightning is the *stutter*: it
     * re-rolls its filaments twenty-four times a second, so the shape is never
     * the same two frames running. Drop `restrike` to four and the same bundle
     * stops flashing and starts hanging. On top of that the strand count goes to
     * the engine's ceiling, the fan opens to nearly two metres, the twist winds
     * the bundle into a rope, and the whole thing travels at a fifth of the
     * speed and holds ten times as long. Ash and dusk-violet, not blue-white.
     */
    duskweave: derive(thunder, {
      range: 20.0,
      minRange: 1.5,
      speed: 22.0, // you watch this one weave itself out to the target
      lifetime: 4.2,
      fadeTime: 1.8,
      cooldown: 2.6,
      castAnim: 'cast3',

      handHeight: 1.42,
      handForward: 0.42,
      handSide: 0.0,
      endHeight: 1.5,
      sag: -0.55, // it droops between the hand and the far end

      strands: 24, // the engine's ceiling — the bundle is the silhouette
      spread: 1.85,
      spreadNear: 0.35,
      spreadCurve: 0.65, // open at the hand already, not just at the far end
      twist: 2.4, // wound into a rope over its length
      twistSpeed: 0.12,
      branchDim: 0.95, // every filament reads, not just the spine

      jitter: 0.62,
      jitterScale: 0.35,
      octaves: 2,
      jitterFalloff: 0.8,
      crawl: 0.4,
      pinch: 0.05,
      converge: 0.25, // the far end fans out instead of pulling onto a point

      width: 0.02,
      widthTip: 1.4, // wider where it lands — a weave, not a spear
      widthCurve: 0.6,
      coreWidth: 0.9,
      coreSharp: 2.2,
      glowWidth: 8.5,
      glowFalloff: 1.4,
      glowOpacity: 0.62,

      restrike: 4, // the one number that turns lightning into fabric
      flicker: 0.08,
      flickerSpeed: 5,
      strandFlash: 0.12,
      tipGlow: 0.6,
      tipLength: 0.3,

      colorCore: '#f4ecff',
      colorInner: '#b49ce0',
      colorOuter: '#5a3f8c',
      colorHalo: '#1a0e33',
      glow: 1.2,
      opacity: 0.88,

      arcRate: 0.3,
      arcRadius: 2.6,
      arcLife: 2.2,
      arcIntensity: 0.5,
      arcBranches: 0.2,
      scorchRadius: 1.4,
      scorchLife: 10.0,
      scorchIntensity: 0.3,
      colorArc: '#c9b0f0',
      colorScorch: '#0a0712',
      colorEmber: '#8f6bd8',
      shockRadius: 4.0,
      colorShockA: '#5a3f8c',
      colorShockB: '#f4ecff',

      sparkRate: 45,
      sparkSize: 0.09,
      sparkSpeed: 2.6,
      sparkLifetime: 1.6,
      sparkGravity: -3.0,
      sparkStretch: 0.05,
      colorSparkA: '#f4ecff',
      colorSparkB: '#b49ce0',
      colorSparkC: '#5a3f8c',
      colorSparkD: '#150b28',
      moteRate: 260, // the ash the weave sheds while it hangs
      moteSize: 0.07,
      moteSpeed: 0.8,
      moteLifetime: 3.6,
      moteRise: 0.35,
      moteTurbulence: 1.4,
      colorMoteA: '#c9b0f0',
      colorMoteB: '#7a5ca8',
      colorMoteC: '#3a2a5c',
      colorMoteD: '#0c0818',
      smokeRate: 140,
      smokeSize: 1.5,
      smokeOpacity: 0.11,
      smokeRise: 0.3,
      debrisRate: 6,

      lightIntensity: 10,
      lightRadius: 19,
      lightColor: '#8f6bd8',
      lightFlicker: 0.06,
      lightFlickerSpeed: 4,

      muzzleSize: 0.9,
      muzzleIntensity: 0.8,
      castFlash: 0.05,
      colorMuzzleA: '#3a2a5c',
      colorMuzzleB: '#b49ce0',
      colorMuzzleC: '#f4ecff',
      colorCastFlash: '#b49ce0',
      burstSize: 2.0,
      burstIntensity: 0.6,
      burstSparks: 60,
      burstDebris: 10,
      impactShake: 0.3,
      shakeDuration: 1.6,
      impactFlash: 0.08,
      rumble: 0.01,
      colorBurstA: '#5a3f8c',
      colorBurstB: '#b49ce0',
      colorBurstC: '#f4ecff',
      colorFlash: '#b49ce0'
    }),
  };
}
