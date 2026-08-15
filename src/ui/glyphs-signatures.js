/**
 * The twenty V3.2 marks — Verdigris Conclave, Prismatic Assembly, Ashfall
 * Legion and Stormglass Ascendancy.
 *
 * Split out of `glyphs.js` under the 800-line rule in `AGENTS.md`: the base
 * file was already at 567 lines and twenty more marks would have left it with
 * no headroom at all.
 *
 * Two rules carry over unchanged from `glyphs.js`, and one is added:
 *
 * 1. A *line* cast is drawn on the diagonal it travels on.
 * 2. A *far* cast is drawn around an ellipse you look into.
 * 3. Each mark is drawn from the thing that was **changed** against the sibling
 *    it derives from, because the two run on the same engine and sit in
 *    different picker groups — the rings rather than the shell, the blocks
 *    rather than the funnel, the pits rather than the seams.
 */

import { WRAP } from './glyph-frame.js';

/* ------------------------------------------------------------------ *
 * Verdigris Conclave — oxidised bronze, patina, temple mechanism
 * ------------------------------------------------------------------ */

/** Bell Rose — the smallest dome in the library, and the only one that rings. */
const BELLROSE = WRAP(`
  <ellipse cx="50" cy="64" rx="20" ry="7"/>
  <path d="M30 64C30 46 38 36 50 36C62 36 70 46 70 64"/>
  <path d="M50 36V24M43 24H57"/>
  <path d="M14 76C24 68 76 68 86 76"/>
  <path d="M4 92C20 80 80 80 96 92"/>
`);

/** Censer Coil — the funnel leaned over, with great blocks hung in the smoke. */
const CENSER = WRAP(`
  <ellipse cx="40" cy="90" rx="20" ry="6"/>
  <path d="M26 88C32 62 44 40 62 14"/>
  <path d="M54 90C58 68 66 46 80 20"/>
  <path d="M28 70L44 64L50 72L34 78Z"/>
  <path d="M40 46L56 40L62 48L46 54Z"/>
  <path d="M56 24L72 18L78 26L62 32Z"/>
`);

/** Orrery Gate — the Boreal Gate's membrane replaced by tracks, and lifted off the floor. */
const ORRERY = WRAP(`
  <circle cx="50" cy="42" r="31"/>
  <ellipse cx="50" cy="42" rx="29" ry="11"/>
  <ellipse cx="50" cy="42" rx="16" ry="6"/>
  <circle cx="79" cy="39" r="4"/>
  <circle cx="34" cy="47" r="4"/>
  <ellipse cx="50" cy="90" rx="18" ry="5"/>
`);

/** Verdigris Seam — crust lying along the line in lobes, where Brine Lance stands upright. */
const VERDIGRIS = WRAP(`
  <path d="M6 88L94 40"/>
  <path d="M12 85C16 75 26 71 30 75"/>
  <path d="M36 72C41 60 52 56 54 62"/>
  <path d="M60 59C64 49 74 45 78 49"/>
  <path d="M84 46C87 40 92 39 94 41"/>
  <path d="M20 84L24 90M44 71L48 77M68 57L72 63"/>
`);

/** Pendulum Fall — the Solar Spear hung on a thread first, then let go. */
const PENDULUM = WRAP(`
  <path d="M26 8H74"/>
  <path d="M50 8V40"/>
  <path d="M42 40H58L50 60Z"/>
  <path d="M50 8C36 14 28 26 26 42"/>
  <path d="M26 42L20 36M26 42L21 48"/>
  <path d="M50 64V78M50 78L44 70M50 78L56 70"/>
  <ellipse cx="50" cy="86" rx="28" ry="8"/>
`);

/* ------------------------------------------------------------------ *
 * Prismatic Assembly — colourless glass, dispersion, a white core
 * ------------------------------------------------------------------ */

/** Prism Cascade — needles of one height where the Glacial Crown has blades of five, and more still falling. */
const PRISM = WRAP(`
  <ellipse cx="50" cy="82" rx="38" ry="11"/>
  <path d="M16 80L19 40L22 78"/>
  <path d="M30 82L33 34L36 80"/>
  <path d="M44 84L47 38L50 82"/>
  <path d="M58 82L61 32L64 80"/>
  <path d="M72 80L75 40L78 78"/>
  <path d="M40 24V8M52 16V2M66 20V4"/>
`);

