# Plan: portfolio modernization backlog

Updated 2026-11-19 after the React 19 + tooling overhaul (ADR-0006).

## Done

### Modernization + hardening (ADR-0001, ADR-0002)

- [x] Upgrade `next` to `^16.4.1` (16.4.6) — cleared 5 critical CVEs; `tar` pinned
- [x] Fix `/projects` 404 (per-image blur fallback, real thumbnail)
- [x] Sanitize API error responses; server-side logging only
- [x] Server-side email validation; 405 method guards on all API routes
- [x] Rate limiting (Upstash KV in production, in-memory fallback) — ADR-0005
- [x] Remove dead `countapi-js`; `/about` SSG 37s -> <1s
- [x] react-query v3 -> `@tanstack/react-query` v5; `react-instantsearch` v7
- [x] Design tokens in `styles/variables.scss`; AA contrast fixed — ADR-0004
- [x] Security headers / CSP — ADR-0003

### QA pass (2026-11-18)

- [x] `lang="en"`, skip-to-content link, `:focus-visible` on inputs
- [x] `/api/music` degrades to 200 with `{track:null,status:"offline"}`
- [x] vitest suite (18 tests) wired into CI

### React 19 + tooling overhaul (2026-11-19, ADR-0006)

**SEO / correctness**

- [x] Canonical/OG/RSS/JSON-LD no longer point at a Vercel preview host
      (`NEXT_PUBLIC_VERCEL_URL` was used as the canonical origin)
- [x] `og:locale` `en_EN` -> `en_US`; absolute `og:image` per page and per post
- [x] `sitemap.xml` + `robots.txt` generated at build (`generateSitemap.ts`),
      replacing the never-installed `next-sitemap` stub
- [x] RSS items use absolute GUIDs (`https://shairaambrosio.com/blog/<slug>`)
- [x] JSON-LD: `Person` + `WebSite` graph, `BreadcrumbList` on articles
- [x] Algolia reindex clears the index first — the `posts` index had 12 objects
      for 6 posts (manual dashboard uploads survived every `saveObjects`)
- [x] `build.sh` no longer rewrites `next.config.js`; redirects to the newest post
      are resolved at request time, so `/new` and `/newest-post` stop 404ing

**Performance**

- [x] Montserrat `.ttf` -> `.woff2`: 580 KB -> 182 KB
- [x] Font preloads cut from 7 to 2 (including a preload for a font with no rule)
- [x] 21 `dynamic()` imports inside `map()` (remount every render) -> module-scope map
- [x] Same fix in `Footer`/`SocialTile`; `/about` no longer remounts 21 icons
- [x] `useMounted` replaces six hand-rolled `useState(false)` + effect mount guards
- [x] `ProjectTile` uses `next/link` (prefetch + client nav, not a full reload)

**Tooling**

- [x] ESLint migrated to flat config and actually runs (was dead: `next lint` is
      removed in Next 16, and `"type": "module"` broke the `/\.eslintrc\.js` parse)
- [x] CI now runs lint, the audit gate, sitemap/feed generation and a
      placeholder-redirect guard
- [x] `scripts/audit-gate.sh` parses audit JSON — `yarn audit --level` never
      filtered or failed deterministically
- [x] `@mapbox/rehype-prism` (unmaintained, pinned prismjs 1.27) ->
      `rehype-prism-plus`
- [x] husky v9 hooks; `.gitignore` no longer excludes `.env-sample`; build
      artifacts (`sw.js`) ignored

**Formatting baseline (2026-11-19)**

- [x] `.gitattributes` added — `core.autocrlf=true` meant 71 files were CRLF on
      disk and Prettier wanted to rewrite all of them for line endings alone
- [x] All 96 text files normalised to LF; 23 files with real style drift
      formatted (all whitespace/wrapping — verified whitespace-insensitive SCSS
      equality and MDX rendering before applying)
- [x] `yarn format:check` is green repo-wide and is now a CI gate
- [x] `scripts/format-baseline.mjs` classifies any future drift as
      line-ending / trailing-newline / substantive

**React 18 -> 19**

- [x] react/react-dom 19.3.1, `@types/react` 19.3, framer-motion 12,
      react-paginate 8.3
- [x] Single `@types/react` via resolutions (react-lottie shipped a private copy)
- [x] `React.JSX` migration (`Input.tsx`), `@types/mdx` patched for React 19
      via `postinstall` (upstream types still use the global `JSX` namespace)
- [x] Real bugs the new React-Compiler lint rules surfaced and fixed:
      `Mdx` froze `theme` in a `[]` memo (sandbox never re-themed), `QuizDialog`
      scored N-1 answers, `_app` read `router.events` from a stale closure,
      `useLocalStorage` called a `useCallback` before it was defined,
      theme switch was an unnamed checkbox, dead `<a>` with no `href`

## Remaining (owner / needs a decision)

- [ ] OWNER: `SPOTIFY_*` env is empty — the now-playing tile is intentionally off
- [ ] OPTIONAL: Spotify backend gutting — the owner chose to leave it as-is
- [ ] Replace the generated thumbnail with real project artwork
- [ ] Migrate PWA to `@ducanh2912/next-pwa`, then evaluate Turbopack
- [x] Prettier baseline: `.gitattributes` + full reformat; `format:check` is a CI gate
- [ ] picomatch/minimatch/ajv/uuid/esbuild/vitest moderates: dev-tooling only,
      no patched release or no runtime exposure (see `yarn audit:gate`)
- [ ] Blog/project MDX bodies render client-side (`Mdx.tsx` calls
      `renderToString` locally), so article section `<h2>`s are absent from the
      static HTML. Pre-existing by design; fixing means app-router MDX or
      `next-mdx-remote/rsc`.

## Verification checklist (after each change)

1. `yarn tsc` exits 0
2. `yarn lint` exits 0 (real ESLint now — it was silently broken before)
3. `yarn format:check` exits 0
4. `yarn test` — 18 tests pass
5. `yarn audit:gate` — 0 critical/high in production deps
6. `yarn next build --webpack` exits 0
7. `node scripts/verify-build.mjs` — canonical host, JSON-LD parses, one `<h1>`,
   non-empty branded `<title>`, no preview URLs in sitemap/feed/robots, no `.ttf`
8. Smoke: `/`, `/about`, `/blog`, `/projects`, `/projects/trackajob`, `/contact`
   all 200; `/new` redirects to the current newest post
