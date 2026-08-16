import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  Mesh,
  OctahedronGeometry,
  SphereGeometry,
  TetrahedronGeometry,
  TorusGeometry,
  Vector3
} from 'three';
import { createAsteroidGeometry } from '../assets/ProceduralGeometry.js';
import { LAYER } from '../core/Layers.js';

/**
 * The ten bodies — what is actually flying through the air.
 *
 * Every one is assembled here once, at construction, out of primitives and (for
 * the mortar) one generated asteroid. They are the single most important thing
 * about this batch: ten shots that differ only in colour are one shot, and the
 * brief the whole group was built to is *silhouette first*. So the set spans a
 * needle, a boulder, a thorn, a machined dart, a ring, a caged core, a
 * bipyramid, a four-spiked star, a harpoon with beads behind it and two blades
 * on a shared axis — no two of which can be confused at a glance, in motion, at
 * any distance.
 *
 * Three conventions hold the file together:
 *
 *  - **Everything is built along +Z**, nose forward. `BoltAbility` turns the
 *    group onto the heading with one `setFromUnitVectors`, so a builder never
 *    has to know which way the shot went.
 *  - **Four shared materials.** The engine owns them and syncs them from the
 *    live settings block every frame, so a colour dragged in the editor moves
 *    on a body already in the air. Builders only decide which part gets which.
 *  - **`animate(age, wobble)` is the secondary motion only.** The gross motion
 *    — the roll about the heading and the end-over-end tumble — belongs to the
 *    engine and is applied to the whole group; what happens *here* is cages
 *    counter-turning, satellites orbiting, beads swinging behind the head.
 *
 * One consequence of the engine's `bodySize`/`bodyStretch` scale being applied
 * to the group: a child rotated about an axis other than Z is sheared by a
 * `bodyStretch` other than 1. That is why the parts that carry a live rotation
 * — cages, orbits, blade helices — all turn about Z, and the parts pitched onto
 * other axes — barbs, spikes, fins — are static. The shear then simply becomes
 * part of the sculpt, and it is the same on every frame.
 */

const FORWARD = new Vector3(0, 0, 1);
const UP = new Vector3(0, 1, 0);
const _axis = new Vector3();

/** A solid part: takes the stage's shadows and its probe. */
function solid(geometry, material) {
  const mesh = new Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.layers.set(LAYER.WORLD);
  mesh.renderOrder = 2;
  return mesh;
}

/** An additive part: the core and the halo. */
function lit(geometry, material, order = 13) {
  const mesh = new Mesh(geometry, material);
  mesh.layers.set(LAYER.VFX);
  mesh.renderOrder = order;
  return mesh;
}

