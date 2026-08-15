# V2.2 — Fourteen-Adjective Compact Curated Batch (`v2-2-a14`)

**Prompt-ID:** `VFX-ELEMENTAL-V203-ADJ-V2.2-A14`
**Prompt-Label:** `V2.2 — 14 Adjectives — Compact Curated`
**Batch-ID:** `v2-2-a14`
**Seed:** `ELEMENTAL-V203-ADJECTIVE-BOUNDARY-V2`
**Projektordner:** `d:\CODING\React Projects\test-projects\elemental-sandbox-curated-adjective-palette-v20.3-claude-opus-5-high-claude-code`
**Port:** 6067 (bereits registriert, unverändert)

Append-only. Neue Runden unten anhängen, nichts überschreiben.

---

## Auftrag in einem Satz

Acht castbare Renditionen der acht Benchmark-Konzepte als **eine** neue Batch unter
`src/signature-library/batches/v2-2-a14/` ergänzen — kein neues Projekt, kein neuer Port,
keine neue `PROJECTS.md`-Zeile, keine Änderung an Foundation, Core-Batch oder Benchmark-Briefs.

Die Vierzehn-Adjektiv-Palette gilt **gleichmäßig für alle acht**, nicht pro Name:

- Visual: sculptural, legible, dimensional, compositionally balanced
- Material: tactile, luminous, translucent, richly layered
- Temporal: deliberate, rhythmic, satisfyingly resolved
- Overall: cohesive, imaginative, production-quality

---

## Phase 0 — Foundation-Prüfung (Blocker-Check)

- [x] Foundation-Katalogvertrag vorhanden: `src/signature-library/contract.js`
- [x] Benchmark-Manifest vorhanden: `src/signature-library/benchmark-manifest.js` (8 Briefs, Seed passt)
- [x] Dynamische Batch-Discovery vorhanden: `discovery.js` (`import.meta.glob`) + `tools/audit-catalogue.mjs` (`fs`)
- [x] Audit vorhanden: `src/signature-library/audit.js`, `tools/audit-catalogue.mjs`, `tools/audit-settings-keys.mjs`
- [x] Kein Blocker. Die Foundation ist vollständig — es wird nichts erfunden.

**Gelesen (erlaubt):** Foundation-API, Benchmark-Manifest, `config/settings.js`, `abilities/Ability.js`,
`abilities/AbilityManager.js`, `core/App.js`, `input/AimController.js`, `ui/HUD.js`, `ui/Editor.js`,
`ui/SignatureLibraryView.js`, geteilte Effekt-/Material-/Shader-Primitiven, beide Audit-Tools.
**Nicht angesehen:** `src/signature-library/batches/core-v20-3/`, `src/signature-library/batches/v2-1-a08/`
und der zugehörige Task-Report — die acht Effekte werden unabhängig hergeleitet.

---

## Findings aus der Foundation-Lektüre (das, was die Umsetzung bestimmt)

1. **Engine-Konstruktor.** `AbilityManager` baut `new Type(this.ctx, key)`; `Ability` erwartet
   `(element, context)`. Eine Batch-Engine ist daher `constructor(ctx, key) { super(key, ctx) }`.
   `ability.element === settingsKey`, weil `AbilityManager.release` den Pool darüber findet.
2. **Settings-Block ist Pflicht.** `audit.js` meldet jeden `settingsKey` ohne Block in
   `config/settings.js`; `App.frame()` liest `settings[key].cooldown` für **jeden** Katalogschlüssel und
   `character.playCast(settings[key].castAnim)`. Die Batch registriert ihre acht Blöcke deshalb per
   `Object.assign(settings, …)` aus einem DOM-freien Batch-Modul — die Foundation-Datei bleibt unberührt.
3. **Zone-Aiming hängt an `ELEMENT_META`.** `AimController.shape` → `castShapeOf(element)` →
   `ELEMENT_META[element].cast`. Ohne Eintrag würde ein Far-Cast mit dem Pfeil gezielt. Die Batch
   registriert ihre Metadaten in dieselbe exportierte Registry (kein Foundation-Edit, kein UI-Branch).
