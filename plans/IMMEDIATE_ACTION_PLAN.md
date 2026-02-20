# 🚨 PLAN DE ACȚIUNE IMEDIATĂ - MODULE 2.2 → 2.3

**Project:** PROJECT OMEGA - PBBG Economy Simulator  
**Status:** 🔴 CRITICAL - Bug Fix + System Audit Required  
**Date:** 2026-02-14  
**Priority:** URGENT

---

## 🎯 SITUAȚIA CURENTĂ

### Unde Suntem
- ✅ **Modulul 1:** Infrastructură FinTech - COMPLET
- ✅ **Modulul 2.1:** Timpul și Entropia - COMPLET
- ✅ **Modulul 2.2:** Sistemul de Muncă - COMPLET (cu bug)
- 🔵 **Modulul 2.3:** Piața și Metabolismul - PLANIFICAT (ready to implement)

### Bug Critic Descoperit
**Locație:** [`microservices/economy-server/services/WorkService.js:290`](microservices/economy-server/services/WorkService.js)  
**Problema:** Încearcă să salveze în `treasury.collected_work_tax_euro` dar câmpul NU există în schema MongoDB  
**Impact:** 🔴 **CRITICAL** - Banii din taxele pe salarii se pierd în neant  
**Status:** ❌ NEREZOLVAT

---

## 📋 PLAN DE ACȚIUNE (PRIORITIZAT)

### FAZA 0: BUG FIX CRITICAL (URGENT - 30 min)

#### Task 0.1: Verificare Schema Treasury
**Mode:** Code  
**Priority:** 🔴 CRITICAL  
**Time:** 5 min

**Acțiune:**
1. Citește [`microservices/economy-server/server.js`](microservices/economy-server/server.js) (Treasury schema)
2. Verifică dacă există `collected_work_tax_euro`
3. Documentează ce câmpuri există vs. ce câmpuri sunt folosite

**Expected Finding:**
```javascript
// Schema ACTUALĂ (probabil):
const treasurySchema = new mongoose.Schema({
    collected_income_tax_euro: Decimal128,  // ✅ Există
    collected_transfer_tax_euro: Decimal128, // ✅ Există
    collected_market_tax_euro: Decimal128,   // ✅ Există
    // collected_work_tax_euro: ???           // ❌ Lipsește?
});
```

---

#### Task 0.2: Fix Treasury Schema
**Mode:** Code  
**Priority:** 🔴 CRITICAL  
**Time:** 10 min

**Acțiune:**
1. Adaugă câmpul lipsă în schema Treasury
2. Asigură-te că toate câmpurile de taxe sunt prezente
3. Verifică că toate folosesc `Decimal128`

**Expected Fix:**
```javascript
const treasurySchema = new mongoose.Schema({
    // Existing fields
    collected_income_tax_euro: { 
        type: mongoose.Schema.Types.Decimal128, 
        default: () => mongoose.Types.Decimal128.fromString('0.0000') 
    },
    collected_transfer_tax_euro: { 
        type: mongoose.Schema.Types.Decimal128, 
        default: () => mongoose.Types.Decimal128.fromString('0.0000') 
    },
    collected_market_tax_euro: { 
        type: mongoose.Schema.Types.Decimal128, 
        default: () => mongoose.Types.Decimal128.fromString('0.0000') 
    },
    
    // NEW: Add missing field
    collected_work_tax_euro: { 
        type: mongoose.Schema.Types.Decimal128, 
        default: () => mongoose.Types.Decimal128.fromString('0.0000') 
    },
    
    total_collected: { 
        type: mongoose.Schema.Types.Decimal128, 
        default: () => mongoose.Types.Decimal128.fromString('0.0000') 
    },
    
    singleton: { type: Boolean, default: true, unique: true }
}, {
    timestamps: true
});
```

**Files to Modify:**
- `microservices/economy-server/server.js`

---

#### Task 0.3: Verificare WorkService
**Mode:** Code  
**Priority:** 🔴 CRITICAL  
**Time:** 10 min

