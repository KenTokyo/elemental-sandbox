/**
 * The ten V4 marks — Kinetic Assembly and Astral Ordnance.
 *
 * A fourth glyph module rather than a longer third one: `glyphs.js` is already
 * near the 800-line rule in `AGENTS.md` and the two signature files are full.
 * All four draw through the same `WRAP` from `glyph-frame.js`, so box, stroke
 * weight and cap style cannot drift between them.
 *
 * These ten follow the library's three rules, plus one that is theirs alone:
 *
 * 1. A *line* cast is drawn on the diagonal it travels on — all ten are.
 * 2. Each mark is drawn from the thing that was **changed** against its
 *    siblings: the fin cluster, the crater, the barbs, the fin ring, the disc.
 * 3. **The path is part of the mark.** These are the first ten abilities that
 *    can miss, so every sigil draws the *trajectory* — flat, lobbed, helical,
 *    swinging, sagging — behind the body that flies it. Two shots that look
 *    alike in the picker would be two shots you cannot lead differently, which
 *    is the one failure this group cannot afford.
 */

import { WRAP } from './glyph-frame.js';

/* ------------------------------------------------------------------ *
 * Kinetic Assembly — glass, slag, bramble, machined steel, a thrown ring
 * ------------------------------------------------------------------ */

/** Prism Lancet — a needle on a dead flat line, four fins raked back off it. */
const LANCET = WRAP(`
  <path d="M14 78L86 22"/>
  <path d="M86 22L66 30L72 44L86 22Z"/>
  <path d="M50 50L40 44M50 50L44 60"/>
  <path d="M36 61L26 55M36 61L30 71"/>
`);

/** Slag Mortar — the tallest lob there is, with the cratered rock on its apex. */
const SLAGSHOT = WRAP(`
  <path d="M10 84C22 26 74 22 90 80"/>
  <circle cx="50" cy="26" r="14"/>
  <path d="M44 21L50 27L46 33M58 22L54 30L62 33"/>
  <path d="M84 80L90 80L88 72"/>
`);

/** Bramble Quill — the corkscrew, drawn as the helix it actually flies. */
const QUILL = WRAP(`
  <path d="M12 70C24 50 30 82 42 62C54 42 60 74 72 54"/>
  <path d="M72 54L90 30"/>
  <path d="M90 30L72 36L76 48L90 30Z"/>
  <path d="M30 62L22 56M46 56L38 50M62 50L54 44"/>
`);

/** Sabot Round — the dart, the fin ring behind it, and the length of its wake. */
const SABOT = WRAP(`
  <path d="M4 80L44 58"/>
  <path d="M10 88L48 66"/>
  <path d="M56 60L92 40"/>
  <path d="M92 40L74 42L78 54Z"/>
  <path d="M52 48L62 66M44 52L54 70"/>
`);

/** Gyre Chakram — the ring seen edge-on, swinging across its own line. */
const CHAKRAM = WRAP(`
  <path d="M8 74C26 46 42 90 60 56C70 38 78 34 92 30"/>
  <ellipse cx="72" cy="42" rx="20" ry="9" transform="rotate(-28 72 42)"/>
  <ellipse cx="72" cy="42" rx="9" ry="4" transform="rotate(-28 72 42)"/>
  <path d="M12 66L8 74L16 78"/>
`);

/* ------------------------------------------------------------------ *
 * Astral Ordnance — a caged core, a bipyramid, a star, a harpoon, a helix
 * ------------------------------------------------------------------ */

/** Nova Seed — the core inside two cages, rocking up and down the line. */
const NOVASEED = WRAP(`
  <path d="M6 72C22 84 30 46 46 58"/>
  <circle cx="66" cy="46" r="9"/>
  <circle cx="66" cy="46" r="20"/>
  <ellipse cx="66" cy="46" rx="20" ry="8" transform="rotate(-32 66 46)"/>
  <path d="M46 58L48 50"/>
`);

/** Void Spindle — the bipyramid, on the widest S there is. */
const SPINDLE = WRAP(`
  <path d="M8 82C26 82 22 44 44 44"/>
  <path d="M52 56L74 24L88 34L66 66Z"/>
  <path d="M52 56L88 34"/>
  <circle cx="46" cy="70" r="4"/>
  <circle cx="36" cy="58" r="4"/>
`);

/** Astral Caltrop — the four-spiked star, and the arc it turns over on. */
const CALTROP = WRAP(`
  <path d="M8 86C20 34 68 20 92 26"/>
  <path d="M62 56L38 34M62 56L86 62M62 56L54 82M62 56L74 32"/>
  <circle cx="62" cy="56" r="7"/>
`);

/** Tide Harpoon — the barbed head, the sag under the line, the beads behind. */
const HARPOON = WRAP(`
  <path d="M10 34C34 82 62 74 88 26"/>
  <path d="M88 26L70 36L78 46L88 26Z"/>
  <path d="M74 40L64 38M78 48L70 50"/>
  <circle cx="34" cy="66" r="4"/>
  <circle cx="22" cy="54" r="3"/>
`);

/** Helix Fang — two blades on one axle, drawn as the double strand they cut. */
const HELIX = WRAP(`
  <path d="M12 76L88 24"/>
  <path d="M16 62C34 62 30 88 48 88C66 88 62 62 80 62"/>
  <path d="M16 40C34 40 30 14 48 14C66 14 62 40 80 40"/>
  <path d="M88 24L72 30L76 40"/>
`);

/**
 * The ten, in picker-group order. Spread into `ELEMENT_SIGILS` by `glyphs.js`,
 * which is the only module the HUD and the picker ever ask.
 */
export const BOLT_SIGILS = {
  /* Kinetic Assembly */
  lancet: LANCET,
  slagshot: SLAGSHOT,
  quill: QUILL,
  sabot: SABOT,
  chakram: CHAKRAM,

  /* Astral Ordnance */
  novaseed: NOVASEED,
  spindle: SPINDLE,
  caltrop: CALTROP,
  harpoon: HARPOON,
  helix: HELIX
};
