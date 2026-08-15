# Einfaches Loadout und kompakter Ability-Picker

## Auftrag

Das komplexe V2.0-Katalog-/Mehrfach-Loadout-System wird aus V20.3 zurückgebaut. HUD und das mit `L` geöffnete Menü übernehmen das kompakte Glasdesign aus `customglsl-threejs-vfx-library-v1`: eine einzelne Leiste mit sechs frei belegbaren Slots und ein direkter Picker ohne Detail-, Rendition-, Prompt- oder Batch-Ebene.

## Scope

- Projekt: `elemental-sandbox-curated-adjective-palette-v20.3-claude-opus-5-high-claude-code`
- Designreferenz: `D:\CODING\React Projects\github-repos-examples\vfx-projects\customglsl-threejs-vfx-library-v1`
- Alle 20 bestehenden Abilities und ihre VFX-/Settings-Blöcke bleiben erhalten.
- Normale interne Ability-Keys bleiben der Runtime-Vertrag; entfernt werden V2.0-`entryId`, `spellId`, Prompt-Provenienz, Batches, Renditions und Katalog-Discovery.
- Ein einzelnes, sitzungsgebundenes Sechs-Slot-Loadout ersetzt vier veränderbare Fünfer-Loadouts.
- Suche sowie einfache Gruppen-/Cast-Filter bleiben lokal gespeichert.
- Keine Tests, Builds, Dev-Server oder Browser-/Sichtprüfung ohne ausdrücklichen User-Befehl.

## Phasen

- [x] P1 — Referenzdesign, Screenshot und V2.0-Rückbauumfang analysieren
- [x] P2 — Einfaches Loadout-Modell, HUD und Picker übernehmen
- [x] P3 — Katalog-/Prompt-ID-Architektur aus Runtime und Tooling entfernen
- [x] P4 — Dokumentation und HTML-Titel an den Rückbau anpassen
- [x] P5 — Geänderte Verträge statisch kontrollieren

## Entscheidungen

- Die Referenz bestimmt visuelle Form, Slot-Chips, Kartenraster, Glasflächen und direkte Interaktion.
- Sechs Slots verwenden `Q`, `E`, `R`, `F`, `V`, `X`; Ziffern wechseln keine Loadout-Seiten mehr.
- Eine bereits ausgerüstete Ability wird beim erneuten Zuweisen mit dem Zielslot getauscht, nicht dupliziert.
- Der Picker zeigt ausschließlich Namen, Gruppen, Glyphen und Belegungszustände; technische IDs erscheinen nirgends in der Oberfläche.
- Die bisherigen komplexen Facetten werden auf Gruppe und Cast-Form reduziert. Prompt-, Batch-, Role-, Tag- und Rendition-Filter entfallen mit V2.0.

## Fortschrittslog

### 2026-08-14 — Runde 1

- `AGENTS.md`, Screenshot, Referenzrepository und die V2.0-Task-Datei gelesen.
- Referenzfluss aus `Loadout`, `AbilityPicker`, `HUD`, `InputManager` und `App` vollständig auf das Ziel abgebildet.
- Rückbaugrenze festgelegt: VFX- und Settings-Inhalte bleiben; nur Katalog-/Prompt-Traceability und das komplexe Mehrfach-Loadout werden entfernt.

### 2026-08-14 — Runde 2

- `README.md` vollständig von den verbliebenen V2.0-Katalog-, Prompt-, Batch- und Mehrfach-Loadout-Aussagen bereinigt.
- „Adding another ability“ dokumentiert jetzt den direkten Vertrag aus Settings-Block, `ABILITY_GROUPS`, `ELEMENT_META`, `ELEMENT_SIGILS`, `ABILITY_TYPES` und Settings-Audit.
- Generierte Editor-Ordner sind in Dokumentation und Oberfläche nach Ability-Gruppen beschrieben und heißen nun „Generated variants (14)“.
- Den gesamten obsoleten V2.0-Abschnitt unter „Known rough edges“ entfernt; der weiterhin zutreffende Hinweis zur noch ausstehenden visuellen Prüfung des vereinfachten HUD/Picker-Flows bleibt bestehen.
- Kontrollsuche über alle vereinbarten Altsymbole und Begriffe im README liefert keine Treffer; P4 ist abgeschlossen.
- Weiterhin keine Tests, Builds, Dev-Server oder Browser-/Sichtprüfung ausgeführt.

### 2026-08-14 — Runde 3

- Live-Importe, Exporte, lokale Zielpfade und Package-Skripte statisch gegen die entfernte Katalog-/Mehrfach-Loadout-Architektur geprüft; keine verwaisten Verweise gefunden.
- Loadout-, Picker-, HUD-, App-, Input-, Aim-, Cooldown-, Event- und State-Verträge für die sechs Slots `Q`, `E`, `R`, `F`, `V`, `X` statisch bestätigt.
- Registry-Abdeckung für alle 20 Ability-Keys und das sechs Einträge lange `DEFAULT_LOADOUT` bestätigt.
- Alle 15 von `AbilityManager` importierten Engine-Klassen samt Konstruktor-Ketten geprüft: `new Type(context, element)` wird bis `Ability` und in element-parametrisierte Materialien konsistent weitergegeben.
- Den umbenannten Editor-Vertrag `_buildVariants()` und das sichtbare Label „Generated variants (14)“ bestätigt.
- Keine bestätigten Defekte; P2, P3 und P5 sind nach Implementierungs- und Vertragskontrolle abgeschlossen.
- Gemäß Auftrag weiterhin keine Tests, Builds, Dev-Server oder Browser-/Sichtprüfung ausgeführt.

### 2026-08-14 — Runde 4

- Die frühere Akte `2026-08-14-modern-loadout-library.md` unten append-only als durch diesen Sechs-Slot-Rückbau abgelöst markiert; historische Phasen und Entscheidungen blieben unverändert.
- Alle fünf Phasen dieses Auftrags sind abgeschlossen.
