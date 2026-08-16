# V4 — Zehn Instant-Cast-Projektile mit echter Kollision und ein Testgegner

## Arbeitsordner

`d:\CODING\React Projects\test-projects\elemental-sandbox-curated-adjective-palette-v20.3-claude-opus-5-high-claude-code`
— Stammport 6067, bereits in `PROJECTS.md` registriert. Kein neues Projekt, kein neuer Port, kein
Install, kein Dev-Server (Followup-Regel aus `AGENTS.md`).

## Auftrag

Zehn **neue** auswählbare Projektil-Skills zusätzlich zu den bestehenden achtzig. Alle zehn sind
Instant-Cast-Skillshots: der Klick erzeugt sofort ein sichtbares Projektil, das mit echter Flugzeit
zum Welt-Zielpunkt fliegt. Kein Hitscan, kein Lock-on, kein Nachverfolgen. Nur eine echte Kollision
des fliegenden Körpers mit dem Gegner verursacht Schaden, genau einmal, danach ist das Projektil weg.

Dazu ein einzelner Testgegner mit Körper, Collider, sichtbarer Lebensenergie, Trefferreaktion und
Wiederherstellung.

## Der entscheidende Unterschied zu den bisherigen achtzig

Die achtzig bestehenden Signaturen sind reine VFX: `Ability#advance()` schiebt eine *Front* über die
Cast-Linie, erreicht `u >= 1` und löst `onImpact()` aus. Es gibt keinen Gegner, keinen Schaden und
keine Kollision im Projekt — der Einschlag ist ein Zeitpunkt, kein Ereignis.

V4 setzt daneben eine zweite Sorte Ability: einen Körper, der eine Bahn abfliegt und dessen
Wegstrecke *segmentweise* gegen die Zielkugel geprüft wird. Der Trick, der ohne Umbau der Basisklasse
auskommt: `advance(dt)` wird überschrieben und liefert `true` **entweder** am Zielpunkt **oder** im
Moment der Kollision. Die Basisklasse ruft daraufhin im selben Frame `onImpact()` auf — dort
entscheidet ein Feld `_hitTarget`, ob ein Kontakt-Impact oder ein Verlöschen gespielt wird.

Damit bleiben Phasenmaschine, Licht-Buchführung, Pooling und der Editor unverändert gültig.

## Entscheidungen

| Frage | Entscheidung | Grund |
| --- | --- | --- |
| Zielpunkt | bestehendes `AimController`-Linienziel | liefert bereits Ursprung, Richtung und geklemmte Distanz; kein zweiter Raycast nötig |
| Kollision | Segment↔Kugel je Substep, Substeplänge aus `stepLength` | ein 74-m/s-Projektil legt bei 60 fps 1,23 m pro Frame zurück und überspringt eine 0,85-m-Kugel sonst |
| Bahn | analytisch aus `travelled` abgeleitet, nichts aufgezeichnet | Projekt-Regel: eine Ability speichert Würfel, keine Meter — Editor-Änderungen greifen mitten im Flug |
| Trail | zwei Ribbons (Kern + Hülle) statt Partikelkette | die Nachwirkung muss zur Geschwindigkeit passen, ein Band liest sich bei 74 m/s, eine Perlenkette nicht |
| Gruppen | zwei neue Gruppen zu fünf | die Registry hält seit V3.3 durchgehend Gruppen zu fünf; 18 × 5 = 90 |
| Gegner | eigenes Modul unter `src/combat/`, nicht unter `abilities/` | er ist kein auswählbarer Library-Skill und darf in keiner Auswahlliste auftauchen |
| Lebensbalken | HTML-Overlay, aus der Weltposition projiziert | scharf in jeder Auflösung, kostet keine Draw-Calls, und die Schadenszahlen sind derselbe Kanal |

## Die zehn Signaturen

Jede hat eine eigene Silhouette, Größe, Geschwindigkeit, Bewegungsart und Materialwirkung — keine
zwei sind Farbvarianten voneinander.

