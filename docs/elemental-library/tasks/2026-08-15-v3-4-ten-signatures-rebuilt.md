# V3.4 — Zehn beanstandete V3.3-Signaturen neu gebaut

## Auftrag

Zehn der zwanzig V3.3-Signaturen wurden vom User als fehlerhaft oder unlesbar gemeldet und werden
**deutlich anders** neu gebaut: `azurite`, `indigo`, `cobalt`, `vermilion`, `ferrous`, `flywheel`,
`astrolabe`, `mercury`, `brimstone`, `fulminate`. `ochre` bleibt ausdrücklich unangetastet — er ist
der einzige der Gruppe, den der User als in Ordnung bezeichnet hat, und damit die Kontrolle.

Die Ids bleiben. Geändert werden Zahlen, Sigel, vier Labels und alle zehn Blurbs.

## Scope

- Projekt: `elemental-sandbox-curated-adjective-palette-v20.3-claude-opus-5-high-claude-code`,
  Stammport 6067. Kein neues Projekt, kein neuer Port.
- Followup-Prompt-Regel aus `AGENTS.md`: kein `pnpm install`, kein Dev-Server, keine Sichtprüfung.
- Kein neuer Block, keine neue Datei unter `src/config/` — die Blockzahl bleibt bei 80 und die
  Gruppenzahl bei 16.
- Engine-Ceilings sind bindend: Gate `MAX_SHARDS` 140, Snare `MAX_RIM` 14, Bloom `MAX_PETALS` 6,
  Rain `MAX_SHAFTS` 48, Rift `MAX_JETS` 6.

## Entscheidung: eigene Akte statt Fortschreibung der V3.3-Akte

Die V3.3-Akte protokolliert das *Hinzufügen* von zwanzig Blöcken; ihre Phasen sind abgeschlossen und
ihre Engine-Zuordnungstabellen beschreiben einen Stand, der weiter gilt. V3.4 ist der gegenteilige
Vorgang — zehn bestehende Blöcke werden gegen ihre eigene erste Fassung ausgetauscht — und die
Ursachen gehören neben die neuen Werte, nicht ans Ende einer fremden Phasenliste. Getrennte Akte.

## Phasen

- [x] P1 — Ursache je beanstandetem Block aus den Zahlen herleiten, nicht aus dem Eindruck
- [x] P2 — Zehn Settings-Blöcke neu schreiben, jeder mit Doc-Kommentar über die Ursache
- [x] P3 — Vier Labels und zehn Blurbs in `registry.js`, Modul-Header nachziehen
- [x] P4 — Fünf Sigel `AZURITE`, `INDIGO`, `COBALT`, `VERMILION`, `FERROUS`
- [x] P5 — Fünf Sigel `FLYWHEEL`, `ASTROLABE`, `MERCURY`, `BRIMSTONE`, `FULMINATE`
- [x] P6 — `pnpm run audit`, Fingerprint bewusst neu setzen, `pnpm build`, 800-Zeilen-Regel
- [x] P7 — HTML-Titel, README, `PROJECTS.md`, Commit der Regeldateien

## Die zehn Ursachen

Jede ist aus den Zahlen ableitbar, nicht aus einem Renderbild — das ist der Grund, warum sie ohne
Sichtprüfung behebbar waren.

| Id | Ursache in der V3.3-Fassung | Gegenmaßnahme in V3.4 |
| --- | --- | --- |
| `azurite` | Bündel las sich wie jeder andere Bolt | breit an der Hand, gesammelt auf einen Punkt |
| `indigo` | Einschläge ohne Nachwirkung | sieben Lotschläge, jeder Ring überlebt die nächsten vier |
| `cobalt` | Rim und Tendrils machten es zum Snare-Zwilling | `rimArcs` 0, sechs Glieder zur Spitze |
| `vermilion` | `slashSpan` 5.8 rad = 332°, also ein Ring statt einer Sichel | zwei kurze Bögen auf kreuzenden Ebenen |
| `ferrous` | `petalWidth` 1.8 bei `petalSpan` 2.6 — eine Hülle, kein Blatt | fünf Arme über Kopf und bis auf den Boden zurück |
| `flywheel` | 96 Brocken auf `shardScale` 0.95 verdecken die Form, die sie zeigen sollen | Trommel einer Weite, 150 Körner auf 0.26 |
| `astrolabe` | 48 Stäbe länger als ihr eigener Radius auf dem kleinsten Reifen | größter Reifen, 128 flach liegende Zähne |
| `mercury` | `shaftTaper` 1.3 setzt das breite Ende nach vorn: eine Schnecke | 34 nahezu runde Perlen auf `shaftRate` 14 |
| `brimstone` | `basaltCount` 0 plus sechs Düsen im Verhältnis 50:1 | fünf niedrige breite Vents über Schotter |
| `fulminate` | `widthTip` 3.2 × `width` 0.16 = 0.51 m Halbbreite an der Spitze | Verjüngung invertiert, `widthTip` 0.18 |

## Vier neue Labels

Nur dort umbenannt, wo die Silhouette sich geändert hat — Filigree ist kein Horn, Trellis kein
Obelisk. Ids unverändert, es hängt nichts an einem Label.

| Id | V3.3 | V3.4 |
| --- | --- | --- |
| `azurite` | Azurite Filigree | Azurite Horn |
| `cobalt` | Cobalt Trellis | Cobalt Obelisk |
| `vermilion` | Vermilion Crescent | Vermilion Shears |
| `brimstone` | Brimstone Fissure | Brimstone Vents |

## Gates

