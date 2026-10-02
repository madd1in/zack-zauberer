'use strict';
// ---------------------------------------------------------------------------
// Räume Teil 2: Hexenhütte, Stinkesumpf, Turmtor, Turmzimmer, Finale
// ---------------------------------------------------------------------------

// ======================================================================
// HEXENHÜTTE
// ======================================================================
const ING = ['barthaar', 'wasser', 'kichern'];
const ING_FLAG = { barthaar: 'ingHair', wasser: 'ingWater', kichern: 'ingGiggle' };

ROOMS.witch = {
  name: 'Hexenhütte', music: 'witch',
  walk: [[40, 112], [310, 110], [318, 135], [2, 135], [2, 124]],
  scale: [104, 0.9, 134, 1],
  paint(p) {
    planks(p, 0, 0, W, 96, ['#4a3428', '#45301f', '#4e3829'], 8, '#2a1a10');
    p.noise(0, 0, W, 96, '#5c4232', 0.05, 101);
    p.rect(0, 0, W, 4, '#1c120a'); p.rect(0, 6, W, 6, '#2a1a10'); p.rect(0, 6, W, 1, '#4a3020');
    // Kräuterbündel
    for (let i = 0; i < 9; i++) {
      const x = 60 + i * 26 + (i % 2) * 5, l = 8 + (i % 3) * 4;
      p.line(x, 12, x, 12 + l, '#6a5030');
      p.blob(x, 14 + l, 3, 5, ['#5a7a3a', '#7a8a4a', '#8a5a7a', '#6a8a5a'][i % 4], 120 + i, 4);
    }
    // Fenster
    p.rect(230, 20, 64, 44, '#2a1a10');
    p.vgrad(234, 24, 56, 36, ['#9ac8e0', '#b8dcec', '#6a9a5a']);
    p.blob(246, 50, 12, 10, '#2c5a2c', 131, 5); p.blob(276, 48, 14, 12, '#3a6a34', 132, 5);
    p.rect(261, 24, 2, 36, '#2a1a10'); p.rect(234, 41, 56, 2, '#2a1a10');
    p.rect(226, 62, 72, 5, '#5a3a22'); p.rect(226, 62, 72, 1, '#7a5232');
    // Regale links
    for (const y of [34, 56]) { p.rect(40, y, 94, 3, '#6a4428'); p.rect(40, y + 3, 94, 1, '#1c120a'); p.rect(44, y + 4, 2, 4, '#4a2c18'); p.rect(128, y + 4, 2, 4, '#4a2c18'); }
    const jars = [[46, 34, '#5ac85a'], [56, 34, '#c84a4a'], [76, 34, '#9a5ad0'], [88, 34, '#e0c040'], [100, 34, '#5a9ad0'], [48, 56, '#80d0a0'], [60, 56, '#d07a3a'], [72, 56, '#c0c0e0'], [92, 56, '#6ac0c0']];
    for (const [x, y, c] of jars) {
      p.rect(x, y - 10, 8, 10, '#a0b8b0'); p.rect(x + 1, y - 8, 6, 8, c); p.rect(x + 1, y - 12, 6, 2, '#7a5a3a'); p.set(x + 2, y - 7, '#ffffff');
    }
    // Totenkopf
    p.circle(118, 28, 5, '#e8e0cc'); p.rect(115, 31, 7, 3, '#e8e0cc'); p.rect(115, 27, 2, 2, '#2a1a10'); p.rect(120, 27, 2, 2, '#2a1a10'); p.set(118, 30, '#2a1a10');
    p.rect(117, 18, 2, 5, '#f0e8c0'); p.set(117, 16, '#ffd040'); p.set(118, 15, '#ffa020');
    // Tür
    p.rect(4, 32, 34, 78, '#1c120a'); p.rect(8, 36, 26, 74, '#7ab05a'); p.vgrad(8, 36, 26, 40, ['#a8d0e8', '#8ac080']);
    p.blob(20, 70, 12, 8, '#3a7a3a', 141, 5); p.rect(8, 90, 26, 20, '#6a9a4a');
    p.poly([[34, 36], [44, 40], [44, 106], [34, 110]], '#5a3a22'); p.line(39, 44, 39, 100, '#4a2c18');
    // Besen
    p.thick(302, 112, 314, 46, 2, '#8a6030'); p.poly([[294, 112], [306, 112], [304, 96], [298, 96]], '#c8a050');
    for (let x = 295; x < 306; x += 2) p.line(x, 112, x + 2, 98, '#a07a30');
    // Boden (Steinplatten)
    p.rect(0, 96, W, 40, '#4a4440');
    const r = rng(111);
    for (let y = 96, h = 4; y < SCENE_H; y += h, h = Math.min(14, h * 1.35)) {
      p.rect(0, y, W, 1, '#2e2a28');
      for (let x = Math.floor(r() * 30); x < W; x += 24 + Math.floor(r() * 30)) p.rect(x, y, 1, Math.round(h), '#2e2a28');
    }
    p.noise(0, 96, W, 40, '#5a5450', 0.08, 112);
    // Kessel (Körper; Flüssigkeit wird animiert gemalt)
    p.thick(146, 112, 152, 104, 2, '#1c1c22'); p.thick(188, 112, 182, 104, 2, '#1c1c22');
    p.ellipse(167, 100, 26, 14, '#1c1c24'); p.ellipse(160, 96, 14, 8, '#2c2c36');
    p.ellipse(167, 87, 26, 6, '#3a3a44'); p.ellipse(167, 87, 23, 4, '#101014');
    p.rect(150, 110, 34, 3, '#5a3418'); p.rect(156, 108, 22, 3, '#6a4020');
    // grünes Licht vom Kessel
    p.tint(0, 0, W, SCENE_H, '#080406', (x, y) => Math.min(0.6, Math.hypot(x - 167, (y - 86) * 1.5) * 0.0042));
    p.tint(90, 30, 160, 90, '#70e070', (x, y) => Math.max(0, 0.2 - Math.hypot(x - 167, (y - 86) * 1.4) * 0.0028));
  },
  back(ctx, t) {
    const pink = flag('potionDone');
    const liq = pink ? ['#e050b0', '#ff80d0', '#ffc0f0'] : ['#3aa040', '#60d060', '#a0f090'];
    ctx.fillStyle = liq[0];
    for (let y = -3; y <= 3; y++) { const hw = Math.round(22 * Math.sqrt(1 - (y * y) / 16)); ctx.fillRect(167 - hw, 87 + y, hw * 2, 1); }
    for (let i = 0; i < 6; i++) {
      const k = (t * (0.8 + i * 0.13) + i * 0.37) % 1;
      const x = 150 + ((i * 7) % 34), r = k < 0.8 ? 1 : 2;
      fr(ctx, x, 86 - Math.round(k * 2), r + 1, r, liq[1 + (i % 2)]);
    }
    for (let i = 0; i < 8; i++) {
      const k = (t * 0.35 + i / 8) % 1;
      const x = 156 + i * 3 + Math.sin(t * 2 + i) * 4 * k, y = 82 - k * 50;
      ctx.globalAlpha = 0.5 * (1 - k);
      fr(ctx, x, y, 3, 2, pink ? '#ffd0f0' : '#c0f0c0');
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 9; i++) { const h = 2 + Math.abs(Math.sin(t * 11 + i)) * 5; fr(ctx, 155 + i * 3, 109 - h, 2, h, i % 2 ? '#f08020' : '#f0d040'); }
  },
  front(ctx, t) {
    // Pulsierendes Kessellicht über den Raum (Farbe je nach Trank-Fortschritt)
    const a = 0.15 + Math.sin(t * 2.3) * 0.06 + Math.sin(t * 5.7 + 2) * 0.03;
    ctx.globalAlpha = Math.max(0.05, a);
    ctx.drawImage(glowCanvas(flag('potionDone') ? '#ff60c0' : '#60e860', 30), 112, 46, 110, 88);
    ctx.globalAlpha = 1;
  },
  objects: [
    {
      id: 'kraeuter', name: 'Kräuterbündel', rect: [50, 10, 230, 18], walk: [160, 112], face: 'up',
      on: {
        look: () => say('Getrocknete Kräuter. Riechen besser als der Kessel. Was nicht schwer ist.'),
        take: () => sayAs('walpurga', 'Das ist mein Tee! Finger weg!'),
      },
    },
    {
      id: 'fenster', name: 'Fenster', rect: [230, 20, 64, 42], walk: [262, 112], face: 'up',
      on: { look: () => say('Draußen ist der Wald. Drinnen ist es eindeutig gruseliger.'), open: () => sayAs('walpurga', 'Lass das zu! Der Kater haut sonst ab.') },
    },
    {
      id: 'regal', name: 'Regal', rect: [40, 18, 96, 44], walk: [88, 114], face: 'up',
      on: {
        look: () => say('Gläser mit Augäpfeln, Froschlaich und... ist das Nutella? Nein. Leider nicht.'),
        take: () => sayAs('walpurga', 'Pfoten weg von meinen Zutaten! Die sind teurer als du!'),
      },
    },
    {
      id: 'totenkopf', name: 'Totenkopf', rect: [110, 14, 16, 22], walk: [118, 114], face: 'up',
      on: {
        look: () => say('Ein Totenkopf mit einer Kerze drauf. Gemütlich.'),
        talk: async () => { await say('Sein oder nicht sein?'); await sayAs('walpurga', 'Der heißt Horst. Und er redet nicht mit Fremden.'); },
        take: () => sayAs('walpurga', 'Horst bleibt, wo er ist!'),
      },
    },
    {
      id: 'spiegel', name: 'Handspiegel', rect: [90, 37, 24, 18], walk: [100, 114], face: 'up', z: 57,
      hidden: () => flag('gotMirror'),
      draw(ctx) { ctx.drawImage(iconCanvas('spiegel'), 94, 40, 18, 13); },
      on: {
        look: () => say('Ein hübscher Handspiegel mit goldenem Rahmen.'),
        take: async () => {
          if (flag('knowsVain')) return giveMirror();
          await sayAs('walpurga', 'Finger weg! Das ist mein Schönheitsspiegel!');
          await sayAs('walpurga', 'Ohne den sehe ich ja gar nicht, wie fabelhaft ich bin.');
        },
        use: () => say('Ich sehe mich. Mit Ruß im Gesicht. Super.'),
      },
    },
    {
      id: 'besen', name: 'Besen', rect: [292, 44, 24, 70], walk: [292, 118], face: 'right',
      on: {
        look: () => say('Ein Hexenbesen. Bestimmt mit Turbo.'),
        take: () => sayAs('walpurga', 'Mein Besen bleibt hier! Der hat erst 200 Jahre auf dem Buckel!'),
        use: () => say('Ich habe keinen Flugschein. Und Höhenangst.'),
      },
    },
    {
      id: 'tuer', name: 'Tür', rect: [2, 32, 40, 80], walk: [36, 122], face: 'left',
      exit: { to: 'clearing', x: 166, y: 98, dir: 'down' },
      on: { look: () => say('Der Weg zurück zur Lichtung.') },
    },
    {
      id: 'katze', name: 'Kater', the: 'der Kater', rect: [250, 42, 26, 22], walk: [262, 112], face: 'up', z: 63,
      npc: { color: '#e0d040', head: [262, 42] },
      draw(ctx, t) { blit(ctx, catSprite(Math.floor(t * 1.2) % 2, blink(9)), 262, 63, 10, 18, 1, false, 10); },
      on: {
        look: () => say('Ein schwarzer Kater. Er starrt mich an, als wäre ich sein Mittagessen.'),
        talk: async () => { await say('Miez, miez?'); await sayAs('katze', 'Mrrrau.'); await say('Hat der Kater gerade "Verzieh dich" gesagt?'); await sayAs('walpurga', 'Das ist Mephisto. Er mag keine Kinder. Er mag eigentlich niemanden.'); },
        take: async () => { await sayAs('katze', 'FFFFHHHH!'); await say('Okay, okay. Ich hab verstanden.'); },
        use: async (item) => { if (item === 'feder') { await say('Ich wedel mit der Feder...'); await sayAs('katze', '...'); await say('Er guckt mich nur mitleidig an. Der ist zu cool für Federn.'); return; } return false; },
      },
    },
    {
      id: 'kessel', name: 'Kessel', rect: [140, 80, 54, 34], walk: [196, 118], face: 'left', z: 100,
      on: {
        look: () => say(flag('potionDone') ? 'Im Kessel blubbert jetzt etwas Pinkes. Es riecht nach Zuckerwatte und nassen Hunden.' : 'Ein großer Kessel mit blubberndem grünem Zeug. Riecht nach Socken und Lakritz.'),
        use: async (item) => {
          if (ING.includes(item)) return deliverIngredients();
          if (item) { await say('Das werfe ich da nicht rein.'); return sayAs('walpurga', 'Wehe! Das ist ein Präzisionsgebräu!'); }
          return say('Ich rühre da nicht drin rum. Wer weiß, was da drin schwimmt. Oder wer.');
        },
        take: () => say('Der ist heiß. Und voll. Und riesig.'),
      },
    },
    {
      id: 'walpurga', name: 'Walpurga', the: 'Walpurga', rect: [110, 44, 32, 70], walk: [100, 120], face: 'right', z: 114,
      npc: { color: '#d8a0ff', head: [126, 44] },
      draw(ctx, t) { blit(ctx, witchSprite(blink(11), talking('walpurga'), Math.floor(t * 3) % 3), 126, 114, 20, 70, 1, false, 22); },
      on: {
        look: () => say('Hexe Walpurga. Grüne Haut, krumme Nase, spitzer Hut. Klassisch.'),
        talk: () => talkWitch(),
        give: async (item) => {
          if (ING.includes(item)) {
            if (!flag('potionQuest')) return sayAs('walpurga', 'Was soll ich damit, Kleiner? Sag mir erst mal, was du überhaupt willst.');
            return deliverIngredients();
          }
          if (item === 'feder') return sayAs('walpurga', 'Eine Hühnerfeder? Was soll ich damit, mir die Nase kitzeln?');
          if (item === 'spiegel') return sayAs('walpurga', 'Behalt ihn, bis du mit Muffelgrau fertig bist.');
          if (item === 'flasche') return sayAs('walpurga', 'Eine LEERE Flasche? Wie aufmerksam. Nicht.');
          return sayAs('walpurga', 'Was soll ich denn damit? Ich bin doch keine Müllkippe!');
        },
        take: () => say('Eine Hexe entführen? Ich bin mutig, aber nicht lebensmüde.'),
        use: async (item) => {
          if (item === 'feder') { await say('Kille kille?'); return sayAs('walpurga', 'Wag es, und du verbringst den Rest deines Lebens als Kaulquappe.'); }
          return false;
        },
      },
    },
  ],
};

