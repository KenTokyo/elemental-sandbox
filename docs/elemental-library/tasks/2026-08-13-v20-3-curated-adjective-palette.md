# V20.3 — Curated Adjective Palette · Elemental Sandbox auf 20 Signature-VFX

**Projektordner:** `d:\CODING\React Projects\test-projects\elemental-sandbox-curated-adjective-palette-v20.3-claude-opus-5-high-claude-code`
**Quelle (read-only):** `d:\CODING\React Projects\test-projects\threejs-vfx-examples` — nie verändert.
**Seed:** `ELEMENTAL-FOLLOWUP-20` · **Modus:** Curated Adjective Palette · **Basis:** V20 (6 Signature-Abilities)
**Stack:** Vanilla JS + Vite + Three.js + handgeschriebenes GLSL, pnpm. Kein React, kein TypeScript.

## Ziel
Bibliothek von 6 auf exakt 20 Signature-VFX erweitern, verteilt auf vier Loadouts à fünf Slots.
Die 14 Ergänzungen werden allein aus den Namen abgeleitet — keine weiteren Skill-Beschreibungen.
Leitpalette (ungebunden an einzelne Namen): visuell *unmistakable/sculptural/dimensional/cinematic/vivid/legible/
compositionally balanced*, materiell *tactile/luminous/translucent/dense/atmospheric/richly layered/physically
suggestive*, zeitlich *deliberate/rhythmic/responsive/dynamic/sharply accented/lingering/satisfyingly resolved*,
gesamt *imaginative/cohesive/polished/premium/expressive/memorable/production-quality*.

## Bibliothek (fix)
| Loadout | Slots |
|---|---|
| Arcane Vanguard | Frost Lance · Storm Lance · Cinder Fall · Nova Beam · Voltaic Snare |
| Glacial Dominion | Glacial Crown · Permafrost Wake · Shard Cyclone · Boreal Gate · Absolute Zero |
| Cataclysm Engine | Solar Spear · Magma Rift · Gravity Well · Void Rail · Plasma Bloom |
| Wild Ether | Verdant Rupture · Sandstorm Coil · Tidal Prism · Spectral Blades · Celestial Rain |

## Architekturentscheidung (kurz begründet)
Die sechs bestehenden Abilities sind je ~700–1300 Zeilen bespoke Code. 14 weitere in dieser Bauart wären weder
kohärent noch wartbar. Stattdessen:

1. **Alles wird element-parametrisch.** `Ability`-Subklassen und Materials lesen nicht mehr `settings.ice`,
   sondern `settings[element]`. Damit trägt eine Engine beliebig viele Signaturen.
2. **Varianten statt Klone.** `src/config/variants.js` leitet die 14 neuen Settings-Blöcke deterministisch aus
   den sechs Basisblöcken ab (Deep-Clone + Overrides), sodass `settings.js` lesbar bleibt und jeder neue Block
   trotzdem vollständig im Editor liegt.
3. **Neun neue Engines** für die Silhouetten, die keine bestehende Engine liefern kann (Zyklon, Tor, Kuppel,
   Speer, Riss, Well, Blüte, Klingen, Regen) — gebaut auf zwei neuen generischen Materials
   (`ShellMaterial`, `StrandMaterial`) plus den bestehenden.

## Phasen
- [x] P0 — Quelle analysiert, Projekt kopiert, Port geprüft (~~6038~~ → ~~6066~~ → **6067**, siehe Runde 4)
- [x] P1 — Parametrisierung (Abilities, Materials, FissureSystem), Registry, 14 Settings-Varianten, Loadouts
- [x] P2 — Neue Shared-Materials: `ShellMaterial`, `StrandMaterial`
- [x] P3 — Neun neue Ability-Engines + `ABILITY_TYPES` auf 20 Einträge
- [x] P4 — UI: Loadout-Hotbar, `L`-Skill-Selector, Input, HUD, 20 Sigils
- [x] P5 — Editor-Sektion für die Ergänzungen, README, Start, PROJECTS.md
  - [x] Vite-Port 6067 + `strictPort`, HTML-`<title>`, `pnpm install`
- [x] P6 — Tote Editor-Regler: Audit-Rückwärtsprüfung, `dead-keys.js`, Editor-Filter (Runde 5)

## Log
### Runde 1 — Analyse & Setup
- Quelle gelesen: `Ability`/`AbilityManager`-Vertrag (spawn/update/destroy, Pooling, `settings[element]`),
  Partikel-Engine (GPU-simuliert, `RateEmitter`), `BurstSystem`, `DecalSystem`, `FissureSystem`,
  `RibbonGeometry`, `ProceduralGeometry` (Kristall/Asteroid/Bolt-Strip/Beam-Tube/Ring), Shader-Libs.
