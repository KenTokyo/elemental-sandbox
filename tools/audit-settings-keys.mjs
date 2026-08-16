/**
 * Static audit: every settings key a module reads must exist on every block it
 * is instantiated for.
 *
 * This is the one failure mode the build cannot catch. Sixty signatures run on
 * fifteen engines and nine shared materials, all of them parametrised by an
 * element id — and a missing key is not an error in JavaScript. It is
 * `undefined`, which becomes `NaN` in a uniform, which is a black material, a
 * collapsed geometry or an effect that silently never emits. `pnpm build` only
 * proves the imports resolve.
 *
 * The check is deliberately dumb: collect `c.foo` / `this.config.foo` reads out
 * of the source, look each one up on every block the module can be handed. That
 * over-reports on branch-guarded reads, which is what `CONDITIONAL` is for —
 * each entry there is a key only read down a path a given element cannot take,
 * and each one has to be justified.
 *
 * The same tables answer the opposite question, which is the second half of this
 * file: a key that exists on a block *no engine reads* is not a crash, it is a
 * dead slider. `variants.js` derives each new block by deep-copying a base one,
 * so every derivation inherits the base's whole control surface — and the editor
 * generates its folders straight from the block, which turns every inherited
 * leftover into a control that visibly does nothing. See `--strict`.
 *
 * Usage: `node tools/audit-settings-keys.mjs [--strict]`
 *   exits non-zero on a missing key; `--strict` also fails on a dead one.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';
import { settings, ELEMENTS } from '../src/config/settings.js';

/**
 * module → the element ids it can be constructed for.
 * Derived from `AbilityManager.ABILITY_TYPES` plus the `createXMaterial(element)`
 * calls in each engine's `createShaders`.
 */
