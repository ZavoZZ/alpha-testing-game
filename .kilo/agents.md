# AI Agent Workflows

**Last Updated:** 2026-02-20  
**Purpose:** Standard operating procedures for common AI tasks

---

## 🚨 CRITICAL: Always Use Codebase Indexing First

**Before ANY code search or exploration:**

```
1. ✅ Use codebase_search tool FIRST
2. ✅ Check .kilo/code-map.md for file locations
3. ✅ Check .kilo/function-index.md for function locations
4. ✅ Check .kilo/context.json for project metadata
5. ❌ NEVER manually search without checking index first
```

**This applies to ALL models: GLM-5, Claude, GPT, Haiku, etc.**

---

## 📋 Workflow 1: Add API Endpoint

### Step 1: Research (Use Index!)
```
1. Use codebase_search: "API endpoint pattern"
2. Check .kilo/code-map.md → Economy API section
3. Check .kilo/conventions.md → API Endpoint Template
4. Read existing endpoint for reference
```

### Step 2: Implementation
```
1. Open microservices/economy-server/routes/economy.js
2. Copy the API Endpoint Template from conventions.md
3. Modify for new endpoint
4. Add validation (verifyToken middleware)
5. Add business logic
6. Add error handling
7. Return response
```

### Step 3: Testing
```
1. Start local services: docker compose -f docker-compose.local.yml up -d
2. Test endpoint with curl or Postman
3. Check logs: docker compose logs economy-server
4. Verify response format
```

### Step 4: Documentation
```
1. Update .kilo/function-index.md with new endpoint
2. Update docs/ECONOMY_API_DOCUMENTATION.md
3. Add test to scripts/bash/test-all-apis-v2.sh
```

---

## 📋 Workflow 2: Add React Component

### Step 1: Research (Use Index!)
```
1. Use codebase_search: "React component pattern"
2. Check .kilo/code-map.md → Frontend Pages section
3. Check .kilo/conventions.md → React Component Template
4. Read similar component for reference
```

### Step 2: Implementation
```
1. Create file in client/pages/ or client/pages/panels/
2. Import React hooks (useState, useEffect)
3. Import auth context from game-auth-provider.jsx
4. Create component function
5. Add state management
6. Add API calls
7. Add JSX rendering
8. Export component
```

### Step 3: Integration
```
1. Import in parent component or app.jsx
2. Add route if needed
3. Add navigation link
4. Test in browser
```

### Step 4: Documentation
```
1. Update .kilo/code-map.md with new component
2. Update client/pages/README.md
```

---

## 📋 Workflow 3: Update Database Model

### Step 1: Research (Use Index!)
```
1. Use codebase_search: "database model schema"
2. Check .kilo/code-map.md → Database Models section
3. Read existing model for reference
```

### Step 2: Implementation
```
1. Open model file in server/database/models/ or microservices/*/models/
2. Add new field to schema
3. Add validation
4. Add indexes if needed
5. Add methods if needed
```

### Step 3: Migration
```
1. Consider existing data migration
2. Update API endpoints that use model
3. Update frontend components
4. Test with existing data
```

### Step 4: Documentation
```
1. Update .kilo/function-index.md with new methods
2. Update docs/architecture/ECONOMIC_DATABASE_MODELS.md
```

---

## 📋 Workflow 4: Debug Issue

### Step 1: Identify Problem
```
1. Get error message from user
2. Check logs: docker compose logs [service]
3. Check browser console for frontend errors
4. Check network tab for API errors
```

### Step 2: Locate Code (Use Index!)
```
1. Use codebase_search with error keywords
2. Check .kilo/faq.md for known issues
3. Check .kilo/function-index.md for related functions
4. Check .kilo/code-map.md for file locations
```

### Step 3: Fix Issue
```
1. Read the problematic code
2. Identify the bug
3. Implement fix
4. Add error handling if missing
5. Add logging for debugging
```

