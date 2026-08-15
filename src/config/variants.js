/**
 * variants.js — the fourteen signatures added in V20.3, derived from the six.
 *
 * This file is now the assembly point rather than the material: the fourteen
 * blocks themselves live in four sibling modules, one per picker group except
 * for Wild Ether, which needed two. `derive` and `borrow` live in `derive.js`.
 * All of that is the 800-line rule in `AGENTS.md` and nothing else — the fourteen
 * together are 1859 lines, and not one number moved when they were split out.
 *
 * Every settings block in this project is a *flat* map of numbers, booleans and
 * `#rrggbb` strings, which is what makes the derivation possible: a new signature
 * is a deep copy of whichever base block already carries the right control
 * surface, with the values that make it a different ability written over the top.
 * Nothing here is a runtime indirection — `buildVariants` runs once at module
 * load and the result is spliced into `settings`, so the editor, the preset
 * system and `DEFAULT_SETTINGS` see forty first-class blocks and cannot tell
 * which six were hand-written.
 *
 * Two rules keep that honest:
 *
 *  1. **A variant may add keys, never silently drop them.** The engines below
 *     read `field*`, `trail*` or `fissure*` families that only exist on one base
 *     block, so a derivation may borrow a family from a second block (`borrow`).
 *  2. **A variant is a different ability, not a recolour.** Each block moves the
 *     silhouette (footprint, height, count, curvature), the timing (travel,
 *     hold, release) *and* the palette. Where two signatures share an engine —
 *     Shard Cyclone and Sandstorm Coil, Nova Beam and Void Rail — the numbers
 *     are pulled deliberately apart so the two never read as the same cast.
 *
 * The naming convention for keys the new engines introduce is documented at each
 * family; anything not listed is inherited and behaves exactly as it does on the
 * block it came from.
 */

import { borrow, FIELD_KEYS, TRAIL_KEYS } from './derive.js';
import { buildDominion } from './variants-dominion.js';
import { buildCataclysm } from './variants-cataclysm.js';
import { buildEther } from './variants-ether.js';
import { buildEtherRhythms } from './variants-ether-rhythms.js';

// The four `signatures-*.js` modules import `derive` from here, so this stays
// the address it is known by even though the implementation moved.
export { derive } from './derive.js';

/**
 * Build all fourteen V20.3 signatures off the six hand-written blocks.
 *
 * `settings` is passed in rather than imported: this runs *from* `settings.js`
 * while that module is still initialising, so importing it back would read an
 * empty binding. The two borrowed families are lifted once here rather than in
 * each group module, because both cross group boundaries — the ground disc is
 * needed by every far cast in the library, and the volumetric fire by every
 * signature that trails flame, and neither family exists on more than one base.
 *
 * The four groups are disjoint: no derivation reads a block another group
 * builds, so the spread order below is presentation, not dependency. That is the
 * opposite of the merge in `settings.js`, where order is load-bearing.
 */
export function buildVariants(settings) {
  // Five of the six, not all six: no V20.3 variant derives from the Storm Lance.
  // `thunder` only becomes a base in V3.1, where `duskweave` comes off it.
  const { ice, meteor, beam, snare, glacier } = settings;
  const bases = {
    ice,
    meteor,
    beam,
    snare,
    glacier,
    snareField: borrow(snare, FIELD_KEYS),
    meteorTrail: borrow(meteor, TRAIL_KEYS)
  };

  return {
    ...buildDominion(bases),
    ...buildCataclysm(bases),
    ...buildEther(bases),
    ...buildEtherRhythms(bases)
  };
}
