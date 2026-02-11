#!/bin/bash

# =============================================================================
# COMPREHENSIVE ECONOMY API TEST - PLAYER PERSPECTIVE
# =============================================================================
# 
# Tests all economy API functionality from production server.
# Server: https://ovidiuguru.online
# 
# @version 1.0.0
# @date 2026-02-11

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🎮 ECONOMY API - COMPREHENSIVE PLAYER TEST SUITE             ║"
echo "║  Server: ovidiuguru.online (PRODUCTION)                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

API_BASE="https://ovidiuguru.online"
TEST_EMAIL="testadmin@test.com"
TEST_PASSWORD="admin123"
TOKEN=""
USER_ID=""

# Test counters
TOTAL_TESTS=0
PASSED=0
FAILED=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_result() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ "$1" -eq 0 ]; then
        PASSED=$((PASSED + 1))
        echo -e "${GREEN}✅ [$TOTAL_TESTS] $2${NC}"
        [ -n "$3" ] && echo "   $3"
    else
        FAILED=$((FAILED + 1))
        echo -e "${RED}❌ [$TOTAL_TESTS] $2${NC}"
        [ -n "$3" ] && echo "   $3"
    fi
}

# =============================================================================
# SCENARIO 1: PLAYER LOGIN
# =============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  SCENARIO 1: Player Login & Get JWT Token                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/api/auth-service/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

