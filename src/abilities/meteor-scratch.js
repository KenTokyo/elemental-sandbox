import { Vector3 } from 'three';
import { frame } from '../core/FrameUniforms.js';

/**
 * Shared constants and scratch state for the Meteor Strike and its two siblings.
 *
 * These sat at the top of the engine file until the 800-line rule in
 * `AGENTS.md` split its emission methods off. They live here so both halves
 * import the *same* objects: `_emit` in particular is one reused parameter bag
 * whose fields are set in pieces between two `emit` calls, so a second copy
 * would emit with values from whichever half wrote last.
 */

/** Hard ceiling on debris chunks. The editor's `chunkCount` slider clamps here. */
export const MAX_CHUNKS = 28;

/** Instance 0 is the meteor; 1.. are the chunks it breaks into. */
export const SLOTS = MAX_CHUNKS + 1;

/** How many points along the frame's travel the particle trail is split between. */
export const TRAIL_BATCHES = 3;

/**
 * Samples along the centre line of the flame's proxy hull. The trail is
 * *derived* from the arc rather than recorded, so this is purely how finely the
 * hull is tessellated.
 */
export const TRAIL_NODES = 48;

export const _emit = {};

export const _pos = new Vector3();

export const _dir = new Vector3();

export const _back = new Vector3();

export const _heading = new Vector3();

export const _impact = new Vector3();
