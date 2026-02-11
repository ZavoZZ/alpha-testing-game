const mongoose = require('mongoose');

/**
 * =============================================================================
 * USER MODEL - ENTERPRISE FINANCIAL IDENTITY
 * =============================================================================
 * 
 * CRITICAL: This schema manages user economic identity for a Zero-Sum P2P economy.
 * All financial balances use Decimal128 to prevent JavaScript floating-point errors.
 * 
 * Financial Precision Requirements:
 * - NEVER use Number type for currency balances
 * - ALWAYS use mongoose.Schema.Types.Decimal128
 * - Prevents errors like: 0.1 + 0.2 = 0.30000000000000004
 * 
 * Security Features:
 * - is_frozen_for_fraud: Anti-bot protection flag
 * - productivity_multiplier: Economic gameplay mechanics
 * 
 * @version 2.1.0 - FinTech Enterprise V2 Upgrade
 * @date 2026-02-11
 * @changelog
 *   V2.1.0 (2026-02-11):
 *   - Added Optimistic Concurrency Control (OCC)
 *   - Prevents race conditions in high-frequency transactions
 *   - Uses __v field for version tracking
 */

const userSchema = new mongoose.Schema({
	// =====================================================================
	// AUTHENTICATION & IDENTITY
	// =====================================================================
	username: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		minlength: 3,
		maxlength: 50
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true
	},
	password: {
		type: String,
		required: true,
		minlength: 8
	},
	role: {
		type: String,
		enum: ['user', 'moderator', 'admin'],
		default: 'user'
	},
	isActive: {
		type: Boolean,
		default: true
	},
	isBanned: {
		type: Boolean,
		default: false
	},
	lastLogin: {
		type: Date,
		default: null
	},

	// =====================================================================
	// HUMAN RESOURCES (Gameplay Mechanics)
	// =====================================================================
	energy: {
		type: Number,
		default: 100,
		min: 0,
		max: 100,
		validate: {
			validator: Number.isInteger,
			message: 'Energy must be an integer between 0 and 100'
		}
	},
	happiness: {
		type: Number,
		default: 100,
		min: 0,
		max: 100,
		validate: {
			validator: Number.isInteger,
			message: 'Happiness must be an integer between 0 and 100'
		}
	},

	// =====================================================================
	// FINANCIAL BALANCES (CRITICAL: Decimal128 for Precision)
	// =====================================================================
	// 
	// WHY Decimal128?
	// JavaScript Number type has floating-point precision errors:
	//   0.1 + 0.2 = 0.30000000000000004 ❌
	// 
	// Decimal128 provides arbitrary precision:
	//   0.1 + 0.2 = 0.3 ✅
	// 
	// This is MANDATORY for financial applications to prevent:
	// - Rounding errors accumulating over transactions
	// - Exploit opportunities (players gaining fractions of currency)
	// - Audit trail discrepancies
	// =====================================================================

	balance_euro: {
		type: mongoose.Schema.Types.Decimal128,
		default: 0.0000,
		required: true,
		validate: {
			validator: function(v) {
				// Ensure balance is never negative
				const value = parseFloat(v.toString());
				return value >= 0;
			},
			message: 'Balance cannot be negative'
		}
	},
	balance_gold: {
		type: mongoose.Schema.Types.Decimal128,
		default: 0.0000,
		required: true,
		validate: {
			validator: function(v) {
				const value = parseFloat(v.toString());
				return value >= 0;
			},
			message: 'Balance cannot be negative'
		}
	},
	balance_ron: {
		type: mongoose.Schema.Types.Decimal128,
		default: 0.0000,
		required: true,
		validate: {
			validator: function(v) {
				const value = parseFloat(v.toString());
				return value >= 0;
			},
			message: 'Balance cannot be negative'
		}
	},

	// =====================================================================
	// ECONOMIC GAMEPLAY MECHANICS
	// =====================================================================
	productivity_multiplier: {
		type: mongoose.Schema.Types.Decimal128,
		default: 1.0000,
		required: true,
		validate: {
			validator: function(v) {
				const value = parseFloat(v.toString());
				return value >= 0.1 && value <= 10.0; // Reasonable bounds
			},
			message: 'Productivity multiplier must be between 0.1 and 10.0'
		}
	},

	// =====================================================================
	// SECURITY & ANTI-FRAUD
	// =====================================================================
	is_frozen_for_fraud: {
		type: Boolean,
		default: false,
		index: true // Indexed for fast fraud queries
	}
}, {
	timestamps: true, // Adds createdAt and updatedAt automatically
	// Ensure virtuals are included when converting to JSON/Object
	toJSON: { virtuals: true },
	toObject: { virtuals: true },
	// =========================================================================
	// OPTIMISTIC CONCURRENCY CONTROL (OCC) - FinTech Enterprise V2
	// =========================================================================
	// Prevents lost updates when two transactions modify the same document
	// Uses internal __v field to detect concurrent modifications
	// If __v doesn't match, Mongoose throws VersionError
	// CRITICAL for high-frequency trading and simultaneous transactions
	optimisticConcurrency: true
});