async function talkWitch() {
  if (!flag('metWitch')) {
    setFlag('metWitch');
    await sayAs('walpurga', 'Wer stört? Ich bin mitten in einem Rezept für Krötenkompott!');
    await say('Äh, hallo. Ich bin Zack.');
    await sayAs('walpurga', 'Zack? Klingt wie das Geräusch, das ein Frosch macht, wenn er platzt.');
  } else await sayAs('walpurga', pick(['Du schon wieder.', 'Ja? Mach schnell, mein Kompott brennt an.', 'Na, Kleiner?']));
  await converse(() => [
    { text: 'Ich brauche einen Rückverwandlungstrank.', cond: () => !flag('potionQuest'), run: async () => {
      await sayAs('walpurga', 'Rückverwandlung, soso. Für wen denn?');
      await say('Für Grimbart. Er ist ein Gartenzwerg.');
      await sayAs('walpurga', 'Grimbart? HIHIHI! Das geschieht dem alten Angeber recht!');
      await sayAs('walpurga', '...Na gut. Weil du so höflich fragst. Aber ich brauche drei Zutaten:');
      await sayAs('walpurga', 'Ein Haar aus dem Bart eines Zwerges.');
      await sayAs('walpurga', 'Wasser aus dem Wunschbrunnen.');
      await sayAs('walpurga', 'Und das Kichern eines Trolls.');
      await say('Das KICHERN eines Trolls?! Wie soll ich das denn transportieren?');
      await sayAs('walpurga', 'In einer Flasche natürlich. Wie denn sonst? Junge Leute heutzutage...');
      setFlag('potionQuest');
    } },
    { text: 'Was brauchst du nochmal?', cond: () => flag('potionQuest') && !flag('potionDone'), run: async () => {
      const missing = [];
      if (!flag('ingHair')) missing.push('ein Zwergenbarthaar');
      if (!flag('ingWater')) missing.push('Wasser aus dem Wunschbrunnen');
      if (!flag('ingGiggle')) missing.push('das Kichern eines Trolls');
      await sayAs('walpurga', 'Mir fehlt noch: ' + missing.join(', ').replace(/, ([^,]*)$/, ' und $1') + '.');
      if (!flag('ingGiggle')) await sayAs('walpurga', 'Der Troll wohnt im Stinkesumpf. Er hat seit Jahrhunderten nicht gelacht. Viel Glück. Hihi.');
    } },
    { text: 'Ich habe Zutaten für dich!', cond: () => flag('potionQuest') && !flag('potionDone') && ING.some(has), run: async () => { await deliverIngredients(); if (flag('potionDone')) return 'end'; } },
    { text: 'Kannst du mir deinen Spiegel leihen?', cond: () => flag('knowsVain') && !flag('gotMirror'), run: () => giveMirror(true) },
    { text: 'Warum ist deine Haut so grün?', run: async () => {
      await sayAs('walpurga', 'Gurkenmaske. Ich bin 347 Jahre alt, Kleiner. Sieht man mir das an?');
      await say('...Nö. Kein bisschen.');
      await sayAs('walpurga', 'Lügner. Aber ein netter Lügner.');
    } },
    { text: 'Woher kennst du Grimbart?', cond: () => flag('potionQuest'), run: async () => {
      await sayAs('walpurga', 'Wir waren mal zusammen auf der Zauberschule. Er hat mir in Alchemie immer die Krötenaugen geklaut.');
      await sayAs('walpurga', 'Und dann hat er mich zum Fabulischen Hexenball nicht abgeholt. 1823. Ich vergesse nie.');
    } },
    { text: 'Tschüss.', end: true, run: () => sayAs('walpurga', 'Und mach die Tür zu! Es zieht!') },
  ]);
}

