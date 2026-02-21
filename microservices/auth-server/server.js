require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// Decimal converter middleware - converts MongoDB Decimal128 to numbers
const {
	decimalConverterMiddleware,
} = require('../../server/middleware/decimal-converter');

const app = express();
const PORT = process.env.PORT || 3200;

// Middleware
app.use(
	cors({
		origin: process.env.WEB_ORIGIN || '*',
		credentials: true,
	}),
);
app.use(express.json());
app.use(cookieParser());

// Apply decimal converter to all API responses
app.use(decimalConverterMiddleware);

// Database connection
const connectDB = async () => {
	try {
		const uri =
			process.env.DB_URI || 'mongodb://mongodb:27017/game_db?replicaSet=rs0';
		await mongoose.connect(uri);
		console.log('MongoDB connected successfully');
	} catch (err) {
		console.error('MongoDB connection failed:', err.message);
		process.exit(1);
	}
};

// User Model (SYNCHRONIZED with main app - includes Economy fields!)
const userSchema = new mongoose.Schema(
	{
		// =====================================================================
		// AUTHENTICATION & IDENTITY
		// =====================================================================
		username: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			minlength: 3,
			maxlength: 50,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
		},
		role: {
			type: String,
			enum: ['user', 'moderator', 'admin'],
			default: 'user',
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		isBanned: {
			type: Boolean,
			default: false,
		},
		lastLogin: {
			type: Date,
			default: null,
		},

		// =====================================================================
		// ECONOMY BALANCES (Decimal128 for precision)
		// =====================================================================
		balance_euro: {
			type: mongoose.Schema.Types.Decimal128,
			default: () => mongoose.Types.Decimal128.fromString('0.0000'),
		},
		balance_gold: {
			type: mongoose.Schema.Types.Decimal128,
			default: () => mongoose.Types.Decimal128.fromString('0.0000'),
		},
		balance_ron: {
			type: mongoose.Schema.Types.Decimal128,
			default: () => mongoose.Types.Decimal128.fromString('0.0000'),
		},

		// =====================================================================
		// TAX RESERVE BALANCES (for admin/system users)
		// =====================================================================
		collected_transfer_tax_euro: {
			type: mongoose.Schema.Types.Decimal128,
			default: () => mongoose.Types.Decimal128.fromString('0.0000'),
		},
		collected_market_tax_euro: {
			type: mongoose.Schema.Types.Decimal128,
			default: () => mongoose.Types.Decimal128.fromString('0.0000'),
		},
		collected_work_tax_euro: {
			type: mongoose.Schema.Types.Decimal128,
			default: () => mongoose.Types.Decimal128.fromString('0.0000'),
		},

		// =====================================================================
		// SECURITY & GAMEPLAY
		// =====================================================================
		is_frozen_for_fraud: {
			type: Boolean,
			default: false,
		},
		productivity_multiplier: {
			type: mongoose.Schema.Types.Decimal128,
			default: () => mongoose.Types.Decimal128.fromString('1.0000'),
		},

		// =====================================================================
		// STATISTICS
		// =====================================================================
		total_transactions: {
			type: Number,
			default: 0,
		},
		total_volume_euro: {
			type: mongoose.Schema.Types.Decimal128,
			default: () => mongoose.Types.Decimal128.fromString('0.0000'),
		},

		// =====================================================================
		// TIMESTAMPS
		// =====================================================================
		last_transaction_at: {
			type: Date,
			default: null,
		},
		economy_joined_at: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	},
);

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

const User = mongoose.model('User', userSchema);

// Import routes
const authRoutes = require('./routes/auth');

// Routes
app.use('/auth', authRoutes(User));

// Health check
app.get('/health', (req, res) => {
	res.json({
		status: 'ok',
		service: 'auth-server',
		timestamp: new Date().toISOString(),
	});
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
	await connectDB();
	console.log(`Auth Server listening on 0.0.0.0:${PORT}`);
	console.log(
		`Database: ${process.env.DB_URI || 'mongodb://mongodb:27017/game_db?replicaSet=rs0'}`,
	);
});
