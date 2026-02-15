require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3400;

// Middleware
app.use(cors({
	origin: process.env.WEB_ORIGIN || '*',
	credentials: true,
}));
app.use(express.json());

// Database connection
const connectDB = async () => {
	try {
		const uri = process.env.DB_URI || 'mongodb://mongo:27017/auth_db';
		await mongoose.connect(uri);
		console.log('MongoDB connected successfully');
		console.log(`Database: ${uri}`);
	} catch (err) {
		console.error('MongoDB connection failed:', err.message);
		process.exit(1);
	}
};

// User Model (must match auth-server schema exactly!)
const userSchema = new mongoose.Schema({
	// Authentication & Identity
	username: { type: String, required: true, unique: true, trim: true },
	email: { type: String, required: true, unique: true, trim: true, lowercase: true },
	password: { type: String, required: true },
	role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
	isActive: { type: Boolean, default: true },
	isBanned: { type: Boolean, default: false },
	lastLogin: { type: Date, default: null },
	
	// Economy Balances (Decimal128)
	balance_euro: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0000') },
	balance_gold: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0000') },
	balance_ron: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0000') },
	
	// Tax Reserves
	collected_transfer_tax_euro: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0000') },
	collected_market_tax_euro: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0000') },
	collected_work_tax_euro: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0000') },
	
	// Security & Gameplay
	is_frozen_for_fraud: { type: Boolean, default: false },
	productivity_multiplier: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('1.0000') },
	
	// =========================================================================
	// LIFE SIMULATION (Module 2.1.B - Entropia Universală)
	// =========================================================================
	
	/**
	 * Energy Level (0-100)
	 * Decreases by ENERGY_DECAY per hour
	 * When 0 → Exhaustion state (coma)
	 */
	energy: { 
		type: Number, 
		default: 100,
		min: 0,
		max: 100
	},
	
	/**
	 * Happiness Level (0-100)
	 * Decreases by HAPPINESS_DECAY per hour
	 * When 0 → Depression state (reduced productivity)
	 */
	happiness: {
		type: Number,
		default: 100,
		min: 0,
		max: 100
	},
	
	/**
	 * Health Level (0-100)
	 * Affected by exhaustion and depression
	 * When 0 → Death (account deactivation)
	 */
	health: {
		type: Number,
		default: 100,
		min: 0,
		max: 100
	},
	
	/**
	 * Vacation Mode
	 * When true, player is protected from entropy decay
	 * Can be enabled for 7 days max per month
	 */
	vacation_mode: {
		type: Boolean,
		default: false
	},
	
	/**
	 * Vacation Start Time
	 * When vacation mode was enabled
	 */
	vacation_started_at: {
		type: Date,
		default: null
	},
	
	/**
	 * Status Effects
	 * Active conditions affecting the player
	 */
	status_effects: {
		exhausted: { type: Boolean, default: false },      // Energy = 0
		depressed: { type: Boolean, default: false },      // Happiness = 0
		starving: { type: Boolean, default: false },       // No food consumed
		homeless: { type: Boolean, default: false },       // No housing
		sick: { type: Boolean, default: false },           // Health < 30
		dying: { type: Boolean, default: false },          // Health < 10
		dead: { type: Boolean, default: false }            // Health = 0
	},
	
	/**
	 * Last Decay Processed
	 * Timestamp of last entropy tick
	 * Used to prevent duplicate processing
	 */
	last_decay_processed: {
		type: Date,
		default: null
	},
	
	/**
	 * Consecutive Hours at Zero
	 * How many hours player has been exhausted/depressed
	 * Used for progressive penalties
	 */
	consecutive_zero_energy_hours: {
		type: Number,
		default: 0
	},
	
	consecutive_zero_happiness_hours: {
		type: Number,
		default: 0
	},
	
	// =========================================================================
	// WORK SYSTEM (Module 2.2.B - Corporate Infrastructure)
	// =========================================================================
	
	/**
	 * Current Employer (reference to Company)
	 * null = Unemployed (will be auto-assigned to government company)
	 */
	employer_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Company',
		default: null,
		index: true
	},
	
	/**
	 * Last Work Timestamp
	 * When player last worked (for 24h cooldown)
	 */
	last_work_at: {
		type: Date,
		default: null
	},
	
	/**
	 * Productivity Multiplier (skills, training, experience)
	 * Default: 1.0000 (100%)
	 * Future: Can increase through education, practice
	 * Max: 5.0000 (500% - highly skilled worker)
	 */
	productivity_multiplier: {
		type: mongoose.Schema.Types.Decimal128,
		default: () => mongoose.Types.Decimal128.fromString('1.0000'),
		get: (value) => value ? value.toString() : '1.0000'
	},
	
	/**
	 * Total Shifts Worked (lifetime)
	 * For statistics and achievements
	 */
	total_shifts_worked: {
		type: Number,
		default: 0,
		min: 0
	},
	
	/**
	 * Total Earnings from Work (lifetime, in EURO)
	 */
	total_work_earnings_euro: {
		type: mongoose.Schema.Types.Decimal128,
		default: () => mongoose.Types.Decimal128.fromString('0.0000'),
		get: (value) => value ? value.toString() : '0.0000'
	},
	
	// =========================================================================
	// REFERRAL/MASTER SYSTEM (Module 2.2.B - Player-Owned Accounts)
	// =========================================================================
	
	/**
	 * Master/Owner (reference to User)
	 * If set, this player is "owned" by another player
	 * 
	 * Purpose: Referral system / Slave system
	 * - Master receives 10% of worker's taxes
	 * - Creates economic hierarchies
	 * - Encourages recruitment
	 * 
	 * null = Free player (no master)
	 */
	master_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		default: null,
		index: true
	},
	
	/**
	 * When player was assigned to master
	 */
	master_assigned_at: {
		type: Date,
		default: null
	},
	
	/**
	 * Total referral earnings (if this player is a master)
	 * How much they've earned from their "slaves"
	 */
	total_referral_earnings_euro: {
		type: mongoose.Schema.Types.Decimal128,
		default: () => mongoose.Types.Decimal128.fromString('0.0000'),
		get: (value) => value ? value.toString() : '0.0000'
	},
	
	// =========================================================================
	// CONSUMPTION SYSTEM (Module 2.3.C - Metabolism)
	// =========================================================================
	
	/**
	 * Consumption Cooldown
	 * When player can consume items again
	 * Prevents spam consumption
	 */
	consumption_cooldown_until: {
		type: Date,
		default: null,
		index: true
	},
	
	// Statistics
	total_transactions: { type: Number, default: 0 },
	total_volume_euro: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0000') },
	
	// Timestamps
	last_transaction_at: { type: Date, default: null },
	economy_joined_at: { type: Date, default: Date.now }
}, {
	timestamps: true
});

