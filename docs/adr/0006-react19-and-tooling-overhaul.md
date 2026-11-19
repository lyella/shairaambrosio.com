# ADR-0006: React 19 upgrade and tooling overhaul

Date: 2026-11-19
Status: Accepted

## Context

A full-portfolio review found that several checks the project believed were
green were in fact not running, and that one configuration value was actively
telling search engines the site lived on a preview deployment.

Verified problems:

1. **Canonical URLs pointed at preview deploys.** `utils/consts.ts` built `HOST`
   from `NEXT_PUBLIC_VERCEL_URL`, which Vercel sets per deployment. Every page's
   canonical, `og:url`, RSS links and JSON-LD ids referenced
   `shaira-ambrosio-2023-…-lyellas-projects.vercel.app`.
2. **No sitemap and no robots.txt.** `next-sitemap.js` existed, but `next-sitemap`
   was never installed and the file used CommonJS exports in an ESM package.
3. **The Algolia `posts` index held 12 records for 6 posts.** `saveObjects` only
   upserts, so objects created by hand in the dashboard survived every reindex and
   each article appeared twice in search.
4. **ESLint never ran.** `next lint` was removed in Next 16, and `"type": "module"`
   meant the CommonJS `.eslintrc.js` could not be parsed. There was also a
   `minimatch@3` / `brace-expansion@5` / ESLint 9 glob-engine mismatch.
5. **The audit gate could not fail.** On Yarn 1, `yarn audit --level critical`
   exits non-zero on _any_ advisory and does not filter by level (verified: the
   critical, high and moderate runs printed identical summaries).
6. **`build.sh` rewrote `next.config.js` in place**, and only the first
   placeholder, leaving `/new` and `/newest-post` pointing at a 404.
7. **580 KB of `.ttf` fonts** on the critical path, including a preload for
   `LeagueMono-Medium.woff2`, which had no `@font-face` rule at all.
8. **21 `dynamic()` imports inside `map()`** in `Skills`, plus the same pattern in
   `Footer`/`SocialTile`, created a new component type per render and remounted
   every SVG.

## Decision

Upgrade to React 19 and make the tooling honest:

- react/react-dom `^19.2`, `@types/react` `^19.3`, framer-motion `^12`,
  react-paginate `^8.3`. `next@16` already accepts React 19 as a peer.
- Keep a **single** `@types/react` via `resolutions`. `@types/react-lottie` ships a
  private copy, which produced incompatible `Context`/`CSSProperties` types.
- Migrate to flat ESLint config on ESLint 9, with `@eslint/config-array`
  and `eslint-plugin-react` pinned so the plugins' peer ranges stay satisfied.
- Replace the audit gate with `scripts/audit-gate.sh`, which parses `yarn audit`
  JSON and fails on critical/high in production dependencies.
- Generate `sitemap.xml`/`robots.txt` with `generateSitemap.ts` in `build.sh`.
- Hardcode the production origin, keeping `NEXT_PUBLIC_HOST` as an escape hatch.
- Convert the Montserrat faces to woff2 with `scripts/ttf-to-woff2.py`.
- Add `scripts/verify-build.mjs` as a post-build assertion suite.

### React 19 specifics

React 19 removed the global `JSX` namespace. Three consequences:

- `JSX.IntrinsicElements["input"]` became `ComponentPropsWithoutRef<"input">`.
- `@types/mdx` (all versions through 2.0.14) still types against global `JSX`,
  which silently degrades `MDXComponents` under React 19. `scripts/patch-mdx-types.mjs`
  rewrites those references to `React.JSX` from `postinstall`, so fresh installs
  and Vercel builds get correct types.
- A component map typed `Record<string, ComponentType<any>>` no longer satisfies
  MDX's index signature (`ComponentType` includes class components). It is typed
  `Record<string, FunctionComponent<any>>` instead, with no cast.

The React Compiler lint rules also caught real defects, fixed rather than
suppressed: `Mdx` captured `theme` in an empty-dependency `useMemo` (the embedded
sandbox never switched theme), `QuizDialog` computed its score from the pre-update
`answers` array so the first answer never counted, `_app` closed over a stale
`router.events`, `useLocalStorage` invoked a `useCallback` before it was
initialised, and the theme switch was an unnamed checkbox.

## Consequences

- `yarn tsc`, `yarn lint`, `yarn test`, `yarn audit:gate`, the production build and
  `scripts/verify-build.mjs` all pass, and CI runs every one of them.
- Production dependencies are clean at critical and high severity. The remaining
  moderates are build/test tooling (`minimatch`, `ajv`, `esbuild`, `vitest`,
  `uuid`) with no runtime exposure.
- `postinstall` patches a file in `node_modules`. This is deliberate and is the
  smallest fix available until `@types/mdx` supports React 19.
- Spotify integration is intentionally untouched (owner decision); its env vars
  are empty and the tile stays disabled.
- Prettier is now a CI gate (`yarn format:check`). Reaching a clean baseline
  required `.gitattributes`: with `core.autocrlf=true` and no attributes file,
  71 of 101 "unformatted" files differed only in line endings. `.gitattributes`
  pins `eol=lf` for text and marks binaries, so Windows checkouts no longer
  produce whole-file diffs.
- `scripts/format-baseline.mjs` classifies future drift as line-ending,
  trailing-newline, or substantive, so a "format everything" churn is never
  mistaken for real style change again.
- `scripts/verify-build.mjs` asserts the `<title>` is present and branded. An
  earlier version of that check used a single-line regex and produced a false
  "no title" failure on the homepage; it now matches nested markup.
