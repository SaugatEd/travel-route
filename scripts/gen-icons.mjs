// Generates maskable PWA icons (public/icon-192.png, icon-512.png) with no
// external deps — a minimal RGBA→PNG encoder draws the Jamnata mountains mark.
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const BRAND = [79, 157, 209, 255];
const WHITE = [250, 249, 247, 255];

// Mountains + base, in the favicon's 0..100 viewBox.
const TRIS = [
  [[16, 64], [44, 64], [30, 30]],
  [[34, 64], [70, 64], [52, 20]],
  [[60, 64], [86, 64], [73, 34]],
];
const BASE_RECT = { x0: 16, y0: 60, x1: 84, y1: 82 };

function sign(ax, ay, bx, by, cx, cy) {
  return (ax - cx) * (by - cy) - (bx - cx) * (ay - cy);
}
function inTri(px, py, t) {
  const [[ax, ay], [bx, by], [cx, cy]] = t;
  const d1 = sign(px, py, ax, ay, bx, by);
  const d2 = sign(px, py, bx, by, cx, cy);
  const d3 = sign(px, py, cx, cy, ax, ay);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (~c) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function makePng(size) {
  const pad = size * 0.14;
  const span = size - 2 * pad;
  const raw = Buffer.alloc(size * (size * 4 + 1));
  let o = 0;
  for (let y = 0; y < size; y++) {
    raw[o++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const vx = ((x - pad) / span) * 100;
      const vy = ((y - pad) / span) * 100;
      const onBase = vx >= BASE_RECT.x0 && vx <= BASE_RECT.x1 && vy >= BASE_RECT.y0 && vy <= BASE_RECT.y1;
      const white = onBase || TRIS.some((t) => inTri(vx, vy, t));
      const [r, g, b, a] = white ? WHITE : BRAND;
      raw[o++] = r; raw[o++] = g; raw[o++] = b; raw[o++] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // colour type: RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const size of [192, 512]) {
  writeFileSync(new URL(`../public/icon-${size}.png`, import.meta.url), makePng(size));
  console.log(`public/icon-${size}.png`);
}
