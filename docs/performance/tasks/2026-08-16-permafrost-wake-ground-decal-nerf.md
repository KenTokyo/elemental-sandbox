# 2026-08-16 — Permafrost Wake: Boden-Decals nerfen und ein Fill-Budget einziehen

**Projektordner:** `d:\CODING\React Projects\test-projects\elemental-sandbox-curated-adjective-palette-v20.3-claude-opus-5-high-claude-code`

**Auslöser:** Permafrost Wake deckt beim Einsatz den kompletten Boden weiß ab
(zwei Screenshots) und die Framerate bricht ein. Vermutung des Users: zu viele
Bodenpartikel. Auftrag: analysieren, ob das stimmt, den Skill nerfen und eine
Performance-Regel für Bodeneffekte verankern.

**Ergebnis der Analyse:** Die Vermutung stimmt, und es ist schlimmer als
vermutet — es sind keine Partikel, sondern **Ground Decals**: transparente Quads
mit einem sehr teuren Rausch-Shader, die sich gegenseitig nicht verdecken.
Vollständige Rechnung in [`../ground-decals.md`](../ground-decals.md).

---

## Phase 1 — Analyse `[x]`

- `[x]` Skill lokalisiert: `permafrost` in `config/variants-dominion.js`, Engine
  `abilities/IceAbility.js` (`AbilityManager` mappt `permafrost → IceAbility`).
- `[x]` Kostenquelle gefunden: `_frontFx` legt alle `1 / frostRate` Meter ein
  `DecalType.FROST`-Quad mit Radius `halfWidth(s) × frostSpread × rand(0.6,1.15)`.
- `[x]` Gerechnet: `range 17 × frostRate 6.5` = **110 Patches**, mittlerer Radius
  **7.18 m**, dazu die Aufschlagfläche mit **26 m Radius** → ≈ **20.120 m²**
  überlagerte transparente Fläche pro Cast, gegen **828 m²** bei der Frost Lance.
  Faktor **24**.
- `[x]` Shaderkosten belegt: FROST-Zweig ≈ 22 3D-Simplex + 27 Voronoi-Zellen pro
  Fragment (3× `snowDepth` für das Relief, plus `warp`/`lobes`/`glint`).
- `[x]` Kernfehler benannt: `frostSpread 2.5` auf einer Bahn mit 4.8 m
  Halbbreite schiebt den Reif **2,5 Halbbreiten über die Bahn hinaus** — daher
  die Scheibe im Screenshot statt einer Spur.
- `[x]` Nachbarn geprüft: **Cinder Veil** (leitet von Permafrost ab, 6 m breit)
  war mit **80.530 m²** noch viermal teurer. **Absolute Zero** ist mit ≈ 700 m²
  unauffällig — die Einschätzung des Users war richtig. Verdigris, Verdant,
  Obsidian, Amalgam, Brine alle im Rahmen.

**Finding:** Das Problem ist nicht „ein Skill hat zu viel" sondern „`frostRate`
ist eine Dichte pro Meter und wird nie gegen Länge × Radius² gegengerechnet" —
also ein Systemfehler, der bei jeder neuen breiten Signature wiederkommt.

## Phase 2 — Guardrails im Code `[x]`

- `[x]` `abilities/IceAbility.js`: `_planRime()` plant die Patch-Dichte einmal
  pro Cast gegen `RIME_AREA_BUDGET = 3000` m². Budget wird über die **Anzahl**
  ausgegeben, nicht über den Radius (Ausdünnen ist unsichtbar, Schrumpfen lässt
  die Bahn nackt). Dazu `RIME_MAX_PATCHES = 96` und `RIME_MAX_RADIUS = 7 m`.
- `[x]` Radius-Deckel auch auf die Aufschlagfläche in `onImpact` (war 26 m).
- `[x]` `effects/GroundDecals.js`: `DecalSystem` zählt jetzt `this.area` in m²
  und hat mit `_reclaim()` ein globales Live-Budget (`LIVE_AREA_BUDGET = 9000`,
  `LIVE_MAX_DECALS = 320`). Überzählige Marken werden **nicht** hart entfernt,
  sondern über `decal.decay` in ihre eigene Fade-Kurve geschoben (`CULL_FADE
  0.45 s`) — deckt Chain-Casting ab, das kein Per-Cast-Budget sehen kann.