// Indexes for authentication
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

// Indexes for life simulation (performance critical for entropy tick)
userSchema.index({ is_frozen_for_fraud: 1, vacation_mode: 1, energy: 1, happiness: 1 }); // Compound index for entropy query
userSchema.index({ last_decay_processed: 1 }); // For duplicate prevention
userSchema.index({ 'status_effects.dead': 1, isActive: 1 }); // For death detection

// Indexes for work system (Module 2.2.B)
userSchema.index({ employer_id: 1 }); // Find employees of a company
userSchema.index({ last_work_at: 1 }); // For cooldown checks
userSchema.index({ master_id: 1 }); // Find slaves of a master

const User = mongoose.model('User', userSchema);

// Treasury Model (Singleton)
const treasurySchema = new mongoose.Schema({
	collected_transfer_tax_euro: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0000') },
	collected_market_tax_euro: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0000') },
	collected_work_tax_euro: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0000') },
	total_collected: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0000') },
	singleton: { type: Boolean, default: true, unique: true }
}, {
	timestamps: true
});

const Treasury = mongoose.model('Treasury', treasurySchema);

// Ledger Model (Blockchain Audit Trail)
const ledgerSchema = new mongoose.Schema({
	transaction_type: { type: String, required: true, enum: ['TRANSFER', 'WORK', 'MARKET', 'ADMIN_GRANT', 'ADMIN_DEDUCT', 'TAX_COLLECTION'] },
	sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	currency: { type: String, required: true, enum: ['EURO', 'GOLD', 'RON'] },
	amount_gross: { type: mongoose.Schema.Types.Decimal128, required: true },
	amount_tax: { type: mongoose.Schema.Types.Decimal128, required: true },
	amount_net: { type: mongoose.Schema.Types.Decimal128, required: true },
	tax_rate: { type: mongoose.Schema.Types.Decimal128, required: true },
	sender_balance_before: { type: mongoose.Schema.Types.Decimal128, required: true },
	sender_balance_after: { type: mongoose.Schema.Types.Decimal128, required: true },
	receiver_balance_before: { type: mongoose.Schema.Types.Decimal128, required: true },
	receiver_balance_after: { type: mongoose.Schema.Types.Decimal128, required: true },
	description: { type: String, default: '' },
	previous_hash: { type: String, default: '0' },
	current_hash: { type: String, required: true },
	block_number: { type: Number, required: true },
	verified: { type: Boolean, default: true }
}, {
	timestamps: true
});