const CONSUMERS = {
  'abilities/IceAbility.js': [
    'ice', 'permafrost', 'verdant', 'obsidian', 'brine', 'verdigris', 'cinderveil',
    'amalgam'
  ],
  'abilities/ThunderAbility.js': ['thunder', 'duskweave', 'tempest', 'azurite', 'fulminate'],
  'abilities/MeteorAbility.js': ['meteor', 'comet', 'tarfall', 'pyreclast', 'garnet'],
  'abilities/BeamAbility.js': [
    'beam', 'voidrail', 'solar', 'chorus', 'eclipse', 'anvil',
    'lumen', 'arclight', 'pendulum', 'quicksilver', 'ochre'
  ],
  'abilities/SnareAbility.js': ['snare', 'gravebind', 'ossuary', 'cobalt'],
  'abilities/GlacierAbility.js': [
    'glacier', 'tidal', 'quartz', 'abyssal', 'prism', 'stormglass', 'porcelain'
  ],
  'abilities/CycloneAbility.js': [
    'cyclone', 'sandstorm', 'maelstrom', 'emberspire', 'censer', 'dynamo', 'flywheel'
  ],
  'abilities/GateAbility.js': ['gate', 'aperture', 'orrery', 'astrolabe'],
  'abilities/DomeAbility.js': ['zero', 'aurora', 'bellrose', 'thunderhead', 'carnelian'],
  // `SpearAbility extends BeamAbility`, so every id below is in the Beam list too.
  'abilities/SpearAbility.js': ['solar', 'anvil', 'pendulum', 'ochre'],
  'abilities/RiftAbility.js': ['magma', 'rimefault', 'sepulcher', 'sanguine', 'brimstone'],
  'abilities/WellAbility.js': ['gravity', 'singularity', 'ashmaw', 'lapis', 'sulphur'],
  'abilities/BloomAbility.js': ['plasma', 'nightshade', 'halation', 'ferrous'],
  'abilities/BladesAbility.js': ['blades', 'emberreap', 'refraction', 'vermilion', 'orpiment'],
  'abilities/RainAbility.js': ['rain', 'deluge', 'caustic', 'indigo', 'mercury'],
  // The ten V4 bolts, all on one engine. `bolt-fx.js`, `bolt-bodies.js` and
  // `bolt-scratch.js` are pulled in transitively as split parts, so they are
  // scanned at the same element precision as the engine itself.
  'abilities/BoltAbility.js': [
    'lancet', 'slagshot', 'quill', 'sabot', 'chakram',
    'novaseed', 'spindle', 'caltrop', 'harpoon', 'helix'
  ],

  'materials/IceMaterial.js': [
    'ice', 'permafrost', 'verdant', 'obsidian', 'brine', 'verdigris', 'cinderveil',
    'amalgam'
  ],
  'materials/LightningMaterial.js': ['thunder', 'duskweave', 'tempest', 'azurite', 'fulminate'],
  'materials/BeamMaterial.js': [
    'beam', 'voidrail', 'solar', 'chorus', 'eclipse', 'anvil',
    'lumen', 'arclight', 'pendulum', 'quicksilver', 'ochre'
  ],
  // The cyclones split here: only the `shardMaterial: 'rock'` half is handed a
  // meteor material, the crystal half goes to `GlacierMaterial` below.
  'materials/MeteorMaterial.js': [
    'meteor', 'sandstorm', 'magma', 'comet', 'tarfall', 'emberspire', 'rimefault',
    'pyreclast', 'sepulcher', 'dynamo', 'garnet', 'sanguine', 'brimstone'
  ],
  'materials/GlacierMaterial.js': [
    'glacier', 'tidal', 'cyclone', 'gate', 'zero',
    'quartz', 'abyssal', 'maelstrom', 'aperture', 'aurora',
    'prism', 'stormglass', 'censer', 'orrery', 'bellrose', 'thunderhead',
    'porcelain', 'flywheel', 'astrolabe', 'carnelian'
  ],
  'materials/FrostFieldMaterial.js': [
    'glacier', 'tidal', 'zero', 'quartz', 'abyssal', 'aurora',
    'prism', 'stormglass', 'bellrose', 'thunderhead', 'porcelain', 'carnelian'
  ],
  'materials/VolumetricFireMaterial.js': [
    'meteor', 'cyclone', 'sandstorm', 'magma', 'plasma',
    'comet', 'tarfall', 'maelstrom', 'emberspire', 'rimefault', 'nightshade',
    'pyreclast', 'censer', 'dynamo', 'sepulcher', 'halation',
    'garnet', 'sanguine', 'brimstone', 'flywheel', 'ferrous'
  ],
  // The cage is the Voltaic Snare's alone.
  'materials/SnareMaterial.js': ['snare', 'gravebind', 'ossuary', 'cobalt'],
  // …but `createSnareFieldMaterial` is what every `ZoneField` is made of, so
  // the `field*` family has to exist on every far cast in the library. Only the
  // second half of the file is read for those, hence the slice.
  //
  // Not every far cast is here: the glaciers and the domes stand their boundary
  // out of `FrostFieldMaterial`, and the snares bring their own field.
  'materials/SnareMaterial.js#createSnareFieldMaterial': [
    'cyclone', 'sandstorm', 'gate', 'plasma', 'rain', 'solar', 'gravity',
    'maelstrom', 'emberspire', 'aperture', 'nightshade', 'deluge', 'anvil', 'singularity',
    'censer', 'dynamo', 'orrery', 'halation', 'caustic', 'pendulum', 'ashmaw',
    'indigo', 'lapis', 'ferrous', 'flywheel', 'astrolabe', 'mercury', 'sulphur', 'ochre'
  ]
};

/**
 * Keys read only down a branch a given element never takes.
 * `module → element → keys`. Every entry is a claim that has to stay true.
 */
