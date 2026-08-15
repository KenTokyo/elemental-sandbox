/**
 * The frame every sigil is drawn in — one place, so a mark drawn in
 * `glyphs.js` and a mark drawn in `glyphs-signatures.js` cannot drift apart in
 * box size, stroke weight or cap style.
 *
 * It lives in its own module rather than in `glyphs.js` because the signature
 * file needs it too, and importing it back out of `glyphs.js` would make the
 * two files a cycle for the sake of three lines.
 */

/**
 * A 100×100 box, stroke only, so the mark reads the same at 34px in the ability
 * slot as it does scaled up. `currentColor` picks up the slot's `--accent`, so
 * no sigil ever names a colour.
 */
export const WRAP = (body) =>
  `<svg class="glyph-svg" viewBox="0 0 100 100" aria-hidden="true" fill="none"
     stroke="currentColor" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
