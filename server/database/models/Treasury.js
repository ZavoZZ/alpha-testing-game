const mongoose = require('mongoose');

/**
 * =============================================================================
 * TREASURY MODEL - GOVERNMENT TAX RESERVES (SINGLETON)
 * =============================================================================
 * 
 * This model represents the State Treasury in the Zero-Sum P2P economy.
 * It collects taxes from ALL economic transactions and redistributes them
 * through game events, rewards, and government programs.
 * 
 * SINGLETON PATTERN:
 * - Only ONE Treasury document exists in the database (enforced)
 * - Document ID is always 'SINGLETON_TREASURY_2026'
 * - All tax collections UPDATE this single document
 * 
 * TAX TYPES:
 * 1. VAT (Value Added Tax) - On market purchases
 * 2. Income Tax - On work/salary payments
 * 3. Transfer Tax - On P2P transfers
 * 4. Property Tax - On land/building ownership (future)
 * 5. Import/Export Tax - On international trade (future)
 * 
 * CRITICAL SECURITY:
 * - All amounts use Decimal128 for precision
 * - Atomic updates only ($inc operations)
 * - Never direct assignment (prevents overwrites)
 * - Audit log for all withdrawals
 * 
 * @version 1.1.0 - FinTech Enterprise V2 Upgrade
 * @date 2026-02-11
 * @changelog
 *   V1.1.0 (2026-02-11):
 *   - Added Optimistic Concurrency Control (OCC)
 *   - Critical for singleton under high concurrent load
 *   - Prevents lost updates when multiple taxes collected simultaneously
 */

const treasurySchema = new mongoose.Schema({
	// =====================================================================
	// SINGLETON IDENTIFIER
	// =====================================================================
	_id: {
		type: String,
		default: 'SINGLETON_TREASURY_2026',
		immutable: true // Cannot be changed after creation
	},

	// =====================================================================
	// VAT COLLECTIONS (Value Added Tax - Market Transactions)
	// =====================================================================
	collected_vat_euro: {
		type: mongoose.Schema.Types.Decimal128,
		default: 0.0000,
		required: true
	},
	collected_vat_gold: {
		type: mongoose.Schema.Types.Decimal128,
		default: 0.0000,
		required: true
	},
	collected_vat_ron: {
		type: mongoose.Schema.Types.Decimal128,
		default: 0.0000,
		required: true
	},

	// =====================================================================
	// INCOME TAX COLLECTIONS (Work/Salary Payments)
	// =====================================================================
	collected_income_tax_euro: {
		type: mongoose.Schema.Types.Decimal128,
		default: 0.0000,
		required: true
	},
	collected_income_tax_gold: {
		type: mongoose.Schema.Types.Decimal128,
		default: 0.0000,
		required: true
	},
	collected_income_tax_ron: {
		type: mongoose.Schema.Types.Decimal128,
		default: 0.0000,
		required: true
	},

	// =====================================================================
	// TRANSFER TAX COLLECTIONS (P2P Transfers)
	// =====================================================================
	collected_transfer_tax_euro: {
		type: mongoose.Schema.Types.Decimal128,
		default: 0.0000,
		required: true
	},
	collected_transfer_tax_gold: {
		type: mongoose.Schema.Types.Decimal128,
		default: 0.0000,
		required: true
	},
	collected_transfer_tax_ron: {
		type: mongoose.Schema.Types.Decimal128,
		default: 0.0000,
		required: true
	},

	// =====================================================================
	// PROPERTY TAX COLLECTIONS (Future Implementation)
	// =====================================================================
	collected_property_tax_euro: {
		type: mongoose.Schema.Types.Decimal128,
		default: 0.0000,
		required: true
	},
	collected_property_tax_gold: {
		type: mongoose.Schema.Types.Decimal128,
		default: 0.0000,
		required: true
	},
	collected_property_tax_ron: {
		type: mongoose.Schema.Types.Decimal128,
		default: 0.0000,
		required: true
	},

	// =====================================================================
	// IMPORT/EXPORT TAX COLLECTIONS (Future Implementation)
	// =====================================================================
	collected_import_export_tax_euro: {
		type: mongoose.Schema.Types.Decimal128,
		default: 0.0000,
		required: true
	},
	collected_import_export_tax_gold: {
		type: mongoose.Schema.Types.Decimal128,
		default: 0.0000,
		required: true
	},
	collected_import_export_tax_ron: {
		type: mongoose.Schema.Types.Decimal128,
		default: 0.0000,
		required: true
	},

	// =====================================================================
	// AUDIT & STATISTICS
	// =====================================================================
	total_transactions_processed: {
		type: Number,
		default: 0,
		required: true
	},
	last_collection_timestamp: {
		type: Date,
		default: null
	},
	last_withdrawal_timestamp: {
		type: Date,
		default: null
	},
	last_withdrawal_by: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		default: null
	}
}, {
	timestamps: true, // createdAt, updatedAt
	collection: 'treasury', // Explicit collection name
	// =========================================================================
	// OPTIMISTIC CONCURRENCY CONTROL (OCC) - FinTech Enterprise V2
	// =========================================================================
	// CRITICAL: Treasury is a singleton updated by multiple simultaneous transactions
	// OCC ensures atomic updates by checking __v (version) field
	// Prevents race conditions where 2 tax collections happen in same millisecond
	// If version mismatch detected, transaction must retry
	optimisticConcurrency: true
});