**Acțiune:**
1. Citește [`WorkService.js`](microservices/economy-server/services/WorkService.js) linia ~280-300
2. Verifică că folosește corect `collected_work_tax_euro`
3. Verifică că `total_collected` este actualizat corect

**Expected Code:**
```javascript
// Around line 290 in WorkService.js
treasury.collected_work_tax_euro = FinancialMath.add(
    treasury.collected_work_tax_euro,
    governmentNetTax
);
treasury.total_collected = FinancialMath.add(
    treasury.total_collected,
    governmentNetTax
);
```

**Verification:**
- [ ] Câmpul `collected_work_tax_euro` este folosit corect
- [ ] `total_collected` este actualizat
- [ ] Folosește `FinancialMath.add()` (nu operatori nativi)

---

#### Task 0.4: Test Bug Fix Local
**Mode:** Debug  
**Priority:** 🔴 CRITICAL  
**Time:** 5 min

**Acțiune:**
1. Rulează server local
2. Execută un work shift
3. Verifică că taxa este salvată în Treasury

**Test Script:**
```bash
# Start server
cd microservices/economy-server
npm start

# In another terminal, test work endpoint
curl -X POST http://localhost:3400/api/economy/work \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Check Treasury
curl http://localhost:3400/api/economy/admin/treasury \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Result:**
```json
{
    "success": true,
    "treasury": {
        "collected_work_tax_euro": "1.5000",  // ✅ Should have value
        "total_collected": "1.5000"
    }
}
```

---

### FAZA 1: AUDIT COMPLET SISTEM (1-2 ore)

#### Task 1.1: Audit Database Models
**Mode:** Debug  
**Priority:** 🟡 HIGH  
**Time:** 30 min

**Acțiune:**
1. Verifică toate modelele MongoDB
2. Identifică inconsistențe între schema și utilizare
3. Documentează toate câmpurile Decimal128

**Models to Audit:**
- [ ] `User` - Verifică toate câmpurile de balance și taxe
- [ ] `Company` - Verifică funds, salaries, inventory
- [ ] `Treasury` - Verifică toate câmpurile de taxe
- [ ] `Ledger` - Verifică că toate tranzacțiile sunt înregistrate
- [ ] `SystemState` - Verifică că GameClock funcționează

**Checklist:**
- [ ] Toate câmpurile monetare folosesc `Decimal128`
- [ ] Toate câmpurile au getters pentru string conversion
- [ ] Toate indexurile sunt create corect
- [ ] Nu există câmpuri folosite dar nedefinite

---

#### Task 1.2: Audit API Endpoints
**Mode:** Debug  
**Priority:** 🟡 HIGH  
**Time:** 30 min

**Acțiune:**
1. Listează toate endpoint-urile active
2. Testează fiecare endpoint
3. Verifică autentificare și autorizare
4. Documentează erori găsite

**Endpoints to Test:**

**Auth Server (Port 3100):**
- [ ] `POST /api/auth-service/auth/signup`
- [ ] `POST /api/auth-service/auth/login`
- [ ] `POST /api/auth-service/auth/logout`
- [ ] `GET /api/auth-service/auth/admin/users`

**Economy Server (Port 3400):**
- [ ] `GET /api/economy/health`
- [ ] `GET /api/economy/balance`
- [ ] `POST /api/economy/transfer`
- [ ] `GET /api/economy/history`
- [ ] `POST /api/economy/work`
- [ ] `GET /api/economy/work/status`
- [ ] `GET /api/economy/work/preview`
- [ ] `GET /api/economy/companies`
- [ ] `GET /api/economy/admin/treasury`
- [ ] `GET /api/economy/admin/tick-now`

**Test Method:**
```bash
# Use existing test scripts
./test-all-apis-v2.sh
./test-economy-comprehensive.sh
./test-work-flow-integration.sh
```

---

#### Task 1.3: Audit GameClock & Cron Jobs
**Mode:** Debug  
**Priority:** 🟡 HIGH  
**Time:** 20 min

**Acțiune:**
1. Verifică că GameClock rulează corect
2. Verifică că toate cron jobs funcționează
3. Verifică că distributed locking funcționează
4. Testează manual un tick

**Verification:**
```bash
# Check GameClock status
curl http://localhost:3400/api/economy/admin/tick-status \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Force a tick (test)
curl http://localhost:3400/api/economy/admin/tick-now \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Check logs
tail -f microservices/economy-server/logs/gameclock.log
```

**Checklist:**
- [ ] Cron job rulează la fiecare oră (XX:00)
- [ ] Energy decay funcționează (-5 per hour)
- [ ] Happiness decay funcționează (-2 per hour)
- [ ] Distributed lock previne duplicate ticks
- [ ] Macro Observer colectează statistici
- [ ] Zombie process detection funcționează

---

#### Task 1.4: Audit Economic Balance
**Mode:** Debug  
**Priority:** 🟡 HIGH  
**Time:** 20 min

**Acțiune:**
1. Calculează total money supply
2. Verifică că nu există money duplication
3. Verifică că toate taxele sunt colectate
4. Verifică că Ledger este complet

**Verification Script:**
```javascript
// Run in MongoDB shell or create script
db.users.aggregate([
    {
        $group: {
            _id: null,
            total_euro: { $sum: { $toDouble: "$balance_euro" } },
            total_gold: { $sum: { $toDouble: "$balance_gold" } },
            user_count: { $sum: 1 }
        }
    }
]);

