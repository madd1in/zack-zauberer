'use strict';
// ---------------------------------------------------------------------------
// Figuren & Inventar-Symbole – alles prozedural als Pixel-Art erzeugt.
// Jede Funktion liefert ein gecachtes Canvas; Ursprung = Fußpunkt (ox, oy).
// ---------------------------------------------------------------------------

const OUT = '#14101c'; // Konturfarbe

// ---------------- ZACK ----------------
const ZACK_O = { w: 30, h: 66, ox: 15, oy: 64 };
function zackSprite(dir, frame, mouth, hat) {
  const key = `zack|${dir}|${frame}|${mouth}|${hat}`;
  return cached(key, () => {
    const p = spr(ZACK_O.w, ZACK_O.h, ZACK_O.ox, ZACK_O.oy, (R, P) => {
      const sk = '#f2c29a', skS = '#d4946a', hr = '#d8641c', hrS = '#a0400c', hrL = '#f49040';
      const hd = '#3c9c48', hdS = '#276b36', hdL = '#66c470', jn = '#3858a8', jnS = '#22397a';
      const sh = '#f4f4f4', shS = '#a4a4b8', ey = '#1c1c2c', mo = '#7a2818';
      const walking = frame !== 's';
      const f = walking ? frame : 1;
      const ub = walking && (f === 1 || f === 3) ? -1 : 0;

      if (dir === 'down' || dir === 'up') {
        const lUp = walking && f === 0 ? 2 : 0, rUp = walking && f === 2 ? 2 : 0;
        // Schuhe
        R(-5, -2 - lUp, 4, 2, sh); R(-5, -1 - lUp, 4, 1, shS);
        R(1, -2 - rUp, 4, 2, sh); R(1, -1 - rUp, 4, 1, shS);
        // Beine
        R(-4, -13 + ub, 3, 11 - ub - lUp, jn); R(1, -13 + ub, 3, 11 - ub - rUp, jn);
        R(-1, -13 + ub, 2, 3, jnS); R(-2, -10 + ub, 1, 8 - lUp - ub, jnS);
        // Pulli
        R(-6, -25 + ub, 12, 13, hd); R(3, -25 + ub, 3, 13, hdS); R(-6, -25 + ub, 1, 12, hdL);
        R(-6, -13 + ub, 12, 1, hdS);
        if (dir === 'down') {
          R(-3, -18 + ub, 6, 3, hdS); R(-3, -18 + ub, 6, 1, hd);
          P(-2, -24 + ub, '#e8e8e8'); P(-2, -23 + ub, '#e8e8e8'); P(1, -24 + ub, '#e8e8e8'); P(1, -23 + ub, '#e8e8e8');
        } else {
          R(-4, -25 + ub, 8, 4, hdS); R(-3, -25 + ub, 6, 1, hd);
        }
        // Arme
        const as = walking ? (f === 0 ? 1 : f === 2 ? -1 : 0) : 0;
        R(-8, -24 + ub + as, 2, 10, hd); R(6, -24 + ub - as, 2, 10, hdS);
        R(-8, -14 + ub + as, 2, 2, sk); R(6, -14 + ub - as, 2, 2, skS);
        // Hals & Kopf
        R(-1, -26 + ub, 2, 1, skS);
        R(-4, -34 + ub, 8, 8, sk); R(-4, -27 + ub, 8, 1, skS); R(3, -33 + ub, 1, 6, skS);
        P(-5, -31 + ub, sk); P(4, -31 + ub, skS);
        if (dir === 'down') {
          R(-2, -31 + ub, 1, 2, ey); R(1, -31 + ub, 1, 2, ey);
          R(-3, -33 + ub, 2, 1, hrS); R(1, -33 + ub, 2, 1, hrS);
          P(0, -29 + ub, skS);
          P(-3, -29 + ub, '#e8a07a'); P(2, -29 + ub, '#e8a07a');
          if (mouth) { R(-1, -28 + ub, 3, 2, '#4a1008'); P(0, -28 + ub, mo); }
          else R(-1, -28 + ub, 3, 1, mo);
          // Haare vorne
          R(-5, -37 + ub, 10, 3, hr); R(-5, -34 + ub, 1, 3, hr); R(4, -34 + ub, 1, 2, hr);
          R(-4, -34 + ub, 3, 1, hr); R(1, -34 + ub, 3, 1, hr); P(-1, -34 + ub, hrS);
          R(-3, -36 + ub, 3, 1, hrL);
        } else {
          R(-5, -37 + ub, 10, 9, hr); R(-4, -29 + ub, 8, 1, hrS); R(-2, -36 + ub, 4, 1, hrL);
          R(-5, -31 + ub, 1, 2, sk); R(4, -31 + ub, 1, 2, skS);
        }
        if (!hat) {
          P(-4, -38 + ub, hr); P(-1, -39 + ub, hr); P(0, -38 + ub, hr); P(3, -38 + ub, hr); P(5, -37 + ub, hr); P(-6, -36 + ub, hr);
          P(-1, -38 + ub, hrL);
        }
      } else {
        // Seitenansicht (rechts), links wird gespiegelt
        const legs = walking ? [[-4, 3], [0, 0], [3, -4], [0, 0]][f] : [0, 0];
        const back = legs[0], front = legs[1];
        // hinterer Arm
        const sw = walking ? [3, 0, -3, 0][f] : 0;
        R(-1 - sw, -24 + ub, 2, 9, hdS); R(-1 - sw, -15 + ub, 2, 2, skS);
        // Beine (dicke Linien von der Hüfte zum Fuß)
        const leg = (fx, c) => {
          for (let y = -13; y <= -2; y++) {
            const t = (y + 13) / 11;
            const x = Math.round(-1 + fx * t);
            R(x, y + (y < -9 ? ub : 0), 3, 1, c);
          }
        };
        leg(back, jnS); leg(front, jn);
        R(back - 1, -2, 4, 2, shS); R(back, -2, 4, 1, sh);
        R(front - 1, -2, 5, 2, sh); R(front - 1, -1, 5, 1, shS);
        // Körper
        R(-4, -25 + ub, 8, 13, hd); R(-4, -25 + ub, 2, 13, hdS); R(2, -25 + ub, 1, 12, hdL);
        R(-5, -25 + ub, 2, 5, hdS); R(-4, -13 + ub, 8, 1, hdS);
        // vorderer Arm
        R(-1 + sw, -24 + ub, 3, 9, hd); R(-1 + sw, -24 + ub, 1, 9, hdL); R(-1 + sw, -15 + ub, 3, 2, sk);
        // Kopf
        R(-1, -26 + ub, 2, 1, skS);
        R(-3, -34 + ub, 7, 8, sk); R(-3, -27 + ub, 7, 1, skS);
        P(4, -31 + ub, sk); P(4, -30 + ub, skS);
        R(2, -32 + ub, 1, 2, ey); R(1, -33 + ub, 3, 1, hrS);
        P(-1, -31 + ub, skS); P(-1, -30 + ub, skS);
        if (mouth) { R(2, -28 + ub, 2, 2, '#4a1008'); } else R(2, -28 + ub, 2, 1, mo);
        P(1, -29 + ub, '#e8a07a');
        // Haare
        R(-4, -37 + ub, 8, 3, hr); R(-4, -34 + ub, 3, 5, hr); R(-4, -30 + ub, 2, 1, hrS);
        R(0, -34 + ub, 4, 1, hr); P(4, -34 + ub, hr); R(-2, -36 + ub, 4, 1, hrL);
        if (!hat) {
          P(-3, -38 + ub, hr); P(0, -39 + ub, hr); P(1, -38 + ub, hr); P(3, -38 + ub, hr); P(-5, -36 + ub, hr); P(-5, -35 + ub, hr);
        }
      }
      if (hat) drawHat(R, P, ub, dir);
    });
    p.outline(OUT);
    return p.canvas();
  });
}

