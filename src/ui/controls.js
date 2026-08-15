/**
 * controls.js — how a settings value becomes a control, for every folder.
 *
 * Two kinds of folder are built in this editor and both end up here. The six
 * hand-written panels call `range`, `castAnimation` and `gradient` directly,
 * because their author knew what each number meant and wrote the bounds and the
 * label by hand. The thirty-four generated ones go through `generateBlock`,
 * which reads the control surface off the values themselves — a block is a flat
 * map of numbers, booleans and `#rrggbb` strings by design, so no schema has to
 * be kept in step when a signature adds a key.
 *
 * Split out of `Editor.js` under the 800-line rule in `AGENTS.md`. They were
 * statics on `Editor` and nothing outside that file ever called them, so they
 * are plain exports now; that also keeps `panels-*.js` from having to import
 * `Editor` itself, which imports them back.
 */
import { CAST_ANIMATIONS } from '../config/settings.js';

/**
 * How a generated block is split into subfolders.
 *
 * Order matters: the first bucket whose test matches wins, so `riseTime` lands
 * in Timing rather than Shape even though `rise` is a silhouette family. The
 * colour bucket is decided by the *value* (`#rrggbb`) rather than the name,
 * which is why it is not in this table.
 */
const BUCKETS = [
  { title: 'The cast', test: (key) => /^(range|minRange|speed|lifetime|cooldown|castAnim|zoneRadius)$/.test(key) },
  {
    title: 'Timing',
    test: (key) => /time|delay|stagger|duration|interval|period|settle|hold|release|fade|decay|rate|spin|scroll|drift|churn|pulse|flicker/i.test(key)
  },
  {
    title: 'Light & feel',
    test: (key) => /glow|opacity|fresnel|translucen|light|flash|shake|bloom|emissive|intensity|contrast|softness|blur/i.test(key)
  },
  { title: 'Shape', test: () => true }
];

export function range(folder, object, key, min, max, step, label) {
  return folder.add(object, key, min, max, step).name(label ?? key);
}

/**
 * Which clip the body throws when this ability fires.
 *
 * One per ability, because the gesture is part of how a spell reads — the
 * beam and the snare should not be cast the same way. `App` reads the value
 * at the moment of the cast, so switching it applies to the very next click.
 */
export function castAnimation(folder, object) {
  return folder.add(object, 'castAnim', CAST_ANIMATIONS).name('cast animation');
}

/**
 * The four colour stops of a particle system's lifetime gradient.
 *
 * `ParticleSystem#setGradient` samples them across a particle's own life, so
 * they are labelled by *when* they are seen rather than by what they are —
 * `A` is the instant it is born, `D` is the moment it dies.
 *
 * @param {string} prefix settings key without the A/B/C/D suffix
 */
export function gradient(folder, object, prefix, title) {
  const group = folder.addFolder(title);
  group.addColor(object, `${prefix}A`).name('birth');
  group.addColor(object, `${prefix}B`).name('early');
  group.addColor(object, `${prefix}C`).name('late');
  group.addColor(object, `${prefix}D`).name('death');
  return group;
}

/**
 * `widthNear` → `width near`. Every key in the settings blocks is camelCase,
 * and the hand-written folders all label their controls in lower case prose,
 * so this is what keeps the generated section from looking pasted in.
 */
export function label(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .toLowerCase();
}

/**
 * A slider for a key whose sensible range nobody wrote down.
 *
 * The hand-written folders state min/max per control because the author knew
 * what the number meant. Here the shipped value is the only evidence there
 * is, so the rule is: 0 (or a mirrored negative) up to three times the
 * default, which puts the shipped look at a third of the track and leaves
 * room to push a value well past it without a text field.
 *
 * Counts are the one special case — an integer of any size steps by 1, since
 * 187.4 spikes is not a thing the engine can do with the value.
 */
export function autoRange(folder, block, key) {
  const value = block[key];
  const magnitude = Math.abs(value);
  const counted = Number.isInteger(value) && magnitude >= 8;

  const max = magnitude < 1e-6 ? 1 : (counted ? Math.ceil(magnitude * 3) : magnitude * 3);
  const min = value < 0 ? -max : 0;
  const step = counted ? 1 : Math.max(0.001, Number((max / 300).toPrecision(1)));

  return folder.add(block, key, min, max, step).name(label(key));
}

/**
 * Build one folder's worth of controls out of a settings block.
 *
 * The block is a flat map of numbers, booleans and `#rrggbb` strings by
 * design (see `config/variants.js`), so the whole control surface can be read
 * off the values themselves — no schema, and nothing to keep in step when a
 * variant adds a key.
 *
 * `skip` is what keeps that honest. Reading the surface off the values means
 * reading the *inherited* ones too: `variants.js` derives each block by
 * copying a base block whole, so a signature carries every control its base
 * had, including the families its own engine never looks at. Those are real
 * numbers with plausible names that move nothing on screen, which is worse
 * than a missing control. `config/dead-keys.js` names them, and the audit
 * that generates it fails if the list has drifted.
 *
 * @param {Set<string>|undefined} skip keys this element's engines never read
 */
export function generateBlock(folder, block, skip) {
  const colours = [];
  const buckets = new Map();

  for (const key of Object.keys(block).sort()) {
    if (skip?.has(key)) continue;
    const value = block[key];
    if (typeof value === 'string' && value.startsWith('#')) {
      colours.push(key);
      continue;
    }
    const bucket = BUCKETS.find((candidate) => candidate.test(key)) ?? BUCKETS.at(-1);
    if (!buckets.has(bucket.title)) buckets.set(bucket.title, []);
    buckets.get(bucket.title).push(key);
  }

  // Fixed order rather than insertion order, so every one of the fourteen
  // folders opens with the same four sections in the same places.
  for (const { title } of BUCKETS) {
    const keys = buckets.get(title);
    if (!keys?.length) continue;
    const sub = folder.addFolder(title);
    for (const key of keys) {
      const value = block[key];
      if (key === 'castAnim') sub.add(block, key, CAST_ANIMATIONS).name('cast animation');
      else if (typeof value === 'number') autoRange(sub, block, key);
      else if (typeof value === 'boolean') sub.add(block, key).name(label(key));
      // Anything else (an array, a nested object) has no obvious control and
      // is left alone rather than guessed at.
    }
  }

  if (colours.length) {
    const palette = folder.addFolder('Colour');
    for (const key of colours) palette.addColor(block, key).name(label(key));
  }
}
