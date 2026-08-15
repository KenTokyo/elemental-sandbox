# 800-Zeilen-Regel — Altbestand auf Modulgröße schneiden

## Auftrag

Der V3.1-Auftrag (40 Signaturen) ist abgeschlossen und beide Gates sind grün. Der einzige
konkret protokollierte offene Punkt aus Runde 3 ist die 800-Zeilen-Grenze aus `AGENTS.md`:
Sie wurde für die vier neuen Signaturmodule durchgesetzt, für den Altbestand aber
ausdrücklich offen gelassen. Dieser Auftrag schließt sie, ohne Verhalten zu ändern.

## Scope

- Projekt: `elemental-sandbox-curated-adjective-palette-v20.3-claude-opus-5-high-claude-code`, Stammport 6067.
- Kein neues Projekt, kein neuer Port, kein `pnpm install`, kein Dev-Server, keine Sichtprüfung
  (Followup-Prompt-Regel in `AGENTS.md`).
- **Reine Umschichtung.** Kein Zahlenwert, kein GLSL-Zeichen, keine Reihenfolge im
  Merge und kein öffentlicher Export ändert sich. Jede bestehende Importzeile im Projekt
  muss unverändert weiter auflösen — deshalb wird alles Verschobene an alter Stelle
  re-exportiert statt umgehängt.
- Gates je Phase: `pnpm audit:settings`, `pnpm build` und die Registry-Gegenprobe
  (40 Ids, 8 Gruppen, kein `NaN`).

## Ist-Messung vor der Arbeit

Quelldateien über 800 Zeilen (`src/`, ohne Assets):

| Datei | Zeilen | live? |
| --- | --- | --- |
| `src/config/settings.js` | 2172 | ja |
| `src/config/variants.js` | 1913 | ja |
| `src/ui/Editor.js` | 1868 | ja |
| `src/abilities/GlacierAbility.js` | 1319 | ja |
| `src/abilities/MeteorAbility.js` | 1081 | ja |
| `src/abilities/BeamAbility.js` | 1001 | ja |
| `src/archive/abilities/EarthAbility.js` | 946 | **nein** |
| `src/abilities/SnareAbility.js` | 856 | ja |
| `src/materials/VolumetricFireMaterial.js` | 842 | ja |
| `src/archive/materials/VolumetricFireMaterial.js` | 820 | **nein** |
| `src/abilities/CycloneAbility.js` | 805 | ja |

Ausgangsgates: `pnpm audit:settings` grün (24 Module × 40 Blöcke, 1323 tote Keys),
`pnpm build` grün mit 107 Modulen.

## Phasen

- [x] P1 — Umfang messen, Schnittplan je Datei festlegen
- [x] P2 — `settings.js`: sechs Basisblöcke und die Registry heraustrennen
- [x] P3 — `variants.js`: vierzehn Ableitungen auf Gruppenmodule verteilen
- [x] P4 — `Editor.js`: die sechs handgeschriebenen Panels heraustrennen
- [x] P5 — Ability-Engines und Materials über 800 schneiden
- [x] P6 — Gates, Registry-Gegenprobe, README und `PROJECTS.md` nachziehen

## Entscheidungen

- **Re-Export statt Umhängen.** `settings.js`, `variants.js` und `Editor.js` bleiben die
  Adresse, unter der der Rest des Projekts sie kennt. Wer heute `import { ELEMENT_META }
  from '../config/settings.js'` schreibt, schreibt es morgen genauso. Das hält den Diff
  auf die drei geschnittenen Dateien begrenzt, statt ihn durch dreißig Importzeilen zu ziehen.
- **`registry.js` importiert nichts.** Die Registry (`CastShape`, `ABILITY_GROUPS`,
  `ELEMENTS`, `DEFAULT_LOADOUT`, `ELEMENT_META`) hängt an keinem Zahlenwert. Sie in ein
  importfreies Modul zu legen ist der einzige Schnitt, der keinen Importzyklus mit
  `settings.js` erzeugt — deshalb bleiben `castShapeOf`/`zoneRadiusOf`, die `settings`
  lesen, in `settings.js` stehen.
