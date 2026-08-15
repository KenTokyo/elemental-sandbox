/**
 * signatures-ashfall.js — the Ashfall Legion, five of the twenty added in V3.2.
 *
 * The group built out of what is *left*: bone, charcoal, cooling clinker, grey
 * ash. It is the one place in the library where the particle systems carry more
 * of the read than the geometry does — every block below runs its smoke or dust
 * rate two to five times higher than its sibling, and every one dims its emissive
 * gain rather than raising it. Nothing here is bright; the read comes from
 * silhouette, weight and haze.
 *
 *   Ossuary Bind    ← Voltaic Snare    (SnareAbility)
 *   Cinder Veil     ← Permafrost Wake  (IceAbility)
 *   Pyreclast       ← Cinder Fall      (MeteorAbility)
 *   Sepulchre Rift  ← Magma Rift       (RiftAbility)
 *   Ash Maw         ← Gravity Well     (WellAbility)
 *
 * Three of these five derive from blocks that inherit the Cinder Fall's key set
 * and therefore have **no `colorBurst*` family** — they tint their shells
 * straight off the flame palette. `pyreclast` and `sepulcher` accordingly do not
 * set one; adding it would be a dead slider, not a fix.
 *
 * Same two rules as everywhere else: derive from the sibling that already runs
 * on the engine, and move silhouette, timing *and* palette. Where a value sits
 * on an engine ceiling the comment says so.
 */

import { derive } from './variants.js';
import { buildAshfallHollows } from './signatures-ashfall-hollows.js';

