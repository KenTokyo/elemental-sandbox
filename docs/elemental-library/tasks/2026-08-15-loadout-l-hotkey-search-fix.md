# Loadout-L-Tastenkürzel: unerwünschte Sucheingabe beheben

## Ziel
Beim Öffnen des Loadout-Pickers mit `L` darf das auslösende Zeichen nicht in das unmittelbar fokussierte Suchfeld gelangen.

## Phasen
- [x] Phase 1: Eingabefluss und Ursache untersuchen
- [x] Phase 2: Standardaktion des Öffnungs-Tastendrucks gezielt unterbinden
- [x] Phase 3: Änderung prüfen und dokumentieren

## Entscheidungen und Findings
- `InputManager` verarbeitet `KeyL` global und öffnet über `App` synchron den `AbilityPicker`.
- `AbilityPicker.open()` fokussiert und selektiert sofort das Suchfeld.
- Die Browser-Standardaktion des noch laufenden `keydown` kann dadurch das auslösende `l` in das neu fokussierte Suchfeld schreiben.
- Der Fix gehört an die Tastenkürzel-Quelle: Nur für `KeyL` wird `event.preventDefault()` vor dem synchronen Öffnen aufgerufen. So bleiben echte Texteingaben im bereits fokussierten Suchfeld unverändert möglich.

## Fortschrittslog (append-only)

### Runde 1 — Analyse
Screenshot und relevante Eingabepfade (`InputManager`, `App`, `AbilityPicker`) geprüft. Ursache ist der Fokuswechsel während desselben `keydown`, nicht die Filterlogik oder Persistenz.

### Runde 2 — Umsetzung
Im `KeyL`-Zweig von `InputManager` wird die Browser-Standardaktion jetzt vor dem `toggleLoadout`-Event verhindert. Andere Tasten und normale Eingaben im Suchfeld bleiben davon unberührt.

### Runde 3 — Abschluss
Den geänderten Kontrollfluss nochmals statisch geprüft: Bereits fokussierte Eingabefelder werden weiterhin frühzeitig ignoriert; nur das globale Öffnen per `L` erhält `preventDefault()`. Gemäß Auftrag und Projektregel wurden keine Tests oder Sichtprüfungen ausgeführt.
