/**
 * signatures-synod-descents.js — the two Indigo Synod blocks that come down out
 * of the air rather than up out of the floor.
 *
 * Split out of `signatures-synod.js` ahead of time under the 800-line rule in
 * `AGENTS.md`: five blocks on these engines run 750–900 lines together, which is
 * exactly the wall V3.2 hit twice. `signatures-synod.js` spreads the two below
 * back into the same object it returns, so the merge order in `settings.js` is
 * untouched.
 *
 *   Indigo Vespers ← Celestial Rain (RainAbility)
 *   Lapis Gyre     ← Gravity Well   (WellAbility)
 *
 * Both derive from first-generation blocks, so both carry the full `field*`
 * family that every `ZoneField` is built from.
 */

import { derive } from './variants.js';

export function buildSynodDescents(settings) {
  const { rain, gravity } = settings;

  return {
    /**
     * INDIGO VESPERS — seven strikes you count, and the marks they leave.
     *
     * *Rebuilt in V3.4.* The idea — a procession where the other three rains are
     * weather — was right; the execution was not. The first cut lowered five
     * twelve-metre columns at 6.5 m/s from a twenty-six-metre ceiling. Divide
     * those out and each shaft spends four seconds in the air while being half
     * again longer than the distance it has left to fall, so what stood on
     * screen was a set of enormous bars sliding downward, never quite arriving,
     * with `shaftDim` 0.4 draining what colour they had. A procession is a
     * sequence of *events*. That was a sequence of slow objects.
     *
     * So the verb changes from lowering to striking. `shaftFall` 34 is now the
     * fastest on the engine — Caustic Rain's 46 is a drizzle of threads, this is
     * seven deliberate plumb hits — and at `shaftRate` 1.4 they land about one
     * every three-quarters of a second, still slow enough to count.
     *
     * The read moved to the floor, which is where a toll actually leaves its
     * mark. `landingRing` 4.0 and `landingRingLife` 3.4 are both the largest on
     * the engine by a wide margin: every ring outlives the next four strikes, so
     * the circle fills with overlapping marks and the cast is legible as a
     * *count* even between hits. `shaftInset` 0.75 keeps them off the rim so the
     * rings overlap rather than tile.
     */
    indigo: derive(rain, {
      range: 23.0,
      minRange: 0.0,
      zoneRadius: 4.6,
      speed: 50.0,
      snapTime: 0.34,
      lifetime: 8.0, // the longest hold on the engine
      fadeTime: 2.2,
      cooldown: 3.0,
      castAnim: 'cast3',

      shafts: 7, // the fewest on the engine — you count them
      shaftRate: 1.4, // ... about one every three-quarters of a second
      shaftHeight: 20.0,
      shaftFall: 34.0, // the fastest on the engine: struck, not lowered
      shaftWidth: 0.3,
      shaftTaper: 0.45,
      shaftLength: 6.0,
      shaftTilt: 0.0, // dead plumb
      shaftInset: 0.75, // inside the rim, so the marks overlap
      shaftDim: 0.7,
      shaftGlow: 3.0,
      colorShaftCore: '#eef4ff',
      colorShaftEdge: '#4f8fe8',
      colorShaftHalo: '#0a1a4a',

      landingBurst: 1.8,
      landingRing: 4.0, // the largest mark on the engine
      landingRingLife: 3.4, // ... and it outlives the next four strikes
      landingSparks: 26,
      landingFlash: 0.08,
      landingShake: 0.14,
      landingLight: 8.0,

      leashStrands: 1,
      leashSag: -0.2,
      leashWidth: 1.2,

      fieldBoundary: 0.3,
      fieldBoundaryGlow: 2.0,
      fieldFill: 0.14, // low, so the landing rings stay the brightest thing on it
      fieldFalloff: 2.2,
      fieldVeins: 0.4,
      fieldVeinScale: 0.7,
      fieldWarp: 0.2,
      fieldCrawl: 0.04,
      fieldRings: 5.0,
      fieldRingSpeed: 0.14,
      fieldSpokes: 7, // one per strike
      fieldSpokeLength: 1.2,
      fieldSpin: 0.0,
      fieldCore: 0.6,
      fieldCoreSize: 0.18,
      fieldPulse: 0.3,
      fieldPulseSpeed: 0.6,
      colorField: '#1f4fc8',
      colorFieldEdge: '#dfe8ff',

      colorCore: '#eef4ff',
      colorInner: '#b6c6e2',
      colorOuter: '#2f6bd8',
      colorHalo: '#050b1c',
      glow: 1.8,
      width: 0.026,
      restrike: 6,
      flicker: 0.1,
      jitter: 0.35,

      trailRate: 0.2,
      arcRate: 0.0,
      colorArc: '#8fb4ff',
      colorEmber: '#4f8fe8',
      scorchRadius: 0.9,
      scorchLife: 12.0,
      scorchIntensity: 0.4,
      colorScorch: '#060a16',
      shockRadius: 5.5,
      colorShockA: '#2f6bd8',
      colorShockB: '#eef4ff',

      sparkRate: 40,
      sparkSize: 0.07,
      sparkSpeed: 2.2,
      sparkLifetime: 1.4,
      sparkGravity: -5.0,
      colorSparkA: '#eef4ff',
      colorSparkB: '#b6c6e2',
      colorSparkC: '#2f6bd8',
      colorSparkD: '#080f28',
      updraftRate: 60,
      updraftSize: 0.08,
      updraftSpeed: 0.8,
      updraftRise: 1.4,
      updraftLifetime: 3.4,
      updraftTurbulence: 0.25,
      colorUpdraftA: '#1f4fc8',
      colorUpdraftB: '#8fb4ff',
      colorUpdraftC: '#eef4ff',
      colorUpdraftD: '#050b1c',
      smokeRate: 0,
      debrisRate: 0,

      lightIntensity: 16,
      lightRadius: 20,
      lightHeight: 0.2,
      lightColor: '#4f8fe8',
      lightFlicker: 0.0,

      muzzleSize: 0.3,
      castFlash: 0.05,
      colorCastFlash: '#b6c6e2',
      burstSize: 2.6,
      burstIntensity: 0.8,
      burstSparks: 60,
      ringRate: 0.4,
      impactShake: 0.3,
      shakeDuration: 0.9,
      holdShake: 0.006,
      impactFlash: 0.1,
      rumble: 0.008,
      colorBurstA: '#1f4fc8',
      colorBurstB: '#b6c6e2',
      colorBurstC: '#eef4ff',
      colorFlash: '#dfe8ff'
    }),

    /**
     * LAPIS GYRE — the well with a body instead of a hole.
     *
     * Every well in the library is an absence. Gravity Well opens a 1.15-radius
     * throat with `fieldFalloff` 5 so the middle goes black; Singularity Maw
     * stands the same throat on end at head height and pushes the falloff to 7;
     * Ash Maw lays it flat and fills it with dust. All three are read as *the
     * floor going away*.
     *
     * This one hangs a solid object over the circle: `horizonRadius` 3.0, the
     * largest on the engine by a factor of one and a half, at `horizonSpin` 0.06
     * — near enough motionless — with `horizonGlow` 2.6 and `horizonRim` 5.0, so
     * it reads as a lit stone rather than as a gap. `horizonCollapse` 0.2 keeps
     * it from shrinking away at the end: it simply stops.
     *
     * The accretion plane is inverted to match. Twelve ribbons instead of
     * twenty-six, packed into the band between 0.55 and 0.7 of the radius — a
     * *belt*, the narrowest on the engine — raked 45° and whipped round at
     * `discSpin` −3.4, nearly three times the Well's rate. The one thing moving
     * fast here is the ring; the body it is wrapped around does not move at all.
     *
     * `pullSwirl` 0.4 finishes the read: what falls in falls almost straight in
     * rather than spiralling, because there is no vortex — there is a mass.
     */
    lapis: derive(gravity, {
      range: 21.0,
      minRange: 0.0,
      zoneRadius: 3.6,
      speed: 46.0,
      snapTime: 0.34,
      lifetime: 5.0,
      fadeTime: 1.6,
      cooldown: 2.8,
      castAnim: 'cast2',

      horizonRadius: 3.0, // the largest body on the engine
      horizonHeight: 2.4,
      horizonSquash: 0.85,
      horizonWarp: 0.3,
      horizonSpin: 0.06, // ... and the stillest
      horizonScale: 0.7, // broad slow banding, not fine boil
      horizonRim: 5.0,
      horizonRimGain: 4.2,
      horizonOpacity: 1.0,
      horizonGlow: 2.6, // it is lit, not empty
      horizonCollapse: 0.2, // it stops rather than shrinking away
      colorHorizonA: '#050b1c',
      colorHorizonB: '#2f6bd8',
      colorHorizonC: '#eef4ff',

      discStrands: 12,
      discInner: 0.55,
      discOuter: 0.7, // a belt, not an accretion plane
      discTilt: 0.78,
      discSpin: -3.4, // the fastest ring on the engine
      discWidth: 0.14,
      discTaper: 0.6,
      discWobble: 0.02,
      discDim: 1.0,
      discGlow: 4.0,
      colorDiscCore: '#f4f8ff',
      colorDiscEdge: '#4f8fe8',
      colorDiscHalo: '#0a1740',

      pullRadius: 2.2,
      pullRate: 90, // the sparsest intake on the engine
      pullSpeed: 11.0,
      pullSwirl: 0.4, // it falls in, it does not spiral in
      pullCollapse: -0.95,
      pullLifetime: 1.0,
      pullSize: 0.05,
      colorPullA: '#eef4ff',
      colorPullB: '#8fb4ff',
      colorPullC: '#1f4fc8',
      colorPullD: '#050b1c',

      fieldBoundary: 0.42,
      fieldBoundaryGlow: 2.4,
      fieldFill: 0.18,
      fieldFalloff: 3.0,
      fieldVeins: 0.7,
      fieldVeinScale: 1.0,
      fieldWarp: 0.25,
      fieldCrawl: -0.1,
      fieldRings: 6.0,
      fieldRingSpeed: -0.35,
      fieldSpokes: 6,
      fieldSpokeLength: 0.8,
      fieldSpin: -0.02,
      fieldCore: 0.3,
      fieldCoreSize: 0.5,
      colorField: '#1f4fc8',
      colorFieldEdge: '#dfe8ff',

      strands: 0,
      tendrils: 0,
      rimArcs: 6,
      rimSpan: 0.22,
      rimSpeed: -0.3,
      rimHeight: 0.1,
      rimWidth: 1.0,
      rimDim: 0.6,
      colorCore: '#eef4ff',
      colorInner: '#b6c6e2',
      colorOuter: '#2f6bd8',
      colorHalo: '#050b1c',
      glow: 1.6,
      width: 0.04,
      restrike: 5,
      jitter: 0.3,

      arcRate: 0.6,
      arcRadius: 2.2,
      arcLife: 1.0,
      arcIntensity: 0.5,
      trailRate: 0.3,
      scorchRadius: 1.2,
      scorchLife: 9.0,
      scorchIntensity: 0.4,
      colorArc: '#8fb4ff',
      colorEmber: '#4f8fe8',
      colorScorch: '#060a16',
      shockRadius: 7.0,
      colorShockA: '#2f6bd8',
      colorShockB: '#eef4ff',

      sparkRate: 40,
      sparkSize: 0.06,
      sparkSpeed: 3.5,
      colorSparkA: '#eef4ff',
      colorSparkB: '#8fb4ff',
      colorSparkC: '#1f4fc8',
      colorSparkD: '#080f28',
      updraftRate: 0,
      smokeRate: 0,
      debrisRate: 20,
      debrisSize: 0.05,
      debrisSpeed: 1.0,
      colorDebrisA: '#2f4a80',
      colorDebrisB: '#141c34',

      lightIntensity: 22,
      lightRadius: 20,
      lightHeight: 2.2, // the light is in the stone, well off the floor
      lightColor: '#4f7fe0',
      lightFlicker: 0.03,

      muzzleSize: 0.4,
      castFlash: 0.06,
      colorCastFlash: '#b6c6e2',
      burstSize: 3.4,
      burstIntensity: 1.2,
      burstSparks: 90,
      burstDebris: 30,
      pulseRate: 0.8,
      pulseSize: 3.0,
      pulseIntensity: 0.6,
      ringRate: 0.9,
      impactShake: 0.6,
      holdShake: 0.02,
      shakeDuration: 1.0,
      impactFlash: 0.16,
      rumble: 0.02,
      colorBurstA: '#1f4fc8',
      colorBurstB: '#8fb4ff',
      colorBurstC: '#eef4ff',
      colorFlash: '#dfe8ff'
    }),
  };
}
