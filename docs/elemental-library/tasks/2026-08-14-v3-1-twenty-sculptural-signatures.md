# V3.1 — Signature Library von 20 auf 40 skulpturale VFX

## Auftrag

Die bestehende Signature Library wird um genau 20 zusätzliche skulpturale VFX erweitert (20 → 40). Jede neue Signatur ist eine eigene Ability, keine Umfärbung: Silhouette, Timing und Palette werden gegenüber dem Geschwisterblock derselben Engine verschoben. Registry, Editor, Audit-Gate und Dokumentation ziehen vollständig nach.

## Scope

- Projekt: `elemental-sandbox-curated-adjective-palette-v20.3-claude-opus-5-high-claude-code`, Stammport 6067.
- Kein neues Projekt, kein neuer Port, kein `pnpm install`, kein Dev-Server (Followup-Prompt-Regel in `AGENTS.md`).
- Neue Module: `src/config/signatures-forge.js`, `signatures-hoarfrost.js`, `signatures-umbra.js` und `signatures-drowned.js` — je 5 Blöcke, eine Datei je Picker-Gruppe, damit keine die 800-Zeilen-Grenze reißt (Umbra/Drowned in Runde 2 getrennt, Forge/Hoarfrost in Runde 3).
- Beide leiten per `derive()` aus `variants.js` vom *fertigen* Geschwistersignature derselben Engine ab, nie von den sechs Basisblöcken.
- Vier Registry-Tabellen müssen alle 20 neuen Ids führen: `ABILITY_GROUPS`, `ELEMENT_META`, `ELEMENT_SIGILS`, `ABILITY_TYPES`.
- `DEFAULT_LOADOUT` bleibt bei sechs Slots auf Q/E/R/F/V/X.
- Keine Browser- oder Sichtprüfung; GLSL-Compile der neuen Blöcke bleibt unbestätigte Annahme.

## Phasen

- [x] P1 — Auftrag, Engine-Zuordnung und Gruppenschnitt festhalten
- [x] P2 — `signatures-umbra.js` mit den fehlenden 10 Signaturen schreiben
- [x] P3 — Beide Module in `settings.js` mergen, `ABILITY_GROUPS` und `ELEMENT_META` erweitern
- [x] P4 — `ABILITY_TYPES` und `ELEMENT_SIGILS` um alle 20 Ids nachziehen
- [x] P5 — `CONSUMERS` erweitern, `pnpm audit:settings` und `pnpm build` grün bekommen
- [x] P6 — HTML-Titel, README-Zahlen und `PROJECTS.md` aktualisieren, Regeldateien committen

## Engine-Zuordnung

Forge (bereits geschrieben, `signatures-forge.js`):

| Id | Label | leitet ab von | Engine |
| --- | --- | --- | --- |
| `anvil` | Sunforge Anvil | `solar` | SpearAbility |
| `emberspire` | Emberspire | `sandstorm` | CycloneAbility (rock) |
| `emberreap` | Ember Reap | `blades` | BladesAbility |
| `aperture` | Solar Aperture | `gate` | GateAbility |
| `chorus` | Choral Ray | `beam` | BeamAbility |
| `comet` | Rime Comet | `meteor` | MeteorAbility |
| `rimefault` | Rimefault | `magma` | RiftAbility |
| `quartz` | Quartz Bastion | `glacier` | GlacierAbility |
| `maelstrom` | Maelstrom | `cyclone` | CycloneAbility (crystal) |
| `aurora` | Aurora Mantle | `zero` | DomeAbility |

Umbra (dieser Auftrag, `signatures-umbra.js` für die ersten fünf, `signatures-drowned.js` für die letzten fünf):

