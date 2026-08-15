# V3.3 — Signature Library von 60 auf 80 skulpturale VFX

## Auftrag

Dieselbe Signature Library wird um genau 20 weitere neue VFX erweitert (60 → 80). Skills und Namen
sind frei erfunden; jede Signatur ist skulptural, dimensional, leuchtend, dynamisch, klar lesbar und
hochwertig. Es gilt weiter die Regel aus V3.1/V3.2: eine neue Signatur ist eine **eigene Ability,
keine Umfärbung** — Silhouette, Timing und Palette werden gegenüber *allen* Geschwistern derselben
Engine verschoben, nicht nur gegenüber dem Basisblock. Registry, Picker, Sigel, Audit-Gates und
Dokumentation ziehen vollständig nach.

## Scope

- Projekt: `elemental-sandbox-curated-adjective-palette-v20.3-claude-opus-5-high-claude-code`,
  Stammport 6067.
- Kein neues Projekt, kein neuer Port, kein `pnpm install`, kein Dev-Server (Followup-Prompt-Regel
  in `AGENTS.md`).
- Acht neue Module: je Gruppe ein Hauptmodul mit drei Blöcken und ein Geschwistermodul mit zwei.
  **Der Split wird von vornherein gelegt, nicht nachträglich** — V3.2 hat zweimal nachbessern müssen
  (861 und 911 Zeilen), weil fünf Blöcke dieser Größe nicht in eine Datei passen.
- Ableitung per `derive()` ausschließlich von Generation 0/1 (den sechs handgeschriebenen Blöcken und
  den vierzehn aus `variants.js`). Die stehen beim Merge sicher, und die Merge-Reihenfolge in
  `settings.js` bleibt monoton.
- Vier Registry-Tabellen müssen alle 20 neuen Ids führen: `ABILITY_GROUPS`, `ELEMENT_META`,
  `ELEMENT_SIGILS`, `ABILITY_TYPES`.
- `DEFAULT_LOADOUT` bleibt bei sechs Slots auf Q/E/R/F/V/X.
- Keine Browser- oder Sichtprüfung; GLSL-Compile der neuen Blöcke bleibt unbestätigte Annahme.

## Phasen

- [x] P1 — Ist-Zustand lesen, Engine-Zuordnung, Gruppenschnitt und freie Ecken je Engine bestimmen
- [x] P2 — `signatures-synod.js` + `signatures-synod-descents.js`
- [x] P3 — `signatures-assize.js` + `signatures-assize-wards.js`
- [x] P4 — `signatures-escapement.js` + `signatures-escapement-hairlines.js`
- [x] P5 — `signatures-litany.js` + `signatures-litany-lashes.js`
- [x] P6 — `settings.js`-Merge, `ABILITY_GROUPS`, `ELEMENT_META`, `ABILITY_TYPES`
- [x] P7 — 20 Sigel in `glyphs-signatures-v33.js`, `CONSUMERS`/`CONDITIONAL`, Audits und Build grün
- [x] P8 — HTML-Titel, README-Zahlen, `PROJECTS.md`, Regeldateien committen

## Engine-Zuordnung

Fünfzehn Engines, zwanzig neue Ids: fünf Engines bekommen zwei, zehn bekommen eine. Doppelt bedient
werden **Thunder, Rain, Well, Rift und Blades** — genau die fünf, die bisher mit drei Ids die
dünnste Besetzung hatten. Die beiden Geschwister einer doppelt bedienten Engine liegen immer in
*verschiedenen* Gruppen, damit sie sich auch in der Palette nicht nahekommen.

Indigo Synod (`signatures-synod.js` + `-descents.js`) — Kobalt, Lapis, Porzellanweiß, kaltes Silber:

| Id | Label | leitet ab von | Engine | Cast |
| --- | --- | --- | --- | --- |
| `porcelain` | Porcelain Font | `glacier` | GlacierAbility | Zone |
| `azurite` | Azurite Filigree | `thunder` | ThunderAbility | Line |
| `indigo` | Indigo Vespers | `rain` | RainAbility | Zone |
| `lapis` | Lapis Gyre | `gravity` | WellAbility | Zone |
| `cobalt` | Cobalt Trellis | `snare` | SnareAbility | Zone |

Sanguine Assize (`signatures-assize.js` + `-wards.js`) — Ochsenblut, Zinnober, nasses Eisen, Rost:

