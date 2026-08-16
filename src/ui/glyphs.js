/**
 * Ability sigils for the HUD — drawn inline so they inherit `currentColor` (the
 * slot's `--accent`) and need no image assets.
 *
 * A 100×100 box, stroke only, so the mark reads the same at 34px in the ability
 * slot as it does scaled up. The box itself lives in `glyph-frame.js` because
 * `glyphs-signatures.js` draws in the same one.
 */

import { WRAP } from './glyph-frame.js';
import { SIGNATURE_SIGILS } from './glyphs-signatures.js';
import { SIGNATURE_SIGILS_V33 } from './glyphs-signatures-v33.js';
import { BOLT_SIGILS } from './glyphs-bolts.js';

/**
 * Ice — a six-fold snowflake over a rising lance.
 *
 * Three axes at 60°, each with a pair of barbs, and a heavier vertical that runs
 * past the star into a point: the star says frost, the point says skillshot.
 */
const ICE = WRAP(`
  <path d="M50 12V88"/>
  <path d="M17.5 30.5L82.5 69.5"/>
  <path d="M82.5 30.5L17.5 69.5"/>
  <path d="M50 24L41 33M50 24L59 33"/>
  <path d="M50 76L41 67M50 76L59 67"/>
  <path d="M27.5 36.5L27.7 49.2M27.5 36.5L38.5 30.4"/>
  <path d="M72.5 63.5L72.3 50.8M72.5 63.5L61.5 69.6"/>
  <path d="M72.5 36.5L72.3 49.2M72.5 36.5L61.5 30.4"/>
  <path d="M27.5 63.5L27.7 50.8M27.5 63.5L38.5 69.6"/>
`);

/**
 * Thunder — a bolt struck through a pair of arcs.
 *
 * The zigzag is drawn on the same diagonal the cast travels on, and the two
 * open arcs behind it read as the discharge spreading off it. Stroke only, like
 * the snowflake, so the two slots sit at the same visual weight.
 */
const THUNDER = WRAP(`
  <path d="M60 10L30 52H49L40 90L72 45H52L60 10Z"/>
  <path d="M23 26C13 36 11 52 17 65"/>
  <path d="M84 34C90 47 88 63 78 73"/>
`);

/**
 * Meteor — a cracked ball trailing fire.
 *
 * The circle sits forward and low with three seams splitting it, and three
 * tapering streaks run back up the same diagonal the other two sigils are drawn
 * on, so the slot reads as "the rock, thrown" at 34px.
 */
const METEOR = WRAP(`
  <circle cx="62" cy="62" r="24"/>
  <path d="M46 45L58 58L52 72M74 46L66 60L79 72M58 84L64 70"/>
  <path d="M30 70L10 90M40 34L18 22M22 48L4 44"/>
`);

/**
 * Beam — a charge held in a bracket, firing a cone.
 *
 * The orb sits low-left where the other three sigils start their diagonal, two
 * open brackets behind it read as the hands holding it, and three tapering rays
 * open out to the upper right with a single wave threaded through them: the
 * column, and the coil wrapped around it.
 */
const BEAM = WRAP(`
  <circle cx="27" cy="66" r="11"/>
  <path d="M13 55C7 62 7 74 13 81"/>
  <path d="M40 79C47 73 47 61 40 55"/>
  <path d="M41 57L92 20M42 66L94 50M43 75L92 80"/>
  <path d="M46 63C56 49 64 71 74 57C82 46 88 52 93 46"/>
`);

/**
 * Snare — a ring with a bolt standing in it.
 *
 * The only sigil in the set built around a *circle you look into* rather than a
 * diagonal, because that is the one thing this slot has to say before anything
 * else: it is not a skillshot, it is a footprint. The ellipse is the boundary
 * seen in perspective, four arcs step around it where the rim current runs, and
 * the zigzag rises out of the middle.
 */
const SNARE = WRAP(`
  <ellipse cx="50" cy="70" rx="38" ry="15"/>
  <path d="M12 70L4 70M88 70L96 70M31 82L27 89M69 82L73 89"/>
  <path d="M56 18L38 46H50L44 68"/>
  <path d="M50 55L62 40H52L58 26"/>
`);

/**
 * Glacier — a crown of blades standing on a ring.
 *
 * The second sigil built around a *circle you look into*, because it is the
 * second far cast and that is the first thing the slot has to say. Where the
 * Snare stands one bolt in the middle of its ellipse, this one stands the ring
 * itself up: five blades of uneven height rising off the boundary with the
 * spire tallest in the middle, which is the silhouette the ability actually
 * makes.
 */
