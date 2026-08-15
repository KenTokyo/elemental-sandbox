/**
 * signatures-assize-wards.js — the two Sanguine Assize blocks that stand over a
 * footprint instead of running down a line.
 *
 * Split out of `signatures-assize.js` ahead of time under the 800-line rule in
 * `AGENTS.md`. `signatures-assize.js` spreads the two below back into the same
 * object it returns, so the merge order in `settings.js` is untouched.
 *
 *   Carnelian Aegis ← Absolute Zero (DomeAbility)
 *   Ferrous Rose    ← Plasma Bloom  (BloomAbility)
 *
 * `plasma` inherits the Cinder Fall's key set and carries no `colorBurst*`
 * family, so `ferrous` does not set one — it would be a dead slider, not a fix.
 */

import { derive } from './variants.js';

export function buildAssizeWards(settings) {
  const { zero, plasma } = settings;

  return {
    /**
     * CARNELIAN AEGIS — the dome that does not break.
     *
     * Four shells already stand on this engine and between them they cover the
     * whole of *size × flatness × crystallisation*: Absolute Zero at 5.6 m and
     * `domeSquash` 0.74, Aurora Mantle at 6.4 and 1.45, Bell Rose at 3.6 and
     * 1.15 fully plated, Thunderhead at 8.0 and 0.34 with the plates almost
     * gone. There is no room left on those three axes, so this one opens a
     * fourth: **`domeShatter` 0**. Every other dome in the library comes apart
     * at the end. This one fades, and that single fact is what makes it a ward
     * rather than a cage.
     *
     * Around it the numbers all read "held": `domeSquash` 2.1 pulls the shell
     * into a pointed ogive far taller than Aurora's bell, `domeRise` 2.4 takes
     * two and a half seconds to close it — the slowest on the engine, half again
     * Thunderhead's and four times Absolute Zero's — and `domeOpacity` 0.34
     * makes it the most transparent, so you watch
     * the fight through it. `domeSpeed` 0.02 stops the surface pattern crawling:
     * carnelian is banded stone, and banded stone does not flow.
     *
     * It holds for 9.5 s, the longest hold in the library, and the rim under it
     * is a fence of leaning stakes (`rimLean` 0.55, `rimScatter` 0.3) rather
     * than the machined fluting Bell Rose seats on the same boundary.
     */
    carnelian: derive(zero, {
      range: 18.0,
      minRange: 0.0,
      zoneRadius: 4.4,
      speed: 42.0,
      snapTime: 0.44,
      lifetime: 9.5, // the longest hold in the library
      fadeTime: 2.6,
      shatterDelay: 1.2,
      shatterStagger: 0.9,
      sinkTime: 2.2,
      cooldown: 3.4,
      castAnim: 'cast3',

      domeRadius: 1.0,
      domeSquash: 2.1, // a pointed ogive, far taller than Aurora's bell
      domeRise: 2.4, // the slowest close on the engine
      domeScale: 2.6,
      domeSpeed: 0.02, // banded stone does not flow
      domePlates: 0.55,
      domeRim: 3.4,
      domeOpacity: 0.34, // the most transparent shell in the library
      domeGlow: 3.4, // ... and the brightest
      domeShatter: 0.0, // the only dome that does not come apart
      colorDomeA: '#1a0508',
      colorDomeB: '#c8202c',
      colorDomeC: '#ffd8cc',

      rimShards: 96,
      rimShardScale: 1.25,
      rimSeat: 0.92,
      rimScatter: 0.3, // a fence of stakes, not fluting
      rimLean: 0.55,

      spikeCount: 130,
      ringShare: 0.7,
      coreShare: 0.0,
      lateShare: 0.12,
      ringHeight: 2.2,
      skirtHeight: 1.0,
      ringWave: 0.55,
      ringLean: 0.5,
      leanJitter: 1.6,
      sweepTime: 0.7,
      stagger: 0.1,
      riseTime: 0.4,

      radius: 0.5,
      radiusJitter: 0.8,
      taper: 0.2,
      facets: 6,
      roughness: 0.25,
      colorGlass: '#2a0810',
      colorEdge: '#ffd8cc',
      colorPrismA: '#e8384a',
      colorPrismB: '#8a3a18',
      colorCore: '#c85060',
      colorTip: '#ffe8e0',
      body: 2.2,
      edgePower: 1.5,
      edgeGain: 1.0,
      dispersion: 0.3,
      pipe: 0.9,
      stria: 1.9, // the banding a carnelian is named for
      striaScale: 4.5,
      envIntensity: 1.4,
      specular: 3.0,
      glow: 0.8,
      opacity: 0.95,
      birthGlow: 1.8,
      birthFade: 1.0,

      fieldBoundary: 0.44,
      fieldBoundaryGlow: 2.0,
      fieldFill: 0.2,
      fieldFalloff: 2.0,
      fieldPlates: 0.6,
      fieldPlateScale: 1.8,
      fieldSeam: 0.5,
      fieldFingers: 0.4,
      fieldRings: 2.0,
      fieldRingSpeed: -0.2,
      fieldSweep: 0.3,
      fieldCore: 0.9,
      fieldCoreSize: 0.24,
      colorField: '#8a1420',
      colorFieldEdge: '#ffd8cc',

      veil: 0.35,
      veilHeight: 2.8,
      veilFlow: 0.08,
      veilErode: 0.4,
      colorVeil: '#8a3a30',
      colorVeilCrest: '#ffd8cc',

      frostSpread: 1.4,
      frostLife: 12.0,
      frostIntensity: 0.35,
      frostCrystals: 1.8,
      colorFrost: '#c89088',
      colorFrostEdge: '#4a1a18',
      rimeRate: 1.6,
      shockRadius: 6.0,
      ringRate: 0.4,
      colorShockA: '#c8202c',
      colorShockB: '#ffd8cc',

      mistRate: 200,
      mistSize: 1.6,
      mistOpacity: 0.05,
      mistRise: 0.22,
      colorMistA: '#c8a098',
      colorMistB: '#8a5a52',
      colorMistC: '#4a2a26',
      colorMistD: '#140808',
      shardSize: 0.07,
      shardSpeed: 4.0,
      breachShards: 2,
      shatterShards: 4,
      colorShardA: '#ffd8cc',
      colorShardB: '#e8384a',
      colorShardC: '#6a0f16',
      colorShardD: '#140808',
      glitterRate: 150,
      glitterRise: 0.9,
      colorGlitterA: '#ffe8e0',
      colorGlitterB: '#ff6a5a',
      colorGlitterC: '#c8202c',
      colorGlitterD: '#1a0508',
      snowRate: 0,

      lightIntensity: 16,
      lightRadius: 18,
      lightHeight: 1.6,
      lightColor: '#c8202c',

      muzzleSize: 0.5,
      castFlash: 0.08,
      colorCastFlash: '#e8384a',
      burstSize: 3.4,
      burstIntensity: 1.0,
      burstShards: 60,
      burstMist: 90,
      burstGlitter: 80,
      vapourRate: 1.2,
      impactShake: 0.7,
      shakeDuration: 2.0,
      holdShake: 0.006, // it is a ward: it should feel steady while it stands
      impactFlash: 0.2,
      rumble: 0.03,
      colorBurstA: '#8a1420',
      colorBurstB: '#e8384a',
      colorBurstC: '#ffd8cc',
      colorFlash: '#c8202c'
    }),

    /**
     * FERROUS ROSE — arms thrown up and folded back to the floor.
     *
     * *Rebuilt in V3.4.* This block was the one that read as broken, and it was:
     * `petalWidth` is the **radius of the raymarch hull** the petal is drawn
     * inside, not the width of a blade. The first cut set it to 1.8 while
     * `petalSpan` — the whole horizontal reach of the arm — was 2.6, so each
     * petal was a tube wider than the structure it belonged to. Three of them at
     * `petalCurve` 2.6 crested at u ≈ 0.77 and came back to `coreHeight`, which
     * was itself lifted to 3.4, so the entire flower floated between three and
     * eight metres with nothing under it and the three hulls merged into one
     * shapeless mass. That is the whole bug: not a wrong colour, a wrong unit.
     *
     * The fix is proportion first. `petalWidth` 0.55 against `petalSpan` 5.0 is
     * roughly one to nine — an arm, not a blob — and `coreHeight` 0.9 seats the
     * bud back on its own circle so the footprint reads as the base of
     * something rather than as a shadow.
     *
     * With the geometry sane, the free corner on this engine is the *return*.
     * Plasma Bloom lifts and holds, Halation throws flat and stays flat,
     * Nightshade droops 0.88 from a 1.2 lift — barely off the floor to begin
     * with. This one is the only bloom that goes properly *up* and then comes
     * all the way back: `petalLift` 3.2, the highest, against `petalDroop` 0.78,
     * so five arms are flung overhead and fold down to the ground on the far
     * side. `petalCurve` 0.5 throws the crest early, which is what makes an arm
     * look flung rather than lobbed.
     *
     * **Five** petals is a count no other bloom uses (4, 6, 6), and it is odd,
     * so no arm is ever hidden directly behind another.
     *
     * The strands lie back down with it: twelve at `strandTilt` 0.4 on a 1.5
     * radius, low and wide, tracing the circle the arms come down onto rather
     * than caging a bud that is no longer up there.
     *
     * `plasma` has no `colorBurst*` family, so there is nothing to override.
     */
    ferrous: derive(plasma, {
      range: 18.0,
      minRange: 0.0,
      zoneRadius: 5.2,
      speed: 40.0,
      snapTime: 0.4,
      lifetime: 5.0,
      fadeTime: 2.2,
      cooldown: 2.8,
      castAnim: 'cast1',

      coreSize: 1.3,
      coreHeight: 0.9, // the bud sits on its own circle, not above it
      corePulse: 0.08,
      corePulseSpeed: 1.6,
      coreTurbulence: 0.15,
      coreScale: 1.6,
      coreFlow: 0.5,
      coreBands: 2.0,
      coreRim: 3.6,
      coreGlow: 2.8, // cast iron, but lit enough to anchor the middle
      coreOpacity: 0.9,
      colorCoreA: '#3a0a10',
      colorCoreB: '#c8202c',
      colorCoreC: '#ffd8cc',

      petals: 5, // odd, so no arm hides behind another
      petalSpan: 5.0,
      petalWidth: 0.55, // hull radius ≈ 1/9 of the reach: an arm, not a blob
      petalLift: 3.2, // the highest throw on the engine ...
      petalCurve: 0.5, // ... crested early, so it reads as flung
      petalStagger: 0.14,
      petalOpen: 0.6,
      petalDroop: 0.78, // ... and folded all the way back to the floor

      strands: 12,
      strandRadius: 1.5,
      strandWidth: 0.06,
      strandTilt: 0.4, // low and wide: the ring the arms come down onto
      strandSpeed: 0.5,
      strandSpan: 0.5,
      strandDim: 1.0,
      strandGlow: 1.4,
      colorStrandCore: '#ffd8cc',
      colorStrandEdge: '#8a3a18',
      colorStrandHalo: '#1a0a08',

      trailWidth: 1.1,
      trailHeadSize: 1.4,
      trailPlume: 1.6,
      trailWakeSpread: 0.7,
      trailRise: 0.8,
      trailTurbulence: 1.8,
      trailWisps: 0.9,
      trailShred: 1.2,
      trailSpeed: 1.2,
      trailBuoyancy: 1.6,
      trailDensity: 2.2,
      trailSoot: 3.2, // rust smoke
      trailCoreClarity: 0.3,
      trailGlow: 1.6,
      trailOpacity: 0.92,
      trailTempCore: 1450,
      trailTempEdge: 1100,
      trailPalette: 0.5,
      trailTailFade: 0.4,
      trailBurnout: 1.8,
      trailSteps: 28,
      colorHot: '#ffb08a',
      colorFlameMid: '#8a3a18',
      colorFlameEdge: '#4a1810',
      colorFlameSmoke: '#140a08',

      fieldBoundary: 0.66,
      fieldBoundaryGlow: 1.5,
      fieldFill: 0.42,
      fieldFalloff: 1.3,
      fieldVeins: 2.2,
      fieldVeinScale: 1.3,
      fieldVeinSharp: 0.9,
      fieldWarp: 0.4,
      fieldCrawl: 0.1,
      fieldRings: 1.6,
      fieldRingSpeed: 0.2,
      fieldSpokes: 5, // one per petal
      fieldSpokeLength: 1.3,
      fieldSpin: 0.02,
      fieldCore: 1.1,
      fieldCoreSize: 0.2,
      colorField: '#6a2010',
      colorFieldEdge: '#e8384a',

      emberRate: 90,
      emberSize: 0.1,
      emberRise: 1.4,
      emberLifetime: 2.6,
      emberGlow: 0.7,
      colorEmberA: '#ffd8cc',
      colorEmberB: '#c8202c',
      colorEmberC: '#6a2010',
      colorEmberD: '#140808',
      sparkRate: 70,
      sparkSize: 0.13,
      sparkSpeed: 3.5,
      sparkLifetime: 1.4,
      colorSparkA: '#ffd8cc',
      colorSparkB: '#e8384a',
      colorSparkC: '#8a3a18',
      colorSparkD: '#160808',
      smokeRate: 240, // the flakes coming off it
      smokeSize: 1.7,
      smokeLifetime: 4.6,
      smokeOpacity: 0.15,
      smokeRise: 0.5,
      colorSmokeA: '#6a4a3a',
      colorSmokeB: '#48332a',
      colorSmokeC: '#2c211c',
      colorSmokeD: '#120c0a',

      scorchRadius: 2.0,
      scorchLife: 14.0,
      scorchIntensity: 0.9,
      colorScorch: '#0c0605',
      shockRadius: 5.5,
      colorShockA: '#8a3a18',
      colorShockB: '#ffd8cc',
      fissureRadius: 0.0,
      chunkCount: 0,

      lightIntensity: 14,
      lightRadius: 16,
      lightColor: '#c8402c',
      lightFlicker: 0.18,
      lightFlickerSpeed: 7,

      muzzleSize: 0.0,
      castFlash: 0.08,
      colorCastFlash: '#8a3a18',
      burstSize: 3.0,
      burstIntensity: 1.0,
      burstTurbulence: 1.4,
      burstEmbers: 140,
      burstSparks: 120,
      burstDebris: 0,
      burstSmoke: 160,
      impactShake: 0.6,
      shakeDuration: 1.4,
      impactFlash: 0.14,
      rumble: 0.03,
      colorFlash: '#c8402c'
    }),
  };
}