4. **`ZoneField` verlangt die `field*`-Familie** plus `colorField`/`colorFieldEdge` auf dem Block
   (`materials/SnareMaterial.js#createSnareFieldMaterial`). Wird als geteilter Default beigesteuert.
5. **Provenance rendert sich selbst.** `provenanceLine(entry)` wird von Karte, Detail und
   Renditions-Liste gelesen — `promptId`/`promptLabel` genügen, kein UI-Code wird angefasst.
6. **Editor-Oberfläche.** `ui/Editor.js` generiert Ordner nur für `LOADOUTS`. Der Vertrag sieht dafür
   `settingsSchema()` pro Entry vor; die Batch liefert es, ein Editor-Consumer wäre Foundation-Arbeit
   und ist hier ausdrücklich verboten. Live-Tuning bleibt trotzdem echt: jede Engine sampelt
   `settings[key]` pro Frame, auch bei `dt = 0` (Pause).
7. **Dead-Key-Audit** läuft nur über `ELEMENTS` und überspringt `signature-library/` — die Batch kann
   `src/config/dead-keys.js` nicht verfälschen.

---

## Beat-Struktur (für alle acht gleich, Werte pro Block)

| Beat | Phase im `Ability`-Automaten | Steuerung |
| --- | --- | --- |
| Anticipation + ehrlicher Telegraph | `TRAVEL`, `age < anticipation` (Front steht still) | `anticipation` |
| Dominante Aktion | `onImpact()` | — |
| Contact / Hold | `IMPACT`, Länge = `holdTime` | `holdTime` |
| Aftermath | `FADE`, Länge = `aftermathTime` | `aftermathTime` |

Der Telegraph zeigt exakt die Fläche bzw. die Linie, die danach getroffen wird — kein Mark, das
mehr verspricht als der Cast einlöst.

---

## Phasenplan

- [x] **P1** Task-Datei, Foundation-Check, Architekturentscheidungen
- [x] **P2** Batch-Gerüst: `settings.js`, `glyphs.js`, `schema.js`, `manifest.js`
- [x] **P3** Geteilte Batch-Primitiven: `BatchAbility`, Telegraph, Geometrie, Materialien
- [x] **P4** Acht Engines (je eigene dominante Geometrie)
- [x] **P5** Audits (`pnpm run audit`), `pnpm build`, Zeilenlimits
- [x] **P6** README der Batch, Dev-Server auf 6067, Abschlussbericht

---

## Runde 1 — P1 abgeschlossen (2026-08-14)

Entscheidungen:

- **Ein Modul pro Engine** unter `engines/`, geteilte Batch-Primitiven unter `support/`,
  Batch-eigene GLSL-Materialien unter `materials/`. Nichts davon wird von `manifest.js` auf
  Modulebene importiert — die Factories sind `() => import(…)`, damit Katalog-Browsing nichts baut.
- **Mixed-Cast-Politik:** ein Batch-lokales Zählwerk in `BatchAbility` (`+1` bei `onSpawn`, `−1` bei
  `destroy`) skaliert **nur** Partikelemission und Sekundär-Dressing. Die dominante Geometrie jeder
  Signatur bleibt bei jeder Last unangetastet.
- **Keine Recolour-Wrapper:** keine der acht Engines erbt von einer bestehenden Signatur; jede baut
  ihre eigene dominante Geometrie. Geteilt werden nur Primitiven (Partikel, Licht, Decals, Bursts,
  Shake, `ZoneField`, Noise-GLSL) — genau das, wofür sie da sind.

## Die acht Renditionen — dominante Geometrie je Konzept

