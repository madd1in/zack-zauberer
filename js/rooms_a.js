'use strict';
// ---------------------------------------------------------------------------
// Räume Teil 1: Dachboden, Lichtung, Dorfplatz, Taverne
// ---------------------------------------------------------------------------
const ROOMS = {};

// kleine Mal-Helfer für Kulissen
function planks(p, x, y, w, h, cols, pw, seam) {
  for (let i = 0; x + i * pw < x + w; i++) {
    p.rect(x + i * pw, y, Math.min(pw, w - i * pw), h, cols[i % cols.length]);
    p.rect(x + i * pw, y, 1, h, seam);
  }
}
function cloud(p, cx, cy, s, seed) {
  p.blob(cx, cy + 2, 24 * s, 6 * s, '#d4e2f4', seed + 1, 6);
  p.blob(cx, cy, 22 * s, 7 * s, '#f6faff', seed, 7);
}
function floorPlanks(p, y0, y1, seed, a, b, seam) {
  const r = rng(seed);
  let y = y0, h = 3;
  let k = 0;
  while (y < y1) {
    const hh = Math.min(Math.round(h), y1 - y);
    p.rect(0, y, W, hh, k % 2 ? a : b);
    p.rect(0, y, W, 1, seam);
    let x = Math.floor(r() * 60);
    while (x < W) { p.rect(x, y, 1, hh, seam); x += 40 + Math.floor(r() * 50) + hh * 4; }
    y += hh; h *= 1.28; k++;
  }
}

// ======================================================================
// DACHBODEN
// ======================================================================
const attic = { horseRock: 0 };
function horseSprite() {
  return cached('horse', () => {
    const p = spr(60, 44, 30, 42, (R, P, pp, ox, oy) => {
      const w = '#ece6da', wS = '#c4baa8', d = '#8a8478', red = '#c43030', wood = '#6a3c1c', woodL = '#8a5a30';
      // Kufe
      for (let x = -26; x <= 26; x++) {
        const y = Math.round(-3 + (x * x) / 140);
        pp.rect(ox + x, oy + y, 1, 3, wood); pp.set(ox + x, oy + y, woodL);
      }
      // Beine
      R(-15, -14, 3, 12, wood); R(-9, -14, 3, 12, wood); R(8, -14, 3, 12, wood); R(13, -14, 3, 12, wood);
      // Körper
      pp.ellipse(ox, oy - 19, 17, 7, w);
      pp.ellipse(ox + 2, oy - 17, 15, 4, wS);
      [[-8, -21], [-3, -18], [4, -22], [9, -18], [-12, -17]].forEach(q => { P(q[0], q[1], d); P(q[0] + 1, q[1], d); });
      // Hals & Kopf
      pp.poly([[ox + 10, oy - 22], [ox + 16, oy - 36], [ox + 22, oy - 34], [ox + 17, oy - 20]], w);
      pp.ellipse(ox + 22, oy - 34, 6, 4, w);
      R(26, -33, 2, 2, wS); P(20, -36, '#202020'); P(16, -40, wS); P(18, -40, wS);
      R(12, -38, 3, 14, '#4a2c18'); R(11, -36, 2, 10, '#4a2c18');
      // Sattel + Zügel
      R(-4, -27, 9, 4, red); R(-4, -27, 9, 1, '#e05050'); R(0, -23, 2, 6, '#902020');
      P(21, -33, '#c0a030'); pp.line(ox + 21, oy - 33, ox + 8, oy - 26, '#902020');
      // Schweif
      R(-20, -22, 4, 2, '#4a2c18'); R(-22, -20, 3, 7, '#4a2c18');
    });
    p.outline(OUT);
    return p.canvas();
  });
}
function chestSprite(open) {
  return cached('chest|' + open, () => {
    const p = spr(52, 46, 26, 44, (R, P, pp) => {
      const w = '#7a4622', wL = '#9a6034', wS = '#5a3018', ir = '#5c5c68', irL = '#8a8a98', g = '#e0b030';
      if (open) {
        R(-22, -40, 44, 16, wS); R(-22, -40, 44, 2, wL); R(-20, -38, 40, 12, '#3a1e0c');
        R(-22, -40, 3, 16, ir); R(19, -40, 3, 16, ir);
        R(-20, -24, 40, 4, '#1c0e06');
      } else {
        R(-22, -32, 44, 8, w); R(-22, -32, 44, 2, wL); R(-21, -33, 42, 1, wL);
        R(-22, -32, 3, 8, ir); R(19, -32, 3, 8, ir);
      }
      R(-22, -24, 44, 24, w); R(-22, -24, 44, 1, wL); R(-22, -3, 44, 3, wS);
      for (let i = -18; i < 20; i += 8) R(i, -24, 1, 21, wS);
      R(-22, -24, 3, 24, ir); R(19, -24, 3, 24, ir); R(-22, -24, 1, 24, irL);
      R(-22, -14, 44, 2, ir);
      if (!open) { R(-3, -28, 6, 7, g); P(0, -26, '#2a1a00'); P(0, -25, '#2a1a00'); }
    });
    p.outline(OUT);
    return p.canvas();
  });
}