const GLACIER = WRAP(`
  <ellipse cx="50" cy="74" rx="38" ry="13"/>
  <path d="M9 70L13 41L21 66"/>
  <path d="M24 65L30 31L37 60"/>
  <path d="M42 61L50 15L58 61"/>
  <path d="M63 60L70 31L76 65"/>
  <path d="M79 66L87 41L91 70"/>
`);

/* ------------------------------------------------------------------ *
 * The fourteen additions
 *
 * One rule holds the set together: a *line* cast is drawn on the diagonal it
 * travels on, and a *far* cast is drawn around an ellipse you look into. That
 * single distinction is worth more than any amount of elemental decoration —
 * it tells you how the slot is aimed before you read its name.
 * ------------------------------------------------------------------ */

/**
 * Permafrost Wake — the ground taken, slowly.
 *
 * A long flat horizon rather than a diagonal, because this one is not thrown:
 * three slabs of falling height stand out of it and two rime lines trail behind
 * the tallest, so the mark reads left-to-right as something that already passed.
 */
const PERMAFROST = WRAP(`
  <path d="M6 76C28 68 72 68 94 76"/>
  <path d="M20 74L26 50L40 56L36 76"/>
  <path d="M44 76L52 38L68 48L64 78"/>
  <path d="M70 78L78 56L90 62L88 78"/>
  <path d="M10 62L28 58M12 50L26 47"/>
`);

/**
 * Shard Cyclone — a funnel with ice in orbit.
 *
 * The mouth is an open arc at the top and the two walls converge to a point on
 * the floor; two bands cross the throat where the rotation reads, and three
 * detached ticks sit outside the silhouette as the shards thrown wide.
 */
const CYCLONE = WRAP(`
  <path d="M14 20C30 34 70 34 86 20"/>
  <path d="M18 24C26 46 40 70 50 92"/>
  <path d="M82 24C74 46 60 70 50 92"/>
  <path d="M28 42C42 52 58 52 72 42"/>
  <path d="M36 62C44 68 56 68 64 62"/>
  <path d="M6 34L18 32M94 44L82 42M10 56L22 52"/>
`);

/**
 * Boreal Gate — a ring stood upright on the floor.
 *
 * The only sigil in the set with a full circle *and* a ground ellipse: the ring
 * is the thing standing, the ellipse is the footprint it stands in, and the two
 * meridians between them are the lit membrane stretched across the opening.
 */
const GATE = WRAP(`
  <circle cx="50" cy="44" r="30"/>
  <path d="M50 14C38 24 38 64 50 74"/>
  <path d="M50 14C62 24 62 64 50 74"/>
  <ellipse cx="50" cy="86" rx="30" ry="8"/>
`);

/**
 * Absolute Zero — a shell closed over the footprint.
 *
 * A dome sitting on the boundary ellipse, split by one meridian and one
 * latitude seam: the plates the freeze resolves into. The spike at the apex is
 * the one thing that keeps it from reading as a plain hemisphere.
 */
const ZERO = WRAP(`
  <ellipse cx="50" cy="76" rx="38" ry="12"/>
  <path d="M12 76C12 44 30 22 50 22C70 22 88 44 88 76"/>
  <path d="M50 22V64"/>
  <path d="M24 44C36 52 64 52 76 44"/>
  <path d="M50 6L43 18M50 6L57 18M50 6V22"/>
`);

/**
 * Solar Spear — daylight dropped straight down.
 *
 * Vertical, not diagonal, because the shaft does not travel to the target — it
 * arrives on it. The two outer lines taper inward toward the floor so the
 * column reads as light narrowing to a point of impact.
 */
const SOLAR = WRAP(`
  <ellipse cx="50" cy="82" rx="30" ry="10"/>
  <path d="M34 8L44 80"/>
  <path d="M66 8L56 80"/>
  <path d="M50 6V78"/>
  <path d="M16 20L27 30M84 20L73 30M8 48L21 49M92 48L79 49"/>
`);

/**
 * Magma Rift — the floor opened along the line.
 *
 * The crack is one broken polyline running the width of the box, which is the
 * silhouette of a line cast seen from the side; two tongues of flame stand out
 * of it, and two embers sit below to hold the lower half of the mark.
 */
