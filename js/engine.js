'use strict';
// ---------------------------------------------------------------------------
// Adventure-Engine: Verben-Interface, Inventar, Dialoge, Laufen, Skripte.
// Interne Auflösung 320x200 (wie VGA), Text wird scharf in Bildschirmauflösung gezeichnet.
// ---------------------------------------------------------------------------

const W = 320, H = 200, SCENE_H = 136, SENT_Y = 136, UI_Y = 148;
const FONT = '"VT323", "Courier New", monospace';
const VERBS = [
  ['walk', 'Gehe zu'], ['look', 'Schau an'], ['open', 'Öffne'],
  ['take', 'Nimm'], ['use', 'Benutze'], ['close', 'Schließe'],
  ['talk', 'Rede mit'], ['give', 'Gib'], ['move', 'Bewege'],
];
const VERB_LABEL = Object.fromEntries(VERBS);
const INV_X = 156, INV_Y = 150, SLOT_W = 30, SLOT_H = 24, INV_COLS = 5, INV_ROWS = 2;

const E = {
  mode: 'title',            // title | game | card | end
  t: 0,
  R: 2,                     // Render-Skalierung (CSS-Skala * devicePixelRatio)
  room: null, roomId: null,
  zack: { x: 160, y: 120, dir: 'right', walking: false, frame: 0, animT: 0, path: null, resolve: null, visible: true, hat: false },
  inv: [], invScroll: 0,
  flags: {},
  verb: 'walk', pending: null,
  hover: null, mouse: { x: -1, y: -1, inside: false },
  busy: false, actionTok: 0,
  speech: null, talking: null,
  dialog: null,
  card: null,
  fade: 0,
  particles: [],
  overlay: null,
  shake: 0,
};

let S, sx, V, vx;

function setupCanvas() {
  S = document.createElement('canvas'); S.width = W; S.height = H;
  sx = S.getContext('2d'); sx.imageSmoothingEnabled = false;
  V = document.getElementById('game');
  vx = V.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
}

function resize() {
  const bar = document.getElementById('bar');
  const availW = window.innerWidth - 32;
  const availH = window.innerHeight - (bar ? bar.offsetHeight : 0) - 16;
  let s = Math.min(availW / W, availH / H);
  s = s >= 2 ? Math.floor(s) : Math.max(0.5, s);
  const dpr = window.devicePixelRatio || 1;
  V.style.width = Math.round(W * s) + 'px';
  V.style.height = Math.round(H * s) + 'px';
  E.R = s * dpr;
  V.width = Math.round(W * E.R); V.height = Math.round(H * E.R);
  vx.imageSmoothingEnabled = false;
}

// ------------------------------------------------------------------ Hilfen
const wait = ms => new Promise(r => setTimeout(r, ms));
const blink = (seed) => ((E.t * 1000 + seed * 977) % 4200) < 140;
const talking = id => E.talking === id && Math.floor(E.t * 7) % 2 === 0;
const isTalking = id => E.talking === id;
const has = id => E.inv.includes(id);
const flag = k => !!E.flags[k];
function setFlag(k, v) { E.flags[k] = v === undefined ? true : v; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function addItem(id, silent) {
  if (!E.inv.includes(id)) E.inv.push(id);
  if (!silent) Audio8.sfx('pickup');
  const rows = Math.ceil(E.inv.length / INV_COLS);
  E.invScroll = Math.max(0, rows - INV_ROWS);
}
function removeItem(id) {
  const i = E.inv.indexOf(id);
  if (i >= 0) E.inv.splice(i, 1);
  const rows = Math.ceil(E.inv.length / INV_COLS);
  E.invScroll = Math.min(E.invScroll, Math.max(0, rows - INV_ROWS));
}
function itemName(id) { return (ITEMS[id] && ITEMS[id].name) || id; }

function scaleAt(y) {
  const sc = (E.room && E.room.scale) || [100, 0.8, 134, 1];
  const t = Math.max(0, Math.min(1, (y - sc[0]) / (sc[2] - sc[0])));
  return sc[1] + (sc[3] - sc[1]) * t;
}

// ------------------------------------------------------------ Geometrie
function inPoly(x, y, pts) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if (((a[1] > y) !== (b[1] > y)) && (x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0])) c = !c;
  }
  return c;
}
function clampToPoly(x, y, pts) {
  if (inPoly(x, y, pts)) return [x, y];
  let best = null, bd = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const L = dx * dx + dy * dy;
    let t = L ? ((x - a[0]) * dx + (y - a[1]) * dy) / L : 0;
    t = Math.max(0, Math.min(1, t));
    const px = a[0] + dx * t, py = a[1] + dy * t;
    const d = (px - x) ** 2 + (py - y) ** 2;
    if (d < bd) { bd = d; best = [px, py]; }
  }
  // ein Stück ins Innere ziehen
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  const v = [cx - best[0], cy - best[1]], l = Math.hypot(v[0], v[1]) || 1;
  return [best[0] + v[0] / l * 0.6, best[1] + v[1] / l * 0.6];
}
function hit(o, x, y) {
  if (o.poly) return inPoly(x, y, o.poly);
  const r = o.rect;
  return r && x >= r[0] && y >= r[1] && x < r[0] + r[2] && y < r[1] + r[3];
}
function visible(o) { return !(o.hidden && o.hidden()); }
function objById(id) { return E.room && E.room.objects.find(o => o.id === id); }

