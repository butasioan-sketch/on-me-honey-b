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
echo "🚀 Vercel:"
echo "   URL: https://on-me-honey-b.vercel.app"
echo "   GitHub-Sync ist kein Deploy. Ein Push legt hier kein neues Deployment an."
echo "   Prüfen: ./scripts/health-check.sh --production"
echo ""
