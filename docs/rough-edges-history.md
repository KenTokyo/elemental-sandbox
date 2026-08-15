# Known rough edges — the closed versions

Back to [`README.md`](../README.md). The live list lives there and carries the two versions that
still describe the code as it stands: **V3.4** and **V3.3**, plus the **Standing** section of
limits that have never been version-bound.

This file holds the sections that have been overtaken. They are kept verbatim rather than deleted,
because each one records *why* a limit existed at the time — the 800-line split of V3.2, the
engine ceilings of V3.1, the dead-key decision of V20.3 — and those reasons keep coming back.

`README.md` hit the 800-line ceiling for the second time when the V3.4 section was added, and the
V3.2 precedent below is what this move follows: take the settled prose out verbatim and leave a
pointer, rather than trim the part that is still true.

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