function drawHat(R, P, ub, dir) {
  const ht = '#2c40c8', htS = '#1a2484', htL = '#5a70f0', st = '#ffe048';
  R(-7, -36 + ub, 14, 2, htS); R(-6, -36 + ub, 12, 1, ht);
  const lean = dir === 'right' ? -1 : 1;
  for (let i = 0; i < 17; i++) {
    const y = -37 - i + ub;
    const hw = Math.max(0, Math.round(5 - i * 0.3));
    const cx = Math.round((i * i) / 55) * (dir === 'up' ? 0 : lean) * -1;
    R(-hw + cx, y, hw * 2 + 1, 1, ht);
    P(-hw + cx, y, htL);
    if (hw > 0) P(hw + cx, y, htS);
  }
  P(-2, -40 + ub, st); P(2, -43 + ub, st); P(0, -47 + ub, st); P(-1, -38 + ub, st);
  P(1, -51 + ub, st);
}

// ---------------- Gartenzwerg (Grimbart / Morbus) ----------------
function gnomeSprite(blink, talk, gray) {
  return cached(`gnome|${blink}|${talk}|${gray}`, () => {
    const p = spr(24, 36, 12, 34, (R, P) => {
      const hat = '#cc2a2e', hatS = '#8c1418', hatL = '#ee5050', bd = '#f4f4f4', bdS = '#c4c4cc';
      const co = '#2c58b8', coS = '#1a3478', sk = '#f2b890', skS = '#d08a64', bt = '#5a3418';
      R(-5, -2, 4, 2, bt); R(1, -2, 4, 2, bt);
      R(-5, -12, 10, 10, co); R(2, -12, 3, 10, coS);
      R(-5, -6, 10, 1, '#3a2410'); P(0, -6, '#ecc040');
      R(-7, -11, 2, 6, co); R(5, -11, 2, 6, coS); R(-7, -5, 2, 2, sk); R(5, -5, 2, 2, skS);
      R(-3, -17, 6, 5, sk);
      R(-1, -15, 2, 2, '#e88070');
      if (blink) R(-3, -16, 6, 1, skS);
      else { P(-2, -16, '#101018'); P(2, -16, '#101018'); }
      R(-3, -17, 2, 1, '#e0e0e0'); R(2, -17, 2, 1, '#e0e0e0');
      R(-4, -13, 8, 3, bd); R(-3, -10, 6, 2, bd); R(-2, -8, 4, 2, bd); P(0, -6, bd);
      R(2, -12, 2, 3, bdS); P(1, -8, bdS);
      if (talk) R(-1, -13, 3, 1, '#702020');
      for (let i = 0; i < 13; i++) {
        const hw = Math.max(0, Math.round(4 - i * 0.33));
        const cx = Math.round((i * i) / 40);
        R(-hw + cx, -18 - i, hw * 2 + 1, 1, hat);
        P(-hw + cx, -18 - i, hatL);
        if (hw > 0) P(hw + cx, -18 - i, hatS);
      }
      R(-5, -18, 10, 1, hatS);
    });
    p.outline(OUT);
    if (gray) p.gray(true);
    return p.canvas();
  });
}