- Befund: `ELEMENT_META` + `CastShape` sind bereits eine Registry — die Erweiterung braucht keinen Umbau,
  nur Parametrisierung. Der Editor ist handgeschrieben (nicht aus `ELEMENTS` generiert), erweitert sich also
  nicht von selbst; für die 14 Ergänzungen kommt eine generierte, faul aufgebaute Sektion dazu.
- Ordner kopiert (99 Dateien, 16,3 MB, ohne `node_modules`/`.git`/`package-lock.json`).

### Runde 2 — P1–P3 (Vorschichten)
- Parametrisierung, Registry (`LOADOUTS`/`SLOT_KEYS`/`ELEMENTS`/`ELEMENT_META`/`LOADOUT_OF`),
  `variants.js` mit 14 Blöcken, `ShellMaterial`, `StrandMaterial`, `ShardCloud`, `ZoneField`, `StrandBundle`.
- Sieben der neun neuen Engines geschrieben: Cyclone, Gate, Dome, Spear, Rift, Well, Bloom.
- Korrektur: die Phasenhaken P3–P5 waren fälschlich als `[x]` gesetzt — oben richtiggestellt.

### Runde 3 — P3 abgeschlossen, Port korrigiert
- `BladesAbility.js` (CRESCENT, zwei Bundles: Klinge + Echo mit `echoDelay`-Verzögerung) geschrieben.
- `RainAbility.js` (SHAFT + `ZoneField`) geschrieben; Landepunkte spiegeln den Shader-Zeitplan exakt
  (`period = shafts × interval`, `seedA = s·37 + cycle·91`, `sqrt(hash11)·radius·inset`).
- Beide Engines tragen eine lokale `_hash11` = `noise.glsl.js#hash11`. **Nicht** `utils/math.js#hash11`
  verwenden — andere Formel, die Effekte lösen sich dann unbemerkt von ihren Strands.
- `AbilityManager.ABILITY_TYPES` auf 20 Einträge (15 Engines, 5 laufen doppelt), Konstruktor bekommt jetzt
  das Element (`new Type(this.ctx, element)`), `MAX_CONCURRENT` 4 → 3 (Raymarch-Last, `LightPool` = 6).
- **Port-Befund:** 6038 gehört laut `PROJECTS.md:57` bereits `martial-arts-katana-loadout-ledger-v15.2`.
  Neuer Stammport **6066** (in `PROJECTS.md` frei, zur Laufzeit nicht belegt), `strictPort: true` für
  `server` und `preview`. HTML-`<title>` gesetzt.
- Verifiziert: `node --check` über alle `src/**/*.js` fehlerfrei; `pnpm install` (three 0.185.1, vite 8.2.1)
  und `pnpm build` erfolgreich — 99 Module transformiert, d. h. alle Imports der 15 Engines lösen auf.
- Nicht verifiziert: kein Shader-Compile, kein Laufzeittest (`pnpm dev` noch nicht gestartet).

### Runde 4 — P4 und P5 abgeschlossen, Port erneut korrigiert
- **P4 (UI).** `InputManager`: `Q/E/R/F/V` = Slot 0–4, `Digit1`–`Digit4` = Loadout 0–3, `KeyL` =
  `toggleSelector`; `KeyX`/`Digit5`/`Digit6` entfernt. Die Tastatur kennt jetzt nur noch Indizes,
  keine Ability-Ids — `App` löst gegen `LOADOUTS[this.loadout].slots` auf.
- `App`: `loadout`-Zustand, `setLoadout` (behält den Slot, auf dem man stand), `toggleSelector`,
  `Esc` schließt erst die Bibliothek und danach den Cast. `selectAbility` blättert die Leiste
  automatisch auf das Heimat-Loadout, damit nie eine Fähigkeit aktiv ist, deren Karte man nicht sieht.
- `HUD`: alle vier Loadout-Seiten liegen gleichzeitig im DOM, sichtbar ist nur eine. Das ist der
  Grund, warum die Frame-Schleife weiter blind alle 20 Cooldowns treiben kann und ein Sweep auf
  einer verdeckten Seite trotzdem korrekt weiterläuft. Dazu Loadout-Tabs, `◎`-Marker für Fernwürfe
  auf der Karte und ein neuer Hilfetext.
- Neu `src/ui/SkillSelector.js` + CSS: Overlay mit 20 Karten in vier Spalten, Klick wählt und
  blättert, Scrim/Esc/`L` schließen. `glyphs.js` von 6 auf 20 Sigils; Leitregel: Linienwurf auf der
  Diagonale, Fernwurf um eine Ellipse — die Aiming-Art ist am Sigil ablesbar.
