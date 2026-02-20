# 🏦 Economic Database Models - Enterprise Architecture

**Date:** 2026-02-11  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

---

## 📋 Overview

This document describes the database models for the **Zero-Sum P2P Economy** system. All models are designed with **enterprise-grade precision**, **immutability guarantees**, and **anti-fraud protections**.

### Core Principles

1. **🔢 Mathematical Precision**: All monetary amounts use `Decimal128` (not `Number`)
2. **🔒 Immutability**: Ledger transactions cannot be modified or deleted
3. **⛓️ Blockchain Integrity**: Hash chain ensures tamper-proof audit trail
4. **🛡️ Security First**: Anti-fraud flags, atomic operations, validation

---

## 🗂️ Model Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER MODEL                            │
│  - Player Identity & Authentication                          │
│  - Financial Balances (EURO, GOLD, RON) - Decimal128       │
│  - Human Resources (Energy, Happiness)                       │
│  - Security Flags (is_frozen_for_fraud)                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Sends/Receives Money
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      LEDGER MODEL                            │
│  - Immutable Transaction Records                             │
│  - Blockchain-Style SHA-256 Hash Chain                      │
│  - All Economic Activity Logged                              │
│  - Cannot Be Deleted or Modified                            │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Tax Collection
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     TREASURY MODEL                           │
│  - Government Tax Reserves (Singleton)                       │
│  - Separate Tax Types (VAT, Income, Transfer)               │
│  - Per-Currency Balances (EURO, GOLD, RON)                 │
│  - Atomic Operations Only                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 👤 User Model (Refactored)

### Location
`server/database/models/User.js`

### Key Changes from Original

#### ✅ Added Human Resources
```javascript
energy: Number (0-100)          // Work capacity
happiness: Number (0-100)       // Morale/satisfaction
```

#### ✅ Added Financial Balances (CRITICAL: Decimal128)
```javascript
balance_euro: Decimal128        // EUR balance
balance_gold: Decimal128        // Gold balance
balance_ron: Decimal128         // RON balance
```

**Why Decimal128?**
```javascript
// JavaScript Number type (BAD):
0.1 + 0.2 === 0.30000000000000004  ❌

// Decimal128 (GOOD):
Decimal128('0.1') + Decimal128('0.2') === '0.3'  ✅
```

#### ✅ Added Economic Mechanics
```javascript
productivity_multiplier: Decimal128  // Affects work output
is_frozen_for_fraud: Boolean        // Anti-bot protection
```

### Virtual Properties
- `total_wealth_euro` - Aggregate wealth in EUR equivalent
- `can_transact` - Checks if user can perform transactions

### Instance Methods
```javascript
user.getBalance('EURO')                    // Get balance as string
user.hasSufficientFunds('GOLD', '100.50') // Check if has funds
```

### Static Methods
```javascript
User.findFrozenAccounts()     // Find all frozen accounts
User.getEconomicStats()       // Get economic overview
```

### Security Features
- ✅ Pre-save validation (prevents negative balances)
- ✅ Post-save audit logging
- ✅ Indexes on fraud flags for fast queries

---

## 🏛️ Treasury Model (Singleton)

### Location
`server/database/models/Treasury.js`

### Singleton Pattern

**Only ONE Treasury document exists in the database.**

```javascript
_id: 'SINGLETON_TREASURY_2026'  // Fixed ID
```

### Tax Collections by Type & Currency

#### Tax Types
1. **VAT** (Value Added Tax) - Market purchases
2. **Income Tax** - Work/salary payments
3. **Transfer Tax** - P2P transfers
4. **Property Tax** - Land/building ownership (future)
5. **Import/Export Tax** - International trade (future)

#### Structure Example
```javascript
{
  // VAT Collections
  collected_vat_euro: Decimal128,
  collected_vat_gold: Decimal128,
  collected_vat_ron: Decimal128,
  
  // Income Tax Collections
  collected_income_tax_euro: Decimal128,
  collected_income_tax_gold: Decimal128,
  collected_income_tax_ron: Decimal128,
  
  // Transfer Tax Collections
  collected_transfer_tax_euro: Decimal128,
  collected_transfer_tax_gold: Decimal128,
  collected_transfer_tax_ron: Decimal128,
  
  // ... (property, import/export for future)
}
```