// ---------------- Grimbart als Zauberer ----------------
function wizardSprite(blink, talk, cast) {
  return cached(`wiz|${blink}|${talk}|${cast}`, () => {
    const p = spr(40, 70, 18, 68, (R, P, pp, ox, oy) => {
      const rb = '#b42630', rbS = '#7c141c', rbL = '#e04650', bd = '#f4f4f4', bdS = '#c4c4cc';
      const sk = '#f2b890', skS = '#d08a64', st = '#ffe048';
      // Robe (Trapez)
      pp.poly([[ox - 9, oy - 2], [ox + 10, oy - 2], [ox + 6, oy - 30], [ox - 6, oy - 30]], rb);
      pp.poly([[ox + 3, oy - 2], [ox + 10, oy - 2], [ox + 6, oy - 30], [ox + 3, oy - 30]], rbS);
      R(-6, -30, 1, 28, rbL);
      R(-9, -2, 19, 1, rbS);
      P(-3, -20, st); P(4, -12, st); P(-5, -8, st); P(2, -25, st);
      // Arme / Stab
      R(-9, -29, 3, 12, rb); R(-9, -17, 3, 2, sk);
      if (cast) { R(7, -38, 3, 10, rb); R(7, -40, 3, 2, sk); R(11, -60, 2, 58, '#7a5028'); pp.circle(ox + 12, oy - 62, 3, '#80f0ff'); }
      else { R(7, -29, 3, 12, rbS); R(7, -17, 3, 2, skS); R(11, -48, 2, 46, '#7a5028'); pp.circle(ox + 12, oy - 50, 2, '#80c0ff'); }
      // Kopf
      R(-4, -38, 8, 8, sk); R(2, -38, 2, 8, skS);
      R(-1, -35, 2, 3, '#e88070');
      if (blink) R(-3, -36, 6, 1, skS); else { P(-2, -36, '#101018'); P(2, -36, '#101018'); }
      R(-4, -37, 3, 1, bd); R(2, -37, 3, 1, bd);
      // Bart
      R(-5, -32, 10, 4, bd); R(-4, -28, 8, 6, bd); R(-3, -22, 6, 5, bd); R(-2, -17, 4, 3, bd); P(0, -14, bd);
      R(2, -30, 2, 12, bdS);
      if (talk) R(-1, -31, 3, 1, '#702020');
      // Hut
      R(-8, -39, 16, 2, rbS);
      for (let i = 0; i < 20; i++) {
        const hw = Math.max(0, Math.round(5 - i * 0.26));
        const cx = Math.round((i * i) / 60);
        R(-hw + cx, -40 - i, hw * 2 + 1, 1, rb); P(-hw + cx, -40 - i, rbL);
      }
      P(-1, -44, st); P(2, -50, st);
    });
    p.outline(OUT);
    return p.canvas();
  });
}

// ---------------- Elster ----------------
function magpieSprite(f) {
  return cached(`magpie|${f}`, () => {
    const p = spr(16, 12, 6, 10, (R, P) => {
      R(-3, -6, 7, 4, '#181820'); R(-1, -4, 4, 2, '#f0f0f0');
      R(3, -8, 3, 3, '#181820'); P(5, -7, '#f0f0f0'); P(6, -7, '#303030');
      R(-7, -5 + (f ? 1 : 0), 4, 1, '#2040a0'); R(-8, -4 + (f ? 1 : 0), 3, 1, '#181820');
      P(0, -2, '#404040'); P(2, -2, '#404040');
    });
    return p.canvas();
  });
}