| Id | Label | Körper | Tempo | Bewegung | Schaden |
| --- | --- | --- | --- | --- | --- |
| `lancet` | Prism Lancet | schlanke Glasnadel mit vier Finnen | 52 m/s | schnurgerade, rollt um die Achse | 95 |
| `slagshot` | Slag Mortar | prozeduraler Lavabrocken | 14 m/s | hoher Bogen, taumelt | 260 |
| `quill` | Bramble Quill | Dorn mit sechs Widerhaken | 26 m/s | Korkenzieher | 130 |
| `sabot` | Sabot Round | gedrungener Metallpfeil mit Leitwerk | 74 m/s | flach, das schnellste Geschoss | 165 |
| `chakram` | Gyre Chakram | Wurfring mit drei Innenklingen | 34 m/s | seitliches Pendeln, rotiert schnell | 145 |
| `novaseed` | Nova Seed | Kern in zwei gegenläufigen Käfigen | 20 m/s | vertikales Wiegen, pulst | 210 |
| `spindle` | Void Spindle | dunkle Doppelpyramide mit Trabanten | 30 m/s | breite S-Schlange | 175 |
| `caltrop` | Astral Caltrop | vierstachliger Kristallstern | 18 m/s | Bogen, überschlägt sich | 190 |
| `harpoon` | Tide Harpoon | Harpune mit nachlaufenden Perlen | 44 m/s | leichter Durchhang | 155 |
| `helix` | Helix Fang | zwei Klingen auf gemeinsamer Achse | 38 m/s | Doppelhelix, rotiert sehr schnell | 200 |

## Phasen

- [x] P1 — Akte, Architekturentscheidung, Schlüsselfläche der zehn Blöcke festlegen
- [x] P2 — `blocks-bolts-a.js` / `-b.js`, in `settings.js` eingespleißt
- [x] P3 — Registry: zwei Gruppen, zehn Metadaten-Einträge
- [x] P4 — `src/combat/`: Trefferfeld, Trainingsgegner, HTML-Overlay
- [x] P5 — `BoltAbility` + `bolt-bodies.js` + `bolt-fx.js` + Trail-Material
- [x] P6 — Engine-Zuordnung, zehn Sigel, Library- und HUD-Anzeige mit Schaden
- [x] P7 — App-Verdrahtung, Gates (`pnpm audit`, `pnpm build`), Titel, README

## Log

**Runde 1** — Architektur festgelegt (siehe Tabelle oben). Die Basisklasse bleibt unangetastet; der
Hebel ist ausschließlich das überschriebene `advance()`. Damit ist ausgeschlossen, dass eine der
achtzig bestehenden Signaturen ihr Verhalten ändert: keine davon erbt von `BoltAbility`.

**Runde 2** — Übernahme nach Schichtwechsel. Erster Fund vor jeder Codearbeit: **alle zehn in Runde 1
geschriebenen Dateien endeten mit einem Fremdmarker `</content>`** (die Akte zusätzlich mit
`</invoke>`). In jeder `.js`-Datei ist das ein Syntaxfehler — der Stand war zu keinem Zeitpunkt
lauffähig, unabhängig von den fehlenden Modulen. Marker in allen zehn Dateien entfernt, bevor
irgendetwas anderes angefasst wurde.

**Runde 3** — P5 wirklich abgeschlossen. `src/abilities/BoltAbility.js` (552 Z.) und
`src/abilities/bolt-fx.js` (522 Z.) geschrieben.

Abweichungen von der Spezifikation der Übergabe, jeweils mit Grund:

- **`speed` ist eine Bahngeschwindigkeit, keine Achsgeschwindigkeit.** Die Übergabe wollte
  `_travelled` in Achsmetern und Substeps aus `remaining / stepLength`. Beides unterschätzt eine
  gewobbelte Bahn: `quill` hat `weaveAmp` 0,52 bei `weaveFreq` 1,45 — die tatsächliche Bahn ist ein
  Vielfaches der Achsstrecke. Neu ist `_pathRate(s)`, die `_pathPoint` numerisch ableitet und
  Bahnmeter je `s` liefert. Damit fliegt ein Korkenzieher nicht mehrfach so schnell wie ein gerader
  Schuss, und die Substeps werden über die *geflogene* Bahn verteilt statt über ihren Schatten.
- **Kein Ease-in.** Die Basisklasse fährt die Front über 0,08 s hoch; bei einem Instant-Cast-Geschoss
  wäre das ein sichtbares Anfahren. `advance` startet auf voller Mündungsgeschwindigkeit.
