/**
 * ============================================================================
 * COMPANY MODEL - CORPORATE INFRASTRUCTURE
 * ============================================================================
 * 
 * Companies are the backbone of the economy. They:
 * - Employ players
 * - Pay salaries from their own funds (not from thin air!)
 * - Produce goods (future)
 * - Trade with other companies (future)
 * 
 * Module: 2.2.B - Corporate Infrastructure & Payroll
 * 
 * CRITICAL: This is a ZERO-SUM economy
 * - Money doesn't appear from nowhere
 * - Companies must have funds to pay salaries
 * - If company can't pay → Insolvency → Workers can't work
 * 
 * @version 1.0.0
 * @date 2026-02-12
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * ========================================================================
 * COMPANY SCHEMA
 * ========================================================================
 */
const companySchema = new Schema({
	/**
	 * ====================================================================
	 * BASIC INFORMATION
	 * ====================================================================
	 */
	
	/**
	 * Company name (must be unique)
	 * Example: "State Construction", "Alpha News", "Gold Mining Corp"
	 */
	name: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		minlength: 3,
		maxlength: 50,
		index: true
	},
	
	/**
	 * Owner (reference to User)
	 * The player who owns this company
	 * Can be Admin or regular player
	 */
	owner_id: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true
	},
	
	/**
	 * Company type (business sector)
	 * Determines what the company can do
	 * 
	 * Types:
	 * - GOVERNMENT: State-owned (default employer for unemployed)
	 * - NEWSPAPER: Media companies (produce articles)
	 * - RAW_MATERIAL: Mining, farming, fishing
	 * - FACTORY: Manufacturing (turns raw → finished goods)
	 * - CONSTRUCTION: Buildings (houses, factories, etc)
	 * - TRAINING: Education centers (increase productivity)
	 * - HOSPITAL: Healthcare (restore health)
	 * - RESTAURANT: Food service (restore energy/happiness)
	 * - HOLDING: Investment company (owns other companies)
	 */
	type: {
		type: String,
		required: true,
		enum: [
			'GOVERNMENT',
			'NEWSPAPER',
			'RAW_MATERIAL',
			'FACTORY',
			'CONSTRUCTION',
			'TRAINING',
			'HOSPITAL',
			'RESTAURANT',
			'HOLDING'
		],
		default: 'GOVERNMENT',
		index: true
	},
	
	/**
	 * Company description (optional)
	 */
	description: {
		type: String,
		maxlength: 500,
		default: ''
	},
	
	/**
	 * ====================================================================
	 * FINANCIALS (BALANCE SHEET)
	 * ====================================================================
	 * 
	 * CRITICAL: All financial values use Decimal128 (banking precision)
	 */
	
	/**
	 * Company funds in EURO
	 * This is the company's cash on hand
	 * Must have enough to pay salaries!
	 */
	funds_euro: {
		type: Schema.Types.Decimal128,
		default: '0.0000',
		get: (value) => value ? value.toString() : '0.0000',
		required: true
	},
	
	/**
	 * Company funds in GOLD
	 * Alternative currency for international trade
	 */
	funds_gold: {
		type: Schema.Types.Decimal128,
		default: '0.0000',
		get: (value) => value ? value.toString() : '0.0000',
		required: true
	},
	
	/**
	 * Company funds in RON (Romanian Leu)
	 * Local currency (future: multi-country system)
	 */
	funds_ron: {
		type: Schema.Types.Decimal128,
		default: '0.0000',
		get: (value) => value ? value.toString() : '0.0000',
		required: true
	},
	
	/**
	 * ====================================================================
	 * LABOR MARKET
	 * ====================================================================
	 */
	
	/**
	 * Salary offered per work shift (in EURO)
	 * This is the GROSS salary (before taxes)
	 * Actual salary depends on worker productivity (energy/happiness)
	 */
	wage_offer: {
		type: Schema.Types.Decimal128,
		default: '10.0000',
		get: (value) => value ? value.toString() : '10.0000',
		required: true
	},
	
	/**
	 * Items given to workers as bonus (Module 2.3 integration)
	 * Example: [{ item_code: 'BREAD_Q1', quantity: '1.0000' }]
	 */
	work_rewards: {
		type: [{
			item_code: {
				type: String,
				required: true,
				uppercase: true
			},
			quantity: {
				type: Schema.Types.Decimal128,
				required: true,
				default: '1.0000',
				get: (v) => v ? v.toString() : '1.0000'
			}
		}],
		default: []
	},
	
	/**
	 * Minimum skill/productivity required to work here
	 * Future: Players must train to work at advanced companies
	 * 
	 * 0 = No requirements (anyone can work)
	 * 1-5 = Basic training needed
	 * 6-10 = Advanced training needed
	 */
	min_skill_required: {
		type: Number,
		default: 0,
		min: 0,
		max: 10
	},
	
	/**
	 * List of employees (references to Users)
	 * Players currently employed at this company
	 */
	employees: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
	
	/**
	 * Maximum employees allowed
	 * Limited by company level/upgrades (future)
	 */
	max_employees: {
		type: Number,
		default: 100,
		min: 1,
		max: 10000
	},
	
	/**
	 * ====================================================================
	 * INVENTORY (PLACEHOLDER FOR FUTURE)
	 * ====================================================================
	 * 
	 * Companies will store:
	 * - Raw materials (wood, iron, food)
	 * - Finished products (weapons, houses, articles)
	 * - Equipment (machines, tools)
	 * 
	 * Structure (future):
	 * [
	 *   { item_type: 'WOOD', quantity: 1000, quality: 5 },
	 *   { item_type: 'IRON', quantity: 500, quality: 3 }
	 * ]
	 */
	inventory: {
		type: [{
			item_type: { type: String },
			quantity: { type: Number, default: 0 },
			quality: { type: Number, default: 1, min: 1, max: 10 }
		}],
		default: []
	},
	
	/**
	 * ====================================================================
	 * COMPANY STATS & METADATA
	 * ====================================================================
	 */
	
	/**
	 * Company level (determines capacity, efficiency)
	 * Upgraded by investing money/resources
	 */
	level: {
		type: Number,
		default: 1,
		min: 1,
		max: 10
	},
	
	/**
	 * Total salaries paid by this company (lifetime)
	 * For analytics and company rankings
	 */
	total_salaries_paid: {
		type: Schema.Types.Decimal128,
		default: '0.0000',
		get: (value) => value ? value.toString() : '0.0000'
	},
	
	/**
	 * Total work shifts completed at this company
	 * For analytics
	 */
	total_shifts_completed: {
		type: Number,
		default: 0,
		min: 0
	},
	
	/**
	 * Company status
	 * - ACTIVE: Operating normally
	 * - INSOLVENT: Can't pay salaries (no funds)
	 * - BANKRUPT: Permanently closed
	 * - SUSPENDED: Admin intervention (rule violation)
	 */
	status: {
		type: String,
		enum: ['ACTIVE', 'INSOLVENT', 'BANKRUPT', 'SUSPENDED'],
		default: 'ACTIVE',
		index: true
	},
	
	/**
	 * Last insolvency date
	 * Track when company ran out of money
	 */
	last_insolvency_at: {
		type: Date,
		default: null
	},
	
	/**
	 * ====================================================================
	 * FLAGS
	 * ====================================================================
	 */
	
	/**
	 * Is this a government company?
	 * Government companies:
	 * - Default employer for unemployed players
	 * - Can't go bankrupt (funded by Treasury)
	 * - Set by admins only
	 */
	is_government: {
		type: Boolean,
		default: false,
		index: true
	},
	
	/**
	 * Is company active (accepting workers)?
	 */
	is_hiring: {
		type: Boolean,
		default: true,
		index: true
	},
	
	/**
	 * ====================================================================
	 * TIMESTAMPS
	 * ====================================================================
	 */
	
	created_at: {
		type: Date,
		default: Date.now,
		immutable: true
	},
	
	updated_at: {
		type: Date,
		default: Date.now
	}
}, {
	// Schema options
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { getters: true },  // Convert Decimal128 to strings in JSON
	toObject: { getters: true }
});

