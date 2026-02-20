#!/bin/bash

# Rollback Script - Restore previous version
# Usage: ./rollback.sh [backup-timestamp]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKUP_DIR="/root/backups"

echo -e "${RED}⚠️  ROLLBACK PROCEDURE${NC}"
echo "=================================="
echo ""

# Check if backup timestamp provided
if [ -z "$1" ]; then
    echo "Available backups:"
    ls -lh $BACKUP_DIR/
    echo ""
    echo "Usage: ./rollback.sh [backup-name]"
    echo "Example: ./rollback.sh pre-deploy-20260215-004500"
    exit 1
fi

BACKUP_NAME=$1
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

# Check if backup exists
if [ ! -d "$BACKUP_PATH" ]; then
    echo -e "${RED}❌ Backup not found: $BACKUP_PATH${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Backup found: $BACKUP_PATH${NC}"
echo ""

# Confirm rollback
read -p "Are you sure you want to rollback? This will restore the database. (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelled."
    exit 0
fi

echo ""
echo -e "${YELLOW}🔄 Starting rollback...${NC}"
echo ""

# Step 1: Stop services
echo -e "${YELLOW}⏸️  Stopping services...${NC}"
pm2 stop all
echo -e "${GREEN}✅ Services stopped${NC}"
echo ""

# Step 2: Restore database
echo -e "${YELLOW}📥 Restoring database...${NC}"
mongorestore --drop $BACKUP_PATH
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database restored${NC}"
else
    echo -e "${RED}❌ Database restore failed!${NC}"
    pm2 restart all
    exit 1
fi
echo ""

# Step 3: Revert code (optional)
read -p "Do you want to revert code to previous commit? (yes/no): " revert_code
if [ "$revert_code" == "yes" ]; then
    echo -e "${YELLOW}🔄 Reverting code...${NC}"
    cd /root/MERN-template
    git log --oneline -5
    echo ""
    read -p "Enter commit hash to revert to: " commit_hash
    git reset --hard $commit_hash
    echo -e "${GREEN}✅ Code reverted${NC}"
    echo ""
fi

# Step 4: Restart services
echo -e "${YELLOW}🔄 Restarting services...${NC}"
pm2 restart all
sleep 5
pm2 list
echo -e "${GREEN}✅ Services restarted${NC}"
echo ""

# Step 5: Health check
echo -e "${YELLOW}🏥 Running health check...${NC}"
sleep 5
curl -f http://localhost:3000/health && echo -e "${GREEN}✅ Main server healthy${NC}" || echo -e "${RED}❌ Main server unhealthy${NC}"
curl -f http://localhost:3400/health && echo -e "${GREEN}✅ Economy server healthy${NC}" || echo -e "${RED}❌ Economy server unhealthy${NC}"
echo ""

echo "=================================="
echo -e "${GREEN}🎉 Rollback Complete!${NC}"
echo "=================================="
echo ""
echo "📝 Summary:"
echo "  - Database restored from: $BACKUP_NAME"
echo "  - Services restarted"
echo ""
echo "🔍 Next steps:"
echo "  1. Test the application"
echo "  2. Check logs: pm2 logs"
echo "  3. Verify functionality"
echo ""