### Static Methods (ATOMIC OPERATIONS)

#### ✅ Get Singleton Instance
```javascript
const treasury = await Treasury.getSingleton();
```

#### ✅ Collect Tax (Atomic $inc)
```javascript
await Treasury.collectTax(
  'transfer_tax',  // Tax type
  'EURO',          // Currency
  '5.50',          // Amount (as string)
  session          // Mongoose session (optional)
);
```

**Why `$inc`?**
- Prevents race conditions
- Atomic operation (all or nothing)
- Multiple simultaneous transactions are safe

#### ✅ Admin Withdrawal
```javascript
const result = await Treasury.withdrawTax(
  'vat',           // Tax type
  'GOLD',          // Currency
  '1000.00',       // Amount
  adminUserId,     // Admin performing withdrawal
  'Event prizes',  // Reason
  session          // Session
);
```

### Virtual Properties
- `total_vat_collected` - Sum of all VAT
- `total_income_tax_collected` - Sum of all income tax
- `total_transfer_tax_collected` - Sum of all transfer tax
- `total_treasury_value` - Grand total (EUR equivalent)

### Instance Methods
```javascript
treasury.getTaxBalance('vat', 'EURO')        // Get specific tax balance
treasury.getCurrencyBalances('GOLD')         // Get all taxes for currency
treasury.generateReport()                     // Comprehensive report
```

### Security Features
- ✅ Pre-save validation (no negative balances)
- ✅ Cannot be deleted (protected by middleware)
- ✅ Audit logging on all changes
- ✅ Admin authorization required for withdrawals

---

## 📜 Ledger Model (Blockchain-Style)

### Location
`server/database/models/Ledger.js`

### Blockchain Integrity

Each transaction is cryptographically linked to the previous transaction.

```
Genesis Transaction        Transaction 2         Transaction 3
┌─────────────────┐       ┌─────────────┐       ┌─────────────┐
│ previous_hash:  │       │ prev_hash:  │       │ prev_hash:  │
│ "0"             │◄──────│ hash_of_tx1 │◄──────│ hash_of_tx2 │
│                 │       │             │       │             │
│ current_hash:   │       │ curr_hash:  │       │ curr_hash:  │
│ "abc123..."     │       │ "def456..." │       │ "ghi789..." │
└─────────────────┘       └─────────────┘       └─────────────┘
```

**Tampering Detection:**
- If someone modifies Transaction 2, its hash changes
- Transaction 3's `previous_hash` no longer matches
- Chain is broken → tampering detected ✅

### Fields

#### Transaction Identity
```javascript
transaction_id: String (UUID v4)    // Unique identifier
```

#### Participants
```javascript
sender_id: ObjectId (ref: User)
sender_username: String             // Denormalized
sender_type: Enum ['USER', 'SYSTEM', 'TREASURY']

receiver_id: ObjectId (ref: User)
receiver_username: String
receiver_type: Enum ['USER', 'SYSTEM', 'TREASURY']
```

#### Monetary Amounts (Decimal128)
```javascript
amount_gross: Decimal128            // Before tax
tax_withheld: Decimal128            // Tax amount
amount_net: Decimal128              // After tax (gross - tax)
currency: Enum ['EURO', 'GOLD', 'RON']
```

**Validation:**
```javascript
amount_net === amount_gross - tax_withheld  // Enforced!
```

#### Transaction Type
```javascript
type: Enum [
  'TRANSFER',        // P2P transfer
  'MARKET_BUY',      // Purchase from market
  'MARKET_SELL',     // Sell on market
  'SALARY',          // Work income
  'TAX_COLLECTION',  // Tax to treasury
  'SYSTEM_MINT',     // Admin creates currency
  'SYSTEM_BURN',     // Admin destroys currency
  'REWARD',          // Achievement reward
  'REFUND'           // Transaction reversal
]
```

#### Blockchain Hash Chain
```javascript
previous_hash: String (64 chars)    // SHA-256 of prev transaction
current_hash: String (64 chars)     // SHA-256 of this transaction
```

**Hash Computation:**
```javascript
SHA-256({
  transaction_id,
  sender_id,
  receiver_id,
  amount_gross,
  tax_withheld,
  amount_net,
  currency,
  type,
  previous_hash,
  timestamp
})
```

