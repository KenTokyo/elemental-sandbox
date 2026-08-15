import { ABILITY_GROUPS, CastShape, ELEMENTS, ELEMENT_META, castShapeOf } from '../config/settings.js';
import { sigilFor } from './glyphs.js';

const STORAGE_KEY = 'elemental-sandbox.loadout-picker.preferences.v1';

/**
 * Compact loadout browser based on the reference VFX library: choose one of six
 * slot chips, then choose an ability. No detail pane, technical ids, batches or
 * confirmation step sit between those two clicks.
 */
export class AbilityPicker {
  /** @param {{loadout: import('./Loadout.js').Loadout}} options */
  constructor({ loadout }) {
    this.loadout = loadout;
    this.activeSlot = 0;
    this.isOpen = false;
    this._returnFocus = null;
    this._persistTimer = 0;

    const saved = this._readPreferences();
    this._filter = saved.text;
    this._sort = saved.sort;
    this._category = saved.category;
    this._cast = saved.cast;

    this.root = document.createElement('div');
    this.root.className = 'picker';
    this.root.hidden = true;
    this.root.innerHTML = `
      <div class="picker__head">
        <div class="picker__title">Loadout</div>
        <select class="picker__sort" data-sort aria-label="Sort abilities">
          <option value="category">Category order</option>
          <option value="name">Name A–Z</option>
        </select>
        <select class="picker__filter" data-category aria-label="Filter ability group">
          <option value="">All groups</option>
          ${ABILITY_GROUPS.map((group) => `<option value="${group.id}">${group.label}</option>`).join('')}
        </select>
        <select class="picker__filter" data-cast aria-label="Filter cast shape">
          <option value="">All casts</option>
          <option value="line">Line cast</option>
          <option value="zone">Far cast</option>
        </select>
        <input class="picker__search" type="search" placeholder="Filter ${ELEMENTS.length} abilities…"
               data-search aria-label="Filter abilities" />
        <button class="picker__close" type="button" data-close aria-label="Close the loadout">✕</button>
      </div>
      <div class="picker__slots" data-slots></div>
      <div class="picker__hint" data-hint></div>
      <div class="picker__body">${this._libraryHTML()}</div>
    `;
    document.body.appendChild(this.root);

    this.slotBar = this.root.querySelector('[data-slots]');
    this.hint = this.root.querySelector('[data-hint]');
    this.sort = this.root.querySelector('[data-sort]');
    this.category = this.root.querySelector('[data-category]');
    this.cast = this.root.querySelector('[data-cast]');
    this.search = this.root.querySelector('[data-search]');
    this.body = this.root.querySelector('.picker__body');

    this.sort.value = this._sort;
    this.category.value = this._category;
    this.cast.value = this._cast;
    this.search.value = this._filter;

    this.items = new Map();
    this.groups = [];
    this._indexLibrary();
    this._bind();
    this.refresh();
    this._applyFilter();
  }

  static groupElements(sort = 'category') {
    return ABILITY_GROUPS.map((group) => ({
      ...group,
      elements: sort === 'name'
        ? [...group.elements].sort((a, b) =>
            (ELEMENT_META[a]?.label ?? a).localeCompare(ELEMENT_META[b]?.label ?? b)
          )
        : group.elements
    }));
  }

  _libraryHTML() {
    return AbilityPicker.groupElements(this._sort)
      .map(
        (group) => `
          <section class="picker-group" data-group="${group.id}">
            <h3 class="picker-group__title">${group.label}<span>${group.elements.length}</span></h3>
            <div class="picker-group__grid">${group.elements.map((element) => this._itemHTML(element)).join('')}</div>
          </section>`
      )
      .join('');
  }

  _itemHTML(element) {
    const meta = ELEMENT_META[element] ?? {};
    return `
      <button class="picker-item" type="button" data-element="${element}"
              data-category="${meta.category ?? ''}" data-cast="${castShapeOf(element)}"
              style="--accent:${meta.accent}">
        <span class="picker-item__key" data-key></span>
        <span class="picker-item__glyph">${sigilFor(element)}</span>
        <span class="picker-item__label">${meta.label ?? element}</span>
      </button>`;
  }

  _indexLibrary() {
    this.items.clear();
    for (const item of this.body.querySelectorAll('.picker-item')) {
      this.items.set(item.dataset.element, item);
    }
    this.groups = [...this.body.querySelectorAll('.picker-group')];
  }

  _renderLibrary() {
    this.body.innerHTML = this._libraryHTML();
    this._indexLibrary();
    this.refresh();
    this._applyFilter();
  }