ROOMS.attic = {
  name: 'Dachboden', music: 'attic',
  walk: [[8, 104], [312, 104], [318, 135], [2, 135]],
  scale: [104, 0.9, 134, 1],
  paint(p) {
    planks(p, 0, 0, W, 96, ['#6c4a30', '#64442c', '#694830'], 9, '#4a3020');
    p.noise(0, 0, W, 96, '#563a26', 0.06, 11);
    p.noise(0, 0, W, 96, '#7a5838', 0.03, 12);
    // Foto
    p.rect(196, 40, 22, 26, '#b89040'); p.rect(198, 42, 18, 22, '#a88a68'); p.rect(198, 42, 18, 22, '#b89c78');
    p.circle(207, 49, 3, '#5a4632'); p.rect(204, 53, 7, 9, '#5a4632'); p.line(211, 54, 214, 49, '#3a2a1a'); p.set(214, 48, '#fff4c0');
    p.rect(196, 40, 22, 1, '#e0c070');
    // Fenster
    p.circle(160, 36, 18, '#2a180c'); p.circle(160, 36, 16, '#5a3a22'); p.circle(160, 36, 14, '#7a5232');
    p.circle(160, 36, 12, (x, y) => (BAYER4[y & 3][x & 3] < (y - 24) * 0.7 ? C('#5a6c88') : C('#34405a')));
    p.rect(159, 24, 2, 25, '#5a3a22'); p.rect(148, 35, 25, 2, '#5a3a22');
    // Schneiderpuppe
    p.rect(103, 66, 2, 28, '#2a1a10'); p.rect(96, 92, 16, 2, '#2a1a10');
    p.ellipse(104, 56, 8, 11, '#d8c8b0'); p.ellipse(106, 58, 5, 8, '#c4b498'); p.rect(102, 42, 4, 4, '#d8c8b0');
    p.line(97, 50, 108, 66, '#e8c840'); p.line(98, 50, 109, 66, '#c8a830');
    // Kisten
    p.rect(278, 62, 38, 32, '#a87c4a'); p.rect(278, 62, 38, 2, '#c89a64'); p.rect(308, 62, 8, 32, '#8a6036');
    p.rect(293, 62, 6, 12, '#d8c8a0'); p.rect(284, 74, 14, 5, '#c03030'); p.rect(285, 75, 12, 3, '#e05050');
    p.rect(284, 46, 26, 16, '#b88a54'); p.rect(284, 46, 26, 2, '#d8aa74'); p.rect(304, 46, 6, 16, '#9a6c3e');
    p.rect(250, 78, 24, 16, '#9a7040'); p.rect(250, 78, 24, 2, '#b88a54'); p.rect(268, 78, 6, 16, '#7a5430');
    // Dachschrägen
    p.poly([[0, 0], [112, 0], [0, 72]], '#3a2414');
    p.poly([[208, 0], [320, 0], [320, 72]], '#3a2414');
    for (let k = 0; k < 3; k++) {
      p.thick(0, 20 + k * 18, 80 - k * 26, -30 + k * 10, 2, '#4a2e1a');
      p.thick(320, 20 + k * 18, 240 + k * 26, -30 + k * 10, 2, '#4a2e1a');
    }
    p.thick(0, 72, 112, 0, 4, '#5a3a22'); p.line(0, 70, 110, -1, '#7a5232');
    p.thick(320, 72, 208, 0, 4, '#5a3a22'); p.line(320, 70, 210, -1, '#7a5232');
    // Kehlbalken
    p.rect(0, 8, W, 7, '#5a3a22'); p.rect(0, 8, W, 1, '#8a6040'); p.rect(0, 14, W, 1, '#24160c');
    // Spinnennetz
    for (let a = 0; a < 6; a++) { const t = 0.2 + a * 0.24; p.line(96, 15, 96 - Math.cos(t) * 22, 15 + Math.sin(t) * 22, '#b8b0a8'); }
    for (const r of [7, 13, 19]) for (let a = 0; a < 70; a++) { const t = 0.2 + a / 70 * 1.2; p.set(Math.round(96 - Math.cos(t) * r), Math.round(15 + Math.sin(t) * r), '#9a928a'); }
    // Abschlussleiste & Boden
    p.rect(0, 92, W, 3, '#3a2414');
    floorPlanks(p, 95, SCENE_H, 9, '#7a5234', '#70492e', '#4a2e1a');
    p.noise(0, 95, W, 41, '#8a6040', 0.04, 13);
    // Luke
    p.poly([[138, 115], [184, 115], [189, 127], [133, 127]], '#4a2e1a');
    p.poly([[140, 116], [182, 116], [186, 126], [136, 126]], '#5e3c22');
    p.ring(161, 121, 2, '#9a9aa8');
    // Schatten oben, Lichtkegel vom Fenster
    p.tint(0, 0, W, 60, '#120804', (x, y) => Math.max(0, (60 - y) / 60) * 0.55);
    p.polyTint([[150, 48], [171, 48], [222, 134], [112, 134]], '#f0d8a0', 0.14);
    p.tint(120, 114, 94, 22, '#f0d8a0', (x, y) => { const d = ((x - 167) / 44) ** 2 + ((y - 126) / 9) ** 2; return d < 1 ? 0.18 * (1 - d) : 0; });
    p.tint(0, 60, 60, 76, '#120804', (x) => Math.max(0, (60 - x) / 60) * 0.5);
    p.tint(260, 60, 60, 76, '#120804', (x) => Math.max(0, (x - 260) / 60) * 0.5);
  },
  back(ctx, t) {
    // Regen am Fenster
    for (let i = 0; i < 9; i++) {
      const x = 150 + ((i * 7 + Math.floor(t * 30) * 3) % 21);
      const y = 26 + ((i * 11 + Math.floor(t * 120)) % 20);
      if ((x - 160) ** 2 + (y - 36) ** 2 < 120) fr(ctx, x, y, 1, 2, '#8aa0c0');
    }
    // Staub im Licht
    for (let i = 0; i < 12; i++) {
      const x = 140 + ((i * 37 + t * 3 * (1 + i % 3)) % 60);
      const y = 60 + ((i * 23 + t * 2) % 60) + Math.sin(t + i) * 3;
      if (i % 2 === Math.floor(t * 2 + i) % 2) fr(ctx, x, y, 1, 1, '#e8d8b0');
    }
  },
  objects: [
    {
      id: 'luke', name: 'Bodenluke', rect: [134, 114, 56, 14], walk: [160, 128], face: 'down',
      on: {
        look: () => say('Die Bodenluke. Da unten wartet Oma mit Kreuzworträtseln und Hagebuttentee.'),
        open: () => say('Und dann? Kreuzworträtsel? Nee. Hier oben ist es wenigstens langweilig UND staubig.'),
        walk: () => say('Ich bleib noch ein bisschen hier oben.'),
        use: () => say('Ich bleib noch ein bisschen hier oben.'),
      },
    },
    {
      id: 'fenster', name: 'Fenster', rect: [143, 19, 34, 34], walk: [160, 106], face: 'up',
      on: {
        look: () => say('Es regnet. Seit drei Tagen. Ich glaube, da oben hat jemand den Wasserhahn vergessen.'),
        open: () => say('Dann regnet es rein und Oma zieht mir die Ohren lang.'),
        close: () => say('Ist schon zu. Leider auch für das schöne Wetter.'),
      },
    },
    {
      id: 'foto', name: 'altes Foto', rect: [195, 39, 24, 28], walk: [207, 106], face: 'up',
      on: {
        look: async () => { await say('Ein altes Foto von Oma als junges Mädchen.'); await say('Sie hält... einen Zauberstab? Nee. Bestimmt ein Kochlöffel.'); },
        take: () => say('Das bleibt hier. Oma hängt an dem Ding. Und es hängt an der Wand.'),
      },
    },
    {
      id: 'puppe', name: 'Schneiderpuppe', rect: [94, 42, 22, 52], walk: [110, 108], face: 'left',
      on: {
        look: () => say('Eine Schneiderpuppe. Sie hat mehr Stil als ich.'),
        talk: async () => { await say('Na, auch so gelangweilt?'); await wait(600); await say('Sie schweigt. Kluge Puppe.'); },
        take: () => say('Ich habe keinen Platz für eine Puppe. Und keinen Grund.'),
        move: () => say('Die steht da gut. Sie hat einen Ausblick aufs Fenster.'),
      },
    },
    {
      id: 'netz', name: 'Spinnennetz', rect: [72, 12, 28, 26], walk: [92, 106], face: 'up',
      on: {
        look: () => say('Ein Spinnennetz. Mit Spinne. Die heißt bestimmt Thekla.'),
        talk: async () => { await say('Hallo, Thekla.'); await wait(500); await say('Sie ignoriert mich. Wie alle in diesem Haus.'); },
        take: () => say('Igitt. Nein.'),
        use: () => say('Ich will Thekla nicht ärgern. Die hat acht Beine. Ich nur zwei.'),
      },
    },
    {
      id: 'kisten', name: 'Kisten', rect: [250, 46, 68, 48], walk: [278, 108], face: 'up',
      on: {
        look: () => say('Kisten voller Weihnachtsdeko. Im Oktober. Typisch Oma.'),
        open: async () => { await say('Lametta. Noch mehr Lametta. Ein Nussknacker mit fiesem Blick.'); await say('Ich mach die lieber wieder zu.'); },
        move: () => say('Die sind schwer wie Blei. Was ist da drin? Ein Rentier?'),
        take: () => say('Ich schleppe doch keine Weihnachtsdeko mit mir rum.'),
      },
    },
    {
      id: 'pferd', name: 'Schaukelpferd', rect: [24, 72, 58, 44], walk: [92, 118], face: 'left', z: 114,
      draw(ctx, t) {
        const img = horseSprite();
        softShadow(ctx, 52, 114, 36);
        const a = t < attic.horseRock ? Math.sin((attic.horseRock - t) * 9) * 0.14 * Math.min(1, attic.horseRock - t) : 0;
        ctx.save(); ctx.translate(52, 112); ctx.rotate(a);
        ctx.drawImage(img, -30, -42);
        ctx.restore();
      },
      on: {
        look: () => say('Mein altes Schaukelpferd "Blitz". Früher war er schneller.'),
        talk: () => say('Na, Blitz? Lange nicht gesehen. Du hast zugenommen.'),
        take: () => say('Viel zu sperrig. Und zu viele Erinnerungen.'),
        use: async () => { await say('Ich bin dreizehn. Für so was bin ich echt zu alt.'); await say('...Vielleicht später. Wenn keiner guckt.'); },
        move: async () => {
          attic.horseRock = E.t + 1.6;
          Audio8.sfx('creak');
          await wait(900);
          if (!flag('keyOut')) {
            setFlag('keyOut');
            Audio8.sfx('coin');
            await wait(400);
            await say('Klonk! Da ist was unter dem Schaukelpferd rausgerutscht.');
          } else await say('Hüa, Blitz! ...Okay. Das war peinlich.');
        },
      },
    },
    {
      id: 'schluessel', name: 'Schlüssel', rect: [68, 104, 22, 16], walk: [98, 122], face: 'left', z: 118,
      hidden: () => !flag('keyOut') || flag('keyTaken'),
      draw(ctx) { ctx.drawImage(iconCanvas('schluessel'), 72, 108, 14, 10); },
      on: {
        look: () => say('Ein kleiner Schlüssel. Der muss da schon ewig drunter gelegen haben.'),
        take: async () => { setFlag('keyTaken'); addItem('schluessel'); await say('Ein Schlüssel! Jetzt brauch ich nur noch ein Schloss.'); },
      },
    },
    {
      id: 'truhe', name: 'Truhe', rect: [228, 76, 50, 40], walk: [226, 120], face: 'right', z: 115,
      draw(ctx) { ctx.drawImage(chestSprite(flag('chestOpen')), 226, 71); },
      on: {
        look: () => say(flag('chestOpen') ? 'Die Truhe ist offen.' + (flag('bookTaken') ? ' Und leer.' : ' Da drin liegt ein dickes Buch.') : 'Eine alte Holztruhe mit einem Schloss. Abgeschlossen. Natürlich.'),
        open: async () => {
          if (flag('chestOpen')) return say('Die ist doch schon offen.');
          if (!flag('chestUnlocked')) return say('Abgeschlossen. Natürlich. Ist es ja immer.');
          setFlag('chestOpen'); Audio8.sfx('creak');
        },
        close: async () => { if (!flag('chestOpen')) return say('Die ist schon zu.'); setFlag('chestOpen', false); Audio8.sfx('thud'); },
        use: async (item) => {
          if (item === 'schluessel') {
            removeItem('schluessel'); setFlag('chestUnlocked'); setFlag('chestOpen');
            Audio8.sfx('creak');
            await say('Klick! Der Schlüssel passt. Und auf geht\'s!');
            return;
          }
          if (!item) return say(flag('chestUnlocked') ? 'Einfach öffnen reicht.' : 'Die ist abgeschlossen. Ich bräuchte einen Schlüssel.');
          return false;
        },
        move: () => say('Viel zu schwer. Was ist da drin, Goldbarren?'),
        take: () => say('Die ganze Truhe? Ich bin doch kein Möbelpacker.'),
      },
    },
    {
      id: 'buch', name: 'Buch', rect: [236, 76, 30, 14], walk: [226, 120], face: 'right', z: 116,
      hidden: () => !flag('chestOpen') || flag('bookTaken'),
      draw(ctx) { ctx.drawImage(iconCanvas('buch'), 238, 76, 22, 14); },
      on: {
        look: () => say('Ein dickes, altes Buch mit Goldschrift.'),
        take: async () => {
          setFlag('bookTaken'); addItem('buch');
          await say('"Das Große Buch der Kleinen Zauber". Klingt nach Hausaufgaben.');
          await say('Mal sehen, was drinsteht...');
        },
        open: () => say('Ich sollte es erst mal rausnehmen.'),
      },
    },
  ],
};

async function portalCutscene() {
  await say('Mal sehen... "Hokus Pokus Fabulus – bring mich hin, wo ich hin muss!"');
  await say('Was für ein Quatsch.');
  Audio8.sfx('magic');
  for (let i = 0; i < 6; i++) { burst(E.zack.x, E.zack.y - 22, 10); await wait(140); }
  E.shake = 2;
  await say('Äh... warum leuchtet das Buch?!', 1600);
  Audio8.sfx('magic');
  burst(E.zack.x, E.zack.y - 22, 60, null, 80);
  await flash('#ffffff', 700);
  await say('WAAAAAAAH!', 1200);
  E.zack.visible = false;
  await fadeTo(1, 500);
  setFlag('inFabulien');
  Audio8.music(null);
  await card(['Ein Wirbel aus Licht und Farben verschluckt Zack.', '', 'Er fällt...', 'und fällt...', '...und fällt.']);
  E.mode = 'game';
  await goRoom('clearing', 124, 120, 'down');
}

