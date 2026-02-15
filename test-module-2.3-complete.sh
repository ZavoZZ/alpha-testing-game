#!/bin/bash

echo "🧪 MODULE 2.3 - COMPREHENSIVE TEST SUITE"
echo "========================================"
echo ""

BASE_URL="http://localhost:3400"
TOKEN=""  # Will be set after login

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counter
PASSED=0
FAILED=0

test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    status=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL (Status: $status, Expected: $expected_status)${NC}"
        echo "Response: $body"
        ((FAILED++))
    fi
}

echo "📋 Phase 1: Setup & Authentication"
echo "-----------------------------------"

# Login as admin
echo -n "Logging in as admin... "
login_response=$(curl -s -X POST "http://localhost:3000/api/auth-service/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@test.com","password":"admin123"}')

TOKEN=$(echo $login_response | jq -r '.token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✅ SUCCESS${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED - Cannot proceed without token${NC}"
    echo "Response: $login_response"
    exit 1
fi

echo ""
echo "📦 Phase 2: Inventory Endpoints"
echo "--------------------------------"

test_endpoint "Get Inventory" "GET" "/api/economy/inventory" "" "200"
test_endpoint "Get Specific Item" "GET" "/api/economy/inventory/BREAD_Q1/1" "" "200"

echo ""
echo "🏪 Phase 3: Marketplace Endpoints"
echo "----------------------------------"

test_endpoint "Browse Marketplace" "GET" "/api/economy/marketplace" "" "200"
test_endpoint "Browse by Category" "GET" "/api/economy/marketplace?category=FOOD" "" "200"
test_endpoint "Browse by Quality" "GET" "/api/economy/marketplace?quality=1" "" "200"

echo ""
echo "🍞 Phase 4: Consumption Endpoints"
echo "----------------------------------"

test_endpoint "Check Cooldown Status" "GET" "/api/economy/consume/status" "" "200"
test_endpoint "Get Consumption History" "GET" "/api/economy/consume/history" "" "200"

echo ""
echo "💼 Phase 5: Work Integration Test"
echo "----------------------------------"

# Work to receive items
echo -n "Working to receive items... "
work_response=$(curl -s -X POST "$BASE_URL/api/economy/work" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

work_success=$(echo $work_response | jq -r '.success')

if [ "$work_success" = "true" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
    
    # Check if inventory was updated
    echo -n "Verifying inventory updated... "
    inv_response=$(curl -s -X GET "$BASE_URL/api/economy/inventory" \
        -H "Authorization: Bearer $TOKEN")
    
    inv_count=$(echo $inv_response | jq -r '.inventory | length')
    
    if [ "$inv_count" -gt "0" ]; then
        echo -e "${GREEN}✅ PASS (Found $inv_count items)${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL (No items in inventory)${NC}"
        ((FAILED++))
    fi
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "Response: $work_response"
    ((FAILED++))
fi

echo ""
echo "🔄 Phase 6: Consumption Flow Test"
echo "----------------------------------"

# Try to consume an item
echo -n "Attempting to consume item... "
consume_response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/economy/consume" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"itemCode":"BREAD_Q1","quality":1}')

consume_status=$(echo "$consume_response" | tail -n1)
consume_body=$(echo "$consume_response" | head -n-1)

if [ "$consume_status" = "200" ] || [ "$consume_status" = "400" ]; then
    echo -e "${GREEN}✅ PASS (Status: $consume_status)${NC}"
    ((PASSED++))
    
    # If successful, check cooldown
    if [ "$consume_status" = "200" ]; then
        echo -n "Verifying cooldown activated... "
        cooldown_response=$(curl -s -X GET "$BASE_URL/api/economy/consume/status" \
            -H "Authorization: Bearer $TOKEN")
        
        on_cooldown=$(echo $cooldown_response | jq -r '.onCooldown')
        
        if [ "$on_cooldown" = "true" ]; then
            echo -e "${GREEN}✅ PASS${NC}"
            ((PASSED++))
        else
            echo -e "${YELLOW}⚠️  WARNING (No cooldown active)${NC}"
        fi
    fi
else
    echo -e "${RED}❌ FAIL (Status: $consume_status)${NC}"
    echo "Response: $consume_body"
    ((FAILED++))
fi

echo ""
echo "📊 Phase 7: Data Integrity Checks"
echo "----------------------------------"

# Check inventory structure
echo -n "Validating inventory structure... "
inv_response=$(curl -s -X GET "$BASE_URL/api/economy/inventory" \
    -H "Authorization: Bearer $TOKEN")

has_inventory=$(echo $inv_response | jq -r 'has("inventory")')
has_total_value=$(echo $inv_response | jq -r 'has("totalValue")')

if [ "$has_inventory" = "true" ] && [ "$has_total_value" = "true" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((FAILED++))
fi

# Check marketplace structure
echo -n "Validating marketplace structure... "
market_response=$(curl -s -X GET "$BASE_URL/api/economy/marketplace" \
    -H "Authorization: Bearer $TOKEN")

has_listings=$(echo $market_response | jq -r 'has("listings")')
has_categories=$(echo $market_response | jq -r 'has("categories")')

if [ "$has_listings" = "true" ] && [ "$has_categories" = "true" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((FAILED++))
fi

echo ""
echo "📊 TEST RESULTS"
echo "==============="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
    exit 1
fi
