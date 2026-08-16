/**
 * The training target's readout: one health bar and the numbers coming off it.
 *
 * Drawn in HTML rather than in the scene on purpose. A world-space bar has to
 * be built, billboarded, depth-sorted and re-tessellated for every resolution,
 * and it still ends up softer than text; this is two divs and a transform, it
 * stays pin-sharp at any pixel ratio, and it costs no draw calls in a frame
 * that is already running sixteen particle systems.
 *
 * It knows nothing about combat. `App` projects the effigy's anchor once per
 * frame and hands over screen pixels; the dummy pushes health changes in. The
 * only thing this file decides is what a number looks like on its way up.
 */
const FLOAT_MS = 950;
const MAX_FLOATERS = 14;

export class TargetOverlay {
  constructor(parent = document.body) {
    this.root = document.createElement('div');
    this.root.className = 'target-hud';
    this.root.hidden = true;
    this.root.innerHTML = `
      <div class="target-hud__name" data-name>Proving Effigy</div>
      <div class="target-hud__bar">
        <i class="target-hud__fill" data-fill></i>
        <i class="target-hud__lag" data-lag></i>
      </div>
      <div class="target-hud__numbers" data-numbers>1500 / 1500</div>
    `;

    this.layer = document.createElement('div');
    this.layer.className = 'damage-layer';

    parent.appendChild(this.root);
    parent.appendChild(this.layer);

    this.name = this.root.querySelector('[data-name]');
    this.fill = this.root.querySelector('[data-fill]');
    this.lag = this.root.querySelector('[data-lag]');
    this.numbers = this.root.querySelector('[data-numbers]');

    this._shown = -1;
    this._lagRatio = 1;
    this._timers = new Set();
  }

  /**
   * Move the panel. Coordinates are CSS pixels from the top-left of the canvas.
   * `visible` is false when the anchor is behind the camera or off screen.
   */
  place(x, y, visible) {
    if (!visible) {
      if (!this.root.hidden) this.root.hidden = true;
      return;
    }
    if (this.root.hidden) this.root.hidden = false;
    this.root.style.transform = `translate(-50%, -100%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  }

  setHealth(current, max) {
    const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
    if (Math.abs(ratio - this._shown) < 0.0005) return;
    this._shown = ratio;

    this.fill.style.width = `${(ratio * 100).toFixed(2)}%`;
    this.numbers.textContent = `${Math.round(current)} / ${Math.round(max)}`;
    this.root.classList.toggle('is-low', ratio > 0 && ratio <= 0.25);
    this.root.classList.toggle('is-empty', ratio <= 0);
  }

  /**
   * The lag bar: the pale strip that catches up to the red one over the next
   * few tenths of a second, so the *size* of a hit is legible after the hit is
   * over. Driven from the frame loop rather than by a CSS transition, because a
   * transition would restart on every re-render of the bar.
   */
  update(dt, ratio) {
    if (this._lagRatio < ratio) this._lagRatio = ratio; // refills instantly
    else this._lagRatio = Math.max(ratio, this._lagRatio - dt * 0.55);
    this.lag.style.width = `${(this._lagRatio * 100).toFixed(2)}%`;
  }

  setDefeated(defeated) {
    this.root.classList.toggle('is-defeated', defeated);
    this.name.textContent = defeated ? 'Proving Effigy — reassembling' : 'Proving Effigy';
  }

  /** One damage number, thrown up from the contact point. */
  popDamage(amount, x, y) {
    if (this.layer.childElementCount >= MAX_FLOATERS) {
      this.layer.firstElementChild?.remove();
    }

    const node = document.createElement('span');
    node.className = 'damage-float';
    node.textContent = `−${Math.round(amount)}`;
    // A little scatter, so two hits in the same place do not stack into one
    // unreadable glyph.
    const drift = (Math.random() - 0.5) * 46;
    node.style.left = `${(x + drift).toFixed(1)}px`;
    node.style.top = `${y.toFixed(1)}px`;
    this.layer.appendChild(node);

    const timer = setTimeout(() => {
      node.remove();
      this._timers.delete(timer);
    }, FLOAT_MS);
    this._timers.add(timer);
  }

  /** Called when the target goes down: one word where the numbers were. */
  popDefeat(x, y) {
    const node = document.createElement('span');
    node.className = 'damage-float is-defeat';
    node.textContent = 'DOWN';
    node.style.left = `${x.toFixed(1)}px`;
    node.style.top = `${y.toFixed(1)}px`;
    this.layer.appendChild(node);

    const timer = setTimeout(() => {
      node.remove();
      this._timers.delete(timer);
    }, FLOAT_MS + 350);
    this._timers.add(timer);
  }

  dispose() {
    for (const timer of this._timers) clearTimeout(timer);
    this._timers.clear();
    this.root.remove();
    this.layer.remove();
  }
}