// ======================================================================
// LICHTUNG
// ======================================================================
function stickDraw(ctx) {
  for (let i = 0; i < 22; i++) fr(ctx, 100 + i, 126 - Math.round(i * 0.25), 1, 2, i % 5 === 0 ? '#5a3818' : '#8a5a2c');
  fr(ctx, 112, 121, 1, 2, '#8a5a2c'); fr(ctx, 113, 120, 1, 1, '#8a5a2c');
}

ROOMS.clearing = {
  name: 'Lichtung', music: 'forest',
  walk: [[0, 100], [150, 100], [158, 92], [176, 92], [184, 100], [320, 100], [320, 135], [0, 135]],
  scale: [92, 0.72, 134, 1],
  paint(p) {
    p.vgrad(0, 0, W, 86, ['#4878d0', '#6898e0', '#98c4f0', '#cce4f8']);
    cloud(p, 70, 18, 1, 11); cloud(p, 200, 10, 0.8, 21); cloud(p, 286, 30, 0.7, 31);
    p.poly([[0, 62], [30, 50], [60, 58], [95, 44], [130, 56], [170, 46], [210, 58], [250, 42], [290, 54], [320, 48], [320, 86], [0, 86]], '#8aaccc');
    p.poly([[0, 62], [30, 50], [40, 53], [12, 64]], '#a8c4dc'); p.poly([[95, 44], [108, 50], [100, 56], [90, 50]], '#a8c4dc'); p.poly([[250, 42], [262, 48], [256, 54], [244, 48]], '#a8c4dc');
    p.poly([[0, 74], [50, 66], [100, 72], [150, 64], [200, 70], [260, 62], [320, 68], [320, 92], [0, 92]], '#5c9864');
    for (let i = 0; i < 18; i++) {
      const x = i * 19 + 6, y = 82 - (i % 3) * 3;
      if (x > 146 && x < 182) continue;
      p.blob(x, y, 14, 10, '#2c6234', 100 + i, 6); p.blob(x - 2, y - 3, 10, 6, '#3c7a40', 200 + i, 5);
    }
    p.vgrad(0, 86, W, 50, ['#4a9a3e', '#56a846', '#62b44e']);
    p.noise(0, 86, W, 50, '#3c8a34', 0.09, 5); p.noise(0, 86, W, 50, '#78c45c', 0.05, 6);
    const path = '#c8a46a';
    p.poly([[152, 82], [174, 82], [190, 104], [226, 136], [114, 136], [138, 104]], path);
    p.poly([[0, 108], [60, 104], [142, 106], [138, 120], [60, 124], [0, 128]], path);
    p.poly([[320, 106], [260, 103], [188, 105], [194, 120], [260, 122], [320, 125]], path);
    const pathMask = (x, y) => { const c = p.get(x, y); return c[0] === 200 && c[1] === 164 && c[2] === 106; };
    const r = rng(77);
    for (let i = 0; i < 2600; i++) {
      const x = Math.floor(r() * W), y = 82 + Math.floor(r() * 54);
      if (pathMask(x, y)) p.set(x, y, r() < 0.6 ? '#a8844a' : '#dcc08a');
    }
    // Blumen
    for (let i = 0; i < 70; i++) {
      const x = Math.floor(r() * W), y = 90 + Math.floor(r() * 46);
      if (!pathMask(x, y)) { p.set(x, y, pick2(r, ['#f0e040', '#f04848', '#ffffff', '#c070f0'])); p.set(x, y + 1, '#2c7a2c'); }
    }
    // Eiche links
    p.poly([[10, 112], [20, 44], [16, 0], [46, 0], [40, 44], [50, 112]], '#6a4428');
    p.poly([[30, 112], [38, 44], [42, 0], [46, 0], [40, 44], [50, 112]], '#4e301a');
    p.poly([[2, 116], [14, 104], [48, 104], [60, 116]], '#5a3820');
    for (let y = 10; y < 110; y += 6) p.line(18 + (y % 12) / 3, y, 20 + (y % 12) / 3, y + 4, '#4a2c18');
    p.line(22, 20, 22, 100, '#8a5c38');
    p.thick(40, 46, 94, 40, 4, '#6a4428'); p.line(40, 48, 92, 43, '#4a2c18');
    p.blob(40, 12, 62, 18, '#2c6a2c', 31, 12); p.blob(36, 8, 52, 14, '#3c8a3c', 32, 10); p.blob(30, 4, 40, 9, '#58a848', 33, 8);
    // Nest
    p.ellipse(87, 37, 10, 4, '#7a5a30'); p.ellipse(87, 35, 8, 2, '#3a2410');
    for (let i = 0; i < 10; i++) p.line(78 + i * 2, 36 + (i % 3), 80 + i * 2, 39 - (i % 2), '#5a3a18');
    // Baum rechts
    p.rect(290, 20, 16, 94, '#5a3a22'); p.rect(300, 20, 6, 94, '#3e2614'); p.poly([[284, 116], [290, 106], [306, 106], [314, 116]], '#4a2e18');
    p.blob(304, 18, 36, 26, '#2c6a2c', 41, 10); p.blob(300, 12, 28, 18, '#3c8a3c', 42, 8); p.blob(296, 6, 20, 10, '#58a848', 43, 6);
    // Baumstumpf
    p.rect(228, 100, 30, 10, '#6a4428'); p.rect(250, 100, 8, 10, '#4e301a'); p.ellipse(243, 110, 15, 3, '#5a3820');
    p.ellipse(243, 100, 15, 4, '#c8a070'); p.ellipse(243, 100, 10, 2, '#b08858'); p.ellipse(243, 100, 4, 1, '#c8a070');
    // Wegweiser
    p.rect(197, 60, 3, 48, '#7a5030'); p.rect(199, 60, 1, 48, '#5a3818');
    p.poly([[184, 62], [212, 62], [217, 65], [212, 68], [184, 68]], '#c89a60'); p.rect(188, 64, 18, 1, '#6a4428');
    p.poly([[182, 72], [210, 72], [210, 78], [182, 78], [177, 75]], '#b88a50'); p.rect(186, 74, 20, 1, '#6a4428');
    p.rect(189, 82, 18, 6, '#c89a60'); p.poly([[189, 82], [207, 82], [198, 78]], '#c89a60'); p.rect(192, 84, 12, 1, '#6a4428');
    // Büsche vorne
    p.blob(8, 134, 26, 10, '#2c7a34', 51, 7); p.blob(6, 130, 18, 6, '#3c9a44', 52, 5);
    p.blob(316, 134, 22, 10, '#2c7a34', 53, 7); p.blob(318, 130, 14, 6, '#3c9a44', 54, 5);
  },
  back(ctx, t) {
    // Funkeln im Nest
    if (!flag('coinTaken') && Math.floor(t * 3) % 3 === 0) { fr(ctx, 90, 34, 1, 1, '#ffffff'); fr(ctx, 89, 35, 3, 1, '#ffe060'); }
    // Schmetterling
    const bx = 130 + Math.sin(t * 0.7) * 50, by = 70 + Math.sin(t * 1.3) * 10;
    const wf = Math.floor(t * 10) % 2;
    fr(ctx, bx, by, 1, 1, '#302010'); fr(ctx, bx - 1 - wf, by - 1, 1 + wf, 1, '#f080c0'); fr(ctx, bx + 1, by - 1, 1 + wf, 1, '#f080c0');
    // Vogel zieht über die Lichtung
    const ph = (t * 0.05) % 1;
    const vx = -6 + ph * 330, vy = 12 + Math.sin(ph * 5) * 3;
    const vdy = Math.floor(t * 7) % 2 ? 1 : 0;
    fr(ctx, vx, vy, 1, 1, '#243050'); fr(ctx, vx - 1, vy - vdy, 1, 1, '#243050'); fr(ctx, vx + 1, vy - vdy, 1, 1, '#243050');
  },
  before() {
    if (!flag('landed')) E.zack.visible = false;
  },
  async enter() {
    if (flag('landed')) return;
    setFlag('landed');
    E.zack.visible = true;
    const tx = E.zack.x, ty = E.zack.y;
    E.zack.y = -10;
    E.zack.dir = 'down';
    for (let i = 0; i <= 20; i++) { E.zack.y = -10 + (ty + 10) * (i / 20) ** 2; await wait(22); }
    E.zack.y = ty; E.zack.x = tx;
    Audio8.sfx('thud'); E.shake = 0.4;
    burst(tx, ty - 4, 16, ['#c8a46a', '#8a6a3a', '#ffffff'], 30);
    await wait(500);
    await say('Autsch.');
    await say('Wo... bin ich? Das ist definitiv nicht Omas Dachboden.');
    await sayAs('grimbart', 'Na endlich! Hat ja ewig gedauert!');
    face('right');
    await say('Wer hat das gesagt?');
    await sayAs('grimbart', 'Hier drüben! Auf dem Baumstumpf!');
    await say('Ein sprechender Gartenzwerg. Klar. Warum nicht. Ich hab bestimmt eine Gehirnerschütterung.');
    await sayAs('grimbart', 'Gartenzwerg?! Ich bin Grimbart Funkelbart, der größte Zauberer von Fabulien!');
    await sayAs('grimbart', '...Momentan zugegeben eher der kleinste.');
    setFlag('metGrimbart');
    await sayAs('grimbart', 'Komm her, Junge. Wir müssen reden.');
  },
  objects: [
    {
      id: 'eiche', name: 'Eiche', rect: [6, 0, 48, 110], walk: [56, 112], face: 'left',
      on: {
        look: () => say('Eine riesige alte Eiche. Älter als Oma. Und das will was heißen.'),
        use: () => say('Klettern? Ich? Im Sportunterricht hänge ich am Seil wie ein nasser Sack.'),
        take: () => say('Klar. Ich steck sie mir einfach in die Hosentasche.'),
        move: () => say('Hnnngh! ...Nein.'),
      },
    },
    {
      id: 'nest', name: 'Elsternnest', rect: [74, 28, 26, 14], walk: [88, 112], face: 'up',
      on: {
        look: () => say(flag('coinTaken') ? 'Ein leeres Elsternnest. Die Elster schmollt.' : 'Ein Elsternnest. Da drin glitzert etwas!'),
        take: () => say('Viel zu hoch. Da komme ich nicht ran.'),
        use: async (item) => {
          if (item === 'stock') {
            if (flag('coinTaken')) return say('Da ist nichts mehr drin. Außer einer beleidigten Elster.');
            await say('Mit dem Stock komme ich vielleicht ran... *stocher, stocher*');
            Audio8.sfx('cluck');
            await sayAs('elster', 'KRÄÄÄK!');
            Audio8.sfx('coin');
            burst(88, 40, 10, ['#ffe060', '#ffffff']);
            await wait(400);
            setFlag('coinTaken'); addItem('taler');
            await say('Ein Goldtaler ist rausgefallen! Direkt in meine Hand. Glück gehabt.');
            await sayAs('elster', 'Kräk! Dieb! Kräääk!');
            await say('Sagt die Elster.');
            return;
          }
          return false;
        },
      },
    },
    {
      id: 'elster', name: 'Elster', rect: [78, 22, 18, 10], walk: [88, 112], face: 'up',
      npc: { color: '#e0e0ff', head: [86, 22] },
      draw(ctx, t) { blit(ctx, magpieSprite(Math.floor(t * 2) % 2), 90, 32, 6, 10, 1, true); },
      z: 0,
      on: {
        look: () => say('Eine Elster. Elstern klauen alles, was glitzert. Wie meine kleine Schwester.'),
        talk: async () => { await sayAs('elster', 'Kräk!'); await say('Ich spreche leider kein Elsterisch.'); },
        take: () => say('Die ist viel zu hoch. Und zu flink.'),
        use: async (item) => { if (item === 'stock') return ROOMS.clearing.objects.find(o => o.id === 'nest').on.use('stock'); return false; },
      },
    },
    {
      id: 'wegweiser', name: 'Wegweiser', rect: [178, 58, 40, 50], walk: [198, 112], face: 'up',
      on: {
        look: async () => {
          await say('Da steht: "Kleinkrakelingen →".');
          await say('"← Stinkesumpf. Betreten auf eigene Gefahr. Wirklich."');
          await say('"↑ Hexe Walpurga. Klopfen zwecklos, sie hört schlecht."');
        },
        take: () => say('Dann verirren sich alle. Inklusive mir.'),
        move: () => say('Ich könnte die Schilder umdrehen. Aber ich bin ein Held, kein Witzbold.'),
      },
    },
    {
      id: 'exitN', name: 'Pfad nach Norden', rect: [146, 72, 32, 22], walk: [166, 94], face: 'up',
      exit: { to: 'witch', x: 54, y: 122, dir: 'right' },
      on: { look: () => say('Ein Pfad in den Wald. Zur Hexe, laut Wegweiser.') },
    },
    {
      id: 'exitW', name: 'Weg zum Sumpf', rect: [0, 96, 12, 40], walk: [2, 116], face: 'left',
      exit: { to: 'swamp', x: 304, y: 120, dir: 'left' },
      on: { look: () => say('Da geht es zum Stinkesumpf. Man riecht ihn schon von hier.') },
    },
    {
      id: 'exitO', name: 'Weg ins Dorf', rect: [308, 96, 12, 40], walk: [318, 116], face: 'right',
      exit: { to: 'village', x: 14, y: 124, dir: 'right' },
      on: { look: () => say('Der Weg ins Dorf Kleinkrakelingen.') },
    },
    {
      id: 'stock', name: 'Stock', rect: [98, 116, 28, 12], walk: [96, 126], face: 'right', z: 120,
      hidden: () => flag('stickTaken'),
      draw: stickDraw,
      on: {
        look: () => say('Ein langer Stock. Jedes Abenteuer braucht einen langen Stock.'),
        take: async () => { setFlag('stickTaken'); addItem('stock'); await say('Wer weiß, wofür der noch gut ist.'); },
      },
    },
    {
      id: 'grimbart', rect: [232, 66, 24, 36], walk: [222, 120], face: 'right', z: 100,
      get name() { return flag('metGrimbart') ? 'Grimbart (Gartenzwerg)' : 'Gartenzwerg'; },
      the: 'Grimbart',
      hidden: () => flag('grimbartFree'),
      npc: { color: '#ffe060', head: [246, 66] },
      draw(ctx) { blit(ctx, gnomeSprite(blink(3), talking('grimbart'), false), 243, 100, 12, 34, 1, false, 16); },
      on: {
        look: () => say('Ein Gartenzwerg mit rotem Hut und dem grimmigsten Gesicht, das ich je an einem Gartenzwerg gesehen habe.'),
        take: async () => { await sayAs('grimbart', 'Wag es ja nicht! Ich bin kein Souvenir!'); },
        move: async () => { await sayAs('grimbart', 'Finger weg! Ich steh hier ganz gut!'); },
        talk: () => talkGnome(),
        use: async (item) => { if (item === 'trank') return restoreGrimbart(); if (item === 'feder') return sayAs('grimbart', 'Hör auf mit dem Gekitzel! Ich bin Zauberer, kein Spielzeug!'); return false; },
        give: async (item) => {
          if (item === 'trank') return restoreGrimbart();
          if (item === 'buch') return sayAs('grimbart', 'Behalt das Buch, Junge. Ich kann es momentan nicht mal hochheben.');
          return sayAs('grimbart', 'Was soll ich als Gartenzwerg denn damit?');
        },
      },
    },
    {
      id: 'grimbart2', name: 'Grimbart', the: 'Grimbart', rect: [230, 52, 28, 70], walk: [214, 122], face: 'right', z: 122,
      hidden: () => !flag('grimbartFree'),
      npc: { color: '#ffe060', head: [246, 52] },
      draw(ctx) { blit(ctx, wizardSprite(blink(5), talking('grimbart2'), false), 246, 122, 18, 68, 1, false, 24); },
      on: {
        look: () => say('Grimbart Funkelbart in voller Größe. Mit Bart bis zum Bauchnabel.'),
        talk: () => talkWizard(),
        take: () => sayAs('grimbart2', 'Hihi. Versuch\'s gar nicht erst.'),
        give: async (item) => {
          if (item === 'spiegel') return sayAs('grimbart2', 'Den Spiegel brauchst du für Muffelgrau, nicht für mich. Ich weiß, wie toll ich aussehe.');
          return sayAs('grimbart2', 'Behalt das lieber, Junge.');
        },
      },
    },
  ],
};
function pick2(r, arr) { return arr[Math.floor(r() * arr.length)]; }

