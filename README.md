# Zack – Zauberer wider Willen

Ein Point-and-Click-Adventure im Stil der 90er-Klassiker (Hommage an *Simon the Sorcerer*), komplett im Browser.

**Jetzt spielen:** https://madd1in.github.io/zack-zauberer/

Der 13-jährige Zack wird auf Omas Dachboden von einem Zauberbuch nach Fabulien gezogen. Dort muss er den in einen Gartenzwerg verwandelten Zauberer Grimbart retten und den eitlen Morbus Muffelgrau besiegen, der die ganze Welt grau zaubern will.

## Features

- Klassisches Verben-Interface (Gehe zu, Schau an, Nimm, Benutze, Rede mit, Gib …), Inventar und „Benutze X mit Y“
- 8 Räume, 10 Figuren mit Dialogbäumen, eine durchgehende Rätselkette
- Prozedural erzeugte VGA-Pixelgrafik (320×200), Chiptune-Musik und Soundeffekte per WebAudio
- **Sprachausgabe über ElevenLabs** (optional): echte Stimmen lesen alle Dialoge vor, Schlüssel bleibt lokal im Browser
- **PWA**: installierbar („Zum Home-Bildschirm“), startet im Vollbild und funktioniert offline
- Speichern/Laden, automatisches Speichern bei jedem Raumwechsel

Weitere Ausbau-Ideen: [`IDEAS.md`](IDEAS.md) · Anleitung für nächste Schritte:
[`NEXT_STEPS.md`](NEXT_STEPS.md)

## Steuerung

- Verb anklicken, dann ein Objekt in der Szene oder im Inventar
- Rechtsklick: Objekt anschauen
- Leertaste oder Klick: Sprechtext überspringen
- Tasten 1–9: Verb wählen (im Gespräch: Antwort wählen)
- Taste H gedrückt halten (oder Knopf „Hotspots“): alle anklickbaren Dinge markieren
- Taste T oder Knopf „Tipp“: Zacks Notizbuch. Zeigt das nächste Ziel und deckt auf Wunsch in drei Stufen Tipps auf. Nach drei Minuten ohne Fortschritt erscheint ein sanfter Hinweis darauf
- Vollbild: startet beim ersten Klick von selbst (Browser erlauben es nur nach einer Geste) und ist damit Standard. Taste F oder Knopf „Vollbild“ schaltet um, Esc beendet es – die Wahl wird gemerkt. Das Spiel füllt immer das ganze Fenster, Seitenverhältnis bleibt erhalten
- Menüleiste: schwebt oben, erscheint, wenn die Maus nach oben geht (Touch: Knopf ☰ oben rechts)
- Touch: antippen = Aktion, lange drücken = Anschauen, kleine Objekte werden mit etwas Toleranz getroffen. Schnellknöpfe unten links: **👁** Anschauen-Modus (Antippen wirkt wie langes Drücken) und **◎** Hotspots anzeigen. Im Hochformat erscheint ein Hinweis, das Gerät zu drehen
- Sprachausgabe: Menü → **🗣 Sprache** → einmalig ElevenLabs-API-Schlüssel eintragen, Stimmen wählen – danach werden alle Sprechtexte vorgelesen (jede Zeile wird nur einmal generiert)

## Lokal starten

Keine Abhängigkeiten, kein Build: `index.html` direkt im Browser öffnen.

## Aufbau

| Datei | Inhalt |
|---|---|
| `js/gfx.js` | Pixel-Puffer, Zeichen- und Raster-Hilfen |
| `js/sprites.js` | Figuren und Inventar-Symbole |
| `js/audio.js` | Chiptune-Sequencer und Soundeffekte |
| `js/tts.js` | Sprachausgabe über ElevenLabs (optional) |
| `js/engine.js` | Adventure-Engine: Verben, Inventar, Laufen, Dialoge, Speichern |
| `js/items.js` | Gegenstände |
| `js/rooms_a.js`, `js/rooms_b.js` | Räume, Rätsel und Dialoge |
| `js/guide.js` | Tipp-Notizbuch |
| `js/main.js` | Titelbild, Intro, Abspann, Menüleiste, Vollbild, Sprache-Dialog |
| `sw.js`, `manifest.webmanifest`, `tools/` | PWA: Offline-Cache, Install, Icons |

## Tests

Headless mit Node (keine Abhängigkeiten). Die Test-Suite liegt derzeit als
Entwickler-Kopie **neben** dem Repo (der Mimosa-Security-Gate des Rechners
meldet die vm-basierte Test-Harness als Code-Injektion – false positive, aber
blockiert Commits; die Tests bleiben solange außerhalb):

| Befehl (im Ordner mit `test/` + `package.json`) | Prüft |
|---|---|
| `node test/smoke.js` | Struktur und alle lokalen Referenzen von `index.html` |
| `node test/validate.js` | Räume, Ausgänge, Gehpunkte, Item- und Flag-Verweise, Render-Smoke aller Räume |
| `node test/fuzz.js` | jedes Verb auf jedes Objekt (mit/ohne Item) und alle Item-Kombinationen: keine Fehler, keine Hänger |
| `node test/ui.js` | Tastatur, Hotspot-Hilfe, Touch-Langdruck, Augen-Modus, Sprache-Dialog, Titelmusik-Start, Brunnen |
| `node test/display.js` | Vollbild, Fenster-Skalierung, Touch-Toleranz, Tipp-Notizbuch, Grafik-Politur in allen Räumen |
| `node test/music.js` | Kompositionen: Taktlängen und Akkordfolgen aller Stücke |
| `node test/walkthrough.js` | Bot spielt das ganze Spiel anhand des Tipp-Guides bis zum Ende durch |

## Aufbau der Musik

`js/audio.js` enthält zehn Stücke mit je 16 Takten. Melodien stehen in Tonleiterstufen (`1`–`7`, `'` = Oktave höher, `,` = tiefer, `:n` = Länge in Achteln), die Akkordfolge als Stufen pro Takt. Arpeggio, Bass, Pad und Schlagzeug werden daraus erzeugt, die Melodie bekommt ein weiches Echo.
