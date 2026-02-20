#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🎮 PRODUCTION TEST - EXISTING ACCOUNT                         ║"
echo "║  Account: newplayer1770842973@test.com                         ║"
echo "║  Server: ovidiuguru.online                                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

BASE_URL="https://ovidiuguru.online"
EMAIL="newplayer1770842973@test.com"
PASSWORD="securepass123"

# Step 1: Login
echo "📝 Step 1: Login..."
TOKEN=$(curl -s -X POST "$BASE_URL/api/auth-service/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if [[ ${#TOKEN} -lt 100 ]]; then
  echo "❌ Login failed: $TOKEN"
  exit 1
fi
echo "✅ Login successful (token: ${#TOKEN} chars)"
echo ""

# Step 2: Economy Health
echo "📝 Step 2: Economy API Health..."
HEALTH=$(curl -s "$BASE_URL/api/economy/health")
echo "$HEALTH"
if echo "$HEALTH" | grep -q '"success":true'; then
  echo "✅ Economy API healthy"
else
  echo "❌ Economy API unhealthy"
fi
echo ""

# Step 3: Get All Balances
echo "📝 Step 3: Get All Balances..."
BALANCES=$(curl -s "$BASE_URL/api/economy/balances" \
  -H "Authorization: Bearer $TOKEN")
echo "$BALANCES"
if echo "$BALANCES" | grep -q '"success":true'; then
  echo "✅ Balances retrieved"
else
  echo "❌ Failed to get balances"
fi
echo ""

# Step 4: Get Single Balance (EURO)
echo "📝 Step 4: Get Single Balance (EURO)..."
EURO=$(curl -s "$BASE_URL/api/economy/balance/EURO" \
  -H "Authorization: Bearer $TOKEN")
echo "$EURO"
if echo "$EURO" | grep -q '"success":true'; then
  echo "✅ EURO balance retrieved"
else
  echo "❌ Failed to get EURO balance"
fi
echo ""

# Step 5: Transaction History
echo "📝 Step 5: Transaction History..."
HISTORY=$(curl -s "$BASE_URL/api/economy/history" \
  -H "Authorization: Bearer $TOKEN")
echo "$HISTORY"
if echo "$HISTORY" | grep -q '"success":true'; then
  echo "✅ Transaction history retrieved"
else
  echo "❌ Failed to get history"
fi
echo ""

# Step 6: Security - Invalid Amount (Should be blocked)
echo "📝 Step 6: Security Test - Invalid Amount..."
INVALID=$(curl -s -X POST "$BASE_URL/api/economy/transfer" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"receiverId":"000000000000000000000000","amount":"-10.00","currency":"EURO"}')
echo "$INVALID"
if echo "$INVALID" | grep -q '"code":"INVALID_AMOUNT"'; then
  echo "✅ Invalid amount blocked (security working)"
else
  echo "⚠️  Response: $INVALID"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ ALL TESTS COMPLETE (Existing Account)                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