// ------------------------------------------------------------ Laufen
function walkTo(x, y) {
  const z = E.zack;
  if (z.resolve) { const r = z.resolve; z.resolve = null; r(false); }
  const pts = E.room.walk;
  [x, y] = clampToPoly(x, y, pts);
  return new Promise(res => {
    if (Math.hypot(x - z.x, y - z.y) < 1) { z.path = null; z.walking = false; res(true); return; }
    z.path = [x, y]; z.walking = true; z.resolve = res;
  });
}
function stopWalk() {
  const z = E.zack;
  z.path = null; z.walking = false;
  if (z.resolve) { const r = z.resolve; z.resolve = null; r(false); }
}
function face(dir) {
  if (typeof dir === 'number') dir = dir < E.zack.x ? 'left' : 'right';
  if (dir) E.zack.dir = dir;
}
function place(x, y, dir) { const z = E.zack; z.x = x; z.y = y; if (dir) z.dir = dir; z.path = null; z.walking = false; }

function updateZack(dt) {
  const z = E.zack;
  if (!z.path) { z.walking = false; return; }
  const [tx, ty] = z.path;
  const dx = tx - z.x, dy = (ty - z.y) * 1.7;
  const d = Math.hypot(dx, dy);
  const sp = 58 * scaleAt(z.y) * dt * (E.walkMul || 1);
  if (Math.abs(dx) > Math.abs(dy) * 0.9) z.dir = dx < 0 ? 'left' : 'right';
  else z.dir = dy < 0 ? 'up' : 'down';
  if (d <= sp) {
    z.x = tx; z.y = ty; z.path = null; z.walking = false;
    if (z.resolve) { const r = z.resolve; z.resolve = null; r(true); }
  } else {
    z.x += dx / d * sp; z.y += (dy / d * sp) / 1.7;
    z.animT += dt;
  }
}

// ------------------------------------------------------------ Sprechen
function speakerInfo(who) {
  if (!who || who === 'zack') {
    const s = scaleAt(E.zack.y);
    return { x: E.zack.x, y: E.zack.y - (E.zack.hat ? 56 : 42) * s, color: '#ffffff', id: 'zack' };
  }
  if (who === 'narrator') return { x: 160, y: 24, color: '#ffe8a0', id: 'narrator' };
  if (who === 'oma') return { x: 161, y: 118, color: '#ffb0d0', id: 'oma' };
  const o = objById(who);
  if (o && o.npc) {
    const h = typeof o.npc.head === 'function' ? o.npc.head() : o.npc.head;
    return { x: h[0], y: h[1], color: o.npc.color, id: who };
  }
  return { x: 160, y: 30, color: '#ffffff', id: who };
}
function speak(who, text, ms) {
  return new Promise(res => {
    const info = speakerInfo(who);
    if (E.speech && E.speech.resolve) E.speech.resolve();
    const dur = ms || Math.max(1700, 900 + text.length * 55);
    E.talking = info.id;
    if (info.id === 'zack' && !E.zack.walking && who !== 'narrator') { /* Zack schaut zum Spieler */ }
    E.speech = {
      text, info, until: E.t + dur / 1000,
      resolve: () => { if (E.speech && E.speech.text === text) { E.speech = null; E.talking = null; } res(); },
    };
  });
}
const say = (text, ms) => speak('zack', text, ms);
const sayAs = (who, text, ms) => speak(who, text, ms);
function skipSpeech() { if (E.speech) E.speech.resolve(); }

