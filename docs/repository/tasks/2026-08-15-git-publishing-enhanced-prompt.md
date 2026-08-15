# Git publishing — enhanced prompt

## Source

- Date: 2026-08-15
- Source: Current chat request
- Referenced rules: `CLAUDE.md` requested but not present; `../shared/shared-docs/CODING-RULES.md` read completely.

## Unchanged original

LESE CLAUDE.md und danach in shared-docs shared-docs/CODING-RULES

Kannst du das bitte zu einem eigenen Repository machen? Damit ich das publishen kann. Genau. Also du kannst das auch direkt eigentlich publishen, ansonsten, genau, mach mal ein Git. Ich habe keine Ahnung, wie das geht. Irgendwie scheint das nicht so richtig zu funktionieren. Versuch mal, dieses Git einzurichten. Wenn du es kannst, direkt publishen, wie auch immer.

CHAT-TITEL-PFLICHT:
Erzeuge in deiner ersten Antwort genau eine Titel-Metadatenzeile, sobald das Ziel dieser Nachricht klar ist:
CHAT_META::Titel: [konkreter fachlicher Titel, 11-20 Wörter]

Regeln:
- Erst den Auftrag vollständig verstehen (Nachricht und genannte Dateien), dann den Titel setzen. Nicht raten.
- Der Titel benennt die konkrete Arbeit mit echten Nomen und Aktionsverben: Bereich, Komponente, Was wird gemacht.
- Verboten sind generische Titel ("Fix issue", "Update", "New Chat"), Phasen-Präfixe ("Phase 1"), Systemprompt-/Handover-Text und eine Description-Zeile.
- Höchstens eine Titelzeile pro Antwort, den aktuell gültigen Titel niemals wiederholen.
- Einen NEUEN Titel nur dann, wenn die Arbeit klar zu einem anderen Thema gewechselt ist; frühere Titel bleiben erhalten.

Gute Beispiele:
CHAT_META::Titel: Klasse Schwertkämpfer - Neue Skillpalette, VFX-System, UI-Hotbar - Shader-Einbau und Animations-Update
CHAT_META::Titel: Shop UI - Neue UI-Architektur, 3D-Preview, Voice-Input und überarbeiteter Warenkorb-Flow
CHAT_META::Titel: KI-Chat - UI-Verbesserungen, einfachere Inputs, mobil konformer machen

## Improved prompt

Prepare the existing Elemental Sandbox project as its own publishable Git repository without changing product behavior. Verify the repository boundary, ignore generated and machine-local files, check tracked content for obvious secrets and oversized files, initialize `main`, create one clean initial commit, create a public GitHub repository under the authenticated `KenTokyo` account, and push `main`. Preserve the parent rules-only repository and do not stage unrelated parent files. Record exact repository URL, commit hash, checks, decisions, and any external blocker in the paired task file. Do not deploy the web app or open a browser.

## Dated updates