#### Audit & Compliance
```javascript
status: Enum ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED']
ip_address: String                  // For fraud detection
user_agent: String                  // For fraud detection
reference_id: String                // Link to related entity
```

### Static Methods

#### ✅ Create Transaction (Recommended Method)
```javascript
const transaction = await Ledger.createTransaction({
  sender_id: userId,
  sender_username: user.username,
  receiver_id: receiverId,
  receiver_username: receiver.username,
  amount_gross: '100.00',
  tax_withheld: '5.00',
  amount_net: '95.00',
  currency: 'EURO',
  type: 'TRANSFER',
  description: 'Payment for services'
}, session);
```

**This method automatically:**
- Fetches last transaction's hash
- Sets `previous_hash`
- Computes `current_hash` in pre-save hook
- Links transaction to blockchain

#### ✅ Verify Blockchain Integrity
```javascript
const result = await Ledger.verifyBlockchain();

// Returns:
{
  valid: true,
  message: 'Blockchain verified: 1523 transactions',
  total_transactions: 1523
}

// Or if tampered:
{
  valid: false,
  message: 'Hash chain broken at transaction xyz',
  expected_previous_hash: 'abc123...',
  actual_previous_hash: 'tampered...',
  transaction_index: 456
}
```

#### ✅ Get User Transaction History
```javascript
const history = await Ledger.getUserHistory(userId, 50);
```

#### ✅ Get Economic Statistics
```javascript
const stats = await Ledger.getEconomicStats('EURO');

// Returns:
[
  {
    _id: 'EURO',
    total_transactions: 1234,
    total_volume: 567890.1234,
    total_taxes: 28394.5678
  }
]
```

### Instance Methods

#### ✅ Verify Transaction Integrity
```javascript
const isValid = transaction.verifyIntegrity();
// Recomputes hash and compares to stored hash
```

#### ✅ Get Transaction Summary
```javascript
const summary = transaction.getSummary();

// Returns:
{
  id: 'uuid-here',
  from: 'alice',
  to: 'bob',
  amount: '95.00',
  currency: 'EURO',
  type: 'TRANSFER',
  tax: '5.00',
  date: '2026-02-11T15:30:00.000Z',
  status: 'COMPLETED'
}
```

### Immutability Enforcement

#### ❌ CANNOT Update (Except Status → REVERSED)
```javascript
// This will FAIL:
await Ledger.findByIdAndUpdate(id, { amount_gross: '200.00' });
// Error: LEDGER IMMUTABILITY VIOLATION
```

#### ✅ CAN Mark as Reversed
```javascript
await Ledger.findByIdAndUpdate(id, { 
  status: 'REVERSED',
  reversed_by_transaction_id: refundTxId
});
// Allowed ✅
```

#### ❌ CANNOT Delete
```javascript
// This will FAIL:
await Ledger.deleteOne({ _id: id });
// Error: LEDGER IMMUTABILITY: Transactions cannot be deleted!

// Also blocked:
await Ledger.deleteMany({});
await transaction.remove();
// All blocked ✅
```

### Security Features
- ✅ SHA-256 hash chain (tamper-proof)
- ✅ Pre-save hash computation (automatic)
- ✅ Immutability middleware (blocks updates/deletes)
- ✅ Validation (amount_net = gross - tax)
- ✅ IP address & user agent tracking
- ✅ Blockchain verification method

---

## 🔐 Decimal128 Precision Guarantee

### Why NOT Use JavaScript Number?

```javascript
// JavaScript Number (53-bit precision)
0.1 + 0.2                  // 0.30000000000000004 ❌
9007199254740992 + 1       // 9007199254740992 (lost precision!) ❌

// After many transactions, errors accumulate:
let balance = 0;
for (let i = 0; i < 10000; i++) {
  balance += 0.01;
}
console.log(balance);      // 99.9999999999986 (should be 100) ❌
```

### Decimal128 Solution

```javascript
const mongoose = require('mongoose');

// Store as Decimal128
const balance = mongoose.Types.Decimal128.fromString('0.1');

// Read as string (no precision loss)
const balanceStr = balance.toString();  // '0.1' ✅

// Convert to float only for display (never for calculations!)
const balanceFloat = parseFloat(balanceStr);  // 0.1
```

