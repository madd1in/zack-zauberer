'use strict';
// ---------------------------------------------------------------------------
// Spielführer „Was tun als Nächstes?“
// Die Schritte stehen in einer sinnvollen Reihenfolge. Als aktuelles Ziel gilt der erste Schritt,
// dessen done()-Bedingung noch nicht erfüllt ist. Jeder Schritt hat drei Tipp-Stufen
// (grobe Richtung → konkreter → genaue Handlung), die der Spieler nacheinander aufdeckt.
// ---------------------------------------------------------------------------
const GUIDE_STEPS = [
  { id: 'keyOut', title: 'Etwas Verstecktes auf dem Dachboden', done: () => flag('keyOut'),
    hints: ['Auf dem Dachboden steht allerlei Kram herum. Irgendwo muss ein Schlüssel für die Truhe sein.',
      'Das Schaukelpferd steht seltsam schief. Darunter könnte etwas stecken.',
      'Wähle „Bewege“ und klicke auf das Schaukelpferd.'] },
  { id: 'keyTaken', title: 'Den Schlüssel aufheben', done: () => flag('keyTaken'),
    hints: ['Unter dem Schaukelpferd ist etwas herausgerutscht.',
      'Es liegt auf dem Boden neben dem Pferd.',
      'Wähle „Nimm“ und klicke auf den Schlüssel.'] },
  { id: 'chestUnlocked', title: 'Die Truhe aufschließen', done: () => flag('chestUnlocked'),
    hints: ['Die Truhe rechts ist abgeschlossen. Du hast jetzt, was dazu passt.',
      'Benutze den Schlüssel aus deinem Inventar mit der Truhe.',
      '„Benutze“ → Schlüssel im Inventar anklicken → dann die Truhe anklicken.'] },
  { id: 'bookTaken', title: 'Das Buch aus der Truhe holen', done: () => flag('bookTaken'),
    hints: ['In der offenen Truhe liegt etwas Dickes.',
      'Nimm das Buch heraus.',
      '„Nimm“ → Buch in der Truhe anklicken.'] },
  { id: 'portal', title: 'Das Zauberbuch ausprobieren', done: () => flag('inFabulien'),
    hints: ['Das Buch sieht nicht nur alt aus, es steckt Magie darin.',
      'Probier das Buch einfach aus. Hier auf dem Dachboden.',
      '„Benutze“ → Zauberbuch im Inventar anklicken (es ist ein Ein-Klick-Gegenstand).'] },
  { id: 'grimbart', title: 'Mit dem seltsamen Gartenzwerg reden', done: () => flag('knowsWitch') || flag('potionQuest'),
    hints: ['Auf der Lichtung wartet jemand, der Antworten hat. Er sitzt auf einem Baumstumpf.',
      'Rede mit dem Gartenzwerg und frag ihn, wie du wieder nach Hause kommst.',
      '„Rede mit“ → Gartenzwerg → „Wie komme ich wieder nach Hause?“. Er verrät dir, wer helfen kann: die Hexe im Norden.'] },
  { id: 'witchQuest', title: 'Hexe Walpurga um den Trank bitten', done: () => flag('potionQuest'),
    hints: ['Der Gartenzwerg meinte, eine Hexe kann ihn zurückverwandeln. Sie wohnt nördlich der Lichtung.',
      'Nimm den Pfad nach Norden und rede mit Walpurga.',
      'Lichtung → Pfad nach Norden → „Rede mit“ Walpurga → „Ich brauche einen Rückverwandlungstrank.“ Sie nennt dir drei Zutaten.'] },
  { id: 'stick', title: 'Einen Stock mitnehmen', done: () => flag('stickTaken'),
    hints: ['Jedes Abenteuer braucht einen langen Stock. Auf der Lichtung liegt einer.',
      'Er liegt am Boden, links in der Bildmitte.',
      '„Nimm“ → Stock auf der Lichtung.'] },
  { id: 'coin', title: 'Den Glitzerkram im Elsternnest erreichen', done: () => flag('coinTaken'),
    hints: ['In der Eiche auf der Lichtung glitzert etwas, aber es hängt zu hoch.',
      'Mit etwas Langem kommst du ans Nest.',
      '„Benutze“ → Stock im Inventar → Elsternnest.'] },
  { id: 'scissors', title: 'Im Dorf etwas Scharfes besorgen', done: () => flag('gotScissors'),
    hints: ['Im Dorf (östlich der Lichtung) gibt es einen Laden. Dein Goldtaler ist dort etwas wert.',
      'Rede mit Frau Feilscher. Frag, was sie verkauft, und bitte dann um die Schere.',
      'Dorfplatz → „Rede mit“ Frau Feilscher → „Was verkaufen Sie denn so?“ → „Ich hätte gern die Schere.“'] },
  { id: 'bread', title: 'Etwas Essbares auftreiben', done: () => flag('gotBread'),
    hints: ['In der Taverne am Dorfplatz gibt es jemanden, der Essensreste loswerden will.',
      'Rede mit dem Wirt und frag nach etwas zu essen.',
      'Taverne → „Rede mit“ Wirt → „Haben Sie was zu essen?“ (Du bekommst ein steinhartes Brot.)'] },
  { id: 'feather', title: 'Eine Feder besorgen', done: () => flag('gotFeather'),
    hints: ['Auf dem Dorfplatz läuft ein Huhn herum, das ein Geheimnis hat. Es ist hungrig.',
      'Lenke das Huhn mit etwas Essbarem ab.',
      '„Benutze“ → Brot im Inventar → Huhn Berta.'] },
  { id: 'hair', title: 'Ein Zwergenbarthaar schneiden', done: () => flag('gotHair'),
    hints: ['Eine der drei Zutaten für Walpurga: ein Haar vom Bart eines Zwerges. In der Taverne schnarcht einer.',
      'Du brauchst etwas Scharfes, und der Zwerg darf nicht aufwachen.',
      'Taverne → „Benutze“ → Schere im Inventar → Zwerg (oder Zwergenbart).'] },
  { id: 'bucket', title: 'Einen Eimer finden', done: () => flag('gotBucket'),
    hints: ['Für die zweite Zutat (Wunschbrunnenwasser) brauchst du ein Gefäß. Im Stinkesumpf (westlich der Lichtung) liegt eins im Schlamm.',
      'Der alte Eimer steckt rechts im Schlamm.',
      'Stinkesumpf → „Nimm“ → Eimer.'] },
  { id: 'water', title: 'Wasser aus dem Wunschbrunnen schöpfen', done: () => flag('gotWater'),
    hints: ['Der Brunnen steht mitten auf dem Dorfplatz.',
      'Benutze den Eimer am Brunnen.',
      'Dorfplatz → „Benutze“ → Eimer im Inventar → Wunschbrunnen.'] },
  { id: 'bottle', title: 'Eine Flasche aus dem Sumpf angeln', done: () => flag('gotBottle'),
    hints: ['Im Sumpf treibt eine Flasche, die du später brauchst. Sie ist zu weit weg zum Greifen.',
      'Mit dem langen Stock kommst du heran.',
      'Stinkesumpf → „Benutze“ → Stock im Inventar → Flasche.'] },
  { id: 'tickle', title: 'Den Troll zum Lachen bringen', done: () => flag('trollLaughing') || flag('bridgeOpen'),
    hints: ['Die dritte Zutat ist das Kichern des Trolls im Sumpf. Mit Witzen klappt es nicht, aber alle sagen, er sei kitzlig.',
      'Federn sind sein Schwachpunkt. Du hast eine.',
      'Stinkesumpf → „Benutze“ → Feder im Inventar → Troll.'] },
  { id: 'giggle', title: 'Das Kichern einfangen', done: () => flag('bridgeOpen'),
    hints: ['Der Troll lacht gerade. Schnell, bevor es vorbei ist!',
      'Du hast doch eine leere Flasche.',
      '„Benutze“ → Flasche im Inventar → Troll (solange er lacht).'] },
  { id: 'potion', title: 'Walpurga die Zutaten bringen', done: () => flag('potionDone'),
    hints: ['Du hast jetzt alle drei Zutaten: Haar, Wasser und Kichern. Ab zur Hexe!',
      'Die Hexe wohnt nördlich der Lichtung.',
      'Walpurga → „Rede mit“ → „Ich habe Zutaten für dich!“'] },
  { id: 'grimFree', title: 'Grimbart zurückverwandeln', done: () => flag('grimbartFree'),
    hints: ['Du hast den Trank. Wem solltest du ihn geben?',
      'Der Gartenzwerg auf der Lichtung wartet darauf.',
      'Lichtung → „Gib“ → Trank → Gartenzwerg (oder „Rede mit“ → „Ich hab den Trank!“).'] },
  { id: 'mirror', title: 'Einen Spiegel für den Bösewicht besorgen', done: () => flag('gotMirror'),
    hints: ['Grimbart sagt: Muffelgrau ist der eitelste Zauberer aller Zeiten. Und wer hat einen schönen Spiegel?',
      'Walpurga würde dir ihren Spiegel leihen, wenn du nett fragst.',
      'Hexenhütte → „Rede mit“ Walpurga → „Kannst du mir deinen Spiegel leihen?“'] },
  { id: 'riddle', title: 'Am Wasserspeier vorbeikommen', done: () => flag('gateOpen'),
    hints: ['Jetzt geht es zum Turm: vom Sumpf über die Brücke (der Troll lässt dich durch). Dort bewacht ein Steinwesen das Tor.',
      'Rede mit dem Wasserspeier und löse sein Rätsel.',
      'Antwort auf das Rätsel („Je mehr man davon wegnimmt, desto größer wird es“): „Ein Loch.“'] },
  { id: 'morbus', title: 'Muffelgrau besiegen', done: () => flag('morbusDefeated'),
    hints: ['Geh in den Turm. Mit Gewalt kommst du nicht weit, aber der Zauberer ist schrecklich eitel.',
      'Halte ihm etwas vor, das ihn völlig ablenkt.',
      '„Benutze“ → Spiegel im Inventar → Morbus Muffelgrau.'] },
  { id: 'stone', title: 'Den Portalstein holen und nach Hause reisen', done: () => flag('stoneTaken') || flag('ending'),
    hints: ['Muffelgrau ist erledigt. Was wolltest du ursprünglich hier?',
      'Der Stein liegt auf dem Podest rechts. Sobald du ihn hast, beginnt das Finale.',
      '„Nimm“ → Portalstein.'] },
];

