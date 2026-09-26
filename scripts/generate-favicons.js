/**
 * Generates every favicon / app icon from the logo mark.
 *
 * The mark sits in black on a white tile with generous padding, so it keeps
 * strong contrast on light, dark and tinted browser chrome alike: on a light
 * tab bar it reads as a plain black mark, on a dark one as a white tile.
 *
 * Run: node scripts/generate-favicons.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const appDir = path.join(__dirname, '..', 'src', 'app');

const TILE = '#FFFFFF';
const MARK = '#000000';

// Logo mark v2 — potrace path in a 400x400 box (bbox ≈ 61..339, centered).
const MARK_PATH =
  'M622 3258 l3 -123 150 -6 c83 -3 180 -13 216 -22 217 -53 381 -142 534 -288 177 -170 273 -339 329 -579 12 -52 20 -102 19 -110 -3 -11 -33 -20 -106 -32 -133 -22 -267 -67 -398 -135 -137 -70 -253 -158 -365 -275 -144 -151 -244 -317 -309 -511 -44 -133 -64 -250 -72 -421 l-6 -139 174 6 c151 4 189 9 289 35 211 55 387 145 555 284 133 111 259 268 334 416 l32 63 36 -68 c64 -121 135 -216 248 -329 167 -168 339 -273 557 -343 133 -42 259 -61 411 -61 l127 0 0 119 0 118 -137 6 c-201 8 -329 39 -492 119 -97 48 -215 133 -293 211 -100 100 -192 234 -242 354 -33 79 -72 213 -81 280 l-7 52 49 6 c100 13 262 58 365 102 207 86 424 257 564 442 79 105 185 315 219 436 37 127 55 261 55 399 l0 119 -152 -6 c-233 -10 -409 -53 -593 -148 -210 -107 -391 -267 -523 -461 -17 -25 -49 -78 -71 -118 l-38 -71 -41 73 c-127 230 -311 418 -537 547 -207 119 -451 181 -708 181 l-98 0 3 -122z m2504 -155 c-2 -10 -8 -38 -11 -63 -20 -128 -101 -316 -193 -445 -103 -145 -265 -282 -426 -360 -96 -47 -226 -88 -313 -100 -41 -5 -53 -4 -53 7 1 32 40 188 63 248 51 136 132 270 229 375 65 72 176 161 266 214 118 70 318 139 405 140 32 1 38 -2 33 -16z m-1281 -1388 c-32 -125 -114 -296 -194 -403 -110 -145 -257 -264 -424 -342 -87 -41 -220 -83 -301 -95 l-49 -7 8 59 c9 74 47 197 91 292 79 171 222 342 377 449 136 94 321 170 466 191 44 6 46 5 49 -19 1 -14 -9 -70 -23 -125z';
const MARK_BOX = 278; // visible extent of the mark inside its 400 box

/**
 * @param {object} o
 * @param {number} o.mark   share of the tile the visible mark spans (0–1)
 * @param {number} o.radius corner radius as a share of the tile (0 = square)
 */
function iconSvg({ mark, radius }) {
  const S = 512;
  const scale = (S * mark) / MARK_BOX;
  const offset = S / 2 - 200 * scale; // mark is centered at 200,200
  const r = S * radius;
  return `<svg width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${S}" height="${S}" rx="${r}" fill="${TILE}"/>
  <g transform="translate(${offset.toFixed(2)}, ${offset.toFixed(2)}) scale(${scale.toFixed(4)})">
    <g transform="translate(0,400) scale(0.1,-0.1)" fill="${MARK}" fill-rule="nonzero">
      <path d="${MARK_PATH}"/>
    </g>
  </g>
</svg>
`;
}

// Browser tab: rounded tile, mark at 56% so there is clear space on every
// edge while it stays legible at 16px.
const tabSvg = iconSvg({ mark: 0.56, radius: 0.22 });
const tinySvg = iconSvg({ mark: 0.56, radius: 0.2 });
// Home-screen / PWA "any": rounded tile.
const appSvg = iconSvg({ mark: 0.52, radius: 0.22 });
// iOS & maskable: full-bleed square (the OS applies its own mask);
// mark stays inside the 80% maskable safe zone.
const bleedSvg = iconSvg({ mark: 0.46, radius: 0 });

const png = (svg, size) =>
  sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png().toBuffer();

/** ICO container with embedded PNGs (supported by every current browser). */
function toIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

async function generateFavicons() {
  const write = (dir, name, data) => {
    fs.writeFileSync(path.join(dir, name), data);
    console.log(`Generated: ${path.relative(process.cwd(), path.join(dir, name))}`);
  };

  write(publicDir, 'favicon.svg', tabSvg);

  const ico16 = await png(tinySvg, 16);
  const ico32 = await png(tinySvg, 32);
  const ico48 = await png(tabSvg, 48);
  write(publicDir, 'favicon-16x16.png', ico16);
  write(publicDir, 'favicon-32x32.png', ico32);

  const ico = toIco([
    { size: 16, data: ico16 },
    { size: 32, data: ico32 },
    { size: 48, data: ico48 },
  ]);
  write(publicDir, 'favicon.ico', ico);
  write(appDir, 'favicon.ico', ico);

  write(publicDir, 'apple-touch-icon.png', await png(bleedSvg, 180));
  write(publicDir, 'android-chrome-192x192.png', await png(appSvg, 192));
  write(publicDir, 'android-chrome-512x512.png', await png(appSvg, 512));
  write(publicDir, 'maskable-512x512.png', await png(bleedSvg, 512));
  // Portal manifest icons
  write(publicDir, 'icon-192.png', await png(appSvg, 192));
  write(publicDir, 'icon-512.png', await png(appSvg, 512));

  console.log('\nAll favicons generated successfully!');
}

generateFavicons().catch((err) => {
  console.error(err);
  process.exit(1);
});
