/**
 * variants-dominion.js — the Glacial Dominion's four derived signatures.

 * Permafrost Field, Shard Cyclone, Frost Gate and Absolute Zero. Three of the
 * four come off the Glacial Crown, which is the only base block that owns the
 * standing-crown control surface; Permafrost comes off the Frost Lance instead,
 * because it is a field that is walked over rather than a wall that is hidden
 * behind.
 *
 * Split out of `variants.js` under the 800-line rule in `AGENTS.md`; not one
 * number changed on the way out. Every block below derives from a *base* block —
 * one of the six written longhand in `blocks-*.js` — which is handed in rather
 * than imported, because `buildVariants` runs against the live `settings`
 * object and a derivation reads it after the six are already in place.
 */
import { derive } from './derive.js';

export function buildDominion({ ice, glacier, snareField, meteorTrail }) {
  return {
    /* ================================================================== */
    /* GLACIAL DOMINION                                                    */
    /* ================================================================== */

    /**
     * PERMAFROST WAKE — a line cast on the Frost Lance's engine, tuned to the
     * opposite silhouette. The Lance is a spear: narrow, tall, front-loaded and
     * gone in seconds. This is a *wake*: it walks out at half the speed, lays a
     * wide band of low slabs with an even hand, and then stands there. The read
     * is ground taken and held, so the frost sheet is the widest and longest
     * lived in the library and the crystals barely clear the knee.
     */
    permafrost: derive(ice, {
      range: 17.0,
      minRange: 2.2,
      speed: 12.5, // deliberate — you watch this one arrive
      lifetime: 6.4,
      cooldown: 1.1,
      castAnim: 'cast3',

      widthNear: 1.5,
      width: 4.8,
      widthCurve: 0.85,
      spikeCount: 250,
      clumping: 0.95, // no spine: the band fills evenly
      scatter: 0.85,
      frontBias: 1.0,

      heightNear: 0.32,
      height: 1.4,
      heightCurve: 0.95,
      heightJitter: 0.75,
      crown: 0.72,
      peak: 1.12,
      peakWidth: 0.22,
      rubble: 0.62,
      rubbleScale: 0.44,

      radius: 0.56,
      radiusJitter: 0.85,
      taper: 0.52, // slabs, not needles
      facets: 6,
      roughness: 0.22,
      bend: 0.24,
      lean: 0.2,
      twist: 1.0,

      riseTime: 0.34,
      riseOvershoot: 0.14,
      riseStagger: 0.24,
      settle: 0.85,
      shatterDelay: 1.5,
      sinkTime: 2.0,

      colorDeep: '#2b4d5c',
      colorIce: '#bfe6f0',
      colorRim: '#ffffff',
      colorCore: '#79b3c6',
      opacity: 0.9,
      depthTint: 1.35,
      fresnel: 1.9,
      translucency: 1.1,
      fracture: 0.5,
      veins: 0.6,
      glint: 0.8,
      frostLine: 0.9, // rime climbs most of the way up a low slab
      glow: 0.6,
      edgeGlow: 0.8,
      birthGlow: 1.1,

      frostSpread: 2.5,
      frostRate: 6.5,
      frostLife: 12.0,
      frostIntensity: 1.0,
      frostCrystals: 1.1,
      shockRadius: 7.5,
      colorShockA: '#7fd8f2',
      colorShockB: '#f4ffff',

      mistRate: 420,
      mistSize: 1.5,
      mistSpeed: 1.0,
      mistLifetime: 4.2,
      mistOpacity: 0.075,
      mistRise: 0.1,
      shardRate: 85,
      shardSpeed: 4.5,
      sparkleRate: 90,
      sparkleRise: 0.9,

      lightIntensity: 7,
      lightRadius: 15,
      lightColor: '#9fdcf2',

      burstSize: 3.0,
      burstIntensity: 0.55,
      burstShards: 55,
      impactShake: 0.4,
      shakeDuration: 1.2,
      impactFlash: 0.07,
      rumble: 0.03
    }),

    /**
     * SHARD CYCLONE — the first of the two spins. A funnel of ice standing in
     * the footprint: blades seated on a cone that widens with height, every one
     * of them orbiting, the whole column shearing faster at the floor than at
     * the crest. Sharp, glassy and *fast*; its sibling in Wild Ether is the same
     * engine run slow and heavy.
     *
     * Engine keys (`abilities/CycloneAbility.js`):
     *   funnel*  the cone the debris is seated on
     *   spin*    angular velocity and how it falls off with height
     *   shard*   what is being thrown around
     *   strand*  the wind ribbons drawn through it
     *   dust/mote/grit  the engine's three canonical particle roles — see the
     *                   note above `sandstorm`, which reads the same names
     */
    cyclone: derive(glacier, {
      ...snareField,
      // `CycloneAbility` builds a `VolumetricFireMaterial` for *both* its
      // signatures and syncs it every frame, so the trail family has to be here
      // even though `funnelVolume: 0` keeps the column off screen. Without it
      // every uniform on that material is `undefined`, and the moment anyone
      // raises `funnel volume` in the editor the column comes back as NaN.
      ...meteorTrail,
      range: 19.0,
      minRange: 0.0,
      zoneRadius: 4.2,
      speed: 52.0,
      snapTime: 0.3,
      lifetime: 4.6,
      fadeTime: 1.0,
      cooldown: 1.9,
      castAnim: 'cast2',

      funnelHeight: 7.6, // metres from floor to crest
      funnelBase: 0.28, // radius at the floor, × zoneRadius
      funnelTop: 1.06, // ... and at the crest
      funnelCurve: 1.55, // >1 keeps the throat tight then opens it late
      funnelLean: 0.12, // radians the whole column leans downrange

      spin: 1.45, // turns/second at the floor
      spinFalloff: 0.42, // fraction of that left at the crest
      spinJitter: 0.3, // per-shard variation
      climb: 0.55, // how fast a shard rides up the cone, cone-heights/second
      climbJitter: 0.6,

      shardCount: 165,
      density: 1.0,
      shardScale: 0.62, // × the base crystal size
      shardScaleJitter: 0.7,
      tumble: 3.4, // radians/second a shard rolls about its own axis
      wobble: 0.35, // radial breathing of the cone, × the local radius
      wobbleScale: 1.6,

      strands: 24, // wind ribbons wound around the funnel
      strandWidth: 0.055,
      strandTurns: 1.35, // turns one ribbon makes over the climb
      strandSpeed: 1.15, // turns/second the whole weave rolls
      strandJitter: 0.28,
      strandDim: 0.75,
      strandGlow: 2.1,
      colorStrandCore: '#ffffff',
      colorStrandEdge: '#7fe6ff',
      colorStrandHalo: '#0f4d8c',

      ringHeight: 0.9,
      skirtHeight: 0.7,
      radius: 0.3,
      taper: 0.22,
      facets: 6,
      heightJitter: 0.7,

      colorGlass: '#0d3f5e',
      colorEdge: '#ffffff',
      colorPrismA: '#6ff0ff',
      colorPrismB: '#7fa8ff',
      colorCore: '#b6f4ff',
      colorTip: '#ffffff',
      body: 1.1,
      edgeGain: 1.05,
      dispersion: 0.85,
      glow: 1.15,

      fieldBoundary: 0.16,
      fieldBoundaryGlow: 2.4,
      fieldFill: 0.3,
      fieldFalloff: 2.4,
      fieldVeins: 2.2,
      fieldVeinScale: 2.6,
      fieldSpin: 0.42, // the disc turns with the column
      fieldRings: 3.0,
      fieldRingSpeed: 1.4,
      fieldCore: 1.1,
      fieldCoreSize: 0.26,
      colorField: '#5fd6ff',
      colorFieldEdge: '#ffffff',

      funnelVolume: 0.0, // a cyclone is clear: you can see straight through it
      shardMaterial: 'crystal',
      // Cold, in case the column is ever turned on: the borrowed family arrives
      // carrying the Cinder Fall's orange, which is the one palette a funnel of
      // ice must not have.
      trailOpacity: 0.5,
      trailPalette: 0.0, // no blackbody ramp — this is lit dust, not fire
      trailTempCore: 0.35,
      trailTempEdge: 0.12,
      colorHot: '#ffffff', // the volume's core colour, not the rock's
      colorFlameMid: '#9fe4ff',
      colorFlameEdge: '#4f9fd0',
      colorFlameSmoke: '#0c2331',

      dustRate: 240,
      dustSize: 1.1,
      dustSpeed: 2.4,
      dustLifetime: 2.2,
      dustOpacity: 0.045,
      dustRise: 1.2,
      dustTurbulence: 1.4,
      colorDustA: '#e8fbff',
      colorDustB: '#9fd8ee',
      colorDustC: '#4f8ba8',
      colorDustD: '#0b2634',

      moteRate: 300,
      moteSize: 0.075,
      moteSpeed: 3.2,
      moteLifetime: 1.5,
      moteRise: 2.6,
      moteTurbulence: 1.3,
      moteGlow: 1.5,
      colorMoteA: '#ffffff',
      colorMoteB: '#8ff0ff',
      colorMoteC: '#3f9fe0',
      colorMoteD: '#07253c',

      gritRate: 90,
      gritSize: 0.085,
      gritSpeed: 6.5,
      gritLifetime: 1.4,
      gritGravity: -9.0,
      colorGritA: '#ffffff',
      colorGritB: '#a8e8ff',
      colorGritC: '#3f9fd8',
      colorGritD: '#0a2c40',

      mistRate: 380,
      mistSize: 1.25,
      mistOpacity: 0.05,
      mistRise: 0.9,
      glitterRate: 260,
      glitterRise: 2.6,
      glitterTurbulence: 1.2,
      snowRate: 0, // nothing falls out of a cyclone
      shardSpeed: 8.5,

      lightIntensity: 13,
      lightRadius: 17,
      lightHeight: 0.4,
      lightColor: '#8fe4ff',

      shockRadius: 6.5,
      burstSize: 3.4,
      burstIntensity: 1.0,
      impactShake: 0.7,
      holdShake: 0.09, // it never stops shaking the floor
      shakeDuration: 0.6,
      impactFlash: 0.16,
      rumble: 0.03,
      colorFlash: '#cdf4ff'
    }),

    /**
     * BOREAL GATE — a ring of ice standing upright in the footprint with a lit
     * membrane stretched across it, facing the caster. The only signature in the
     * library that is *vertical and framed*: everything else fills a volume,
     * this one draws a plane and hangs an aurora in it, then throws light
     * through the opening.
     *
     * Engine keys (`abilities/GateAbility.js`):
     *   gate*      where the ring stands and how big it is
     *   ringShard* the blades that make up the frame
     *   membrane*  the sheet stretched across it
     *   ray*       what comes through
     */
    gate: derive(glacier, {
      ...snareField,
      range: 20.0,
      minRange: 2.0,
      zoneRadius: 3.4,
      speed: 46.0,
      snapTime: 0.36,
      lifetime: 5.0,
      fadeTime: 1.1,
      cooldown: 2.2,
      castAnim: 'cast1',

      gateRadius: 1.0, // × zoneRadius
      gateLift: 0.35, // how far the ring's foot is off the floor, metres
      gateTilt: 0.16, // radians it leans back from vertical
      gateOpen: 0.5, // seconds the frame takes to close around the opening

      ringShards: 84, // blades in the frame
      ringShardScale: 1.25,
      ringShardLean: 0.42, // radians they are thrown outward off the ring
      ringShardFan: 0.85, // radians they are splayed around it
      ringShardJitter: 0.55,

      membraneScale: 2.1, // aurora features across the opening
      membraneSwirl: 1.35, // how hard the sheet is wound about its centre
      membraneSpeed: 0.55,
      membraneRings: 3.2, // pressure rings travelling out through it
      membraneRingSpeed: 0.7,
      membraneDepth: 0.85, // how far into it you can see
      membraneOpacity: 0.92,
      membraneGlow: 2.4,
      colorMembraneA: '#0a2d5e', // what the far side of the opening is
      colorMembraneB: '#4fd8ff', // the curtain
      colorMembraneC: '#eafcff', // its crests

      rays: 9, // shafts thrown through the opening
      rayLength: 7.5, // metres they reach downrange
      rayWidth: 0.16,
      raySpeed: 1.4, // how fast they sweep
      raySpread: 0.55, // radians of cone
      rayDim: 0.72,
      rayGlow: 2.6,
      colorRayCore: '#ffffff',
      colorRayEdge: '#7fe0ff',
      colorRayHalo: '#0b3a86',

      radius: 0.34,
      taper: 0.3,
      facets: 6,
      colorGlass: '#0b3d5c',
      colorPrismA: '#63ecff',
      colorPrismB: '#9d8bff',
      colorCore: '#c8f6ff',
      glow: 1.1,

      fieldBoundary: 0.22,
      fieldFill: 0.18,
      fieldVeins: 1.4,
      fieldSpin: 0.03,
      fieldCore: 0.7,
      colorField: '#6fd8ff',
      colorFieldEdge: '#eafcff',

      mistRate: 300,
      mistRise: 0.25,
      glitterRate: 200,
      glitterRise: 1.1,
      snowRate: 80,

      lightIntensity: 16,
      lightRadius: 18,
      lightHeight: 0.55,
      lightColor: '#7fd8ff',

      shockRadius: 5.5,
      burstSize: 3.0,
      burstIntensity: 1.3,
      impactShake: 0.55,
      holdShake: 0.03,
      impactFlash: 0.22,
      colorFlash: '#cdefff'
    }),

    /**
     * ABSOLUTE ZERO — the library's one *dome*. Cold goes out along the floor,
     * the air over the footprint freezes into a shell, and everything inside it
     * stops. It is the slowest thing in the library on purpose: a long, quiet
     * hold with almost nothing moving, resolved by the shell coming apart in
     * plates. The counterweight to Plasma Bloom, which does the opposite.
     *
     * Engine keys (`abilities/DomeAbility.js`):
     *   dome*  the shell
     *   rim*   the ring of blades that seats it on the floor
     */
    zero: derive(glacier, {
      range: 16.0,
      minRange: 0.0,
      zoneRadius: 5.6,
      speed: 30.0,
      snapTime: 0.55,
      lifetime: 6.0,
      fadeTime: 1.6,
      cooldown: 3.0,
      castAnim: 'cast3',

      domeRadius: 1.02, // × zoneRadius
      domeSquash: 0.74, // <1 flattens it into a bell
      domeRise: 0.6, // seconds the shell takes to close over the footprint
      domeScale: 1.9, // plate features over the surface
      domeSpeed: 0.16, // how slowly the field crawls — this one barely moves
      domePlates: 0.85, // how hard it crystallises into flats
      domeRim: 2.6, // fresnel exponent on the silhouette
      domeOpacity: 0.62,
      domeGlow: 1.5,
      domeShatter: 0.55, // how much of the fade is spent breaking up
      colorDomeA: '#123f5e', // the body seen through it
      colorDomeB: '#8fe3ff', // the plates
      colorDomeC: '#ffffff', // their edges and the rim

      rimShards: 130,
      rimShardScale: 1.0,
      rimSeat: 0.97, // × zoneRadius
      rimScatter: 0.1,
      rimLean: 0.24,

      spikeCount: 150,
      ringShare: 0.75,
      lateShare: 0.2,
      ringHeight: 1.65,
      skirtHeight: 1.1,
      ringWave: 0.5,
      sweepTime: 0.85, // the wave crawls around the ring
      stagger: 0.16,

      radius: 0.4,
      taper: 0.42,
      facets: 7,
      colorGlass: '#0d3a52',
      colorEdge: '#ffffff',
      colorPrismA: '#7ff2ff',
      colorPrismB: '#a8b4ff',
      colorCore: '#d6f8ff',
      body: 1.5,
      glow: 0.85,

      veil: 0.75,
      veilHeight: 2.6,
      veilRadius: 1.0,
      veilFlow: 0.16,
      veilSpin: 0.008,

      frostSpread: 1.9,
      frostLife: 12.0,
      rimeRate: 5.0,
      shockRadius: 9.0,
      ringRate: 0.45,

      mistRate: 420,
      mistSize: 1.6,
      mistLifetime: 4.4,
      mistOpacity: 0.07,
      mistRise: -0.2,
      snowRate: 220,
      snowFall: -0.7,
      snowTurbulence: 1.1,
      snowInset: 0.92,
      glitterRate: 110,

      lightIntensity: 11,
      lightRadius: 20,
      lightHeight: 0.35,
      lightColor: '#a6ecff',

      burstSize: 5.4,
      burstIntensity: 1.2,
      burstShards: 150,
      impactShake: 1.0,
      shakeDuration: 1.4,
      holdShake: 0.012,
      impactFlash: 0.34,
      rumble: 0.02,
      colorFlash: '#e6fbff'
    }),
  };
}
