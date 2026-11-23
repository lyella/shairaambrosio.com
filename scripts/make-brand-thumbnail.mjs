// Build the project tile artwork for TrackAJob.
//
// Two shapes are produced because the two places it appears are opposites:
//
//   thumbnail.png       1200x880  (1.36) - projects listing, 16/10 container
//   thumbnail-tall.png    700x2006 (0.349) - homepage tile, measured at 1440px
//
// The tall tile is one grid column spanning two rows, a 0.349 column. A 16:9 UI
// screenshot cannot fill that: `cover` slices off the left half (turning "Applications"
// into "ations") and `contain` strands a thin strip in empty space. So the tall tile
// is BRAND ARTWORK in the same spirit as the Animations tile — a centred mark with
// generous negative space — rather than a squeezed screenshot.
//
// Run: node scripts/make-brand-thumbnail.mjs
import path from "path";
import { fileURLToPath } from "url";

import sharp from "sharp";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dir = path.join(root, "public", "img", "projects", "trackajob");

const BG = "#F7F1F3"; // site light surface / msapplication-TileColor
const INK = "#121212";
const YELLOW = "#E6B240"; // --yellow-100, the brand accent
const GREEN = "#4A7C59"; // the product's own primary action colour

const roundCorners = async (buffer, radius) => {
  const meta = await sharp(buffer).metadata();
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${meta.width}" height="${meta.height}">
       <rect width="${meta.width}" height="${meta.height}" rx="${radius}" ry="${radius}" fill="#fff"/>
     </svg>`,
  );

  return sharp(buffer)
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
};

const framedCard = async (src, width) => {
  const meta = await sharp(src).metadata();
  const height = Math.round((width * meta.height) / meta.width);
  const pad = Math.max(6, Math.round(width * 0.014));
  const shadow = Math.max(8, Math.round(width * 0.02));
  const radius = 14;

  const shot = await roundCorners(await sharp(src).resize({ width, kernel: "lanczos3" }).png().toBuffer(), radius);
  const cardW = width + pad * 2;
  const cardH = height + pad * 2;
  const totalW = cardW + shadow;
  const totalH = cardH + shadow;

  const base = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}">
       <rect x="${shadow}" y="${shadow}" width="${cardW}" height="${cardH}" rx="${radius + 2}" fill="${INK}"/>
       <rect width="${cardW}" height="${cardH}" rx="${radius + 2}" fill="#ffffff"/>
     </svg>`,
  );

  const buffer = await sharp(base)
    .composite([{ input: shot, top: pad, left: pad }])
    .png()
    .toBuffer();

  return { buffer, width: totalW, height: totalH };
};