async function talkGnome() {
  await sayAs('grimbart', pick(['Was gibt\'s, Junge?', 'Ja? Ich hör zu. Ich kann ja eh nicht weg.']));
  await converse(() => [
    { text: 'Ich hab den Trank!', cond: () => has('trank'), run: async () => { await restoreGrimbart(); return 'end'; } },
    { text: 'Wer bist du nochmal?', run: async () => {
      await sayAs('grimbart', 'Grimbart Funkelbart! Großmeister der Magie, Träger des Goldenen Zauberstabs...');
      await sayAs('grimbart', '...und dreimaliger Gewinner des Fabulischen Bart-Wettbewerbs!');
    } },
    { text: 'Warum bist du ein Gartenzwerg?', run: async () => {
      await sayAs('grimbart', 'Morbus Muffelgrau! Dieser Schuft hat mich verzaubert und meinen Portalstein gestohlen.');
      await sayAs('grimbart', 'Er will ganz Fabulien grau machen. GRAU! Kannst du dir das vorstellen?');
      await say('Klingt wie mein Mathelehrer.');
      setFlag('knowsMorbus');
    } },
    { text: 'Wie komme ich wieder nach Hause?', run: async () => {
      await sayAs('grimbart', 'Ich habe dich mit meinem Buch hergerufen. Eigentlich war der Zauber für einen Helden gedacht.');
      await sayAs('grimbart', 'Groß, stark, muskulös...');
      await say('Danke auch.');
      await sayAs('grimbart', '...aber gut. Um dich zurückzuschicken, muss ich erst wieder ich selbst sein.');
      await sayAs('grimbart', 'Die Hexe Walpurga kann einen Rückverwandlungstrank brauen. Sie wohnt den Pfad nach Norden hoch.');
      setFlag('knowsWitch');
    } },
    { text: 'Was weißt du über Hexe Walpurga?', cond: () => flag('knowsWitch') && !flag('potionDone'), run: async () => {
      await sayAs('grimbart', 'Sie ist... speziell. Wir hatten mal was. Vor 200 Jahren. Lange Geschichte.');
      await sayAs('grimbart', 'Sie braut gute Tränke, aber sie will immer seltsame Zutaten.');
    } },
    { text: 'Wie wird man eigentlich Zauberer?', run: async () => {
      await sayAs('grimbart', 'Mit Fleiß, Disziplin und einem anständigen Hut. Vor allem dem Hut.');
    } },
    { text: 'Ich mach mich auf den Weg.', end: true, run: () => sayAs('grimbart', 'Beeil dich! Mir schläft schon das Keramikbein ein.') },
  ]);
}

async function restoreGrimbart() {
  removeItem('trank');
  await say('Okay, Grimbart. Mund auf!');
  await sayAs('grimbart', 'Wie soll ich als Gartenzwerg den Mund... *gluck gluck gluck*');
  Audio8.sfx('magic');
  for (let i = 0; i < 8; i++) { burst(243, 84, 10, ['#ff60c0', '#ffe060', '#ffffff', '#80e0ff']); await wait(110); }
  E.shake = 1;
  await flash('#ffffff', 600);
  setFlag('grimbartFree');
  Audio8.sfx('poof');
  burst(246, 90, 50, null, 60);
  await wait(500);
  await sayAs('grimbart2', 'Ha! HAHA! Ich bin wieder ich! Meine Knie! Ich spüre meine Knie wieder!');
  await sayAs('grimbart2', 'Danke, Junge. Du hast das Zeug zum Zauberer.');
  await sayAs('grimbart2', 'Hier – mein alter Lehrlingshut. Der gehört jetzt dir.');
  Audio8.sfx('poof');
  burst(E.zack.x, E.zack.y - 44, 30, ['#4060ff', '#ffe060', '#ffffff']);
  E.zack.hat = true;
  await wait(400);
  await say('Ein echter Zauberhut! ...Sieht der cool aus?');
  await sayAs('grimbart2', 'Sehr cool. Äußerst. Wie sagt ihr jungen Leute... "krass"?');
  await say('Bitte sag nie wieder "krass".');
  await sayAs('grimbart2', 'Nun zum Ernst. Um dich nach Hause zu schicken, brauche ich meinen Portalstein.');
  await sayAs('grimbart2', 'Muffelgrau hat ihn in seinem Turm. Hinter dem Stinkesumpf, über die Trollbrücke.');
  await sayAs('grimbart2', 'Und merk dir eins: Muffelgrau ist der eitelste Zauberer aller Zeiten. Er kann an keinem Spiegel vorbei!');
  setFlag('knowsVain');
  Audio8.sfx('fanfare');
}

