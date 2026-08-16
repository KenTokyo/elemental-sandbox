/**
 * registry.js — who the ninety abilities are, as opposed to what they are worth.
 *
 * Everything here is presentation and identity: the picker groups, the id list
 * derived from them, the six ids the bar starts with, and the per-ability label,
 * accent, blurb and cast shape. Not one line reads a tunable value, which is the
 * whole point of the file — it imports nothing, so `settings.js` can import it
 * without the two forming a cycle. The two helpers that *do* need a number
 * (`castShapeOf`, `zoneRadiusOf`) stay in `settings.js` for that reason.
 *
 * Split out of `settings.js` under the 800-line rule in `AGENTS.md`, verbatim.
 * `settings.js` re-exports every name below, so both addresses work and no
 * existing import had to move.
 *
 * A missing entry here is not a crash, it is a silence: no `ELEMENT_META` row
 * costs the ability its label, blurb and far-cast aiming; no group membership
 * costs it its place in the picker. `tools/audit-settings-keys.mjs` covers the
 * value side of a block, not this side — the registry cross-check is manual.
 */

/**
 * How an ability is aimed.
 *
 * `LINE` is the skillshot the sandbox started with: an arrow swung about the
 * caster, cast along its length. `ZONE` is the **far cast** — a circle with a
 * thick boundary dropped at the cursor, which answers the only question a
 * ground-targeted AoE has to answer before you commit: how much space is this
 * going to take. Both resolve to the same `cast(origin, direction, distance)`
 * event, so an ability never has to care which one aimed it; a zone ability
 * simply reads its target as `pointAt(1)` and works outward from there.
 */
export const CastShape = Object.freeze({
  LINE: 'line',
  ZONE: 'zone'
});

// The picker groups all ninety abilities for browsing — eighteen groups of
// five; these groups do not own slots. The one mutable six-slot loadout lives
// in `ui/Loadout.js`.
//
// The last two groups are the V4 bolts. They are the only entries in the whole
// registry that can *miss*: every other ability resolves at the end of its cast
// line because that is the only place it can resolve, while a bolt resolves
// wherever its flying body happens to touch a target, or nowhere at all.
export const ABILITY_GROUPS = [
  {
    id: 'vanguard',
    label: 'Arcane Vanguard',
    elements: ['ice', 'thunder', 'meteor', 'beam', 'snare']
  },
  {
    id: 'dominion',
    label: 'Glacial Dominion',
    elements: ['glacier', 'permafrost', 'cyclone', 'gate', 'zero']
  },
  {
    id: 'cataclysm',
    label: 'Cataclysm Engine',
    elements: ['solar', 'magma', 'gravity', 'voidrail', 'plasma']
  },
  {
    id: 'ether',
    label: 'Wild Ether',
    elements: ['verdant', 'sandstorm', 'tidal', 'blades', 'rain']
  },
  {
    id: 'emberforge',
    label: 'Emberforge Choir',
    elements: ['anvil', 'emberspire', 'emberreap', 'aperture', 'chorus']
  },
  {
    id: 'hoarfrost',
    label: 'Hoarfrost Reliquary',
    elements: ['comet', 'rimefault', 'quartz', 'maelstrom', 'aurora']
  },
  {
    id: 'umbral',
    label: 'Umbral Covenant',
    elements: ['eclipse', 'singularity', 'nightshade', 'gravebind', 'duskweave']
  },
  {
    id: 'drowned',
    label: 'Drowned Choir',
    elements: ['abyssal', 'deluge', 'obsidian', 'tarfall', 'brine']
  },
  {
    id: 'conclave',
    label: 'Verdigris Conclave',
    elements: ['bellrose', 'censer', 'orrery', 'verdigris', 'pendulum']
  },
  {
    id: 'prismatic',
    label: 'Prismatic Assembly',
    elements: ['prism', 'refraction', 'lumen', 'halation', 'caustic']
  },
  {
    id: 'ashfall',
    label: 'Ashfall Legion',
    elements: ['ossuary', 'cinderveil', 'pyreclast', 'sepulcher', 'ashmaw']
  },
  {
    id: 'stormglass',
    label: 'Stormglass Ascendancy',
    elements: ['tempest', 'arclight', 'stormglass', 'dynamo', 'thunderhead']
  },
  {
    id: 'synod',
    label: 'Indigo Synod',
    elements: ['porcelain', 'azurite', 'indigo', 'lapis', 'cobalt']
  },
  {
    id: 'assize',
    label: 'Sanguine Assize',
    elements: ['sanguine', 'vermilion', 'garnet', 'carnelian', 'ferrous']
  },
  {
    id: 'escapement',
    label: 'Quicksilver Escapement',
    elements: ['flywheel', 'quicksilver', 'astrolabe', 'mercury', 'amalgam']
  },
  {
    id: 'litany',
    label: 'Brimstone Litany',
    elements: ['brimstone', 'sulphur', 'orpiment', 'fulminate', 'ochre']
  },
  {
    id: 'kinetic',
    label: 'Kinetic Assembly',
    elements: ['lancet', 'slagshot', 'quill', 'sabot', 'chakram']
  },
  {
    id: 'astral',
    label: 'Astral Ordnance',
    elements: ['novaseed', 'spindle', 'caltrop', 'harpoon', 'helix']
  }
];