const MAGMA = WRAP(`
  <path d="M4 68L24 60L40 70L58 58L76 68L96 60"/>
  <path d="M36 66C30 54 44 48 38 30C53 41 50 56 52 66"/>
  <path d="M62 62C58 50 70 44 66 30C79 41 75 54 77 63"/>
  <path d="M14 82L30 78M60 84L80 79"/>
`);

/**
 * Gravity Well — a hole with everything falling into it.
 *
 * Two concentric ellipses give the funnel its depth; the three arrows outside
 * them all point at the middle, which is the one thing this ability does and
 * the only sigil in the set that shows a direction of travel *inward*.
 */
const GRAVITY = WRAP(`
  <ellipse cx="50" cy="58" rx="38" ry="14"/>
  <ellipse cx="50" cy="58" rx="15" ry="6"/>
  <path d="M50 8V34M50 34L42 25M50 34L58 25"/>
  <path d="M10 30L26 44M26 44L14 43M26 44L25 32"/>
  <path d="M90 30L74 44M74 44L86 43M74 44L75 32"/>
`);

/**
 * Void Rail — one hard stroke, fired instantly.
 *
 * Three parallel rails on the cast diagonal with nothing at either end: no
 * charge, no impact, no decoration. The bar across them near the origin is the
 * muzzle, and it is the only thing that says which way the shot went.
 */
const VOIDRAIL = WRAP(`
  <path d="M12 88L88 12"/>
  <path d="M30 90L92 28"/>
  <path d="M8 70L70 8"/>
  <path d="M14 54L38 78"/>
`);

/**
 * Plasma Bloom — a core opening into petals.
 *
 * Four leaves on the cardinal axes around a small circle, so the mark is
 * radially symmetric and reads as an opening rather than a throw; two loose
 * arcs on the diagonal are the current running around the outside.
 */
const PLASMA = WRAP(`
  <circle cx="50" cy="50" r="9"/>
  <path d="M50 41C50 26 58 15 50 5C42 15 50 26 50 41"/>
  <path d="M59 50C74 50 85 58 95 50C85 42 74 50 59 50"/>
  <path d="M50 59C50 74 42 85 50 95C58 85 50 74 50 59"/>
  <path d="M41 50C26 50 15 42 5 50C15 58 26 50 41 50"/>
  <path d="M21 21C29 31 34 36 40 39M79 79C71 69 66 64 60 61"/>
`);

/**
 * Verdant Rupture — thorns out of the ground.
 *
 * Each thorn is a single curve that leaves the floor line and comes back to it,
 * so the shape tapers to a point without being filled; the three rise higher
 * toward the far end, which puts the mark back on the cast diagonal.
 */
const VERDANT = WRAP(`
  <path d="M6 82C28 74 72 74 94 82"/>
  <path d="M20 78C20 60 28 46 44 36C33 45 31 60 33 78"/>
  <path d="M48 78C46 52 58 30 78 16C62 32 58 52 61 78"/>
  <path d="M72 80C74 64 82 54 93 46C85 57 83 68 85 80"/>
`);

/**
 * Sandstorm Coil — a heavy column turning in place.
 *
 * Five arcs stacked with a widening span: the column is read from the rate at
 * which it opens out, not from an outline, which is what a body of dust with no
 * hard edge actually looks like. Three grains sit outside it.
 */
const SANDSTORM = WRAP(`
  <path d="M14 22C32 10 70 12 86 24"/>
  <path d="M20 40C36 30 66 32 80 42"/>
  <path d="M28 58C40 50 62 52 72 60"/>
  <path d="M34 74C44 68 58 70 66 76"/>
  <path d="M40 90C46 86 56 87 60 91"/>
  <path d="M4 34L13 32M96 52L86 50M6 62L17 58"/>
`);

/**
 * Tidal Prism — a spout inside a wall of facets.
 *
 * The boundary is the usual far-cast ellipse; two hard-edged prisms stand on it
 * facing each other, and the spout between them is a single S that opens into a
 * crest. Straight facets against one curve is the whole read.
 */
const TIDAL = WRAP(`
  <ellipse cx="50" cy="76" rx="38" ry="12"/>
  <path d="M13 70L22 36L34 64"/>
  <path d="M66 64L78 36L87 70"/>
  <path d="M50 70C44 52 56 40 50 20"/>
  <path d="M50 20C42 28 40 40 44 50M50 20C58 28 60 40 56 50"/>
`);