// ---------------- Krämerin Frau Feilscher (hinter dem Tresen) ----------------
function shopkeeperSprite(blink, talk) {
  return cached(`shop|${blink}|${talk}`, () => {
    const p = spr(30, 34, 15, 32, (R, P, pp, ox, oy) => {
      const sc = '#c82838', scS = '#901828', sk = '#f4c4a0', skS = '#d89878', dr = '#3c8a5c', drS = '#28603e', ap = '#f0ece0';
      R(-8, -14, 16, 14, dr); R(4, -14, 4, 14, drS); R(-4, -12, 8, 12, ap);
      R(-10, -13, 3, 9, dr); R(7, -13, 3, 9, drS); R(-10, -4, 3, 2, sk); R(7, -4, 3, 2, skS);
      R(-5, -24, 10, 10, sk); R(3, -24, 2, 10, skS);
      if (blink) { R(-3, -20, 2, 1, skS); R(1, -20, 2, 1, skS); }
      else { P(-2, -20, '#201818'); P(2, -20, '#201818'); }
      P(-3, -18, '#f09090'); P(3, -18, '#f09090');
      R(-1, -16, 3, talk ? 2 : 1, '#902828');
      // Kopftuch mit Punkten
      R(-6, -27, 12, 4, sc); R(-6, -23, 2, 6, sc); R(4, -23, 2, 6, scS);
      P(-4, -26, '#ffffff'); P(0, -25, '#ffffff'); P(3, -26, '#ffffff'); P(-5, -21, '#ffffff'); P(5, -20, '#ffffff');
      R(-7, -24, 14, 1, scS);
    });
    p.outline(OUT);
    return p.canvas();
  });
}

// ---------------- Huhn Berta ----------------
function chickenSprite(f, dir) {
  return cached(`chick|${f}|${dir}`, () => {
    const p = spr(18, 16, 9, 14, (R, P) => {
      const w = '#f8f8f0', wS = '#c8c8c0';
      const peck = f === 1;
      R(-5, -8, 9, 6, w); R(-5, -4, 9, 2, wS); R(-6, -9, 3, 3, w); P(-7, -10, wS);
      if (peck) { R(3, -6, 3, 3, w); P(6, -5, '#f0a020'); P(4, -7, '#e02020'); P(4, -5, '#101010'); }
      else { R(3, -11, 3, 4, w); P(6, -9, '#f0a020'); R(3, -12, 2, 1, '#e02020'); P(5, -10, '#101010'); P(4, -7, '#e02020'); }
      R(-2, -2, 1, 2, '#e0a020'); R(1, -2, 1, 2, '#e0a020');
      R(-3, -7, 4, 1, wS);
    });
    p.outline(OUT);
    return p.canvas();
  });
}

// ---------------- Wirt Bruno ----------------
function innkeeperSprite(blink, talk, wipe) {
  return cached(`inn|${blink}|${talk}|${wipe}`, () => {
    const p = spr(36, 40, 18, 38, (R, P) => {
      const sk = '#eab48c', skS = '#c88a64', sh = '#f0f0f0', shS = '#c0c0c8', vs = '#8c2a20', mu = '#6a3818';
      R(-11, -18, 22, 18, sh); R(-7, -18, 14, 18, vs); R(-1, -18, 2, 18, sh); R(5, -18, 2, 18, '#6a1c14');
      // Arme
      R(-14, -17, 4, 12, sh); R(10, -17, 4, 12, shS);
      R(-14 + (wipe ? 2 : 0), -6, 5, 4, sk);
      R(10, -6, 5, 4, skS);
      // Krug in der Hand
      R(-16 + (wipe ? 2 : 0), -10, 5, 6, '#b8b8c8'); R(-16 + (wipe ? 2 : 0), -10, 5, 1, '#ffffff');
      // Kopf
      R(-6, -31, 12, 13, sk); R(3, -31, 3, 13, skS); P(-7, -25, sk); P(6, -25, skS);
      R(-5, -32, 10, 1, sk);
      if (blink) { R(-4, -27, 2, 1, skS); R(2, -27, 2, 1, skS); }
      else { P(-3, -27, '#201010'); P(3, -27, '#201010'); }
      R(-4, -29, 3, 1, mu); R(2, -29, 3, 1, mu);
      R(-1, -26, 2, 3, skS);
      R(-6, -23, 12, 2, mu); P(-7, -22, mu); P(6, -22, mu); P(-7, -21, mu); P(6, -21, mu);
      R(-2, -21, 4, talk ? 2 : 1, '#702020');
      P(-3, -31, '#fff0e0'); P(-2, -31, '#fff0e0');
    });
    p.outline(OUT);
    return p.canvas();
  });
}

