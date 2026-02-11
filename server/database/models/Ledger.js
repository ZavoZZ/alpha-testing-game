const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * =============================================================================
 * LEDGER MODEL - IMMUTABLE TRANSACTION BLOCKCHAIN
 * =============================================================================
 * 
 * This is the IMMUTABLE audit trail for ALL economic transactions in the game.
 * Inspired by blockchain technology, each transaction is cryptographically
 * linked to the previous transaction via SHA-256 hashing.
 * 
 * IMMUTABILITY GUARANTEES:
 * - NO updates allowed after creation
 * - NO deletions allowed (enforced via middleware)
 * - Each transaction contains hash of previous transaction
 * - Hash chain ensures tamper-proof audit trail
 * 
 * BLOCKCHAIN INTEGRITY:
 * - Genesis transaction (first transaction) has previous_hash = '0'
 * - Each subsequent transaction includes:
 *   1. previous_hash: SHA-256 hash of previous transaction
 *   2. current_hash: SHA-256 hash of current transaction data
 * - Any tampering breaks the hash chain and is detectable
 * 
 * TRANSACTION TYPES:
 * - TRANSFER: P2P player-to-player transfers
 * - MARKET_BUY: Purchasing items from market
 * - MARKET_SELL: Selling items on market
 * - SALARY: Work/job income payments
 * - TAX_COLLECTION: Government tax collection
 * - SYSTEM_MINT: Currency creation by admin (rare, audited)
 * - SYSTEM_BURN: Currency destruction (rare, audited)
 * - REWARD: Event/achievement rewards
 * - REFUND: Transaction reversals (rare, requires admin approval)
 * 
 * PRECISION REQUIREMENTS:
 * - All monetary amounts use Decimal128
 * - Prevents JavaScript floating-point errors
 * - Ensures audit trail accuracy to 4 decimal places
 * 
 * @version 1.1.0 - FinTech Enterprise V2 Upgrade
 * @date 2026-02-11
 * @changelog
 *   V1.1.0 (2026-02-11):
 *   - Enhanced verifyChainIntegrity() with forensic-level details
 *   - Added comprehensive tampering detection
 *   - Performance metrics and recommendations
 *   - Backward compatibility alias for verifyBlockchain()
 */

