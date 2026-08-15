/**
 * derive.js — how a signature is made out of another signature.
 *
 * Every settings block in this project is a *flat* map of numbers, booleans and
 * `#rrggbb` strings, which is what makes the whole derived library possible: a
 * new signature is a deep copy of whichever block already carries the right
 * control surface, with the values that make it a different ability written over
 * the top. Nothing here is a runtime indirection — the builders run once at
 * module load and their results are spliced into `settings`, so the editor, the
 * preset system and `DEFAULT_SETTINGS` see forty first-class blocks and cannot
 * tell which six were hand-written.
 *
 * These two helpers sat in `variants.js` until the 800-line rule in
 * `AGENTS.md` split its fourteen derivations across four modules. They live in
 * their own file so those four can reach them without importing `variants.js`,
 * which imports them in turn — a cycle that works in ESM and is still not worth
 * having. `variants.js` re-exports `derive`, because that is the address the
 * four `signatures-*.js` modules already import it from.
 */

/**
 * Deep-copy a block and write `overrides` over it. Blocks are flat by design.
 *
 * Exported because the four `signatures-*.js` modules build the twenty V3.1
 * signatures the same way — but off the *finished* twenty rather
 * than off the six, so a new block inherits a whole engine's control surface
 * from the sibling that already runs on it instead of re-borrowing families.
 */
export function derive(base, overrides) {
  return { ...structuredClone(base), ...overrides };
}

/** Every key of `block` whose name starts with one of `prefixes`. */
export function borrow(block, prefixes) {
  const out = {};
  for (const key of Object.keys(block)) {
    if (prefixes.some((prefix) => key.startsWith(prefix))) out[key] = block[key];
  }
  return structuredClone(out);
}

/** The ground-disc control family, which only the Voltaic Snare's block owns. */
export const FIELD_KEYS = ['field', 'colorField'];
/** The volumetric-fire control family, which only the Cinder Fall's block owns. */
export const TRAIL_KEYS = ['trail', 'colorFlame'];
