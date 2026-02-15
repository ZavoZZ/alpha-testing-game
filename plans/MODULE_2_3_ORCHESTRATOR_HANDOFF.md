# 🎭 MODULE 2.3: ORCHESTRATOR MODE HANDOFF

**Project:** PROJECT OMEGA - PBBG Economy Simulator  
**Module:** 2.3 - Marketplace & Metabolism Implementation  
**Mode:** Orchestrator Coordination Guide  
**Date:** 2026-02-14

---

## 📋 EXECUTIVE SUMMARY

This document provides a structured breakdown of Module 2.3 implementation for **Orchestrator Mode** to coordinate work across multiple AI modes (Code, Debug, Review, etc.).

### What Has Been Completed (Architect Mode)
✅ Complete architectural design  
✅ Database schema specifications  
✅ API endpoint definitions  
✅ Frontend component designs  
✅ Integration point analysis  
✅ Visual architecture diagrams  
✅ Implementation roadmap  
✅ Economic balance calculations  
✅ Security considerations  
✅ Testing strategy  

### What Needs To Be Done (Implementation)
🔵 Create 4 new database models  
🔵 Implement 15+ API endpoints  
🔵 Build 3 major frontend components  
🔵 Integrate with existing Work System  
🔵 Add GameClock cron jobs  
🔵 Write comprehensive tests  
🔵 Deploy to production  

---

## 🎯 ORCHESTRATOR TASK BREAKDOWN

### Phase 1: Foundation (Week 1) - 7 Days

#### Task 1.1: ItemPrototype Model Creation
**Mode:** Code  
**Priority:** Critical  
**Dependencies:** None  
**Estimated Time:** 4 hours

**Subtasks:**
1. Create [`microservices/economy-server/models/ItemPrototype.js`](microservices/economy-server/models/ItemPrototype.js)
2. Implement schema as specified in architecture doc
3. Add indexes for performance
4. Add virtual methods for effect calculation
5. Export model in [`microservices/economy-server/server.js`](microservices/economy-server/server.js)

**Acceptance Criteria:**
- [ ] Model file created with complete schema
- [ ] All fields match architecture specification
- [ ] Indexes created for `item_code`, `category`, `is_active`
- [ ] Virtual methods `getEffectsByQuality()` and `getPriceByQuality()` implemented
- [ ] Model exported and accessible globally

**Files to Create:**
- `microservices/economy-server/models/ItemPrototype.js`

**Files to Modify:**
- `microservices/economy-server/server.js` (add model import/export)

---

#### Task 1.2: Inventory Model Creation
**Mode:** Code  
**Priority:** Critical  
**Dependencies:** Task 1.1  
**Estimated Time:** 4 hours

**Subtasks:**
1. Create [`microservices/economy-server/models/Inventory.js`](microservices/economy-server/models/Inventory.js)
2. Implement polymorphic schema (owner_type discriminator)
3. Add compound indexes for queries
4. Add methods: `getEffects()`, `getMarketPrice()`
5. Export model

**Acceptance Criteria:**
- [ ] Model file created with polymorphic design
- [ ] Compound indexes for `(owner_id, owner_type, item_code, quality)`
- [ ] Methods correctly calculate effects based on quality
- [ ] Virtual population for `item_details`
- [ ] Model exported globally

**Files to Create:**
- `microservices/economy-server/models/Inventory.js`

**Files to Modify:**
- `microservices/economy-server/server.js`

---

#### Task 1.3: Seed Initial Items
**Mode:** Code  
**Priority:** High  
**Dependencies:** Task 1.1  
**Estimated Time:** 2 hours

**Subtasks:**
1. Create [`microservices/economy-server/init/seedItems.js`](microservices/economy-server/init/seedItems.js)
2. Define initial items:
   - Q1-Q5 Bread (FOOD)
   - Q1-Q5 Newspaper (ENTERTAINMENT)
   - Q1-Q5 Coffee (FOOD + ENTERTAINMENT)
