#!/bin/bash
# ===================================================================
# ON ME HONEY B - Environment Variables Verification
# ===================================================================
# Verifies all required environment variables are set
# Usage: ./scripts/verify-env.sh [--local|--vercel]
# ===================================================================

MODE=${1:-"--local"}

echo "=== 🔐 ENVIRONMENT VARIABLES CHECK ==="
echo ""

# Required vars from INFRA P1 3.3
REQUIRED_VARS=(
  "DATABASE_URL"
  "STRIPE_SECRET_KEY"
  "STRIPE_WEBHOOK_SECRET"
  "ADMIN_PASSWORD"
  "INTERNAL_API_KEY"
  "CRON_SECRET"
  "RESEND_API_KEY"
  "ADMIN_ALERT_EMAIL"
  "NEXT_PUBLIC_SITE_URL"
)

# Optional but recommended
OPTIONAL_VARS=(
  "ANTHROPIC_API_KEY"
  "NEXT_PUBLIC_LEGAL_COMPANY_NAME"
  "NEXT_PUBLIC_LEGAL_ADDRESS"
  "NEXT_PUBLIC_LEGAL_EMAIL"
)

PASS=0
MISSING=0
WARN=0

check_var() {
  local var_name="$1"
  local is_required="$2"
  
  if [ "$MODE" = "--local" ]; then
    # Check local .env.local
    if [ -f ".env.local" ] && grep -q "^${var_name}=" .env.local 2>/dev/null; then
      value=$(grep "^${var_name}=" .env.local | cut -d'=' -f2-)
      if [ -n "$value" ] && [ "$value" != "..." ]; then
        echo "✅ $var_name (local)"
        PASS=$((PASS + 1))
      else
        if [ "$is_required" = "required" ]; then
          echo "❌ $var_name (empty or placeholder)"
          MISSING=$((MISSING + 1))
        else
          echo "⚠️  $var_name (optional, not set)"
          WARN=$((WARN + 1))
        fi
      fi
    else
      if [ "$is_required" = "required" ]; then
        echo "❌ $var_name (not found)"
        MISSING=$((MISSING + 1))
      else
        echo "⚠️  $var_name (optional, not set)"
        WARN=$((WARN + 1))
      fi
    fi
  else
    echo "💡 $var_name (run: vercel env ls to verify)"
  fi
}

if [ "$MODE" = "--local" ]; then
  if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found!"
    echo ""
    echo "📝 Create it from template:"
    echo "   cp .env.example .env.local"
    echo "   # Then fill in your values"
    exit 1
  fi
  echo "📍 Checking .env.local"
else
  echo "📍 Vercel Environment Variables"
  echo ""
  echo "🔍 Run this to list Vercel vars:"
  echo "   vercel env ls"
  echo ""
  echo "💡 Required variables that must be set in Vercel:"
fi

echo ""
echo "🔑 Required Variables:"
for var in "${REQUIRED_VARS[@]}"; do
  check_var "$var" "required"
done

echo ""
echo "📌 Optional Variables:"
for var in "${OPTIONAL_VARS[@]}"; do
  check_var "$var" "optional"
done

echo ""
echo "================================"
echo "📊 SUMMARY"
echo "================================"
echo "✅ Set: $PASS"
echo "⚠️  Optional Missing: $WARN"
echo "❌ Required Missing: $MISSING"
echo "================================"

if [ $MISSING -gt 0 ]; then
  echo ""
  echo "❌ FAILED - Missing required variables"
  echo ""
  echo "📚 See .env.example for:"
  echo "   - Example values"
  echo "   - How to generate secrets"
  echo "   - Deployment checklist"
  exit 1
else
  echo ""
  echo "✅ All required variables set!"
  if [ $WARN -gt 0 ]; then
    echo "⚠️  $WARN optional variables not set (this is OK)"
  fi
  exit 0
fi
