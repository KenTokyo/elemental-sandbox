/**
 * blocks-bolts-b.js — the Astral Ordnance: the second five instant-cast projectiles.
 *
 * Same key surface, same engine and the same two endings as
 * `blocks-bolts-a.js`, which carries the family-by-family commentary — the
 * reference block there is `lancet`, and every key below means exactly what it
 * means there. Split off it under the 800-line rule in `AGENTS.md`.
 *
 * What separates this half from the first is what the five are made *of*. The
 * Kinetic Assembly throws matter: glass, rock, thorn, tungsten, a steel ring.
 * These five throw structures — a caged core, a void spindle with satellites, a
 * crystal star, a harpoon paying out beads behind it, and two blades sharing an
 * axis. That is why their bodies are assemblies of several moving parts and the
 * first five are mostly one part with fins.
 */
export const BOLT_BLOCKS_B = {
  /* ================================================================== */
  /* NOVA SEED                                                           */
  /* ================================================================== */
  /**
   * A small hot core inside two counter-rotating cages, rocking as it goes.
   *
   * The one bolt in the library whose weave is purely vertical: `weaveLateral`
   * is 0, so it rises and falls in the plane of the shot rather than swinging
   * across it. Combined with `wobble` 0.5 driving the core's pulse and the two
   * cages turning against each other, it reads as something *powered* rather
   * than something thrown, which is the whole point of the shape.
   */
  novaseed: {
    range: 23.0,
    minRange: 3.0,
    speed: 20.0,
    accel: 0.95,
    cooldown: 1.2,
    castAnim: 'cast1',
    damage: 210,
    lifetime: 0.9,
    fadeTime: 0.7,

    handHeight: 1.36,
    handForward: 0.6,
    handSide: 0.0, // centre line, both hands
    endHeight: 1.3,

    arc: 1.0,
    arcCurve: 1.0,
    weaveAmp: 0.55,
    weaveFreq: 0.55,
    weaveLateral: 0.0,
    weaveVertical: 1.0,

    hitRadius: 0.7,
    stepLength: 0.3,

    shape: 'novaseed',
    bodySize: 0.6,
    bodyStretch: 1.0,
    spin: 3.2,
    tumble: 1.1,
    wobble: 0.5, // the deepest secondary motion of the ten
    metalness: 0.2,
    roughness: 0.35,
    emissive: 2.2,
    envIntensity: 1.4,
    shellSize: 1.55,
    shellOpacity: 0.4,
    coreSize: 0.44,
    coreOpacity: 1.0,
    colorBody: '#6b5a2f',
    colorEdge: '#ffd76a',
    colorCore: '#fff6d8',
    colorGlow: '#ffc23c',

    trailSpan: 4.6, // short: a slow body does not need a long wake to read
    trailWidth: 0.5,
    trailTaper: 1.2,
    trailOpacity: 0.6,
    trailGlow: 2.2,
    trailSheath: 2.4,
    trailTwist: 1.6,
    trailBurnout: 0.5,
    colorTrailA: '#fff2c8',
    colorTrailB: '#c07a10',

    emberRate: 160,
    emberSize: 0.08,
    emberSpeed: 1.6,
    emberSpread: 0.7,
    emberLifetime: 1.0,
    emberRise: 0.9,
    emberGlow: 2.0,
    emberTurbulence: 0.8,
    colorEmberA: '#fffbe8',
    colorEmberB: '#ffd76a',
    colorEmberC: '#e08a1c',
    colorEmberD: '#2a1a04',
    sparkRate: 80,
    sparkSize: 0.12,
    sparkSpeed: 4.0,
    sparkLifetime: 0.7,
    sparkGravity: -6.5,
    sparkStretch: 0.24,
    colorSparkA: '#ffffff',
    colorSparkB: '#ffe9a8',
    colorSparkC: '#f0a020',
    colorSparkD: '#2e1c05',

    muzzleSize: 0.95,
    muzzleIntensity: 2.0,
    muzzleMode: 0, // BurstMode.FIRE
    muzzleSparks: 80,
    castFlash: 0.12,
    castShake: 0.22,
    colorCastFlash: '#ffe9a8',

    impactMode: 0,
    burstSize: 4.0,
    burstIntensity: 2.0,
    burstTurbulence: 1.2,
    burstSparks: 240,
    burstEmbers: 220,
    impactRing: 5.4,
    impactShake: 0.9,
    shakeDuration: 0.75,
    impactFlash: 0.28,
    impactLight: 24,
    colorShockA: '#ffc23c',
    colorShockB: '#fff6d8',
    colorFlash: '#ffdc8c',

    decalType: 0, // DecalType.SCORCH
    scorchRadius: 2.2,
    scorchLife: 6.5,
    scorchIntensity: 0.8,
    colorScorch: '#120c05',

    fizzleSize: 1.8,
    fizzleMotes: 80,
    fizzleSpread: 1.0,

    lightIntensity: 20,
    lightRadius: 13,
    lightColor: '#ffc23c',
    lightFlicker: 0.22,
    lightFlickerSpeed: 7
  },

  /* ================================================================== */
  /* VOID SPINDLE                                                        */
  /* ================================================================== */
  /**
   * A dark bipyramid on the widest swing in the group, with three slivers in
   * orbit around it.
   *
   * `weaveAmp` 1.05 at `weaveFreq` 0.5 is a little over a metre of lateral
   * displacement every two metres travelled — a genuine S through the air, and
   * far and away the hardest of the ten to land on a target you have not led.
   * The body itself is nearly black: what the eye follows is the violet rim and
   * the satellites, not the mass.
   */
  spindle: {
    range: 27.0,
    minRange: 3.0,
    speed: 30.0,
    accel: 1.1,
    cooldown: 0.95,
    castAnim: 'cast2',
    damage: 175,
    lifetime: 0.6,
    fadeTime: 0.55,

    handHeight: 1.3,
    handForward: 0.68,
    handSide: 0.24,
    endHeight: 1.15,

    arc: 0.4,
    arcCurve: 1.0,
    weaveAmp: 1.05, // the widest weave of the ten
    weaveFreq: 0.5,
    weaveLateral: 1.0,
    weaveVertical: 0.15, // barely: enough to keep the S from reading as flat

    hitRadius: 0.48,
    stepLength: 0.26,

    shape: 'spindle',
    bodySize: 0.44,
    bodyStretch: 3.0,
    spin: 4.0,
    tumble: 0.0,
    wobble: 0.35, // the satellites ride this
    metalness: 0.35,
    roughness: 0.18,
    emissive: 1.4,
    envIntensity: 1.0,
    shellSize: 1.7,
    shellOpacity: 0.34,
    coreSize: 0.3,
    coreOpacity: 0.8,
    colorBody: '#1a1226', // the darkest body in the library
    colorEdge: '#b06bff',
    colorCore: '#e8d8ff',
    colorGlow: '#9b5bff',

    trailSpan: 6.0,
    trailWidth: 0.34,
    trailTaper: 2.0,
    trailOpacity: 0.72,
    trailGlow: 2.1,
    trailSheath: 3.0,
    trailTwist: 0.8,
    trailBurnout: 0.4,
    colorTrailA: '#d8b8ff',
    colorTrailB: '#2a1050',

    emberRate: 120,
    emberSize: 0.07,
    emberSpeed: 1.3,
    emberSpread: 0.4,
    emberLifetime: 0.9,
    emberRise: 0.4,
    emberGlow: 1.8,
    emberTurbulence: 0.7,
    colorEmberA: '#f0e2ff',
    colorEmberB: '#b06bff',
    colorEmberC: '#5a2fb0',
    colorEmberD: '#120626',
    sparkRate: 50,
    sparkSize: 0.1,
    sparkSpeed: 3.4,
    sparkLifetime: 0.55,
    sparkGravity: -5.0,
    sparkStretch: 0.3,
    colorSparkA: '#ffffff',
    colorSparkB: '#d8b8ff',
    colorSparkC: '#7a3fd0',
    colorSparkD: '#180a30',

    muzzleSize: 0.8,
    muzzleIntensity: 1.7,
    muzzleMode: 2,
    muzzleSparks: 58,
    castFlash: 0.08,
    castShake: 0.2,
    colorCastFlash: '#c89aff',

    impactMode: 2,
    burstSize: 3.2,
    burstIntensity: 1.8,
    burstTurbulence: 0.8,
    burstSparks: 200,
    burstEmbers: 130,
    impactRing: 4.6,
    impactShake: 0.6,
    shakeDuration: 0.5,
    impactFlash: 0.2,
    impactLight: 18,
    colorShockA: '#9b5bff',
    colorShockB: '#e8d8ff',
    colorFlash: '#b88aff',

    decalType: 0,
    scorchRadius: 1.8,
    scorchLife: 5.0,
    scorchIntensity: 0.65,
    colorScorch: '#0a0614',

    fizzleSize: 1.3,
    fizzleMotes: 65,
    fizzleSpread: 0.8,

    lightIntensity: 14,
    lightRadius: 11,
    lightColor: '#9b5bff',
    lightFlicker: 0.16,
    lightFlickerSpeed: 11
  },

  /* ================================================================== */
  /* ASTRAL CALTROP                                                      */
  /* ================================================================== */
  /**
   * A four-spiked crystal star thrown end over end.
   *
   * `tumble` 7.8 is by far the highest in the group and it is the whole
   * signature: the spikes sweep a sphere as it goes, so the outline is never
   * the same two frames running. The collision does not follow that — it stays
   * a sphere of `hitRadius`, which is the honest simplification, and the radius
   * is set to the tumbling body's swept extent rather than to any one pose.
   */
  caltrop: {
    range: 21.0, // the shortest reach of the ten
    minRange: 3.2,
    speed: 18.0,
    accel: 0.9,
    cooldown: 1.1,
    castAnim: 'cast1',
    damage: 190,
    lifetime: 0.8,
    fadeTime: 0.6,

    handHeight: 1.38,
    handForward: 0.6,
    handSide: 0.28,
    endHeight: 0.95,

    arc: 2.2,
    arcCurve: 0.95,
    weaveAmp: 0.3,
    weaveFreq: 0.9,
    weaveLateral: 0.6,
    weaveVertical: 0.3,

    hitRadius: 0.66, // the swept extent of the spikes, not the core
    stepLength: 0.3,

    shape: 'caltrop',
    bodySize: 0.5,
    bodyStretch: 1.0,
    spin: 3.0,
    tumble: 7.8, // the fastest tumble in the library
    wobble: 0.2,
    metalness: 0.15,
    roughness: 0.12,
    emissive: 1.5,
    envIntensity: 2.0,
    shellSize: 1.4,
    shellOpacity: 0.3,
    coreSize: 0.3,
    coreOpacity: 0.9,
    colorBody: '#5f86b8',
    colorEdge: '#cfe8ff',
    colorCore: '#ffffff',
    colorGlow: '#8fd0ff',

    trailSpan: 4.2, // the shortest wake: a tumbling body beads its own trail
    trailWidth: 0.42,
    trailTaper: 1.1,
    trailOpacity: 0.5,
    trailGlow: 1.9,
    trailSheath: 2.2,
    trailTwist: 2.8,
    trailBurnout: 0.45,
    colorTrailA: '#e2f4ff',
    colorTrailB: '#2f5f9c',

    emberRate: 100,
    emberSize: 0.09,
    emberSpeed: 1.8,
    emberSpread: 0.8,
    emberLifetime: 0.8,
    emberRise: 0.6,
    emberGlow: 1.6,
    emberTurbulence: 1.0,
    colorEmberA: '#ffffff',
    colorEmberB: '#cfe8ff',
    colorEmberC: '#4f90d8',
    colorEmberD: '#0c1e34',
    sparkRate: 75,
    sparkSize: 0.12,
    sparkSpeed: 3.8,
    sparkLifetime: 0.6,
    sparkGravity: -8.0,
    sparkStretch: 0.28,
    colorSparkA: '#ffffff',
    colorSparkB: '#dff0ff',
    colorSparkC: '#5fa8e8',
    colorSparkD: '#0e2338',

    muzzleSize: 0.9,
    muzzleIntensity: 1.5,
    muzzleMode: 4, // BurstMode.FROST
    muzzleSparks: 66,
    castFlash: 0.08,
    castShake: 0.24,
    colorCastFlash: '#cfe8ff',

    impactMode: 4,
    burstSize: 3.4,
    burstIntensity: 1.6,
    burstTurbulence: 1.5,
    burstSparks: 230,
    burstEmbers: 160,
    impactRing: 4.8,
    impactShake: 0.8,
    shakeDuration: 0.6,
    impactFlash: 0.22,
    impactLight: 19,
    colorShockA: '#8fd0ff',
    colorShockB: '#ffffff',
    colorFlash: '#cfe8ff',

    decalType: 6, // DecalType.FROST
    scorchRadius: 2.0,
    scorchLife: 6.0,
    scorchIntensity: 0.7,
    colorScorch: '#0c1420',

    fizzleSize: 1.6,
    fizzleMotes: 70,
    fizzleSpread: 0.95,

    lightIntensity: 15,
    lightRadius: 12,
    lightColor: '#8fd0ff',
    lightFlicker: 0.18,
    lightFlickerSpeed: 10
  },

  /* ================================================================== */
  /* TIDE HARPOON                                                        */
  /* ================================================================== */
  /**
   * A barbed shaft that sags on its way out, paying out beads behind it.
   *
   * The only negative `arc` in the library: instead of lobbing, the path drops
   * below the straight line and comes back up onto the target point, and
   * `arcCurve` 1.35 puts the lowest part of that sag past the halfway mark. It
   * is the one shot of the ten that can pass *under* a target rather than
   * beside it, which is a different kind of miss and worth having in the set.
   */
  harpoon: {
    range: 28.0,
    minRange: 3.0,
    speed: 44.0,
    accel: 1.12,
    cooldown: 0.9,
    castAnim: 'cast2',
    damage: 155,
    lifetime: 0.5,
    fadeTime: 0.45,

    handHeight: 1.42, // thrown from over the shoulder, which is why it can sag
    handForward: 0.72,
    handSide: 0.22,
    endHeight: 0.85,

    arc: -1.3, // negative: the path droops instead of lobbing
    arcCurve: 1.35,
    weaveAmp: 0.18,
    weaveFreq: 0.6,
    weaveLateral: 0.5,
    weaveVertical: 0.0,

    hitRadius: 0.4,
    stepLength: 0.24,

    shape: 'harpoon',
    bodySize: 0.4,
    bodyStretch: 3.2,
    spin: 5.0,
    tumble: 0.0,
    wobble: 0.4, // the beads swing behind the head on this
    metalness: 0.5,
    roughness: 0.15,
    emissive: 1.3,
    envIntensity: 2.4, // the glassiest body of the ten
    shellSize: 1.45,
    shellOpacity: 0.3,
    coreSize: 0.26,
    coreOpacity: 0.8,
    colorBody: '#2f7f9c',
    colorEdge: '#9fe8ff',
    colorCore: '#eaffff',
    colorGlow: '#4fd8ff',

    trailSpan: 7.2,
    trailWidth: 0.28,
    trailTaper: 2.2,
    trailOpacity: 0.78,
    trailGlow: 2.0,
    trailSheath: 3.0,
    trailTwist: 0.4,
    trailBurnout: 0.35,
    colorTrailA: '#d8f8ff',
    colorTrailB: '#1f6a92',

    emberRate: 140,
    emberSize: 0.06,
    emberSpeed: 1.4,
    emberSpread: 0.35,
    emberLifetime: 0.7,
    emberRise: 0.35,
    emberGlow: 1.7,
    emberTurbulence: 0.5,
    colorEmberA: '#ffffff',
    colorEmberB: '#b0eeff',
    colorEmberC: '#2f9cd0',
    colorEmberD: '#08202e',
    sparkRate: 60,
    sparkSize: 0.1,
    sparkSpeed: 3.6,
    sparkLifetime: 0.5,
    sparkGravity: -9.0,
    sparkStretch: 0.32,
    colorSparkA: '#ffffff',
    colorSparkB: '#cff4ff',
    colorSparkC: '#3fb0e0',
    colorSparkD: '#0a2430',

    muzzleSize: 0.8,
    muzzleIntensity: 1.7,
    muzzleMode: 1, // BurstMode.WATER
    muzzleSparks: 62,
    castFlash: 0.08,
    castShake: 0.2,
    colorCastFlash: '#bff0ff',

    impactMode: 1,
    burstSize: 3.2,
    burstIntensity: 1.6,
    burstTurbulence: 1.0,
    burstSparks: 210,
    burstEmbers: 140,
    impactRing: 4.6,
    impactShake: 0.6,
    shakeDuration: 0.5,
    impactFlash: 0.2,
    impactLight: 18,
    colorShockA: '#4fd8ff',
    colorShockB: '#eaffff',
    colorFlash: '#bff0ff',

    decalType: 5, // DecalType.FOAM
    scorchRadius: 2.1,
    scorchLife: 5.5,
    scorchIntensity: 0.6,
    colorScorch: '#08161e',

    fizzleSize: 1.3,
    fizzleMotes: 60,
    fizzleSpread: 0.85,

    lightIntensity: 14,
    lightRadius: 11,
    lightColor: '#4fd8ff',
    lightFlicker: 0.12,
    lightFlickerSpeed: 13
  },

  /* ================================================================== */
  /* HELIX FANG                                                          */
  /* ================================================================== */
  /**
   * Two blades sharing one axis at 26 rad/s, on a dead straight path.
   *
   * The inverse of the spindle: nothing about the *path* moves, everything
   * about the *body* does. Both blades are offset from the axis and pitched
   * against each other, so the pair sweeps a double helix through the air and
   * the trail is twisted to match at `trailTwist` 3.4 — the hardest-rolled
   * ribbon in the library. That the shot itself travels in a straight line is
   * what makes it the most reliable of the ten to actually land.
   */
  helix: {
    range: 26.0,
    minRange: 2.8,
    speed: 38.0,
    accel: 1.06,
    cooldown: 0.9,
    castAnim: 'cast3',
    damage: 200,
    lifetime: 0.6,
    fadeTime: 0.5,

    handHeight: 1.3,
    handForward: 0.7,
    handSide: 0.0,
    endHeight: 1.1,

    arc: 0.3,
    arcCurve: 1.0,
    weaveAmp: 0.0, // straight, on purpose
    weaveFreq: 0.0,
    weaveLateral: 0.0,
    weaveVertical: 0.0,

    hitRadius: 0.5,
    stepLength: 0.26,

    shape: 'helix',
    bodySize: 0.46,
    bodyStretch: 2.0,
    spin: 26.0,
    tumble: 0.0,
    wobble: 0.28,
    metalness: 0.4,
    roughness: 0.2,
    emissive: 1.9,
    envIntensity: 1.5,
    shellSize: 1.5,
    shellOpacity: 0.36,
    coreSize: 0.28,
    coreOpacity: 1.0,
    colorBody: '#7a2050',
    colorEdge: '#ff6ab0',
    colorCore: '#ffe0f0',
    colorGlow: '#ff4f9c',

    trailSpan: 6.6,
    trailWidth: 0.46,
    trailTaper: 1.7,
    trailOpacity: 0.7,
    trailGlow: 2.3,
    trailSheath: 2.6,
    trailTwist: 3.4, // the hardest-rolled ribbon of the ten
    trailBurnout: 0.38,
    colorTrailA: '#ffd0e8',
    colorTrailB: '#8f1f58',

    emberRate: 150,
    emberSize: 0.07,
    emberSpeed: 1.6,
    emberSpread: 0.5,
    emberLifetime: 0.8,
    emberRise: 0.5,
    emberGlow: 1.9,
    emberTurbulence: 0.75,
    colorEmberA: '#ffffff',
    colorEmberB: '#ffb0d8',
    colorEmberC: '#d02f7a',
    colorEmberD: '#2a0618',
    sparkRate: 70,
    sparkSize: 0.11,
    sparkSpeed: 4.0,
    sparkLifetime: 0.55,
    sparkGravity: -6.0,
    sparkStretch: 0.3,
    colorSparkA: '#ffffff',
    colorSparkB: '#ffc8e4',
    colorSparkC: '#e04f96',
    colorSparkD: '#2e0a1c',

    muzzleSize: 0.85,
    muzzleIntensity: 1.9,
    muzzleMode: 5,
    muzzleSparks: 74,
    castFlash: 0.1,
    castShake: 0.22,
    colorCastFlash: '#ffb0d8',

    impactMode: 5,
    burstSize: 3.4,
    burstIntensity: 1.9,
    burstTurbulence: 1.0,
    burstSparks: 240,
    burstEmbers: 150,
    impactRing: 4.8,
    impactShake: 0.7,
    shakeDuration: 0.55,
    impactFlash: 0.24,
    impactLight: 20,
    colorShockA: '#ff4f9c',
    colorShockB: '#ffe0f0',
    colorFlash: '#ffa8d0',

    decalType: 7, // DecalType.ARC
    scorchRadius: 1.9,
    scorchLife: 5.0,
    scorchIntensity: 0.68,
    colorScorch: '#160610',

    fizzleSize: 1.4,
    fizzleMotes: 66,
    fizzleSpread: 0.9,

    lightIntensity: 16,
    lightRadius: 11,
    lightColor: '#ff4f9c',
    lightFlicker: 0.2,
    lightFlickerSpeed: 15
  }
};
