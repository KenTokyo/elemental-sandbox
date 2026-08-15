/**
 * variants-ether.js — the three Wild Ether signatures that land once.

 * Verdant Rupture, Sandstorm Coil and Tidal Sweep: each resolves on a single
 * impact, and each comes off a different base block. The group's other two are
 * repeat casts and live in `variants-ether-rhythms.js` — Wild Ether is the one
 * picker group that needs two files, because its five together are past the
 * line limit. Splitting it along "lands once" and "keeps beating" was the only
 * cut through the group that names something real.
 *
 * Split out of `variants.js` under the 800-line rule in `AGENTS.md`; not one
 * number changed on the way out. Every block below derives from a *base* block —
 * one of the six written longhand in `blocks-*.js` — which is handed in rather
 * than imported, because `buildVariants` runs against the live `settings`
 * object and a derivation reads it after the six are already in place.
 */
import { derive } from './derive.js';

export function buildEther({ ice, meteor, glacier, snareField }) {
  return {
    /* ================================================================== */
    /* WILD ETHER                                                          */
    /* ================================================================== */

    /**
     * VERDANT RUPTURE — the Frost Lance's engine grown instead of frozen. The
     * geometry generator's `bend` and `taper` are pushed to where a prism stops
     * being a crystal and becomes a thorn: long, curved, needle-tipped and
     * leaning hard away from the caster, in a field that flares late and peaks
     * violently at the far end.
     */
    verdant: derive(ice, {
      range: 16.0,
      minRange: 2.5,
      speed: 29.0,
      lifetime: 4.6,
      cooldown: 1.0,
      castAnim: 'cast1',

      widthNear: 0.45,
      width: 3.0,
      widthCurve: 1.25,
      spikeCount: 215,
      clumping: 1.55,
      scatter: 0.75,
      frontBias: 0.78,

      heightNear: 0.55,
      height: 3.8,
      heightCurve: 1.55,
      heightJitter: 0.8,
      crown: 0.4,
      peak: 1.65,
      peakWidth: 0.3,
      rubble: 0.34,
      rubbleScale: 0.26,

      radius: 0.28,
      radiusJitter: 1.05,
      taper: 0.05, // thorns
      facets: 5,
      roughness: 0.52,
      bend: 1.35, // the single control that turns a spike into a vine
      lean: 0.72,
      leanJitter: 1.9,
      twist: 1.0,

      riseTime: 0.24,
      riseOvershoot: 0.42,
      riseStagger: 0.15,
      settle: 0.62,
      shatterDelay: 0.9,
      sinkTime: 1.4,

      colorDeep: '#0e2c14',
      colorIce: '#5cb955',
      colorRim: '#dcff9a',
      colorCore: '#8dff63',
      opacity: 1.0,
      depthTint: 1.65,
      fresnel: 1.6,
      fresnelPower: 2.0,
      translucency: 2.3,
      envIntensity: 0.5,
      facetSharp: 0.5,
      fracture: 0.28,
      fractureScale: 4.0,
      veins: 0.95,
      veinScale: 5.2,
      glint: 0.35,
      glintScale: 22.0,
      frostLine: 0.75, // moss gathers where it left the ground
      glow: 0.95,
      edgeGlow: 0.9,
      birthGlow: 2.2,

      frostSpread: 1.7,
      frostRate: 4.2,
      frostLife: 9.0,
      frostIntensity: 0.9,
      frostCrystals: 2.6,
      colorFrost: '#6d9c3c',
      colorFrostEdge: '#22381c',
      shockRadius: 5.5,
      colorShockA: '#a6ff5c',
      colorShockB: '#f2ffd6',

      mistRate: 180,
      mistOpacity: 0.045,
      mistRise: 0.5,
      colorMistA: '#e8ffc4',
      colorMistB: '#a8dd7c',
      colorMistC: '#4f7a3a',
      colorMistD: '#0c2410',
      shardRate: 170,
      shardSize: 0.09,
      colorShardA: '#dcff9a',
      colorShardB: '#6db83f',
      colorShardC: '#2f5c22',
      colorShardD: '#122a12',
      sparkleRate: 200,
      sparkleSize: 0.06,
      sparkleRise: 1.9,
      colorSparkleA: '#f4ffd0',
      colorSparkleB: '#9dff6a',
      colorSparkleC: '#4fbf3c',
      colorSparkleD: '#0a2410',

      lightIntensity: 8,
      lightRadius: 13,
      lightColor: '#8bff6a',

      burstSize: 3.4,
      burstIntensity: 0.9,
      burstShards: 120,
      impactShake: 0.75,
      shakeDuration: 0.8,
      impactFlash: 0.12,
      rumble: 0.05,
      colorBurstA: '#8dff63',
      colorBurstB: '#dcff9a',
      colorBurstC: '#f6ffe4',
      colorFlash: '#dcff9a'
    }),

    /**
     * SANDSTORM COIL — the Shard Cyclone's engine loaded with rock instead of
     * glass. Everything that made the cyclone sharp is inverted: it turns slower
     * and heavier, the cone is squatter and much wider, the debris is opaque
     * stone rather than blades, and the volume renderer hangs a wall of dust in
     * the middle of it so the column *occludes* rather than sparkles.
     *
     * The two share `CycloneAbility`, so they also share its three canonical
     * particle roles rather than the families of the blocks they were derived
     * from — one engine cannot read `mist*` on one element and `smoke*` on the
     * other. `dust*` is the haze that occludes, `mote*` the additive glints,
     * `grit*` the solid chips; `shardMaterial` picks glass or stone and
     * `funnelVolume` decides whether the raymarched column is drawn at all.
     */
    sandstorm: derive(meteor, {
      ...snareField,
      range: 18.0,
      minRange: 0.0,
      zoneRadius: 5.4,
      speed: 40.0,
      snapTime: 0.4,
      lifetime: 5.2,
      fadeTime: 1.4,
      cooldown: 2.1,
      castAnim: 'cast2',

      funnelHeight: 6.0,
      funnelBase: 0.45,
      funnelTop: 1.0,
      funnelCurve: 1.05, // a squat cone, near enough a cylinder
      funnelLean: 0.2,

      spin: 0.85, // heavy and slow
      spinFalloff: 0.72,
      spinJitter: 0.45,
      climb: 0.32,
      climbJitter: 0.9,

      shardCount: 140,
      density: 1.0,
      shardScale: 0.3,
      shardScaleJitter: 0.85,
      tumble: 5.5,
      wobble: 0.55,
      wobbleScale: 1.1,

      strands: 18,
      strandWidth: 0.085,
      strandTurns: 0.9,
      strandSpeed: 0.7,
      strandJitter: 0.55,
      strandDim: 0.85,
      strandGlow: 0.9,
      colorStrandCore: '#f0dcb4',
      colorStrandEdge: '#b8895a',
      colorStrandHalo: '#3d2a17',

      radius: 0.36,
      facets: 3,
      lumpiness: 0.34,
      surfaceRoughness: 0.3,
      cuts: 7,
      craters: 3,
      colorRock: '#8a7350',
      colorChar: '#3a2c1c',
      colorCrack: '#c98a3c',
      colorHot: '#f2dfae',
      crackGlow: 0.35, // hot sand, not lava
      crackWidth: 0.02,
      rimHeat: 0.15,
      leadGlow: 0.1,
      glow: 0.35,
      envIntensity: 0.75,

      trailWidth: 1.9,
      trailHeadSize: 1.0,
      trailPlume: 2.6,
      trailWakeSpread: 0.9,
      trailBulge: 0.4,
      trailBulgeScale: 0.22,
      trailTurbulence: 2.2,
      trailWarp: 0.7,
      trailWisps: 0.5,
      trailShred: 0.9,
      trailSpeed: 1.6,
      trailBuoyancy: 1.4,
      trailDensity: 1.5,
      trailSoot: 3.2, // dust is almost all absorption
      trailCoreClarity: 0.15,
      trailGlow: 0.85,
      trailOpacity: 0.9,
      trailTempCore: 1180,
      trailTempEdge: 980,
      trailPalette: 1.0, // no black-body physics — this is lit dust
      trailTailFade: 0.3,
      trailBurnout: 1.6,
      trailSteps: 30,
      colorFlameMid: '#c9a463',
      colorFlameEdge: '#7d5c33',
      colorFlameSmoke: '#2a1f12',

      fieldBoundary: 0.3,
      fieldBoundaryGlow: 1.4,
      fieldFill: 0.4,
      fieldFalloff: 1.6,
      fieldVeins: 1.2,
      fieldVeinScale: 1.4,
      fieldCrawl: 0.35,
      fieldRings: 2.0,
      fieldRingSpeed: 0.7,
      fieldSpokes: 16,
      fieldSpin: 0.2,
      fieldCore: 0.5,
      colorField: '#c9a463',
      colorFieldEdge: '#f2dfae',

      scorchRadius: 3.4,
      scorchIntensity: 0.35,
      colorScorch: '#3a2c1c',
      shockRadius: 7.0,
      colorShockA: '#c9a463',
      colorShockB: '#f2dfae',
      // `CycloneAbility` walks pressure rings out across the floor for as long
      // as it stands; the key lives on the Crown's block, not the Cinder Fall's,
      // so the derivation has to bring it. Slower than the cyclone's: this is a
      // body of dust leaning on the ground, not a blade edge cutting it.
      ringRate: 0.9,

      funnelVolume: 1.0, // the signature: a wall of dust standing in the cone
      shardMaterial: 'rock',

      dustRate: 420,
      dustSize: 1.9,
      dustSpeed: 2.0,
      dustLifetime: 4.0,
      dustOpacity: 0.16,
      dustRise: 1.4,
      dustTurbulence: 0.9,
      colorDustA: '#c2a878',
      colorDustB: '#8f7550',
      colorDustC: '#5c4831',
      colorDustD: '#2b2117',

      moteRate: 120,
      moteSize: 0.09,
      moteSpeed: 2.2,
      moteLifetime: 1.8,
      moteRise: 1.4,
      moteTurbulence: 0.8,
      moteGlow: 0.45,
      colorMoteA: '#f2dfae',
      colorMoteB: '#c9a463',
      colorMoteC: '#7d5c33',
      colorMoteD: '#2a1f12',

      gritRate: 160,
      gritSize: 0.075,
      gritSpeed: 5.0,
      gritLifetime: 1.8,
      gritGravity: -14.0,
      colorGritA: '#8a7350',
      colorGritB: '#5c4831',
      colorGritC: '#3a2c1c',
      colorGritD: '#2b2117',

      emberRate: 40,
      emberGlow: 0.4,
      colorEmberA: '#f2dfae',
      colorEmberB: '#c9a463',
      colorEmberC: '#7d5c33',
      colorEmberD: '#2a1f12',
      sparkRate: 40,
      smokeRate: 320, // the signature: it is mostly dust
      smokeSize: 1.9,
      smokeLifetime: 4.0,
      smokeOpacity: 0.16,
      smokeRise: 1.4,
      colorSmokeA: '#c2a878',
      colorSmokeB: '#8f7550',
      colorSmokeC: '#5c4831',
      colorSmokeD: '#2b2117',
      debrisSize: 0.075,
      debrisSpeed: 5.0,
      colorDebrisA: '#8a7350',
      colorDebrisB: '#5c4831',
      colorDebrisC: '#3a2c1c',
      colorDebrisD: '#2b2117',

      lightIntensity: 9,
      lightRadius: 16,
      lightHeight: 0.4,
      lightColor: '#d8b478',
      lightFlicker: 0.1,

      fissureRadius: 0.0,
      chunkCount: 0,
      muzzleSize: 0.0,
      castFlash: 0.05,
      burstSize: 4.0,
      burstIntensity: 0.7,
      burstEmbers: 40,
      burstSmoke: 160,
      burstDebris: 120,
      impactShake: 0.6,
      shakeDuration: 0.9,
      holdShake: 0.07,
      impactFlash: 0.1,
      rumble: 0.04,
      // The Cinder Fall's block has no `colorBurst*` family — it tints its
      // shells straight off the flame palette. `CycloneAbility` serves both this
      // and the Shard Cyclone, so the shared name has to exist on both.
      colorBurstA: '#c9a463',
      colorBurstB: '#e8cf9c',
      colorBurstC: '#f7ecd2',
      colorFlash: '#e8cf9c'
    }),

    /**
     * TIDAL PRISM — the Glacial Crown's engine filled with water instead of ice.
     * The blades become tall, wide, nearly clear prisms with a hard chromatic
     * split, the sheet under them reads as a pool rather than a frozen plate,
     * and the whole thing arrives with a swell and leaves by draining. The wall
     * leans *inward* here, which is the silhouette difference that stops the two
     * being confused: the Crown is a starburst, this is a fountain.
     */
    tidal: derive(glacier, {
      range: 19.0,
      minRange: 0.0,
      zoneRadius: 4.8,
      speed: 38.0,
      snapTime: 0.3,
      lifetime: 4.0,
      shatterDelay: 0.35,
      shatterStagger: 0.6,
      sinkTime: 1.4,
      cooldown: 1.7,
      castAnim: 'cast3',

      spikeCount: 200,
      ringShare: 0.55,
      coreShare: 0.12, // a spout does stand in the middle of this one
      lateShare: 0.18,
      ringSeat: 0.9,
      ringScatter: 0.22,
      skirtSeat: 0.6,
      skirtBand: 0.5,

      ringHeight: 2.4,
      ringWave: 0.75,
      skirtHeight: 1.2,
      coreHeight: 4.4,
      coreSpread: 0.2,
      heightJitter: 0.8,
      ringLean: -0.26, // negative: the wall curls inward, like a breaking wave
      skirtLean: 0.42,
      coreLean: 0.08,
      fan: 0.75,
      rubble: 0.45,
      rubbleScale: 0.4,

      radius: 0.44,
      radiusJitter: 1.0,
      taper: 0.28,
      facets: 8,
      roughness: 0.12,
      bend: 0.5,

      riseTime: 0.3,
      riseOvershoot: 0.5, // water overshoots hard, then falls back
      settle: 0.75,
      sweepTime: 0.3,
      skirtDelay: 0.06,
      stagger: 0.1,

      colorGlass: '#0a3f57',
      colorEdge: '#eafcff',
      colorPrismA: '#3fe0d8',
      colorPrismB: '#3f7fff',
      colorCore: '#8ff0ff',
      colorTip: '#ffffff',
      body: 2.1, // it has a body — water is not empty glass
      edgePower: 1.5,
      edgeGain: 0.95,
      dispersion: 1.0,
      pipe: 1.4,
      tipBias: 1.1,
      bands: 2.4,
      pulseSpeed: 1.4,
      stria: 1.1,
      striaScale: 4.0,
      envIntensity: 0.9,
      specular: 3.2,
      glow: 0.9,
      opacity: 0.9,

      frontRough: 0.5,
      frontGlow: 1.6,
      shatterScale: 4.5,
      shatterGlow: 1.6,

      fieldBoundary: 0.5,
      fieldFill: 0.4,
      fieldFalloff: 1.1,
      fieldPlates: 0.5,
      fieldPlateScale: 1.4,
      fieldSeam: 0.35,
      fieldFingers: 1.3,
      fieldFingerScale: 1.1,
      fieldCrawl: 0.55, // it flows
      fieldRings: 3.4,
      fieldRingSpeed: 0.9,
      fieldSweep: 0.55,
      fieldCore: 1.2,
      fieldCoreSize: 0.24,
      fieldPulse: 0.3,
      colorField: '#3fb8ff',
      colorFieldEdge: '#eafcff',

      veil: 0.65,
      veilHeight: 2.4,
      veilFlare: 0.5,
      veilBillow: 0.4,
      veilFlow: 0.85,
      veilErode: 0.35,
      colorVeil: '#4fc6ff',
      colorVeilCrest: '#ffffff',

      frostSpread: 1.8,
      frostLife: 6.0,
      frostIntensity: 0.55,
      frostCrystals: 0.8,
      colorFrost: '#9fd8ea',
      colorFrostEdge: '#2a5a74',
      rimeRate: 4.0,
      shockRadius: 8.0,
      ringRate: 1.6,
      colorShockA: '#3fb8ff',
      colorShockB: '#ffffff',

      mistRate: 360,
      mistSize: 1.3,
      mistOpacity: 0.06,
      mistRise: 0.7,
      colorMistA: '#eafcff',
      colorMistB: '#a8e4ff',
      colorMistC: '#4f9cc4',
      colorMistD: '#08283a',
      shardSize: 0.09,
      shardSpeed: 7.5,
      shardGravity: -12.0,
      colorShardA: '#ffffff',
      colorShardB: '#a8e8ff',
      colorShardC: '#3fb8ff',
      colorShardD: '#0a3a55',
      glitterRate: 220,
      glitterRise: 1.8,
      colorGlitterA: '#ffffff',
      colorGlitterB: '#6fe8ff',
      colorGlitterC: '#3f9fff',
      colorGlitterD: '#062434',
      snowRate: 190, // spray falling back into the pool
      snowFall: -3.2,
      snowSize: 0.06,
      snowTurbulence: 0.5,

      lightIntensity: 15,
      lightRadius: 17,
      lightColor: '#4fc6ff',

      burstSize: 4.4,
      burstIntensity: 1.3,
      burstShards: 160,
      burstMist: 120,
      vapourRate: 2.2,
      impactShake: 0.8,
      shakeDuration: 0.7,
      holdShake: 0.03,
      impactFlash: 0.18,
      colorBurstA: '#3fb8ff',
      colorBurstB: '#a8e8ff',
      colorBurstC: '#ffffff',
      colorFlash: '#c4f0ff'
    }),
  };
}