ledgerSchema.index({ sender: 1, createdAt: -1 });
ledgerSchema.index({ receiver: 1, createdAt: -1 });
ledgerSchema.index({ current_hash: 1 });
ledgerSchema.index({ block_number: 1 });

// Static method: Get user transaction history
ledgerSchema.statics.getUserHistory = async function(userId, limit = 50) {
	return await this.find({
		$or: [
			{ sender: userId },
			{ receiver: userId }
		]
	})
	.sort({ createdAt: -1 })
	.limit(limit)
	.populate('sender', 'username')
	.populate('receiver', 'username')
	.lean();
};

const Ledger = mongoose.model('Ledger', ledgerSchema);

// ============================================================================
// SYSTEM STATE MODEL - SINGLETON FOR GAME STATE
// ============================================================================

/**
 * SystemState - The Global Memory of the Game
 * 
 * This is a SINGLETON collection with ONE document that stores critical
 * game-wide state information. Used primarily for:
 * 
 * 1. Distributed Lock Mechanism (prevents duplicate hourly ticks)
 * 2. Game Universe Clock (tracks last tick timestamp)
 * 3. Global Statistics (active players, economy health)
 * 4. Version Control (for graceful updates)
 * 
 * CRITICAL: Only ONE document should exist with key='UNIVERSE_CLOCK'
 * 
 * @version 1.0.0 - Module 2.1.A: The Timekeeper
 * @date 2026-02-12
 */
const systemStateSchema = new mongoose.Schema({
	// Primary Key (Unique, only one document with this key)
	key: {
		type: String,
		required: true,
		unique: true,
		index: true,
		default: 'UNIVERSE_CLOCK',
		immutable: true  // Cannot be changed after creation
	},
	
	// =========================================================================
	// TEMPORAL STATE (The Timekeeper)
	// =========================================================================
	
	/**
	 * Timestamp (Unix Epoch) of the last SUCCESSFULLY completed hourly tick
	 * Used to determine if a new tick should run
	 */
	last_tick_epoch: {
		type: Number,
		required: true,
		default: () => Date.now()
	},
	
	/**
	 * Distributed Mutex Flag
	 * When true, an hourly tick is currently processing
	 * Prevents multiple server instances from running the same tick
	 */
	is_processing: {
		type: Boolean,
		default: false,
		index: true  // Indexed for fast queries
	},
	
	/**
	 * Lock Timestamp
	 * When the current processing started
	 * Used for zombie process detection (if lock is held >5 min, assume crash)
	 */
	lock_timestamp: {
		type: Date,
		default: null
	},
	
	/**
	 * Lock Holder Identifier
	 * Which server instance holds the lock (hostname + PID)
	 * Useful for debugging and monitoring
	 */
	lock_holder: {
		type: String,
		default: null
	},
	
	// =========================================================================
	// GAME METADATA
	// =========================================================================
	
	/**
	 * Game Version
	 * Semantic versioning for compatibility checks
	 */
	game_version: {
		type: String,
		default: 'Alpha 0.2.0'
	},
	
	/**
	 * Total Hourly Ticks Processed
	 * Incremented after each successful tick
	 */
	total_ticks_processed: {
		type: Number,
		default: 0
	},
	
	/**
	 * Last Tick Duration (milliseconds)
	 * Performance monitoring
	 */
	last_tick_duration_ms: {
		type: Number,
		default: 0
	},
	
	// =========================================================================
	// GLOBAL STATISTICS (Snapshot at Last Tick)
	// =========================================================================
	
	/**
	 * Global Stats Object
	 * Stores quick-access statistics from the last tick
	 */
	global_stats: {
		active_users_count: { type: Number, default: 0 },
		total_economy_euro: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0000') },
		total_economy_gold: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0000') },
		total_economy_ron: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0000') },
		transactions_last_hour: { type: Number, default: 0 },
		average_balance_euro: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0000') }
	},
	
	// =========================================================================
	// HEALTH & MONITORING
	// =========================================================================
	
	/**
	 * Failed Tick Attempts
	 * Counter for consecutive failures (for alerting)
	 */
	consecutive_failures: {
		type: Number,
		default: 0
	},
	
	/**
	 * Last Error Message
	 * Stores the last error for debugging
	 */
	last_error: {
		message: { type: String, default: null },
		timestamp: { type: Date, default: null },
		stack: { type: String, default: null }
	}
}, {
	timestamps: true  // Adds createdAt and updatedAt
});

