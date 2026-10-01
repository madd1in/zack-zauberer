'use strict';
// ---------------------------------------------------------------------------
// Pixel-Grafik: alles wird in einen RGBA-Puffer gezeichnet (keine Kantenglättung),
// damit die Szenen beim Hochskalieren knackig bleiben – wie 1993 auf VGA.
// ---------------------------------------------------------------------------

const PALCACHE = {};
function C(c) {
  if (Array.isArray(c) || typeof c === 'function') return c;
  let r = PALCACHE[c];
  if (r) return r;
  const h = c.replace('#', '');
  r = [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16), h.length > 6 ? parseInt(h.substr(6, 2), 16) : 255];
  PALCACHE[c] = r;
  return r;
}
function mix(a, b, t) {
  a = C(a); b = C(b);
  return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t), 255];
}
function hex(c) {
  c = C(c);
  return '#' + [c[0], c[1], c[2]].map(v => v.toString(16).padStart(2, '0')).join('');
}

const BAYER4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

function rng(seed) {
  let s = (seed >>> 0) || 1;
  return function () {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

// Füllmuster: Rasterung zwischen zwei Farben (level 0..16)
function dith(c1, c2, level) {
  c1 = C(c1); c2 = C(c2);
  return (x, y) => (BAYER4[y & 3][x & 3] < level ? c2 : c1);
}

class Pix {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.d = new Uint8ClampedArray(w * h * 4);
  }
  set(x, y, c) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    if (typeof c === 'function') { c = c(x, y); if (!c) return; }
    c = C(c);
    if (c[3] === 0) return;
    const i = (y * this.w + x) * 4;
    this.d[i] = c[0]; this.d[i + 1] = c[1]; this.d[i + 2] = c[2]; this.d[i + 3] = c[3];
  }
  get(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return [0, 0, 0, 0];
    const i = (y * this.w + x) * 4;
    return [this.d[i], this.d[i + 1], this.d[i + 2], this.d[i + 3]];
  }
  rect(x, y, w, h, c) {
    c = C(c);
    x = Math.round(x); y = Math.round(y);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  }
  // vertikaler Verlauf mit geordneter Rasterung
  vgrad(x, y, w, h, cols) {
    cols = cols.map(C);
    const n = cols.length;
    for (let j = 0; j < h; j++) {
      const t = h > 1 ? (j / (h - 1)) * (n - 1) : 0;
      const i0 = Math.min(n - 2, Math.floor(t));
      const f = t - i0;
      const lvl = f * 16;
      for (let i = 0; i < w; i++) {
        const X = x + i, Y = y + j;
        this.set(X, Y, BAYER4[Y & 3][X & 3] < lvl ? cols[i0 + 1] : cols[i0]);
      }
    }
  }
  hgrad(x, y, w, h, cols) {
    cols = cols.map(C);
    const n = cols.length;
    for (let i = 0; i < w; i++) {
      const t = w > 1 ? (i / (w - 1)) * (n - 1) : 0;
      const i0 = Math.min(n - 2, Math.floor(t));
      const lvl = (t - i0) * 16;
      for (let j = 0; j < h; j++) {
        const X = x + i, Y = y + j;
        this.set(X, Y, BAYER4[Y & 3][X & 3] < lvl ? cols[i0 + 1] : cols[i0]);
      }
    }
  }
  // Licht/Schatten: setzt col gerastert, lvl = Zahl oder fn(x,y)->0..16
  shade(x, y, w, h, col, lvl) {
    col = C(col);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const X = x + i, Y = y + j;
      const l = typeof lvl === 'function' ? lvl(X, Y) : lvl;
      if (BAYER4[Y & 3][X & 3] < l) this.set(X, Y, col);
    }
  }
  // Weiches Licht/Schatten: vorhandene Pixel Richtung col mischen, amt = Zahl oder fn(x,y)->0..1
  tint(x, y, w, h, col, amt) {
    col = C(col);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const X = x + i, Y = y + j;
      if (X < 0 || Y < 0 || X >= this.w || Y >= this.h) continue;
      const a = typeof amt === 'function' ? amt(X, Y) : amt;
      if (a <= 0) continue;
      const k = (Y * this.w + X) * 4, d = this.d;
      if (d[k + 3] === 0) continue;
      d[k] += (col[0] - d[k]) * a; d[k + 1] += (col[1] - d[k + 1]) * a; d[k + 2] += (col[2] - d[k + 2]) * a;
    }
  }
  polyTint(pts, col, a) {
    col = C(col);
    this.poly(pts, (x, y) => { const c = this.get(x, y); return [c[0] + (col[0] - c[0]) * a, c[1] + (col[1] - c[1]) * a, c[2] + (col[2] - c[2]) * a, 255]; });
  }
  // Polygon gerastert einfärben (für Lichtkegel etc.)
  polyShade(pts, col, lvl) {
    col = C(col);
    this.poly(pts, (x, y) => (BAYER4[y & 3][x & 3] < lvl ? col : null));
  }
  poly(pts, c) {
    c = C(c);
    let minY = Infinity, maxY = -Infinity;
    for (const p of pts) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
    minY = Math.floor(minY); maxY = Math.ceil(maxY);
    const n = pts.length;
    for (let y = minY; y <= maxY; y++) {
      const sy = y + 0.5;
      const xs = [];
      for (let i = 0; i < n; i++) {
        const a = pts[i], b = pts[(i + 1) % n];
        if ((a[1] <= sy && b[1] > sy) || (b[1] <= sy && a[1] > sy)) {
          xs.push(a[0] + (sy - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
        }
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const x0 = Math.ceil(xs[k] - 0.5), x1 = Math.floor(xs[k + 1] - 0.5);
        for (let x = x0; x <= x1; x++) this.set(x, y, c);
      }
    }
  }
  ellipse(cx, cy, rx, ry, c) {
    c = C(c);
    for (let y = -ry; y <= ry; y++) {
      const hw = rx * Math.sqrt(Math.max(0, 1 - (y * y) / ((ry + 0.5) * (ry + 0.5))));
      for (let x = Math.round(-hw); x <= Math.round(hw); x++) this.set(cx + x, cy + y, c);
    }
  }
  circle(cx, cy, r, c) { this.ellipse(cx, cy, r, r, c); }
  ring(cx, cy, r, c) {
    c = C(c);
    for (let a = 0; a < 360; a += 1) {
      const t = a * Math.PI / 180;
      this.set(Math.round(cx + Math.cos(t) * r), Math.round(cy + Math.sin(t) * r), c);
    }
  }
  line(x0, y0, x1, y1, c) {
    c = C(c);
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  thick(x0, y0, x1, y1, w, c) {
    c = C(c);
    const len = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= len; i++) {
      const t = i / len;
      const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      this.rect(Math.round(x - w / 2), Math.round(y - w / 2), w, w, c);
    }
  }
  noise(x, y, w, h, c, dens, seed) {
    c = C(c);
    const r = rng(seed || 7);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (r() < dens) this.set(x + i, y + j, c);
  }
  // unregelmäßiger Klumpen (Laub, Büsche, Wolken)
  blob(cx, cy, rx, ry, c, seed, n) {
    const r = rng(seed || 3);
    n = n || 9;
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, d = r() * 0.6;
      const px = cx + Math.cos(a) * rx * d, py = cy + Math.sin(a) * ry * d;
      const rr = (0.35 + r() * 0.45);
      this.ellipse(Math.round(px), Math.round(py), Math.round(rx * rr), Math.round(ry * rr), c);
    }
  }
  // Konturen um alle nicht-transparenten Pixel
  outline(c) {
    c = C(c);
    const w = this.w, h = this.h, src = new Uint8ClampedArray(this.d);
    const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && src[(y * w + x) * 4 + 3] > 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (op(x, y)) continue;
      if (op(x - 1, y) || op(x + 1, y) || op(x, y - 1) || op(x, y + 1)) this.set(x, y, c);
    }
  }
  map(fn) {
    for (let i = 0; i < this.d.length; i += 4) {
      if (this.d[i + 3] === 0) continue;
      const r = fn(this.d[i], this.d[i + 1], this.d[i + 2]);
      this.d[i] = r[0]; this.d[i + 1] = r[1]; this.d[i + 2] = r[2];
    }
  }
  gray(tint) {
    this.map((r, g, b) => {
      let v = Math.round(r * 0.3 + g * 0.55 + b * 0.15);
      v = Math.round(v * 0.85 + 20);
      return tint ? [v, v, Math.min(255, v + 8)] : [v, v, v];
    });
  }
  darken(f) { this.map((r, g, b) => [r * f, g * f, b * f]); }
  canvas() {
    const cv = document.createElement('canvas');
    cv.width = this.w; cv.height = this.h;
    const g = cv.getContext('2d');
    const img = g.createImageData(this.w, this.h);
    img.data.set(this.d);
    g.putImageData(img, 0, 0);
    return cv;
  }
}

// Sprite-Baukasten: Koordinaten relativ zu einem Ursprung (meist die Füße)
function spr(w, h, ox, oy, fn) {
  const p = new Pix(w, h);
  const R = (x, y, ww, hh, c) => p.rect(ox + x, oy + y, ww, hh, c);
  const P = (x, y, c) => p.set(ox + x, oy + y, c);
  fn(R, P, p, ox, oy);
  return p;
}

const SPRCACHE = new Map();
function cached(key, build) {
  let c = SPRCACHE.get(key);
  if (!c) { c = build(); SPRCACHE.set(key, c); }
  return c;
}

// Pixelschrift-freie Hilfen für dynamische Effekte direkt auf dem 2D-Kontext
function fr(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
