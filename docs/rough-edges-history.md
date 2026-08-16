# Known rough edges — the closed versions

Back to [`README.md`](../README.md). The live list lives there and carries the version that
describes the code as it stands — **V4** — plus the **Standing** section of limits that have never
been version-bound.

This file holds the sections that have been overtaken. They are kept verbatim rather than deleted,
because each one records *why* a limit existed at the time — the rebuilt blocks of V3.4, the
800-line split of V3.2, the engine ceilings of V3.1, the dead-key decision of V20.3 — and those
reasons keep coming back.

`README.md` hit the 800-line ceiling for the third time when the V4 section arrived. **V3.4** and
**V3.3** came across then; the V3.2 precedent below is what both moves follow: take the settled
prose out verbatim and leave a pointer, rather than trim the part that is still true. Nothing in
either list was retracted — they still describe the ten rebuilt V3.4 blocks and the twenty of V3.3
as they stand.

---

### V3.4

- **Ten V3.3 blocks were rebuilt, and none of them has been seen either.** `azurite`, `indigo`,
  `cobalt`, `vermilion`, `ferrous`, `flywheel`, `astrolabe`, `mercury`, `brimstone` and `fulminate`
  were reported as unreadable and rewritten from the cause outwards — a `slashSpan` of 5.8 rad is
  332°, which is a ring and not a crescent; a `petalWidth` of 1.8 against a `petalSpan` of 2.6 is a
  hull and not a petal; `widthTip` 3.2 on `width` 0.16 is a half-metre club at the tip of a whip.
  The causes are arithmetic and checkable, but that the replacements *read* is not.
- **`ochre` was left exactly as it was**, by request. It is the one block of the twenty that was
  not complained about, so it is the control.
- **Four labels changed, and the ids did not.** Azurite Horn, Cobalt Obelisk, Vermilion Shears and
  Brimstone Vents replace their V3.3 names because the shapes underneath them changed. Nothing
  keys off a label, so this is cosmetic — but a saved loadout or a screenshot from V3.3 will name
  abilities that no longer exist under those names.
- **Ten sigils were redrawn against the new comments, not against a render.** Same standing as the
  twenty in V3.2: that they are distinguishable at 34px is a claim no gate here can make.
- **The `--fingerprint` baseline was rewritten on purpose, a third time.** This is the first time
  it was rewritten for *changed values* rather than for added blocks: the block count held at
  eighty and the hash moved from `79ca92222472ea36` to `939e45b63cc033df` because numbers inside
  ten blocks moved. Re-recording it is correct here only because the change was the whole point.
- **The superlatives were recomputed once more, and nothing checks them.** Each rebuilt block
  claims a ceiling — the shortest body on the rain engine, the largest hoop on the gate engine, the
  slowest walk on the rift engine — against the library as it stands now. The same structural gap
  as in V3.3 applies: no gate compares prose to numbers.
- **A rebuilt block also invalidates superlatives in blocks that were *not* rebuilt.** `sanguine`
  called its sixty stones "the fewest on the engine" and named Brimstone Fissure as the one that
  raised none; the rebuilt `brimstone` lays forty, so both halves of that were wrong and are
  corrected. Only the ten new blocks had been re-derived — the reverse direction was found by
  searching the config for the ten labels, which is the only handle there is.
- **The dead-key count did not move.** 2929 unread keys on 48 blocks, before and after, which is
  the expected result of changing values rather than adding or removing them, and the reason the
  settings audit is a weak signal for this kind of change.

### V3.3

- **None of the twenty added signatures has been seen either.** Same standing as V3.2 below and the
  same two gates behind it: `pnpm run audit` proves every key an engine reads exists on all eighty
  blocks and that all eighty ids have a block, metadata, a sigil and an engine; `pnpm build` proves
  the imports resolve. Whether the GLSL compiles for the new blocks, and whether a silhouette reads
  the way its comment claims, is untested.
- **Sixteen picker groups of five**, up from twelve. Whether the card grid still reads without a
  scroll break has only been reasoned about statically, and four more groups is the largest single
  jump the picker has taken.
- **The superlatives were recomputed after the merge, and nine of them were wrong.** A comment that
  says "the slowest on the engine" is written against the library as it stood when the block was
  drafted, and twenty new blocks move those ceilings underneath it. Every claim in the V3.3 blocks
  was re-derived from the merged `settings` afterwards — `sanguine`'s basalt was no longer the
  fewest (Brimstone Fissure, as it then was, raised none), `quicksilver` was not the only near-solid beam (Eclipse
  Column is more opaque), `amalgam`'s clumping was not the strongest. They are corrected, but the
  class of error is structural: nothing in the gates checks prose against numbers.
- **`slashPitch` is written nowhere in V3.3.** It sits on the `blades` block and the blade engine
  never reads it, so the drafted value for `orpiment` was dropped rather than shipped as a slider
  that visibly does nothing. `dead-keys.js` lists it for every id on that engine.
- **The `--fingerprint` baseline was rewritten on purpose**, again: twenty blocks arrived, so the
  hash was never going to match. `tools/.fingerprint` now records the eighty-block value.
