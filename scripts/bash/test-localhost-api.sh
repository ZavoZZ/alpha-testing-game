#!/bin/bash

echo "Testing localhost:3000 API..."
echo ""

# Test 1: Health check
echo "1. Auth health endpoint:"
curl -s http://localhost:3000/api/auth-service/auth/health
echo ""
echo ""

# Test 2: Login
echo "2. Login test:"
JWT=$(curl -s -X POST http://localhost:3000/api/auth-service/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testjucator2026@gmail.com",
    "password": "testparola2026"
  }')

echo "JWT Token: $JWT"
echo ""
echo ""

# Test 3: Admin users endpoint
echo "3. Admin users endpoint:"
curl -s http://localhost:3000/api/auth-service/auth/admin/users \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" | head -100
echo ""
