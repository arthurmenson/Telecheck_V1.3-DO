#!/usr/bin/env bash
set -euo pipefail

BASE=${UAT_API:-"https://api-uat.telecheck.health"}
if [ -z "${UAT_TOKEN:-}" ]; then
  echo "UAT_TOKEN is required" >&2
  exit 1
fi

curl -fsSL -X POST "$BASE/admin/reset" \
  -H "Authorization: Bearer $UAT_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @scripts/fixtures/uat-seed.json

echo "UAT reset + seed complete at $BASE"