| Id | Label | leitet ab von | Engine | Cast |
| --- | --- | --- | --- | --- |
| `sanguine` | Sanguine Furrow | `magma` | RiftAbility | Line |
| `vermilion` | Vermilion Sickle | `blades` | BladesAbility | Line |
| `garnet` | Garnet Bolide | `meteor` | MeteorAbility | Line |
| `carnelian` | Carnelian Aegis | `zero` | DomeAbility | Zone |
| `ferrous` | Ferrous Rose | `plasma` | BloomAbility | Zone |

Quicksilver Escapement (`signatures-escapement.js` + `-hairlines.js`) — Quecksilber, Chrom, Stahlblau:

| Id | Label | leitet ab von | Engine | Cast |
| --- | --- | --- | --- | --- |
| `flywheel` | Flywheel Governor | `cyclone` | CycloneAbility (crystal) | Zone |
| `quicksilver` | Quicksilver Thread | `beam` | BeamAbility | Line |
| `astrolabe` | Astrolabe Ring | `gate` | GateAbility | Zone |
| `mercury` | Mercury Rain | `rain` | RainAbility | Zone |
| `amalgam` | Amalgam Weld | `ice` | IceAbility | Line |

Brimstone Litany (`signatures-litany.js` + `-lashes.js`) — Schwefelgelb, Auripigment, Ocker, Braunrauch:

| Id | Label | leitet ab von | Engine | Cast |
| --- | --- | --- | --- | --- |
| `brimstone` | Brimstone Fissure | `magma` | RiftAbility | Line |
| `sulphur` | Sulphur Sump | `gravity` | WellAbility | Zone |
| `orpiment` | Orpiment Scythe | `blades` | BladesAbility | Line |
| `fulminate` | Fulminate Whip | `thunder` | ThunderAbility | Line |
| `ochre` | Ochre Pylon | `solar` | SpearAbility | Zone |

Cast-Verteilung: 11 Zone / 9 Line.

## Entscheidungen

- **Die freie Ecke wird vor dem ersten Zahlenwert gesucht, nicht danach.** Für jede der fünfzehn
  Engines sind zuerst die Werte *aller* vorhandenen Geschwister nebeneinandergelegt worden
  (programmatisch aus `settings`, nicht aus den Quelldateien geraten), und der neue Block besetzt
  einen Punkt, den keines von ihnen belegt. Das ist der Unterschied zwischen „anders gefärbt" und
  „andere Ability": bei Dome standen vor diesem Auftrag vier Punkte auf *Größe × Flachheit ×
  Kristallisation*, also musste `carnelian` eine fünfte Achse aufmachen — es ist die einzige Kuppel,
  die **gar nicht zerbricht** (`domeShatter` 0).
- **Nur Keys überschreiben, die auf dem Basisblock nachweislich existieren.** Vier Basisblöcke haben
  *keine* `colorBurst*`-Familie (`meteor`, `magma`, `plasma` und alles, was von ihnen erbt), also
  setzen `garnet`, `sanguine`, `brimstone` und `ferrous` sie auch nicht. Ein neuer Key wäre kein
  Fehler, sondern ein toter Regler, und `--strict` würde ihn melden.
- **Sechzehn Gruppen à fünf.** `ELEMENTS` wird weiterhin aus `ABILITY_GROUPS` abgeleitet.
- **Der 800-Zeilen-Split wird vorab gelegt.** Drei Blöcke + drei Blöcke ist bei diesen Engines
  ~450–550 Zeilen, zwei Blöcke ~300–400 — beides mit Luft. Das Hauptmodul spreizt das
  Geschwistermodul in dasselbe Objekt, das es ohnehin liefert, die Merge-Reihenfolge in
  `settings.js` bleibt also unberührt.
- **Sigel als drittes Glyph-Modul.** `glyphs.js` liegt bei 572 Zeilen, `glyphs-signatures.js` bei
  266. Zwanzig weitere Marken in eine der beiden zu legen hieße wieder auf die Grenze zuzulaufen;
  `ui/glyphs-signatures-v33.js` benutzt denselben `WRAP` aus `glyph-frame.js`.
- **Sigel-Regel unverändert plus die dritte aus V3.2:** Line-Cast auf der Diagonale, die er fliegt;
  Far-Cast um eine Ellipse, in die man hineinsieht; und gezeichnet wird das Merkmal, das gegenüber
  den Geschwistern derselben Engine verschoben wurde.

## Findings

- `tools/registry-check.mjs` importiert `ELEMENT_SIGILS` seit V3.2 statt sie zu scannen. Ein drittes
  Glyph-Modul kostet das Gate deshalb keine Zeile — der Spread wird mitgeprüft, inklusive der
  Gegenrichtung (ein Sigel ohne Picker-Gruppe fällt durch).
