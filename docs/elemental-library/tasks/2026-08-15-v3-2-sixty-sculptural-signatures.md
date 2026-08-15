# V3.2 — Signature Library von 40 auf 60 skulpturale VFX

## Auftrag

Dieselbe Signature Library wird um genau 20 weitere neue VFX erweitert (40 → 60). Skills und Namen
sind frei erfunden; jede Signatur ist skulptural, dimensional, leuchtend, dynamisch, klar lesbar und
hochwertig. Wie in V3.1 gilt: eine neue Signatur ist eine **eigene Ability, keine Umfärbung** —
Silhouette, Timing und Palette werden gegenüber dem Geschwisterblock derselben Engine verschoben.
Registry, Picker, Sigel, Audit-Gates und Dokumentation ziehen vollständig nach.

## Scope

- Projekt: `elemental-sandbox-curated-adjective-palette-v20.3-claude-opus-5-high-claude-code`, Stammport 6067.
- Kein neues Projekt, kein neuer Port, kein `pnpm install`, kein Dev-Server (Followup-Prompt-Regel in `AGENTS.md`).
- Neue Module: `src/config/signatures-conclave.js`, `signatures-prismatic.js`, `signatures-ashfall.js`
  und `signatures-stormglass.js` — je 5 Blöcke, eine Datei je Picker-Gruppe, damit keine die
  800-Zeilen-Grenze reißt.
  **Korrektur Runde 2:** für zwei der vier hat das nicht gereicht (861 und 911 Zeilen). Siehe
  Fortschrittslog — sie tragen ihre letzten beiden Blöcke jetzt in einem Geschwistermodul.
- Ableitung per `derive()` vom Block, der die passende Control Surface bereits trägt — nie von einem
  Block, der noch nicht gemerged ist.
- Vier Registry-Tabellen müssen alle 20 neuen Ids führen: `ABILITY_GROUPS`, `ELEMENT_META`,
  `ELEMENT_SIGILS`, `ABILITY_TYPES`.
- `DEFAULT_LOADOUT` bleibt bei sechs Slots auf Q/E/R/F/V/X.
- Keine Browser- oder Sichtprüfung; GLSL-Compile der neuen Blöcke bleibt unbestätigte Annahme.

## Phasen

- [x] P1 — Ist-Zustand lesen, Engine-Zuordnung und Gruppenschnitt festlegen
- [x] P2 — `signatures-conclave.js` und `signatures-prismatic.js` schreiben
- [x] P3 — `signatures-ashfall.js` und `signatures-stormglass.js` schreiben
- [x] P4 — `settings.js`-Merge, `ABILITY_GROUPS`, `ELEMENT_META` erweitern
- [x] P5 — `ABILITY_TYPES` und `ELEMENT_SIGILS` um alle 20 Ids nachziehen
- [x] P6 — `CONSUMERS`/`CONDITIONAL` erweitern, `pnpm run audit` und `pnpm build` grün bekommen
- [x] P7 — HTML-Titel, README-Zahlen und `PROJECTS.md` aktualisieren, Regeldateien committen

> Die Haken P5–P7 standen am Ende von Runde 1 bereits gesetzt, obwohl nur
> `ABILITY_TYPES` fertig war. Runde 2 hat sie eingeholt statt sie zurückzusetzen;
> was wann wirklich lief, steht im Fortschrittslog.

## Engine-Zuordnung

Verdigris Conclave (`signatures-conclave.js`) — oxidierte Bronze, Patina, Jade, Tempelmechanik:

| Id | Label | leitet ab von | Engine | Cast |
| --- | --- | --- | --- | --- |
| `bellrose` | Bell Rose | `zero` | DomeAbility | Zone |
| `censer` | Censer Coil | `cyclone` | CycloneAbility (crystal) | Zone |
| `orrery` | Orrery Gate | `gate` | GateAbility | Zone |
| `verdigris` | Verdigris Seam | `ice` | IceAbility | Line |
| `pendulum` | Pendulum Fall | `solar` | SpearAbility | Zone |

Prismatic Assembly (`signatures-prismatic.js`) — farbloses Glas, Dispersion, weißer Kern:

| Id | Label | leitet ab von | Engine | Cast |
| --- | --- | --- | --- | --- |
| `prism` | Prism Cascade | `glacier` | GlacierAbility | Zone |
| `refraction` | Refraction Fan | `blades` | BladesAbility | Line |
| `lumen` | Lumen Spire | `beam` | BeamAbility | Line |
| `halation` | Halation Bloom | `plasma` | BloomAbility | Zone |
| `caustic` | Caustic Rain | `rain` | RainAbility | Zone |

