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

# TypeScript only. Production build happens on Vercel, not in this script.
if npx tsc --noEmit > /dev/null 2>&1; then
  pass "TypeScript"
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

if curl -sf -o /dev/null --max-time 3 "http://localhost:3000/"; then
  if npm test > /dev/null 2>&1; then
    pass "Playwright smoke tests"
  else
    fail "Tests failing"
  fi
else
  warn "Smoke tests skipped. No server on localhost:3000"
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

# Real Stripe values are long. Short placeholders and this pattern itself do not match.
# .env files stay out of the search.
if git grep -I -n -E 'sk_live_[A-Za-z0-9]{24,}|whsec_[A-Za-z0-9]{24,}' -- ':!.env*' ':!*.env' >/dev/null 2>&1; then
  fail "Live Stripe secret found in git"
else
  pass "No live Stripe secret in git"
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

# initDb must stay a health check. Schema changes belong in the SQL files.
INITDB=$(grep -A 25 "export async function initDb" lib/db.ts || true)
if echo "$INITDB" | grep -q "SELECT 1 FROM orders" && ! echo "$INITDB" | grep -q "CREATE TABLE"; then
  pass "initDb() only checks that orders exists"
else
  warn "initDb() is not a simple orders health check"
fi

# ===== BUILD ARTIFACTS =====
section "🔨 Build Verification"

# 133 catalog SKUs plus shop ids /product/1 and /product/2. test-zones is not part of that count.
if [ -f ".next/prerender-manifest.json" ]; then
  ROUTES=$(node -e 'const d=require("./.next/prerender-manifest.json"); const n=Object.keys(d.routes||{}).filter(r=>/^\/product\/\d+$/.test(r)).length; process.stdout.write(String(n));')
  if [ "$ROUTES" -eq 135 ]; then
    pass "135 numeric product routes in the last local build"
  else
    warn "Last local build has $ROUTES numeric product routes (expected 135)"
  fi
else
  warn "No local .next build. Product routes are not counted here."
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

if grep -q '"node": ">=20"' package.json; then
  pass "Node engine is >=20"
else
  warn "Node engine in package.json is not >=20"
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
  echo "  1. Deploy with: npx vercel --prod"
  echo "  2. A git push does not deploy this project"
  echo "  3. Verify: ./scripts/health-check.sh --production"
  exit 0
fi