/** A cone whose apex points along +Z (three builds them pointing at +Y). */
function spike(radius, length, segments, material) {
  const mesh = solid(new ConeGeometry(radius, length, segments), material);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

/**
 * Build one body.
 *
 * @param {string} shape one of the ten ids in `BUILDERS`
 * @param {{body: Material, edge: Material, core: Material, shell: Material}} materials
 * @returns {{group: Group, core: Mesh|null, shell: Mesh|null, animate: (age:number, wobble:number) => void}}
 */
export function createBoltBody(shape, materials) {
  const build = BUILDERS[shape] ?? BUILDERS.lancet;
  const group = new Group();
  group.name = `BoltBody:${shape}`;
  const parts = build(group, materials);
  return {
    group,
    core: parts.core ?? null,
    shell: parts.shell ?? null,
    animate: parts.animate ?? (() => {})
  };
}

/** Every geometry a body owns, for teardown. */
export function disposeBoltBody(body) {
  body.group.traverse((node) => node.geometry?.dispose?.());
}

const BUILDERS = {
  /* ---------------------------------------------------------------- *
   * PRISM LANCET — a four-sided glass needle with a fin cluster
   * ---------------------------------------------------------------- */
  lancet(group, m) {
    const head = spike(0.17, 0.62, 4, m.body);
    head.position.z = 0.5;
    const shaft = spike(0.17, 0.92, 4, m.body);
    shaft.rotation.x = -Math.PI / 2; // apex pointing back: a long tapered tail
    shaft.position.z = -0.27;
    group.add(head, shaft);

    // Four fins on the diagonals, swept back. Static, so the stretch shear is
    // part of the shape rather than something that moves.
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const fin = solid(new BoxGeometry(0.014, 0.2, 0.42), m.edge);
      fin.position.set(Math.cos(angle) * 0.13, Math.sin(angle) * 0.13, -0.16);
      fin.rotation.z = angle;
      group.add(fin);
    }

    const core = lit(new SphereGeometry(1, 14, 10), m.core);
    core.position.z = 0.12;
    const shell = lit(new OctahedronGeometry(1, 1), m.shell, 11);
    shell.scale.set(1, 1, 2.4);
    group.add(core, shell);

    return { core, shell };
  },

  /* ---------------------------------------------------------------- *
   * SLAG MORTAR — a real cratered rock with two shards driven into it
   * ---------------------------------------------------------------- */
  boulder(group, m) {
    const rock = solid(
      createAsteroidGeometry({
        seed: 4.7,
        detail: 2,
        lumpiness: 0.3,
        noiseScale: 1.7,
        roughness: 0.22,
        cuts: 8,
        cutDepth: 0.3,
        craters: 5,
        craterDepth: 0.22,
        craterSize: 0.55
      }),
      m.body
    );
    group.add(rock);

    // Two glowing wedges, so the tumble is legible on a shape that is otherwise
    // rotationally ambiguous.
    const shards = [];
    for (let i = 0; i < 2; i++) {
      const shard = solid(new TetrahedronGeometry(0.42, 0), m.edge);
      const angle = i * 2.1 + 0.6;
      shard.position.set(Math.cos(angle) * 0.72, Math.sin(angle) * 0.5, i === 0 ? 0.55 : -0.6);
      shard.rotation.set(angle, angle * 1.7, angle * 0.4);
      group.add(shard);
      shards.push(shard);
    }

    const core = lit(new SphereGeometry(1, 12, 8), m.core);
    const shell = lit(new IcosahedronGeometry(1, 1), m.shell, 11);
    group.add(core, shell);

    return {
      core,
      shell,
      animate: (age, wobble) => {
        // The wedges breathe out of the seams rather than sitting flush.
        const push = 1 + Math.sin(age * 5.5) * 0.06 * (1 + wobble);
        for (const shard of shards) shard.scale.setScalar(push);
      }
    };
  },

  /* ---------------------------------------------------------------- *
   * BRAMBLE QUILL — a thorn with six barbs raked backwards
   * ---------------------------------------------------------------- */
  quill(group, m) {
    const head = spike(0.13, 1.5, 6, m.body);
    head.position.z = 0.24;
    const tail = spike(0.13, 0.55, 6, m.body);
    tail.rotation.x = -Math.PI / 2;
    tail.position.z = -0.78;
    group.add(head, tail);

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const along = 0.46 - i * 0.13;
      const barb = new Mesh(new ConeGeometry(0.07, 0.3, 4), m.edge);
      barb.castShadow = true;
      barb.layers.set(LAYER.WORLD);
      barb.position.set(Math.cos(angle) * 0.11, Math.sin(angle) * 0.11, along);
      // Pitched back down the shaft, then rolled onto its own bearing.
      barb.rotation.set(-2.35, 0, angle + Math.PI / 2);
      group.add(barb);
    }

    const core = lit(new SphereGeometry(1, 12, 8), m.core);
    core.position.z = 0.3;
    const shell = lit(new OctahedronGeometry(1, 0), m.shell, 11);
    shell.scale.set(1, 1, 2.0);
    group.add(core, shell);

    return { core, shell };
  },

  /* ---------------------------------------------------------------- *
   * SABOT ROUND — nose, body, fin ring, hot tracer at the base
   * ---------------------------------------------------------------- */
  sabot(group, m) {
    const nose = spike(0.15, 0.46, 12, m.body);
    nose.position.z = 0.52;

    const barrel = solid(new CylinderGeometry(0.15, 0.15, 0.74, 12, 1), m.body);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = 0.06;

    // A torus is built around +Z already, which is the heading — no rotation.
    const collar = solid(new TorusGeometry(0.19, 0.035, 6, 18), m.edge);
    collar.position.z = -0.36;
    group.add(nose, barrel, collar);

    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const fin = solid(new BoxGeometry(0.022, 0.24, 0.3), m.edge);
      fin.position.set(Math.cos(angle) * 0.16, Math.sin(angle) * 0.16, -0.34);
      fin.rotation.z = angle;
      group.add(fin);
    }

    const core = lit(new SphereGeometry(1, 12, 8), m.core);
    core.position.z = -0.5; // the tracer burns at the back, not the tip
    const shell = lit(new OctahedronGeometry(1, 1), m.shell, 11);
    shell.scale.set(1, 1, 1.8);
    group.add(core, shell);

    return { core, shell };
  },

  /* ---------------------------------------------------------------- *
   * GYRE CHAKRAM — a ring flying face-on, spinning in its own plane
   * ---------------------------------------------------------------- */
  chakram(group, m) {
    // The engine's roll is about the heading, and a torus's axis is +Z, so the
    // ring spins in its own plane with no extra frame — which is exactly the
    // motion a thrown ring has and the reason this shape is oriented this way.
    const ring = solid(new TorusGeometry(0.62, 0.075, 10, 44), m.body);
    const rim = solid(new TorusGeometry(0.62, 0.03, 6, 44), m.edge);
    rim.scale.setScalar(1.09);
    group.add(ring, rim);

    const blades = [];
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const blade = solid(new BoxGeometry(0.46, 0.07, 0.03), m.edge);
      blade.position.set(Math.cos(angle) * 0.32, Math.sin(angle) * 0.32, 0);
      blade.rotation.z = angle;
      group.add(blade);
      blades.push(blade);
    }

    const hub = solid(new OctahedronGeometry(0.17, 0), m.body);
    group.add(hub);

    const core = lit(new SphereGeometry(1, 12, 8), m.core);
    const shell = lit(new TorusGeometry(0.62, 0.2, 8, 30), m.shell, 11);
    group.add(core, shell);

    return {
      core,
      shell,
      animate: (age, wobble) => {
        // The blades slide in and out of the rim, which is the only thing that
        // stops a fast-spinning ring reading as a static disc.
        const reach = 1 + Math.sin(age * 7.5) * 0.08 * (1 + wobble * 2);
        for (const blade of blades) blade.scale.x = reach;
        hub.rotation.z = -age * 3.0;
      }
    };
  },

  /* ---------------------------------------------------------------- *
   * NOVA SEED — a core inside two counter-turning armillary cages
   * ---------------------------------------------------------------- */
  novaseed(group, m) {
    const seed = solid(new IcosahedronGeometry(0.36, 1), m.edge);
    group.add(seed);

    /**
     * Three hoops on the three axes = a cage you can see the core through.
     *
     * The locals are named for their planes rather than `a`/`b`/`c` on purpose:
     * `tools/audit-settings-keys.mjs` reads a bare `c.` as a settings access, and
     * this file is scanned as part of `BoltAbility`.
     */
    const cage = (radius, tube, material) => {
      const shell = new Group();
      const hoopXY = solid(new TorusGeometry(radius, tube, 6, 34), material);
      const hoopXZ = solid(new TorusGeometry(radius, tube, 6, 34), material);
      hoopXZ.rotation.x = Math.PI / 2;
      const hoopYZ = solid(new TorusGeometry(radius, tube, 6, 34), material);
      hoopYZ.rotation.y = Math.PI / 2;
      shell.add(hoopXY, hoopXZ, hoopYZ);
      return shell;
    };

    const inner = cage(0.6, 0.028, m.body);
    const outer = cage(0.82, 0.02, m.edge);
    outer.rotation.set(0.6, 0.4, 0);
    group.add(inner, outer);

    const core = lit(new SphereGeometry(1, 16, 12), m.core);
    const shell = lit(new IcosahedronGeometry(1, 1), m.shell, 11);
    group.add(core, shell);

    return {
      core,
      shell,
      animate: (age, wobble) => {
        inner.rotation.z = age * 2.4;
        outer.rotation.z = -age * 1.7;
        seed.rotation.set(age * 1.3, age * 0.9, 0);
        seed.scale.setScalar(1 + Math.sin(age * 6.2) * 0.16 * (1 + wobble));
      }
    };
  },

  /* ---------------------------------------------------------------- *
   * VOID SPINDLE — an elongated bipyramid with three satellites
   * ---------------------------------------------------------------- */
  spindle(group, m) {
    // An octahedron has its vertices on the axes, so scaling Z alone turns it
    // into a clean bipyramid with no seam anywhere on the silhouette.
    const body = solid(new OctahedronGeometry(0.5, 0), m.body);
    body.scale.set(0.78, 0.78, 2.1);
    const rim = solid(new OctahedronGeometry(0.5, 0), m.edge);
    rim.scale.set(0.84, 0.84, 2.0);
    group.add(body, rim);

    const orbit = new Group();
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const sliver = solid(new TetrahedronGeometry(0.14, 0), m.edge);
      sliver.position.set(Math.cos(angle) * 0.44, Math.sin(angle) * 0.44, -0.1 - i * 0.16);
      orbit.add(sliver);
    }
    group.add(orbit);

    const core = lit(new SphereGeometry(1, 12, 8), m.core);
    const shell = lit(new OctahedronGeometry(1, 1), m.shell, 11);
    shell.scale.set(1, 1, 2.2);
    group.add(core, shell);

    return {
      core,
      shell,
      animate: (age, wobble) => {
        orbit.rotation.z = age * 3.2;
        orbit.scale.setScalar(1 + Math.sin(age * 4.4) * 0.12 * (1 + wobble));
      }
    };
  },

  /* ---------------------------------------------------------------- *
   * ASTRAL CALTROP — four spikes on the tetrahedral directions
   * ---------------------------------------------------------------- */
  caltrop(group, m) {
    const hub = solid(new IcosahedronGeometry(0.3, 0), m.body);
    group.add(hub);

    const directions = [
      [1, 1, 1],
      [1, -1, -1],
      [-1, 1, -1],
      [-1, -1, 1]
    ];
    for (const [x, y, z] of directions) {
      _axis.set(x, y, z).normalize();
      const point = new Mesh(new ConeGeometry(0.14, 0.78, 5), m.edge);
      point.castShadow = true;
      point.layers.set(LAYER.WORLD);
      point.quaternion.setFromUnitVectors(UP, _axis);
      point.position.copy(_axis).multiplyScalar(0.42);
      group.add(point);
    }

    const core = lit(new SphereGeometry(1, 12, 8), m.core);
    const shell = lit(new IcosahedronGeometry(1, 0), m.shell, 11);
    group.add(core, shell);

    return {
      core,
      shell,
      animate: (age, wobble) => {
        hub.scale.setScalar(1 + Math.sin(age * 8.0) * 0.1 * (1 + wobble));
      }
    };
  },

  /* ---------------------------------------------------------------- *
   * TIDE HARPOON — a barbed head with four beads paying out behind it
   * ---------------------------------------------------------------- */
  harpoon(group, m) {
    const shaft = solid(new CylinderGeometry(0.06, 0.06, 1.5, 8, 1), m.body);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.z = -0.1;

    const head = spike(0.17, 0.52, 4, m.edge);
    head.position.z = 0.86;
    group.add(shaft, head);

    for (const side of [-1, 1]) {
      const barb = new Mesh(new ConeGeometry(0.08, 0.34, 4), m.edge);
      barb.castShadow = true;
      barb.layers.set(LAYER.WORLD);
      barb.position.set(side * 0.14, 0, 0.56);
      barb.rotation.set(-2.5, 0, side * 0.3);
      group.add(barb);
    }

    // The beads are the signature: a chain of four falling behind the head,
    // swinging on the wake rather than rigidly bolted to the shaft.
    const beads = [];
    const sizes = [0.11, 0.09, 0.07, 0.05];
    for (let i = 0; i < sizes.length; i++) {
      const bead = lit(new SphereGeometry(sizes[i], 12, 8), m.core, 13);
      bead.position.z = -0.95 - i * 0.24;
      group.add(bead);
      beads.push(bead);
    }

    const core = lit(new SphereGeometry(1, 12, 8), m.core);
    core.position.z = 0.78;
    const shell = lit(new OctahedronGeometry(1, 0), m.shell, 11);
    shell.scale.set(1, 1, 2.3);
    group.add(core, shell);

    return {
      core,
      shell,
      animate: (age, wobble) => {
        for (let i = 0; i < beads.length; i++) {
          const phase = age * 7.0 - i * 0.8;
          const swing = wobble * 0.16 * (0.4 + i * 0.25);
          beads[i].position.x = Math.sin(phase) * swing;
          beads[i].position.y = Math.cos(phase * 0.8) * swing * 0.6;
        }
      }
    };
  },

  /* ---------------------------------------------------------------- *
   * HELIX FANG — two blade columns twisting around one axle
   * ---------------------------------------------------------------- */
  helix(group, m) {
    const axle = solid(new CylinderGeometry(0.055, 0.055, 1.5, 8, 1), m.body);
    axle.rotation.x = Math.PI / 2;
    group.add(axle);

    // Each blade is six plates stepping along Z, every one rolled a little
    // further than the last: a discrete helix, and the only way to get a real
    // twist out of primitives without a custom mesh.
    const plates = [];
    for (let strand = 0; strand < 2; strand++) {
      for (let i = 0; i < 6; i++) {
        const angle = strand * Math.PI + i * 0.58;
        const plate = solid(new BoxGeometry(0.36, 0.05, 0.17), strand === 0 ? m.body : m.edge);
        plate.position.set(Math.cos(angle) * 0.18, Math.sin(angle) * 0.18, -0.6 + i * 0.24);
        plate.rotation.z = angle;
        group.add(plate);
        plates.push(plate);
      }
    }

    const core = lit(new SphereGeometry(1, 12, 8), m.core);
    core.position.z = 0.55;
    const shell = lit(new OctahedronGeometry(1, 1), m.shell, 11);
    shell.scale.set(1, 1, 1.9);
    group.add(core, shell);

    return {
      core,
      shell,
      animate: (age, wobble) => {
        // The plates open and close along the strand, so the helix reads as
        // something being driven rather than a fixed screw.
        for (let i = 0; i < plates.length; i++) {
          plates[i].scale.x = 1 + Math.sin(age * 9.0 - i * 0.5) * 0.14 * (1 + wobble);
        }
      }
    };
  }
};

export { FORWARD as BOLT_FORWARD };