/**
 * ========================================================================
 * INDEXES (PERFORMANCE OPTIMIZATION)
 * ========================================================================
 */

// Compound index for finding available jobs
companySchema.index({ is_hiring: 1, status: 1, type: 1 });

// Index for owner queries (my companies)
companySchema.index({ owner_id: 1, status: 1 });

// Index for employee lookup
companySchema.index({ employees: 1 });

/**
 * ========================================================================
 * METHODS (INSTANCE METHODS)
 * ========================================================================
 */

/**
 * Check if company can afford to pay a salary
 * 
 * @param {string} grossSalary - Gross salary amount (Decimal128 string)
 * @returns {boolean}
 */
companySchema.methods.canAffordSalary = function(grossSalary) {
	const FinancialMath = require('../services/FinancialMath');
	
	// Compare company funds with required salary
	// funds_euro >= grossSalary
	return FinancialMath.isGreaterThanOrEqual(this.funds_euro, grossSalary);
};

/**
 * Deduct salary from company funds
 * CRITICAL: Must be called within a transaction!
 * 
 * @param {string} grossSalary - Amount to deduct
 * @returns {string} - New balance
 */
companySchema.methods.deductSalary = function(grossSalary) {
	const FinancialMath = require('../services/FinancialMath');
	
	// funds_euro -= grossSalary
	this.funds_euro = FinancialMath.subtract(this.funds_euro, grossSalary);
	
	// Update stats
	this.total_salaries_paid = FinancialMath.add(
		this.total_salaries_paid,
		grossSalary
	);
	this.total_shifts_completed += 1;
	
	// Check if company is now insolvent
	if (FinancialMath.isLessThanOrEqual(this.funds_euro, '0.0000')) {
		this.status = 'INSOLVENT';
		this.last_insolvency_at = new Date();
	}
	
	return this.funds_euro;
};

