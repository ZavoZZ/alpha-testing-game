#!/bin/bash

# =====================================================================
# Local Testing Script
# =====================================================================
# This script runs all tests on the local development environment
# Usage: ./scripts/local-test.sh
# =====================================================================

set -e  # Exit on error

echo "=========================================="
echo "🧪 Running Local Tests"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -e "${BLUE}▶ Testing: $test_name${NC}"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS: $test_name${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL: $test_name${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to test HTTP endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo -e "${BLUE}▶ Testing: $name${NC}"
    
    response_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$response_code" = "$expected_code" ]; then
        echo -e "${GREEN}✅ PASS: $name (HTTP $response_code)${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL: $name (Expected HTTP $expected_code, got $response_code)${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo "🔍 Checking if services are running..."
echo ""

# Check Docker containers
if ! docker ps | grep -q "mern-mongodb-local"; then
    echo -e "${RED}❌ Services are not running!${NC}"
    echo "Please run: ./scripts/local-start.sh"
    exit 1
fi

echo -e "${GREEN}✅ Services are running${NC}"
echo ""

# =====================================================================
# Test 1: Service Health Checks
# =====================================================================
echo "=========================================="
echo "📋 Test Suite 1: Service Health Checks"
echo "=========================================="
echo ""

test_endpoint "Main App Homepage" "http://localhost:3000"
test_endpoint "Auth Server Health" "http://localhost:3100/health"
test_endpoint "News Server Health" "http://localhost:3200/health"
test_endpoint "Chat Server Health" "http://localhost:3300/health"
test_endpoint "Economy Server Health" "http://localhost:3400/health"
test_endpoint "Qdrant Vector DB" "http://localhost:6333"

echo ""

# =====================================================================
# Test 2: Database Connectivity
# =====================================================================
echo "=========================================="
echo "📋 Test Suite 2: Database Connectivity"
echo "=========================================="
echo ""

run_test "MongoDB Connection" "docker exec mern-mongodb-local mongosh --eval 'db.adminCommand(\"ping\")'"

echo ""

# =====================================================================
# Test 3: API Endpoints
# =====================================================================
echo "=========================================="
echo "📋 Test Suite 3: API Endpoints"
echo "=========================================="
echo ""

# Test Auth API
echo -e "${BLUE}▶ Testing Auth API endpoints...${NC}"
test_endpoint "Auth - Signup Endpoint" "http://localhost:3100/api/accounts/signup" "405"
test_endpoint "Auth - Login Endpoint" "http://localhost:3100/api/accounts/login" "405"

# Test Economy API
echo -e "${BLUE}▶ Testing Economy API endpoints...${NC}"
test_endpoint "Economy - Balance Endpoint" "http://localhost:3400/api/economy/balance" "401"
test_endpoint "Economy - Work Endpoint" "http://localhost:3400/api/economy/work" "401"

echo ""

# =====================================================================
# Test 4: Container Logs Check
# =====================================================================
echo "=========================================="
echo "📋 Test Suite 4: Container Logs Check"
echo "=========================================="
echo ""

check_logs() {
    local container=$1
    local service_name=$2
    
    echo -e "${BLUE}▶ Checking $service_name logs for errors...${NC}"
    
    error_count=$(docker logs "$container" 2>&1 | grep -i "error" | grep -v "DeprecationWarning" | wc -l)
    
    if [ "$error_count" -eq 0 ]; then
        echo -e "${GREEN}✅ PASS: No errors in $service_name logs${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}⚠️  WARNING: Found $error_count error(s) in $service_name logs${NC}"
        echo "Run: docker logs $container --tail 20"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

check_logs "mern-app-local" "Main App"
check_logs "mern-auth-local" "Auth Server"
check_logs "mern-economy-local" "Economy Server"

echo ""

# =====================================================================
# Test 5: Browser Tests (if Puppeteer is available)
# =====================================================================
echo "=========================================="
echo "📋 Test Suite 5: Browser Tests"
echo "=========================================="
echo ""

if [ -f "scripts/browser-test.js" ]; then
    echo -e "${BLUE}▶ Running browser tests...${NC}"
    
    if node scripts/browser-test.js > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS: Browser tests${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAIL: Browser tests${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
else
    echo -e "${YELLOW}⚠️  Browser tests not found (scripts/browser-test.js)${NC}"
    echo "Run: npm install puppeteer to enable browser tests"
fi

echo ""

# =====================================================================
# Test Results Summary
# =====================================================================
echo "=========================================="
echo "📊 Test Results Summary"
echo "=========================================="
echo ""
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests:  $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "🚀 Ready to deploy to production!"
    echo "Run: ./scripts/local-deploy.sh"
    exit 0
else
    echo -e "${RED}❌ Some tests failed!${NC}"
    echo ""
    echo "🔧 Please fix the issues before deploying."
    echo ""
    echo "Useful commands:"
    echo "  View logs: docker compose -f docker-compose.local.yml logs -f [service]"
    echo "  Restart:   docker compose -f docker-compose.local.yml restart [service]"
    exit 1
fi
