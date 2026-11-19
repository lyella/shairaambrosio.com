import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { absoluteUrl, HOST } from "./utils/consts";
import { getPublishedPosts, getPostsCategories } from "./lib/posts";
import { getBestProjects } from "./lib/projects";

dayjs.extend(customParseFormat);

// Generated at build time into public/, so the sitemap is a real static file that
// crawlers can fetch without hitting a function. Replaces the broken next-sitemap
// setup (the package was never installed and its config used CommonJS exports in an
// ESM project, so /sitemap.xml and /robots.txt both 404'd).

const SITEMAP_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "public", "sitemap.xml");
const ROBOTS_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "public", "robots.txt");

type Entry = { loc: string; lastmod?: string; changefreq?: string; priority?: number };

const xmlEscape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toIsoDate = (value: string) => {
  const parsed = dayjs(value, "DD-MM-YYYY");

  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : undefined;
};

const buildEntries = (): Entry[] => {
  const posts = getPublishedPosts();
  const projects = getBestProjects();
  const categories = getPostsCategories();

  const staticRoutes: Entry[] = [
    { loc: absoluteUrl("/"), changefreq: "weekly", priority: 1 },
    { loc: absoluteUrl("/about"), changefreq: "monthly", priority: 0.8 },
    { loc: absoluteUrl("/blog"), changefreq: "weekly", priority: 0.9 },
    { loc: absoluteUrl("/projects"), changefreq: "monthly", priority: 0.9 },
    { loc: absoluteUrl("/contact"), changefreq: "yearly", priority: 0.6 },
  ];

  const categoryRoutes: Entry[] = categories.map((category) => ({
    loc: absoluteUrl(`/blog?category=${category}`),
    changefreq: "weekly",
    priority: 0.5,
  }));

  const postRoutes: Entry[] = posts.map((post) => ({
    loc: absoluteUrl(`/blog/${post.slug}`),
    lastmod: toIsoDate(post.publishedAt),
    changefreq: "monthly",
    priority: 0.7,
  }));

  const projectRoutes: Entry[] = projects.map((project) => ({
    loc: absoluteUrl(`/projects/${project.slug}`),
    lastmod: toIsoDate(project.publishedAt),
    changefreq: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes, ...projectRoutes, ...categoryRoutes];
};

const buildSitemap = (entries: Entry[]) => {
  const urls = entries
    .map((entry) => {
      const parts = [`    <loc>${xmlEscape(entry.loc)}</loc>`];

      if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      if (entry.priority !== undefined) parts.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);

      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
};

const buildRobots = () =>
  [
    "User-agent: *",
    "Allow: /",
    "",
    "# API routes carry no content worth crawling.",
    "Disallow: /api/",
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    `Host: ${HOST}`,
    "",
  ].join("\n");

const run = () => {
  const entries = buildEntries();

  fs.writeFileSync(SITEMAP_PATH, buildSitemap(entries), "utf8");
  fs.writeFileSync(ROBOTS_PATH, buildRobots(), "utf8");

  console.log(`${entries.length} URLs written to public/sitemap.xml`);
  console.log("public/robots.txt written");
};

run();
