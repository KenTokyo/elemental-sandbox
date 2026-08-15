# Modernes Loadout-System und persistente Library-Filter

## Auftrag

Das bestehende Loadout-System und die Signature Library werden visuell modernisiert. Mehr Skills sollen gleichzeitig sichtbar sein, Such- und Facettenparameter kommen in ein Popover und werden lokal persistiert. Loadout-, Slot- und Skill-Auswahl müssen unmittelbar denselben aktiven Skill meinen.

## Scope

- Projekt: `elemental-sandbox-curated-adjective-palette-v20.3-claude-opus-5-high-claude-code`
- Bestehender Katalog-, Ability- und Cooldown-Vertrag bleibt unverändert.
- Keine Browser-/Sichtprüfung und keine Tests ohne ausdrücklichen User-Befehl.
- Filter-Persistenz ist versioniert, defensiv gelesen und gegen aktuelle Facetten validiert.
- Loadout-Belegungen selbst bleiben bewusst Sitzungzustand; persistiert werden nur Library-Suche und Filter.

## Phasen

- [x] P1 — Screenshots, `AGENTS.md`, Projektregistrierung und bestehende UI-/State-Flows analysieren
- [x] P2 — Signature Library mit Filter-Popover, aktiven Query-Chips und modernem Layout überarbeiten
- [x] P3 — Loadout-Übersicht erweitern und Skill-/Loadout-/Slot-Auswahl synchronisieren
- [x] P4 — HTML-Titel und Dokumentation aktualisieren, Änderungen statisch prüfen
- [x] P5 — Interaktions-Lifecycle und Persistenz-Randfälle statisch härten

## Entscheidungen

- Die virtuelle Liste behält feste Zeilenhöhe; das modernisierte Zeilendesign darf diese Invariante nicht brechen.
- Filter verschwinden aus der permanenten linken Rail und öffnen als Popover vom Header aus. So gewinnt die Ergebnisliste Breite und zeigt mehr Signatures.
- Aktive Suchparameter bleiben außerhalb des Popovers als einzeln entfernbare Chips sichtbar.
- Der Desktop-HUD zeigt alle Loadouts gleichzeitig als kompakte Matrix; Tabs markieren und fokussieren nur noch den aktiven Loadout.
- Ein Klick auf eine Skill-Karte übergibt immer auch ihren Loadout-Kontext.
- Eine erfolgreiche Slot-Zuweisung selektiert den zugewiesenen Skill sofort, ohne ihn automatisch scharfzuschalten.
- Cooldown verhindert nur das Scharfschalten, nicht die sichtbare Auswahl eines Skills.

## Findings und Risiken

- `LoadoutBook.locate()` liefert bei mehrfach belegten Signatures nur den ersten Treffer; ohne bevorzugten Loadout-Kontext springt die UI auf die falsche Seite zurück.
- `App.assignSlot()` aktualisiert bisher nur den Slot, nicht die aktive Ability.
- `App.armAbility()` prüft den Cooldown vor der Auswahl und lässt dadurch die sichtbare Auswahl veraltet.
- Der vorhandene Primärbutton behauptet eine Slot-Zuweisung, führt aber nur Auswahl und Schließen aus.
- Unter 1100 px wird die Detailansicht bisher vollständig versteckt.
- Der unvollständige V2.2-A14-Batch besitzt kein `manifest.js` und bleibt daher außerhalb des Live-Katalogs; dieser Task verändert den Batch nicht.

## Fortschrittslog

### 2026-08-14 — Runde 1

- `AGENTS.md` gelesen und Zielprojekt über `PROJECTS.md` sowie die gezeigte „Signature Library“ identifiziert.
- Vier Screenshots als Ausgangszustand berücksichtigt.
- Datenfluss von `App`, `HUD`, `SignatureLibraryView`, `LoadoutBook` und `VirtualList` kartiert.
- Umsetzung auf UI-Präferenzen, Popover, Mehrfachsicht und eindeutigen Auswahlkontext begrenzt.

### 2026-08-14 — Runde 2

- P2 abgeschlossen: permanente Filterrail durch ein fokussiertes Filter-Popover ersetzt.
- Suche, Sortierung, Facetten, Prompt-ID, Loadout-Filter, Tags und Scope werden unter einem versionierten `localStorage`-Key gespeichert.
- Restore validiert alle gespeicherten Werte gegen aktuelle Katalogfacetten und vorhandene Loadouts; veraltete Werte fallen auf sichere Defaults zurück.
- Aktive Parameter erscheinen als einzeln entfernbare Chips, die virtuelle Liste behält ihre feste Höhe von 68 px.
- Library auf ein breiteres Zwei-Pane-Layout mit responsiver Detailsektion umgestellt; die Detailansicht verschwindet auf schmalen Viewports nicht mehr vollständig.

### 2026-08-14 — Runde 3

- P3 abgeschlossen: alle vier Loadouts und damit 20 belegte Skills sind im Desktop-Dock gleichzeitig sichtbar.
- Loadout-Tabs und Gruppenüberschriften setzen den aktiven Tastaturkontext; der Skill am bisherigen Slotindex wird sofort ausgewählt.
- Skill-Karten übergeben ihren Quell-Loadout an `App`, wodurch doppelt belegte Signatures nicht mehr zum ersten Vorkommen zurückspringen.
- Klick auf Library-Zeile oder Rendition selektiert den Skill sofort; „Select skill and close“ benennt den Primärbutton jetzt korrekt.
- Eine Slot-Zuweisung selektiert den neu zugewiesenen Skill unmittelbar, ohne ihn scharfzuschalten.
- Cooldown blockiert nur noch das Scharfschalten, nicht mehr die sichtbare Auswahl.