/**
 * Spectral Blades — a rhythm of crescents.
 *
 * Three open crescents stepping up the cast diagonal, each a pair of arcs that
 * meet at both tips. They grow toward the middle and fall away again, which is
 * the beat the ability actually cuts on.
 */
const BLADES = WRAP(`
  <path d="M18 80C9 67 13 50 26 43C17 54 17 69 26 80"/>
  <path d="M46 70C35 51 43 29 61 19C48 33 45 52 55 71"/>
  <path d="M76 46C69 33 74 19 87 12C78 23 78 35 84 46"/>
  <path d="M32 86L43 79M62 60L73 53"/>
`);

/**
 * Celestial Rain — shafts falling into the footprint, on a beat.
 *
 * Three verticals of different lengths dropping into the boundary ellipse, each
 * with its own small landing arc offset under it. The uneven lengths are the
 * point: they are not simultaneous, they are a sequence.
 */
const RAIN = WRAP(`
  <ellipse cx="50" cy="80" rx="36" ry="11"/>
  <path d="M28 14V64"/>
  <path d="M50 4V72"/>
  <path d="M71 20V60"/>
  <path d="M21 74C24 70 31 70 35 74"/>
  <path d="M43 82C47 78 54 78 58 82"/>
  <path d="M64 70C67 66 74 66 78 70"/>
`);

/* ====================================================================== */
/* The twenty V3.1 marks                                                  */
/* ====================================================================== */
/**
 * Same rules as above and one more: each of these has to be told apart from the
 * mark of the *sibling it derives from*, because the two sit in different picker
 * groups but run on the same engine. So each one is drawn from the thing that
 * was changed — the anvil rather than the spear, the lid rather than the
 * fountain, the braid rather than the bolt.
 */

/** Sunforge Anvil — the billet dropping onto the block, with the blow going out. */
const ANVIL = WRAP(`
  <path d="M50 6V38"/>
  <path d="M42 30L50 40L58 30"/>
  <path d="M22 52H78L70 62H30L22 52Z"/>
  <path d="M38 62V78H62V62"/>
  <path d="M30 84H70"/>
  <path d="M14 46C10 42 9 36 11 31M86 46C90 42 91 36 89 31"/>
`);

/** Emberspire — a narrow flue, drawn as two strands climbing past each other. */
const EMBERSPIRE = WRAP(`
  <ellipse cx="50" cy="86" rx="20" ry="7"/>
  <path d="M36 82C44 70 36 60 44 48C50 39 44 30 50 20"/>
  <path d="M64 82C56 70 64 60 56 48C50 39 56 30 50 20"/>
  <path d="M50 20L46 10M50 20L56 12"/>
  <path d="M40 34H60M43 56H57"/>
`);

/** Ember Reap — two strokes where Spectral Blades has three, and far larger. */
const EMBERREAP = WRAP(`
  <path d="M10 86C4 58 22 26 54 12C28 32 18 58 24 86"/>
  <path d="M48 88C40 60 58 30 92 18C64 38 56 62 62 88"/>
  <path d="M30 20C34 26 32 32 28 36M70 8C74 14 72 20 68 24"/>
`);

/** Solar Aperture — a lens rather than a doorway, with the shafts it throws. */
const APERTURE = WRAP(`
  <circle cx="38" cy="50" r="26"/>
  <circle cx="38" cy="50" r="12"/>
  <path d="M66 34L94 22M68 44L96 38M68 56L96 62M66 66L94 78"/>
  <path d="M38 20V14M38 86V80"/>
`);

/** Choral Ray — the Nova Beam's cone opened until it is a stack of parallels. */
const CHORUS = WRAP(`
  <circle cx="16" cy="50" r="6"/>
  <path d="M26 38H92M26 50H96M26 62H92"/>
  <path d="M30 27H84M30 73H84"/>
`);

/** Rime Comet — the same rock, on a long straight cold tail instead of streaks. */
const COMET = WRAP(`
  <circle cx="66" cy="34" r="16"/>
  <path d="M52 44L18 78M60 50L32 86M70 52L54 90"/>
  <path d="M58 26L66 34L62 42"/>
  <path d="M88 14L94 8M84 24H94"/>
`);