async function deliverIngredients() {
  if (!flag('potionQuest')) return sayAs('walpurga', 'Was willst du überhaupt von mir, Kleiner?');
  let n = 0;
  for (const it of ING) {
    if (!has(it)) continue;
    removeItem(it); setFlag(ING_FLAG[it]); n++;
    Audio8.sfx('bubble');
    if (it === 'barthaar') await sayAs('walpurga', 'Ein Zwergenbarthaar! Schön rot und muffig. Perfekt.');
    if (it === 'wasser') await sayAs('walpurga', 'Wunschbrunnenwasser! *schlürf* Ah, Jahrgang 1702. Den Eimer kannst du vergessen.');
    if (it === 'kichern') await sayAs('walpurga', 'Trollkichern! In einer Flasche! Ich bin beeindruckt, Kleiner. Wirklich.');
  }
  if (!n) return sayAs('walpurga', 'Du hast ja gar nichts dabei, was ich brauche.');
  if (flag('ingHair') && flag('ingWater') && flag('ingGiggle')) return brewPotion();
  await sayAs('walpurga', 'Gut, gut. Aber mir fehlt noch was. Hopp hopp!');
}

async function brewPotion() {
  await sayAs('walpurga', 'Alle Zutaten! Na, dann wollen wir mal!');
  await walkTo(214, 122); face('left');
  Audio8.sfx('bubble');
  await sayAs('walpurga', 'Ein Zwergenbarthaar...');
  Audio8.sfx('bubble');
  await sayAs('walpurga', 'Ein Schluck Wunschwasser...');
  Audio8.sfx('laugh');
  await sayAs('walpurga', 'Und eine Prise Trollkichern!');
  await sayAs('walpurga', 'Hokus Pokus Krötenfuß, Grimbart wird wieder... äh... irgendwas mit "uß"!');
  Audio8.sfx('magic');
  for (let i = 0; i < 6; i++) { burst(167, 84, 12, ['#ff60c0', '#ffffff', '#ffe060']); await wait(120); }
  setFlag('potionDone');
  await flash('#ff80d0', 600);
  Audio8.sfx('poof');
  await sayAs('walpurga', 'Fertig! Ein Rückverwandlungstrank. Einmal schütteln, nicht rühren.');
  addItem('trank');
  await say('Danke, Walpurga!');
  await sayAs('walpurga', 'Und richte dem alten Angeber aus, dass er mir was schuldet. Einen Tanz. Seit 1823.');
}

async function giveMirror(asked) {
  if (flag('gotMirror')) return;
  if (!asked) await say('Walpurga, kann ich mir deinen Spiegel ausleihen?');
  await sayAs('walpurga', 'Meinen Schönheitsspiegel? Wofür das denn?');
  await say('Für Morbus Muffelgrau. Grimbart sagt, er ist schrecklich eitel.');
  await sayAs('walpurga', 'HIHIHI! Oh ja, der eitle Pfau! Der würde einer Pfütze einen Heiratsantrag machen, wenn er sich darin spiegelt.');
  await sayAs('walpurga', 'Nimm ihn. Aber bring ihn heil zurück! Ohne Kratzer!');
  setFlag('gotMirror'); addItem('spiegel');
}

// ======================================================================
// STINKESUMPF
// ======================================================================
const BRIDGE_POLY = [[58, 106], [100, 101], [12, 60], [0, 60], [0, 74]];

