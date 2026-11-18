# Plan: portfolio modernization backlog

Created 2026-11-18 after the combined security / QA / UX audit. Items are ordered by impact.
Done items from the audit are listed at the bottom for the record.

## P0 — done in this pass (commit with ADR-0001)

- [x] Upgrade `next` to `^16.4.1` (clears 5 critical CVEs; installed 16.4.6)
- [x] Pin `tar >= 7.5.19` via yarn resolutions (0 critical audit findings remain)
- [x] Fix `/projects` 404 — per-image blur fallback in `getStaticProps`
- [x] Sanitize API error responses (contact, newsletter); server-side logging only
- [x] Add server-side email validation to `/api/newsletter`
- [x] Add 405 method guards to `/api/contact`, `/api/newsletter`, `/api/music`
- [x] Normalize `build.sh` to LF line endings

## P1 — next up (needs owner input or assets)

- [ ] Remove or replace `countapi-js` (service is dead; blog/about fire failing requests on every load)
- [ ] Add the missing project thumbnails under `public/img/projects/` so blur placeholders actually render
- [ ] Fix the 6 pre-existing `tsc --noEmit` errors, then remove `ignoreBuildErrors: true` from next.config
- [ ] Decide on Turbopack: migrate the `webpack` config (SVGR) or keep `--webpack` explicitly

## P2 — quality and maintainability

- [ ] Migrate off deprecated `react-instantsearch-dom` v6 (Algolia's supported client) and EOL `react-query` v3
- [ ] Speed up `/about` SSG (~37s): parallelize or cache external fetches, add timeouts
- [ ] Consolidate the duplicated palette in `styles/variables.scss` (media query + `[data-theme]` blocks)
- [ ] Fix `--gray-300` contrast (~3.4:1 on white) to meet WCAG AA; reconsider red scrollbar hover
- [ ] Add rate limiting to `/api/contact` and `/api/newsletter` (currently unthrottled; SendGrid/MailerLite spend at risk)
- [ ] Reduce the 125 remaining high audit findings in dev tooling during the next dependency refresh

## Verification checklist (run after each change)

1. `yarn next build --webpack` exits 0
2. `yarn audit --level critical` reports 0
3. Smoke: `/`, `/about`, `/blog`, `/projects`, `/projects/animations`, `/contact` all 200
4. `/api/contact` GET -> 405; empty POST -> 400 with clean message
5. `/api/newsletter` with junk email -> 400