const CONDITIONAL = {
  'abilities/CycloneAbility.js': {
    // `shardMaterial: 'crystal'` — the asteroid branch of `_buildShard` and the
    // rock half of `_shapeKey` are unreachable for these two.
    cyclone: ['lumpiness', 'lumpScale', 'surfaceRoughness', 'cuts', 'cutDepth',
              'craters', 'craterDepth', 'craterSize'],
    maelstrom: ['lumpiness', 'lumpScale', 'surfaceRoughness', 'cuts', 'cutDepth',
                'craters', 'craterDepth', 'craterSize'],
    censer: ['lumpiness', 'lumpScale', 'surfaceRoughness', 'cuts', 'cutDepth',
             'craters', 'craterDepth', 'craterSize'],
    flywheel: ['lumpiness', 'lumpScale', 'surfaceRoughness', 'cuts', 'cutDepth',
               'craters', 'craterDepth', 'craterSize'],
    // `shardMaterial: 'rock'` — and correspondingly the crystal branch here.
    sandstorm: ['taper', 'roughness', 'bend'],
    emberspire: ['taper', 'roughness', 'bend'],
    dynamo: ['taper', 'roughness', 'bend']
  },
  'materials/GlacierMaterial.js': {
    // Only `GlacierAbility` and `DomeAbility` grow their shards; the cyclones
    // and the gates hand the same material static instances.
    cyclone: ['growTime'],
    maelstrom: ['growTime'],
    flywheel: ['growTime'],
    gate: ['growTime'],
    aperture: ['growTime'],
    astrolabe: ['growTime']
  }
};

/**
 * A module split under the 800-line rule is still *one* consumer.
 *
 * `CycloneAbility.js` keeps its emission methods in `cyclone-fx.js` and mixes
 * them onto its own prototype. Those methods read `this.config` for the same
 * four elements as the rest of the engine — but a file outside `CONSUMERS`
 * falls to the coarse net below, which counts a name as live for *every* block.
 * Left alone, a split silently trades element-precise reads for a global
 * "somebody reads this", and the dead-key list quietly shrinks.
 *
 * The two halves are told apart by name: engines, materials and support classes
 * are `PascalCase.js`, split parts are `kebab-case.js`. Parts are followed
 * transitively from the consumer's own `./…` imports, so a part that imports a
 * part comes along too, and `OWNED` below fails the audit if any part ends up
 * with no owner.
 */
const SPLIT_PART = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)+\.js$/;
const LOCAL_IMPORT = /from\s+'\.\/([^']+)'/g;

function partsOf(path) {
  const dir = path.slice(0, path.lastIndexOf('/') + 1);
  const parts = [];
  const walk = (rel) => {
    const source = readFileSync(new URL(`../src/${rel}`, import.meta.url), 'utf8');
    for (const match of source.matchAll(LOCAL_IMPORT)) {
      if (!SPLIT_PART.test(match[1])) continue;
      const child = dir + match[1];
      if (parts.includes(child)) continue;
      parts.push(child);
      walk(child);
    }
  };
  walk(path);
  return parts;
}

/** `c.foo`, `cfg.foo`, `conf.foo`, `this.config.foo` — the settings receivers. */
const RECEIVERS = /(?:this\.config|\bc|\bcfg|\bconf)\.([A-Za-z_][A-Za-z0-9_]*)/g;

/** Members of `Ability`, `Color`, `Vector3` … that are not settings keys. */
const NOT_SETTINGS = new Set([
  'element', 'ctx', 'group', 'phase', 'origin', 'direction', 'side', 'length',
  'front', 'u', 'position', 'age', 'impactTime', 'fadeTime', 'light',
  'lightColor', 'lightBoost', 'config', 'copy', 'set', 'setHex', 'setRGB',
  'clone', 'value', 'uniforms', 'visible', 'material', 'geometry', 'x', 'y',
  'z', 'w', 'r', 'g', 'b', 'a', 'toFixed', 'push', 'add', 'sub', 'multiplyScalar'
]);

let failures = 0;
/** element → every key some engine that runs for it actually reads. */
const readPerElement = new Map(ELEMENTS.map((element) => [element, new Set()]));
/** Split parts already claimed by a consumer, checked for orphans further down. */
const OWNED = new Set();