// ---------------- Zwerg Gorm (schläft am Tisch) ----------------
function dwarfSprite(breath, cut, awake) {
  return cached(`dwarf|${breath}|${cut}|${awake}`, () => {
    const p = spr(48, 36, 24, 34, (R, P, pp, ox, oy) => {
      const sk = '#e4a882', skS = '#c0805e', bd = '#b84a1c', bdS = '#80300c', bdL = '#e07038', hl = '#8a8a98', hlS = '#5a5a68', tu = '#5a7a3a', tuS = '#3a5424';
      const b = breath ? -1 : 0;
      // Körper / Tunika (sitzend, nach vorn gebeugt)
      R(6, -22 + b, 14, 20, tu); R(16, -22 + b, 4, 20, tuS);
      R(6, -3, 14, 3, '#4a3018');
      // Arme auf dem Tisch
      R(-12, -14, 20, 5, tu); R(-12, -10, 20, 1, tuS); R(-14, -14, 4, 5, sk);
      if (awake) {
        R(-2, -30, 12, 10, sk);
        P(0, -26, '#101010'); P(5, -26, '#101010');
        R(-1, -28, 3, 1, bdS); R(4, -28, 3, 1, bdS);
      } else {
        // Kopf auf den Armen
        R(-4, -22 + b, 12, 9, sk); R(4, -22 + b, 4, 9, skS);
        R(-2, -18 + b, 3, 1, skS); R(3, -18 + b, 3, 1, skS);
        R(-6, -17 + b, 3, 3, '#e08070');
      }
      // Helm mit Hörnern
      const hy = awake ? -31 : -23 + b;
      R(-4, hy - 4, 12, 4, hl); R(-4, hy - 1, 12, 1, hlS); R(1, hy - 6, 3, 2, hl);
      P(-5, hy - 4, '#f0e8d0'); P(-6, hy - 5, '#f0e8d0'); P(-7, hy - 7, '#f0e8d0');
      P(8, hy - 4, '#f0e8d0'); P(9, hy - 5, '#f0e8d0'); P(10, hy - 7, '#f0e8d0');
      // Bart über die Tischkante
      if (awake) {
        R(-3, -21, 14, 6, bd); R(-2, -15, 12, 8, bd); R(-1, -7, 10, 5, bd); R(1, -2, 6, 2, bd);
      } else {
        R(-10, -13, 14, 5, bd); R(-12, -8, 14, 6, bd); R(-11, -2, 10, 2, bd);
        R(-12, -8, 2, 6, bdS); R(-8, -11, 2, 8, bdL); R(-4, -10, 1, 9, bdS);
        if (cut) R(-11, -4, 4, 2, '#00000000');
      }
      if (cut && !awake) { R(-11, -4, 4, 2, tu); P(-11, -3, bdS); }
    });
    p.outline(OUT);
    return p.canvas();
  });
}

// ---------------- Hexe Walpurga ----------------
function witchSprite(blink, talk, stir) {
  return cached(`witch|${blink}|${talk}|${stir}`, () => {
    const p = spr(44, 72, 20, 70, (R, P, pp, ox, oy) => {
      const dr = '#6a2c8c', drS = '#44185c', drL = '#8c48b0', sk = '#a8c890', skS = '#7c9c68', hr = '#b8b8c0', ht = '#1c1824', htL = '#3c3448';
      pp.poly([[ox - 9, oy - 1], [ox + 9, oy - 1], [ox + 6, oy - 30], [ox - 6, oy - 30]], dr);
      pp.poly([[ox + 3, oy - 1], [ox + 9, oy - 1], [ox + 6, oy - 30], [ox + 3, oy - 30]], drS);
      R(-6, -30, 1, 28, drL);
      R(-6, -18, 12, 2, '#2a1030'); P(0, -18, '#c0a030');
      R(-5, -1, 3, 1, '#101010'); R(3, -1, 3, 1, '#101010');
      // Arme + Löffel
      const sx = stir === 1 ? 3 : stir === 2 ? -1 : 1;
      R(-9, -29, 3, 10, dr); R(-9, -19, 3, 2, sk);
      R(6, -29, 3, 6, drS); R(8 + sx, -24, 6, 3, drS); R(13 + sx, -24, 2, 3, sk);
      if (stir !== undefined && stir !== null && stir !== -1) { R(14 + sx, -34, 2, 30, '#8a6030'); R(13 + sx, -6, 4, 4, '#8a6030'); }
      // Kopf
      R(-4, -38, 8, 8, sk); R(2, -38, 2, 8, skS);
      R(4, -35, 3, 1, sk); R(5, -34, 3, 1, sk); R(7, -33, 1, 2, skS); P(5, -35, '#5a7a3a');
      if (blink) R(-2, -36, 5, 1, skS); else { P(-1, -36, '#d02020'); P(2, -36, '#d02020'); }
      R(-1, -32, 4, talk ? 2 : 1, '#3a2030');
      R(-5, -37, 2, 12, hr); R(3, -38, 2, 6, hr); R(-6, -30, 1, 6, hr);
      // Hut mit Knick
      R(-10, -39, 20, 2, ht); R(-9, -39, 18, 1, htL);
      for (let i = 0; i < 18; i++) {
        const hw = Math.max(0, Math.round(5 - i * 0.3));
        const cx = i < 10 ? 0 : (i - 10);
        R(-hw - cx, -40 - i, hw * 2 + 1, 1, ht); P(-hw - cx, -40 - i, htL);
      }
      R(-5, -41, 10, 1, '#6a2c8c');
    });
    p.outline(OUT);
    return p.canvas();
  });
}

// ---------------- Kater Mephisto ----------------
function catSprite(f, blink) {
  return cached(`cat|${f}|${blink}`, () => {
    const p = spr(24, 20, 10, 18, (R, P) => {
      const c = '#1c1a24', cL = '#363244';
      R(-5, -8, 9, 8, c); R(-4, -14, 7, 6, c); P(-4, -15, c); P(2, -15, c); P(-4, -16, c); P(2, -16, c);
      R(-3, -8, 1, 7, cL);
      if (blink) { R(-3, -11, 2, 1, '#806020'); R(1, -11, 2, 1, '#806020'); }
      else { R(-3, -12, 2, 2, '#f0d020'); R(1, -12, 2, 2, '#f0d020'); P(-2, -12, '#101010'); P(2, -12, '#101010'); }
      P(0, -10, '#d07080');
      const t = [[5, -2], [7, -4], [8, -7], [8, -10]];
      const t2 = [[5, -2], [7, -3], [9, -5], [10, -8]];
      for (const q of (f ? t2 : t)) R(q[0], q[1], 2, 2, c);
    });
    p.outline('#504860');
    return p.canvas();
  });
}