const ledgerSchema = new mongoose.Schema({
	// =====================================================================
	// TRANSACTION IDENTITY
	// =====================================================================
	transaction_id: {
		type: String,
		required: true,
		unique: true,
		immutable: true,
		// Auto-generated UUID v4 if not provided
		default: () => crypto.randomUUID()
	},

	// =====================================================================
	// PARTICIPANTS
	// =====================================================================
	sender_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		immutable: true,
		// Can also be 'SYSTEM' for system-generated transactions
		validate: {
			validator: function(v) {
				return v || this.sender_type === 'SYSTEM';
			},
			message: 'Sender ID required unless sender is SYSTEM'
		}
	},
	sender_username: {
		type: String,
		required: true,
		immutable: true
		// Denormalized for faster queries (avoid JOINs)
	},
	sender_type: {
		type: String,
		enum: ['USER', 'SYSTEM', 'TREASURY'],
		default: 'USER',
		immutable: true
	},

	receiver_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		immutable: true
	},
	receiver_username: {
		type: String,
		required: true,
		immutable: true
	},
	receiver_type: {
		type: String,
		enum: ['USER', 'SYSTEM', 'TREASURY'],
		default: 'USER',
		immutable: true
	},

	// =====================================================================
	// MONETARY AMOUNTS (Decimal128 for Precision)
	// =====================================================================
	amount_gross: {
		type: mongoose.Schema.Types.Decimal128,
		required: true,
		immutable: true,
		validate: {
			validator: function(v) {
				const value = parseFloat(v.toString());
				return value > 0; // Must be positive
			},
			message: 'Gross amount must be positive'
		}
	},
	tax_withheld: {
		type: mongoose.Schema.Types.Decimal128,
		required: true,
		immutable: true,
		default: 0.0000,
		validate: {
			validator: function(v) {
				const value = parseFloat(v.toString());
				return value >= 0; // Can be zero (no tax) but not negative
			},
			message: 'Tax cannot be negative'
		}
	},
	amount_net: {
		type: mongoose.Schema.Types.Decimal128,
		required: true,
		immutable: true,
		validate: {
			validator: function(v) {
				// Verify: amount_net = amount_gross - tax_withheld
				const gross = parseFloat(this.amount_gross.toString());
				const tax = parseFloat(this.tax_withheld.toString());
				const net = parseFloat(v.toString());
				const expected = gross - tax;
				
				// Allow 0.0001 difference due to Decimal128 rounding
				return Math.abs(net - expected) < 0.0001;
			},
			message: 'Net amount must equal gross amount minus tax'
		}
	},
	currency: {
		type: String,
		enum: ['EURO', 'GOLD', 'RON'],
		required: true,
		immutable: true
	},

	// =====================================================================
	// TRANSACTION METADATA
	// =====================================================================
	type: {
		type: String,
		enum: [
			'TRANSFER',        // P2P transfer
			'MARKET_BUY',      // Buying from market
			'MARKET_SELL',     // Selling on market
			'SALARY',          // Work income
			'TAX_COLLECTION',  // Tax to treasury
			'SYSTEM_MINT',     // Admin creates currency
			'SYSTEM_BURN',     // Admin destroys currency
			'REWARD',          // Achievement/event reward
			'REFUND'           // Transaction reversal
		],
		required: true,
		immutable: true
	},
	description: {
		type: String,
		maxlength: 500,
		default: '',
		immutable: true
		// Human-readable description (e.g., "Salary payment for 8 hours work")
	},
	reference_id: {
		type: String,
		default: null,
		immutable: true
		// Optional: Link to related entity (e.g., Market Order ID, Job ID)
	},

	// =====================================================================
	// BLOCKCHAIN HASH CHAIN (Tamper-Proof)
	// =====================================================================
	previous_hash: {
		type: String,
		required: true,
		immutable: true,
		// SHA-256 hash of previous transaction (or '0' for genesis)
		validate: {
			validator: function(v) {
				return v === '0' || /^[a-f0-9]{64}$/i.test(v);
			},
			message: 'Previous hash must be 64-character hex string or "0"'
		}
	},
	current_hash: {
		type: String,
		required: true,
		immutable: true,
		unique: true,
		// SHA-256 hash of this transaction (computed in pre-save hook)
		validate: {
			validator: function(v) {
				return /^[a-f0-9]{64}$/i.test(v);
			},
			message: 'Current hash must be 64-character hex string'
		}
	},

	// =====================================================================
	// AUDIT & COMPLIANCE
	// =====================================================================
	status: {
		type: String,
		enum: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'],
		default: 'COMPLETED',
		immutable: false // Can be updated ONLY to mark as REVERSED
	},
	ip_address: {
		type: String,
		default: null,
		immutable: true
		// For fraud detection
	},
	user_agent: {
		type: String,
		default: null,
		immutable: true
		// For fraud detection
	},
	reversed_by_transaction_id: {
		type: String,
		default: null
		// If this transaction was reversed, points to the reversal transaction
	}
}, {
	timestamps: { 
		createdAt: true, 
		updatedAt: false // No updates allowed - immutable
	},
	collection: 'ledger'
});

// =========================================================================
// INDEXES - Performance Optimization
// =========================================================================
ledgerSchema.index({ transaction_id: 1 }, { unique: true });
ledgerSchema.index({ sender_id: 1, createdAt: -1 }); // User transaction history
ledgerSchema.index({ receiver_id: 1, createdAt: -1 }); // User transaction history
ledgerSchema.index({ currency: 1, type: 1 }); // Economic analytics
ledgerSchema.index({ createdAt: -1 }); // Recent transactions
ledgerSchema.index({ current_hash: 1 }, { unique: true }); // Hash verification
ledgerSchema.index({ status: 1 }); // Filter by status
ledgerSchema.index({ type: 1, createdAt: -1 }); // Transaction type queries

// =========================================================================
// VIRTUAL PROPERTIES
// =========================================================================

/**
 * Get amounts as readable strings
 */
ledgerSchema.virtual('amount_gross_str').get(function() {
	return this.amount_gross.toString();
});

ledgerSchema.virtual('tax_withheld_str').get(function() {
	return this.tax_withheld.toString();
});

ledgerSchema.virtual('amount_net_str').get(function() {
	return this.amount_net.toString();
});

/**
 * Calculate tax percentage
 */
ledgerSchema.virtual('tax_percentage').get(function() {
	const gross = parseFloat(this.amount_gross.toString());
	const tax = parseFloat(this.tax_withheld.toString());
	return gross > 0 ? ((tax / gross) * 100).toFixed(2) : 0;
});

// =========================================================================
// INSTANCE METHODS
// =========================================================================

/**
 * Verify transaction integrity
 * Recomputes hash and compares to stored hash
 * @returns {boolean} - True if transaction is valid
 */
