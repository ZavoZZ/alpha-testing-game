# Run Tests

Run the complete test suite to verify functionality.

## Steps

1. **Setup**
   - Ensure services running: docker compose -f docker-compose.local.yml ps
   - If not running: docker compose -f docker-compose.local.yml up -d
   - Wait for services to be ready (10 seconds)

2. **Run Tests**
   - Windows: scripts\local-test.cmd
   - Or: node scripts/browser-test.js for browser automation

3. **API Testing**
   - Run: bash scripts/bash/test-all-apis-v2.sh
   - Check all economy endpoints work
   - Verify authentication works

4. **Manual Verification**
   - Open browser: http://localhost:3000
   - Test login with: testjucator@ovidiuguru.com / Password123!
   - Test dashboard loads
   - Test work system
   - Test inventory

5. **Report**
   - Note any failures
   - Check Docker logs if issues: docker compose logs
   - Fix any failures before deployment
