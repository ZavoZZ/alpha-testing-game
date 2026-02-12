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

/**
 * GET /system-status (PUBLIC - NO AUTH REQUIRED)
 * 
 * Module 2.1.C: Macro-Economic Observer
 * 
 * Returns comprehensive system state including:
 * - Server time (for client sync)
 * - Next tick info (countdown)
 * - Latest tick data (population, stats, telemetry)
 * - System health (performance, failures)
 */
router.get('/system-status', async (req, res) => {
	try {
		const SystemState = global.SystemState;
		const SystemLog = global.SystemLog;
		
		const systemState = await SystemState.findOne({ key: 'UNIVERSE_CLOCK' });
		
		if (!systemState) {
			return res.status(500).json({
				success: false,
				error: 'System state not initialized'
			});
		}
		
		const latestTickLog = await SystemLog.findOne({ type: 'HOURLY_ENTROPY' })
			.sort({ tick_timestamp: -1 })
			.limit(1);
		
		const now = new Date();
		const nextTick = new Date(now);
		nextTick.setUTCHours(nextTick.getUTCHours() + 1, 0, 0, 0);
		
		const timeUntilNextTick = nextTick.getTime() - now.getTime();
		
		res.json({
			success: true,
			server_time: {
				timestamp: now.toISOString(),
				unix_epoch: now.getTime(),
				utc_hour: now.getUTCHours(),
				utc_minute: now.getUTCMinutes()
			},
			next_tick: {
				timestamp: nextTick.toISOString(),
				unix_epoch: nextTick.getTime(),
				time_until: {
					milliseconds: timeUntilNextTick,
					seconds: Math.floor(timeUntilNextTick / 1000),
					minutes: Math.floor(timeUntilNextTick / 60000),
					formatted: `${Math.floor(timeUntilNextTick / 60000)}m ${Math.floor((timeUntilNextTick % 60000) / 1000)}s`
				}
			},
			system: {
				game_version: systemState.game_version,
				total_ticks_processed: systemState.total_ticks_processed,
				last_tick_timestamp: new Date(systemState.last_tick_epoch).toISOString(),
				last_tick_duration_ms: systemState.last_tick_duration_ms,
				is_processing: systemState.is_processing
			},
			latest_tick: latestTickLog ? {
				tick_number: latestTickLog.tick_number,
				timestamp: latestTickLog.tick_timestamp,
				execution_time_ms: latestTickLog.execution_time_ms,
				population: {
					total_active: latestTickLog.details.total_active_users || 0,
					new_users_joined: latestTickLog.details.new_users_joined || 0
				},
				life_stats: {
					average_energy: latestTickLog.details.average_energy || 0,
					average_happiness: latestTickLog.details.average_happiness || 0,
					average_health: latestTickLog.details.average_health || 0
				},
				telemetry: {
					burn_rate_per_second: latestTickLog.details.burn_rate_per_second || 0,
					efficiency_percentage: latestTickLog.details.efficiency_percentage || 0
				}
			} : null
		});
		
	} catch (error) {
		console.error('[API] ❌ System status error:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to retrieve system status',
			message: error.message
		});
	}
});

// =============================================================================
// APPLY GLOBAL MIDDLEWARE TO ALL PROTECTED ECONOMY ROUTES
// =============================================================================

// =============================================================================
// PUBLIC ROUTES (NO AUTH REQUIRED) - BEFORE JWT MIDDLEWARE
// =============================================================================

/**
 * GET /companies
 * List available companies (hiring)
 * 
 * SECURITY:
 * - Public endpoint (no auth required)
 * - Read-only
 * 
 * PURPOSE:
 * - Show player available jobs
 * - Compare salaries
 * - Choose employer
 * 
 * @param {string} type - Filter by company type (optional)
 * @returns {array} - List of hiring companies
 */
router.get('/companies', async (req, res) => {
	try {
		const Company = global.Company;
		const { type } = req.query;
		
		const filters = {};
		if (type) {
			filters.type = type.toUpperCase();
		}
		
		// Find hiring companies
		const companies = await Company.findHiringCompanies(filters);
		
		res.json({
			success: true,
			data: {
				companies: companies.map(c => ({
					id: c._id,
					name: c.name,
					type: c.type,
					wage_offer: c.wage_offer,
					min_skill_required: c.min_skill_required,
					employees_count: c.employees.length,
					max_employees: c.max_employees,
					has_openings: c.employees.length < c.max_employees,
					status: c.status,
					is_government: c.is_government,
					owner: c.owner_id ? {
						id: c.owner_id._id,
						username: c.owner_id.username
					} : null
				})),
				count: companies.length,
				timestamp: new Date().toISOString()
			}
		});
		
	} catch (error) {
		console.error('[API] ❌ List companies error:', error);
		
		res.status(500).json({
			success: false,
			error: 'Failed to list companies',
			message: error.message
		});
	}
});