export function buildAshfallSignatures(settings) {
  // `magma` and `gravity` are destructured in the hollows module, not here.
  const { snare, permafrost, meteor } = settings;

  return {
    /* ================================================================== */
    /* ASHFALL LEGION                                                      */
    /* ================================================================== */

    /**
     * OSSUARY BIND — the cage rebuilt as a ribcage.
     *
     * The Voltaic Snare fills a 4.4 m circle with a column, twenty tendrils and
     * fourteen rim arcs, all of it re-striking twenty-one times a second. Grave
     * Bind flattens the same vocabulary into a wide web. This one throws almost
     * all of it away: **four** tendrils, **five** slow rim arcs, and the whole
     * budget spent on a column of sixteen filaments — `MAX_COLUMN` — three times
     * the normal width, climbing a throat half the footprint wide.
     *
     * `columnCurve` below one is what makes it a ribcage rather than a pillar:
     * the throat opens early, bellies out, and the flare pulls it back in at the
     * top. And `restrike` at 2 is the slowest in the library by an order of
     * magnitude — the filaments hold their shape and gutter instead of crackling,
     * which is the difference between current and bone.
     */
    ossuary: derive(snare, {
      range: 18.0,
      minRange: 0.0,
      zoneRadius: 2.6, // the smallest far-cast footprint in the library
      speed: 50.0,
      snapTime: 0.42,
      lifetime: 5.5,
      fadeTime: 1.5,
      cooldown: 2.4,
      castAnim: 'cast1',

      leashStrands: 1,
      leashSag: -0.6,
      leashSpread: 0.1,
      leashKink: 0.12,
      leashWidth: 1.4,
      leashCling: 0.05,

      strands: 16, // MAX_COLUMN — the cage is the whole ability
      height: 6.4,
      heightCurve: 0.7,
      throat: 0.5, // half the footprint wide where it leaves the floor
      columnSpread: 0.34,
      columnCurve: 0.55, // <1: it bellies out early, like a ribcage
      columnFlare: 1.15,
      columnTwist: 0.05,
      columnSpin: 0.12,
      columnKink: 0.06,
      columnWidth: 3.2,
      columnTaper: 1.9,

      tendrils: 4,
      tendrilInner: 0.3,
      tendrilReach: 0.9,
      tendrilCurve: 1.6,
      tendrilWander: 0.3,
      tendrilArch: 0.15,
      tendrilSpin: 0.04,
      tendrilKink: 0.1,
      tendrilWidth: 1.6,
      tendrilDim: 0.55,

      rimArcs: 5,
      rimSpan: 0.6,
      rimSpeed: 0.22,
      rimHeight: 0.2,
      rimJitter: 0.05,
      rimKink: 0.04,
      rimWidth: 1.4,
      rimDim: 0.7,

      jitter: 0.18,
      jitterScale: 0.5,
      octaves: 2,
      crawl: 0.3,
      pinch: 0.3,
      restrike: 2, // the slowest re-roll in the library: it holds its shape
      flicker: 0.55,
      flickerSpeed: 4,
      strandFlash: 0.7,

      width: 0.055,
      coreSharp: 2.2,
      glowWidth: 3.6,
      glowFalloff: 2.8,
      glowOpacity: 0.3,

      colorCore: '#fff4e0',
      colorInner: '#e0d2b4',
      colorOuter: '#a89070',
      colorHalo: '#2a1a0e',
      glow: 1.4,

      fieldBoundary: 0.5,
      fieldBoundaryGlow: 1.6,
      fieldFill: 0.4,
      fieldFalloff: 2.6,
      fieldVeins: 1.6,
      fieldVeinScale: 1.2,
      fieldVeinSharp: 0.85,
      fieldWarp: 0.3,
      fieldCrawl: 0.06,
      fieldRings: 1.2,
      fieldRingSpeed: 0.2,
      fieldSpokes: 8,
      fieldSpokeLength: 0.9,
      fieldSpin: 0.01,
      fieldCore: 0.8,
      fieldCoreSize: 0.34,
      colorField: '#8a7458',
      colorFieldEdge: '#fff0d8',

      arcRate: 1.2,
      arcRadius: 0.8,
      arcLife: 1.6,
      arcIntensity: 0.5,
      arcBranches: 0.25,
      trailRate: 0.4,
      scorchRadius: 1.4,
      scorchLife: 12.0,
      scorchIntensity: 0.8,
      colorArc: '#e0d2b4',
      colorEmber: '#c8a068',
      colorScorch: '#0d0a06',
      shockRadius: 4.5,
      colorShockA: '#a89070',
      colorShockB: '#fff4e0',

      sparkRate: 60,
      sparkSize: 0.09,
      sparkSpeed: 3.0,
      sparkLifetime: 1.2,
      sparkGravity: -6.0,
      colorSparkA: '#fff4e0',
      colorSparkB: '#e0d2b4',
      colorSparkC: '#a89070',
      colorSparkD: '#241a10',
      updraftRate: 90,
      updraftSize: 0.09,
      updraftSpeed: 2.4,
      updraftRise: 1.6,
      updraftLifetime: 2.2,
      colorUpdraftA: '#8a7458',
      colorUpdraftB: '#c8b090',
      colorUpdraftC: '#fff0d8',
      colorUpdraftD: '#1a140e',
      smokeRate: 180,
      smokeSize: 1.5,
      smokeLifetime: 3.4,
      smokeOpacity: 0.14,
      smokeRise: 0.35,
      colorSmokeA: '#6b6154',
      colorSmokeB: '#4a443a',
      colorSmokeC: '#302c26',
      colorSmokeD: '#181612',
      debrisRate: 45,
      debrisSpeed: 3.0,
      colorDebrisA: '#3a342c',
      colorDebrisB: '#2a251f',

      lightIntensity: 10,
      lightRadius: 14,
      lightHeight: 0.5,
      lightColor: '#c8b088',
      lightFlicker: 0.55,
      lightFlickerSpeed: 6,

      muzzleSize: 0.4,
      castFlash: 0.06,
      colorCastFlash: '#e0d2b4',
      burstSize: 2.2,
      burstIntensity: 0.8,
      burstSparks: 90,
      burstDebris: 90,
      pulseRate: 0.7,
      pulseSize: 1.6,
      pulseIntensity: 0.4,
      ringRate: 0.8,
      impactShake: 0.7,
      shakeDuration: 1.1,
      holdShake: 0.03,
      impactFlash: 0.12,
      rumble: 0.04,
      colorBurstA: '#a89070',
      colorBurstB: '#e0d2b4',
      colorBurstC: '#fff4e0',
      colorFlash: '#e0d2b4'
    }),

    /**
     * CINDER VEIL — the wake, burnt out.
     *
     * Permafrost Wake is already the widest field on this engine at 4.8 m; this
     * one goes to **six**, which makes it the widest line cast in the library,
     * and then takes the height down to a metre and the rubble fraction up to
     * 0.85. What stands is not a field of crystals, it is a *bed* — clinker,
     * four-sided and rough, almost all of it ankle height.
     *
     * The material is the Frost Lance's read inverted at every term: opacity 1.0,
     * `translucency` 0.05, `envIntensity` down to 0.45, `fracture` at 1.0 and
     * `veins` at 0.9 — but the veins are ember, not feather frost, so the crust
     * is dark with heat still moving in the cracks. `birthGlow` at 3.4 is the
     * highest in the library, because the one moment this thing is bright is the
     * instant a slab breaks the surface.
     *
     * Note this engine's blocks have no `fadeTime`: an ice field resolves through
     * `shatterDelay` and `sinkTime` instead.
     */
    cinderveil: derive(permafrost, {
      range: 19.0,
      minRange: 2.4,
      speed: 20.0,
      lifetime: 5.0,
      cooldown: 1.4,
      castAnim: 'cast2',

      widthNear: 2.4,
      width: 6.0, // the widest line cast in the library
      widthCurve: 0.7,
      spikeCount: 288, // MAX_SPIKES — a bed has to be continuous
      clumping: 0.8,
      scatter: 1.0,
      frontBias: 0.9,

      heightNear: 0.2,
      height: 1.05,
      heightCurve: 1.2,
      heightJitter: 0.85,
      crown: 0.9,
      peak: 1.0,
      peakWidth: 0.6,
      rubble: 0.85, // almost all of it is ankle-height wreckage
      rubbleScale: 0.55,

      radius: 0.62,
      radiusJitter: 0.9,
      taper: 0.72,
      facets: 4, // blocky clinker, not a prism
      roughness: 0.55,
      bend: 0.06,
      lean: 0.12,
      leanJitter: 2.0,
      twist: 1.0,

      riseTime: 0.22,
      riseOvershoot: 0.35,
      riseStagger: 0.4,
      settle: 0.7,
      shatterDelay: 1.0,
      sinkTime: 1.6,

      colorDeep: '#0a0806',
      colorIce: '#3a332e',
      colorRim: '#ff9a4c',
      colorCore: '#1a1512',
      opacity: 1.0,
      depthTint: 2.2,
      fresnel: 1.1,
      fresnelPower: 4.0,
      translucency: 0.05, // clinker does not transmit
      envIntensity: 0.45,
      facetSharp: 0.95,
      fracture: 1.0,
      fractureScale: 4.5,
      veins: 0.9, // ember veins, not feather frost
      veinScale: 2.2,
      glint: 0.3,
      glintScale: 18.0,
      glintSpeed: 1.6,
      frostLine: 0.15,
      glow: 0.9,
      edgeGlow: 2.2,
      birthGlow: 3.4, // the one bright moment: a slab breaking the surface
      birthFade: 1.2,

      frostSpread: 3.0,
      frostRate: 9.0,
      frostLife: 11.0,
      frostIntensity: 0.55,
      frostCrystals: 3.2,
      colorFrost: '#6b5c50',
      colorFrostEdge: '#241d18',
      shockRadius: 8.5,
      colorShockA: '#ff8a3c',
      colorShockB: '#ffd8a0',

      mistRate: 520, // the ash haze is most of the read
      mistSize: 2.1,
      mistSpeed: 0.8,
      mistLifetime: 5.0,
      mistOpacity: 0.11,
      mistRise: 0.45,
      colorMistA: '#8a7a6c',
      colorMistB: '#5c5048',
      colorMistC: '#3a322c',
      colorMistD: '#141110',
      shardRate: 120,
      shardSize: 0.09,
      shardSpeed: 3.5,
      shardLifetime: 2.0,
      shardGravity: -10.0,
      colorShardA: '#ff9a4c',
      colorShardB: '#8a5a34',
      colorShardC: '#3a2c22',
      colorShardD: '#151110',
      sparkleRate: 240,
      sparkleSize: 0.075,
      sparkleSpeed: 2.0,
      sparkleLifetime: 3.0,
      sparkleRise: 2.4,
      sparkleTurbulence: 1.2,
      colorSparkleA: '#ffd8a0',
      colorSparkleB: '#ff7a2c',
      colorSparkleC: '#8a3a10',
      colorSparkleD: '#1c0e06',

      lightIntensity: 10,
      lightRadius: 18,
      lightColor: '#ff8a3c',

      burstSize: 4.2,
      burstIntensity: 0.9,
      burstShards: 110,
      impactShake: 0.8,
      impactFlash: 0.14,
      shakeDuration: 1.4,
      rumble: 0.06,
      colorBurstA: '#8a5a34',
      colorBurstB: '#ff9a4c',
      colorBurstC: '#ffd8a0',
      colorFlash: '#ffb06a'
    }),

    /**
     * PYRECLAST — the heaviest thing thrown in the library.
     *
     * Rime Comet is a cold stone on a long arc, Tar Fall is a dense lump thrown
     * flat and fast. This is the *lob*: the largest rock on the engine (1.35 m
     * radius against the Cinder Fall's 0.8), thrown seven metres up, travelling
     * at eleven metres a second — the slowest projectile in the library — over
     * the shortest reach, because something this heavy does not go far.
     *
     * The rock is built as pumice: `craters` at twelve with a wide angular
     * radius, `cuts` down to four, `lumpScale` under one, so the surface is holes
     * rather than facets, and `spin` at 0.9 barely turns it. The trail is ash,
     * not flame — `trailSoot` 3.6 with `trailCoreClarity` at 0.2 means the volume
     * is almost entirely absorption at 1320 K.
     *
     * It resolves at the ceiling: twenty-eight chunks, `MAX_CHUNKS`, eight
     * fissure arms, and the heaviest impact shake in the library.
     *
     * `meteor` has no `colorBurst*` family — its shells tint off the flame
     * palette — so there is nothing to override.
     */
    pyreclast: derive(meteor, {
      range: 17.0, // the shortest reach on the engine: it is heavy
      minRange: 4.0,
      speed: 11.0, // ... and the slowest projectile in the library
      lifetime: 3.8,
      fadeTime: 2.4,
      cooldown: 2.2,
      castAnim: 'cast1',
      endHeight: 0.5,

      arc: 7.0, // the highest lob
      arcCurve: 1.5,

      radius: 1.35, // the largest rock on the engine
      facets: 3,
      lumpiness: 0.55,
      lumpScale: 0.8,
      surfaceRoughness: 0.42,
      cuts: 4,
      cutDepth: 0.14,
      craters: 12, // pumice: holes rather than facets
      craterDepth: 0.3,
      craterSize: 0.62,
      spin: 0.9,

      chargeCurve: 2.6,
      crackScale: 1.8,
      crackWidth: 0.03,
      crackBranches: 0.85,
      crackGlow: 1.1,
      crackFlow: 0.35,
      crackFlowSpeed: 0.4,
      rockScale: 2.2,
      facetTint: 0.75,
      cavity: 0.55,
      soot: 1.0,
      rimHeat: 0.35,
      leadGlow: 0.5,
      leadSharp: 4.0,
      glow: 0.5,
      envIntensity: 0.8,
      colorRock: '#6a6058',
      colorChar: '#141210',
      colorCrack: '#ff7a2c',
      colorHot: '#ffe0b0',

      trailSpan: 5.0,
      trailWidth: 1.5,
      trailHeadSize: 1.2,
      trailPlume: 2.4,
      trailWakeSpread: 1.1,
      trailRise: 1.4,
      trailBulge: 0.35,
      trailBulgeScale: 0.2,
      trailTurbulence: 2.0,
      trailWarp: 0.8,
      trailWisps: 0.4,
      trailShred: 0.7,
      trailSpeed: 1.4,
      trailBuoyancy: 2.6,
      trailDetachment: 1.3,
      trailDensity: 1.9,
      trailSoot: 3.6, // ash is almost all absorption
      trailCoreClarity: 0.2,
      trailGlow: 1.1,
      trailOpacity: 0.94,
      trailTempCore: 1320,
      trailTempEdge: 1050,
      trailPalette: 0.85,
      trailTailFade: 0.25,
      trailBurnout: 2.4,
      trailSteps: 32,
      colorFlameMid: '#c8804c',
      colorFlameEdge: '#6b4028',
      colorFlameSmoke: '#1a1614',

      chunkCount: 28, // MAX_CHUNKS — it comes apart completely
      chunkScale: 0.22,
      chunkSpeed: 9.5,
      chunkForward: 0.35,
      chunkLoft: 1.5,
      chunkGravity: -15.0,
      chunkSpin: 8.0,
      chunkCool: 4.5,
      chunkLinger: 1.2,
      chunkSink: 1.6,

      fissureRadius: 6.5,
      fissureLife: 9.0,
      fissureArms: 8,
      fissureWander: 2.2,
      fissureBranches: 0.9,
      fissureWidth: 0.22,
      fissureHeat: 1.1,
      fissurePulse: 0.6,
      fissureGrowth: 7.0,
      fissureRockSize: 0.42,

      scorchRadius: 4.4,
      scorchLife: 11.0,
      scorchIntensity: 1.0,
      colorScorch: '#0a0806',
      shockRadius: 8.5,
      colorShockA: '#c8804c',
      colorShockB: '#ffe0b0',

      emberRate: 240,
      emberSize: 0.13,
      emberRise: 2.8,
      emberLifetime: 2.4,
      emberGlow: 0.9,
      colorEmberA: '#ffe0b0',
      colorEmberB: '#ff8a3c',
      colorEmberC: '#8a3a10',
      colorEmberD: '#1c1210',
      sparkRate: 90,
      sparkSpeed: 5.0,
      colorSparkA: '#ffe0b0',
      colorSparkB: '#e8a86a',
      colorSparkC: '#a05a24',
      colorSparkD: '#241812',
      smokeRate: 260,
      smokeSize: 2.0,
      smokeLifetime: 4.5,
      smokeOpacity: 0.2,
      smokeRise: 1.4,
      colorSmokeA: '#7a6a5c',
      colorSmokeB: '#4a4038',
      colorSmokeC: '#2a2420',
      colorSmokeD: '#141110',
      debrisSize: 0.09,
      debrisSpeed: 7.0,

      lightIntensity: 14,
      lightRadius: 17,
      lightColor: '#ff8a3c',
      lightFlicker: 0.35,
      lightFlickerSpeed: 9,

      muzzleSize: 0.0,
      castFlash: 0.06,
      colorCastFlash: '#e8a86a',
      burstSize: 5.6,
      burstIntensity: 1.2,
      burstTurbulence: 3.0,
      burstEmbers: 340,
      burstSparks: 140,
      burstDebris: 160,
      burstSmoke: 180,
      impactShake: 2.0, // the heaviest impact in the library
      shakeDuration: 1.8,
      impactFlash: 0.24,
      rumble: 0.05,
      colorFlash: '#e8a86a'
    }),

    // Sepulchre Rift and Ash Maw live in `signatures-ashfall-hollows.js`; the
    // five blocks of this group did not fit one file under the 800-line rule.
    ...buildAshfallHollows(settings)
  };
}
