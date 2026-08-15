/**
 * signatures-escapement.js — the Quicksilver Escapement, five of the twenty
 * added in V3.3.
 *
 * The Verdigris Conclave was the library's first metal group and it is *warm*
 * metal: bronze gone green, brass, patina, temple mechanism. This is the cold
 * half of the same idea — mercury, chrome, gunmetal and steel blue, with a
 * clockmaker's vocabulary instead of a founder's. Where the Conclave raised
 * `body` to say "this is not empty glass", this group raises `specular` and
 * `envIntensity` and drops `dispersion` to almost nothing to say "this is a
 * mirror": polished metal barely splits light, it *returns* it.
 *
 *   Flywheel Governor ← Shard Cyclone  (CycloneAbility, crystal branch)
 *   Quicksilver Thread← Nova Beam      (BeamAbility)
 *   Astrolabe Ring    ← Boreal Gate    (GateAbility)
 *   Mercury Rain      ← Celestial Rain (RainAbility)
 *   Amalgam Weld      ← Frost Lance    (IceAbility)
 *
 * The organising idea is *regulation*. Every block here throws away a source of
 * variation that its engine normally leans on — `tumble`, `spinJitter`,
 * `membraneSwirl`, `rubble`, `fracture` — because a mechanism that varies is
 * broken. The character has to come from geometry and rate instead, which is a
 * harder brief and the reason the group reads unlike anything else in the
 * sixty before it.
 */

import { derive } from './variants.js';
import { buildEscapementHairlines } from './signatures-escapement-hairlines.js';