Ashfall Legion (`signatures-ashfall.js`) — Knochenweiß, Holzkohle, matte Glut, Asche:

| Id | Label | leitet ab von | Engine | Cast |
| --- | --- | --- | --- | --- |
| `ossuary` | Ossuary Bind | `snare` | SnareAbility | Zone |
| `cinderveil` | Cinder Veil | `permafrost` | IceAbility | Line |
| `pyreclast` | Pyreclast | `meteor` | MeteorAbility | Line |
| `sepulcher` | Sepulchre Rift | `magma` | RiftAbility | Line |
| `ashmaw` | Ash Maw | `gravity` | WellAbility | Zone |

Stormglass Ascendancy (`signatures-stormglass.js`) — Violett-Elektrik, Cyan, schwarzes Glas:

| Id | Label | leitet ab von | Engine | Cast |
| --- | --- | --- | --- | --- |
| `tempest` | Tempest Fan | `thunder` | ThunderAbility | Line |
| `arclight` | Arc Light | `voidrail` | BeamAbility | Line |
| `stormglass` | Stormglass Bastion | `tidal` | GlacierAbility | Zone |
| `dynamo` | Dynamo Coil | `sandstorm` | CycloneAbility (rock) | Zone |
| `thunderhead` | Thunderhead | `zero` | DomeAbility | Zone |

## Entscheidungen

- **Alle fünfzehn Engines werden bedient, keine bekommt mehr als zwei neue Ids.** Die Verteilung ist
  Ice 2, Beam 2, Glacier 2, Cyclone 2, Dome 2 und je 1 für Thunder, Meteor, Snare, Gate, Spear, Rift,
  Well, Bloom, Blades, Rain. Das ist die einzige Verteilung, die 20 neue Blöcke auf 15 Engines legt,
  ohne dass eine Engine drei Geschwister gleichzeitig auseinandergehalten werden muss.
- **Zwei Dome-Signaturen in einem Auftrag sind bewusst extrem gegenläufig.** `bellrose` ist die
  kleinste, dickste, am schnellsten schließende Kuppel der Library (Radius 3.6, `domeRise` 0.22,
  `domePlates` 1.0), `thunderhead` die größte und flachste (Radius 8.0, `domeSquash` 0.34,
  `domePlates` 0.06). Zusammen mit `zero` und `aurora` stehen damit vier Punkte auf derselben Engine,
  die sich in *Größe × Flachheit × Kristallisation* nicht überlappen.
- **`derive()` liest nur Blöcke, die zum Zeitpunkt des Merges fertig sind.** Alle zwanzig leiten von
  den ersten zwanzig ab, nicht von V3.1-Signaturen. Damit bleibt die Merge-Reihenfolge in
  `settings.js` monoton und ein falsch gereihter Merge kippt weiterhin sichtbar über die NaN-Probe
  in `tools/registry-check.mjs`.
- **Nur Keys überschreiben, die auf dem Basisblock nachweislich existieren.** Drei Basisblöcke haben
  *keine* `colorBurst*`-Familie (`meteor`, `magma`, `plasma` — sie tönen ihre Shells direkt aus der
  Flammenpalette), also setzen `pyreclast`, `sepulcher` und `halation` sie auch nicht. Ein neuer Key
  wäre kein Fehler, sondern ein toter Regler, und `--strict` würde ihn melden.
- **Zwölf Gruppen à fünf.** `ELEMENTS` wird weiterhin aus `ABILITY_GROUPS` abgeleitet; die
  Gruppengröße ist nirgends erzwungen, aber fünf hält das Kartenraster des Pickers gleichmäßig.
- **Sigel folgen der bestehenden Regel:** Line-Cast auf der Diagonale, die er fliegt; Far-Cast um
  eine Ellipse, in die man hineinsieht. Jede neue Marke wird zusätzlich aus dem Merkmal gezeichnet,
  das gegenüber dem Geschwister verändert wurde.

## Findings

- `growTime` steht in `CONDITIONAL` für `materials/GlacierMaterial.js`, existiert aber in `src/`
  nirgends mehr. Der Eintrag ist inert (CONDITIONAL erlaubt nur, er erzwingt nichts) und wurde nicht
  erweitert — die neuen Cyclone- und Gate-Ids brauchen ihn nicht.
- `sandstorm` hat kein eigenes `spin` im Override, erbt es aber von `meteor` (dort die Taumelrate des
  Brockens). `dynamo` überschreibt es deshalb legal.
