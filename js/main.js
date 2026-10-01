'use strict';
// ---------------------------------------------------------------------------
// Titelbild, Intro, Abspann, Menüleiste
// ---------------------------------------------------------------------------

function resetState() {
  E.inv = ['handy']; E.invScroll = 0;
  E.flags = {};
  E.zack.hat = false; E.zack.visible = true;
  E.verb = 'walk'; E.pending = null; E.dialog = null; E.speech = null; E.talking = null;
  E.busy = false; E.particles = []; E.overlay = null; E.fade = 0;
  attic.horseRock = 0; tower.beam = 0;
  Object.assign(chick, { x: 112, y: 126, dir: 1, t: 0, peck: false, run: 0, fed: 0 });
}

// ---------------- Titelbild ----------------
function titleBg() {
  return cached('titlebg', () => {
    const p = new Pix(W, H);
    p.vgrad(0, 0, W, H, ['#0a0620', '#1a0e3e', '#36185a', '#5a2a6a', '#7a3a5a']);
    p.noise(0, 0, W, 120, '#ffffff', 0.006, 3); p.noise(0, 0, W, 90, '#c0c8ff', 0.008, 4);
    p.tint(212, 0, 100, 90, '#f4ecc8', (x, y) => Math.max(0, 0.3 - Math.hypot(x - 262, y - 40) * 0.0065));
    p.circle(262, 40, 20, '#f4ecc8'); p.circle(256, 36, 4, '#e0d4a8'); p.circle(268, 48, 3, '#e0d4a8'); p.circle(270, 32, 2, '#e0d4a8');
    p.poly([[0, 150], [40, 128], [90, 140], [140, 122], [200, 136], [250, 120], [320, 132], [320, 200], [0, 200]], '#2a1440');
    p.poly([[0, 170], [50, 156], [110, 166], [170, 152], [230, 164], [320, 150], [320, 200], [0, 200]], '#1c0c2c');
    // Turm am Horizont
    p.rect(286, 70, 14, 64, '#140a20'); p.poly([[282, 70], [304, 70], [293, 50]], '#140a20'); p.rect(291, 84, 3, 5, '#ffd060');
    // Waldsilhouette
    for (let i = 0; i < 24; i++) { const x = i * 14 + 4, h = 18 + (i * 7) % 14; p.poly([[x - 7, 182], [x + 7, 182], [x, 182 - h]], '#100818'); }
    p.rect(0, 180, W, 20, '#100818');
    return p.canvas();
  });
}
let titleSel = 0;
window.drawTitle = (ctx, t) => {
  ctx.drawImage(titleBg(), 0, 0);
  for (let i = 0; i < 14; i++) {
    const x = (i * 71) % 300 + 10, y = (i * 37) % 100 + 6;
    if (Math.floor(t * 2 + i) % 4 === 0) { fr(ctx, x, y, 1, 1, '#ffffff'); fr(ctx, x - 1, y, 3, 1, '#a0a8ff'); fr(ctx, x, y - 1, 1, 3, '#a0a8ff'); }
  }
  // Zack groß mit Hut
  const img = zackSprite('down', 's', Math.floor(t * 1.5) % 4 === 0 && false, true);
  blit(ctx, img, 70, 178 + Math.round(Math.sin(t * 2) * 1), ZACK_O.ox, ZACK_O.oy, 2.2);
  for (let i = 0; i < 3; i++) {
    const a = t * 2 + i * 2.1;
    fr(ctx, 70 + Math.cos(a) * 26, 72 + Math.sin(a) * 12, 1, 1, ['#ffe060', '#80e0ff', '#ff80e0'][i]);
  }
};
function hasAutosave() { try { return !!localStorage.getItem('zack-auto'); } catch (e) { return false; } }
function titleItems() { return hasAutosave() ? ['Weiterspielen', 'Neues Spiel'] : ['Neues Spiel']; }
window.drawTitleText = () => {
  text('ZACK', 200, 22, '#ffd040', { align: 'center', size: 42 });
  text('Zauberer wider Willen', 200, 60, '#e8d8ff', { align: 'center', size: 14 });
  const items = titleItems();
  const mx = E.mouse.x, my = E.mouse.y;
  items.forEach((it, i) => {
    const y = 102 + i * 16;
    const hov = mx > 150 && mx < 250 && my >= y - 2 && my < y + 12;
    text((hov ? '» ' : '') + it + (hov ? ' «' : ''), 200, y, hov ? '#ffe060' : '#b8a8e0', { align: 'center', size: 13 });
  });
  text('Ein Point-&-Click-Abenteuer im Stil der 90er', 200, 150, '#8a7aa8', { align: 'center', size: 9 });
  text('Linksklick: Aktion  ·  Rechtsklick: Anschauen  ·  Leertaste: Text überspringen', 160, 188, '#6a5a88', { align: 'center', size: 8, outline: false });
};
window.titleClick = (x, y) => {
  Audio8.init();
  const items = titleItems();
  let pickI = -1;
  items.forEach((it, i) => { const yy = 102 + i * 16; if (x > 150 && x < 250 && y >= yy - 2 && y < yy + 12) pickI = i; });
  if (pickI < 0) return;
  Audio8.sfx('blip');
  if (items[pickI] === 'Weiterspielen') { resetState(); loadGame('zack-auto'); }
  else newGame();
};

