import { Vector3 } from 'three';
import { frame } from '../core/FrameUniforms.js';

/**
 * Shared constants and scratch state for the Voltaic Snare and its sibling.
 *
 * These sat at the top of the engine file until the 800-line rule in
 * `AGENTS.md` split its emission methods off. They live here so both halves
 * import the *same* objects: `_emit` in particular is one reused parameter bag
 * whose fields are set in pieces between two `emit` calls, so a second copy
 * would emit with values from whichever half wrote last.
 */

/** How many points one frame's sparks are split between. A single origin reads as a starburst. */
export const SPARK_BATCHES = 5;

/** ... and the same for the updraft, which would otherwise be a rotating hose. */
export const UPDRAFT_BATCHES = 4;

export const TAU = Math.PI * 2;

export const _emit = {};

export const _pos = new Vector3();

export const _dir = new Vector3();
