# 🚀 MODULE 2.3 DEPLOYMENT GUIDE

**Module:** Marketplace & Metabolism  
**Version:** 2.3.0  
**Date:** 2026-02-14

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1. Code Verification
- [ ] All code committed to Git
- [ ] All tests pass locally
- [ ] No console errors in browser
- [ ] No server errors in logs

### 2. Database Preparation
- [ ] Backup current production database
- [ ] Test migrations on local copy
- [ ] Verify seed data integrity

### 3. Documentation
- [ ] All documentation complete
- [ ] API endpoints documented
- [ ] User guide updated

---

## 🔧 DEPLOYMENT STEPS

### Step 1: Backup Production Database

```bash
# SSH to production server
ssh root@ovidiuguru.online

# Create backup directory
mkdir -p /root/backups/$(date +%Y-%m-%d)

# Backup MongoDB
mongodump --db=mern-template --out=/root/backups/$(date +%Y-%m-%d)/

# Verify backup
ls -lh /root/backups/$(date +%Y-%m-%d)/
```

### Step 2: Push Code to GitHub

```bash
# On local machine
cd /root/MERN-template

# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: Module 2.3 - Marketplace & Metabolism System

- Add ItemPrototype, Inventory, MarketplaceListing, ConsumptionHistory models
- Add MarketplaceService and ConsumptionService
- Add 9 new API endpoints (inventory, marketplace, consumption)
- Add InventoryPanel, MarketplacePanel, ConsumptionModal components
- Integrate work rewards (players receive items when working)
- Add quality tier system (Q1-Q5)
- Add VAT collection on marketplace purchases
- Add consumption cooldown system
- Add comprehensive test scripts

BREAKING CHANGES: None
MIGRATION REQUIRED: Yes (seedItemPrototypes, add-work-rewards)"

# Push to GitHub
git push origin main
```

### Step 3: Pull Code on Production Server

```bash
# SSH to production server
ssh root@ovidiuguru.online

# Navigate to project directory
cd /root/MERN-template

# Stash any local changes (if any)
git stash

# Pull latest code
git pull origin main

# Install any new dependencies
npm install
cd microservices/economy-server && npm install && cd ../..
```

### Step 4: Run Database Migrations

```bash
# Still on production server
cd /root/MERN-template/microservices/economy-server

# Seed item prototypes (15 items)
node migrations/seedItemPrototypes.js

# Expected output:
# ✅ Seeded 15 item prototypes
# ✅ Migration complete

# Add work rewards to existing companies
node migrations/add-work-rewards.js

# Expected output:
# ✅ Updated X companies with work rewards
# ✅ Migration complete
```

### Step 5: Restart Services

```bash
# Restart economy server (contains new endpoints)
pm2 restart economy-server

# Restart main app (contains new frontend components)
pm2 restart mern-app

# Verify all services are running
pm2 status

# Check logs for errors
pm2 logs economy-server --lines 50
pm2 logs mern-app --lines 50
```

### Step 6: Run Smoke Tests

```bash
# Test inventory endpoint
curl -X GET https://ovidiuguru.online/api/economy/inventory \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Expected: 200 OK with empty inventory (for new users)

# Test marketplace endpoint
curl -X GET https://ovidiuguru.online/api/economy/marketplace \
  -H "Content-Type: application/json"

# Expected: 200 OK with marketplace listings

# Test consumption status
curl -X GET https://ovidiuguru.online/api/economy/consume/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Expected: 200 OK with cooldown status
```

### Step 7: Full User Journey Test

```bash
# Run comprehensive test script
cd /root/MERN-template
bash test-module-2.3-complete.sh

# Expected output:
# ✅ All 9 new endpoints working
# ✅ Work rewards integration working
# ✅ Marketplace purchase working
# ✅ Item consumption working
# ✅ Economic loop sustainable
```

---

## 🧪 POST-DEPLOYMENT VERIFICATION

### 1. Frontend Verification

1. **Open browser:** https://ovidiuguru.online
2. **Login** with test account
3. **Navigate to Dashboard**
4. **Verify new UI components:**
   - [ ] InventoryPanel visible
   - [ ] MarketplacePanel visible
   - [ ] Items display correctly
   - [ ] Purchase button works
   - [ ] Consume button works

### 2. Backend Verification

```bash
# Check all new endpoints
curl https://ovidiuguru.online/api/economy/inventory -H "Authorization: Bearer TOKEN"
curl https://ovidiuguru.online/api/economy/marketplace
curl https://ovidiuguru.online/api/economy/consume/status -H "Authorization: Bearer TOKEN"
```