const wash = (w, h, cx, cy) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
       <defs>
         <radialGradient id="g" cx="${cx}" cy="${cy}" r="72%">
           <stop offset="0%" stop-color="${YELLOW}" stop-opacity="0.34"/>
           <stop offset="100%" stop-color="${YELLOW}" stop-opacity="0"/>
         </radialGradient>
       </defs>
       <rect width="${w}" height="${h}" fill="url(#g)"/>
     </svg>`,
  );

const compose = async ({ W, H, layers, outFile, label }) => {
  await sharp({ create: { width: W, height: H, channels: 4, background: BG } })
    .composite(layers)
    .flatten({ background: BG })
    .png({ compressionLevel: 9 })
    .toFile(outFile);

  const buf = await sharp(outFile).toBuffer();
  const s = await sharp(buf).stats();
  console.log(`wrote ${path.relative(root, outFile)} (${W}x${H})`);
  console.log(
    `  ${(buf.length / 1024).toFixed(0)} KB, detail stdev ${Math.max(...s.channels.map((c) => c.stdev)).toFixed(1)}`,
  );
  console.log(`  ${label}`);
};

const run = async () => {
  // ---- wide: projects listing (16/10 container) --------------------------------
  // A composition of screenshots works here: the container is close to 16:9.
  const W = 1200;
  const H = 880;
  const wMain = await framedCard(path.join(dir, "applications.webp"), 600);
  const wStats = await framedCard(path.join(dir, "stats.webp"), 380);
  const wPhone = await framedCard(path.join(dir, "applications-mobile.webp"), 138);
  const margin = 74;

  await compose({
    W,
    H,
    layers: [
      { input: wash(W, H, "82%", "12%"), top: 0, left: 0 },
      { input: wStats.buffer, top: 96, left: W - wStats.width - margin },
      { input: wMain.buffer, top: 268, left: margin },
      { input: wPhone.buffer, top: H - wPhone.height - 84, left: W - wPhone.width - margin - 26 },
    ],
    outFile: path.join(dir, "thumbnail.png"),
    label: "wide/listing: apps + stats + phone, safe margins for a centre crop",
  });

  // ---- tall: homepage tile (0.349 column) --------------------------------------
  // Brand artwork, not a screenshot: the product's own folder mark, the product name,
  // and the core promise, centred with deliberate negative space. This survives any
  // crop and reads at 238x682 the same way the Animations tile does.
  const TW = 700;
  const TH = 2006;
  const cx = TW / 2;

  // The mark is the app's real `brand-mark` element, measured from the live site:
  //   fill rgb(255,233,168)  border 1px rgb(34,32,28)  radius 2px 2px 3px 3px
  //   monospace "T" in rgb(58,47,16)
  // It is a folder: a tab on the top-left, then the body. Reproduced here at 250px
  // wide (~10x the 24px original) so the strokes scale with it rather than staying
  // hairline.
  const markSize = 250;
  const markTop = 690;
  const foldL = cx - markSize / 2;
  const stroke = 10;

  const FOLDER_FILL = "#FFE9A8";
  const FOLDER_INK = "#22201C";
  const T_INK = "#3A2F10";

  // Folder geometry, in the proportions of the original asset. The tab overlaps the
  // body so the two read as one object: drawing them as separate shapes with a gap
  // left the tab visually detached.
  const tabW = markSize * 0.42;
  const tabH = markSize * 0.19;
  const bodyTop = markTop + tabH * 0.62;
  const bodyH = markSize * 0.84;

  const mark = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${TW}" height="${TH}">
       <defs>
         <filter id="hardShadow" x="-20%" y="-20%" width="140%" height="140%">
           <feOffset in="SourceAlpha" dx="10" dy="10" result="off"/>
           <feFlood flood-color="${FOLDER_INK}"/>
           <feComposite in2="off" operator="in"/>
           <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
         </filter>
       </defs>

       <g filter="url(#hardShadow)">
         <!-- tab first, so the body's stroke draws cleanly over its lower edge -->
         <path d="M ${foldL} ${markTop + tabH * 0.5}
                  a 12 12 0 0 1 12 -12
                  h ${tabW - 24}
                  a 12 12 0 0 1 12 12
                  v ${tabH * 0.68}
                  h ${-tabW}
                  Z"
               fill="${FOLDER_FILL}" stroke="${FOLDER_INK}" stroke-width="${stroke}"
               stroke-linejoin="round"/>

         <!-- body, filled opaquely so it covers the tab's lower stroke -->
         <rect x="${foldL}" y="${bodyTop}" width="${markSize}" height="${bodyH}"
               rx="26" ry="26"
               fill="${FOLDER_FILL}" stroke="${FOLDER_INK}" stroke-width="${stroke}"/>

         <!-- the T, in the app's monospace glyph -->
         <text x="${cx}" y="${bodyTop + bodyH * 0.63}" text-anchor="middle"
               font-family="'JetBrains Mono', ui-monospace, 'Cascadia Mono', monospace"
               font-size="${markSize * 0.44}" font-weight="700"
               fill="${T_INK}">T</text>
       </g>

       <!-- product name -->
       <text x="${cx}" y="${bodyTop + bodyH + 132}" text-anchor="middle"
             font-family="Montserrat, Segoe UI, Helvetica, Arial, sans-serif"
             font-size="92" font-weight="800" fill="${INK}" letter-spacing="-1">TrackAJob</text>

       <!-- the promise, as three short lines -->
       <text x="${cx}" y="${bodyTop + bodyH + 242}" text-anchor="middle"
             font-family="Montserrat, Segoe UI, Helvetica, Arial, sans-serif"
             font-size="44" font-weight="600" fill="${INK}" opacity="0.72">Every application.</text>
       <text x="${cx}" y="${bodyTop + bodyH + 304}" text-anchor="middle"
             font-family="Montserrat, Segoe UI, Helvetica, Arial, sans-serif"
             font-size="44" font-weight="600" fill="${INK}" opacity="0.72">Every resume version.</text>
       <text x="${cx}" y="${bodyTop + bodyH + 366}" text-anchor="middle"
             font-family="Montserrat, Segoe UI, Helvetica, Arial, sans-serif"
             font-size="44" font-weight="700" fill="${GREEN}">One place.</text>
     </svg>`,
  );

  await compose({
    W: TW,
    H: TH,
    layers: [
      { input: wash(TW, TH, "50%", "32%"), top: 0, left: 0 },
      { input: mark, top: 0, left: 0 },
    ],
    outFile: path.join(dir, "thumbnail-tall.png"),
    label: "tall/tile: folder mark + promise, centred, crop-safe",
  });
};

await run();
