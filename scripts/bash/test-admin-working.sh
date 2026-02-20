#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "  ADMIN API TEST - FINAL VERIFICATION"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Login with CORRECT email
JWT=$(curl -s -X POST http://localhost:3000/api/auth-service/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testjucator@ovidiuguru.com", "password": "testparola2026"}')

echo "JWT Response length: ${#JWT}"

if echo "$JWT" | grep -q "error\|Invalid\|<!DOCTYPE"; then
  echo "❌ Login failed: $JWT"
  exit 1
fi

echo "✅ Login successful!"
echo "Token: ${JWT:0:80}..."
echo ""

# Test admin users endpoint
echo "Testing GET /auth/admin/users..."
USERS=$(curl -s http://localhost:3000/api/auth-service/auth/admin/users \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json")

echo "Users response:"
echo "$USERS" | head -200
echo ""

if echo "$USERS" | grep -q '"users"'; then
  USER_COUNT=$(echo "$USERS" | grep -o '"username"' | wc -l)
  echo "✅ Admin API WORKS! Found $USER_COUNT users"
  echo ""
  echo "🎉 ALL SYSTEMS OPERATIONAL!"
else
  echo "❌ Admin API failed"
  echo "Response: $USERS"
fi