### Best Practices

#### ✅ DO: Always use strings for amounts
```javascript
user.balance_euro = mongoose.Types.Decimal128.fromString('100.50');
```

#### ✅ DO: Convert to string for display
```javascript
const displayBalance = user.balance_euro.toString();  // '100.50'
```

#### ✅ DO: Use $inc for atomic updates
```javascript
await User.updateOne(
  { _id: userId },
  { $inc: { balance_euro: mongoose.Types.Decimal128.fromString('10.00') } }
);
```

#### ❌ DON'T: Use Number type for currency
```javascript
balance: Number  // NEVER for financial data! ❌
```

#### ❌ DON'T: Perform math on Decimal128 directly
```javascript
// WRONG:
user.balance_euro += 10;  // ❌

// CORRECT:
await User.updateOne(
  { _id: user._id },
  { $inc: { balance_euro: mongoose.Types.Decimal128.fromString('10.00') } }
);
```

---

## 📊 Usage Examples

### Example 1: Create User with Initial Balance

```javascript
const User = require('./models/User');
const mongoose = require('mongoose');

const newUser = await User.create({
  username: 'alice',
  email: 'alice@example.com',
  password: hashedPassword,
  balance_euro: mongoose.Types.Decimal128.fromString('1000.0000'),
  balance_gold: mongoose.Types.Decimal128.fromString('500.0000'),
  balance_ron: mongoose.Types.Decimal128.fromString('5000.0000'),
  energy: 100,
  happiness: 100,
  productivity_multiplier: mongoose.Types.Decimal128.fromString('1.0000')
});

console.log(`User created with ${newUser.getBalance('EURO')} EUR`);
```

### Example 2: Initialize Treasury

```javascript
const Treasury = require('./models/Treasury');

// Get or create singleton
const treasury = await Treasury.getSingleton();

console.log('Treasury initialized:', treasury._id);
```

### Example 3: Record a Transaction

```javascript
const Ledger = require('./models/Ledger');
const mongoose = require('mongoose');

const session = await mongoose.startSession();
session.startTransaction();

try {
  // Create ledger entry
  const transaction = await Ledger.createTransaction({
    sender_id: senderId,
    sender_username: 'alice',
    receiver_id: receiverId,
    receiver_username: 'bob',
    amount_gross: '100.00',
    tax_withheld: '5.00',
    amount_net: '95.00',
    currency: 'EURO',
    type: 'TRANSFER',
    description: 'Payment for goods',
    ip_address: req.ip,
    user_agent: req.headers['user-agent']
  }, session);
  
  // Collect tax to treasury
  await Treasury.collectTax('transfer_tax', 'EURO', '5.00', session);
  
  await session.commitTransaction();
  console.log('Transaction completed:', transaction.transaction_id);
  
} catch (error) {
  await session.abortTransaction();
  console.error('Transaction failed:', error);
} finally {
  session.endSession();
}
```

### Example 4: Verify Blockchain Integrity

```javascript
const Ledger = require('./models/Ledger');

// Run periodic integrity check
const verification = await Ledger.verifyBlockchain();

if (!verification.valid) {
  // CRITICAL ALERT: Blockchain has been tampered with!
  console.error('SECURITY BREACH:', verification.message);
  // Send alert to admins, freeze system, etc.
} else {
  console.log('✅ Blockchain integrity verified:', verification.total_transactions, 'transactions');
}
```

---

## 🧪 Testing Recommendations

### Unit Tests

```javascript
describe('User Model', () => {
  it('should prevent negative balance', async () => {
    const user = new User({ username: 'test', balance_euro: '-10.00' });
    await expect(user.save()).rejects.toThrow('Balance cannot be negative');
  });
  
  it('should calculate total wealth correctly', async () => {
    const user = new User({
      balance_euro: '100.00',
      balance_gold: '10.00',  // 10 gold = 100 EUR
      balance_ron: '200.00'   // 200 RON = 40 EUR
    });
    expect(user.total_wealth_euro).toBe(240);
  });
});

describe('Ledger Model', () => {
  it('should enforce amount_net = gross - tax', async () => {
    const tx = new Ledger({
      amount_gross: '100.00',
      tax_withheld: '10.00',
      amount_net: '80.00'  // WRONG! Should be 90.00
    });
    await expect(tx.save()).rejects.toThrow('Net amount must equal gross amount minus tax');
  });
  
  it('should prevent transaction deletion', async () => {
    const tx = await Ledger.create({ /* data */ });
    await expect(tx.remove()).rejects.toThrow('Transactions cannot be deleted');
  });
});

describe('Treasury Model', () => {
  it('should maintain singleton pattern', async () => {
    const treasury1 = await Treasury.getSingleton();
    const treasury2 = await Treasury.getSingleton();
    expect(treasury1._id).toBe(treasury2._id);
  });
});
```

