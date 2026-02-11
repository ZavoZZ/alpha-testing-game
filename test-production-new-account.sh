#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🆕 PRODUCTION TEST - NEW ACCOUNT CREATION                     ║"
echo "║  Server: ovidiuguru.online                                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

BASE_URL="https://ovidiuguru.online"
TIMESTAMP=$(date +%s)
EMAIL="prodtest${TIMESTAMP}@test.com"
USERNAME="prodtest${TIMESTAMP}"
PASSWORD="securepass123"

echo "📝 Creating new account:"
echo "   Email: $EMAIL"
echo "   Username: $USERNAME"
echo ""

# Step 1: Signup
echo "📝 Step 1: Signup..."
SIGNUP=$(curl -s -X POST "$BASE_URL/api/auth-service/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")
echo "$SIGNUP"
if echo "$SIGNUP" | grep -q "successfully"; then
  echo "✅ Signup successful"
else
  echo "❌ Signup failed"
  exit 1
fi
echo ""

# Step 2: Login
echo "📝 Step 2: Login with new account..."
TOKEN=$(curl -s -X POST "$BASE_URL/api/auth-service/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if [[ ${#TOKEN} -lt 100 ]]; then
  echo "❌ Login failed: $TOKEN"
  exit 1
fi
echo "✅ Login successful (token: ${#TOKEN} chars)"
echo ""

# Step 3: Check Economy Balances (Should have default 0.0000)
echo "📝 Step 3: Check Initial Balances..."
BALANCES=$(curl -s "$BASE_URL/api/economy/balances" \
  -H "Authorization: Bearer $TOKEN")
echo "$BALANCES"
if echo "$BALANCES" | grep -q '"EURO":"0.0000"'; then
  echo "✅ Economy fields initialized correctly (EURO: 0.0000)"
else
  echo "❌ Economy fields NOT initialized properly!"
  exit 1
fi
echo ""

# Step 4: Check All Currencies
echo "📝 Step 4: Check All Currency Balances..."
for CURRENCY in EURO GOLD RON; do
  BALANCE=$(curl -s "$BASE_URL/api/economy/balance/$CURRENCY" \
    -H "Authorization: Bearer $TOKEN")
  if echo "$BALANCE" | grep -q '"balance":"0.0000"'; then
    echo "   ✅ $CURRENCY: 0.0000"
  else
    echo "   ❌ $CURRENCY failed: $BALANCE"
  fi
done
echo ""

# Step 5: Transaction History (Should be empty)
echo "📝 Step 5: Transaction History (should be empty)..."
HISTORY=$(curl -s "$BASE_URL/api/economy/history" \
  -H "Authorization: Bearer $TOKEN")
if echo "$HISTORY" | grep -q '"count":0'; then
  echo "✅ Transaction history empty (as expected for new user)"
else
  echo "❌ Unexpected history: $HISTORY"
fi
echo ""

# Step 6: Test Security - Unauthenticated Request
echo "📝 Step 6: Security Test - Unauthenticated Request..."
UNAUTH=$(curl -s "$BASE_URL/api/economy/balances")
if echo "$UNAUTH" | grep -q '"code":"NO_AUTH_HEADER"'; then
  echo "✅ Unauthenticated access blocked (security working)"
else
  echo "⚠️  Response: $UNAUTH"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ ALL TESTS COMPLETE (New Account)                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo "New Account: $EMAIL"