- **The 800-line split was laid down before the blocks were written.** V3.2 had to split two groups
  after the fact; each V3.3 group is three blocks plus a named sibling of two from the start. The
  largest of the eight is 582 lines after the V3.4 rewrites, so the headroom is real rather than
  asserted.

---

### V3.2

- **None of the twenty added signatures has been seen either.** Same standing as V3.1 below, and
  the same two gates behind it: `pnpm run audit` proves every key an engine reads exists on all
  sixty blocks and that all sixty ids have a block, metadata, a sigil and an engine; `pnpm build`
  proves the imports resolve. Whether the GLSL compiles for the new blocks, and whether a
  silhouette reads the way its comment claims, is untested.
- **Twenty new sigils, drawn against a description rather than a render.** Each mark is drawn from
  the trait that was changed against its engine sibling — the rings rather than the shell, the
  blocks rather than the funnel. That they are *distinguishable at 34px* is a claim no check here
  can make.
- **Twelve picker groups of five**, up from eight. Whether the card grid still reads without a
  scroll break has only been reasoned about statically.
- **The `--fingerprint` baseline was rewritten on purpose.** Twenty blocks arrived, so the hash was
  never going to match; `tools/.fingerprint` now records the sixty-block value. That is the one
  case where re-recording it is correct rather than a way of silencing the check.
- **`README.md` hit the 800-line ceiling**, so the four engine deep-dives moved verbatim to
  `docs/engine-notes.md`, and `ui/glyphs.js` was split the same way into `glyph-frame.js` plus
  `glyphs-signatures.js`. `tools/registry-check.mjs` scraped the sigil table out of `glyphs.js` as
  text and would have gone blind to the spread — it imports the table now instead.
- **Two of the four new signature modules shipped over the ceiling** at 861 and 911 lines, against
  a task note claiming one file per group would stay under it. Their last two blocks each moved to
  `signatures-ashfall-hollows.js` and `signatures-stormglass-cells.js`; `--fingerprint` held at
  `69305969f74ab1c4` across the cut, which is what makes it a move rather than an edit.

### V3.1

- **None of the twenty added signatures has been seen.** They were written, merged, audited and
  built, and that is all — `pnpm audit:settings` proves every key an engine reads exists on every
  block it runs for, and `pnpm build` proves the imports resolve. Neither can prove that a value is
  *sensible*, that the GLSL compiles for the new blocks, or that a silhouette reads the way its
  comment claims. Treat every number in the eight `signatures-*.js` modules as a first
  pass.
- **Engine ceilings clamp silently.** Several blocks sit deliberately at a cap (`rings: 12` on the
  Eclipse Column, `strands: 24` on the Dusk Weave, `spikeCount: 268` against the 288 limit on the
  Brine Lance) and say so in a comment. A value pushed *past* one of those reads in the editor as a
  slider that does nothing.
- **Picker groups of five.** `ELEMENTS` is derived from `ABILITY_GROUPS` and the group size is
  not enforced anywhere; five per group is a convention that keeps the card grid even, not a rule
  the code checks.

### V20.3

- **The simplified loadout UI has not been visually verified.** The six-slot HUD, picker layout,
  focus handling and responsive CSS have only been inspected statically since the redesign; no DOM
  or browser pass has exercised them. The same applies to GLSL compilation in the fourteen added
  signatures, which static JavaScript checks cannot cover.
- **`MAX_CONCURRENT` is 3**, down from 4. Several of the new signatures carry their own raymarch
  pass, and the dynamic light pool only holds six — a Magma Rift and a Plasma Bloom standing at
  once is already two volumetric shaders plus their lights.
- **Unread keys stay on their blocks.** A derived block inherits every key of its base, including
  families its own engine never reads — `gravity` carries the Snare's `strands`/`tendrils`/
  `rimArcs`, `cyclone` the Glacial Crown's `mist*`/`snow*`. `pnpm audit:settings` now checks that
  direction too and counts **2929 such keys across 48 of the 80 blocks**, which the editor skips via
  the generated `src/config/dead-keys.js`. They are hidden rather than deleted on purpose: the check
  is a regex over source, and one false positive would turn a live key into `NaN` in a uniform — a
  black material, the one failure nothing here can see — and the check computes "unread" *from* the
  blocks, so pruning them would empty its own input. Regenerate with
  `node tools/audit-settings-keys.mjs --write`; a normal run fails if the file has drifted.
- **`RiftAbility` and `BloomAbility` each build their own `VolumetricFireMaterial`**, so a boot can
  compile up to twelve raymarch shaders across the pools. It is a one-time cost, but it is on the
  loading screen. Sharing one material is *not* the fix — every column would draw the same seed and
  a row of identical flames reads as a repeated sprite. Lower the raymarcher count instead.
- `slashRadiusJitter` and `slashHeightJitter` on Spectral Blades perturb the sparks only; the
  CRESCENT shader does not read them, so the blade shape itself does not jitter. `slashPitch` is
  read by nothing at all and is one of the keys the audit lists.
- Celestial Rain drops at most six landings per frame. A frame hitch discards the rest silently
  rather than catching up in a burst; raise `MAX_LANDINGS_PER_FRAME` if gaps become visible.