async function talkWizard() {
  await sayAs('grimbart2', 'Ja, mein junger Lehrling?');
  await converse(() => [
    { text: 'Wie komme ich jetzt nach Hause?', run: async () => {
      await sayAs('grimbart2', 'Mit meinem Portalstein. Den hat Muffelgrau. Hol ihn dir aus seinem Turm hinter dem Stinkesumpf.');
    } },
    { text: 'Wie besiege ich Muffelgrau?', run: async () => {
      await sayAs('grimbart2', 'Muffelgrau ist so eitel, dass er sogar seinem Spiegelbild Liebesbriefe schreibt.');
      await sayAs('grimbart2', 'Wenn du ihm einen Spiegel vorhältst, vergisst er alles um sich herum. Sogar seinen eigenen Zauber.');
      if (!has('spiegel')) await sayAs('grimbart2', 'Walpurga hat einen Spiegel. Frag sie doch mal. Nett. Sie ist empfindlich.');
    } },
    { text: 'Warum kämpfst du nicht selbst gegen ihn?', run: async () => {
      await sayAs('grimbart2', 'Ich? Äh. Meine Magie muss sich erst erholen. Und meine Knie. Vor allem die Knie.');
      await say('Feigling.');
      await sayAs('grimbart2', 'Wie bitte?');
      await say('Ich sagte: ...schöner Bart.');
    } },
    { text: 'Danke für den Hut!', run: () => sayAs('grimbart2', 'Steht dir prächtig. Viel besser als mir damals.') },
    { text: 'Bis später.', end: true },
  ]);
}

// ======================================================================
// DORFPLATZ
// ======================================================================
const chick = { x: 112, y: 126, dir: 1, t: 0, peck: false, run: 0, fed: 0 };

