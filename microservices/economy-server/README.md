# Economy Server - Microservice

**Port:** 3400  
**Purpose:** Economy system, work system, time simulation  
**Status:** 🟢 Production Ready

---

## 📁 Structure

```
economy-server/
├── routes/
│   └── economy.js          # 28 API endpoints
├── services/
│   ├── EconomyEngine.js    # Transaction engine
│   ├── GameClock.js        # Time simulation (496 lines)
│   ├── WorkService.js      # Work system logic
│   ├── WorkCalculator.js   # Salary calculator
│   ├── FinancialMath.js    # Decimal math utilities
│   └── index.js            # Service exports
├── middleware/
│   ├── auth.js             # JWT verification
│   ├── AntiFraudShield.js  # Fraud detection (7 layers)
│   └── index.js            # Middleware exports
├── models/
│   └── Company.js          # Company model
├── config/
│   └── gameConstants.js    # Game configuration
├── init/
│   └── createFounderCompanies.js # Initial companies
├── migrations/
│   └── add-life-simulation-fields.js # DB migration
├── server.js               # Service entry point
├── package.json            # Dependencies
└── Dockerfile              # Container config
```

---

## 🎯 Main Features

### 1. Economy API (28 Endpoints)
- Balance management
- Money transfers
- Transaction history
- System status
- Macro statistics

### 2. Work System
- Start work shifts
- Salary calculation
- Company management
- Work history
- Cooldown system

### 3. GameClock (The Timekeeper)
- Hourly tick system
- Life simulation
- Automatic salary payments
- Macro observer
- System state tracking

### 4. Security
- Anti-Fraud Shield (7 layers)
- JWT authentication
- Rate limiting (10 req / 5 min)
- Payload validation
- Account freezing

---

## 🚀 Quick Start

### Start Service
```bash
cd microservices/economy-server
npm install
npm start
```

### With Docker
```bash
docker compose up economy-server -d
```

### View Logs
```bash
docker logs economy-server --tail 50 -f
```

---

## 📊 API Endpoints

### Public
- `GET /health` - Health check

### User Endpoints (JWT Required)
- `GET /balance` - Get user balance
- `POST /transfer` - Transfer money
- `GET /history` - Transaction history
- `GET /system-status` - System status
- `GET /macro-stats` - Macro statistics
- `POST /work` - Start work shift
- `GET /work/status` - Work status
- `GET /work/preview` - Salary preview
- `GET /work/history` - Work history
- `GET /companies` - List companies
- `GET /companies/:id` - Company details
- `POST /companies/:id/join` - Join company

### Admin Endpoints (Admin JWT Required)
- `GET /admin/treasury` - Treasury balance
- `POST /admin/treasury/withdraw` - Withdraw from treasury
- `GET /admin/all-balances` - All user balances
- `POST /admin/freeze-account` - Freeze account
- `POST /admin/unfreeze-account` - Unfreeze account
- `GET /admin/tick-now` - Force tick
- `GET /admin/tick-status` - Tick status

**Full Documentation:** `docs/ECONOMY_API_DOCUMENTATION.md`

---

## 🔧 Configuration

### Game Constants
**File:** `config/gameConstants.js`

```javascript
TAX_RATES: {
  TRANSFER: 0.02,  // 2%
  MARKET: 0.05,    // 5%
  WORK: 0.10       // 10%
}

WORK_COOLDOWN_HOURS: 8
BASE_SALARY_RANGE: [50, 200]
```

### Environment Variables
```
MONGODB_URI=mongodb://mongodb:27017/auth_db
SECRET_ACCESS=your-secret-key
PORT=3400
```

---

## 🧪 Testing

### Test Scripts
```bash
# Economy comprehensive test
./test-economy-comprehensive.sh

# Work flow integration
./test-work-flow-integration.sh

# All APIs
./test-all-apis-v2.sh
```

### Manual Testing
```bash
# Health check
curl http://localhost:3400/health

# Get balance (requires JWT)
curl http://localhost:3400/balance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔍 Common Tasks

### Add New Endpoint
1. Edit `routes/economy.js`
2. Add middleware: `verifyToken` (and `verifyAdmin` if admin-only)
3. Implement logic (use services for complex operations)
4. Test with curl or test script
5. Update documentation

### Add New Service
1. Create file in `services/`
2. Export in `services/index.js`
3. Use in routes
4. Test thoroughly

### Update Game Constants
1. Edit `config/gameConstants.js`
2. Restart service: `docker restart economy-server`
3. Test affected features

---

## 🐛 Troubleshooting

### Service Won't Start
```bash
# Check logs
docker logs economy-server

# Common issues:
# - MongoDB not connected
# - Port 3400 already in use
# - Missing environment variables
```

### GameClock Not Ticking
```bash
# Check tick status
curl http://localhost:3400/admin/tick-status

# Force tick
curl http://localhost:3400/admin/tick-now

# Check logs for errors
docker logs economy-server | grep GameClock
```

### Transaction Errors
```bash
# Check Anti-Fraud Shield logs
docker logs economy-server | grep AntiFraud

# Common issues:
# - Rate limit exceeded
# - Insufficient balance
# - Invalid amount
```

---

## 📚 Related Documentation

- **API Docs**: `docs/ECONOMY_API_DOCUMENTATION.md`
- **Architecture**: `docs/architecture/ECONOMY_ENGINE_COMPLETE.md`
- **Database Models**: `docs/architecture/ECONOMIC_DATABASE_MODELS.md`
- **FinTech V2**: `docs/architecture/FINTECH_V2_UPGRADE.md`

---

**Last Updated:** 2026-02-14  
**Maintainer:** AI Assistant  
**Status:** 🟢 Production Ready
