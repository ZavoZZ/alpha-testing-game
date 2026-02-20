# File Dependencies

**Last Updated:** 2026-02-20  
**Purpose:** Understand file relationships without exploration

---

## 📊 Dependency Graph Overview

```
Frontend (React) → API Routes → Services → Models → Database
     ↓                ↓            ↓          ↓
  Styles          Middleware   Utilities   Config
```

---

## 🔐 Authentication Flow

```
client/pages/accounts/login.jsx
    ↓
client/pages/utilities/game-auth-provider.jsx
    ↓
client/pages/utilities/token-provider.jsx
    ↓
POST /auth/login (microservices/auth-server/routes/auth.js)
    ↓
server/database/models/User.js
    ↓
MongoDB (auth_db.users)
```

### Files That Depend on Auth:
- All protected routes use `verifyToken` middleware
- All frontend components use `useGameAuth()` hook
- **Middleware:** `microservices/economy-server/middleware/auth.js`

---

## 💰 Economy System Dependencies

### Balance Check Flow
```
client/pages/dashboard.jsx
    ↓
GET /economy/balance (microservices/economy-server/routes/economy.js)
    ↓
microservices/economy-server/services/EconomyEngine.js
    ↓
server/database/models/User.js
    ↓
MongoDB (auth_db.users)
```

### Work System Flow
```
client/pages/panels/WorkStation.jsx
    ↓
POST /economy/work/start (microservices/economy-server/routes/economy.js)
    ↓
microservices/economy-server/services/WorkService.js
    ↓
microservices/economy-server/services/GameClock.js (time tracking)
    ↓
server/database/models/User.js (update balance)
    ↓
MongoDB
```

### Files That Depend on WorkService:
- `microservices/economy-server/routes/economy.js` (API endpoints)
- `microservices/economy-server/services/GameClock.js` (time events)
- `client/pages/panels/WorkStation.jsx` (frontend)

---

## 📦 Inventory System Dependencies

```
client/pages/panels/InventoryPanel.jsx
    ↓
GET /economy/inventory (microservices/economy-server/routes/economy.js)
    ↓
microservices/economy-server/services/InventoryService.js
    ↓
microservices/economy-server/models/InventoryItem.js
    ↓
MongoDB (auth_db.inventoryitems)
```

### Files That Depend on InventoryService:
- `microservices/economy-server/routes/economy.js`
- `microservices/economy-server/services/MarketplaceService.js` (selling items)
- `client/pages/panels/InventoryPanel.jsx`
- `client/pages/panels/MarketplacePanel.jsx`

---

## 🛒 Marketplace System Dependencies

```
client/pages/panels/MarketplacePanel.jsx
    ↓
GET/POST /economy/marketplace (microservices/economy-server/routes/economy.js)
    ↓
microservices/economy-server/services/MarketplaceService.js
    ↓
├── microservices/economy-server/models/MarketplaceListing.js
├── microservices/economy-server/services/InventoryService.js (transfer items)
└── microservices/economy-server/services/EconomyEngine.js (transfer money)
    ↓
MongoDB (auth_db.marketplacelistings, auth_db.inventoryitems, auth_db.users)
```

### Files That Depend on MarketplaceService:
- `microservices/economy-server/routes/economy.js`
- `microservices/economy-server/services/InventoryService.js`
- `microservices/economy-server/services/EconomyEngine.js`
- `client/pages/panels/MarketplacePanel.jsx`

---

## 👑 Admin System Dependencies

```
client/pages/administration/admin-panel.jsx
    ↓
GET /auth/admin (microservices/auth-server/routes/auth.js)
    ↓
server/database/models/User.js (check admin role)
    ↓
Various admin actions (ban, promote, etc.)
    ↓
MongoDB (auth_db.users)
```

### Admin Panel Imports:
- `client/pages/administration/panels/ban-user.jsx`
- `client/pages/administration/panels/grant-admin.jsx`
- `client/pages/administration/panels/grant-mod.jsx`
- `client/pages/administration/panels/news-editor.jsx`
- `client/pages/administration/panels/news-publisher.jsx`
- `client/pages/administration/panels/chat-reports.jsx`

---

## 🎨 Frontend Component Dependencies

