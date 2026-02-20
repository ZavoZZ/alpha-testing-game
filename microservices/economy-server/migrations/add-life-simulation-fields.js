/**
 * =============================================================================
 * MIGRATION: Add Life Simulation Fields to Existing Users
 * =============================================================================
 * 
 * This migration adds the new life simulation fields (energy, happiness, health)
 * to all existing users in the database.
 * 
 * SAFE TO RUN MULTIPLE TIMES (idempotent)
 * 
 * Module: 2.1.B - Entropia Universală
 * Date: 2026-02-12
 * 
 * @version 1.0.0
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Database URI
const DB_URI = process.env.DB_URI || 'mongodb://mongo:27017/auth_db';

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  MIGRATION: Add Life Simulation Fields                         ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');

async function migrate() {
	try {
		// Connect to database
		console.log(`[1/6] Connecting to database: ${DB_URI}`);
		await mongoose.connect(DB_URI);
		console.log('✅ Connected');
		console.log('');
		
		// Get User model
		const User = mongoose.connection.collection('users');
		
		// Count existing users
		console.log('[2/6] Counting existing users...');
		const totalUsers = await User.countDocuments();
		console.log(`✅ Found ${totalUsers} users`);
		console.log('');
		
		// Count users missing life simulation fields
		console.log('[3/6] Checking which users need migration...');
		const usersMissingFields = await User.countDocuments({
			$or: [
				{ energy: { $exists: false } },
				{ happiness: { $exists: false } },
				{ health: { $exists: false } }
			]
		});
		console.log(`✅ ${usersMissingFields} users need migration`);
		console.log('');
		
		if (usersMissingFields === 0) {
			console.log('🎉 All users already have life simulation fields!');
			console.log('   No migration needed.');
			return;
		}
		
		// Perform migration
		console.log('[4/6] Migrating users (adding life simulation fields)...');
		console.log('');
		console.log('   Default values:');
		console.log('   - energy: 100');
		console.log('   - happiness: 100');
		console.log('   - health: 100');
		console.log('   - vacation_mode: false');
		console.log('   - status_effects: all false');
		console.log('   - consecutive counters: 0');
		console.log('');
		
		const result = await User.updateMany(
			{
				$or: [
					{ energy: { $exists: false } },
					{ happiness: { $exists: false } },
					{ health: { $exists: false } }
				]
			},
			{
				$set: {
					energy: 100,
					happiness: 100,
					health: 100,
					vacation_mode: false,
					vacation_started_at: null,
					status_effects: {
						exhausted: false,
						depressed: false,
						starving: false,
						homeless: false,
						sick: false,
						dying: false,
						dead: false
					},
					last_decay_processed: null,
					consecutive_zero_energy_hours: 0,
					consecutive_zero_happiness_hours: 0
				}
			}
		);
		
		console.log(`✅ Migration complete!`);
		console.log(`   Modified: ${result.modifiedCount} users`);
		console.log(`   Matched: ${result.matchedCount} users`);
		console.log('');
		
		// Verify migration
		console.log('[5/6] Verifying migration...');
		const stillMissing = await User.countDocuments({
			$or: [
				{ energy: { $exists: false } },
				{ happiness: { $exists: false } },
				{ health: { $exists: false } }
			]
		});
		
		if (stillMissing === 0) {
			console.log('✅ Verification passed: All users have life simulation fields');
		} else {
			console.log(`⚠️  Warning: ${stillMissing} users still missing fields`);
		}
		console.log('');
		
		// Sample verification
		console.log('[6/6] Sample verification (first user):');
		const sampleUser = await User.findOne({});
		if (sampleUser) {
			console.log('   User:', sampleUser.username || sampleUser.email);
			console.log('   Energy:', sampleUser.energy);
			console.log('   Happiness:', sampleUser.happiness);
			console.log('   Health:', sampleUser.health);
			console.log('   Vacation Mode:', sampleUser.vacation_mode);
			console.log('   Status Effects:', sampleUser.status_effects);
		}
		console.log('');
		
		console.log('╔════════════════════════════════════════════════════════════════╗');
		console.log('║  ✅ MIGRATION COMPLETE                                          ║');
		console.log('╚════════════════════════════════════════════════════════════════╝');
		
	} catch (error) {
		console.error('');
		console.error('╔════════════════════════════════════════════════════════════════╗');
		console.error('║  ❌ MIGRATION FAILED                                            ║');
		console.error('╚════════════════════════════════════════════════════════════════╝');
		console.error('');
		console.error('Error:', error.message);
		console.error('Stack:', error.stack);
		process.exit(1);
	} finally {
		await mongoose.disconnect();
		console.log('');
		console.log('Database connection closed.');
		process.exit(0);
	}
}

// Run migration
migrate();