3. Create script to populate database
4. Add to initialization sequence

**Acceptance Criteria:**
- [ ] Seed script created
- [ ] At least 3 item types with 5 quality tiers each (15 total)
- [ ] Script is idempotent (can run multiple times safely)
- [ ] Items appear in database after running

**Files to Create:**
- `microservices/economy-server/init/seedItems.js`

---

#### Task 1.4: Inventory API Endpoints
**Mode:** Code  
**Priority:** High  
**Dependencies:** Task 1.2  
**Estimated Time:** 6 hours

**Subtasks:**
1. Add routes to [`microservices/economy-server/server.js`](microservices/economy-server/server.js):
   - `GET /api/economy/inventory` - Get user's inventory
   - `GET /api/economy/inventory/:itemCode/:quality` - Get specific item
2. Implement authentication middleware
3. Implement query logic with population
4. Add error handling
5. Test endpoints

**Acceptance Criteria:**
- [ ] Both endpoints return correct data
- [ ] Authentication required and working
- [ ] Item details populated from ItemPrototype
- [ ] Calculated effects included in response
- [ ] Error handling for not found cases

**Files to Modify:**
- `microservices/economy-server/server.js`

---

#### Task 1.5: InventoryPanel Frontend Component
**Mode:** Code  
**Priority:** High  
**Dependencies:** Task 1.4  
**Estimated Time:** 8 hours

**Subtasks:**
1. Create [`client/pages/panels/InventoryPanel.jsx`](client/pages/panels/InventoryPanel.jsx)
2. Implement grid/list view toggle
3. Create ItemCard sub-component
4. Add filtering by category/quality
5. Add sorting options
6. Integrate with API
7. Style with [`modern-game.css`](client/styles/modern-game.css)

**Acceptance Criteria:**
- [ ] Component renders inventory items
- [ ] Grid and list views work
- [ ] Filters and sorting functional
- [ ] Shows item effects and prices
- [ ] Responsive design
- [ ] Loading and error states handled

**Files to Create:**
- `client/pages/panels/InventoryPanel.jsx`

**Files to Modify:**
- `client/pages/dashboard.jsx` (add new tab)
- `client/styles/modern-game.css` (add styles)

---

### Phase 2: Marketplace (Week 2) - 7 Days

#### Task 2.1: MarketplaceListing Model
**Mode:** Code  
**Priority:** Critical  
**Dependencies:** Task 1.2  
**Estimated Time:** 3 hours

**Subtasks:**
1. Create [`microservices/economy-server/models/MarketplaceListing.js`](microservices/economy-server/models/MarketplaceListing.js)
2. Implement schema with seller info
3. Add indexes for browsing queries
4. Add validation logic
5. Export model

**Acceptance Criteria:**
- [ ] Model created with complete schema
- [ ] Indexes for `(item_code, quality, price_per_unit_euro)`
- [ ] Unique constraint on `inventory_id`
- [ ] Model exported globally

**Files to Create:**
- `microservices/economy-server/models/MarketplaceListing.js`

**Files to Modify:**
- `microservices/economy-server/server.js`

---

#### Task 2.2: Marketplace Browse Endpoint
**Mode:** Code  
**Priority:** High  
**Dependencies:** Task 2.1  
**Estimated Time:** 4 hours

**Subtasks:**
1. Add `GET /api/economy/marketplace` endpoint
2. Implement filtering (category, quality, price range)
3. Implement sorting (price, date, popularity)
4. Implement pagination
5. Populate item details
6. Calculate VAT-inclusive prices

**Acceptance Criteria:**
- [ ] Endpoint returns paginated listings
- [ ] All filters work correctly
- [ ] Sorting options functional
- [ ] Item details populated
- [ ] VAT calculated and included
- [ ] Public access (no auth required for browsing)

