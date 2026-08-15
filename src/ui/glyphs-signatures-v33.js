/**
 * The twenty V3.3 marks — Indigo Synod, Sanguine Assize, Quicksilver Escapement
 * and Brimstone Litany.
 *
 * A third glyph module rather than a longer second one: `glyphs.js` stands at
 * 572 lines and `glyphs-signatures.js` at 266, so twenty more marks in either
 * would run at the 800-line rule in `AGENTS.md` again. All three draw through
 * the same `WRAP` from `glyph-frame.js`, so box, stroke weight and cap style
 * cannot drift.
 *
 * The three rules are unchanged:
 *
 * 1. A *line* cast is drawn on the diagonal it travels on.
 * 2. A *far* cast is drawn around an ellipse you look into.
 * 3. Each mark is drawn from the thing that was **changed** against the
 *    siblings on its engine — the filled middle rather than the ring, the one
 *    crescent rather than the flurry, the cord rather than the bundle.
 */

import { WRAP } from './glyph-frame.js';

/* ------------------------------------------------------------------ *
 * Indigo Synod — cobalt, lapis, porcelain white, cold silver
 * ------------------------------------------------------------------ */

/** Porcelain Font — the crown's plates leaned inward, over the middle it fills. */
const PORCELAIN = WRAP(`
  <ellipse cx="50" cy="84" rx="38" ry="10"/>
  <path d="M13 80L27 48"/>
  <path d="M35 82L44 44"/>
  <path d="M87 80L73 48"/>
  <path d="M65 82L56 44"/>
  <ellipse cx="50" cy="66" rx="16" ry="6"/>
  <path d="M34 66C38 56 62 56 66 66"/>
`);

/** Azurite Horn — the only bolt that is widest at the hand and gathers to a point. */
const AZURITE = WRAP(`
  <path d="M8 62L92 20"/>
  <path d="M8 78L92 20"/>
  <path d="M8 94L92 20"/>
  <path d="M14 70L92 20M14 86L92 20"/>
  <circle cx="92" cy="20" r="6"/>
`);

/** Indigo Vespers — the marks left standing, not the columns: rings on rings. */
const INDIGO = WRAP(`
  <ellipse cx="50" cy="76" rx="40" ry="18"/>
  <ellipse cx="34" cy="74" rx="16" ry="7"/>
  <ellipse cx="60" cy="82" rx="20" ry="9"/>
  <ellipse cx="66" cy="68" rx="12" ry="5"/>
  <path d="M40 6V52M40 44L36 52M40 44L44 52"/>
  <path d="M70 14V44M70 36L66 44M70 36L74 44"/>
`);

/** Lapis Gyre — a lit banded stone where every other well opens a hole, inside a raked belt. */
const LAPIS = WRAP(`
  <ellipse cx="50" cy="88" rx="32" ry="8"/>
  <circle cx="50" cy="46" r="16"/>
  <path d="M36 40C44 44 56 44 64 40M36 52C44 56 56 56 64 52"/>
  <ellipse cx="50" cy="46" rx="40" ry="14" transform="rotate(-38 50 46)"/>
  <ellipse cx="50" cy="46" rx="33" ry="10" transform="rotate(-38 50 46)"/>
`);

/** Cobalt Obelisk — the only snare with no rim and no tendrils: six members, and a point. */
const COBALT = WRAP(`
  <ellipse cx="50" cy="90" rx="26" ry="7"/>
  <path d="M26 88C30 56 40 30 50 8"/>
  <path d="M38 91C40 58 46 32 50 8"/>
  <path d="M50 92V8"/>
  <path d="M62 91C60 58 54 32 50 8"/>
  <path d="M74 88C70 56 60 30 50 8"/>
`);

/* ------------------------------------------------------------------ *
 * Sanguine Assize — oxblood, vermilion, wet iron, rust
 * ------------------------------------------------------------------ */

/** Sanguine Furrow — one wide wound torn open at once, with two raked sheets lying in it. */
const SANGUINE = WRAP(`
  <path d="M6 92L30 78L50 56L70 44L96 26"/>
  <path d="M12 98L36 86L54 66L74 54L98 36"/>
  <path d="M30 76C44 60 48 52 44 38C36 50 30 60 30 76Z"/>
  <path d="M68 50C82 34 86 26 82 12C74 24 68 34 68 50Z"/>
`);

