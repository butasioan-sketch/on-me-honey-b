#!/bin/bash
# ===================================================================
# ON ME HONEY B - Complete Customer Journey Test
# ===================================================================
# Testet ALLE Customer Touchpoints wie ein echter Kunde
# Usage: ./scripts/customer-testing/full-journey-test.sh [--production]
# ===================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ "$1" = "--production" ]; then
  BASE_URL="https://on-me-honey-b.vercel.app"
  echo -e "${BLUE}🔍 Testing PRODUCTION${NC}"
else
  BASE_URL="http://localhost:3000"
  echo -e "${BLUE}🔍 Testing LOCAL${NC}"
fi

PASSED=0
FAILED=0

test_url() {
  local name=$1
  local url=$2
  local expected=$3

  echo -n "  Testing $name... "
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")

  if [ "$STATUS" = "$expected" ]; then
    echo -e "${GREEN}✅ $STATUS${NC}"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}❌ Got $STATUS, expected $expected${NC}"
    FAILED=$((FAILED + 1))
  fi
}

test_content() {
  local name=$1
  local url=$2
  local search=$3

  echo -n "  Testing $name contains '$search'... "
  CONTENT=$(curl -s "$url" 2>/dev/null || echo "")

  if echo "$CONTENT" | grep -q "$search"; then
    echo -e "${GREEN}✅ Found${NC}"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}❌ Not found${NC}"
    FAILED=$((FAILED + 1))
  fi
}

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🛍️  CUSTOMER JOURNEY - COMPLETE TEST                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ==================== PHASE 1: LANDING ====================
echo -e "${BLUE}━━━ PHASE 1: KUNDE LANDET AUF HOMEPAGE ━━━${NC}"
test_url "Homepage" "$BASE_URL/" "200"
test_content "Homepage Tee Foto" "$BASE_URL/" "airfit-front-t.png"
test_content "Homepage Shorts Foto" "$BASE_URL/" "airfit-shorts-front.png"
test_content "Homepage no 404 photo" "$BASE_URL/" "airfit-tee-front.png" && FAILED=$((FAILED + 1)) PASSED=$((PASSED - 1)) || { echo -e "  ${GREEN}✅ No broken photo reference${NC}"; PASSED=$((PASSED + 1)); }
test_content "Homepage Preis Tee" "$BASE_URL/" "44.99"
test_content "Homepage Preis Shorts" "$BASE_URL/" "39.99"
echo ""

# ==================== PHASE 2: PRODUKT EXPLORATION ====================
echo -e "${BLUE}━━━ PHASE 2: KUNDE ERKUNDET PRODUKTE ━━━${NC}"
test_url "Produkt 1 (Tee)" "$BASE_URL/product/1" "200"
test_url "Produkt 2 (Shorts)" "$BASE_URL/product/2" "200"
test_content "Tee zeigt AirFit" "$BASE_URL/product/1" "AirFit"
test_content "Shorts zeigt Shorts" "$BASE_URL/product/2" "Shorts"
echo ""

# ==================== PHASE 3: CATALOG BROWSING ====================
echo -e "${BLUE}━━━ PHASE 3: KUNDE BROWST CATALOG ━━━${NC}"
for sku in 001 015 025 051 075 100 133; do
  test_url "SKU $sku" "$BASE_URL/product/$sku" "200"
done
test_url "Invalid SKU (999)" "$BASE_URL/product/999" "404"
echo ""

# ==================== PHASE 4: ASSETS LOADING ====================
echo -e "${BLUE}━━━ PHASE 4: KUNDE SIEHT 3D & BILDER ━━━${NC}"
test_url "Tee 3D Model" "$BASE_URL/models/shirt-white-v2.glb" "200"
test_url "Shorts 3D Model" "$BASE_URL/models/shorts-white-v1.glb" "200"
test_url "Tee Foto Front" "$BASE_URL/airfit-front-t.png" "200"
test_url "Shorts Foto Front" "$BASE_URL/airfit-shorts-front.png" "200"
echo ""

# ==================== PHASE 5: SECURITY ====================
echo -e "${BLUE}━━━ PHASE 5: SECURITY CHECKS ━━━${NC}"
test_url "Admin ohne Auth" "$BASE_URL/admin" "401"
test_url "Reviews API" "$BASE_URL/api/reviews" "200"
echo ""

# ==================== PHASE 6: SEO & ROBOTS ====================
echo -e "${BLUE}━━━ PHASE 6: SEO & INDEXIERUNG ━━━${NC}"
test_url "Robots.txt" "$BASE_URL/robots.txt" "200"
test_url "Sitemap.xml" "$BASE_URL/sitemap.xml" "200"
test_content "Robots blocks test-zones" "$BASE_URL/robots.txt" "/product/test-zones"
echo ""

# ==================== RESULTS ====================
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    TEST RESULTS                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "  ${GREEN}✅ Passed: $PASSED${NC}"
echo -e "  ${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL CUSTOMER JOURNEYS PERFECT!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  SOME JOURNEYS FAILED - FIX NEEDED${NC}"
  exit 1
fi