const Guide = {
  steps: GUIDE_STEPS,
  levels: {},                     // aufgedeckte Tipp-Stufen je Schritt (0–3)
  open: false,
  current() { return GUIDE_STEPS.find(s => !s.done()) || null; },
  progress() { return [GUIDE_STEPS.filter(s => s.done()).length, GUIDE_STEPS.length]; },
  level(step) { return step ? (this.levels[step.id] || 0) : 0; },
  reveal() {                      // nächste Stufe aufdecken
    const s = this.current(); if (!s) return 0;
    this.levels[s.id] = Math.min(3, this.level(s) + 1);
    return this.levels[s.id];
  },
  reset() { this.levels = {}; this.open = false; this._sig = ''; this._since = 0; this._nudged = ''; },
};

// ----------------------------------------------------------- Notizbuch (DOM)
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function renderTip() {
  const el = document.getElementById('tip'); if (!el) return;
  const box = document.getElementById('tipBody'); if (!box) return;
  const s = Guide.current(), [d, n] = Guide.progress(), lv = Guide.level(s);
  let h = '<h2>Zacks Notizbuch</h2>';
  h += '<div class="tipbar"><i style="width:' + Math.round(d / n * 100) + '%"></i></div>';
  h += '<p class="muted">Fortschritt: ' + d + ' von ' + n + ' Schritten</p>';
  if (!s) h += '<p>Du hast alles geschafft. Danke fürs Spielen!</p>';
  else {
    h += '<p class="goal"><b>Als Nächstes:</b> ' + esc(s.title) + '</p>';
    if (!lv) h += '<p class="muted">Noch kein Tipp aufgedeckt. Probier es erst selbst, oder deck bei Bedarf einen auf.</p>';
    for (let i = 0; i < lv; i++) h += '<p class="hint h' + i + '"><b>Tipp ' + (i + 1) + ':</b> ' + esc(s.hints[i]) + '</p>';
    h += '<div class="tipbtns"><button id="tipMore"' + (lv >= 3 ? ' disabled' : '') + '>' + (lv ? 'Noch deutlicher' : 'Tipp zeigen') + '</button><button id="tipClose">Schließen</button></div>';
  }
  if (!s) h += '<div class="tipbtns"><button id="tipClose">Schließen</button></div>';
  box.innerHTML = h;
  const more = document.getElementById('tipMore'); if (more) more.onclick = (e) => { e.stopPropagation(); Guide.reveal(); renderTip(); };
  const cl = document.getElementById('tipClose'); if (cl) cl.onclick = (e) => { e.stopPropagation(); closeTip(); };
}
function openTip() {
  if (E.mode !== 'game' && E.mode !== 'end') return false;
  const el = document.getElementById('tip'); if (!el) return false;
  Guide.open = true; renderTip(); el.classList.add('show');
  return true;
}
function closeTip() {
  const el = document.getElementById('tip'); if (el) el.classList.remove('show');
  Guide.open = false;
}
function toggleTip() { return Guide.open ? (closeTip(), false) : openTip(); }

// Sanfter Hinweis, wenn lange nichts vorangeht (einmal pro Schritt)
function guideNudge() {
  if (E.mode !== 'game' || E.busy || E.speech || E.dialog || Guide.open) return;
  const s = Guide.current(); if (!s) return;
  const sig = Guide.progress()[0] + '|' + E.inv.length + '|' + E.roomId;
  if (sig !== Guide._sig) { Guide._sig = sig; Guide._since = E.t; return; }
  if (E.t - Guide._since > 180 && Guide._nudged !== s.id) {
    Guide._nudged = s.id;
    if (typeof toast === 'function') toast('Nicht weiter? Taste T oder „Tipp“ öffnet Zacks Notizbuch.');
  }
}
function installGuide() {
  Guide.reset();
  window.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 't' || e.key === 'T') { if (!e.repeat) toggleTip(); }
    else if (e.key === 'Escape' && Guide.open) closeTip();
  });
  setInterval(guideNudge, 5000);
}
