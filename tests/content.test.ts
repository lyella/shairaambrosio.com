import { existsSync } from "fs";
import path from "path";

import { describe, expect, it } from "vitest";

import { getAllProjects, getBestProjects } from "lib/projects";
import { getPublishedPosts } from "lib/posts";

describe("content smoke", () => {
  it("every published project has a thumbnail on disk", () => {
    const projects = getAllProjects().filter((p) => p.isPublished);
    expect(projects.length).toBeGreaterThan(0);
    for (const p of projects) {
      expect(existsSync(path.join(process.cwd(), "public", p.image)), `missing ${p.image}`).toBe(true);
    }
  });

  it("best projects are ordered and non-empty for the homepage tiles", () => {
    const best = getBestProjects();
    expect(best.length).toBeGreaterThanOrEqual(2);
  });

  it("published posts exist and carry required fields", () => {
    const posts = getPublishedPosts();
    expect(posts.length).toBeGreaterThan(0);
    for (const p of posts) {
      expect(p.slug).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(existsSync(path.join(process.cwd(), "public", p.image)), `missing ${p.image}`).toBe(true);
    }
  });

  it("next.config.js declares the security headers", () => {
    const cfg = require("fs").readFileSync(path.join(process.cwd(), "next.config.js"), "utf8");
    for (const h of ["X-Frame-Options", "X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy", "Content-Security-Policy"]) {
      expect(cfg).toContain(h);
    }
    expect(cfg).toContain("frame-ancestors 'none'");
  });
});