// ---------------- Troll Knorz ----------------
function trollSprite(f, talk, laugh) {
  return cached(`troll|${f}|${talk}|${laugh}`, () => {
    const p = spr(56, 76, 28, 74, (R, P, pp, ox, oy) => {
      const sk = '#7a9468', skS = '#566c48', skL = '#9cb488', lc = '#7a5430', lcS = '#56381c';
      const sh = laugh ? (f ? 1 : -1) : 0;
      // Beine
      R(-11, -16, 8, 15, sk); R(4, -16, 8, 15, skS);
      R(-13, -3, 11, 3, skS); R(3, -3, 11, 3, skS);
      // Bauch
      pp.ellipse(ox + sh, oy - 30, 17, 16, sk);
      pp.ellipse(ox + 5 + sh, oy - 30, 10, 14, skS);
      pp.ellipse(ox - 4 + sh, oy - 30, 8, 10, skL);
      R(-15 + sh, -20, 30, 7, lc); R(-15 + sh, -14, 30, 2, lcS); R(-6 + sh, -18, 4, 4, lcS);
      // Arme
      R(-22 + sh, -42, 7, 22, sk); R(15 + sh, -42, 7, 22, skS);
      R(-23 + sh, -21, 9, 6, skL); R(15 + sh, -21, 9, 6, sk);
      // Kopf
      const hy = laugh ? -2 : 0;
      R(-9 + sh, -58 + hy, 18, 14, sk); R(4 + sh, -58 + hy, 5, 14, skS);
      R(-10 + sh, -54 + hy, 2, 4, skS); R(8 + sh, -54 + hy, 2, 4, skS);
      R(-3 + sh, -53 + hy, 6, 5, skL); R(-2 + sh, -50 + hy, 4, 2, skS); // Knollennase
      if (laugh) {
        R(-5 + sh, -55 + hy, 3, 1, '#202018'); R(2 + sh, -55 + hy, 3, 1, '#202018');
        R(-6 + sh, -48 + hy, 12, 5, '#3a1010'); R(-5 + sh, -48 + hy, 10, 1, '#f0f0d0'); P(-6 + sh, -49 + hy, '#f0f0d0'); P(5 + sh, -49 + hy, '#f0f0d0');
        P(-7 + sh, -54 + hy, '#80c0ff'); P(6 + sh, -54 + hy, '#80c0ff');
      } else {
        P(-4 + sh, -55, '#f0e020'); P(3 + sh, -55, '#f0e020'); R(-5 + sh, -57, 3, 1, skS); R(2 + sh, -57, 3, 1, skS);
        R(-5 + sh, -47, 10, talk ? 3 : 1, '#3a1010');
        P(-5 + sh, -48, '#f0f0d0'); P(4 + sh, -48, '#f0f0d0');
      }
      // Moos-Haare
      R(-8 + sh, -60 + hy, 16, 2, '#4c6a2c'); P(-6 + sh, -61 + hy, '#4c6a2c'); P(0 + sh, -62 + hy, '#4c6a2c'); P(5 + sh, -61 + hy, '#4c6a2c');
    });
    p.outline(OUT);
    return p.canvas();
  });
}

// ---------------- Froschprinz Quentin ----------------
function frogSprite(f, talk) {
  return cached(`frog|${f}|${talk}`, () => {
    const p = spr(20, 16, 10, 14, (R, P) => {
      const g = '#48a038', gS = '#2c6c20', gL = '#78c858';
      R(-6, -6, 12, 6, g); R(-6, -2, 12, 2, gS); R(-4, -6, 8, 2, gL);
      R(-5, -9, 4, 3, g); R(1, -9, 4, 3, g);
      P(-4, -8, '#ffffff'); P(-3, -8, '#101010'); P(2, -8, '#ffffff'); P(3, -8, '#101010');
      R(-3, -4, 6, talk ? 2 : 1, '#802020');
      if (f) { R(-8, -2, 3, 2, gS); R(5, -2, 3, 2, gS); }
      else { R(-7, -1, 2, 1, gS); R(5, -1, 2, 1, gS); }
      // Krönchen
      R(-2, -12, 5, 2, '#f0c030'); P(-2, -13, '#f0c030'); P(0, -13, '#f0c030'); P(2, -13, '#f0c030'); P(0, -12, '#e03030');
    });
    p.outline(OUT);
    return p.canvas();
  });
}

