# V2.1 — Eight-Adjective Sparse Curated Batch (`v2-1-a08`)

**Projekt:** `d:\CODING\React Projects\test-projects\elemental-sandbox-curated-adjective-palette-v20.3-claude-opus-5-high-claude-code`
**Prompt-ID:** `VFX-ELEMENTAL-V203-ADJ-V2.1-A08` · **Seed:** `ELEMENTAL-V203-ADJECTIVE-BOUNDARY-V2`
**Batch:** `v2-1-a08` · **Port:** 6067 (bestehend, `strictPort: true`) · **Stack:** Vanilla JS + Vite + Three.js + handgeschriebenes GLSL

Acht castbare Renditionen der acht Benchmark-Konzepte, ausschliesslich unter
`src/signature-library/batches/v2-1-a08/`. Diese Datei ist Planung **und**
Fortschrittsprotokoll; Runden werden unten angehängt, nie überschrieben.

---

## Fundament geprüft (gelesen, nicht vermutet)

Der Foundation-Prompt `VFX-ELEMENTAL-V203-LIBRARY-V2.0` ist abgeschlossen — kein Blocker:

- `src/signature-library/contract.js` — Entry-Shape, `ElementClass`/`Role`/`CastShape`,
  `provenanceLine`, Validierung inkl. `validateProvenanceSpec`.
- `src/signature-library/catalogue.js` — Registrierung, `bySpell`-Gruppierung, Facetten, `query`.
- `src/signature-library/discovery.js` — `import.meta.glob('./batches/*/manifest.js')`,
  `tools/audit-catalogue.mjs` läuft denselben Ordner-Vertrag mit `fs`. **Kein zentraler Schalter.**
- `src/signature-library/benchmark-manifest.js` — genau die acht Konzepte dieses Prompts,
  mit denselben `spellId`s, Elementklassen und Cast-Shapes.
- `src/signature-library/audit.js` + `tools/audit-catalogue.mjs` — inkl. der Regel, dass ein
  Entry mit Benchmark-`spellId` nur zählt, wenn sein Batch das Konzept in `implements` nennt.

## Entscheidungen

