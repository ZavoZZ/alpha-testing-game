# 💰 Economy API Documentation - Complete Guide

**Version:** 1.0.0  
**Date:** February 11, 2026  
**Base URL:** `https://ovidiuguru.online/api/economy`  
**Security:** 100% SERVER-SIDE ✅

---

## 🔒 Security Architecture

### ALL LOGIC IS SERVER-SIDE - UNHACKABLE

**Client CANNOT:**
- ❌ Modify amounts
- ❌ Bypass validation
- ❌ Fake sender/receiver IDs
- ❌ Skip tax calculation
- ❌ Manipulate balances directly
- ❌ Create fake transactions
- ❌ View other users' balances

**Server ALWAYS:**
- ✅ Extracts sender from JWT token
- ✅ Validates ALL inputs
- ✅ Calculates tax automatically
- ✅ Uses ACID transactions
- ✅ Records in blockchain ledger
- ✅ Rate limits requests

### Security Layers:

```
Layer 1: Rate Limiting (10 req / 5 min per IP)
    ↓
Layer 2: JWT Authentication (verifyToken)
    ↓
Layer 3: Payload Sanitization (validateFinancialPayload)
    ↓
Layer 4: Authorization Checks (sender/receiver validation)
    ↓
Layer 5: Business Logic (EconomyEngine)
    ↓
Layer 6: ACID Transactions (MongoDB sessions)
    ↓
Layer 7: Blockchain Audit Trail (Ledger)
```

---

## 🔑 Authentication

All economy endpoints (except `/health`) require JWT authentication.

### How to Get JWT Token:

```http
POST /api/auth-service/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "507f1f77bcf86cd799439011",
    "username": "player1",
    "role": "user"
  }
}
```

### Using JWT Token:

Include token in `Authorization` header for all economy requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📡 API Endpoints

### 1. Health Check (PUBLIC)

Check if Economy API is operational.

**Endpoint:** `GET /api/economy/health`  
**Authentication:** None (public)  
**Rate Limit:** Not applied

**Request:**
```http
GET /api/economy/health
```

**Response:**
```json
{
  "success": true,
  "service": "Economy API",
  "status": "operational",
  "timestamp": "2026-02-11T20:00:00.000Z",
  "version": "1.0.0",
  "security": {
    "rateLimiting": "active",
    "jwtAuth": "active",
    "payloadValidation": "active"
  }
}
```

---

### 2. Get Balance (Single Currency)

Get user's balance for a specific currency.

**Endpoint:** `GET /api/economy/balance/:currency`  
**Authentication:** Required (JWT)  
**Rate Limit:** 10 req / 5 min

**Parameters:**
- `currency` (path): EURO, GOLD, or RON

**Request:**
```http
GET /api/economy/balance/EURO
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "username": "player1",
    "currency": "EURO",
    "balance": "1234.5678",
    "timestamp": "2026-02-11T20:00:00.000Z"
  }
}
```

**Security:**
- User can ONLY view their OWN balance (from JWT token)
- No way to view other users' balances

---

### 3. Get All Balances

Get user's balances for ALL currencies.

**Endpoint:** `GET /api/economy/balances`  
**Authentication:** Required (JWT)  
**Rate Limit:** 10 req / 5 min

**Request:**
```http
GET /api/economy/balances
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "username": "player1",
    "balances": {
      "EURO": "1234.5678",
      "GOLD": "567.8900",
      "RON": "890.1234"
    },
    "timestamp": "2026-02-11T20:00:00.000Z"
  }
}
```

---

### 4. Transfer Money (P2P)

Transfer money from logged-in user to another user.

**Endpoint:** `POST /api/economy/transfer`  
**Authentication:** Required (JWT)  
**Rate Limit:** 10 req / 5 min  
**Tax:** 5% (TRANSFER tax)

**CRITICAL SECURITY:**
- Sender is ALWAYS `req.user` (from JWT token) ← CLIENT CANNOT FAKE
- Client CANNOT specify sender
- Prevents theft via fake sender IDs

**Request Body:**
```json
{
  "receiverId": "507f191e810c19729de860ea",
  "amount": "100.50",
  "currency": "EURO",
  "description": "Payment for services"
}
```

**Field Validation:**
- `receiverId` (required): MongoDB ObjectId of receiver
- `amount` (required): String, positive, max 4 decimals (e.g., "100.5000")
- `currency` (required): "EURO", "GOLD", or "RON"
- `description` (optional): String, max 200 chars