// Indexes for performance
systemStateSchema.index({ key: 1, is_processing: 1 });

// Static method: Get or create the singleton
systemStateSchema.statics.getSingleton = async function() {
	let state = await this.findOne({ key: 'UNIVERSE_CLOCK' });
	
	if (!state) {
		console.log('[SystemState] Singleton not found, creating...');
		state = await this.create({
			key: 'UNIVERSE_CLOCK',
			last_tick_epoch: Date.now(),
			game_version: 'Alpha 0.2.0'
		});
		console.log('[SystemState] ✅ Singleton created');
	}
	
	return state;
};

const SystemState = mongoose.model('SystemState', systemStateSchema);

// ============================================================================
// SYSTEM LOG MODEL - AUDIT TRAIL FOR GAME OPERATIONS
// ============================================================================

/**
 * SystemLog - Comprehensive Audit Trail
 * 
 * Records all major game operations for monitoring, debugging, and analytics.
 * Each tick creates log entries for entropy, income, events, etc.
 * 
 * CRITICAL: High-volume collection (1 log per operation per tick)
 * Use TTL index to auto-delete old logs (keep last 30 days)
 * 
 * @version 1.0.0 - Module 2.1.B: Entropia Universală
 * @date 2026-02-12
 */
const systemLogSchema = new mongoose.Schema({
	/**
	 * Log Type
	 * Categorizes the operation type
	 */
	type: {
		type: String,
		required: true,
		enum: [
			'HOURLY_ENTROPY',      // Energy/Happiness decay
			'PASSIVE_INCOME',      // Work salary, investments
			'MAINTENANCE_COSTS',   // Housing, utilities
			'RANDOM_EVENT',        // Weather, market changes
			'DEATH_PROCESSING',    // Player death handling
			'RESURRECTION',        // Player revival
			'VACATION_START',      // Vacation mode enabled
			'VACATION_END',        // Vacation mode disabled
			'ADMIN_INTERVENTION',  // Manual admin action
			'SYSTEM_ERROR'         // Error during processing
		],
		index: true
	},
	
	/**
	 * Tick Reference
	 * Which hourly tick this log belongs to
	 */
	tick_number: {
		type: Number,
		required: true,
		index: true
	},
	
	/**
	 * Tick Timestamp
	 * When the tick was processed
	 */
	tick_timestamp: {
		type: Date,
		required: true,
		index: true
	},
	
	/**
	 * Users Affected
	 * How many users were modified by this operation
	 */
	users_affected: {
		type: Number,
		default: 0
	},
	
	/**
	 * Execution Time (milliseconds)
	 * Performance monitoring
	 */
	execution_time_ms: {
		type: Number,
		required: true
	},
	
	/**
	 * Status
	 * Success or failure
	 */
	status: {
		type: String,
		required: true,
		enum: ['SUCCESS', 'PARTIAL_SUCCESS', 'FAILURE'],
		default: 'SUCCESS'
	},
	
	/**
	 * Details
	 * Operation-specific data
	 */
	details: {
		energy_decay_applied: { type: Number, default: 0 },
		happiness_decay_applied: { type: Number, default: 0 },
		users_exhausted: { type: Number, default: 0 },
		users_depressed: { type: Number, default: 0 },
		users_died: { type: Number, default: 0 },
		users_skipped_vacation: { type: Number, default: 0 },
		users_skipped_frozen: { type: Number, default: 0 },
		total_income_distributed: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0000') },
		total_costs_deducted: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0000') }
	},
	
	/**
	 * Error Message
	 * If status is FAILURE
	 */
	error_message: {
		type: String,
		default: null
	},
	
	/**
	 * Error Stack
	 * For debugging
	 */
	error_stack: {
		type: String,
		default: null
	}
}, {
	timestamps: true
});

// Indexes for performance
systemLogSchema.index({ type: 1, tick_timestamp: -1 });
systemLogSchema.index({ status: 1, tick_timestamp: -1 });

// TTL Index: Auto-delete logs older than 30 days
systemLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const SystemLog = mongoose.model('SystemLog', systemLogSchema);

// ============================================================================
// COMPANY MODEL (Module 2.2.B - Corporate Infrastructure)
// ============================================================================

const Company = require('./models/Company');

