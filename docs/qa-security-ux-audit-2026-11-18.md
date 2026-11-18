# QA / Security / UX audit artifact — 2026-11-18

Scope: full repo at commit `3af6d64` (pre-fix). Stack: Next.js 16 (pages router), React 18,
TypeScript, SCSS modules, yarn 1, deployed to Vercel. Method: static source review, dependency
audit, production build + live smoke tests against `next start`.

## 1. Security report

### Leak scan
- Grepped all tracked source for hardcoded `api_key|secret|token|password` assignments: **none found**.
- `git log --all` for `.env` files: only `.env-sample` ever committed. `.env*` correctly gitignored.
- `.env-sample` lists required secrets (Spotify, SendGrid, MailerLite, Algolia admin keys). Note:
  `ALGOLIA_API_KEY` / `ALGOLIA_UPDATE_API_KEY` are admin keys and must never be prefixed `NEXT_PUBLIC_`.

### Dependency audit (yarn audit, pre-fix)
- 238 vulnerabilities: 6 critical, 149 high, 70 moderate, 13 low.
- Criticals: `next` (5 CVEs, fixed >=16.4.1) and `tar` (fixed >=7.5.19, build-time only).
- Post-fix: **0 critical**, 192 total (mostly dev-only transitive deps of eslint/husky/ts-node).

### API route review (pages/api)
- `contact.ts`: no method guard, no rate limit, raw error objects returned to client (info disclosure), yup schema leaked on validation failure. **Fixed.**
- `newsletter.ts`: no email validation server-side (junk forwarded to MailerLite), no method guard, no rate limit. **Validation + method guard fixed; rate limiting deferred.**
- `music.ts`: calls Spotify token refresh on every request (2 upstream calls per hit), no caching, no method guard. **Method guard fixed; caching deferred.**
- All three routes log errors with `console.log` — switched to `console.error` for the touched handlers.

### Headers / config
- `next.config.js` sets `typescript.ignoreBuildErrors: true` — masks the 6 tsc errors; flagged in plan.md.
- No security headers (CSP, X-Frame-Options, etc.) configured; `headers()` not used. Recommend adding via `next.config.js` on Vercel — deferred.
- PWA via `next-pwa` is disabled in development only; ensure service worker is not cached stale in production.

## 2. QA / e2e report

Build: `yarn next build --webpack` exits 0 (130s). Without `--webpack` it fails: Next 16 defaults to
Turbopack and the config carries a `webpack` block (SVGR). `build.sh` already passes `--webpack`, but
its CRLF endings made it silently no-op under Git Bash on Windows — **fixed to LF**.

Live smoke tests (`next start`, pre-fix vs post-fix):

| Route / call | Before | After |
|---|---|---|
| `/` `/about` `/blog` `/blog/[slug]` `/contact` `/projects/[slug]` | 200 | 200 |
| `/projects` | **404 (broken)** | **200** |
| `/nonexistent-page` | 404 | 404 |
| `/x` | 308 -> x.com/shaicodes | unchanged |
| `GET /api/contact` | 400 + leaked yup schema | **405 Method not allowed** |
| `POST /api/contact {}` | 400 + leaked schema internals | 400 clean message |
| `POST /api/newsletter {"email":"not-an-email"}` | forwarded to MailerLite | **400 validation error** |
| `POST /api/music` | 400 | **405 Method not allowed** |

Typecheck: `yarn tsc` fails with 6 pre-existing errors (`components/mdx/Mdx.tsx` x3, `generateAlgoliaItems.ts` x2,
`pages/projects/index.tsx` plaiceholder arg type). Masked at build by `ignoreBuildErrors`.

Performance: `/about` SSG takes ~37s (serial external fetches; dead CountAPI timeouts). `/feed` 404s
unless the `feed` prebuild step runs (`build.sh` arg) — feeds are generated files, not runtime routes.

## 3. UX / design review

System: neo-brutalism — 2px black borders, hard offset shadows (`6px 6px 0`), multi-hue pastel
accents, Mabry Pro / League Mono type. Light + dark via `prefers-color-scheme` and `[data-theme]`.

### What works
- Strong, memorable identity; consistent use of borders/shadows across components.
- Theme switching is wired through CSS variables, so recoloring is centralized.
- Scrollbar styling gives the brutalist feel a finished touch.

### Issues
1. **Palette duplication** — the full variable set is defined twice in `styles/variables.scss`
   (`@media (prefers-color-scheme: light)` and `[data-theme="light"]`). They can drift; consolidate to one source.
2. **Contrast** — `--gray-300: rgb(140,140,140)` on white is ~3.4:1, below WCAG AA (4.5:1) for normal text.
   If it's used for body copy, darken to ~rgb(95,95,95).
3. **Semantic naming** — 15 hue variables (`--blue-100..400`, `--green-100/200`, ...) with no meaning;
   e.g. `--blue-100` is both the scrollbar thumb and selection background. Rename to roles
   (`--accent-primary`, `--surface-muted`, ...) so theme changes don't break meaning.
4. **Scrollbar hover in red** (`--red-100`, recent commit) reads as an error/alert color in most UIs;
   blue hover (`--blue-200`) was the safer default. Subjective — keep if it's intentional brand play.
5. **Accent sprawl** — red/yellow/pink/green/blue/violet/orange/peach all at full saturation can feel
   busy on dense pages (blog index, projects). Consider designating 1–2 primary accents and muting the rest.

### Recommendations (not applied — design changes need owner sign-off)
- Consolidate theme variables into a single block per theme.
- Introduce semantic tokens mapped to the hues.
- Audit `--gray-300` usage for AA contrast.
- Keep the brutalist scrollbar but reconsider red hover.

## 4. Verdict

Security posture after fixes: no criticals, no secret leaks, API surfaces validated and guarded.
Functional: the only broken page (`/projects`) is fixed and verified live. Design: solid system with
actionable contrast/naming issues documented above. Remaining work is tracked in `plan.md`.
