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
	
	// Statistics
	total_transactions: { type: Number, default: 0 },
	total_volume_euro: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0000') },
	
	// Timestamps
	last_transaction_at: { type: Date, default: null },
	economy_joined_at: { type: Date, default: Date.now }
}, {
	timestamps: true
});

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

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

// Export models to be used by services
global.User = User;
global.Treasury = Treasury;
global.Ledger = Ledger;

// Import routes
const economyRoutes = require('./routes/economy');

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

// Start server
app.listen(PORT, '0.0.0.0', async () => {
	await connectDB();
	console.log(`Economy Server listening on 0.0.0.0:${PORT}`);
	console.log('✅ Economy Microservice Ready!');
});