**Files to Modify:**
- `microservices/economy-server/server.js`

---

#### Task 2.3: Marketplace Purchase Endpoint
**Mode:** Code  
**Priority:** Critical  
**Dependencies:** Task 2.2  
**Estimated Time:** 8 hours

**Subtasks:**
1. Add `POST /api/economy/marketplace/purchase` endpoint
2. Implement validation logic:
   - Listing exists
   - Quantity available
   - User has funds
   - User not frozen
3. Implement transaction logic:
   - Start MongoDB session
   - Deduct from buyer
   - Add to seller
   - Collect VAT to Treasury
   - Transfer inventory ownership
   - Update/delete listing
   - Create Ledger entries
   - Commit or rollback
4. Add comprehensive error handling
5. Test all edge cases

**Acceptance Criteria:**
- [ ] Purchase completes successfully
- [ ] Money transfers correctly (buyer → seller → treasury)
- [ ] Inventory ownership transfers
- [ ] Listing updated/deleted
- [ ] Ledger entries created
- [ ] Transaction is atomic (all or nothing)
- [ ] All error cases handled gracefully

**Files to Modify:**
- `microservices/economy-server/server.js`

**Integration Points:**
- Uses [`EconomyEngine.js`](microservices/economy-server/services/EconomyEngine.js) for transactions
- Uses [`FinancialMath.js`](microservices/economy-server/services/FinancialMath.js) for calculations
- Updates [`Treasury`](microservices/economy-server/server.js) model
- Creates [`Ledger`](microservices/economy-server/server.js) entries

---

#### Task 2.4: Marketplace List/Delist Endpoints (Admin)
**Mode:** Code  
**Priority:** Medium  
**Dependencies:** Task 2.1  
**Estimated Time:** 4 hours

**Subtasks:**
1. Add `POST /api/economy/marketplace/list` endpoint
2. Add `DELETE /api/economy/marketplace/delist/:listingId` endpoint
3. Implement admin/company owner authorization
4. Validate inventory ownership
5. Mark inventory as listed/unlisted

**Acceptance Criteria:**
- [ ] Admin can list items from company inventory
- [ ] Listing creates MarketplaceListing record
- [ ] Inventory marked as `is_listed = true`
- [ ] Delist removes listing and unlocks inventory
- [ ] Authorization checks work

**Files to Modify:**
- `microservices/economy-server/server.js`

---

#### Task 2.5: MarketplacePanel Frontend Component
**Mode:** Code  
**Priority:** High  
**Dependencies:** Task 2.2, Task 2.3  
**Estimated Time:** 10 hours

**Subtasks:**
1. Create [`client/pages/panels/MarketplacePanel.jsx`](client/pages/panels/MarketplacePanel.jsx)
2. Implement search bar
3. Create category tabs
4. Create filter controls (quality, price range)
5. Create ListingCard sub-component
6. Create PurchaseModal sub-component
7. Implement purchase flow with confirmation
8. Add pagination controls
9. Style with glassmorphism design

**Acceptance Criteria:**
- [ ] Component renders marketplace listings
- [ ] Search and filters work
- [ ] Category tabs functional
- [ ] Purchase modal shows preview
- [ ] Purchase completes successfully
- [ ] Balance updates in real-time
- [ ] Error messages displayed properly
- [ ] Responsive design

**Files to Create:**
- `client/pages/panels/MarketplacePanel.jsx`

**Files to Modify:**
- `client/pages/dashboard.jsx`
- `client/styles/modern-game.css`

---

### Phase 3: Consumption (Week 3) - 7 Days

#### Task 3.1: ConsumptionHistory Model
**Mode:** Code  
**Priority:** Medium  
**Dependencies:** None  
**Estimated Time:** 2 hours

**Subtasks:**
1. Create [`microservices/economy-server/models/ConsumptionHistory.js`](microservices/economy-server/models/ConsumptionHistory.js)
2. Implement schema for audit trail
3. Add indexes for analytics queries
4. Export model

