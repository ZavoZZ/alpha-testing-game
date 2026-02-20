# Add API Endpoint

Add a new REST API endpoint to the economy server following project conventions.

## Steps

1. **Research**
   - Check .kilo/code-map.md for file location: microservices/economy-server/routes/economy.js
   - Check .kilo/function-index.md for similar endpoints
   - Check .kilo/conventions.md for API template

2. **Implement**
   - Open microservices/economy-server/routes/economy.js
   - Copy API template from .kilo/conventions.md
   - Add new endpoint with verifyToken middleware
   - Follow response format: {success: true, data: ...}

3. **Test**
   - Run: docker compose -f docker-compose.local.yml up -d
   - Test with curl: curl -X POST http://localhost:3400/economy/endpoint -H "Authorization: Bearer TOKEN"

4. **Update Documentation**
   - Update .kilo/function-index.md with new endpoint
   - Update docs/ECONOMY_API_DOCUMENTATION.md

5. **Verify**
   - Run: scripts/local-test.cmd
   - Check for errors