- **P5 (Editor).** `Editor._buildLibrary` erzeugt die 14 Blöcke aus den Settings statt sie
  auszuschreiben: `#rrggbb` → Farbwähler, ganze Zahlen ≥ 8 → Schrittweite 1, sonst Slider von 0 bis
  zum Dreifachen des Auslieferungswerts. Feste Sektionen (The cast / Timing / Light & feel / Shape /
  Colour). Jede Fähigkeit baut sich beim ersten Öffnen (`onOpenClose`), weil alle 14 zusammen rund
  1200 Controls sind.
- **Zwei echte Bugs gefunden und behoben** — über das neue statische Gate `tools/audit-settings-keys.mjs`
  (`pnpm audit:settings`), das jeden `c.foo`-Zugriff jeder Engine und jedes element-parametrischen
  Materials gegen alle Blöcke prüft, für die das Modul instanziiert wird:
  1. `settings.cyclone` fehlte die gesamte `trail*`-Familie plus `colorHot`, obwohl
     `CycloneAbility` für **beide** Signaturen ein `VolumetricFireMaterial` baut und jeden Frame
     synct. Behoben über `...meteorTrail` plus kalte Palette; `funnelVolume` bleibt 0.
  2. `settings.sandstorm` fehlte `ringRate` → die Druckringe des Sandstorm Coil sind nie
     entstanden, und der `RateEmitter` wäre dauerhaft auf NaN gelaufen. Behoben mit `ringRate: 0.9`.
  Zweigabhängige Zugriffe (Kristall- vs. Stein-Shard) stehen als begründete `CONDITIONAL`-Einträge
  im Audit, nicht als Ausnahme durchgewinkt.
- **Port erneut korrigiert:** 6066 gehört inzwischen `martial-arts-katana-loadout-systems-v15.4`
  (`PROJECTS.md:71`). Neuer Stammport **6067**, zur Laufzeit per `Get-NetTCPConnection` als frei
  geprüft, `strictPort: true` in `server` und `preview`.
- README auf 20 Signaturen umgeschrieben (Loadout-Tabelle, die 14 Kurzbeschreibungen, Steuerung,
  Projektstruktur, zwei neue Architektur-Abschnitte, ehrliche Limitierungen inkl. toter Editor-Keys).
- Verifiziert: `pnpm build` grün (100 Module), `node --check` über alle geänderten Dateien,
  `pnpm audit:settings` grün über 24 Module × 20 Blöcke, Dev-Server läuft auf 6067, `<title>` per
  HTTP-Abruf bestätigt, alle Kernmodule liefern über den Dev-Server 200 (Vite-Transform fehlerfrei).
- **Weiterhin nicht verifiziert:** kein GLSL-Compile und kein Bildnachweis — ohne Browser nicht
  feststellbar, und die Regeln dieses Repos verbieten die Sichtprüfung. Das ist die einzige offene
  Risikoklasse.

### Runde 5 — P6: tote Editor-Regler messbar gemacht und ausgeblendet
- **Der Server lief noch.** Die Übergabenotiz aus Runde 4 sagte, er sei durch das Session-Ende
  gestoppt worden — auf 6067 lauschte aber weiter PID 17400, und `Get-CimInstance Win32_Process`
  weist die Kommandozeile als das Vite dieses Projektordners aus. Damit gilt nach AGENTS.md
  „bereits gestartet", nicht „blockiert": kein zweiter Server, kein Portwechsel. `<title>` per
  HTTP erneut bestätigt. **Vor einem Neustart immer erst den Besitzer des Ports feststellen.**
- **Werkzeug-Falle gefunden (gilt für den ganzen Projektordner):** Das Regel-Repo in
  `test-projects` hat eine `.gitignore`, die `*` ignoriert und nur drei Dateien zurückholt.
  Ripgrep respektiert das, also liefert jede Suche über ein **Verzeichnis** in diesem Projekt
  stillschweigend *null* Treffer — `rg "cooldown" src` findet nichts, obwohl es sieben Dateien
  gibt. Suchen über einzelne Dateien sind nicht betroffen, was die Falle so heimtückisch macht.
  Immer `rg --no-ignore` verwenden. Ein falsch-negativer Grep hätte hier direkt zu falschen
  Löschungen geführt.
- **Audit um die Gegenrichtung erweitert.** Bisher prüfte `tools/audit-settings-keys.mjs` nur
  „Engine liest Key, den der Block nicht hat" (Absturzklasse). Die Umkehrung — „Block hat Key,
  den keine Engine liest" — ist die Klasse der toten Regler, weil der Editor seine Ordner direkt
  aus den Blöcken generiert. Statt der aus Runde 4 vermuteten zwei Familien sind es
  **662 Keys auf 12 der 20 Blöcke**, also über die Hälfte der generierten Regler.