/** Refraction Fan — every edge on one plane out of one point, each with its fringe beside it. */
const REFRACTION = WRAP(`
  <path d="M10 90L44 10"/>
  <path d="M10 90L66 18"/>
  <path d="M10 90L84 32"/>
  <path d="M10 90L94 56"/>
  <path d="M10 90L96 82"/>
  <path d="M50 14L56 18M72 24L78 28M88 38L94 42"/>
`);

/** Lumen Spire — the Nova Beam's long column cut to a stub and caged. */
const LUMEN = WRAP(`
  <path d="M28 60L50 38L62 50L40 72Z"/>
  <path d="M34 54L56 44"/>
  <path d="M20 58C26 36 52 24 72 32"/>
  <path d="M28 80C50 88 76 70 78 48"/>
  <path d="M12 88L26 74M74 34L88 20"/>
  <path d="M84 14L92 12M88 26L94 22"/>
`);

/** Halation Bloom — six arms laid flat inside a halo, where Plasma Bloom stands four upright. */
const HALATION = WRAP(`
  <ellipse cx="50" cy="56" rx="44" ry="20"/>
  <ellipse cx="50" cy="56" rx="30" ry="13"/>
  <circle cx="50" cy="56" r="7"/>
  <path d="M50 56L6 52M50 56L24 38M50 56L62 30M50 56L88 40M50 56L84 72M50 56L36 78"/>
`);

/** Caustic Rain — the Celestial Rain's three shafts traded for a shimmer, over the widest ring there is. */
const CAUSTIC = WRAP(`
  <ellipse cx="50" cy="84" rx="46" ry="13"/>
  <path d="M12 66C14 52 10 42 12 30"/>
  <path d="M26 74C28 56 24 44 26 26"/>
  <path d="M40 78C42 58 38 44 40 18"/>
  <path d="M54 78C56 58 52 44 54 20"/>
  <path d="M68 74C70 56 66 44 68 28"/>
  <path d="M82 68C84 54 80 42 82 34"/>
  <path d="M94 58C96 48 92 40 94 34"/>
`);

/* ------------------------------------------------------------------ *
 * Ashfall Legion — bone white, charcoal, banked embers, ash
 * ------------------------------------------------------------------ */

/** Ossuary Bind — the Voltaic Snare's ring pulled tight, with a ribcage standing in it. */
const OSSUARY = WRAP(`
  <ellipse cx="50" cy="86" rx="18" ry="6"/>
  <path d="M50 84V16"/>
  <path d="M50 16L44 8M50 16L56 8"/>
  <path d="M50 26C36 30 32 40 34 50M50 26C64 30 68 40 66 50"/>
  <path d="M50 42C36 46 32 56 34 66M50 42C64 46 68 56 66 66"/>
  <path d="M50 58C38 62 34 70 36 78M50 58C62 62 66 70 64 78"/>
`);

/** Cinder Veil — the Permafrost Wake's slabs lain down into a bed, with the heat still in the cracks. */
const CINDERVEIL = WRAP(`
  <path d="M4 62C26 52 74 52 96 62"/>
  <path d="M4 62C26 78 74 78 96 62"/>
  <path d="M18 60L26 54L36 58L32 66L20 66Z"/>
  <path d="M44 58L56 52L66 58L60 66L46 66Z"/>
  <path d="M72 60L82 56L88 62L82 68L74 66Z"/>
  <path d="M38 62L42 68M62 62L68 70M28 68L24 74"/>
`);

/** Pyreclast — pits instead of seams, a far higher arc, and the whole bomb gone. */
const PYRECLAST = WRAP(`
  <path d="M4 90C16 36 58 10 92 22"/>
  <circle cx="60" cy="44" r="20"/>
  <circle cx="54" cy="38" r="4"/>
  <circle cx="67" cy="50" r="4"/>
  <path d="M42 30L32 18M78 30L90 20M44 60L30 70M78 60L92 68"/>
`);

/** Sepulchre Rift — holes opened one after another where the Magma Rift tears one continuous crack. */
const SEPULCHER = WRAP(`
  <ellipse cx="16" cy="79" rx="7" ry="3"/>
  <ellipse cx="34" cy="69" rx="8" ry="4"/>
  <ellipse cx="52" cy="60" rx="9" ry="4"/>
  <ellipse cx="70" cy="50" rx="8" ry="4"/>
  <ellipse cx="86" cy="42" rx="7" ry="3"/>
  <path d="M16 74V58M34 64V44M52 54V28M70 44V26M86 37V22"/>
`);