- `plasma` und `magma` erben von `meteor` und haben damit weder `colorBurstA/B/C` noch `burstShards`.
- Engine-Ceilings, die in diesem Auftrag bewusst voll ausgereizt werden: `MAX_SPIKES` 288 (Ice),
  `MAX_CHUNKS` 28 (Meteor), `MAX_SLASHES` 14 (Blades), `MAX_SHAFTS` 48 (Rain), `MAX_COILS` 8 und
  `MAX_RINGS` 12 (Beam), `MAX_STRANDS` 20 (Bloom), 32 (Cyclone), 36 (Well), 24 (Thunder),
  `MAX_SHARDS` 140 (Gate) und 240 (Cyclone), `MAX_BASALT` 150 und `MAX_NODES` 8/`MAX_JETS` 6 (Rift),
  `MAX_COLUMN` 16 (Snare). Wo ein Wert am Ceiling steht, sagt es der Kommentar im Block.

## Unsicheres

- Ohne Sichtprüfung ist unbestätigt, ob jede Zahl die Silhouette erzeugt, die ihr Kommentar
  behauptet, und ob der GLSL-Compile der neuen Blöcke sauber durchläuft.
- Ob zwölf Gruppen à fünf im Picker-Raster ohne Scroll-Bruch lesbar bleiben, ist nur statisch geprüft.

## Fortschrittslog

### 2026-08-15 — Runde 1

- `AGENTS.md`, die V3.1-Übergabe und den Ist-Zustand von `settings.js`, `registry.js`,
  `derive.js`, `variants.js`, den vier `variants-*.js`, `signatures-forge.js`, `AbilityManager.js`,
  `glyphs.js` sowie beiden Audit-Werkzeugen gelesen.
- Key-Sätze aller dreizehn Basisblöcke, die dieser Auftrag benutzt, programmatisch aus `settings`
  gezogen statt aus den Quelldateien geraten — das ist die Grundlage der Regel „nur existierende
  Keys überschreiben".
- Engine-Zuordnung, Gruppenschnitt und Cast-Verteilung (12 Zone / 8 Line) festgelegt; P1 fertig.

### 2026-08-15 — Runde 2

- Übernommen mit P5 halb offen: `ABILITY_TYPES` trug alle 60 Ids, `ELEMENT_SIGILS` noch 40.
- **Sigel als eigenes Modul statt in `glyphs.js`.** Die Übergabe hatte mit ~730 Zeilen gerechnet,
  die Rechnung ließ aber die 20 Map-Einträge und die Gruppenkommentare aus; real wären es ~785
  geworden — unter 800, aber ohne jede Luft für den nächsten Auftrag. Geschnitten in
  `ui/glyph-frame.js` (nur `WRAP`, damit beide Dateien denselben 100×100-Rahmen benutzen und kein
  Import-Zyklus entsteht) und `ui/glyphs-signatures.js` (die 20 Marken, 266 Zeilen). `glyphs.js`
  liegt danach bei 572 und spreizt `SIGNATURE_SIGILS` in `ELEMENT_SIGILS` hinein. Nur `sigilFor`
  wird außerhalb konsumiert (`HUD.js`, `AbilityPicker.js`), der Schnitt war daher folgenlos.
- **Der Schnitt hat sofort ein Loch im Gate aufgedeckt.** `tools/registry-check.mjs` las
  `ELEMENT_SIGILS` als *Text* aus `glyphs.js` und meldete prompt 20 fehlende Sigel, obwohl alle 60
  vorhanden waren. Ein Textscan hätte den Spread nie gesehen — und, schlimmer, auch einen Eintrag
  nicht, der auf `undefined` auflöst. Das Gate importiert die Tabelle jetzt (beide Glyph-Module
  sind reine String-Builder, es kommt kein three.js mit) und prüft zusätzlich die Gegenrichtung:
  ein Sigel für eine Id, die keine Picker-Gruppe führt, fällt durch.
- Die 20 Marken folgen der Regel aus P1 und einer dritten: gezeichnet wird das Merkmal, das
  gegenüber dem Geschwister derselben Engine verschoben wurde — bei `bellrose` die Ringe statt der
  Schale, bei `censer` die hängenden Blöcke statt des Trichters, bei `pyreclast` die Poren statt
  der Nähte, bei `orrery` die Bahnen statt der Membran.
- **Audit-Tabellen an der Quelle geprüft, nicht aus der Übergabe übernommen.** `SpearAbility extends
  BeamAbility` (deshalb steht `pendulum` in beiden Listen) und die Cyclone-Engine spaltet sich am
  `shardMaterial`: `censer` ist `crystal` → `GlacierMaterial`, `dynamo` ist `rock` →
  `MeteorMaterial`. Beides programmatisch bestätigt, bevor `CONSUMERS` angefasst wurde.
