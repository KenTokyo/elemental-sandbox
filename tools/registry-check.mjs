/**
 * Registry cross-check and settings fingerprint.
 *
 * `audit-settings-keys.mjs` answers "does every key an engine reads exist on
 * every block it runs for". It says nothing about the other half of a signature:
 * whether the id is actually *reachable* — grouped in the picker, named in
 * `ELEMENT_META`, drawn a sigil, and wired to an engine in `ABILITY_TYPES`. Each
 * of those is a different silence rather than a crash:
 *
 *  - no `ABILITY_TYPES` entry → `select()` refuses, `cast()` returns null: the
 *    ability is in the list and does nothing at all;
 *  - no `ELEMENT_META` entry  → no label, no blurb, and a far cast is aimed as
 *    a line, because `castShapeOf` falls back to `LINE`;
 *  - no `ELEMENT_SIGILS` entry → an empty card, the one failure `sigilFor`
 *    swallows on purpose;
 *  - no settings block → every uniform on that ability is `NaN`.
 *
 * The last one is also how a badly ordered merge fails. `settings.js` splices
 * five generations in a load-bearing order, and deriving from a block that has
 * not been merged yet hands `derive()` `undefined` — not an error, a block of
 * `NaN`. So this walks every number on every block and fails on the first one.
 *
 * `--fingerprint` additionally prints a stable hash over all sixty blocks. That
 * is what makes a pure refactor provable: move code between modules, re-run, and
 * an unchanged hash means not one value moved with it. `--write-fingerprint`
 * records the current hash in `tools/.fingerprint` to compare against later.
 *
 * Usage: `node tools/registry-check.mjs [--fingerprint] [--write-fingerprint]`
 *   exits non-zero on any hole in the registry, any NaN, or a hash mismatch.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { settings, ABILITY_GROUPS, ELEMENTS, DEFAULT_LOADOUT, ELEMENT_META } from '../src/config/settings.js';
// The sigil table is imported rather than scraped: it is spread together out of
// `glyphs.js` and `glyphs-signatures.js`, and a text scan of either file sees
// only half of it. Both are pure string builders — no three.js comes with them.
import { ELEMENT_SIGILS } from '../src/ui/glyphs.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const STORE = join(HERE, '.fingerprint');
const problems = [];

/**
 * The ids listed in a top-level `const NAME = {` table, read out of the source.
 *
 * `ABILITY_TYPES` is module-private, and importing `AbilityManager.js` to reach
 * it would drag three.js and fifteen engines into a check that only needs to
 * know which keys exist. So this reads it the same way `audit-settings-keys.mjs`
 * reads its modules — as text, from the opening brace to the first `};` in
 * column zero.
 */
function tableKeys(file, name) {
  const source = readFileSync(join(ROOT, file), 'utf8');
  const start = source.indexOf(`const ${name} = {`);
  if (start < 0) {
    problems.push(`${file}: no table named ${name} — this check is looking at the wrong shape`);
    return new Set();
  }
  const body = source.slice(start, source.indexOf('\n};', start));
  return new Set([...body.matchAll(/^ {2}([a-zA-Z_$][\w$]*):/gm)].map((m) => m[1]));
}

const ABILITY_TYPES = tableKeys('src/abilities/AbilityManager.js', 'ABILITY_TYPES');

/* ---------------------------------------------------------------------- */
/* Registry                                                                */
/* ---------------------------------------------------------------------- */

const seen = new Set();
for (const group of ABILITY_GROUPS) {
  for (const element of group.elements) {
    if (seen.has(element)) problems.push(`duplicate id in ABILITY_GROUPS: ${element}`);
    seen.add(element);
  }
}

for (const element of ELEMENTS) {
  if (!settings[element]) problems.push(`${element}: no settings block`);
  if (!ELEMENT_META[element]) problems.push(`${element}: no ELEMENT_META entry`);
  // Empty counts as absent: a key whose value came back `undefined` from the
  // signature module is exactly the blank card this check exists to catch.
  if (!ELEMENT_SIGILS[element]) problems.push(`${element}: no ELEMENT_SIGILS entry`);
  if (!ABILITY_TYPES.has(element)) problems.push(`${element}: no ABILITY_TYPES entry`);
}

for (const key of Object.keys(ELEMENT_META)) {
  if (!seen.has(key)) problems.push(`ELEMENT_META has ${key}, which no picker group lists`);
}

for (const key of Object.keys(ELEMENT_SIGILS)) {
  if (!seen.has(key)) problems.push(`ELEMENT_SIGILS has ${key}, which no picker group lists`);
}

for (const slot of DEFAULT_LOADOUT) {
  if (!seen.has(slot)) problems.push(`DEFAULT_LOADOUT holds ${slot}, which no picker group lists`);
}

/* ---------------------------------------------------------------------- */
/* Values — the NaN sweep, and the fingerprint                             */
/* ---------------------------------------------------------------------- */

/** Blocks are flat by design, but walk deep anyway rather than assume it. */
function walk(value, path, out) {
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value).sort()) walk(value[key], `${path}.${key}`, out);
    return;
  }
  if (typeof value === 'number' && !Number.isFinite(value)) problems.push(`${path} is ${value}`);
  out.push(`${path}=${String(value)}`);
}

const flat = [];
for (const element of ELEMENTS) walk(settings[element] ?? {}, element, flat);
const fingerprint = createHash('sha256').update(flat.join('\n')).digest('hex').slice(0, 16);

/* ---------------------------------------------------------------------- */
/* Report                                                                  */
/* ---------------------------------------------------------------------- */

if (problems.length) {
  for (const line of problems) console.error(`FAIL  ${line}`);
  console.error(`\n${problems.length} problem(s).`);
  process.exit(1);
}

const groups = ABILITY_GROUPS.length;
const sizes = [...new Set(ABILITY_GROUPS.map((g) => g.elements.length))];
console.log(
  `OK — ${ELEMENTS.length} ids in ${groups} group(s) of ${sizes.join('/')}, ` +
  `each with a block, metadata, a sigil and an engine; ${flat.length} finite values, ` +
  `${DEFAULT_LOADOUT.length} loadout slots.`
);

if (process.argv.includes('--write-fingerprint')) {
  writeFileSync(STORE, `${fingerprint}\n`, 'utf8');
  console.log(`fingerprint ${fingerprint} written to tools/.fingerprint`);
} else if (process.argv.includes('--fingerprint')) {
  const known = existsSync(STORE) ? readFileSync(STORE, 'utf8').trim() : null;
  console.log(`fingerprint ${fingerprint}${known ? ` (recorded ${known})` : ' (none recorded)'}`);
  if (known && known !== fingerprint) {
    console.error('FAIL  a value changed — this was supposed to be a pure move.');
    process.exit(1);
  }
}
