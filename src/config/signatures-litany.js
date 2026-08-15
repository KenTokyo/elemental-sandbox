/**
 * signatures-litany.js — the Brimstone Litany, five of the twenty added in V3.3.
 *
 * The library's yellows have always been *gold*: Emberforge's amber, Quartz
 * Bastion's honey monoliths, the Conclave's brass. This group takes the yellow
 * nobody wanted — sulphur and orpiment, the pigments that are poisonous — and
 * grades them down into ochre and brown smoke rather than up into white. That
 * decision shows up as a rule: no block here puts a bright core inside its
 * flame. `colorHot` stays at `#fffbd8` at most, the volumes run their soot high,
 * and the light is dirty. Sulphur burns with a blue-violet flame in life; here
 * it burns acid yellow, because the stage is already dark blue and the read has
 * to survive it.
 *
 *   Brimstone Vents   ← Magma Rift    (RiftAbility)
 *   Sulphur Sump      ← Gravity Well  (WellAbility)
 *   Orpiment Scythe   ← Spectral Blades (BladesAbility)
 *   Fulminate Whip    ← Storm Lance   (ThunderAbility)
 *   Ochre Pylon       ← Solar Spear   (SpearAbility)
 *
 * `magma` inherits the Cinder Fall's key set and has no `colorBurst*` family, so
 * `brimstone` does not set one; it would be a dead slider.
 */

import { derive } from './variants.js';
import { buildLitanyLashes } from './signatures-litany-lashes.js';