- **`src/archive/` wird nicht geschnitten.** Kein Modul außerhalb von `src/archive/`
  importiert daraus; der Ordner ist geparkte Referenz, kein Bauteil. Ein Schnitt dort wäre
  Regelbefolgung ohne Leser. Wissentliche Ausnahme, hier festgehalten statt verschwiegen.
- **Schnitt an bestehenden Grenzen.** Jede neue Datei bekommt genau die Blöcke, die schon
  heute im Original hintereinanderstehen. Kein Block wird umsortiert, damit ein Diff
  „verschoben" von „geändert" trennen kann.

## Findings

- **`pnpm audit` hat das Projekt-Gate nie ausgeführt.** `audit` ist ein eingebautes
  pnpm-Kommando und beschattet das gleichnamige Skript — `pnpm audit` meldet
  „No known vulnerabilities found" aus der Registry und lässt `audit-settings-keys.mjs`
  ungelaufen. Das galt bereits vor diesem Auftrag. Der Gate-Aufruf heißt `pnpm run audit`;
  in README und Task steht jetzt überall `run`.
- **Kein V20.3-Variant leitet vom Storm Lance ab.** `buildVariants` destrukturierte
  `thunder` mit, benutzte es aber nie; `thunder` wird erst in V3.1 zur Basis (`duskweave`).
  Beim Schnitt entfernt und im Code als Zeile begründet, statt es stumm mitzuziehen.
- **Ein Block borgt inline.** `solar` ruft `borrow(snare, FIELD_KEYS)` selbst auf, statt
  die vorberechnete `snareField`-Familie zu nehmen. Der erste Importsatz der Gruppenmodule
  war deshalb zu knapp und kippte mit `ReferenceError` — vom Audit gefangen, nicht vom Build.
- `src/archive/` wird von keinem Modul außerhalb `src/archive/` importiert: 1766 Zeilen
  toter Referenzcode in zwei Dateien über der Grenze.
- **Ein Schnitt kann das Settings-Gate ungenauer machen, ohne es rot zu färben.** Ein
  ausgelagertes Modul fällt aus `CONSUMERS` und damit ins grobe Netz, das jeden Namen für
  alle 40 Blöcke als gelesen zählt — die Prüfung läuft weiter, misst aber weniger scharf,
  und die Tote-Keys-Liste schrumpft. Beim Cyclone-Schnitt genau so passiert; das Gate
  folgt Splits jetzt selbst und lässt ein verwaistes Teilmodul durchfallen.
- **Ein Mixin-Schnitt kann eine freie Variable erzeugen, die kein Gate sieht.** Eine
  zurückgebliebene Modulkonstante wird im verschobenen Body nicht zum Importfehler,
  sondern zur freien Variablen: Build grün, `ReferenceError` beim ersten Cast. Der
  Splitter prüft die Scratch-Sätze deshalb selbst, statt sich auf Build zu verlassen.

## Unsicheres

- Der Fingerabdruck deckt Werte ab, nicht Verhalten: dass `Editor.js` nach dem Schnitt
  dieselben Regler in derselben Ordnerreihenfolge baut, ist statisch geprüft, nicht gesehen.
- GLSL-Compile der Signaturen bleibt wie in V3.1 unbestätigt — keine Sichtprüfung erlaubt.

## Fortschrittslog (append-only)

### 2026-08-14 — Runde 1 (Schichtübernahme)

- `AGENTS.md`, Übergabenotiz `PH1-…-2026-08-14_22h26.md` und beide Task-Dateien gelesen.
  Der V3.1-Auftrag ist in allen sechs Phasen abgehakt; die Kurzpromptserie ebenfalls.
- Ist-Zustand nachgemessen statt geglaubt: `pnpm audit:settings` grün, `pnpm build` grün
  mit 107 Modulen. Beides deckt sich mit Runde 3, bis auf die Modulzahl (106 → 107), die
  der Hoarfrost-Schnitt erklärt.
- Offenen Punkt bestimmt: die 800-Zeilen-Regel, in Runde 3 für den Altbestand offen
  gelassen. Elf Dateien reißen sie, zwei davon in `src/archive/` und damit ohne Leser.