/** Rimefault — one fault line with cold columns standing out of it. */
const RIMEFAULT = WRAP(`
  <path d="M6 74L26 62L38 74L58 58L72 70L94 54"/>
  <path d="M24 62V40M46 66V34M68 62V38M88 54V32"/>
  <path d="M24 40L20 33M24 40L28 33M46 34L42 27M46 34L50 27M68 38L64 31M68 38L72 31"/>
`);

/** Quartz Bastion — monoliths on a ring, not a thicket of blades. */
const QUARTZ = WRAP(`
  <ellipse cx="50" cy="80" rx="38" ry="12"/>
  <path d="M22 76V44L32 36V72"/>
  <path d="M44 82V30L56 22V78"/>
  <path d="M68 78V40L78 32V72"/>
`);

/** Maelstrom — the funnel laid flat: a spiral seen from above, not a cone. */
const MAELSTROM = WRAP(`
  <ellipse cx="50" cy="56" rx="42" ry="26"/>
  <path d="M50 34C64 34 74 44 74 54C74 64 64 72 52 72C40 72 32 64 32 56C32 49 38 44 46 44C53 44 58 49 58 55C58 60 54 63 50 63"/>
  <path d="M14 44C22 36 34 30 50 30M86 68C78 76 66 82 50 82"/>
`);

/** Aurora Mantle — a bell standing taller than it is wide, with curtains in it. */
const AURORA = WRAP(`
  <ellipse cx="50" cy="84" rx="34" ry="10"/>
  <path d="M18 84C18 44 32 16 50 16C68 16 82 44 82 84"/>
  <path d="M32 80C32 52 40 30 50 30C60 30 68 52 68 80"/>
  <path d="M42 26C46 34 44 44 40 52M58 26C54 34 56 44 60 52"/>
`);

/** Eclipse Column — the one mark built around a disc with nothing in it. */
const ECLIPSE = WRAP(`
  <circle cx="50" cy="50" r="21"/>
  <circle cx="50" cy="50" r="33"/>
  <path d="M50 9V3M50 97V91M9 50H3M97 50H91"/>
  <path d="M23 23L18 18M77 77L82 82M77 23L82 18M23 77L18 82"/>
`);

/** Singularity Maw — the accretion disc raked to vertical, with the pull on it. */
const SINGULARITY = WRAP(`
  <ellipse cx="50" cy="50" rx="12" ry="36"/>
  <circle cx="50" cy="50" r="9"/>
  <path d="M10 50H28M90 50H72"/>
  <path d="M24 42L31 50L24 58M76 42L69 50L76 58"/>
  <path d="M50 10C60 20 62 32 62 50M50 90C40 80 38 68 38 50"/>
`);

/** Nightshade Bloom — four arms, and every one of them on the way back down. */
const NIGHTSHADE = WRAP(`
  <circle cx="50" cy="34" r="9"/>
  <path d="M50 25V12"/>
  <path d="M42 38C30 44 20 60 18 84"/>
  <path d="M58 38C70 44 80 60 82 84"/>
  <path d="M46 43C40 54 36 70 36 90"/>
  <path d="M54 43C60 54 64 70 64 90"/>
`);

/** Grave Bind — the Snare's ring with the column replaced by a flat web. */
const GRAVEBIND = WRAP(`
  <ellipse cx="50" cy="60" rx="42" ry="24"/>
  <path d="M50 60L12 54M50 60L26 40M50 60L52 36M50 60L78 42M50 60L90 56M50 60L74 80M50 60L34 80"/>
  <path d="M26 40C38 46 46 52 52 36M78 42C68 50 60 56 74 80"/>
  <circle cx="50" cy="60" r="6"/>
`);

/** Dusk Weave — a braid on the cast diagonal, where Thunder has a single bolt. */
const DUSKWEAVE = WRAP(`
  <path d="M10 78C26 78 26 46 42 46C58 46 58 22 82 22"/>
  <path d="M10 66C26 66 30 58 42 58C56 58 60 34 82 34"/>
  <path d="M14 88C30 88 28 34 44 34C60 34 62 14 86 14"/>
  <path d="M88 10L94 6M88 40L94 44"/>
`);

/** Abyssal Vault — a lid closed over the footprint, not a wall around it. */
const ABYSSAL = WRAP(`
  <ellipse cx="50" cy="76" rx="40" ry="12"/>
  <path d="M12 76C12 46 28 30 50 30C72 30 88 46 88 76"/>
  <path d="M22 74L28 54M36 76L38 46M50 76V42M64 76L62 46M78 74L72 54"/>
`);