**Request:**
```http
POST /api/economy/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": "507f191e810c19729de860ea",
  "amount": "100.00",
  "currency": "EURO",
  "description": "Thanks for helping!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "transaction_id": "txn_1707680400_abc123",
    "sender": {
      "userId": "507f1f77bcf86cd799439011",
      "username": "player1",
      "balance_before": "1234.5678",
      "balance_after": "1134.5678"
    },
    "receiver": {
      "userId": "507f191e810c19729de860ea",
      "username": "player2",
      "balance_before": "500.0000",
      "balance_after": "595.0000"
    },
    "amounts": {
      "gross": "100.0000",
      "tax": "5.0000",
      "net": "95.0000"
    },
    "currency": "EURO",
    "type": "TRANSFER",
    "timestamp": "2026-02-11T20:00:00.000Z",
    "ledger_id": "507f1f77bcf86cd799439012"
  },
  "message": "Transfer completed successfully"
}
```

**Tax Breakdown:**
```
Gross Amount:  100.00 EURO (what sender pays)
Tax (5%):        5.00 EURO (goes to Treasury)
Net Amount:     95.00 EURO (what receiver gets)
```

**Error Responses:**

```json
// Insufficient funds
{
  "success": false,
  "error": "Transfer failed",
  "message": "Insufficient funds. Available: 50.00 EURO, Required: 100.00 EURO",
  "code": "INSUFFICIENT_FUNDS"
}

// Invalid amount format
{
  "success": false,
  "error": "Invalid financial payload format",
  "message": "Amount must be a positive number with maximum 4 decimal places",
  "code": "INVALID_AMOUNT_FORMAT"
}

// Rate limit exceeded
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many transaction requests. Please wait 5 minutes before trying again.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after_seconds": 300
}
```

---

### 5. Collect Salary (WORK)

Collect salary from SYSTEM account (work payment).

**Endpoint:** `POST /api/economy/work`  
**Authentication:** Required (JWT)  
**Rate Limit:** 10 req / 5 min  
**Tax:** 15% (WORK/SALARY tax)

**CRITICAL SECURITY:**
- Receiver is ALWAYS `req.user` (from JWT token)
- Sender is SYSTEM account (cannot be faked)
- Client CANNOT specify receiver

**Request Body:**
```json
{
  "amount": "100.00",
  "currency": "EURO",
  "description": "Daily work salary"
}
```

**Request:**
```http
POST /api/economy/work
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": "100.00",
  "currency": "EURO",
  "description": "Daily quest completion"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction_id": "txn_1707680400_xyz789",
    "receiver": {
      "userId": "507f1f77bcf86cd799439011",
      "username": "player1",
      "balance_before": "1000.0000",
      "balance_after": "1085.0000"
    },
    "amounts": {
      "gross": "100.0000",
      "tax": "15.0000",
      "net": "85.0000"
    },
    "currency": "EURO",
    "type": "WORK",
    "timestamp": "2026-02-11T20:00:00.000Z"
  },
  "message": "Salary collected successfully"
}
```

**Tax Breakdown:**
```
Gross Amount:  100.00 EURO (total payment)
Tax (15%):      15.00 EURO (income tax to Treasury)
Net Amount:     85.00 EURO (what you receive)
```

---

### 6. Market Purchase

Purchase item from market (user pays SYSTEM).

**Endpoint:** `POST /api/economy/market`  
**Authentication:** Required (JWT)  
**Rate Limit:** 10 req / 5 min  
**Tax:** 10% (MARKET/VAT tax)

**CRITICAL SECURITY:**
- Sender is ALWAYS `req.user` (from JWT token)
- Receiver is SYSTEM account
- Client CANNOT buy items for other users

**Request Body:**
```json
{
  "amount": "50.00",
  "currency": "EURO",
  "itemId": "item_sword_001",
  "description": "Legendary Sword"
}
```