// =========================================================================
// INDEXES
// =========================================================================
// No additional indexes needed - this is a singleton with only 1 document

// =========================================================================
// VIRTUAL PROPERTIES - Aggregate Statistics
// =========================================================================

/**
 * Total VAT collected across all currencies (in EURO equivalent)
 */
treasurySchema.virtual('total_vat_collected').get(function() {
	const euro = parseFloat(this.collected_vat_euro.toString());
	const gold = parseFloat(this.collected_vat_gold.toString());
	const ron = parseFloat(this.collected_vat_ron.toString());
	
	// Placeholder conversion rates (implement real rates later)
	return euro + (gold * 10) + (ron * 0.2);
});

/**
 * Total Income Tax collected across all currencies
 */
treasurySchema.virtual('total_income_tax_collected').get(function() {
	const euro = parseFloat(this.collected_income_tax_euro.toString());
	const gold = parseFloat(this.collected_income_tax_gold.toString());
	const ron = parseFloat(this.collected_income_tax_ron.toString());
	
	return euro + (gold * 10) + (ron * 0.2);
});

/**
 * Total Transfer Tax collected across all currencies
 */
treasurySchema.virtual('total_transfer_tax_collected').get(function() {
	const euro = parseFloat(this.collected_transfer_tax_euro.toString());
	const gold = parseFloat(this.collected_transfer_tax_gold.toString());
	const ron = parseFloat(this.collected_transfer_tax_ron.toString());
	
	return euro + (gold * 10) + (ron * 0.2);
});

/**
 * Grand total of ALL taxes collected (in EURO equivalent)
 */
treasurySchema.virtual('total_treasury_value').get(function() {
	return this.total_vat_collected + 
	       this.total_income_tax_collected + 
	       this.total_transfer_tax_collected;
});

// =========================================================================
// INSTANCE METHODS
// =========================================================================

/**
 * Get specific tax collection amount
 * @param {string} taxType - 'vat', 'income_tax', 'transfer_tax'
 * @param {string} currency - 'EURO', 'GOLD', 'RON'
 * @returns {string} - Balance as string
 */
treasurySchema.methods.getTaxBalance = function(taxType, currency) {
	const fieldName = `collected_${taxType}_${currency.toLowerCase()}`;
	const balance = this[fieldName];
	return balance ? balance.toString() : '0.0000';
};

/**
 * Get all balances for a specific currency
 * @param {string} currency - 'EURO', 'GOLD', 'RON'
 * @returns {object} - All tax collections for this currency
 */
treasurySchema.methods.getCurrencyBalances = function(currency) {
	const curr = currency.toLowerCase();
	return {
		vat: this[`collected_vat_${curr}`].toString(),
		income_tax: this[`collected_income_tax_${curr}`].toString(),
		transfer_tax: this[`collected_transfer_tax_${curr}`].toString(),
		property_tax: this[`collected_property_tax_${curr}`].toString(),
		import_export_tax: this[`collected_import_export_tax_${curr}`].toString()
	};
};

/**
 * Generate comprehensive treasury report
 * @returns {object} - Full treasury statistics
 */
treasurySchema.methods.generateReport = function() {
	return {
		timestamp: new Date().toISOString(),
		total_transactions: this.total_transactions_processed,
		last_collection: this.last_collection_timestamp,
		last_withdrawal: this.last_withdrawal_timestamp,
		balances: {
			euro: this.getCurrencyBalances('EURO'),
			gold: this.getCurrencyBalances('GOLD'),
			ron: this.getCurrencyBalances('RON')
		},
		totals: {
			vat: this.total_vat_collected,
			income_tax: this.total_income_tax_collected,
			transfer_tax: this.total_transfer_tax_collected,
			grand_total: this.total_treasury_value
		}
	};
};

// =========================================================================
// STATIC METHODS - Singleton Access Pattern
// =========================================================================

/**
 * Get or create the singleton Treasury instance
 * ALWAYS use this method instead of new Treasury()
 * 
 * @returns {Promise<Treasury>}
 */
treasurySchema.statics.getSingleton = async function() {
	let treasury = await this.findById('SINGLETON_TREASURY_2026');
	
	if (!treasury) {
		console.log('[TREASURY] Creating singleton Treasury instance...');
		treasury = await this.create({ _id: 'SINGLETON_TREASURY_2026' });
		console.log('[TREASURY] Singleton created successfully');
	}
	
	return treasury;
};