- Die Rückwärtsprüfung ist bewusst zweistufig: element-präzise für die `CONSUMERS`-Module (dort
  ist bekannt, welche Engine für welches Element läuft) und ein grobes Netz über **alle übrigen**
  `src`-Dateien, in dem jeder `.foo`-Zugriff den Namen für alle zwanzig Blöcke lebendig hält.
  Ausgenommen sind `config/` (Deklarationsort), `archive/` (Altcode, der sonst tote Keys am Leben
  hielte) und `ui/Editor.js` — der Editor *rendert* Keys, er konsumiert sie nicht, und seine sechs
  handgeschriebenen Ordner nennen genau die Basis-Keys, die die Erbstücke maskiert hätten.
- **Belastbarkeit geprüft, bevor irgendetwas geändert wurde:** `veilBillow` wird von
  `FrostFieldMaterial` per `c.veilBillow` gelesen, aber das Material läuft nicht für `cyclone`/
  `gate` — dort korrekt als tot gemeldet, für `zero` korrekt *nicht*. Die einzige Lücke des Netzes
  wären Block-Aliase unter anderem Namen in den Engines; alle 30 Fundstellen heißen `c`, was
  `RECEIVERS` erfasst. Kein Destructuring im Baum.
- **Entscheidung: nicht löschen, sondern ausblenden.** Die Keys aus `variants.js` zu entfernen
  wäre die aufgeräumter aussehende und die falsche Lösung. Erstens unsicher — die Prüfung ist ein
  Regex über Quelltext, und ein einziger Fehlalarm macht aus einem lebenden Key `undefined` →
  `NaN` im Uniform → schwarzes Material, also genau die Fehlerklasse, die hier ohne Browser
  niemand sieht. Zweitens zirkulär: die Prüfung berechnet „ungelesen" *aus* den Blöcken, ein
  Pruning würde ihre eigene Eingabe leeren und die Liste wäre nie wieder nachprüfbar. Die Blöcke
  bleiben vollständig, kosten zur Laufzeit nichts und werden bei jedem Lauf gegen dieselbe volle
  Fläche gemessen.
- Umsetzung: `node tools/audit-settings-keys.mjs --write` erzeugt `src/config/dead-keys.js`;
  `Editor.generateBlock` bekommt die Menge als `skip`. Der Normallauf des Audits vergleicht die
  Datei mit dem Berechneten und **schlägt bei Drift fehl** (getestet: manipulierte Datei → Exit 1,
  Zeilenenden werden normalisiert, weil ein Windows-Checkout CRLF liefern kann). `--list` zeigt
  die Keys, `--strict` macht sie zum Fehler.
- **Zwei Befunde nebenbei.** `slashPitch` kommt im gesamten Baum ausserhalb der Settings *nirgends*
  vor — die Annahme aus Runde 4, die `slash*`-Jitter wirkten „nur CPU-seitig auf die Funken",
  stimmt für `slashPitch` nicht, der wirkt gar nicht. Und `shardRate` war auch im handgeschriebenen
  Ice-Ordner ein toter Regler (die Chips werden mit fester Anzahl als Burst emittiert, nicht über
  eine Rate); die Zeile ist raus, ein Kommentar erklärt warum.
- **Optimierungsvorschlag aus Runde 4 geprüft und verworfen.** „`RiftAbility`/`BloomAbility`
  sollten sich ein `VolumetricFireMaterial` teilen" ist kein sicherer Gewinn: der Kommentar in
  `RiftAbility.js:53` nennt das eigene Material pro Jet ausdrücklich als teure, gewollte
  Entscheidung — ein geteiltes Material gäbe jeder Säule denselben Seed, und vier identische
  Flammen auf einer Geraden lesen sofort als wiederholtes Sprite. `MAX_JETS` ist genau deshalb
  bei sechs gedeckelt. Wer die Bootzeit senken will, muss die Zahl der Raymarcher senken, nicht
  ihre Instanzen zusammenlegen.
- Verifiziert: `pnpm audit:settings` grün (jetzt inkl. Frischeprüfung), Drift-Erkennung an einer
  manipulierten Datei nachgewiesen, `node --check` über `Editor.js` und `dead-keys.js`,
  `pnpm build` grün mit 101 Modulen (+1 durch die generierte Datei), und der laufende Dev-Server
  liefert `dead-keys.js`, `Editor.js` und `variants.js` mit HTTP 200.
- **Unverändert offen:** der GLSL-Compile der 14 neuen Blöcke. Diese Runde hat daran nichts
  geändert — sie fasst weder Shader noch Uniform-Werte an, nur welche Regler der Editor zeichnet.