ROOMS.village = {
  name: 'Dorfplatz', music: 'village',
  walk: [[0, 108], [320, 108], [320, 135], [0, 135]],
  scale: [100, 0.86, 134, 1],
  paint(p) {
    p.vgrad(0, 0, W, 50, ['#6898d8', '#90bce8', '#b8d8f0']);
    cloud(p, 160, 12, 0.7, 61);
    // Hintergrund: Kirche & Häuschen
    p.rect(140, 22, 18, 64, '#b8a890'); p.rect(152, 22, 6, 64, '#9a8a74');
    p.poly([[136, 22], [162, 22], [149, -6]], '#5a6a7a'); p.rect(146, 30, 6, 8, '#3a3a48'); p.circle(149, 44, 3, '#e8e0c8');
    p.rect(104, 52, 36, 34, '#d8ccb0'); p.poly([[100, 52], [144, 52], [122, 36]], '#a05038'); p.rect(114, 62, 8, 8, '#6a7a9a');
    p.rect(160, 56, 36, 30, '#e0d4b8'); p.poly([[156, 56], [200, 56], [178, 40]], '#8a4430'); p.rect(172, 64, 8, 8, '#6a7a9a');
    // Linkes Fachwerkhaus
    p.rect(0, 16, 98, 80, '#e8dcc0');
    p.poly([[0, 18], [98, 18], [74, -4], [0, -4]], '#a84a30');
    for (let y = 0; y < 18; y += 3) p.rect(0, y, 90, 1, '#8a3820');
    p.rect(0, 16, 98, 3, '#5a3420'); p.rect(0, 44, 98, 2, '#5a3420');
    for (const x of [0, 30, 62, 94]) p.rect(x, 16, 4, 80, '#5a3420');
    p.line(4, 19, 30, 44, '#5a3420'); p.line(5, 19, 31, 44, '#5a3420'); p.line(62, 19, 34, 44, '#5a3420'); p.line(63, 19, 35, 44, '#5a3420');
    p.rect(40, 22, 16, 16, '#3a4a6a'); p.rect(40, 22, 16, 16, '#4a6a9a'); p.rect(47, 22, 2, 16, '#5a3420'); p.rect(40, 29, 16, 2, '#5a3420');
    p.rect(38, 38, 20, 4, '#7a4a28'); [41, 45, 49, 53].forEach(x => { p.set(x, 37, '#e04040'); p.set(x + 1, 36, '#f0e040'); });
    // Marktstand
    p.rect(16, 40, 3, 62, '#6a4428'); p.rect(88, 40, 3, 62, '#6a4428');
    for (let i = 0; i < 9; i++) p.poly([[12 + i * 9, 38], [21 + i * 9, 38], [21 + i * 9, 48], [12 + i * 9, 48]], i % 2 ? '#f4f0e8' : '#c83030');
    for (let i = 0; i < 9; i++) p.ellipse(16 + i * 9, 48, 4, 2, i % 2 ? '#f4f0e8' : '#c83030');
    p.rect(12, 36, 82, 3, '#8a2020');
    p.tint(10, 51, 84, 34, '#201008', (x, y) => Math.max(0, 0.45 - (y - 51) * 0.012));
    p.rect(10, 84, 84, 18, '#8a5a30'); p.rect(10, 84, 84, 2, '#b07a44'); p.rect(10, 100, 84, 2, '#5a3818');
    for (let x = 14; x < 92; x += 12) p.rect(x, 86, 1, 14, '#6a4220');
    // Waren
    for (let i = 0; i < 5; i++) p.circle(16 + i * 5, 81, 2, i % 2 ? '#d02828' : '#e83838');
    p.circle(70, 80, 4, '#58a040'); p.circle(78, 81, 3, '#68b048'); p.rect(84, 76, 4, 7, '#a0c0d0'); p.rect(84, 76, 4, 1, '#e0e0e0');
    // Taverne
    p.rect(196, 0, 124, 98, '#cdb48c');
    p.noise(196, 0, 124, 98, '#b89c74', 0.08, 71);
    for (const x of [196, 230, 270, 316]) p.rect(x, 0, 4, 98, '#4a2c18');
    p.rect(196, 0, 124, 3, '#4a2c18'); p.rect(196, 30, 124, 3, '#4a2c18');
    p.line(200, 3, 230, 30, '#4a2c18'); p.line(201, 3, 231, 30, '#4a2c18'); p.line(316, 3, 286, 30, '#4a2c18'); p.line(315, 3, 285, 30, '#4a2c18');
    p.rect(204, 44, 20, 18, '#e8b860'); p.rect(204, 44, 20, 18, (x, y) => (BAYER4[y & 3][x & 3] < 6 ? C('#f8d888') : C('#e0a848')));
    p.rect(213, 44, 2, 18, '#4a2c18'); p.rect(204, 52, 20, 2, '#4a2c18'); p.rect(202, 62, 24, 3, '#6a4428');
    p.rect(286, 44, 20, 18, (x, y) => (BAYER4[y & 3][x & 3] < 6 ? C('#f8d888') : C('#e0a848'))); p.rect(295, 44, 2, 18, '#4a2c18'); p.rect(284, 62, 24, 3, '#6a4428');
    // Tür
    p.rect(238, 58, 30, 40, '#3a2010');
    p.ellipse(253, 58, 15, 7, '#3a2010');
    p.rect(240, 58, 26, 40, '#5a3418'); p.ellipse(253, 58, 13, 6, '#5a3418');
    for (let x = 244; x < 266; x += 6) p.rect(x, 54, 1, 44, '#4a2810');
    p.rect(240, 66, 26, 2, '#4a4a54'); p.rect(240, 86, 26, 2, '#4a4a54'); p.circle(261, 78, 1, '#e0c040');
    p.rect(234, 96, 38, 2, '#6a6a70');
    // Wirtshausschild
    p.rect(232, 34, 2, 4, '#3a3a40'); p.rect(206, 34, 28, 2, '#3a3a40');
    p.rect(208, 38, 24, 18, '#6a4428'); p.rect(209, 39, 22, 16, '#d8c088');
    p.ellipse(216, 48, 5, 3, '#2c8a3a'); p.rect(212, 42, 4, 5, '#2c8a3a'); p.set(213, 43, '#f0e040'); p.poly([[210, 50], [214, 44], [219, 48]], '#3ca04a');
    p.rect(222, 44, 6, 8, '#e0a030'); p.rect(222, 44, 6, 2, '#ffffff'); p.rect(228, 46, 2, 4, '#e0a030');
    // Kopfsteinpflaster
    p.rect(0, 96, W, 40, '#7a7468');
    const r = rng(91);
    let y = 96, h = 3;
    while (y < SCENE_H) {
      const off = Math.floor(r() * 8);
      for (let x = -off; x < W; x += Math.round(h * 2.2)) {
        p.ellipse(x + Math.round(h), y + Math.round(h / 2), Math.max(1, Math.round(h * 0.95)), Math.max(1, Math.round(h / 2 - 0.5)), r() < 0.5 ? '#9a948a' : '#8c8678');
        p.set(x + Math.round(h * 0.6), y + 1, '#b0aaa0');
      }
      y += Math.round(h); h *= 1.12;
    }
    p.tint(0, 96, W, 8, '#2a2620', (x, y) => (104 - y) / 8 * 0.45);
    // Brunnen
    p.rect(140, 54, 3, 34, '#5a3820'); p.rect(177, 54, 3, 34, '#5a3820');
    p.poly([[132, 58], [188, 58], [160, 40]], '#9a3a28'); p.poly([[160, 40], [188, 58], [174, 58]], '#7a2a1c');
    for (let i = 0; i < 4; i++) p.line(140 + i * 3, 56 - i * 4, 180 - i * 3, 56 - i * 4, '#7a2a1c');
    p.rect(142, 64, 36, 2, '#6a4428'); p.rect(180, 62, 2, 6, '#6a4428'); p.rect(182, 66, 6, 2, '#6a4428');
    p.rect(159, 66, 1, 14, '#c8b080'); p.rect(158, 80, 3, 2, '#5a5a64');
    p.ellipse(160, 88, 22, 6, '#8a8a92'); p.rect(138, 88, 45, 16, '#8a8a92'); p.ellipse(160, 104, 22, 5, '#6a6a72');
    p.rect(138, 88, 45, 16, (x, y) => ((y - 88) % 5 === 0 || (x + Math.floor((y - 88) / 5) * 4) % 9 === 0 ? C('#6a6a72') : C('#9a9aa2')));
    p.ellipse(160, 88, 22, 6, '#a8a8b0'); p.ellipse(160, 88, 18, 4, '#202830');
    p.rect(150, 106, 22, 1, '#5a5448');
  },
  back(ctx, t) {
    // Rauch aus dem Kirchendorf-Schornstein
    for (let i = 0; i < 5; i++) {
      const k = (t * 0.6 + i * 0.2) % 1;
      fr(ctx, 186 + Math.sin(t + i) * 2 + k * 6, 40 - k * 30, 2, 2, k > 0.6 ? '#c8d0dc' : '#a8b0bc');
    }
    // Vögel am Himmel
    for (let i = 0; i < 2; i++) {
      const ph = (t * 0.045 + i * 0.5) % 1;
      const bx = -8 + ph * 336, by = 10 + i * 9 + Math.sin(ph * 7 + i) * 2;
      if (by > 40) continue;
      const dy = Math.floor(t * 6 + i) % 2 ? 1 : 0;
      fr(ctx, bx, by, 1, 1, '#2a3448'); fr(ctx, bx - 1, by - dy, 1, 1, '#2a3448'); fr(ctx, bx + 1, by - dy, 1, 1, '#2a3448');
    }
    // Glitzern im Brunnenwasser
    if (Math.floor(t * 2) % 5 === 0) fr(ctx, 154 + Math.floor(t * 3) % 12, 87, 1, 1, '#a8d8f0');
  },
  update(dt, t) {
    if (chick.fed > 0) { chick.peck = Math.floor(t * 4) % 2 === 0; return; }
    chick.t -= dt;
    if (chick.run > 0) {
      chick.run -= dt; chick.x += chick.dir * 70 * dt;
      if (chick.x < 100 || chick.x > 190) chick.dir *= -1;
      chick.peck = false;
      return;
    }
    if (chick.t <= 0) { chick.t = 1 + Math.random() * 2.5; chick.peck = Math.random() < 0.5; if (!chick.peck && Math.random() < 0.6) chick.dir = Math.random() < 0.5 ? -1 : 1; }
    if (!chick.peck) { chick.x += chick.dir * 10 * dt; if (chick.x < 100) chick.dir = 1; if (chick.x > 136) chick.dir = -1; }
  },
  objects: [
    {
      id: 'kirche', name: 'Kirchturm', rect: [136, 0, 26, 40], walk: [150, 110], face: 'up',
      on: { look: () => say('Ein Kirchturm. Die Glocke ist grau angelaufen. Komisch. Alles hier wird irgendwie grauer.') },
    },
    {
      id: 'haus', name: 'Fachwerkhaus', rect: [0, 0, 98, 44], walk: [50, 110], face: 'up',
      on: {
        look: () => say('Ein schiefes Fachwerkhaus. Ich glaube, es lehnt sich am Marktstand an.'),
        open: () => say('Die Tür ist hinter dem Marktstand. Und ich will keinen Hausfriedensbruch begehen.'),
      },
    },
    {
      id: 'stand', name: 'Marktstand', rect: [10, 36, 84, 16], walk: [52, 110], face: 'up',
      on: {
        look: () => say('"Feilschers Allerlei". Hier gibt\'s alles. Außer Handyladekabeln, vermutlich.'),
        take: () => sayAs('kraemerin', 'Den Stand lässt du schön stehen, Schätzchen!'),
      },
    },
    {
      id: 'waren', name: 'Waren', rect: [10, 74, 84, 26], walk: [52, 110], face: 'up',
      on: {
        look: () => say('Äpfel, Kohlköpfe, Wollsocken und eine glänzende Schere. Ein Sortiment wie im Baumarkt.'),
        take: () => sayAs('kraemerin', 'Finger weg, Schätzchen! Erst bezahlen, dann anfassen!'),
      },
    },
    {
      id: 'kraemerin', name: 'Frau Feilscher', the: 'Frau Feilscher', rect: [38, 52, 30, 32], walk: [52, 110], face: 'up', z: 84,
      npc: { color: '#ff98c0', head: [53, 52] },
      draw(ctx) { blit(ctx, shopkeeperSprite(blink(7), talking('kraemerin')), 53, 84, 15, 32); },
      on: {
        look: () => say('Die Krämerin. Sie sieht aus, als könnte sie einem Stein noch was verkaufen.'),
        talk: () => talkShop(),
        give: async (item) => { if (item === 'taler') return buyScissors(); return sayAs('kraemerin', 'Das kann ich nicht verkaufen, Schätzchen. Nicht mal ich.'); },
        take: () => say('Entführung ist keine Lösung.'),
      },
    },
    {
      id: 'brunnen', name: 'Wunschbrunnen', rect: [134, 40, 56, 66], walk: [160, 112], face: 'up', z: 105,
      on: {
        look: () => say('Ein Wunschbrunnen. Auf dem Schild steht: "Wünsche ohne Gewähr."'),
        use: async (item) => {
          if (item === 'eimer') {
            removeItem('eimer');
            Audio8.sfx('creak');
            await say('Ich hänge den Eimer an den Haken und kurble...');
            Audio8.sfx('splash');
            await wait(600);
            addItem('wasser'); setFlag('gotWater');
            await say('Quietsch, platsch – ein Eimer voll Wunschwasser!');
            return;
          }
          if (item === 'taler') return say('Ich könnte mir was wünschen... aber den Taler brauche ich noch.');
          if (item === 'flasche') return say('Die Flasche hebe ich für was anderes auf. Ich brauche etwas Größeres zum Schöpfen.');
          if (!item) return say(has('wasser') ? 'Ich hab schon genug Wasser.' : flag('gotWater') ? 'Wasser hab ich schon geholt. Der Eimer ist eh weg.' : 'Da hängt kein Eimer dran. Den hat bestimmt jemand geklaut.');
          return false;
        },
        talk: async () => { await say('Hallooo!'); await wait(300); await sayAs('narrator', '...allooo... llooo... ooo...'); await say('Das Echo ist der beste Gesprächspartner hier.'); },
        take: () => say('Den ganzen Brunnen? Sicher nicht.'),
        open: () => say('Ein Brunnen ist schon ziemlich offen.'),
      },
    },
    {
      id: 'schild', name: 'Wirtshausschild', rect: [206, 34, 28, 22], walk: [220, 110], face: 'up',
      on: { look: () => say('"Zum Durstigen Drachen". Auf dem Schild ist ein Drache, der aus einem Bierkrug trinkt.') },
    },
    {
      id: 'tavtuer', name: 'Tavernentür', rect: [238, 50, 30, 48], walk: [253, 110], face: 'up',
      exit: { to: 'tavern', x: 292, y: 120, dir: 'left' },
      on: {
        look: () => say('Die Tür zur Taverne. Drinnen grölt jemand.'),
        open: async () => { Audio8.sfx('door'); await goRoom('tavern', 292, 120, 'left'); },
      },
    },
    {
      id: 'exitW', name: 'Weg zur Lichtung', rect: [0, 100, 10, 36], walk: [2, 122], face: 'left',
      exit: { to: 'clearing', x: 302, y: 118, dir: 'left' },
      on: { look: () => say('Zurück zur Lichtung.') },
    },
    {
      id: 'huhn', name: 'Huhn', the: 'das Huhn', z: 125,
      get rect() { return [chick.x - 8, chick.y - 15, 16, 16]; },
      walk: () => [chick.x - 16, chick.y + 2], face: 'right',
      npc: { color: '#ffffff', head: [0, 0] },
      draw(ctx, t) {
        const f = chick.run > 0 ? Math.floor(t * 12) % 2 : chick.peck ? Math.floor(t * 5) % 2 : 0;
        blit(ctx, chickenSprite(f, 1), chick.x, chick.y, 9, 14, 1, chick.dir < 0, 9);
        if (chick.fed > 0) { fr(ctx, chick.x + chick.dir * 8 - 2, chick.y - 1, 5, 2, '#c8843c'); }
      },
      on: {
        look: () => say(flag('gotFeather') ? 'Berta. Sie pickt zufrieden an ihrem Brot.' : 'Ein Huhn. Auf dem Halsband steht "Berta". Sie guckt, als hätte sie ein Geheimnis.'),
        talk: async () => { Audio8.sfx('cluck'); await speak('huhn', 'Bock? Bock-bock?'); await say('Ich verstehe dich nicht, aber ich respektiere dich.'); },
        take: async () => {
          if (flag('gotFeather')) return say('Lass sie in Ruhe frühstücken.');
          Audio8.sfx('cluck'); chick.run = 1.4; chick.dir = chick.x < 140 ? 1 : -1;
          await speak('huhn', 'BOCK-BOCK-BAAAACK!');
          await say('Sie ist schneller, als sie aussieht.');
        },
        use: async (item) => {
          if (item === 'brot') return feedChicken();
          if (item === 'schere') return say('Ich schneide doch kein Huhn! Ich bin doch kein Monster.');
          if (item === 'feder') return say('Die Feder gehört jetzt mir, Berta.');
          return false;
        },
        give: async (item) => { if (item === 'brot') return feedChicken(); return say('Hühner mögen eher was zu essen.'); },
      },
    },
  ],
};
// Kopfposition des Huhns dynamisch
Object.defineProperty(ROOMS.village.objects.find(o => o.id === 'huhn').npc, 'head', { get: () => [chick.x, chick.y - 16] });

