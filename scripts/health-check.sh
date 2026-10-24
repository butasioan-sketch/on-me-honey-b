#!/bin/bash
# ===================================================================
# ON ME HONEY B - Comprehensive System Health Check
# ===================================================================
# Usage: ./scripts/health-check.sh [--production]
# ===================================================================

set -e

PROD_URL="https://on-me-honey-b.vercel.app"
LOCAL_URL="http://localhost:3000"
ENV=${1:-"local"}

if [ "$1" = "--production" ]; then
  BASE_URL=$PROD_URL
  echo "🌍 PRODUCTION Health Check: $PROD_URL"
else
  BASE_URL=$LOCAL_URL
  echo "💻 LOCAL Health Check: $LOCAL_URL"
fi

echo ""
echo "=== 🏥 SYSTEM HEALTH CHECK ==="
echo ""

PASS=0
WARN=0
FAIL=0

check() {
  local name="$1"
  local url="$2"
  local expected="$3"
  
  status=$(curl -sS -o /dev/null -w "%{http_code}" "$url" 2>&1 || echo "000")
  
  if [ "$status" = "$expected" ]; then
    echo "✅ $name: $status"
    PASS=$((PASS + 1))
  elif [ "$status" = "000" ]; then
    echo "❌ $name: UNREACHABLE"
    FAIL=$((FAIL + 1))
  else
    echo "⚠️  $name: $status (expected $expected)"
    WARN=$((WARN + 1))
  fi
}

# === CORE ROUTES ===
echo "📄 Core Routes:"
check "Homepage" "$BASE_URL/" "200"
check "Product Tee" "$BASE_URL/product/1" "200"
check "Product Shorts" "$BASE_URL/product/2" "200"
check "Catalog 001" "$BASE_URL/product/001" "200"
check "Catalog 015" "$BASE_URL/product/015" "200"
check "Catalog 133" "$BASE_URL/product/133" "200"
check "Invalid 999" "$BASE_URL/product/999" "404"
echo ""

# === SECURITY HEADERS ===
if [ "$1" = "--production" ]; then
  echo "🛡️  Security Headers:"
  
  headers=$(curl -sI "$BASE_URL/" 2>&1 | tr '[:upper:]' '[:lower:]')
  
  if echo "$headers" | grep -q "content-security-policy:"; then
    echo "✅ CSP Header"
    PASS=$((PASS + 1))
  else
    echo "❌ CSP Missing"
    FAIL=$((FAIL + 1))
  fi
  
  if echo "$headers" | grep -q "x-frame-options: deny"; then
    echo "✅ X-Frame-Options"
    PASS=$((PASS + 1))
  else
    echo "⚠️  X-Frame-Options"
    WARN=$((WARN + 1))
  fi
  
  if echo "$headers" | grep -q "x-content-type-options: nosniff"; then
    echo "✅ X-Content-Type"
    PASS=$((PASS + 1))
  else
    echo "⚠️  X-Content-Type"
    WARN=$((WARN + 1))
  fi
  echo ""
fi

# === ASSETS ===
echo "📦 Static Assets:"
check "GLB Tee" "$BASE_URL/models/shirt-white-v2.glb" "200"
check "GLB Shorts" "$BASE_URL/models/shorts-white-v1.glb" "200"
check "Image Front" "$BASE_URL/airfit-front.png" "200"
echo ""

# === APIs ===
echo "🔌 API Endpoints:"
check "Reviews GET" "$BASE_URL/api/reviews?status=approved" "200"
check "Admin 401" "$BASE_URL/admin" "401"
echo ""

# === BUILD ===
if [ "$ENV" != "--production" ] && [ -f ".next/BUILD_ID" ]; then
  echo "🔨 Build:"
  echo "   ID: $(cat .next/BUILD_ID)"
  if [ -f ".next/prerender-manifest.json" ]; then
    routes=$(grep -o '"/product/' .next/prerender-manifest.json | wc -l)
    echo "   Routes: $routes"
  fi
  echo ""
fi

# === SUMMARY ===
echo "================================"
echo "📊 SUMMARY"
echo "================================"
echo "✅ Pass: $PASS | ⚠️  Warn: $WARN | ❌ Fail: $FAIL"
echo "================================"

if [ $FAIL -gt 0 ]; then
  echo "❌ FAILED"
  exit 1
elif [ $WARN -gt 0 ]; then
  echo "⚠️  PASSED (warnings)"
  exit 0
else
  echo "✅ ALL HEALTHY"
  exit 0
fi