- **Tumble um `side`, nicht um `heading × side`.** Letzteres ist ±up und wäre ein Gieren; `side` ist
  die waagerechte Querachse, also echtes Überschlagen.
- **`_fizzleFx` benutzt fest `BurstMode.AIR`**, nicht `impactMode` des Blocks. Das Vokabular des
  Endes ist selbst die Anzeige — ein Fehlschuss, der wie ein kleinerer Treffer aussieht, macht die
  zehn unzielbar.

**Runde 4** — P6/P7. `AbilityManager` (10 Einträge), `src/ui/glyphs-bolts.js` (10 Sigel) in
`glyphs.js` gespreadet, Schadenschip in `AbilityPicker._itemHTML` und `HUD._cardsHTML` (nur wenn
`settings[id].damage` existiert), `combat.css` in `index.html` verlinkt, Titel auf
`V4: Ten Instant Projectiles – Elemental Sandbox`, App verdrahtet (`CombatField` + `TrainingDummy` +
`TargetOverlay`, `combat` im AbilityManager-Kontext, `combat.update` **vor** `abilities.update`,
Anker je Frame projiziert, `clearEffects` ruft `combat.reset()`, `dispose` räumt beides ab).

Zwei Funde beim Verdrahten:

- **`bolt-bodies.js` hätte den Audit gerissen.** Der `cage`-Helfer hatte ein lokales `const c = …`;
  `RECEIVERS` in `audit-settings-keys.mjs` liest ein blankes `c.` als Settings-Zugriff, also wäre
  `rotation` als fehlender Schlüssel auf allen zehn Blöcken gemeldet worden. Lokale in `hoopXY/XZ/YZ`
  umbenannt, mit Kommentar warum.
- **Alle 105 Schlüssel werden gelesen.** `--list` meldet für keine der zehn Ids einen toten Key;
  `dead-keys.js` musste nicht neu geschrieben werden.

**Runde 5** — Gates. `node tools/audit-settings-keys.mjs` → OK (25 Module, 90 Blöcke, keine Drift in
`dead-keys.js`). `node tools/registry-check.mjs --write-fingerprint` → `b4ba0ca5bc0d3bd3`
(vorher `939e45b63cc033df`; Neuschreiben erwartet, da zehn Blöcke dazugekommen sind), danach
`--fingerprint` → OK. `pnpm build` → grün, 162 Module.

Achtung für später: `pnpm audit` läuft **nicht** das Skript aus der `package.json` — pnpm hat ein
eingebautes `audit` (Schwachstellen-Check), das den Skriptnamen verdeckt. Die Projekt-Gates heißen
`pnpm run audit:settings` und `pnpm run audit:registry`.

**Runde 6** — Verhalten direkt gegen die Engine geprüft (Wegwerf-Skript, danach gelöscht; das Projekt
hat regelkonform keine Testsuite). Stub-Kontext, Kugelziel auf (0, 1.44, −12), r = 0,86:

- alle zehn Ids: Volltreffer → **genau 1×** Schaden, exakt `settings[id].damage`;
- alle zehn, 6 m daneben gezielt → **0×**;
- alle zehn bei 12 fps → weiterhin genau 1× (Substeps entscheiden, nicht die Bildrate);
- `sabot` bei dt = 1/240, 1/60, 1/20, 0,25 s und 0,5 s → jeweils genau 1×, kein Tunneln, obwohl ein
  0,5-s-Frame 37 m trägt;
- Trefferrand exakt an der Summe der Radien (0,86 + 0,30 = 1,16 m): 1,10 m trifft, 1,25 m nicht;
- Ziel `isTargetable = false` → 0×; `dt = 0` über 300 Frames → 0× und `u` bleibt 0.