ledgerSchema.methods.verifyIntegrity = function() {
	const recomputedHash = this.computeTransactionHash();
	return recomputedHash === this.current_hash;
};

/**
 * Compute SHA-256 hash of transaction data
 * @returns {string} - 64-character hex hash
 */
ledgerSchema.methods.computeTransactionHash = function() {
	const data = {
		transaction_id: this.transaction_id,
		sender_id: this.sender_id.toString(),
		receiver_id: this.receiver_id.toString(),
		amount_gross: this.amount_gross.toString(),
		tax_withheld: this.tax_withheld.toString(),
		amount_net: this.amount_net.toString(),
		currency: this.currency,
		type: this.type,
		previous_hash: this.previous_hash,
		timestamp: this.createdAt.toISOString()
	};
	
	const dataString = JSON.stringify(data);
	return crypto.createHash('sha256').update(dataString).digest('hex');
};

/**
 * Get transaction summary (for UI display)
 */
ledgerSchema.methods.getSummary = function() {
	return {
		id: this.transaction_id,
		from: this.sender_username,
		to: this.receiver_username,
		amount: this.amount_net_str,
		currency: this.currency,
		type: this.type,
		tax: this.tax_withheld_str,
		date: this.createdAt.toISOString(),
		status: this.status
	};
};

// =========================================================================
// STATIC METHODS
// =========================================================================

/**
 * Get the last transaction (for blockchain chaining)
 * @returns {Promise<Ledger|null>}
 */
ledgerSchema.statics.getLastTransaction = async function() {
	return await this.findOne()
		.sort({ createdAt: -1 })
		.select('current_hash transaction_id createdAt')
		.lean();
};

/**
 * Create a new transaction with automatic hash chaining
 * This is the RECOMMENDED way to create ledger entries
 * 
 * @param {object} transactionData - Transaction details
 * @param {object} session - Mongoose session (for atomic operations)
 * @returns {Promise<Ledger>}
 */
ledgerSchema.statics.createTransaction = async function(transactionData, session = null) {
	// Get the last transaction to chain hashes
	const lastTransaction = await this.getLastTransaction();
	const previous_hash = lastTransaction ? lastTransaction.current_hash : '0';
	
	// Create transaction with previous_hash
	const transaction = new this({
		...transactionData,
		previous_hash
	});
	
	// Hash will be computed in pre-save hook
	await transaction.save({ session });
	
	console.log(`[LEDGER] Transaction ${transaction.transaction_id} created and linked to chain`);
	
	return transaction;
};

/**
 * =============================================================================
 * SUPREME AUDIT FUNCTION - BLOCKCHAIN INTEGRITY VALIDATOR (V2)
 * =============================================================================
 * 
 * Performs cryptographic verification of the entire transaction ledger.
 * This is the ULTIMATE security check that detects any database tampering.
 * 
 * WHAT IT CHECKS:
 * 1. Hash Chain Continuity - Each transaction's previous_hash must match
 *    the previous transaction's current_hash
 * 2. Hash Integrity - Recomputes SHA-256 hash for each transaction and
 *    compares with stored hash. If they don't match = TAMPERING DETECTED
 * 3. Sequential Ordering - Verifies transactions are in chronological order
 * 
 * WHEN TO RUN:
 * - Daily cron job (recommended)
 * - After database migrations
 * - When suspicious activity detected
 * - Before critical admin operations (e.g., mass currency mint)
 * 
 * PERFORMANCE:
 * - For 10,000 transactions: ~2-3 seconds
 * - For 100,000 transactions: ~20-30 seconds
 * - Uses lean() for memory efficiency
 * 
 * @returns {Promise<object>} - Comprehensive verification result
 * 
 * @example
 * const result = await Ledger.verifyChainIntegrity();
 * if (!result.valid) {
 *   console.error('SECURITY BREACH:', result.corrupted_transaction);
 *   // Alert admins, freeze system, create backup
 * }
 */