// ------------------------------------------------------------ Dialoge
function choose(lines) {
  return new Promise(res => { E.dialog = { lines, resolve: res, scroll: 0 }; });
}
// opts: [{text, cond, run, end, silent}]
async function converse(getOpts) {
  for (;;) {
    const opts = getOpts().filter(o => !o.cond || o.cond());
    if (!opts.length) return;
    const i = await choose(opts.map(o => o.text));
    E.dialog = null;
    const o = opts[i];
    if (!o.silent) await say(o.say || o.text);
    let r;
    if (o.run) r = await o.run();
    if (o.end || r === 'end') return;
  }
}

// ------------------------------------------------------------ Effekte
function burst(x, y, n, cols, spread) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = (0.3 + Math.random()) * (spread || 40);
    E.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 10, life: 0.6 + Math.random() * 0.8, c: pick(cols || ['#ffffff', '#ffe060', '#80e0ff', '#ff80e0']) });
  }
}
function updateParticles(dt) {
  for (const p of E.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 30 * dt; p.life -= dt; }
  E.particles = E.particles.filter(p => p.life > 0);
}
async function flash(color, ms) {
  E.overlay = { color: color || '#ffffff', a: 1 };
  const steps = 10;
  for (let i = steps; i >= 0; i--) { E.overlay.a = i / steps; await wait((ms || 400) / steps); }
  E.overlay = null;
}
async function fadeTo(target, ms) {
  const from = E.fade, steps = 10;
  for (let i = 1; i <= steps; i++) { E.fade = from + (target - from) * i / steps; await wait((ms || 300) / steps); }
}

// ------------------------------------------------------------ Räume
function roomBg(room) {
  const key = room.bgKey ? room.bgKey() : 'x';
  if (!room._bg || room._bgKey !== key) {
    const p = new Pix(W, SCENE_H);
    room.paint(p);
    room._bg = p.canvas(); room._bgKey = key;
  }
  return room._bg;
}
function setRoom(id) {
  E.room = ROOMS[id]; E.roomId = id;
  E.hover = null;
  roomBg(E.room);
  Audio8.music(E.room.music || null);
}
async function goRoom(id, x, y, dir, opts) {
  opts = opts || {};
  stopWalk();
  const wasBusy = E.busy;
  E.busy = true;
  if (!opts.noFade) await fadeTo(1, 260);
  setRoom(id);
  place(x, y, dir);
  E.speech = null; E.talking = null;
  if (E.room.before) E.room.before();
  if (!opts.noFade) await fadeTo(0, 260); else E.fade = 0;
  if (E.room.enter) await E.room.enter();
  E.busy = wasBusy;
  autosave();
}