// ---------------- Neues Spiel / Intro ----------------
async function newGame() {
  resetState();
  Audio8.music('attic');
  await card(['Irgendwo in Deutschland.', 'Herbstferien. Es regnet.', '', 'Zack, 13, muss eine ganze Woche bei Oma verbringen.', '', 'Ohne WLAN.'], false);
  E.mode = 'game';
  E.fade = 1;
  await goRoom('attic', 160, 122, 'down');
}

ROOMS.attic.enter = async function () {
  if (flag('ending') && !flag('endingDone')) return endingScene();
  if (flag('introDone')) return;
  setFlag('introDone');
  await wait(400);
  await say('Ferien bei Oma. Kein WLAN. Draußen Regen.');
  await say('Das ist offiziell der langweiligste Tag der Weltgeschichte.');
  await say('Oma meinte, ich soll mal auf dem Dachboden stöbern. "Da gibt\'s spannende Sachen, Zacki!"');
  await say('Na klar. Spannend wie ein Zahnarztbesuch.');
};

async function endingScene() {
  setFlag('endingDone');
  burst(E.zack.x, E.zack.y - 20, 40);
  Audio8.sfx('poof');
  await wait(600);
  await say('...ich bin wieder auf dem Dachboden.');
  await sayAs('oma', 'ZAAACK! Essen ist fertig! Es gibt Grießbrei!');
  await say('Komme gleich, Oma!');
  await say('Was für ein Tag. Ob das alles nur ein Traum war?');
  await wait(700);
  face('left'); await wait(400); face('right'); await wait(400); face('down');
  await say('...Moment. Warum hab ich dann immer noch diesen Hut auf?');
  await wait(500);
  Audio8.music('ending');
  Audio8.sfx('fanfare');
  E.mode = 'end';
  E.endT = E.t;
  try { localStorage.removeItem('zack-auto'); } catch (e) { /* egal */ }
}

