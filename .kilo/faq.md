# FAQ - Quick Answers

**Last Updated:** 2026-02-20  
**Purpose:** Instant answers for common questions

---

## 🔐 Authentication Issues

### Q: Login returns 401 Unauthorized
**A:** Check these common causes:
1. Token expired - User needs to login again
2. Invalid token format - Check Authorization header: `Bearer <token>`
3. Token not being sent - Check frontend token provider
4. **File:** `microservices/auth-server/routes/auth.js`

### Q: Signup returns "User already exists"
**A:** Email is already registered. Check:
1. Database for existing user: `db.users.findOne({email: "..."})`
2. **File:** `microservices/auth-server/routes/auth.js:~60`

### Q: Password reset not working
**A:** Check:
1. Email is correct and exists in database
2. Token hasn't expired (24h limit)
3. **File:** `microservices/auth-server/routes/auth.js:~220`

---

## 💰 Economy Issues

### Q: Work cooldown not working correctly
**A:** Check:
1. GameClock is running: `docker logs economy-server | grep GameClock`
2. Cooldown time in WorkService: `COOLDOWN_TIME` constant
3. **File:** `microservices/economy-server/services/WorkService.js:~210`

### Q: Balance shows wrong amount
**A:** Check:
1. Using Decimal.js for calculations
2. Balance is stored as string in MongoDB
3. **File:** `microservices/economy-server/services/EconomyEngine.js:~20`

### Q: Transfer fails with "Insufficient funds"
**A:** Check:
1. User has enough balance (use Decimal comparison)
2. Tax is calculated correctly
3. **File:** `microservices/economy-server/services/EconomyEngine.js:~50`

### Q: Inventory not updating
**A:** Check:
1. InventoryService is saving changes
2. Frontend is refreshing data
3. **File:** `microservices/economy-server/services/InventoryService.js:~40`

### Q: Marketplace listing not appearing
**A:** Check:
1. Item exists in seller's inventory
2. Price is valid (positive number)
3. **File:** `microservices/economy-server/services/MarketplaceService.js:~1`

---

## 🎮 Frontend Issues

### Q: Dashboard not loading
**A:** Check:
1. User is authenticated (check token)
2. API endpoints are accessible
3. Check browser console for errors
4. **File:** `client/pages/dashboard.jsx:~50`

### Q: Work button disabled
**A:** Check:
1. User is on cooldown
2. Work status is being fetched correctly
3. **File:** `client/pages/panels/WorkStation.jsx:~80`

### Q: Inventory shows empty
**A:** Check:
1. API returns inventory data
2. User has items in database
3. **File:** `client/pages/panels/InventoryPanel.jsx:~50`

### Q: CSS not applying correctly
**A:** Check:
1. Class names match CSS selectors
2. CSS file is imported
3. Webpack is building correctly
4. **File:** `client/styles/modern-game.css`

---

## 🗄️ Database Issues

### Q: MongoDB connection fails
**A:** Check:
1. MongoDB container is running: `docker ps | grep mongodb`
2. Connection string in `.env.local`
3. Network connectivity
4. **Command:** `docker logs mongodb`

### Q: User data not persisting
**A:** Check:
1. Mongoose connection is established
2. Save is awaited: `await user.save()`
3. No validation errors
4. **File:** `server/database/models/User.js`

### Q: Queries are slow
**A:** Check:
1. Indexes are created: `db.collection.getIndexes()`
2. Query uses indexed fields
3. **Files:** Model files with `schema.index()`

---

## 🐳 Docker Issues

### Q: Container won't start
**A:** Check:
1. Port is not in use: `netstat -ano | findstr :3000`
2. Docker has enough memory
3. Check logs: `docker compose logs [service]`
4. **Command:** `docker compose -f docker-compose.local.yml up -d`

### Q: Container keeps restarting
**A:** Check:
1. Application error: `docker logs [container]`
2. Health check failing
3. Environment variables missing
4. **Command:** `docker inspect [container]`

### Q: Can't connect to service
**A:** Check:
1. Container is running: `docker ps`
2. Port mapping is correct
3. Firewall not blocking
4. **Command:** `docker compose ps`

---

## 🚀 Deployment Issues

### Q: Deployment fails
**A:** Check:
1. GitHub Actions passed
2. Server has disk space: `df -h`
3. Docker is running on server
4. **File:** `.github/workflows/` (if exists)

### Q: Site returns 502 Bad Gateway
**A:** Check:
1. Containers are running: `docker ps`
2. Nginx/reverse proxy config
3. Application logs: `docker compose logs`
4. **Command:** `docker compose logs -f`

### Q: SSL certificate issues
**A:** Check:
1. Certificate is valid
2. Domain points to correct IP
3. Port 443 is open
4. **Provider:** Cloudflare (if used)

---

## 🔧 Development Issues

### Q: Hot reload not working
**A:** Check:
1. Webpack watch mode is enabled
2. File is being saved
3. Docker volume is mounted correctly
4. **File:** `webpack.config.js`

### Q: Environment variables not loading
**A:** Check:
1. `.env.local` file exists
2. Variables are prefixed correctly
3. File is not in `.gitignore` locally
4. **File:** `.env.local`

### Q: npm install fails
**A:** Check:
1. `package.json` is valid
2. npm registry is accessible
3. Clear cache: `npm cache clean --force`
4. Delete `node_modules` and try again

---

## 🤖 AI/Kilo Code Issues

### Q: Codebase indexing not working
**A:** Check:
1. Qdrant is running: `docker ps | grep qdrant`
2. OpenAI API key is valid
3. `.kilocodeignore` is not too restrictive
4. **File:** `.vscode/settings.json`

### Q: AI not using .kilo files
**A:** Check:
1. `.cursorrules` exists and is readable
2. `.kilo/` files exist
3. Files are not in `.gitignore` for AI
4. **File:** `.cursorrules`

### Q: AI responses are slow
**A:** Check:
1. Use `codebase_search` first (faster)
2. Check `.kilo/code-map.md` before searching
3. Batch related questions
4. **File:** `.kilo/agents.md`

---

## 📍 Quick File Locations

| Question | Answer | File |
|----------|--------|------|
| Where is login? | Auth routes | `microservices/auth-server/routes/auth.js` |
| Where is work? | Work service | `microservices/economy-server/services/WorkService.js` |
| Where is balance? | Economy engine | `microservices/economy-server/services/EconomyEngine.js` |
| Where is inventory? | Inventory service | `microservices/economy-server/services/InventoryService.js` |
| Where is marketplace? | Marketplace service | `microservices/economy-server/services/MarketplaceService.js` |
| Where is admin? | Admin panel | `client/pages/administration/admin-panel.jsx` |
| Where is User model? | Database model | `server/database/models/User.js` |
| Where is config? | Client config | `client/config.js` |

---

## 🔍 Debugging Commands

```bash
# Check all services
docker compose -f docker-compose.local.yml ps

# View logs
docker compose -f docker-compose.local.yml logs -f [service]

# Check MongoDB
docker exec -it mongodb mongosh auth_db

# Check Qdrant
curl http://localhost:6333/collections/mern-template-codebase

# Test API
curl http://localhost:3400/economy/balance -H "Authorization: Bearer TOKEN"

# Restart service
docker compose -f docker-compose.local.yml restart [service]
```

---

**Note:** If your issue is not listed, use `codebase_search` to find relevant code.