/**
 * Add employee to company
 * 
 * @param {ObjectId} userId
 */
companySchema.methods.addEmployee = function(userId) {
	if (!this.employees.includes(userId)) {
		this.employees.push(userId);
	}
};

/**
 * Remove employee from company
 * 
 * @param {ObjectId} userId
 */
companySchema.methods.removeEmployee = function(userId) {
	this.employees = this.employees.filter(
		id => id.toString() !== userId.toString()
	);
};

/**
 * ========================================================================
 * STATIC METHODS
 * ========================================================================
 */

/**
 * Find default government employer
 * This is the fallback for unemployed players
 * 
 * @returns {Promise<Company>}
 */
companySchema.statics.findGovernmentEmployer = async function() {
	return await this.findOne({
		is_government: true,
		is_hiring: true,
		status: 'ACTIVE'
	}).sort({ created_at: 1 });  // Oldest government company
};

/**
 * Find companies hiring (with available slots)
 * 
 * @param {Object} filters - Type, min wage, etc.
 * @returns {Promise<Company[]>}
 */
companySchema.statics.findHiringCompanies = async function(filters = {}) {
	const query = {
		is_hiring: true,
		status: 'ACTIVE',
		$expr: { $lt: [{ $size: '$employees' }, '$max_employees'] }  // Has slots
	};
	
	if (filters.type) {
		query.type = filters.type;
	}
	
	if (filters.minWage) {
		const FinancialMath = require('../services/FinancialMath');
		// This is complex - would need aggregation
		// For now, skip this filter
	}
	
	return await this.find(query)
		.populate('owner_id', 'username')
		.sort({ wage_offer: -1 })  // Highest paying first
		.limit(50);
};

/**
 * ========================================================================
 * PRE-SAVE HOOKS
 * ========================================================================
 */

companySchema.pre('save', function(next) {
	// Update timestamp
	this.updated_at = new Date();
	
	// Auto-detect government status for certain types
	if (this.type === 'GOVERNMENT' && !this.is_government) {
		this.is_government = true;
	}
	
	next();
});

/**
 * ========================================================================
 * EXPORT MODEL
 * ========================================================================
 */

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