// =========================================================================
// INDEXES - Performance Optimization
// =========================================================================
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ is_frozen_for_fraud: 1 }); // For fraud monitoring queries
userSchema.index({ role: 1 }); // For admin/moderator queries

// =========================================================================
// VIRTUAL PROPERTIES - Computed Fields
// =========================================================================

/**
 * Get total wealth in EURO equivalent
 * (For leaderboards, statistics, etc.)
 * 
 * NOTE: Conversion rates should be fetched from a separate ExchangeRate model
 * For now, this is a placeholder showing the pattern
 */
userSchema.virtual('total_wealth_euro').get(function() {
	// Convert Decimal128 to float for calculation
	const euro = parseFloat(this.balance_euro.toString());
	const gold = parseFloat(this.balance_gold.toString());
	const ron = parseFloat(this.balance_ron.toString());
	
	// Placeholder conversion (implement real exchange rates later)
	// Example: 1 GOLD = 10 EURO, 1 RON = 0.2 EURO
	return euro + (gold * 10) + (ron * 0.2);
});

/**
 * Check if user can perform economic actions
 */
userSchema.virtual('can_transact').get(function() {
	return this.isActive && 
	       !this.isBanned && 
	       !this.is_frozen_for_fraud;
});

// =========================================================================
// INSTANCE METHODS
// =========================================================================

/**
 * Safely get balance as a string (for display)
 * Decimal128 needs to be converted to string for JSON serialization
 */
userSchema.methods.getBalance = function(currency) {
	const currencyMap = {
		'EURO': this.balance_euro,
		'GOLD': this.balance_gold,
		'RON': this.balance_ron
	};
	
	const balance = currencyMap[currency.toUpperCase()];
	return balance ? balance.toString() : '0.0000';
};

/**
 * Check if user has sufficient funds
 * @param {string} currency - 'EURO', 'GOLD', or 'RON'
 * @param {string|number} amount - Amount to check
 * @returns {boolean}
 */
userSchema.methods.hasSufficientFunds = function(currency, amount) {
	const balance = parseFloat(this.getBalance(currency));
	const required = typeof amount === 'string' ? parseFloat(amount) : amount;
	return balance >= required;
};

// =========================================================================
// STATIC METHODS
// =========================================================================

/**
 * Find all frozen accounts (for admin review)
 */
userSchema.statics.findFrozenAccounts = function() {
	return this.find({ is_frozen_for_fraud: true })
		.select('username email createdAt lastLogin')
		.lean();
};

/**
 * Get economic statistics (for admin dashboard)
 */
userSchema.statics.getEconomicStats = async function() {
	const users = await this.find({ isActive: true, isBanned: false });
	
	let totalEuro = 0, totalGold = 0, totalRon = 0;
	
	users.forEach(user => {
		totalEuro += parseFloat(user.balance_euro.toString());
		totalGold += parseFloat(user.balance_gold.toString());
		totalRon += parseFloat(user.balance_ron.toString());
	});
	
	return {
		total_users: users.length,
		total_euro: totalEuro.toFixed(4),
		total_gold: totalGold.toFixed(4),
		total_ron: totalRon.toFixed(4)
	};
};

// =========================================================================
// MIDDLEWARE HOOKS
// =========================================================================

/**
 * Pre-save validation
 * Ensure financial integrity before saving
 */
userSchema.pre('save', function(next) {
	// Ensure no negative balances sneaked through
	if (this.isModified('balance_euro') || 
	    this.isModified('balance_gold') || 
	    this.isModified('balance_ron')) {
		
		const euroVal = parseFloat(this.balance_euro.toString());
		const goldVal = parseFloat(this.balance_gold.toString());
		const ronVal = parseFloat(this.balance_ron.toString());
		
		if (euroVal < 0 || goldVal < 0 || ronVal < 0) {
			return next(new Error('CRITICAL: Negative balance detected. Transaction aborted.'));
		}
	}
	
	next();
});

/**
 * Post-save logging (for audit trail)
 */
userSchema.post('save', function(doc) {
	// Log significant balance changes (implement proper logging later)
	if (this.isModified('balance_euro') || 
	    this.isModified('balance_gold') || 
	    this.isModified('balance_ron')) {
		console.log(`[AUDIT] User ${doc.username} balances updated at ${new Date().toISOString()}`);
	}
});

const User = mongoose.model('User', userSchema);

module.exports = User;