### 2026-08-14 — Runde 4

- P2, P3 und P4 nach vollständiger statischer Kontrolle abgeschlossen.
- JavaScript-Syntax, DOM-Verträge und Callback-Signaturen der geänderten Dateien geprüft; `_renderFilterSummary()` ist trotz verschachtelter Template-Literale syntaktisch konsistent.
- Auswahl-, Loadout-, Slot-Assignment- und key-basierte Cooldown-Flows sind statisch konsistent und halten den sichtbaren aktiven Skill synchron.
- Defensives Lesen der Filterpräferenzen gehärtet: valides, aber ungeeignetes `localStorage`-JSON wie `null` oder ein Array fällt jetzt sicher auf Defaults zurück.
- CSS auf alte Kernselektorkonflikte, feste virtuelle Zeilenhöhe und responsive Dock-/Popover-Grenzen geprüft; `ROW_HEIGHT = 68` und `--row-height: 68px` bleiben identisch.
- HUD- und Library-Buttons erben die UI-Schrift nun explizit und sind damit unabhängig von Browser-Button-Defaults.
- Quell-HTML-Titel als `V20.3: Modern Loadout Library – Elemental Sandbox` bestätigt.
- Keine Tests, Builds, Dev-Server oder Browser-/Sichtprüfung ausgeführt; finale Optik und Laufzeitverhalten bleiben daher ausdrücklich nicht beobachtet.

### 2026-08-14 — Runde 5

- P5 als adversarialen zweiten statischen Härtepass abgeschlossen.
- Filteränderungen räumen eine nicht mehr sichtbare Selektion auf; Enter und Slot-Ziffern akzeptieren ausschließlich eine Signatur aus der aktuellen Ergebnisliste.
- Der modale Dialog schirmt sämtliche Tastendrücke gegen globale Spiel-Shortcuts ab, ohne native Eingabe-, Select- oder Button-Tasten zu kapern.
- Listbox-Zeilen sind aus der Tab-Reihenfolge entfernt, melden ihren Zustand über `aria-selected` und geben nach Pointer-Auswahl den Fokus an die tastaturbedienbare Listbox zurück.
- Der Filter-Popover gibt Fokus beim Schließen an seinen Trigger zurück; die Library ist geschlossen `inert` und hält den Tab-Fokus geöffnet zyklisch im Dialog.
- Debouncte Filterpräferenzen werden beim Schließen und Entsorgen unmittelbar geflusht, damit schnelle Navigation oder ein Reload keine letzte Änderung verliert.
- HUD-Loadout-, Library- und Skill-Buttons verwenden `click` statt ausschließlich `pointerdown` und funktionieren dadurch auch mit Enter oder Leertaste.
- `setElement()` prüft bei offener Library über `refresh()` erneut die aktuelle Ergebnisliste, sodass Assignment-Filter keine unsichtbare Detailselektion wiederherstellen.
- Alle gemeldeten Randfälle anschließend erneut statisch kontrolliert; der finale Tab-Trap schließt `tabindex="-1"`-Optionen explizit aus.
- Keine Tests, Builds, Dev-Server oder Browser-/Sichtprüfung ausgeführt; Laufzeit und finale Darstellung bleiben ausdrücklich nicht beobachtet.

### 2026-08-14 — Runde 6

- Finalen Tab-Trap-Selektor zusammenhängend bestätigt: Virtuelle Listbox-Optionen tragen `tabindex="-1"` und werden sowohl vom Button-Zweig als auch vom allgemeinen `tabindex`-Zweig ausgeschlossen; der fokussierbare Listbox-Viewport bleibt korrekt Teil des Fokuszyklus.
- Verborgene Popover-Controls bleiben durch den nachgelagerten `aria-hidden="true"`-Filter außerhalb der Fokusgrenzen; deaktivierte Controls werden ebenfalls nicht aufgenommen.
- Lifecycle- und Callback-Reihenfolge in `SignatureLibraryView`, `HUD`, `App`, `LoadoutBook` und `VirtualList` erneut statisch kontrolliert: Selektion, Assignment, Persistenz-Flush, Fokus-Rückgabe und Dispose-Reihenfolge sind konsistent.
- Kein neuer Defekt bestätigt; deshalb keine Codekorrektur und keine zusätzliche Implementierungsphase vorgenommen. P5 und der Auftrag bleiben abgeschlossen.
- Keine Tests, Builds, Dev-Server oder Browser-/Sichtprüfung ausgeführt.

### 2026-08-14 — Runde 7: Superseded

- Dieser abgeschlossene Zwischenstand ist durch [`2026-08-14-simple-reference-loadout.md`](2026-08-14-simple-reference-loadout.md) abgelöst.
- Das dort dokumentierte kompakte Sechs-Slot-Loadout ersetzt Katalog, vier Loadout-Seiten, Detailansicht, virtuelle Liste und komplexe Facetten vollständig; diese Akte bleibt ausschließlich als append-only Verlauf erhalten.
