#!/usr/bin/env bash
# One-command setup for KV-backed rate limiting on Vercel.
#
# What it does:
#   1. Links this repo to its Vercel project (via the git remote)
#   2. Creates a KV store and connects it (adds KV_REST_API_URL / KV_REST_API_TOKEN
#      to the project env automatically)
#   3. Verifies the env vars landed and triggers a production redeploy
#
# Usage:
#   export VERCEL_TOKEN=vca_...        # create at https://vercel.com/account/tokens
#   ./scripts/setup-kv.sh [kv-name]    # default: shairaambrosio-ratelimit
#
# After it finishes, /api/contact and /api/newsletter use the shared KV store
# (lib/rateLimit.ts picks the env vars up automatically; in-memory fallback otherwise).

set -euo pipefail

KV_NAME="${1:-shairaambrosio-ratelimit}"

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "ERROR: VERCEL_TOKEN is not set."
  echo "Create one at https://vercel.com/account/tokens and run:"
  echo "  export VERCEL_TOKEN=vca_... && ./scripts/setup-kv.sh"
  exit 1
fi

cd "$(dirname "$0")/.."

echo "==> Linking repo to Vercel project..."
vercel link --repo -y

echo "==> Creating KV store '$KV_NAME' and connecting it to the project..."
vercel kv create "$KV_NAME" -y

echo "==> Verifying env vars..."
vercel env pull .env.kv-check --yes >/dev/null 2>&1 || true
if grep -q "^KV_REST_API_URL=" .env.kv-check 2>/dev/null && grep -q "^KV_REST_API_TOKEN=" .env.kv-check 2>/dev/null; then
  echo "OK: KV_REST_API_URL and KV_REST_API_TOKEN are set on the project."
  rm -f .env.kv-check
else
  echo "WARN: env vars not found yet — the store may still be provisioning."
  echo "     Check: vercel env ls   (look for KV_REST_API_URL / KV_REST_API_TOKEN)"
  rm -f .env.kv-check
fi

echo "==> Redeploying to production so the new env vars take effect..."
vercel deploy --prod -y --no-wait

echo ""
echo "Done. Rate limiting is now global via KV."
echo "Verify in the Vercel dashboard: Storage -> $KV_NAME -> Data browser;"
echo "after a few /api/contact calls you should see keys like 'ratelimit:contact:<ip>:<window>'."
