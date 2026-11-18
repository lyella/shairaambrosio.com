# ADR-0003: security headers

- **Status:** Accepted
- **Date:** 2026-11-18
- **Deciders:** Shaira Ambrosio (owner), Mistral Vibe (implementing agent)
- **Follows:** ADR-0001, ADR-0002

## Context

The site sent no security headers: no CSP, no clickjacking protection, default referrer leakage.
Any XSS or embedded-frame abuse was unmitigated at the browser layer.

## Decision

Add a global `headers()` block in `next.config.js` (source `/:path*`, so pages, API routes and the
PWA service worker are all covered):

- `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` — no framing of the site.
- `X-Content-Type-Options: nosniff` — blocks MIME-sniffing of responses.
- `Referrer-Policy: strict-origin-when-cross-origin` — full URL stays same-origin, only origin leaks cross-origin.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` — deny unused powerful APIs.
- CSP: `default-src 'self'`; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`;
  `img-src 'self' data: blob: https:`; `font-src 'self' data:` (fonts are self-hosted);
  `frame-src https://github.com https://codesandbox.io` (GitHub button + Sandpack embeds);
  `connect-src` allowlists self, GA (google-analytics.com, analytics.google.com, googletagmanager),
  Spotify (accounts/api.spotify.com), MailerLite, Algolia (*.algolia.net, *.algolianet.com),
  Vercel Analytics (va.vercel-scripts.com, *.ingest.vercel.com);
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://va.vercel-scripts.com`.

### Accepted tradeoff

`script-src` needs `'unsafe-inline'` because the pages router injects inline `__NEXT_DATA__` and the
gtag init snippet, and this site does not use CSP nonces. A nonce-based CSP would be stronger against
inline-script XSS but risks breaking hydration/analytics if misconfigured; `frame-ancestors 'none'`,
`object-src 'none'` and `nosniff` still remove the clickjacking/MIME/plugin attack surface. Revisit
nonces if the site moves to the App Router.

## Verification

- `yarn next build --webpack` exits 0 (type-checked).
- `curl -I` on `/`, `/projects`, `/api/newsletter`, `/sw.js` shows all five headers present; pages
  return 200, API guards unchanged (405 on GET).

## Consequences

- Positive: clickjacking, MIME sniffing, referrer leakage and cross-origin script injection are now
  blocked at the browser layer; external `connect-src` is allowlisted, so a compromised inline
  script cannot exfiltrate to arbitrary hosts.
- Accepted: `'unsafe-inline'` in script-src/style-src remains (see tradeoff); GA_TRACKING_ID is unset
  in local builds so gtag paths were verified by source inspection, not live traffic.
