/**
 * signatures-litany-lashes.js — the two Brimstone Litany blocks that are strokes
 * rather than standing volumes.
 *
 * Split out of `signatures-litany.js` ahead of time under the 800-line rule in
 * `AGENTS.md`. The parent module spreads the two below back into the same object
 * it returns, so the merge order in `settings.js` is untouched.
 *
 *   Orpiment Scythe ← Spectral Blades (BladesAbility)
 *   Fulminate Whip  ← Storm Lance     (ThunderAbility)
 *
 * Both keep the group's rule: the yellow is graded down into ochre and brown
 * smoke, never up into white. `#fffbd8` is as hot as a core is allowed to get.
 *
 * `slashPitch` is deliberately left alone below. It sits on the `blades` block
 * and `dead-keys.js` lists it as unread on every id the blade engine runs —
 * writing a number into it would be a comment about a slider no shader samples.
 */

import { derive } from './variants.js';

export function buildLitanyLashes(settings) {
  const { blades, thunder } = settings;

  return {
    /**
     * ORPIMENT SCYTHE — the strokes taken down to the floor.
     *
     * The blade engine has always been read as a *plane*. Spectral Blades rolls
     * its seven crescents ±1.25 rad, Ember Reap ±0.52, Refraction Fan throws
     * away the variation entirely at ±0.12 so its fourteen edges stack into one
     * sheet, and Vermilion Shears holds its pair at ±1.05 so the two cross.
     * Every cast in the library so far arrives on a plane you can name.
     *
     * `slashTilt` 2.9 is most of a half turn, so there is no plane at all: nine
     * strokes come in at nine unrelated angles and the eye reads a mill rather
     * than a flourish. That only works low, which is the second number —
     * `slashHeight` 0.55 puts the whole cast at ankle height, less than half of
     * anything else on the engine (the next lowest is Spectral Blades at 1.35),
     * so the crescents are cutting *the ground* and not the air in front of it.
     *
     * `slashSweep` 4.6 is the fastest travel the engine has been given, a third
     * again Refraction Fan's, and `slashCurve` 3.2 crowds the width hard into
     * the belly against a `slashTaper` of 0.04 — a fat hook that finishes in a
     * point, which is the profile of the tool the thing is named after. `echo`
     * 0.2 is the faintest afterimage in the library: at this rate a bright echo
     * would smear nine strokes into one dirty band.
     *
     * `fieldFill` 0 as on every line cast — there is no footprint to draw.
     */
    orpiment: derive(blades, {
      range: 18.0,
      minRange: 2.0,
      speed: 52.0,
      lifetime: 1.8,
      fadeTime: 0.7,
      cooldown: 1.4,
      castAnim: 'cast3',

      slashes: 9,
      slashInterval: 0.14,
      slashLife: 0.62,
      slashSpan: 3.6,
      slashRadius: 3.2,
      slashRadiusJitter: 0.2,
      slashTilt: 2.9, // most of a half turn: the cast has no plane
      slashHeight: 0.55, // ... and sits at ankle height, lower than anything else
      slashHeightJitter: 0.06,
      slashSweep: 4.6, // the fastest stroke on the engine
      slashWidth: 0.22,
      slashTaper: 0.04,
      slashCurve: 3.2, // a fat hook finishing in a point
      slashLead: 0.72,

      echo: 0.2, // the faintest afterimage in the library
      echoDelay: 0.11,
      echoSpread: 0.28,

      width: 0.09,
      coreSharp: 2.6,
      glowWidth: 5.2,
      glowFalloff: 1.8,
      glowOpacity: 0.6,
      jitter: 0.45,
      jitterScale: 1.1,
      crawl: 2.2,
      flicker: 0.18,
      flickerSpeed: 14,

      colorCore: '#fff0b8',
      colorInner: '#f0a018',
      colorOuter: '#9a5a14',
      colorHalo: '#180c02',
      glow: 2.0,
      opacity: 1.0,

      fieldBoundary: 0.0,
      fieldFill: 0.0, // a line cast: no disc

      trailRate: 3.2,
      arcRate: 0.0,
      arcRadius: 1.2,
      arcLife: 0.7,
      arcIntensity: 0.5,
      colorArc: '#f0a018',
      colorEmber: '#c8801a',
      scorchRadius: 1.4, // the strokes are low enough to mark the floor
      scorchLife: 10.0,
      scorchIntensity: 0.6,
      colorScorch: '#0b0703',
      shockRadius: 4.5,
      colorShockA: '#9a5a14',
      colorShockB: '#fff0b8',

      sparkRate: 300,
      sparkSize: 0.12,
      sparkSpeed: 8.0,
      sparkLifetime: 0.6,
      sparkGravity: -12.0,
      sparkStretch: 0.34,
      colorSparkA: '#fff0b8',
      colorSparkB: '#f0a018',
      colorSparkC: '#9a5a14',
      colorSparkD: '#140a02',
      smokeRate: 160, // pigment dust kicked up off the floor
      smokeSize: 1.1,
      smokeSpeed: 1.2,
      smokeLifetime: 2.6,
      smokeOpacity: 0.12,
      smokeRise: 0.5,
      colorSmokeA: '#6a5636',
      colorSmokeB: '#4a3c26',
      colorSmokeC: '#2c2418',
      colorSmokeD: '#120e08',

      lightIntensity: 15,
      lightRadius: 13,
      lightHeight: 0.35, // the light sits where the strokes are, not overhead
      lightColor: '#d89828',
      lightFlicker: 0.3,
      lightFlickerSpeed: 16,

      muzzleSize: 0.45,
      muzzleIntensity: 1.3,
      castFlash: 0.12,
      colorCastFlash: '#e8a828',
      burstSize: 2.6,
      burstIntensity: 1.1,
      burstSparks: 200,
      burstDebris: 60,
      impactShake: 0.8,
      shakeDuration: 0.5,
      impactFlash: 0.18,
      rumble: 0.015,
      colorBurstA: '#9a5a14',
      colorBurstB: '#f0a018',
      colorBurstC: '#fff0b8',
      colorFlash: '#e8a828'
    }),

    /**
     * FULMINATE WHIP — the bundle taken apart down to one cord.
     *
     * Every bolt in the library is a *bundle*: the Storm Lance throws nine
     * filaments, Azurite Horn flares seven and gathers them, Dusk Weave and
     * Tempest Fan both sit on the engine's ceiling at twenty-four. The fan, the
     * lay, the spread and the gather are the entire vocabulary, and all four
     * signatures spend their read on it.
     *
     * `strands` 1 removes it. There is no bundle to shape, so `spread`, `twist`
     * and `strandFlash` all go to zero — the only zeroes on the engine — and
     * everything moves onto the single cord that is left. That much the first
     * cut had right.
     *
     * *Rebuilt in V3.4 from the tip backwards.* `widthTip` is a multiplier on
     * `width`, applied as `halfWidth · mix(1, widthTip, t^widthCurve)`, and the
     * first cut set `width` 0.16 with `widthTip` 3.2 — a half-width of 0.51 m,
     * so the cord ended in a metre-wide club. On top of that `jitter` 1.6 at
     * `jitterScale` 0.28 over a single octave and `crawl` 12 thrashed the whole
     * length, and `sag` 0.85 bowed it far above its own line. A whip that is
     * fattest and loudest at the point is not a whip; it is a worm.
     *
     * A lash is heavy in the hand and vanishes at the crack, so the taper is
     * **inverted**: `width` 0.09 with `widthTip` 0.18 is the strongest narrowing
     * on the engine, held off by `widthCurve` 1.6 so the cord keeps its body for
     * most of the stroke and gives it up in the last stretch. `tipLength` 0.12
     * and `tipGlow` 3.0 concentrate what is left into a bright point rather than
     * spreading it over a flare.
     *
     * The motion calms to match. `jitter` 0.55 at `jitterScale` 0.6 over two
     * octaves is one travelling bend instead of a shiver, `crawl` 6.0 still runs
     * it down the length faster than any other bolt, and `sag` 0.55 keeps the
     * over-the-top arc — the only bolt that bows above its own line — without
     * throwing it out of frame. `endHeight` 0.2 puts the far end on the floor:
     * it comes over the top and cracks down.
     */
    fulminate: derive(thunder, {
      range: 17.0,
      minRange: 2.0,
      speed: 46.0, // slow enough to watch the wave travel
      lifetime: 0.55,
      fadeTime: 0.5,
      cooldown: 1.3,
      castAnim: 'cast2',

      handHeight: 1.5, // thrown from over the shoulder
      handForward: 0.35,
      handSide: 0.28,
      endHeight: 0.2, // ... and cracked down onto the floor
      sag: 0.55, // the only bolt that bows above its own line

      strands: 1, // the whole ability: one cord, no bundle
      spread: 0.0,
      spreadNear: 0.0,
      spreadCurve: 1.0,
      converge: 0.55,
      twist: 0.0, // nothing to lay
      twistSpeed: 0.0,
      branchDim: 1.0, // the one filament is the spine

      jitter: 0.55, // one travelling bend ...
      jitterScale: 0.6, // ... at the coarsest grain on the engine
      octaves: 2,
      jitterFalloff: 0.6,
      crawl: 6.0, // the wave still runs down the cord faster than any other
      pinch: 0.08,

      width: 0.09, // heavy in the hand ...
      widthTip: 0.18, // ... and gone at the crack: the strongest taper here
      widthCurve: 1.6, // held off until the last stretch
      coreWidth: 1.3,
      coreSharp: 3.0,
      glowWidth: 5.0,
      glowFalloff: 2.0,
      glowOpacity: 0.5,
      softFade: 0.55,

      restrike: 14,
      flicker: 0.26,
      flickerSpeed: 11,
      strandFlash: 0.0, // there is no second filament to blink out
      tipGlow: 3.0, // what body the cord gives up is concentrated here
      tipLength: 0.12,

      colorCore: '#fffbd8',
      colorInner: '#f4c81c',
      colorOuter: '#8a5a10',
      colorHalo: '#140c02',
      glow: 2.8,
      opacity: 1.0,

      arcRate: 1.6, // it lays burns the whole way out
      arcRadius: 2.2,
      arcLife: 0.9,
      arcIntensity: 1.2,
      arcBranches: 1.0,
      scorchRadius: 1.2,
      scorchLife: 11.0,
      scorchIntensity: 0.7,
      colorArc: '#f4c81c',
      colorScorch: '#0a0803',
      colorEmber: '#c89a20',
      shockRadius: 5.5,
      colorShockA: '#8a5a10',
      colorShockB: '#fffbd8',

      sparkRate: 320,
      sparkSize: 0.2,
      sparkSpeed: 7.0,
      sparkLifetime: 0.9,
      sparkGravity: -14.0,
      sparkStretch: 0.55,
      colorSparkA: '#fffbd8',
      colorSparkB: '#f4c81c',
      colorSparkC: '#8a5a10',
      colorSparkD: '#141002',
      moteRate: 60,
      moteSize: 0.07,
      moteSpeed: 1.2,
      moteLifetime: 2.2,
      moteRise: 1.4,
      moteTurbulence: 1.1,
      colorMoteA: '#fff0a0',
      colorMoteB: '#e8c83a',
      colorMoteC: '#8a6a1a',
      colorMoteD: '#100c02',
      smokeRate: 140, // brown smoke off the burns, not off the cord
      smokeSize: 1.4,
      smokeSpeed: 1.0,
      smokeLifetime: 3.2,
      smokeOpacity: 0.12,
      smokeRise: 0.7,
      colorSmokeA: '#6a5a38',
      colorSmokeB: '#4a4028',
      colorSmokeC: '#2c2618',
      colorSmokeD: '#12100a',
      debrisRate: 60,
      debrisSize: 0.07,
      debrisSpeed: 6.0,
      debrisLifetime: 1.4,
      debrisGravity: -18.0,
      colorDebrisA: '#3a3020',
      colorDebrisB: '#221c12',
      colorDebrisC: '#221c12',
      colorDebrisD: '#181408',

      lightIntensity: 22,
      lightRadius: 15,
      lightColor: '#d8a820',
      lightFlicker: 0.5,
      lightFlickerSpeed: 18,

      muzzleSize: 0.7,
      muzzleIntensity: 2.0,
      castFlash: 0.16,
      colorMuzzleA: '#8a5a10',
      colorMuzzleB: '#f4c81c',
      colorMuzzleC: '#fffbd8',
      colorCastFlash: '#e8c83a',
      burstSize: 2.6,
      burstIntensity: 1.5,
      burstSparks: 220,
      burstDebris: 90,
      impactShake: 1.1,
      shakeDuration: 0.5,
      impactFlash: 0.24,
      rumble: 0.02,
      colorBurstA: '#8a5a10',
      colorBurstB: '#f4c81c',
      colorBurstC: '#fffbd8',
      colorFlash: '#e8c83a'
    })
  };
}
