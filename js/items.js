'use strict';
// ---------------------------------------------------------------------------
// Inventar-Gegenstände
// ---------------------------------------------------------------------------

async function readBook() {
  if (E.roomId === 'attic' && !flag('inFabulien')) return portalCutscene();
  await say('Alle Seiten sind leer. Nur auf der letzten steht in krakeliger Schrift: "Gute Reise!"');
  await say('Sehr witzig.');
}

const ITEMS = {
  handy: {
    name: 'Handy', solo: true,
    look: () => say('Mein Handy. 3 % Akku und – Überraschung – kein Netz.'),
    use: async () => {
      if (!flag('inFabulien')) return say('Kein Netz. Omas Dachboden ist offiziell ein Funkloch.');
      if (E.roomId === 'swamp') return say('Ein Selfie mit Troll? Würde mir eh keiner glauben.');
      if (E.roomId === 'tower' || E.roomId === 'towergate') return say('Selbst der Handybildschirm ist hier grau. Gruselig.');
      return say(pick(['Kein Netz. In Fabulien gibt es wohl keine Funkmasten.', 'Immer noch kein Netz. Hätte mich auch gewundert.', 'Ich könnte Snake spielen. Aber ich bin ja schon in einem Spiel. Glaube ich.']));
    },
    open: () => say('Wenn ich das Handy aufschraube, ist die Garantie weg. Und Mama sauer.'),
    with: {
      spiegel: () => say('Ein Selfie im Spiegel. Kunst!'),
    },
  },
  schluessel: {
    name: 'Schlüssel',
    look: () => say('Ein kleiner, alter Messingschlüssel. Passt bestimmt in irgendwas Altes.'),
  },
  buch: {
    name: 'Zauberbuch', solo: true,
    look: () => say(flag('inFabulien') ? 'Das Buch, das mich hergebracht hat. Es summt leise, wenn man es ans Ohr hält.' : '"Das Große Buch der Kleinen Zauber". Klingt nach Hausaufgaben.'),
    use: readBook, open: readBook,
  },
  stock: {
    name: 'Stock',
    look: () => say('Ein langer, stabiler Stock. Der Klassiker unter den Abenteurer-Gegenständen.'),
  },
  taler: {
    name: 'Goldtaler',
    look: () => say('Ein echter Goldtaler! Auf der Rückseite steht: "Fabulische Staatsbank – Wir zaubern Ihr Geld weg."'),
    solo: false,
  },
  schere: {
    name: 'Schere',
    look: () => say('Eine scharfe Schere. Mama sagt immer: Nicht damit rennen.'),
  },
  brot: {
    name: 'altes Brot', solo: true,
    look: () => say('Ein Brot, so hart, dass man damit Nägel einschlagen könnte.'),
    use: () => say('Essen? Ich hänge an meinen Zähnen.'),
  },
  feder: {
    name: 'Hühnerfeder',
    look: () => say('Eine weiche, flauschige Hühnerfeder. Perfekt zum Kitzeln.'),
    with: { handy: () => say('Ich staube mein Handy ab. Jetzt hat es immer noch kein Netz, aber es ist sauber.') },
  },
  eimer: {
    name: 'Eimer',
    look: () => say('Ein alter Blecheimer. Etwas verbeult, aber dicht.'),
  },
  wasser: {
    name: 'Eimer mit Wunschwasser', solo: true,
    look: () => say('Ein Eimer voller Wunschbrunnenwasser. Es glitzert ein bisschen.'),
    use: () => say('Ich wünsche mir... dass ich nicht schleppen muss. Hm. Hat nicht funktioniert.'),
  },
  flasche: {
    name: 'leere Flasche',
    look: () => say('Eine leere Glasflasche mit Korken. Leer wie mein Kühlschrank am Sonntag.'),
    with: {
      wasser: () => say('Das Wunschwasser bleibt im Eimer. Die Flasche will ich für was anderes aufheben.'),
    },
  },
  kichern: {
    name: 'Flasche mit Trollkichern', solo: true,
    look: () => say('Die Flasche kichert leise vor sich hin. "Hö... hö..." Das ist das Seltsamste, was ich je besessen habe.'),
    use: () => say('Wenn ich die öffne, ist das Kichern weg. Und ich werde es nie wieder einfangen. Ehrenwort.'),
    open: () => say('Lieber nicht. Die Hexe braucht das Kichern.'),
  },
  barthaar: {
    name: 'Zwergenbarthaar',
    look: () => say('Ein dickes, rotes Barthaar. Es riecht nach Bier und Höhle.'),
  },
  trank: {
    name: 'Rückverwandlungstrank', solo: true,
    look: () => say('Ein pinker, blubbernder Trank. Auf dem Etikett: "Einmal schütteln, nicht rühren. Nicht für Kinder unter 300."'),
    use: () => say('Den trinke ich lieber nicht. Wer weiß, was ich vorher mal war.'),
  },
  spiegel: {
    name: 'Handspiegel', solo: true,
    look: () => say('Walpurgas Handspiegel mit goldenem Rahmen.'),
    use: async () => {
      if (E.roomId === 'tower' && flag('morbusCharging') && !flag('morbusDefeated')) return mirrorFinale();
      await say('Ich schaue hinein. Gutaussehend wie immer.');
      if (E.zack.hat) await say('Und der Hut! Der Hut macht echt was her.');
    },
  },
};