// ---------------- Wasserspeier Fratz ----------------
function gargoyleSprite(talk, glow) {
  return cached(`garg|${talk}|${glow}`, () => {
    const p = spr(44, 40, 22, 38, (R, P, pp, ox, oy) => {
      const s = '#8a8a90', sS = '#5c5c64', sL = '#b0b0b8';
      // Flügel
      pp.poly([[ox - 6, oy - 26], [ox - 20, oy - 34], [ox - 18, oy - 20], [ox - 14, oy - 22], [ox - 10, oy - 14]], sS);
      pp.poly([[ox + 6, oy - 26], [ox + 20, oy - 34], [ox + 18, oy - 20], [ox + 14, oy - 22], [ox + 10, oy - 14]], sS);
      // Körper (hockend)
      pp.ellipse(ox, oy - 12, 9, 10, s);
      R(-9, -4, 6, 4, s); R(3, -4, 6, 4, sS);
      R(-10, -1, 4, 1, sL); R(6, -1, 4, 1, sL);
      // Kopf
      R(-6, -30, 12, 10, s); R(2, -30, 4, 10, sS); R(-6, -30, 12, 1, sL);
      P(-6, -32, sL); P(-7, -33, sL); P(5, -32, sL); P(6, -33, sL); // Hörner
      const ey = glow ? '#ff3020' : '#3a3a40';
      R(-4, -27, 2, 2, ey); R(2, -27, 2, 2, ey);
      R(-2, -24, 4, 2, sS);
      R(-4, -22, 8, talk ? 3 : 1, '#2a2a30');
      if (talk) { P(-3, -22, '#e0e0e0'); P(2, -22, '#e0e0e0'); }
      R(-5, -10, 3, 7, sL);
    });
    p.outline('#2a2a30');
    return p.canvas();
  });
}

// ---------------- Morbus Muffelgrau ----------------
function morbusSprite(blink, talk, cast, f) {
  return cached(`morbus|${blink}|${talk}|${cast}|${f}`, () => {
    const p = spr(48, 80, 22, 78, (R, P, pp, ox, oy) => {
      const rb = '#5a5a64', rbS = '#3a3a42', rbL = '#7c7c88', sk = '#c8c8c0', skS = '#9c9c94', bd = '#9a9aa0';
      pp.poly([[ox - 9, oy - 1], [ox + 9, oy - 1], [ox + 5, oy - 36], [ox - 5, oy - 36]], rb);
      pp.poly([[ox + 2, oy - 1], [ox + 9, oy - 1], [ox + 5, oy - 36], [ox + 2, oy - 36]], rbS);
      R(-5, -36, 1, 34, rbL);
      // Kragen
      R(-8, -38, 16, 3, rbS); P(-9, -40, rbS); P(8, -40, rbS);
      // Arme + Stab
      R(-8, -35, 3, 14, rb); R(-8, -21, 3, 2, sk);
      if (cast) {
        R(5, -46, 3, 12, rb); R(5, -48, 3, 2, sk);
        R(9, -70, 2, 68, '#2a2a30');
        const g = f ? '#e0e0ff' : '#a0a0c0';
        pp.circle(ox + 10, oy - 72, 4, g); pp.circle(ox + 10, oy - 72, 2, '#ffffff');
      } else {
        R(5, -35, 3, 14, rbS); R(5, -21, 3, 2, skS);
        R(9, -58, 2, 56, '#2a2a30'); pp.circle(ox + 10, oy - 60, 3, '#7a7a90');
      }
      // Kopf
      R(-4, -46, 8, 9, sk); R(2, -46, 2, 9, skS);
      R(-1, -43, 2, 3, skS);
      if (blink) R(-3, -44, 6, 1, skS);
      else { P(-2, -44, '#101010'); P(2, -44, '#101010'); }
      pp.ring(ox + 2, oy - 44, 1.6, '#e0e0e0'); // Monokel
      R(-4, -46, 3, 1, '#404048'); R(2, -46, 3, 1, '#404048');
      // Spitzbart
      R(-3, -39, 6, 3, bd); R(-2, -36, 4, 3, bd); P(0, -33, bd);
      R(-2, -40, 4, talk ? 2 : 1, '#2a1a1a');
      // Hoher krummer Hut
      R(-7, -47, 14, 2, '#2a2a30');
      for (let i = 0; i < 22; i++) {
        const hw = Math.max(0, Math.round(4 - i * 0.15));
        const cx = -Math.round(Math.sin(i / 7) * 3);
        R(-hw + cx, -48 - i, hw * 2 + 1, 1, '#3a3a42'); P(-hw + cx, -48 - i, '#5a5a64');
      }
    });
    p.outline(OUT);
    return p.canvas();
  });
}

