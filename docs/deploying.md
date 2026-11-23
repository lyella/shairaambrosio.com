# Deploying this site

> **Status: the deploy gate is currently DISABLED (2026-11-23).**
>
> `vercel.json` no longer sets `ignoreCommand`, so every push to `main` deploys.
> The gate remains in the repo (`scripts/deploy-gate.sh`, fully tested) but is not
> wired in.
>
> **Why it was disabled:** it blocked four consecutive good deploys, including the
> fixes meant to repair it. Investigation showed deploys stopped after commit
> `8b99cf2` while earlier commits deployed fine — consistent with the gate failing to
> match the GitHub check run by name once CI started reporting differently. That was
> never confirmed, because the GitHub API is unreachable from the environment this was
> diagnosed in.
>
> **Before re-enabling, verify against a real run:**
>
> 1. Open Actions and note the exact job name for a passing run (it may be `verify`,
>    `verify / verify`, or carry a matrix suffix).
> 2. Compare it with `REQUIRED_CHECK` in `scripts/deploy-gate.sh` (default `verify`).
> 3. Re-add `"ignoreCommand": "bash ./scripts/deploy-gate.sh"` to `vercel.json`.
> 4. Watch exactly one deploy cycle and read the `[deploy-gate]` log line.
>
> CI still runs and reports on every push. It just does not block.

## The original problem

GitHub Actions and Vercel both trigger on a push to `main`, **independently**.
Vercel starts building immediately, so a commit with a failing type-check, lint
error, or broken build still reaches production; CI reports red afterwards.

On 2026-11-19 three broken states went live this way (a wiped `@types/mdx` patch,
broken project tile artwork, an off-centre header) and were each fixed only after
being visible on the live site.

## If you re-enable the gate

`scripts/deploy-gate.sh` is Vercel's **Ignored Build Step**. Vercel's contract:

| Exit | Result           |
| ---- | ---------------- |
| `0`  | build and deploy |
| `1`  | skip the build   |

The gate queries the GitHub check runs for `VERCEL_GIT_COMMIT_SHA` and allows a
production build when the `verify` job concluded `success`.

Preview deployments are **not** gated — a PR must build so it can be reviewed.

### Slow CI does not block the deploy

The gate retries for up to 20 x 30s = **10 minutes**. That budget exists because
`verify` installs, type-checks, lints, tests, generates and runs a full Next build:
measured at 143s of real work locally, plus roughly 90s of install and queue time on
a GitHub runner.

If CI still has not reported by then, the gate **allows the deploy**:

- **CI failed** (conclusion `failure`) → always blocks.
- **CI is slow, or the GitHub API is unreachable** → allows. Freezing a live site
  because a runner was cold is the worse failure of the two.

Set `GATE_STRICT=1` in the Vercel environment to fail closed on timeout instead.

### Test it

```sh
bash ./scripts/test-deploy-gate.sh
```

Seven cases against a stubbed `curl`: success, failure, pending, absent, API error,
failure-blocks, and strict-timeout-blocks. CI runs this too, so the logic cannot
silently rot while it is disabled.

## Configuration

`vercel.json` is the single source of truth, so the setting cannot drift out of the
dashboard:

```json
{ "ignoreCommand": "bash ./scripts/deploy-gate.sh" }
```

Vercel reads `ignoreCommand` from that file automatically — nothing to click.

> If you ever set an Ignored Build Step in the dashboard, the dashboard value wins
> over `vercel.json`. In that case go to Project → Settings → Build and Deployment and
> clear the override, leaving the file authoritative.

## Optional: raise the GitHub API rate limit

Add a `GITHUB_TOKEN` environment variable in Vercel (a fine-grained PAT with
**Checks: read** on this repo). Without it the GitHub API is queried unauthenticated,
which has a low hourly limit shared per IP; with it the gate is reliable under heavy
activity. Not required.

## Why not just branch protection

Branch protection is worth adding regardless (Settings → Branches → require the
`verify` check on `main`), because it stops a bad commit from _entering_ `main`. It is
not a substitute for the gate: it does not stop a direct push when the rule is not
enforced for that account, and it does nothing about a check that goes red after merge.

## When CI is red and deploys are blocked

With the gate disabled this cannot happen. If you re-enable it and CI goes red:

1. Fix the underlying failure and push.
2. If it was a flake, re-run the workflow in the Actions tab, then redeploy from
   Vercel (Deployments → ⋯ → Redeploy).

Avoid bypassing the gate. If you truly must, temporarily remove `ignoreCommand` from
`vercel.json` — but treat that as an incident, not a workflow.
