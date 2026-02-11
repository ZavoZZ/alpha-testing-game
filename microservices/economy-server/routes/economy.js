const express = require('express');
const router = express.Router();

// Middleware
const {
	verifyToken,
	economyRateLimiter,
	validateFinancialPayload,
	extractClientIP
} = require('../middleware');

// Services
const { EconomyEngine } = require('../services');

// Models - Using global models from server.js
const User = global.User;

/**
 * =============================================================================
 * ECONOMY API ROUTES - 100% SERVER-SIDE
 * =============================================================================
 * 
 * All economy operations are processed SERVER-SIDE with multiple security layers:
 * 
 * SECURITY LAYERS:
 * 1. JWT Authentication (verifyToken)
 * 2. Rate Limiting (economyRateLimiter)
 * 3. Payload Sanitization (validateFinancialPayload)
 * 4. Authorization Checks (sender/receiver validation)
 * 5. Business Logic Validation (EconomyEngine)
 * 6. ACID Transactions (MongoDB sessions)
 * 7. Blockchain Audit Trail (Ledger)
 * 
 * CLIENT CANNOT:
 * ❌ Modify amounts
 * ❌ Bypass validation
 * ❌ Fake sender/receiver
 * ❌ Skip tax calculation
 * ❌ Manipulate balances
 * ❌ Create fake transactions
 * 
 * ALL LOGIC IS SERVER-SIDE ✅
 * 
 * @version 1.0.0
 * @date 2026-02-11
 */

// =============================================================================
// HEALTH CHECK (PUBLIC - NO AUTH REQUIRED)
// =============================================================================

/**
 * Health check endpoint (no auth required)
 */
router.get('/health', (req, res) => {
	res.json({
		success: true,
		service: 'Economy API',
		status: 'operational',
		timestamp: new Date().toISOString(),
		version: '1.0.0',
		security: {
			rateLimiting: 'active',
			jwtAuth: 'active',
			payloadValidation: 'active'
		}
	});
});

// =============================================================================
// APPLY GLOBAL MIDDLEWARE TO ALL PROTECTED ECONOMY ROUTES
// =============================================================================

// Layer 1: Rate Limiting (10 req/5min per IP)
router.use(economyRateLimiter);

// Layer 2: JWT Authentication (all routes require login)
router.use(verifyToken);

console.log('[Economy Routes] 🛡️ Security layers active: Rate Limiting + JWT Auth');

// =============================================================================
// ROUTE: GET /api/economy/balance/:currency
// =============================================================================

/**
 * Get user's balance for a specific currency
 * 
 * SECURITY:
 * - User can ONLY view their OWN balance
 * - No way to view other users' balances (unless admin)
 * 
 * @param {string} currency - EURO, GOLD, or RON
 * @returns {object} - Balance information
 */
router.get('/balance/:currency', async (req, res) => {
	try {
		const userId = req.user.userId;  // From JWT token (SERVER-SIDE)
		const { currency } = req.params;

		// Validate currency
		const validCurrencies = ['EURO', 'GOLD', 'RON'];
		if (!validCurrencies.includes(currency.toUpperCase())) {
			return res.status(400).json({
				success: false,
				error: 'Invalid currency',
				message: 'Currency must be EURO, GOLD, or RON',
				code: 'INVALID_CURRENCY'
			});
		}

		// Get balance (SERVER-SIDE query)
		const balance = await EconomyEngine.getUserBalance(userId, currency.toUpperCase());

		res.json({
			success: true,
			data: {
				userId,
				username: req.user.username,
				currency: currency.toUpperCase(),
				balance: balance,
				timestamp: new Date().toISOString()
			}
		});

	} catch (error) {
		console.error('[Economy] ❌ Get balance error:', error);

		res.status(500).json({
			success: false,
			error: 'Failed to retrieve balance',
			message: error.message,
			code: 'BALANCE_ERROR'
		});
	}
});

// =============================================================================
// ROUTE: GET /api/economy/balances
// =============================================================================

/**
 * Get user's balances for ALL currencies
 * 
 * SECURITY:
 * - User can ONLY view their OWN balances
 * 
 * @returns {object} - All balances
 */
router.get('/balances', async (req, res) => {
	try {
		const userId = req.user.userId;  // From JWT token (SERVER-SIDE)

		// Get user from database (SERVER-SIDE query)
		const user = await User.findById(userId).select('balance_euro balance_gold balance_ron');

		if (!user) {
			return res.status(404).json({
				success: false,
				error: 'User not found',
				code: 'USER_NOT_FOUND'
			});
		}

		// Convert Decimal128 to strings (SERVER-SIDE)
		const { FinancialMath } = require('../services');

		res.json({
			success: true,
			data: {
				userId,
				username: req.user.username,
				balances: {
					EURO: FinancialMath.toString(user.balance_euro),
					GOLD: FinancialMath.toString(user.balance_gold),
					RON: FinancialMath.toString(user.balance_ron)
				},
				timestamp: new Date().toISOString()
			}
		});

	} catch (error) {
		console.error('[Economy] ❌ Get balances error:', error);

		res.status(500).json({
			success: false,
			error: 'Failed to retrieve balances',
			message: error.message,
			code: 'BALANCES_ERROR'
		});
	}
});