**Acceptance Criteria:**
- [ ] Model created with complete schema
- [ ] Indexes for `(user_id, consumed_at)` and `(item_code, consumed_at)`
- [ ] Model exported globally

**Files to Create:**
- `microservices/economy-server/models/ConsumptionHistory.js`

**Files to Modify:**
- `microservices/economy-server/server.js`

---

#### Task 3.2: Consumption Endpoint
**Mode:** Code  
**Priority:** Critical  
**Dependencies:** Task 3.1, Task 1.2  
**Estimated Time:** 6 hours

**Subtasks:**
1. Add `POST /api/economy/consume` endpoint
2. Implement validation:
   - User owns item
   - Cooldown check
   - Quantity available
3. Implement consumption logic:
   - Get item effects from ItemPrototype
   - Calculate quality-scaled effects
   - Start transaction
   - Reduce inventory quantity
   - Update user energy/happiness (capped at 100)
   - Set cooldown timestamp
   - Create ConsumptionHistory entry
   - Commit or rollback
4. Add error handling

**Acceptance Criteria:**
- [ ] Consumption completes successfully
- [ ] Inventory quantity reduced
- [ ] User stats updated (energy/happiness)
- [ ] Stats capped at 100 (no overflow)
- [ ] Cooldown set correctly
- [ ] History entry created
- [ ] Transaction is atomic

**Files to Modify:**
- `microservices/economy-server/server.js`

---

#### Task 3.3: Consumption Status & History Endpoints
**Mode:** Code  
**Priority:** Low  
**Dependencies:** Task 3.2  
**Estimated Time:** 2 hours

**Subtasks:**
1. Add `GET /api/economy/consume/status` endpoint
2. Add `GET /api/economy/consume/history` endpoint
3. Implement cooldown check logic
4. Implement history pagination

**Acceptance Criteria:**
- [ ] Status endpoint returns cooldown info
- [ ] History endpoint returns paginated records
- [ ] Both endpoints authenticated

**Files to Modify:**
- `microservices/economy-server/server.js`

---

#### Task 3.4: ConsumptionModal Frontend Component
**Mode:** Code  
**Priority:** High  
**Dependencies:** Task 3.2  
**Estimated Time:** 6 hours

**Subtasks:**
1. Create [`client/pages/panels/ConsumptionModal.jsx`](client/pages/panels/ConsumptionModal.jsx)
2. Show current stats (energy, happiness)
3. Show effect preview
4. Show before/after comparison
5. Add quantity selector
6. Add confirmation button
7. Handle cooldown display
8. Integrate with consume API

**Acceptance Criteria:**
- [ ] Modal displays correctly
- [ ] Shows accurate effect preview
- [ ] Quantity selector works
- [ ] Consumption completes on confirm
- [ ] Stats update in real-time
- [ ] Cooldown timer displays
- [ ] Error handling works

**Files to Create:**
- `client/pages/panels/ConsumptionModal.jsx`

**Files to Modify:**
- `client/pages/panels/InventoryPanel.jsx` (add consume button)
- `client/styles/modern-game.css`

---

#### Task 3.5: Add Consume Buttons to InventoryPanel
**Mode:** Code  
**Priority:** High  
**Dependencies:** Task 3.4, Task 1.5  
**Estimated Time:** 2 hours

**Subtasks:**
1. Add "Consume" button to each ItemCard
2. Wire up to ConsumptionModal
3. Disable button during cooldown
4. Show cooldown timer
5. Refresh inventory after consumption

**Acceptance Criteria:**
- [ ] Consume button appears on consumable items
- [ ] Button opens ConsumptionModal
- [ ] Button disabled during cooldown
- [ ] Cooldown timer visible
- [ ] Inventory refreshes after consumption

**Files to Modify:**
- `client/pages/panels/InventoryPanel.jsx`