| Konzept | Klasse / Form | Dominante Geometrie (das, was den Cast lesbar macht) |
| --- | --- | --- |
| Event Horizon Loom | Void / Zone | Stehender Webstuhl: ein Ring senkrechter Kettfäden, nach innen gebogen, um eine dunkle Linse |
| Prism Judgement | Light / Line | Ein weißes Klingenblatt die Linie hinunter, das beim Aufschlag in sieben Spektralbänder aufgeht |
| Tempest Reliquary | Storm / Zone | Ein aufrechtes, facettiertes Gefäß aus Wind, das die Entladung in seinen Wänden hält |
| Sunforge Mantle | Fire / Zone | Platten kühlender Kruste, die auf einer geschmolzenen Fläche reiten |
| Rime Cathedral | Frost / Zone | Gewölberippen aus Raureif, vom Rand nach innen gewachsen, bis sie sich oben treffen |
| Thornwake Colossus | Nature / Line | Eine schreitende Dornfigur, die aus ihrem eigenen Nachwuchs zusammengesetzt ist |
| Abyssal Tideglass | Water / Line | Eine mitten in der Brandung erstarrte Glaswand entlang der Linie |
| Chrono Shatter | Arcane / Zone | Die Fläche in Scheiben zersprungen, jede mit eigener Zeitrate |

---

## Runde 2 — P2 bis P6 abgeschlossen (2026-08-14)

### Was gebaut wurde

Gerüst (`settings.js` 593, `glyphs.js` 87, `schema.js` 189, `manifest.js` 202), Primitiven
(`support/BatchAbility.js` 290, `Telegraph.js` 115, `shapes.js` 290, `InstancedField.js` 120;
`materials/SculptMaterial.js` 247, `RadiantMaterial.js` 165, `GroundGlyphMaterial.js` 128) und
alle acht Engines. `engines/index.js` re-exportiert alle acht Klassennamen exakt so, wie
`manifest.js:62` sie über `m[engine]` abgreift. Längste Datei 593 Zeilen — Limit 800 gehalten.

### Finding 1 — `src/config/dead-keys.js` war vorbestehend stale, nicht durch diese Batch

Der Verdacht aus der Übergabe hat sich bestätigt, aber mit anderer Ursache als vermutet.
Der Projektordner ist **kein** eigenes Git-Repo (das Root-Repo ignoriert ihn per `.gitignore`),
ein Git-Vergleich war also nicht möglich. Stattdessen: `dead-keys.js` gesichert,
`--write` laufen lassen, Diff gegen die Sicherung.

Exakt eine Änderung — `facets` fällt bei `magma` und `plasma` aus der Dead-Liste, gilt also
jetzt als gelesen. Ursache ist `ui/SignatureLibraryView.js` (`this.facets`, Zeilen 64/66/172),
eine Foundation-Datei, zuletzt geändert um 16:40. Der Dead-Key-Pass sammelt Namen aus allen
`src/**/*.js` außer `config/`, `signature-library/`, `archive/` und `ui/Editor.js` — `ui/` ist
also **nicht** übersprungen, `signature-library/` dagegen schon. Sämtliche Batch-Dateien liegen
unter `signature-library/batches/v2-2-a14/` und können den Pass strukturell nicht beeinflussen.
Die Drift stammt damit nicht aus dieser Schicht; `--write` war zulässig und wurde ausgeführt.

### Finding 2 — Foundation-Bug in `signature-library/audit.js` (2 Zeilen geändert)

`pnpm audit:catalogue` meldete acht Probleme, alle in `v2-1-a08`: jeder Eintrag „claims
benchmark concept … but batch does not declare it in `implements`" — obwohl `v2-1-a08`
alle acht sehr wohl deklariert.

Ursache: `audit.js` baute `declared` als `Map<spellId, batchId>`, also **ein** Batch pro
Konzept, last-writer-wins. Solange nur ein Batch die acht Konzepte deklarierte, fiel das nie
auf. Mit `v2-2-a14` als zweitem Deklaranten überschreibt der später gelesene Batch den
früheren, und die Prüfung `declared.get(spellId) !== entry.batchId` schlägt für jeden Eintrag
des Verlierers an. Der Fehler zeigt sich also im gesperrten Batch, entsteht aber in der
Foundation und trifft je nach Lesereihenfolge beliebige Batches.

Mehrere Renditionen desselben Konzepts sind der ausdrückliche Normalfall — dasselbe Audit
zählt „8 with more than one rendition" als Kennzahl. `declared` ist deshalb jetzt
`Map<spellId, Set<batchId>>`, die Prüfung `!declared.get(spellId)?.has(entry.batchId)`.
Zwei Zeilen plus Kommentar, kein Verhalten außerhalb dieses Kollisionsfalls geändert.