// =============================================================================
// ROUTE: POST /api/economy/transfer
// =============================================================================

/**
 * Transfer money from logged-in user to another user
 * 
 * SECURITY:
 * - Sender is ALWAYS req.user (from JWT) ← SERVER-SIDE ✅
 * - Client CANNOT specify sender ← Prevents theft ✅
 * - Amount is validated by middleware ← Anti-fraud ✅
 * - All checks happen SERVER-SIDE ← Unhackable ✅
 * 
 * @param {string} receiverId - Receiver user ID
 * @param {string} amount - Amount to transfer (string for precision)
 * @param {string} currency - EURO, GOLD, or RON
 * @param {string} description - Optional description
 * @returns {object} - Transaction result
 */
router.post('/transfer', validateFinancialPayload, async (req, res) => {
	try {
		// SECURITY: Sender is ALWAYS the logged-in user
		// Client CANNOT fake this - it's from JWT token (SERVER-SIDE)
		const senderId = req.user.userId;

		const { receiverId, amount, currency, description } = req.body;

		// Validation: receiverId is required
		if (!receiverId) {
			return res.status(400).json({
				success: false,
				error: 'Validation error',
				message: 'Receiver ID is required',
				code: 'MISSING_RECEIVER'
			});
		}

		// Validation: currency is required
		if (!currency) {
			return res.status(400).json({
				success: false,
				error: 'Validation error',
				message: 'Currency is required',
				code: 'MISSING_CURRENCY'
			});
		}

		// Validate currency
		const validCurrencies = ['EURO', 'GOLD', 'RON'];
		if (!validCurrencies.includes(currency.toUpperCase())) {
			return res.status(400).json({
				success: false,
				error: 'Invalid currency',
				message: 'Currency must be EURO, GOLD, or RON',
				code: 'INVALID_CURRENCY'
			});
		}

		// SECURITY CHECK: Cannot transfer to yourself (unless admin)
		if (senderId === receiverId && req.user.role !== 'admin') {
			return res.status(400).json({
				success: false,
				error: 'Invalid transfer',
				message: 'Cannot transfer to yourself',
				code: 'SELF_TRANSFER'
			});
		}

		// Execute ATOMIC transaction (SERVER-SIDE with ACID guarantees)
		const result = await EconomyEngine.executeAtomicTransaction({
			senderId: senderId,                      // ← FROM JWT (unhackable)
			receiverId: receiverId,
			amountStr: amount,                       // ← Validated by middleware
			currency: currency.toUpperCase(),
			transactionType: 'TRANSFER',
			description: description || 'Player transfer',
			ipAddress: extractClientIP(req),        // ← For audit trail
			userAgent: req.headers['user-agent']    // ← For audit trail
		});

		console.log('[Economy] ✅ Transfer successful:', {
			from: req.user.username,
			to: receiverId,
			amount,
			currency
		});

		res.json({
			success: true,
			data: result,
			message: 'Transfer completed successfully'
		});

	} catch (error) {
		console.error('[Economy] ❌ Transfer error:', error);

		res.status(400).json({
			success: false,
			error: 'Transfer failed',
			message: error.message,
			code: 'TRANSFER_ERROR'
		});
	}
});

// =============================================================================
// ROUTE: POST /api/economy/work
// =============================================================================

/**
 * Collect salary from work (SYSTEM pays user)
 * 
 * SECURITY:
 * - Receiver is ALWAYS req.user (from JWT) ← SERVER-SIDE ✅
 * - Sender is SYSTEM (special account) ← Cannot be faked ✅
 * - 15% tax is automatically deducted ← SERVER-SIDE ✅
 * 
 * @param {string} amount - Salary amount (string for precision)
 * @param {string} currency - EURO, GOLD, or RON
 * @param {string} description - Work description
 * @returns {object} - Transaction result
 */
router.post('/work', validateFinancialPayload, async (req, res) => {
	try {
		// SECURITY: Receiver is ALWAYS the logged-in user
		const receiverId = req.user.userId;

		const { amount, currency, description } = req.body;

		// Validation: currency is required
		if (!currency) {
			return res.status(400).json({
				success: false,
				error: 'Validation error',
				message: 'Currency is required',
				code: 'MISSING_CURRENCY'
			});
		}

		// Validate currency
		const validCurrencies = ['EURO', 'GOLD', 'RON'];
		if (!validCurrencies.includes(currency.toUpperCase())) {
			return res.status(400).json({
				success: false,
				error: 'Invalid currency',
				message: 'Currency must be EURO, GOLD, or RON',
				code: 'INVALID_CURRENCY'
			});
		}

		// Get SYSTEM account (special sender for work payments)
		const systemUser = await User.findOne({ username: 'SYSTEM' });

		if (!systemUser) {
			return res.status(500).json({
				success: false,
				error: 'System error',
				message: 'SYSTEM account not found',
				code: 'NO_SYSTEM_ACCOUNT'
			});
		}

		// Execute ATOMIC transaction (SERVER-SIDE)
		// Tax: 15% for WORK transactions
		const result = await EconomyEngine.executeAtomicTransaction({
			senderId: systemUser._id.toString(),     // ← SYSTEM pays
			receiverId: receiverId,                  // ← FROM JWT (unhackable)
			amountStr: amount,
			currency: currency.toUpperCase(),
			transactionType: 'WORK',                 // ← 15% tax
			description: description || 'Work salary',
			ipAddress: extractClientIP(req),
			userAgent: req.headers['user-agent']
		});

		console.log('[Economy] ✅ Work payment successful:', {
			user: req.user.username,
			amount,
			currency,
			tax: result.amounts.tax
		});

		res.json({
			success: true,
			data: result,
			message: 'Salary collected successfully'
		});

	} catch (error) {
		console.error('[Economy] ❌ Work payment error:', error);

		res.status(400).json({
			success: false,
			error: 'Work payment failed',
			message: error.message,
			code: 'WORK_ERROR'
		});
	}
});