db.companies.aggregate([
    {
        $group: {
            _id: null,
            total_funds: { $sum: { $toDouble: "$funds_euro" } },
            company_count: { $sum: 1 }
        }
    }
]);

db.treasury.findOne();

// Total money = Users + Companies + Treasury
// Should match Ledger total
```

**Checklist:**
- [ ] Total money supply calculat
- [ ] Nu există negative balances
- [ ] Treasury are fonduri colectate
- [ ] Ledger entries match transactions
- [ ] Nu există money duplication

---

### FAZA 2: TESTE PRODUCTION (30 min)

#### Task 2.1: Test Production APIs
**Mode:** Debug  
**Priority:** 🟡 HIGH  
**Time:** 15 min

**Acțiune:**
1. Testează toate API-urile pe https://ovidiuguru.online
2. Verifică că bug-ul Treasury este rezolvat
3. Documentează orice erori

**Test Script:**
```bash
# Test production endpoints
BASE_URL="https://ovidiuguru.online"

# Test health
curl $BASE_URL/api/economy/health

# Test work (with real user token)
curl -X POST $BASE_URL/api/economy/work \
  -H "Authorization: Bearer REAL_TOKEN" \
  -H "Content-Type: application/json"

# Check Treasury (with admin token)
curl $BASE_URL/api/economy/admin/treasury \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Checklist:**
- [ ] Toate endpoint-urile răspund
- [ ] Response times < 200ms
- [ ] Nu există erori 500
- [ ] Treasury colectează taxe corect
- [ ] Work system funcționează

---

#### Task 2.2: Test Production GameClock
**Mode:** Debug  
**Priority:** 🟡 HIGH  
**Time:** 15 min

**Acțiune:**
1. Verifică că GameClock rulează pe production
2. Verifică că energy decay funcționează
3. Verifică că nu există zombie processes

