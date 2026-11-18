# ADR-0005: KV-ready rate limiting and project artwork

- **Status:** Accepted
- **Date:** 2026-11-18
- **Deciders:** Shaira Ambrosio (owner), Mistral Vibe (implementing agent)
- **Follows:** ADR-0001..0004

## Context

The rate limiter from ADR-0002 is in-memory, so on Vercel each serverless instance gets its own
budget — a global limit needs shared state. No Vercel access token was available in this
environment, so the KV store could not be created here.

## Decision

1. **`lib/rateLimit.ts` now supports Vercel KV with automatic fallback.** When
   `KV_REST_API_URL` + `KV_REST_API_TOKEN` are set, limits use a fixed-window counter in KV
   (`INCR` + `EXPIRE`, no new dependencies — plain REST calls). If the env vars are absent or KV
   errors, it degrades to the in-memory sliding window instead of failing open. Both API handlers
   now `await rateLimit(...)` (it is async now). `.env-sample` documents the two new vars.
   **To activate the global limit:** create a KV store in the Vercel dashboard (Storage -> KV),
   add the two env vars to the project, redeploy. No code change needed.

2. **Replaced the placeholder project thumbnail** with a proper 1200x880 cover in the site's
   neo-brutalist style (gradient backdrop, motion arcs, play button, floating shapes — generated
   with sharp from SVG, no font dependency). Still a generated asset; swap in real project artwork
   when available.

## Verification

- `yarn tsc` exits 0; `yarn next build --webpack` exits 0.
- Smoke: `/`, `/projects`, `/about` 200; thumbnail 200; contact rate limit still enforced via the
  in-memory fallback (5x 400 then 429). KV path is code-reviewed but not live-tested (no store).

## Consequences

- Positive: one dashboard action away from a true global rate limit; the site keeps working with
  zero configuration locally and on preview deployments.
- Accepted: until the KV store is created, per-instance limiting remains the effective behavior on
  serverless; the thumbnail is generated art, not a real screenshot.