---

### Phase 4: Integration (Week 4) - 7 Days

#### Task 4.1: Work System Integration - Add Item Rewards
**Mode:** Code  
**Priority:** Critical  
**Dependencies:** Task 1.2  
**Estimated Time:** 4 hours

**Subtasks:**
1. Add `work_rewards` field to [`Company`](microservices/economy-server/models/Company.js) model
2. Modify [`WorkService.js`](microservices/economy-server/services/WorkService.js) to grant items after salary
3. Create/update Inventory entries
4. Test work → receive items flow

**Acceptance Criteria:**
- [ ] Company model has `work_rewards` array
- [ ] WorkService grants items after successful work
- [ ] Items appear in player inventory
- [ ] Transaction is atomic (salary + items together)

**Files to Modify:**
- `microservices/economy-server/models/Company.js`
- `microservices/economy-server/services/WorkService.js`

---

#### Task 4.2: GameClock Integration - Marketplace Cleanup
**Mode:** Code  
**Priority:** Medium  
**Dependencies:** Task 2.1  
**Estimated Time:** 3 hours

**Subtasks:**
1. Add `cleanupExpiredListings()` method to [`GameClock.js`](microservices/economy-server/services/GameClock.js)
2. Find listings where `expires_at <= now`
3. Unlist inventory items
4. Delete expired listings
5. Add to hourly tick sequence

**Acceptance Criteria:**
- [ ] Method added to GameClock
- [ ] Expired listings removed automatically
- [ ] Inventory items unlocked
- [ ] Runs every hour with other tick tasks

**Files to Modify:**
- `microservices/economy-server/services/GameClock.js`

---

#### Task 4.3: GameClock Integration - Perishable Decay
**Mode:** Code  
**Priority:** Low  
**Dependencies:** Task 1.2  
**Estimated Time:** 2 hours

**Subtasks:**
1. Add `decayPerishableItems()` method to GameClock
2. Find inventory items where `is_perishable = true` and `expires_at <= now`
3. Delete expired items
4. Log deletions
5. Add to hourly tick sequence

**Acceptance Criteria:**
- [ ] Method added to GameClock
- [ ] Expired perishable items deleted
- [ ] Owners notified (future enhancement)
- [ ] Runs every hour

**Files to Modify:**
- `microservices/economy-server/services/GameClock.js`

---

#### Task 4.4: Economic Balancing - Calculate Optimal Prices
**Mode:** Code  
**Priority:** High  
**Dependencies:** All previous tasks  
**Estimated Time:** 4 hours

**Subtasks:**
1. Create [`microservices/economy-server/utils/EconomicBalancer.js`](microservices/economy-server/utils/EconomicBalancer.js)
2. Implement formulas for:
   - Item base prices
   - Quality multipliers
   - Production costs
   - Profit margins
3. Ensure player profitability
4. Update seed data with balanced prices

**Acceptance Criteria:**
- [ ] Players earn more than they spend
- [ ] Companies remain profitable
- [ ] Government collects sufficient taxes
- [ ] No inflation or deflation
- [ ] Full economic loop sustainable

**Files to Create:**
- `microservices/economy-server/utils/EconomicBalancer.js`

**Files to Modify:**
- `microservices/economy-server/init/seedItems.js`

---

#### Task 4.5: Admin Panel - Item Management
**Mode:** Code  
**Priority:** Medium  
**Dependencies:** Task 1.1  
**Estimated Time:** 6 hours

**Subtasks:**
1. Add admin endpoints:
   - `POST /api/economy/admin/items/create`
   - `PUT /api/economy/admin/items/:itemCode`
   - `DELETE /api/economy/admin/items/:itemCode`
   - `POST /api/economy/admin/inventory/grant`
2. Create admin UI panel for item management
3. Add to existing [`admin-panel.jsx`](client/pages/administration/admin-panel.jsx)