  _slotsHTML() {
    return this.loadout.slots
      .map((element, slot) => {
        const meta = ELEMENT_META[element] ?? {};
        return `
          <button class="picker-slot${slot === this.activeSlot ? ' is-active' : ''}" type="button"
                  data-slot="${slot}" style="--accent:${meta.accent}"
                  aria-pressed="${slot === this.activeSlot}">
            <span class="picker-slot__key">${this.loadout.keyOf(slot)}</span>
            <span class="picker-slot__glyph">${sigilFor(element)}</span>
            <span class="picker-slot__label">${meta.label ?? element}</span>
          </button>`;
      })
      .join('');
  }

  _bind() {
    this.root.querySelector('[data-close]').addEventListener('click', () => this.close());

    this.root.addEventListener('keydown', (event) => {
      event.stopPropagation();
      if (event.key === 'Escape') this.close();
    });
    this.root.addEventListener('pointerdown', (event) => event.stopPropagation());

    this.slotBar.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-slot]');
      if (!chip) return;
      this.activeSlot = Number(chip.dataset.slot);
      this.refresh();
    });

    this.body.addEventListener('click', (event) => {
      const item = event.target.closest('[data-element]');
      if (!item) return;
      this.loadout.set(this.activeSlot, item.dataset.element);
    });

    this.sort.addEventListener('change', () => {
      this._sort = this.sort.value;
      this._renderLibrary();
      this._schedulePersist();
    });

    this.category.addEventListener('change', () => {
      this._category = this.category.value;
      this._applyFilter();
      this._schedulePersist();
    });

    this.cast.addEventListener('change', () => {
      this._cast = this.cast.value;
      this._applyFilter();
      this._schedulePersist();
    });

    this.search.addEventListener('input', () => {
      this._filter = this.search.value.trim().toLowerCase();
      this._applyFilter();
      this._schedulePersist();
    });
  }

  _applyFilter() {
    for (const [element, item] of this.items) {
      const label = ELEMENT_META[element]?.label ?? element;
      const matchesText = !this._filter || label.toLowerCase().includes(this._filter);
      const matchesCategory = !this._category || item.dataset.category === this._category;
      const matchesCast = !this._cast || item.dataset.cast === this._cast;
      item.hidden = !(matchesText && matchesCategory && matchesCast);
    }

    for (const group of this.groups) {
      group.hidden = ![...group.querySelectorAll('.picker-item')].some((item) => !item.hidden);
    }
  }

  refresh() {
    this.slotBar.innerHTML = this._slotsHTML();

    const equipped = this.loadout.at(this.activeSlot);
    for (const [element, item] of this.items) {
      const slot = this.loadout.slotOf(element);
      item.classList.toggle('is-equipped', slot >= 0);
      item.classList.toggle('is-active', element === equipped);
      item.querySelector('[data-key]').textContent = slot >= 0 ? this.loadout.keyOf(slot) : '';
    }

    const meta = ELEMENT_META[equipped] ?? {};
    this.hint.innerHTML =
      `Picking for slot <strong>${this.loadout.keyOf(this.activeSlot)}</strong>` +
      ` — currently ${meta.label ?? equipped}.`;
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this._returnFocus = document.activeElement;
    this.root.hidden = false;
    this.search.focus({ preventScroll: true });
    this.search.select();
  }

  close() {
    if (!this.isOpen) return;
    this._flushPersist();
    this.isOpen = false;
    this.root.hidden = true;
    const target = this._returnFocus ?? document.getElementById('viewport');
    if (target?.isConnected) target.focus?.({ preventScroll: true });
    this._returnFocus = null;
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  _readPreferences() {
    try {
      const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
      const value = raw ? JSON.parse(raw) : null;
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid');
      return {
        text: typeof value.text === 'string' ? value.text.slice(0, 200).toLowerCase() : '',
        sort: value.sort === 'name' ? 'name' : 'category',
        category: ABILITY_GROUPS.some((group) => group.id === value.category) ? value.category : '',
        cast: value.cast === CastShape.LINE || value.cast === CastShape.ZONE ? value.cast : ''
      };
    } catch {
      return { text: '', sort: 'category', category: '', cast: '' };
    }
  }

  _schedulePersist() {
    clearTimeout(this._persistTimer);
    this._persistTimer = setTimeout(() => this._flushPersist(), 120);
  }

  _flushPersist() {
    clearTimeout(this._persistTimer);
    this._persistTimer = 0;
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify({
        text: this._filter,
        sort: this._sort,
        category: this._category,
        cast: this._cast
      }));
    } catch {
      // Storage can be unavailable in private or embedded contexts; the picker
      // remains fully usable for the current session.
    }
  }

  dispose() {
    this._flushPersist();
    this.root.remove();
    this.items.clear();
    this.groups.length = 0;
  }
}