/** Every castable ability id, in picker group order. */
export const ELEMENTS = ABILITY_GROUPS.flatMap((group) => group.elements);

/** The six abilities shown on the bar at startup. */
export const DEFAULT_LOADOUT = Object.freeze(['ice', 'thunder', 'meteor', 'beam', 'snare', 'glacier']);

/**
 * Registry metadata: how an ability is presented, and how it is aimed.
 *
 * `category` is filled from `ABILITY_GROUPS` below so the picker can group and
 * filter without duplicating registry data. `cast` is read by `AimController` to
 * pick between the arrow and the circle; omit it and the ability is a line cast.
 * `blurb` is the one-line description used by the HUD and editor.
 */
export const ELEMENT_META = {
  /* --- Arcane Vanguard --- */
  ice: { label: 'Frost Lance', accent: '#5fd0ff', blurb: 'A fracture front and a field of crystal along the line.' },
  thunder: { label: 'Storm Lance', accent: '#7fb4ff', blurb: 'A bundle of filaments thrown from the hand.' },
  meteor: { label: 'Cinder Fall', accent: '#ff8a3c', blurb: 'A burning rock lobbed downrange, detonating on arrival.' },
  beam: { label: 'Nova Beam', accent: '#7ff0ff', blurb: 'A charged column of light that lands and holds.' },
  snare: {
    label: 'Voltaic Snare',
    accent: '#a98bff',
    blurb: 'A trap planted at a point: a cage of current standing in the air.',
    cast: CastShape.ZONE
  },

  /* --- Glacial Dominion --- */
  glacier: {
    label: 'Glacial Crown',
    accent: '#8ee8ff',
    blurb: 'A ring of blades torn out of the floor around the footprint.',
    cast: CastShape.ZONE
  },
  permafrost: {
    label: 'Permafrost Wake',
    accent: '#9fdcf2',
    blurb: 'A slow, wide wake of rime and slabs that stands for a long time.'
  },
  cyclone: {
    label: 'Shard Cyclone',
    accent: '#8fe4ff',
    blurb: 'A funnel of orbiting ice standing in the footprint.',
    cast: CastShape.ZONE
  },
  gate: {
    label: 'Boreal Gate',
    accent: '#7fd8ff',
    blurb: 'A ring of ice stood upright with a lit membrane across it.',
    cast: CastShape.ZONE
  },
  zero: {
    label: 'Absolute Zero',
    accent: '#a6ecff',
    blurb: 'A freezing shell closed over the footprint, resolved in plates.',
    cast: CastShape.ZONE
  },

  /* --- Cataclysm Engine --- */
  solar: {
    label: 'Solar Spear',
    accent: '#ffc866',
    blurb: 'A shaft of daylight dropped onto the target from above.',
    cast: CastShape.ZONE
  },
  magma: { label: 'Magma Rift', accent: '#ff7a28', blurb: 'The floor torn open along the line, with flame standing in it.' },
  gravity: {
    label: 'Gravity Well',
    accent: '#9b5bff',
    blurb: 'A hole opened over the footprint that drags everything inward.',
    cast: CastShape.ZONE
  },
  voidrail: { label: 'Void Rail', accent: '#c46bff', blurb: 'One hard stroke of dark light, fired instantly.' },
  plasma: {
    label: 'Plasma Bloom',
    accent: '#ff6ad0',
    blurb: 'A core opening into volumetric petals with arcs around them.',
    cast: CastShape.ZONE
  },

  /* --- Wild Ether --- */
  verdant: { label: 'Verdant Rupture', accent: '#8dff63', blurb: 'Thorns curving up out of the ground along the line.' },
  sandstorm: {
    label: 'Sandstorm Coil',
    accent: '#d8b478',
    blurb: 'A slow, heavy column of dust and stone turning in place.',
    cast: CastShape.ZONE
  },
  tidal: {
    label: 'Tidal Prism',
    accent: '#4fc6ff',
    blurb: 'A wall of water prisms curling inward around a spout.',
    cast: CastShape.ZONE
  },
  blades: { label: 'Spectral Blades', accent: '#5fffd8', blurb: 'A rhythm of crescents cut through the air down the line.' },
  rain: {
    label: 'Celestial Rain',
    accent: '#9fbfff',
    blurb: 'Shafts of light falling into the footprint, one beat at a time.',
    cast: CastShape.ZONE
  },

  /* --- Emberforge Choir --- */
  anvil: {
    label: 'Sunforge Anvil',
    accent: '#ffa646',
    blurb: 'A molten billet held over the footprint, then driven into it.',
    cast: CastShape.ZONE
  },
  emberspire: {
    label: 'Emberspire',
    accent: '#ff9633',
    blurb: 'A narrow flue of fire turning fast and throwing cinders up it.',
    cast: CastShape.ZONE
  },
  emberreap: {
    label: 'Ember Reap',
    accent: '#ff8a30',
    blurb: 'Three enormous burning strokes cut down the line.'
  },
  aperture: {
    label: 'Solar Aperture',
    accent: '#ffb64d',
    blurb: 'A wide amber lens stood upright, throwing long shafts through it.',
    cast: CastShape.ZONE
  },
  chorus: {
    label: 'Choral Ray',
    accent: '#ffd18a',
    blurb: 'The beam slowed and opened out into a column that stands.'
  },

  /* --- Hoarfrost Reliquary --- */
  comet: {
    label: 'Rime Comet',
    accent: '#7fd8ff',
    blurb: 'A cold stone on a high arc, trailing vapour instead of flame.'
  },
  rimefault: {
    label: 'Rimefault',
    accent: '#86d8f0',
    blurb: 'A single fault opened along the line with cold standing in it.'
  },
  quartz: {
    label: 'Quartz Bastion',
    accent: '#ffc86a',
    blurb: 'A ring of amber monoliths pushed up and held for a long time.',
    cast: CastShape.ZONE
  },
  maelstrom: {
    label: 'Maelstrom',
    accent: '#5fd8ff',
    blurb: 'A wide body of cold water turning over inside its own footprint.',
    cast: CastShape.ZONE
  },
  aurora: {
    label: 'Aurora Mantle',
    accent: '#6effc0',
    blurb: 'A bell of light closed over the footprint, drifting apart at the end.',
    cast: CastShape.ZONE
  },

  /* --- Umbral Covenant --- */
  eclipse: {
    label: 'Eclipse Column',
    accent: '#7a5ce0',
    blurb: 'A dark disc stood on end close in, ringed in a pale corona.'
  },
  singularity: {
    label: 'Singularity Maw',
    accent: '#2fbfae',
    blurb: 'A narrow throat hung at head height, pulling the floor in around it.',
    cast: CastShape.ZONE
  },
  nightshade: {
    label: 'Nightshade Bloom',
    accent: '#5fd08f',
    blurb: 'Four long arms opening slowly and drooping back to the floor.',
    cast: CastShape.ZONE
  },
  gravebind: {
    label: 'Grave Bind',
    accent: '#7fd8a0',
    blurb: 'A web of current pinned flat across a wide footprint.',
    cast: CastShape.ZONE
  },
  duskweave: {
    label: 'Dusk Weave',
    accent: '#8f6bd8',
    blurb: 'A bolt slowed until the bundle hangs in the air as fabric.'
  },

  /* --- Drowned Choir --- */
  abyssal: {
    label: 'Abyssal Vault',
    accent: '#2f9c84',
    blurb: 'A squat wall of black glass folded shut over the footprint.',
    cast: CastShape.ZONE
  },
  deluge: {
    label: 'Ashen Deluge',
    accent: '#c98a4c',
    blurb: 'Slabs of dull light dropped into the footprint one at a time.',
    cast: CastShape.ZONE
  },
  obsidian: {
    label: 'Obsidian Thorns',
    accent: '#ff7a2c',
    blurb: 'Enormous blades of volcanic glass heaved up along a narrow lane.'
  },
  tarfall: {
    label: 'Tar Fall',
    accent: '#8a5c2c',
    blurb: 'A dense lump thrown flat and fast behind a tail that blots the stage.'
  },
  brine: {
    label: 'Brine Lance',
    accent: '#cfe8d8',
    blurb: 'A crusted seam of salt ripped along the floor at speed.'
  },

  /* --- Verdigris Conclave --- */
  bellrose: {
    label: 'Bell Rose',
    accent: '#4fa87a',
    blurb: 'A small bronze bell slammed shut over the footprint, ringing rings out of it.',
    cast: CastShape.ZONE
  },
  censer: {
    label: 'Censer Coil',
    accent: '#5fc898',
    blurb: 'A leaning column of jade smoke with a few great blocks hanging in it.',
    cast: CastShape.ZONE
  },
  orrery: {
    label: 'Orrery Gate',
    accent: '#7fd8b0',
    blurb: 'A brass hoop hung in the air with concentric tracks turning inside it.',
    cast: CastShape.ZONE
  },
  verdigris: {
    label: 'Verdigris Seam',
    accent: '#3f9c78',
    blurb: 'A low crust of oxidised copper creeping out along the line.'
  },
  pendulum: {
    label: 'Pendulum Fall',
    accent: '#7fd0a8',
    blurb: 'A plumb bob swung high above the target, then dropped on its thread.',
    cast: CastShape.ZONE
  },

  /* --- Prismatic Assembly --- */
  prism: {
    label: 'Prism Cascade',
    accent: '#bfe4ff',
    blurb: 'A standing colonnade of glass needles that keeps arriving while it holds.',
    cast: CastShape.ZONE
  },
  refraction: {
    label: 'Refraction Fan',
    accent: '#9fd8ff',
    blurb: 'Fourteen razor edges cut on the same plane, each dragging a colour fringe.'
  },
  lumen: {
    label: 'Lumen Spire',
    accent: '#ffffff',
    blurb: 'A short white cylinder inside a spinning cage, gone in a third of a second.'
  },
  halation: {
    label: 'Halation Bloom',
    accent: '#cfe0ff',
    blurb: 'Six arms thrown flat across the footprint at once, ringed in a halo.',
    cast: CastShape.ZONE
  },
  caustic: {
    label: 'Caustic Rain',
    accent: '#6fe8d8',
    blurb: 'A shimmer of hair-thin threads falling into the widest footprint there is.',
    cast: CastShape.ZONE
  },

  /* --- Ashfall Legion --- */
  ossuary: {
    label: 'Ossuary Bind',
    accent: '#c8b088',
    blurb: 'A narrow ribcage of bone-pale filaments standing in a tight circle.',
    cast: CastShape.ZONE
  },
  cinderveil: {
    label: 'Cinder Veil',
    accent: '#ff8a3c',
    blurb: 'A wide bed of ash-crusted clinker with heat still moving in the cracks.'
  },
  pyreclast: {
    label: 'Pyreclast',
    accent: '#c8804c',
    blurb: 'An enormous pumice bomb lobbed high and slow, shattering completely.'
  },
  sepulcher: {
    label: 'Sepulchre Rift',
    accent: '#a8d0a0',
    blurb: 'Eight holes opened one at a time in a straight line, each with a pale jet.'
  },
  ashmaw: {
    label: 'Ash Maw',
    accent: '#c8b088',
    blurb: 'A wide grey vortex lying flat on the floor, full of dust rather than dark.',
    cast: CastShape.ZONE
  },

  /* --- Stormglass Ascendancy --- */
  tempest: {
    label: 'Tempest Fan',
    accent: '#a87fff',
    blurb: 'A sheet of discharge fanned wide at the hand and never gathered back.'
  },
  arclight: {
    label: 'Arc Light',
    accent: '#8fb4ff',
    blurb: 'A hairline rail across the longest reach in the library, strobing hard.'
  },
  stormglass: {
    label: 'Stormglass Bastion',
    accent: '#9f6bff',
    blurb: 'A palisade of broad black panes around a lit spire, under a heavy curtain.',
    cast: CastShape.ZONE
  },
  dynamo: {
    label: 'Dynamo Coil',
    accent: '#9f7fff',
    blurb: 'A squat rotor of stone turning far too fast to lift anything.',
    cast: CastShape.ZONE
  },
  thunderhead: {
    label: 'Thunderhead',
    accent: '#8f7fd8',
    blurb: 'A storm cell pressed flat over the widest footprint, raining hail inside it.',
    cast: CastShape.ZONE
  },

  /* --- Indigo Synod --- */
  porcelain: {
    label: 'Porcelain Font',
    accent: '#e2ecff',
    blurb: 'A basin of wide flat plates folded inward over a filled middle.',
    cast: CastShape.ZONE
  },
  azurite: {
    label: 'Azurite Horn',
    accent: '#7fa8ff',
    blurb: 'Seven cords leaving the hand as a wide flare and gathering to one point.'
  },
  indigo: {
    label: 'Indigo Vespers',
    accent: '#4a56c8',
    blurb: 'Seven plumb strikes counted out, each leaving a ring that outlives the next four.',
    cast: CastShape.ZONE
  },
  lapis: {
    label: 'Lapis Gyre',
    accent: '#2f5fd0',
    blurb: 'A lit stone hung over the footprint inside a narrow raked belt of ribbons.',
    cast: CastShape.ZONE
  },
  cobalt: {
    label: 'Cobalt Obelisk',
    accent: '#3f8fe8',
    blurb: 'Six heavy members leaned together into a spire, with no rim and no tendrils.',
    cast: CastShape.ZONE
  },

  /* --- Sanguine Assize --- */
  sanguine: {
    label: 'Sanguine Furrow',
    accent: '#a01820',
    blurb: 'The floor split open at once, with two broad sheets of flame lying in the trench.'
  },
  vermilion: {
    label: 'Vermilion Shears',
    accent: '#e8384a',
    blurb: 'Two short arcs cut on crossing planes — the only pair on the engine.'
  },
  garnet: {
    label: 'Garnet Bolide',
    accent: '#b0203c',
    blurb: 'A brilliant-cut stone thrown flat and fast, strobing on its own facets.'
  },
  carnelian: {
    label: 'Carnelian Aegis',
    accent: '#d05828',
    blurb: 'A tall banded ogive closed slowly over the footprint — the one dome that never breaks.',
    cast: CastShape.ZONE
  },
  ferrous: {
    label: 'Ferrous Rose',
    accent: '#8f4030',
    blurb: 'Five iron arms flung overhead and folded all the way back down to the floor.',
    cast: CastShape.ZONE
  },

  /* --- Quicksilver Escapement --- */
  flywheel: {
    label: 'Flywheel Governor',
    accent: '#a8bcd0',
    blurb: 'A squat chrome drum of one diameter, turning at one rate from base to crest.',
    cast: CastShape.ZONE
  },
  quicksilver: {
    label: 'Quicksilver Thread',
    accent: '#e8f0f8',
    blurb: 'A near-solid beam that snakes and beads instead of ruling a straight line.'
  },
  astrolabe: {
    label: 'Astrolabe Ring',
    accent: '#8fa0b8',
    blurb: 'The widest hoop on the engine, held still and clear enough to sight through.',
    cast: CastShape.ZONE
  },
  mercury: {
    label: 'Mercury Rain',
    accent: '#c8d4e0',
    blurb: 'Small round beads of metal coming down fast enough to read as a rate.',
    cast: CastShape.ZONE
  },
  amalgam: {
    label: 'Amalgam Weld',
    accent: '#7f96b0',
    blurb: 'Two dozen fat mirror beads welled up in single file along a narrow seam.'
  },

  /* --- Brimstone Litany --- */
  brimstone: {
    label: 'Brimstone Vents',
    accent: '#e8d24a',
    blurb: 'Five low sulphur vents opening one after another down the line, over gravel.'
  },
  sulphur: {
    label: 'Sulphur Sump',
    accent: '#b8a828',
    blurb: 'A shallow pool of acid light with the ribbons slopping around its rim.',
    cast: CastShape.ZONE
  },
  orpiment: {
    label: 'Orpiment Scythe',
    accent: '#f0a018',
    blurb: 'Nine low strokes cut at ankle height, each rolled to a different plane.'
  },
  fulminate: {
    label: 'Fulminate Whip',
    accent: '#f4c81c',
    blurb: 'One cord, heavy in the hand and tapering to nothing where it cracks down.'
  },
  ochre: {
    label: 'Ochre Pylon',
    accent: '#c08a3a',
    blurb: 'A wide plumb shaft driven into the footprint and left standing.',
    cast: CastShape.ZONE
  },

  /* --- Kinetic Assembly — the first five bolts --- */
  /**
   * Every blurb below says the same two things in different words: what the
   * body *is*, and how it *moves*. Those are the only two facts that matter for
   * a shot you have to lead, and they are what tells the ten apart in flight
   * long before their colour does.
   */
  lancet: {
    label: 'Prism Lancet',
    accent: '#bff0ff',
    blurb: 'A glass needle thrown flat and hard on a hairline wake — the cleanest shot in the library.'
  },
  slagshot: {
    label: 'Slag Mortar',
    accent: '#ff7a2e',
    blurb: 'A tumbling lump of cooling lava lobbed over the top, slow enough to walk past.'
  },
  quill: {
    label: 'Bramble Quill',
    accent: '#9bff5f',
    blurb: 'A barbed thorn corkscrewing downrange — the collision follows the helix, not the line under it.'
  },
  sabot: {
    label: 'Sabot Round',
    accent: '#d8dee8',
    blurb: 'A machined dart at seventy-four metres a second, the fastest body on the engine.'
  },
  chakram: {
    label: 'Gyre Chakram',
    accent: '#7fe8d0',
    blurb: 'A thrown ring flying edge-on, swinging sideways once every metre and a third.'
  },

  /* --- Astral Ordnance — the second five --- */
  novaseed: {
    label: 'Nova Seed',
    accent: '#ffd76a',
    blurb: 'A hot core in two counter-turning cages, rocking up and down as it goes.'
  },
  spindle: {
    label: 'Void Spindle',
    accent: '#b06bff',
    blurb: 'A near-black bipyramid on the widest weave there is, with three slivers in orbit.'
  },
  caltrop: {
    label: 'Astral Caltrop',
    accent: '#8fd0ff',
    blurb: 'A four-spiked crystal star thrown end over end, sweeping a sphere the whole way.'
  },
  harpoon: {
    label: 'Tide Harpoon',
    accent: '#4fd8ff',
    blurb: 'A barbed shaft that sags below the line and comes back up — it can miss underneath.'
  },
  helix: {
    label: 'Helix Fang',
    accent: '#ff6ab0',
    blurb: 'Two blades on one axis at twenty-six radians a second, on a dead straight path.'
  }
};

// Group membership belongs to library presentation, not to a hotkey. The six
// slot keys are owned by `Loadout`, so moving an ability never mutates metadata.
for (const group of ABILITY_GROUPS) {
  for (const element of group.elements) {
    const meta = ELEMENT_META[element];
    if (meta) {
      meta.category = group.id;
      meta.categoryLabel = group.label;
      meta.hint = meta.label;
    }
  }
}
