const mongoose = require('mongoose');
// Models - Using global models from server.js
const User = global.User;
const Treasury = global.Treasury;
const Ledger = global.Ledger;
const FinancialMath = require('./FinancialMath');

/**
 * =============================================================================
 * ECONOMY ENGINE - ATOMIC TRANSACTION PROCESSOR
 * =============================================================================
 * 
 * This is the HEART of the economic system. Every monetary transaction in the
 * game flows through this engine. It implements ACID (Atomicity, Consistency,
 * Isolation, Durability) guarantees at banking-grade level.
 * 
 * CRITICAL GUARANTEES:
 * 1. ATOMICITY: All operations succeed or ALL fail (no partial transactions)
 * 2. CONSISTENCY: Database remains in valid state (no negative balances)
 * 3. ISOLATION: Concurrent transactions don't interfere (session locking)
 * 4. DURABILITY: Committed transactions are permanent (blockchain ledger)
 * 
 * SECURITY FEATURES:
 * - Fraud detection (frozen account check)
 * - Balance verification (insufficient funds check)
 * - Atomic updates (MongoDB transactions)
 * - Blockchain audit trail (immutable ledger)
 * - Tax collection (government treasury)
 * - Optimistic Concurrency Control (version checking)
 * 
 * TAX RATES:
 * - TRANSFER: 5%  (P2P player transfers)
 * - WORK: 15%     (Salary/income payments)
 * - MARKET: 10%   (Market purchases)
 * - SYSTEM: 0%    (Admin operations, no tax)
 * 
 * @version 1.0.0
 * @date 2026-02-11
 * @author Economic System Team
 */

class EconomyEngine {
	/**
	 * Tax rates by transaction type
	 * Immutable configuration
	 */
	static TAX_RATES = Object.freeze({
		TRANSFER: 0.05,      // 5% - P2P transfers
		WORK: 0.15,          // 15% - Income tax on work
		MARKET_BUY: 0.10,    // 10% - VAT on purchases
		MARKET_SELL: 0.10,   // 10% - VAT on sales
		SALARY: 0.15,        // 15% - Income tax (alias for WORK)
		REWARD: 0.00,        // 0% - No tax on rewards
		SYSTEM_MINT: 0.00,   // 0% - No tax on admin currency creation
		SYSTEM_BURN: 0.00,   // 0% - No tax on admin currency destruction
		REFUND: 0.00         // 0% - No tax on refunds
	});

	/**
	 * Valid transaction types
	 */
	static TRANSACTION_TYPES = Object.freeze([
		'TRANSFER',
		'WORK',
		'MARKET_BUY',
		'MARKET_SELL',
		'SALARY',
		'REWARD',
		'SYSTEM_MINT',
		'SYSTEM_BURN',
		'REFUND'
	]);

	/**
	 * Valid currencies
	 */
	static CURRENCIES = Object.freeze(['EURO', 'GOLD', 'RON']);

