/** The hotkeys printed on the six loadout slots, in slot order. */
export const LOADOUT_KEYS = Object.freeze(['Q', 'E', 'R', 'F', 'V', 'X']);

export const LOADOUT_SIZE = LOADOUT_KEYS.length;

/**
 * One small mutable loadout shared by the HUD, picker and keyboard.
 *
 * It owns six ordinary ability ids and one callback. The VFX registry decides
 * what exists; this model only decides which six abilities are reachable from
 * the bar right now.
 */
export class Loadout {
  /** @param {string[]} elements ability ids to start with, in slot order */
  constructor(elements) {
    this._slots = elements.slice(0, LOADOUT_SIZE);
    /** @type {((slot:number, element:string, previous:string) => void)|null} */
    this.onChange = null;
  }

  get slots() {
    return this._slots;
  }

  at(slot) {
    return this._slots[slot];
  }

  slotOf(element) {
    return this._slots.indexOf(element);
  }

  has(element) {
    return this._slots.includes(element);
  }

  keyOf(slot) {
    return LOADOUT_KEYS[slot] ?? '';
  }

  /**
   * Put an ability in a slot. An already equipped ability swaps places with the
   * previous occupant instead of appearing twice on the same bar.
   */
  set(slot, element) {
    const previous = this._slots[slot];
    if (previous === undefined || previous === element) return false;

    const held = this._slots.indexOf(element);
    if (held >= 0) this._slots[held] = previous;
    this._slots[slot] = element;

    this.onChange?.(slot, element, previous);
    return true;
  }
}
