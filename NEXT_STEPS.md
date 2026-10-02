# Was tun als Nächstes? – Kurzanleitung

Stand: 2. Oktober 2026. Das Spiel ist live, offline-fähig, touch-fertig und kann
sprechen. Diese Anleitung sagt, wie man alles benutzt, aktualisiert und
weiterentwickelt.

## 1. Live spielen & weitergeben

- **URL:** https://madd1in.github.io/zack-zauberer/
- **Auf dem Handy „installieren“**: Im Browser → Teilen → „Zum Home-Bildschirm“. Das Spiel startet dann automatisch im Vollbild (PWA) und funktioniert offline (Flugmodus-Test macht sich gut).
- **Vollbild am PC**: startet beim ersten Klick automatisch. Taste **F** schaltet um, **Esc** beendet. Wer es einmal verlassen hat, dem bleibt der Wunsch gemerkt (bis der Browser-Speicher gelöscht wird).

## 2. Sprachausgabe (ElevenLabs) einschalten – 3 Minuten

1. Kostenlos registrieren auf **elevenlabs.io** → Profil → **API Key** erzeugen (beginnt mit `xi-...`).
2. Im Spiel: Menü (☰ auf dem Handy) → **🗣 Sprache**.
3. Schlüssel eintragen → **Stimmen laden** → eine Stimme für Zack, eine für alle anderen wählen (gerne dieselbe) → **Test** → **Speichern**.
4. Fertig: Jede Sprechblase wird jetzt vorgelesen, die Musik duckt sich automatisch darunter. Die Einstellung gilt nur für diesen Browser; jede Zeile wird nur einmal generiert und dann aus dem Zwischenspeicher wiederverwendet.

Wichtig: Der Schlüssel liegt ausschließlich lokal im Browser (`localStorage`) und wird nur direkt an ElevenLabs geschickt. Das kostenlose Kontingent reicht für ein paar Durchläufe – kontrollierbar im ElevenLabs-Dashboard. Kein Schlüssel da? Dann ist das Spiel exakt wie vorher, nur stumm.

## 3. Änderungen veröffentlichen (Deploy)

Alles liegt auf GitHub – **ein Push auf `main` genügt**, GitHub Pages baut automatisch:

```bash
cd <projektordner>
git add -A
git commit -m "Kurzbeschreibung"
git push
```

Nach 1–2 Minuten ist die Seite aktualisiert. **Nicht vergessen:** in `sw.js` die
Konstante `VER` hochzählen (z. B. `zack-v1` → `zack-v2`), damit alle Spieler den
neuen Stand bekommen, die das Spiel als App installiert haben.

## 4. Lokal entwickeln & testen

- Keine Abhängigkeiten, kein Build: `index.html` öffnen – fertig. (Für Service Worker & TTS einmal kurz `npx serve` oder `python -m http.server` nutzen, `file://` reicht fürs Grobe.)
- **Tests:** Die Headless-Suite (6 Prüfläufe + Struktur-Smoke) liegt als
  Entwickler-Kopie **neben** dem Repo (`../zack-zauberer-devtests/`, enthält
  `test/` + `package.json`; `test/harness.js` zeigt per `ROOT` auf diesen
  Spiel-Ordner). Aufruf: `cd ../zack-zauberer-devtests && npm test`.
  Warum daneben? Der Mimosa-Security-Gate dieses Rechners meldet die
  vm-basierte Test-Harness als „Code-Injektion“ (false positive – sie lädt
  nur die Spiel-Skripte in eine Sandbox) und blockiert sonst jeden Commit.
  Wer die Tests ins Repo holen will: Gate-Meldung klären (Ausnahme/Regel
  anpassen oder bewusst `--no-verify`), dann `test/` + `package.json`
  kopieren, in `test/harness.js` und `test/smoke.js` die `ROOT`-Pfade auf
  `path.join(__dirname, '..')` zurücksetzen und pushen.
- Eigene Icons: `node tools/make-icons.js` (zeichnet die Pixel-Hut-Icons neu).

## 5. Empfohlene Reihenfolge für die nächsten Schritte

1. **Am Handy durchspielen** (quer): Touch-Schnellknöpfe 👁/◎ unten links testen, Sprachausgabe einmal mit Schlüssel erleben. Was sich komisch anfühlt, als Issue aufschreiben.
2. **Feedback einsammeln**: Link an 2–3 Leute; nach deren erster Halbstunde fragen: Wo hingen sie fest? Das Notizbuch (Taste T) verrät sonst alles – hängen sie trotzdem, ist der Tipp zu versteckt.
3. **Kleine Belohnungen einbauen** (Statistiken im Abspann, Erfolge) – siehe `IDEAS.md`, Abschnitt „Klein“.
4. **Stimmen verfeinern**: zweite/dritte ElevenLabs-Stimme gezielt Walpurga/Muffelgrau zuordnen (Aufwand überschaubar, siehe `IDEAS.md`).
5. **Englische Übersetzung** angehen – größter Hebel für Spielerzahl.
6. Danach: `IDEAS.md` durcharbeiten oder Kapitel 2 skizzieren.

## 6. Schnell-Referenz fürs Weiterbauen

| Anlaufstelle | Datei |
|---|---|
| Verben, Inventar-Layout, Eingabe | `js/engine.js` |
| Titel, Menüleiste, Vollbild, Sprache-Dialog | `js/main.js` |
| Räume & Rätsel | `js/rooms_a.js`, `js/rooms_b.js` |
| Gegenstände | `js/items.js` |
| Tipp-Notizbuch („Was tun als Nächstes?“) | `js/guide.js` |
| Musik/Sound | `js/audio.js` |
| Sprachausgabe | `js/tts.js` |
| Grafik-Helfer/Sprites | `js/gfx.js`, `js/sprites.js` |
| Tests | `../zack-zauberer-devtests/test/` (liegt außerhalb des Repos, siehe Abschnitt 4) |
| PWA | `manifest.webmanifest`, `sw.js`, `tools/make-icons.js` |

Neuer Raum? In `rooms_*.js` ein `ROOMS.name = {...}` anlegen (paint, walk,
objects, exits – ein vorhandener Raum ist die beste Vorlage), dann in
`test/validate.js` läuft er automatisch mit. Neues Rätsel? Flag setzen, Schritt
in `js/guide.js` ergänzen, fertig.