// ------------------------------------------------------------ Aktionen
const DEFAULTS = {
  look: ['Nichts Besonderes.', 'Sieht aus wie... ein Ding.', 'Hm. Interessant. Nicht wirklich.', 'Ich hab schon Spannenderes gesehen. Zum Beispiel Farbe beim Trocknen.'],
  take: ['Das kann ich nicht mitnehmen.', 'Das lass ich mal schön hier.', 'Meine Taschen sind zwar magisch groß, aber nein.', 'Das gehört mir nicht. Glaube ich.'],
  open: ['Das lässt sich nicht öffnen.', 'Da ist nichts zum Aufmachen.'],
  close: ['Das lässt sich nicht schließen.', 'Ist doch schon zu. Irgendwie.'],
  use: ['Das funktioniert so nicht.', 'Das bringt nichts.', 'Ich wüsste nicht, wie.', 'Nö.'],
  talk: ['Ich rede doch nicht mit Gegenständen. Noch nicht.', 'Es antwortet nicht. Typisch.'],
  move: ['Das bewegt sich keinen Millimeter.', 'Zu schwer. Oder ich zu schwach. Eher Ersteres.'],
  give: ['Das behalte ich lieber.'],
};
async function defaultResponse(verb, o, item) {
  if (verb === 'give' && o && o.npc) return say(pick([`Ich glaube nicht, dass ${o.the || o.name} das haben will.`, 'Das will bestimmt keiner haben.']));
  if (verb === 'talk' && o && o.npc) return say('Hallo?');
  if (verb === 'use' && item) return say(pick(['Das passt nicht zusammen.', 'Das funktioniert so nicht.', 'Was soll das bringen?', 'Nee.']));
  Audio8.sfx('blip');
  return say(pick(DEFAULTS[verb] || DEFAULTS.use));
}
function walkPoint(o) {
  if (o.walk) return typeof o.walk === 'function' ? o.walk() : o.walk;
  const r = o.rect || [0, 0, 0, 0];
  return [r[0] + r[2] / 2, r[1] + r[3] + 4];
}
async function runHandler(verb, o, item) {
  const h = o.on && o.on[verb];
  let r;
  if (h) r = await h(item || null);
  if (!h || r === false) await defaultResponse(verb, o, item);
}
async function doAction(verb, o, item) {
  const tok = ++E.actionTok;
  E.verb = 'walk'; E.pending = null;
  const [wx, wy] = walkPoint(o);
  if (verb !== 'look' || o.walkToLook) {
    const ok = await walkTo(wx, wy);
    if (!ok || tok !== E.actionTok) return;
  }
  if (o.face) face(o.face);
  else { const r = o.rect || [wx, wy, 0, 0]; const cx = r[0] + r[2] / 2; if (Math.abs(cx - E.zack.x) > 6) face(cx); }
  if (verb === 'walk') {
    if (o.exit) {
      if (o.exit.ok && !o.exit.ok()) { E.busy = true; try { await o.exit.blocked(); } finally { E.busy = false; } return; }
      return goRoom(o.exit.to, o.exit.x, o.exit.y, o.exit.dir);
    }
    if (o.on && o.on.walk) { E.busy = true; try { await o.on.walk(); } finally { E.busy = false; } }
    return;
  }
  E.busy = true;
  try { await runHandler(verb, o, item); }
  catch (e) { console.error(e); }
  finally { E.busy = false; E.dialog = null; }
}
async function invAction(verb, id) {
  const it = ITEMS[id] || {};
  if (verb === 'use' && !it.solo) { E.pending = { verb: 'use', item: id }; return; }
  if (verb === 'give') { E.pending = { verb: 'give', item: id }; return; }
  E.verb = 'walk';
  stopWalk();
  E.busy = true;
  try {
    if (verb === 'look' || verb === 'walk') await (it.look ? it.look() : say('Das ist ' + it.name + '.'));
    else if (verb === 'take') await say(pick(['Hab ich doch schon.', 'Ist schon in meiner Tasche.']));
    else if (it[verb]) { const r = await it[verb](); if (r === false) await defaultResponse(verb, null, null); }
    else await defaultResponse(verb, null, null);
  } catch (e) { console.error(e); }
  finally { E.busy = false; }
}
async function comboAction(verb, a, b) {
  E.verb = 'walk'; E.pending = null;
  stopWalk();
  E.busy = true;
  try {
    if (verb === 'give') { await say('Ich kann Gegenständen nichts geben.'); return; }
    if (a === b) { await say('Das mit sich selbst? Philosophisch, aber sinnlos.'); return; }
    const A = ITEMS[a] || {}, B = ITEMS[b] || {};
    const h = (A.with && A.with[b]) || (B.with && B.with[a]);
    if (h) { const r = await h(); if (r !== false) return; }
    await defaultResponse('use', null, a);
  } catch (e) { console.error(e); }
  finally { E.busy = false; }
}

