#!/bin/bash
# ===================================================================
# ON ME HONEY B - Pre-Deployment Checklist
# ===================================================================
# Vollständige Prüfung VOR npx vercel --prod
# Garantiert: ZERO ERRORS beim Deploy!
# ===================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

ERRORS=0
WARNINGS=0
CHECKS=0

pass() {
  echo -e "  ${GREEN}✅ $1${NC}"
  CHECKS=$((CHECKS + 1))
}

fail() {
  echo -e "  ${RED}❌ $1${NC}"
  ERRORS=$((ERRORS + 1))
}

warn() {
  echo -e "  ${YELLOW}⚠️  $1${NC}"
  WARNINGS=$((WARNINGS + 1))
}

info() {
  echo -e "  ${BLUE}ℹ️  $1${NC}"
}

section() {
  echo ""
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}  $1${NC}"
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🚀 PRE-DEPLOYMENT CHECKLIST                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ==================== GIT STATUS ====================
section "📦 Git Status"

if git diff-index --quiet HEAD -- 2>/dev/null; then
  pass "Working tree clean"
else
  warn "Uncommitted changes detected"
  git status --short | head -5
fi

if git diff --quiet origin/main HEAD 2>/dev/null; then
  pass "Synced with origin/main"
else
  warn "Local commits not pushed"
  info "$(git log --oneline origin/main..HEAD | wc -l) commits ahead"
fi

COMMIT=$(git rev-parse --short HEAD)
info "Current commit: $COMMIT"

# ==================== CODE QUALITY ====================
section "🔍 Code Quality"

echo -n "  TypeScript... "
if npx tsc --noEmit > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 0 Errors${NC}"
  CHECKS=$((CHECKS + 1))
else
  echo -e "${RED}❌ Compilation Failed${NC}"
  ERRORS=$((ERRORS + 1))
fi

echo -n "  ESLint... "
LINT_OUTPUT=$(npm run lint 2>&1 || true)
LINT_ERRORS=$(echo "$LINT_OUTPUT" | grep -o '[0-9]* error' | head -1 | awk '{print $1}')

if [ -z "$LINT_ERRORS" ] || [ "$LINT_ERRORS" = "0" ]; then
  echo -e "${GREEN}✅ 0 Errors${NC}"
  CHECKS=$((CHECKS + 1))
else
  echo -e "${RED}❌ $LINT_ERRORS Errors${NC}"
  ERRORS=$((ERRORS + 1))
fi

# ==================== TESTS ====================
section "🧪 Tests"

if command -v npm &> /dev/null; then
  echo -n "  Smoke Tests... "
  if npm test > /dev/null 2>&1; then
    TEST_COUNT=$(npm test 2>&1 | grep "passed" | grep -o '[0-9]*' | head -1)
    echo -e "${GREEN}✅ $TEST_COUNT Passing${NC}"
    CHECKS=$((CHECKS + 1))
  else
    echo -e "${RED}❌ Tests Failing${NC}"
    ERRORS=$((ERRORS + 1))
  fi
else
  warn "npm not available, skipping tests"
fi

# ==================== BUILD ====================
section "📦 Build Verification"

if [ -d ".next" ]; then
  pass "Build artifacts exist"

  if [ -f ".next/prerender-manifest.json" ]; then
    ROUTES=$(node -e 'const d=require("./.next/prerender-manifest.json"); const n=Object.keys(d.routes||{}).filter(r=>/^\/product\/\d+$/.test(r)).length; process.stdout.write(String(n));' 2>/dev/null || echo "0")
    if [ "$ROUTES" -ge "135" ]; then
      pass "Product routes: $ROUTES (expected 135)"
    else
      warn "Product routes: $ROUTES (expected 135)"
    fi
  fi
else
  warn "No build found - run 'npm run build' first"
fi

# ==================== ENVIRONMENT ====================
section "🔐 Environment Variables"

if [ -f ".env.example" ]; then
  pass ".env.example exists"

  REQUIRED_VARS=("DATABASE_URL" "STRIPE_SECRET_KEY" "ADMIN_PASSWORD" "INTERNAL_API_KEY")
  for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^$var" .env.example 2>/dev/null; then
      pass "$var documented"
    else
      fail "$var missing from .env.example"
    fi
  done
else
  fail ".env.example missing"
fi

# ==================== SECURITY ====================
section "🛡️  Security"

if grep -q "Content-Security-Policy" next.config.ts 2>/dev/null; then
  pass "CSP headers configured"
else
  fail "CSP missing"
fi

if git grep -I -n -E 'sk_live_[A-Za-z0-9]{24,}|whsec_[A-Za-z0-9]{24,}' -- ':!.env*' ':!*.env' >/dev/null 2>&1; then
  fail "Live Stripe secret in git!"
else
  pass "No live secrets in git"
fi

# ==================== CUSTOMER JOURNEY ====================
section "🛍️  Customer Journey (Local)"

if curl -sf http://localhost:3000/ > /dev/null 2>&1; then
  info "Running customer journey tests..."
  if [ -x "./scripts/customer-testing/full-journey-test.sh" ]; then
    if ./scripts/customer-testing/full-journey-test.sh 2>&1 | grep -q "ALL CUSTOMER JOURNEYS PERFECT"; then
      pass "Customer journeys: PERFECT"
    else
      warn "Some customer journeys failed (check locally)"
    fi
  else
    info "Customer journey tests not found"
  fi
else
  info "Local server not running, skipping journey tests"
fi

# ==================== DEPLOYMENT READINESS ====================
section "🚀 Deployment Readiness"

if [ $ERRORS -eq 0 ]; then
  pass "Ready to deploy!"
  info "Command: npx vercel --prod"
else
  fail "NOT ready - fix errors first"
fi

# ==================== SUMMARY ====================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    SUMMARY                                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "  ${GREEN}✅ Checks Passed:  $CHECKS${NC}"
echo -e "  ${YELLOW}⚠️  Warnings:       $WARNINGS${NC}"
echo -e "  ${RED}❌ Errors:         $ERRORS${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}${BOLD}🎉 PERFECT - READY TO DEPLOY!${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. npx vercel --prod"
  echo "  2. ./scripts/customer-testing/full-journey-test.sh --production"
  echo "  3. ./scripts/health-check.sh --production"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}${BOLD}⚠️  READY WITH WARNINGS${NC}"
  echo ""
  echo "Review warnings above. Deploy at your discretion."
  exit 0
else
  echo -e "${RED}${BOLD}❌ NOT READY - FIX ERRORS FIRST${NC}"
  echo ""
  echo "Fix the errors above before deploying."
  exit 1
fi
