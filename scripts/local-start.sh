#!/bin/bash

# =====================================================================
# Local Development Startup Script
# =====================================================================
# This script starts all services for local development
# Usage: ./scripts/local-start.sh
# =====================================================================

set -e  # Exit on error

echo "=========================================="
echo "🚀 Starting Local Development Environment"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
echo "📦 Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Check if .env.local exists
echo "🔧 Checking environment configuration..."
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found, copying from .envdev...${NC}"
    cp .envdev .env.local
    echo -e "${GREEN}✅ Created .env.local${NC}"
else
    echo -e "${GREEN}✅ .env.local exists${NC}"
fi
echo ""

# Stop any running containers
echo "🛑 Stopping any existing containers..."
docker compose -f docker-compose.local.yml down 2>/dev/null || true
echo -e "${GREEN}✅ Cleaned up existing containers${NC}"
echo ""

# Start services
echo "🚀 Starting all services..."
echo "This may take a few minutes on first run..."
echo ""

# Use docker compose (newer) or docker-compose (older)
if command -v docker compose &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Start services in detached mode
$DOCKER_COMPOSE -f docker-compose.local.yml up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo ""
echo "🔍 Checking service status..."
echo ""

# Function to check if a service is responding
check_service() {
    local name=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $name is ready${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $name failed to start${NC}"
    return 1
}

# Check MongoDB
echo -n "Checking MongoDB... "
if docker exec mern-mongodb-local mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MongoDB is ready${NC}"
else
    echo -e "${RED}❌ MongoDB failed to start${NC}"
fi

# Check main app
echo -n "Checking Main App (port 3000)... "
check_service "Main App" "http://localhost:3000" || true

# Check auth server
echo -n "Checking Auth Server (port 3100)... "
check_service "Auth Server" "http://localhost:3100/health" || true

# Check news server
echo -n "Checking News Server (port 3200)... "
check_service "News Server" "http://localhost:3200/health" || true

# Check chat server
echo -n "Checking Chat Server (port 3300)... "
check_service "Chat Server" "http://localhost:3300/health" || true

# Check economy server
echo -n "Checking Economy Server (port 3400)... "
check_service "Economy Server" "http://localhost:3400/health" || true

# Check Qdrant
echo -n "Checking Qdrant (port 6333)... "
check_service "Qdrant" "http://localhost:6333" || true

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Local Development Environment Started!${NC}"
echo "=========================================="
echo ""
echo "📍 Service URLs:"
echo "   Main App:      http://localhost:3000"
echo "   Auth Server:   http://localhost:3100"
echo "   News Server:   http://localhost:3200"
echo "   Chat Server:   http://localhost:3300"
echo "   Economy Server: http://localhost:3400"
echo "   MongoDB:       mongodb://localhost:27017"
echo "   Qdrant:        http://localhost:6333/dashboard"
echo ""
echo "📋 Useful Commands:"
echo "   View logs:     docker compose -f docker-compose.local.yml logs -f [service]"
echo "   Stop all:      docker compose -f docker-compose.local.yml down"
echo "   Restart:       docker compose -f docker-compose.local.yml restart [service]"
echo "   Run tests:     ./scripts/local-test.sh"
echo ""
echo "🌐 Open in browser: http://localhost:3000"
echo ""