// Module 2.3 - Marketplace & Metabolism Models
const ItemPrototype = require('./models/ItemPrototype');
const Inventory = require('./models/Inventory');
const MarketplaceListing = require('./models/MarketplaceListing');
const ConsumptionHistory = require('./models/ConsumptionHistory');

// Export models to be used by services
global.User = User;
global.Treasury = Treasury;
global.Ledger = Ledger;
global.SystemState = SystemState;
global.SystemLog = SystemLog;
global.Company = Company; // Module 2.2.B - Corporate Infrastructure

// Module 2.3 - Marketplace & Metabolism
global.ItemPrototype = ItemPrototype;
global.Inventory = Inventory;
global.MarketplaceListing = MarketplaceListing;
global.ConsumptionHistory = ConsumptionHistory;

// Import routes
const economyRoutes = require('./routes/economy');

// Import GameClock (The Timekeeper)
const GameClock = require('./services/GameClock');

// Import Genesis (Founder Companies)
const { initializeGenesis } = require('./init/createFounderCompanies');

// Routes
app.use('/', economyRoutes);

// Health check
app.get('/health', (req, res) => {
	res.json({ 
		status: 'ok', 
		service: 'economy-server',
		timestamp: new Date().toISOString(),
		database: process.env.DB_URI || 'mongodb://mongo:27017/auth_db'
	});
});

// ADMIN ENDPOINT: Manual tick trigger (for testing)
// TODO: Add admin authentication before production use!
app.post('/admin/trigger-tick', async (req, res) => {
	try {
		console.log('[ADMIN] 🔧 Manual tick trigger requested');
		
		// Trigger the tick manually
		await GameClock.onCronTrigger();
		
		// Get updated SystemState
		const state = await global.SystemState.findOne({ key: 'UNIVERSE_CLOCK' });
		
		res.json({
			success: true,
			message: 'Tick triggered manually',
			systemState: {
				last_tick: new Date(state.last_tick_epoch).toISOString(),
				total_ticks: state.total_ticks_processed,
				last_duration: state.last_tick_duration_ms,
				global_stats: state.global_stats
			}
		});
		
	} catch (error) {
		console.error('[ADMIN] ❌ Manual tick failed:', error);
		res.status(500).json({
			success: false,
			error: 'Manual tick failed',
			message: error.message
		});
	}
});

// ADMIN ENDPOINT: Get SystemState
app.get('/admin/system-state', async (req, res) => {
	try {
		const state = await global.SystemState.findOne({ key: 'UNIVERSE_CLOCK' });
		
		if (!state) {
			return res.status(404).json({
				success: false,
				error: 'SystemState not found'
			});
		}
		
		res.json({
			success: true,
			data: {
				key: state.key,
				last_tick: new Date(state.last_tick_epoch).toISOString(),
				last_tick_epoch: state.last_tick_epoch,
				is_processing: state.is_processing,
				lock_timestamp: state.lock_timestamp,
				lock_holder: state.lock_holder,
				game_version: state.game_version,
				total_ticks_processed: state.total_ticks_processed,
				last_tick_duration_ms: state.last_tick_duration_ms,
				global_stats: state.global_stats,
				consecutive_failures: state.consecutive_failures,
				last_error: state.last_error,
				createdAt: state.createdAt,
				updatedAt: state.updatedAt
			}
		});
		
	} catch (error) {
		console.error('[ADMIN] ❌ Get SystemState failed:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to retrieve SystemState',
			message: error.message
		});
	}
});

// Graceful shutdown handler
process.on('SIGTERM', async () => {
	console.log('[Server] 🛑 SIGTERM received, shutting down gracefully...');
	await GameClock.shutdown();
	process.exit(0);
});

process.on('SIGINT', async () => {
	console.log('[Server] 🛑 SIGINT received, shutting down gracefully...');
	await GameClock.shutdown();
	process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
	await connectDB();
	console.log(`Economy Server listening on 0.0.0.0:${PORT}`);
	console.log('✅ Economy Microservice Ready!');
	
	// Initialize Genesis (Founder Companies - Module 2.2.B)
	try {
		await initializeGenesis();
		console.log('[Server] 🏢 Genesis Protocol complete');
	} catch (error) {
		console.error('[Server] ⚠️  Genesis failed (non-fatal):', error);
		// Don't exit - server can still run, admin can create companies manually
	}
	
	// Initialize The Timekeeper (Module 2.1.A)
	try {
		await GameClock.initialize();
		console.log('[Server] 🕐 The Timekeeper is now active');
	} catch (error) {
		console.error('[Server] ❌ Failed to initialize GameClock:', error);
		// Don't exit - server can still handle API requests
	}
});
