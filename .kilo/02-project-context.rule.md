# Kilo Code Workspace Rule: Project Context

**Priority:** HIGH  
**Applies to:** All modes  
**Applies to:** All models

---

## 📋 Project Overview

**Project Name:** MERN Economic Simulation Game  
**Type:** Microservices Architecture  
**Stack:** React, Node.js, Express, MongoDB, Docker  
**Production:** https://ovidiuguru.online

---

## 🏗️ Architecture

### Microservices (Ports)
- **Main App**: 3000 (React frontend + proxy)
- **Auth Server**: 3100 (Authentication, JWT, User management)
- **News Server**: 3200 (News/blog system)
- **Chat Server**: 3300 (Real-time chat)
- **Economy Server**: 3400 (Economy, Work, GameClock)

### Database
- **MongoDB**: 27017 (auth_db)
- **Qdrant**: 6333 (Vector database for AI)

---

## 🔧 Code Standards

### File Naming
- **React Components**: PascalCase (`AdminPanel.jsx`)
- **Services**: PascalCase (`EconomyEngine.js`)
- **Routes**: kebab-case (`economy.js`)
- **Utilities**: kebab-case (`validate-email.js`)

### Key Patterns

#### API Endpoint
```javascript
router.post('/endpoint', verifyToken, async (req, res) => {
  try {
    const { param } = req.body;
    const userId = req.user.userId;
    
    // Validation
    if (!param) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing parameter' 
      });
    }
    
    // Business logic
    const result = await Service.doSomething(param);
    
    // Response
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Error]:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});
```

#### Money/Decimal
```javascript
const Decimal = require('decimal.js');
const amount = new Decimal(req.body.amount);
const balance = new Decimal(user.balance_euro.toString());
```

---

## 🛡️ Security Rules

1. **Always use `verifyToken` middleware** for protected routes
2. **Always use `Decimal`** for money calculations
3. **Always validate input** before processing
4. **Always use try-catch** for async operations
5. **Never trust client data** - validate on server

---

## 📁 Key Files

| Feature | File |
|---------|------|
| Auth Routes | `microservices/auth-server/routes/auth.js` |
| Economy API | `microservices/economy-server/routes/economy.js` |
| Work Service | `microservices/economy-server/services/WorkService.js` |
| Game Clock | `microservices/economy-server/services/GameClock.js` |
| Dashboard | `client/pages/dashboard.jsx` |
| Admin Panel | `client/pages/administration/admin-panel.jsx` |

---

## 🧪 Testing

### Test Scripts
```bash
# Windows
scripts\local-test.cmd

# Git Bash
./scripts/local-test.sh
```

### Manual Testing
- **Production**: https://ovidiuguru.online
- **Test Account**: testjucator@ovidiuguru.com / Password123!
- **Game Password**: testjoc

---

## 📝 Note

This rule provides essential project context. Always follow these conventions for consistent, maintainable code.