| Gate | Ergebnis |
| --- | --- |
| `pnpm audit:settings` | OK — 24 Module, 2929 ungelesene Keys auf 48 Blöcken, **unverändert** |
| `pnpm audit:registry` | OK — 80 Ids in 16 Gruppen zu 5, 15727 endliche Werte, 6 Slots |
| `--fingerprint` | `79ca92222472ea36` → `939e45b63cc033df`, bewusst neu gesetzt |
| `pnpm build` | OK — 150 Module, 1451.60 kB, 771 ms |

Der Fingerprint-Bruch ist hier das *erwartete* Ergebnis: die Blockzahl blieb bei 80 und trotzdem
haben sich Werte bewegt, also genau der Fall, den `--fingerprint` melden soll. Neu gesetzt mit
`node tools/registry-check.mjs --write-fingerprint` — der Schreibweg, den die V3.3-Übergabe als
unverifiziert markiert hatte, ist damit belegt.

Dass die tote-Keys-Zahl bei 2929 auf 48 Blöcken stehen blieb, ist die Gegenprobe dafür, dass nur
Werte und kein Key-Bestand angefasst wurde.

## 800-Zeilen-Regel

Die längeren Doc-Kommentare haben die vier Gruppenmodule wachsen lassen; das größte ist
`signatures-litany.js` mit 582 nicht-leeren Zeilen und bleibt unter der Grenze. Über die Grenze
geriet stattdessen `README.md` (817 Zeilen nach dem V3.4-Abschnitt). Nach dem V3.2-Präzedenzfall
wurden die abgeschlossenen Rough-Edge-Listen V3.2/V3.1/V20.3 wörtlich nach
`docs/rough-edges-history.md` ausgelagert, Rücklink beidseitig; README steht danach bei 762 Zeilen.

Die zwei bekannten Ausreißer unter `src/archive/` (946 und 820) bleiben unangetastet — sie standen
schon vor dieser Aufgabe drüber und niemand importiert aus dem Ordner.

## Ein Superlativ kippte außerhalb der zehn

Die Vorschicht hat die Superlative *der zehn neuen Blöcke* nachgerechnet. Die Gegenrichtung war
offen: `sanguine` behauptete `basaltCount: 60, // the fewest on the engine` und in Prosa „Only
Brimstone Fissure raises less, and it raises none" — beides gegen die alte Fassung von `brimstone`
mit `basaltCount` 0. Die neue legt 40, also stimmt keine der beiden Aussagen mehr. Korrigiert:
sechzig bleibt wenig, aber `brimstone` legt weniger, dafür bei `basaltScale` 0.18 gegen 0.95, was
Schotter gegen gehobene Platten ist — der eigentliche Unterschied, und der hält.

Alle übrigen Querverweise wurden einzeln nachgemessen und stimmen: `vermilion` `slashTilt` 1.05
(zitiert in `signatures-litany-lashes.js`), `indigo` sieben Schäfte auf `shaftRate` 1.4 (zitiert in
`signatures-escapement.js`), `azurite` `strands` 7 (zitiert in `signatures-litany-lashes.js`).

Lehre für die nächste Erweiterung: ein geänderter Block entwertet Superlative in *fremden* Blöcken
genauso wie in den eigenen, und die Suche danach geht nur über die Label- und Id-Namen.

## Offen / unbelegt

- GLSL-Compile der zehn geänderten Blöcke ist unbestätigt; `pnpm build` prüft nur die Imports.
- Ob die zehn neuen Silhouetten und die zehn neu gezeichneten Sigel bei 34 px lesbar sind, kann kein
  Gate hier zeigen. Sichtprüfung ist laut `AGENTS.md` untersagt.
- Die Superlative in den neuen Doc-Kommentaren sind gegen den jetzigen Stand nachgerechnet, aber
  kein Gate vergleicht Prosa mit Zahlen — dieselbe strukturelle Lücke wie in V3.3.
- `slashPitch` bleibt auf der Blades-Engine tot; der frühere `slashPitch: 0.0`-Override auf
  `vermilion` wurde bewusst entfernt und nicht wieder eingetragen.
- `slashTilt` ist keine feste Neigung, sondern deterministische Streuung ±`slashTilt` je Stroke.
  Dass zwei Bögen sich kreuzen, ist damit wahrscheinlich, nicht garantiert.

## Log

**Runde 1** — Ursachenanalyse und zehn Settings-Blöcke neu geschrieben, vier Labels und zehn Blurbs
gezogen, Modul-Header nachgeführt, fünf Sigel neu. Zeitlimit vor den restlichen fünf Sigeln.

**Runde 2** — Die fünf offenen Sigel `FLYWHEEL`, `ASTROLABE`, `MERCURY`, `BRIMSTONE`, `FULMINATE`
gegen die neuen Doc-Kommentare gezeichnet: Trommel mit senkrechten Stäben statt umgekehrtem Kegel,
großer Teilkreis mit Limbus-Teilung und einem engen Bündel Peillinien statt sechzehn kurzer Speichen,
neun runde Perlen statt vier Schnecken, fünf niedrige Vents über Schotter statt hoher Nadeln, ein
sich zur Spitze schließender Strang statt zweier paralleler Linien mit Flare.

Danach Gates gemessen statt geschätzt (Zahlen oben), Fingerprint neu gesetzt, README-Split nach der
V3.2-Methode, HTML-Titel auf `V3.4: Ten Signatures Rebuilt – Elemental Sandbox`, README-Tabelle um
die vier seit V3.3 fehlenden Gruppenzeilen ergänzt — sie führte weiterhin nur 12 der 16 Gruppen, was
in V3.3 übersehen worden war.
