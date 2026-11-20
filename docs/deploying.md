# Deploying this site

## The problem this solves

GitHub Actions and Vercel both trigger on a push to `main`, **independently**.
Vercel starts building immediately, so a commit with a failing type-check, lint
error, or broken build still reached production; CI reported red afterwards.

On 2026-11-19 three broken states went live this way (a wiped `@types/mdx` patch,
broken project tile artwork, an off-centre header) and were each fixed only after
being visible on the live site.

## How it works now

`scripts/deploy-gate.sh` is wired into Vercel as the project's **Ignored Build
Step**. Vercel's contract for that command is:

| Exit | Result           |
| ---- | ---------------- |
| `0`  | build and deploy |
| `1`  | skip the build   |

The gate queries the GitHub check runs for `VERCEL_GIT_COMMIT_SHA` and only allows a
production build when the `verify` job concluded `success`. It retries briefly to
absorb the race where Vercel evaluates before GitHub has registered the check.

Preview deployments are **not** gated — a PR must build so it can be reviewed.

## Configuration

`vercel.json` sets it, so it lives in the repo and cannot drift out of the dashboard:

```json
{ "ignoreCommand": "bash ./scripts/deploy-gate.sh" }
```

Vercel reads `ignoreCommand` from `vercel.json` automatically. There is **nothing to
click**. Pushing this file is the whole setup.

> If you previously set an Ignored Build Step in the dashboard, the dashboard value
> wins over `vercel.json`. In that case go to Project → Settings → Build and
> Deployment and clear the override, leaving the file as the single source of truth.

Preview deployments are **not** gated — a PR must build so it can be reviewed.

## Optional: raise the GitHub API rate limit

Add a `GITHUB_TOKEN` environment variable in Vercel (a fine-grained PAT with
**Checks: read** on this repo). Without it the GitHub API is queried unauthenticated,
which has a low hourly limit shared per IP; with it the gate is reliable under heavy
activity. Not required to get started.

## Verifying it

```sh
bash ./scripts/test-deploy-gate.sh
```

Runs the full matrix against a stubbed `curl`: success, failure, pending, absent
check, and an API error. Seven cases, all expected to pass. CI runs this on every
push so the gate's logic cannot silently rot.

To test the real thing: push a commit that intentionally fails `yarn tsc`, and
confirm the Vercel deployment is skipped with `verify FAILED ... refusing to deploy`.
Revert afterwards.

## Why not just branch protection

Branch protection is still worth adding (Settings → Branches → require the `verify`
check on `main`), because it stops a bad commit from _entering_ `main` at all. But it
is not a substitute: it does not stop someone pushing directly to `main` when the
rule is not enforced for their account, and it does nothing about a check that goes
red _after_ the merge. The Ignored Build Step is the actual deploy barrier; branch
protection is the earlier, cheaper filter.

## When CI is red and you need to ship

The gate will refuse. The correct fixes, in order:

1. Fix the underlying failure and push.
2. If it was a flake, re-run the workflow in the Actions tab, then redeploy from
   Vercel (Deployments → ⋯ → Redeploy).

Avoid bypassing the gate. If you genuinely must, temporarily disable the Ignored
Build Step in the dashboard and re-enable it immediately after — but treat that as an
incident, not a workflow.
