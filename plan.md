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

- [ ] Global rate limit via Vercel KV/Upstash (current limiter is per serverless instance)
- [ ] Security headers (CSP, X-Frame-Options, Referrer-Policy) via `next.config.js` `headers()`
- [ ] Migrate PWA to `@ducanh2912/next-pwa` and then consider Turbopack
- [ ] Adopt semantic tokens across component styles (hue variables still in use)
- [ ] Reconsider red scrollbar hover (reads as error state; subjective)
- [ ] Whittle down the 125 high-severity dev-tooling audit findings on the next dependency refresh
- [ ] Replace the generated placeholder thumbnail with real project artwork

## Verification checklist (run after each change)

1. `yarn tsc` exits 0
2. `yarn next build --webpack` exits 0 (type-checks included)
3. `yarn audit --level critical` reports 0
4. Smoke: `/`, `/about`, `/blog`, `/projects`, `/projects/animations`, `/contact` all 200
5. `GET /api/contact` -> 405; `POST /api/contact` x6 -> 400x5 then 429; junk email -> 400
