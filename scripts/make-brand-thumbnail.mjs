// Build the project thumbnail for TrackAJob.
//
// The previous thumbnail was the brand logo (97% white pixels by mean luminance)
// scaled into a 1200x880 tile, so the card read as an empty box on the homepage and
// the projects listing. This composites real application screenshots into the site's
// own visual language (2px black border, hard offset shadow, warm paper surface) so
// the tile looks like part of the portfolio rather than a pasted screenshot.
//
// Run: node scripts/make-brand-thumbnail.mjs
import path from "path";
import { fileURLToPath } from "url";

import sharp from "sharp";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dir = path.join(root, "public", "img", "projects", "trackajob");
const outFile = path.join(dir, "thumbnail.png");

const W = 1200;
const H = 880;
const BG = "#F7F1F3"; // matches the site's light surface / msapplication-TileColor
const INK = "#121212";
const YELLOW = "#E6B240"; // --yellow-100, the brand accent in the logo

// Rounds the corners of a raster by multiplying it with a rounded-rect alpha mask.
// (The first attempt used `dest-in` on an empty SVG, which zeroed the alpha of the
// screenshot itself and produced blank white cards.)
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

// Screenshot -> framed card with a hard offset shadow and a white matte.
const framedCard = async (src, width) => {
  const meta = await sharp(src).metadata();
  const height = Math.round((width * meta.height) / meta.width);
  const pad = 10;
  const shadow = 14;
  const radius = 16;

  // The screenshot, scaled and rounded first so the matte shows through the corners.
  const shot = await roundCorners(await sharp(src).resize({ width, kernel: "lanczos3" }).png().toBuffer(), radius);

  const cardW = width + pad * 2;
  const cardH = height + pad * 2;
  const totalW = cardW + shadow;
  const totalH = cardH + shadow;

  // Shadow + white matte, drawn beneath the screenshot.
  const base = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}">
       <rect x="${shadow}" y="${shadow}" width="${cardW}" height="${cardH}" rx="${radius + 2}" fill="${INK}"/>
       <rect x="0" y="0" width="${cardW}" height="${cardH}" rx="${radius + 2}" fill="#ffffff"/>
     </svg>`,
  );

  const buffer = await sharp(base)
    .composite([{ input: shot, top: pad, left: pad }])
    .png()
    .toBuffer();

  return { buffer, width: totalW, height: totalH };
};

const run = async () => {
  const main = await framedCard(path.join(dir, "applications.webp"), 700);
  const stats = await framedCard(path.join(dir, "stats.webp"), 430);
  const phone = await framedCard(path.join(dir, "applications-mobile.webp"), 168);

  // Soft accent wash so the paper surface doesn't read as dead space.
  const wash = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
       <defs>
         <radialGradient id="g" cx="82%" cy="12%" r="72%">
           <stop offset="0%" stop-color="${YELLOW}" stop-opacity="0.34"/>
           <stop offset="100%" stop-color="${YELLOW}" stop-opacity="0"/>
         </radialGradient>
       </defs>
       <rect width="${W}" height="${H}" fill="url(#g)"/>
     </svg>`,
  );

  // Depth order: stats card behind/above, main screenshot in front, phone last.
  // Offsets keep every card inside the 1200x880 frame with a consistent margin.
  const placed = [
    { input: stats.buffer, top: 34, left: W - stats.width - 30 },
    { input: main.buffer, top: 214, left: 30 },
    { input: phone.buffer, top: H - phone.height - 26, left: W - phone.width - 54 },
  ];

  await sharp({ create: { width: W, height: H, channels: 4, background: BG } })
    .composite([{ input: wash, top: 0, left: 0 }, ...placed])
    .flatten({ background: BG })
    .resize(W, H, { fit: "cover", position: "centre" })
    .png({ compressionLevel: 9 })
    .toFile(outFile);

  const buf = await sharp(outFile).toBuffer();
  const meta = await sharp(buf).metadata();
  const s = await sharp(buf).stats();
  const luminanceStd = Math.max(...s.channels.map((c) => c.stdev));

  console.log(`wrote ${path.relative(root, outFile)} (${meta.width}x${meta.height})`);
  console.log(
    `  ${(buf.length / 1024).toFixed(0)} KB, channel means ${s.channels.map((c) => c.mean.toFixed(1)).join(", ")}`,
  );
  console.log(`  max channel stdev ${luminanceStd.toFixed(1)} (higher = more visible detail)`);
};

await run();