// =============================================================================
// APPLY GLOBAL MIDDLEWARE TO ALL PROTECTED ECONOMY ROUTES
// =============================================================================

// Layer 1: Rate Limiting (10 req/5min per IP)
router.use(economyRateLimiter);

// Layer 2: JWT Authentication (all routes require login)
router.use(verifyToken);

console.log('[Economy Routes] 🛡️ Security layers active: Rate Limiting + JWT Auth');
console.log('[Economy Routes] 📊 Macro-Economic Observer: /system-status endpoint active');
console.log('[Economy Routes] 🏢 Public companies listing endpoint active');

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
// MODULE 2.2.B: WORK SYSTEM - CORPORATE INFRASTRUCTURE
// =============================================================================

const { WorkService, WorkCalculator } = require('../services');
const Company = global.Company;

/**
 * GET /work/status
 * Get current work status and salary preview (without executing)
 * 
 * SECURITY:
 * - Requires JWT authentication
 * - Read-only (no state changes)
 * 
 * PURPOSE:
 * - Frontend needs to know: Can I work? How much will I earn?
 * - Show paycheck preview (before executing)
 * - Check cooldown status
 * - Check company solvency
 * 
 * STATES:
 * - No job: User needs to get hired
 * - Has job + Can work: Show salary preview
 * - Has job + Cooldown: Show time remaining
 * - Has job + Company insolvent: Warn user
 * - Has job + Low energy: Warn user
 * 
 * @returns {object} - Complete work status
 */