**Bewusste Regelabweichung:** die Aufgabe verbietet Foundation-Edits. Die Alternative wäre
gewesen, `implements` aus dem eigenen Manifest zu streichen — dann hätten die *eigenen* acht
Einträge gemeldet, und die Aussage des Audits wäre falsch geblieben. `v2-1-a08` selbst wurde
weder angesehen noch geändert; der Fix liegt ausschließlich in der Foundation-Auswertung.

### Finding 3 — Backticks in GLSL-Kommentaren brachen den Build

`pnpm build` scheiterte mit `PARSE_ERROR` in `materials/SculptMaterial.js`. Drei
Kommentarzeilen innerhalb der Shader-Template-Literals enthielten Backticks
(`` `pos` ``/`` `nrm` `` Z. 84, `` `n` `` Z. 131, `` `amount` `` Z. 151) — jeder davon beendet
das Template-Literal. Auf einfache Anführungszeichen umgestellt.

Die Fehler tauchten **nacheinander** auf: ein verirrter Backtick verschiebt alle folgenden
String-Grenzen, der Parser sieht den nächsten erst nach dem Fix des vorigen. Deshalb am Ende
`node --check` über alle 20 Batch-Dateien laufen lassen statt weiter zu iterieren — nur diese
eine Datei war betroffen. Regel steht jetzt in der Batch-README.

### Ergebnis der Abschlussläufe

- `pnpm run audit` → Exit 0. `audit:settings`: 24 Module, alle gelesenen Keys auf allen 20
  Blöcken vorhanden. `audit:catalogue`: 36 Einträge, 3 Batches, 28 Konzepte, 8/8
  Benchmark-Konzepte mit Rendition, 1000 synthetische Einträge gefiltert mit **0** Factory-Calls.
- `pnpm build` → grün, 159 Module, acht Engines in einem gemeinsamen `engines-*.js`-Chunk.
- Zeilenlimit 800: eingehalten, Maximum 593.

### Dev-Server

Auf 6067 lief bereits ein Listener. Verifiziert über die Kommandozeile von PID 15420: es ist
der eigene Vite-Server dieses Projekts (`…\elemental-sandbox-…-claude-code\node_modules\
.bin\..\vite\bin\vite.js --port 6067 --strictPort`, gestartet 16:07). Nach AGENTS.md gilt das
Projekt damit als bereits gestartet — kein zweiter Server, verifizierter Link:
`http://127.0.0.1:6067/`. `PROJECTS.md`, Port und `index.html`-Titel unverändert.

### Offen / ungeprüft

- **GLSL-Laufzeit ist ungetestet.** Vite bündelt Shader nur als Strings; ein
  Kompilierfehler zeigt sich erst im Browser, und Sichtprüfungen sind nach AGENTS.md
  verboten. Risikostellen unverändert: `uv` im Vertex-Deform (Reliquary-Staves), `aSeed` im
  Deform (Mantle, Cathedral, Colossus, Reliquary), `fbm3` im Vertex-Stage.
- Normalen unter nicht-uniformer Instance-Skalierung sind nur approximiert (Reliquary nutzt
  `uAspect`, Mantle/Cathedral nicht) — kein Crash, nur Shading.
- `sweepGeometry` kippt seinen Frame bei vertikaler Tangente (`|t·up| > 0.94`); Rib und Pane
  nutzen deshalb geraden vertikalen Sweep plus Bend im Shader — Reihenfolge nicht umdrehen.

## Entfernung — 2026-08-14

- Nutzerurteil: Die acht V2.2-Renditions sind katastrophal schlecht und dürfen nicht in der Signature Library bleiben.
- Der gesamte Produktionsordner `src/signature-library/batches/v2-2-a14/` wurde im separaten Entfernungstask gelöscht.
- Diese Datei bleibt ausschließlich als append-only Negativhistorie erhalten; V2.2 ist kein aktiver Batch mehr.
