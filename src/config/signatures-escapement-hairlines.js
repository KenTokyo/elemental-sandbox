/**
 * signatures-escapement-hairlines.js — the two Quicksilver Escapement blocks
 * that are drawn as a line rather than stood in a circle.
 *
 * Split out of `signatures-escapement.js` ahead of time under the 800-line rule
 * in `AGENTS.md`. The parent module spreads the two below back into the same
 * object it returns, so the merge order in `settings.js` is untouched.
 *
 *   Quicksilver Thread ← Nova Beam  (BeamAbility)
 *   Amalgam Weld       ← Frost Lance (IceAbility)
 *
 * `ice` owns no `fadeTime` and no `zoneRadius`: a crystal field resolves through
 * `shatterDelay` → `sinkTime` and a line cast has no footprint. Neither is set
 * below, because a key the base does not have is a slider no engine reads.
 */

import { derive } from './variants.js';

export function buildEscapementHairlines(settings) {
  const { beam, ice } = settings;

  return {
    /**
     * QUICKSILVER THREAD — the beam that will not hold still.
     *
     * Nine ids run on this engine and every single one of them is a *straight
     * line*: `wander` is 0 on the Nova Beam, Void Rail, Solar Spear, Choral Ray,
     * Eclipse Column, Sunforge Anvil, Lumen Spire, Arc Light and Pendulum Fall
     * alike. It is the one term the base block ships switched off, and turning
     * it on is the whole ability — `wander` 1.0 at `wanderScale` 1.8 and
     * `wanderSpeed` 2.6 snakes the column between the hand and the target
     * instead of ruling it.
     *
     * `throb` is the second term this pushes past everyone. Four beams breathe a
     * little — Choral Ray 0.14, Sunforge Anvil 0.22, Eclipse Column and Arc
     * Light 0.35 — and none of them past a third. At 0.55 with `throbScale` 9.0
     * the radius beads along the length, and beading plus snaking is exactly what
     * a thread of mercury on a wire does: it cannot decide whether it is one
     * column or a row of drops.
     *
     * The surface finishes the read. `edgePower` 3.4 with `shellRim` 3.4 and
     * `shellFill` 0.06 puts nearly all the brightness in a hard mirror rim and
     * leaves the interior almost empty, and `opacity` 0.85 against the Nova
     * Beam's 0.29 makes it the second most solid beam in the library, behind
     * only Eclipse Column's disc. Liquid metal reads by its silhouette, not by
     * its glow — which is also why `coils` is 0. There is no cage. There is a
     * surface.
     */
    quicksilver: derive(beam, {
      range: 24.0,
      minRange: 3.0,
      charge: 0.5,
      speed: 120.0,
      lifetime: 2.0,
      fadeTime: 0.8,
      cooldown: 1.9,
      castAnim: 'cast2',
      endHeight: 1.1,

      radiusNear: 0.22,
      radius: 0.28,
      radiusCurve: 1.6,
      flare: 0.9,
      flareWidth: 0.2,
      throb: 0.55, // the radius beads along the length
      throbScale: 9.0,
      throbSpeed: 5.5,
      wander: 1.0, // the only beam in the library that is not a straight line
      wanderScale: 1.8,
      wanderSpeed: 2.6,

      coreWidth: 0.36,
      coreSharp: 0.7,
      coreFill: 0.95,
      shellWidth: 0.7,
      shellRim: 3.4, // a hard mirror rim
      shellFill: 0.06, // ... and almost nothing inside it
      shellOpacity: 1.0,
      haloWidth: 1.6,
      haloRim: 2.6,
      haloOpacity: 0.08,
      edgePower: 3.4,
      opacity: 0.85, // the only near-solid beam in the library
      glow: 0.9,

      ripple: 0.9,
      rippleBands: 7.0,
      rippleScale: 9.0,
      rippleSpeed: 4.5,
      streak: 0.15,
      streakGlow: 0.1,
      flowSpeed: 3.0,
      mouthGlow: 1.1,
      mouthLength: 0.14,
      tipGlow: 1.4,
      tipLength: 0.12,
      softFade: 0.5,

      coils: 0, // no cage — the surface is the effect
      coilTurns: 0.4,
      coilGlow: 2.0,
      colorCoil: '#dfe6ee',
      colorCoilEdge: '#5f7a99',

      rings: 3,
      ringSpeed: 0.8,
      ringInner: 1.4,
      ringOuter: 1.55,
      ringSwell: 0.9,
      ringFade: 0.3,
      ringSharp: 1.2,
      ringGlow: 1.6,
      ringOpacity: 0.5,
      colorRing: '#b6c6d8',

      orbSize: 0.52,
      orbThrob: 0.55, // the charge beads in the hand too
      orbThrobSpeed: 3.2,
      orbTurbulence: 0.05,
      orbScale: 1.4,
      orbFlow: 0.4,
      orbBands: 2.0,
      orbRim: 3.0,
      orbGlow: 1.8,
      orbOpacity: 1.0,

      colorCore: '#f6fbff',
      colorInner: '#dfe6ee',
      colorOuter: '#7f96b0',
      colorHalo: '#0c1118',

      scorchRate: 0.5,
      scorchRadius: 0.5,
      scorchLife: 5.0,
      scorchIntensity: 0.25,
      colorScorch: '#0a0e14',
      colorEmber: '#9fb0c4',
      dustRate: 6.0,
      dustRadius: 1.4,
      colorDustA: '#3a4452',
      colorDustB: '#c4d0dc',
      shockRate: 2.0,
      shockRadius: 5.0,
      colorShockA: '#9fb0c4',
      colorShockB: '#ffffff',

      sparkRate: 200,
      sparkSize: 0.1,
      sparkSpeed: 6.0,
      sparkLifetime: 0.7,
      sparkGravity: -14.0,
      sparkStretch: 0.1, // droplets, not streaks
      sparkForward: 0.5,
      colorSparkA: '#ffffff',
      colorSparkB: '#dfe6ee',
      colorSparkC: '#7f96b0',
      colorSparkD: '#141a22',
      moteRate: 110,
      moteSize: 0.045,
      moteSpeed: 1.1,
      moteRise: 0.5,
      colorMoteA: '#f6fbff',
      colorMoteB: '#c4d0dc',
      colorMoteC: '#5f7a99',
      colorMoteD: '#0c1118',
      intakeRate: 200,
      intakeRadius: 2.0,
      intakeSpeed: 6.0,
      smokeRate: 0,
      debrisRate: 20,
      debrisSize: 0.05,
      debrisSpeed: 3.0,
      colorDebrisA: '#3a4452',
      colorDebrisB: '#1a222c',

      lightIntensity: 24,
      lightRadius: 17,
      lightColor: '#a8c0e0',
      lightPulse: 0.3,
      lightPulseSpeed: 5.5,
      muzzleLightIntensity: 12,
      muzzleLightRadius: 7,

      chargeShake: 0.03,
      castFlash: 0.14,
      muzzleSize: 0.8,
      muzzleIntensity: 1.6,
      colorCastFlash: '#dfe6ee',
      burstSize: 3.0,
      burstIntensity: 1.2,
      burstSparks: 240,
      burstDebris: 40,
      pulseRate: 1.6,
      pulseSize: 1.6,
      pulseIntensity: 0.8,
      splashRate: 300,
      impactShake: 0.5,
      shakeDuration: 0.5,
      burnShake: 0.03,
      impactFlash: 0.2,
      rumble: 0.01,
      colorBurstA: '#5f7a99',
      colorBurstB: '#dfe6ee',
      colorBurstC: '#ffffff',
      colorFlash: '#dfe6ee'
    }),

    /**
     * AMALGAM WELD — the crystal field poured instead of grown.
     *
     * Seven ids run on the ice engine and they cover the field from Brine
     * Lance's 268 needles in an 0.85 m lane to Cinder Veil's 288-piece bed six
     * metres wide. The one thing every one of them shares is *fracture*: values
     * from 0.62 to 1.0, because the engine's read has always been broken stone
     * or grown crystal.
     *
     * This is neither. `fracture` 0 and `veins` 0 are the only zeroes on the
     * engine; `rubble` 0 removes the last of the debris; `translucency` 0 stops
     * light passing through at all. What is left is a surface — `fresnel` 4.5 at
     * `fresnelPower` 1.2 for a rim that wraps almost the whole silhouette,
     * `envIntensity` 3.2, and `glint` 3.4 at `glintScale` 12 so the highlights
     * are few, large and slow rather than the fine sparkle every other block
     * here uses.
     *
     * The silhouette is a seam. `width` 0.5 is the narrowest lane on the engine,
     * `spikeCount` 24 by far the fewest (the next is Obsidian Thorns at 46), and
     * `clumping` 2.4 sits with the two other tight lanes at the top of the
     * range, which pulls all twenty-four hard onto the centre line — the
     * difference is that they have 46 and 268 bodies to pack, and this has 24.
     * `radius` 1.05 makes them the largest bodies the engine has
     * made and `facets` 12 the roundest. Two dozen fat mirror beads in a single
     * file, and `riseOvershoot` 0.6 makes each one well up past its height and
     * settle back, the way a bead of solder does.
     */
    amalgam: derive(ice, {
      range: 18.0,
      minRange: 2.0,
      speed: 34.0,
      lifetime: 5.5,
      cooldown: 1.2,
      castAnim: 'cast1',

      widthNear: 0.35,
      width: 0.5, // the narrowest lane on the engine
      widthCurve: 1.2,
      spikeCount: 24, // ... and by far the fewest bodies
      density: 1.0,
      clumping: 2.4, // pulled hard onto the centre line
      scatter: 0.1,
      frontBias: 1.4,

      heightNear: 1.2,
      height: 2.6,
      heightCurve: 1.0,
      heightJitter: 0.45,
      crown: 0.0,
      peak: 1.15,
      peakWidth: 0.35,
      rubble: 0.0, // nothing broke: this was poured
      rubbleScale: 0.3,

      radius: 1.05, // the largest crystal body on the engine
      radiusJitter: 0.25,
      taper: 0.95, // ... nearly parallel-sided
      facets: 12, // ... and the roundest section it can make
      roughness: 0.0,
      bend: 0.0,
      lean: 0.0,
      leanJitter: 0.15,
      twist: 0.2,

      riseTime: 0.5,
      riseOvershoot: 0.6, // each bead wells past its height and settles back
      riseStagger: 0.25,
      settle: 0.35,
      shatterDelay: 3.5,
      sinkTime: 2.0,

      colorDeep: '#0c1118',
      colorIce: '#9fb0c4',
      colorRim: '#f6fbff',
      colorCore: '#5f7a99',
      opacity: 1.0,
      depthTint: 0.2,
      fresnel: 4.5, // the rim wraps almost the whole silhouette
      fresnelPower: 1.2,
      translucency: 0.0, // mercury transmits nothing
      envIntensity: 3.2,
      facetSharp: 0.15,
      fracture: 0.0, // the only unfractured block on the engine
      fractureScale: 6.5,
      veins: 0.0,
      veinScale: 3.2,
      glint: 3.4,
      glintScale: 12.0, // few, large, slow highlights
      glintSpeed: 0.15,
      frostLine: 0.0,
      glow: 0.35,
      edgeGlow: 2.6,
      birthGlow: 2.8,
      birthFade: 0.7,

      frostSpread: 0.8,
      frostRate: 1.2,
      frostLife: 9.0,
      frostIntensity: 0.3,
      frostCrystals: 0.4,
      colorFrost: '#c4d0dc',
      colorFrostEdge: '#3a4452',
      shockRadius: 4.0,
      colorShockA: '#7f96b0',
      colorShockB: '#f6fbff',

      mistRate: 60,
      mistSize: 1.0,
      mistSpeed: 0.5,
      mistLifetime: 2.4,
      mistOpacity: 0.025,
      mistRise: 0.1,
      colorMistA: '#d8e2ec',
      colorMistB: '#9fb0c4',
      colorMistC: '#4a5666',
      colorMistD: '#0c1118',
      shardRate: 90,
      shardSize: 0.075,
      shardSpeed: 2.2,
      shardLifetime: 1.6,
      shardGravity: -13.0, // the beads that come off it are heavy
      colorShardA: '#f6fbff',
      colorShardB: '#b6c6d8',
      colorShardC: '#5f7a99',
      colorShardD: '#0c1118',
      sparkleRate: 90,
      sparkleSize: 0.06,
      sparkleSpeed: 0.9,
      sparkleLifetime: 2.0,
      sparkleRise: 0.25,
      sparkleTurbulence: 0.15,
      colorSparkleA: '#ffffff',
      colorSparkleB: '#dfe6ee',
      colorSparkleC: '#7f96b0',
      colorSparkleD: '#101720',

      lightIntensity: 11,
      lightRadius: 13,
      lightColor: '#8fa8c8',

      burstSize: 2.4,
      burstIntensity: 0.9,
      burstShards: 60,
      impactShake: 0.55,
      impactFlash: 0.16,
      shakeDuration: 0.8,
      rumble: 0.035,
      colorBurstA: '#5f7a99',
      colorBurstB: '#c4d0dc',
      colorBurstC: '#ffffff',
      colorFlash: '#dfe6ee'
    }),
  };
}