- `CONDITIONAL` um `censer` (Crystal-Ausnahme wie `cyclone`) und `dynamo` (Rock-Ausnahme wie
  `sandstorm`) ergänzt. Der inerte `growTime`-Eintrag blieb unangetastet.
- `node tools/audit-settings-keys.mjs` lief im ersten Anlauf ohne einen fehlenden Key durch; einzige
  Meldung war die erwartete `dead-keys.js`-Drift. Neu erzeugt: **2030 tote Keys auf 35 Blöcken**
  (vorher 1323 auf 23).
- `pnpm audit:registry`: 60 Ids, 12 Gruppen à 5, kein `NaN` unter 11807 Werten. Der Fingerabdruck
  ging von `684cd1985362b882` auf `69305969f74ab1c4` — 20 Blöcke sind dazugekommen, das war
  ausdrücklich keine reine Umschichtung, also mit `--write-fingerprint` bewusst neu gesetzt.
- **Falle für die nächste Schicht:** `pnpm audit` trifft pnpms *eingebautes* Vulnerability-Kommando
  und meldet „No known vulnerabilities found", ohne ein einziges Projekt-Gate zu laufen. Das Skript
  heißt `pnpm run audit`. Ist beim ersten Versuch genau so passiert.
- `pnpm build` grün mit 139 Modulen (1.389,69 kB / 363,15 kB gzip).
- **Beim Schlusscheck der 800-Zeilen-Regel zwei echte Verstöße aus Runde 1 gefunden**, die der
  Scope-Absatz oben ausdrücklich ausgeschlossen hatte: `signatures-ashfall.js` lag bei 861,
  `signatures-stormglass.js` bei 911 Zeilen — der Gruppenschnitt allein reicht bei fünf Blöcken
  dieser Größe nicht. Die jeweils letzten beiden Blöcke wanderten nach
  `signatures-ashfall-hollows.js` (Sepulchre Rift, Ash Maw) und `signatures-stormglass-cells.js`
  (Dynamo Coil, Thunderhead); das Gruppenmodul spreizt sie in dasselbe Objekt zurück, das es vorher
  schon lieferte, die Merge-Reihenfolge in `settings.js` bleibt also unberührt. Danach 548 / 340
  und 535 / 403 Zeilen. Dass es eine reine Umschichtung war, ist nicht behauptet, sondern belegt:
  der Fingerabdruck blieb über beide Schnitte auf `69305969f74ab1c4`. `pnpm build` danach grün mit
  141 Modulen (1.389,76 kB / 363,18 kB gzip); unter `src/` reißt jetzt nur noch die Grenze, was
  schon vorher wissentlich riss (`archive/abilities/EarthAbility.js` 946,
  `archive/materials/VolumetricFireMaterial.js` 820).
- Doku: `index.html`-Titel auf `V3.2: Sixty Sculptural Signatures – Elemental Sandbox`,
  `package.json`-Beschreibung von zwanzig auf sechzig. README auf 60/12/8 gehoben, vier
  Tabellenzeilen ergänzt, alle Zählwörter neu *gemessen* statt geschätzt (11807 Keys = 9584 Zahlen +
  2157 Farben; `castAnim` 21/20/19; 54 generierte Editor-Ordner mit 8803 Reglern nach dem
  Ausblenden toter Keys).
- **README stand exakt auf 800 Zeilen**, also auf der Grenze aus `AGENTS.md`. Die vier
  Engine-Tiefenkapitel (`The ice` / `The lightning` / `The beam` / `The snare`) wanderten wortgleich
  nach `docs/engine-notes.md`, die README hält an ihrer Stelle einen Zeiger; danach 724 Zeilen.
- `PROJECTS.md` um die V3.2-Angaben ergänzt — an derselben Zeile wie V3.1, weil Ordner und
  Stammport 6067 unverändert sind — und sofort committet (`3b33cc8`). Beim Commit fiel auf, dass
  ein zweiter Agent parallel in dasselbe Repo schreibt; beide Einträge stehen unversehrt
  nebeneinander, nachgeprüft über die Blob-Hashes.

## Offen

- Weiterhin unbestätigt und ohne Sichtprüfung nicht bestätigbar: GLSL-Compile der 20 neuen Blöcke,
  die tatsächliche Silhouette jeder Zahl, und ob die 20 neuen Sigel bei 34 px voneinander
  unterscheidbar sind.
- Ob zwölf Gruppen à fünf im Picker ohne Scroll-Bruch lesbar bleiben, ist nur statisch geprüft.