**Verification:**
```bash
# SSH to production server
ssh root@ovidiuguru.online

# Check GameClock process
pm2 list | grep economy

# Check logs
pm2 logs economy-server --lines 100 | grep GameClock

# Check last tick time
curl https://ovidiuguru.online/api/economy/admin/tick-status \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Checklist:**
- [ ] GameClock process running
- [ ] Last tick < 1 hour ago
- [ ] No errors in logs
- [ ] Energy decay working
- [ ] No zombie processes

---

### FAZA 3: PREGĂTIRE MODULE 2.3 (30 min)

#### Task 3.1: Create Initial Item Prototypes (Seed Data)
**Mode:** Code  
**Priority:** 🟢 MEDIUM  
**Time:** 20 min

**Acțiune:**
1. Creează fișier seed pentru iteme inițiale
2. Definește 3 tipuri de iteme × 5 quality tiers = 15 iteme
3. Calculează prețuri balansate

**File to Create:**
`microservices/economy-server/init/seedItemPrototypes.js`

**Initial Items:**

```javascript
const INITIAL_ITEMS = [
    // ====================================================================
    // FOOD CATEGORY - Restores Energy
    // ====================================================================
    {
        item_code: 'BREAD_Q1',
        name: 'Pâine Simplă',
        description: 'Pâine de bază, perfectă pentru o gustare rapidă',
        category: 'FOOD',
        rarity: 'COMMON',
        has_quality_tiers: false,  // Q1 is standalone
        base_effects: {
            energy_restore: 5,
            happiness_restore: 0
        },
        base_price_euro: '1.0000',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 300,  // 5 minutes
        is_perishable: true,
        shelf_life_hours: 72  // 3 days
    },
    {
        item_code: 'BREAD_Q2',
        name: 'Pâine Proaspătă',
        description: 'Pâine proaspătă de calitate medie',
        category: 'FOOD',
        rarity: 'COMMON',
        base_effects: {
            energy_restore: 10,  // Q2 = 2x
            happiness_restore: 1
        },
        base_price_euro: '2.5000',  // Q2 = 2.5x price
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 300,
        is_perishable: true,
        shelf_life_hours: 72
    },
    {
        item_code: 'BREAD_Q3',
        name: 'Pâine Artizanală',
        description: 'Pâine artizanală de calitate superioară',
        category: 'FOOD',
        rarity: 'UNCOMMON',
        base_effects: {
            energy_restore: 18,  // Q3 = 3.5x
            happiness_restore: 2
        },
        base_price_euro: '5.0000',  // Q3 = 5x price
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 300,
        is_perishable: true,
        shelf_life_hours: 48
    },
    {
        item_code: 'BREAD_Q4',
        name: 'Pâine Premium',
        description: 'Pâine premium cu ingrediente selectate',
        category: 'FOOD',
        rarity: 'RARE',
        base_effects: {
            energy_restore: 28,  // Q4 = 5.5x
            happiness_restore: 3
        },
        base_price_euro: '10.0000',  // Q4 = 10x price
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 300,
        is_perishable: true,
        shelf_life_hours: 24
    },
    {
        item_code: 'BREAD_Q5',
        name: 'Pâine de Lux',
        description: 'Pâine de lux, preparată de cei mai buni brutari',
        category: 'FOOD',
        rarity: 'EPIC',
        base_effects: {
            energy_restore: 50,  // Q5 = 10x
            happiness_restore: 5
        },
        base_price_euro: '25.0000',  // Q5 = 25x price
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 300,
        is_perishable: true,
        shelf_life_hours: 12
    },
    
    // ====================================================================
    // ENTERTAINMENT CATEGORY - Restores Happiness
    // ====================================================================
    {
        item_code: 'NEWSPAPER_Q1',
        name: 'Ziar Local',
        description: 'Ziar local cu știri de bază',
        category: 'ENTERTAINMENT',
        rarity: 'COMMON',
        base_effects: {
            energy_restore: 0,
            happiness_restore: 3
        },
        base_price_euro: '0.5000',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 600,  // 10 minutes
        is_perishable: true,
        shelf_life_hours: 24  // 1 day
    },
    {
        item_code: 'NEWSPAPER_Q2',
        name: 'Ziar Regional',
        description: 'Ziar regional cu articole interesante',
        category: 'ENTERTAINMENT',
        rarity: 'COMMON',
        base_effects: {
            energy_restore: 0,
            happiness_restore: 6
        },
        base_price_euro: '1.2500',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 600,
        is_perishable: true,
        shelf_life_hours: 24
    },
    {
        item_code: 'NEWSPAPER_Q3',
        name: 'Ziar Național',
        description: 'Ziar național cu investigații de calitate',
        category: 'ENTERTAINMENT',
        rarity: 'UNCOMMON',
        base_effects: {
            energy_restore: 0,
            happiness_restore: 11  // 3 × 3.5
        },
        base_price_euro: '2.5000',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 600,
        is_perishable: true,
        shelf_life_hours: 24
    },
    {
        item_code: 'NEWSPAPER_Q4',
        name: 'Revistă Premium',
        description: 'Revistă premium cu conținut exclusiv',
        category: 'ENTERTAINMENT',
        rarity: 'RARE',
        base_effects: {
            energy_restore: 0,
            happiness_restore: 17  // 3 × 5.5
        },
        base_price_euro: '5.0000',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 600,
        is_perishable: true,
        shelf_life_hours: 168  // 1 week
    },
    {
        item_code: 'NEWSPAPER_Q5',
        name: 'Publicație de Lux',
        description: 'Publicație de lux cu articole de top',
        category: 'ENTERTAINMENT',
        rarity: 'EPIC',
        base_effects: {
            energy_restore: 0,
            happiness_restore: 30  // 3 × 10
        },
        base_price_euro: '12.5000',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 600,
        is_perishable: true,
        shelf_life_hours: 168
    },
    
    // ====================================================================
    // HYBRID CATEGORY - Restores Both
    // ====================================================================
    {
        item_code: 'COFFEE_Q1',
        name: 'Cafea Instant',
        description: 'Cafea instant pentru o trezire rapidă',
        category: 'FOOD',
        rarity: 'COMMON',
        base_effects: {
            energy_restore: 3,
            happiness_restore: 2
        },
        base_price_euro: '1.5000',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 900,  // 15 minutes
        is_perishable: false
    },
    {
        item_code: 'COFFEE_Q2',
        name: 'Cafea Filtru',
        description: 'Cafea filtru de calitate medie',
        category: 'FOOD',
        rarity: 'COMMON',
        base_effects: {
            energy_restore: 6,
            happiness_restore: 4
        },
        base_price_euro: '3.7500',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 900,
        is_perishable: false
    },
    {
        item_code: 'COFFEE_Q3',
        name: 'Espresso',
        description: 'Espresso aromat și puternic',
        category: 'FOOD',
        rarity: 'UNCOMMON',
        base_effects: {
            energy_restore: 11,  // 3 × 3.5
            happiness_restore: 7
        },
        base_price_euro: '7.5000',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 900,
        is_perishable: false
    },
    {
        item_code: 'COFFEE_Q4',
        name: 'Cappuccino Premium',
        description: 'Cappuccino premium cu lapte de calitate',
        category: 'FOOD',
        rarity: 'RARE',
        base_effects: {
            energy_restore: 17,  // 3 × 5.5
            happiness_restore: 11
        },
        base_price_euro: '15.0000',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 900,
        is_perishable: false
    },
    {
        item_code: 'COFFEE_Q5',
        name: 'Cafea de Lux',
        description: 'Cafea de lux din boabe rare',
        category: 'FOOD',
        rarity: 'EPIC',
        base_effects: {
            energy_restore: 30,  // 3 × 10
            happiness_restore: 20
        },
        base_price_euro: '37.5000',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 900,
        is_perishable: false
    }
];