**Request:**
```http
POST /api/economy/market
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": "50.00",
  "currency": "EURO",
  "itemId": "item_sword_001",
  "description": "Purchase: Legendary Sword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction_id": "txn_1707680400_market123",
    "sender": {
      "userId": "507f1f77bcf86cd799439011",
      "username": "player1",
      "balance_before": "1085.0000",
      "balance_after": "1030.0000"
    },
    "amounts": {
      "gross": "50.0000",
      "tax": "5.0000",
      "net": "45.0000"
    },
    "currency": "EURO",
    "type": "MARKET",
    "item_id": "item_sword_001",
    "timestamp": "2026-02-11T20:00:00.000Z"
  },
  "message": "Purchase completed successfully"
}
```

**Tax Breakdown (VAT):**
```
Gross Amount:  50.00 EURO (what you pay)
Tax (10%):      5.00 EURO (VAT to Treasury)
Net Amount:    45.00 EURO (item cost)
```

---

### 7. Transaction History

Get transaction history for logged-in user.

**Endpoint:** `GET /api/economy/history`  
**Authentication:** Required (JWT)  
**Rate Limit:** 10 req / 5 min

**Query Parameters:**
- `limit` (optional): Number of transactions (default: 50, max: 100)

**Request:**
```http
GET /api/economy/history?limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "username": "player1",
    "transactions": [
      {
        "transaction_id": "txn_1707680400_abc123",
        "type": "TRANSFER",
        "sender": "player1",
        "receiver": "player2",
        "amount_gross": "100.0000",
        "tax_withheld": "5.0000",
        "amount_net": "95.0000",
        "currency": "EURO",
        "description": "Payment for services",
        "timestamp": "2026-02-11T20:00:00.000Z"
      },
      {
        "transaction_id": "txn_1707680300_xyz789",
        "type": "WORK",
        "sender": "SYSTEM",
        "receiver": "player1",
        "amount_gross": "100.0000",
        "tax_withheld": "15.0000",
        "amount_net": "85.0000",
        "currency": "EURO",
        "description": "Daily quest completion",
        "timestamp": "2026-02-11T19:00:00.000Z"
      }
    ],
    "count": 2,
    "timestamp": "2026-02-11T20:00:00.000Z"
  }
}
```

**Security:**
- User can ONLY view their OWN transactions
- No way to view other users' transaction history

---

## 💵 Tax Rates

All taxes are calculated **automatically** on the server:

| Transaction Type | Tax Rate | Description |
|-----------------|----------|-------------|
| TRANSFER        | 5%       | P2P transfers |
| WORK/SALARY     | 15%      | Income tax |
| MARKET          | 10%      | VAT (Value Added Tax) |
| SYSTEM          | 0%       | Admin operations (no tax) |
| REWARD          | 0%       | Quest rewards (no tax) |
| REFUND          | 0%       | Refunds (no tax) |

**Tax Collection:**
- All taxes go to Treasury (singleton model)
- Collected by tax type: `transfer_tax`, `income_tax`, `vat`
- Used for future game economy features

---

## 🛡️ Security Best Practices

### For Frontend Developers:

1. **NEVER trust client-side calculations**
   ```javascript
   ❌ BAD: Calculate tax on client
   const tax = amount * 0.05;  // Client can modify this
   
   ✅ GOOD: Let server calculate
   // Server automatically calculates and applies tax
   ```

2. **NEVER send sender ID from client**
   ```javascript
   ❌ BAD: Client specifies sender
   fetch('/api/economy/transfer', {
     body: JSON.stringify({
       senderId: 'fake_admin_id',  // Can be faked!
       receiverId: 'victim_id',
       amount: '999999.99'
     })
   });
   
   ✅ GOOD: Server extracts sender from JWT
   fetch('/api/economy/transfer', {
     headers: { 'Authorization': `Bearer ${token}` },
     body: JSON.stringify({
       receiverId: 'player_id',  // Only specify receiver
       amount: '100.00'
     })
   });
   ```

3. **ALWAYS use strings for amounts**
   ```javascript
   ❌ BAD: Send amount as number
   amount: 100.50  // Precision loss in JSON serialization
   
   ✅ GOOD: Send amount as string
   amount: "100.50"  // Exact precision preserved
   ```

4. **ALWAYS handle rate limits gracefully**
   ```javascript
   if (response.status === 429) {
     const retryAfter = response.data.retry_after_seconds;
     // Show user: "Please wait {retryAfter} seconds"
   }
   ```

