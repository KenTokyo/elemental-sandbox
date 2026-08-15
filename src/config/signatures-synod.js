/**
 * signatures-synod.js — the Indigo Synod, five of the twenty added in V3.3.
 *
 * The library's one *deep blue*. Everything cold in the sixty before it was
 * cyan — the Frost Lance, the Glacial Crown, the whole Hoarfrost Reliquary sit
 * between `#5fd0ff` and `#9fdcf2` — and everything violet belonged to the
 * Stormglass Ascendancy. This group takes the band nobody had: cobalt and lapis
 * against glazed porcelain white, with cold silver as the only neutral and not
 * one warm accent anywhere. Nothing here is ice and nothing here is electricity;
 * it is *ceramic and stone*, and the material numbers say so — `body` up,
 * `dispersion` down, `envIntensity` and `specular` up, `translucency` gone.
 *
 *   Porcelain Font   ← Glacial Crown   (GlacierAbility)
 *   Azurite Horn     ← Storm Lance     (ThunderAbility)
 *   Indigo Vespers   ← Celestial Rain  (RainAbility)
 *   Lapis Gyre       ← Gravity Well    (WellAbility)
 *   Cobalt Obelisk   ← Voltaic Snare   (SnareAbility)
 *
 * The rule that governs every number below is the one from `variants.js`, now in
 * its strictest form: a signature has to differ from **every** sibling already
 * running on its engine, not just from the block it derives from. By V3.3 the
 * Glacier engine carries six ids and the Beam engine nine, so "different from
 * the base" is no longer enough to be a different ability. Each doc comment
 * therefore names the siblings it is being held apart from, and the axis it
 * moved along to get there. Where a value sits on an engine ceiling the comment
 * says so, because a number above the cap is silently clamped.
 */

import { derive } from './variants.js';
import { buildSynodDescents } from './signatures-synod-descents.js';