1. **Alles im Batch-Ordner, inklusive der acht Settings-Blöcke.** `config/settings.js` (2051 Z.)
   und `ui/Editor.js` (1862 Z.) liegen beide über der 800-Zeilen-Grenze dieses Prompts und
   dürfen deshalb nicht angefasst werden. Der Batch bringt seine Blöcke in `blocks.js` mit und
   meldet sie in `install.js` zur Importzeit am lebenden `settings`-Objekt an — genau der Weg,
   den `signature-library/README.md` §7 („a new file in the batch") beschreibt. Mitgeschrieben
   werden `DEFAULT_SETTINGS` (sonst liesse „Reset to defaults" die acht Blöcke stehen) und
   `ELEMENT_META` (sonst zielt `castShapeOf` die fünf Zone-Casts mit dem Pfeil statt dem Kreis).
2. **`settingsSchema` statt Editor-Eingriff.** Der Contract kennt das Feld schon, hat aber noch
   keinen Consumer. Jeder Entry liefert sein eigenes Schema als Daten (`schema.js`); der
   Editor-Anschluss gehört der Foundation, nicht diesem Batch — siehe *Findings*.
3. **Ein gemeinsames Rückgrat, acht eigene Silhouetten.** `support/BatchCast.js` besitzt die
   Vier-Schlag-Dramaturgie (Anticipation → dominante Aktion → Contact/Hold → Aftermath), den
   `ZoneField`-Anschluss und das Sekundär-Budget. Materialien werden geteilt, **dominante
   Geometrie nie** — das ist dasselbe Verhältnis wie 15 Engines auf 20 Entries im Core-Batch.
4. **Sekundär vor Dominant.** `support/budget.js` zählt die gleichzeitig stehenden Casts dieses
   Batches und skaliert ausschliesslich Partikelraten; Instanzzahlen der dominanten Geometrie
   bleiben unberührt.
5. **Keine Loadout-Zuweisung.** Die acht Renditionen werden über die Library (`L`) gewählt und
   zugewiesen. Ein fünftes Loadout wäre ein Eingriff in `config/settings.js` und liesse zwei
   Slots leer, was der Loadout-Check in `tools/audit-catalogue.mjs` zu Recht als Fehler meldet.

## Die acht Renditionen (dominante Geometrie, in einem Satz)

| `spellId` | Klasse / Shape | Dominante Geometrie |
| --- | --- | --- |
| `event-horizon-loom` | Void / Zone | Kettfäden vom Rand nach innen gebogen, die den dunklen Kern nie erreichen |
| `prism-judgement` | Light / Line | Ein weisser Strich, der sich am Ende in sieben Spektralbänder auffächert |
| `tempest-reliquary` | Storm / Zone | Ein aufrechtes Gefäss aus Winddauben mit eingeschlossener Entladung |
| `sunforge-mantle` | Fire / Zone | Krustenplatten auf einer Schmelzfläche, Fugen glühend |
| `rime-cathedral` | Frost / Zone | Rippen, die vom Rand nach innen wachsen und sich über der Mitte treffen |
| `thornwake-colossus` | Nature / Line | Eine schreitende Dornfigur, aus ihrer eigenen Spur zusammengesetzt |
| `abyssal-tideglass` | Water / Line | Zu Glas erstarrte Wellenkämme, die von hinten nach vorn zurückbrechen |
| `chrono-shatter` | Arcane / Zone | Scherben der Grundfläche, jede mit eigener Laufgeschwindigkeit |

## Phasen

- [x] PH1 — Blöcke, Install, Glyphen, Schema, Manifest → `node tools/audit-catalogue.mjs` grün
- [x] PH2 — Rückgrat: `BatchCast`, `CastClock`, `InstancedField`, `shapes`, `budget`
- [x] PH3 — Materialien: Plate, Filament, Spectrum, Sheet, Horizon, PaneClock
- [x] PH4 — Engines 1–4 (Loom, Prism, Reliquary, Sunforge)
- [x] PH5 — Engines 5–8 (Rime, Thornwake, Tideglass, Chrono)
- [x] PH6 — Batch-README, Selbst-Audit, `pnpm build`, Port 6067

---

## Runde 3 — PH5-Rest und PH6 (Schicht 3)

**Gemacht**

- `engines/ChronoShatter.js` geschrieben. Zone-Cast, `InstancedField` aus
  `makeSlab({sides: 5, thickness: 1})` + `createPaneClockMaterial`, Golden-Angle-Spirale
  wie `SunforgeMantle._crust()`, Kapazität 192. Kanäle: `aBeat` = Platz in der
  Bruchreihe (`rNorm`, Mitte zuerst), `aOpen` = Loslösung (`separate`, `paneLift`,
  `paneTilt`, `paneGap`), `aFade` = Auflösungsfortschritt aus `resolve`. Dust über
  `dustRate`, `lifeVariance` 0.9 — die Streuung ist der Effekt, nicht die Rate.
- Zellgrösse ist flächengleich (`2·radius / sqrt(count)`), damit die Grundfläche bei
  jedem `panes`-Wert gekachelt bleibt und nicht ab 20 Scherben löchrig wird.
- Zwei Punches statt einem: Kontakt (0.9) und der Frame, an dem alle Uhren wieder
  übereinstimmen (0.55). Der zweite ist die Kamerahälfte von `snapGlow`.
- `engines.js` angelegt — einziges Modul des Batches, das Engine-Klassen importiert.
  Der Build weist es als eigenen 85-kB-Chunk aus, die Lazy-Factory greift also.
- Toten `reached`-Block in `AbyssalTideglass._raise()` entfernt.
- Batch-`README.md` geschrieben: die acht Silhouetten, Material-zu-Rendition-Matrix,
  Instanz-Kapazitäten, Ladepfad, fünf Foundation-Lücken.

**Findings**

1. **Backtick in GLSL-Kommentaren bricht das Template-Literal.** 13 Zeilen in fünf
   der sechs Materialien schrieben Bezeichner als `` `vFade` `` *innerhalb* von
   ``/* glsl */ `…` ``. Ein Backtick dort schliesst den JS-String. Bei ungerader
   Anzahl gab es einen Parse-Fehler, bei gerader wäre der Name als JS-Variable
   ausgewertet worden — also ein `ReferenceError` erst zur Laufzeit. `pnpm build`
   ist genau daran gescheitert; Backticks in den betroffenen Kommentaren entfernt.
2. **Zwei nie gelesene Block-Keys**: `strokeTaper` (Prism) und `ribTaper` (Rime) —
   die Geometrien standen fest auf 0.72 bzw. 0.42 verdrahtet. Jetzt bei der
   Konstruktion aus dem Block gelesen, wie `EventHorizonLoom` es mit `threadTaper`
   schon tat. Dass ein Taper ein Konstruktionszeit-Wert ist, steht an beiden
   Aufrufstellen und in der README.
3. Alle übrigen 342 Keys werden gelesen; die 21 `field*`-Keys von `ZoneField`
   (Foundation), der Rest im Batch.

**Geprüft**

- `node tools/audit-catalogue.mjs` — grün, 28 Einträge, 8/8 Benchmark-Konzepte.
- `node tools/audit-settings-keys.mjs` — grün (deckt den Batch nicht ab, siehe
  README-Lücke 3).
- `pnpm build` — grün, 138 Module.
- **Headless in Node ausgeführt, nicht nur kompiliert:** Manifest, `engines.js`,
  Glyphen und `schemaFor` für alle acht Keys importiert (568 Controls), und ein
  vollständiger `ChronoShatter`-Cast über 309 Frames mit Stub-Kontext gefahren:
  alle vier Beats erreicht, `aOpen`/`aFade` sauber in 0..1, `aBeat` 0.107..0.994,
  Paneelhöhe 0.045..0.781 m (= `fieldHeight` + 0..`paneLift`·1.35), keine NaN,
  2 Punches, 1 Decal, 442 Partikel, `panes.count == 0` nach `destroy()`.

**Offen**

- Shader-Linking bleibt ungeprüft — GLSL kompiliert erst im Treiber beim ersten
  Draw, und Sichtprüfungen sind per Hausregel untersagt.
- Die acht Blöcke erscheinen weiter nicht im lil-gui-Editor (`settingsSchema` hat
  keinen Consumer). Als Foundation-Lücke dokumentiert, nicht gelöst.
- `tools/audit-catalogue.mjs:128` druckt weiter fest „8 benchmark briefs
  unimplemented by design“ — seit diesem Batch falsch, aber Foundation-Code.

## Entfernung — 2026-08-14

- Nutzerurteil: Die acht V2.1-Renditions sind katastrophal schlecht und dürfen nicht in der Signature Library bleiben.
- Der gesamte Produktionsordner `src/signature-library/batches/v2-1-a08/` wurde im separaten Entfernungstask gelöscht.
- Diese Datei bleibt ausschließlich als append-only Negativhistorie erhalten; V2.1 ist kein aktiver Batch mehr.
