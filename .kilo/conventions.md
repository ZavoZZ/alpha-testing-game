# Code Conventions

**Last Updated:** 2026-02-20  
**Purpose:** Standardize code patterns for consistent AI-generated code

---

## 📁 File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `AdminPanel.jsx`, `WorkStation.jsx` |
| Services | PascalCase | `EconomyEngine.js`, `WorkService.js` |
| Routes | kebab-case | `economy.js`, `auth.js` |
| Utilities | kebab-case | `validate-email.js`, `validate-username.js` |
| Models | PascalCase | `User.js`, `InventoryItem.js` |
| Styles | kebab-case | `modern-game.css`, `popup-chat.css` |
| Scripts | kebab-case | `local-start.sh`, `test-all-apis.sh` |

---

## 🔧 API Endpoint Template

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
    const result = await Service.doSomething(param, userId);
    
    // Response
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Endpoint Error]:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});
```

### Key Points:
- ✅ Always use `verifyToken` middleware for protected routes
- ✅ Always use try-catch for async operations
- ✅ Always validate input before processing
- ✅ Always return consistent response format
- ✅ Always log errors with descriptive prefix

---

## 💰 Decimal/Money Handling

```javascript
const Decimal = require('decimal.js');

// Correct way to handle money
const amount = new Decimal(req.body.amount);
const balance = new Decimal(user.balance_euro.toString());

// Operations
const newBalance = balance.plus(amount);
const deducted = balance.minus(amount);

// Comparison
if (balance.lessThan(amount)) {
  return res.status(400).json({ 
    success: false, 
    error: 'Insufficient funds' 
  });
}

// Save to database
user.balance_euro = newBalance.toString();
await user.save();
```

### Key Points:
- ✅ Always use `Decimal` for money calculations
- ✅ Never use floating-point arithmetic for money
- ✅ Always convert to string when saving to MongoDB
- ✅ Always validate positive amounts

---

## 🔐 JWT Verification Pattern

```javascript
const { verifyToken } = require('../middleware/auth');

// In routes file
router.get('/protected', verifyToken, async (req, res) => {
  const userId = req.user.userId;  // From JWT
  const userEmail = req.user.email;
  
  // Use userId for database queries
  const user = await User.findById(userId);
  
  // ...
});
```

### Key Points:
- ✅ Always use `verifyToken` middleware
- ✅ Access user data from `req.user`
- ✅ Never trust client-provided user ID

---

## ⚛️ React Component Template

```jsx
import React, { useState, useEffect } from 'react';
import { useGameAuth } from './utilities/game-auth-provider';

function ComponentName() {
  const { user, isAuthenticated } = useGameAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/endpoint');
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="component-container">
      {/* Component content */}
    </div>
  );
}

export default ComponentName;
```

### Key Points:
- ✅ Use functional components with hooks
- ✅ Handle loading and error states
- ✅ Use game-auth-provider for authentication
- ✅ Clean up effects with return function

---

## 🗄️ MongoDB Model Template

```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

const itemSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  owner_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Indexes
itemSchema.index({ owner_id: 1, name: 1 });

// Methods
itemSchema.methods.addQuantity = function(amount) {
  this.quantity += amount;
  return this.save();
};

// Statics
itemSchema.statics.findByOwner = function(ownerId) {
  return this.find({ owner_id: ownerId });
};

module.exports = mongoose.model('Item', itemSchema);
```

### Key Points:
- ✅ Use Schema.Types.ObjectId for references
- ✅ Add indexes for frequently queried fields
- ✅ Use timestamps option
- ✅ Add methods for common operations

---

## 🎨 CSS Class Naming

```css
/* Component-based naming */
.component-name { }
.component-name__element { }
.component-name--modifier { }

/* Examples */
.inventory-panel { }
.inventory-panel__item { }
.inventory-panel__item--selected { }

/* State classes */
.is-loading { }
.is-active { }
.has-error { }
```

---

## 📝 Error Handling Pattern

```javascript
// Service layer
class SomeService {
  async doSomething(data) {
    if (!data) {
      throw new Error('Data is required');
    }
    
    try {
      // Operation
      return result;
    } catch (error) {
      console.error('[ServiceName] Error:', error);
      throw error; // Re-throw for route to handle
    }
  }
}

// Route layer
router.post('/endpoint', verifyToken, async (req, res) => {
  try {
    const result = await service.doSomething(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Endpoint] Error:', error);
    
    // Determine status code
    const status = error.message.includes('not found') ? 404 : 500;
    
    res.status(status).json({ 
      success: false, 
      error: error.message 
    });
  }
});
```

---

## 📊 Response Format Standards

### Success Response
```javascript
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

### Error Response
```javascript
{
  "success": false,
  "error": "Error description",
  "code": "OPTIONAL_ERROR_CODE"
}
```

### List Response
```javascript
{
  "success": true,
  "data": [ /* items */ ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

## 🔒 Security Rules

1. **Always validate input**
   ```javascript
   if (!email || !password) {
     return res.status(400).json({ 
       success: false, 
       error: 'Email and password required' 
     });
   }
   ```

2. **Never trust client data**
   ```javascript
   // BAD
   const userId = req.body.userId;
   
   // GOOD
   const userId = req.user.userId; // From JWT
   ```

3. **Use environment variables for secrets**
   ```javascript
   const apiKey = process.env.OPENAI_API_KEY;
   ```

4. **Sanitize user input**
   ```javascript
   const email = req.body.email.toLowerCase().trim();
   ```

---

## 📝 Logging Standards

```javascript
// Use descriptive prefixes
console.log('[Auth] User logged in:', userId);
console.error('[Economy] Transfer failed:', error);
console.warn('[GameClock] Tick delayed');

// Log levels
// [ServiceName] - Info
// [ServiceName] Error: - Error
// [ServiceName] Warning: - Warning
```

---

## 🧪 Testing Patterns

```javascript
// Test file naming: *.test.js or *.spec.js
describe('ServiceName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something', async () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = await service.method(input);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});
```

---

## 📦 Import Order

```javascript
// 1. Node.js built-ins
const fs = require('fs');
const path = require('path');

// 2. External packages
const express = require('express');
const mongoose = require('mongoose');

// 3. Internal modules
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');

// 4. Relative imports
const config = require('./config');
```

---

**Note:** Follow these conventions for consistent, maintainable code.