/** Ash Maw — a mouth held open in the middle, where the Gravity Well is only a funnel. */
const ASHMAW = WRAP(`
  <ellipse cx="50" cy="56" rx="46" ry="26"/>
  <ellipse cx="50" cy="56" rx="18" ry="9"/>
  <path d="M96 56C80 76 60 84 42 78"/>
  <path d="M4 56C20 36 40 28 58 34"/>
  <path d="M50 30C68 32 78 42 78 52"/>
  <path d="M50 82C32 80 22 70 22 60"/>
  <path d="M12 34L18 40M88 78L82 72M70 20L74 26"/>
`);

/* ------------------------------------------------------------------ *
 * Stormglass Ascendancy — violet electric, cyan, black glass
 * ------------------------------------------------------------------ */

/** Tempest Fan — the Storm Lance's single bolt opened into a sheet that never closes again. */
const TEMPEST = WRAP(`
  <path d="M8 88L26 70L20 66L44 44L38 40L58 20"/>
  <path d="M8 88L30 76L24 70L52 54L46 48L74 32"/>
  <path d="M8 88L34 82L28 76L60 66L54 60L86 48"/>
  <path d="M8 88L36 88L30 82L64 78L58 72L92 66"/>
  <path d="M58 20L54 12M58 20L66 16"/>
  <path d="M92 66L94 58M92 66L96 72"/>
`);

/** Arc Light — one hairline corner to corner, strobed: the Void Rail's three bars down to a thread. */
const ARCLIGHT = WRAP(`
  <path d="M4 96L22 78M30 70L48 52M56 44L74 26M82 18L96 4"/>
  <path d="M12 86L28 70M42 56L58 40M72 26L88 10"/>
  <path d="M2 84L14 96"/>
  <path d="M80 6L92 18"/>
`);

/** Stormglass Bastion — broad panes rather than blades, a lit spire in the middle, weather on top. */
const STORMGLASS = WRAP(`
  <ellipse cx="50" cy="80" rx="40" ry="12"/>
  <path d="M12 78V50L26 44V72"/>
  <path d="M30 82V52L46 46V76"/>
  <path d="M56 80V50L72 44V74"/>
  <path d="M76 76V48L88 42V70"/>
  <path d="M50 76V16M44 30L50 16L56 30"/>
  <path d="M14 26C30 12 70 12 86 26"/>
`);

/** Dynamo Coil — the Sandstorm's tall column squashed into a drum spun far too fast to lift. */
const DYNAMO = WRAP(`
  <ellipse cx="50" cy="42" rx="34" ry="12"/>
  <ellipse cx="50" cy="66" rx="34" ry="12"/>
  <path d="M16 42V66M84 42V66"/>
  <path d="M30 40L36 68M50 38V70M70 40L64 68"/>
  <path d="M4 50C0 58 2 68 8 74M96 50C100 58 98 68 92 74"/>
  <path d="M10 30L20 34M90 30L80 34M46 92L50 86M66 90L62 84"/>
`);

/** Thunderhead — Absolute Zero's shell pressed flat and widened until the hail fits under it. */
const THUNDERHEAD = WRAP(`
  <ellipse cx="50" cy="80" rx="46" ry="13"/>
  <path d="M4 78C4 56 24 44 50 44C76 44 96 56 96 78"/>
  <path d="M18 46C26 34 44 30 56 34"/>
  <path d="M56 34C70 32 82 38 86 48"/>
  <path d="M26 62L24 70M40 58L38 68M54 60L52 70M68 58L66 68M80 64L78 72"/>
  <path d="M46 66L44 78M60 64L58 76"/>
`);

/** The twenty marks of the four V3.2 groups, keyed by ability id. */
export const SIGNATURE_SIGILS = {
  /* Verdigris Conclave */
  bellrose: BELLROSE,
  censer: CENSER,
  orrery: ORRERY,
  verdigris: VERDIGRIS,
  pendulum: PENDULUM,

  /* Prismatic Assembly */
  prism: PRISM,
  refraction: REFRACTION,
  lumen: LUMEN,
  halation: HALATION,
  caustic: CAUSTIC,

  /* Ashfall Legion */
  ossuary: OSSUARY,
  cinderveil: CINDERVEIL,
  pyreclast: PYRECLAST,
  sepulcher: SEPULCHER,
  ashmaw: ASHMAW,

  /* Stormglass Ascendancy */
  tempest: TEMPEST,
  arclight: ARCLIGHT,
  stormglass: STORMGLASS,
  dynamo: DYNAMO,
  thunderhead: THUNDERHEAD
};
