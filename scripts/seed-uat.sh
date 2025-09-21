#!/usr/bin/env bash
set -euo pipefail
BASE=${VITE_API_BASE:-https://api-uat.telecheck.health}
if [ -z "${UAT_TOKEN:-}" ]; then echo "UAT_TOKEN required"; exit 1; fi
curl -s -X POST "$BASE/admin/seed" -H "Authorization: Bearer $UAT_TOKEN" \
  -H "Content-Type: application/json" -d @scripts/fixtures/uat-seed.json
echo "\nSeeded UAT"
