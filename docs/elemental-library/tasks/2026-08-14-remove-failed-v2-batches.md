# Fehlgeschlagene V2.1-/V2.2-VFX vollständig entfernen

## Ziel

Die vom Nutzer als katastrophal bewerteten VFX aus `v2-1-a08` und `v2-2-a14` vollständig aus dem V20.3-Projekt entfernen. Die skalierbare Signature-Library-Foundation und die ursprünglichen 20 V20.3-Fähigkeiten bleiben erhalten. Auch die nur für diesen gescheiterten Versuch sichtbaren Benchmark-Briefs verschwinden aus der Oberfläche.

## Phasen

- [x] P1 — V2.1-/V2.2-Tasks, Batchstruktur, Discovery, Katalog, Audit, Library-UI und Dokumentation prüfen.
- [x] P2 — Beide Batchordner und Benchmarkmanifest entfernen.
- [x] P3 — Benchmark-spezifische UI-, Audit-, Export- und Preference-Logik zurückbauen.
- [x] P4 — README und Batchhistorie auf den entfernten Zustand aktualisieren.
- [x] P5 — Ausschließlich statische Referenz- und Zeilenprüfung; keine Tests oder Sichtprüfung.

## Entscheidungen

- Entfernt werden 16 castbare Einträge: je acht aus V2.1 und V2.2.
- Der Produktionskatalog fällt von 36 auf die ursprünglichen 20 V20.3-Einträge im Batch `core-v20-3` zurück.
- Die acht Benchmark-Briefs gehörten ausschließlich zum abgebrochenen Dosisexperiment. Obwohl sie nicht castbar sind, würden ihre Namen weiterhin sichtbar bleiben; deshalb werden Manifest und Briefs-Tab ebenfalls entfernt.
- Generische Foundation-Funktionen bleiben: skalierbarer Katalog, dynamische Batch-Discovery, Promptprovenienz, Filter, Virtualisierung und Loadout-Zuweisung.
- Der von V2.2 korrigierte Multi-Batch-Auditcode wird beim Entfernen der gesamten Benchmarklogik gegenstandslos; generische Katalogprüfungen bleiben erhalten.
- Bestehende V2.1-/V2.2-Taskdateien bleiben als append-only Historie erhalten und erhalten unten einen Entfernungshinweis.
- Keine Tests, Builds, Dev-Serverstarts, Browser- oder Sichtprüfungen ohne Nutzerbefehl.

## Findings

- Batches werden ausschließlich über `import.meta.glob('./batches/*/manifest.js')` entdeckt. Das Löschen der beiden Ordner entfernt alle 16 Einträge ohne zentrale Registryänderung.
- Die Library zeigt die acht fehlgeschlagenen Namen zusätzlich über `benchmark-manifest.js` in einem eigenen Briefs-Tab; nur Batchlöschung wäre daher sichtbar unvollständig.
- Loadout-Zuweisungen werden nicht persistent gespeichert. Nach Entfernung kann kein Slot dauerhaft auf eine gelöschte Entry-ID zeigen.
- Gespeicherte Library-Filter werden gegen aktuelle Facetten validiert; gelöschte Prompt-IDs fallen automatisch auf den leeren Filter zurück.

## Fortschrittslog (append-only)

### Runde 1 — 2026-08-14 — Entfernungsumfang bestimmt

- Projekt und beide abgeschlossenen Batchprotokolle vollständig geprüft.
- 16 VFX liegen vollständig in zwei isolierten Batchordnern; keine Engine-Datei wird außerhalb davon direkt importiert.
- Benchmarkmanifest, Briefs-Tab, Audit-Sonderlogik und Dokumentationsstellen als experimentgebundene Restflächen identifiziert.
- Reine Entfernung geplant; ursprüngliche 20 V20.3-Fähigkeiten und generische Library-Foundation werden nicht umgebaut.

### Runde 2 — 2026-08-14 — Fehlgeschlagene Produktionsartefakte entfernt

- Batchordner `v2-1-a08` und `v2-2-a14` mit zusammen 16 castbaren VFX vollständig gelöscht.
- `benchmark-manifest.js` entfernt, damit die acht gescheiterten Namen auch nicht als read-only Briefs in der Oberfläche verbleiben.
- Stale `dist/` gelöscht; das alte Bundle enthielt die entfernten Batches und darf nicht weiter als Vorschau dienen.

### Runde 3 — 2026-08-14 — Library auf reine 20er-Produktion zurückgebaut

- Briefs-Tab, Scope-State, Brief-Zeilen, Brief-Details und Benchmarkhinweise aus `SignatureLibraryView` entfernt.
- Preferences speichern keinen obsoleten Scope mehr; Katalogexport und Audit besitzen keine Benchmarkabhängigkeit mehr.
- Audit bleibt generisch für IDs, Settings, Provenienz, Loadouts und den synthetischen 1000-Einträge-Skalentest.
- Unbenutzte Brief-/Scope-CSS entfernt und die vorher 958-zeilige CSS-Datei in Basis plus responsive Footerdatei aufgeteilt; beide liegen unter 800 Zeilen.

### Runde 4 — 2026-08-14 — Dokumentation und Negativhistorie aktualisiert

- Root-README und Signature-Library-README beschreiben nur noch generische Batches, Provenienz, Loadouts und Skalierung.
- V2.1-/V2.2-Taskdateien jeweils append-only mit Nutzerurteil und Entfernungshinweis abgeschlossen.
- Core-V20.3-Dokumentation von der nicht mehr existierenden Benchmarkbeziehung bereinigt.
- HTML-Titel bleibt `V20.3: Modern Loadout Library – Elemental Sandbox`.

### Runde 5 — 2026-08-14 — Statischer Abschluss

- `SignatureLibraryView.js` per statischer Syntaxprüfung geprüft; keine Syntaxfehler und keine Scope-, Benchmark- oder Brief-Verzweigungen gefunden. Das einzige Wort „brief“ steht in einem generischen Renditions-Kommentar.
- Live-Quellen, Tools, README und nicht-historische Dokumentation enthalten weder Batch-/Manifest-/Scope-Bezeichner noch einen der acht entfernten Konzeptnamen.
- Unter `src/signature-library/batches/` liegt ausschließlich `core-v20-3`; dessen Manifest deklariert statisch genau 20 Produktionseinträge.
- Alle in diesem Cleanup geänderten Dateien bleiben unter 800 Zeilen; Höchststände sind README mit 791 und Library-Basis-CSS mit 790 Zeilen.
- `dist/` bleibt absichtlich entfernt. Keine Tests, Builds, Dev-Serverstarts, Browser- oder Sichtprüfungen ausgeführt.
