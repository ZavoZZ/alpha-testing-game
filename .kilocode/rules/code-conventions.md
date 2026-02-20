# Code Conventions - AI Rule

Rule to enforce code style and patterns for consistent AI-generated code.

## Guidelines

## File Naming

- **React Components**: PascalCase (`AdminPanel.jsx`)
- **Services**: PascalCase (`EconomyEngine.js`)
- **Routes**: kebab-case (`economy.js`)
- **Utilities**: kebab-case (`validate-email.js`)

## API Endpoint Template

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

## Money/Decimal Handling

```javascript
const Decimal = require('decimal.js');
const amount = new Decimal(req.body.amount);
const balance = new Decimal(user.balance_euro.toString());
```

## JWT Verification

```javascript
const { verifyToken } = require('../middleware/auth');
router.get('/protected', verifyToken, async (req, res) => {
  const userId = req.user.userId; // From JWT
  // ...
});
```

## Response Format

**Success:**
```javascript
{ "success": true, "data": {...} }
```

**Error:**
```javascript
{ "success": false, "error": "Error message" }
```

## Security

1. Always use `verifyToken` middleware for protected routes
2. Always use `Decimal` for money calculations
3. Always validate input before processing
4. Always use try-catch for async operations
5. Never trust client data - validate on server
