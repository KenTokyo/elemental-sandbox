import { Vector3 } from 'three';
import { frame } from '../core/FrameUniforms.js';

/**
 * Shared constants and scratch state for the Prism Beam and its five siblings.
 *
 * These sat at the top of the engine file until the 800-line rule in
 * `AGENTS.md` split its emission methods off. They live here so both halves
 * import the *same* objects: `_emit` in particular is one reused parameter bag
 * whose fields are set in pieces between two `emit` calls, so a second copy
 * would emit with values from whichever half wrote last.
 */

/**
 * How many points along the column one frame's sparks are split between. As
 * with the bolt: a single origin makes every batch read as a starburst, and a
 * beam sheds along its whole length.
 */
export const SPARK_BATCHES = 5;

export const TAU = Math.PI * 2;

export const _emit = {};

export const _pos = new Vector3();

export const _dir = new Vector3();

export const _radial = new Vector3();

export const _target = new Vector3();