- Schnittplan je Datei festgelegt (siehe Entscheidungen); P1 abgeschlossen.

### 2026-08-14 — Runde 2 — Config-Schicht geschnitten (P2, P3)

- **Neues Gate `tools/registry-check.mjs`.** Die Registry-Gegenprobe lief in Runde 2 und 3
  als Wegwerfskript; sie ist jetzt fest und prüft je Id Block, `ELEMENT_META`, Sigil und
  `ABILITY_TYPES`, dazu Dubletten, Loadout-Slots und jeden Zahlenwert auf `NaN`. Die beiden
  quellprivaten Tabellen liest sie als Text, damit der Check nicht three.js importieren muss.
- **`--fingerprint`** hasht alle 7820 Werte über die 40 Blöcke. Das ist der Grund, warum
  dieser Auftrag „reine Umschichtung" behaupten darf statt nur zu hoffen: gemessener
  Ausgangswert `684cd1985362b882`, und derselbe Wert nach jedem Schnitt.
- Gate gegengeprüft, statt ihm zu glauben: `range: 15.0` → `15.001` auf einem Basisblock
  gesetzt, Hash kippt und der Check verlässt mit 1; zurückgesetzt, Hash wieder gleich.
  Als `pnpm run audit:registry` an die Kette gehängt.
- **P2 — `settings.js` 2172 → 415 Zeilen.** Die sechs handgeschriebenen Blöcke (1487 Zeilen)
  in `blocks-strikes.js` (353), `blocks-projectiles.js` (573) und `blocks-farcasts.js` (601),
  geschnitten entlang der Cast-Form: die beiden Far Casts bleiben zusammen. Sie werden an
  exakt der Position zurückgespreizt, an der sie standen, also ändert sich auch die
  Schlüsselreihenfolge nicht. Registry (`CastShape`, `ABILITY_GROUPS`, `ELEMENTS`,
  `DEFAULT_LOADOUT`, `ELEMENT_META`) in `registry.js` (315), das nichts importiert und
  deshalb keinen Zyklus bilden kann; `settings.js` re-exportiert alles fünf.
- Fallstrick dabei: `export … from` bindet den Namen nicht lokal. `castShapeOf` liest
  `CastShape` und `ELEMENT_META` selbst, beide werden zusätzlich importiert.
- **P3 — `variants.js` 1913 → 79 Zeilen.** Die vierzehn Ableitungen in
  `variants-dominion.js` (490), `variants-cataclysm.js` (639), `variants-ether.js` (530) und
  `variants-ether-rhythms.js` (275). `derive`/`borrow` in `derive.js` (46), damit die vier
  Gruppenmodule nicht auf `variants.js` zurückgreifen müssen, das sie selbst importiert;
  `variants.js` re-exportiert `derive` für die vier `signatures-*.js`.
- Alle drei Gates nach jedem Schnitt: `pnpm audit:settings` unverändert grün (24 Module,
  1323 tote Keys auf 23 Blöcken), `pnpm run audit:registry` grün mit unverändertem
  Fingerabdruck, `pnpm build` grün.
- Weiterhin kein `pnpm install`, kein Dev-Server, keine Sichtprüfung.

### 2026-08-14 — Runde 4 — Engines, Material, Abschluss (P5, P6)

- **Der Cyclone-Schnitt hatte `audit:settings` rot hinterlassen.** Runde 3 endete mit
  „`pnpm build` danach grün" — das Build war es, das Settings-Gate nicht. Ausgangsmessung
  dieser Runde: `src/config/dead-keys.js is stale`. Kein Zufallsschaden, sondern der
  Schnitt selbst: `cyclone-fx.js` steht nicht in `CONSUMERS`, fällt damit ins grobe Netz
  am Dateiende, und das Netz zählt jeden Namen für *alle* 40 Blöcke als gelesen. Der
  Schnitt hat also element-präzise Reads gegen „irgendwer liest das" getauscht und die
  Tote-Keys-Liste dadurch schrumpfen lassen. Genau die Sorte Regression, die dieser
  Auftrag nicht erzeugen darf.