module.exports = INITIAL_ITEMS;
```

---

#### Task 3.2: Update Company Work Rewards
**Mode:** Code  
**Priority:** 🟢 MEDIUM  
**Time:** 10 min

**Acțiune:**
1. Adaugă câmp `work_rewards` la Company model
2. Setează reward-uri pentru companiile existente

**Schema Update:**
```javascript
// In Company model
work_rewards: {
    type: [{
        item_code: { type: String, required: true },
        quantity: { 
            type: mongoose.Schema.Types.Decimal128, 
            default: '1.0000',
            get: (v) => v ? v.toString() : '1.0000'
        }
    }],
    default: []
}
```

**Seed Rewards for Existing Companies:**
```javascript
// State Food Company → Gives Q1 Bread
{
    work_rewards: [
        { item_code: 'BREAD_Q1', quantity: '1.0000' }
    ]
}

// State News Company → Gives Q1 Newspaper
{
    work_rewards: [
        { item_code: 'NEWSPAPER_Q1', quantity: '1.0000' }
    ]
}
```

---

### FAZA 4: ORCHESTRATOR PREPARATION (20 min)

#### Task 4.1: Create Orchestrator Master Plan
**Mode:** Architect  
**Priority:** 🟢 MEDIUM  
**Time:** 20 min

**Acțiune:**
1. Creează plan detaliat pentru Orchestrator
2. Împarte Module 2.3 în task-uri atomice
3. Definește dependencies și critical path
4. Creează checklist de verificare

**Document to Create:**
`plans/ORCHESTRATOR_MASTER_PLAN.md`

**Structure:**
```markdown
# ORCHESTRATOR MASTER PLAN - MODULE 2.3