**Acceptance Criteria:**
- [ ] Admin can create new items
- [ ] Admin can edit existing items
- [ ] Admin can grant items to users
- [ ] UI is user-friendly
- [ ] Authorization checks work

**Files to Modify:**
- `microservices/economy-server/server.js`
- `client/pages/administration/admin-panel.jsx`

---

### Phase 5: Testing & Deployment (Week 5) - 7 Days

#### Task 5.1: Unit Tests - Models
**Mode:** Code  
**Priority:** High  
**Dependencies:** All model tasks  
**Estimated Time:** 6 hours

**Subtasks:**
1. Create test files for each model:
   - `tests/models/ItemPrototype.test.js`
   - `tests/models/Inventory.test.js`
   - `tests/models/MarketplaceListing.test.js`
   - `tests/models/ConsumptionHistory.test.js`
2. Test schema validation
3. Test virtual methods
4. Test indexes

**Acceptance Criteria:**
- [ ] All models have test coverage
- [ ] Tests pass successfully
- [ ] Edge cases covered
- [ ] Code coverage > 80%

**Files to Create:**
- `tests/models/ItemPrototype.test.js`
- `tests/models/Inventory.test.js`
- `tests/models/MarketplaceListing.test.js`
- `tests/models/ConsumptionHistory.test.js`

---

#### Task 5.2: Integration Tests - API Endpoints
**Mode:** Code  
**Priority:** High  
**Dependencies:** All API tasks  
**Estimated Time:** 8 hours

**Subtasks:**
1. Create test files for each endpoint group:
   - `tests/api/inventory.test.js`
   - `tests/api/marketplace.test.js`
   - `tests/api/consumption.test.js`
2. Test success cases
3. Test error cases
4. Test authentication
5. Test authorization

**Acceptance Criteria:**
- [ ] All endpoints have test coverage
- [ ] Tests pass successfully
- [ ] Error handling verified
- [ ] Code coverage > 80%

**Files to Create:**
- `tests/api/inventory.test.js`
- `tests/api/marketplace.test.js`
- `tests/api/consumption.test.js`

---

#### Task 5.3: E2E Tests - User Flows
**Mode:** Code  
**Priority:** High  
**Dependencies:** All tasks  
**Estimated Time:** 8 hours

**Subtasks:**
1. Create E2E test file: `tests/e2e/economic-loop.test.js`
2. Test complete player journey:
   - Work → Earn money + items
   - Energy decays
   - Consume items → Restore energy
   - Buy items from marketplace
   - Work again
3. Verify economic sustainability

**Acceptance Criteria:**
- [ ] Full economic loop tested
- [ ] Player remains profitable
- [ ] All systems integrate correctly
- [ ] Tests pass successfully

**Files to Create:**
- `tests/e2e/economic-loop.test.js`

---

#### Task 5.4: Load Testing - Marketplace
**Mode:** Debug  
**Priority:** Medium  
**Dependencies:** Task 2.3  
**Estimated Time:** 4 hours

**Subtasks:**
1. Create load test script: `tests/load/marketplace-load.js`
2. Simulate 100 concurrent purchases
3. Measure response times
4. Identify bottlenecks
5. Optimize if needed

**Acceptance Criteria:**
- [ ] Marketplace handles 100 concurrent requests
- [ ] Response times < 200ms
- [ ] No transaction failures
- [ ] No race conditions

**Files to Create:**
- `tests/load/marketplace-load.js`

---

#### Task 5.5: Security Audit
**Mode:** Debug  
**Priority:** Critical  
**Dependencies:** All tasks  
**Estimated Time:** 6 hours

**Subtasks:**
1. Review all endpoints for vulnerabilities
2. Test rate limiting
3. Test input validation
4. Test transaction atomicity
5. Test anti-fraud measures
6. Document findings
7. Fix any issues

**Acceptance Criteria:**
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Rate limiting works
- [ ] Input validation comprehensive
- [ ] Transactions are atomic
- [ ] Anti-fraud shield active