export function buildSynodSignatures(settings) {
  // `rain` and `gravity` are destructured in the descents module, not here.
  const { glacier, thunder, snare } = settings;

  return {
    /* ================================================================== */
    /* INDIGO SYNOD                                                        */
    /* ================================================================== */

    /**
     * PORCELAIN FONT — the crown folded inward over a filled middle.
     *
     * Every glacier in the library so far keeps its centre clear or nearly so:
     * `coreShare` runs 0, 0, 0.12, 0.18 and 0.22 across the Crown, Prism
     * Cascade, Tidal Prism, Quartz Bastion and Stormglass Bastion, because the
     * read of a ring is the hole in it. This one fills it — `coreShare` 0.42,
     * the fullest middle on the engine — and then leans the ring the *other*
     * way: `ringLean` −0.62, folded in over the core rather than splayed out.
     * What stands is a basin.
     *
     * The plates are the other half. `facets` 3 makes a triangular section, the
     * only one on the engine (the others run 4 to 8), and `taper` 0.95 keeps
     * them parallel-sided, so ninety-six wide flat slabs overlap into a glaze
     * rather than reading as ninety-six blades. `heightJitter` 0.18 is the
     * lowest on the engine on purpose: a thrown vessel is regular.
     *
     * Timing inverts the Crown completely. It takes almost a second to rise
     * (0.95 against 0.2), holds nearly seven, and then does not shatter for four
     * — `shatterDelay` 4.0 — before sinking over three seconds, the slowest exit
     * on the engine.
     *
     * No `fadeTime` here: the Crown's block does not own one. A glacier resolves
     * through `shatterDelay` → `shatterStagger` → `sinkTime`, and a key the base
     * does not have would be a slider no engine reads.
     */
    porcelain: derive(glacier, {
      range: 19.0,
      minRange: 0.0,
      zoneRadius: 3.2, // the smallest glacier footprint in the library
      speed: 40.0,
      snapTime: 0.3,
      lifetime: 6.8,
      shatterDelay: 4.0, // it stands almost the whole cast before it goes
      shatterStagger: 1.2,
      sinkTime: 3.0, // ... and the slowest sink on the engine
      cooldown: 2.4,
      castAnim: 'cast3',

      spikeCount: 96, // few, because each one is a slab
      density: 1.0,
      ringShare: 0.48,
      coreShare: 0.42, // the fullest middle on the engine
      lateShare: 0.05,
      ringSeat: 1.0,
      ringScatter: 0.06,
      skirtSeat: 0.6,
      skirtBand: 0.3,
      skirtBias: 1.2,
      coreSpread: 0.5,

      ringHeight: 1.9,
      ringWave: 0.15,
      skirtHeight: 0.8,
      coreHeight: 2.4, // a basin, not a spire — every other glacier runs 4.4–7.6
      heightJitter: 0.18, // a thrown vessel is regular
      ringLean: -0.62, // folded inward over the core
      skirtLean: -0.3,
      coreLean: 0.0,
      leanJitter: 0.2,
      fan: 0.2,
      twist: 0.15,
      rubble: 0.06,
      rubbleScale: 0.5,

      radius: 0.66,
      radiusJitter: 0.3,
      taper: 0.95, // parallel-sided slabs
      facets: 3, // the only triangular section on the engine
      roughness: 0.0,
      bend: 0.0,

      riseTime: 0.95, // it is thrown on a wheel, not erupted
      riseOvershoot: 0.0,
      settle: 0.9,
      sweepTime: 1.1,
      skirtDelay: 0.25,
      skirtWave: 0.1,
      coreDelay: 0.5,
      stagger: 0.02,
      bloomSpread: 0.4,

      colorGlass: '#0a1330',
      colorEdge: '#eef4ff',
      colorPrismA: '#2f6bd8',
      colorPrismB: '#b6c6e2',
      colorCore: '#dfe8ff',
      colorTip: '#f4f8ff',
      body: 2.9, // glaze is thick — there is no empty glass here
      edgePower: 1.6,
      edgeGain: 0.7,
      dispersion: 0.18, // a glaze does not split light
      pipe: 0.4,
      tipBias: 0.6,
      bands: 0.8,
      pulseSpeed: 0.25,
      tipStart: 0.85,
      tipGlow: 0.9,
      stria: 0.35,
      striaScale: 3.0,
      envIntensity: 2.2, // ... it reflects instead
      specular: 5.2,
      glow: 0.55,
      opacity: 1.0,
      birthGlow: 1.0,
      birthFade: 1.4,

      frontRough: 0.1,
      frontWidth: 0.2,
      frontGlow: 1.6,
      shatterScale: 4.0, // it breaks into a few large sherds
      shatterEdge: 0.14,
      shatterGlow: 1.8,

      fieldBoundary: 0.55,
      fieldBoundaryGlow: 1.6,
      fieldFill: 0.3,
      fieldFalloff: 0.9, // <1: the wash gathers in the middle, under the core
      fieldPlates: 1.6,
      fieldPlateScale: 1.4,
      fieldSeam: 1.2, // crazing
      fieldFingers: 0.2,
      fieldFingerScale: 1.0,
      fieldWarp: 0.15,
      fieldCrawl: 0.03,
      fieldRings: 3.0,
      fieldRingSpeed: -0.18,
      fieldSweep: 0.2,
      fieldSweepSpeed: 0.06,
      fieldCore: 1.4,
      fieldCoreSize: 0.3,
      fieldPulse: 0.1,
      fieldPulseSpeed: 0.7,
      colorField: '#2f6bd8',
      colorFieldEdge: '#eef4ff',

      veil: 0.15,
      veilHeight: 1.0,
      veilRadius: 0.94,
      veilFlare: 0.05,
      veilFlow: 0.06,
      veilErode: 0.3,
      colorVeil: '#c8d8f8',
      colorVeilCrest: '#eef4ff',

      frostSpread: 1.1,
      frostLife: 10.0,
      frostIntensity: 0.4,
      frostCrystals: 1.0,
      frostCollar: 1.2,
      rimeRate: 1.2,
      colorFrost: '#d8e4ff',
      colorFrostEdge: '#5f78a8',
      shockRadius: 5.0,
      ringRate: 0.5,
      colorShockA: '#2f6bd8',
      colorShockB: '#eef4ff',

      mistRate: 120,
      mistSize: 1.2,
      mistOpacity: 0.03,
      mistRise: 0.12,
      colorMistA: '#e4ecff',
      colorMistB: '#a8bce0',
      colorMistC: '#4f628c',
      colorMistD: '#080e20',
      shardSize: 0.07,
      shardSpeed: 5.0,
      breachShards: 2,
      shatterShards: 9,
      colorShardA: '#eef4ff',
      colorShardB: '#8fa8d8',
      colorShardC: '#2f4a80',
      colorShardD: '#080e20',
      glitterRate: 130,
      glitterSize: 0.035,
      glitterRise: 0.6,
      glitterGlow: 1.1,
      colorGlitterA: '#f4f8ff',
      colorGlitterB: '#b6c6e2',
      colorGlitterC: '#2f6bd8',
      colorGlitterD: '#0a1330',
      snowRate: 0, // nothing falls off a glazed rim

      lightIntensity: 12,
      lightRadius: 14,
      lightHeight: 0.3,
      lightColor: '#5f8fe8',

      muzzleSize: 0.4,
      castFlash: 0.05,
      colorCastFlash: '#c8d8f8',
      burstSize: 2.8,
      burstIntensity: 0.8,
      burstShards: 70,
      burstMist: 40,
      burstGlitter: 60,
      vapourRate: 0.5,
      impactShake: 0.5,
      shakeDuration: 1.6,
      holdShake: 0.008,
      impactFlash: 0.12,
      rumble: 0.02,
      colorBurstA: '#2f6bd8',
      colorBurstB: '#c8d8f8',
      colorBurstC: '#eef4ff',
      colorFlash: '#dfe8ff'
    }),

    /**
     * AZURITE HORN — the bundle turned back to front.
     *
     * *Rebuilt in V3.4.* The first cut of this block chased "thinnest filament
     * in the library" — eighteen strands at `width` 0.012 with `glowWidth` 3.0,
     * held across twenty-seven metres. Every one of those numbers is the wrong
     * side of legible: a 12 mm cord at 27 m is a sub-pixel line, eighteen of
     * them inside a 0.28 spread alias into each other, and the lowest glow on
     * the engine took away the one thing that could have carried it. It read as
     * static, which is why it went back on the bench.
     *
     * What was actually free on this engine is not a *width*, it is a
     * *direction*. Storm Lance, Dusk Weave, Tempest Fan and Fulminate Whip all
     * open downrange: `spreadNear` runs 0.0–0.55 and `spread` 0.0–3.4, so every
     * bolt in the library is narrow in the hand and wide at the far end. This
     * one inverts it — `spreadNear` 0.95 against `spread` 0.10 — and it is the
     * only block on the engine that does. Seven cords leave the hand as a wide
     * flare and gather to a single point on the target, so the silhouette is a
     * horn, read from its mouth.
     *
     * The rest is spent on making that shape survive at distance rather than on
     * making it fine. `width` 0.055 is the second-heaviest filament here,
     * `glowWidth` 6.8 the second-widest halo, and `converge` 0.95 with
     * `jitterFalloff` 0.85 keeps the noise in the wide end so the point stays
     * clean — a horn is only a horn if its tip is sharp.
     */
    azurite: derive(thunder, {
      range: 20.0,
      minRange: 2.5,
      speed: 88.0,
      lifetime: 1.2,
      fadeTime: 0.6,
      cooldown: 1.4,
      castAnim: 'cast3',

      handHeight: 1.34,
      handForward: 0.62,
      handSide: 0.1,
      endHeight: 0.9,
      sag: -0.18, // pulled taut: the mouth is held open

      strands: 7,
      spread: 0.1, // ... and closes to a point downrange
      spreadNear: 0.95, // the only bolt in the library that is widest at the hand
      spreadCurve: 0.75, // it narrows early and stays narrow
      converge: 0.95,
      twist: 0.55,
      twistSpeed: 1.3,
      branchDim: 0.8, // all seven cords carry, so the flare stays even

      jitter: 0.4,
      jitterScale: 1.1,
      octaves: 3,
      jitterFalloff: 0.85, // the noise lives in the wide end, not on the point
      crawl: 2.4,
      pinch: 0.12,

      width: 0.055, // heavy enough to survive twenty metres
      widthTip: 0.3, // ... and tapered into the gather
      widthCurve: 1.9,
      coreWidth: 1.4,
      coreSharp: 3.2,
      glowWidth: 6.8, // the halo does the reading at distance
      glowFalloff: 2.4,
      glowOpacity: 0.5,
      softFade: 0.7,

      restrike: 11,
      flicker: 0.16,
      flickerSpeed: 7,
      strandFlash: 0.34,
      tipGlow: 3.4, // the gathered point is the brightest thing on the cast
      tipLength: 0.2,

      colorCore: '#eef4ff',
      colorInner: '#8fb4ff',
      colorOuter: '#1f4fc8',
      colorHalo: '#050b1c',
      glow: 2.9, // was 1.7 — the dimmest bolt in a group that is already dark
      opacity: 1.0,

      arcRate: 0.25,
      arcRadius: 0.7,
      arcLife: 1.6,
      arcIntensity: 0.4,
      arcBranches: 0.15,
      scorchRadius: 0.2,
      scorchLife: 9.0,
      scorchIntensity: 0.3,
      colorArc: '#8fb4ff',
      colorScorch: '#060a16',
      colorEmber: '#2f6bd8',
      shockRadius: 3.5,
      colorShockA: '#2f6bd8',
      colorShockB: '#eef4ff',

      sparkRate: 45,
      sparkSize: 0.05,
      sparkSpeed: 2.2,
      sparkLifetime: 1.6,
      sparkGravity: -3.0,
      sparkStretch: 0.08,
      colorSparkA: '#eef4ff',
      colorSparkB: '#b6c6e2',
      colorSparkC: '#2f6bd8',
      colorSparkD: '#080f28',
      moteRate: 180, // the air around the wire is the second read
      moteSize: 0.04,
      moteSpeed: 0.5,
      moteLifetime: 3.4,
      moteRise: 0.35,
      moteTurbulence: 0.25,
      colorMoteA: '#f4f8ff',
      colorMoteB: '#8fb4ff',
      colorMoteC: '#1f4fc8',
      colorMoteD: '#050b1c',
      smokeRate: 0, // nothing burns
      debrisRate: 0,

      lightIntensity: 14,
      lightRadius: 22,
      lightColor: '#4f7fe0',
      lightFlicker: 0.06,
      lightFlickerSpeed: 4,

      muzzleSize: 0.28,
      muzzleIntensity: 1.2,
      castFlash: 0.06,
      colorMuzzleA: '#1f4fc8',
      colorMuzzleB: '#8fb4ff',
      colorMuzzleC: '#eef4ff',
      colorCastFlash: '#b6c6e2',
      burstSize: 1.2,
      burstIntensity: 0.7,
      burstSparks: 60,
      burstDebris: 0,
      impactShake: 0.2,
      shakeDuration: 0.5,
      impactFlash: 0.1,
      rumble: 0.0,
      colorBurstA: '#1f4fc8',
      colorBurstB: '#8fb4ff',
      colorBurstC: '#eef4ff',
      colorFlash: '#b6c6e2'
    }),

    /**
     * COBALT OBELISK — the snare with nothing around it.
     *
     * *Rebuilt in V3.4.* The first cut was a trellis: ten straight bars with
     * twelve near-complete hoops (`rimSpan` 0.98) stacked up them at `rimHeight`
     * 2.6. On paper that is joinery. On screen it is twenty-two overlapping
     * curves inside one 3.8 m circle, all the same weight and all the same
     * colour, and the hoops read as ringing artefacts around the bars rather
     * than as structure. Density was doing the work that shape should have been
     * doing.
     *
     * So the hoops are gone: **`rimArcs` 0**, and no other snare in the library
     * comes near it — Voltaic Snare runs fourteen, Grave Bind twenty-two,
     * Ossuary Bind five. Together with `tendrils` 0, already inherited from the
     * first cut, that leaves this as the only block on the engine with *nothing*
     * but its columns. The whole ability is six members and the floor they stand
     * on.
     *
     * Given six, each one can be worth looking at. `columnWidth` 4.2 is the
     * heaviest on the engine by a third, `width` 0.075 the thickest filament,
     * and `columnTaper` 3.4 — against 1.09, 1.09 and 1.9 elsewhere — pulls them
     * from a heavy foot to a point seven metres up. `throat` 0.30 gathers them
     * off the boundary and `columnCurve` 1.7 bows them inward on the way, so six
     * blades lean together into a spire instead of standing in a fence.
     */
    cobalt: derive(snare, {
      range: 19.0,
      minRange: 0.0,
      zoneRadius: 2.4, // the tightest snare footprint: this is one object
      speed: 44.0,
      snapTime: 0.5,
      lifetime: 6.0,
      fadeTime: 1.6,
      cooldown: 2.8,
      castAnim: 'cast3',

      leashStrands: 2,
      leashSag: -0.15,
      leashSpread: 0.08,
      leashKink: 0.06,
      leashWidth: 1.1,
      leashCling: 0.04,

      strands: 6, // six members, and nothing else in the air
      height: 7.2,
      heightCurve: 1.35,
      throat: 0.3, // gathered well off the boundary
      columnSpread: 0.05,
      columnCurve: 1.7, // ... and bowed inward on the way up
      columnFlare: 0.0, // the top never opens out
      columnTwist: 0.05,
      columnSpin: 0.05,
      columnKink: 0.0,
      columnWidth: 4.2, // the heaviest member on the engine
      columnTaper: 3.4, // ... and the hardest taper: a heavy foot to a point

      tendrils: 0, // nothing crawls outward — this is a built object
      tendrilInner: 0.0,
      tendrilReach: 1.0,
      tendrilDim: 0.5,

      rimArcs: 0, // the only snare in the library with no rim at all
      rimSpan: 0.2,
      rimSpeed: 0.08,
      rimHeight: 0.2,
      rimJitter: 0.0,
      rimKink: 0.0,
      rimWidth: 1.2,
      rimDim: 0.85,

      jitter: 0.1,
      jitterScale: 0.5,
      octaves: 2,
      jitterFalloff: 0.3,
      crawl: 0.2,
      pinch: 0.05,
      restrike: 12,
      flicker: 0.1,
      flickerSpeed: 5,
      strandFlash: 0.2,

      width: 0.075, // the thickest filament on the engine
      coreSharp: 2.6,
      glowWidth: 4.2,
      glowFalloff: 2.6,
      glowOpacity: 0.4,
      softFade: 0.8,

      colorCore: '#eef4ff',
      colorInner: '#8fb4ff',
      colorOuter: '#1f4fc8',
      colorHalo: '#050b1c',
      glow: 2.4,

      fieldBoundary: 0.62, // the band the bars stand on, drawn thick
      fieldBoundaryGlow: 1.8,
      fieldFill: 0.14,
      fieldFalloff: 2.8,
      fieldVeins: 0.5,
      fieldVeinScale: 0.8,
      fieldVeinSharp: 0.9,
      fieldWarp: 0.1,
      fieldCrawl: 0.02,
      fieldRings: 4.0,
      fieldRingSpeed: 0.12,
      fieldSpokes: 6, // one spoke per member
      fieldSpokeLength: 1.0,
      fieldSpin: 0.0,
      fieldCore: 0.5,
      fieldCoreSize: 0.16,
      colorField: '#2f6bd8',
      colorFieldEdge: '#eef4ff',

      arcRate: 0.8,
      arcRadius: 1.1,
      arcLife: 1.8,
      arcIntensity: 0.4,
      arcBranches: 0.1,
      trailRate: 0.2,
      scorchRadius: 1.0,
      scorchLife: 12.0,
      scorchIntensity: 0.5,
      colorArc: '#8fb4ff',
      colorEmber: '#2f6bd8',
      colorScorch: '#060a16',
      shockRadius: 4.0,
      colorShockA: '#2f6bd8',
      colorShockB: '#eef4ff',

      sparkRate: 50,
      sparkSize: 0.06,
      sparkSpeed: 2.0,
      sparkLifetime: 1.4,
      sparkGravity: -4.0,
      colorSparkA: '#eef4ff',
      colorSparkB: '#b6c6e2',
      colorSparkC: '#2f6bd8',
      colorSparkD: '#080f28',
      updraftRate: 120,
      updraftSize: 0.06,
      updraftSpeed: 1.2,
      updraftRise: 2.6,
      updraftLifetime: 3.0,
      updraftTurbulence: 0.3,
      colorUpdraftA: '#1f4fc8',
      colorUpdraftB: '#8fb4ff',
      colorUpdraftC: '#eef4ff',
      colorUpdraftD: '#050b1c',
      smokeRate: 0,
      debrisRate: 0,

      lightIntensity: 18,
      lightRadius: 16,
      lightHeight: 1.2, // lit from inside the cage, not from the floor
      lightColor: '#4f7fe0',
      lightFlicker: 0.08,
      lightFlickerSpeed: 5,

      muzzleSize: 0.35,
      castFlash: 0.05,
      colorCastFlash: '#b6c6e2',
      burstSize: 2.0,
      burstIntensity: 0.7,
      burstSparks: 70,
      burstDebris: 0,
      pulseRate: 0.4,
      pulseSize: 2.0,
      pulseIntensity: 0.3,
      ringRate: 0.5,
      impactShake: 0.5,
      shakeDuration: 1.2,
      holdShake: 0.01,
      impactFlash: 0.1,
      rumble: 0.015,
      colorBurstA: '#1f4fc8',
      colorBurstB: '#8fb4ff',
      colorBurstC: '#eef4ff',
      colorFlash: '#c8d8f8'
    }),

    // Indigo Vespers and Lapis Gyre live in `signatures-synod-descents.js` — the
    // two blocks of this group that bring something down out of the air. Split
    // ahead of time under the 800-line rule in `AGENTS.md`, not after the fact.
    ...buildSynodDescents(settings)
  };
}
