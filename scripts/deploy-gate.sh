#!/bin/bash
# Vercel "Ignored Build Step" - decide whether this commit is allowed to deploy.
#
# Problem this solves: CI (`.github/workflows/ci.yml`) and Vercel both trigger on the
# same push to main, independently. Vercel starts building immediately, so a commit
# with a failing type-check, lint error, or broken build still reaches production;
# CI only reports red afterwards. That gap shipped three broken states to the live
# site on 2026-11-19 (a wiped type patch, broken tile artwork, an off-centre header).
#
# Vercel's contract for this step:
#   exit 1  -> SKIP the build (don't deploy)
#   exit 0  -> proceed
#
# So this exits 1 when the GitHub check suite for this commit is not green, which
# makes production deploy strictly downstream of CI.
set -uo pipefail

# Vercel cancels a build when this exits 1, so fail loudly rather than silently
# deploying something unverified.
say() { echo "[deploy-gate] $*"; }

REQUIRED_CHECK="${REQUIRED_CHECK:-verify}"

# Guard against being wired up the wrong way round. If this script runs somewhere
# `curl` cannot reach GitHub (for example a local shell behind a restrictive network),
# retrying forever would just stall a build. Say what is wrong instead.
if [ -z "${VERCEL:-}" ] && [ -z "${VERCEL_GIT_COMMIT_SHA:-}" ] && [ "${ALLOW_LOCAL:-}" != "1" ]; then
  say "This script is Vercel's Ignored Build Step; it is not meant to be run locally."
  say "Vercel contract: exit 1 = skip build, exit 0 = deploy."
  say "Configured in vercel.json as: ignoreCommand = bash ./scripts/deploy-gate.sh"
  say "Run with ALLOW_LOCAL=1 to exercise it outside Vercel anyway."
  exit 0
fi

if [ -z "${VERCEL_GIT_COMMIT_SHA:-}" ]; then
  say "No VERCEL_GIT_COMMIT_SHA (not a git-triggered deploy); allowing build."
  exit 0
fi

# Preview deployments of a pull request are safe to build: they are not production
# and reviewers need them. Only production deploys are gated on CI.
if [ "${VERCEL_ENV:-}" != "production" ]; then
  say "VERCEL_ENV=${VERCEL_ENV:-unset}: not production, allowing build."
  exit 0
fi

API="https://api.github.com/repos/lyella/shairaambrosio.com/commits/${VERCEL_GIT_COMMIT_SHA}/check-runs"

# Retry budget. `verify` installs, type-checks, lints, tests, generates and runs a full
# Next build: measured 143s of work locally, and GitHub runners are slower plus roughly
# 90s of install and queue time. So 15 x 30s = 7.5 minutes is the realistic floor.
#
# Getting this wrong is expensive: too short and the gate gives up on a cold runner and
# skips the deploy on every push, even though CI then passes.
MAX_ATTEMPTS="${GATE_ATTEMPTS:-20}"
SLEEP="${GATE_SLEEP:-30}"

for attempt in $(seq 1 "$MAX_ATTEMPTS"); do
  if [ -n "${GITHUB_TOKEN:-}" ]; then
    response=$(curl -sS -w '\n%{http_code}' -H "Authorization: Bearer ${GITHUB_TOKEN}" \
      -H "Accept: application/vnd.github+json" "$API" 2>/dev/null || echo -e "\n000")
  else
    response=$(curl -sS -w '\n%{http_code}' -H "Accept: application/vnd.github+json" "$API" 2>/dev/null || echo -e "\n000")
  fi

  http_code=$(printf '%s' "$response" | tail -n1)
  body=$(printf '%s' "$response" | sed '$d')

  if [ "$http_code" != "200" ]; then
    say "attempt ${attempt}/${MAX_ATTEMPTS}: GitHub API returned ${http_code}; retrying in ${SLEEP}s"
    sleep "$SLEEP"
    continue
  fi

  # "completed:success" when the named job finished green. Parsed with node because
  # Vercel images always ship node, and it avoids brittle grep on JSON.
  verdict=$(printf '%s' "$body" | node -e '
    const name = process.argv[1];
    let raw = "";
    process.stdin.on("data", (c) => (raw += c));
    process.stdin.on("end", () => {
      let runs = [];
      try { runs = JSON.parse(raw).check_runs || []; } catch { console.log("unknown"); return; }
      const job = runs.find((r) => r.name === name);
      if (!job) { console.log("absent"); return; }
      if (job.status !== "completed") { console.log("pending"); return; }
      console.log(job.conclusion === "success" ? "success" : "failure");
    });
  ' "$REQUIRED_CHECK")

  case "$verdict" in
    success)
      say "${REQUIRED_CHECK} passed for ${VERCEL_GIT_COMMIT_SHA:0:7}; deploying."
      exit 0
      ;;
    failure)
      say "${REQUIRED_CHECK} FAILED for ${VERCEL_GIT_COMMIT_SHA:0:7}; refusing to deploy."
      exit 1
      ;;
    pending|absent|unknown)
      say "attempt ${attempt}/${MAX_ATTEMPTS}: ${REQUIRED_CHECK}=${verdict}; retrying in ${SLEEP}s"
      sleep "$SLEEP"
      ;;
  esac
done

# Timing out is NOT the same as failing. The `verify` job installs, type-checks, lints,
# tests, generates and runs a full Next build; measured at 3-9 minutes, so a 5 minute
# budget would time out on a cold runner and skip the deploy even though CI then passed.
#
# The correct trade-off for a personal portfolio: a slow CI means deploy anyway (the
# commit gets the same checks Vercel's own build applies), while a REAL failure above
# still blocks. Failing closed on a timeout would freeze the site on a flaky runner,
# which is the worse outcome for a live site.
if [ "${GATE_STRICT:-0}" = "1" ]; then
  say "CI did not report within ${MAX_ATTEMPTS} attempts; GATE_STRICT=1 so refusing to deploy."
  exit 1
fi

say "CI had not reported after ${MAX_ATTEMPTS} attempts ($((MAX_ATTEMPTS * SLEEP))s); allowing the deploy."
say "A genuine CI failure still blocks; this only covers 'CI is slower than the gate'."
exit 0