ROOMS.swamp = {
  name: 'Stinkesumpf', music: 'swamp',
  walk: [[60, 108], [100, 103], [320, 103], [320, 135], [30, 135]],
  scale: [100, 0.86, 134, 1],
  paint(p) {
    p.vgrad(0, 0, W, 78, ['#3c4a3c', '#56664c', '#7a8862', '#8e9a76']);
    const r = rng(151);
    for (let i = 0; i < 9; i++) {
      const x = 20 + i * 36 + Math.floor(r() * 14), base = 72, h = 26 + Math.floor(r() * 22);
      p.thick(x, base, x + (r() - 0.5) * 6, base - h, 2, '#46523e');
      for (let k = 0; k < 3; k++) { const y = base - h * (0.4 + k * 0.2); p.line(x, y, x + (r() - 0.5) * 22, y - 8 - r() * 6, '#46523e'); }
    }
    p.tint(0, 40, W, 36, '#b4bea4', (x, y) => Math.max(0, 0.42 - Math.abs(y - 62) * 0.028));
    // Wasser
    p.vgrad(0, 70, W, 66, ['#3a5040', '#2c4232', '#24382a', '#1e3024']);
    for (let i = 0; i < 90; i++) { const x = Math.floor(r() * W), y = 72 + Math.floor(r() * 34); p.rect(x, y, 3 + Math.floor(r() * 5), 1, '#46664c'); }
    // Schilf
    for (let i = 0; i < 26; i++) {
      const x = 110 + Math.floor(r() * 200), y = 98 + Math.floor(r() * 6), h = 8 + Math.floor(r() * 12);
      p.line(x, y, x + (r() - 0.5) * 3, y - h, '#5a7a3a');
      if (r() < 0.5) p.rect(x - 1, y - h, 2, 4, '#6a4a2a');
    }
    // Ufer / Schlamm
    p.poly([[30, 104], [80, 104], [140, 101], [210, 104], [260, 100], [320, 102], [320, 136], [10, 136]], '#5a4a30');
    p.noise(0, 100, W, 36, '#4a3c24', 0.12, 152); p.noise(0, 100, W, 36, '#6e5c3e', 0.07, 153);
    p.ellipse(180, 124, 22, 3, '#3a4636'); p.ellipse(260, 130, 16, 2, '#3a4636'); p.ellipse(110, 128, 12, 2, '#3a4636');
    for (let i = 0; i < 30; i++) { const x = 30 + Math.floor(r() * 290), y = 104 + Math.floor(r() * 30); p.line(x, y, x - 1, y - 3, '#5a6a34'); p.line(x, y, x + 1, y - 3, '#6a7a3a'); }
    // Toter Baum rechts
    p.poly([[256, 104], [262, 40], [270, 38], [272, 104]], '#3a3224'); p.poly([[250, 106], [258, 98], [272, 98], [282, 106]], '#3a3224');
    p.thick(264, 60, 240, 40, 2, '#3a3224'); p.thick(240, 40, 232, 44, 1, '#3a3224'); p.thick(268, 52, 294, 34, 2, '#3a3224'); p.thick(294, 34, 302, 36, 1, '#3a3224'); p.thick(266, 42, 262, 22, 2, '#3a3224');
    p.line(264, 44, 264, 100, '#4a4030');
    // Brücke
    const nl = [58, 106], nr = [100, 101], fl = [0, 74], frr = [12, 60];
    p.poly(BRIDGE_POLY, '#6a4a2a');
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const a = [nl[0] + (fl[0] - nl[0]) * t, nl[1] + (fl[1] - nl[1]) * t], b = [nr[0] + (frr[0] - nr[0]) * t, nr[1] + (frr[1] - nr[1]) * t];
      p.line(a[0], a[1], b[0], b[1], '#4a3018');
    }
    p.line(58, 106, 100, 101, '#8a6a3a');
    p.rect(57, 86, 3, 21, '#4a3018'); p.rect(99, 80, 3, 22, '#4a3018');
    p.line(58, 87, -4, 56, '#a08a5a'); p.line(100, 81, 8, 44, '#a08a5a');
    p.line(58, 95, -4, 66, '#8a7448'); p.line(100, 90, 8, 54, '#8a7448');
    // Nebelschwaden über der Brücke
    p.tint(0, 40, 70, 44, '#b0b8a0', (x, y) => Math.max(0, 0.6 - x * 0.009));
    // Seerosenblatt
    p.ellipse(182, 97, 10, 3, '#2c6a2c'); p.ellipse(182, 96, 9, 2, '#3c8a3a'); p.poly([[182, 96], [192, 95], [190, 98]], '#2c4232');
    p.circle(196, 93, 1, '#f0a0c0');
  },
  back(ctx, t) {
    for (let i = 0; i < 7; i++) {
      const x = 120 + ((i * 53 + t * 8) % 190), y = 30 + ((i * 29) % 50) + Math.sin(t * 2 + i) * 4;
      if (Math.floor(t * 3 + i) % 3) fr(ctx, x, y, 1, 1, '#e8f070');
    }
    for (let i = 0; i < 4; i++) {
      const k = (t * 0.5 + i * 0.27) % 1;
      const x = 130 + i * 40;
      if (k < 0.3) fr(ctx, x, 92 - k * 6, 2, 1, '#6a8a6a');
    }
    // Schimmern auf der Wasseroberfläche
    for (let i = 0; i < 9; i++) {
      if (Math.sin(t * 1.8 + i * 1.7) < 0.4) continue;
      const x = 116 + ((i * 47 + Math.floor(t * 4) * 3) % 196), y = 74 + ((i * 13) % 24);
      fr(ctx, x, y, 2, 1, i % 3 ? '#6a9070' : '#8ab890');
      fr(ctx, x + 2, y, 1, 1, '#a8d0a8');
    }
  },
  update(dt, t) {
    if (flag('trollLaughing') && Math.floor(t * 0.8) !== Math.floor((t - dt) * 0.8)) Audio8.sfx('laugh');
  },
  objects: [
    {
      id: 'sumpf', name: 'Sumpf', rect: [100, 72, 220, 28], walk: [200, 108], face: 'up',
      on: {
        look: () => say('Der Stinkesumpf. Der Name ist Programm. Es riecht nach faulen Eiern und Turnbeutel.'),
        use: (item) => item ? say('Das werfe ich nicht in den Sumpf. Der Sumpf hat genug Probleme.') : say('Ich stecke da bestimmt nicht die Hand rein.'),
        take: () => say('Sumpfwasser? Nein danke.'),
      },
    },
    {
      id: 'baum', name: 'toter Baum', rect: [232, 20, 74, 84], walk: [262, 110], face: 'up',
      on: { look: () => say('Ein toter Baum. Sieht aus wie eine Hand, die aus dem Sumpf greift. Gemütlich.'), use: () => say('Klettern? Auf DEN? Der bricht doch zusammen, wenn ich ihn nur anschaue.') },
    },
    {
      id: 'bruecke', name: 'Brücke', poly: BRIDGE_POLY, walk: [86, 106], face: 'left',
      exit: { to: 'towergate', x: 290, y: 122, dir: 'left', ok: () => flag('bridgeOpen'), blocked: async () => { await sayAs('troll', 'NIX DA! Erst Zoll zahlen!'); await say('Ein Troll mit Prinzipien. Na toll.'); } },
      on: {
        look: () => say('Eine wackelige Holzbrücke, die im Nebel verschwindet. Dahinter soll der Turm von Muffelgrau sein.'),
        use: () => flag('bridgeOpen') ? goRoom('towergate', 290, 122, 'left') : sayAs('troll', 'NIX DA! Erst Zoll zahlen!'),
      },
    },
    {
      id: 'flasche', name: 'Flasche', rect: [210, 80, 26, 18], walk: [226, 108], face: 'up', z: 96,
      hidden: () => flag('gotBottle'),
      draw(ctx, t) { const y = Math.round(Math.sin(t * 2) * 1.2); ctx.drawImage(iconCanvas('flasche'), 214, 82 + y, 20, 14); },
      on: {
        look: () => say('Eine Flasche treibt im Wasser. Vielleicht eine Flaschenpost?'),
        take: () => say('Zu weit draußen. Ich will nicht in den Stinkesumpf plumpsen.'),
        use: async (item) => {
          if (item === 'stock') {
            await say('Mit dem Stock angle ich die Flasche heran...');
            Audio8.sfx('splash');
            await wait(600);
            setFlag('gotBottle'); addItem('flasche');
            await say('Hab sie! Leider keine Flaschenpost. Nur leer. Aber mit Korken!');
            return;
          }
          return false;
        },
      },
    },
    {
      id: 'eimer', name: 'Eimer', rect: [270, 100, 28, 20], walk: [272, 122], face: 'right', z: 120,
      hidden: () => flag('gotBucket'),
      draw(ctx) { ctx.drawImage(iconCanvas('eimer'), 274, 104, 22, 16); fr(ctx, 274, 116, 22, 4, '#5a4a30'); fr(ctx, 276, 116, 4, 1, '#4a3c24'); },
      on: {
        look: () => say('Ein alter Eimer, halb im Schlamm versunken.'),
        take: async () => {
          await say('Hnnngh...');
          Audio8.sfx('splash');
          await say('*SCHMATZ!* Hab ihn.');
          setFlag('gotBucket'); addItem('eimer');
        },
      },
    },
    {
      id: 'frosch', name: 'Frosch', the: 'der Frosch', rect: [172, 82, 22, 16], walk: [182, 108], face: 'up', z: 97,
      npc: { color: '#90ff70', head: [182, 82] },
      draw(ctx, t) { blit(ctx, frogSprite(Math.floor(t * 0.7) % 2, talking('frosch')), 182, 97, 10, 14, 1, false, 9); },
      on: {
        look: () => say('Ein Frosch mit einer winzigen Krone. Natürlich.'),
        talk: () => talkFrog(),
        take: () => sayAs('frosch', 'Hände weg! Ich bin adlig! Quak!'),
        use: (item) => item ? sayAs('frosch', 'Was soll ich damit? Ich bin ein Frosch. Frösche haben keine Taschen.') : say('Ich küsse keine Frösche. Auch keine adligen.'),
      },
    },
    {
      id: 'exitO', name: 'Weg zur Lichtung', rect: [310, 100, 10, 36], walk: [318, 120], face: 'right',
      exit: { to: 'clearing', x: 16, y: 120, dir: 'right' },
      on: { look: () => say('Zurück zur Lichtung. Wo es nicht stinkt.') },
    },
    {
      id: 'troll', name: 'Troll', the: 'der Troll', walk: () => (flag('bridgeOpen') ? [64, 120] : [96, 112]), face: 'left',
      get rect() { return flag('bridgeOpen') ? [6, 52, 46, 70] : [32, 34, 46, 70]; },
      z: 104,
      npc: { color: '#a8e070', get head() { return flag('bridgeOpen') ? [28, 58] : [54, 38]; } },
      draw(ctx, t) {
        const laugh = flag('trollLaughing');
        const f = Math.floor(t * (laugh ? 10 : 1)) % 2;
        if (flag('bridgeOpen')) blit(ctx, trollSprite(f, talking('troll'), laugh), 28, 122, 28, 74, 1, false, 30);
        else blit(ctx, trollSprite(f, talking('troll'), laugh), 54, 104, 28, 74, 1, false, 30);
      },
      on: {
        look: () => say('Ein Brückentroll. Groß, grün und mit dem Charme einer Kläranlage.'),
        talk: () => talkTroll(),
        take: () => say('Den kann ich nicht mal mit einem Gabelstapler bewegen.'),
        move: () => say('Ich schiebe doch keinen Troll! Der schiebt höchstens mich. In den Sumpf.'),
        use: async (item) => {
          if (item === 'feder') return tickleTroll();
          if (item === 'flasche') return catchGiggle();
          if (item === 'stock') { await say('Ich pieks ihn mit dem Stock...'); return sayAs('troll', 'Hör auf damit, du Zahnstocher!'); }
          if (item === 'spiegel') { await sayAs('troll', 'Hö. Gutaussehender Kerl.'); return say('Na, wenigstens einer, der sich mag.'); }
          return false;
        },
        give: async (item) => {
          if (item === 'taler') return sayAs('troll', 'Ein Taler? Ich sagte DREI. Mathe ist nicht deine Stärke, was?');
          if (item === 'brot') return sayAs('troll', 'Ich esse kein Brot. Ich esse Steine. Und Leute, die mir Brot anbieten.');
          if (item === 'feder') return tickleTroll();
          return sayAs('troll', 'Bestechung? Knorz ist nicht bestechlich! Nur bezahlbar. Drei Taler.');
        },
      },
    },
  ],
};

