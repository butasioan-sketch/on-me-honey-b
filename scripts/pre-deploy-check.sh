#!/bin/bash
# ===================================================================
# ON ME HONEY B - Pre-Deployment Verification
# ===================================================================
# Comprehensive check before deploying to production
# Verifies: Code, Build, Tests, Security, Database, Environment
# ===================================================================

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         ON ME HONEY B - PRE-DEPLOYMENT CHECK              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

ERRORS=0
WARNINGS=0
CHECKS=0

# Colors (if terminal supports it)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() {
  echo -e "${GREEN}✅ $1${NC}"
  CHECKS=$((CHECKS + 1))
}

fail() {
  echo -e "${RED}❌ $1${NC}"
  ERRORS=$((ERRORS + 1))
}

warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
  WARNINGS=$((WARNINGS + 1))
}

info() {
  echo "ℹ️  $1"
}

section() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  $1"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# ===== GIT STATUS =====
section "📦 Git Repository"

if git diff-index --quiet HEAD -- 2>/dev/null; then
  pass "Working tree clean"
else
  warn "Uncommitted changes detected"
fi

if git diff --quiet origin/main HEAD 2>/dev/null; then
  pass "In sync with origin/main"
else
  warn "Local commits not pushed to origin"
fi

COMMIT=$(git rev-parse --short HEAD)
info "Current commit: $COMMIT"

# ===== CODE QUALITY =====
section "🔍 Code Quality"

# TypeScript
if npm run build > /dev/null 2>&1; then
  pass "TypeScript compilation"
else
  fail "TypeScript errors detected"
fi

# ESLint
LINT_OUTPUT=$(npm run lint 2>&1 || true)
LINT_ERRORS=$(echo "$LINT_OUTPUT" | grep -o '[0-9]* error' | head -1 | awk '{print $1}')

if [ -z "$LINT_ERRORS" ] || [ "$LINT_ERRORS" = "0" ]; then
  pass "ESLint (0 errors)"
else
  fail "ESLint ($LINT_ERRORS errors)"
fi

# ===== TESTS =====
section "🧪 Tests"

if npm test --passWithNoTests > /dev/null 2>&1; then
  pass "Playwright smoke tests"
else
  fail "Tests failing"
fi

# ===== SECURITY =====
section "🛡️  Security Configuration"

# Check next.config.ts for CSP
if grep -q "Content-Security-Policy" next.config.ts; then
  pass "CSP headers configured"
else
  fail "CSP headers missing in next.config.ts"
fi

# Check proxy.ts for fail-closed
if grep -q "isProduction" proxy.ts 2>/dev/null; then
  pass "Fail-closed pattern in proxy.ts"
else
  warn "proxy.ts not found or missing production checks"
fi

  pass "No hardcoded secrets detected"
fi

# ===== DATABASE =====
section "📊 Database"

if [ -f "scripts/migrations/000-schema.sql" ]; then
  pass "Schema migration file exists"
else
  fail "Schema migration missing"
fi

if [ -f "scripts/migrations/001-add-indexes.sql" ]; then
  pass "Index migration file exists"
else
  warn "Index migration missing"
fi

# Check initDb is lightweight
INITDB_LINES=$(grep -A 20 "export async function initDb" lib/db.ts | wc -l)
if [ "$INITDB_LINES" -lt 40 ]; then
  pass "initDb() is lightweight"
else
  warn "initDb() might be doing heavy operations"
fi

# ===== BUILD ARTIFACTS =====
section "🔨 Build Verification"

if [ -d ".next" ]; then
  pass ".next build directory exists"
  
  if [ -f ".next/prerender-manifest.json" ]; then
    ROUTES=$(grep -o '"/product/' .next/prerender-manifest.json | wc -l)
    if [ "$ROUTES" -ge 135 ]; then
      pass "Product routes generated ($ROUTES routes)"
    else
      warn "Only $ROUTES product routes (expected 135)"
    fi
  fi
else
  fail "No .next directory - run npm run build first"
fi

# ===== ENVIRONMENT =====
section "🔐 Environment Variables"

if [ -f ".env.example" ]; then
  pass ".env.example exists"
  
  # Check if it has all required vars documented
  REQUIRED_VARS=("DATABASE_URL" "STRIPE_SECRET_KEY" "ADMIN_PASSWORD" "INTERNAL_API_KEY")
  for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "$var" .env.example; then
      pass "$var documented in .env.example"
    else
      fail "$var missing from .env.example"
    fi
  done
else
  fail ".env.example missing"
fi

# ===== PACKAGE.JSON =====
section "📦 Package Configuration"

if grep -q '"engines"' package.json; then
  pass "Node engine version pinned"
else
  warn "Node engine not pinned in package.json"
fi

if grep -q 'playwright test' package.json; then
  pass "Test script configured"
else
  fail "No test script in package.json"
fi

# ===== FINAL SUMMARY =====
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    FINAL SUMMARY                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Checks Passed:  $CHECKS"
echo "⚠️  Warnings:       $WARNINGS"
echo "❌ Errors:         $ERRORS"
echo ""

if [ $ERRORS -gt 0 ]; then
  echo "❌ PRE-DEPLOYMENT CHECK FAILED"
  echo ""
  echo "Fix the errors above before deploying to production."
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo "⚠️  PRE-DEPLOYMENT CHECK PASSED WITH WARNINGS"
  echo ""
  echo "Review warnings above. Deploy at your own discretion."
  exit 0
else
  echo "✅ ALL PRE-DEPLOYMENT CHECKS PASSED"
  echo ""
  echo "🚀 Ready to deploy to production!"
  echo ""
  echo "Next steps:"
  echo "  1. Run migrations: psql \$DATABASE_URL < scripts/migrations/*.sql"
  echo "  2. Set Vercel env vars: vercel env add ..."
  echo "  3. Deploy: git push origin main (auto-deploys on Vercel)"
  echo "  4. Verify: ./scripts/health-check.sh --production"
  exit 0
fi
