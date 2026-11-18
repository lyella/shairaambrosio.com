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

## QA pass 2026-11-18 (agent: Abadiel) — all 13 checks PASS; fixes applied below

- [x] `lang="en-EN"` -> `lang="en"` (invalid BCP 47)
- [x] skip-to-content link re-enabled in Layout
- [x] `:focus-visible` outlines on form inputs (WCAG 2.4.11)
- [x] contact 400 no longer leaks the email regex
- [x] light `--text-muted` darkened to rgb(100,100,100) (AA on surface-muted too)
- [x] `/api/music` degrades to 200 `{track:null,status:"offline"}` + edge cache header
- [ ] OWNER: `SPOTIFY_REFRESH_TOKEN` is failing on Vercel — re-auth the Spotify app to restore the now-playing tile
- [ ] OWNER: rotate the Upstash token pasted in chat earlier

## Testing

- [x] vitest suite (18 tests): API guards/validation/error-shapes, rate limiter, content smoke — `yarn test`, wired into CI (`.github/workflows/ci.yml`)

## Remaining

- [x] Security headers (CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy) — ADR-0003
- [x] Semantic tokens adopted for all text/surface styles; dark `--text-muted` contrast fixed — ADR-0004
- [x] Dev-dep audit cleanup: 6 critical/149 high -> 0 critical/11 high (all remaining highs are unpatchable picomatch, dev-only) — ADR-0004
- [x] Rate limiter is KV-ready: uses Vercel KV when KV_REST_API_URL/TOKEN are set, in-memory fallback otherwise — ADR-0005
- [x] Global rate limit ACTIVE: Upstash KV connected, KV_REST_API_URL/TOKEN set on Vercel (all envs), production redeployed — verified 400x5 then 429 and `ratelimit:*` keys in KV (2026-11-18)
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
