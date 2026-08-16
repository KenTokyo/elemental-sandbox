/**
 * blocks-bolts-a.js — the Kinetic Assembly: five instant-cast projectiles that can miss.
 *
 * These five and the five in `blocks-bolts-b.js` are the first blocks in the
 * library that describe a **body in flight** rather than an effect on a
 * timeline. Everything above them resolves at the end of the cast line because
 * the end of the line is the only place they can resolve; a bolt resolves
 * wherever it happens to touch something, or nowhere at all.
 *
 * Three key families are new and are what `BoltAbility` is built around:
 *
 *  - **the path** (`arc`, `arcCurve`, `weave*`) — where the body is at a given
 *    distance travelled, evaluated live, so dragging `weaveAmp` re-bends a
 *    projectile that is already halfway downrange, collision included;
 *  - **the collision** (`hitRadius`, `stepLength`) — `stepLength` is the longest
 *    piece of path that may be tested as one straight segment. A 74 m/s round
 *    covers 1.23 m in a 60 fps frame, so without substepping it would tunnel
 *    straight through a 0.85 m target between two frames;
 *  - **the two endings** (`impact*` vs `fizzle*`) — a contact and a miss are
 *    deliberately different events with different vocabularies, because the
 *    single most important thing this ability has to communicate is *whether it
 *    hit*.
 *
 * `damage` is the number the library card prints and the only value here the
 * training dummy ever reads. Everything else is presentation.
 *
 * All ten share one key surface exactly — a bolt that omitted a key would not
 * throw, it would hand a uniform `undefined`. `tools/audit-settings-keys.mjs`
 * is what holds that line.
 *
 * All five are `CastShape.LINE`: the arrow is aimed, the click fires, and the
 * body leaves the hand on the same frame. There is no charge anywhere in the
 * group.
 */