| Id | Label | leitet ab von | Engine |
| --- | --- | --- | --- |
| `eclipse` | Eclipse Column | `voidrail` | BeamAbility |
| `singularity` | Singularity Maw | `gravity` | WellAbility |
| `nightshade` | Nightshade Bloom | `plasma` | BloomAbility |
| `gravebind` | Grave Bind | `snare` | SnareAbility |
| `duskweave` | Dusk Weave | `thunder` | ThunderAbility |
| `abyssal` | Abyssal Vault | `tidal` | GlacierAbility |
| `deluge` | Ashen Deluge | `rain` | RainAbility |
| `obsidian` | Obsidian Thorns | `verdant` | IceAbility |
| `tarfall` | Tar Fall | `meteor` | MeteorAbility |
| `brine` | Brine Lance | `ice` | IceAbility |

## Entscheidungen

- **Ableitung nur vom Geschwister, nie vom Basisblock.** Ein Geschwister trägt exakt die Control Surface, die seine Engine liest, also kann keine Ableitung eine Key-Familie verlieren. Das ist der Grund, warum `variants.js` `borrow()` brauchte und diese beiden Module nicht.
- **Reihenfolge des Merges ist zwingend `variants → forge → umbra`.** Forge und Umbra derivieren von den fertigen 20; ein Merge davor liefert `undefined` als Base und kippt lautlos.
- **Vier Gruppen à fünf werden acht Gruppen à fünf.** `ELEMENTS` wird aus `ABILITY_GROUPS` abgeleitet, die Gruppengröße ist nirgends erzwungen, aber fünf hält das Kartenraster des Pickers gleichmäßig.
- **Umbra ist thematisch zweigeteilt:** `Umbral Covenant` (Leere, Schatten, Entladung) und `Drowned Choir` (schwarzes Wasser, Teer, Obsidian, Sole). Das trennt die zehn Blöcke lesbar von den beiden Forge-Gruppen `Emberforge Choir` und `Hoarfrost Reliquary`.
- **Nur Keys überschreiben, die auf dem Geschwisterblock nachweislich existieren.** Ein neuer Key wäre kein Fehler, sondern ein toter Regler; ein Tippfehler in einem bestehenden Key wäre stumm.
- **`tarfall` und `comet` teilen sich `MeteorAbility`,** so wie `cyclone`/`sandstorm` es heute schon tun. Beide werden über Timing (Bogen, Geschwindigkeit) und `trailPalette` auseinandergezogen: `comet` ist Dampf, `tarfall` ist rußige Absorption.
- **`brine` und `obsidian` laufen beide auf `IceAbility`,** wie `ice`, `permafrost` und `verdant` es bereits tun. Die Engine liest je Element denselben Key-Satz, deshalb ist das kein Sonderfall für das Audit — nur zwei weitere Ids in derselben `CONSUMERS`-Zeile.

## Findings

- `ELEMENT_SIGILS` ist ausdrücklich fehlertolerant (`sigilFor` fällt auf `''` zurück), also ist eine fehlende Glyphe der einzige stumme Registry-Fehler, der *nicht* kippt — sie bleibt trotzdem Pflicht, weil die Karte sonst leer wirkt.
- `ELEMENT_META` ohne Eintrag ist dagegen hart: Label, Blurb und `cast` fallen weg, die Ability wird als Line-Cast gezielt.
- `ABILITY_TYPES` ohne Eintrag heißt: kein Pool, `select()` verweigert, `cast()` gibt `null` — die Ability existiert in der Liste und tut nichts.
- `dead-keys.js` trägt aktuell 662 tote Keys; 20 neue geerbte Control Surfaces lösen zwangsläufig die Drift-Meldung aus und müssen mit `--write` neu erzeugt werden.

## Unsicheres

- Ohne Sichtprüfung ist unbestätigt, ob die neuen Zahlenbereiche innerhalb der Engine-Ceilings (`MAX_RINGS`, `MAX_TENDRIL`, `spikeCount`-Cap 288, `strands`-Cap 24/56) liegen. Wo ein Wert bewusst am Ceiling steht, sagt es der Kommentar im Block.
- Ob acht Gruppen à fünf im Picker-Raster ohne Scroll-Bruch lesbar bleiben, ist nur statisch geprüft.

