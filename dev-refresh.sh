#!/bin/bash
# dev-refresh.sh
# Comprehensive cache-busting script for Protogen development
# 
# Usage: ./dev-refresh.sh [component]
#   component: shared, portal, admin, all (default: all)

set -e  # Exit on error

COMPONENT=${1:-all}

echo "🧹 Protogen Dev Refresh - Clearing caches and rebuilding..."
echo "Target: $COMPONENT"
echo ""

# Function to rebuild shared library
rebuild_shared() {
    echo "📦 Rebuilding shared library..."
    cd shared
    npm run build
    cd ..
    echo "✅ Shared library rebuilt"
}

# Function to restart portal
restart_portal() {
    echo "🔄 Restarting portal..."
    docker-compose restart portal
    sleep 2
    echo "✅ Portal restarted"
}

# Function to restart admin
restart_admin() {
    echo "🔄 Restarting admin..."
    docker-compose restart admin
    sleep 2
    echo "✅ Admin restarted"
}

# Function to clear Docker volumes (nuclear option)
nuclear() {
    echo "💣 NUCLEAR OPTION: Stopping all containers and clearing volumes..."
    docker-compose down
    echo "🔄 Starting containers fresh..."
    docker-compose up -d
    sleep 5
    echo "✅ All containers restarted fresh"
}

# Execute based on component
case $COMPONENT in
    shared)
        rebuild_shared
        ;;
    portal)
        rebuild_shared
        restart_portal
        ;;
    admin)
        rebuild_shared
        restart_admin
        ;;
    all)
        rebuild_shared
        restart_portal
        restart_admin
        ;;
    nuclear)
        rebuild_shared
        nuclear
        ;;
    *)
        echo "❌ Unknown component: $COMPONENT"
        echo "Usage: ./dev-refresh.sh [shared|portal|admin|all|nuclear]"
        exit 1
        ;;
esac

echo ""
echo "✨ Refresh complete!"
echo ""
echo "🌐 Portal: http://portal.protogen.local:3388 (or http://localhost:3388)"
echo "🔧 Admin:  http://admin.protogen.local:3355 (or http://localhost:3355)"
echo "🔌 API:    http://api.protogen.local:3333 (or http://localhost:3333)"
echo ""
echo "💡 If you still see caching issues:"
echo "   1. Hard refresh in browser (Ctrl+Shift+R or Cmd+Shift+R)"
echo "   2. Open DevTools > Network tab > Disable cache"
echo "   3. Use incognito/private window"
echo "   4. Run: ./dev-refresh.sh nuclear"