**Entscheidung:** Zwei Ebenen statt einer. Der Per-Cast-Plan hält die
autorisierten Werte ehrlich, das Live-Budget fängt das ab, was erst durch
Wiederholung entsteht. Bewusst **nicht** in `DomeAbility`/`GateAbility`/
`GlacierAbility` eingegriffen: deren einzelne große Platte ist ein legitimer
Einzelmarker und liegt weit unter Budget.

## Phase 3 — Werte nachziehen `[x]`

- `[x]` `variants-dominion.js` → `permafrost`: `frostSpread 2.5 → 1.15`,
  `frostRate 6.5 → 3.2`, `frostLife 12.0 → 8.0`. Neu **2.020 m²**, 10× günstiger.
- `[x]` `signatures-ashfall.js` → `cinderveil`: `frostSpread 3.0 → 1.2`,
  `frostRate 9.0 → 2.2`, `frostLife 11.0 → 7.5`. Neu **3.109 m²**, 26× günstiger.
- `[x]` Beide liegen ohne Klemmen unter dem Code-Budget — der Guardrail formt
  also nicht den Look, er sichert ihn nur ab.
- `[x]` `ui/panels-strikes.js`: die drei Frost-Slider beschriftet, damit im
  Editor sichtbar ist, dass `frostSpread × frostRate × frostLife` die Füllkosten
  sind und über dem Budget ausgedünnt statt teurer wird.

## Phase 4 — Regel verankern `[x]`

- `[x]` `docs/performance/ground-decals.md` angelegt: Herleitung, Zahlen vorher/
  nachher, die drei Guardrails, und eine Vier-Punkte-Checkliste fürs Autoring.
- `[x]` Kurzregel in `d:\CODING\React Projects\test-projects\AGENTS.md`
  aufgenommen (Abschnitt *Performance bei Boden- und Flächeneffekten*) und dort
  committet, damit sie für jedes Projekt im Repo gilt, nicht nur für dieses.
- `[x]` `index.html`-Titel auf die Bearbeitung nachgezogen.

## Phase 5 — Gates nachgeholt `[x]` (Nachtrag einer späteren Schicht)

Die Phasen 1–4 haben Blockwerte geändert, aber keinen Gate-Lauf protokolliert.
Nachgeholt, mit einem echten Fund:

- `[x]` `node tools/audit-settings-keys.mjs` → OK (25 Module, 90 Blöcke,
  2929 unread keys unverändert über `dead-keys.js` abgedeckt).
- `[x]` `node tools/registry-check.mjs --fingerprint` → **FAIL**. Der aufgezeichnete
  Fingerprint stand noch auf dem V4-Stand `b4ba0ca5bc0d3bd3`, tatsächlich war
  `ce521792d06caa59` — die sechs Frost-Werte aus Phase 3 sind nie quittiert
  worden. Vor dem Neuschreiben gegengeprüft, dass genau die dokumentierten
  Werte anliegen (`permafrost` 1.15/3.2/8.0, `cinderveil` 1.2/2.2/7.5) und
  sonst nichts gewandert ist; danach `--write-fingerprint` → `ce521792d06caa59`,
  Nachlauf grün.
- `[x]` `pnpm build` → grün, 162 Module, 1.65 s.

**Lehre:** Der Fingerprint ist kein Nebenprodukt, sondern das Quittieren einer
Wertänderung. Wer Phase 3 dieser Akte fährt, muss ihn im selben Zug setzen —
sonst erbt die nächste Schicht einen roten Gate und kann nicht mehr
unterscheiden, ob das die eigene Änderung war oder eine fremde.

## Offen / bewusst nicht gemacht

- Keine Sichtprüfung, kein Dev-Server (Followup-Regel in `AGENTS.md`). Die
  Zahlen sind gerechnet, nicht gemessen — ein Frametime-Vergleich vorher/nachher
  wäre die nächste Bestätigung, wenn gewünscht.
- `Verdigris Seam` (128 Patches) und `Brine Lance` (198) laufen in den
  `RIME_MAX_PATCHES`-Deckel von 96. Bei ihren Radien (2.63 m bzw. 0.35 m gegen
  Abstände von 0.17 m bzw. 0.23 m) überlappt der Reif weiterhin lückenlos —
  sichtbar ändert sich nichts, Verdigris fällt von 2.770 auf 2.232 m².
- Die Slider-Obergrenzen (`frostRate` bis 12) wurden **nicht** gesenkt: die
  Brine Lance nutzt 9.0 legitim, weil ihre Patches winzig sind. Der Deckel liegt
  jetzt richtigerweise auf der Fläche, nicht auf der Dichte.
