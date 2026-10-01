# Zack – Zauberer wider Willen

Ein Point-and-Click-Adventure im Stil der 90er-Klassiker (Hommage an *Simon the Sorcerer*), komplett im Browser.

**Jetzt spielen:** https://madd1in.github.io/zack-zauberer/

Der 13-jährige Zack wird auf Omas Dachboden von einem Zauberbuch nach Fabulien gezogen. Dort muss er den in einen Gartenzwerg verwandelten Zauberer Grimbart retten und den eitlen Morbus Muffelgrau besiegen, der die ganze Welt grau zaubern will.

## Features

- Klassisches Verben-Interface (Gehe zu, Schau an, Nimm, Benutze, Rede mit, Gib …), Inventar und „Benutze X mit Y“
- 8 Räume, 10 Figuren mit Dialogbäumen, eine durchgehende Rätselkette
- Prozedural erzeugte VGA-Pixelgrafik (320×200), Chiptune-Musik und Soundeffekte per WebAudio
- Speichern/Laden, automatisches Speichern bei jedem Raumwechsel

## Steuerung

- Verb anklicken, dann ein Objekt in der Szene oder im Inventar
- Rechtsklick: Objekt anschauen
- Leertaste oder Klick: Sprechtext überspringen

## Lokal starten

Keine Abhängigkeiten, kein Build: `index.html` direkt im Browser öffnen.

## Aufbau

| Datei | Inhalt |
|---|---|
| `js/gfx.js` | Pixel-Puffer, Zeichen- und Raster-Hilfen |
| `js/sprites.js` | Figuren und Inventar-Symbole |
| `js/audio.js` | Chiptune-Sequencer und Soundeffekte |
| `js/engine.js` | Adventure-Engine: Verben, Inventar, Laufen, Dialoge, Speichern |
| `js/items.js` | Gegenstände |
| `js/rooms_a.js`, `js/rooms_b.js` | Räume, Rätsel und Dialoge |
| `js/main.js` | Titelbild, Intro, Abspann, Menüleiste |