	/**
	 * =========================================================================
	 * MAIN TRANSACTION EXECUTION METHOD
	 * =========================================================================
	 * 
	 * Executes a monetary transaction with ACID guarantees.
	 * This is a CRITICAL method - any bug here can break the economy.
	 * 
	 * @param {object} params - Transaction parameters
	 * @param {string} params.senderId - Sender user ID (ObjectId string)
	 * @param {string} params.receiverId - Receiver user ID (ObjectId string)
	 * @param {string} params.amountStr - Amount as STRING (e.g., '100.50')
	 * @param {string} params.currency - Currency ('EURO', 'GOLD', 'RON')
	 * @param {string} params.transactionType - Type of transaction
	 * @param {string} [params.description] - Optional description
	 * @param {string} [params.referenceId] - Optional reference to related entity
	 * @param {string} [params.ipAddress] - Optional IP address (for audit)
	 * @param {string} [params.userAgent] - Optional user agent (for audit)
	 * 
	 * @returns {Promise<object>} - Transaction result
	 * 
	 * @throws {Error} - On any failure (transaction will be rolled back)
	 * 
	 * @example
	 * const result = await EconomyEngine.executeAtomicTransaction({
	 *   senderId: '507f1f77bcf86cd799439011',
	 *   receiverId: '507f1f77bcf86cd799439012',
	 *   amountStr: '100.00',
	 *   currency: 'EURO',
	 *   transactionType: 'TRANSFER',
	 *   description: 'Payment for services'
	 * });
	 */
	static async executeAtomicTransaction({
		senderId,
		receiverId,
		amountStr,
		currency,
		transactionType,
		description = '',
		referenceId = null,
		ipAddress = null,
		userAgent = null
	}) {
		// =====================================================================
		// STEP 0: VALIDATION (Pre-Transaction Checks)
		// =====================================================================
		const validationStart = Date.now();

		// Validate required parameters
		if (!senderId || !receiverId || !amountStr || !currency || !transactionType) {
			throw new Error(
				'[EconomyEngine] Missing required parameters. ' +
				'Required: senderId, receiverId, amountStr, currency, transactionType'
			);
		}

		// Validate transaction type
		if (!this.TRANSACTION_TYPES.includes(transactionType)) {
			throw new Error(
				`[EconomyEngine] Invalid transaction type: ${transactionType}. ` +
				`Valid types: ${this.TRANSACTION_TYPES.join(', ')}`
			);
		}

		// Validate currency
		const currencyUpper = currency.toUpperCase();
		if (!this.CURRENCIES.includes(currencyUpper)) {
			throw new Error(
				`[EconomyEngine] Invalid currency: ${currency}. ` +
				`Valid currencies: ${this.CURRENCIES.join(', ')}`
			);
		}

		// Validate amount format and value
		let normalizedAmount;
		try {
			normalizedAmount = FinancialMath.normalize(amountStr);
		} catch (error) {
			throw new Error(`[EconomyEngine] Invalid amount format: ${amountStr}`);
		}

		// Amount must be positive
		if (!FinancialMath.isPositive(normalizedAmount)) {
			throw new Error(
				`[EconomyEngine] Amount must be positive. Received: ${normalizedAmount}`
			);
		}

		// Prevent same sender and receiver (unless SYSTEM operations)
		if (senderId === receiverId && !transactionType.startsWith('SYSTEM_')) {
			throw new Error(
				'[EconomyEngine] Sender and receiver cannot be the same user'
			);
		}

		console.log(`[EconomyEngine] Starting transaction: ${transactionType} | ${normalizedAmount} ${currencyUpper}`);
		console.log(`[EconomyEngine] Sender: ${senderId} → Receiver: ${receiverId}`);

		// =====================================================================
		// STEP 1: INITIALIZE ACID TRANSACTION
		// =====================================================================
		const session = await mongoose.startSession();
		
		try {
			// Start MongoDB transaction (ACID begins here)
			await session.startTransaction({
				readConcern: { level: 'snapshot' },
				writeConcern: { w: 'majority' },
				readPreference: 'primary'
			});

			console.log(`[EconomyEngine] MongoDB transaction started (session: ${session.id})`);

			// =================================================================
			// STEP 2: LOCK & CHECK (Acquire Locks on Sender and Receiver)
			// =================================================================
			const lockStart = Date.now();

			// Fetch sender with session lock
			const sender = await User.findById(senderId).session(session);
			if (!sender) {
				throw new Error(`[EconomyEngine] Sender not found: ${senderId}`);
			}

			// Fetch receiver with session lock
			const receiver = await User.findById(receiverId).session(session);
			if (!receiver) {
				throw new Error(`[EconomyEngine] Receiver not found: ${receiverId}`);
			}

			console.log(`[EconomyEngine] Accounts locked: ${sender.username} → ${receiver.username}`);

			// Check if sender is frozen for fraud
			if (sender.is_frozen_for_fraud) {
				throw new Error(
					`[EconomyEngine] Sender account is frozen for fraud: ${sender.username} (${senderId}). ` +
					'Contact administrator to resolve this issue.'
				);
			}

			// Check if receiver is frozen (only for non-SYSTEM transactions)
			if (receiver.is_frozen_for_fraud && !transactionType.startsWith('SYSTEM_')) {
				throw new Error(
					`[EconomyEngine] Receiver account is frozen for fraud: ${receiver.username} (${receiverId}). ` +
					'Cannot complete transaction.'
				);
			}

			// Check if sender is active
			if (!sender.isActive) {
				throw new Error(
					`[EconomyEngine] Sender account is inactive: ${sender.username} (${senderId})`
				);
			}

			// Check if receiver is active (only for non-SYSTEM transactions)
			if (!receiver.isActive && !transactionType.startsWith('SYSTEM_')) {
				throw new Error(
					`[EconomyEngine] Receiver account is inactive: ${receiver.username} (${receiverId})`
				);
			}

			// Get balance field name based on currency
			const balanceField = `balance_${currencyUpper.toLowerCase()}`;
			const senderBalance = FinancialMath.toString(sender[balanceField]);

			// Check if sender has sufficient funds
			if (!FinancialMath.isGreaterThanOrEqual(senderBalance, normalizedAmount)) {
				throw new Error(
					`[EconomyEngine] Insufficient funds. ` +
					`Sender: ${sender.username} | ` +
					`Balance: ${senderBalance} ${currencyUpper} | ` +
					`Required: ${normalizedAmount} ${currencyUpper} | ` +
					`Deficit: ${FinancialMath.subtract(normalizedAmount, senderBalance)} ${currencyUpper}`
				);
			}

			const lockTime = Date.now() - lockStart;
			console.log(`[EconomyEngine] Lock & Check completed in ${lockTime}ms`);

			// =================================================================
			// STEP 3: TAX CALCULATION
			// =================================================================
			const taxStart = Date.now();

			// Determine tax rate based on transaction type
			const taxRate = this.TAX_RATES[transactionType];
			if (taxRate === undefined) {
				throw new Error(`[EconomyEngine] No tax rate defined for type: ${transactionType}`);
			}

			// Calculate tax and net amount
			const { taxWithheld, netAmount } = FinancialMath.calculateTax(
				normalizedAmount,
				taxRate
			);

			console.log(`[EconomyEngine] Tax calculation: Gross=${normalizedAmount} | Tax=${taxWithheld} (${taxRate * 100}%) | Net=${netAmount}`);

			// Verify math (paranoid check)
			const verifyGross = FinancialMath.add(netAmount, taxWithheld);
			if (!FinancialMath.isEqual(verifyGross, normalizedAmount)) {
				throw new Error(
					`[EconomyEngine] CRITICAL: Tax calculation error. ` +
					`Gross=${normalizedAmount} | Net=${netAmount} | Tax=${taxWithheld} | ` +
					`Verify=${verifyGross} (should equal Gross)`
				);
			}

			const taxTime = Date.now() - taxStart;
			console.log(`[EconomyEngine] Tax calculation completed in ${taxTime}ms`);

			// =================================================================
			// STEP 4: ATOMIC UPDATES (Modify Balances)
			// =================================================================
			const updateStart = Date.now();

			// 4a. Deduct gross amount from sender
			const newSenderBalance = FinancialMath.subtract(senderBalance, normalizedAmount);
			
			// Paranoid check: ensure no negative balance
			if (!FinancialMath.isNonNegative(newSenderBalance)) {
				throw new Error(
					`[EconomyEngine] CRITICAL: Sender balance would become negative. ` +
					`Current=${senderBalance} | Deduct=${normalizedAmount} | Result=${newSenderBalance}`
				);
			}

			// Update sender balance (direct assignment with OCC)
			sender[balanceField] = FinancialMath.toDecimal128(newSenderBalance);
			await sender.save({ session });

			console.log(`[EconomyEngine] Sender balance updated: ${senderBalance} → ${newSenderBalance} ${currencyUpper}`);

			// 4b. Add net amount to receiver
			const receiverBalance = FinancialMath.toString(receiver[balanceField]);
			const newReceiverBalance = FinancialMath.add(receiverBalance, netAmount);

			receiver[balanceField] = FinancialMath.toDecimal128(newReceiverBalance);
			await receiver.save({ session });

			console.log(`[EconomyEngine] Receiver balance updated: ${receiverBalance} → ${newReceiverBalance} ${currencyUpper}`);

			// 4c. Collect tax to Treasury (if tax > 0)
			if (FinancialMath.isPositive(taxWithheld)) {
				// Determine tax type for Treasury
				let taxType;
				if (transactionType === 'TRANSFER') {
					taxType = 'transfer_tax';
				} else if (transactionType === 'WORK' || transactionType === 'SALARY') {
					taxType = 'income_tax';
				} else if (transactionType.startsWith('MARKET_')) {
					taxType = 'vat';
				} else {
					taxType = 'transfer_tax'; // Default fallback
				}

				await Treasury.collectTax(
					taxType,
					currencyUpper,
					taxWithheld,
					session
				);

				console.log(`[EconomyEngine] Tax collected: ${taxWithheld} ${currencyUpper} → Treasury (${taxType})`);
			} else {
				console.log(`[EconomyEngine] No tax collected (${taxRate * 100}% of ${normalizedAmount} = 0)`);
			}

			const updateTime = Date.now() - updateStart;
			console.log(`[EconomyEngine] Atomic updates completed in ${updateTime}ms`);

			// =================================================================
			// STEP 5: LEDGER ENTRY (Blockchain Hash Chain)
			// =================================================================
			const ledgerStart = Date.now();

			// Create immutable ledger entry
			const ledgerEntry = await Ledger.createTransaction({
				sender_id: sender._id,
				sender_username: sender.username,
				sender_type: 'USER',
				receiver_id: receiver._id,
				receiver_username: receiver.username,
				receiver_type: 'USER',
				amount_gross: FinancialMath.toDecimal128(normalizedAmount),
				tax_withheld: FinancialMath.toDecimal128(taxWithheld),
				amount_net: FinancialMath.toDecimal128(netAmount),
				currency: currencyUpper,
				type: transactionType,
				description: description || `${transactionType} transaction`,
				reference_id: referenceId,
				status: 'COMPLETED',
				ip_address: ipAddress,
				user_agent: userAgent
			}, session);

			const ledgerTime = Date.now() - ledgerStart;
			console.log(`[EconomyEngine] Ledger entry created: ${ledgerEntry.transaction_id} (${ledgerTime}ms)`);
			console.log(`[EconomyEngine] Hash chain: ${ledgerEntry.previous_hash.substring(0, 8)}... → ${ledgerEntry.current_hash.substring(0, 8)}...`);

			// =================================================================
			// STEP 6: COMMIT TRANSACTION (ACID Completion)
			// =================================================================
			const commitStart = Date.now();

			await session.commitTransaction();

			const commitTime = Date.now() - commitStart;
			const totalTime = Date.now() - validationStart;

			console.log(`[EconomyEngine] Transaction COMMITTED in ${commitTime}ms`);
			console.log(`[EconomyEngine] Total transaction time: ${totalTime}ms`);

			// =================================================================
			// STEP 7: RETURN SUCCESS RESULT
			// =================================================================
			const result = {
				success: true,
				transaction_id: ledgerEntry.transaction_id,
				sender: {
					id: sender._id.toString(),
					username: sender.username,
					old_balance: senderBalance,
					new_balance: newSenderBalance,
					currency: currencyUpper
				},
				receiver: {
					id: receiver._id.toString(),
					username: receiver.username,
					old_balance: receiverBalance,
					new_balance: newReceiverBalance,
					currency: currencyUpper
				},
				amounts: {
					gross: normalizedAmount,
					tax: taxWithheld,
					net: netAmount,
					tax_rate: taxRate,
					currency: currencyUpper
				},
				type: transactionType,
				timestamp: ledgerEntry.createdAt,
				performance: {
					validation_ms: lockStart - validationStart,
					lock_ms: lockTime,
					tax_calculation_ms: taxTime,
					updates_ms: updateTime,
					ledger_ms: ledgerTime,
					commit_ms: commitTime,
					total_ms: totalTime
				}
			};

			console.log(`[EconomyEngine] ✅ Transaction ${ledgerEntry.transaction_id} completed successfully`);

			return result;

		} catch (error) {
			// =================================================================
			// ERROR HANDLING: ROLLBACK TRANSACTION
			// =================================================================
			console.error(`[EconomyEngine] ❌ Transaction FAILED: ${error.message}`);

			try {
				await session.abortTransaction();
				console.log(`[EconomyEngine] Transaction rolled back successfully`);
			} catch (abortError) {
				console.error(`[EconomyEngine] CRITICAL: Failed to abort transaction: ${abortError.message}`);
			}

			// Enhance error message with context
			const enhancedError = new Error(
				`[EconomyEngine] Transaction failed: ${error.message}`
			);
			enhancedError.originalError = error;
			enhancedError.transactionDetails = {
				senderId,
				receiverId,
				amount: amountStr,
				currency,
				type: transactionType
			};

			throw enhancedError;

		} finally {
			// Always end session (cleanup)
			await session.endSession();
			console.log(`[EconomyEngine] Session ended`);
		}
	}