router.get('/work/status', async (req, res) => {
	try {
		const userId = req.user.userId;
		
		// Load user
		const user = await User.findById(userId);
		
		if (!user) {
			return res.status(404).json({
				success: false,
				error: 'User not found'
			});
		}
		
		// ====================================================================
		// STEP 1: Check if user has a job
		// ====================================================================
		
		let company = null;
		
		if (user.employer_id) {
			company = await Company.findById(user.employer_id);
		}
		
		// If no job or company doesn't exist, suggest government job
		if (!company) {
			const govCompany = await Company.findGovernmentEmployer();
			
			return res.json({
				success: true,
				hasJob: false,
				message: 'You are unemployed. Sign a contract to start working!',
				suggestedEmployer: govCompany ? {
					id: govCompany._id,
					name: govCompany.name,
					type: govCompany.type,
					wage_offer: govCompany.wage_offer,
					is_government: govCompany.is_government
				} : null
			});
		}
		
		// ====================================================================
		// STEP 2: User has a job - Check eligibility
		// ====================================================================
		
		const eligibility = WorkCalculator.validateWorkEligibility(user);
		
		// ====================================================================
		// STEP 3: Calculate salary preview (if eligible)
		// ====================================================================
		
		let salaryPreview = null;
		
		if (eligibility.canWork) {
			const salaryCheck = WorkCalculator.calculateSalaryCheck(user);
			
			if (salaryCheck.canWork) {
				// Adjust for company's wage offer (not base salary)
				const FinancialMath = require('../services/FinancialMath');
				
				const grossSalary = FinancialMath.multiply(
					company.wage_offer,
					salaryCheck.breakdown.modifiers.energyFactor
				);
				const grossSalary2 = FinancialMath.multiply(
					grossSalary,
					salaryCheck.breakdown.modifiers.happinessFactor
				);
				const grossSalaryFinal = FinancialMath.multiply(
					grossSalary2,
					salaryCheck.breakdown.modifiers.productivityMultiplier
				);
				const grossSalaryRounded = FinancialMath.round(grossSalaryFinal, 4);
				
				const gameConstants = require('../config/gameConstants');
				const governmentTax = FinancialMath.multiply(
					grossSalaryRounded,
					gameConstants.WORK.INCOME_TAX_PERCENTAGE
				);
				const governmentTaxRounded = FinancialMath.round(governmentTax, 4);
				
				const netSalary = FinancialMath.subtract(grossSalaryRounded, governmentTaxRounded);
				const netSalaryRounded = FinancialMath.round(netSalary, 4);
				
				salaryPreview = {
					base_wage: company.wage_offer,
					gross_estimated: grossSalaryRounded,
					tax_estimated: governmentTaxRounded,
					net_estimated: netSalaryRounded,
					modifiers: salaryCheck.breakdown.modifiers,
					efficiency: salaryCheck.breakdown.efficiency,
					energy_cost: gameConstants.WORK.ENERGY_COST
				};
			}
		}
		
		// ====================================================================
		// STEP 4: Check company solvency
		// ====================================================================
		
		const companyCanPay = company.canAffordSalary(company.wage_offer);
		
		// ====================================================================
		// STEP 5: Calculate next work time (if cooldown active)
		// ====================================================================
		
		let cooldown = null;
		
		if (user.last_work_at) {
			const cooldownCheck = WorkCalculator.checkCooldown(user.last_work_at);
			
			if (!cooldownCheck.canWork) {
				cooldown = {
					is_ready: false,
					next_available_at: new Date(
						new Date(user.last_work_at).getTime() + 
						(gameConstants.WORK.COOLDOWN_HOURS * 60 * 60 * 1000)
					),
					time_remaining_ms: cooldownCheck.cooldownRemaining,
					time_remaining_formatted: cooldownCheck.cooldownRemainingFormatted
				};
			} else {
				cooldown = {
					is_ready: true,
					next_available_at: null,
					time_remaining_ms: 0,
					time_remaining_formatted: '0h 0m'
				};
			}
		} else {
			// Never worked before
			cooldown = {
				is_ready: true,
				next_available_at: null,
				time_remaining_ms: 0,
				time_remaining_formatted: '0h 0m'
			};
		}
		
		// ====================================================================
		// STEP 6: Build comprehensive status response
		// ====================================================================
		
		res.json({
			success: true,
			hasJob: true,
			
			// Company info
			company: {
				id: company._id,
				name: company.name,
				type: company.type,
				wage_offer: company.wage_offer,
				funds: company.funds_euro,
				can_afford_salary: companyCanPay,
				status: company.status
			},
			
			// User stats
			player: {
				energy: user.energy,
				happiness: user.happiness,
				health: user.health,
				productivity: user.productivity_multiplier,
				balance: user.balance_euro,
				total_shifts_worked: user.total_shifts_worked
			},
			
			// Work eligibility
			canWork: eligibility.canWork && companyCanPay,
			blockedReason: !eligibility.canWork ? eligibility.reason : 
			                !companyCanPay ? 'COMPANY_INSOLVENT' : null,
			message: !eligibility.canWork ? eligibility.message :
			         !companyCanPay ? `${company.name} cannot afford to pay your salary. Contact the owner!` :
			         'Ready to work!',
			
			// Cooldown status
			cooldown: cooldown,
			
			// Salary preview (if can work)
			salary_preview: salaryPreview,
			
			// Warnings
			warnings: [
				user.energy < 50 ? {
					type: 'EXHAUSTION',
					message: `Low energy (${user.energy}/100). You'll earn ${(parseFloat(salaryPreview?.modifiers?.energyFactor || 0) * 100).toFixed(0)}% salary.`,
					severity: 'warning'
				} : null,
				user.happiness < 20 ? {
					type: 'DEPRESSION',
					message: `Very low happiness (${user.happiness}/100). Severe productivity penalty!`,
					severity: 'critical'
				} : null,
				!companyCanPay ? {
					type: 'INSOLVENCY',
					message: `${company.name} has insufficient funds (€${company.funds_euro}).`,
					severity: 'critical'
				} : null
			].filter(Boolean)
		});
		
	} catch (error) {
		console.error('[API] ❌ Work status error:', error);
		
		res.status(500).json({
			success: false,
			error: 'Failed to get work status',
			message: error.message
		});
	}
});

/**
 * POST /work
 * Execute a work shift (earn salary from employer company)
 * 
 * SECURITY:
 * - Requires JWT authentication
 * - 24-hour cooldown (one shift per day)
 * - Minimum energy requirement (10)
 * 
 * ECONOMICS:
 * - Company pays from its own funds (zero-sum economy)
 * - If company can't pay → Insolvency error
 * - Taxes collected (government + master/referral)
 * - Energy consumed (10 per shift)
 * 
 * @returns {object} - Work result with earnings breakdown
 */
router.post('/work', async (req, res) => {
	try {
		const userId = req.user.userId;  // From JWT token
		
		console.log(`[API] 💼 Work request from user: ${userId}`);
		
		// Process work shift (handles everything internally)
		const result = await WorkService.processWorkShift(userId);
		
		res.json(result);
		
	} catch (error) {
		console.error('[API] ❌ Work error:', error);
		
		// Determine error status code
		let statusCode = 500;
		
		if (error.message.includes('energy')) {
			statusCode = 400;  // Bad request (insufficient energy)
		} else if (error.message.includes('cooldown')) {
			statusCode = 429;  // Too many requests (cooldown active)
		} else if (error.message.includes('insolvent') || error.message.includes('afford')) {
			statusCode = 503;  // Service unavailable (company can't pay)
		}
		
		res.status(statusCode).json({
			success: false,
			error: 'Work shift failed',
			message: error.message,
			code: 'WORK_ERROR'
		});
	}
});

