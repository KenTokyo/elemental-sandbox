/**
 * signatures-stormglass-cells.js — the two Stormglass blocks that turn in place.
 *
 * Split out of `signatures-stormglass.js` under the 800-line rule in `AGENTS.md`:
 * the five blocks of the group came to 911 lines together. Nothing moved but the
 * lines — `signatures-stormglass.js` spreads the two below back into the same
 * object it always returned, so the merge order in `settings.js` is untouched.
 *
 *   Dynamo Coil  ← Sandstorm Coil  (CycloneAbility, shardMaterial rock)
 *   Thunderhead  ← Absolute Zero   (DomeAbility)
 *
 * `dynamo` keeps its base rock shards, which is why the audit lists it beside
 * `sandstorm` under the rock branch of `CycloneAbility` and not beside `censer`.
 */

import { derive } from './variants.js';

export function buildStormglassCells(settings) {
  const { sandstorm, zero } = settings;

  return {
    /**
     * DYNAMO COIL — the funnel flattened into a rotor.
     *
     * Sandstorm Coil is a six-metre column of dust turning at 0.85 turns a second
     * and Emberspire is an eleven-metre flue turning at 4.6. This one is **two
     * and a half metres tall** and turns at **6.5** — the fastest and the
     * shortest, with `funnelBase` and `funnelTop` both near one so the cone is
     * gone entirely and what is left is a wide disc of debris.
     *
     * `climb` at 0.08 is the key number: nothing rides up, because a rotor does
     * not lift, it spins. The load runs at `MAX_SHARDS` — two hundred and forty
     * small dark stones tumbling at twelve radians a second — and the wind
     * ribbons at `MAX_STRANDS`, wound only a quarter turn but travelling at four
     * and a half revolutions a second, which is what makes them read as
     * commutator arcs rather than as weather. The ground disc turns with it at
     * 1.1 revolutions a second, the fastest field spin in the library.
     */
    dynamo: derive(sandstorm, {
      range: 16.0,
      minRange: 0.0,
      zoneRadius: 5.0,
      speed: 60.0,
      snapTime: 0.2,
      lifetime: 4.0,
      fadeTime: 1.0,
      cooldown: 2.0,
      castAnim: 'cast2',

      funnelHeight: 2.6, // the shortest funnel in the library
      funnelBase: 1.0,
      funnelTop: 1.3, // base and top both wide: the cone is gone
      funnelCurve: 0.5,
      funnelLean: 0.0,

      spin: 6.5, // ... and the fastest turn
      spinFalloff: 0.95, // it turns as one body, top to bottom
      spinJitter: 0.05,
      climb: 0.08, // a rotor does not lift
      climbJitter: 0.15,

      shardCount: 240, // MAX_SHARDS
      shardScale: 0.22,
      shardScaleJitter: 0.4,
      tumble: 12.0,
      wobble: 0.15,
      wobbleScale: 3.0,

      strands: 32, // MAX_STRANDS — the commutator arcs
      strandWidth: 0.03,
      strandTurns: 0.25,
      strandSpeed: 4.5,
      strandJitter: 0.1,
      strandDim: 0.95,
      strandGlow: 3.6,
      colorStrandCore: '#ffffff',
      colorStrandEdge: '#8f6bff',
      colorStrandHalo: '#160a44',

      radius: 0.3,
      facets: 2,
      lumpiness: 0.2,
      lumpScale: 2.4,
      surfaceRoughness: 0.18,
      cuts: 12,
      cutDepth: 0.4,
      craters: 1,
      colorRock: '#3a3f4a',
      colorChar: '#101218',
      colorCrack: '#9f7fff',
      colorHot: '#e8dcff',
      crackGlow: 2.4,
      crackWidth: 0.05,
      rimHeat: 0.6,
      leadGlow: 0.4,
      glow: 0.8,
      envIntensity: 1.1,

      funnelVolume: 0.35, // thin: the read is the debris, not the haze
      shardMaterial: 'rock',
      trailWidth: 1.2,
      trailPlume: 0.6,
      trailWakeSpread: 1.4,
      trailTurbulence: 3.4,
      trailWarp: 0.9,
      trailWisps: 1.1,
      trailShred: 1.6,
      trailSpeed: 5.5,
      trailBuoyancy: 0.6,
      trailDensity: 1.3,
      trailSoot: 1.4,
      trailCoreClarity: 0.6,
      trailGlow: 2.6,
      trailOpacity: 0.7,
      trailTempCore: 0.4, // palette-driven, so these are ramp positions
      trailTempEdge: 0.18,
      trailPalette: 1.0,
      trailTailFade: 0.4,
      trailBurnout: 0.8,
      trailSteps: 28,
      colorFlameMid: '#a88fff',
      colorFlameEdge: '#4f2fb0',
      colorFlameSmoke: '#0e0a1c',

      fieldBoundary: 0.22,
      fieldBoundaryGlow: 3.2,
      fieldFill: 0.3,
      fieldFalloff: 2.0,
      fieldVeins: 2.8,
      fieldVeinScale: 3.2,
      fieldCrawl: 0.9,
      fieldRings: 4.5,
      fieldRingSpeed: 2.4,
      fieldSpokes: 40,
      fieldSpokeLength: 0.4,
      fieldSpin: 1.1, // the fastest field spin in the library
      fieldCore: 1.6,
      colorField: '#8f6bff',
      colorFieldEdge: '#e8dcff',

      dustRate: 180,
      dustSize: 0.9,
      dustSpeed: 3.4,
      dustLifetime: 1.4,
      dustOpacity: 0.06,
      dustRise: 0.6,
      dustTurbulence: 1.8,
      colorDustA: '#c8b8ff',
      colorDustB: '#7f6bc8',
      colorDustC: '#453a70',
      colorDustD: '#141024',

      moteRate: 380,
      moteSize: 0.06,
      moteSpeed: 5.0,
      moteLifetime: 1.0,
      moteRise: 1.0,
      moteTurbulence: 2.0,
      moteGlow: 2.4,
      colorMoteA: '#ffffff',
      colorMoteB: '#b09fff',
      colorMoteC: '#6a4fd8',
      colorMoteD: '#0e0824',

      gritRate: 280,
      gritSize: 0.06,
      gritSpeed: 9.5,
      gritLifetime: 1.0,
      gritGravity: -20.0,
      colorGritA: '#e8dcff',
      colorGritB: '#8f7fc8',
      colorGritC: '#3a3450',
      colorGritD: '#141024',

      emberRate: 60,
      emberGlow: 1.8,
      colorEmberA: '#ffffff',
      colorEmberB: '#b09fff',
      colorEmberC: '#6a4fd8',
      colorEmberD: '#120a26',
      sparkRate: 220,
      sparkSpeed: 11.0,
      colorSparkA: '#ffffff',
      colorSparkB: '#dcd0ff',
      colorSparkC: '#8f6bff',
      colorSparkD: '#160a44',
      smokeRate: 60,
      smokeSize: 1.1,
      smokeOpacity: 0.05,
      colorSmokeA: '#3a3450',
      colorSmokeB: '#241f38',
      colorSmokeC: '#181428',
      colorSmokeD: '#0c0a18',

      scorchRadius: 2.0,
      scorchIntensity: 0.4,
      colorScorch: '#0a0814',
      shockRadius: 8.0,
      ringRate: 2.2,
      colorShockA: '#8f6bff',
      colorShockB: '#ffffff',

      fissureRadius: 0.0,
      chunkCount: 0,
      muzzleSize: 0.0,
      castFlash: 0.14,

      lightIntensity: 22,
      lightRadius: 16,
      lightHeight: 0.25,
      lightColor: '#9f7fff',
      lightFlicker: 0.3,
      lightFlickerSpeed: 40,

      burstSize: 3.0,
      burstIntensity: 1.3,
      burstEmbers: 90,
      burstSmoke: 40,
      burstDebris: 160,
      impactShake: 0.9,
      shakeDuration: 0.7,
      holdShake: 0.12, // it never stops shaking the floor
      impactFlash: 0.22,
      rumble: 0.05,
      colorBurstA: '#8f6bff',
      colorBurstB: '#c8b8ff',
      colorBurstC: '#ffffff',
      colorFlash: '#c8b8ff'
    }),

    /**
     * THUNDERHEAD — the dome pressed flat and left to churn.
     *
     * The fourth signature on this engine, and it takes the two axes the other
     * three left open. Absolute Zero is 5.6 m across and 0.74 squashed, Aurora
     * Mantle is 6.4 and 1.45 tall, Bell Rose is 3.6 and nearly opaque. This one
     * is **eight metres** — the largest footprint in the library — at a squash of
     * **0.34**, which is the flattest the shell goes: an anvil cloud lying on the
     * stage rather than a lid closed over it.
     *
     * `domePlates` down to 0.06 is what separates it from every other dome: there
     * is no crystallisation at all, the surface is fine churning structure
     * (`domeScale` 3.6) moving at `domeSpeed` 0.85 — five times Absolute Zero's —
     * and it resolves by *dissipating* (`domeShatter` 0.15) rather than by
     * breaking into plates. It stands for eight and a half seconds, the longest
     * hold in the library, and rains 320 particles of hail out of itself the
     * whole time.
     */
    thunderhead: derive(zero, {
      range: 22.0,
      minRange: 0.0,
      zoneRadius: 8.0, // the largest footprint in the library
      speed: 36.0,
      snapTime: 0.8,
      lifetime: 8.5, // ... and the longest hold
      fadeTime: 2.4,
      cooldown: 3.4,
      castAnim: 'cast3',

      domeRadius: 1.15,
      domeSquash: 0.34, // the flattest shell: an anvil cloud, not a lid
      domeRise: 1.6, // it rolls in rather than closing
      domeScale: 3.6, // fine churning structure
      domeSpeed: 0.85, // five times Absolute Zero's crawl
      domePlates: 0.06, // no crystallisation at all — this is vapour
      domeRim: 4.2,
      domeOpacity: 0.5,
      domeGlow: 2.6,
      domeShatter: 0.15, // it dissipates instead of breaking
      colorDomeA: '#0a0818',
      colorDomeB: '#5a4fa8',
      colorDomeC: '#dcd0ff',

      rimShards: 40, // a sparse, rough skirt thrown well out
      rimShardScale: 1.9,
      rimSeat: 1.04,
      rimScatter: 0.4,
      rimLean: 0.65,

      spikeCount: 70,
      ringShare: 0.6,
      lateShare: 0.3,
      ringHeight: 1.0,
      skirtHeight: 0.7,
      ringWave: 0.85,
      sweepTime: 1.4,
      stagger: 0.3,

      radius: 0.5,
      radiusJitter: 1.1,
      taper: 0.5,
      facets: 5,
      roughness: 0.28,
      colorGlass: '#0d0a20',
      colorEdge: '#dcd0ff',
      colorPrismA: '#7f5cff',
      colorPrismB: '#4fc8ff',
      colorCore: '#a88fff',
      colorTip: '#ffffff',
      body: 1.1,
      dispersion: 1.0,
      glow: 1.2,

      veil: 1.0,
      veilHeight: 1.4, // low and wide: the shelf under a storm cell
      veilRadius: 1.06,
      veilFlare: 0.7,
      veilBillow: 0.6,
      veilScale: 0.9,
      veilStretch: 1.6,
      veilFlow: 0.9,
      veilErode: 0.3,
      veilSpin: 0.04,
      colorVeil: '#6f5cc8',
      colorVeilCrest: '#dcd0ff',

      fieldBoundary: 0.5,
      fieldBoundaryGlow: 2.2,
      fieldFill: 0.4,
      fieldFalloff: 1.0,
      fieldPlates: 0.3,
      fieldPlateScale: 0.8,
      fieldSeam: 0.2,
      fieldFingers: 1.8,
      fieldFingerScale: 0.7,
      fieldWarp: 1.0,
      fieldCrawl: 0.7,
      fieldRings: 1.4,
      fieldRingSpeed: 0.4,
      fieldSweep: 0.9,
      fieldSweepSpeed: 0.22,
      fieldCore: 0.6,
      fieldCoreSize: 0.3,
      fieldPulse: 0.5,
      fieldPulseSpeed: 1.4,
      colorField: '#6f5cc8',
      colorFieldEdge: '#e0d8ff',

      frostSpread: 2.4,
      frostLife: 10.0,
      frostIntensity: 0.35,
      frostCrystals: 1.2,
      colorFrost: '#c8c0e8',
      colorFrostEdge: '#2e2848',
      rimeRate: 2.0,
      shockRadius: 12.0,
      ringRate: 1.8,
      colorShockA: '#7f5cff',
      colorShockB: '#e0d8ff',

      mistRate: 520,
      mistSize: 2.4,
      mistLifetime: 5.5,
      mistOpacity: 0.09,
      mistRise: -0.05,
      mistTurbulence: 0.9,
      colorMistA: '#dcd0ff',
      colorMistB: '#8f7fd8',
      colorMistC: '#443a78',
      colorMistD: '#0a0818',
      snowRate: 320, // hail, falling out of it for the whole hold
      snowSize: 0.07,
      snowSpeed: 2.2,
      snowFall: -6.5,
      snowTurbulence: 0.4,
      snowInset: 0.95,
      snowHeight: 0.9,
      snowGlow: 1.4,
      colorSnowA: '#ffffff',
      colorSnowB: '#cfe0ff',
      colorSnowC: '#7f9cff',
      colorSnowD: '#101a44',
      glitterRate: 80,
      shardSpeed: 5.0,
      colorShardA: '#ffffff',
      colorShardB: '#cfc0ff',
      colorShardC: '#7f5cff',
      colorShardD: '#0d0a20',

      lightIntensity: 18,
      lightRadius: 28,
      lightHeight: 0.6,
      lightColor: '#8f7fd8',

      burstSize: 6.8,
      burstIntensity: 1.0,
      burstShards: 90,
      burstMist: 220,
      burstGlitter: 60,
      vapourRate: 2.6,
      vapourSize: 2.6,
      impactShake: 1.2,
      shakeDuration: 2.2,
      holdShake: 0.035,
      impactFlash: 0.22,
      rumble: 0.03,
      colorBurstA: '#6f5cc8',
      colorBurstB: '#cfc0ff',
      colorBurstC: '#ffffff',
      colorFlash: '#cfc0ff'
    }),
  };
}
