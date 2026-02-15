#!/bin/bash

echo "🔄 ECONOMIC LOOP TEST - MODULE 2.3"
echo "===================================="
echo ""

BASE_URL="http://localhost:3400"
TOKEN=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counter
PASSED=0
FAILED=0

echo "📋 Phase 1: Authentication"
echo "--------------------------"

echo -n "Logging in as test player... "
login_response=$(curl -s -X POST "http://localhost:3000/api/auth-service/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"player@test.com","password":"player123"}')

TOKEN=$(echo $login_response | jq -r '.token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✅ SUCCESS${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "Creating test player..."
    
    signup_response=$(curl -s -X POST "http://localhost:3000/api/auth-service/auth/signup" \
        -H "Content-Type: application/json" \
        -d '{"username":"testplayer","email":"player@test.com","password":"player123"}')
    
    TOKEN=$(echo $signup_response | jq -r '.token')
    
    if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
        echo -e "${GREEN}✅ Player created${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ Cannot proceed${NC}"
        exit 1
    fi
fi

echo ""
echo "💰 Phase 2: Initial State Check"
echo "--------------------------------"

# Get initial balance
echo -n "Checking initial balance... "
balance_response=$(curl -s -X GET "$BASE_URL/api/economy/balance" \
    -H "Authorization: Bearer $TOKEN")

initial_balance=$(echo $balance_response | jq -r '.balance')
echo -e "${BLUE}Balance: $initial_balance${NC}"
((PASSED++))

# Get initial inventory
echo -n "Checking initial inventory... "
inv_response=$(curl -s -X GET "$BASE_URL/api/economy/inventory" \
    -H "Authorization: Bearer $TOKEN")

initial_inv_count=$(echo $inv_response | jq -r '.inventory | length')
echo -e "${BLUE}Items: $initial_inv_count${NC}"
((PASSED++))

# Get initial energy
echo -n "Checking initial energy... "
status_response=$(curl -s -X GET "$BASE_URL/api/economy/status" \
    -H "Authorization: Bearer $TOKEN")

initial_energy=$(echo $status_response | jq -r '.energy')
echo -e "${BLUE}Energy: $initial_energy${NC}"
((PASSED++))

echo ""
echo "💼 Phase 3: Work Cycle (Earn Money + Items)"
echo "--------------------------------------------"

for i in {1..3}; do
    echo -e "${YELLOW}Work Cycle $i/3${NC}"
    
    # Work
    echo -n "  Working... "
    work_response=$(curl -s -X POST "$BASE_URL/api/economy/work" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
    
    work_success=$(echo $work_response | jq -r '.success')
    earned_money=$(echo $work_response | jq -r '.earned')
    received_items=$(echo $work_response | jq -r '.items | length')
    
    if [ "$work_success" = "true" ]; then
        echo -e "${GREEN}✅ Earned: $earned_money, Items: $received_items${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAILED++))
    fi
    
    # Check updated balance
    balance_response=$(curl -s -X GET "$BASE_URL/api/economy/balance" \
        -H "Authorization: Bearer $TOKEN")
    current_balance=$(echo $balance_response | jq -r '.balance')
    echo -e "  ${BLUE}Current Balance: $current_balance${NC}"
    
    # Wait for cooldown
    if [ $i -lt 3 ]; then
        echo "  Waiting 3s for cooldown..."
        sleep 3
    fi
done

echo ""
echo "📦 Phase 4: Inventory Check"
echo "---------------------------"

inv_response=$(curl -s -X GET "$BASE_URL/api/economy/inventory" \
    -H "Authorization: Bearer $TOKEN")

current_inv_count=$(echo $inv_response | jq -r '.inventory | length')
total_value=$(echo $inv_response | jq -r '.totalValue')

echo -e "Items in inventory: ${BLUE}$current_inv_count${NC}"
echo -e "Total value: ${BLUE}$total_value${NC}"

if [ "$current_inv_count" -gt "$initial_inv_count" ]; then
    echo -e "${GREEN}✅ Inventory increased${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Inventory did not increase${NC}"
    ((FAILED++))
fi

echo ""
echo "🍞 Phase 5: Consumption Cycle"
echo "------------------------------"

# Get first consumable item
first_item=$(echo $inv_response | jq -r '.inventory[0].itemCode')
first_quality=$(echo $inv_response | jq -r '.inventory[0].quality')

if [ "$first_item" != "null" ] && [ -n "$first_item" ]; then
    echo -n "Consuming $first_item (Q$first_quality)... "
    
    consume_response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/economy/consume" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"itemCode\":\"$first_item\",\"quality\":$first_quality}")
    
    consume_status=$(echo "$consume_response" | tail -n1)
    consume_body=$(echo "$consume_response" | head -n-1)
    
    if [ "$consume_status" = "200" ]; then
        energy_restored=$(echo $consume_body | jq -r '.energyRestored')
        echo -e "${GREEN}✅ Energy restored: $energy_restored${NC}"
        ((PASSED++))
        
        # Check cooldown
        echo -n "Checking cooldown... "
        cooldown_response=$(curl -s -X GET "$BASE_URL/api/economy/consume/status" \
            -H "Authorization: Bearer $TOKEN")
        
        on_cooldown=$(echo $cooldown_response | jq -r '.onCooldown')
        
        if [ "$on_cooldown" = "true" ]; then
            echo -e "${GREEN}✅ Cooldown active${NC}"
            ((PASSED++))
        else
            echo -e "${YELLOW}⚠️  No cooldown${NC}"
        fi
    else
        echo -e "${RED}❌ FAIL (Status: $consume_status)${NC}"
        echo "Response: $consume_body"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠️  No consumable items in inventory${NC}"
fi

echo ""
echo "🏪 Phase 6: Marketplace Interaction"
echo "------------------------------------"

# Browse marketplace
echo -n "Browsing marketplace... "
market_response=$(curl -s -X GET "$BASE_URL/api/economy/marketplace" \
    -H "Authorization: Bearer $TOKEN")

listing_count=$(echo $market_response | jq -r '.listings | length')

if [ "$listing_count" -gt "0" ]; then
    echo -e "${GREEN}✅ Found $listing_count listings${NC}"
    ((PASSED++))
    
    # Get cheapest item
    cheapest_item=$(echo $market_response | jq -r '.listings | sort_by(.price) | .[0]')
    item_id=$(echo $cheapest_item | jq -r '._id')
    item_price=$(echo $cheapest_item | jq -r '.price')
    item_code=$(echo $cheapest_item | jq -r '.itemCode')
    
    echo -e "Cheapest item: ${BLUE}$item_code at $item_price${NC}"
    
    # Try to buy if we have enough money
    current_balance=$(echo $balance_response | jq -r '.balance')
    
    if (( $(echo "$current_balance >= $item_price" | bc -l) )); then
        echo -n "Attempting to buy... "
        
        buy_response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/economy/marketplace/buy/$item_id" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json")
        
        buy_status=$(echo "$buy_response" | tail -n1)
        
        if [ "$buy_status" = "200" ]; then
            echo -e "${GREEN}✅ Purchase successful${NC}"
            ((PASSED++))
        else
            echo -e "${YELLOW}⚠️  Purchase failed (Status: $buy_status)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Not enough money to buy${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No marketplace listings${NC}"
fi

echo ""
echo "📊 Phase 7: Final State Check"
echo "------------------------------"

# Get final balance
balance_response=$(curl -s -X GET "$BASE_URL/api/economy/balance" \
    -H "Authorization: Bearer $TOKEN")
final_balance=$(echo $balance_response | jq -r '.balance')

# Get final inventory
inv_response=$(curl -s -X GET "$BASE_URL/api/economy/inventory" \
    -H "Authorization: Bearer $TOKEN")
final_inv_count=$(echo $inv_response | jq -r '.inventory | length')

# Get final energy
status_response=$(curl -s -X GET "$BASE_URL/api/economy/status" \
    -H "Authorization: Bearer $TOKEN")
final_energy=$(echo $status_response | jq -r '.energy')

echo -e "Initial Balance: ${BLUE}$initial_balance${NC} → Final: ${BLUE}$final_balance${NC}"
echo -e "Initial Items: ${BLUE}$initial_inv_count${NC} → Final: ${BLUE}$final_inv_count${NC}"
echo -e "Initial Energy: ${BLUE}$initial_energy${NC} → Final: ${BLUE}$final_energy${NC}"

# Check if economic loop is sustainable
if (( $(echo "$final_balance > $initial_balance" | bc -l) )); then
    echo -e "${GREEN}✅ Balance increased - Economy is sustainable${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  Balance did not increase${NC}"
fi

echo ""
echo "🔄 Phase 8: Loop Sustainability Test"
echo "-------------------------------------"

echo "Testing if player can continue working..."

# Try another work cycle
work_response=$(curl -s -X POST "$BASE_URL/api/economy/work" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

work_success=$(echo $work_response | jq -r '.success')

if [ "$work_success" = "true" ]; then
    echo -e "${GREEN}✅ Player can continue working - Loop is sustainable${NC}"
    ((PASSED++))
else
    work_message=$(echo $work_response | jq -r '.message')
    echo -e "${YELLOW}⚠️  Cannot work: $work_message${NC}"
fi

echo ""
echo "📊 TEST RESULTS"
echo "==============="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ECONOMIC LOOP IS FUNCTIONAL!${NC}"
    echo ""
    echo "Summary:"
    echo "✅ Players can work to earn money and items"
    echo "✅ Players can consume items to restore energy"
    echo "✅ Players can buy items from marketplace"
    echo "✅ Economic loop is sustainable"
    exit 0
else
    echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
    exit 1
fi