### App Root
```
client/pages/app.jsx
    ├── client/pages/utilities/game-auth-provider.jsx
    ├── client/pages/utilities/token-provider.jsx
    ├── client/pages/dashboard.jsx (authenticated)
    ├── client/pages/homepage.jsx (public)
    ├── client/pages/accounts/login.jsx
    ├── client/pages/accounts/signup.jsx
    └── client/pages/administration/admin.jsx
```

### Dashboard Components
```
client/pages/dashboard.jsx
    ├── client/pages/panels/WorkStation.jsx
    ├── client/pages/panels/InventoryPanel.jsx
    ├── client/pages/panels/MarketplacePanel.jsx
    ├── client/pages/panels/news-feed.jsx
    ├── client/pages/panels/popup-chat.jsx
    └── client/pages/panels/footer.jsx
```

### Styles Dependencies
```
client/styles/modern-game.css (main styles)
client/styles/popup-chat.css (chat specific)
client/styles/styles.css (base styles)
```

---

## 🔧 Configuration Dependencies

### Environment Variables
```
.env.local
    ↓
├── client/config.js (frontend config)
├── microservices/auth-server/server.js
├── microservices/economy-server/server.js
├── microservices/chat-server/server.js
├── microservices/news-server/server.js
└── docker-compose.local.yml
```

### Docker Dependencies
```
docker-compose.local.yml
    ├── microservices/auth-server/Dockerfile.local
    ├── microservices/economy-server/Dockerfile.local
    ├── microservices/chat-server/Dockerfile.local
    └── microservices/news-server/Dockerfile.local
```

---

## 🗄️ Database Model Dependencies

### User Model
```
server/database/models/User.js
    ↓
Used by:
├── microservices/auth-server/routes/auth.js
├── microservices/economy-server/routes/economy.js
├── microservices/economy-server/services/EconomyEngine.js
├── microservices/economy-server/services/WorkService.js
└── client/pages/administration/admin-panel.jsx (via API)
```

### InventoryItem Model
```
microservices/economy-server/models/InventoryItem.js
    ↓
Used by:
├── microservices/economy-server/services/InventoryService.js
└── microservices/economy-server/services/MarketplaceService.js
```

### MarketplaceListing Model
```
microservices/economy-server/models/MarketplaceListing.js
    ↓
Used by:
└── microservices/economy-server/services/MarketplaceService.js
```

---

## 📡 API Route Dependencies

### Economy Routes
```
microservices/economy-server/routes/economy.js
    ├── middleware/auth.js (verifyToken)
    ├── services/EconomyEngine.js
    ├── services/WorkService.js
    ├── services/InventoryService.js
    ├── services/MarketplaceService.js
    ├── services/GameClock.js
    └── models/User.js, InventoryItem.js, MarketplaceListing.js
```

### Auth Routes
```
microservices/auth-server/routes/auth.js
    ├── server/database/models/User.js
    └── common/utilities/validate-email.js
    └── common/utilities/validate-username.js
```

---

## 🔍 Finding Dependencies

### If you modify User.js:
1. Check all auth routes
2. Check all economy services
3. Check admin panel API calls
4. Run full test suite

### If you modify WorkService.js:
1. Check economy routes
2. Check GameClock integration
3. Check WorkStation.jsx
4. Test work flow

### If you modify EconomyEngine.js:
1. Check all economy routes
2. Check MarketplaceService (transfers)
3. Check dashboard balance display
4. Test all money operations

### If you modify frontend components:
1. Check parent components
2. Check API calls
3. Check auth provider usage
4. Test in browser

---

## 📋 Import Chains

### Common Import Chain (Backend)
```javascript
// Route file
const { verifyToken } = require('../middleware/auth');
const Service = require('../services/ServiceName');
const Model = require('../models/ModelName');
```

### Common Import Chain (Frontend)
```javascript
// Component file
import React, { useState, useEffect } from 'react';
import { useGameAuth } from '../utilities/game-auth-provider';
import '../styles/component.css';
```

---

## ⚠️ Circular Dependencies

### Avoid These Patterns:
- Service A imports Service B, Service B imports Service A
- Model imports Service, Service imports Model
- Component A imports Component B, Component B imports Component A

### Current Safe Patterns:
- Routes → Services → Models (one direction)
- Components → Auth Provider (one direction)
- All files → Config (one direction)

---

**Note:** Update this file when adding new services or changing relationships.