// ------------------------------------------------------------ Eingabe
function toInternal(ev) {
  const r = V.getBoundingClientRect();
  return [(ev.clientX - r.left) / r.width * W, (ev.clientY - r.top) / r.height * H];
}
function objectAt(x, y) {
  if (!E.room || y >= SCENE_H) return null;
  const objs = E.room.objects;
  for (let i = objs.length - 1; i >= 0; i--) {
    const o = objs[i];
    if (!o.name || !visible(o) || (o.noHover && o.noHover())) continue;
    if (hit(o, x, y)) return o;
  }
  return null;
}
function uiAt(x, y) {
  if (y >= SCENE_H || x < 0) {
    if (E.dialog) {
      const d = E.dialog;
      if (x >= 304 && d.lines.length > 5) return { type: y < 174 ? 'dup' : 'ddown' };
      const i = Math.floor((y - 150) / 10);
      if (y >= 150 && i >= 0 && i < 5 && i + d.scroll < d.lines.length) return { type: 'dlg', i: i + d.scroll };
      return null;
    }
    if (y >= UI_Y) {
      if (x < 150) {
        const c = Math.floor((x - 2) / 49), r = Math.floor((y - 150) / 16);
        if (c >= 0 && c < 3 && r >= 0 && r < 3) return { type: 'verb', verb: VERBS[r * 3 + c][0] };
      } else if (x >= INV_X && x < INV_X + SLOT_W * INV_COLS && y >= INV_Y && y < INV_Y + SLOT_H * INV_ROWS + 2) {
        const c = Math.floor((x - INV_X) / SLOT_W), r = Math.floor((y - INV_Y) / (SLOT_H + 1));
        const idx = (E.invScroll + r) * INV_COLS + c;
        if (idx < E.inv.length && r < INV_ROWS) return { type: 'inv', id: E.inv[idx] };
      } else if (x >= 306 && x < 319) {
        if (y < 174) return { type: 'up' };
        return { type: 'down' };
      }
    }
    return null;
  }
  const o = objectAt(x, y);
  return o ? { type: 'obj', o } : { type: 'scene' };
}
function onMove(ev) {
  const [x, y] = toInternal(ev);
  E.mouse.x = x; E.mouse.y = y; E.mouse.inside = true;
  if (E.mode === 'game') E.hover = uiAt(x, y);
}
function onDown(ev) {
  ev.preventDefault();
  Audio8.init();
  const [x, y] = toInternal(ev);
  E.mouse.x = x; E.mouse.y = y;
  const right = ev.button === 2;
  if (E.mode === 'title') { if (window.titleClick) window.titleClick(x, y); return; }
  if (E.mode === 'card') { if (E.card && E.card.resolve) E.card.resolve(); return; }
  if (E.mode === 'end') { if (window.endClick) window.endClick(); return; }
  if (E.speech) { skipSpeech(); if (E.busy || E.dialog) return; }
  if (E.dialog) {
    const u = uiAt(x, y);
    if (u && u.type === 'dlg') { const d = E.dialog; E.dialog = null; Audio8.sfx('blip'); d.resolve(u.i); }
    else if (u && u.type === 'dup') E.dialog.scroll = Math.max(0, E.dialog.scroll - 1);
    else if (u && u.type === 'ddown') E.dialog.scroll = Math.min(E.dialog.lines.length - 5, E.dialog.scroll + 1);
    return;
  }
  if (E.busy) return;
  const u = uiAt(x, y);
  if (!u) return;
  if (u.type === 'verb') { E.verb = u.verb; E.pending = null; Audio8.sfx('blip'); return; }
  if (u.type === 'up') { E.invScroll = Math.max(0, E.invScroll - 1); return; }
  if (u.type === 'down') { const rows = Math.ceil(E.inv.length / INV_COLS); E.invScroll = Math.min(Math.max(0, rows - INV_ROWS), E.invScroll + 1); return; }
  if (u.type === 'inv') {
    if (right) return invAction('look', u.id);
    if (E.pending) return comboAction(E.pending.verb, E.pending.item, u.id);
    return invAction(E.verb, u.id);
  }
  if (u.type === 'obj') {
    if (right) return doAction('look', u.o);
    if (E.pending) return doAction(E.pending.verb, u.o, E.pending.item);
    return doAction(E.verb, u.o);
  }
  if (u.type === 'scene') {
    if (right) return;
    E.pending = null; E.verb = 'walk';
    ++E.actionTok;
    walkTo(x, y);
  }
}

