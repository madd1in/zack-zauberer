'use strict';
// Erzeugt die PWA-Icons (icons/*.png) ohne Abhängigkeiten: Pixel-Zeichenkunst
// in RGBA-Puffer zeichnen und als PNG kodieren (zlib ist in Node eingebaut).
// Aufruf: node tools/make-icons.js
const fs = require('fs'), path = require('path'), zlib = require('zlib');

// 16x16-Zauberhut (Zacks Hut): D=Umriss, P=Hut, p=dunkles Purpur, B=Goldband, S=Goldstern
const ART = [
  '................',
  '.......DD.......',
  '.......PP.......',
  '......DPPD......',
  '......DPpD......',
  '.....DPPpPD.....',
  '.....DPppPD.....',
  '....DPPSSPPD....',
  '...DPPSSSSPPD...',
  '...DPPPSSPPPD...',
  '..DpPPPPPPPPpD..',
  '..DpBBBBBBBBpD..',
  '.DDppppppppppDD.',
  'DPPPPPPPPPPPPPPD',
  'DDDDDDDDDDDDDDDD',
  '................',
];
const PAL = {
  D: [26, 16, 38, 255],     // fast schwarz-violett
  P: [110, 60, 170, 255],   // Hut purpur
  p: [76, 44, 108, 255],    // Schatten purpur
  B: [255, 208, 64, 255],   // Gold
  S: [255, 224, 96, 255],   // helleres Gold
};

function crc32(buf) {
  let c, table = crc32.table;
  if (!table) {
    table = crc32.table = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c >>> 0;
    }
  }
  c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function png(size, draw) {
  const raw = Buffer.alloc(size * (size * 4 + 1), 0);
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1) + 1;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = draw(x, y);
      raw[row + x * 4] = r; raw[row + x * 4 + 1] = g; raw[row + x * 4 + 2] = b; raw[row + x * 4 + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;                     // 8 Bit, RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Pixelart auf Zielgröße skalieren; pad = Anteil Rand (für maskable: sichere Zone)
function makeIcon(size, pad, opaqueBg) {
  const n = ART.length;
  const inner = Math.round(size * (1 - pad));
  const off = Math.floor((size - inner) / 2);
  return png(size, (x, y) => {
    const gx = Math.floor((x - off) / inner * n), gy = Math.floor((y - off) / inner * n);
    if (gx < 0 || gy < 0 || gx >= n || gy >= n) return opaqueBg || [0, 0, 0, 0];
    const ch = ART[gy][gx];
    return (ch === '.' || !PAL[ch]) ? (opaqueBg || [0, 0, 0, 0]) : PAL[ch];
  });
}

const dir = path.join(__dirname, '..', 'icons');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'icon-192.png'), makeIcon(192, 0.06));
fs.writeFileSync(path.join(dir, 'icon-512.png'), makeIcon(512, 0.06));
fs.writeFileSync(path.join(dir, 'icon-maskable-512.png'), makeIcon(512, 0.22, [7, 4, 14, 255]));
fs.writeFileSync(path.join(dir, 'apple-touch-icon.png'), makeIcon(180, 0.06, [7, 4, 14, 255]));
console.log('Icons erzeugt in', dir);