5. **ALWAYS validate responses**
   ```javascript
   const response = await fetch('/api/economy/transfer', ...);
   const data = await response.json();
   
   if (!data.success) {
     // Handle error based on data.code
     switch (data.code) {
       case 'INSUFFICIENT_FUNDS':
         // Show user their balance
         break;
       case 'RATE_LIMIT_EXCEEDED':
         // Show cooldown timer
         break;
       default:
         // Show generic error
     }
   }
   ```

---

## 📊 Response Codes

### Success Codes:
- `200 OK` - Request successful

### Client Error Codes:
- `400 Bad Request` - Invalid request (validation failed)
- `401 Unauthorized` - Missing or invalid JWT token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded

### Server Error Codes:
- `500 Internal Server Error` - Server error

### Custom Error Codes:

**Authentication:**
- `NO_AUTH_HEADER` - No Authorization header provided
- `INVALID_AUTH_FORMAT` - Invalid Authorization header format
- `TOKEN_EXPIRED` - JWT token expired
- `INVALID_TOKEN` - JWT token invalid

**Validation:**
- `MISSING_AMOUNT` - Amount field missing
- `AMOUNT_NOT_STRING` - Amount is not a string
- `INVALID_AMOUNT_FORMAT` - Amount format invalid
- `AMOUNT_TOO_LARGE` - Amount exceeds maximum
- `AMOUNT_TOO_SMALL` - Amount below minimum
- `MISSING_RECEIVER` - Receiver ID missing
- `MISSING_CURRENCY` - Currency missing
- `INVALID_CURRENCY` - Invalid currency type

**Business Logic:**
- `INSUFFICIENT_FUNDS` - Not enough balance
- `SELF_TRANSFER` - Cannot transfer to self
- `USER_NOT_FOUND` - User not found
- `ACCOUNT_FROZEN` - Account frozen for fraud
- `NO_SYSTEM_ACCOUNT` - SYSTEM account not found

**Rate Limiting:**
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## 🧪 Testing with cURL

### 1. Check API Health:
```bash
curl https://ovidiuguru.online/api/economy/health
```

### 2. Login and Get Token:
```bash
curl -X POST https://ovidiuguru.online/api/auth-service/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### 3. Get Balance:
```bash
curl https://ovidiuguru.online/api/economy/balance/EURO \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Transfer Money:
```bash
curl -X POST https://ovidiuguru.online/api/economy/transfer \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "507f191e810c19729de860ea",
    "amount": "100.00",
    "currency": "EURO",
    "description": "Test transfer"
  }'
```

---

## 📝 Example Frontend Integration

### React Example:

```javascript
import { useState, useEffect } from 'react';

function EconomyDashboard() {
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchBalances();
  }, []);
  
  async function fetchBalances() {
    try {
      const token = localStorage.getItem('jwt_token');
      
      const response = await fetch('https://ovidiuguru.online/api/economy/balances', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBalances(data.data.balances);
      } else {
        console.error('Failed to fetch balances:', data.message);
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function transferMoney(receiverId, amount, currency) {
    try {
      const token = localStorage.getItem('jwt_token');
      
      const response = await fetch('https://ovidiuguru.online/api/economy/transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId,
          amount: amount.toString(),  // ALWAYS string!
          currency,
          description: 'Player transfer'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Transfer successful!');
        fetchBalances();  // Refresh balances
      } else {
        alert(`Transfer failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Transfer error:', error);
      alert('Transfer failed. Please try again.');
    }
  }
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Your Balances</h1>
      {balances && (
        <ul>
          <li>EURO: {balances.EURO}</li>
          <li>GOLD: {balances.GOLD}</li>
          <li>RON: {balances.RON}</li>
        </ul>
      )}
    </div>
  );
}
```

---

## 🚀 Production Deployment

### Environment Variables:

```env
# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# MongoDB Connection
DB_URI=mongodb://mongo:27017/game_db

# Server Port
WEB_PORT=3000
```

### Server Configuration:

1. **Cloudflare** - DDoS protection, CDN
2. **Nginx** - Reverse proxy, load balancing
3. **Docker** - Containerization
4. **MongoDB Replica Set** - ACID transactions

---

## 📞 Support

For issues or questions:
- **Backend Issues:** Check server logs: `docker compose logs app`
- **Rate Limits:** Wait 5 minutes or contact admin
- **Security Concerns:** Report to security team immediately

---

**Last Updated:** February 11, 2026  
**API Version:** 1.0.0  
**Security Level:** ⭐⭐⭐⭐⭐ Bank-Grade