	/**
	 * =========================================================================
	 * UTILITY METHODS
	 * =========================================================================
	 */

	/**
	 * Get available balance for a user in a specific currency
	 * @param {string} userId - User ID
	 * @param {string} currency - Currency
	 * @returns {Promise<string>} - Balance as string
	 */
	static async getUserBalance(userId, currency) {
		const user = await User.findById(userId);
		if (!user) {
			throw new Error(`[EconomyEngine] User not found: ${userId}`);
		}

		const currencyUpper = currency.toUpperCase();
		if (!this.CURRENCIES.includes(currencyUpper)) {
			throw new Error(`[EconomyEngine] Invalid currency: ${currency}`);
		}

		const balanceField = `balance_${currencyUpper.toLowerCase()}`;
		return FinancialMath.toString(user[balanceField]);
	}

	/**
	 * Check if user has sufficient funds
	 * @param {string} userId - User ID
	 * @param {string} currency - Currency
	 * @param {string} amount - Amount to check
	 * @returns {Promise<boolean>}
	 */
	static async hasSufficientFunds(userId, currency, amount) {
		const balance = await this.getUserBalance(userId, currency);
		return FinancialMath.isGreaterThanOrEqual(balance, amount);
	}

	/**
	 * Get transaction history for a user
	 * @param {string} userId - User ID
	 * @param {number} limit - Number of transactions
	 * @returns {Promise<Array>}
	 */
	static async getUserTransactionHistory(userId, limit = 50) {
		return await Ledger.getUserHistory(userId, limit);
	}

	/**
	 * Verify economic integrity (run daily)
	 * @returns {Promise<object>}
	 */
	static async verifyEconomicIntegrity() {
		console.log('[EconomyEngine] Running economic integrity check...');

		// 1. Verify blockchain integrity
		const blockchainResult = await Ledger.verifyChainIntegrity();

		// 2. Get user economic stats
		const userStats = await User.getEconomicStats();

		// 3. Get treasury report
		const treasury = await Treasury.getSingleton();
		const treasuryReport = treasury.generateReport();

		return {
			blockchain: blockchainResult,
			users: userStats,
			treasury: treasuryReport,
			timestamp: new Date().toISOString()
		};
	}
}

module.exports = EconomyEngine;