export function buildEscapementSignatures(settings) {
  // `beam` and `ice` are destructured in the hairlines module, not here.
  const { cyclone, gate, rain } = settings;

  return {
    /* ================================================================== */
    /* QUICKSILVER ESCAPEMENT                                              */
    /* ================================================================== */

    /**
     * FLYWHEEL GOVERNOR — the drum that turns as one piece.
     *
     * `spinFalloff` is the multiplier on angular velocity at the crest —
     * `omega = spin · lerp(1, spinFalloff, h)` — and the six cyclones in the
     * library sit at 0.30, 0.42, 0.72, 0.92, 0.95 and 1.35. Every one of them is
     * therefore *shearing*: the crest and the floor turn at different rates, and
     * that shear is what makes a vortex read as weather. Set it to exactly
     * **1.0** and the shear disappears — the whole column turns at one rate,
     * like a machined part. That is this ability, and no other block in the
     * library has it. It is the one thing the first cut got right, and it is
     * kept unchanged.
     *
     * *Rebuilt in V3.4 around it.* What was wrong was the body the rule was
     * applied to. The first cut spent the budget on ninety-six shards at
     * `shardScale` 0.95 — the largest parts on the engine, at two thirds the
     * count — hung on an inverted cone 5.4 m tall. Rigid rotation only reads if
     * you can see that the parts keep their *relative* positions, and ninety-six
     * chunks that size inside a 4.6 m circle occlude each other from every
     * angle: what turned was a pile, and a pile turning rigidly looks the same
     * as a pile tumbling.
     *
     * So the parts get small and the form gets simple. `shardScale` 0.26 at a
     * count of 150 is grit rather than rubble, and the silhouette is now a
     * **cylinder**: `funnelBase` 0.95 against `funnelTop` 1.0 is the only block
     * on the engine where the two are within 5 % of each other — every sibling
     * runs a ratio of at least 1.6 in one direction or the other. A drum has one
     * diameter, so the eye gets a straight vertical edge to judge the rotation
     * against, which is the whole point of a governor.
     *
     * `funnelHeight` 3.2 is the shortest on the engine and keeps the proportion
     * squat, and the ten staves at `strandTurns` 0.0 are dead vertical — the
     * only unwound arms in the library — so they cross the horizon line once per
     * turn and give the rate something to be counted on.
     *
     * It keeps `shardMaterial: 'crystal'` from the Shard Cyclone, so the
     * asteroid half of the shard builder is unreachable for it — see the
     * `CONDITIONAL` entry in `tools/audit-settings-keys.mjs`.
     */
    flywheel: derive(cyclone, {
      range: 19.0,
      minRange: 0.0,
      zoneRadius: 3.6,
      speed: 50.0,
      snapTime: 0.26,
      lifetime: 5.6,
      fadeTime: 1.2,
      cooldown: 2.2,
      castAnim: 'cast2',

      funnelHeight: 3.2, // the shortest on the engine: squat, like a drum
      funnelBase: 0.95, // ... and the only one that does not change diameter
      funnelTop: 1.0,
      funnelCurve: 1.0,
      funnelLean: 0.0,

      spin: 3.6,
      spinFalloff: 1.0, // no shear: the drum turns as one rigid body
      spinJitter: 0.0,
      climb: 0.0, // nothing rides up it — a governor holds its height
      climbJitter: 0.0,

      shardCount: 150,
      shardScale: 0.26, // grit, not rubble: the parts must not occlude the form
      shardScaleJitter: 0.08, // interchangeable parts
      tumble: 0.0, // ... that hold their attitude instead of rolling
      wobble: 0.02,
      wobbleScale: 0.3,

      strands: 10,
      strandWidth: 0.09,
      strandTurns: 0.0, // dead-vertical staves — the only unwound arms here
      strandSpeed: 3.2,
      strandJitter: 0.0,
      strandDim: 1.0,
      strandGlow: 3.2,
      colorStrandCore: '#f6fbff',
      colorStrandEdge: '#9fb0c4',
      colorStrandHalo: '#141a22',

      ringHeight: 0.8,
      skirtHeight: 0.5,
      radius: 0.3,
      radiusJitter: 0.12,
      taper: 0.85, // parallel-sided plates
      facets: 4,
      heightJitter: 0.15,
      rubble: 0.0,

      colorGlass: '#141a22',
      colorEdge: '#eaf2fa',
      colorPrismA: '#9fb0c4',
      colorPrismB: '#5f7a99',
      colorCore: '#dfe6ee',
      colorTip: '#f6fbff',
      body: 1.2,
      edgeGain: 1.3,
      edgePower: 1.9,
      dispersion: 0.1, // polished metal does not split light
      specular: 6.5, // ... it returns it
      envIntensity: 2.6,
      stria: 0.4,
      striaScale: 2.4,
      glow: 0.7,
      opacity: 1.0,

      fieldBoundary: 0.28,
      fieldBoundaryGlow: 2.2,
      fieldFill: 0.2,
      fieldFalloff: 2.0,
      fieldVeins: 0.6,
      fieldVeinScale: 1.0,
      fieldRings: 4.0,
      fieldRingSpeed: 1.0,
      fieldSpokes: 24, // teeth
      fieldSpokeLength: 0.4,
      fieldSpin: 0.9, // the disc runs with the rotor
      fieldCore: 0.8,
      fieldCoreSize: 0.34,
      colorField: '#5f7a99',
      colorFieldEdge: '#eaf2fa',

      funnelVolume: 0.12, // a faint oil haze, nothing more
      trailOpacity: 0.3,
      trailPalette: 0.0, // no black-body ramp: this is cold
      trailTempCore: 0.2,
      trailTempEdge: 0.05,
      trailDensity: 0.7,
      trailSoot: 0.5,
      trailBuoyancy: 1.2,
      trailSpeed: 2.2,
      trailTurbulence: 1.1,
      trailPlume: 1.0,
      colorHot: '#f6fbff',
      colorFlameMid: '#9fb0c4',
      colorFlameEdge: '#3f4a58',
      colorFlameSmoke: '#0c1118',

      veil: 0.2,
      veilHeight: 1.2,
      veilFlow: 0.9,
      colorVeil: '#8fa4bc',
      colorVeilCrest: '#eaf2fa',

      frostSpread: 0.9,
      frostLife: 6.0,
      frostIntensity: 0.3,
      colorFrost: '#d0dae6',
      colorFrostEdge: '#4a5666',

      dustRate: 120,
      dustSize: 0.9,
      dustOpacity: 0.05,
      dustRise: 0.3,
      dustTurbulence: 0.4,
      colorDustA: '#c4d0dc',
      colorDustB: '#8494a6',
      colorDustC: '#4a5666',
      colorDustD: '#0e131a',
      moteRate: 220,
      moteSize: 0.05,
      moteSpeed: 2.4,
      moteRise: 0.4,
      moteGlow: 1.6,
      colorMoteA: '#f6fbff',
      colorMoteB: '#c4d0dc',
      colorMoteC: '#5f7a99',
      colorMoteD: '#0c1118',
      gritRate: 30,
      gritSpeed: 5.0,
      gritGravity: -12.0,
      colorGritA: '#b6c2d0',
      colorGritB: '#75839a',
      colorGritC: '#3a4452',
      colorGritD: '#0c1118',
      mistRate: 80,
      mistRise: 0.2,
      glitterRate: 300,
      glitterRise: 0.5,
      colorGlitterA: '#ffffff',
      colorGlitterB: '#dfe6ee',
      colorGlitterC: '#7f96b0',
      colorGlitterD: '#141a22',
      snowRate: 0,

      lightIntensity: 15,
      lightRadius: 16,
      lightHeight: 0.5,
      lightColor: '#9fb8d8',

      shockRadius: 5.0,
      burstSize: 3.0,
      burstIntensity: 1.1,
      burstShards: 90,
      impactShake: 0.6,
      holdShake: 0.05, // a rotor this fast is felt through the floor
      shakeDuration: 0.7,
      impactFlash: 0.14,
      rumble: 0.04,
      colorBurstA: '#5f7a99',
      colorBurstB: '#c4d0dc',
      colorBurstC: '#f6fbff',
      colorFlash: '#dfe6ee'
    }),

    /**
     * ASTROLABE RING — the dial you read through.
     *
     * The three gates in the library differ mainly in *lift and reach*: Boreal
     * Gate stands a 1.0 hoop just off the floor and throws nine 7.5 m rays,
     * Solar Aperture widens it to 1.35 and sixteen rays at 13 m, Orrery Gate
     * hangs a 0.95 hoop 2.6 m up and fires five sight lines at 18 m. All three
     * are doorways you look *through*.
     *
     * *Rebuilt in V3.4.* The first cut tried to be the opposite of all three: a
     * 0.62 hoop, the smallest on the engine, raked back at `gateTilt` 1.25 so
     * you read its face. Everything then had to be crammed onto that face —
     * forty-eight bars at `ringShardScale` 2.2 leaning 1.35 out of plane, and
     * sixteen rays cut to 3.2 m and fanned to `raySpread` 1.4. Both counts are
     * fighting for the same few hundred pixels: the bars are longer than the
     * radius they stand on, and fourteen membrane rings inside a 0.62 hoop are
     * finer than the screen can resolve, so the graduations moiré instead of
     * counting. It read as a burr.
     *
     * An instrument that cannot be read is a decoration, so the dial is made
     * *large* instead of dense. `gateRadius` 1.9 is the biggest hoop on the
     * engine by 40 %, at `gateTilt` 0.42 — canted enough to show it is a disc,
     * not so far that it turns into an ellipse on edge.
     *
     * With room to spare, everything on it gets finer rather than bigger.
     * `ringShardScale` 0.5 is the smallest on the engine and `ringShardLean` 0.0
     * the only zero: 128 short teeth lying flush in the plane of the limb, which
     * is what a graduated edge actually looks like. Seven membrane rings instead
     * of fourteen, on three times the radius, so they resolve. `membraneSwirl`
     * and `membraneSpeed` stay at 0 — the only zeroes on the engine, and the
     * reason this holds still while every other gate churns — and
     * `membraneOpacity` 0.3 makes it the most transparent, so the dial is a
     * thing you sight *through*.
     *
     * The rays invert with it: **six** of them at 9 m and `rayWidth` 0.05,
     * gathered to `raySpread` 0.1. A tight sheaf of long fine sight lines
     * leaving the plate, against the sixteen short wide spokes that were
     * crowding it before.
     */
    astrolabe: derive(gate, {
      range: 20.0,
      minRange: 2.0,
      zoneRadius: 4.4,
      speed: 48.0,
      snapTime: 0.3,
      lifetime: 6.5,
      fadeTime: 1.4,
      cooldown: 2.4,
      castAnim: 'cast2',

      gateRadius: 1.9, // the largest hoop on the engine — a dial has to be read
      gateLift: 1.8,
      gateTilt: 0.42, // canted enough to show it is a disc, not an edge
      gateOpen: 0.9,

      ringShards: 128, // below MAX_SHARDS (140), which Orrery Gate already sits on
      ringShardScale: 0.5, // the smallest on the engine: teeth, not bars
      ringShardLean: 0.0, // ... lying flush in the plane of the limb
      ringShardFan: 0.03,
      ringShardJitter: 0.0,

      membraneScale: 1.2,
      membraneSwirl: 0.0, // dead still — a scale, not a vortex
      membraneSpeed: 0.0,
      membraneRings: 7.0, // few enough to resolve on a hoop this size
      membraneRingSpeed: 0.02,
      membraneDepth: 0.15,
      membraneOpacity: 0.3, // the most transparent gate: you sight through it
      membraneGlow: 2.2,
      colorMembraneA: '#0c1118',
      colorMembraneB: '#5f7a99',
      colorMembraneC: '#eaf2fa',

      rays: 6, // a sheaf of sight lines, not a crown of spokes
      rayLength: 9.0,
      rayWidth: 0.05,
      raySpeed: 0.04,
      raySpread: 0.1, // gathered, so they leave as one bundle
      rayDim: 0.7,
      rayGlow: 3.0,
      colorRayCore: '#f6fbff',
      colorRayEdge: '#9fb0c4',
      colorRayHalo: '#1a2430',

      radius: 0.3,
      radiusJitter: 0.15,
      taper: 0.92,
      facets: 4,
      roughness: 0.0,
      bend: 0.0,
      colorGlass: '#141a22',
      colorEdge: '#eaf2fa',
      colorPrismA: '#b6c6d8',
      colorPrismB: '#5f7a99',
      colorCore: '#dfe6ee',
      colorTip: '#ffffff',
      body: 1.6,
      dispersion: 0.12,
      specular: 5.8,
      envIntensity: 2.4,
      stria: 0.3,
      striaScale: 2.0,
      glow: 0.9,

      fieldBoundary: 0.3,
      fieldBoundaryGlow: 2.0,
      fieldFill: 0.12,
      fieldFalloff: 2.6,
      fieldRings: 6.0, // the graduation carried down onto the floor
      fieldRingSpeed: 0.05,
      fieldVeins: 0.3,
      fieldSpokes: 6,
      fieldSpokeLength: 0.7,
      fieldSpin: 0.01,
      fieldCore: 0.7,
      fieldCoreSize: 0.14,
      colorField: '#5f7a99',
      colorFieldEdge: '#eaf2fa',

      mistRate: 90,
      mistRise: 0.1,
      colorMistA: '#d8e2ec',
      colorMistB: '#9fb0c4',
      colorMistC: '#4a5666',
      colorMistD: '#0c1118',
      glitterRate: 220,
      glitterRise: 0.8,
      colorGlitterA: '#ffffff',
      colorGlitterB: '#c4d0dc',
      colorGlitterC: '#7f96b0',
      colorGlitterD: '#141a22',
      snowRate: 0,

      lightIntensity: 13,
      lightRadius: 15,
      lightHeight: 1.0,
      lightColor: '#8fa8c8',

      shockRadius: 3.5,
      burstSize: 2.0,
      burstIntensity: 0.9,
      burstShards: 60,
      impactShake: 0.3,
      holdShake: 0.006,
      shakeDuration: 1.0,
      impactFlash: 0.12,
      rumble: 0.012,
      colorShockA: '#5f7a99',
      colorShockB: '#eaf2fa',
      colorBurstA: '#5f7a99',
      colorBurstB: '#c4d0dc',
      colorFlash: '#dfe6ee'
    }),

    /**
     * MERCURY RAIN — beads, and enough of them to be weather.
     *
     * Four tempos now stand on this engine — Celestial Rain's twenty-six shafts
     * at seven a second, Ashen Deluge's nine slabs at 1.7, Caustic Rain's
     * forty-eight threads at twenty-six, Indigo Vespers' seven strikes at 1.4 —
     * and all four are *long*: `shaftLength` runs 2.4 to 6. The free corner is
     * the short one, and that part of the first cut survives.
     *
     * *Rebuilt in V3.4 around how short.* The first cut went to `shaftLength`
     * 1.4 with `shaftWidth` 0.9 and `shaftTaper` 1.3, which is a body wider than
     * two thirds of its own length, flared at the bottom, falling out of a 6 m
     * ceiling at 9 m/s. Fourteen of those are not beads; they are lozenges, big
     * enough to read as solid objects and slow enough to be looked at
     * individually, and the `shaftTaper` above 1 — the only one in the library —
     * put the wide end at the front, which is the shape of a *slug*, not a drop.
     *
     * A bead is small and there are many. `shaftWidth` 0.2 against
     * `shaftLength` 0.9 is roughly one to four — still by far the shortest body
     * on the engine, and now compact rather than fat — and the count goes to
     * thirty-four at `shaftRate` 14, so they arrive as a *rate* instead of as
     * fourteen separate events. `shaftTaper` comes back under 1 (0.85), only
     * just, so the bead is near-round.
     *
     * `shaftFall` 30 out of an 11 m ceiling is a third of a second in the air,
     * which is what makes it read as falling metal rather than as drifting
     * light, and the splash comes down to match: `landingRing` 1.4 and
     * `landingRingLife` 0.6 keep the floor busy without pooling, because with
     * this many impacts the marks have to clear before the next ones land.
     */
    mercury: derive(rain, {
      range: 21.0,
      minRange: 0.0,
      zoneRadius: 5.0,
      speed: 56.0,
      snapTime: 0.24,
      lifetime: 4.6,
      fadeTime: 1.4,
      cooldown: 2.4,
      castAnim: 'cast2',

      shafts: 34,
      shaftRate: 14.0, // fast enough to be a rate, not a sequence
      shaftHeight: 11.0,
      shaftFall: 30.0, // a third of a second in the air: falling metal
      shaftWidth: 0.2,
      shaftTaper: 0.85, // just under 1, so the bead is near-round
      shaftLength: 0.9, // the shortest body on the engine by a factor of two
      shaftTilt: 0.06,
      shaftInset: 0.95,
      shaftDim: 0.7,
      shaftGlow: 2.2,
      colorShaftCore: '#ffffff',
      colorShaftEdge: '#b6c6d8',
      colorShaftHalo: '#2a3a4e',

      landingBurst: 1.2,
      landingRing: 1.4,
      landingRingLife: 0.6, // the marks clear before the next beads land
      landingSparks: 30,
      landingFlash: 0.04,
      landingShake: 0.05,
      landingLight: 3.0,

      leashStrands: 2,
      leashSag: -0.5,
      leashWidth: 1.4,

      fieldBoundary: 0.4,
      fieldBoundaryGlow: 1.8,
      fieldFill: 0.3, // a wet floor, not a pool
      fieldFalloff: 1.6,
      fieldVeins: 0.4,
      fieldVeinScale: 0.6,
      fieldVeinSharp: 0.4,
      fieldWarp: 0.9,
      fieldCrawl: 0.5,
      fieldRings: 3.0,
      fieldRingSpeed: 0.4,
      fieldSpokes: 8,
      fieldSpokeLength: 0.6,
      fieldSpin: 0.03,
      fieldCore: 0.6,
      fieldCoreSize: 0.3,
      fieldPulse: 0.2,
      fieldPulseSpeed: 1.4,
      colorField: '#5f7a99',
      colorFieldEdge: '#f6fbff',

      colorCore: '#ffffff',
      colorInner: '#dfe6ee',
      colorOuter: '#7f96b0',
      colorHalo: '#0c1118',
      glow: 1.5,
      width: 0.05,
      restrike: 4,
      flicker: 0.08,
      jitter: 0.2,

      trailRate: 0.3,
      arcRate: 0.0,
      colorArc: '#c4d0dc',
      colorEmber: '#9fb0c4',
      scorchRadius: 0.0,
      scorchLife: 6.0,
      scorchIntensity: 0.2,
      colorScorch: '#0a0e14',
      shockRadius: 6.5,
      colorShockA: '#7f96b0',
      colorShockB: '#ffffff',

      sparkRate: 180,
      sparkSize: 0.12,
      sparkSpeed: 4.5,
      sparkLifetime: 0.9,
      sparkGravity: -12.0,
      sparkStretch: 0.1, // round, not streaked: these are droplets
      colorSparkA: '#ffffff',
      colorSparkB: '#dfe6ee',
      colorSparkC: '#7f96b0',
      colorSparkD: '#141a22',
      updraftRate: 40,
      updraftSize: 0.06,
      updraftSpeed: 0.9,
      updraftRise: 1.0,
      colorUpdraftA: '#5f7a99',
      colorUpdraftB: '#b6c6d8',
      colorUpdraftC: '#ffffff',
      colorUpdraftD: '#0c1118',
      smokeRate: 0,
      debrisRate: 0,

      lightIntensity: 15,
      lightRadius: 18,
      lightHeight: 0.1,
      lightColor: '#9fb8d8',
      lightFlicker: 0.12,
      lightFlickerSpeed: 10,

      muzzleSize: 0.45,
      castFlash: 0.07,
      colorCastFlash: '#c4d0dc',
      burstSize: 3.2,
      burstIntensity: 1.0,
      burstSparks: 140,
      ringRate: 1.2,
      impactShake: 0.4,
      shakeDuration: 0.6,
      holdShake: 0.012,
      impactFlash: 0.12,
      rumble: 0.012,
      colorBurstA: '#7f96b0',
      colorBurstB: '#dfe6ee',
      colorBurstC: '#ffffff',
      colorFlash: '#dfe6ee'
    }),

    // Quicksilver Thread and Amalgam Weld live in
    // `signatures-escapement-hairlines.js` — the two line casts of this group.
    // Split ahead of time under the 800-line rule in `AGENTS.md`.
    ...buildEscapementHairlines(settings)
  };
}