**Files to Review:**
- All API endpoints
- All transaction logic
- All input validation

---

#### Task 5.6: Documentation
**Mode:** Code  
**Priority:** Medium  
**Dependencies:** All tasks  
**Estimated Time:** 4 hours

**Subtasks:**
1. Create API documentation: `docs/MODULE_2_3_API_DOCUMENTATION.md`
2. Create user guide: `docs/MODULE_2_3_USER_GUIDE.md`
3. Create admin guide: `docs/MODULE_2_3_ADMIN_GUIDE.md`
4. Update main README
5. Create Postman collection

**Acceptance Criteria:**
- [ ] All endpoints documented
- [ ] User guide complete
- [ ] Admin guide complete
- [ ] Postman collection created
- [ ] README updated

**Files to Create:**
- `docs/MODULE_2_3_API_DOCUMENTATION.md`
- `docs/MODULE_2_3_USER_GUIDE.md`
- `docs/MODULE_2_3_ADMIN_GUIDE.md`

---

#### Task 5.7: Deployment
**Mode:** Code  
**Priority:** Critical  
**Dependencies:** All tasks  
**Estimated Time:** 4 hours

**Subtasks:**
1. Run all tests locally
2. Commit all changes
3. Push to GitHub
4. Deploy to production server
5. Run smoke tests on production
6. Monitor for errors
7. Gather initial metrics

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] Code deployed to production
- [ ] No errors in production logs
- [ ] Smoke tests pass
- [ ] Monitoring active

**Files to Modify:**
- All project files (commit & push)

---

## 📊 PROGRESS TRACKING

### Overall Progress
- **Phase 1 (Foundation):** 0/5 tasks complete (0%)
- **Phase 2 (Marketplace):** 0/5 tasks complete (0%)
- **Phase 3 (Consumption):** 0/5 tasks complete (0%)
- **Phase 4 (Integration):** 0/5 tasks complete (0%)
- **Phase 5 (Testing):** 0/7 tasks complete (0%)

**Total:** 0/27 tasks complete (0%)

### Estimated Timeline
- **Start Date:** 2026-02-17 (Monday)
- **End Date:** 2026-03-23 (Monday)
- **Duration:** 5 weeks (35 days)
- **Working Days:** 25 days (5 days/week)

### Resource Allocation
- **Backend Development:** 60% of time
- **Frontend Development:** 25% of time
- **Testing:** 10% of time
- **Documentation:** 5% of time

---

## 🎯 CRITICAL PATH

The following tasks are on the critical path and must be completed in order:

1. **Task 1.1** → ItemPrototype Model (blocks everything)
2. **Task 1.2** → Inventory Model (blocks marketplace & consumption)
3. **Task 2.1** → MarketplaceListing Model (blocks marketplace)
4. **Task 2.3** → Purchase Endpoint (blocks marketplace testing)
5. **Task 3.2** → Consumption Endpoint (blocks consumption testing)
6. **Task 4.1** → Work Integration (blocks economic loop)
7. **Task 5.3** → E2E Tests (validates everything)
8. **Task 5.7** → Deployment (final step)

**Critical Path Duration:** ~20 days

---

## 🚨 RISK MANAGEMENT

### High-Risk Areas

#### Risk 1: Transaction Atomicity
**Impact:** High (money duplication/loss)  
**Probability:** Medium  
**Mitigation:**
- Use MongoDB transactions for all money transfers
- Extensive testing of rollback scenarios
- Code review by senior developer

#### Risk 2: Economic Imbalance
**Impact:** High (game becomes unplayable)  
**Probability:** Medium  
**Mitigation:**
- Calculate all prices mathematically
- Test full economic loop before deployment
- Monitor metrics closely after launch
- Be ready to adjust prices quickly

