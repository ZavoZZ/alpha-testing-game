#!/bin/bash

# =====================================================================
# Local to Production Deployment Script
# =====================================================================
# This script deploys local changes to production after testing
# Usage: ./scripts/local-deploy.sh [commit-message]
# =====================================================================

set -e  # Exit on error

echo "=========================================="
echo "🚀 Deploying to Production"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PRODUCTION_SERVER="root@ovidiuguru.online"
PRODUCTION_PATH="/root/MERN-template"
COMMIT_MESSAGE="${1:-Update from local development}"

# =====================================================================
# Step 1: Run Local Tests
# =====================================================================
echo "=========================================="
echo "📋 Step 1: Running Local Tests"
echo "=========================================="
echo ""

if [ -f "scripts/local-test.sh" ]; then
    if ./scripts/local-test.sh; then
        echo -e "${GREEN}✅ All local tests passed${NC}"
    else
        echo -e "${RED}❌ Local tests failed!${NC}"
        echo "Please fix the issues before deploying."
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Local test script not found${NC}"
    echo "Skipping tests..."
fi

echo ""

# =====================================================================
# Step 2: Check Git Status
# =====================================================================
echo "=========================================="
echo "📋 Step 2: Checking Git Status"
echo "=========================================="
echo ""

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    echo ""
    git status --short
    echo ""
    
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📝 Committing changes..."
        git add .
        git commit -m "$COMMIT_MESSAGE"
        echo -e "${GREEN}✅ Changes committed${NC}"
    else
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
fi

echo ""

# =====================================================================
# Step 3: Push to GitHub
# =====================================================================
echo "=========================================="
echo "📋 Step 3: Pushing to GitHub"
echo "=========================================="
echo ""

echo "🔄 Pulling latest changes from remote..."
if git pull origin main --rebase; then
    echo -e "${GREEN}✅ Pulled latest changes${NC}"
else
    echo -e "${RED}❌ Failed to pull changes${NC}"
    echo "Please resolve conflicts manually and try again."
    exit 1
fi

echo ""
echo "📤 Pushing to GitHub..."
if git push origin main; then
    echo -e "${GREEN}✅ Pushed to GitHub${NC}"
else
    echo -e "${RED}❌ Failed to push to GitHub${NC}"
    exit 1
fi

echo ""

# =====================================================================
# Step 4: Deploy to Production Server
# =====================================================================
echo "=========================================="
echo "📋 Step 4: Deploying to Production Server"
echo "=========================================="
echo ""

echo "🔗 Connecting to $PRODUCTION_SERVER..."
echo ""

# SSH and deploy
ssh "$PRODUCTION_SERVER" << 'ENDSSH'
    set -e
    
    echo "📂 Navigating to project directory..."
    cd /root/MERN-template
    
    echo "🔄 Pulling latest changes..."
    git pull origin main
    
    echo "📦 Installing dependencies..."
    npm install --production
    
    echo "🏗️  Building application..."
    npm run build
    
    echo "🐳 Restarting Docker services..."
    docker compose down
    docker compose up -d --build
    
    echo "⏳ Waiting for services to start..."
    sleep 15
    
    echo "✅ Deployment complete!"
ENDSSH

echo ""
echo -e "${GREEN}✅ Deployed to production server${NC}"
echo ""

# =====================================================================
# Step 5: Verify Production Deployment
# =====================================================================
echo "=========================================="
echo "📋 Step 5: Verifying Production Deployment"
echo "=========================================="
echo ""

echo "🔍 Testing production endpoints..."
echo ""

# Function to test production endpoint
test_production() {
    local name=$1
    local url=$2
    
    echo -n "Testing $name... "
    
    response_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$response_code" = "200" ] || [ "$response_code" = "301" ] || [ "$response_code" = "302" ]; then
        echo -e "${GREEN}✅ OK (HTTP $response_code)${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL (HTTP $response_code)${NC}"
        return 1
    fi
}

# Test production endpoints
test_production "Homepage" "https://ovidiuguru.online"
test_production "Auth Service" "https://ovidiuguru.online/api/accounts/health"
test_production "Economy Service" "https://ovidiuguru.online/api/economy/health"

echo ""

# =====================================================================
# Step 6: Check Production Logs
# =====================================================================
echo "=========================================="
echo "📋 Step 6: Checking Production Logs"
echo "=========================================="
echo ""

echo "📋 Recent production logs:"
echo ""

ssh "$PRODUCTION_SERVER" << 'ENDSSH'
    cd /root/MERN-template
    
    echo "=== Main App Logs ==="
    docker logs app --tail 10 2>&1 | grep -v "DeprecationWarning" || true
    
    echo ""
    echo "=== Auth Server Logs ==="
    docker logs auth-server --tail 10 2>&1 | grep -v "DeprecationWarning" || true
    
    echo ""
    echo "=== Economy Server Logs ==="
    docker logs economy-server --tail 10 2>&1 | grep -v "DeprecationWarning" || true
ENDSSH

echo ""

# =====================================================================
# Deployment Complete
# =====================================================================
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "🌐 Production URL: https://ovidiuguru.online"
echo ""
echo "📋 Useful Commands:"
echo "   View logs:    ssh $PRODUCTION_SERVER 'docker logs [service] --tail 50'"
echo "   Restart:      ssh $PRODUCTION_SERVER 'cd $PRODUCTION_PATH && docker compose restart [service]'"
echo "   SSH access:   ssh $PRODUCTION_SERVER"
echo ""
echo "🎉 Your changes are now live!"
echo ""