for (const [module, elements] of Object.entries(CONSUMERS)) {
  // `path.js#exportName` narrows the scan to one factory in a file that builds
  // more than one material off different key families.
  const [path, section] = module.split('#');
  const whole = readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8');
  const start = section ? whole.indexOf(`export function ${section}`) : 0;
  if (start < 0) {
    console.error(`${module}: no such export — the audit is out of date.`);
    failures++;
    continue;
  }
  // A `#section` entry deliberately reads *less* than its file, so it gets no
  // parts: the whole-file entry for the same path is what claims them.
  const parts = section ? [] : partsOf(path);
  for (const part of parts) OWNED.add(part);
  const source = [whole.slice(start), ...parts.map((p) => readFileSync(new URL(`../src/${p}`, import.meta.url), 'utf8'))].join('\n');

  const keys = new Set();
  for (const match of source.matchAll(RECEIVERS)) {
    if (!NOT_SETTINGS.has(match[1])) keys.add(match[1]);
  }

  for (const element of elements) {
    const block = settings[element];
    if (!block) {
      console.error(`MISSING BLOCK  settings.${element}  (${module})`);
      failures++;
      continue;
    }
    // A conditional key is still a key this element's engine reads on *some*
    // path, so it counts as live for the dead-key pass below.
    const allowed = new Set(CONDITIONAL[module]?.[element] ?? []);
    const live = readPerElement.get(element);
    if (live) for (const key of keys) live.add(key);

    const missing = [...keys].filter((key) => !(key in block) && !allowed.has(key)).sort();
    if (missing.length) {
      console.error(`${module} → settings.${element} is missing: ${missing.join(', ')}`);
      failures++;
    }
  }
}

/* Every id in the registry must actually have a block. */
for (const element of ELEMENTS) {
  if (!settings[element]) {
    console.error(`ELEMENTS lists "${element}" but settings has no block for it.`);
    failures++;
  }
}

/* ====================================================================== */
/* Dead keys — the other direction.                                       */
/* ====================================================================== */

/**
 * Everything the element-precise pass above cannot account for.
 *
 * `CONSUMERS` maps a module to the elements it runs for, so for those files a
 * key can be judged per element. For every *other* file — `effects/`, `ui/`,
 * `particles/`, `core/` — there is no element mapping, so a name read anywhere
 * in them has to count as live for all sixty blocks. That is the conservative
 * direction on purpose: this pass's output gets keys deleted, so a false
 * "dead" is expensive and a false "live" costs nothing but a leftover slider.
 *
 * Three deliberate exclusions:
 *  - `config/` is the declaration site, not a reader.
 *  - `archive/` is retired code kept for reference; letting it vote would pin
 *    keys alive that nothing in the running app touches.
 *  - `ui/Editor.js` *renders* keys, it does not consume them — and its six
 *    hand-written folders name base-block keys explicitly, which would mask
 *    exactly the inherited leftovers this pass exists to find.
 */
