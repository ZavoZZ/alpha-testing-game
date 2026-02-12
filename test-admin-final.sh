#!/bin/bash

echo "Testing Admin Panel API..."
echo ""

# Login
JWT=$(curl -s -X POST http://localhost:3000/api/auth-service/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testjucator2026@gmail.com", "password": "testparola2026"}')

echo "JWT Response: $JWT"
echo ""

if echo "$JWT" | grep -q "error\|Invalid"; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Login successful"
echo "Token: ${JWT:0:50}..."
echo ""

# Test admin endpoint
echo "Testing admin users endpoint..."
USERS=$(curl -s http://localhost:3000/api/auth-service/auth/admin/users \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$USERS" | head -50
echo ""

if echo "$USERS" | grep -q '"users"'; then
  echo "✅ Admin API works!"
else
  echo "❌ Admin API failed"
fi
