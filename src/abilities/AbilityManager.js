import { IceAbility } from './IceAbility.js';
import { ThunderAbility } from './ThunderAbility.js';
import { MeteorAbility } from './MeteorAbility.js';
import { BeamAbility } from './BeamAbility.js';
import { SnareAbility } from './SnareAbility.js';
import { GlacierAbility } from './GlacierAbility.js';
import { CycloneAbility } from './CycloneAbility.js';
import { GateAbility } from './GateAbility.js';
import { DomeAbility } from './DomeAbility.js';
import { SpearAbility } from './SpearAbility.js';
import { RiftAbility } from './RiftAbility.js';
import { WellAbility } from './WellAbility.js';
import { BloomAbility } from './BloomAbility.js';
import { BladesAbility } from './BladesAbility.js';
import { RainAbility } from './RainAbility.js';
import { BoltAbility } from './BoltAbility.js';
import { ELEMENTS } from '../config/settings.js';
import { ObjectPool } from '../utils/ObjectPool.js';

/** Ordinary ability id → engine class. */
const ABILITY_TYPES = {
  ice: IceAbility,
  thunder: ThunderAbility,
  meteor: MeteorAbility,
  beam: BeamAbility,
  snare: SnareAbility,
  glacier: GlacierAbility,
  permafrost: IceAbility,
  cyclone: CycloneAbility,
  gate: GateAbility,
  zero: DomeAbility,
  solar: SpearAbility,
  magma: RiftAbility,
  gravity: WellAbility,
  voidrail: BeamAbility,
  plasma: BloomAbility,
  verdant: IceAbility,
  sandstorm: CycloneAbility,
  tidal: GlacierAbility,
  blades: BladesAbility,
  rain: RainAbility,

  // The twenty V3.1 signatures. Each one runs on the engine its settings block
  // was derived from — an id missing here is not an error, it is an ability
  // that appears in the picker and silently never casts.
  anvil: SpearAbility,
  emberspire: CycloneAbility,
  emberreap: BladesAbility,
  aperture: GateAbility,
  chorus: BeamAbility,
  comet: MeteorAbility,
  rimefault: RiftAbility,
  quartz: GlacierAbility,
  maelstrom: CycloneAbility,
  aurora: DomeAbility,
  eclipse: BeamAbility,
  singularity: WellAbility,
  nightshade: BloomAbility,
  gravebind: SnareAbility,
  duskweave: ThunderAbility,
  abyssal: GlacierAbility,
  deluge: RainAbility,
  obsidian: IceAbility,
  tarfall: MeteorAbility,
  brine: IceAbility,

  // The twenty V3.2 signatures. Same rule, and the distribution is deliberate:
  // no engine picks up more than two, so every pair of siblings on one engine
  // stays far enough apart to be told apart.
  bellrose: DomeAbility,
  censer: CycloneAbility,
  orrery: GateAbility,
  verdigris: IceAbility,
  pendulum: SpearAbility,
  prism: GlacierAbility,
  refraction: BladesAbility,
  lumen: BeamAbility,
  halation: BloomAbility,
  caustic: RainAbility,
  ossuary: SnareAbility,
  cinderveil: IceAbility,
  pyreclast: MeteorAbility,
  sepulcher: RiftAbility,
  ashmaw: WellAbility,
  tempest: ThunderAbility,
  arclight: BeamAbility,
  stormglass: GlacierAbility,
  dynamo: CycloneAbility,
  thunderhead: DomeAbility,

  // The twenty V3.3 signatures. Five engines take a second id here — thunder,
  // rain, well, rift and blades, the five that were thinnest on three — and
  // the two siblings of each are put in *different* picker groups, so a pair
  // sharing an engine never sits next to itself in the palette either.
  porcelain: GlacierAbility,
  azurite: ThunderAbility,
  indigo: RainAbility,
  lapis: WellAbility,
  cobalt: SnareAbility,
  sanguine: RiftAbility,
  vermilion: BladesAbility,
  garnet: MeteorAbility,
  carnelian: DomeAbility,
  ferrous: BloomAbility,
  flywheel: CycloneAbility,
  quicksilver: BeamAbility,
  astrolabe: GateAbility,
  mercury: RainAbility,
  amalgam: IceAbility,
  brimstone: RiftAbility,
  sulphur: WellAbility,
  orpiment: BladesAbility,
  fulminate: ThunderAbility,
  ochre: SpearAbility,

  // The ten V4 bolts. The only ids in this table that do *not* share an engine
  // with anything above: `BoltAbility` is the first ability in the project whose
  // impact is a collision rather than a point on a timeline, so it could not be
  // derived from any of the fifteen. All ten run on it, and their whole
  // difference lives in their settings blocks and their bodies.
  lancet: BoltAbility,
  slagshot: BoltAbility,
  quill: BoltAbility,
  sabot: BoltAbility,
  chakram: BoltAbility,
  novaseed: BoltAbility,
  spindle: BoltAbility,
  caltrop: BoltAbility,
  harpoon: BoltAbility,
  helix: BoltAbility
};

const MAX_CONCURRENT = 3;

/** Spawns, updates and recycles abilities without a catalogue adapter layer. */
export class AbilityManager {
  constructor(context) {
    this.ctx = context;
    this.active = [];
    this.selected = ELEMENTS[0];
    this.warmed = new Set();

    this.pools = new Map();
    for (const [element, Type] of Object.entries(ABILITY_TYPES)) {
      this.pools.set(
        element,
        new ObjectPool(() => {
          // Several ids intentionally share one engine class; the element tells
          // that engine which settings block and material palette to read.
          const ability = new Type(this.ctx, element);
          this.ctx.scene.add(ability.group);
          ability.group.visible = false;
          return ability;
        })
      );
    }
  }

  select(element) {
    if (!ABILITY_TYPES[element]) return;
    this.selected = element;
    this.warm(element);
  }

  /** Allocate one pooled instance when an ability is selected, not mid-cast. */
  warm(element) {
    const pool = this.pools.get(element);
    if (!pool || this.warmed.has(element)) return;
    this.warmed.add(element);
    pool.release(pool.acquire());
  }

  cast(origin, direction, distance, element = this.selected) {
    const pool = this.pools.get(element);
    if (!pool) return null;

    if (this.active.length >= MAX_CONCURRENT) {
      const oldest = this.active.shift();
      oldest.destroy();
      this.pools.get(oldest.element).release(oldest);
    }

    const ability = pool.acquire();
    ability.spawn(origin, direction, distance);
    this.active.push(ability);
    return ability;
  }

  update(dt) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const ability = this.active[i];
      ability.update(dt);
      if (ability.isFinished) {
        this.active.splice(i, 1);
        ability.destroy();
        this.pools.get(ability.element).release(ability);
      }
    }
  }

  clear() {
    for (const ability of this.active) {
      ability.destroy();
      this.pools.get(ability.element).release(ability);
    }
    this.active.length = 0;
  }

  get focus() {
    for (let i = this.active.length - 1; i >= 0; i--) {
      if (this.active[i].isActive) return this.active[i];
    }
    return null;
  }

  dispose() {
    this.clear();
    for (const pool of this.pools.values()) pool.dispose((ability) => ability.dispose());
    this.pools.clear();
    this.warmed.clear();
  }
}