export function buildLitanySignatures(settings) {
  // `blades` and `thunder` are destructured in the lashes module, not here.
  const { magma, gravity, solar } = settings;

  return {
    /* ================================================================== */
    /* BRIMSTONE LITANY                                                    */
    /* ================================================================== */

    /**
     * BRIMSTONE VENTS — a line of low vents opening one after another.
     *
     * Every rift in the library ends with rock standing in it. Magma Rift raises
     * ninety basalt columns, Rimefault a hundred and twenty, Sepulchre Rift a
     * hundred and fifty at `MAX_BASALT`, and Sanguine Furrow sixty enormous
     * slabs. The stone *is* the silhouette on this engine.
     *
     * *Rebuilt in V3.4.* The first cut took that away with `basaltCount` 0 and
     * then had nothing to put in its place, so it pushed the two remaining
     * families to their limits at once: six jets at `jetHeight` 9.5 and
     * `jetWidth` 0.18 — nearly ten metres tall and a fifth of a metre wide, an
     * aspect ratio of about fifty to one — over cracks at `fissureHeat` 3.2 and
     * `fissureGrowth` 16. Six spikes that thin, that tall and that fast do not
     * read as venting ground; they read as an error, because nothing in the
     * scene is that slender, and with no stone at all there was no ground for
     * them to be venting *from*.
     *
     * The read comes back to the floor. The distinguishing move is now the
     * **walk**: `riftStagger` 0.3 is the slowest on the engine — Sepulchre Rift
     * is next at 0.24, Sanguine Furrow tears open at 0.02 — so five nodes open
     * in sequence down the line and you watch it travel rather than arrive.
     * `jetStagger` 0.22 puts the same delay inside each node.
     *
     * The jets stay at `MAX_JETS` but turn into what a vent actually is:
     * `jetHeight` 2.4 is the shortest on the engine and `jetWidth` 1.1 broad, so
     * each one is a low bloom of sulphur gas about twice as wide as it is tall.
     * `basaltCount` 40 at `basaltScale` 0.18, the smallest stone in the library,
     * comes back as *gravel* — enough for the ground to exist and be broken,
     * far short of the columns the other four raise.
     *
     * The volume stays gas rather than fire — `trailBuoyancy` 3.4 and
     * `trailPlume` 2.2 lift it off the floor without firing it at the ceiling,
     * at a palette weight of 0.4 so the authored sulphur yellow survives instead
     * of being ramped to orange.
     *
     * `magma` has no `colorBurst*` family, so there is nothing to override.
     */
    brimstone: derive(magma, {
      range: 21.0,
      minRange: 3.0,
      speed: 15.0,
      lifetime: 6.5,
      fadeTime: 3.0,
      cooldown: 2.4,
      castAnim: 'cast1',

      riftNodes: 5,
      riftRadius: 2.2,
      riftSpread: 0.3, // tight to the line, because the line is the read
      riftStagger: 0.3, // ... and the slowest walk down it on the engine

      jets: 6, // MAX_JETS
      jetHeight: 2.4, // the shortest on the engine ...
      jetWidth: 1.1, // ... and broad with it: a vent, not a needle
      jetStagger: 0.22,
      jetLife: 4.0,
      jetLean: 0.15,

      basaltCount: 40, // gravel, not columns — the ground still has to exist
      basaltScale: 0.18, // ... at the smallest stone in the library

      fissureRadius: 3.4,
      fissureLife: 12.0,
      fissureArms: 4,
      fissureWander: 1.8,
      fissureBranches: 0.8,
      fissureBranchLength: 1.0,
      fissureWidth: 0.28,
      fissureHeat: 1.6,
      fissurePulse: 1.4,
      fissureGrowth: 7.0,
      fissureRockSize: 0.22,

      radius: 0.7,
      facets: 5,
      lumpiness: 0.35,
      surfaceRoughness: 0.3,
      cuts: 7,
      craters: 9,
      spin: 2.0,
      chargeCurve: 0.5,
      crackScale: 1.4,
      crackWidth: 0.05,
      crackBranches: 0.9,
      crackGlow: 3.4,
      crackFlow: 0.9,
      crackFlowSpeed: 1.4,
      rockScale: 3.0,
      facetTint: 0.6,
      cavity: 0.45,
      soot: 0.8,
      rimHeat: 0.9,
      glow: 0.8,
      envIntensity: 1.0,
      colorRock: '#6a5a3a',
      colorChar: '#161206',
      colorCrack: '#e8d24a',
      colorHot: '#fffbd8',

      trailSpan: 3.0,
      trailWidth: 0.6,
      trailHeadSize: 0.9,
      trailPlume: 2.2, // it lifts off the floor ...
      trailRise: 1.0,
      trailBuoyancy: 3.4, // ... without being fired at the ceiling
      trailSpeed: 1.8,
      trailTurbulence: 2.4,
      trailWarp: 0.6,
      trailLick: 5.5,
      trailWisps: 1.6,
      trailShred: 1.4,
      trailDensity: 1.3,
      trailSoot: 2.2,
      trailCoreClarity: 0.5,
      trailGlow: 4.0,
      trailOpacity: 0.8,
      trailTempCore: 1680,
      trailTempEdge: 1240,
      trailPalette: 0.4, // the authored yellow survives the ramp
      trailTailFade: 0.55,
      trailBurnout: 2.0,
      trailSteps: 30,
      colorFlameMid: '#e8d24a',
      colorFlameEdge: '#8a6a1a',
      colorFlameSmoke: '#1a1608',

      scorchRadius: 3.0,
      scorchLife: 16.0,
      scorchIntensity: 0.95,
      colorScorch: '#0a0904',
      shockRadius: 6.0,
      colorShockA: '#a8752c',
      colorShockB: '#fffbd8',

      emberRate: 380, // the vent throws a lot of very small stuff
      emberSize: 0.06,
      emberSpeed: 3.0,
      emberLifetime: 3.4,
      emberRise: 4.5,
      emberGlow: 1.6,
      colorEmberA: '#fffbd8',
      colorEmberB: '#e8d24a',
      colorEmberC: '#8a6a1a',
      colorEmberD: '#141004',
      sparkRate: 90,
      sparkSize: 0.09,
      sparkSpeed: 5.5,
      colorSparkA: '#fffbd8',
      colorSparkB: '#f0c020',
      colorSparkC: '#8a6a1a',
      colorSparkD: '#161204',
      smokeRate: 300,
      smokeSize: 1.9,
      smokeLifetime: 5.5,
      smokeOpacity: 0.16,
      smokeRise: 1.5,
      colorSmokeA: '#6a5c3a',
      colorSmokeB: '#4a412a',
      colorSmokeC: '#2c2718',
      colorSmokeD: '#12100a',
      debrisSize: 0.05,
      debrisSpeed: 4.0,
      colorDebrisA: '#3a3422',
      colorDebrisB: '#221e14',

      chunkCount: 0,
      muzzleSize: 0.0,
      castFlash: 0.08,
      colorCastFlash: '#e8d24a',
      burstSize: 3.4,
      burstIntensity: 1.1,
      burstTurbulence: 2.4,
      burstEmbers: 320,
      burstSparks: 120,
      burstDebris: 40,
      burstSmoke: 200,
      impactShake: 0.8,
      shakeDuration: 1.8,
      impactFlash: 0.18,
      rumble: 0.07,
      colorFlash: '#e8d24a',

      lightIntensity: 20,
      lightRadius: 22,
      lightColor: '#e8d24a',
      lightFlicker: 0.55,
      lightFlickerSpeed: 14
    }),

    /**
     * SULPHUR SUMP — the well with nothing hanging in it.
     *
     * Four wells now stand in the library and each is built around a body:
     * Gravity Well's 1.15 sphere, Singularity Maw's throat at head height, Ash
     * Maw's flat lens, Lapis Gyre's enormous lit stone. The horizon mesh is the
     * subject every time.
     *
     * Here it is a detail. `horizonRadius` 0.35 is the smallest on the engine by
     * a factor of one and a half, `horizonHeight` 0.15 puts it on the floor and
     * `horizonGlow` 0.2 nearly extinguishes it — a bubble at the middle of a
     * basin, not an object. What you read instead is the **disc**: everything
     * that used to be an accretion plane is packed into the band between 0.9 and
     * 1.05 of the radius, right at the boundary, at `discWobble` 1.4 — two and a
     * half times anything else on the engine — so twenty ribbons slop around the
     * rim like the meniscus of a liquid.
     *
     * The ground wash is the other half and it is the fullest in the library:
     * `fieldFill` 0.85 with `fieldFalloff` 0.6, which is below one, so the
     * brightness gathers in the middle. Gravity Well sets that same term to 5 to
     * make the centre go black. This is the exact inverse: not a hole, a pool.
     *
     * `pullSpeed` 1.2 is the slowest intake on the engine and `pullSwirl` 8.5
     * the highest, so what goes in takes a long, flat spiral to get there, and
     * `pullSize` 0.18 makes those motes the largest — bubbles, not dust.
     */
    sulphur: derive(gravity, {
      range: 19.0,
      minRange: 0.0,
      zoneRadius: 5.8,
      speed: 38.0,
      snapTime: 0.6,
      lifetime: 8.0,
      fadeTime: 2.4,
      cooldown: 3.2,
      castAnim: 'cast1',

      horizonRadius: 0.35, // a bubble, not a body
      horizonHeight: 0.15,
      horizonSquash: 0.55,
      horizonWarp: 2.4,
      horizonSpin: 1.4,
      horizonScale: 4.5, // fine boil
      horizonRim: 0.6,
      horizonRimGain: 0.8,
      horizonOpacity: 0.55,
      horizonGlow: 0.2,
      horizonCollapse: 0.05,
      colorHorizonA: '#0e0c04',
      colorHorizonB: '#8a7420',
      colorHorizonC: '#e8d24a',

      discStrands: 20,
      discInner: 0.9,
      discOuter: 1.05, // the ribbons ride the rim, not the middle
      discTilt: 0.02,
      discSpin: 0.35,
      discWidth: 0.22,
      discTaper: 0.4,
      discWobble: 1.4, // ... and slop like a meniscus
      discDim: 0.6,
      discGlow: 1.2,
      colorDiscCore: '#fff0a0',
      colorDiscEdge: '#a8752c',
      colorDiscHalo: '#241c08',

      pullRadius: 2.6,
      pullRate: 240,
      pullSpeed: 1.2, // the slowest intake on the engine
      pullSwirl: 8.5, // ... on the longest spiral
      pullCollapse: -0.25,
      pullLifetime: 4.5,
      pullSize: 0.18, // bubbles, not dust
      colorPullA: '#fff0a0',
      colorPullB: '#e8d24a',
      colorPullC: '#8a6a1a',
      colorPullD: '#141004',

      fieldBoundary: 0.9,
      fieldBoundaryGlow: 1.3,
      fieldFill: 0.85, // the fullest ground wash in the library
      fieldFalloff: 0.6, // <1: it gathers in the middle — a pool, not a hole
      fieldVeins: 3.8,
      fieldVeinScale: 1.1,
      fieldVeinSharp: 0.35,
      fieldWarp: 1.4,
      fieldCrawl: 0.25,
      fieldRings: 1.0,
      fieldRingSpeed: 0.1,
      fieldSpokes: 0,
      fieldSpokeLength: 0.4,
      fieldSpin: 0.01,
      fieldCore: 0.0,
      fieldCoreSize: 0.5,
      fieldPulse: 0.5,
      fieldPulseSpeed: 0.8,
      colorField: '#a8752c',
      colorFieldEdge: '#e8d24a',

      strands: 0,
      tendrils: 0,
      rimArcs: 0, // nothing stands up out of it at all
      colorCore: '#fff0a0',
      colorInner: '#e8d24a',
      colorOuter: '#8a6a1a',
      colorHalo: '#141004',
      glow: 0.9,
      width: 0.05,

      arcRate: 0.0,
      arcRadius: 1.0,
      trailRate: 0.3,
      scorchRadius: 3.4,
      scorchLife: 16.0,
      scorchIntensity: 1.0,
      colorArc: '#e8d24a',
      colorEmber: '#a8752c',
      colorScorch: '#0a0904',
      shockRadius: 7.0,
      colorShockA: '#a8752c',
      colorShockB: '#fff0a0',

      sparkRate: 20,
      sparkSize: 0.11,
      sparkSpeed: 1.4,
      sparkLifetime: 2.0,
      sparkGravity: -4.0,
      colorSparkA: '#fff0a0',
      colorSparkB: '#e8d24a',
      colorSparkC: '#8a6a1a',
      colorSparkD: '#161204',
      updraftRate: 160,
      updraftSize: 0.13,
      updraftSpeed: 0.7,
      updraftRise: 0.9,
      updraftLifetime: 4.0,
      updraftInset: 0.5,
      updraftTurbulence: 0.4,
      colorUpdraftA: '#8a7420',
      colorUpdraftB: '#c8a83a',
      colorUpdraftC: '#fff0a0',
      colorUpdraftD: '#100e04',
      smokeRate: 380, // brown vapour standing over the basin
      smokeSize: 2.4,
      smokeSpeed: 0.8,
      smokeLifetime: 5.5,
      smokeOpacity: 0.18,
      smokeRise: 0.5,
      colorSmokeA: '#7a6a3a',
      colorSmokeB: '#544828',
      colorSmokeC: '#332c1a',
      colorSmokeD: '#14120a',
      debrisRate: 0,

      lightIntensity: 11,
      lightRadius: 20,
      lightHeight: 0.08,
      lightColor: '#c8a83a',
      lightFlicker: 0.28,
      lightFlickerSpeed: 5,

      muzzleSize: 0.4,
      castFlash: 0.05,
      colorCastFlash: '#c8a83a',
      burstSize: 4.0,
      burstIntensity: 0.8,
      burstSparks: 40,
      burstDebris: 0,
      pulseRate: 0.6,
      pulseSize: 3.4,
      pulseIntensity: 0.5,
      ringRate: 0.7,
      impactShake: 0.6,
      holdShake: 0.03,
      shakeDuration: 1.8,
      impactFlash: 0.08,
      rumble: 0.055,
      colorBurstA: '#8a6a1a',
      colorBurstB: '#e8d24a',
      colorBurstC: '#fff0a0',
      colorFlash: '#c8a83a'
    }),

    /**
     * OCHRE PYLON — the spear driven in and left standing.
     *
     * The three spears in the library are all about *height and speed*: Solar
     * Spear falls from twenty-six metres at 190 m/s, Sunforge Anvil from twelve
     * at 62, Pendulum Fall from thirty-four at 34. Each one arrives and is gone
     * — the longest of them holds for 1.6 s.
     *
     * This drops from **6.5 m**, half of the Anvil's, dead plumb (`spearTilt` 0,
     * the only zero on the engine), and then stands for four and a half seconds.
     * It is not a strike, it is a post being set.
     *
     * The shaft is the widest the engine has drawn — `radiusNear` 2.9 to
     * `radius` 2.6 at `radiusCurve` 0.9, so it barely tapers over its whole
     * length — with `flare` 0 removing the splash where it meets the floor. It
     * is cut off square at both ends. `streak` 2.4 at `streakScale` 1.6 and
     * `streakBands` 0.6 puts coarse horizontal banding up it: rammed earth,
     * laid in courses.
     *
     * `opacity` 0.72 against Solar Spear's 0.36 makes it dense enough to hide
     * what is behind it, and `glow` 0.5 keeps it from lighting the stage. Two
     * slow wide rings at the base and nothing else moving.
     */
    ochre: derive(solar, {
      range: 17.0,
      minRange: 0.0,
      zoneRadius: 4.0,
      charge: 0.35, // the shortest wind-up on the engine
      speed: 90.0,
      lifetime: 4.5, // ... and the only one that stands afterwards
      fadeTime: 1.8,
      cooldown: 2.6,
      castAnim: 'cast1',

      spearHeight: 6.5, // half the Anvil's drop, the lowest on the engine
      spearTilt: 0.0, // dead plumb — the only zero

      radiusNear: 2.9, // the widest shaft the engine has drawn
      radius: 2.6,
      radiusCurve: 0.9, // ... and it barely tapers
      flare: 0.0, // cut off square where it meets the floor
      flareWidth: 0.4,
      endHeight: 0.0,
      throb: 0.0,
      wander: 0.0,

      coreWidth: 0.7,
      coreSharp: 0.6,
      coreFill: 0.35,
      shellWidth: 1.3,
      shellRim: 0.7,
      shellFill: 0.55,
      shellOpacity: 0.9,
      haloWidth: 1.2,
      haloRim: 2.0,
      haloOpacity: 0.06,
      edgePower: 1.1,
      opacity: 0.72, // dense enough to hide what is behind it
      glow: 0.5,

      ripple: 0.0,
      streak: 2.4, // coarse courses laid up the shaft
      streakSharp: 0.9,
      streakScale: 1.6,
      streakBands: 0.6,
      streakGlow: 0.15,
      flowSpeed: 1.2,
      mouthGlow: 0.6,
      mouthLength: 0.2,
      tipGlow: 0.3,
      tipLength: 0.16,
      softFade: 0.4,

      coils: 0, // nothing is wound round it
      coilGlow: 1.0,
      colorCoil: '#e8b45a',
      colorCoilEdge: '#a8752c',

      rings: 2, // two slow wide rings at the base, and nothing else moving
      ringSpeed: 0.15,
      ringInner: 3.6,
      ringOuter: 4.0,
      ringSwell: 2.4,
      ringFade: 0.4,
      ringSharp: 1.0,
      ringGlow: 1.2,
      ringOpacity: 0.55,
      colorRing: '#c8953a',

      orbSize: 2.2, // the billet held overhead before it comes down
      orbThrob: 0.02,
      orbThrobSpeed: 1.0,
      orbTurbulence: 0.3,
      orbScale: 1.8,
      orbFlow: 0.4,
      orbBands: 1.5,
      orbRim: 1.4,
      orbGlow: 1.2,
      orbOpacity: 1.0,

      colorCore: '#fff0b8',
      colorInner: '#e8b45a',
      colorOuter: '#a8752c',
      colorHalo: '#1a1206',

      scorchRate: 2.0,
      scorchRadius: 2.6,
      scorchLife: 14.0,
      scorchIntensity: 1.0,
      colorScorch: '#0a0804',
      colorEmber: '#c8953a',
      dustRate: 40.0,
      dustRadius: 3.4,
      dustLife: 3.0,
      colorDustA: '#4a4028',
      colorDustB: '#d8b878',
      shockRate: 1.2,
      shockRadius: 7.5,
      colorShockA: '#a8752c',
      colorShockB: '#fff0b8',

      sparkRate: 60,
      sparkSize: 0.14,
      sparkSpeed: 3.0,
      sparkLifetime: 1.4,
      sparkGravity: -10.0,
      sparkForward: 0.2,
      colorSparkA: '#fff0b8',
      colorSparkB: '#e8b45a',
      colorSparkC: '#a8752c',
      colorSparkD: '#181004',
      moteRate: 140,
      moteSize: 0.07,
      moteSpeed: 0.8,
      moteRise: 0.6,
      colorMoteA: '#fff0b8',
      colorMoteB: '#c8953a',
      colorMoteC: '#7a5a20',
      colorMoteD: '#120e06',
      intakeRate: 60,
      intakeRadius: 3.0,
      intakeSpeed: 3.0,
      smokeRate: 260, // the dust a post throws when it is driven
      smokeSize: 2.0,
      smokeSpeed: 0.9,
      smokeLifetime: 4.5,
      smokeOpacity: 0.16,
      smokeRise: 0.4,
      colorSmokeA: '#6a5c40',
      colorSmokeB: '#4a412c',
      colorSmokeC: '#2e281c',
      colorSmokeD: '#12100a',
      debrisRate: 70,
      debrisSize: 0.08,
      debrisSpeed: 4.0,
      colorDebrisA: '#4a4028',
      colorDebrisB: '#2a2418',

      fieldBoundary: 0.7,
      fieldBoundaryGlow: 1.4,
      fieldFill: 0.4,
      fieldFalloff: 1.2,
      fieldVeins: 1.2,
      fieldVeinScale: 0.9,
      fieldWarp: 0.4,
      fieldCrawl: 0.08,
      fieldRings: 1.6,
      fieldRingSpeed: 0.15,
      fieldSpokes: 4,
      fieldSpokeLength: 1.4,
      fieldSpin: 0.0,
      fieldCore: 1.0,
      fieldCoreSize: 0.42,
      colorField: '#8a6a2a',
      colorFieldEdge: '#e8b45a',

      lightIntensity: 18,
      lightRadius: 16,
      lightColor: '#d8a850',
      lightPulse: 0.04,
      lightPulseSpeed: 0.9,
      muzzleLightIntensity: 8,

      chargeShake: 0.06,
      castFlash: 0.1,
      muzzleSize: 1.0,
      muzzleIntensity: 1.4,
      colorCastFlash: '#c8953a',
      burstSize: 4.6,
      burstIntensity: 1.4,
      burstSparks: 120,
      burstDebris: 160,
      pulseRate: 0.4,
      pulseSize: 3.0,
      pulseIntensity: 0.5,
      splashRate: 80,
      impactShake: 1.6,
      shakeDuration: 1.4,
      burnShake: 0.04,
      impactFlash: 0.22,
      rumble: 0.06,
      colorBurstA: '#a8752c',
      colorBurstB: '#e8b45a',
      colorBurstC: '#fff0b8',
      colorFlash: '#d8a850'
    }),

    // Orpiment Scythe and Fulminate Whip live in `signatures-litany-lashes.js` —
    // the two fast strokes of this group. Split ahead of time under the
    // 800-line rule in `AGENTS.md`.
    ...buildLitanyLashes(settings)
  };
}
