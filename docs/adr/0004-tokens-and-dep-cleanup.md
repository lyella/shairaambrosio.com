# ADR-0004: semantic token adoption and dev-dependency vulnerability cleanup

- **Status:** Accepted
- **Date:** 2026-11-18
- **Deciders:** Shaira Ambrosio (owner), Mistral Vibe (implementing agent)
- **Follows:** ADR-0001..0003

## Context

Two remaining backlog items: adopt the semantic tokens introduced in ADR-0002 across component
styles, and reduce the 125 high-severity dev-tooling audit findings.

## Decisions

### 1. Semantic token adoption (scoped, 1:1 mappings)

Replaced role-based usages in all component/global SCSS (excluding `variables.scss` itself):

- `color: var(--black-100)` -> `color: var(--text-primary)` (14 sites)
- `color: var(--gray-300)` -> `color: var(--text-muted)` (8 sites)
- `background-color: var(--bg-100)` -> `var(--surface)` (1 site)
- `background-color: var(--gray-100)` -> `var(--surface-muted)` (3 sites)

Decorative accents and borders keep the hue variables. Note: in dark theme `--text-muted` is
rgb(160,160,160) while `--gray-300` is rgb(60,60,60) — the old dark-mode muted text was effectively
invisible on the rgb(18,18,18) background, so this is also a contrast bug fix.

### 2. Dependency cleanup via yarn resolutions

Pinned patched versions: `tar>=7.5.19`, `brace-expansion>=2.0.2`, `fast-uri>=3.1.4`,
`browserslist>=4.28.7`, `axios>=1.20.0`, `undici>=6.24.0 <7` (v8 needs Node 22; this repo runs
Node 20), `follow-redirects>=1.16.1`, `serialize-javascript>=7.0.3`, `source-map-js>=1.2.2`,
`svgo>=3.3.4`, `@fastify/busboy>=3.2.1`, `zod>=4.6.6`, `path-to-regexp>=6.3.0`, and bumped
`sharp` to `^0.35.0` (advisory only patched in >=0.35).

**Pitfall hit and fixed:** a blanket `js-yaml>=4.3.1` resolution broke `gray-matter` (which needs
the v3 API) — the production build failed at page-data collection with a cryptic
`Cannot read properties of undefined (reading 'bind')`. Dropping the blanket pin let the lockfile
resolve js-yaml 3.15.2 / 4.x patched versions naturally. Lesson recorded: blanket resolutions on
major-version-sensitive packages must be build-tested, not just audit-tested.

### Result

`yarn audit`: 238 findings / 6 critical at the start of the engagement -> **1 low, 12 moderate,
11 high, 0 critical** now. All 11 remaining highs are `picomatch` (ReDoS, no patched release
exists; dev-only transitive of micromatch via eslint tooling — never shipped to browsers).

## Verification

- `yarn tsc` exits 0; `yarn next build --webpack` exits 0 (type-checked, sharp 0.35 + plaiceholder
  confirmed working — blur base64 present in built `/projects` HTML).
- Smoke: all pages 200, security headers present, `GET /api/contact` -> 405.

## Consequences

- Positive: runtime deps are clean of critical/high advisories that have patches; semantic tokens
  now back all text/surface styles; dark-mode muted text is readable.
- Accepted: picomatch findings remain until eslint tooling moves off micromatch; moderate findings
  are mostly dev-only transitive deps with no runtime exposure.
