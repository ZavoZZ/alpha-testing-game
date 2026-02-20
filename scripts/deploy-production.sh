#!/bin/bash

# Production Deployment Script
# This script handles complete deployment to production server

set -e  # Exit on any error

echo "🚀 Starting Production Deployment..."
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/root/MERN-template"
BACKUP_DIR="/root/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Step 1: Create backup
echo -e "${YELLOW}📦 Step 1: Creating database backup...${NC}"
mkdir -p $BACKUP_DIR
mongodump --out $BACKUP_DIR/pre-deploy-$TIMESTAMP
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup created successfully${NC}"
else
    echo -e "${RED}❌ Backup failed!${NC}"
    exit 1
fi
echo ""

# Step 2: Pull latest code
echo -e "${YELLOW}📥 Step 2: Pulling latest code from GitHub...${NC}"
cd $PROJECT_DIR
git stash
git pull origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Code updated successfully${NC}"
else
    echo -e "${RED}❌ Git pull failed!${NC}"
    exit 1
fi
echo ""

# Step 3: Install dependencies
echo -e "${YELLOW}📦 Step 3: Installing dependencies...${NC}"

# Main project
npm install --production

# Economy server
cd microservices/economy-server
npm install --production
cd ../..

# Auth server
cd microservices/auth-server
npm install --production
cd ../..

# News server
cd microservices/news-server
npm install --production
cd ../..

# Chat server
cd microservices/chat-server
npm install --production
cd ../..

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 4: Build client
echo -e "${YELLOW}🏗️ Step 4: Building client...${NC}"
cd client
npm install
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Client built successfully${NC}"
else
    echo -e "${RED}❌ Client build failed!${NC}"
    exit 1
fi
cd ..
echo ""

# Step 5: Run migrations (if any)
echo -e "${YELLOW}🔄 Step 5: Running database migrations...${NC}"
cd microservices/economy-server

# Check if seedItemPrototypes needs to run
if [ -f "init/seedItemPrototypes.js" ]; then
    echo "Running seedItemPrototypes..."
    node init/seedItemPrototypes.js || echo "Seed already run or failed"
fi

# Check if migrations need to run
if [ -f "migrations/add-work-rewards.js" ]; then
    echo "Running add-work-rewards migration..."
    node migrations/add-work-rewards.js || echo "Migration already run or failed"
fi

if [ -f "migrations/reset-all-players-energy.js" ]; then
    echo "Running reset-all-players-energy migration..."
    node migrations/reset-all-players-energy.js || echo "Migration already run or failed"
fi

cd ../..
echo -e "${GREEN}✅ Migrations complete${NC}"
echo ""

# Step 6: Restart services
echo -e "${YELLOW}🔄 Step 6: Restarting services...${NC}"
pm2 restart all
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Services restarted${NC}"
else
    echo -e "${RED}❌ Service restart failed!${NC}"
    exit 1
fi
echo ""

# Step 7: Wait for services to start
echo -e "${YELLOW}⏳ Step 7: Waiting for services to start...${NC}"
sleep 10
echo ""

# Step 8: Health checks
echo -e "${YELLOW}🏥 Step 8: Running health checks...${NC}"

check_service() {
    local name=$1
    local url=$2
    
    if curl -f -s $url > /dev/null; then
        echo -e "${GREEN}✅ $name is healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ $name is unhealthy${NC}"
        return 1
    fi
}

check_service "Main Server" "http://localhost:3000/health"
check_service "Auth Server" "http://localhost:3200/health"
check_service "News Server" "http://localhost:3100/health"
check_service "Chat Server" "http://localhost:3300/health"
check_service "Economy Server" "http://localhost:3400/health"

echo ""

# Step 9: Check PM2 status
echo -e "${YELLOW}📊 Step 9: Checking PM2 status...${NC}"
pm2 list
echo ""

# Step 10: Test public endpoints
echo -e "${YELLOW}🌐 Step 10: Testing public endpoints...${NC}"
check_service "Public Site" "https://ovidiuguru.online/health"
check_service "Economy API" "https://ovidiuguru.online/api/economy/health"
echo ""

# Final summary
echo "=================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=================================="
echo ""
echo "📝 Summary:"
echo "  - Backup: $BACKUP_DIR/pre-deploy-$TIMESTAMP"
echo "  - Code: Updated from GitHub"
echo "  - Dependencies: Installed"
echo "  - Client: Built"
echo "  - Migrations: Run"
echo "  - Services: Restarted"
echo ""
echo "🔍 Next steps:"
echo "  1. Check logs: pm2 logs"
echo "  2. Monitor: pm2 monit"
echo "  3. Test site: https://ovidiuguru.online"
echo ""
echo "🔄 Rollback command (if needed):"
echo "  mongorestore --drop $BACKUP_DIR/pre-deploy-$TIMESTAMP"
echo ""