window.drawEndText = () => {
  const R = E.R;
  vx.fillStyle = 'rgba(8,4,20,0.72)';
  vx.fillRect(0, 0, W * R, SCENE_H * R);
  const k = E.t - (E.endT || 0);
  const lines = [
    ['ENDE', '#ffd040', 30],
    ['', '', 6],
    ['ZACK – Zauberer wider Willen', '#e8d8ff', 12],
    ['Eine Hommage an die großen Point-&-Click-Adventures der 90er', '#b8a8e0', 9],
    ['', '', 6],
    ['Danke fürs Spielen!', '#80e0f0', 12],
  ];
  let y = 18;
  lines.forEach(([s, c, sz], i) => {
    if (k > i * 0.5 && s) text(s, 160, y, c, { align: 'center', size: sz });
    y += sz + 4;
  });
  if (k > 4 && Math.floor(E.t * 2) % 2) text('– Klicken für das Titelbild –', 160, 120, '#8a7aa8', { align: 'center', size: 9 });
};
window.endClick = () => {
  if (E.t - (E.endT || 0) < 4) return;
  resetState();
  E.room = null;
  E.mode = 'title';
  Audio8.music('title');
};

// ---------------- Menüleiste ----------------
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 1800);
}
function setupBar() {
  const snd = document.getElementById('btnSound');
  const upd = () => { snd.textContent = Audio8.enabled ? '♪ Ton an' : '♪ Ton aus'; };
  upd();
  snd.onclick = () => { Audio8.init(); Audio8.setEnabled(!Audio8.enabled); upd(); };
  document.getElementById('btnSave').onclick = () => {
    const r = saveGame();
    toast(r === 'ok' ? 'Spielstand gespeichert.' : r === 'busy' ? 'Jetzt nicht – gerade passiert etwas.' : 'Speichern nicht möglich.');
  };
  document.getElementById('btnLoad').onclick = async () => {
    if (E.busy && E.mode === 'game') return toast('Jetzt nicht – gerade passiert etwas.');
    resetState();
    const ok = await loadGame('zack-save');
    toast(ok ? 'Spielstand geladen.' : 'Kein Spielstand gefunden.');
    if (!ok && !E.room) E.mode = 'title';
  };
  const btnNew = document.getElementById('btnNew');
  let armed = 0;
  btnNew.onclick = () => {
    // Zweistufige Bestätigung direkt am Knopf (confirm() ist in eingebetteten Ansichten blockiert)
    if (E.mode === 'game' && Date.now() - armed > 3000) {
      armed = Date.now();
      btnNew.textContent = 'Wirklich?';
      toast('Nochmal klicken: Ungespeicherter Fortschritt geht verloren.');
      setTimeout(() => { btnNew.textContent = 'Neustart'; }, 3000);
      return;
    }
    armed = 0; btnNew.textContent = 'Neustart';
    resetState(); E.room = null; E.mode = 'title'; Audio8.music('title');
  };
  const help = document.getElementById('help');
  document.getElementById('btnHelp').onclick = () => help.classList.toggle('show');
  help.onclick = () => help.classList.remove('show');
}

// ---------------- Start ----------------
window.addEventListener('load', async () => {
  try { await Promise.race([document.fonts.load('20px "VT323"'), wait(2500)]); } catch (e) { /* Fallback-Schrift */ }
  resetState();
  startEngine();
  setupBar();
  Audio8.music('title');
  // Spielstand bei Live-Aktualisierung der Seite erhalten (nur in der Artifact-Ansicht vorhanden)
  const hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) hot.snapshot(() => (E.mode === 'game' && !E.busy ? { save: snapshot() } : {}));
  const resume = (data) => { if (data && data.save) loadState(data.save); };
  if (hot && hot.ready) hot.ready(resume); else if (hot) resume(hot.data || {});
  // Debug/Test-Hilfe: ?room=swamp&items=feder,flasche&flags=metGrimbart
  const q = new URLSearchParams(location.search);
  if (q.get('room') && ROOMS[q.get('room')]) {
    (q.get('items') || '').split(',').filter(Boolean).forEach(i => addItem(i, true));
    (q.get('flags') || '').split(',').filter(Boolean).forEach(f => setFlag(f));
    if (q.get('hat')) E.zack.hat = true;
    setFlag('introDone'); setFlag('inFabulien'); setFlag('landed');
    E.mode = 'game';
    setRoom(q.get('room')); place(160, 122, 'down');
    if (E.room.before) E.room.before();
  }
});