/** Ashen Deluge — three heavy verticals, uneven and far apart, with wide landings. */
const DELUGE = WRAP(`
  <ellipse cx="50" cy="84" rx="36" ry="10"/>
  <path d="M26 8V54"/>
  <path d="M50 2V64"/>
  <path d="M74 16V48"/>
  <path d="M14 64C20 56 32 56 38 64M38 76C44 68 56 68 62 76M62 58C68 50 80 50 86 58"/>
`);

/** Obsidian Thorns — straight wedges on a baseline: no curve anywhere in it. */
const OBSIDIAN = WRAP(`
  <path d="M8 88H92"/>
  <path d="M22 88L30 32L38 88"/>
  <path d="M44 88L52 12L60 88"/>
  <path d="M66 88L74 44L80 88"/>
  <path d="M30 32L26 22M52 12L47 3"/>
`);

/** Tar Fall — the rock on a flat throw behind a tail that is wider than it is long. */
const TARFALL = WRAP(`
  <circle cx="70" cy="60" r="18"/>
  <path d="M54 48C36 40 20 34 6 34C20 42 30 50 52 56"/>
  <path d="M56 70C40 74 24 80 12 88C28 84 44 82 60 76"/>
  <path d="M62 52C66 58 72 58 76 54"/>
`);

/** Brine Lance — one long seam with crusted growth standing along it. */
const BRINE = WRAP(`
  <path d="M6 74C24 68 44 70 62 66C74 63 86 62 96 64"/>
  <path d="M18 72L22 54M30 70L36 46M44 70L48 52M58 66L66 40M72 64L78 48M86 63L90 52"/>
  <path d="M22 54L18 47M36 46L31 39M48 52L44 45M66 40L61 32M78 48L74 41"/>
`);

/**
 * Keyed by the ids in `ELEMENTS` — eighty marks, one per signature: the forty
 * above, plus the twenty of the four V3.2 groups spread in from
 * `glyphs-signatures.js` and the twenty of the four V3.3 groups from
 * `glyphs-signatures-v33.js`.
 *
 * A missing entry is not fatal: the HUD and the selector both fall back to an
 * empty glyph slot, so the card keeps its key, name and cooldown sweep.
 */
export const ELEMENT_SIGILS = {
  /* Arcane Vanguard */
  ice: ICE,
  thunder: THUNDER,
  meteor: METEOR,
  beam: BEAM,
  snare: SNARE,

  /* Glacial Dominion */
  glacier: GLACIER,
  permafrost: PERMAFROST,
  cyclone: CYCLONE,
  gate: GATE,
  zero: ZERO,

  /* Cataclysm Engine */
  solar: SOLAR,
  magma: MAGMA,
  gravity: GRAVITY,
  voidrail: VOIDRAIL,
  plasma: PLASMA,

  /* Wild Ether */
  verdant: VERDANT,
  sandstorm: SANDSTORM,
  tidal: TIDAL,
  blades: BLADES,
  rain: RAIN,

  /* Emberforge Choir */
  anvil: ANVIL,
  emberspire: EMBERSPIRE,
  emberreap: EMBERREAP,
  aperture: APERTURE,
  chorus: CHORUS,

  /* Hoarfrost Reliquary */
  comet: COMET,
  rimefault: RIMEFAULT,
  quartz: QUARTZ,
  maelstrom: MAELSTROM,
  aurora: AURORA,

  /* Umbral Covenant */
  eclipse: ECLIPSE,
  singularity: SINGULARITY,
  nightshade: NIGHTSHADE,
  gravebind: GRAVEBIND,
  duskweave: DUSKWEAVE,

  /* Drowned Choir */
  abyssal: ABYSSAL,
  deluge: DELUGE,
  obsidian: OBSIDIAN,
  tarfall: TARFALL,
  brine: BRINE,

  /* Verdigris Conclave, Prismatic Assembly, Ashfall Legion, Stormglass Ascendancy */
  ...SIGNATURE_SIGILS,

  /* Indigo Synod, Sanguine Assize, Quicksilver Escapement, Brimstone Litany */
  ...SIGNATURE_SIGILS_V33,

  /* Kinetic Assembly, Astral Ordnance — the ten that can miss */
  ...BOLT_SIGILS
};

/** Return the inline SVG mark for an ability, or an empty slot if unknown. */
export function sigilFor(element) {
  return ELEMENT_SIGILS[element] ?? '';
}