async function talkTroll() {
  if (flag('bridgeOpen')) {
    await sayAs('troll', 'Na, Kleiner? Danke nochmal für das Lachen. Mir tut immer noch der Bauch weh. Hö.');
    return;
  }
  if (flag('trollLaughing')) { await sayAs('troll', 'HÖHÖHÖ! Ich... HÖHÖ... kann nicht... aufhören! HÖHÖHÖ!'); return; }
  if (!flag('metTroll')) {
    setFlag('metTroll');
    await sayAs('troll', 'HALT! Wer über Knorz\' Brücke will, zahlt Zoll!');
    await say('Wie viel?');
    await sayAs('troll', 'Drei Goldtaler. Oder du bringst mich zum Lachen.');
    await sayAs('troll', 'Aber Knorz hat seit 412 Jahren nicht mehr gelacht. Knorz ist ein sehr ernster Troll.');
  } else await sayAs('troll', 'Na? Drei Taler? Oder ein Witz? Knorz wartet.');
  await converse(() => [
    { text: 'Ich erzähl dir einen Witz!', run: () => trollJokes() },
    { text: 'Bist du kitzlig?', run: async () => {
      await sayAs('troll', 'Kitzlig? HA! Knorz ist nicht kitzlig!');
      await sayAs('troll', '...Zumindest nicht am Bauch. Und schon gar nicht mit Federn. Federn sind das Schlimmste.');
      await sayAs('troll', '...Warum erzähl ich dir das eigentlich?');
      setFlag('knowsTickle');
    } },
    { text: 'Ich hab keine drei Taler.', run: async () => {
      await sayAs('troll', 'Dann bleibst du auf dieser Seite. Ich hab Zeit. Viel Zeit. 412 Jahre und so.');
    } },
    { text: 'Wohin führt die Brücke?', run: async () => {
      await sayAs('troll', 'Zum Turm von Muffelgrau. Keiner will da hin. Außer Leute, die keiner mehr wiedersieht.');
      await say('Klingt einladend.');
    } },
    { text: 'Tschüss.', end: true, run: () => sayAs('troll', 'Hmpf.') },
  ]);
}

async function trollJokes() {
  const i = await choose([
    'Was ist grün und klopft an die Tür? Ein Klopfsalat!',
    'Treffen sich zwei Trolle. Sagt der eine: "Brücke?" Der andere: "Brücke."',
    'Warum können Geister so schlecht lügen? Weil man durch sie hindurchsieht!',
    'Ach, lass mal.',
  ]);
  E.dialog = null;
  if (i === 3) return;
  const jokes = [
    ['Was ist grün und klopft an die Tür? Ein Klopfsalat!', 'Salat ist Hasenfutter. Nicht lustig.'],
    ['Treffen sich zwei Trolle. Sagt der eine: "Brücke?" Sagt der andere: "Brücke."', 'Das ist kein Witz. Das ist mein Dienstag.'],
    ['Warum können Geister so schlecht lügen? Weil man durch sie hindurchsieht!', 'Knorz hat noch nie einen Geist gesehen. Knorz bezweifelt ihre Existenz.'],
  ];
  await say(jokes[i][0]);
  await wait(500);
  await sayAs('troll', '...');
  await sayAs('troll', jokes[i][1]);
  Audio8.sfx('fail');
  await sayAs('troll', 'Nicht gelacht. Nächster Versuch – oder drei Taler.');
}

async function tickleTroll() {
  if (flag('bridgeOpen')) return sayAs('troll', 'Hö! Nicht nochmal! Mein Bauch tut schon weh!');
  if (flag('trollLaughing')) return say('Er lacht doch schon. Noch mehr, und er platzt.');
  await say('Kille kille kille...');
  setFlag('trollLaughing');
  Audio8.sfx('laugh');
  E.shake = 0.6;
  await sayAs('troll', 'Hö... HÖHÖ... HÖHÖHÖHÖ! HÖR AUF! HÖHÖHÖ!');
  await sayAs('troll', 'HÖHÖ! Das ist... HÖHÖ... unfair! HÖHÖHÖ!');
  await say('Er kichert wie verrückt. Das Kichern hallt über den ganzen Sumpf...');
  if (has('flasche')) await say('Das sollte ich schnell einfangen, bevor es weg ist!');
  else await say('Wenn ich nur etwas hätte, um das Kichern einzufangen...');
}

async function catchGiggle() {
  if (flag('bridgeOpen')) return say('Ich habe schon genug Kichern für ein ganzes Leben.');
  if (!flag('trollLaughing')) return say('Der Troll lacht gerade nicht. Eine Flasche voll schlechter Laune brauche ich nicht.');
  await say('Schnell, die Flasche auf...');
  Audio8.sfx('laugh');
  burst(54, 50, 20, ['#f0e060', '#ffffff']);
  await wait(500);
  await say('...und Korken drauf!');
  Audio8.sfx('pickup');
  removeItem('flasche'); addItem('kichern', true);
  setFlag('trollLaughing', false); setFlag('ingGiggleCaught');
  await sayAs('troll', 'Puh... hö... das war... GROSSARTIG!');
  await sayAs('troll', 'So viel Spaß hatte Knorz seit 412 Jahren nicht. Na gut, Kleiner. Du darfst über meine Brücke.');
  E.fade = 0;
  setFlag('bridgeOpen');
  Audio8.sfx('thud'); E.shake = 0.3;
  await sayAs('troll', 'Und komm mal wieder zum Kitzeln vorbei. Aber sag\'s keinem!');
}

async function talkFrog() {
  if (!flag('metFrog')) {
    setFlag('metFrog');
    await sayAs('frosch', 'Sei gegrüßt, Fremder! Ich bin Prinz Quentin von Quakenstein!');
    await sayAs('frosch', 'Ein grausamer Fluch hat mich in einen Frosch verwandelt. Nur ein Kuss kann mich erlösen!');
  } else await sayAs('frosch', 'Quak! Ah, der Fremde. Hast du es dir mit dem Kuss überlegt?');
  await converse(() => [
    { text: 'Wer hat dich verflucht?', run: async () => {
      await sayAs('frosch', 'Morbus Muffelgrau! Er fand meine Krone zu bunt. Zu BUNT! Sie ist golden!');
      setFlag('knowsMorbus');
    } },
    { text: 'Ich küsse dich bestimmt nicht.', run: async () => { await sayAs('frosch', 'Das sagen alle. Seit 30 Jahren. Quak.'); } },
    { text: 'Weißt du was über den Troll?', run: async () => {
      await sayAs('frosch', 'Knorz? Der tut nur so grimmig. In Wahrheit ist er schrecklich kitzlig.');
      await sayAs('frosch', 'Ich hab mal gesehen, wie ihn eine Entenfeder fast in den Sumpf gelacht hat. Quak quak!');
      setFlag('knowsTickle');
    } },
    { text: 'Gibt es hier was Nützliches?', run: async () => {
      await sayAs('frosch', 'Im Schlamm steckt ein alter Eimer. Und da draußen treibt seit Wochen eine Flasche herum.');
      await sayAs('frosch', 'Ich würde sie ja holen, aber ich habe keine Arme. Nur Beine. Und Würde.');
    } },
    { text: 'Tschüss, Hoheit.', end: true, run: () => sayAs('frosch', 'Lebe wohl! Und falls du eine Prinzessin triffst... gib ihr meine Adresse. Quak.') },
  ]);
}

