import { Vector3, Quaternion } from 'three';

/**
 * Shared scratch for the bolt engine, exactly as `meteor-scratch.js` does it.
 *
 * `BoltAbility` and its two prototype mixins are one class split across three
 * files under the 800-line rule in `AGENTS.md`, so the reusable vectors have to
 * live somewhere all three can reach. Nothing here is state — every one of them
 * is written before it is read, inside the method that borrows it.
 */

/** How many points the trail ribbon is sampled at. */
export const TRAIL_NODES = 28;

/** Hard ceiling on collision substeps per frame, so a stall cannot lock up. */
export const MAX_SUBSTEPS = 64;

export const _from = new Vector3();
export const _to = new Vector3();
export const _pos = new Vector3();
export const _heading = new Vector3();
export const _ahead = new Vector3();
export const _behind = new Vector3();
export const _dir = new Vector3();
export const _mark = new Vector3();
export const _quat = new Quaternion();

/** One reused emit record, so a frame of trail particles allocates nothing. */
export const _emit = {};
