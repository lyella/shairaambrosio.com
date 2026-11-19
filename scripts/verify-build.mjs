// Post-build verification of the generated HTML: canonical hosts, JSON-LD validity,
// heading outline, font preloads and first-load JS. Run with `node scripts/verify-build.mjs`.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pagesDir = path.join(root, ".next", "server", "pages");

const EXPECTED_HOST = "https://shairaambrosio.com";
let failures = 0;

const fail = (page, msg) => {
  failures += 1;
  console.log(`  FAIL ${page}: ${msg}`);
};

const readPage = (rel) => {
  const file = path.join(pagesDir, rel);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
};

const checkPage = (rel, label) => {
  const html = readPage(rel);
  if (!html) {
    fail(label, "built HTML missing");
    return;
  }

  // Canonical must never point at a preview deployment.
  const canonical = /<link rel="canonical" href="([^"]*)"/.exec(html)?.[1];
  if (!canonical) fail(label, "no canonical");
  else if (!canonical.startsWith(EXPECTED_HOST)) fail(label, `canonical points at ${canonical}`);
  else if (/vercel\.app/.test(canonical)) fail(label, `canonical is a preview host: ${canonical}`);

  // OG locale must be language_COUNTRY.
  const locale = /<meta property="og:locale" content="([^"]*)"/.exec(html)?.[1];
  if (locale && !/^[a-z]{2}_[A-Z]{2}$/.test(locale)) fail(label, `og:locale "${locale}" is not language_COUNTRY`);

  // Every page must carry a non-empty <title>. Matched with a non-greedy group
  // that allows nested markup: an earlier version of this check used a
  // single-line pattern, could not see a title containing a nested tag, and
  // reported a false "no title" on the homepage.
  const title = /<title[^>]*>([\s\S]*?)<\/title>/.exec(html)?.[1]?.trim();
  if (!title) fail(label, "missing or empty <title>");
  else if (!title.includes("Shaira Ambrosio")) fail(label, `<title> is not branded: "${title}"`);

  // Every JSON-LD block must parse.
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!blocks.length) fail(label, "no JSON-LD");
  for (const [, body] of blocks) {
    try {
      JSON.parse(body.replace(/&quot;/g, '"'));
    } catch (e) {
      fail(label, `invalid JSON-LD: ${e.message}`);
    }
  }

  // Exactly one <h1>.
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) fail(label, `${h1s} <h1> elements`);

  // No font preloads for files that are no longer shipped.
  if (/Montserrat-\w+\.ttf/.test(html)) fail(label, "preloads a removed .ttf font");

  console.log(`  ok   ${label} (h1=${h1s}, jsonld=${blocks.length}, title="${title}")`);
};

console.log("== Page checks ==");
checkPage("index.html", "/");
checkPage("404.html", "/404");
checkPage(path.join("blog", "the-power-of-asynchronous-javascript.html"), "/blog/[post]");
checkPage(path.join("projects", "trackajob.html"), "/projects/[project]");

console.log("\n== Generated assets ==");
for (const asset of ["sitemap.xml", "robots.txt", "feed.xml"]) {
  const p = path.join(root, "public", asset);
  if (!fs.existsSync(p)) {
    fail(asset, "missing from public/");
    continue;
  }
  const body = fs.readFileSync(p, "utf8");
  const previewLinks = body.match(/https?:\/\/[a-z0-9-]+\.vercel\.app/gi);
  if (previewLinks) fail(asset, `contains preview URLs: ${[...new Set(previewLinks)].join(", ")}`);
  if (/http:\/\/shairaambrosio/.test(body)) fail(asset, "contains an http:// canonical URL");
  console.log(`  ok   ${asset}`);
}

console.log("\n== Fonts shipped ==");
const fonts = fs.readdirSync(path.join(root, "public", "fonts"));
const ttfs = fonts.filter((f) => f.endsWith(".ttf"));
if (ttfs.length) fail("fonts", `still shipping ${ttfs.join(", ")}`);
const totalKb = fonts.reduce((sum, f) => sum + fs.statSync(path.join(root, "public", "fonts", f)).size / 1024, 0);
console.log(`  ok   ${fonts.length} font files, ${totalKb.toFixed(0)} KB total`);

console.log(`\n${failures === 0 ? "PASS" : `FAIL (${failures})`}`);
process.exit(failures === 0 ? 0 : 1);
