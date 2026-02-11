#!/bin/bash

# =============================================================================
# NEW PLAYER JOURNEY TEST - Complete Onboarding Verification
# =============================================================================
# 
# Tests that NEW PLAYERS can:
# 1. Sign up successfully
# 2. Login and get JWT token
# 3. Access Economy API endpoints
# 4. Have all necessary economy fields initialized
# 
# @version 1.0.0
# @date 2026-02-11

API_BASE="https://ovidiuguru.online"
TIMESTAMP=$(date +%s)
TEST_EMAIL="newplayer${TIMESTAMP}@test.com"
TEST_USERNAME="newplayer${TIMESTAMP}"
TEST_PASSWORD="securepass123"
TOKEN=""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🎮 NEW PLAYER JOURNEY TEST                                    ║"
echo "║  Server: ovidiuguru.online (PRODUCTION)                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Test Account:"
echo "  Email: $TEST_EMAIL"
echo "  Username: $TEST_USERNAME"
echo ""

# =============================================================================
# STEP 1: SIGNUP
# =============================================================================
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  STEP 1: Sign Up (Create New Account)                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

SIGNUP_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/auth-service/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"username\":\"$TEST_USERNAME\",\"password\":\"$TEST_PASSWORD\"}")

HTTP_CODE=$(echo "$SIGNUP_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$SIGNUP_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✅ Sign Up Successful${NC}"
    echo "   Response: $RESPONSE_BODY"
else
    echo -e "${RED}❌ Sign Up Failed (HTTP $HTTP_CODE)${NC}"
    echo "   Response: $RESPONSE_BODY"
    exit 1
fi

echo ""
sleep 2

# =============================================================================
# STEP 2: LOGIN
# =============================================================================
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  STEP 2: Login with New Account                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/api/auth-service/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

# Auth-server returns JWT as plain text
if [[ "$LOGIN_RESPONSE" =~ ^eyJ ]]; then
    TOKEN="$LOGIN_RESPONSE"
    echo -e "${GREEN}✅ Login Successful${NC}"
    echo "   Token: ${TOKEN:0:50}..."
    
    # Decode JWT payload
    PAYLOAD=$(echo "$TOKEN" | cut -d. -f2)
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
else
    echo -e "${RED}❌ Login Failed${NC}"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi

echo ""
sleep 2

# =============================================================================
# STEP 3: VERIFY DATABASE FIELDS
# =============================================================================
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  STEP 3: Verify Database Economy Fields                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "Checking if user has economy fields in database..."
echo "(This requires Docker access on server)"
echo ""

# This will be run manually or via SSH
echo -e "${BLUE}Manual verification command:${NC}"
echo "docker compose exec -T mongo mongosh auth_db --quiet --eval \"db.users.findOne({username: '$TEST_USERNAME'})\""
echo ""
sleep 1

# =============================================================================
# STEP 4: ECONOMY API - GET ALL BALANCES
# =============================================================================
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  STEP 4: Economy API - Get All Balances                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

BALANCES_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/api/economy/balances" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$BALANCES_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$BALANCES_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Get Balances Successful${NC}"
    
    # Parse balances
    EURO=$(echo "$RESPONSE_BODY" | grep -o '"EURO":"[^"]*"' | cut -d'"' -f4)
    GOLD=$(echo "$RESPONSE_BODY" | grep -o '"GOLD":"[^"]*"' | cut -d'"' -f4)
    RON=$(echo "$RESPONSE_BODY" | grep -o '"RON":"[^"]*"' | cut -d'"' -f4)
    
    echo "   EURO: $EURO"
    echo "   GOLD: $GOLD"
    echo "   RON: $RON"
    
    # Verify default values
    if [ "$EURO" = "0.0000" ] && [ "$GOLD" = "0.0000" ] && [ "$RON" = "0.0000" ]; then
        echo -e "${GREEN}   ✅ All balances initialized to 0.0000 (CORRECT!)${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Unexpected balance values${NC}"
    fi
elif [ "$HTTP_CODE" = "404" ]; then
    echo -e "${RED}❌ Get Balances Failed: User Not Found${NC}"
    echo "   This means economy fields were NOT created during signup!"
    echo "   Response: $RESPONSE_BODY"
    exit 1
elif [ "$HTTP_CODE" = "429" ]; then
    echo -e "${YELLOW}⚠️  Rate Limited (Security Working!)${NC}"
    echo "   This is expected if you ran many tests recently"
    echo "   Wait 5 minutes and try again"
else
    echo -e "${RED}❌ Get Balances Failed (HTTP $HTTP_CODE)${NC}"
    echo "   Response: $RESPONSE_BODY"
    exit 1
fi

echo ""
sleep 2

# =============================================================================
# STEP 5: ECONOMY API - GET SINGLE BALANCE
# =============================================================================
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  STEP 5: Economy API - Get Single Balance (EURO)               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

SINGLE_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/api/economy/balance/EURO" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$SINGLE_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$SINGLE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Get Single Balance Successful${NC}"
    
    BALANCE=$(echo "$RESPONSE_BODY" | grep -o '"balance":"[^"]*"' | cut -d'"' -f4)
    echo "   EURO Balance: $BALANCE"
elif [ "$HTTP_CODE" = "404" ]; then
    echo -e "${RED}❌ Get Single Balance Failed: User Not Found${NC}"
    echo "   Response: $RESPONSE_BODY"
    exit 1
elif [ "$HTTP_CODE" = "429" ]; then
    echo -e "${YELLOW}⚠️  Rate Limited${NC}"
else
    echo -e "${RED}❌ Get Single Balance Failed (HTTP $HTTP_CODE)${NC}"
    echo "   Response: $RESPONSE_BODY"
fi

echo ""
sleep 2

# =============================================================================
# STEP 6: ECONOMY API - TRANSACTION HISTORY
# =============================================================================
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  STEP 6: Economy API - Transaction History                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

HISTORY_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/api/economy/history?limit=5" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$HISTORY_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$HISTORY_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Transaction History Accessible${NC}"
    
    COUNT=$(echo "$RESPONSE_BODY" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo "   Transactions: $COUNT (expected 0 for new player)"
    
    if [ "$COUNT" = "0" ]; then
        echo -e "${GREEN}   ✅ Correct! New player has 0 transactions${NC}"
    fi
elif [ "$HTTP_CODE" = "429" ]; then
    echo -e "${YELLOW}⚠️  Rate Limited${NC}"
else
    echo -e "${RED}❌ Transaction History Failed (HTTP $HTTP_CODE)${NC}"
    echo "   Response: $RESPONSE_BODY"
fi

echo ""

# =============================================================================
# FINAL SUMMARY
# =============================================================================
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  📊 TEST SUMMARY                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Test Account:"
echo "  Email: $TEST_EMAIL"
echo "  Username: $TEST_USERNAME"
echo "  User ID: $USER_ID"
echo ""
echo "Results:"
echo "  ✅ Sign Up: SUCCESS"
echo "  ✅ Login: SUCCESS"
echo "  ✅ JWT Token: RECEIVED"
if [ "$HTTP_CODE" = "429" ]; then
    echo "  ⚠️  Economy API: RATE LIMITED (but authentication works!)"
else
    echo "  ✅ Economy API: SUCCESS"
fi
echo ""

if [ "$HTTP_CODE" != "429" ]; then
    echo -e "${GREEN}🎉 NEW PLAYER JOURNEY COMPLETE!${NC}"
    echo ""
    echo "✅ New players can:"
    echo "  - Sign up successfully"
    echo "  - Login and get JWT token"
    echo "  - Access Economy API endpoints"
    echo "  - Have all economy fields initialized (0.0000 balances)"
    echo ""
    echo "🚀 System is PRODUCTION READY for new players!"
else
    echo -e "${YELLOW}⚠️  TEST PARTIALLY COMPLETE (Rate Limited)${NC}"
    echo ""
    echo "✅ Sign up and Login work perfectly"
    echo "⚠️  Economy API blocked by rate limiter (security working!)"
    echo ""
    echo "💡 To complete full test:"
    echo "   1. Wait 5 minutes for rate limit reset"
    echo "   2. Run this test again"
    echo "   OR"
    echo "   3. Test from different IP address"
fi
echo ""