### Step 4: Verify Fix
```
1. Restart affected service
2. Reproduce the issue
3. Verify fix works
4. Check for side effects
5. Update .kilo/faq.md if common issue
```

---

## 📋 Workflow 5: Add Service/Business Logic

### Step 1: Research (Use Index!)
```
1. Use codebase_search: "service pattern"
2. Check .kilo/code-map.md → Economy System section
3. Read existing service for reference
```

### Step 2: Implementation
```
1. Create file in microservices/economy-server/services/
2. Import required models
3. Create service class
4. Add methods
5. Add error handling
6. Export service
```

### Step 3: Integration
```
1. Import in routes file
2. Initialize service
3. Use in endpoints
4. Test thoroughly
```

### Step 4: Documentation
```
1. Update .kilo/function-index.md with new methods
2. Update .kilo/code-map.md with new file
3. Update .kilo/dependencies.md
```

---

## 📋 Workflow 6: Add Middleware

### Step 1: Research (Use Index!)
```
1. Use codebase_search: "middleware pattern"
2. Check existing middleware in microservices/*/middleware/
3. Read auth.js middleware for reference
```

### Step 2: Implementation
```
1. Create file in microservices/*/middleware/
2. Create middleware function
3. Add req, res, next parameters
4. Implement logic
5. Call next() on success
6. Return error on failure
```

### Step 3: Integration
```
1. Import in routes file
2. Add to route: router.get('/path', middleware, handler)
3. Test with valid and invalid cases
```

---

## 📋 Workflow 7: Update Configuration

### Step 1: Identify Config
```
1. Check .kilo/code-map.md → Configuration Files section
2. Identify which config file to update
3. Check current values
```

### Step 2: Update
```
1. Open config file
2. Update values
3. Validate format (JSON, ENV, etc.)
4. Save file
```

### Step 3: Apply Changes
```
1. Restart affected services
2. Verify new configuration
3. Test functionality
```

---

## 📋 Workflow 8: Deploy to Production

### Step 1: Pre-deployment
```
1. Run all tests: scripts/local-test.cmd
2. Check for uncommitted changes: git status
3. Commit changes: git add . && git commit -m "message"
4. Push to GitHub: git push origin main
5. Wait for GitHub Actions to pass
```

### Step 2: Deploy
```
1. SSH to production: ssh root@ovidiuguru.online
2. Navigate: cd /root/MERN-template
3. Pull changes: git pull origin main
4. Backup: cp -r . ../backup-$(date +%Y%m%d-%H%M%S)
5. Rebuild: docker compose up -d --build
```

### Step 3: Verify
```
1. Check services: docker ps
2. Check logs: docker compose logs -f
3. Test site: https://ovidiuguru.online
4. Test login
5. Test critical features
```

### Step 4: Rollback if Needed
```
1. SSH to production
2. Stop services: docker compose down
3. Restore: rm -rf * && cp -r ../backup-TIMESTAMP/* .
4. Restart: docker compose up -d
```

---

## 🔄 Post-Change Checklist

After making any changes:

```
[ ] Test locally
[ ] Update .kilo/function-index.md if functions changed
[ ] Update .kilo/code-map.md if files added/moved
[ ] Update .kilo/context.json if metadata changed
[ ] Update relevant documentation
[ ] Commit changes with descriptive message
```

---

## 📊 Cost Optimization Tips

### Use Local Context First
```
✅ .kilo/code-map.md (0 API calls)
✅ .kilo/function-index.md (0 API calls)
✅ .kilo/context.json (0 API calls)
✅ codebase_search (1 API call)
❌ Manual file reading (multiple API calls)
```

### Batch Related Questions
```
✅ Ask multiple questions in one message
❌ Multiple separate messages for related tasks
```

### Be Specific
```
✅ "Where is the work reward calculation?"
❌ "How does work work?"
```

---

**Note:** Follow these workflows to ensure consistent, efficient AI assistance.
