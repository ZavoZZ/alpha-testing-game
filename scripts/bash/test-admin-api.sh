#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "  ADMIN API TEST - COMPLETE FLOW"
echo "═══════════════════════════════════════════════════════════"
echo ""

BASE_URL="https://ovidiuguru.online"

# Step 1: Login as admin
echo "Step 1: Login as admin..."

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth-service/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testjucator2026@gmail.com",
    "password": "testparola2026"
  }')

echo "Login response: $LOGIN_RESPONSE"
echo ""

# Extract JWT token
JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -oP '(?<=")[A-Za-z0-9._-]+' | head -1)

if [ -z "$JWT_TOKEN" ]; then
  echo "❌ Failed to get JWT token"
  echo "Response was: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ JWT Token obtained: ${JWT_TOKEN:0:50}..."
echo ""

# Step 2: Test admin users endpoint
echo "Step 2: Fetch all users (admin endpoint)..."
echo ""

USERS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth-service/auth/admin/users" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json")

echo "Users response:"
echo "$USERS_RESPONSE" | head -100
echo ""

# Check if successful
if echo "$USERS_RESPONSE" | grep -q "users"; then
  echo "✅ Admin API works!"
  echo ""
  USER_COUNT=$(echo "$USERS_RESPONSE" | grep -o '"username"' | wc -l)
  echo "Found $USER_COUNT users in database"
else
  echo "❌ Admin API failed!"
  echo "Full response: $USERS_RESPONSE"
fi