**Runde 7** — README auf V4 gehoben (Titel, Zählungen 90/16777/13595/3075, zwei Gruppenzeilen,
`combat/`-Layout, V4-Abschnitt „Known rough edges"). Dabei riss `README.md` mit 879 Zeilen die
800-Zeilen-Regel: Der V4-Tiefenteil ist nach `docs/engine-notes.md#the-bolts` gewandert, die
abgeschlossenen Listen V3.4 und V3.3 nach `docs/rough-edges-history.md`, beide mit Rückverweis.
Stand jetzt: README 786, engine-notes 212, rough-edges-history 149 Zeilen.

**Offen / bewusst nicht getan:** keine Sichtprüfung, kein Dev-Server, kein Install (Followup-Regel).
`PROJECTS.md` unverändert — Port 6067 war bereits registriert.

**Runde 8** — Nacharbeit an den drei offenen Punkten der Übergabe.

- **Phasenliste bestätigt.** P1–P7 stehen zu Recht auf `[x]`; die in Runde 3–7 nachgeholten Teile
  von P5/P6/P7 sind abgeschlossen, keine Rückdatierung nötig.
- **Überschriftenprüfung in `docs/engine-notes.md` fand einen kaputten Anker statt einer
  Ebenen-Drift.** Es gibt in dem V4-Teil gar keine `####`-Unterüberschriften — die Struktur trägt
  fette Absatzanfänger. Die Sektion stand aber als `## The bolts — V4` eine Ebene über den vier
  Original-Engines (`###`), obwohl der Einleitungssatz sie ausdrücklich als „the fifth section"
  neben sie stellt. Schwerer wog der Geviertstrich: der erzeugte Anker heißt `#the-bolts--v4`,
  während `README.md` auf `#the-bolts` zeigte — der Verweis lief ins Leere. Beides mit einem
  Schnitt behoben: `### The bolts (V4)` (Anker `#the-bolts-v4`), README-Link nachgezogen.
- **Zwei falsche Beschreibungen im `docs/`-Baum der README korrigiert.** `engine-notes.md` war
  weiter nur als „ice, lightning, beam and snare" geführt, obwohl der V4-Teil seit Runde 7 darin
  liegt; `rough-edges-history.md` war als „V3.2, V3.1 und V20.3" geführt, obwohl V3.4 und V3.3
  in derselben Runde dazugekommen sind. README steht danach bei 788 Zeilen.
- **`MAX_SUBSTEPS` (64) gegen die realen Blockwerte verifiziert** — der Deckel greift im Betrieb
  nie. `Time` klemmt `dt` hart auf 1/20 s, `global.timeScale` reicht bis 2, also ist der längste
  mögliche Frame 0,1 s. Weil `_pathRate` `speed` in Bahnmeter umrechnet, sind die Bahnmeter je
  Frame exakt `speed × dt`; der teuerste Block ist `sabot` mit 74 × 0,1 = 7,4 m bei `stepLength`
  0,2 → **37 von 64** Substeps. Alle übrigen neun liegen darunter (`lancet` 22, `harpoon` 19,
  `helix` 15). Erst der generierte Editor kann den Deckel erreichen: `autoRange` gibt `speed` bis
  `3 ×` Vorgabe (sabot bis 222) und `stepLength` bis auf die Klemme 0,05 herunter, dann wären
  111 Substeps nötig. Das ist trotzdem kein Tunneln: `CombatField#sweep` löst Segment↔aufgeblähte
  Kugel geschlossen, ist also *je Segment* exakt — der Deckel kostet Kurventreue, nicht Treffer,
  und bei 222 m/s ist die Bahn ohnehin fast gerade. Keine Codeänderung.

Reine Doku-Runde, keine Blockwerte angefasst — Fingerprint bleibt `b4ba0ca5bc0d3bd3`, Gates nicht
neu gefahren (nichts unter `src/` oder `tools/` geändert).

**Runde 9** — Meldung des Users: „ich finde die zehn Skills im Loadout nicht". Die mitgelieferte
Picker-Liste endete bei *Brimstone Litany*, also 16 Gruppen × 5 = 80. Kein Codefehler — ein
Betriebsfund, und einer, der wiederkommt.

- **Der Prozess auf Port 6067 bediente ein anderes Wurzelverzeichnis.** Belegt über HTTP am
  laufenden Server, ohne Browser: `<title>` war `V3.4: Ten Signatures Rebuilt`, `combat.css` fehlte
  im ausgelieferten `index.html`, `/src/config/registry.js` enthielt weder `kinetic` noch `astral`,
  und `/src/combat/CombatField.js` antwortete mit **`text/html`** — der SPA-Fallback, das heißt die
  Datei existierte unter *seiner* Wurzel gar nicht. Auf der Platte lag zur selben Zeit V4.1.
- **Die Kommandozeile führte in die Irre.** Sowohl der Node-Prozess als auch die Eltern-`cmd.exe`
  zeigten auf `…-v20.3-…\node_modules\.bin\vite.cmd`, also scheinbar auf dieses Projekt. Vites
  Wurzel ist aber das **Arbeitsverzeichnis** des Starts, nicht der Pfad der Binärdatei. Ein Start
  aus einem fremden Ordner heraus mit dieser `vite.cmd` sieht in `Win32_Process` identisch aus.
- **Konsequenz für die Identitätsprüfung:** Weder Portnummer noch Kommandozeile genügen. Belastbar
  ist nur ein Inhaltsabruf gegen den laufenden Server — Titel *und* eine Datei, die es nur im
  erwarteten Stand gibt. Ein 200er allein reicht nicht, der Content-Type muss mitgeprüft werden,
  sonst quittiert der SPA-Fallback jede beliebige Anfrage mit Erfolg.
- Alten Listener beendet, `pnpm dev` aus diesem Ordner neu gestartet, danach verifiziert: Titel
  `V4.1: Ground Decal Fill Budget – Elemental Sandbox`, `CombatField.js` und `BoltAbility.js` als
  `text/javascript`, 18 Gruppen-Ids im ausgelieferten `registry.js`, `Kinetic Assembly` und
  `Astral Ordnance` enthalten.
- Beim Aufräumen danach fiel auf, dass die V4.1-Schicht ihre Gates nie gefahren hatte —
  Fingerprint stand rot. Siehe `docs/performance/tasks/2026-08-16-permafrost-wake-ground-decal-nerf.md`,
  Phase 5. Der gültige Fingerprint ist jetzt **`ce521792d06caa59`**, nicht mehr `b4ba0ca5bc0d3bd3`.
- Startlog liegt als `dev-6067.log` im Projektordner (von dieser Runde erzeugt, nicht vom Projekt
  benötigt); löschbar, sobald der Server steht.

---

## Feedback-Notiz - 16.8.2026, 16:02:17

neuer arbeitsordner
FILE
./signature-vfx-unified-library-v21-gpt-5-6-sol - du darfst nur hier weiterarbeiten! kein neuen ordner erzeugen
. 

http://localhost:6117/domains/elemental/

Mach mir daraus auch einen Prompt, also einen kompakten Prompt. Also, ich teste gerade die Fähigkeiten, irgendwie sind die nicht schön geworden, diese zehn Fähigkeiten. Die wirken so ziemlich zu subtil, die müssten explosiver sein. Das muss mehr knallen. Ja, so ein bisschen mehr Wucht, keine Ahnung. Genau, den kompakten Prompt auch bitte direkt umsetzen. Also alle zehn Effekte noch mal anpassen. Ich glaube, der einzige, der mir gefällt, so wirklich, ist der Helix Fang, der ist ganz okay so. Die anderen sind so ein bisschen billig. Wichtig auch, erzeuge dann auch bitte fünf neue Effekte, so auch AOE. Also du hast jetzt Projektile erzeugt, aber auch so AOEs, die man quasi, die in dem Bereich explodieren und Damage zufügen, okay? Das ist auch völlig in Ordnung. Warte, ich schau mal weiter. Also die Explosion ist nice, aber das Partikel an sich ist halt manchmal etwas zu schnell und manchmal sieht das einfach noch nicht so hochwertig aus. Und wie das fliegt, ist so ein bisschen billig. Also es fliegt ganz komisch manchmal. Das ist das Problem, worauf ich hinaus will. Und manchmal ist das so zu low poly. Kann man das sagen? Und das sieht auch, das dreht sich ganz komisch. Das hat manchmal eine ganz komische Form. Ich weiß nicht, was ich dazu sagen soll. Aber die Explosionen sind schön, das ist nicht, worauf ich hinaus will. Die Explosionen ist nicht das Problem, das sind die Partikel eher gesagt. Genau. Erstelle auch am besten wieder fünf neue und die jetzigen auch ein bisschen anpassen, genau.
