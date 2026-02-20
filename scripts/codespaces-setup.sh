#!/bin/bash

# =====================================================================
# Codespaces Setup Script
# =====================================================================
# Acest script configurează mediul de dezvoltare pentru GitHub Codespaces
# Usage: ./scripts/codespaces-setup.sh
# =====================================================================

set -e

echo "=========================================="
echo "🚀 Codespaces Environment Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in Codespaces
if [ -z "$CODESPACES" ]; then
    echo -e "${YELLOW}⚠️  Not running in Codespaces${NC}"
    echo "This script is designed for GitHub Codespaces."
    echo "Do you want to continue anyway? (y/n)"
    read -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# Step 1: Create .env.local from template
echo "=========================================="
echo "📋 Step 1: Creating environment file"
echo "=========================================="
echo ""

if [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local already exists${NC}"
    echo "Do you want to overwrite it? (y/n)"
    read -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env.local"
    else
        cp .env.codespaces .env.local
        echo -e "${GREEN}✅ Created .env.local from template${NC}"
    fi
else
    cp .env.codespaces .env.local
    echo -e "${GREEN}✅ Created .env.local from template${NC}"
fi

echo ""

# Step 2: Check MongoDB
echo "=========================================="
echo "🗄️  Step 2: Checking MongoDB"
echo "=========================================="
echo ""

# Check if MongoDB is running
if docker ps | grep -q mongodb; then
    echo -e "${GREEN}✅ MongoDB is running${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB is not running${NC}"
    echo "Starting MongoDB..."
    
    docker run -d \
        --name mongodb-codespaces \
        -p 27017:27017 \
        -v mongodb_data:/data/db \
        mongo:7.0 --replSet rs0 --bind_ip_all
    
    echo -e "${GREEN}✅ MongoDB started${NC}"
    
    # Wait for MongoDB to be ready
    echo "Waiting for MongoDB to be ready..."
    sleep 5
    
    # Initialize replica set
    docker exec mongodb-codespaces mongosh --eval "rs.initiate()" || true
fi

echo ""

# Step 3: Install dependencies
echo "=========================================="
echo "📦 Step 3: Installing dependencies"
echo "=========================================="
echo ""

npm install

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 4: Start services
echo "=========================================="
echo "🚀 Step 4: Starting services"
echo "=========================================="
echo ""

echo "You can start services in two ways:"
echo ""
echo "Option A: Docker Compose (recommended)"
echo "  docker-compose -f docker-compose.local.yml up -d"
echo ""
echo "Option B: Manual start"
echo "  # Terminal 1: Start main app"
echo "  npm run dev"
echo ""
echo "For testing in Codespaces, use Option A."
echo ""

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Run: docker-compose -f docker-compose.local.yml up -d"
echo "2. Wait for services to start (check: docker ps)"
echo "3. Open http://localhost:3001 in browser"
echo ""