async function feedChicken() {
  if (flag('gotFeather')) return say('Berta hat schon ihr Brot.');
  removeItem('brot');
  await say('Hier, Berta. Ein schönes, steinhartes Brot.');
  chick.fed = 1; chick.run = 0;
  Audio8.sfx('cluck');
  await speak('huhn', 'Bock! *pick pick pick*');
  await say('Während Berta beschäftigt ist...');
  Audio8.sfx('snip');
  await wait(300);
  setFlag('gotFeather'); addItem('feder');
  await say('*zupf* Eine Feder! Tut mir leid, Berta.');
  await speak('huhn', '*pick pick* ...bock.');
}

async function buyScissors() {
  if (flag('gotScissors')) return sayAs('kraemerin', 'Du hast doch schon die Schere, Schätzchen.');
  removeItem('taler');
  Audio8.sfx('coin');
  await sayAs('kraemerin', 'Ein echter Goldtaler! Schätzchen, du bist mein Lieblingskunde!');
  addItem('schere'); setFlag('gotScissors');
  await sayAs('kraemerin', 'Hier ist die Schere. Nicht damit rennen!');
  await say('Das sagt meine Mutter auch immer.');
}

async function talkShop() {
  if (!flag('metShop')) {
    setFlag('metShop');
    await sayAs('kraemerin', 'Hereinspaziert, hereinspaziert! Feilschers Allerlei – wir haben alles!');
    await sayAs('kraemerin', 'Na, Schätzchen, was darf\'s sein? Du siehst aus, als bräuchtest du... ein Paar Wollsocken.');
  } else await sayAs('kraemerin', 'Na, Schätzchen? Doch die Wollsocken?');
  await converse(() => [
    { text: 'Was verkaufen Sie denn so?', run: async () => {
      await sayAs('kraemerin', 'Alles, was das Herz begehrt! Äpfel, Kohl, Socken...');
      if (!flag('gotScissors')) await sayAs('kraemerin', '...und diese prächtige Schere hier. Schärfer als die Zunge meiner Schwiegermutter. Nur ein Goldtaler!');
      setFlag('knowsScissors');
    } },
    { text: 'Ich hätte gern die Schere.', cond: () => flag('knowsScissors') && !flag('gotScissors'), run: async () => {
      if (has('taler')) return buyScissors();
      await sayAs('kraemerin', 'Ohne Taler keine Schere, Schätzchen. Ich bin doch nicht die Wohlfahrt.');
      await say('Ich hab nur ein Handy mit 3 % Akku.');
      await sayAs('kraemerin', 'Ein was?');
    } },
    { text: 'Kennen Sie einen Zauberer namens Grimbart?', cond: () => flag('metGrimbart'), run: async () => {
      await sayAs('kraemerin', 'Grimbart? Der ist seit Wochen verschwunden. Seitdem wird alles so... grau.');
      await sayAs('kraemerin', 'Sogar mein Kohl. Wer kauft denn grauen Kohl?');
    } },
    { text: 'Was wissen Sie über Morbus Muffelgrau?', cond: () => flag('knowsMorbus'), run: async () => {
      await sayAs('kraemerin', 'Pssst! Nicht so laut! Der wohnt im Turm hinter dem Stinkesumpf.');
      await sayAs('kraemerin', 'Er mag keine Farben. Und keine Kinder. Und Kinder mit Farben schon gar nicht.');
    } },
    { text: 'Kann ich feilschen?', cond: () => flag('knowsScissors') && !flag('gotScissors'), run: async () => {
      await sayAs('kraemerin', 'Feilschen? Bei Frau FEILSCHER? Schätzchen, der Name ist Programm. Der Preis bleibt.');
    } },
    { text: 'Tschüss!', end: true, run: () => sayAs('kraemerin', 'Beehren Sie uns bald wieder!') },
  ]);
}