// ======================================================================
// TURMTOR
// ======================================================================
ROOMS.towergate = {
  name: 'Turmtor', music: 'tower',
  walk: [[0, 116], [320, 112], [320, 135], [0, 135]],
  scale: [100, 0.86, 134, 1],
  bgKey: () => (flag('colorRestored') ? 'c' : 'g'),
  paint(p) {
    p.vgrad(0, 0, W, 92, ['#5a7ac8', '#7a9ad8', '#a8c4e8', '#c8dcf0']);
    cloud(p, 60, 20, 0.9, 171); cloud(p, 270, 12, 0.7, 172);
    p.poly([[0, 80], [40, 70], [90, 78], [140, 66], [250, 74], [320, 64], [320, 96], [0, 96]], '#6a9a7a');
    p.vgrad(0, 92, W, 44, ['#4a8a3e', '#56a046', '#62ac4e']);
    p.noise(0, 92, W, 44, '#3c7a34', 0.1, 173);
    // Pfad zum Tor
    p.poly([[176, 112], [210, 112], [250, 136], [150, 136]], '#a8885a'); p.poly([[210, 116], [300, 104], [320, 104], [320, 114], [240, 124]], '#a8885a');
    p.noise(150, 104, 170, 32, '#8a6a40', 0.08, 174);
    // Turm
    p.hgrad(150, 0, 86, 114, ['#3a3a44', '#6a6a76', '#8a8a96', '#7a7a86', '#4a4a54', '#2a2a32']);
    for (let y = 0; y < 114; y += 7) {
      p.rect(150, y, 86, 1, '#2a2a30');
      for (let x = 150 + ((y / 7) % 2) * 7; x < 236; x += 14) p.rect(x, y, 1, 7, '#2a2a30');
    }
    p.rect(186, 18, 6, 14, '#141418'); p.rect(200, 46, 6, 14, '#141418'); p.rect(172, 50, 5, 12, '#141418');
    p.rect(146, 108, 94, 6, '#5a5a64'); p.rect(146, 108, 94, 1, '#8a8a94');
    // Tor (Bogen)
    p.ellipse(193, 70, 19, 12, '#2a2a30'); p.rect(174, 70, 38, 42, '#2a2a30');
    p.ellipse(193, 70, 16, 10, '#5a3a22'); p.rect(177, 70, 32, 40, '#5a3a22');
    for (let x = 181; x < 208; x += 6) p.rect(x, 62, 1, 48, '#3e2614');
    p.rect(177, 78, 32, 2, '#3a3a44'); p.rect(177, 98, 32, 2, '#3a3a44');
    for (const x of [181, 193, 205]) { p.set(x, 79, '#8a8a94'); p.set(x, 99, '#8a8a94'); }
    p.circle(201, 90, 2, '#3a3a44'); p.ring(201, 90, 3, '#6a6a74');
    // Säule mit Wasserspeier
    p.rect(124, 76, 22, 38, '#6a6a74'); p.rect(124, 76, 6, 38, '#8a8a94'); p.rect(140, 76, 6, 38, '#4a4a54');
    p.rect(120, 72, 30, 5, '#7a7a84'); p.rect(120, 72, 30, 1, '#9a9aa4'); p.rect(120, 110, 30, 4, '#5a5a64');
    // Brückenende rechts
    p.poly([[270, 112], [320, 98], [320, 106], [276, 118]], '#6a4a2a');
    for (let i = 0; i < 8; i++) p.line(272 + i * 6, 112 - i * 1.7, 276 + i * 6, 118 - i * 1.7, '#4a3018');
    p.rect(272, 98, 2, 16, '#4a3018'); p.line(273, 99, 320, 86, '#a08a5a');
    // tote Büsche
    for (const [x, y] of [[30, 112], [92, 118], [256, 126]]) { p.line(x, y, x - 6, y - 10, '#4a3a2a'); p.line(x, y, x + 4, y - 12, '#4a3a2a'); p.line(x, y, x + 8, y - 6, '#4a3a2a'); }
    if (!flag('colorRestored')) p.gray(true);
  },
  objects: [
    {
      id: 'land', name: 'Landschaft', rect: [0, 0, 140, 92], walk: [60, 120], face: 'up',
      on: { look: () => say(flag('colorRestored') ? 'Alles wieder bunt! Viel besser.' : 'Hier ist alles grau. Das Gras. Die Luft. Sogar meine Laune.') },
    },
    {
      id: 'turm', name: 'Turm', rect: [150, 0, 86, 60], walk: [193, 118], face: 'up',
      on: { look: () => say('Der Turm von Morbus Muffelgrau. Grau, grauer, am grauesten.') },
    },
    {
      id: 'tor', name: 'Tor', rect: [174, 58, 38, 54], walk: [193, 118], face: 'up',
      exit: { to: 'tower', x: 44, y: 122, dir: 'right', ok: () => flag('gateOpen'), blocked: async () => { await say('Das Tor ist verschlossen.'); await sayAs('fratz', 'Ohne mein Rätsel kommt hier keiner rein!'); } },
      on: {
        look: () => say(flag('gateOpen') ? 'Das Tor steht offen. Drinnen ist es dunkel. Und grau. Natürlich.' : 'Ein riesiges Tor. Das Schloss ist so groß wie mein Kopf.'),
        open: async () => {
          if (!flag('gateOpen')) { await say('Verschlossen.'); return sayAs('fratz', 'Ohne mein Rätsel kommt hier keiner rein!'); }
          Audio8.sfx('door');
          return goRoom('tower', 44, 122, 'right');
        },
        use: (item) => item ? say('Das passt nicht ins Schloss. Nichts passt in dieses Schloss. Außer vielleicht ein Kopf.') : false,
      },
    },
    {
      id: 'tueroffen', z: 70,
      hidden: () => !flag('gateOpen'),
      draw(ctx) { ctx.fillStyle = '#0c0c10'; ctx.fillRect(177, 66, 32, 44); ctx.fillRect(181, 61, 24, 5); ctx.fillStyle = '#3a3a44'; ctx.fillRect(170, 66, 6, 44); },
    },
    {
      id: 'exitO', name: 'Brücke zum Sumpf', rect: [272, 90, 48, 30], walk: [300, 116], face: 'right',
      exit: { to: 'swamp', x: 92, y: 110, dir: 'right' },
      on: { look: () => say('Die Brücke zurück zum Stinkesumpf.') },
    },
    {
      id: 'fratz', name: 'Wasserspeier', the: 'der Wasserspeier', rect: [112, 34, 46, 40], walk: [140, 120], face: 'up', z: 74,
      npc: { color: '#d0d0d8', head: [135, 34] },
      draw(ctx) {
        const img = gargoyleSprite(talking('fratz'), isTalking('fratz'));
        blit(ctx, img, 135, 73, 22, 38, 1, false, 18);
      },
      on: {
        look: () => say('Ein steinerner Wasserspeier. Seine Augen folgen mir. Das ist nicht gruselig. Gar nicht.'),
        talk: () => talkGargoyle(),
        take: () => sayAs('fratz', 'Ich bin aus Stein und wiege eine Tonne. Viel Spaß beim Tragen.'),
        use: async (item) => {
          if (item === 'feder') { await say('Kille kille?'); return sayAs('fratz', 'Ich bin aus STEIN, du Hohlkopf. Ich spüre nichts. Außer Verachtung.'); }
          if (item === 'spiegel') return sayAs('fratz', 'Ich weiß, dass ich hässlich bin. Ich bin ein WASSERSPEIER. Das ist der Job.');
          return false;
        },
      },
    },
  ],
};

async function talkGargoyle() {
  if (flag('gateOpen')) return sayAs('fratz', 'Geh schon rein. Ich hab Mittagspause. Seit 300 Jahren.');
  if (!flag('metFratz')) {
    setFlag('metFratz');
    await sayAs('fratz', 'HALT! Ich bin Fratz, Wächter des grauen Tores!');
    await sayAs('fratz', 'Wer hier hinein will, muss mein Rätsel lösen. Wer falsch rät, wird... ausgelacht.');
    await say('Das kenn ich aus der Schule.');
  }
  await sayAs('fratz', 'Hör gut zu: Je mehr man davon wegnimmt, desto größer wird es. Was ist es?');
  const i = await choose(['Ein Loch.', 'Mein Taschengeld.', 'Ein Kuchen.', 'Deine Nase.', 'Keine Ahnung.']);
  E.dialog = null;
  await say(['Ein Loch.', 'Mein Taschengeld.', 'Ein Kuchen.', 'Deine Nase.', 'Keine Ahnung.'][i]);
  if (i === 0) {
    await sayAs('fratz', 'Grrr... RICHTIG! Verflixt und zugemauert!');
    await sayAs('fratz', 'Das Tor ist offen. Aber beschwer dich nicht, wenn du als Gartenzwerg wieder rauskommst.');
    Audio8.sfx('door'); E.shake = 0.3;
    setFlag('gateOpen');
    return;
  }
  Audio8.sfx('fail');
  const wrong = [
    null,
    'Falsch! Dein Taschengeld wird kleiner, wenn man was wegnimmt. Glaub mir, ich weiß das.',
    'Falsch! Und jetzt hab ich Hunger. Danke auch.',
    'Meine Nase ist aus Stein! Da nimmt keiner was weg! FALSCH!',
    'Dann komm wieder, wenn du eine hast. HAHAHA!',
  ];
  await sayAs('fratz', wrong[i]);
}