const SRC = new URL('../src/', import.meta.url);
const NET_SKIP = [/^config\//, /^archive\//, /^ui\/Editor\.js$/];
const consumerFiles = new Set(Object.keys(CONSUMERS).map((m) => m.split('#')[0]));
// A part was already read at full element precision above; letting the net read
// it again would undo exactly that precision.
for (const part of OWNED) consumerFiles.add(part);

/** Any `.foo` or `['foo']` — far broader than RECEIVERS, which is the point. */
const ANY_MEMBER = /\.([A-Za-z_][A-Za-z0-9_]*)|\[\s*['"]([A-Za-z_][A-Za-z0-9_]*)['"]\s*\]/g;

const srcDir = fileURLToPath(SRC);
const netNames = new Set();
for (const entry of readdirSync(srcDir, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
  const absolute = join(entry.parentPath ?? entry.path, entry.name);
  const rel = relative(srcDir, absolute).replace(/\\/g, '/');
  if (consumerFiles.has(rel) || NET_SKIP.some((re) => re.test(rel))) continue;
  const source = readFileSync(absolute, 'utf8');
  for (const match of source.matchAll(ANY_MEMBER)) netNames.add(match[1] ?? match[2]);
  // A kebab-case file next to the engines or materials is a split part. If no
  // consumer imports it, the split happened without the audit hearing about it
  // and every key it reads has just gone from per-element to live-everywhere.
  if (/^(abilities|materials)\//.test(rel) && SPLIT_PART.test(entry.name)) {
    console.error(`${rel}: split part no consumer imports — the audit is out of date.`);
    failures++;
  }
}

const dead = [];
for (const element of ELEMENTS) {
  const block = settings[element];
  if (!block) continue;
  const live = readPerElement.get(element) ?? new Set();
  const unread = Object.keys(block)
    .filter((key) => !live.has(key) && !netNames.has(key))
    .sort();
  if (unread.length) dead.push([element, unread]);
}

const total = dead.reduce((n, [, keys]) => n + keys.length, 0);
const strict = process.argv.includes('--strict');
if (dead.length && (strict || process.argv.includes('--list'))) {
  console.error(`\n${total} key(s) on ${dead.length} block(s) that nothing reads:`);
  for (const [element, keys] of dead) console.error(`  settings.${element}: ${keys.join(', ')}`);
  console.error('  Each one is a slider the generated editor would show and no engine consumes.');
  if (strict) failures += total;
}

/* ---------------------------------------------------------------------- */
/* `src/config/dead-keys.js` — this pass's result, as data for the editor. */
/* ---------------------------------------------------------------------- */

/**
 * The editor hides these rather than `variants.js` dropping them, deliberately.
 *
 * Deleting an unread key from its block would be the tidier-looking fix and is
 * the wrong one twice over. It is unsafe: this pass is a regex over source, and
 * a single false positive turns a live key into `undefined` → `NaN` in a
 * uniform → a black material, which is precisely the class of bug no test here
 * can see. And it is circular: the pass computes "unread" *from* the blocks, so
 * pruning them would empty its own input and the list could never be rechecked.
 *
 * Leaving the blocks whole keeps every run measured against the same full
 * surface, and costs nothing at runtime — an unread key is a few bytes that no
 * shader samples.
 */
const GENERATED = new URL('../src/config/dead-keys.js', import.meta.url);
const banner = `/**
 * GENERATED by \`node tools/audit-settings-keys.mjs --write\` — do not hand-edit.
 *
 * Keys that exist on a block because \`variants.js\` derived it from a base block,
 * but that no engine or material running for that element ever reads. The editor
 * generates its folders straight from the blocks, so without this list each one
 * below is a control that visibly does nothing.
 *
 * Regenerate after any change to an engine's settings reads. \`pnpm audit:settings\`
 * fails if this file has drifted from what the audit computes.
 */
export const DEAD_KEYS = {
${dead.map(([element, keys]) => `  ${element}: [${keys.map((k) => `'${k}'`).join(', ')}]`).join(',\n')}
};
`;

if (process.argv.includes('--write')) {
  writeFileSync(GENERATED, banner);
  console.log(`Wrote src/config/dead-keys.js — ${total} key(s) across ${dead.length} block(s).`);
} else {
  let current = null;
  try {
    current = readFileSync(GENERATED, 'utf8');
  } catch {
    /* not generated yet */
  }
  // Compare on normalised line endings: this repo runs on Windows and a
  // checkout can hand the file back with CRLF, which is not drift.
  if (current?.replace(/\r\n/g, '\n') !== banner) {
    console.error(
      current === null
        ? '\nsrc/config/dead-keys.js is missing — run `node tools/audit-settings-keys.mjs --write`.'
        : '\nsrc/config/dead-keys.js is stale — run `node tools/audit-settings-keys.mjs --write`.'
    );
    failures++;
  }
}

if (failures) {
  console.error(`\n${failures} problem(s).`);
  process.exit(1);
}
console.log(
  `OK — ${Object.keys(CONSUMERS).length} modules, every key they read exists on all ${ELEMENTS.length} blocks they run for; ` +
    (dead.length
      ? `${total} unread key(s) on ${dead.length} block(s), hidden by src/config/dead-keys.js (--list to see them).`
      : 'no unread keys on any block.')
);
