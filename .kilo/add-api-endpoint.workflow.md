# Kilo Code Workflow: Add API Endpoint

**Description:** Add a new REST API endpoint to the economy server  
**Steps:** 5  
**Invoke with:** `/add-api` or select from workflows menu

---

## Step 1: Research (1 min)

**Prompt:**
```
Check .kilo/code-map.md for file locations
Check .kilo/function-index.md for similar endpoints
Check .kilo/conventions.md for API template
```

**Expected:**
- Find `microservices/economy-server/routes/economy.js`
- Find similar endpoint for reference
- Get API template from conventions.md

---

## Step 2: Implement (3 min)

**Prompt:**
```
Open microservices/economy-server/routes/economy.js
Copy the API Endpoint Template from .kilo/conventions.md
Modify for new endpoint with:
- Route path
- Request validation
- Business logic call
- Response formatting
- Error handling
```

**Expected:**
- New endpoint added to routes/economy.js
- Uses verifyToken middleware
- Follows project conventions

---

## Step 3: Test (2 min)

**Prompt:**
```
Start local services: docker compose -f docker-compose.local.yml up -d
Test endpoint with curl:
curl -X POST http://localhost:3400/economy/[endpoint] \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data": "value"}'
Check response format
```

**Expected:**
- Endpoint responds with success: true
- Error handling works correctly

---

## Step 4: Update Index (1 min)

**Prompt:**
```
Update .kilo/function-index.md with new endpoint
Update docs/ECONOMY_API_DOCUMENTATION.md
```

**Expected:**
- New endpoint documented
- Function index includes new route

---

## Step 5: Verify (1 min)

**Prompt:**
```
Run test suite: scripts/local-test.cmd
Check for any regressions
```

**Expected:**
- All tests pass
- No breaking changes

---

## 📝 Notes

- Always use Decimal for money calculations
- Always use verifyToken middleware
- Always validate input
- Always return {success: true/false, data/error}

---

## 🎯 Quick Reference

| Item | Value |
|------|-------|
| File | `microservices/economy-server/routes/economy.js` |
| Template | `.kilo/conventions.md` |
| Test | `curl localhost:3400/economy/...` |