// ======================================================================
// TURMZIMMER
// ======================================================================
const tower = { beam: 0 };
ROOMS.tower = {
  name: 'Turmzimmer', music: 'tower',
  walk: [[40, 112], [300, 110], [316, 135], [4, 135], [4, 124]],
  scale: [104, 0.9, 134, 1],
  bgKey: () => (flag('colorRestored') ? 'c' : 'g'),
  paint(p) {
    p.rect(0, 0, W, 100, '#6a5a7a');
    for (let y = 0; y < 100; y += 8) {
      p.rect(0, y, W, 1, '#3a2e48');
      for (let x = ((y / 8) % 2) * 9; x < W; x += 18) p.rect(x, y, 1, 8, '#3a2e48');
    }
    p.noise(0, 0, W, 100, '#7a6a8a', 0.08, 191);
    // Fenster
    for (const x of [52, 112]) {
      p.ellipse(x + 10, 26, 10, 8, '#2a2236'); p.rect(x, 26, 20, 46, '#2a2236');
      p.ellipse(x + 10, 26, 8, 6, '#a8d0f0'); p.vgrad(x + 2, 26, 16, 44, ['#a8d0f0', '#d0e8f8', '#80b880']);
      p.rect(x + 9, 20, 2, 50, '#2a2236'); p.rect(x + 2, 46, 16, 2, '#2a2236');
      p.polyTint([[x + 2, 70], [x + 18, 70], [x + 30, 112], [x - 6, 112]], '#e8f0ff', 0.14);
    }
    // Banner
    for (const x of [86, 236]) {
      p.rect(x, 10, 16, 40, '#8a2a6a'); p.poly([[x, 50], [x + 16, 50], [x + 8, 58]], '#8a2a6a');
      p.rect(x + 4, 20, 2, 16, '#e0c040'); p.rect(x + 10, 20, 2, 16, '#e0c040'); p.line(x + 5, 20, x + 8, 28, '#e0c040'); p.line(x + 11, 20, x + 8, 28, '#e0c040');
      p.rect(x - 2, 9, 20, 2, '#4a3a2a');
    }
    // Regale für die Zwergensammlung
    for (const y of [42, 70]) { p.rect(138, y, 74, 3, '#5a3a22'); p.rect(138, y + 3, 74, 1, '#1c120a'); }
    // Tür
    p.ellipse(22, 46, 14, 8, '#1c1624'); p.rect(8, 46, 28, 64, '#1c1624'); p.ellipse(22, 46, 11, 6, '#4a3020'); p.rect(11, 46, 22, 62, '#4a3020');
    for (let x = 15; x < 33; x += 5) p.rect(x, 42, 1, 66, '#3a2414');
    // Boden
    p.rect(0, 98, W, 38, '#5a5262');
    const r = rng(192);
    for (let y = 98, h = 4; y < SCENE_H; y += h, h = Math.min(14, h * 1.35)) {
      p.rect(0, y, W, 1, '#3a3244');
      for (let x = Math.floor(r() * 30); x < W; x += 26 + Math.floor(r() * 26)) p.rect(x, y, 1, Math.round(h), '#3a3244');
    }
    // Teppich
    p.ellipse(176, 122, 92, 11, '#8a1a2a'); p.ellipse(176, 122, 86, 9, '#b02a3a'); p.ellipse(176, 122, 70, 6, '#c8a040'); p.ellipse(176, 122, 66, 5, '#b02a3a');
    // Podest
    p.rect(268, 88, 28, 26, '#7a6a8a'); p.rect(268, 88, 8, 26, '#9a8aaa'); p.rect(288, 88, 8, 26, '#5a4a6a');
    p.rect(264, 84, 36, 5, '#8a7a9a'); p.rect(264, 84, 36, 1, '#aa9aba'); p.rect(264, 112, 36, 3, '#5a4a6a');
    if (!flag('colorRestored')) p.gray(true);
  },
  back(ctx, t) {
    // Portalstein
    if (!flag('stoneTaken')) {
      const cols = ['#ff4060', '#ffa020', '#ffe040', '#40e060', '#40a0ff', '#a060ff'];
      const c = cols[Math.floor(t * 6) % cols.length];
      ctx.fillStyle = c; ctx.fillRect(278, 74, 8, 10); ctx.fillRect(276, 76, 12, 6);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(279, 75, 2, 2);
      ctx.globalAlpha = 0.3 + Math.sin(t * 4) * 0.15; ctx.fillStyle = c; ctx.fillRect(272, 70, 20, 18); ctx.globalAlpha = 1;
    }
  },
  front(ctx, t) {
    if (flag('morbusCharging') && !flag('morbusDefeated')) {
      for (let i = 0; i < 10; i++) {
        const a = t * 3 + i * 0.63, rr = 8 + Math.sin(t * 5 + i) * 3;
        fr(ctx, 236 + Math.cos(a) * rr, 46 + Math.sin(a) * rr, 1, 1, i % 2 ? '#e0e0f0' : '#8a8aa0');
      }
    }
    if (flag('mirrorUp')) ctx.drawImage(iconCanvas('spiegel'), E.zack.x + 4, E.zack.y - 34, 14, 10);
    if (tower.beam > E.t) {
      ctx.strokeStyle = Math.floor(t * 20) % 2 ? '#ffffff' : '#a0a0ff';
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(236, 46); ctx.lineTo(E.zack.x + 10, E.zack.y - 30); ctx.stroke();
    }
  },
  async enter() {
    if (flag('morbusDefeated')) return;
    if (!has('spiegel')) {
      await sayAs('morbus', E.zack.hat ? 'Sieh an. Ein Besucher. Mit einem HUT. Einem BLAUEN Hut.' : 'Sieh an. Ein Kind. In einem GRÜNEN Pulli. Wie... geschmacklos.');
      await say('Äh... hallo? Ich hätte gern den Portalstein zurück.');
      await sayAs('morbus', 'Ich hasse Besuch. Und Farben. Und Besuch mit Farben. HINFORT!');
      setFlag('morbusCharging');
      Audio8.sfx('zap'); tower.beam = E.t + 0.5;
      await wait(400);
      await flash('#ffffff', 500);
      setFlag('morbusCharging', false);
      await goRoom('swamp', 120, 120, 'right');
      await say('Autsch. Der hat mich einfach rausgezaubert.');
      if (E.zack.hat) await say('Grimbart meinte, Muffelgrau sei schrecklich eitel... Damit sollte ich was anfangen.');
      else await say('Gegen den komme ich so nicht an. Ich brauche Hilfe. Und einen Plan.');
      return;
    }
    await sayAs('morbus', 'Sieh an, Grimbarts kleiner Lehrling. Wie niedlich. Und wie... BUNT.');
    await sayAs('morbus', 'Du kommst gerade recht für meine Sammlung.');
    await say('Sammlung?');
    await sayAs('morbus', 'Gartenzwerge! Graue Gartenzwerge! Sie sind so herrlich... langweilig.');
    await sayAs('morbus', 'Und gleich bist du einer davon! Hokus Grauus Langweilibus...!');
    setFlag('morbusCharging');
    Audio8.sfx('creak');
    await sayAs('narrator', '(Muffelgrau sammelt graue Energie für seinen Zauber. Das dauert offenbar.)');
  },
  objects: [
    {
      id: 'fenster', name: 'Fenster', rect: [50, 16, 84, 58], walk: [92, 116], face: 'up',
      on: { look: () => say(flag('colorRestored') ? 'Draußen wird alles wieder bunt. Ganz Fabulien leuchtet!' : 'Von hier oben sieht man ganz Fabulien. Alles wird grau. Noch.') },
    },
    {
      id: 'banner', name: 'Banner', rect: [84, 8, 20, 52], walk: [94, 116], face: 'up',
      on: { look: () => say('Ein Banner mit einem großen M. Für "Muffelgrau". Oder "Mega-Langweiler".') },
    },
    {
      id: 'tuer', name: 'Tür', rect: [6, 36, 32, 76], walk: [30, 122], face: 'left',
      exit: { to: 'towergate', x: 193, y: 118, dir: 'down' },
      on: { look: () => say('Der Ausgang.') },
    },
    {
      id: 'zwerge', name: 'Gartenzwerg-Sammlung', rect: [138, 10, 74, 62], walk: [176, 116], face: 'up', z: 72,
      draw(ctx) {
        const g = !flag('colorRestored');
        for (let i = 0; i < 5; i++) blit(ctx, gnomeSprite(false, false, g), 146 + i * 14, 42, 12, 34, 0.8, false, 12);
        for (let i = 0; i < 4; i++) blit(ctx, gnomeSprite(false, false, g), 152 + i * 16, 70, 12, 34, 0.8, i % 2 === 1, 12);
      },
      on: {
        look: () => say(flag('colorRestored') ? 'Die Gartenzwerge werden langsam wieder bunt. Einer zwinkert mir zu!' : 'Graue Gartenzwerge. Alles verzauberte Leute, schätze ich. Einer sieht aus wie der Bäcker vom Dorf.'),
        take: () => say('Die gehören niemandem. Bzw. sich selbst. Das ist kompliziert.'),
        talk: () => say('Hallo? Ihr werdet bald befreit. Versprochen.'),
      },
    },
    {
      id: 'stein', name: 'Portalstein', rect: [268, 66, 28, 22], walk: [256, 120], face: 'right',
      hidden: () => flag('stoneTaken'),
      on: {
        look: () => say('Ein funkelnder Stein, der in allen Farben leuchtet. Das einzig Bunte hier drin.'),
        take: async () => {
          if (!flag('morbusDefeated')) return sayAs('morbus', 'Finger weg von meinem Stein, du Rotzlöffel!');
          return finale();
        },
      },
    },
    {
      id: 'podest', name: 'Podest', rect: [264, 88, 36, 26], walk: [256, 120], face: 'right',
      on: { look: () => say('Ein Podest. Sehr dramatisch. Muffelgrau hat einen Hang zur Deko.') },
    },
    {
      id: 'morbus', name: 'Morbus Muffelgrau', the: 'Muffelgrau', rect: [204, 36, 40, 82], walk: [176, 122], face: 'right', z: 118,
      hidden: () => flag('morbusDefeated'),
      npc: { color: '#b0b8ff', head: [224, 30] },
      draw(ctx, t) {
        const c = flag('morbusCharging');
        blit(ctx, morbusSprite(blink(13), talking('morbus'), c, Math.floor(t * 8) % 2), 226, 118, 22, 78, 1, false, 24);
      },
      on: {
        look: () => say('Morbus Muffelgrau. Grauer Umhang, grauer Bart, graue Seele. Und ein Monokel.'),
        talk: async () => {
          if (flag('morbusCharging')) {
            await say('Können wir das nicht ausdiskutieren?');
            await sayAs('morbus', 'Nein. Und jetzt halt still. Gleich hab ich genug graue Energie...');
            return;
          }
          await sayAs('morbus', 'Was willst du?');
        },
        use: async (item) => {
          if (item === 'spiegel') return mirrorFinale();
          if (item === 'feder') { await say('Kille kille?'); return sayAs('morbus', 'Ich bin nicht kitzlig. Ich bin nicht mal lustig. Niemals.'); }
          if (item === 'trank') return say('Den hab ich doch schon Grimbart gegeben.');
          await sayAs('morbus', 'Was soll das denn werden? Halt still, ich verzaubere dich gerade!');
        },
        give: async (item) => {
          if (item === 'spiegel') return mirrorFinale();
          return sayAs('morbus', 'Geschenke? Ich nehme nur graue Geschenke.');
        },
        take: () => say('Den fass ich nicht an. Der ist bestimmt auch grau innen drin.'),
      },
    },
    {
      id: 'morbusgnome', name: 'Muffelgrau (Gartenzwerg)', the: 'Muffelgrau', rect: [214, 84, 24, 36], walk: [196, 122], face: 'right', z: 118,
      hidden: () => !flag('morbusDefeated'),
      npc: { color: '#b0b8ff', head: [227, 82] },
      draw(ctx) { blit(ctx, gnomeSprite(blink(4), talking('morbusgnome'), true), 226, 118, 12, 34, 1, false, 16); },
      on: {
        look: () => say('Morbus Muffelgrau. Jetzt im praktischen Gartenzwerg-Format.'),
        talk: async () => { await sayAs('morbusgnome', 'Grmpf. Lass mich in Ruhe. Ich bewundere gerade mein Spiegelbild im Fußboden.'); },
        take: () => say('Den nehm ich nicht mit. Der verdirbt mir nur die Laune.'),
        use: async (item) => { if (item === 'spiegel') return sayAs('morbusgnome', 'Oh... selbst als Gartenzwerg bin ich ATEMBERAUBEND.'); return false; },
      },
    },
    {
      id: 'grimbart3', name: 'Grimbart', the: 'Grimbart', rect: [104, 52, 28, 70], walk: [140, 122], face: 'left', z: 122,
      hidden: () => !flag('grimbartHere'),
      npc: { color: '#ffe060', head: [118, 52] },
      draw(ctx) { blit(ctx, wizardSprite(blink(5), talking('grimbart3'), flag('portalCasting')), 118, 122, 18, 68, 1, false, 24); },
      on: { look: () => say('Grimbart. Plötzlich ist er da. Wie praktisch.'), talk: () => sayAs('grimbart3', 'Bereit für die Heimreise?') },
    },
  ],
};

