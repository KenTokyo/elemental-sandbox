import { ELEMENT_META, CastShape, castShapeOf } from '../config/settings.js';
import { sigilFor } from './glyphs.js';
import { LOADOUT_KEYS } from './Loadout.js';

/**
 * Heads-up display with one compact six-slot loadout bar.
 *
 * The bar mirrors the reference VFX library: six glass cards at the bottom,
 * while the `L` picker owns loadout editing. Growing the library never widens
 * the HUD because only equipped abilities are rendered here.
 */
export class HUD {
  /**
   * @param {HTMLElement} root
   * @param {import('./Loadout.js').Loadout} loadout
   */
  constructor(root, loadout) {
    this.root = root;
    this.loadout = loadout;
    this.onAbility = null;
    this._toastTimer = 0;
    this._statsAccumulator = 0;
    this._frames = 0;
    this._fps = 0;
    this._cooldownShown = new Map();
    this._armedShown = null;
    this._activeShown = null;

    root.innerHTML = `
      <div class="hud__panel hud__title">
        Elemental Sandbox
        <span data-blurb>Press ${LOADOUT_KEYS.join(', ')}, aim, click to cast.</span>
      </div>

      <div class="hud__panel hud__stats">
        <div>FPS <b data-stat="fps">—</b></div>
        <div>Particles <b data-stat="particles">0</b></div>
        <div>Instances <b data-stat="spikes">0</b></div>
        <div>Draw calls <b data-stat="calls">0</b></div>
      </div>

      <div class="hud__panel hud__help">
        <div data-legend>${this._legendHTML()}</div>
        <div class="hud__help-note">◎ far cast — aimed with a circle, not an arrow.</div>
        <div><strong>Move</strong> — aim &nbsp; <strong>Left click</strong> — cast</div>
        <div><strong>Esc / right click</strong> — cancel the cast</div>
        <div><strong>Right drag</strong> — orbit &nbsp; <strong>Scroll</strong> — zoom</div>
        <div style="margin-top:6px">
          <kbd>L</kbd> loadout &nbsp; <kbd>G</kbd> editor &nbsp; <kbd>P</kbd> pause &nbsp; <kbd>C</kbd> clear
        </div>
        <div><kbd>H</kbd> hide this</div>
        <div class="hud__help-note">Paused still applies every editor change.</div>
      </div>

      <div class="hud__abilities">${this._cardsHTML()}</div>

      <div class="hud__toast" data-toast></div>
      <div class="hud__paused" data-paused>Paused</div>
    `;

    this.stats = {
      fps: root.querySelector('[data-stat="fps"]'),
      particles: root.querySelector('[data-stat="particles"]'),
      spikes: root.querySelector('[data-stat="spikes"]'),
      calls: root.querySelector('[data-stat="calls"]')
    };
    this.help = root.querySelector('.hud__help');
    this.legend = root.querySelector('[data-legend]');
    this.toast = root.querySelector('[data-toast]');
    this.pausedBadge = root.querySelector('[data-paused]');
    this.abilityBar = root.querySelector('.hud__abilities');
    this.blurb = root.querySelector('[data-blurb]');

    this.cards = new Map();
    this._bindCards();
  }

  _cardsHTML() {
    return this.loadout.slots
      .map((element, slot) => {
        const meta = ELEMENT_META[element] ?? {};
        const zone = castShapeOf(element) === CastShape.ZONE;
        return `
          <button class="ability-card" type="button" data-element="${element}"
                  style="--accent:${meta.accent}" aria-label="Select ${meta.label ?? element}">
            <span class="ability-card__sweep" data-sweep></span>
            <span class="ability-card__key">${this.loadout.keyOf(slot)}</span>
            ${zone ? '<span class="ability-card__cast" title="far cast">◎</span>' : ''}
            <span class="ability-card__glyph">${sigilFor(element)}</span>
            <span class="ability-card__label">${meta.label ?? element}</span>
          </button>`;
      })
      .join('');
  }

  _legendHTML() {
    return this.loadout.slots
      .map((element, slot) => {
        const meta = ELEMENT_META[element] ?? {};
        const far = castShapeOf(element) === CastShape.ZONE ? ' ◎' : '';
        return `<div><strong>${this.loadout.keyOf(slot)}</strong> — ${meta.label ?? element}${far}</div>`;
      })
      .join('');
  }

  _bindCards() {
    this.cards.clear();
    for (const card of this.abilityBar.querySelectorAll('.ability-card')) {
      this.cards.set(card.dataset.element, card);
      card.addEventListener('click', (event) => {
        event.stopPropagation();
        this.onAbility?.(card.dataset.element);
      });
    }
  }

  refresh(active = this._activeShown) {
    this.abilityBar.innerHTML = this._cardsHTML();
    this.legend.innerHTML = this._legendHTML();
    this._cooldownShown.clear();
    this._bindCards();
    if (active) this.setElement(active, { silent: true });
  }

  setElement(element, options = {}) {
    this._activeShown = element;
    for (const [key, card] of this.cards) {
      card.classList.toggle('is-active', key === element);
    }
    const meta = ELEMENT_META[element];
    if (!meta) return;
    this.blurb.textContent = meta.blurb;
    if (!options.silent) this.showToast(`${meta.label} selected`);
  }

  setArmed(armed) {
    if (armed === this._armedShown) return;
    this._armedShown = armed;
    this.abilityBar.classList.toggle('is-armed', armed);
  }

  setCooldown(element, remaining, total) {
    const card = this.cards.get(element);
    if (!card) return;

    const ratio = Math.max(0, Math.min(1, remaining / Math.max(total, 0.001)));
    if (Math.abs(ratio - (this._cooldownShown.get(element) ?? -1)) < 0.01) return;
    this._cooldownShown.set(element, ratio);
    card.style.setProperty('--cooldown', ratio);
    card.classList.toggle('is-cooling', ratio > 0.001);
  }

  setPaused(paused) {
    this.pausedBadge.classList.toggle('is-visible', paused);
  }

  toggleHelp() {
    this.help.classList.toggle('is-hidden');
  }

  showToast(message, duration = 1600) {
    this.toast.textContent = message;
    this.toast.classList.add('is-visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.toast.classList.remove('is-visible'), duration);
  }

  update(dt, collect) {
    this._frames++;
    this._statsAccumulator += dt;
    if (this._statsAccumulator < 0.4) return;

    this._fps = Math.round(this._frames / this._statsAccumulator);
    this._frames = 0;
    this._statsAccumulator = 0;

    const info = collect();
    this.stats.fps.textContent = this._fps;
    this.stats.particles.textContent = info.particles;
    this.stats.spikes.textContent = info.spikes;
    this.stats.calls.textContent = info.calls;
  }
}

export class LoadingScreen {
  constructor() {
    this.element = document.getElementById('loader');
    this.fill = document.getElementById('loader-fill');
    this.status = document.getElementById('loader-status');
  }

  setProgress(ratio, message) {
    this.fill.style.width = `${Math.round(Math.min(1, Math.max(0, ratio)) * 100)}%`;
    if (message) this.status.textContent = message;
  }

  hide() {
    this.setProgress(1);
    setTimeout(() => this.element.classList.add('is-hidden'), 220);
  }

  fail(message) {
    this.status.textContent = message;
    this.status.style.color = '#ff7a6a';
  }
}