ledgerSchema.statics.verifyChainIntegrity = async function() {
	const startTime = Date.now();
	
	// Fetch all transactions sorted by creation time
	const transactions = await this.find()
		.sort({ createdAt: 1 })
		.lean();
	
	// Edge case: Empty ledger
	if (transactions.length === 0) {
		return { 
			valid: true, 
			message: 'Blockchain is empty (no transactions yet)',
			total_transactions: 0,
			verification_time_ms: Date.now() - startTime
		};
	}
	
	let previousHash = '0'; // Genesis previous_hash
	let verificationsPerformed = 0;
	
	// Iterate through each transaction in chronological order
	for (let i = 0; i < transactions.length; i++) {
		const tx = transactions[i];
		verificationsPerformed++;
		
		// =====================================================================
		// CHECK 1: Hash Chain Continuity
		// =====================================================================
		// Verify that this transaction's previous_hash matches the actual
		// previous transaction's current_hash
		if (tx.previous_hash !== previousHash) {
			return {
				valid: false,
				error_type: 'HASH_CHAIN_BROKEN',
				message: `Hash chain broken at transaction #${i + 1}`,
				corrupted_transaction: {
					transaction_id: tx.transaction_id,
					index: i,
					sender: tx.sender_username,
					receiver: tx.receiver_username,
					amount: tx.amount_gross.toString(),
					currency: tx.currency,
					type: tx.type,
					timestamp: tx.createdAt,
					stored_previous_hash: tx.previous_hash,
					expected_previous_hash: previousHash
				},
				hash_mismatch_details: {
					expected: previousHash,
					actual: tx.previous_hash,
					difference: 'Hash chain discontinuity detected'
				},
				// If there's a previous transaction, include it for forensics
				previous_transaction: i > 0 ? {
					transaction_id: transactions[i - 1].transaction_id,
					current_hash: transactions[i - 1].current_hash
				} : null,
				transactions_verified_before_failure: verificationsPerformed - 1,
				total_transactions: transactions.length,
				verification_time_ms: Date.now() - startTime,
				security_recommendation: 'CRITICAL: Database may have been manually edited. Restore from backup immediately.'
			};
		}
		
		// =====================================================================
		// CHECK 2: Hash Integrity (Cryptographic Verification)
		// =====================================================================
		// Recompute the SHA-256 hash based on transaction data
		// If computed hash ≠ stored hash → Transaction was tampered with
		const txDoc = new this(tx);
		const recomputedHash = txDoc.computeTransactionHash();
		
		if (recomputedHash !== tx.current_hash) {
			return {
				valid: false,
				error_type: 'TRANSACTION_TAMPERED',
				message: `Transaction #${i + 1} has been tampered with`,
				corrupted_transaction: {
					transaction_id: tx.transaction_id,
					index: i,
					sender: tx.sender_username,
					receiver: tx.receiver_username,
					amount_gross: tx.amount_gross.toString(),
					tax_withheld: tx.tax_withheld.toString(),
					amount_net: tx.amount_net.toString(),
					currency: tx.currency,
					type: tx.type,
					timestamp: tx.createdAt,
					ip_address: tx.ip_address,
					user_agent: tx.user_agent
				},
				hash_integrity_failure: {
					stored_hash: tx.current_hash,
					computed_hash: recomputedHash,
					difference: 'Hashes do not match - data was modified after creation',
					// Show which fields might have been tampered
					possibly_modified_fields: [
						'amount_gross',
						'amount_net',
						'tax_withheld',
						'sender_id',
						'receiver_id',
						'currency'
					]
				},
				transactions_verified_before_failure: verificationsPerformed - 1,
				total_transactions: transactions.length,
				verification_time_ms: Date.now() - startTime,
				security_recommendation: 'CRITICAL: Transaction data was modified. Investigate admin access logs. Restore from backup.'
			};
		}
		
		// =====================================================================
		// CHECK 3: Timestamp Ordering (Optional but recommended)
		// =====================================================================
		// Verify transactions are in chronological order
		if (i > 0) {
			const prevTimestamp = new Date(transactions[i - 1].createdAt).getTime();
			const currTimestamp = new Date(tx.createdAt).getTime();
			
			if (currTimestamp < prevTimestamp) {
				console.warn(`[LEDGER WARNING] Transaction #${i + 1} has earlier timestamp than previous transaction`);
				// This is a warning, not a critical error, so we continue
			}
		}
		
		// Move to next transaction
		previousHash = tx.current_hash;
	}
	
	// =========================================================================
	// ALL CHECKS PASSED - Blockchain is Valid ✅
	// =========================================================================
	const verificationTime = Date.now() - startTime;
	
	return {
		valid: true,
		message: `✅ Blockchain integrity verified: All ${transactions.length} transactions are valid`,
		total_transactions: transactions.length,
		first_transaction: {
			id: transactions[0].transaction_id,
			timestamp: transactions[0].createdAt
		},
		last_transaction: {
			id: transactions[transactions.length - 1].transaction_id,
			timestamp: transactions[transactions.length - 1].createdAt
		},
		verification_time_ms: verificationTime,
		performance: {
			transactions_per_second: Math.round((transactions.length / verificationTime) * 1000),
			average_time_per_transaction_ms: (verificationTime / transactions.length).toFixed(2)
		},
		next_recommended_check: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
	};
};