// ------------------------------------------------------------ Text
function font(size) { return `${Math.round(size * E.R)}px ${FONT}`; }
function wrap(text, maxW) {
  const words = text.split(' ');
  const lines = []; let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (vx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}
function text(str, x, y, color, opt) {
  opt = opt || {};
  const R = E.R;
  vx.font = font(opt.size || 10);
  vx.textAlign = opt.align || 'left';
  vx.textBaseline = 'top';
  if (opt.outline !== false) {
    vx.fillStyle = '#000000';
    const o = Math.max(1, Math.round(R * 0.7));
    for (const [dx, dy] of [[-o, 0], [o, 0], [0, -o], [0, o], [o, o], [-o, -o], [o, -o], [-o, o]]) vx.fillText(str, x * R + dx, y * R + dy);
  }
  vx.fillStyle = color;
  vx.fillText(str, x * R, y * R);
}
function drawSpeech() {
  const sp = E.speech;
  if (!sp) return;
  if (E.t > sp.until) { sp.resolve(); return; }
  const R = E.R, size = 10, lh = 8.5;
  vx.font = font(size);
  const maxW = (sp.info.id === 'narrator' ? 280 : 200) * R;
  const lines = wrap(sp.text, maxW);
  const widest = Math.max(...lines.map(l => vx.measureText(l).width)) / R;
  let x = sp.info.x;
  x = Math.max(4 + widest / 2, Math.min(W - 4 - widest / 2, x));
  let y = sp.info.y - lines.length * lh - 2;
  y = Math.max(2, Math.min(SCENE_H - lines.length * lh - 2, y));
  lines.forEach((l, i) => text(l, x, y + i * lh, sp.info.color, { align: 'center', size }));
}

// ------------------------------------------------------------ Zeichnen
function drawZack(ctx) {
  const z = E.zack;
  if (!z.visible) return;
  const s = scaleAt(z.y);
  const frame = z.walking ? Math.floor(z.animT / 0.12) % 4 : 's';
  const mouth = E.talking === 'zack' && Math.floor(E.t * 7) % 2 === 0;
  const dirKey = z.dir === 'left' ? 'right' : z.dir;
  const img = zackSprite(dirKey, frame, mouth, z.hat);
  const w = ZACK_O.w * s, h = ZACK_O.h * s;
  const dx = Math.round(z.x - ZACK_O.ox * s), dy = Math.round(z.y - ZACK_O.oy * s);
  // Schatten
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(Math.round(z.x - 6 * s), Math.round(z.y - 1), Math.round(12 * s), 2);
  if (z.dir === 'left') {
    ctx.save(); ctx.translate(Math.round(z.x * 2 - 0), 0); ctx.scale(-1, 1);
    ctx.drawImage(img, Math.round(z.x - ZACK_O.ox * s), dy, Math.round(w), Math.round(h));
    ctx.restore();
  } else ctx.drawImage(img, dx, dy, Math.round(w), Math.round(h));
}
// NPC-/Objekt-Sprites zeichnen (Ursprung = Fußpunkt)
function blit(ctx, img, x, y, ox, oy, s, flip) {
  s = s || 1;
  const w = Math.round(img.width * s), h = Math.round(img.height * s);
  const dx = Math.round(x - ox * s), dy = Math.round(y - oy * s);
  if (flip) { ctx.save(); ctx.translate(Math.round(x) * 2, 0); ctx.scale(-1, 1); ctx.drawImage(img, dx, dy, w, h); ctx.restore(); }
  else ctx.drawImage(img, dx, dy, w, h);
}

function drawScene(ctx) {
  const room = E.room;
  ctx.drawImage(roomBg(room), 0, 0);
  if (room.back) room.back(ctx, E.t);
  const list = [];
  for (const o of room.objects) {
    if (!o.draw || !visible(o)) continue;
    const z = o.z !== undefined ? (typeof o.z === 'function' ? o.z() : o.z) : (o.rect ? o.rect[1] + o.rect[3] : 0);
    list.push([z, o]);
  }
  list.push([E.zack.y, null]);
  list.sort((a, b) => a[0] - b[0]);
  for (const [, o] of list) { if (o) o.draw(ctx, E.t); else drawZack(ctx); }
  if (room.front) room.front(ctx, E.t);
  for (const p of E.particles) { ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); }
}

function bevel(ctx, x, y, w, h, base, hi, lo) {
  fr(ctx, x, y, w, h, base);
  fr(ctx, x, y, w, 1, hi); fr(ctx, x, y, 1, h, hi);
  fr(ctx, x, y + h - 1, w, 1, lo); fr(ctx, x + w - 1, y, 1, h, lo);
}

