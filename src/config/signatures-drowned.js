/**
 * signatures-drowned.js — the last five of the twenty signatures added in V3.1.
 *
 * Split out of `signatures-umbra.js` purely for length; the construction and the
 * rules are identical, and the two files are merged one after the other. Read
 * the header of `signatures-umbra.js` first — it documents both.
 *
 *   Abyssal Vault   ← Tidal Prism      (GlacierAbility)
 *   Ashen Deluge    ← Celestial Rain   (RainAbility)
 *   Obsidian Thorns ← Verdant Rupture  (IceAbility)
 *   Tar Fall        ← Cinder Fall      (MeteorAbility)
 *   Brine Lance     ← Frost Lance      (IceAbility)
 *
 * The group these five make is the counterweight to the Umbral Covenant: where
 * that one is void and discharge, this one is black water, tar, volcanic glass
 * and salt — the same darkness with a material in it.
 */

import { derive } from './variants.js';

export function buildDrownedSignatures(settings) {
  const { tidal, rain, verdant, meteor, ice } = settings;

  return {
    /**
     * ABYSSAL VAULT — the Tidal Prism turned inside out and shut.
     *
     * The Prism is a fountain: a wall curling inward around a four-metre spout,
     * arriving on an overshoot and draining away. This is a lid. The spout is
     * deleted (`coreShare: 0`), the ring is squat and leans hard *outward*, the
     * skirt banks up behind it until the two meet, and the sweep crawls right
     * around the footprint over a second and a half instead of a third of one.
     * The glass is black-green and nearly opaque with a single cold rim, so what
     * stands there reads as something closed rather than something pouring.
     */
    abyssal: derive(tidal, {
      range: 16.0,
      zoneRadius: 5.8,
      speed: 24.0,
      snapTime: 0.6,
      lifetime: 7.0, // the longest hold in the library
      shatterDelay: 1.8,
      shatterStagger: 1.4,
      sinkTime: 2.6,
      cooldown: 3.2,
      castAnim: 'cast1',

      spikeCount: 240,
      ringShare: 0.5,
      coreShare: 0.0, // no spout — this one has a lid, not a middle
      lateShare: 0.34,
      ringSeat: 0.82,
      ringScatter: 0.4,
      skirtSeat: 0.42,
      skirtBand: 0.9,

      ringHeight: 1.35, // squat where the Prism is tall
      ringWave: 0.25,
      skirtHeight: 1.5, // the skirt is the taller half here
      heightJitter: 0.35,
      ringLean: 0.95, // hard outward — the wall folds down over its own feet
      skirtLean: -0.3,
      fan: 0.25,
      rubble: 0.72,
      rubbleScale: 0.62,

      radius: 0.72,
      radiusJitter: 0.5,
      taper: 0.78, // slabs and plates, not prisms
      facets: 5,
      roughness: 0.44,
      bend: 0.12,

      riseTime: 0.8,
      riseOvershoot: 0.05, // no overshoot: it settles into place
      settle: 1.6,
      sweepTime: 1.5, // the close crawls all the way around
      skirtDelay: 0.35,
      stagger: 0.3,

      colorGlass: '#04120f',
      colorEdge: '#8fd8c4',
      colorPrismA: '#1a5c4c',
      colorPrismB: '#0d3a4a',
      colorCore: '#2f7f6c',
      colorTip: '#cdf2e4',
      body: 3.6, // thick and dark — very little light gets through
      edgePower: 3.2,
      edgeGain: 1.6,
      dispersion: 0.2,
      pipe: 0.3,
      bands: 0.6,
      pulseSpeed: 0.25,
      stria: 2.2,
      striaScale: 1.6,
      envIntensity: 0.35,
      specular: 1.1,
      glow: 0.4,
      opacity: 1.0,

      frontRough: 1.1,
      frontGlow: 0.5,
      shatterScale: 1.8,
      shatterGlow: 0.4,

      fieldBoundary: 0.8,
      fieldFill: 0.5,
      fieldFalloff: 0.7,
      fieldPlates: 1.0,
      fieldPlateScale: 0.8,
      fieldSeam: 0.9,
      fieldFingers: 0.3,
      fieldCrawl: 0.06,
      fieldRings: 0.6,
      fieldRingSpeed: 0.15,
      fieldSweep: 1.4,
      fieldCore: 0.25,
      fieldCoreSize: 0.6,
      colorField: '#12564a',
      colorFieldEdge: '#8fd8c4',

      veil: 0.35,
      veilHeight: 1.1,
      veilFlare: 1.2,
      veilBillow: 0.9,
      veilFlow: 0.2,
      veilErode: 0.75,
      colorVeil: '#1a5c4c',
      colorVeilCrest: '#8fd8c4',

      frostSpread: 2.8,
      frostLife: 12.0,
      frostIntensity: 0.35,
      colorFrost: '#3f6f64',
      colorFrostEdge: '#0a2420',
      rimeRate: 1.2,
      shockRadius: 6.0,
      ringRate: 0.3,
      colorShockA: '#12564a',
      colorShockB: '#8fd8c4',

      mistRate: 520, // it breathes cold off a very wide rim
      mistSize: 2.2,
      mistOpacity: 0.1,
      mistRise: -0.4, // the haze pours off the lid and pools
      colorMistA: '#9fc4bc',
      colorMistB: '#4f7a72',
      colorMistC: '#20443e',
      colorMistD: '#050f0d',
      shardSpeed: 3.0,
      glitterRate: 40,
      snowRate: 0,

      lightIntensity: 5,
      lightRadius: 14,
      lightColor: '#2f9c84',

      burstSize: 5.6,
      burstIntensity: 0.5,
      burstShards: 90,
      burstMist: 260,
      vapourRate: 4.5,
      impactShake: 1.1,
      shakeDuration: 1.8,
      holdShake: 0.01,
      impactFlash: 0.06,
      colorBurstA: '#0d3a32',
      colorBurstB: '#2f7f6c',
      colorBurstC: '#8fd8c4',
      colorFlash: '#4f9c8c'
    }),

    /**
     * ASHEN DELUGE — Celestial Rain with nine shafts instead of twenty-six.
     *
     * The Rain is a fine, quick rhythm: seven thin shafts a second, each landing
     * with a small ring. This one drops slabs. The rate falls to under two a
     * second, each column is four times as wide and half again as long, and it
     * falls at half the speed from half the height — so a single shaft is
     * legible on the way down, which is the whole difference. Each landing is an
     * event: a two-metre shell, a three-metre ring and a shake you feel.
     */
    deluge: derive(rain, {
      range: 20.0,
      zoneRadius: 6.2,
      speed: 40.0,
      snapTime: 0.35,
      lifetime: 7.4,
      fadeTime: 1.6,
      cooldown: 3.4,
      castAnim: 'cast3',

      shafts: 9,
      shaftRate: 1.7, // slow enough to count them
      shaftHeight: 9.0,
      shaftFall: 13.0,
      shaftWidth: 0.55,
      shaftTaper: 0.92, // no taper — a falling slab, not a streak
      shaftLength: 8.5,
      shaftTilt: 0.03,
      shaftInset: 0.78,
      shaftDim: 0.95,
      shaftGlow: 1.1,
      colorShaftCore: '#ffd8a8',
      colorShaftEdge: '#8a5c3c',
      colorShaftHalo: '#1c0f0a',

      landingBurst: 2.1,
      landingRing: 3.2,
      landingRingLife: 2.2,
      landingSparks: 46,
      landingFlash: 0.1,
      landingShake: 0.3,
      landingLight: 9.0,

      fieldBoundary: 0.55,
      fieldBoundaryGlow: 1.1,
      fieldFill: 0.3,
      fieldFalloff: 0.8,
      fieldVeins: 1.8,
      fieldVeinScale: 0.7,
      fieldCrawl: 0.06,
      fieldRings: 0.9,
      fieldRingSpeed: 0.2,
      fieldSpokes: 12,
      fieldCore: 0.15,
      fieldPulse: 0.45,
      fieldPulseSpeed: 0.4,
      colorField: '#7a4a2c',
      colorFieldEdge: '#ffd8a8',

      colorCore: '#fff0d8',
      colorInner: '#e0a86c',
      colorOuter: '#8a5c3c',
      colorHalo: '#150a06',
      glow: 1.1,
      width: 0.07,

      trailRate: 0.2,
      scorchRadius: 2.6,
      scorchLife: 12.0,
      scorchIntensity: 0.9,
      colorScorch: '#0e0805',
      shockRadius: 8.5,
      colorShockA: '#8a5c3c',
      colorShockB: '#ffd8a8',
      colorArc: '#e0a86c',
      colorEmber: '#c98a4c',

      sparkRate: 140,
      sparkSize: 0.16,
      sparkSpeed: 7.5,
      sparkLifetime: 1.4,
      sparkGravity: -14.0,
      colorSparkA: '#fff0d8',
      colorSparkB: '#e0a86c',
      colorSparkC: '#8a5c3c',
      colorSparkD: '#150a06',
      updraftRate: 320, // ash lifting off every place a slab has landed
      updraftRise: 1.1,
      updraftSpeed: 0.6,
      updraftLifetime: 4.5,
      updraftTurbulence: 1.6,
      colorUpdraftA: '#6b5a4c',
      colorUpdraftB: '#4a3d33',
      colorUpdraftC: '#2c241d',
      colorUpdraftD: '#100c09',
      smokeRate: 220,
      debrisRate: 90,

      lightIntensity: 8,
      lightRadius: 22,
      lightHeight: 0.1,
      lightColor: '#c98a4c',
      lightFlicker: 0.2,

      muzzleSize: 0.2,
      castFlash: 0.04,
      colorCastFlash: '#e0a86c',
      burstSize: 3.8,
      burstIntensity: 0.7,
      burstSparks: 60,
      ringRate: 0.3,
      impactShake: 0.5,
      shakeDuration: 0.9,
      impactFlash: 0.08,
      rumble: 0.05,
      colorBurstA: '#8a5c3c',
      colorBurstB: '#e0a86c',
      colorBurstC: '#fff0d8',
      colorFlash: '#e0a86c'
    }),

    /**
     * OBSIDIAN THORNS — the Verdant Rupture with the growth taken out of it.
     *
     * The Rupture's whole trick is `bend: 1.35`, which is what turns a prism
     * into a vine. Set it to nothing and the same generator makes volcanic
     * glass: dead straight, three-faceted, ground to a point (`taper: 0.03`) and
     * standing dead upright. So the count drops by three quarters and the size
     * triples — forty-odd enormous blades in a narrow lane instead of two
     * hundred thorns in a field — and where the Rupture erupts in a quarter of a
     * second, this heaves up over a full one and then does not move again.
     */
    obsidian: derive(verdant, {
      range: 15.0,
      minRange: 3.0,
      speed: 15.0,
      lifetime: 6.0,
      cooldown: 1.6,
      castAnim: 'cast1',

      widthNear: 0.35,
      width: 1.15, // a narrow lane, not a field
      widthCurve: 1.0,
      spikeCount: 46,
      clumping: 2.6,
      scatter: 0.25,
      frontBias: 1.0,

      heightNear: 1.6,
      height: 5.6,
      heightCurve: 0.75,
      heightJitter: 0.95,
      crown: 0.15,
      peak: 1.15,
      peakWidth: 0.5,
      rubble: 0.28,
      rubbleScale: 0.9,

      radius: 0.62,
      radiusJitter: 0.7,
      taper: 0.03, // ground to a point
      facets: 3, // a wedge, which is what a conchoidal fracture leaves
      roughness: 0.85,
      bend: 0.04, // the single change that stops it being a vine
      lean: 0.12,
      leanJitter: 0.7,
      twist: 1.0,

      riseTime: 1.05, // it heaves rather than erupts
      riseOvershoot: 0.04,
      riseStagger: 0.55,
      settle: 1.4,
      shatterDelay: 2.4,
      sinkTime: 2.8,

      colorDeep: '#050408',
      colorIce: '#16121e',
      colorRim: '#ff8a3c', // the one hot line on an otherwise black block
      colorCore: '#2a2136',
      opacity: 1.0,
      depthTint: 3.2,
      fresnel: 4.5,
      fresnelPower: 4.0,
      translucency: 0.15,
      envIntensity: 2.2, // glass: almost all of what you see is reflection
      facetSharp: 1.0,
      fracture: 0.9,
      fractureScale: 1.6,
      veins: 0.1,
      veinScale: 1.2,
      glint: 2.4,
      glintScale: 12.0,
      frostLine: 0.0, // nothing creeps up this one
      glow: 0.25,
      edgeGlow: 1.8,
      birthGlow: 3.4, // it comes up glowing and cools

      frostSpread: 2.2,
      frostRate: 1.8,
      frostLife: 12.0,
      frostIntensity: 0.5,
      frostCrystals: 0.3,
      colorFrost: '#3a2a22',
      colorFrostEdge: '#0c0806',
      shockRadius: 6.5,
      colorShockA: '#ff8a3c',
      colorShockB: '#2a2136',

      mistRate: 260,
      mistOpacity: 0.09,
      mistRise: 0.8,
      colorMistA: '#5c4a42',
      colorMistB: '#3a2f2a',
      colorMistC: '#20191a',
      colorMistD: '#080608',
      shardRate: 90,
      shardSize: 0.13,
      colorShardA: '#ffb06c',
      colorShardB: '#5c3a2a',
      colorShardC: '#241a1e',
      colorShardD: '#080608',
      sparkleRate: 70,
      sparkleSize: 0.05,
      sparkleRise: 0.6,
      colorSparkleA: '#ffd8a8',
      colorSparkleB: '#ff8a3c',
      colorSparkleC: '#6b3a1c',
      colorSparkleD: '#0a0606',

      lightIntensity: 5,
      lightRadius: 11,
      lightColor: '#ff7a2c',

      burstSize: 3.0,
      burstIntensity: 0.55,
      burstShards: 70,
      impactShake: 1.15,
      shakeDuration: 1.5,
      impactFlash: 0.1,
      rumble: 0.09,
      colorBurstA: '#3a2018',
      colorBurstB: '#ff8a3c',
      colorBurstC: '#ffd8a8',
      colorFlash: '#c96a2c'
    }),

    /**
     * TAR FALL — the Cinder Fall's rock, thrown wet and cold.
     *
     * The Rime Comet already took this engine somewhere: a big slow stone on a
     * high arc with a long vapour tail. This one goes the other way. It is
     * *flat* — a low, fast, almost horizontal throw of a small dense lump — and
     * where the Comet's trail is thin and luminous, this one's is short, fat and
     * almost pure absorption (`trailSoot` high, `trailGlow` low), so the tail
     * blots the stage out behind it instead of lighting it. It lands without a
     * flash and leaves the widest scorch in the library.
     */
    tarfall: derive(meteor, {
      range: 22.0,
      minRange: 3.0,
      speed: 34.0,
      arc: 0.55, // nearly flat — the read is a throw, not a lob
      arcCurve: 0.7,
      lifetime: 2.2,
      fadeTime: 2.6,
      cooldown: 1.5,
      castAnim: 'cast2',

      radius: 0.42,
      facets: 6,
      lumpiness: 0.7,
      lumpScale: 2.4,
      surfaceRoughness: 0.6,
      cuts: 3,
      cutDepth: 0.12,
      craters: 8,
      craterDepth: 0.4,
      spin: 0.35, // it barely turns: a wet lump, not a tumbling stone

      crackScale: 0.5,
      crackWidth: 0.14,
      crackGlow: 0.4,
      crackFlow: 1.8,
      rockScale: 1.2,
      cavity: 0.5,
      soot: 0.95,
      rimHeat: 0.05,
      leadGlow: 0.15,
      glow: 0.2,
      colorRock: '#12100f',
      colorChar: '#050403',
      colorCrack: '#6b4a2a',
      colorHot: '#c99a5c',

      trailSpan: 4.2,
      trailWidth: 2.6, // short and fat where the Comet's is long and thin
      trailHeadSize: 1.9,
      trailPlume: 0.35,
      trailRise: -0.4, // it sags off the back of the throw
      trailTurbulence: 0.7,
      trailSpeed: 0.9,
      trailBuoyancy: -1.2,
      trailDensity: 3.4,
      trailSoot: 4.2, // the signature: the tail is a hole in the stage
      trailGlow: 0.25,
      trailOpacity: 1.0,
      trailTailFade: 0.85,
      trailPalette: 1.0,
      trailTempCore: 0.3,
      trailTempEdge: 0.05,
      colorFlameMid: '#2a221c',
      colorFlameEdge: '#151110',
      colorFlameSmoke: '#050403',

      chunkCount: 14,
      chunkScale: 0.5,
      chunkCool: 0.5,
      chunkLinger: 4.0,
      chunkSink: 3.4,

      emberRate: 30,
      emberSpeed: 0.5,
      emberRise: -0.2,
      emberGlow: 0.3,
      colorEmberA: '#8a6a3c',
      colorEmberB: '#4a3a24',
      colorEmberC: '#241c14',
      colorEmberD: '#080605',
      colorSparkA: '#c99a5c',
      colorSparkB: '#6b4a2a',
      colorSparkC: '#2a1e14',
      colorSparkD: '#080605',
      smokeRate: 420, // more smoke than anything else in the library
      smokeSize: 2.6,
      smokeLifetime: 6.0,
      smokeOpacity: 0.24,
      smokeRise: 0.35,
      colorSmokeA: '#2e2823',
      colorSmokeB: '#211c19',
      colorSmokeC: '#15110f',
      colorSmokeD: '#0a0807',

      fissureRadius: 3.0,
      fissureLife: 12.0,
      fissureArms: 4,
      fissureWidth: 0.34,
      fissureHeat: 0.08,
      fissureGrowth: 2.5,
      scorchRadius: 6.8, // the widest mark in the library
      scorchLife: 16.0,
      scorchIntensity: 1.0,
      colorScorch: '#060504',
      shockRadius: 4.5,
      colorShockA: '#3a2e22',
      colorShockB: '#8a6a3c',

      lightIntensity: 4,
      lightRadius: 10,
      lightColor: '#8a5c2c',
      lightFlicker: 0.05,

      muzzleSize: 0.3,
      castFlash: 0.03,
      colorCastFlash: '#6b4a2a',
      burstSize: 3.4,
      burstIntensity: 0.35,
      burstEmbers: 40,
      burstSmoke: 340,
      impactShake: 0.9,
      shakeDuration: 1.1,
      impactFlash: 0.04,
      rumble: 0.06,
      colorFlash: '#4a3a24'
    }),

    /**
     * BRINE LANCE — the Frost Lance run as a seam rather than a field.
     *
     * The Lance flares to a two-and-a-half-metre half-width and stands three
     * metres tall; the Permafrost Wake widened that further and slowed it down.
     * This one does the opposite of both: the band closes to under a metre, the
     * count goes up by a third and `clumping` crowds all of it onto the centre
     * line, so what you get is a single crusted seam ripped along the floor at
     * nearly twice the Lance's speed. The crystals are short, four-sided and
     * needle-tipped with heavy rubble banked around them — salt, not ice — and
     * it is gone in a little over two seconds.
     */
    brine: derive(ice, {
      range: 22.0,
      minRange: 2.0,
      speed: 46.0, // the fastest front on this engine
      lifetime: 2.4,
      cooldown: 0.7,
      castAnim: 'cast2',

      widthNear: 0.22,
      width: 0.85,
      widthCurve: 1.45,
      spikeCount: 268, // near the 288 cap: the seam has to read as continuous
      clumping: 2.8, // everything crowded onto the centre line
      scatter: 0.2,
      frontBias: 0.45, // stacked toward the caster, thinning out downrange

      heightNear: 0.9,
      height: 1.9,
      heightCurve: 0.5, // up fast, then flat — a ridge, not a ramp
      heightJitter: 1.1,
      crown: 0.85,
      peak: 1.05,
      peakWidth: 0.12,
      rubble: 0.78, // mostly crust, with blades standing out of it
      rubbleScale: 0.55,

      radius: 0.2,
      radiusJitter: 1.3,
      taper: 0.1,
      facets: 4,
      roughness: 0.62,
      bend: 0.3,
      lean: 0.9, // raked hard downrange, like something ploughed
      leanJitter: 0.9,

      riseTime: 0.07, // it rips rather than grows
      riseOvershoot: 0.55,
      riseStagger: 0.02,
      settle: 0.3,
      shatterDelay: 0.2,
      sinkTime: 0.7,

      colorDeep: '#2a3a34',
      colorIce: '#cfe0d0',
      colorRim: '#ffffff',
      colorCore: '#8fae9c',
      opacity: 0.98,
      depthTint: 0.7,
      fresnel: 1.4,
      translucency: 0.55, // salt is packed, not clear
      envIntensity: 0.4,
      facetSharp: 0.95,
      fracture: 0.85,
      fractureScale: 14.0,
      veins: 0.9,
      veinScale: 9.0,
      glint: 2.2,
      glintScale: 52.0,
      glintSpeed: 2.4,
      frostLine: 0.95,
      glow: 0.5,
      edgeGlow: 0.7,
      birthGlow: 0.8,
      birthFade: 0.2,

      frostSpread: 0.85,
      frostRate: 9.0, // laid thickly along a narrow line
      frostLife: 5.0,
      frostIntensity: 1.0,
      frostCrystals: 3.2,
      colorFrost: '#eaf2e8',
      colorFrostEdge: '#6f8a80',
      shockRadius: 3.5,
      colorShockA: '#cfe0d0',
      colorShockB: '#ffffff',

      mistRate: 120,
      mistSize: 0.7,
      mistLifetime: 1.6,
      mistOpacity: 0.035,
      mistRise: 0.15,
      colorMistA: '#ffffff',
      colorMistB: '#d6e4d8',
      colorMistC: '#8fae9c',
      colorMistD: '#1c2a26',
      shardRate: 320, // the seam throws grit the whole way out
      shardSize: 0.05,
      shardSpeed: 11.0,
      shardLifetime: 0.9,
      shardGravity: -22.0,
      colorShardA: '#ffffff',
      colorShardB: '#cfe0d0',
      colorShardC: '#8fae9c',
      colorShardD: '#243430',
      sparkleRate: 240,
      sparkleSize: 0.035,
      sparkleRise: 0.4,
      sparkleTurbulence: 1.6,
      colorSparkleA: '#ffffff',
      colorSparkleB: '#eaf2e8',
      colorSparkleC: '#a8c4b4',
      colorSparkleD: '#1c2a26',

      lightIntensity: 6,
      lightRadius: 9,
      lightColor: '#cfe8d8',

      burstSize: 2.0,
      burstIntensity: 0.6,
      burstShards: 150,
      impactShake: 0.35,
      impactFlash: 0.09,
      shakeDuration: 0.35,
      rumble: 0.09, // the whole run rasps
      colorBurstA: '#8fae9c',
      colorBurstB: '#cfe0d0',
      colorBurstC: '#ffffff',
      colorFlash: '#eaf2e8'
    })
  };
}