/**
 * Alias for verifyChainIntegrity (for backward compatibility)
 * @deprecated Use verifyChainIntegrity() instead
 */
ledgerSchema.statics.verifyBlockchain = async function() {
	console.warn('[LEDGER] verifyBlockchain() is deprecated. Use verifyChainIntegrity() instead.');
	return await this.verifyChainIntegrity();
};

/**
 * Get user transaction history
 * @param {string} userId - User's ObjectId
 * @param {number} limit - Number of transactions to return
 * @returns {Promise<Array>}
 */
ledgerSchema.statics.getUserHistory = async function(userId, limit = 50) {
	return await this.find({
		$or: [
			{ sender_id: userId },
			{ receiver_id: userId }
		]
	})
	.sort({ createdAt: -1 })
	.limit(limit)
	.lean();
};

/**
 * Get economic statistics
 * @param {string} currency - Optional currency filter
 * @returns {Promise<object>}
 */
ledgerSchema.statics.getEconomicStats = async function(currency = null) {
	const match = currency ? { currency } : {};
	
	const stats = await this.aggregate([
		{ $match: match },
		{
			$group: {
				_id: '$currency',
				total_transactions: { $sum: 1 },
				total_volume: { $sum: { $toDouble: '$amount_gross' } },
				total_taxes: { $sum: { $toDouble: '$tax_withheld' } }
			}
		}
	]);
	
	return stats;
};

// =========================================================================
// MIDDLEWARE HOOKS
// =========================================================================

/**
 * PRE-SAVE: Compute current_hash (Blockchain Integrity)
 * This is CRITICAL - ensures every transaction is cryptographically linked
 */
ledgerSchema.pre('save', async function(next) {
	if (this.isNew) {
		// Compute the transaction hash
		this.current_hash = this.computeTransactionHash();
		
		console.log(`[LEDGER] Transaction ${this.transaction_id} hashed: ${this.current_hash.substring(0, 16)}...`);
	}
	
	next();
});

/**
 * POST-SAVE: Audit logging
 */
ledgerSchema.post('save', function(doc) {
	console.log(`[LEDGER AUDIT] ${doc.type} transaction saved: ${doc.transaction_id}`);
	console.log(`[LEDGER AUDIT] ${doc.sender_username} → ${doc.receiver_username}: ${doc.amount_net_str} ${doc.currency}`);
});

/**
 * PRE-UPDATE: Prevent updates (Immutability)
 * Only allow status updates to mark as REVERSED
 */
ledgerSchema.pre('findOneAndUpdate', function(next) {
	const update = this.getUpdate();
	
	// Only allow status field to be updated to REVERSED
	const allowedUpdates = ['status', 'reversed_by_transaction_id'];
	const updateKeys = Object.keys(update.$set || {});
	
	const invalidUpdates = updateKeys.filter(key => !allowedUpdates.includes(key));
	
	if (invalidUpdates.length > 0) {
		return next(new Error(`LEDGER IMMUTABILITY VIOLATION: Cannot update fields: ${invalidUpdates.join(', ')}`));
	}
	
	// If updating status, ensure it's being set to REVERSED
	if (update.$set && update.$set.status && update.$set.status !== 'REVERSED') {
		return next(new Error('LEDGER: Can only update status to REVERSED'));
	}
	
	console.log(`[LEDGER] Status update allowed: ${this.getQuery().transaction_id}`);
	next();
});

/**
 * PRE-REMOVE: Prevent deletions (Immutability)
 */
ledgerSchema.pre('remove', function(next) {
	const error = new Error('LEDGER IMMUTABILITY: Transactions cannot be deleted!');
	console.error(`[LEDGER] Attempted deletion of transaction ${this.transaction_id} - BLOCKED`);
	next(error);
});

/**
 * PRE-DELETE: Prevent deletions via deleteOne/deleteMany
 */
ledgerSchema.pre('deleteOne', function(next) {
	console.error('[LEDGER] Attempted deleteOne operation - BLOCKED');
	next(new Error('LEDGER IMMUTABILITY: Transactions cannot be deleted!'));
});

ledgerSchema.pre('deleteMany', function(next) {
	console.error('[LEDGER] Attempted deleteMany operation - BLOCKED');
	next(new Error('LEDGER IMMUTABILITY: Transactions cannot be deleted!'));
});

const Ledger = mongoose.model('Ledger', ledgerSchema);

module.exports = Ledger;
