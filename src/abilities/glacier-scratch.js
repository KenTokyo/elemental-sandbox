import { InstancedMesh, Vector3 } from 'three';

/**
 * Shared constants and scratch state for the Glacial Spikes and its three siblings.
 *
 * These sat at the top of the engine file until the 800-line rule in
 * `AGENTS.md` split its emission methods off. They live here so both halves
 * import the *same* objects: `_emit` in particular is one reused parameter bag
 * whose fields are set in pieces between two `emit` calls, so a second copy
 * would emit with values from whichever half wrote last.
 */

/** Hard ceiling on shards per cast. The editor's count slider clamps to this. */
export const MAX_SPIKES = 320;

/**
 * Distinct crystal shapes in the crown. Each is its own InstancedMesh — three
 * draw calls buys real silhouette variety that per-instance scaling alone
 * cannot, because the *facets* differ, not just the proportions.
 */
export const VARIANTS = 3;

export const SLOTS = Math.ceil(MAX_SPIKES / VARIANTS);

export const TAU = Math.PI * 2;

/**
 * What a shard is for. The role decides where it stands, how tall it is, which
 * way it leans and — the part that carries the whole cast — *when* it goes up.
 */
export const Role = Object.freeze({
  RING: 0, // the wall of blades on the boundary
  SKIRT: 1, // the broken shards banked against its foot, inside and out
  CORE: 2 // the spire in the middle — off by default, the middle stays clear
});

export const _emit = {};

export const _pos = new Vector3();

export const _dir = new Vector3();
