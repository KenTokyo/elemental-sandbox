/**
 * signatures-assize.js — the Sanguine Assize, five of the twenty added in V3.3.
 *
 * The library had warm groups before — Emberforge is amber, Ashfall is banked
 * ember, Cataclysm is orange flame — but every one of them is *fire*, and fire
 * in this project means a black-body ramp: `trailPalette` near 1 and a colour
 * temperature in kelvin doing the work. This group is the first warm one that is
 * not burning. Oxblood, vermilion, garnet and wet iron are **pigment**, so every
 * volume here runs its palette weight *down* (0.15–0.5) and states its colours
 * outright, and every emissive gain is held low enough that the read stays dark
 * red rather than sliding to orange.
 *
 *   Sanguine Furrow  ← Magma Rift      (RiftAbility)
 *   Vermilion Shears ← Spectral Blades (BladesAbility)
 *   Garnet Bolide    ← Cinder Fall     (MeteorAbility)
 *   Carnelian Aegis  ← Absolute Zero   (DomeAbility)
 *   Ferrous Rose     ← Plasma Bloom    (BloomAbility)
 *
 * Three of these five sit on the Cinder Fall's key set (`magma`, `meteor` and
 * `plasma` all inherit it) and therefore have **no `colorBurst*` family** — they
 * tint their shells straight off the flame palette. `sanguine`, `garnet` and
 * `ferrous` accordingly do not set one; adding it would be a dead slider.
 *
 * Same rule as everywhere else in V3.3: differ from *every* sibling on the
 * engine, not just from the block derived from. Each comment names the ones it
 * is being held apart from.
 */

import { derive } from './variants.js';
import { buildAssizeWards } from './signatures-assize-wards.js';