### 3. Database Verification

```bash
# Connect to MongoDB
mongosh

# Use database
use mern-template

# Verify collections exist
show collections
# Should see: itemprototypes, inventories, marketplacelistings, consumptionhistories

# Check item prototypes
db.itemprototypes.countDocuments()
# Expected: 15

# Check marketplace listings
db.marketplacelistings.find().pretty()
# Expected: Some listings (if admin created them)
```

### 4. Economic Loop Test

**Complete User Journey:**

1. **Work** → Earn €8.50 + 1 Q1 Bread
2. **Check Inventory** → See 1 Q1 Bread
3. **Wait for energy decay** → Energy drops
4. **Consume Bread** → Energy restored
5. **Check Marketplace** → Browse items
6. **Purchase Item** → Buy with VAT
7. **Work Again** → Sustainable loop ✅

---

## 🔍 MONITORING (First 24 Hours)

### 1. Server Logs

```bash
# Monitor economy server logs
pm2 logs economy-server --lines 100

# Watch for errors
pm2 logs economy-server | grep ERROR

# Monitor main app logs
pm2 logs mern-app --lines 100
```

### 2. Database Monitoring

```bash
# Check database size
mongosh --eval "db.stats()"

# Monitor new collections growth
mongosh --eval "db.inventories.countDocuments()"
mongosh --eval "db.marketplacelistings.countDocuments()"
mongosh --eval "db.consumptionhistories.countDocuments()"
```

### 3. Performance Metrics

```bash
# Check server resources
htop

# Check MongoDB performance
mongosh --eval "db.serverStatus()"

# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s https://ovidiuguru.online/api/economy/marketplace
```

### 4. User Activity

```bash
# Check active users
mongosh --eval "db.users.countDocuments({ lastActive: { \$gte: new Date(Date.now() - 3600000) } })"

# Check recent transactions
mongosh --eval "db.consumptionhistories.find().sort({ consumedAt: -1 }).limit(10).pretty()"
```

---

## 🚨 ROLLBACK PROCEDURE (If Needed)

### If Critical Issues Arise:

```bash
# 1. SSH to server
ssh root@ovidiuguru.online

# 2. Stop services
pm2 stop economy-server
pm2 stop mern-app

# 3. Restore database backup
mongorestore --db=mern-template --drop /root/backups/YYYY-MM-DD/mern-template/

# 4. Revert code
cd /root/MERN-template
git log --oneline -10  # Find previous commit hash
git reset --hard PREVIOUS_COMMIT_HASH

# 5. Restart services
pm2 restart economy-server
pm2 restart mern-app

# 6. Verify rollback
curl https://ovidiuguru.online/api/economy/status
```

---

## ✅ SUCCESS CRITERIA

Module 2.3 deployment is successful when:

- [ ] All 9 new API endpoints respond correctly
- [ ] Frontend components render without errors
- [ ] Users can view inventory
- [ ] Users can browse marketplace
- [ ] Users can purchase items
- [ ] Users can consume items
- [ ] Work rewards are distributed correctly
- [ ] VAT is collected on purchases
- [ ] No errors in server logs
- [ ] No errors in browser console
- [ ] Database migrations completed
- [ ] Economic loop is sustainable

---

## 📞 SUPPORT

If issues arise during deployment:

1. **Check logs:** `pm2 logs economy-server`
2. **Check database:** `mongosh` → `use mern-template` → `show collections`
3. **Review documentation:** [`MODULE_2_3_COMPLETE.md`](MODULE_2_3_COMPLETE.md)
4. **Test scripts:** Run `test-module-2.3-complete.sh`

---

## 📚 RELATED DOCUMENTATION

- [`MODULE_2_3_COMPLETE.md`](MODULE_2_3_COMPLETE.md) - Complete implementation summary
- [`MODULE_2_3_MODELS_IMPLEMENTATION.md`](session-logs/2026-02-14/MODULE_2_3_MODELS_IMPLEMENTATION.md) - Database models
- [`MODULE_2_3_SERVICES_IMPLEMENTATION.md`](session-logs/2026-02-14/MODULE_2_3_SERVICES_IMPLEMENTATION.md) - Business logic
- [`MODULE_2_3_FRONTEND_COMPONENTS.md`](session-logs/2026-02-14/MODULE_2_3_FRONTEND_COMPONENTS.md) - UI components
- [`ECONOMY_API_DOCUMENTATION.md`](ECONOMY_API_DOCUMENTATION.md) - API reference

---

**Deployment Guide Version:** 1.0  
**Last Updated:** 2026-02-14  
**Status:** ✅ Ready for Production
