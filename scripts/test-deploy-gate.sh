#!/bin/bash
# Test the deploy gate's decision matrix with a stubbed curl.
#
# The gate decides whether production deploys, so every branch is exercised rather than
# assumed. The two cases that matter most:
#   - a failing CI run must BLOCK (the whole point of the gate)
#   - a timeout must NOT block (CI being slow is not CI being broken)
cd "$(dirname "$0")/.." || exit 1

pass=0
fail=0

check() {
  local label="$1" expect="$2" payload="$3" strict="${4:-0}"
  local out code

  out=$(
    STUB_PAYLOAD="$payload" \
    VERCEL=1 \
    VERCEL_ENV="production" \
    VERCEL_GIT_COMMIT_SHA="abc1234def" \
    GATE_ATTEMPTS="2" \
    GATE_SLEEP="0" \
    GATE_STRICT="$strict" \
    bash -c '
      curl() {
        if [ "$STUB_PAYLOAD" = "__500__" ]; then printf "\n500"; else printf "%s\n200" "$STUB_PAYLOAD"; fi
      }
      export -f curl
      export STUB_PAYLOAD
      bash scripts/deploy-gate.sh
    ' 2>&1
  )
  code=$?

  if [ "$code" = "$expect" ]; then
    echo "  PASS  ${label} (exit ${code})"
    pass=$((pass + 1))
  else
    echo "  FAIL  ${label}: expected exit ${expect}, got ${code}"
    echo "$out" | sed 's/^/        /'
    fail=$((fail + 1))
  fi
}

SUCCESS='{"total_count":1,"check_runs":[{"name":"verify","status":"completed","conclusion":"success"}]}'
FAILURE='{"total_count":1,"check_runs":[{"name":"verify","status":"completed","conclusion":"failure"}]}'
PENDING='{"total_count":1,"check_runs":[{"name":"verify","status":"in_progress"}]}'
ABSENT='{"total_count":0,"check_runs":[]}'

echo "== deploy gate =="

check "CI success -> deploy"                 0 "$SUCCESS"
check "CI failure -> BLOCK"                  1 "$FAILURE"
check "CI pending -> wait, then allow"       0 "$PENDING"
check "CI never appears -> allow"            0 "$ABSENT"
check "GitHub API error -> allow"            0 "__500__"

# A real failure must block even when the timeout policy is permissive.
check "CI failure still blocks (strict off)" 1 "$FAILURE"

# Strict mode restores fail-closed on timeout for anyone who wants it.
check "timeout with GATE_STRICT=1 -> BLOCK"  1 "$PENDING" "1"

echo
echo "passed: ${pass}  failed: ${fail}"
[ "$fail" -eq 0 ]
