/**
 * blocks-farcasts.js — the two hand-written far casts: Voltaic Snare and Glacial Crown.
 *
 * Ability five and six, split out of `settings.js` under the 800-line rule in
 * `AGENTS.md`, verbatim. Both are `CastShape.ZONE`: aimed with the circle and
 * dropped at the cursor, which is why both carry `zoneRadius` — the fifth
 * field the shared aim controller reads, and the one a line cast omits.
 *
 * The snare additionally owns `field*`/`colorField*`, the ground-disc family
 * every other far cast in the library borrows through `variants.js`.
 */
export const FARCAST_BLOCKS = {
  /* ================================================================== */
  /* SNARE — ability five, and the first **far cast**                    */
  /* ================================================================== */
  /**
   * A trap planted at a point rather than a shot fired along a line: the caster
   * whips a leash of current out across the floor, and where it lands the ring
   * snaps open — a column of lightning tears up out of the middle, tendrils
   * crawl outward to the boundary and arcs run around the rim, all of it
   * holding, re-striking and dragging the air upward for `lifetime` before it
   * collapses. Reference for the look: `electricalboost.jpg`.
   *
   * This is the block that defines what a far cast *is* in this project. The
   * targeting is a circle (see the `zone` block) and `zoneRadius` is the promise
   * that circle makes: the boundary the indicator draws is the boundary the
   * field burns, the tendrils reach and the rim arcs run along, so dragging that
   * one number re-scales the indicator and a snare that is already standing
   * together.
   *
   * The whole cage is **one instanced strip** — see `materials/SnareMaterial.js`.
   * Every filament is the same ribbon, and a *role* decided from its instance
   * index (leash → column → tendril → rim) picks which parametric path the
   * vertex shader threads it along. Two draw calls for all four, however many
   * filaments are in the air.
   *
   * As in every other block, a cast captures nothing but a seed and a few
   * timestamps. Every metre, radian and second is resolved against these numbers
   * each frame — including a zero-length one, which is why the trap reshapes
   * under the sliders with the clock stopped.
   */
  snare: {
    /* --- the cast --- */
    range: 20.0, // maximum cast distance, metres
    minRange: 0.0, // a trap can legitimately be dropped on your own feet
    zoneRadius: 4.4, // the footprint — what the circle indicator measures out
    speed: 62.0, // how fast the leash races to the point, metres/second
    snapTime: 0.16, // seconds the ring takes to slam open once it lands
    lifetime: 2.6, // seconds the snare stands
    fadeTime: 0.75, // seconds it takes to collapse
    cooldown: 1.4,
    castAnim: 'cast2', // which clip in `CAST_ANIMATIONS` the body throws

    /* --- the leash that plants it --- */
    // Thrown from a hand, so these are measured from the caster's origin in the
    // cast's own frame, exactly as the bolt and the rock are.
    handHeight: 1.24, // metres above the floor
    handForward: 0.58, // metres in front of the caster
    handSide: 0.18, // metres to the side (+ follows `Ability#side`)
    leashStrands: 3, // filaments in the whip
    leashSag: -0.35, // metres the mid-span bows (negative drops it to the floor)
    leashSpread: 0.22, // how far the filaments separate, metres
    leashKink: 0.3, // kink amplitude on the whip, metres
    leashWidth: 1.0, // × the shared filament width
    leashCling: 0.12, // how far above the floor the tip runs, metres

    /* --- the column --- */
    strands: 15, // filaments in the pillar
    height: 9.2, // how high it reaches, metres
    heightCurve: 1.45, // <1 gets it up fast, >1 makes it climb late
    throat: 0.16, // radius where it leaves the floor, × zoneRadius
    columnSpread: 0.25, // radius at the top, × zoneRadius
    columnCurve: 2.88, // >1 keeps the throat tight then opens it late
    columnFlare: 0.585, // extra opening over the last quarter, × zoneRadius
    columnTwist: 0.22, // turns a filament makes over the climb
    columnSpin: 1.26, // turns/second the whole pillar rolls
    columnKink: 0.27, // kink amplitude, metres
    columnWidth: 1.86, // × the shared filament width
    columnTaper: 1.09, // how much thinner the top is than the base

    /* --- the tendrils crawling out to the boundary --- */
    tendrils: 20, // separate ground filaments (capped with the rest at 56)
    tendrilInner: 0.0, // where they leave the column, × zoneRadius
    tendrilReach: 1.07, // where they end, × zoneRadius (1 = exactly on the band)
    tendrilCurve: 1.18, // <1 throws them outward early
    tendrilWander: 1.41, // radians a tendril veers over its run
    tendrilArch: 1.16, // metres it hops off the floor mid-span
    tendrilHug: 0.005, // how far above the floor it runs, metres
    tendrilSpin: -0.225, // turns/second the whole fan rotates
    tendrilKink: 0.72, // kink amplitude, metres
    tendrilWidth: 0.75, // × the shared filament width
    tendrilDim: 0.8, // how much dimmer than the column

    /* --- the arcs running around the rim --- */
    rimArcs: 14, // arcs on the boundary at once
    rimSpan: 0.335, // fraction of the circle one arc covers
    rimSpeed: -1.84, // revolutions/second they travel
    // High enough to clear the burnt band underneath them: an arc that hops
    // 0.3 m over a band this bright is simply invisible.
    rimHeight: 0.98, // metres they hop at mid-span
    rimJitter: 0.23, // radial wobble, × zoneRadius
    rimKink: 0.15, // kink amplitude, metres
    rimWidth: 0.85, // × the shared filament width
    rimDim: 1.0,

    /* --- the shape every filament shares --- */
    // The same piecewise-linear value noise the bolt uses — linear on purpose,
    // because smoothstep rounds the corners off and the corners are the entire
    // reason it reads as lightning.
    jitter: 1.0, // master multiplier on the four per-role kink amplitudes
    jitterScale: 1.4, // kinks per metre
    octaves: 4, // 1–5; each halves the amplitude and doubles the rate
    jitterFalloff: 0.55, // amplitude kept per octave
    crawl: 2.4, // how fast the kinks slide along a filament
    pinch: 0.16, // fraction of the span the ends are pulled straight over
    restrike: 21, // times/second every filament re-rolls its shape
    flicker: 0.26, // depth of the whole-cage brightness stutter
    flickerSpeed: 30,
    strandFlash: 0.45, // how much individual filaments blink out

    /* --- the ribbon --- */
    width: 0.032, // half-width of a filament, metres
    coreSharp: 4.4, // how hard the hot core falls off across the ribbon
    glowWidth: 6.2, // the halo, × the core width
    glowFalloff: 2.3, // how fast the halo fades across its ribbon
    glowOpacity: 0.44,
    softFade: 0.7, // metres of soft fade where a filament meets geometry

    /* --- colour --- */
    // Violet rather than the Storm Lance's blue: two electric abilities on the
    // bar need to be told apart at a glance, and the hue split does it before
    // the silhouette does.
    colorCore: '#ffffff', // the centre of a filament
    colorInner: '#dcd0ff',
    colorOuter: '#8f6bff', // the outside of a filament
    colorHalo: '#2a0e8c', // the wide glow around the cage
    glow: 2.2, // overall emissive gain
    opacity: 1.0,

    /* --- the field burnt into the floor --- */
    /**
     * The indicator's promise, made real: the same circle, the same thick
     * boundary, now a live shader instead of a targeting aid. It is an
     * ability-owned mesh rather than a decal precisely because a decal captures
     * its radius when it spawns — this one has to re-scale under `zoneRadius`
     * while it is standing.
     */
    fieldBoundary: 0.02, // thickness of the burnt band, metres
    fieldBoundaryGlow: 2.9,
    fieldFill: 0.65, // the wash inside it
    fieldFalloff: 3.6, // how hard that wash crowds to the rim
    fieldVeins: 2.98, // filaments burnt across the disc
    fieldVeinScale: 2.0, // veins per metre
    fieldVeinSharp: 0.72, // 0 = a wash, 1 = hard threads
    fieldWarp: 0.55, // domain warp — what stops the veins reading as spokes
    fieldCrawl: 0.5, // how fast they writhe
    fieldRings: 2.4, // pressure rings travelling out from the middle
    fieldRingSpeed: 0.8, // rings/second
    fieldSpokes: 20, // ticks stepping around the boundary
    fieldSpokeLength: 0.5, // how far they reach in, metres
    fieldSpin: 0.05, // revolutions/second the ticks step around
    fieldCore: 1.3, // brightness of the pool the column stands in
    fieldCoreSize: 0.22, // its radius, × zoneRadius
    fieldPulse: 0.0, // brightness breathing
    fieldPulseSpeed: 3.95,
    fieldOpacity: 1.0,
    fieldHeight: 0.03, // hover distance above the floor, metres
    colorField: '#8f6bff', // the wash and the veins
    colorFieldEdge: '#ffffff', // the boundary band and the core pool

    /* --- what else the ground does --- */
    arcRate: 5.0, // branching burns laid around the rim, per second
    arcRadius: 1.2, // radius of one, metres
    arcLife: 0.75,
    arcIntensity: 0.9,
    arcBranches: 0.7, // how finely a burn splits into filaments
    trailRate: 1.1, // burns laid per metre while the leash races out
    scorchRadius: 1.6, // dark burn under the column, metres
    scorchLife: 7.5,
    scorchIntensity: 0.5,
    colorArc: '#c3b0ff',
    colorEmber: '#8f6bff',
    colorScorch: '#0b0813',
    shockRadius: 7.0, // the ring that snaps out when the trap opens, metres
    colorShockA: '#8f6bff', // body of the shockwave ring
    colorShockB: '#ffffff', // its crest

    /* --- sparks, updraft, smoke and debris --- */
    /**
     * As in every other block: a four-stop gradient sampled over the particle's
     * own lifetime, `A` at birth through `D` as it dies. The **updraft** is this
     * ability's signature system — motes drawn off the whole disc and hauled
     * inward and up into the column, which is the read that says the trap is
     * pulling on the air rather than just sitting in it.
     */
    sparkRate: 320, // sparks thrown off the cage, particles/second
    sparkSize: 0.15,
    sparkSpeed: 8.5,
    sparkLifetime: 0.55,
    sparkGravity: -13.0,
    sparkStretch: 0.2, // how far a spark smears along its velocity
    colorSparkA: '#ffffff',
    colorSparkB: '#dcd0ff',
    colorSparkC: '#8f6bff',
    colorSparkD: '#2a0e8c',
    updraftRate: 210, // motes hauled up the column, particles/second
    updraftSize: 0.07,
    updraftSpeed: 6.0, // how fast they are pulled in
    updraftLifetime: 1.4,
    updraftRise: 5.5, // upward acceleration once they are inside, m/s²
    updraftInset: 0.15, // how far inside the boundary they are picked up
    updraftTurbulence: 0.9,
    colorUpdraftA: '#8f6bff',
    colorUpdraftB: '#dcd0ff',
    colorUpdraftC: '#ffffff',
    colorUpdraftD: '#1b0a5e',
    smokeRate: 70, // haze scoured off the burnt floor
    smokeSize: 1.05,
    smokeSpeed: 1.2,
    smokeLifetime: 2.4,
    smokeOpacity: 0.06,
    smokeRise: 0.6,
    colorSmokeA: '#4a4368',
    colorSmokeB: '#3a3554',
    colorSmokeC: '#2b2740',
    colorSmokeD: '#191728',
    debrisRate: 30, // chips torn off the floor inside the ring
    debrisSize: 0.055,
    debrisSpeed: 5.5,
    debrisLifetime: 1.3,
    debrisGravity: -17.0,
    colorDebrisA: '#2a2733',
    colorDebrisB: '#201e28',
    colorDebrisC: '#1a1822',
    colorDebrisD: '#1a1822',

    /* --- dynamic light --- */
    lightIntensity: 24,
    lightRadius: 18,
    lightHeight: 0.38, // how far up the column the light sits, 0..1
    lightColor: '#a98bff',
    lightFlicker: 0.38, // depth of the light's gutter, 0 = steady
    lightFlickerSpeed: 24,

    /* --- the throw, the snap and the hold --- */
    muzzleSize: 0.5, // the flash at the hand as the leash leaves it
    muzzleIntensity: 1.7,
    castFlash: 0.09, // screen flash on release
    colorCastFlash: '#c3b0ff',
    burstSize: 2.8, // the shell thrown off when the ring opens, metres
    burstIntensity: 1.5,
    burstSparks: 200, // extra sparks at the snap
    burstDebris: 60,
    pulseRate: 1.5, // pressure shells shed off the column while it holds, /s
    pulseSize: 1.2, // radius of one, metres
    pulseIntensity: 0.5,
    ringRate: 1.4, // dust rings pushed across the floor while it holds, /s
    impactShake: 0.85,
    shakeDuration: 0.6,
    holdShake: 0.07, // continuous rumble while the snare stands
    impactFlash: 0.26,
    rumble: 0.025, // rumble while the leash races out
    colorBurstA: '#8f6bff',
    colorBurstB: '#dcd0ff',
    colorBurstC: '#ffffff',
    colorFlash: '#c3b0ff' // the full-screen flash when it snaps open
  },

  /* ================================================================== */
  /* GLACIER — ability six, and the far cast that comes out of the floor */
  /* ================================================================== */
  /**
   * A cold front races along the floor to the aimed point, the disc freezes out
   * to the boundary the circle drew, and a wall of crystal tears up out of the
   * ground around it: a ring of blades leaning outward with a skirt of wreckage
   * banked against their feet. It stands, glints, breathes cold off its rim —
   * and then breaks into plates and sinks back into the floor. Reference for the
   * look: `Hud7Xfg3LH.jpg`.
   *
   * The **middle stays open**: every shard is seated in a band about
   * `zoneRadius` and nothing is planted in the centre, because the read is a
   * wall you are looking into and filling the disc stops it being a ring. What
   * lives inside it is air and frozen ground.
   *
   * The second **far cast**, and the counterpart to the Voltaic Snare: same
   * circle, same promise, opposite answer. The snare fills the footprint with
   * current standing in the air; this one fills it with geometry standing on the
   * ground, so `zoneRadius` is again the one number that matters — it is where
   * the ring of blades is seated, where the sheet's boundary band burns, where
   * the curtain of cold air stands and where the rime creeps.
   *
   * Three things carry it, and each has its own group below:
   *
   *  - **the sweep.** The ring does not appear; it *closes*. The blade nearest
   *    the caster goes up first and the wave runs around both sides to meet
   *    behind the crown (`sweepTime`), with the skirt banking up behind the wave
   *    (`skirtDelay`, `skirtWave`).
   *  - **the freeze front.** Every shard crystallises upward along its own axis
   *    while it rises (`frontRough`, `frontWidth`, `frontGlow` — see
   *    `materials/GlacierMaterial.js`), so the ice *forms* rather than sliding
   *    out of a hole.
   *  - **the shatter.** It leaves the same way it arrived, in pieces: a
   *    per-shard ramp against a chunk id made of voronoi cells and flat facets,
   *    so plates and wedges come away one at a time (`shatterScale`,
   *    `shatterEdge`, `shatterGlow`).
   *
   * As in every other block, a cast captures nothing but a seed and a handful of
   * timestamps. Every metre, radian and second is resolved against these numbers
   * each frame — including a zero-length one, which is why the crown reshapes
   * under the sliders with the clock stopped.
   */
  glacier: {
    /* --- the cast --- */
    range: 18.0, // maximum cast distance, metres
    minRange: 0.0, // a wall of ice around your own feet is a legitimate play
    zoneRadius: 4.6, // the footprint — what the circle indicator measures out
    speed: 44.0, // how fast the front races to the point, metres/second
    snapTime: 0.22, // seconds the sheet takes to freeze out to the boundary
    lifetime: 4.2, // seconds the crown stands
    shatterDelay: 0.5, // seconds after `lifetime` before the ice starts to break
    shatterStagger: 0.45, // seconds of random delay between neighbours
    sinkTime: 1.15, // seconds one shard takes to crumble and withdraw
    cooldown: 1.6,
    castAnim: 'cast3', // which clip in `CAST_ANIMATIONS` the body throws

    /* --- where the front leaves the caster --- */
    // Thrown from a hand, so these are measured from the caster's origin in the
    // cast's own frame, exactly as the bolt, the rock and the leash are.
    handHeight: 1.22, // metres above the floor
    handForward: 0.6, // metres in front of the caster
    handSide: 0.18, // metres to the side (+ follows `Ability#side`)

    /* --- how the footprint is filled --- */
    /**
     * Everything is seated in a band about `zoneRadius`; the middle of the
     * circle is left empty on purpose, because the read of the ability is a wall
     * you are looking *into* and filling the disc stops it being a ring. The
     * spire in the middle is kept as a control and ships at zero.
     */
    spikeCount: 220, // instances spent on one cast (capped at 320)
    density: 1.0, // multiplier on that count
    ringShare: 0.6, // fraction of them spent on the wall at the boundary
    coreShare: 0.0, // ... on the spire in the middle (0 = the middle stays open)
    lateShare: 0.12, // ... held back to push up during the hold
    ringSeat: 0.94, // where the wall stands, × zoneRadius
    ringScatter: 0.16, // radial jitter of the wall, × zoneRadius
    skirtSeat: 0.74, // inner lip of the wreckage banked against it, × zoneRadius
    skirtBand: 0.42, // how wide that band is, × zoneRadius
    skirtBias: 0.9, // <1 pushes the skirt outward, >1 crowds it inward
    coreSpread: 0.16, // radius of the cluster in the middle, × zoneRadius

    /* --- the silhouette --- */
    /**
     * The reference is a *starburst*, not a fence: long needles thrown outward
     * from the rim at a steep angle, fanned off the radius so they cross, with
     * wildly uneven lengths. `ringLean` is the single control that decides
     * whether this reads as a crown or a picket line — at 0 it is a fence, and
     * the higher it goes the further the blades are thrown out over the floor.
     */
    ringHeight: 1.4, // length of a blade on the wall, metres
    ringWave: 0.61, // how uneven the crest of that wall is, 0..1
    skirtHeight: 1.7, // length of a shard in the skirt, metres
    coreHeight: 5.2, // length of the spire, metres
    heightJitter: 0.65,
    ringLean: 0.33, // radians the wall is thrown outward (≈19°)
    skirtLean: 0.3, // ... and the skirt
    coreLean: 0.2, // the spire stands nearly upright
    leanJitter: 1.3,
    fan: 1.16, // radians a blade is splayed off its own radius, ± — the crossing
    twist: 1.0, // random yaw, 0..1 of a full turn
    rubble: 0.53, // fraction of the skirt demoted to ankle-height wreckage
    rubbleScale: 0.34,

    /* --- an individual crystal --- */
    // Blunt wedges rather than needles: a thick base that only narrows to about
    // a third at the tip, so each facet stays wide enough to catch a flash.
    radius: 0.375, // base radius, metres
    radiusJitter: 0.94,
    taper: 0.36, // tip radius as a fraction of the base
    facets: 7, // sides of the prism — fewer, so each facet is a broad flash
    roughness: 0.0, // how far the facets are pushed off a clean prism
    bend: 0.0, // sideways curve from base to tip — nearly straight

    /* --- the bloom: when each shard goes up --- */
    riseTime: 0.2, // seconds from buried to full height
    riseOvershoot: 0.3, // how far past full height the punch carries
    settle: 0.5, // seconds the overshoot takes to damp out
    sweepTime: 0.42, // seconds the wave takes to run around the ring
    skirtDelay: 0.1, // seconds before the skirt starts
    skirtWave: 0.26, // ... and how long it takes to cross the band
    coreDelay: 0.2, // seconds before the spire comes up
    stagger: 0.07, // seconds of random delay on top of all of it
    bloomSpread: 0.7, // fraction of the hold the late shards are scattered over

    /* --- the ice: prismatic glass, not the Lance's quarried crystal --- */
    /**
     * Deliberately the *opposite* treatment to `ice`. Two frost abilities on one
     * bar have to be told apart before the silhouette does it, and a recolour is
     * not enough — so where the Frost Lance is milky, diffuse and tinted deeper
     * the thicker it gets, these blades are near-empty glass carried entirely by
     * their edges: a chromatically split fresnel (`dispersion`), light piped up
     * the body to an incandescent point (`pipe`, `tipBias`, `tipGlow`), flow
     * lines instead of feather frost (`stria`) and one real reflection of the
     * stage off every facet (`envIntensity`, `specular`).
     * See `materials/GlacierMaterial.js`.
     */
    colorGlass: '#0e4a66', // the little body it has
    colorEdge: '#ffffff', // the silhouette, the flow lines and the glint
    colorPrismA: '#57f0ff', // one end of the dispersion split
    colorPrismB: '#8f9bff', // ... and the other
    colorCore: '#a8f4ff', // the light piped up the blade
    colorTip: '#ffffff', // the incandescent point
    body: 1.37, // how much of a body it has at all, 0 = pure edges
    edgePower: 1.14, // how tightly the silhouette hugs the rim
    edgeGain: 0.81, // how hard it burns
    dispersion: 0.73, // how far the red, green and blue fresnels come apart
    pipe: 1.09, // light piped along the blade
    tipBias: 1.6, // how hard that light crowds toward the point
    bands: 1.4, // slow waves travelling up it
    pulseSpeed: 0.6,
    tipStart: 0.6, // where the incandescent tip begins, 0..1 up the blade
    tipGlow: 1.5,
    stria: 0.75, // flow lines running the blade's length
    striaScale: 6.0,
    envIntensity: 0.6, // how much of the HDR probe the facets catch
    specular: 2.0, // the tight sun lobe off them
    glow: 1.0, // overall emissive gain
    opacity: 1.0,
    birthGlow: 2.2, // extra glow on a shard that has just erupted
    birthFade: 0.5, // seconds that birth flash lasts

    /* --- the freeze front and the shatter --- */
    /**
     * The two things that make this ability's ice *arrive* and *leave* rather
     * than fade in and out. Both are per-instance ramps the ability drives; what
     * lives here is only their look.
     */
    frontRough: 0.35, // how ragged the crystallising edge is
    frontWidth: 0.12, // how much of the shard is lit behind that edge
    frontGlow: 2.4, // how hard it burns
    shatterScale: 7.0, // break-up cells per unit of the crystal
    shatterEdge: 0.08, // width of the lit rim on a fresh break
    shatterGlow: 3.0,

    /* --- the sheet of ice on the floor --- */
    /**
     * The indicator's promise, made real: the same circle and the same thick
     * boundary, now a frozen sheet instead of a targeting aid. An ability-owned
     * mesh rather than a decal precisely because a decal captures its radius
     * when it spawns — this one has to re-scale under `zoneRadius` while the
     * crown is standing, and to run its own front outward and back.
     */
    fieldBoundary: 0.4, // thickness of the band at the edge, metres
    fieldBoundaryGlow: 2.4,
    fieldFill: 0.26, // the wash inside it
    fieldFalloff: 1.4, // how hard that wash crowds to the rim
    fieldPlates: 1.0, // tonal break-up between plates
    fieldPlateScale: 2.2, // plates per metre
    fieldSeam: 0.8, // rime piled in the seams between them
    fieldFingers: 0.9, // frost fingers crawling over the sheet
    fieldFingerScale: 1.6, // fingers per metre
    fieldWarp: 0.5, // domain warp — what stops them reading as spokes
    fieldCrawl: 0.12, // how fast they writhe
    fieldRings: 2.6, // pressure rings travelling in toward the spire
    fieldRingSpeed: -0.5, // rings/second (negative travels inward)
    fieldSweep: 0.4, // slow cold sweep around the disc
    fieldSweepSpeed: 0.12, // revolutions/second
    fieldCore: 1.0, // brightness of the pool the spire stands in
    fieldCoreSize: 0.2, // its radius, × zoneRadius
    fieldPulse: 0.18, // brightness breathing
    fieldPulseSpeed: 1.6,
    fieldOpacity: 1.0,
    fieldHeight: 0.03, // hover distance above the floor, metres
    colorField: '#a7e6ff', // the wash, the plates and the fingers
    colorFieldEdge: '#ffffff', // the boundary band, the seams and the pool

    /* --- the curtain of cold air standing on the ring --- */
    /**
     * An open cylinder seated on the boundary, eroded by ridged noise stretched
     * hard vertically and scrolled downward. This is the piece that frames the
     * crown from the outside: without it the wall of blades ends at its own
     * silhouette, and a wall of ice that is not shedding cold reads as glass.
     * Set `veil` to 0 to take it off.
     */
    veil: 0.5, // master opacity of the curtain, 0 hides it
    veilHeight: 1.9, // how high it stands, metres
    veilRadius: 1.02, // where it stands, × zoneRadius
    veilFlare: 0.32, // how far it leans outward at the top
    veilBillow: 0.22, // metre-scale lobes pushing its silhouette off round
    veilScale: 1.4, // noise features per metre
    veilStretch: 0.5, // <1 draws the structures out into vertical falls
    veilFlow: 0.4, // how fast they pour downward
    veilErode: 0.55, // how much harder the top is eaten away than the base
    veilFalloff: 1.8, // how fast it thins with height
    veilSpin: 0.02, // revolutions/second the whole curtain turns
    veilSoftFade: 0.8, // metres of soft fade where it meets geometry
    colorVeil: '#8cd2ff',
    colorVeilCrest: '#ffffff',

    /* --- what the ground does --- */
    trailFrostRate: 2.2, // rime patches laid per metre of front travel
    trailFrostRadius: 1.0, // radius of one, metres
    frostSpread: 1.5, // the rime sheet under the crown, × zoneRadius
    frostLife: 7.5, // seconds a rime patch lingers
    frostIntensity: 0.85,
    frostCrystals: 1.5, // grain of the packed snow
    frostCollar: 2.6, // rime around the foot of a blade, × its own radius
    rimeRate: 3.0, // rime patches creeping around the boundary, per second
    rimeRadius: 1.0, // radius of one, metres
    colorFrost: '#f0f9ff', // the lit face of the snow
    colorFrostEdge: '#79b6dd', // what it goes in its own shadow
    shockRadius: 7.5, // the ring that snaps out when the crown blooms, metres
    ringRate: 0.9, // pressure rings pushed out while it stands, per second
    colorShockA: '#8ee8ff', // body of the shockwave ring
    colorShockB: '#ffffff', // its crest

    /* --- mist, chips, glitter and snow --- */
    /**
     * As in every other block: a four-stop gradient sampled over the particle's
     * own lifetime, `A` at birth through `D` as it dies. The **snow** is this
     * ability's signature system — ice dust spawned *above* the crown and left
     * to fall back down through it. Everything else in the project is thrown
     * upward, and a slow fall inside the ring is what says the air over it is
     * freezing rather than burning.
     */
    mistRate: 240, // cold air pouring off the rim, particles/second
    mistSize: 1.1,
    mistSpeed: 1.6,
    mistLifetime: 3.0,
    mistOpacity: 0.055,
    mistRise: -0.12, // negative: cold air is heavy, it falls and spreads
    mistTurbulence: 0.4,
    colorMistA: '#f2feff',
    colorMistB: '#cdefff',
    colorMistC: '#8ec9e8',
    colorMistD: '#0a2c42',
    shardSize: 0.07, // ice chips
    shardSpeed: 6.5,
    shardLifetime: 1.6,
    shardGravity: -15.0,
    breachShards: 3, // chips thrown as one shard breaks the surface
    shatterShards: 5, // ... and as it comes apart
    colorShardA: '#ffffff',
    colorShardB: '#cdefff',
    colorShardC: '#8ee8ff',
    colorShardD: '#0a3c55',
    glitterRate: 150, // the sparkle lifting off the sheet
    glitterSize: 0.05,
    glitterSpeed: 2.6,
    glitterLifetime: 2.4,
    glitterRise: 1.3, // upward drift, metres/second
    glitterTurbulence: 0.6,
    glitterGlow: 1.0,
    colorGlitterA: '#ffffff',
    colorGlitterB: '#6fe0ff',
    colorGlitterC: '#bdeeff',
    colorGlitterD: '#062434',
    snowRate: 110, // ice dust falling back through the crown
    snowSize: 0.045,
    snowSpeed: 0.9, // how hard it is pushed downward to start with
    snowLifetime: 3.2,
    snowFall: -1.1, // gravity on it, metres/second²
    snowTurbulence: 0.85, // what turns the fall into a drift
    snowGlow: 0.9,
    snowInset: 0.85, // how far inside the boundary it falls, × zoneRadius
    snowHeight: 1.35, // where it starts, × the height of the wall
    colorSnowA: '#ffffff',
    colorSnowB: '#e4f9ff',
    colorSnowC: '#a7e6ff',
    colorSnowD: '#0c3348',

    /* --- dynamic light --- */
    lightIntensity: 14,
    lightRadius: 16,
    lightHeight: 0.45, // how far up the crown the light sits, 0..1
    lightColor: '#8ee8ff',

    /* --- the throw, the bloom and the hold --- */
    muzzleSize: 0.55, // the puff at the hand as the front leaves it
    muzzleIntensity: 1.5,
    castFlash: 0.08, // screen flash on release
    colorCastFlash: '#cdefff',
    burstSize: 4.0, // the vapour shell thrown off at the bloom, metres
    burstIntensity: 1.1,
    burstShards: 120, // extra chips at the bloom
    burstMist: 70,
    burstGlitter: 140,
    vapourRate: 1.6, // vapour shells shed off the wall while it stands, /s
    vapourSize: 1.4, // radius of one, metres
    vapourIntensity: 0.7,
    impactShake: 0.85,
    shakeDuration: 0.85,
    holdShake: 0.05, // continuous rumble while the crown stands
    impactFlash: 0.2,
    rumble: 0.045, // rumble while the front races out
    colorBurstA: '#a7e6ff',
    colorBurstB: '#cdefff',
    colorBurstC: '#ffffff',
    colorFlash: '#cdefff' // the full-screen flash when it blooms
  },
};