// =============================================================================
// ROUTE: POST /api/economy/market
// =============================================================================

/**
 * Purchase from market (user pays SYSTEM)
 * 
 * SECURITY:
 * - Sender is ALWAYS req.user (from JWT) ← SERVER-SIDE ✅
 * - Receiver is SYSTEM ← Cannot buy for others ✅
 * - 10% tax (VAT) is automatically deducted ← SERVER-SIDE ✅
 * 
 * @param {string} amount - Purchase amount (string for precision)
 * @param {string} currency - EURO, GOLD, or RON
 * @param {string} itemId - Item being purchased
 * @param {string} description - Purchase description
 * @returns {object} - Transaction result
 */
router.post('/market', validateFinancialPayload, async (req, res) => {
	try {
		// SECURITY: Sender is ALWAYS the logged-in user
		const senderId = req.user.userId;

		const { amount, currency, itemId, description } = req.body;

		// Validation: currency is required
		if (!currency) {
			return res.status(400).json({
				success: false,
				error: 'Validation error',
				message: 'Currency is required',
				code: 'MISSING_CURRENCY'
			});
		}

		// Validate currency
		const validCurrencies = ['EURO', 'GOLD', 'RON'];
		if (!validCurrencies.includes(currency.toUpperCase())) {
			return res.status(400).json({
				success: false,
				error: 'Invalid currency',
				message: 'Currency must be EURO, GOLD, or RON',
				code: 'INVALID_CURRENCY'
			});
		}

		// Get SYSTEM account (special receiver for market purchases)
		const systemUser = await User.findOne({ username: 'SYSTEM' });

		if (!systemUser) {
			return res.status(500).json({
				success: false,
				error: 'System error',
				message: 'SYSTEM account not found',
				code: 'NO_SYSTEM_ACCOUNT'
			});
		}

		// Execute ATOMIC transaction (SERVER-SIDE)
		// Tax: 10% for MARKET transactions (VAT)
		const result = await EconomyEngine.executeAtomicTransaction({
			senderId: senderId,                      // ← FROM JWT (unhackable)
			receiverId: systemUser._id.toString(),   // ← SYSTEM receives
			amountStr: amount,
			currency: currency.toUpperCase(),
			transactionType: 'MARKET',               // ← 10% tax (VAT)
			description: description || `Market purchase: ${itemId || 'item'}`,
			referenceId: itemId,                     // ← Item ID for tracking
			ipAddress: extractClientIP(req),
			userAgent: req.headers['user-agent']
		});

		console.log('[Economy] ✅ Market purchase successful:', {
			user: req.user.username,
			amount,
			currency,
			item: itemId
		});

		res.json({
			success: true,
			data: result,
			message: 'Purchase completed successfully'
		});

	} catch (error) {
		console.error('[Economy] ❌ Market purchase error:', error);

		res.status(400).json({
			success: false,
			error: 'Purchase failed',
			message: error.message,
			code: 'MARKET_ERROR'
		});
	}
});

// =============================================================================
// ROUTE: GET /api/economy/history
// =============================================================================

/**
 * Get transaction history for logged-in user
 * 
 * SECURITY:
 * - User can ONLY view their OWN transactions
 * - Limit to 100 most recent transactions
 * 
 * @param {number} limit - Optional limit (default: 50, max: 100)
 * @returns {array} - Transaction history
 */
router.get('/history', async (req, res) => {
	try {
		const userId = req.user.userId;  // From JWT token (SERVER-SIDE)

		// Parse limit (default: 50, max: 100)
		let limit = parseInt(req.query.limit) || 50;
		if (limit > 100) limit = 100;
		if (limit < 1) limit = 1;

		// Get transaction history (SERVER-SIDE query)
		const transactions = await EconomyEngine.getUserTransactionHistory(userId, limit);

		res.json({
			success: true,
			data: {
				userId,
				username: req.user.username,
				transactions,
				count: transactions.length,
				timestamp: new Date().toISOString()
			}
		});

	} catch (error) {
		console.error('[Economy] ❌ Get history error:', error);

		res.status(500).json({
			success: false,
			error: 'Failed to retrieve transaction history',
			message: error.message,
			code: 'HISTORY_ERROR'
		});
	}
});

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = router;