- **Das Gate folgt dem Schnitt jetzt selbst.** `partsOf()` sammelt entlang der eigenen
  `./…`-Importe die Teilmodule eines Consumers und liest sie mit; auseinandergehalten
  werden sie am Namen, weil Engines, Materials und Support-Klassen hier `PascalCase.js`
  heißen und Schnittteile `kebab-case.js`. Die Teile kommen zusätzlich in `consumerFiles`,
  damit das Netz sie nicht ein zweites Mal und gröber liest.
- Damit das nicht beim nächsten Schnitt wieder stillschweigend kippt: ein `kebab-case.js`
  unter `abilities/` oder `materials/`, das kein Consumer importiert, lässt das Gate
  durchfallen. Gegengeprüft mit einer Wegwerfdatei — der Wächter beißt.
- **Der Beweis, dass Runde 3 sauber war, kam erst hier.** Nach dem Fix erzeugt der Audit
  wieder exakt dieselben 1323 toten Keys auf 23 Blöcken wie vor dem Cyclone-Schnitt.
  Nicht „vermutlich unverändert", sondern dieselbe Datei.
- **Der Splitter kann eine freie Variable erzeugen — das fängt kein Build.** Liest ein
  verschobener Body eine Modulkonstante, die zurückbleibt und nicht im `-scratch.js`
  steht, ist das kein Importfehler, sondern eine freie Variable: Rollup bündelt sie
  klaglos, und der erste Cast wirft `ReferenceError`. Weder `pnpm build` noch das
  Settings-Gate sehen das. `_split-engine.mjs` bricht deshalb jetzt hart ab, wenn ein
  Gruppen-Body einen Top-Level-Namen erwähnt, den sein Scratch-Satz nicht trägt.
- **P5 — fünf Engines geschnitten,** Scratch-Sätze aus der Messung statt aus der Hand:
  Glacier 1319→743 (`glacier-setup.js` 233, `glacier-fx.js` 364, `-scratch.js` 41),
  Meteor 1081→715 (212/183/40), Beam 1001→706 (314/31), Snare 856→588 (291/26). Die
  Methoden bleiben Prototyp-Methoden, per `Object.assign` am Dateiende gemischt, also
  bleibt `this` die Fähigkeit und ein verschobener Body darf weiter aufrufen, was blieb.
- **`VolumetricFireMaterial.js` 842→259.** Kein Mixin: 566 der 842 Zeilen waren *ein*
  Konstruktorargument. Vertex- und Fragmentquelle liegen als exportierte Strings in
  `volumetric-fire-glsl.js`, samt der `flameProfile`-Funktion, die beide interpolieren
  und sonst niemand liest. Mit acht Leerzeichen Einzug verschoben statt ausgerückt:
  Whitespace in einem Template-Literal ist Teil des Strings, GLSL ist er egal, aber
  „kein Zeichen geändert" ist so eine prüfbare Aussage — das Skript hat die Bytes
  gegengelesen, bevor es sich selbst gelöscht hat.
- Gates nach jedem einzelnen Schnitt gefahren, sechs Mal: Fingerabdruck blieb
  `684cd1985362b882`, tote Keys blieben 1323 auf 23 Blöcken, Build grün.
- **P6.** Keine Datei unter `src/` mehr über 800 Zeilen außer den zwei bekannten in
  `src/archive/` (946, 820). README-Modulbaum um die Schnittmodule und `registry-check.mjs`
  ergänzt, das Audit-Kapitel um den Split-Folge-Mechanismus; `PROJECTS.md` fortgeschrieben
  und committet. HTML-Titel `V3.1: Forty Sculptural Signatures – Elemental Sandbox`
  geprüft — erfüllt die Titelregel bereits und wird nicht auf einen Refactor umgeschrieben.
  Alle acht `tools/_*.mjs` gelöscht, `registry-check.mjs` und `audit-settings-keys.mjs`
  bleiben. Abschlussmessung nach dem Löschen: alle drei Gates grün, Build 133 Module.
- Weiterhin kein `pnpm install`, kein Dev-Server, keine Sichtprüfung.
