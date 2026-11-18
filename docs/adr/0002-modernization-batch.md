# ADR-0002: dependency migrations, dead-service removal, and design token consolidation

- **Status:** Accepted
- **Date:** 2026-11-18
- **Deciders:** Shaira Ambrosio (owner), Mistral Vibe (implementing agent)
- **Follows:** ADR-0001

## Context

ADR-0001 deferred the larger refactors. This ADR records completing them.

## Decisions

1. **Remove `countapi-js`.** The backing service (countapi.xyz) is permanently shut down, so every
   blog/project page load and every `/about` build fired a request that could only fail. Removed the
   dependency, the view-hit effect in `Mdx.tsx`, the views prop chain on the about page, and the dead
   commented code in `pages/blog/index.tsx`. The "N views" UI element was removed with it. Side effect:
   `/about` SSG dropped from ~37s to <1s and total static generation from 38.8s to 0.8s.

2. **Migrate `react-query` v3 (EOL) to `@tanstack/react-query` v5.** Two call sites only
   (`pages/_app.tsx`, `useGetTrack`). v5 object-syntax query; `Hydrate` no longer exists and was
   removed (no SSR dehydration was in use). Devtools moved to `@tanstack/react-query-devtools`.

3. **Migrate `react-instantsearch-dom` v6 (deprecated) to `react-instantsearch` v7.** Three call sites:
   `SearchBox` (`connectSearchBox` -> `useSearchBox`), `PostsListing` and `ProjectsListing`
   (`connectHits` -> `useHits`, `connectStateResults` -> `useInstantSearch` with
   `status === "stalled"` replacing `isSearchStalled`). `algoliasearch` v4 client is compatible with v7.

4. **Add the missing project thumbnail.** `content/projects/animations.mdx` referenced
   `/img/projects/animations/thumbnail.png`, which did not exist. Generated a 1200x880 PNG in the
   site's neo-brutalist style (sharp + SVG, no text so no font dependency). Also fixed the
   `getPlaiceholder` call to pass a file `Buffer` (this plaiceholder version's
   `GetPlaiceholderSrc = Buffer`), so blur placeholders now actually generate — verified embedded
   in the built `/projects` HTML.

5. **Rate limiting.** New `lib/rateLimit.ts`: in-memory sliding window, per-route scope + IP
   (`x-forwarded-for`). Contact: 5 per 10 min. Newsletter: 3 per hour. 429 + `Retry-After`.
   Caveat (documented in code): on serverless each instance has its own store, so this is a
   best-effort per-instance guard; a hard global limit needs Vercel KV/Upstash.

6. **Type safety enforced at build.** Fixed all 6 pre-existing `tsc` errors (`Mdx.tsx` component-map
   types — `children` optionality + `renderToString` cast; `generateAlgoliaItems.ts` — `VFile` uses
   `String()`; `projects/index.tsx` — Buffer src) and removed `typescript.ignoreBuildErrors` from
   `next.config.js`. `yarn tsc` is clean and the production build now type-checks.

7. **Stay on webpack.** `next-pwa@5.6` is webpack-only, so Turbopack migration would require swapping
   the PWA plugin (`@ducanh2912/next-pwa`) — a riskier change for little gain. Decision: keep webpack,
   which all scripts already pass explicitly (`--webpack`). The bare `next build` failure mode is
   documented here instead.

8. **Design tokens.** `styles/variables.scss` defined the full palette 4x (media query + attribute
   selector, per theme, base + syntax). Consolidated into SCSS mixins (`theme-light`/`theme-dark`/
   `syntax-light`/`syntax-dark`) applied to all four selectors, so they can no longer drift. Added a
   semantic layer (`--text-primary`, `--text-muted`, `--surface`, `--surface-muted`, `--accent`,
   `--accent-strong`) and switched `globals.scss` body color to `--text-primary`. Light `--gray-300`
   darkened rgb(140,140,140) -> rgb(110,110,110): it is used for text in several components and was
   ~3.4:1 on white (WCAG AA failure); now ~5.3:1. Kept the red scrollbar hover (deliberate brand choice
   per commit 3af6d64).

9. **Removed unused `lib` npm dependency** (shadowed by the local `lib/` folder via tsconfig `baseUrl`).

## Consequences

- Positive: build type-checks, 0 critical audit findings, `/projects` renders with blur, search works
  on supported InstantSearch v7, dead service removed, ~50s faster builds, API abuse throttled.
- Accepted: 125 high-severity findings remain, all in dev-only tooling; rate limit is per-instance on
  serverless; semantic tokens are introduced but not yet adopted across all component styles (hue
  variables remain for compatibility).