/** Vermilion Shears — two short arcs on crossing planes, the only pair on the engine. */
const VERMILION = WRAP(`
  <path d="M14 26C42 34 70 54 88 82"/>
  <path d="M10 34C38 44 66 64 82 90"/>
  <path d="M88 22C68 48 42 66 14 78"/>
  <path d="M92 32C74 58 46 76 18 86"/>
`);

/** Garnet Bolide — the eroded lump replaced by a cut stone, thrown flat. */
const GARNET = WRAP(`
  <path d="M58 12L80 26L82 50L62 64L40 58L32 36Z"/>
  <path d="M50 30L68 36L68 52L52 54L44 42Z"/>
  <path d="M58 12L50 30M80 26L68 36M82 50L68 52M62 64L52 54M40 58L44 42M32 36L44 42"/>
  <path d="M4 94L30 70M10 84L26 66"/>
`);

/** Carnelian Aegis — the only shell in the library with no break line in it. */
const CARNELIAN = WRAP(`
  <ellipse cx="50" cy="86" rx="32" ry="9"/>
  <path d="M18 86C18 40 34 10 50 10C66 10 82 40 82 86"/>
  <path d="M22 62C32 58 68 58 78 62"/>
  <path d="M26 44C34 40 66 40 74 44"/>
  <path d="M32 28C38 25 62 25 68 28"/>
`);

/** Ferrous Rose — arms thrown overhead and folded all the way back down to the floor. */
const FERROUS = WRAP(`
  <ellipse cx="50" cy="86" rx="40" ry="10"/>
  <circle cx="50" cy="80" r="8"/>
  <path d="M50 74C46 40 30 18 12 82"/>
  <path d="M50 74C48 34 40 10 30 88"/>
  <path d="M50 72V14"/>
  <path d="M50 74C52 34 60 10 70 88"/>
  <path d="M50 74C54 40 70 18 88 82"/>
`);

/* ------------------------------------------------------------------ *
 * Quicksilver Escapement — mercury, chrome, blued steel
 * ------------------------------------------------------------------ */

/** Flywheel Governor — no cone left: one diameter, and staves dead vertical. */
const FLYWHEEL = WRAP(`
  <ellipse cx="50" cy="34" rx="38" ry="11"/>
  <path d="M12 34V72"/>
  <path d="M88 34V72"/>
  <ellipse cx="50" cy="72" rx="38" ry="11"/>
  <path d="M34 44V82M50 45V83M66 44V82"/>
`);

/** Quicksilver Thread — the one beam that is not a ruled line, beading as it goes. */
const QUICKSILVER = WRAP(`
  <path d="M4 94C24 80 18 60 38 52C58 44 52 26 72 18L96 8"/>
  <ellipse cx="24" cy="70" rx="9" ry="6" transform="rotate(-40 24 70)"/>
  <ellipse cx="46" cy="49" rx="10" ry="7" transform="rotate(-30 46 49)"/>
  <ellipse cx="70" cy="21" rx="8" ry="6" transform="rotate(-45 70 21)"/>
`);

/** Astrolabe Ring — the largest hoop, graduated at the limb, sighted along one sheaf. */
const ASTROLABE = WRAP(`
  <ellipse cx="46" cy="50" rx="38" ry="32"/>
  <ellipse cx="46" cy="50" rx="24" ry="20"/>
  <path d="M46 82V90M46 18V10M8 50H16M19 27L25 32M19 73L25 68"/>
  <path d="M68 44L100 28M70 52L100 38M68 60L98 50"/>
`);

/** Mercury Rain — round and small and many, where the engine's siblings are long. */
const MERCURY = WRAP(`
  <ellipse cx="50" cy="90" rx="34" ry="8"/>
  <circle cx="16" cy="26" r="6"/>
  <circle cx="34" cy="14" r="6"/>
  <circle cx="52" cy="30" r="6"/>
  <circle cx="70" cy="18" r="6"/>
  <circle cx="86" cy="34" r="6"/>
  <circle cx="24" cy="54" r="6"/>
  <circle cx="44" cy="60" r="6"/>
  <circle cx="64" cy="50" r="6"/>
  <circle cx="82" cy="64" r="6"/>
`);

