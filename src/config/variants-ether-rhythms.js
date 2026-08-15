/**
 * variants-ether-rhythms.js — the two Wild Ether signatures that keep beating.

 * Spectral Blades and Celestial Rain, the second half of the Wild Ether group
 * (see `variants-ether.js`). Neither has a single impact: one is a rhythm of
 * crescents down the line, the other a rhythm of shafts into a footprint, and
 * both resolve by thinning out rather than by stopping. That is also why both
 * come off the Voltaic Snare — it is the base block that already holds a cast
 * open over time instead of spending it at once.
 *
 * Split out of `variants.js` under the 800-line rule in `AGENTS.md`; not one
 * number changed on the way out. Every block below derives from a *base* block —
 * one of the six written longhand in `blocks-*.js` — which is handed in rather
 * than imported, because `buildVariants` runs against the live `settings`
 * object and a derivation reads it after the six are already in place.
 */
import { derive } from './derive.js';

export function buildEtherRhythms({ snare }) {
  return {
    /**
     * SPECTRAL BLADES — the only signature in the library made of *strokes*. A
     * sequence of crescents cut through the air along the aimed line, each one
     * arriving on its own beat, each rolled to a different angle, each leaving a
     * dimmer echo behind it. Built on the Snare's block for the ribbon
     * vocabulary; everything about the paths is new.
     *
     * Engine keys (`abilities/BladesAbility.js`):
     *   slash*  the crescents and the rhythm they arrive on
     *   echo*   the afterimage that trails each one
     */
    blades: derive(snare, {
      range: 17.0,
      minRange: 2.0,
      speed: 46.0,
      lifetime: 1.5,
      fadeTime: 0.55,
      cooldown: 1.1,
      castAnim: 'cast2',

      slashes: 7, // crescents in one cast
      slashInterval: 0.085, // seconds between them — the beat
      slashLife: 0.42, // how long one is fully lit
      slashSpan: 2.5, // radians of arc one crescent covers
      slashRadius: 2.4, // metres
      slashRadiusJitter: 0.35,
      slashTilt: 1.25, // radians of roll about the cast line, ±
      slashPitch: 0.55, // radians of pitch, ±
      slashHeight: 1.35, // where they are cut, metres above the floor
      slashHeightJitter: 0.7,
      slashSweep: 2.6, // radians the crescent travels while it is lit
      slashWidth: 0.14, // half-width at the belly of the blade
      slashTaper: 0.12, // width at the points, as a fraction
      slashCurve: 1.4, // how hard the width crowds to the belly
      slashLead: 0.35, // how much brighter the leading point is

      echo: 0.55, // opacity of the afterimage
      echoDelay: 0.08, // seconds it lags
      echoSpread: 0.35, // how much wider it is

      strands: 0,
      tendrils: 0,
      rimArcs: 0,
      leashStrands: 0,

      width: 0.05,
      coreSharp: 3.2,
      glowWidth: 5.0,
      glowFalloff: 2.0,
      glowOpacity: 0.5,
      jitter: 0.35, // barely any: a blade is a clean edge
      jitterScale: 0.8,
      octaves: 2,
      crawl: 1.2,
      restrike: 0,
      flicker: 0.1,
      flickerSpeed: 12,
      strandFlash: 0.15,

      colorCore: '#ffffff',
      colorInner: '#d6fff4',
      colorOuter: '#4fffd0',
      colorHalo: '#0b6b5c',
      glow: 2.6,
      opacity: 1.0,

      fieldOpacity: 0.0, // no ground disc: this is a line cast
      arcRate: 0.0,
      trailRate: 1.6,
      arcRadius: 0.9,
      arcLife: 0.4,
      arcIntensity: 0.7,
      colorArc: '#8fffe4',
      colorEmber: '#4fffd0',
      scorchRadius: 0.35,
      scorchLife: 4.0,
      scorchIntensity: 0.3,
      colorScorch: '#06171a',
      shockRadius: 4.0,
      colorShockA: '#4fffd0',
      colorShockB: '#ffffff',

      sparkRate: 260,
      sparkSize: 0.13,
      sparkSpeed: 10.0,
      sparkLifetime: 0.4,
      sparkStretch: 0.28,
      colorSparkA: '#ffffff',
      colorSparkB: '#d6fff4',
      colorSparkC: '#4fffd0',
      colorSparkD: '#06393a',
      updraftRate: 0,
      smokeRate: 0,
      debrisRate: 0,

      lightIntensity: 16,
      lightRadius: 12,
      lightHeight: 0.5,
      lightColor: '#5fffd8',
      lightFlicker: 0.25,
      lightFlickerSpeed: 30,

      muzzleSize: 0.35,
      muzzleIntensity: 1.4,
      castFlash: 0.1,
      colorCastFlash: '#b6fff0',
      burstSize: 2.2,
      burstIntensity: 1.2,
      burstSparks: 180,
      burstDebris: 0,
      pulseRate: 0,
      ringRate: 0,
      impactShake: 0.5,
      shakeDuration: 0.35,
      holdShake: 0.0,
      impactFlash: 0.16,
      rumble: 0.0,
      colorBurstA: '#4fffd0',
      colorBurstB: '#d6fff4',
      colorBurstC: '#ffffff',
      colorFlash: '#b6fff0'
    }),

    /**
     * CELESTIAL RAIN — the longest and quietest cast in the library. Shafts of
     * light fall into the footprint one after another for the whole of its
     * lifetime, each landing with its own small burst and ring, so the ability
     * is a *rhythm* rather than an event: it has no single impact, and it
     * resolves by thinning out rather than by stopping.
     *
     * Engine keys (`abilities/RainAbility.js`):
     *   shaft*   one falling column of light
     *   landing* what happens where one lands
     */
    rain: derive(snare, {
      range: 22.0,
      minRange: 0.0,
      zoneRadius: 5.2,
      speed: 54.0,
      snapTime: 0.2,
      lifetime: 5.4,
      fadeTime: 1.2,
      cooldown: 2.4,
      castAnim: 'cast1',

      shafts: 26, // instances in flight at once
      shaftRate: 7.0, // new shafts per second
      shaftHeight: 17.0, // where one starts, metres
      shaftFall: 26.0, // metres/second
      shaftWidth: 0.13,
      shaftTaper: 0.35, // width at the head, as a fraction of the tail
      shaftLength: 5.5, // metres of visible streak
      shaftTilt: 0.11, // radians off vertical
      shaftInset: 0.94, // how far inside the boundary they may land
      shaftDim: 0.75,
      shaftGlow: 2.6,
      colorShaftCore: '#ffffff',
      colorShaftEdge: '#a8c8ff',
      colorShaftHalo: '#1b3a9c',

      landingBurst: 0.85, // radius of the shell one lands with, metres
      landingRing: 1.6, // radius of the ground ring, metres
      landingRingLife: 0.85,
      landingSparks: 14,
      landingFlash: 0.02,
      landingShake: 0.05,
      landingLight: 4.0, // how much the ability's light jumps per landing

      fieldBoundary: 0.2,
      fieldBoundaryGlow: 2.0,
      fieldFill: 0.16,
      fieldFalloff: 1.2,
      fieldVeins: 0.9,
      fieldVeinScale: 1.1,
      fieldCrawl: 0.2,
      fieldRings: 2.2,
      fieldRingSpeed: 0.5,
      fieldSpokes: 36,
      fieldSpin: 0.02,
      fieldCore: 0.4,
      fieldCoreSize: 0.12,
      fieldPulse: 0.2,
      fieldPulseSpeed: 1.2,
      colorField: '#7fa8ff',
      colorFieldEdge: '#eaf2ff',

      strands: 0,
      tendrils: 0,
      rimArcs: 0,
      leashStrands: 2,

      colorCore: '#ffffff',
      colorInner: '#dce8ff',
      colorOuter: '#7fa8ff',
      colorHalo: '#12266e',
      glow: 2.0,
      width: 0.03,

      arcRate: 0.0,
      trailRate: 0.6,
      scorchRadius: 0.0,
      shockRadius: 6.0,
      colorShockA: '#7fa8ff',
      colorShockB: '#ffffff',
      colorArc: '#b6cfff',
      colorEmber: '#7fa8ff',

      sparkRate: 60,
      sparkSize: 0.1,
      sparkSpeed: 5.0,
      sparkLifetime: 0.7,
      sparkGravity: -6.0,
      colorSparkA: '#ffffff',
      colorSparkB: '#dce8ff',
      colorSparkC: '#7fa8ff',
      colorSparkD: '#0d1c4a',
      updraftRate: 140, // motes lifting off the lit ground
      updraftRise: 2.2,
      updraftSpeed: 1.2,
      updraftLifetime: 2.6,
      updraftTurbulence: 0.7,
      colorUpdraftA: '#ffffff',
      colorUpdraftB: '#dce8ff',
      colorUpdraftC: '#7fa8ff',
      colorUpdraftD: '#0b1740',
      smokeRate: 0,
      debrisRate: 0,

      lightIntensity: 12,
      lightRadius: 20,
      lightHeight: 0.15,
      lightColor: '#9fbfff',
      lightFlicker: 0.0,

      muzzleSize: 0.4,
      castFlash: 0.08,
      colorCastFlash: '#dce8ff',
      burstSize: 3.0,
      burstIntensity: 0.9,
      burstSparks: 90,
      burstDebris: 0,
      pulseRate: 0,
      ringRate: 0.8,
      impactShake: 0.35,
      shakeDuration: 0.5,
      holdShake: 0.0,
      impactFlash: 0.14,
      rumble: 0.01,
      colorBurstA: '#7fa8ff',
      colorBurstB: '#dce8ff',
      colorBurstC: '#ffffff',
      colorFlash: '#dce8ff'
    })
  };
}