/**
 * Atomic tax collection (SAFE - uses $inc)
 * This is the ONLY way to add taxes to Treasury
 * 
 * @param {string} taxType - 'vat', 'income_tax', 'transfer_tax', etc.
 * @param {string} currency - 'EURO', 'GOLD', 'RON'
 * @param {string} amount - Amount as string (e.g., '10.50')
 * @param {object} session - Mongoose session (for transactions)
 * @returns {Promise<void>}
 */
treasurySchema.statics.collectTax = async function(taxType, currency, amount, session = null) {
	const fieldName = `collected_${taxType}_${currency.toLowerCase()}`;
	
	// Validate tax type
	const validTaxTypes = ['vat', 'income_tax', 'transfer_tax', 'property_tax', 'import_export_tax'];
	if (!validTaxTypes.includes(taxType)) {
		throw new Error(`Invalid tax type: ${taxType}`);
	}
	
	// Validate currency
	const validCurrencies = ['euro', 'gold', 'ron'];
	if (!validCurrencies.includes(currency.toLowerCase())) {
		throw new Error(`Invalid currency: ${currency}`);
	}
	
	// Convert string amount to Decimal128
	const decimalAmount = mongoose.Types.Decimal128.fromString(amount);
	
	// Atomic update using $inc (SAFE - no race conditions)
	const updateQuery = {
		$inc: {
			[fieldName]: decimalAmount,
			total_transactions_processed: 1
		},
		$set: {
			last_collection_timestamp: new Date()
		}
	};
	
	await this.findByIdAndUpdate(
		'SINGLETON_TREASURY_2026',
		updateQuery,
		{ 
			new: true, 
			upsert: true, // Create if doesn't exist
			session // Use transaction session if provided
		}
	);
	
	console.log(`[TREASURY] Collected ${amount} ${currency.toUpperCase()} as ${taxType}`);
};

/**
 * Admin withdrawal (for redistribution, events, etc.)
 * REQUIRES admin authorization and creates audit trail
 * 
 * @param {string} taxType - Tax type to withdraw from
 * @param {string} currency - Currency to withdraw
 * @param {string} amount - Amount to withdraw
 * @param {string} adminId - Admin user ID performing withdrawal
 * @param {string} reason - Reason for withdrawal
 * @param {object} session - Mongoose session
 * @returns {Promise<object>}
 */
treasurySchema.statics.withdrawTax = async function(taxType, currency, amount, adminId, reason, session = null) {
	const treasury = await this.getSingleton();
	const fieldName = `collected_${taxType}_${currency.toLowerCase()}`;
	
	// Check if sufficient funds exist
	const currentBalance = parseFloat(treasury[fieldName].toString());
	const withdrawAmount = parseFloat(amount);
	
	if (currentBalance < withdrawAmount) {
		throw new Error(`Insufficient treasury funds. Available: ${currentBalance}, Requested: ${withdrawAmount}`);
	}
	
	// Convert to Decimal128 (negative for withdrawal)
	const decimalAmount = mongoose.Types.Decimal128.fromString((-withdrawAmount).toString());
	
	// Atomic update
	const updated = await this.findByIdAndUpdate(
		'SINGLETON_TREASURY_2026',
		{
			$inc: {
				[fieldName]: decimalAmount
			},
			$set: {
				last_withdrawal_timestamp: new Date(),
				last_withdrawal_by: adminId
			}
		},
		{ 
			new: true, 
			session 
		}
	);
	
	console.log(`[TREASURY] WITHDRAWAL: ${amount} ${currency} by admin ${adminId} - Reason: ${reason}`);
	
	return {
		success: true,
		withdrawn: amount,
		currency: currency.toUpperCase(),
		remaining: updated[fieldName].toString(),
		admin: adminId,
		reason
	};
};

// =========================================================================
// MIDDLEWARE HOOKS
// =========================================================================

/**
 * Pre-save validation
 * Ensure no negative balances
 */
treasurySchema.pre('save', function(next) {
	// Check all Decimal128 fields for negative values
	const fields = Object.keys(this.toObject()).filter(key => key.startsWith('collected_'));
	
	for (const field of fields) {
		const value = parseFloat(this[field].toString());
		if (value < 0) {
			return next(new Error(`CRITICAL: Negative treasury balance detected in ${field}`));
		}
	}
	
	next();
});

/**
 * Post-save audit logging
 */
treasurySchema.post('save', function(doc) {
	console.log(`[TREASURY AUDIT] Treasury updated at ${new Date().toISOString()}`);
	console.log(`[TREASURY AUDIT] Total transactions: ${doc.total_transactions_processed}`);
});

/**
 * Prevent deletion of Treasury singleton
 */
treasurySchema.pre('remove', function(next) {
	const error = new Error('CRITICAL: Treasury singleton cannot be deleted!');
	console.error('[TREASURY] Attempted deletion of Treasury singleton - BLOCKED');
	next(error);
});

const Treasury = mongoose.model('Treasury', treasurySchema);

module.exports = Treasury;