export const BOLT_BLOCKS_A = {
  /* ================================================================== */
  /* PRISM LANCET — the reference block, commented in full               */
  /* ================================================================== */
  /**
   * A long glass needle thrown flat and very fast.
   *
   * The narrowest silhouette in the group and the one with the least
   * decoration: four fins, a hairline trail seven metres long, and an impact
   * that is a flat pressure snap rather than a fireball. It is the control the
   * other nine are read against — if a shot is hard to see, this is the one it
   * should be compared with.
   */
  lancet: {
    /* --- the cast --- */
    range: 26.0, // maximum cast distance, metres
    minRange: 2.5, // closer than this and the cast is refused
    speed: 52.0, // muzzle speed, metres/second
    accel: 1.18, // speed at the target as a multiple of the muzzle speed
    cooldown: 0.55,
    castAnim: 'cast2', // which clip in `CAST_ANIMATIONS` the body throws
    damage: 95, // health removed by one contact — printed on the library card
    lifetime: 0.45, // seconds the contact effect holds
    fadeTime: 0.35, // seconds everything takes to clear

    /* --- where it leaves the caster --- */
    handHeight: 1.32, // metres above the floor
    handForward: 0.7, // metres in front of the caster
    handSide: 0.22, // metres to the side (+ follows `Ability#side`)
    endHeight: 1.15, // height of the path at the target point, metres

    /* --- the path --- */
    // The lob, pinned to zero at both ends: `arc` is the height added at the
    // mid-span, `arcCurve` decides whether that peak is round (1) or flattened.
    arc: 0.15,
    arcCurve: 1.0,
    // The weave, also pinned at both ends, so the body starts on the hand and
    // ends on the target point no matter how hard it is driven. `weaveFreq` is
    // in cycles per metre travelled; the two gains split that displacement
    // between the lateral axis and the vertical, and driving both gives a
    // corkscrew.
    weaveAmp: 0.0,
    weaveFreq: 0.0,
    weaveLateral: 0.0,
    weaveVertical: 0.0,

    /* --- the collision --- */
    hitRadius: 0.34, // the body's own collision radius, metres
    stepLength: 0.24, // longest piece of path tested as one segment, metres

    /* --- the body --- */
    shape: 'lancet', // which builder in `bolt-bodies.js` assembles it
    bodySize: 0.5, // overall scale, metres
    bodyStretch: 3.6, // how far it is drawn out along its own heading
    spin: 7.5, // roll about the heading, radians/second
    tumble: 0.0, // end-over-end rotation, radians/second
    wobble: 0.12, // secondary motion of the loose parts, 0 = rigid
    metalness: 0.05,
    roughness: 0.08,
    emissive: 1.6, // emissive gain on the solid parts
    envIntensity: 1.9, // how much of the HDR probe the body catches
    shellSize: 1.7, // the additive halo around it, × the body
    shellOpacity: 0.3,
    coreSize: 0.42, // the lit core inside it, × the body
    coreOpacity: 0.9,
    colorBody: '#bfe8ff',
    colorEdge: '#ffffff',
    colorCore: '#eaffff',
    colorGlow: '#4fc4ff',

    /* --- the trail --- */
    /**
     * Two ribbons on the same centre line: a bright narrow core and a wide
     * faint sheath around it. The centre line is *sampled off the path* rather
     * than recorded from past frames, which is the same rule the meteor's fire
     * hull follows — so the trail re-bends live with the path it belongs to.
     */
    trailSpan: 7.0, // metres of path the trail covers behind the body
    trailWidth: 0.17, // half-width of the core ribbon at the head, metres
    trailTaper: 2.4, // >1 pulls the tail to a point faster
    trailOpacity: 0.85,
    trailGlow: 2.4,
    trailSheath: 3.2, // width of the outer ribbon, × the core
    trailTwist: 0.0, // roll of the ribbon about its own centre line, radians
    trailBurnout: 0.28, // seconds the trail takes to die once the body is gone

    colorTrailA: '#ffffff', // at the head
    colorTrailB: '#3fa8ff', // at the tail

    /* --- embers and sparks shed along the flight --- */
    /**
     * As everywhere else in the library, each system is coloured by a four-stop
     * gradient sampled over the particle's own life, `A` at birth through `D`
     * as it dies. They are paid out per metre of path covered, not per frame,
     * so the wake stays evenly beaded at any frame rate.
     */
    emberRate: 90, // embers per second while it flies
    emberSize: 0.05,
    emberSpeed: 1.1,
    emberSpread: 0.25, // 0 = straight back, 1 = a sphere
    emberLifetime: 0.5,
    emberRise: 0.3, // buoyancy, metres/second
    emberGlow: 1.6,
    emberTurbulence: 0.25,
    colorEmberA: '#ffffff',
    colorEmberB: '#cfefff',
    colorEmberC: '#4fb4ff',
    colorEmberD: '#0a2a54',
    sparkRate: 40, // sparks per second
    sparkSize: 0.09,
    sparkSpeed: 3.2,
    sparkLifetime: 0.35,
    sparkGravity: -4.0,
    sparkStretch: 0.34, // how far a spark smears along its velocity
    colorSparkA: '#ffffff',
    colorSparkB: '#d8f4ff',
    colorSparkC: '#54c0ff',
    colorSparkD: '#0d2e5c',

    /* --- the launch --- */
    muzzleSize: 0.55, // the shell thrown off the hand, metres
    muzzleIntensity: 1.8,
    muzzleMode: 2, // BurstMode.AIR
    muzzleSparks: 46,
    castFlash: 0.07, // screen flash on release
    castShake: 0.14,
    colorCastFlash: '#d8f4ff',

    /* --- the contact --- */
    impactMode: 2, // BurstMode.AIR
    burstSize: 2.1, // radius of the shell at the contact point, metres
    burstIntensity: 1.9,
    burstTurbulence: 0.5,
    burstSparks: 180,
    burstEmbers: 80,
    impactRing: 3.0, // pressure ring snapped across the floor, metres
    impactShake: 0.45,
    shakeDuration: 0.35,
    impactFlash: 0.16,
    impactLight: 14, // additive punch on the dynamic light
    colorShockA: '#4fc4ff',
    colorShockB: '#ffffff',
    colorFlash: '#cfeeff',

    /* --- the mark left on the floor --- */
    decalType: 6, // DecalType.FROST
    scorchRadius: 1.1,
    scorchLife: 3.5,
    scorchIntensity: 0.5,
    colorScorch: '#0b1622',

    /* --- the miss --- */
    // Deliberately quiet: no shake, no screen flash, no ring. A shot that went
    // past has to be *readable as nothing having happened*.
    fizzleSize: 0.9, // radius the body dissipates into, metres
    fizzleMotes: 40,
    fizzleSpread: 0.7,

    /* --- dynamic light --- */
    lightIntensity: 9,
    lightRadius: 9,
    lightColor: '#7fd8ff',
    lightFlicker: 0.08, // depth of the gutter, 0 = steady
    lightFlickerSpeed: 16
  },

  /* ================================================================== */
  /* SLAG MORTAR                                                         */
  /* ================================================================== */
  /**
   * A lump of cooling lava lobbed on a high arc — the slowest and heaviest
   * thing in the library that still has to be aimed.
   *
   * The one bolt whose body is real generated geometry rather than assembled
   * primitives: it borrows `createAsteroidGeometry`, so the silhouette is
   * cratered and cut and its tumble actually shows. `arc` 4.4 puts the apex
   * well above head height, which is what gives the shot its hang time and
   * makes it the easiest of the ten to walk past a stationary target.
   */
  slagshot: {
    range: 22.0,
    minRange: 3.5,
    speed: 14.0,
    accel: 0.92, // it loses speed on the way down rather than gaining it
    cooldown: 1.5,
    castAnim: 'cast1',
    damage: 260, // the heaviest single contact in the group
    lifetime: 1.1,
    fadeTime: 0.8,

    handHeight: 1.4,
    handForward: 0.62,
    handSide: 0.26,
    endHeight: 0.9,

    arc: 4.4, // the tallest lob of the ten
    arcCurve: 0.85, // <1 flattens the top of the arc
    weaveAmp: 0.0,
    weaveFreq: 0.0,
    weaveLateral: 0.0,
    weaveVertical: 0.0,

    hitRadius: 0.9, // the widest body, and correspondingly forgiving
    stepLength: 0.35,

    shape: 'boulder',
    bodySize: 0.78,
    bodyStretch: 1.0, // round: nothing to stretch
    spin: 0.0,
    tumble: 3.4, // it turns over as it falls
    wobble: 0.0,
    metalness: 0.0,
    roughness: 0.85,
    emissive: 0.9,
    envIntensity: 1.2,
    shellSize: 1.28,
    shellOpacity: 0.42,
    coreSize: 0.0, // solid rock — there is no core to see
    coreOpacity: 0.0,
    colorBody: '#4a3f38',
    colorEdge: '#ff8a2e',
    colorCore: '#fff0c0',
    colorGlow: '#ff5a10',

    trailSpan: 5.2,
    trailWidth: 0.72, // the widest wake of the ten
    trailTaper: 1.3,
    trailOpacity: 0.6,
    trailGlow: 1.3,
    trailSheath: 2.0,
    trailTwist: 0.6,
    trailBurnout: 0.7,
    colorTrailA: '#ffb44a',
    colorTrailB: '#4a2418',

    emberRate: 190,
    emberSize: 0.12,
    emberSpeed: 2.0,
    emberSpread: 0.6,
    emberLifetime: 1.3,
    emberRise: 1.6,
    emberGlow: 1.3,
    emberTurbulence: 0.7,
    colorEmberA: '#fff0c8',
    colorEmberB: '#ff9a2e',
    colorEmberC: '#ff3b0d',
    colorEmberD: '#2b0d05',
    sparkRate: 70,
    sparkSize: 0.16,
    sparkSpeed: 4.5,
    sparkLifetime: 0.9,
    sparkGravity: -12.0,
    sparkStretch: 0.2,
    colorSparkA: '#fffdf2',
    colorSparkB: '#ffd27a',
    colorSparkC: '#ff6a12',
    colorSparkD: '#3d1103',

    muzzleSize: 1.1,
    muzzleIntensity: 1.5,
    muzzleMode: 0, // BurstMode.FIRE
    muzzleSparks: 70,
    castFlash: 0.1,
    castShake: 0.3,
    colorCastFlash: '#ff9a2e',

    impactMode: 0,
    burstSize: 4.6,
    burstIntensity: 1.5,
    burstTurbulence: 1.9,
    burstSparks: 220,
    burstEmbers: 260,
    impactRing: 6.2,
    impactShake: 1.1,
    shakeDuration: 0.95,
    impactFlash: 0.3,
    impactLight: 26,
    colorShockA: '#ff9a2e',
    colorShockB: '#fff3d0',
    colorFlash: '#ff9a2e',

    decalType: 0, // DecalType.SCORCH
    scorchRadius: 2.9,
    scorchLife: 8.0,
    scorchIntensity: 0.95,
    colorScorch: '#0d0907',

    fizzleSize: 2.2,
    fizzleMotes: 90,
    fizzleSpread: 1.0,

    lightIntensity: 18,
    lightRadius: 13,
    lightColor: '#ff7a2e',
    lightFlicker: 0.3,
    lightFlickerSpeed: 12
  },

  /* ================================================================== */
  /* BRAMBLE QUILL                                                       */
  /* ================================================================== */
  /**
   * A barbed thorn driven downrange on a corkscrew.
   *
   * The only body in the group whose path is helical rather than planar: both
   * weave gains are at 1, so the displacement rotates about the heading instead
   * of swinging in one plane. The collision follows the same helix — the
   * substeps are taken on the curve, not on the straight line under it, so a
   * quill that visibly passes beside a target genuinely misses it.
   */
  quill: {
    range: 24.0,
    minRange: 2.5,
    speed: 26.0,
    accel: 1.05,
    cooldown: 0.8,
    castAnim: 'cast3',
    damage: 130,
    lifetime: 0.6,
    fadeTime: 0.5,

    handHeight: 1.28,
    handForward: 0.66,
    handSide: 0.24,
    endHeight: 1.0,

    arc: 0.9,
    arcCurve: 1.1,
    weaveAmp: 0.52,
    weaveFreq: 1.45, // cycles per metre — the tightest helix of the ten
    weaveLateral: 1.0,
    weaveVertical: 1.0,

    hitRadius: 0.42,
    stepLength: 0.26,

    shape: 'quill',
    bodySize: 0.42,
    bodyStretch: 2.6,
    spin: 9.5,
    tumble: 0.0,
    wobble: 0.3, // the barbs flex against the roll
    metalness: 0.0,
    roughness: 0.55,
    emissive: 1.1,
    envIntensity: 1.1,
    shellSize: 1.5,
    shellOpacity: 0.28,
    coreSize: 0.3,
    coreOpacity: 0.7,
    colorBody: '#3f6b28',
    colorEdge: '#b6ff6a',
    colorCore: '#e6ffcf',
    colorGlow: '#8dff63',

    trailSpan: 5.6,
    trailWidth: 0.3,
    trailTaper: 1.8,
    trailOpacity: 0.7,
    trailGlow: 1.8,
    trailSheath: 2.6,
    trailTwist: 2.4, // the ribbon rolls with the helix it was laid on
    trailBurnout: 0.45,
    colorTrailA: '#d8ff9a',
    colorTrailB: '#2f7a24',

    emberRate: 130,
    emberSize: 0.07,
    emberSpeed: 1.5,
    emberSpread: 0.5,
    emberLifetime: 0.9,
    emberRise: 0.7,
    emberGlow: 1.4,
    emberTurbulence: 0.9,
    colorEmberA: '#f0ffd8',
    colorEmberB: '#9bff5f',
    colorEmberC: '#3f9c34',
    colorEmberD: '#0f2a10',
    sparkRate: 55,
    sparkSize: 0.1,
    sparkSpeed: 3.6,
    sparkLifetime: 0.6,
    sparkGravity: -7.5,
    sparkStretch: 0.26,
    colorSparkA: '#ffffff',
    colorSparkB: '#c8ff8a',
    colorSparkC: '#4fb040',
    colorSparkD: '#12300f',

    muzzleSize: 0.7,
    muzzleIntensity: 1.4,
    muzzleMode: 3, // BurstMode.EARTH
    muzzleSparks: 54,
    castFlash: 0.06,
    castShake: 0.18,
    colorCastFlash: '#b6ff6a',

    impactMode: 3,
    burstSize: 2.8,
    burstIntensity: 1.4,
    burstTurbulence: 1.4,
    burstSparks: 190,
    burstEmbers: 150,
    impactRing: 3.8,
    impactShake: 0.6,
    shakeDuration: 0.5,
    impactFlash: 0.18,
    impactLight: 16,
    colorShockA: '#8dff63',
    colorShockB: '#e6ffcf',
    colorFlash: '#b6ff6a',

    decalType: 2, // DecalType.CRACK
    scorchRadius: 1.7,
    scorchLife: 5.5,
    scorchIntensity: 0.6,
    colorScorch: '#101a0c',

    fizzleSize: 1.2,
    fizzleMotes: 60,
    fizzleSpread: 0.85,

    lightIntensity: 11,
    lightRadius: 10,
    lightColor: '#8dff63',
    lightFlicker: 0.14,
    lightFlickerSpeed: 9
  },

  /* ================================================================== */
  /* SABOT ROUND                                                         */
  /* ================================================================== */
  /**
   * The fastest projectile in the library: a machined dart at 74 m/s.
   *
   * This is the block `stepLength` exists for. At 60 fps the round covers
   * 1.23 m between frames — nearly one and a half times the training dummy's
   * collision radius — so a naive per-frame test would let it tunnel clean
   * through a target it visibly went into. At `stepLength` 0.2 the same frame is
   * resolved as seven straight segments and the contact lands on the first one
   * that touches.
   *
   * Visually the opposite of the mortar: no arc, no weave, a hairline wake nine
   * and a half metres long, and everything the shot has to say happens in the
   * quarter second it is in the air.
   */
  sabot: {
    range: 30.0, // the longest reach of the ten
    minRange: 3.0,
    speed: 74.0,
    accel: 1.0, // dead flat — it neither gains nor loses
    cooldown: 0.7,
    castAnim: 'cast2',
    damage: 165,
    lifetime: 0.35,
    fadeTime: 0.3,

    handHeight: 1.3,
    handForward: 0.75,
    handSide: 0.2,
    endHeight: 1.2,

    arc: 0.05,
    arcCurve: 1.0,
    weaveAmp: 0.0,
    weaveFreq: 0.0,
    weaveLateral: 0.0,
    weaveVertical: 0.0,

    hitRadius: 0.3, // the smallest body — it is also the least forgiving
    stepLength: 0.2, // the finest substep in the library, for the reason above

    shape: 'sabot',
    bodySize: 0.34,
    bodyStretch: 2.2,
    spin: 30.0, // rifled: it rolls far faster than it is long
    tumble: 0.0,
    wobble: 0.05,
    metalness: 0.95, // the only genuinely metallic body of the ten
    roughness: 0.24,
    emissive: 0.7,
    envIntensity: 2.2,
    shellSize: 1.35,
    shellOpacity: 0.22,
    coreSize: 0.26,
    coreOpacity: 1.0,
    colorBody: '#8f9aa8',
    colorEdge: '#e8eef6',
    colorCore: '#ffd8a0',
    colorGlow: '#ffb45a',

    trailSpan: 9.5, // the longest wake, because the body itself is tiny
    trailWidth: 0.1,
    trailTaper: 3.2,
    trailOpacity: 0.9,
    trailGlow: 2.8,
    trailSheath: 4.2,
    trailTwist: 0.0,
    trailBurnout: 0.2,
    colorTrailA: '#fff2d8',
    colorTrailB: '#7f95ad',

    emberRate: 60,
    emberSize: 0.04,
    emberSpeed: 0.9,
    emberSpread: 0.2,
    emberLifetime: 0.4,
    emberRise: 0.2,
    emberGlow: 1.5,
    emberTurbulence: 0.15,
    colorEmberA: '#ffffff',
    colorEmberB: '#ffd8a0',
    colorEmberC: '#9aa8b8',
    colorEmberD: '#141a22',
    sparkRate: 30,
    sparkSize: 0.08,
    sparkSpeed: 2.6,
    sparkLifetime: 0.3,
    sparkGravity: -6.0,
    sparkStretch: 0.42, // the hardest-stretched sparks in the group
    colorSparkA: '#ffffff',
    colorSparkB: '#ffe0b0',
    colorSparkC: '#ff9a3c',
    colorSparkD: '#2a1a10',

    muzzleSize: 0.85,
    muzzleIntensity: 2.4, // the muzzle carries this one, not the body
    muzzleMode: 5, // BurstMode.STORM
    muzzleSparks: 120,
    castFlash: 0.12,
    castShake: 0.3,
    colorCastFlash: '#ffe0b0',

    impactMode: 5,
    burstSize: 2.4,
    burstIntensity: 2.2,
    burstTurbulence: 0.7,
    burstSparks: 320, // the largest spark count of the ten
    burstEmbers: 60,
    impactRing: 3.4,
    impactShake: 0.7,
    shakeDuration: 0.4,
    impactFlash: 0.22,
    impactLight: 20,
    colorShockA: '#e8eef6',
    colorShockB: '#ffd8a0',
    colorFlash: '#e8eef6',

    decalType: 0, // DecalType.SCORCH
    scorchRadius: 0.9,
    scorchLife: 4.0,
    scorchIntensity: 0.7,
    colorScorch: '#0a0e14',

    fizzleSize: 0.8,
    fizzleMotes: 34,
    fizzleSpread: 0.5,

    lightIntensity: 12,
    lightRadius: 10,
    lightColor: '#ffc47a',
    lightFlicker: 0.1,
    lightFlickerSpeed: 20
  },

  /* ================================================================== */
  /* GYRE CHAKRAM                                                        */
  /* ================================================================== */
  /**
   * A thrown ring, flying edge-on and swinging.
   *
   * The only body in the library that is wider than it is long, which is what
   * `bodyStretch` below 1 says. `spin` 24 turns it about its own axis while the
   * weave swings it sideways once every metre and a third, so the silhouette
   * changes continuously without the shape itself ever deforming — the read is
   * pure rigid-body motion, and it is the thing that tells this one apart from
   * the lancet at a glance even though both are fast and both are cyan.
   */
  chakram: {
    range: 25.0,
    minRange: 2.8,
    speed: 34.0,
    accel: 1.08,
    cooldown: 0.85,
    castAnim: 'cast3',
    damage: 145,
    lifetime: 0.55,
    fadeTime: 0.45,

    handHeight: 1.24,
    handForward: 0.7,
    handSide: 0.3,
    endHeight: 1.1,

    arc: 0.5,
    arcCurve: 1.0,
    weaveAmp: 0.62,
    weaveFreq: 0.75,
    weaveLateral: 1.0,
    weaveVertical: 0.0, // flat swing: the ring stays at throwing height

    hitRadius: 0.62,
    stepLength: 0.3,

    shape: 'chakram',
    bodySize: 0.62,
    bodyStretch: 0.9, // wider than it is long — the only one under 1
    spin: 24.0,
    tumble: 0.0,
    wobble: 0.22,
    metalness: 0.6,
    roughness: 0.3,
    emissive: 1.5,
    envIntensity: 1.6,
    shellSize: 1.22,
    shellOpacity: 0.32,
    coreSize: 0.22,
    coreOpacity: 0.85,
    colorBody: '#2f6f66',
    colorEdge: '#7fe8d0',
    colorCore: '#e6fff8',
    colorGlow: '#5fffd8',

    trailSpan: 6.4,
    trailWidth: 0.78, // a wide flat band, because the thing making it is a disc
    trailTaper: 1.5,
    trailOpacity: 0.55,
    trailGlow: 2.0,
    trailSheath: 1.8,
    trailTwist: 1.2,
    trailBurnout: 0.35,
    colorTrailA: '#c8fff0',
    colorTrailB: '#2f8f80',

    emberRate: 110,
    emberSize: 0.06,
    emberSpeed: 1.4,
    emberSpread: 0.45,
    emberLifetime: 0.7,
    emberRise: 0.5,
    emberGlow: 1.7,
    emberTurbulence: 0.6,
    colorEmberA: '#ffffff',
    colorEmberB: '#9fffe8',
    colorEmberC: '#2fb8a0',
    colorEmberD: '#0a2a26',
    sparkRate: 65,
    sparkSize: 0.11,
    sparkSpeed: 4.2,
    sparkLifetime: 0.45,
    sparkGravity: -5.5,
    sparkStretch: 0.3,
    colorSparkA: '#ffffff',
    colorSparkB: '#b0fff0',
    colorSparkC: '#3fd0b8',
    colorSparkD: '#0d302c',

    muzzleSize: 0.75,
    muzzleIntensity: 1.6,
    muzzleMode: 2,
    muzzleSparks: 60,
    castFlash: 0.07,
    castShake: 0.2,
    colorCastFlash: '#a8fff0',

    impactMode: 2,
    burstSize: 3.0,
    burstIntensity: 1.7,
    burstTurbulence: 0.9,
    burstSparks: 210,
    burstEmbers: 110,
    impactRing: 4.4,
    impactShake: 0.55,
    shakeDuration: 0.42,
    impactFlash: 0.18,
    impactLight: 17,
    colorShockA: '#5fffd8',
    colorShockB: '#e6fff8',
    colorFlash: '#9ff0e0',

    decalType: 1, // DecalType.RIPPLE
    scorchRadius: 1.5,
    scorchLife: 4.5,
    scorchIntensity: 0.55,
    colorScorch: '#0a1a1a',

    fizzleSize: 1.4,
    fizzleMotes: 55,
    fizzleSpread: 0.9,

    lightIntensity: 13,
    lightRadius: 11,
    lightColor: '#5fffd8',
    lightFlicker: 0.12,
    lightFlickerSpeed: 14
  }
};