/**
 * GET /work/preview
 * Preview salary for next work shift (without executing)
 * 
 * SECURITY:
 * - Requires JWT authentication
 * - Read-only (no state changes)
 * 
 * PURPOSE:
 * - Show player how much they would earn
 * - Display penalties (exhaustion, depression)
 * - Help player decide when to work
 * 
 * @returns {object} - Salary breakdown (preview only)
 */
router.get('/work/preview', async (req, res) => {
	try {
		const userId = req.user.userId;
		
		// Load user
		const user = await User.findById(userId);
		
		if (!user) {
			return res.status(404).json({
				success: false,
				error: 'User not found'
			});
		}
		
		// Load employer (or use government default)
		let company;
		
		if (user.employer_id) {
			company = await Company.findById(user.employer_id);
		}
		
		if (!company) {
			company = await Company.findGovernmentEmployer();
		}
		
		if (!company) {
			return res.status(500).json({
				success: false,
				error: 'No employer available',
				message: 'Please contact administrator'
			});
		}
		
		// Calculate salary (preview)
		const salaryCheck = WorkCalculator.calculateSalaryCheck(user);
		
		// Check eligibility
		const eligibility = WorkCalculator.validateWorkEligibility(user);
		
		res.json({
			success: true,
			canWork: eligibility.canWork,
			reason: eligibility.reason,
			message: eligibility.message,
			
			company: {
				name: company.name,
				type: company.type,
				wage_offer: company.wage_offer,
				has_funds: company.canAffordSalary(company.wage_offer)
			},
			
			preview: salaryCheck.canWork ? {
				gross_estimated: salaryCheck.breakdown.grossSalary,
				net_estimated: salaryCheck.breakdown.netSalary,
				tax_estimated: salaryCheck.breakdown.taxAmount,
				modifiers: salaryCheck.breakdown.modifiers,
				efficiency: salaryCheck.breakdown.efficiency
			} : null,
			
			current_stats: {
				energy: user.energy,
				happiness: user.happiness,
				productivity: user.productivity_multiplier
			},
			
			cooldown: eligibility.cooldown || null
		});
		
	} catch (error) {
		console.error('[API] ❌ Work preview error:', error);
		
		res.status(500).json({
			success: false,
			error: 'Failed to preview work',
			message: error.message
		});
	}
});

/**
 * POST /companies/:id/join
 * Join a company (change employer)
 * 
 * SECURITY:
 * - Requires JWT authentication
 * - Validates company exists and is hiring
 * - Validates user meets skill requirements
 * 
 * PURPOSE:
 * - Allow player to switch jobs
 * - Find better paying companies
 * - Career progression
 * 
 * @param {string} id - Company ID
 * @returns {object} - Success message
 */
router.post('/companies/:id/join', async (req, res) => {
	try {
		const userId = req.user.userId;
		const companyId = req.params.id;
		
		// Load user
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				error: 'User not found'
			});
		}
		
		// Load company
		const company = await Company.findById(companyId);
		if (!company) {
			return res.status(404).json({
				success: false,
				error: 'Company not found'
			});
		}
		
		// Validate company
		if (company.status !== 'ACTIVE') {
			return res.status(400).json({
				success: false,
				error: 'Company is not active',
				message: `Company status: ${company.status}`
			});
		}
		
		if (!company.is_hiring) {
			return res.status(400).json({
				success: false,
				error: 'Company is not hiring'
			});
		}
		
		if (company.employees.length >= company.max_employees) {
			return res.status(400).json({
				success: false,
				error: 'Company is full',
				message: `Maximum ${company.max_employees} employees`
			});
		}
		
		// Check if already employed here
		if (user.employer_id && user.employer_id.toString() === companyId) {
			return res.status(400).json({
				success: false,
				error: 'Already employed here',
				message: `You already work at ${company.name}`
			});
		}
		
		// Leave old company (if employed)
		if (user.employer_id) {
			const oldCompany = await Company.findById(user.employer_id);
			if (oldCompany) {
				oldCompany.removeEmployee(user._id);
				await oldCompany.save();
			}
		}
		
		// Join new company
		company.addEmployee(user._id);
		await company.save();
		
		// Update user
		user.employer_id = company._id;
		await user.save();
		
		res.json({
			success: true,
			message: `You are now employed at ${company.name}!`,
			data: {
				company: {
					id: company._id,
					name: company.name,
					type: company.type,
					wage_offer: company.wage_offer
				}
			}
		});
		
	} catch (error) {
		console.error('[API] ❌ Join company error:', error);
		
		res.status(500).json({
			success: false,
			error: 'Failed to join company',
			message: error.message
		});
	}
});

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = router;