function drawUI(ctx) {
  // Hintergrund (Holz-/Steinleiste)
  fr(ctx, 0, SENT_Y, W, H - SENT_Y, '#1a1024');
  fr(ctx, 0, UI_Y - 1, W, 1, '#4a3060');
  if (E.dialog) {
    fr(ctx, 0, UI_Y, W, H - UI_Y, '#120a1a');
    const d = E.dialog;
    if (d.lines.length > 5) {
      bevel(ctx, 307, 150, 11, 23, '#2c1c3c', '#4c3464', '#100818');
      bevel(ctx, 307, 175, 11, 23, '#2c1c3c', '#4c3464', '#100818');
      const up = d.scroll > 0, dn = d.scroll < d.lines.length - 5;
      for (let i = 0; i < 4; i++) { fr(ctx, 312 - i, 157 + i, 1 + i * 2, 1, up ? '#e8c860' : '#4a3a5a'); fr(ctx, 312 - i, 190 - i, 1 + i * 2, 1, dn ? '#e8c860' : '#4a3a5a'); }
    }
    return;
  }
  // Verben
  for (let i = 0; i < VERBS.length; i++) {
    const c = i % 3, r = Math.floor(i / 3);
    const x = 2 + c * 49, y = 150 + r * 16;
    const sel = E.verb === VERBS[i][0];
    bevel(ctx, x, y, 47, 14, sel ? '#4c2c6c' : '#2c1c3c', sel ? '#8c5cb4' : '#4c3464', '#100818');
  }
  // Inventar
  bevel(ctx, INV_X - 3, INV_Y - 2, SLOT_W * INV_COLS + 4, SLOT_H * INV_ROWS + 5, '#140c1c', '#0a0610', '#4a3060');
  for (let r = 0; r < INV_ROWS; r++) for (let c = 0; c < INV_COLS; c++) {
    const x = INV_X + c * SLOT_W, y = INV_Y + r * (SLOT_H + 1);
    const idx = (E.invScroll + r) * INV_COLS + c;
    const id = E.inv[idx];
    const hov = E.hover && E.hover.type === 'inv' && E.hover.id === id && id;
    const pend = E.pending && E.pending.item === id && id;
    fr(ctx, x, y, SLOT_W - 2, SLOT_H, pend ? '#4c3a10' : hov ? '#34244a' : '#22162e');
    if (id) ctx.drawImage(iconCanvas(id), x, y + 2);
  }
  // Pfeile
  const rows = Math.ceil(E.inv.length / INV_COLS);
  const canUp = E.invScroll > 0, canDown = E.invScroll < rows - INV_ROWS;
  bevel(ctx, 307, 150, 11, 23, '#2c1c3c', '#4c3464', '#100818');
  bevel(ctx, 307, 175, 11, 23, '#2c1c3c', '#4c3464', '#100818');
  const ac = (on) => on ? '#e8c860' : '#4a3a5a';
  for (let i = 0; i < 4; i++) { fr(ctx, 312 - i, 157 + i, 1 + i * 2, 1, ac(canUp)); fr(ctx, 312 - i, 190 - i, 1 + i * 2, 1, ac(canDown)); }
}

function drawUIText() {
  if (E.mode !== 'game') return;
  // Satzzeile
  let s = '';
  if (E.dialog) s = '';
  else if (E.busy) s = '';
  else {
    s = VERB_LABEL[E.verb];
    if (E.pending) s = VERB_LABEL[E.pending.verb] + ' ' + itemName(E.pending.item) + (E.pending.verb === 'give' ? ' an' : ' mit');
    const h = E.hover;
    if (h && h.type === 'obj') s += ' ' + h.o.name;
    else if (h && h.type === 'inv' && !(E.pending && E.pending.item === h.id)) s += ' ' + itemName(h.id);
  }
  if (s) text(s, 160, SENT_Y + 1, '#80e0f0', { align: 'center', size: 10 });
  if (E.dialog) {
    const sc = E.dialog.scroll || 0;
    E.dialog.lines.slice(sc, sc + 5).forEach((l, i) => {
      const hov = E.hover && E.hover.type === 'dlg' && E.hover.i === i + sc;
      text(l, 6, 150 + i * 10, hov ? '#ffe060' : '#b8d8ff', { size: 10 });
    });
    return;
  }
  for (let i = 0; i < VERBS.length; i++) {
    const c = i % 3, r = Math.floor(i / 3);
    const x = 2 + c * 49 + 23.5, y = 150 + r * 16 + 2.5;
    const v = VERBS[i][0];
    const hov = E.hover && E.hover.type === 'verb' && E.hover.verb === v;
    const col = E.busy ? '#5a4a6a' : E.verb === v ? '#ffffff' : hov ? '#ffe060' : '#c8a8e8';
    text(VERBS[i][1], x, y, col, { align: 'center', size: 10, outline: false });
  }
}

function drawCursor(ctx) {
  if (!E.mouse.inside) return;
  const x = Math.round(E.mouse.x), y = Math.round(E.mouse.y);
  const hot = E.hover && (E.hover.type === 'obj' || E.hover.type === 'inv');
  const c = E.busy ? '#706080' : hot ? '#ffe060' : '#ffffff';
  for (const [dx, dy, w, h] of [[-5, 0, 3, 1], [3, 0, 3, 1], [0, -5, 1, 3], [0, 3, 1, 3]]) {
    fr(ctx, x + dx + 1, y + dy + 1, w, h, '#000000');
    fr(ctx, x + dx, y + dy, w, h, c);
  }
  if (hot) fr(ctx, x, y, 1, 1, c);
}

