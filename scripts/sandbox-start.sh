#!/bin/bash
# =============================================================================
# Sandbox Start Script - Run without Docker
# =============================================================================
# Purpose: Start all services for development in the sandbox (Codespaces)
#          without using Docker. Uses MongoDB Atlas for database.
#
# Prerequisites:
#   1. MongoDB Atlas connection string in .env.sandbox
#   2. All dependencies installed (npm install in each service)
#
# Usage:
#   ./scripts/sandbox-start.sh
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Sandbox Start Script (No Docker)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if .env.sandbox exists
if [ ! -f ".env.sandbox" ]; then
    echo -e "${RED}Error: .env.sandbox not found!${NC}"
    echo ""
    echo "Please create .env.sandbox with MongoDB Atlas connection:"
    echo "  1. Create a free MongoDB Atlas account"
    echo "  2. Create a cluster"
    echo "  3. Get connection string"
    echo "  4. Create .env.sandbox with DB_URI=<your-mongodb-atlas-uri>"
    echo ""
    echo "Example .env.sandbox:"
    echo "  DB_URI=mongodb+srv://username:password@cluster.mongodb.net/game_db"
    echo "  WEB_PORT=3000"
    echo "  NODE_ENV=sandbox"
    exit 1
fi

# Load environment
echo -e "${YELLOW}Loading environment from .env.sandbox...${NC}"
export $(cat .env.sandbox | grep -v '^#' | xargs)
echo -e "${GREEN}Environment loaded!${NC}"
echo ""

# Check if MongoDB URI is set
if [ -z "$DB_URI" ]; then
    echo -e "${RED}Error: DB_URI not set in .env.sandbox${NC}"
    exit 1
fi

echo -e "${YELLOW}Starting services...${NC}"
echo ""

# Kill any existing node processes on our ports
echo "Checking for existing processes on ports 3000, 3100, 3200, 3300, 3400..."
for port in 3000 3100 3200 3300 3400; do
    pid=$(lsof -t -i:$port 2>/dev/null || true)
    if [ -n "$pid" ]; then
        echo "  Port $port in use by PID $pid, killing..."
        kill $pid 2>/dev/null || true
    fi
done
echo ""

# Function to start a service
start_service() {
    local name=$1
    local dir=$2
    local port=$3
    
    echo -e "${GREEN}Starting $name on port $port...${NC}"
    
    # Check if directory exists
    if [ ! -d "$dir" ]; then
        echo -e "${RED}  Error: Directory $dir not found!${NC}"
        return 1
    fi
    
    # Check if package.json exists
    if [ ! -f "$dir/package.json" ]; then
        echo -e "${RED}  Error: $dir/package.json not found!${NC}"
        return 1
    fi
    
    # Start the service in background
    cd "$dir"
    PORT=$port node server.js > "$OLDPWD/logs/$name.log" 2>&1 &
    local pid=$!
    echo -e "${GREEN}  Started $name (PID: $pid)${NC}"
    cd - > /dev/null
}

# Create logs directory
mkdir -p logs

# Load environment variables from .env.sandbox
export $(cat .env.sandbox | grep -v '^#' | xargs)

# Install dependencies for all services if needed
echo -e "${YELLOW}Checking dependencies...${NC}"

# Root (main app)
if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install
fi

# Microservices
for service in auth-server news-server chat-server economy-server; do
    if [ ! -d "microservices/$service/node_modules" ]; then
        echo "Installing $service dependencies..."
        cd "microservices/$service"
        npm install
        cd - > /dev/null
    fi
done
echo ""

# Start microservices first (they need to be running before main app)
echo -e "${BLUE}Starting Microservices...${NC}"
start_service "auth-server" "microservices/auth-server" "3100"
start_service "news-server" "microservices/news-server" "3200"
start_service "chat-server" "microservices/chat-server" "3300"
start_service "economy-server" "microservices/economy-server" "3400"
echo ""

# Wait for microservices to start
echo -e "${YELLOW}Waiting for microservices to initialize (5 seconds)...${NC}"
sleep 5

# Load environment variables for webpack dev server
export $(cat .env.sandbox | grep -v '^#' | xargs)

# Start webpack dev server with API proxy
echo -e "${BLUE}Starting Webpack Dev Server with API Proxy...${NC}"
API_PROXY_URL=http://localhost:3000 npm run dev:client > logs/webpack.log 2>&1 &
echo -e "${GREEN}Started webpack dev server (check logs/webpack.log for details)${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}All services started successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Service URLs:"
echo "  Main App:     http://localhost:3000"
echo "  Auth API:     http://localhost:3100"
echo "  News API:     http://localhost:3200"
echo "  Chat API:     http://localhost:3300"
echo "  Economy API:  http://localhost:3400"
echo ""
echo "Logs location: ./logs/"
echo ""
echo "To stop all services:"
echo "  pkill -f 'node server.js' && pkill -f 'webpack serve'"
