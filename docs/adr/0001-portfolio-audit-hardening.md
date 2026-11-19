# ADR-0001: Portfolio audit findings and hardening changes

- **Status:** Accepted
- **Date:** 2026-11-18
- **Deciders:** Shaira Ambrosio (owner), Mistral Vibe (implementing agent)

## Context

The portfolio (Next.js 16 pages router, deployed on Vercel) had not been audited end to end. A combined
security, QA, and UX review was run on 2026-11-18. This ADR records what was found and what was changed
as a result.

## Findings

### Security

| #   | Finding                                                                                 | Severity | Resolution                                                   |
| --- | --------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------ |
| S1  | `next@16.2.10` had 5 critical CVEs (patched in >=16.4.1)                                | Critical | Upgraded to `next@^16.4.1` (installed 16.4.6)                |
| S2  | Transitive `tar` critical (patched in >=7.5.19), build-time only                        | Critical | Pinned via `resolutions` in package.json; 0 criticals remain |
| S3  | `/api/contact` serialized raw server errors (yup internals, SendGrid errors) to clients | High     | Sanitized responses; full errors logged server-side only     |
| S4  | `/api/newsletter` accepted any string as `email` and forwarded it to MailerLite         | High     | Added yup `EMAIL_REGEX` validation                           |
| S5  | API routes accepted any HTTP method                                                     | Medium   | 405 + `Allow` header guards on all three routes              |
| S6  | No secrets in source or git history; `.env*` properly gitignored                        | Info     | No change needed                                             |

### QA / functional

| #   | Finding                                                                                                                                                                                                          | Severity               | Resolution                                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------- |
| Q1  | `/projects` returned 404 in production: `getStaticProps` threw because project thumbnails referenced in `content/projects/*.mdx` do not exist in `public/img/projects/`, and one bad image failed the whole page | Critical (broken page) | Per-image try/catch; missing blur degrades gracefully. Verified 200 after fix |
| Q2  | `build.sh` had CRLF line endings and silently did nothing under Git Bash on Windows                                                                                                                              | Medium                 | Normalized to LF                                                              |
| Q3  | `yarn next build` fails without `--webpack` (Next 16 defaults to Turbopack; config has a webpack block)                                                                                                          | Medium                 | Documented; `build.sh` already passes `--webpack`                             |
| Q4  | 6 pre-existing `tsc --noEmit` errors (Mdx.tsx, generateAlgoliaItems.ts, projects/index.tsx) hidden by `ignoreBuildErrors: true`                                                                                  | Medium                 | Not fixed in this pass; tracked in plan.md                                    |
| Q5  | `countapi-js` view counters are dead (countapi.xyz shut down); every blog page load fires a failing request                                                                                                      | Low                    | Deferred; tracked in plan.md                                                  |
| Q6  | `/about` SSG takes ~37s due to serial external fetches (Spotify/Algolia/CountAPI) at build time                                                                                                                  | Low                    | Deferred; tracked in plan.md                                                  |

### UX / design

See `docs/qa-security-ux-audit-2026-11-18.md` for the full design review. The neo-brutalist system
(hard 2px borders, offset shadows, multi-hue pastel accents) is cohesive and distinctive. Main issues:
the palette is defined twice (media query + `[data-theme="light"]` selector) and `--gray-300`
(rgb(140,140,140) on white, ~3.4:1) fails WCAG AA for body-size text; the red scrollbar hover is a
novelty that reads as an error state. Details in the audit artifact.

## Decision

Apply the security and functional fixes immediately (S1–S5, Q1, Q2). Defer the larger refactors
(countapi removal, dependency migrations, SSG performance, palette consolidation) to follow-up work
tracked in `plan.md`, because they change user-facing behavior or require content assets (thumbnails)
that do not exist in the repo.

## Consequences

- Positive: no critical vulnerabilities remain (`yarn audit --level critical` = 0), `/projects` renders,
  API error responses no longer leak internals, `build.sh` works cross-platform.
- Negative/accepted: 125 high-severity findings remain, almost all in dev-only tooling
  (eslint/husky/ts-node transitive deps) that never ship to browsers; the projects page renders
  without blur placeholders until thumbnails are added; type errors remain masked by
  `ignoreBuildErrors`.