function render() {
  sx.setTransform(1, 0, 0, 1, 0, 0);
  fr(sx, 0, 0, W, H, '#000000');
  if (E.mode === 'game' || E.mode === 'end') {
    if (E.room) {
      sx.save();
      if (E.shake > 0) sx.translate(Math.round((Math.random() - 0.5) * 3), Math.round((Math.random() - 0.5) * 2));
      sx.beginPath(); sx.rect(0, 0, W, SCENE_H); sx.clip();
      drawScene(sx);
      sx.restore();
    }
    if (E.overlay) { sx.globalAlpha = E.overlay.a; fr(sx, 0, 0, W, SCENE_H, E.overlay.color); sx.globalAlpha = 1; }
    if (E.fade > 0) { sx.globalAlpha = E.fade; fr(sx, 0, 0, W, SCENE_H, '#000000'); sx.globalAlpha = 1; }
    drawUI(sx);
  } else if (E.mode === 'title' && window.drawTitle) window.drawTitle(sx, E.t);
  else if (E.mode === 'card') { /* schwarz */ }
  drawCursor(sx);
  vx.imageSmoothingEnabled = false;
  vx.drawImage(S, 0, 0, V.width, V.height);
  if (E.mode === 'game' || E.mode === 'end') { if (E.fade < 0.95) drawSpeech(); drawUIText(); }
  if (E.mode === 'title' && window.drawTitleText) window.drawTitleText();
  if (E.mode === 'card' && E.card) {
    const lines = E.card.lines;
    lines.forEach((l, i) => text(l, 160, 100 - lines.length * 6 + i * 12, i === 0 && E.card.title ? '#ffe060' : '#e8e0ff', { align: 'center', size: 11 }));
    if (Math.floor(E.t * 2) % 2) text('– Klicken –', 160, 184, '#7a6a8a', { align: 'center', size: 9, outline: false });
  }
  if (E.mode === 'end' && window.drawEndText) window.drawEndText();
}

// Texttafel (Erzähler)
function card(lines, title) {
  return new Promise(res => {
    E.mode = 'card';
    E.card = { lines, title, resolve: () => { E.card = null; res(); } };
  });
}

// ------------------------------------------------------------ Speichern
function snapshot() {
  return { room: E.roomId, x: E.zack.x, y: E.zack.y, dir: E.zack.dir, hat: E.zack.hat, inv: E.inv.slice(), flags: Object.assign({}, E.flags) };
}
function autosave() { try { localStorage.setItem('zack-auto', JSON.stringify(snapshot())); } catch (e) { /* egal */ } }
function saveGame() {
  if (E.mode !== 'game' || E.busy) return 'busy';
  try { localStorage.setItem('zack-save', JSON.stringify(snapshot())); return 'ok'; } catch (e) { return 'err'; }
}
async function loadGame(key) {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(key || 'zack-save')); } catch (e) { d = null; }
  return loadState(d);
}
async function loadState(d) {
  if (!d || !ROOMS[d.room]) return false;
  E.mode = 'game';
  E.inv = d.inv; E.flags = d.flags; E.zack.hat = !!d.hat;
  E.verb = 'walk'; E.pending = null; E.dialog = null; E.speech = null; E.busy = false;
  E.fade = 1;
  setRoom(d.room); place(d.x, d.y, d.dir);
  if (E.room.before) E.room.before();
  await fadeTo(0, 300);
  return true;
}

// ------------------------------------------------------------ Hauptschleife
let last = 0;
function loop(ts) {
  step(ts);
  requestAnimationFrame(loop);
}
function step(ts) {
  const dt = Math.min(0.05, (ts - last) / 1000 || 0);
  last = ts;
  E.t += dt;
  if (E.mode === 'game' || E.mode === 'end') {
    updateZack(dt);
    if (E.room && E.room.update) E.room.update(dt, E.t);
    updateParticles(dt);
    if (E.shake > 0) E.shake -= dt;
    if (!E.busy && !E.dialog && E.mouse.inside && E.mode === 'game') E.hover = uiAt(E.mouse.x, E.mouse.y);
  }
  render();
}

function startEngine() {
  // Falls requestAnimationFrame pausiert (eingebettete/verdeckte Ansicht), läuft das Spiel per Timer weiter
  setInterval(() => { const now = performance.now(); if (now - last > 120) step(now); }, 33);
  setupCanvas();
  V.addEventListener('pointermove', onMove);
  V.addEventListener('pointerdown', onDown);
  V.addEventListener('pointerleave', () => { E.mouse.inside = false; E.hover = null; });
  V.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' || e.key === ' ' || e.key === '.' || e.key === 'Enter') {
      if (E.mode === 'card' && E.card) E.card.resolve();
      else if (E.speech) skipSpeech();
      e.preventDefault();
    }
  });
  requestAnimationFrame(loop);
}