/** Amalgam Weld — the crystal field poured into one file of beads along a seam. */
const AMALGAM = WRAP(`
  <path d="M6 94L94 18"/>
  <path d="M12 98L98 24"/>
  <circle cx="20" cy="83" r="7"/>
  <circle cx="38" cy="68" r="8"/>
  <circle cx="56" cy="52" r="8"/>
  <circle cx="74" cy="37" r="7"/>
  <circle cx="88" cy="25" r="5"/>
`);

/* ------------------------------------------------------------------ *
 * Brimstone Litany — sulphur, orpiment, ochre, brown smoke
 * ------------------------------------------------------------------ */

/** Brimstone Vents — low broad blooms opening one after another down the line. */
const BRIMSTONE = WRAP(`
  <path d="M4 90L96 56"/>
  <path d="M5 86C5 69 23 69 23 86"/>
  <path d="M25 79C25 64 43 64 43 79"/>
  <path d="M45 72C45 59 63 59 63 72"/>
  <path d="M66 64C66 54 82 54 82 64"/>
  <path d="M86 57C86 51 98 51 98 57"/>
  <path d="M10 96h4M26 93h4M44 88h4M60 84h4M76 78h4M90 72h4"/>
`);

/** Sulphur Sump — the well as a pool, with the ribbons slopping around its rim. */
const SULPHUR = WRAP(`
  <ellipse cx="50" cy="58" rx="42" ry="17"/>
  <path d="M10 56C16 46 24 68 32 52C40 38 46 66 50 50C54 36 60 66 68 52C76 40 84 66 90 56"/>
  <ellipse cx="50" cy="58" rx="7" ry="3"/>
  <path d="M20 76C28 84 72 84 80 76"/>
`);

/** Orpiment Scythe — the strokes taken to the floor, each one on a different plane. */
const ORPIMENT = WRAP(`
  <path d="M4 96L96 64"/>
  <path d="M10 92C16 78 28 80 30 92"/>
  <path d="M26 86C36 78 44 86 38 94"/>
  <path d="M44 84C46 72 58 72 60 82"/>
  <path d="M56 88C66 82 74 90 66 94"/>
  <path d="M70 76C74 66 86 68 86 78"/>
  <path d="M80 84C88 80 94 86 88 92"/>
`);

/** Fulminate Whip — one cord, heavy in the hand and given up at the point. */
const FULMINATE = WRAP(`
  <path d="M6 58L16 64"/>
  <path d="M6 58C14 12 60 2 80 38C86 52 86 70 86 86"/>
  <path d="M16 64C24 24 60 16 72 42C78 56 82 72 86 86"/>
  <path d="M70 96H98"/>
`);

/** Ochre Pylon — the spear cut off square at both ends and left standing. */
const OCHRE = WRAP(`
  <ellipse cx="50" cy="88" rx="34" ry="9"/>
  <ellipse cx="50" cy="88" rx="24" ry="6"/>
  <path d="M34 86V14H66V86"/>
  <path d="M34 70H66M34 54H66M34 38H66M34 24H66"/>
`);

/** The twenty marks of the four V3.3 groups, keyed by ability id. */
export const SIGNATURE_SIGILS_V33 = {
  /* Indigo Synod */
  porcelain: PORCELAIN,
  azurite: AZURITE,
  indigo: INDIGO,
  lapis: LAPIS,
  cobalt: COBALT,

  /* Sanguine Assize */
  sanguine: SANGUINE,
  vermilion: VERMILION,
  garnet: GARNET,
  carnelian: CARNELIAN,
  ferrous: FERROUS,

  /* Quicksilver Escapement */
  flywheel: FLYWHEEL,
  quicksilver: QUICKSILVER,
  astrolabe: ASTROLABE,
  mercury: MERCURY,
  amalgam: AMALGAM,

  /* Brimstone Litany */
  brimstone: BRIMSTONE,
  sulphur: SULPHUR,
  orpiment: ORPIMENT,
  fulminate: FULMINATE,
  ochre: OCHRE
};