## Fortschrittslog

### 2026-08-14 — Runde 1

- `AGENTS.md`, Übergabenotiz und den vollständigen Ist-Zustand von `variants.js`, `signatures-forge.js`, `settings.js`, `AbilityManager.js`, `glyphs.js` und `tools/audit-settings-keys.mjs` gelesen.
- Bestätigt: `signatures-forge.js` ist fertig, aber nirgends importiert; die Registry steht unverändert bei 20 Ids; `signatures-umbra.js` fehlt komplett.
- Engine-Zuordnung für die zehn Umbra-Signaturen festgelegt — sieben Engines, die Forge nicht benutzt hat (`Well`, `Bloom`, `Rain`, `Snare`, `Thunder`, `Glacier`/`tidal`, `Ice`/`verdant`), plus drei Zweitbelegungen (`Beam`/`voidrail`, `Meteor`, `Ice`).
- Gruppenschnitt auf acht Gruppen à fünf festgelegt; P1 abgeschlossen.

### 2026-08-14 — Runde 2

- Alle zehn Umbra-Signaturen geschrieben. Jeder Block überschreibt ausschließlich Keys, die auf dem Geschwisterblock nachweislich existieren; die Key-Listen dafür stammen aus den Override-Blöcken in `variants.js` beziehungsweise aus den Basisblöcken `ice`, `thunder`, `snare` in `settings.js`.
- **Modulschnitt korrigiert:** die zehn Blöcke ergaben 1328 Zeilen und damit deutlich über der 800-Zeilen-Grenze aus `AGENTS.md`. An der Gruppengrenze aufgeteilt in `signatures-umbra.js` (Umbral Covenant, 5 Blöcke, 665 Zeilen) und `signatures-drowned.js` (Drowned Choir, 5 Blöcke, 680 Zeilen). Der Merge in `settings.js` läuft dadurch über vier statt drei Zeilen: `variants → forge → umbra → drowned`.
- `settings.js`: drei Importe ergänzt, drei `Object.assign`-Zeilen nach `buildVariants` eingefügt, die zwingende Reihenfolge im Kommentar begründet; `ABILITY_GROUPS` auf acht Gruppen erweitert, alle 20 neuen Ids in `ELEMENT_META` mit Label, Akzentfarbe, Blurb und — bei 12 der 20 — `cast: CastShape.ZONE` eingetragen.
- `AbilityManager.ABILITY_TYPES` um alle 20 Ids ergänzt; `glyphs.js` um 20 neue Inline-SVG-Sigel, jedes aus dem Merkmal gezeichnet, das gegenüber dem Geschwister verändert wurde.
- `tools/audit-settings-keys.mjs`: `CONSUMERS` je Engine und je element-parametrischem Material um die neuen Ids erweitert. Bewusst **nicht** eingetragen: `emberspire` in `GlacierMaterial` — der Rock-Zweig von `CycloneAbility` baut keine Glacier-Instanz, genau wie `sandstorm` heute schon nicht gelistet ist. `CONDITIONAL` um `maelstrom` (Crystal-Zweig), `emberspire` (Rock-Zweig) und `growTime` für `maelstrom`/`aperture` ergänzt.
- `Editor._buildVariants()` berechnet die Zahl im Ordnertitel jetzt aus `ABILITY_GROUPS`, statt sie zu hardcoden — „(14)" war bereits vor diesem Auftrag falsch. Titel steht jetzt korrekt auf „Generated variants (34)".
- Gates: `pnpm audit:settings` grün — 24 Module, jeder gelesene Key existiert auf allen 40 Blöcken, für die das Modul instanziiert wird. `src/config/dead-keys.js` mit `--write` neu erzeugt: 1323 tote Keys auf 23 Blöcken (vorher 662 auf 12). `pnpm build` grün mit 106 Modulen.
- Registry-Gegenprobe über `ELEMENTS` gefahren: 40 Ids, 8 Gruppen, keine Dublette, kein fehlender Block, kein fehlendes `ELEMENT_META`, kein fehlendes Sigil. Cast-Verteilung 22 Zone / 18 Line, `castAnim` 17× `cast3`, 12× `cast2`, 11× `cast1`.
- Dokumentation: HTML-Titel auf `V3.1: Forty Sculptural Signatures – Elemental Sandbox`; README auf 40 Signaturen, acht Gruppen, die drei neuen Module, die Merge-Reihenfolge, „Generated variants (34)", 1323 tote Keys und einen neuen Abschnitt „Known rough edges → V3.1" gehoben. `PROJECTS.md` um den V3.1-Absatz ergänzt und sofort committet.
- Weiterhin kein `pnpm install`, kein Dev-Server, keine Browser- oder Sichtprüfung — Followup-Prompt-Regel aus `AGENTS.md`.
- Offen bleibt allein die unbestätigte visuelle Wirkung: GLSL-Compile der neuen Blöcke und die Frage, ob jede Zahl die Silhouette erzeugt, die ihr Kommentar behauptet. Alle sechs Phasen sind abgeschlossen.

