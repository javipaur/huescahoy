import { deflateSync } from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appDir = path.join(root, "src", "app");
const iconsDir = path.join(root, "public", "icons");
fs.mkdirSync(iconsDir, { recursive: true });

const BG = [22, 163, 74]; // #16a34a
const FG = [255, 255, 255]; // white

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function inCircle(x, y, cx, cy, r) {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function inPin(x, y, s) {
  const headCx = s * 0.5;
  const headCy = s * 0.42;
  const headR = s * 0.15;
  if (inCircle(x, y, headCx, headCy, headR)) return true;
  const topY = s * 0.47;
  const left = s * 0.37;
  const right = s * 0.63;
  const bottom = s * 0.78;
  if (y < topY || y > bottom) return false;
  const t = (y - topY) / (bottom - topY);
  const half = left + t * (s * 0.5 - left);
  return x >= s * 0.5 - half && x <= s * 0.5 + half;
}

function render(size, scale) {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  const center = size / 2;
  const s = size * scale;
  const offset = (size - s) / 2;
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 3 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < size; x++) {
      const localX = x - offset;
      const localY = y - offset;
      const isFg = inPin(localX, localY, s);
      const idx = rowStart + 1 + x * 3;
      const [r, g, b] = isFg ? FG : BG;
      raw[idx] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
    }
  }
  return raw;
}

function png(size, scale) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = deflateSync(render(size, scale));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outputs = [
  { file: path.join(appDir, "icon.png"), size: 64, scale: 0.9 },
  { file: path.join(iconsDir, "icon-192.png"), size: 192, scale: 0.9 },
  { file: path.join(iconsDir, "icon-512.png"), size: 512, scale: 0.9 },
  { file: path.join(iconsDir, "maskable-512.png"), size: 512, scale: 0.7 },
  { file: path.join(iconsDir, "apple-touch-icon.png"), size: 180, scale: 0.9 },
];

for (const { file, size, scale } of outputs) {
  fs.writeFileSync(file, png(size, scale));
  console.log("generated", file, `${size}x${size}`);
}
