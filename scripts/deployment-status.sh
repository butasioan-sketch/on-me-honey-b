#!/bin/bash
# ===================================================================
# ON ME HONEY B - Deployment Status Check
# ===================================================================
# Checks if latest local changes are deployed on Vercel
# ===================================================================

echo "=== 📦 DEPLOYMENT STATUS CHECK ==="
echo ""

# Local git info
LOCAL_COMMIT=$(git rev-parse --short HEAD)
LOCAL_MESSAGE=$(git log -1 --pretty=%B | head -1)

echo "💻 Local:"
echo "   Commit: $LOCAL_COMMIT"
echo "   Message: $LOCAL_MESSAGE"
echo ""

# Remote git info  
REMOTE_COMMIT=$(git rev-parse --short origin/main)
REMOTE_MESSAGE=$(git log origin/main -1 --pretty=%B | head -1)

echo "🌍 Remote (GitHub):"
echo "   Commit: $REMOTE_COMMIT"
echo "   Message: $REMOTE_MESSAGE"
echo ""

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
  echo "✅ Local and Remote are in sync"
else
  echo "⚠️  Local ahead of Remote - push needed"
fi

echo ""
echo "🚀 Vercel Deployment:"
echo "   URL: https://on-me-honey-b.vercel.app"
echo "   Expected commit: $REMOTE_COMMIT"
echo ""
echo "💡 To verify Vercel deployment:"
echo "   1. Check headers: curl -sI https://on-me-honey-b.vercel.app/ | grep 'Content-Security-Policy'"
echo "   2. Run: ./scripts/health-check.sh --production"
echo "   3. Vercel Dashboard: https://vercel.com/dashboard"
echo ""