#### Risk 3: Performance Issues
**Impact:** Medium (slow marketplace)  
**Probability:** Low  
**Mitigation:**
- Add proper database indexes
- Load test before deployment
- Implement caching if needed
- Monitor query performance

#### Risk 4: Security Vulnerabilities
**Impact:** High (fraud, exploits)  
**Probability:** Low  
**Mitigation:**
- Security audit before deployment
- Rate limiting on all endpoints
- Input validation everywhere
- Anti-fraud shield active

---

## 📞 COMMUNICATION PROTOCOL

### Daily Standups
- **When:** Every morning at 9:00 AM
- **Duration:** 15 minutes
- **Format:**
  - What was completed yesterday?
  - What will be done today?
  - Any blockers?

### Weekly Reviews
- **When:** Every Friday at 4:00 PM
- **Duration:** 1 hour
- **Format:**
  - Demo completed features
  - Review progress vs. timeline
  - Adjust priorities if needed

### Issue Escalation
- **Blocker:** Report immediately to orchestrator
- **Bug:** Create GitHub issue, assign to debug mode
- **Question:** Ask in team chat, escalate if no answer in 1 hour

---

## 🎓 MODE-SPECIFIC INSTRUCTIONS

### For Code Mode
- Follow FinTech standards (use [`FinancialMath.js`](microservices/economy-server/services/FinancialMath.js) for all money calculations)
- Use MongoDB transactions for all financial operations
- Add comprehensive error handling
- Write JSDoc comments for all functions
- Follow existing code style

### For Debug Mode
- Test all edge cases
- Verify transaction atomicity
- Check for race conditions
- Monitor performance
- Review security

### For Review Mode
- Check code against architecture spec
- Verify all acceptance criteria met
- Review test coverage
- Check for code smells
- Approve or request changes

### For Ask Mode
- Clarify any ambiguities in specs
- Research best practices
- Provide recommendations
- Answer technical questions

---

## 📚 REFERENCE DOCUMENTS

### Architecture & Design
- [`plans/MODULE_2_3_MARKETPLACE_METABOLISM_ARCHITECTURE.md`](plans/MODULE_2_3_MARKETPLACE_METABOLISM_ARCHITECTURE.md) - Complete architecture
- [`plans/MODULE_2_3_VISUAL_DIAGRAMS.md`](plans/MODULE_2_3_VISUAL_DIAGRAMS.md) - Visual diagrams

### Existing Code
- [`microservices/economy-server/services/FinancialMath.js`](microservices/economy-server/services/FinancialMath.js) - Financial calculations
- [`microservices/economy-server/services/EconomyEngine.js`](microservices/economy-server/services/EconomyEngine.js) - Transaction engine
- [`microservices/economy-server/services/WorkService.js`](microservices/economy-server/services/WorkService.js) - Work system
- [`microservices/economy-server/services/GameClock.js`](microservices/economy-server/services/GameClock.js) - Time simulation
- [`microservices/economy-server/models/Company.js`](microservices/economy-server/models/Company.js) - Company model

### Documentation
- [`GAME_PROJECT_TREE.md`](GAME_PROJECT_TREE.md) - Project overview
- [`docs/ECONOMY_API_DOCUMENTATION.md`](docs/ECONOMY_API_DOCUMENTATION.md) - Existing API docs

---

## ✅ FINAL CHECKLIST

Before marking Module 2.3 as complete, verify:

- [ ] All 27 tasks completed
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code reviewed and approved
- [ ] Documentation complete
- [ ] Deployed to production
- [ ] No errors in production logs
- [ ] Metrics being collected
- [ ] Economic loop sustainable
- [ ] Players can work → earn → buy → consume → repeat
- [ ] Companies remain profitable
- [ ] Government collects taxes
- [ ] No inflation or deflation detected

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-02-14  
**Status:** Ready for Orchestrator Mode  
**Next Action:** Begin Phase 1, Task 1.1 (ItemPrototype Model)
