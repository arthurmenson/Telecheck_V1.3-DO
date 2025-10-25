#!/bin/bash
# Script to verify no hardcoded secrets remain in the codebase
# Run this before committing or deploying to production

echo "🔍 Scanning for hardcoded secrets in Telecheck codebase..."
echo "=================================================="

FOUND_ISSUES=0

# Define patterns to search for
PATTERNS=(
  "password.*=.*['\"][^'\"\$]"
  "secret.*=.*['\"][^'\"\$]"
  "api.key.*=.*['\"][^'\"\$]"
  "token.*=.*['\"][^'\"\$]"
  "CHANGE_THIS_IN_PRODUCTION"
  "dev-secret-key"
  "dev_api_key"
  "telecheck_hcw_shared_secret"
)

# Directories and files to exclude
EXCLUDE=(
  "node_modules"
  "dist"
  "*.log"
  "*.md"
  "*.test.*"
  "*.spec.*"
  ".git"
  "scripts/verify-no-secrets.sh"
)

# Build exclude arguments
EXCLUDE_ARGS=""
for pattern in "${EXCLUDE[@]}"; do
  EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude-dir=$pattern"
done

echo ""
echo "Checking for forbidden secret patterns..."
echo ""

for pattern in "${PATTERNS[@]}"; do
  echo "Searching for: $pattern"
  results=$(grep -r -i -E "$pattern" . $EXCLUDE_ARGS --exclude="*.example" --exclude="*.template" 2>/dev/null || true)

  if [ ! -z "$results" ]; then
    echo "  ⚠️  FOUND:"
    echo "$results" | head -10
    FOUND_ISSUES=1
  else
    echo "  ✓ OK"
  fi
done

echo ""
echo "Checking for .env files in git..."
env_files=$(git ls-files | grep -E "\.env$|production\.env$|local\.env$" || true)
if [ ! -z "$env_files" ]; then
  echo "  ⚠️  FOUND .env files in git:"
  echo "$env_files"
  FOUND_ISSUES=1
else
  echo "  ✓ No .env files in git"
fi

echo ""
echo "Checking for weak passwords in documentation..."
doc_passwords=$(grep -r -i "password.*=.*password" docs/ 2>/dev/null | grep -v "your-password" || true)
if [ ! -z "$doc_passwords" ]; then
  echo "  ⚠️  FOUND weak passwords in docs:"
  echo "$doc_passwords"
  echo "  (Note: Docs should use placeholders like 'your-password')"
fi

echo ""
echo "=================================================="
if [ $FOUND_ISSUES -eq 1 ]; then
  echo "❌ FAILED: Potential hardcoded secrets found!"
  echo ""
  echo "Action required:"
  echo "1. Remove or replace hardcoded secrets with environment variables"
  echo "2. Ensure .env files are in .gitignore"
  echo "3. Generate secure secrets using:"
  echo "   node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
  exit 1
else
  echo "✅ PASSED: No obvious hardcoded secrets found"
  echo ""
  echo "Note: This is an automated check. Manual review is still recommended."
  exit 0
fi