## PHASE 0: PRE-IMPLEMENTATION (DONE)
- [x] Bug Fix Treasury
- [x] System Audit
- [x] Production Tests
- [x] Seed Data Preparation

## PHASE 1: MODELS (Week 1)
### Task 1.1: ItemPrototype Model
- Mode: Code
- Files: microservices/economy-server/models/ItemPrototype.js
- Dependencies: None
- Acceptance: Model created, indexed, tested

### Task 1.2: Inventory Model
- Mode: Code
- Files: microservices/economy-server/models/Inventory.js
- Dependencies: Task 1.1
- Acceptance: Polymorphic model working

[... continue for all 27 tasks ...]
```

---

## 📊 PROGRESS TRACKING

### Faza 0: Bug Fix (URGENT)
- [ ] Task 0.1: Verificare Schema Treasury
- [ ] Task 0.2: Fix Treasury Schema
- [ ] Task 0.3: Verificare WorkService
- [ ] Task 0.4: Test Bug Fix Local

### Faza 1: Audit Sistem
- [ ] Task 1.1: Audit Database Models
- [ ] Task 1.2: Audit API Endpoints
- [ ] Task 1.3: Audit GameClock & Cron Jobs
- [ ] Task 1.4: Audit Economic Balance

### Faza 2: Teste Production
- [ ] Task 2.1: Test Production APIs
- [ ] Task 2.2: Test Production GameClock

### Faza 3: Pregătire Module 2.3
- [ ] Task 3.1: Create Initial Item Prototypes
- [ ] Task 3.2: Update Company Work Rewards

### Faza 4: Orchestrator Preparation
- [ ] Task 4.1: Create Orchestrator Master Plan

**Total:** 0/13 tasks complete (0%)

---

## 🚨 CRITICAL ISSUES FOUND (TO BE UPDATED)

### Issue #1: Treasury Schema Bug
**Status:** 🔴 OPEN  
**Priority:** CRITICAL  
**Description:** `collected_work_tax_euro` field missing from schema  
**Impact:** Tax money lost  
**Fix:** Add field to Treasury schema  
**ETA:** 30 minutes

### Issue #2: TBD
**Status:** 🔵 PENDING AUDIT  
**Priority:** TBD  
**Description:** Will be discovered during audit  
**Impact:** TBD  
**Fix:** TBD  
**ETA:** TBD

---

## 🎯 SUCCESS CRITERIA

### Before Starting Module 2.3
- [ ] Zero critical bugs
- [ ] All existing APIs working
- [ ] GameClock running correctly
- [ ] Economic balance verified
- [ ] Production tests passing
- [ ] Seed data prepared
- [ ] Orchestrator plan ready

### After Module 2.3 Implementation
- [ ] All 27 tasks completed
- [ ] All tests passing
- [ ] Economic loop sustainable
- [ ] No money duplication
- [ ] No negative balances
- [ ] Production deployment successful

---

## 📞 NEXT ACTIONS

### Immediate (Next 30 min)
1. **Fix Treasury Bug** (Task 0.1-0.4)
2. **Test Fix Locally**
3. **Deploy to Production**

### Short Term (Next 2 hours)
1. **Complete System Audit** (Task 1.1-1.4)
2. **Test Production** (Task 2.1-2.2)
3. **Document All Issues Found**

### Medium Term (Next 4 hours)
1. **Prepare Module 2.3** (Task 3.1-3.2)
2. **Create Orchestrator Plan** (Task 4.1)
3. **Review with Team**

### Long Term (Next 5 weeks)
1. **Implement Module 2.3** (27 tasks)
2. **Test Comprehensively**
3. **Deploy to Production**
4. **Monitor & Iterate**

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-02-14  
**Status:** 🔴 URGENT - Bug Fix Required  
**Next Action:** Begin Task 0.1 (Verificare Schema Treasury)
