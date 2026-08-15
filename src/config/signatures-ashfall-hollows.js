/**
 * signatures-ashfall-hollows.js — the two Ashfall blocks that open the floor.
 *
 * Split out of `signatures-ashfall.js` under the 800-line rule in `AGENTS.md`:
 * the five blocks of the group came to 861 lines together. Nothing moved but the
 * lines — `signatures-ashfall.js` spreads the two below back into the same object
 * it always returned, so the merge order in `settings.js` is untouched.
 *
 *   Sepulchre Rift  ← Magma Rift    (RiftAbility)
 *   Ash Maw         ← Gravity Well  (WellAbility)
 *
 * `magma` inherits the Cinder Falls key set and carries no `colorBurst*` family,
 * so `sepulcher` does not set one either — it would be a dead slider, not a fix.
 */

import { derive } from './variants.js';

export function buildAshfallHollows(settings) {
  const { magma, gravity } = settings;

  return {
    /**
     * SEPULCHRE RIFT — the tear laid out as a row of graves.
     *
     * Magma Rift lays five crack networks 2.6 m across down the line with a 0.55 m
     * lateral scatter, so the tear wanders. Rimefault lays seven and keeps them
     * cold. This one lays **eight** — `MAX_NODES` — at 1.4 m and a scatter of
     * 0.12, which is as close to a dead-straight line of separate holes as the
     * engine will go, and it walks them at nine metres a second with a quarter
     * second between each: you watch it open one at a time.
     *
     * Six jets, `MAX_JETS`, at six metres and a third of the Rift's width, raked
     * to exactly vertical — thin pale columns standing over the holes rather than
     * flame leaning downrange. The basalt runs at `MAX_BASALT`, the largest scale
     * on the engine, and takes two and a half seconds to sink.
     *
     * `magma` inherits the Cinder Fall's key set and has no `colorBurst*` family.
     */
    sepulcher: derive(magma, {
      range: 24.0, // the longest rift in the library
      minRange: 3.0,
      speed: 9.0, // it opens one grave at a time
      lifetime: 6.5,
      fadeTime: 2.6,
      cooldown: 2.6,
      castAnim: 'cast2',

      riftNodes: 8, // MAX_NODES
      riftRadius: 1.4,
      riftSpread: 0.12, // as straight as the engine goes
      riftStagger: 0.24,

      jets: 6, // MAX_JETS
      jetHeight: 6.2,
      jetWidth: 0.3,
      jetStagger: 0.3,
      jetLife: 4.0,
      jetLean: 0.0, // dead vertical: they stand, they do not stream

      basaltCount: 150, // MAX_BASALT
      basaltScale: 0.52,
      basaltLean: 0.14,
      basaltSpread: 1.05,
      basaltRise: 0.6,
      basaltSink: 2.4,

      fissureRadius: 1.6,
      fissureLife: 12.0,
      fissureArms: 3,
      fissureWander: 0.7,
      fissureBranches: 0.35,
      fissureBranchLength: 0.6,
      fissureWidth: 0.3,
      fissureHeat: 0.9,
      fissurePulse: 0.45,
      fissureGrowth: 5.0,
      fissureRockSize: 0.5,

      trailSpan: 2.4,
      trailWidth: 0.55,
      trailHeadSize: 1.0,
      trailPlume: 3.2, // it stands straight up
      trailRise: 1.2,
      trailBuoyancy: 6.5,
      trailSpeed: 1.6,
      trailTurbulence: 2.6,
      trailWarp: 0.5,
      trailLick: 4.2,
      trailWisps: 1.2,
      trailShred: 1.8,
      trailDensity: 1.5,
      trailSoot: 1.0,
      trailCoreClarity: 0.75,
      trailGlow: 3.4,
      trailOpacity: 0.85,
      trailTempCore: 2400,
      trailTempEdge: 1900,
      trailPalette: 0.95,
      trailTailFade: 0.6,
      trailBurnout: 2.2,
      trailSteps: 30,
      colorFlameMid: '#dfe8d0',
      colorFlameEdge: '#7fa88c',
      colorFlameSmoke: '#101410',

      colorRock: '#8a8478',
      colorChar: '#141412',
      colorCrack: '#d8f0c8',
      colorHot: '#ffffff',
      crackGlow: 2.2,
      crackWidth: 0.05,
      chargeCurve: 0.4,

      scorchRadius: 2.6,
      scorchLife: 14.0,
      scorchIntensity: 0.9,
      colorScorch: '#0b0c0a',
      shockRadius: 5.0,
      colorShockA: '#a8c8a0',
      colorShockB: '#eff6e8',

      emberRate: 160,
      emberSize: 0.08,
      emberSpeed: 1.6,
      emberRise: 3.4,
      emberLifetime: 2.8,
      emberGlow: 1.4,
      colorEmberA: '#ffffff',
      colorEmberB: '#d8f0c8',
      colorEmberC: '#6b8a72',
      colorEmberD: '#0e120e',
      sparkRate: 70,
      sparkSpeed: 4.0,
      colorSparkA: '#ffffff',
      colorSparkB: '#dfe8d0',
      colorSparkC: '#7fa88c',
      colorSparkD: '#141a14',
      smokeRate: 200,
      smokeSize: 1.6,
      smokeLifetime: 4.2,
      smokeOpacity: 0.13,
      smokeRise: 0.8,
      colorSmokeA: '#5a6058',
      colorSmokeB: '#3a4038',
      colorSmokeC: '#242824',
      colorSmokeD: '#121412',

      chunkCount: 0, // nothing is in flight — this one comes from below
      muzzleSize: 0.0,
      castFlash: 0.07,
      colorCastFlash: '#c8dcb8',
      burstSize: 2.6,
      burstIntensity: 0.9,
      burstEmbers: 180,
      burstSparks: 60,
      burstSmoke: 120,
      burstDebris: 40,
      impactShake: 0.9,
      shakeDuration: 2.0,
      impactFlash: 0.16,
      rumble: 0.11, // the highest continuous rumble in the library
      colorFlash: '#c8dcb8',

      lightIntensity: 16,
      lightRadius: 20,
      lightColor: '#a8d0a0',
      lightFlicker: 0.5,
      lightFlickerSpeed: 8
    }),

    /**
     * ASH MAW — the well laid down flat.
     *
     * Gravity Well hangs a sphere a metre and a half up with its accretion plane
     * raked 24°; Singularity Maw stands the same disc almost on end at head
     * height. This one puts it **on the floor**: `horizonHeight` 0.55,
     * `horizonSquash` 0.22 — a lens rather than a body — and `discTilt` 0.06,
     * which is as close to coplanar with the ground as the engine allows. Thirty-
     * six ribbons, `MAX_STRANDS`, reaching a quarter past the boundary.
     *
     * The other inversion is the ground disc. The Well sets `fieldFalloff` to 5
     * so the middle goes black, because the read is a hole. This one sets it to
     * 1.1 with `fieldFill` at 0.6: the dust *fills* the circle, because the read
     * is not an absence, it is a mouth full of ash. Nothing here is emissive —
     * `horizonGlow` 0.5, `discGlow` 1.1 — and the smoke rate is the highest of
     * any far cast in the library.
     */
    ashmaw: derive(gravity, {
      range: 21.0,
      minRange: 0.0,
      zoneRadius: 6.4,
      speed: 44.0,
      snapTime: 0.5,
      lifetime: 7.0,
      fadeTime: 1.8,
      cooldown: 3.0,
      castAnim: 'cast1',

      horizonRadius: 2.1,
      horizonHeight: 0.55, // it lies on the ground
      horizonSquash: 0.22, // a lens, not a body
      horizonWarp: 1.1,
      horizonSpin: 0.28,
      horizonScale: 1.4,
      horizonRim: 1.4,
      horizonRimGain: 1.8,
      horizonOpacity: 0.9,
      horizonGlow: 0.5,
      horizonCollapse: 0.75,
      colorHorizonA: '#0c0a08',
      colorHorizonB: '#7a6a56',
      colorHorizonC: '#e8d8b8',

      discStrands: 36, // MAX_STRANDS
      discInner: 0.12,
      discOuter: 1.24, // it reaches past its own boundary
      discTilt: 0.06, // almost coplanar with the floor
      discSpin: -0.55,
      discWidth: 0.09,
      discTaper: 1.2,
      discWobble: 0.5,
      discDim: 0.85,
      discGlow: 1.1,
      colorDiscCore: '#f2e6cc',
      colorDiscEdge: '#a89070',
      colorDiscHalo: '#2a2018',

      pullRadius: 1.6,
      pullRate: 420,
      pullSpeed: 4.0,
      pullSwirl: 5.5,
      pullCollapse: -0.7,
      pullLifetime: 2.6,
      pullSize: 0.11,
      colorPullA: '#e8d8b8',
      colorPullB: '#a89070',
      colorPullC: '#5c4c3a',
      colorPullD: '#161210',

      fieldBoundary: 0.7,
      fieldBoundaryGlow: 1.4,
      fieldFill: 0.6,
      fieldFalloff: 1.1, // the dust fills the circle — this is not a hole
      fieldVeins: 1.4,
      fieldVeinScale: 0.9,
      fieldVeinSharp: 0.4,
      fieldWarp: 1.2,
      fieldCrawl: -0.4,
      fieldRings: 2.2,
      fieldRingSpeed: -0.6,
      fieldSpokes: 12,
      fieldSpokeLength: 0.7,
      fieldSpin: -0.05,
      fieldCore: 0.5,
      fieldCoreSize: 0.4,
      colorField: '#8a7458',
      colorFieldEdge: '#f2e6cc',

      strands: 0,
      tendrils: 0,
      rimArcs: 3,
      rimSpeed: -0.4,
      rimHeight: 0.15,
      rimWidth: 1.8,
      rimDim: 0.5,
      colorCore: '#fff4e0',
      colorInner: '#e8d8b8',
      colorOuter: '#a89070',
      colorHalo: '#1a1410',
      glow: 1.0,
      width: 0.05,

      arcRate: 0.4,
      arcRadius: 1.6,
      arcLife: 1.2,
      arcIntensity: 0.4,
      trailRate: 0.5,
      scorchRadius: 3.0,
      scorchLife: 12.0,
      scorchIntensity: 0.7,
      colorArc: '#e8d8b8',
      colorEmber: '#c8a878',
      colorScorch: '#0c0a07',
      shockRadius: 10.0,
      colorShockA: '#a89070',
      colorShockB: '#f2e6cc',

      sparkRate: 30,
      sparkSpeed: 2.5,
      colorSparkA: '#f2e6cc',
      colorSparkB: '#c8b088',
      colorSparkC: '#7a6a56',
      colorSparkD: '#1a1512',
      updraftRate: 0, // nothing rises here either
      smokeRate: 320, // the haziest far cast in the library
      smokeSize: 2.2,
      smokeSpeed: 1.0,
      smokeLifetime: 5.0,
      smokeOpacity: 0.16,
      smokeRise: 0.3,
      colorSmokeA: '#8a7c6c',
      colorSmokeB: '#5c5248',
      colorSmokeC: '#3a332c',
      colorSmokeD: '#181512',
      debrisRate: 90,
      debrisSize: 0.07,
      debrisSpeed: 1.4,
      debrisGravity: -6.0,
      colorDebrisA: '#3a332c',
      colorDebrisB: '#28231e',

      lightIntensity: 9,
      lightRadius: 22,
      lightHeight: 0.12,
      lightColor: '#c8b088',
      lightFlicker: 0.06,

      muzzleSize: 0.35,
      castFlash: 0.05,
      colorCastFlash: '#e8d8b8',
      burstSize: 4.4,
      burstIntensity: 0.9,
      burstSparks: 60,
      burstDebris: 140,
      pulseRate: 0.5,
      pulseSize: 2.4,
      pulseIntensity: 0.4,
      ringRate: 1.2,
      impactShake: 0.9,
      holdShake: 0.06,
      shakeDuration: 1.6,
      impactFlash: 0.08,
      rumble: 0.05,
      colorBurstA: '#a89070',
      colorBurstB: '#e8d8b8',
      colorBurstC: '#fff4e0',
      colorFlash: '#d8c4a0'
    }),
  };
}
