# Plan: portfolio modernization backlog

Updated 2026-11-18 after ADR-0001 and ADR-0002. Items are ordered by impact.

## Done (ADR-0001 + ADR-0002)

- [x] Upgrade `next` to `^16.4.1` (installed 16.4.6) — clears 5 critical CVEs; `tar` pinned >=7.5.19; **0 critical audit findings**
- [x] Fix `/projects` 404 — per-image blur fallback + real thumbnail generated (`public/img/projects/animations/thumbnail.png`)
- [x] Sanitize API error responses; server-side logging only
- [x] Server-side email validation on `/api/newsletter`; 405 method guards on all API routes
- [x] Rate limiting: contact 5/10min, newsletter 3/hour, per-route per-IP (`lib/rateLimit.ts`)
- [x] `build.sh` CRLF -> LF
- [x] Remove dead `countapi-js` (views UI removed with it); `/about` SSG 37s -> <1s, static gen 38.8s -> 0.8s
- [x] Fix all 6 `tsc` errors; `ignoreBuildErrors` removed — build now type-checks
- [x] `react-query` v3 -> `@tanstack/react-query` v5
- [x] `react-instantsearch-dom` v6 -> `react-instantsearch` v7
- [x] Palette deduplicated into SCSS mixins in `styles/variables.scss`; semantic tokens added; light `--gray-300` now passes WCAG AA
- [x] Removed unused `lib` npm dependency
- [x] Decision: stay on webpack (`next-pwa` is webpack-only) — documented in ADR-0002

## Remaining

- [x] Security headers (CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy) — ADR-0003
- [x] Semantic tokens adopted for all text/surface styles; dark `--text-muted` contrast fixed — ADR-0004
- [x] Dev-dep audit cleanup: 6 critical/149 high -> 0 critical/11 high (all remaining highs are unpatchable picomatch, dev-only) — ADR-0004
- [x] Rate limiter is KV-ready: uses Vercel KV when KV_REST_API_URL/TOKEN are set, in-memory fallback otherwise — ADR-0005
- [ ] Activate global rate limit: create a KV store in the Vercel dashboard, add KV_REST_API_URL + KV_REST_API_TOKEN to the project env, redeploy (owner action, no code change)
- [ ] Replace the generated thumbnail with real project artwork (owner asset)
- [ ] Migrate PWA to `@ducanh2912/next-pwa` and then consider Turbopack
- [ ] Reconsider red scrollbar hover (reads as error state; subjective)
- [ ] picomatch ReDoS findings remain until eslint tooling drops micromatch (no patched release exists)

## Verification checklist (run after each change)

1. `yarn tsc` exits 0
2. `yarn next build --webpack` exits 0 (type-checks included)
3. `yarn audit --level critical` reports 0
4. Smoke: `/`, `/about`, `/blog`, `/projects`, `/projects/animations`, `/contact` all 200
5. `GET /api/contact` -> 405; `POST /api/contact` x6 -> 400x5 then 429; junk email -> 400