// ======================================================================
// TAVERNE
// ======================================================================
ROOMS.tavern = {
  name: 'Taverne', music: 'tavern',
  walk: [[2, 116], [318, 106], [318, 135], [2, 135]],
  scale: [100, 0.88, 134, 1],
  paint(p) {
    planks(p, 0, 0, W, 94, ['#5a3a24', '#54361f', '#5e3e26'], 10, '#3a2414');
    p.noise(0, 0, W, 94, '#6a4830', 0.05, 81);
    for (let x = 0; x < W; x += 64) { p.rect(x, 0, 10, 10, '#2a1a10'); p.rect(x, 9, 10, 1, '#1a0e06'); }
    p.rect(0, 0, W, 4, '#2a1a10');
    // Regale hinter der Theke
    for (const y of [24, 44]) {
      p.rect(4, y, 108, 3, '#7a4a28'); p.rect(4, y + 3, 108, 1, '#2a1a10');
      for (let i = 0; i < 14; i++) {
        const x = 8 + i * 7 + (y === 44 ? 3 : 0);
        const c = ['#2a7a3a', '#8a2a2a', '#c8a030', '#3a4a9a', '#6a3a7a'][(i + y) % 5];
        p.rect(x, y - 9, 4, 9, c); p.rect(x + 1, y - 12, 2, 3, c); p.set(x + 1, y - 7, '#ffffff');
      }
    }
    // Kamin
    p.rect(156, 32, 62, 62, '#6e6a66');
    for (let y = 32; y < 94; y += 6) for (let x = 156 + ((y / 6) % 2) * 6; x < 218; x += 12) { p.rect(x, y, 11, 5, '#7e7a74'); p.rect(x, y + 5, 12, 1, '#4e4a46'); }
    p.rect(150, 30, 74, 6, '#5a3a22'); p.rect(150, 30, 74, 1, '#8a5a34');
    p.rect(170, 56, 34, 38, '#140c08'); p.ellipse(187, 56, 17, 6, '#140c08');
    p.rect(172, 88, 30, 4, '#4a2c18'); p.rect(176, 86, 22, 3, '#5a3820');
    // Drachenkopf über dem Kamin
    p.ellipse(186, 20, 10, 6, '#3c8a3c'); p.ellipse(196, 22, 7, 4, '#3c8a3c'); p.rect(200, 22, 6, 3, '#2c6a2c');
    p.set(188, 18, '#f0e020'); p.set(189, 18, '#101010'); p.poly([[180, 16], [176, 8], [184, 14]], '#e0d8c0'); p.poly([[186, 14], [186, 6], [190, 13]], '#e0d8c0');
    p.rect(200, 25, 1, 2, '#ffffff'); p.rect(203, 25, 1, 2, '#ffffff');
    p.rect(176, 26, 16, 3, '#6a4428');
    // Dartscheibe
    p.circle(238, 40, 9, '#202020'); p.circle(238, 40, 7, '#e8d8b0'); p.circle(238, 40, 5, '#c03030'); p.circle(238, 40, 3, '#e8d8b0'); p.circle(238, 40, 1, '#c03030');
    p.rect(238, 30, 1, 10, '#9a9aa8'); p.poly([[234, 28], [244, 28], [242, 33], [236, 33]], '#a8a8b8'); p.rect(237, 22, 2, 7, '#6a4428');
    // Tür rechts
    p.rect(284, 36, 34, 60, '#2a1a10'); p.rect(287, 39, 28, 57, '#e8c880');
    p.rect(287, 39, 10, 57, '#5a3418'); p.rect(289, 41, 6, 53, '#6a4020');
    p.tint(287, 39, 28, 57, '#fff0c0', 0.25);
    // Fässer
    for (const [x, y] of [[124, 74], [138, 74], [131, 56]]) {
      p.ellipse(x + 6, y + 10, 8, 11, '#7a4a24'); p.rect(x - 2, y + 2, 16, 2, '#4a4a54'); p.rect(x - 2, y + 16, 16, 2, '#4a4a54');
      p.ellipse(x + 6, y + 10, 3, 4, '#9a6034');
    }
    // Boden
    floorPlanks(p, 94, SCENE_H, 31, '#6a4428', '#62402a', '#3a2414');
    p.noise(0, 94, W, 42, '#7a5434', 0.04, 82);
    // Theke
    p.rect(0, 66, 118, 6, '#9a6a40'); p.rect(0, 66, 118, 1, '#c89060'); p.rect(0, 71, 118, 1, '#4a2c18');
    p.rect(0, 72, 114, 40, '#7a4a28');
    for (let x = 4; x < 112; x += 18) { p.rect(x, 76, 14, 32, '#6a3e20'); p.rect(x, 76, 14, 1, '#4a2810'); p.rect(x, 76, 1, 32, '#4a2810'); }
    p.rect(0, 110, 114, 2, '#3a2010');
    p.rect(30, 62, 6, 4, '#b8b8c8'); p.rect(80, 63, 5, 3, '#e0a030');
    // Tisch rechts
    p.ellipse(250, 96, 36, 8, '#5a3820'); p.ellipse(250, 94, 36, 7, '#8a5a34'); p.ellipse(250, 93, 34, 5, '#9a6a40');
    p.rect(222, 100, 4, 14, '#5a3820'); p.rect(274, 100, 4, 14, '#5a3820'); p.rect(248, 101, 4, 13, '#4a2c18');
    p.rect(268, 84, 6, 9, '#b8b8c8'); p.rect(268, 84, 6, 2, '#ffffff'); p.rect(274, 86, 2, 5, '#b8b8c8');
    p.rect(226, 86, 6, 8, '#b8b8c8'); p.rect(226, 86, 6, 2, '#ffffff');
    p.ellipse(214, 90, 4, 2, '#b8b8c8');
    // Lampenlicht
    p.tint(0, 0, W, 136, '#080402', (x, y) => Math.min(0.55, Math.abs(x - 187) * 0.0028 + Math.abs(y - 70) * 0.002 + 0.04));
    p.tint(110, 60, 160, 76, '#ffb060', (x, y) => Math.max(0, 0.22 - Math.hypot(x - 187, (y - 90) * 1.8) * 0.0028));
  },
  back(ctx, t) {
    for (let i = 0; i < 14; i++) {
      const h = 6 + Math.abs(Math.sin(t * 9 + i * 1.7)) * 14;
      const x = 176 + i * 2;
      fr(ctx, x, 88 - h, 2, h, i % 3 ? '#f08020' : '#f0c040');
      if (i % 2) fr(ctx, x, 88 - h * 0.5, 2, 2, '#fff0a0');
    }
  },
  front(ctx, t) {
    // Flackerndes Kaminlicht über Wand und Boden (ein drawImage, gerasterte Glow-Leinwand)
    const a = 0.17 + Math.sin(t * 7) * 0.05 + Math.sin(t * 13 + 1) * 0.03;
    ctx.globalAlpha = Math.max(0.06, a);
    ctx.drawImage(glowCanvas('#ffb050', 32), 127, 44, 120, 88);
    ctx.globalAlpha = 1;
  },
  objects: [
    {
      id: 'regal', name: 'Flaschen', rect: [4, 10, 108, 38], walk: [60, 118], face: 'up',
      on: {
        look: () => say('Flaschen mit bunten Getränken. Das meiste davon ist vermutlich verboten in meinem Alter.'),
        take: () => sayAs('wirt', 'Finger weg vom Schnaps, Bürschchen!'),
      },
    },
    {
      id: 'theke', name: 'Theke', rect: [0, 66, 116, 46], walk: [60, 118], face: 'up',
      on: { look: () => say('Eine klebrige Theke. Ich will gar nicht wissen, was hier schon alles verschüttet wurde.') },
    },
    {
      id: 'drache', name: 'Drachenkopf', rect: [174, 6, 34, 22], walk: [187, 110], face: 'up',
      on: {
        look: () => say('Ein ausgestopfter Drachenkopf. Ich bin mir ziemlich sicher, dass er mir gerade zugezwinkert hat.'),
        talk: async () => { await say('Hallo?'); await wait(700); await say('Nichts. Puh.'); },
        take: () => sayAs('wirt', 'Der Drache bleibt da hängen! Den hat mein Urgroßvater erlegt. Mit einer Bratpfanne.'),
      },
    },
    {
      id: 'kamin', name: 'Kamin', rect: [150, 30, 74, 64], walk: [187, 110], face: 'up',
      on: {
        look: () => say('Ein gemütliches Kaminfeuer. Endlich mal was Warmes in diesem Abenteuer.'),
        use: (item) => item ? say('Das verbrenne ich lieber nicht. Könnte ich noch brauchen.') : say('Ich habe nichts zu grillen. Leider.'),
      },
    },
    {
      id: 'dart', name: 'Dartscheibe', rect: [228, 20, 20, 30], walk: [238, 108], face: 'up',
      on: {
        look: () => say('Eine Dartscheibe. Mitten im Bullseye steckt eine Axt. Zwerge spielen das wohl etwas anders.'),
        take: () => say('Die Axt? Die steckt bombenfest. Und gehört bestimmt dem Zwerg.'),
      },
    },
    {
      id: 'faesser', name: 'Fässer', rect: [120, 54, 34, 44], walk: [140, 110], face: 'up',
      on: {
        look: () => say('Fässer voller Zwergenbräu. Es riecht nach Kellerassel.'),
        open: () => sayAs('wirt', 'Hände weg von meinen Fässern!'),
        move: () => say('Voll. Und schwer. Wie der Zwerg.'),
      },
    },
    {
      id: 'tuer', name: 'Ausgang', rect: [284, 36, 34, 60], walk: [300, 112], face: 'right',
      exit: { to: 'village', x: 253, y: 112, dir: 'down' },
      on: {
        look: () => say('Die Tür zum Dorfplatz.'),
        open: async () => { Audio8.sfx('door'); await goRoom('village', 253, 112, 'down'); },
      },
    },
    {
      id: 'wirt', name: 'Wirt', the: 'der Wirt', rect: [36, 30, 34, 38], walk: [56, 118], face: 'up', z: 68,
      npc: { color: '#ffb060', head: [54, 32] },
      draw(ctx, t) { blit(ctx, innkeeperSprite(blink(2), talking('wirt'), Math.floor(t * 1.5) % 2 === 0 && E.talking !== 'wirt'), 54, 69, 18, 38); },
      on: {
        look: () => say('Der Wirt. Ein Schnurrbart mit einem Mann dran.'),
        talk: () => talkInnkeeper(),
        give: async (item) => {
          if (item === 'taler') return sayAs('wirt', 'Für einen Taler kriegst du bei mir... eine Milch. Behalt ihn lieber, Junge.');
          if (item === 'brot') return sayAs('wirt', 'Behalt das Brot. Ich hab\'s dir doch geschenkt. Weil es keiner will.');
          return false;
        },
      },
    },
    {
      id: 'zwerg', name: 'Zwerg', the: 'der Zwerg', rect: [222, 66, 44, 36], walk: [232, 116], face: 'right', z: 101,
      npc: { color: '#ff8050', head: [252, 70] },
      draw(ctx, t) {
        blit(ctx, dwarfSprite(Math.floor(t * 0.8) % 2, flag('gotHair'), false), 252, 101, 24, 34);
        const k = (t * 0.6) % 1;
        if (E.talking !== 'zwerg') {
          ctx.globalAlpha = 1 - k;
          const zx = 256 + k * 10, zy = 74 - k * 16;
          fr(ctx, zx, zy, 3, 1, '#ffffff'); fr(ctx, zx + 1, zy + 1, 1, 1, '#ffffff'); fr(ctx, zx, zy + 2, 3, 1, '#ffffff');
          ctx.globalAlpha = 1;
        }
      },
      on: {
        look: () => say(flag('gotHair') ? 'Gorm schnarcht immer noch. Sein Bart hat jetzt eine stylische kleine Lücke.' : 'Ein Zwerg, der so laut schnarcht, dass die Krüge wackeln. Sein Bart hängt bis auf den Boden.'),
        talk: async () => {
          await say('He! Aufwachen!');
          await sayAs('zwerg', 'Grmpf... noch fünf Minuten, Mama...');
          await sayAs('zwerg', 'Zzzzz...');
        },
        take: () => say('Den ganzen Zwerg? Der wiegt so viel wie ein Amboss. Wahrscheinlich IST er zur Hälfte Amboss.'),
        move: () => say('Ich wecke doch keinen schlafenden Zwerg. Das hat noch nie jemand überlebt. Glaube ich.'),
        use: async (item) => {
          if (item === 'schere') {
            if (flag('gotHair')) return say('Ein Haar reicht. Ich will ihn ja nicht kahl scheren.');
            await say('Ganz vorsichtig...');
            Audio8.sfx('snip');
            await wait(400);
            setFlag('gotHair'); addItem('barthaar');
            await sayAs('zwerg', 'Zzz... mein schöner Bart... zzz... Mama...');
            await say('Ein Zwergenbarthaar! Und er hat nichts gemerkt.');
            return;
          }
          if (item === 'feder') return say('Einen schlafenden Zwerg kitzeln? Ich hänge an meinem Leben.');
          if (item === 'wasser') return say('Ihn mit Wunschwasser wecken? Dann wünscht er sich, dass ich verschwinde. Und das funktioniert bestimmt.');
          return false;
        },
        give: () => say('Er schläft. Er nimmt gerade gar nichts an. Außer Schnarchgeräusche.'),
      },
    },
    {
      id: 'bart', name: 'Zwergenbart', rect: [214, 88, 20, 14], walk: [232, 116], face: 'right', z: 102,
      on: {
        look: () => say('Ein gewaltiger roter Bart. Darin könnte eine Familie Spatzen wohnen.'),
        take: () => say('Mit bloßen Händen ein Haar ausreißen? Dann wacht er auf und haut mich zu Mus. Ich brauch was Scharfes.'),
        use: (item) => ROOMS.tavern.objects.find(o => o.id === 'zwerg').on.use(item),
      },
    },
  ],
};

async function talkInnkeeper() {
  if (!flag('metWirt')) {
    setFlag('metWirt');
    await sayAs('wirt', 'Willkommen im Durstigen Drachen! Ich bin Bruno. Was darf\'s sein, Kleiner? Milch?');
  } else await sayAs('wirt', 'Na, Kleiner? Jetzt doch \'ne Milch?');
  await converse(() => [
    { text: 'Was gibt es hier zu trinken?', run: async () => {
      await sayAs('wirt', 'Zwergenbräu, Drachenpunsch und Milch. Für dich: Milch.');
      await say('Ich nehme... nichts. Danke.');
    } },
    { text: 'Haben Sie was zu essen?', run: async () => {
      if (flag('gotBread')) return sayAs('wirt', 'Mehr hab ich nicht. Der Zwerg frisst mir alles weg.');
      await sayAs('wirt', 'Ich hab noch ein Brot von letzter Woche. Ach was, von letztem Monat.');
      await sayAs('wirt', 'Kannst du haben. Gratis. Aus gutem Grund.');
      setFlag('gotBread'); addItem('brot');
    } },
    { text: 'Wer ist der schnarchende Zwerg?', run: async () => {
      await sayAs('wirt', 'Das ist Gorm Grollbart. Hat gestern zwölf Krüge Zwergenbräu getrunken.');
      await sayAs('wirt', 'Der schläft bis nächste Woche. Mindestens. Und wehe, einer weckt ihn.');
    } },
    { text: 'Wissen Sie was über Morbus Muffelgrau?', cond: () => flag('knowsMorbus'), run: async () => {
      await sayAs('wirt', 'Der graue Kerl? Er war mal hier und hat mein Bier grau gezaubert.');
      await sayAs('wirt', 'Schmeckt jetzt wie Pfützenwasser. Die Zwerge trinken\'s trotzdem.');
    } },
    { text: 'Kennen Sie die Hexe Walpurga?', cond: () => flag('knowsWitch'), run: async () => {
      await sayAs('wirt', 'Walpurga? Die kauft hier immer Froschlaich. Den guten, aus dem Stinkesumpf.');
      await sayAs('wirt', 'Und sie flirtet mit dem Drachenkopf. Ich glaube, er flirtet zurück.');
    } },
    { text: 'Tschüss.', end: true, run: () => sayAs('wirt', 'Komm wieder, wenn du Durst hast!') },
  ]);
}