- `spinFalloff` ist ein *Multiplikator auf die Winkelgeschwindigkeit am Kamm*
  (`omega = spin · lerp(1, spinFalloff, h)`), nicht ein Abfall. Genau `1.0` ist damit der einzige
  Wert, bei dem die Säule als starrer Körper dreht — den hat bisher keine der sechs Cyclone-Ids, und
  er ist der ganze Lesewert von `flywheel`.
- `shaftTaper` landet als `uWidthTip` im Shader, ist also die Breite am *führenden* Ende. Über 1 ist
  legal und ergibt den Tropfen, den `mercury` braucht (bisheriges Maximum: `caustic` mit 1.0).
- `rimHeight` ist im Editor als „hop height" auf 0..3 gebunden; `cobalt` fährt es auf 2.6 und macht
  aus den Rim-Arcs gestapelte Reifen statt eines Rings am Fuß.
- `funnelCurve` ist der Exponent in `mix(funnelBase, funnelTop, h^curve)`. `funnelBase > funnelTop`
  ist bisher von keiner Cyclone-Id benutzt worden und ergibt den umgekehrten Kegel.
- Engine-Ceilings, die dieser Auftrag ausreizt: `MAX_JETS` 6 (Rift), `MAX_RAYS` 16 (Gate),
  `MAX_STRANDS` 20 (Bloom). Wo ein Wert am Ceiling steht, sagt es der Kommentar im Block.
- **`slashPitch` ist auf der Blades-Engine tot.** Der Key sitzt auf dem `blades`-Block, aber keine
  Zeile der Engine liest ihn — `dead-keys.js` führt ihn für jede Id dieser Engine. Der für
  `orpiment` entworfene Wert wurde deshalb fallengelassen statt als Regler ausgeliefert, der
  sichtbar nichts tut.
- **Neun Superlativ-Kommentare waren nach dem Merge falsch.** Ein Kommentar wie „das langsamste auf
  dieser Engine" ist gegen die Bibliothek geschrieben, wie sie beim Entwurf des Blocks stand; zwanzig
  neue Blöcke verschieben diese Decken darunter. Betroffen waren `sanguine` (basaltCount/jetWidth),
  `carnelian` (domeRise), `astrolabe` (ringShards), `mercury` (shaftLength), `sulphur` (discWobble),
  `quicksilver` (opacity/throb), `amalgam` (clumping) und `azurite` (lifetime/restrike). Alle neun
  sind gegen das gemergte `settings` neu hergeleitet und korrigiert — die Fehlerklasse bleibt aber
  strukturell: **kein Gate prüft Prosa gegen Zahlen.**
- `SpearAbility extends BeamAbility`. Wer Signaturen je Engine zählt, bekommt je nach Zählweise zwei
  verschiedene richtige Antworten: direkt zugeordnet trägt Beam 7, mit der Spear-Subklasse 11. Ältere
  Notizen nennen deshalb scheinbar widersprüchliche Zahlen, ohne falsch zu sein.

## Unsicheres

- Ohne Sichtprüfung ist unbestätigt, ob jede Zahl die Silhouette erzeugt, die ihr Kommentar
  behauptet, und ob der GLSL-Compile der neuen Blöcke sauber durchläuft.
- Ob sechzehn Gruppen à fünf im Picker-Raster ohne Scroll-Bruch lesbar bleiben, ist nur statisch
  geprüft.
- `petalDroop` bleibt bei `ferrous` auf 0 statt negativ: ob die Engine ein negatives Droop als
  Aufwärtskrümmung interpretiert, ist nicht belegt, und ein geratener Vorzeichenwechsel wäre genau
  die Art Fehler, die hier niemand sieht.

## Fortschrittslog

### 2026-08-15 — Runde 1

- `AGENTS.md`, die V3.2-Übergabe und den Ist-Zustand von `settings.js`, `registry.js`, `derive.js`,
  `AbilityManager.js`, beiden Glyph-Modulen und beiden Audit-Werkzeugen gelesen.
- Key-Sätze **und Werte** aller fünfzehn Basisblöcke sowie aller vorhandenen Geschwister je Engine
  programmatisch aus `settings` gezogen. Daraus die Tabelle „welche Ecke ist frei" je Engine — das
  ist die Grundlage jeder einzelnen Zahl weiter unten.
- Vier Engine-Semantiken an der Quelle geprüft statt geraten: `spinFalloff`, `shaftTaper`,
  `funnelCurve` und `rimHeight` (siehe Findings). Zwei davon haben die Auslegung eines Blocks
  geändert, bevor er geschrieben wurde.
- Engine-Zuordnung, Gruppenschnitt, Cast-Verteilung und der vorab gelegte 800-Zeilen-Split
  festgelegt; P1 fertig.