### 2026-08-14 — Runde 3 (Schichtübernahme)

- Übernahme nach Zeitlimit: Ist-Zustand des Auftrags erst nachgemessen, statt ihn aus der Übergabe zu glauben. `pnpm audit:settings` grün (24 Module × 40 Blöcke, 1323 tote Keys), `pnpm build` grün mit 106 Modulen.
- Registry-Gegenprobe erneut gefahren: 40 Ids, 8 Gruppen à 5, `ELEMENT_META`/`ELEMENT_SIGILS`/`ABILITY_TYPES`/Settings-Block je Id vorhanden, keine Dublette, `DEFAULT_LOADOUT` unverändert 6 Slots. Zusätzlich geprüft: kein Block trägt einen `NaN`-Zahlenwert — das schließt einen falsch gereihten Merge nachweisbar aus, statt ihn nur zu kommentieren.
- **Eine Lücke gefunden und geschlossen:** `signatures-forge.js` stand mit 1139 Zeilen über der 800-Zeilen-Grenze aus `AGENTS.md`. In Runde 2 war dieselbe Grenze für Umbra/Drowned respektiert worden, für Forge aber nicht — die Datei trug beide Forge-Gruppen.
- An der bestehenden Gruppengrenze getrennt: `signatures-forge.js` behält `Emberforge Choir` (542 Zeilen), neu `signatures-hoarfrost.js` mit `Hoarfrost Reliquary` (619 Zeilen). Kein Blockinhalt geändert, nur verschoben; Destructuring je Datei auf die tatsächlich benutzten Basen gekürzt.
- Merge-Reihenfolge ist damit `variants → forge → hoarfrost → umbra → drowned`; Import, `Object.assign`-Zeile und die Begründung im Kommentar über dem Merge in `settings.js` nachgezogen.
- Alle vier V3.1-Module liegen jetzt unter 800 Zeilen (542/619/666/681). `variants.js` (1914) und `settings.js` bleiben darüber — Altbestand aus V20.3, außerhalb dieses Auftrags, hier nur festgehalten.
- Nach dem Schnitt erneut gemessen: `pnpm audit:settings` unverändert grün mit denselben 1323 toten Keys, `pnpm build` grün, Registry-Gegenprobe unverändert. README (Modulbaum, Regel 4, zwei Zählwörter, Rough Edges) und `PROJECTS.md` auf vier Module und die neue Reihenfolge korrigiert.
- Weiterhin kein `pnpm install`, kein Dev-Server, keine Sichtprüfung; GLSL-Compile bleibt unbestätigt.
