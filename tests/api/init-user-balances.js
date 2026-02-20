/**
 * =============================================================================
 * INITIALIZE USER BALANCES - ONE-TIME MIGRATION
 * =============================================================================
 * 
 * This script adds default economy balance fields to existing users who
 * were created before the Economy System was implemented.
 * 
 * WHAT IT DOES:
 * - Finds all users WITHOUT balance fields
 * - Adds default balances (0 for each currency)
 * - Preserves existing data
 * 
 * SAFE TO RUN MULTIPLE TIMES (idempotent)
 * 
 * @version 1.0.0
 * @date 2026-02-11
 */

const mongoose = require('mongoose');

// Connect to MongoDB - CRITICAL: Use auth_db where users are stored
const MONGO_URI = process.env.DB_URI || 'mongodb://mongo:27017/auth_db';

async function initUserBalances() {
	try {
		console.log('╔════════════════════════════════════════════════════════════════╗');
		console.log('║  INITIALIZING USER BALANCES                                    ║');
		console.log('╚════════════════════════════════════════════════════════════════╝');
		console.log('');
		console.log('Connecting to MongoDB...');
		console.log('Database:', MONGO_URI);
		
		await mongoose.connect(MONGO_URI);
		
		console.log('✅ Connected to MongoDB');
		console.log('');
		
		// Get users collection directly
		const db = mongoose.connection.db;
		const usersCollection = db.collection('users');
		
		// Find users without balance_euro field (meaning they don't have economy fields)
		const usersWithoutBalances = await usersCollection.find({
			balance_euro: { $exists: false }
		}).toArray();
		
		console.log(`Found ${usersWithoutBalances.length} users without balance fields`);
		
		if (usersWithoutBalances.length === 0) {
			console.log('');
			console.log('✅ All users already have balance fields. Nothing to do.');
			await mongoose.connection.close();
			return;
		}
		
		console.log('');
		console.log('Initializing balances for these users:');
		usersWithoutBalances.forEach(user => {
			console.log(`  - ${user.username} (${user.email})`);
		});
		
		console.log('');
		console.log('Updating users...');
		
		// Update all users without balances
		const result = await usersCollection.updateMany(
			{ balance_euro: { $exists: false } },
			{
				$set: {
					// Financial Balances (Decimal128)
					balance_euro: mongoose.Types.Decimal128.fromString('0.0000'),
					balance_gold: mongoose.Types.Decimal128.fromString('0.0000'),
					balance_ron: mongoose.Types.Decimal128.fromString('0.0000'),
					
					// Tax Reserve Balances (Decimal128)
					collected_transfer_tax_euro: mongoose.Types.Decimal128.fromString('0.0000'),
					collected_market_tax_euro: mongoose.Types.Decimal128.fromString('0.0000'),
					collected_work_tax_euro: mongoose.Types.Decimal128.fromString('0.0000'),
					
					// Security & Gameplay
					is_frozen_for_fraud: false,
					productivity_multiplier: mongoose.Types.Decimal128.fromString('1.0000'),
					
					// Statistics
					total_transactions: 0,
					total_volume_euro: mongoose.Types.Decimal128.fromString('0.0000'),
					
					// Timestamps
					last_transaction_at: null,
					economy_joined_at: new Date()
				}
			}
		);
		
		console.log(`✅ Updated ${result.modifiedCount} users`);
		console.log('');
		
		// Verify update
		const verifyUser = await usersCollection.findOne({ username: usersWithoutBalances[0].username });
		console.log('Verification - First updated user:');
		console.log(`  Username: ${verifyUser.username}`);
		console.log(`  EURO Balance: ${verifyUser.balance_euro}`);
		console.log(`  GOLD Balance: ${verifyUser.balance_gold}`);
		console.log(`  RON Balance: ${verifyUser.balance_ron}`);
		console.log('');
		
		console.log('🎉 Balance initialization complete!');
		console.log('');
		
		await mongoose.connection.close();
		console.log('✅ MongoDB connection closed');
		
	} catch (error) {
		console.error('❌ ERROR during balance initialization:');
		console.error(error);
		process.exit(1);
	}
}

// Run migration
initUserBalances();