### 2026-08-15 — Runde 2 (Bauschicht, nachgetragen)

Diese Runde ist **nachgetragen**: die Bauschicht lief ins Zeitlimit, bevor sie ihren Log schreiben
konnte. Der Inhalt stammt aus der Übergabenotiz `History/PH2-…-2026-08-15_16h43.md` und ist von der
Folgeschicht am Code gegengeprüft, nicht aus der Erinnerung behauptet.

- P2–P5: alle acht Signaturmodule geschrieben, je Gruppe drei Blöcke plus Geschwistermodul mit zwei.
  Der vorab gelegte Split hält — größte Datei `signatures-litany.js` mit 566 Zeilen.
- P6: `settings.js`-Merge um vier Importe und vier `Object.assign`-Zeilen erweitert (Reihenfolge
  `… → synod → assize → escapement → litany`), vier Gruppen in `ABILITY_GROUPS`, 20 Einträge in
  `ELEMENT_META`, 20 Ids in `ABILITY_TYPES`.
- P7: `src/ui/glyphs-signatures-v33.js` als **drittes** Glyph-Modul angelegt (218 Zeilen, 20 Sigel,
  `SIGNATURE_SIGILS_V33`) und in `glyphs.js` eingehängt; `CONSUMERS` im Settings-Gate um alle 20 Ids
  erweitert, `CONDITIONAL` um `flywheel` (Cyclone-crystal plus `growTime` der GlacierMaterial-Schiene)
  und `astrolabe` (`growTime`).
- Neun falsche Superlativ-Kommentare nach dem Merge korrigiert (siehe Findings).
- Doku teilweise: HTML-Titel, `package.json`-Description, README-Zahlen und der V3.3-Abschnitt in
  „Known rough edges".
- **Offen geblieben:** `PROJECTS.md`, dieser Fortschrittslog, kein Commit.

### 2026-08-15 — Runde 3 (Abschluss P8)

- **Erst gemessen, dann geschrieben** statt die übergebenen Zahlen zu übernehmen: `pnpm run audit`
  grün (24 Module, 80 Blöcke, kein fehlender Key, 2929 tote Keys auf 48 Blöcken),
  `pnpm audit:registry` grün (80 Ids, 16 Gruppen à 5, 15727 finite Werte, kein `NaN`, 6 Loadout-Slots,
  Fingerprint `79ca92222472ea36` = aufgezeichnet), `pnpm build` grün mit 150 Modulen
  (1.451,67 kB / 376,35 kB gzip). Alle drei Zahlen der Übergabe haben gehalten.
- 800-Zeilen-Regel nachgezählt: unter `src/` liegt genau **eine** Datei darüber,
  `src/archive/abilities/EarthAbility.js` (835) — die wissentliche Ausnahme, aus der nichts
  außerhalb importiert.
- `PROJECTS.md`-Zeile auf V3.3/80 Signaturen gehoben und die vier Pflichtbausteine einzeln geprüft
  (`- **<ordner>**`, `— Port 6067`, `Start:` + Backtick mit `cd "<pfad>";`, `Stop:`, kein Fettdruck),
  dazu paarige Backticks und 0 Ersatzzeichen im File. Committet.
- **Eigener Fehler, korrigiert:** die V3.2-Zeile „`BeamAbility` 9 Signaturen" wurde zunächst als
  Zahlendreher auf 6 heruntergesetzt. Sie war richtig — `SpearAbility extends BeamAbility`, die drei
  Spear-Ids zählen mit. Zurückgesetzt und beide Zählweisen in `PROJECTS.md` benannt, damit die
  nächste Schicht nicht dieselbe Falle findet. Als Finding aufgenommen.
- README-Nachlese: der Punkt „Unread keys stay on their blocks" unter V20.3 wird von den Schichten
  **fortgeschrieben statt historisiert** (er trug zuletzt die V3.2-Zahl 2030/35/60) und stand damit
  veraltet da — auf 2929/48/80 gezogen. Die Anker `#eighty-signatures-fifteen-engines` und
  `#keeping-eighty-blocks-honest` zeigen auf die umbenannten Überschriften, ein Inhaltsverzeichnis
  gibt es nicht.
- Phasenhaken: P1–P8 stehen jetzt zu Recht auf `[x]`. In Runde 1 waren P2–P8 bereits abgehakt, bevor
  die Arbeit lief — die Haken sind seit dieser Runde durch gelaufene Gates gedeckt.
- Kein `pnpm install`, kein Dev-Server, keine Sichtprüfung (Followup-Regel in `AGENTS.md`).
