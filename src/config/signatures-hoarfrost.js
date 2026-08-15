/**
 * signatures-hoarfrost.js — five of the twenty signatures added in V3.1.
 *
 * Split out of `signatures-forge.js` purely for length; the construction and the
 * rules are identical, and the two files are merged one after the other. Read
 * the header of `signatures-forge.js` first — it documents both.
 *
 *   Rime Comet     ← Cinder Fall      (MeteorAbility)
 *   Rimefault      ← Magma Rift       (RiftAbility)
 *   Quartz Bastion ← Glacial Crown    (GlacierAbility)
 *   Maelstrom      ← Shard Cyclone    (CycloneAbility, crystal branch)
 *   Aurora Mantle  ← Absolute Zero    (DomeAbility)
 *
 * The group these five make is the counterweight to the Emberforge Choir: the
 * same five engines run cold — vapour instead of flame, quartz instead of
 * slag, an aurora instead of a forge light.
 */

import { derive } from './variants.js';

export function buildHoarfrostSignatures(settings) {
  const { meteor, magma, glacier, cyclone, zero } = settings;

  return {
    /**
     * RIME COMET — the Cinder Fall's rock, thrown cold.
     *
     * The one change that matters is not the palette, it is `trailPalette: 0`:
     * the volumetric trail stops being read as blackbody temperature in Kelvin
     * and becomes a plain gradient, which is the only way this engine can make
     * vapour instead of flame. Everything else supports that read — the body is
     * bigger and slower on a much higher arc, it spins a third as fast so you
     * see the fractures, and the trail is nearly twice as long and half as
     * dense, hanging behind the stone rather than being burnt off it.
     */
    comet: derive(meteor, {
      range: 24.0,
      minRange: 4.0,
      speed: 15,
      arc: 4.4,
      arcCurve: 1.15,
      lifetime: 3.0,
      fadeTime: 2.0,
      cooldown: 1.4,
      castAnim: 'cast3',

      radius: 1.05,
      facets: 4,
      lumpiness: 0.44,
      lumpScale: 1.1,
      surfaceRoughness: 0.08,
      cuts: 14,
      cutDepth: 0.42,
      craters: 3,
      craterDepth: 0.1,
      spin: 1.6,

      crackScale: 1.35,
      crackWidth: 0.06,
      crackGlow: 3.2,
      crackFlow: 0.35,
      rockScale: 2.6,
      cavity: 0.1,
      soot: 0.18,
      rimHeat: 0.32,
      leadGlow: 1.4,
      leadSharp: 1.6,
      glow: 1.0,
      colorRock: '#4a6a78',
      colorChar: '#0d1a22',
      colorCrack: '#7fe6ff',
      colorHot: '#f2feff',

      trailSpan: 11.0,
      trailWidth: 0.95,
      trailHeadSize: 1.4,
      trailPlume: 1.6,
      trailRise: 0.55,
      trailTurbulence: 1.6,
      trailSpeed: 2.6,
      trailBuoyancy: 1.1,
      trailDensity: 1.5,
      trailSoot: 0.4,
      trailGlow: 2.3,
      trailOpacity: 0.62,
      trailTailFade: 0.5,
      trailPalette: 0, // gradient, not blackbody — this is what makes it vapour
      trailTempCore: 0.42,
      trailTempEdge: 0.14,
      colorFlameMid: '#b8ecff',
      colorFlameEdge: '#4fa8d8',
      colorFlameSmoke: '#0a2130',

      chunkCount: 22,
      chunkScale: 0.24,
      chunkCool: 5.0,
      chunkLinger: 1.2,
      chunkSink: 1.6,

      emberRate: 210,
      emberSpeed: 1.6,
      emberRise: 2.2,
      emberGlow: 1.4,
      colorEmberA: '#f2feff',
      colorEmberB: '#a9e4ff',
      colorEmberC: '#57c9ff',
      colorEmberD: '#06243a',
      colorSparkA: '#ffffff',
      colorSparkB: '#cdefff',
      colorSparkC: '#57c9ff',
      colorSparkD: '#0a2c46',
      smokeRate: 110,
      smokeSize: 1.4,
      smokeOpacity: 0.09,
      colorSmokeA: '#8fb4c6',
      colorSmokeB: '#5c7d8e',
      colorSmokeC: '#33505e',
      colorSmokeD: '#16262f',

      fissureRadius: 6.4,
      fissureLife: 8.0,
      fissureArms: 8,
      fissureWidth: 0.11,
      fissureHeat: 0.4,
      fissureGrowth: 6,
      scorchRadius: 3.4,
      scorchIntensity: 0.55,
      colorScorch: '#16303c',
      shockRadius: 7.0,
      colorShockA: '#7fd8ff',
      colorShockB: '#f2feff',

      lightIntensity: 18,
      lightRadius: 17,
      lightColor: '#7fd8ff',
      lightFlicker: 0.1,
      colorCastFlash: '#cdefff',

      burstSize: 4.6,
      burstIntensity: 1.2,
      burstTurbulence: 1.2,
      impactShake: 0.9,
      shakeDuration: 1.2,
      impactFlash: 0.24,
      rumble: 0.05,
      colorFlash: '#cdefff'
    }),

    /**
     * RIMEFAULT — the Magma Rift run backwards: the ground splits and the cold
     * comes up.
     *
     * The Rift is a fast tear with four short flames standing in it. This one
     * walks the line at two thirds of the speed, opens seven nodes instead of
     * five in a much narrower band — so it reads as a *fault*, a single line,
     * rather than a spreading wound — and stands five broad, low vapour columns
     * that outlive the tear itself. The basalt is smaller, more numerous and
     * sinks back slowly, which is what turns heaved rock into shelf ice.
     */
    rimefault: derive(magma, {
      range: 22.0,
      speed: 14,
      lifetime: 4.8,
      fadeTime: 2.2,
      cooldown: 2.2,
      castAnim: 'cast3',

      riftNodes: 7, // MAX_NODES is 8
      riftRadius: 2.0,
      riftSpread: 0.28,
      riftStagger: 0.1,

      jets: 5, // MAX_JETS is 6
      jetHeight: 3.0,
      jetWidth: 1.2,
      jetStagger: 0.2,
      jetLife: 4.2,
      jetLean: 0.05,

      basaltCount: 120,
      basaltScale: 0.26,
      basaltLean: 0.28,
      basaltSpread: 1.1,
      basaltRise: 0.22,
      basaltSink: 2.6,

      trailWidth: 1.15,
      trailPlume: 1.3,
      trailTurbulence: 1.5,
      trailSpeed: 2.2,
      trailBuoyancy: 1.6,
      trailDensity: 1.7,
      trailSoot: 0.5,
      trailGlow: 2.0,
      trailOpacity: 0.6,
      trailPalette: 0,
      trailTempCore: 0.38,
      trailTempEdge: 0.11,
      colorFlameMid: '#cdefff',
      colorFlameEdge: '#5fb8e0',
      colorFlameSmoke: '#0d2634',

      colorRock: '#55707c',
      colorChar: '#10202a',
      colorCrack: '#8fe4ff',
      colorHot: '#f2feff',
      crackGlow: 2.6,
      soot: 0.25,
      rimHeat: 0.3,

      fissureRadius: 3.2,
      fissureWidth: 0.2,
      fissureHeat: 0.5,
      fissureRockSize: 0.36,
      fissureLife: 8.5,
      fissureBranches: 0.45,
      scorchRadius: 2.4,
      scorchIntensity: 0.6,
      colorScorch: '#1a3846',
      shockRadius: 6.5,
      colorShockA: '#8fe4ff',
      colorShockB: '#f2feff',

      emberRate: 150,
      emberRise: 1.8,
      colorEmberA: '#f2feff',
      colorEmberB: '#a9e4ff',
      colorEmberC: '#4fb8e0',
      colorEmberD: '#06243a',
      colorSparkA: '#ffffff',
      colorSparkB: '#cdefff',
      colorSparkC: '#5fb8e0',
      colorSparkD: '#0a2c46',
      smokeRate: 120,
      smokeSize: 1.5,
      smokeOpacity: 0.08,
      colorSmokeA: '#93b6c6',
      colorSmokeB: '#5f8090',
      colorSmokeC: '#35525f',
      colorSmokeD: '#172730',

      lightIntensity: 15,
      lightRadius: 18,
      lightColor: '#86d8f0',
      lightFlicker: 0.12,
      lightFlickerSpeed: 6,

      burstSize: 3.4,
      burstIntensity: 0.9,
      impactShake: 0.7,
      shakeDuration: 1.4,
      impactFlash: 0.16,
      rumble: 0.07,
      colorFlash: '#cdefff',
      colorCastFlash: '#cdefff'
    }),

    /**
     * QUARTZ BASTION — the Glacial Crown's ring, built as architecture.
     *
     * The Crown throws two hundred and twenty blades up in a fifth of a second
     * and drops them four seconds later; it is a *thicket*. This is forty-six
     * monoliths, each nearly three times the radius, pushed up over three
     * quarters of a second with almost no overshoot and held for eight and a
     * half — the longest standing shape in the library. Lean and fan are close
     * to zero on purpose: the Crown leans outward to look violent, and a bastion
     * that leans looks like it is falling over. Amber quartz, not glacier ice.
     */
    quartz: derive(glacier, {
      range: 18.0,
      zoneRadius: 5.8,
      speed: 30,
      snapTime: 0.36,
      lifetime: 8.5,
      shatterDelay: 1.4,
      shatterStagger: 0.9,
      sinkTime: 2.6,
      cooldown: 2.8,
      castAnim: 'cast3',

      spikeCount: 46,
      ringShare: 0.6,
      coreShare: 0.18,
      lateShare: 0.22,
      ringSeat: 0.9,
      ringScatter: 0.06,
      skirtSeat: 0.62,
      skirtBand: 0.3,
      coreSpread: 0.22,

      ringHeight: 3.6,
      ringWave: 0.35,
      skirtHeight: 2.4,
      coreHeight: 7.6,
      heightJitter: 0.35,
      ringLean: 0.07,
      skirtLean: 0.08,
      coreLean: 0.04,
      leanJitter: 0.45,
      fan: 0.35,
      twist: 0.6,
      rubble: 0.7,
      rubbleScale: 0.5,

      radius: 0.95,
      radiusJitter: 0.35,
      taper: 0.74,
      facets: 6,
      roughness: 0.06,

      riseTime: 0.75, // it is pushed up, not thrown
      riseOvershoot: 0.06,
      settle: 0.25,
      sweepTime: 0.9,
      skirtDelay: 0.2,
      coreDelay: 0.35,
      stagger: 0.12,

      colorGlass: '#5a3a12',
      colorEdge: '#fff4d8',
      colorPrismA: '#ffd57a',
      colorPrismB: '#ffa63c',
      colorCore: '#ffe8bc',
      colorTip: '#fffaf0',
      body: 1.6,
      dispersion: 1.15,
      pipe: 1.35,
      bands: 0.8,
      tipBias: 1.2,
      tipGlow: 2.2,
      stria: 0.45,
      striaScale: 3.2,
      specular: 2.6,
      birthGlow: 1.6,

      fieldPlates: 0.6,
      fieldPlateScale: 1.6,
      fieldRings: 1.6,
      fieldSweep: 0.25,
      colorField: '#ffc46a',
      colorFieldEdge: '#fff4e0',

      veil: 0.28,
      veilHeight: 2.6,
      veilRadius: 1.1,
      colorVeil: '#ffd89a',
      colorVeilCrest: '#fff6e4',

      frostCollar: 3.4,
      colorFrost: '#fff2da',
      colorFrostEdge: '#c98a3c',
      colorShockA: '#ffc46a',
      colorShockB: '#fff4e0',
      colorMistA: '#fff2da',
      colorMistB: '#ffd9a0',
      colorMistC: '#c98a3c',
      colorMistD: '#2c1706',
      colorShardA: '#fffaf0',
      colorShardB: '#ffe8bc',
      colorShardC: '#ffa63c',
      colorShardD: '#3a1e06',
      glitterRate: 90,
      colorGlitterA: '#fffdf2',
      colorGlitterB: '#ffc46a',
      colorGlitterC: '#ffe6b4',
      colorGlitterD: '#341a04',
      snowRate: 40,
      colorSnowA: '#fffdf2',
      colorSnowB: '#ffeac4',
      colorSnowC: '#ffc46a',
      colorSnowD: '#33190a',

      lightIntensity: 16,
      lightRadius: 20,
      lightColor: '#ffc86a',
      colorCastFlash: '#ffe6b4',
      burstSize: 4.4,
      burstIntensity: 0.9,
      impactShake: 1.1,
      shakeDuration: 1.4,
      holdShake: 0.02,
      rumble: 0.08,
      colorBurstA: '#ffc46a',
      colorBurstB: '#ffe8bc',
      colorBurstC: '#fff4e0',
      colorFlash: '#ffe8bc'
    }),

    /**
     * MAELSTROM — the Shard Cyclone laid flat.
     *
     * The Cyclone is a chimney: a tight cone seven and a half metres tall,
     * turning fast, with the dust column switched off so you can see through it.
     * This inverts every one of those decisions. The footprint is over half as
     * wide again as anything else in the library, the cone is four metres tall
     * and *wider at the base than the top is high*, it turns at half the speed
     * with the shear pushed almost to the rim (`spinFalloff` near one), and the
     * volume is switched **on** as cold spray — so the middle of it occludes.
     * The result is a body of water turning over, not a funnel standing up.
     */
    maelstrom: derive(cyclone, {
      range: 18.0,
      zoneRadius: 7.2,
      speed: 38,
      snapTime: 0.3,
      lifetime: 5.8,
      fadeTime: 1.7,
      cooldown: 2.6,
      castAnim: 'cast2',

      funnelHeight: 4.2,
      funnelBase: 0.62,
      funnelTop: 1.25,
      funnelCurve: 0.7,
      funnelLean: 0.3,
      spin: 0.75,
      spinFalloff: 0.92,
      spinJitter: 0.45,
      climb: 0.26,
      climbJitter: 0.9,

      shardCount: 210,
      shardScale: 0.44,
      shardScaleJitter: 0.9,
      tumble: 2.0,
      wobble: 0.7,
      wobbleScale: 0.8,
      taper: 0.5,
      radius: 0.42,
      facets: 5,

      strands: 20,
      strandWidth: 0.11,
      strandTurns: 0.55,
      strandSpeed: 0.55,
      strandJitter: 0.5,
      strandGlow: 1.6,
      colorStrandCore: '#eafcff',
      colorStrandEdge: '#3fc0e8',
      colorStrandHalo: '#06364f',

      funnelVolume: 1, // spray, where the Cyclone shows you the far side
      trailWidth: 1.35,
      trailPlume: 1.5,
      trailTurbulence: 1.7,
      trailSpeed: 2.4,
      trailBuoyancy: 1.2,
      trailDensity: 1.15,
      trailSoftness: 0.62,
      trailGlow: 1.8,
      trailOpacity: 0.4,
      trailTempCore: 0.3,
      trailTempEdge: 0.1,
      colorFlameMid: '#9fe4ff',
      colorFlameEdge: '#2f86b8',
      colorFlameSmoke: '#07202e',

      colorGlass: '#06364f',
      colorEdge: '#eafcff',
      colorPrismA: '#4fd8ff',
      colorPrismB: '#2f9fd8',
      colorCore: '#bff0ff',
      dispersion: 0.9,
      body: 1.1,
      opacity: 0.92,

      dustRate: 380,
      dustSize: 1.8,
      dustOpacity: 0.075,
      dustRise: 0.35,
      colorDustA: '#dff6ff',
      colorDustB: '#8ecbe4',
      colorDustC: '#42768e',
      colorDustD: '#08202e',
      moteRate: 220,
      moteRise: 1.1,
      gritRate: 140,
      gritGravity: -12,

      colorField: '#3fc0e8',
      colorFieldEdge: '#eafcff',
      fieldRings: 3.4,
      fieldRingSpeed: -1.2,
      fieldSpin: 0.18,

      lightIntensity: 18,
      lightRadius: 24,
      lightColor: '#5fd8ff',
      burstSize: 4.8,
      impactShake: 0.8,
      shakeDuration: 1.3,
      holdShake: 0.06,
      rumble: 0.07,
      colorBurstA: '#3fc0e8',
      colorBurstB: '#bff0ff',
      colorBurstC: '#eafcff',
      colorFlash: '#bff0ff'
    }),

    /**
     * AURORA MANTLE — Absolute Zero's shell, made of light instead of plate.
     *
     * The Dome is the library's quietest cast and its most *solid*: a squashed
     * shell at two thirds opacity that comes apart one voronoi plate at a time.
     * The Mantle keeps the silence and throws the solidity away. `domeSquash`
     * goes from 0.74 to 1.45, so the shell stands taller than it is wide — a
     * bell, not a lid — at 0.42 opacity with the plate field almost off and
     * `domeShatter` down near nothing, so it *drifts* out instead of breaking.
     * The rim blades are halved and laid over hard, because a curtain of light
     * should not look like it is standing on a fence.
     */
    aurora: derive(zero, {
      range: 18.0,
      zoneRadius: 6.4,
      speed: 34,
      snapTime: 0.3,
      lifetime: 7.5,
      fadeTime: 2.8,
      cooldown: 2.6,
      castAnim: 'cast3',

      domeRadius: 1.0,
      domeSquash: 1.45, // taller than wide: a bell
      domeRise: 0.9,
      domeScale: 1.1,
      domeSpeed: 0.42,
      domePlates: 0.22,
      domeRim: 1.4,
      domeOpacity: 0.42,
      domeGlow: 2.6,
      domeShatter: 0.14, // it drifts apart, it does not shatter
      colorDomeA: '#06301f',
      colorDomeB: '#5fffb0',
      colorDomeC: '#d8b0ff',

      rimShards: 64,
      rimShardScale: 1.5,
      rimSeat: 1.0,
      rimScatter: 0.2,
      rimLean: 0.52,

      spikeCount: 90,
      ringHeight: 0.9,
      skirtHeight: 1.1,
      coreHeight: 2.2,
      heightJitter: 0.85,
      radius: 0.3,
      taper: 0.5,
      riseTime: 0.5,
      riseOvershoot: 0.08,
      settle: 0.3,
      shatterDelay: 1.2,
      sinkTime: 2.2,

      colorGlass: '#062a24',
      colorEdge: '#eaffff',
      colorPrismA: '#5fffb0',
      colorPrismB: '#b07aff',
      colorCore: '#c8ffe4',
      colorTip: '#ffffff',
      dispersion: 1.35,
      pipe: 1.4,
      bands: 2.2,
      pulseSpeed: 0.28,
      specular: 1.2,
      envIntensity: 0.4,

      fieldPlates: 0.3,
      fieldRings: 1.4,
      fieldRingSpeed: -0.25,
      fieldPulse: 0.35,
      fieldPulseSpeed: 0.7,
      colorField: '#5fffb0',
      colorFieldEdge: '#eaffe8',

      veil: 0.85,
      veilHeight: 3.6,
      veilRadius: 1.08,
      veilFlow: 0.22,
      veilSpin: 0.01,
      colorVeil: '#7fffc8',
      colorVeilCrest: '#e0c8ff',

      colorFrost: '#e8fff4',
      colorFrostEdge: '#5fd8a8',
      colorShockA: '#5fffb0',
      colorShockB: '#e0c8ff',
      colorMistA: '#e8fff4',
      colorMistB: '#a8f4d0',
      colorMistC: '#5fc9a0',
      colorMistD: '#062a24',
      colorGlitterA: '#ffffff',
      colorGlitterB: '#7fffc8',
      colorGlitterC: '#d8b0ff',
      colorGlitterD: '#0a2a1e',
      snowRate: 60,
      snowFall: -0.4,
      colorSnowA: '#ffffff',
      colorSnowB: '#d8ffe8',
      colorSnowC: '#b07aff',
      colorSnowD: '#0c2a20',

      lightIntensity: 12,
      lightRadius: 26,
      lightColor: '#6effc0',
      burstSize: 3.0,
      burstIntensity: 0.6,
      impactShake: 0.25,
      shakeDuration: 1.6,
      impactFlash: 0.1,
      rumble: 0.015,
      colorBurstA: '#5fffb0',
      colorBurstB: '#c8ffe4',
      colorBurstC: '#e0c8ff',
      colorFlash: '#c8ffe4'
    })
  };
}