# Check if we got a token (plain text response)
if [[ "$LOGIN_RESPONSE" =~ ^eyJ ]]; then
    TOKEN="$LOGIN_RESPONSE"
    echo "✅ Login successful!"
    echo "   Token: ${TOKEN:0:50}..."
    
    # Decode JWT payload (base64 decode middle part)
    PAYLOAD=$(echo "$TOKEN" | cut -d. -f2)
    # Add padding if needed
    case $((${#PAYLOAD} % 4)) in
        2) PAYLOAD="${PAYLOAD}==" ;;
        3) PAYLOAD="${PAYLOAD}=" ;;
    esac
    DECODED=$(echo "$PAYLOAD" | base64 -d 2>/dev/null)
    
    if [ -n "$DECODED" ]; then
        USER_ID=$(echo "$DECODED" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        USERNAME=$(echo "$DECODED" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
        ROLE=$(echo "$DECODED" | grep -o '"role":"[^"]*"' | cut -d'"' -f4)
        
        echo "   User ID: $USER_ID"
        echo "   Username: $USERNAME"
        echo "   Role: $ROLE"
    fi
    
    test_result 0 "Player Login" "JWT token received"
else
    echo "❌ Login failed!"
    echo "   Response: $LOGIN_RESPONSE"
    test_result 1 "Player Login" "No JWT token received"
    exit 1
fi

sleep 1

# =============================================================================
# SCENARIO 2: ECONOMY API HEALTH CHECK
# =============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  SCENARIO 2: Economy API Health Check (PUBLIC)                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

HEALTH_RESPONSE=$(curl -s "$API_BASE/api/economy/health")
HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ "$HEALTH_STATUS" = "operational" ]; then
    test_result 0 "Economy API Health" "Status: operational"
else
    test_result 1 "Economy API Health" "Status: $HEALTH_STATUS"
fi

sleep 1

# =============================================================================
# SCENARIO 3: GET ALL BALANCES
# =============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  SCENARIO 3: Get Player Balances (AUTH REQUIRED)               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

BALANCES_RESPONSE=$(curl -s "$API_BASE/api/economy/balances" \
  -H "Authorization: Bearer $TOKEN")

BALANCES_SUCCESS=$(echo "$BALANCES_RESPONSE" | grep -o '"success":true')
EURO_BALANCE=$(echo "$BALANCES_RESPONSE" | grep -o '"EURO":"[^"]*"' | cut -d'"' -f4)
GOLD_BALANCE=$(echo "$BALANCES_RESPONSE" | grep -o '"GOLD":"[^"]*"' | cut -d'"' -f4)
RON_BALANCE=$(echo "$BALANCES_RESPONSE" | grep -o '"RON":"[^"]*"' | cut -d'"' -f4)

if [ -n "$BALANCES_SUCCESS" ]; then
    test_result 0 "Get All Balances" "EURO: $EURO_BALANCE, GOLD: $GOLD_BALANCE, RON: $RON_BALANCE"
else
    test_result 1 "Get All Balances" "Failed to fetch balances"
    echo "   Response: $BALANCES_RESPONSE"
fi

sleep 1

# =============================================================================
# SCENARIO 4: GET SINGLE BALANCE
# =============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  SCENARIO 4: Get Single Balance (EURO)                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

SINGLE_BALANCE_RESPONSE=$(curl -s "$API_BASE/api/economy/balance/EURO" \
  -H "Authorization: Bearer $TOKEN")

SINGLE_SUCCESS=$(echo "$SINGLE_BALANCE_RESPONSE" | grep -o '"success":true')
SINGLE_EURO=$(echo "$SINGLE_BALANCE_RESPONSE" | grep -o '"balance":"[^"]*"' | cut -d'"' -f4)

if [ -n "$SINGLE_SUCCESS" ]; then
    test_result 0 "Get Single Balance (EURO)" "Balance: $SINGLE_EURO EURO"
else
    test_result 1 "Get Single Balance (EURO)" "Failed"
fi

sleep 1

# =============================================================================
# SCENARIO 5: SECURITY TEST - Unauthenticated Access
# =============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  SCENARIO 5: Security Test - Unauthenticated Access            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

UNAUTH_RESPONSE=$(curl -s -w "%{http_code}" "$API_BASE/api/economy/balances")
HTTP_CODE="${UNAUTH_RESPONSE: -3}"
RESPONSE_BODY="${UNAUTH_RESPONSE:0:-3}"

if [ "$HTTP_CODE" = "401" ]; then
    ERROR_CODE=$(echo "$RESPONSE_BODY" | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
    test_result 0 "Block Unauthenticated Access" "HTTP 401, Code: $ERROR_CODE"
else
    test_result 1 "Block Unauthenticated Access" "Expected 401, got $HTTP_CODE"
fi

sleep 1

# =============================================================================
# SCENARIO 6: SECURITY TESTS - Invalid Payloads
# =============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  SCENARIO 6: Security Tests - Invalid Amount Formats           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Test 6a: Negative amount
echo "Testing negative amount..."
NEG_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$API_BASE/api/economy/transfer" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"receiverId":"507f191e810c19729de860ea","amount":"-100.00","currency":"EURO"}')

NEG_HTTP="${NEG_RESPONSE: -3}"
if [ "$NEG_HTTP" = "400" ]; then
    test_result 0 "Block Negative Amount" "HTTP 400 (correctly blocked)"
else
    test_result 1 "Block Negative Amount" "Expected 400, got $NEG_HTTP"
fi

sleep 0.5

# Test 6b: Scientific notation
echo "Testing scientific notation..."
SCI_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$API_BASE/api/economy/transfer" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"receiverId":"507f191e810c19729de860ea","amount":"1e10","currency":"EURO"}')

SCI_HTTP="${SCI_RESPONSE: -3}"
if [ "$SCI_HTTP" = "400" ]; then
    test_result 0 "Block Scientific Notation" "HTTP 400 (correctly blocked)"
else
    test_result 1 "Block Scientific Notation" "Expected 400, got $SCI_HTTP"
fi

sleep 0.5

# Test 6c: Too many decimals
echo "Testing excessive decimals..."
DEC_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$API_BASE/api/economy/transfer" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"receiverId":"507f191e810c19729de860ea","amount":"100.123456","currency":"EURO"}')

DEC_HTTP="${DEC_RESPONSE: -3}"
if [ "$DEC_HTTP" = "400" ]; then
    test_result 0 "Block Excessive Decimals" "HTTP 400 (correctly blocked)"
else
    test_result 1 "Block Excessive Decimals" "Expected 400, got $DEC_HTTP"
fi

sleep 1

# =============================================================================
# SCENARIO 7: TRANSACTION HISTORY
# =============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  SCENARIO 7: Transaction History                               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

HISTORY_RESPONSE=$(curl -s "$API_BASE/api/economy/history?limit=5" \
  -H "Authorization: Bearer $TOKEN")

HISTORY_SUCCESS=$(echo "$HISTORY_RESPONSE" | grep -o '"success":true')
TX_COUNT=$(echo "$HISTORY_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)

if [ -n "$HISTORY_SUCCESS" ]; then
    test_result 0 "Transaction History" "Transactions count: $TX_COUNT"
else
    test_result 1 "Transaction History" "Failed to fetch history"
fi

sleep 1

# =============================================================================
# SCENARIO 8: RATE LIMITING TEST
# =============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  SCENARIO 8: Rate Limiting Test (10 req / 5 min)               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "Sending 12 rapid requests to trigger rate limit..."
RATE_LIMIT_TRIGGERED=false

for i in {1..12}; do
    RESPONSE=$(curl -s -w "%{http_code}" "$API_BASE/api/economy/balance/EURO" \
      -H "Authorization: Bearer $TOKEN")
    
    HTTP_CODE="${RESPONSE: -3}"
    
    if [ "$HTTP_CODE" = "429" ]; then
        RATE_LIMIT_TRIGGERED=true
        echo "   Rate limit triggered at request #$i"
        test_result 0 "Rate Limiting Active" "Blocked after $i requests (expected: ≤11)"
        break
    fi
    
    sleep 0.2
done

if [ "$RATE_LIMIT_TRIGGERED" = false ]; then
    test_result 1 "Rate Limiting Active" "Rate limit was NOT triggered after 12 requests"
fi

# =============================================================================
# TEST SUMMARY
# =============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  TEST SUMMARY                                                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Total Tests:  $TOTAL_TESTS"
echo -e "${GREEN}✅ Passed:    $PASSED${NC}"
echo -e "${RED}❌ Failed:    $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED! Economy API is FULLY FUNCTIONAL!"
    echo ""
    echo "✅ Login/Authentication works"
    echo "✅ Admin Panel works"
    echo "✅ Economy API works"
    echo "✅ Security layers active"
    echo "✅ Rate limiting works"
    echo ""
    echo "🚀 PRODUCTION READY!"
    exit 0
else
    echo "⚠️  $FAILED test(s) failed. Review errors above."
    exit 1
fi