async function mirrorFinale() {
  if (E.roomId !== 'tower') return say('Hier gibt es niemanden, dem ich den Spiegel vorhalten müsste.');
  await walkTo(172, 122); face('right');
  await say('He, Muffelgrau! Schau mal hier!');
  setFlag('mirrorUp');
  Audio8.sfx('blip');
  await sayAs('morbus', 'Was soll das? ...Oh!');
  await sayAs('morbus', 'Wer ist dieser umwerfende, distinguierte, unfassbar GRAUE Herr?');
  await say('Das bist du.');
  await sayAs('morbus', 'Ich?! Ich bin... WUNDERSCHÖN! Diese Wangenknochen! Dieses Monokel! Dieses GRAU!');
  await sayAs('morbus', 'Moment. Mein Zauber ist fertig. Er...');
  Audio8.sfx('zap');
  tower.beam = E.t + 1.2;
  await wait(500);
  await flash('#ffffff', 400);
  await sayAs('morbus', '...PRALLT AB?!');
  Audio8.sfx('magic');
  E.shake = 1.2;
  for (let i = 0; i < 8; i++) { burst(226, 80, 12, ['#a0a0b0', '#ffffff', '#606070']); await wait(100); }
  await flash('#ffffff', 600);
  setFlag('morbusDefeated'); setFlag('morbusCharging', false); setFlag('mirrorUp', false);
  Audio8.sfx('poof');
  burst(226, 100, 40, ['#a0a0b0', '#ffffff']);
  await wait(700);
  await sayAs('morbusgnome', 'NEEEIN! Ich bin ein Gartenzwerg! Ein GRAUER Gartenzwerg!');
  await wait(300);
  await sayAs('morbusgnome', '...Na ja. Wenigstens ist er grau.');
  await wait(400);
  Audio8.sfx('fanfare');
  setFlag('colorRestored');
  await flash('#ffffff', 900);
  Audio8.music('ending');
  await say('Hey! Die Farben kommen zurück!');
  await say('Und da drüben ist der Portalstein!');
}

async function finale() {
  setFlag('stoneTaken');
  Audio8.sfx('pickup');
  await say('Hab ich dich!');
  await wait(300);
  Audio8.sfx('poof');
  burst(118, 90, 50, null, 60);
  setFlag('grimbartHere');
  await wait(400);
  face('left');
  await sayAs('grimbart3', 'Gut gemacht, mein Junge! Ich wusste, dass du es schaffst!');
  await say('Du warst die ganze Zeit hier?!');
  await sayAs('grimbart3', 'Äh... ich kam gerade zufällig vorbei. Teleportation, du verstehst.');
  await sayAs('grimbart3', 'Die verzauberten Leute werden bald wieder normal. Und Muffelgrau bekommt einen schönen Platz in Walpurgas Vorgarten.');
  await sayAs('morbusgnome', 'NEIN! Nicht neben die bunten Tulpen!');
  await say('Danke, Grimbart. Für alles. Ehrlich gesagt... war das hier gar nicht so langweilig.');
  await sayAs('grimbart3', 'Das Buch kennt jetzt deinen Namen, Zack. Wenn Fabulien dich braucht, ruft es dich.');
  await sayAs('grimbart3', 'Und jetzt: Hokus Pokus Heimatfokus!');
  setFlag('portalCasting');
  Audio8.sfx('magic');
  for (let i = 0; i < 10; i++) { burst(E.zack.x, E.zack.y - 22, 14); await wait(110); }
  E.shake = 1.5;
  await flash('#ffffff', 700);
  E.zack.visible = false;
  await fadeTo(1, 600);
  setFlag('ending');
  await card(['Ein Wirbel aus Licht, ein lautes PLOPP –', '', 'und...']);
  E.mode = 'game';
  E.zack.visible = true;
  await goRoom('attic', 160, 122, 'down');
}