export function buildAssizeSignatures(settings) {
  // `zero` and `plasma` are destructured in the wards module, not here.
  const { magma, blades, meteor } = settings;

  return {
    /* ================================================================== */
    /* SANGUINE ASSIZE                                                     */
    /* ================================================================== */

    /**
     * SANGUINE FURROW — the rift as one wound instead of a row of holes.
     *
     * The three rifts in the library are a progression toward *more, smaller and
     * straighter*: Magma Rift opens five crack networks 2.6 m across with a
     * 0.55 lateral scatter, Rimefault seven at 2.0 and 0.28, Sepulchre Rift
     * eight at 1.4 and 0.12 — a dead-straight line of separate graves. There is
     * only one direction left, and this takes it: **three** networks at 4.2 m,
     * the largest on the engine, with `riftSpread` 1.35, the widest wander, and
     * `riftStagger` 0.02 so all three tear open on the same beat. It does not
     * walk down the line, it splits the floor at once.
     *
     * The jets invert too. Sepulchre Rift stands six thin columns dead vertical;
     * this has **two**, `jetWidth` 2.4 — twice the widest jet the engine had
     * (Rimefault's 1.2) — at 2.2 m tall and raked 0.75 downrange. That is not a column
     * of flame, it is a sheet of it lying in the trench.
     *
     * And it is fast. `speed` 22 makes it the quickest rift in the library, so
     * the split outruns you; the basalt is the largest anywhere on the engine
     * (`basaltScale` 0.95) and there are only sixty of it — heaved plates rather
     * than gravel. Brimstone Vents lays fewer since V3.4 — forty — but at
     * `basaltScale` 0.18, which is scree; nothing else on the engine heaves
     * stone this size.
     *
     * `magma` carries no `colorBurst*` family, so there is nothing to override.
     */
    sanguine: derive(magma, {
      range: 20.0,
      minRange: 2.5,
      speed: 22.0, // the fastest rift in the library
      lifetime: 5.2,
      fadeTime: 2.2,
      cooldown: 2.0,
      castAnim: 'cast2',

      riftNodes: 3, // the fewest — and the largest
      riftRadius: 4.2,
      riftSpread: 1.35, // it staggers off the line rather than following it
      riftStagger: 0.02, // all three open on the same beat

      jets: 2,
      jetHeight: 2.2, // low
      jetWidth: 2.4, // ... and wide: a sheet lying in the trench
      jetStagger: 0.05,
      jetLife: 5.0,
      jetLean: 0.75, // raked hard downrange

      basaltCount: 60, // few — only Brimstone Vents lays fewer, and that is scree
      basaltScale: 0.95, // ... and the largest: heaved plates, not gravel
      basaltLean: 0.9,
      basaltSpread: 2.2,
      basaltRise: 0.18,
      basaltSink: 3.4,

      fissureRadius: 4.5,
      fissureLife: 13.0,
      fissureArms: 2,
      fissureWander: 3.2, // two long crooked runs, not a star
      fissureBranches: 0.35,
      fissureBranchLength: 1.4,
      fissureWidth: 0.55, // the widest crack on the engine
      fissureHeat: 2.6,
      fissurePulse: 0.7,
      fissureGrowth: 14.0,
      fissureRockSize: 0.6,

      radius: 0.9,
      facets: 4,
      lumpiness: 0.5,
      surfaceRoughness: 0.4,
      cuts: 5,
      cutDepth: 0.35,
      craters: 2,
      spin: 1.2,
      chargeCurve: 0.35,
      crackScale: 0.55,
      crackWidth: 0.11,
      crackBranches: 0.3,
      crackGlow: 2.4,
      crackFlow: 0.25,
      crackFlowSpeed: 0.35,
      rockScale: 2.6,
      facetTint: 0.9,
      cavity: 0.4,
      soot: 1.1,
      rimHeat: 1.1,
      leadGlow: 0.6,
      glow: 0.6,
      envIntensity: 1.5,
      colorRock: '#4a4038', // wet iron
      colorChar: '#0e0a0a',
      colorCrack: '#e02030',
      colorHot: '#ff8a7a',

      trailSpan: 2.8,
      trailWidth: 0.85,
      trailHeadSize: 0.9,
      trailPlume: 1.4,
      trailRise: 0.6,
      trailBuoyancy: 2.2,
      trailSpeed: 1.1,
      trailTurbulence: 3.6,
      trailWarp: 0.7,
      trailLick: 2.2,
      trailWisps: 1.4,
      trailShred: 2.2,
      trailDensity: 2.4,
      trailSoot: 2.8,
      trailCoreClarity: 0.35,
      trailGlow: 2.0,
      trailOpacity: 0.95,
      trailTempCore: 1150, // dull red — this is pigment, not a furnace
      trailTempEdge: 900,
      trailPalette: 0.35, // ... so the authored colours carry most of it
      trailTailFade: 0.35,
      trailBurnout: 2.6,
      trailSteps: 30,
      colorFlameMid: '#8a1420',
      colorFlameEdge: '#3a0a10',
      colorFlameSmoke: '#120608',

      scorchRadius: 3.4,
      scorchLife: 15.0,
      scorchIntensity: 1.0,
      colorScorch: '#0a0505',
      shockRadius: 8.0,
      colorShockA: '#8a1420',
      colorShockB: '#ffd8cc',

      emberRate: 200,
      emberSize: 0.11,
      emberSpeed: 1.8,
      emberLifetime: 2.6,
      emberRise: 1.6,
      emberGlow: 0.8,
      colorEmberA: '#ffd8cc',
      colorEmberB: '#c8202c',
      colorEmberC: '#6a0f16',
      colorEmberD: '#140808',
      sparkRate: 220,
      sparkSize: 0.16,
      sparkSpeed: 7.5,
      sparkGravity: -14.0,
      colorSparkA: '#ffd8cc',
      colorSparkB: '#e8384a',
      colorSparkC: '#8a1420',
      colorSparkD: '#180808',
      smokeRate: 220,
      smokeSize: 1.5,
      smokeLifetime: 4.4,
      smokeOpacity: 0.17,
      smokeRise: 0.6,
      colorSmokeA: '#4a4038',
      colorSmokeB: '#332c28',
      colorSmokeC: '#221c1a',
      colorSmokeD: '#100a0a',
      debrisSize: 0.09,
      debrisSpeed: 5.0,
      colorDebrisA: '#3a322c',
      colorDebrisB: '#241e1c',

      chunkCount: 0, // nothing is in flight: this one comes from below
      muzzleSize: 0.0,
      castFlash: 0.09,
      colorCastFlash: '#c8202c',
      burstSize: 4.0,
      burstIntensity: 1.0,
      burstTurbulence: 2.6,
      burstEmbers: 240,
      burstSparks: 200,
      burstDebris: 120,
      burstSmoke: 140,
      impactShake: 1.4,
      shakeDuration: 1.5,
      impactFlash: 0.2,
      rumble: 0.085,
      colorFlash: '#c8202c',

      lightIntensity: 18,
      lightRadius: 19,
      lightColor: '#c8202c',
      lightFlicker: 0.42,
      lightFlickerSpeed: 11
    }),

    /**
     * VERMILION SHEARS — two cuts that cross, and nothing else.
     *
     * *Rebuilt in V3.4.* The first cut called itself a sickle and then set
     * `slashSpan` 5.8. `slashSpan` is the angular extent of the crescent in
     * radians, so 5.8 is **332°** — the stroke closed on itself and what stood
     * on screen was a ring, not a cut. Add `slashRadius` 5.4, `slashWidth` 0.42
     * and `glow` 1.6, the dimmest on the engine, and it was a dull red hoop
     * hanging for 1.6 s. The name was describing an intention the numbers never
     * carried out.
     *
     * A sickle is an *arc*, so the span comes back to 1.7 rad — 97°, the
     * shortest on the engine and just over a quarter turn — where the two ends
     * of the blade are both visible and it reads as a stroke with a direction.
     *
     * With the span honest, one stroke is too little to fill a cast, so this
     * takes the count nobody had: **two**. Spectral Blades runs seven, Ember
     * Reap three, Refraction Fan fourteen, Orpiment Scythe nine — every one of
     * them a flurry you read as a texture. Two is the only count you read as a
     * *pair*, and `slashTilt` 1.05 (the engine rolls each stroke by a
     * deterministic amount inside ±`slashTilt`) puts them on clearly separated
     * planes, so the second crosses the first. `slashInterval` 0.34 spaces them
     * far enough apart to see both land.
     *
     * `glow` 2.8 fixes the other half of the old problem. Bright red does slide
     * toward orange, which is what the first cut was guarding against, but the
     * guard was set so low the ability lost to its own background; the tint is
     * held in `colorOuter` and `colorHalo` instead, where it costs nothing.
     *
     * `slashPitch` is not set: the blade engine never reads it, and
     * `dead-keys.js` lists it for every id here.
     */
    vermilion: derive(blades, {
      range: 16.0,
      minRange: 2.0,
      speed: 40.0,
      lifetime: 1.4,
      fadeTime: 0.8,
      cooldown: 1.6,
      castAnim: 'cast1',

      slashes: 2, // the only pair on the engine — read as two, not as a flurry
      slashInterval: 0.34, // ... far enough apart to watch both land
      slashLife: 0.8,
      slashSpan: 1.7, // 97°: an arc with two visible ends, not a closed ring
      slashRadius: 3.4,
      slashRadiusJitter: 0.0,
      slashTilt: 1.05, // ... and the two strokes cross on separated planes
      slashHeight: 1.7,
      slashHeightJitter: 0.0,
      slashSweep: 2.0,
      slashWidth: 0.24,
      slashTaper: 0.06, // a real edge: thin where it leaves the arc
      slashCurve: 1.1,
      slashLead: 0.42,

      echo: 0.3,
      echoDelay: 0.1,
      echoSpread: 0.2,

      width: 0.085,
      coreSharp: 2.2,
      glowWidth: 5.6,
      glowFalloff: 2.4,
      glowOpacity: 0.5,
      jitter: 0.18,
      jitterScale: 0.5,
      octaves: 2,
      crawl: 0.4,
      flicker: 0.12,
      flickerSpeed: 6,
      strandFlash: 0.2,

      colorCore: '#ffd8cc',
      colorInner: '#e8384a',
      colorOuter: '#8a0f1c', // the guard against orange lives here ...
      colorHalo: '#180406', // ... and here, not in the gain
      glow: 2.8, // was 1.6 — it was losing to its own background
      opacity: 1.0,

      fieldBoundary: 0.0,
      fieldFill: 0.0, // a line cast, and this one wants no disc at all

      trailRate: 2.4,
      arcRate: 0.0,
      arcRadius: 1.4,
      arcLife: 0.9,
      arcIntensity: 0.4,
      colorArc: '#e8384a',
      colorEmber: '#c8202c',
      scorchRadius: 0.9,
      scorchLife: 9.0,
      scorchIntensity: 0.55,
      colorScorch: '#0c0505',
      shockRadius: 5.0,
      colorShockA: '#8a1420',
      colorShockB: '#ffd8cc',

      sparkRate: 140,
      sparkSize: 0.18,
      sparkSpeed: 5.5,
      sparkLifetime: 1.1,
      sparkGravity: -9.0,
      sparkStretch: 0.5,
      colorSparkA: '#ffd8cc',
      colorSparkB: '#e8384a',
      colorSparkC: '#8a1420',
      colorSparkD: '#160606',
      smokeRate: 90,
      smokeSize: 1.3,
      smokeLifetime: 3.0,
      smokeOpacity: 0.1,
      smokeRise: 0.4,
      colorSmokeA: '#4a3a38',
      colorSmokeB: '#332826',
      colorSmokeC: '#221a1a',
      colorSmokeD: '#100808',

      lightIntensity: 13,
      lightRadius: 14,
      lightHeight: 1.4,
      lightColor: '#c8202c',
      lightFlicker: 0.15,
      lightFlickerSpeed: 8,

      muzzleSize: 0.6,
      muzzleIntensity: 1.2,
      castFlash: 0.1,
      colorCastFlash: '#8a1420',
      burstSize: 3.0,
      burstIntensity: 1.0,
      burstSparks: 150,
      burstDebris: 40,
      impactShake: 0.7,
      shakeDuration: 0.7,
      impactFlash: 0.14,
      rumble: 0.01,
      colorBurstA: '#8a0f1c',
      colorBurstB: '#e8384a',
      colorBurstC: '#ffd8cc',
      colorFlash: '#c8202c'
    }),

    /**
     * GARNET BOLIDE — the rock replaced by a cut stone.
     *
     * All four projectiles in the library are *lumps*. Cinder Fall, Rime Comet,
     * Tar Fall and Pyreclast run `lumpiness` between 0.26 and 0.55 and between
     * three and twelve craters, because the generator's whole job there is to
     * make something look eroded. This one turns every one of those terms off:
     * `lumpiness` 0, `surfaceRoughness` 0, `craters` 0 — the only zeroes on the
     * engine — and spends the budget on `cuts` 24 at `cutDepth` 0.42 with
     * `facets` 8. What flies is a brilliant-cut stone.
     *
     * It is also the fastest thing the engine has thrown: 44 m/s over 26 m on a
     * flat 1.2 arc, spinning at 9.5 — nearly three times Cinder Fall's tumble —
     * so the cut faces strobe as it goes. `crackBranches` 0.1 with `crackWidth`
     * 0.09 and `crackGlow` 4.5 gives it two or three wide, very bright internal
     * seams instead of the usual lava web: light trapped in a stone.
     *
     * And it does not powder. `chunkCount` 4 is by far the fewest on the engine
     * (14–28 elsewhere) at `chunkScale` 0.55, the largest: it cracks into a
     * handful of big pieces and they go a long way.
     *
     * `meteor` has no `colorBurst*` family, so there is nothing to override.
     */
    garnet: derive(meteor, {
      range: 26.0,
      minRange: 3.0,
      speed: 44.0, // the fastest projectile on the engine
      lifetime: 1.6,
      fadeTime: 1.2,
      cooldown: 1.1,
      castAnim: 'cast2',
      endHeight: 0.9,

      arc: 1.2, // flat and hard, where Pyreclast lobs at 7.0
      arcCurve: 0.55,

      radius: 0.55,
      facets: 8, // the most on the engine
      lumpiness: 0.0, // ... and the only one that is not eroded at all
      lumpScale: 1.0,
      surfaceRoughness: 0.0,
      cuts: 24, // a brilliant cut
      cutDepth: 0.42,
      craters: 0, // a gem has no pits
      craterDepth: 0.0,
      craterSize: 0.2,
      spin: 9.5, // the fastest tumble on the engine — the faces strobe

      chargeCurve: 1.1,
      crackScale: 0.4,
      crackWidth: 0.09, // few seams
      crackBranches: 0.1,
      crackGlow: 4.5, // ... and very bright ones: light trapped in a stone
      crackFlow: 0.15,
      crackFlowSpeed: 0.5,
      rockScale: 1.2,
      facetTint: 1.6,
      cavity: 0.05,
      soot: 0.0,
      rimHeat: 1.6,
      leadGlow: 2.2,
      leadSharp: 6.0,
      glow: 1.6,
      envIntensity: 2.4, // polished
      colorRock: '#5a0f1c',
      colorChar: '#12060a',
      colorCrack: '#ff2f4c',
      colorHot: '#ffd8cc',

      trailSpan: 3.0,
      trailWidth: 0.34,
      trailHeadSize: 0.7,
      trailPlume: 0.4,
      trailWakeSpread: 0.1,
      trailRise: 0.1,
      trailTurbulence: 1.2,
      trailWisps: 0.3,
      trailShred: 0.5,
      trailSpeed: 5.5,
      trailBuoyancy: 0.6,
      trailDensity: 1.1,
      trailSoot: 0.9,
      trailCoreClarity: 0.8,
      trailGlow: 4.2,
      trailOpacity: 0.6,
      trailTempCore: 0.3, // with the palette weight this low these are factors,
      trailTempEdge: 0.1, // not kelvin — the same trick Rime Comet uses
      trailPalette: 0.15,
      trailTailFade: 0.85,
      trailBurnout: 0.5,
      trailSteps: 26,
      colorFlameMid: '#c8202c',
      colorFlameEdge: '#5a0f1c',
      colorFlameSmoke: '#0e0608',

      chunkCount: 4, // it cracks, it does not powder
      chunkScale: 0.55, // ... into the largest pieces on the engine
      chunkSpeed: 12.0,
      chunkForward: 0.7,
      chunkLoft: 1.3,
      chunkGravity: -16.0,
      chunkSpin: 11.0,
      chunkCool: 1.8,
      chunkLinger: 2.2,
      chunkSink: 1.4,

      fissureRadius: 3.2,
      fissureLife: 6.0,
      fissureArms: 3,
      fissureWander: 0.9,
      fissureBranches: 0.2,
      fissureWidth: 0.1,
      fissureHeat: 1.8,
      fissurePulse: 1.6,
      fissureGrowth: 15.0,
      fissureRockSize: 0.2,

      scorchRadius: 1.6,
      scorchLife: 6.0,
      scorchIntensity: 0.5,
      colorScorch: '#0a0406',
      shockRadius: 6.5,
      colorShockA: '#c8202c',
      colorShockB: '#ffd8cc',

      emberRate: 60,
      emberSize: 0.06,
      emberRise: 1.2,
      emberLifetime: 1.0,
      emberGlow: 2.0,
      colorEmberA: '#ffd8cc',
      colorEmberB: '#ff2f4c',
      colorEmberC: '#8a0f1c',
      colorEmberD: '#140608',
      sparkRate: 260,
      sparkSize: 0.1,
      sparkSpeed: 11.0,
      sparkLifetime: 0.45,
      sparkStretch: 0.42,
      colorSparkA: '#ffd8cc',
      colorSparkB: '#ff2f4c',
      colorSparkC: '#8a0f1c',
      colorSparkD: '#160608',
      smokeRate: 30,
      smokeSize: 0.9,
      smokeOpacity: 0.05,
      colorSmokeA: '#3a2c2c',
      colorSmokeB: '#241c1c',
      debrisSize: 0.11,
      debrisSpeed: 9.0,
      colorDebrisA: '#4a1018',
      colorDebrisB: '#26080e',

      lightIntensity: 20,
      lightRadius: 15,
      lightColor: '#e8384a',
      lightFlicker: 0.12,
      lightFlickerSpeed: 20,

      muzzleSize: 0.0,
      castFlash: 0.1,
      colorCastFlash: '#e8384a',
      burstSize: 3.2,
      burstIntensity: 1.6,
      burstTurbulence: 1.2,
      burstEmbers: 120,
      burstSparks: 320,
      burstDebris: 70,
      burstSmoke: 20,
      impactShake: 0.8,
      shakeDuration: 0.6,
      impactFlash: 0.34,
      rumble: 0.015,
      colorFlash: '#ffd8cc'
    }),

    // Carnelian Aegis and Ferrous Rose live in `signatures-assize-wards.js` —
    // the two blocks of this group that stand over a footprint. Split ahead of
    // time under the 800-line rule in `AGENTS.md`.
    ...buildAssizeWards(settings)
  };
}
