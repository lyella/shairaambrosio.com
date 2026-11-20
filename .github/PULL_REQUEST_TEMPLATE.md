## What changed

<!-- One or two sentences. What does this do, and why now? -->

## Type of change

- [ ] Content only (blog post, project copy, images) — safe to push straight to `main`
- [ ] Code (components, styles, config, dependencies) — needs a passing `verify` check

## Checklist

- [ ] `yarn tsc` passes
- [ ] `yarn lint` passes
- [ ] `yarn format:check` passes
- [ ] `yarn test` passes
- [ ] Checked the affected pages in a browser, not just the build output

## If this touches UI

Which pages, and at which widths?

- [ ] Desktop (1440px)
- [ ] Mobile (390px)
- [ ] Dark theme
- [ ] Light theme

<!-- Screenshots or a short clip help enormously here. -->

## Notes for the reviewer

<!-- Anything surprising, a tradeoff you made, or something you're unsure about.
     Better to flag a doubt than to have it discovered in production. -->

---

## Deployment

Production deploys from `main` are gated on the `verify` workflow via Vercel's
Ignored Build Step (`scripts/deploy-gate.sh`). A red check means no production
deploy — fix forward, or re-run the workflow and redeploy from the Vercel dashboard.
