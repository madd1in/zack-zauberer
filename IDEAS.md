# Ideen für Zack – Zauberer wider Willen

Sammlung von Ausbau-Ideen, grob nach Aufwand sortiert. Alles hier ist optional –
das Spiel ist vollständig spielbar. Abhaken, was gefällt, oder ergänzen.

## Frisch umgesetzt (2. Oktober 2026, Politur-Runden)

- Weiche Bodenschatten für alle Figuren und das Schaukelpferd
- Flackerndes Kaminlicht (Taverne), pulsierendes Kessellicht (Hexe, rosa nach Trank), Feuerschalen mit Glow am Turmtor
- Wasser-Schimmern im Stinkesumpf, Vögel über Lichtung und Dorf, Brunnen-Glitzern, fallendes Eichenblatt
- Blitz und Donner am Dachboden (alle 14 s, Donner folgt versetzt)
- Zack blinzelt, wenn er steht; Sternschnuppe im Titelbild
- Musik: eigener düsterer Track „Turmtor", dezente Stereo-Aufteilung (Melodie rechts, Arpeggio links), neuer Donner-Effekt
- Raum-Klänge: Regen am Dachboden, Wind am Turm, Gemurmel + Klirren in der Taverne, Blubbern im Sumpf, Vogelzwitschern draußen
- Leise Schrittgeräusche im Gehrhythmus
- Foto-Modus (Taste P blendet alles Überlagerte aus), Sprech-Log („Log" im Menü), Abspann-Statistik (Spielerzeit / angeschaut / Tipps)

## Klein (ein Nachmittag)

- **Statistiken im Abspann**: Spielzeit, geschaute Objekte, verbrauchte Tipps, „gelachte Male beim Troll“ – alles in Flags mitzählen ist billig und macht den Abspann persönlich.
- **Erfolge (Achievements)**: localStorage-basiert, z. B. „Buchwurm“ (jedes Buch angucken), „Trollflüsterer“ (alle Troll-Witze), „Ohne Tipp durchgespielt“. Kleine Toast-Einblendung, Liste im Hilfedialog.
- **Text-Log / Rollback**: Die letzten 20 Sprechblasen in einem Dialog einsehbar (Knopf im Menü). Für Spieler, die eine Zeile verpasst haben.
- **Zufalls-Gerede**: Wenn Zack 2 Minuten nichts tut, sagt er gelegentlich einen Raum-spezifischen Spruch („Hier riecht es nach Abenteuer. Und nach Sumpf.“).
- **Titelbild-Politur**: Zack auf dem Titel animiert den Hut heben, wenn die Maus ihn berührt.
- **URL-Parameter für Tester**: `?fast` (Sprechblasen 3× schneller), `?debug` (Hotspots dauerhaft ein).
- **Winter-Parameter**: `?winter` lässt in allen Außenräumen Schnee fallen – saisonale Screenshots/Posts.

## Mittel (ein Wochenende)

- **Englische Übersetzung**: Alle Texte nach `js/texts_de.js`/`texts_en.js` ziehen, Sprachwahl im Titelbild. Die Engine liest Texte dann über eine `t()`-Funktion. Größter Hebel für Reichweite.
- **Mehr Stimmen bei ElevenLabs**: Statt zwei Stimmen (Zack / alle anderen) eine Stimme pro Figur – Walpurga krächzend, Muffelgrau affektiert, Troll dumpf. Dialog im Spiel um eine „Stimme zuordnen“-Ansicht erweitern.
- **Oma ruft an**: Zacks Handy aus dem Inventar als wiederkehrender Gag: Oma ruft an kritischen Momenten an („Zacki, wo bleibst du?“), mit Sprachausgabe über ElevenLabs.
- **Zweiter Spielfaden**: Nach dem Sieg öffnet der Portalstein einen Bonusraum (Omas Wohnzimmer im Gartenzwerg-Maßstab) mit 2–3 Mini-Rätseln um einen alternativen Hut.
- **Fotomodus/Tauschhaus der Erinnerungen**: Screenshot-Knopf, der die Canvas als PNG exportiert (`canvas.toDataURL`, Download-Link).
- **Gamepad-Support**: Virtueller Cursor per linkem Stick, A = Aktion, X = Anschauen. Die Pointereingabe in `engine.js` ist schon sauber getrennt, das ist ein Adapter davor.
- **Soundtrack-Auswahl**: Menüknopf, um zwischen Chiptune und „stumm, nur Effekte“ zu wechseln – manche streamen nebenbei Podcasts.
- **Musik-Dynamik im Gespräch**: In Dialogen das Schlagzeug kurz leiser ziehen (duck-Mechanik existiert schon für TTS) – Radiosender-Moderation fürs Ohr.

## Groß (ein Projekt)

- **Kapitel 2: „Muffelgraus Rückkehr“**: Der besiegte Zauberer schleicht als Grauschleier durch Fabulien; 4–5 neue Räume (Bergwerk, Bibliothek, Fluß), neue Mechanik: Farbtöpfe sammeln und Räume „zurückfärben“. Die Raum-/Rätsel-Infrastruktur (rooms_*.js) nimmt das direkt auf.
- **Nicht-lineare Rätsel**: Aktuell eine Kette. Ein zweiter, unabhängiger Rätselstrang (z. B. Bertas Küken versteckt sich) macht die Welt lebendiger und belohnt Erforschen.
- **Volle Synchronisation offline**: Einmal generierte ElevenLabs-Zeilen als `assets/voice/*.mp3` ins Repo legen und per `Audio8`-Fallback-Präferenz laden – dann spricht das Spiel auch ohne Schlüssel, aber Repo wächst um einige MB.
- **Werkzeugkasten für Community-Räume**: Room-Definitionen als JSON exportieren/importieren (Titelbild-Knopf „Raum laden“). Aus dem Spiel wird ein kleines Authoring-System.
- **itch.io-Release zusätzlich zu GitHub Pages**: Zip bauen (`npm run pack`), Seite mit Screenshots – anderes Publikum, gleiche Dateien.

## Experimentell / Spielerei

- **Tag/Nacht-Tönung je nach echter Uhrzeit** des Spielers (`ROOM_FX` gibt schon den Rahmen her).
- **Prozedurale Wolken/Sterne** auf der Lichtung als `room.back`-Animation.
- **Zack lernt Zauber**: Nach dem Finale freischaltbarer „Zauberspruch“-Modus, der standard Antworten durch Funken ersetzt (nur Kosmetik).
- **Barrierefreiheit**: Option für größere Schriftgröße in Sprechblasen, High-Contrast-Cursor, Ein-Knopf-Modus (Aktionen durchblättern statt Verbe wählen).

## Prioritäten-Empfehlung (Stand: Oktober 2026)

1. ElevenLabs-Stimmen ausprobieren und mit einer zweiten Stimme pro NPC verfeinern (mittlerer Aufwand, großer Effekt)
2. Statistiken + Erfolge (klein, motiviert zum Weiterspielen)
3. Ambiente-Loops je Raum (klein, macht die Welt sofort lebendiger)
4. Englische Übersetzung (größter Reichweite-Hebel)
5. Kapitel 2 skizzieren: erst 2 Räume als Proof-of-Concept
