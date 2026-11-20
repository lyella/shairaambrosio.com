#!/bin/bash
# Run the deploy-gate test matrix with a stubbed curl.
#
# The gate decides whether production deploys, so each branch is exercised against a
# fake GitHub response instead of being assumed correct.
cd "$(dirname "$0")/.." || exit 1

pass=0
fail=0

run_case() {
  local label="$1" expect="$2" env_json="$3" conclusion="$4" attempts="${5:-1}"
  local payload

  case "$conclusion" in
    success)    payload='{"total_count":1,"check_runs":[{"name":"verify","status":"completed","conclusion":"success"}]}' ;;
    failure)    payload='{"total_count":1,"check_runs":[{"name":"verify","status":"completed","conclusion":"failure"}]}' ;;
    pending)    payload='{"total_count":1,"check_runs":[{"name":"verify","status":"in_progress"}]}' ;;
    absent)     payload='{"total_count":0,"check_runs":[]}' ;;
    http500)    payload='__500__' ;;
  esac

  local out exit_code
  out=$(
    STUB_PAYLOAD="$payload" \
    VERCEL_ENV="$env_json" \
    VERCEL_GIT_COMMIT_SHA=abc1234 \
    GATE_ATTEMPTS="$attempts" \
    GATE_SLEEP=1 \
    bash -c '
      curl() {
        if [ "$STUB_PAYLOAD" = "__500__" ]; then printf "\n500"; else printf "%s\n200" "$STUB_PAYLOAD"; fi
      }
      export -f curl
      export STUB_PAYLOAD
      bash scripts/deploy-gate.sh
    ' 2>&1
  )
  exit_code=$?

  if [ "$exit_code" = "$expect" ]; then
    echo "  PASS  ${label} (exit ${exit_code})"
    pass=$((pass + 1))
  else
    echo "  FAIL  ${label}: expected exit ${expect}, got ${exit_code}"
    echo "$out" | sed 's/^/        /'
    fail=$((fail + 1))
  fi
}

echo "== deploy gate =="

# Not triggered by git at all: nothing to gate.
out=$(VERCEL_ENV= bash scripts/deploy-gate.sh 2>&1); code=$?
if [ "$code" = "0" ]; then echo "  PASS  no SHA allows build"; pass=$((pass + 1)); else echo "  FAIL  no SHA"; fail=$((fail + 1)); fi

# Previews must build even when CI is red, so a PR can be reviewed.
out=$(VERCEL_ENV=preview VERCEL_GIT_COMMIT_SHA=abc1234 bash scripts/deploy-gate.sh 2>&1); code=$?
if [ "$code" = "0" ]; then echo "  PASS  preview allows build"; pass=$((pass + 1)); else echo "  FAIL  preview"; fail=$((fail + 1)); fi

run_case "production + success deploys"   0 production success
run_case "production + failure blocked"   1 production failure
run_case "production + pending blocked"   1 production pending 2
run_case "production + check absent"      1 production absent 2
run_case "production + GitHub 500 blocked" 1 production http500 2

echo
echo "passed: ${pass}  failed: ${fail}"
[ "$fail" -eq 0 ]
