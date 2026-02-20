#!/bin/bash

echo "🚀 MODULE 2.3 - PRODUCTION DEPLOYMENT"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Server details
SERVER="root@ovidiuguru.online"
PROJECT_DIR="/root/MERN-template"

echo -e "${BLUE}📋 Step 1: Backup Production Database${NC}"
ssh $SERVER "mongodump --out /root/backups/pre-module-2.3-\$(date +%Y%m%d-%H%M%S) && echo '✅ Backup complete' || echo '❌ Backup failed'"

echo ""
echo -e "${BLUE}📥 Step 2: Pull Latest Code${NC}"
ssh $SERVER "cd $PROJECT_DIR && git pull origin main"

echo ""
echo -e "${BLUE}📦 Step 3: Install Backend Dependencies${NC}"
ssh $SERVER "cd $PROJECT_DIR/microservices/economy-server && npm install"

echo ""
echo -e "${BLUE}📦 Step 4: Install Frontend Dependencies & Build${NC}"
ssh $SERVER "cd $PROJECT_DIR/client && npm install && npm run build"

echo ""
echo -e "${BLUE}🌱 Step 5: Run Database Migrations${NC}"
echo "Seeding ItemPrototypes..."
ssh $SERVER "cd $PROJECT_DIR/microservices/economy-server && node init/seedItemPrototypes.js"

echo "Adding work rewards to companies..."
ssh $SERVER "cd $PROJECT_DIR/microservices/economy-server && node migrations/add-work-rewards.js"

echo ""
echo -e "${BLUE}🔄 Step 6: Restart Services${NC}"
ssh $SERVER "pm2 restart all"

echo ""
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 5

echo ""
echo -e "${BLUE}🧪 Step 7: Smoke Tests${NC}"

# Test health
echo -n "Testing health endpoint... "
health_response=$(curl -s https://ovidiuguru.online/api/economy/health)
if echo "$health_response" | grep -q "success"; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

# Test marketplace
echo -n "Testing marketplace endpoint... "
marketplace_response=$(curl -s https://ovidiuguru.online/api/economy/marketplace)
if echo "$marketplace_response" | grep -q "success"; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo ""
echo "📊 Next Steps:"
echo "1. Test full user journey at https://ovidiuguru.online"
echo "2. Monitor logs: ssh $SERVER 'pm2 logs economy-server'"
echo "3. Check for errors: ssh $SERVER 'pm2 logs --err'"
echo ""
echo "📚 Documentation:"
echo "- Deployment Guide: docs/MODULE_2_3_DEPLOYMENT_GUIDE.md"
echo "- Release Notes: RELEASE_NOTES_v2.3.0.md"
echo ""