---

## 🚨 Security Considerations

### 1. Race Condition Prevention
- ✅ Use `$inc` for all balance updates (atomic)
- ✅ Use MongoDB transactions for multi-document operations
- ✅ Never read → modify → write (use atomic updates)

### 2. Fraud Detection
- ✅ Track IP addresses in Ledger
- ✅ Track user agents
- ✅ Flag accounts with `is_frozen_for_fraud`
- ✅ Monitor transaction velocity (via middleware)

### 3. Audit Trail
- ✅ All transactions permanently recorded in Ledger
- ✅ Blockchain verification detects tampering
- ✅ Treasury tracks last withdrawal admin
- ✅ Console logging for all financial operations

### 4. Data Integrity
- ✅ Decimal128 prevents precision errors
- ✅ Pre-save validation on all models
- ✅ Immutability on Ledger (cannot modify/delete)
- ✅ Hash chain ensures transaction sequence integrity

---

## 📈 Performance Considerations

### Indexes Created

**User Model:**
- `email` (unique)
- `username` (unique)
- `is_frozen_for_fraud`
- `role`

**Ledger Model:**
- `transaction_id` (unique)
- `sender_id, createdAt` (compound)
- `receiver_id, createdAt` (compound)
- `currency, type` (compound)
- `createdAt` (desc)
- `current_hash` (unique)
- `status`
- `type, createdAt` (compound)

**Treasury Model:**
- None needed (singleton with 1 document)

### Query Optimization Tips

```javascript
// ✅ GOOD: Use lean() for read-only queries
const transactions = await Ledger.find({ sender_id: userId })
  .lean()
  .limit(50);

// ✅ GOOD: Project only needed fields
const balances = await User.findById(userId)
  .select('balance_euro balance_gold balance_ron')
  .lean();

// ❌ BAD: Loading all fields unnecessarily
const user = await User.findById(userId);  // Loads password, etc.
```

---

## 🔄 Migration Guide

### From Existing User Model

If you have existing users, run this migration:

```javascript
const User = require('./models/User');
const mongoose = require('mongoose');

async function migrateUsers() {
  const users = await User.find({});
  
  for (const user of users) {
    user.energy = 100;
    user.happiness = 100;
    user.balance_euro = mongoose.Types.Decimal128.fromString('0.0000');
    user.balance_gold = mongoose.Types.Decimal128.fromString('0.0000');
    user.balance_ron = mongoose.Types.Decimal128.fromString('0.0000');
    user.productivity_multiplier = mongoose.Types.Decimal128.fromString('1.0000');
    user.is_frozen_for_fraud = false;
    
    await user.save();
    console.log(`Migrated user: ${user.username}`);
  }
  
  console.log('Migration complete!');
}

migrateUsers();
```

---

## 📚 References

- [Mongoose Decimal128 Documentation](https://mongoosejs.com/docs/schematypes.html#decimals)
- [MongoDB Transactions](https://www.mongodb.com/docs/manual/core/transactions/)
- [SHA-256 Hashing in Node.js](https://nodejs.org/api/crypto.html)

---

## ✅ Checklist

- [x] User model extended with financial balances (Decimal128)
- [x] Treasury singleton model created
- [x] Ledger blockchain model created
- [x] SHA-256 hash chain implemented
- [x] Immutability enforced on Ledger
- [x] Atomic operations using $inc
- [x] Comprehensive validation
- [x] Security middleware hooks
- [x] Indexes for performance
- [x] Documentation complete

---

**Status:** ✅ **PRODUCTION READY**  
**Next Step:** Implement EconomyEngine.js (Transaction Execution Service)

---

*Last Updated: February 11, 2026*  
*Version: 1.0.0*