// ---------------- Inventar-Symbole (28x20) ----------------
const ICONS = {
  handy(p) {
    p.rect(10, 2, 9, 16, '#202028'); p.rect(11, 3, 7, 12, '#4070c0'); p.rect(11, 3, 7, 2, '#80b0f0');
    p.rect(13, 16, 3, 1, '#606070'); p.set(17, 4, '#ffffff');
  },
  schluessel(p) {
    p.ring(8, 10, 4, '#e0b030'); p.ring(8, 10, 3, '#c09020'); p.rect(12, 9, 12, 2, '#e0b030');
    p.rect(19, 11, 2, 3, '#e0b030'); p.rect(22, 11, 2, 4, '#e0b030'); p.set(7, 8, '#fff0a0');
  },
  buch(p) {
    p.rect(5, 3, 18, 15, '#5a1c6c'); p.rect(5, 3, 2, 15, '#3a0c4c'); p.rect(7, 16, 16, 2, '#f0e8d0');
    p.rect(11, 6, 8, 6, '#e0b030'); p.rect(12, 7, 6, 4, '#5a1c6c'); p.set(14, 8, '#ffe060'); p.set(15, 9, '#ffe060');
  },
  stock(p) { p.thick(4, 16, 24, 4, 2, '#8a5a2c'); p.line(4, 17, 24, 5, '#5a3818'); p.set(14, 9, '#5a3818'); p.line(16, 8, 18, 4, '#8a5a2c'); },
  taler(p) {
    p.circle(14, 10, 7, '#e8b828'); p.circle(14, 10, 5, '#f8d048'); p.rect(13, 6, 2, 8, '#c09018'); p.set(11, 7, '#ffffff'); p.ring(14, 10, 7, '#a07810');
  },
  schere(p) {
    p.ring(7, 14, 3, '#d03030'); p.ring(13, 15, 3, '#d03030');
    p.line(8, 11, 22, 3, '#c0c0d0'); p.line(12, 12, 23, 6, '#c0c0d0'); p.line(9, 11, 22, 4, '#ffffff'); p.set(11, 11, '#404040');
  },
  brot(p) {
    p.ellipse(14, 11, 10, 6, '#c8843c'); p.ellipse(14, 10, 9, 4, '#e0a050');
    p.line(9, 8, 11, 12, '#a06020'); p.line(14, 7, 16, 12, '#a06020'); p.line(19, 8, 21, 12, '#a06020');
    p.set(6, 12, '#806040');
  },
  feder(p) {
    p.line(5, 18, 22, 2, '#a0a0a0');
    for (let i = 0; i < 12; i++) { p.line(8 + i, 15 - i, 6 + i, 11 - i, '#f8f8f0'); p.line(10 + i, 15 - i, 13 + i, 16 - i, '#e8e8e0'); }
  },
  eimer(p) {
    p.poly([[7, 6], [21, 6], [19, 18], [9, 18]], '#8a8a96'); p.rect(7, 6, 14, 2, '#b0b0bc'); p.rect(9, 11, 11, 1, '#606070');
    p.ring(14, 6, 6, '#505060'); p.rect(8, 6, 13, 3, '#8a8a96'); p.rect(7, 6, 14, 1, '#c8c8d4');
    p.set(16, 14, '#a05020'); p.set(11, 15, '#a05020');
  },
  wasser(p) {
    ICONS.eimer(p); p.rect(8, 6, 12, 2, '#60c8f0'); p.set(10, 6, '#ffffff'); p.set(17, 7, '#ffffff');
    p.set(13, 3, '#a0e8ff'); p.set(15, 1, '#a0e8ff'); p.set(11, 2, '#ffffff');
  },
  flasche(p) {
    p.rect(11, 2, 5, 4, '#70a888'); p.rect(10, 1, 7, 1, '#a07040'); p.rect(8, 6, 11, 12, '#70a888'); p.rect(9, 7, 2, 9, '#c0f0d8');
    p.rect(8, 17, 11, 1, '#4a7860');
  },
  kichern(p) {
    ICONS.flasche(p); p.rect(10, 2, 7, 3, '#a07040');
    p.rect(11, 9, 6, 6, '#f0e060'); p.set(12, 10, '#ffffff'); p.set(15, 12, '#ffffff');
    p.set(5, 4, '#f0e060'); p.set(22, 3, '#f0e060'); p.set(20, 8, '#ffffff'); p.set(4, 9, '#ffffff');
  },
  barthaar(p) {
    for (let i = 0; i < 4; i++) p.line(5 + i, 4 + i * 2, 23 - i, 12 + i, i % 2 ? '#b84a1c' : '#e07038');
    p.rect(12, 8, 3, 6, '#3060c0'); p.rect(12, 8, 3, 1, '#80a0f0');
  },
  trank(p) {
    p.rect(12, 1, 4, 5, '#c0e0f0'); p.rect(11, 0, 6, 2, '#a07040');
    p.circle(14, 12, 7, '#c0e0f0'); p.circle(14, 13, 6, '#ff50c0'); p.rect(9, 10, 10, 2, '#ff90e0');
    p.set(11, 14, '#ffffff'); p.set(16, 12, '#ffffff'); p.set(5, 4, '#ffe060'); p.set(23, 6, '#ffe060');
  },
  spiegel(p) {
    p.ellipse(12, 8, 7, 7, '#c8a040'); p.ellipse(12, 8, 5, 5, '#b8d8f0'); p.line(9, 6, 11, 4, '#ffffff'); p.line(9, 9, 13, 5, '#ffffff');
    p.thick(17, 13, 23, 19, 2, '#8a5a2c');
  },
};
function iconCanvas(id) {
  return cached('icon|' + id, () => {
    const p = new Pix(28, 20);
    (ICONS[id] || ICONS.handy)(p);
    p.outline('#0c0810');
    return p.canvas();
  });
}
