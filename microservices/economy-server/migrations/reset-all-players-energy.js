/**
 * ============================================================================
 * RESET ALL PLAYERS ENERGY - MODULE 2.3 DEPLOYMENT
 * ============================================================================
 * 
 * Resets energy, happiness, and health for all players to 100.
 * Run this after Module 2.3 deployment to give everyone a fresh start.
 * 
 * @version 1.0.0
 * @date 2026-02-15
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function resetAllPlayersEnergy() {
	console.log('🔄 Resetting all players energy, happiness, and health...');
	console.log('');
	
	try {
		// Connect to database
		await mongoose.connect(process.env.MONGODB_URI || process.env.DB_URI || 'mongodb://mongodb:27017/game_db?replicaSet=rs0');
		console.log('✅ Connected to database');
		
		// Get User model
		const User = mongoose.model('User');
		
		// Count users before
		const totalUsers = await User.countDocuments();
		console.log(`📊 Found ${totalUsers} users`);
		
		// Reset all users
		const result = await User.updateMany(
			{},  // All users
			{
				$set: {
					energy: 100,
					happiness: 100,
					health: 100,
					// Also reset cooldowns to allow immediate work
					work_cooldown_until: null,
					consumption_cooldown_until: null
				}
			}
		);
		
		console.log('');
		console.log('✅ Reset complete!');
		console.log(`   - Users updated: ${result.modifiedCount}`);
		console.log(`   - Energy: 100/100`);
		console.log(`   - Happiness: 100/100`);
		console.log(`   - Health: 100/100`);
		console.log(`   - Work cooldown: Cleared`);
		console.log(`   - Consumption cooldown: Cleared`);
		console.log('');
		console.log('🎮 All players can now work and consume items!');
		
	} catch (error) {
		console.error('❌ Error:', error.message);
		process.exit(1);
	} finally {
		await mongoose.disconnect();
		console.log('');
		console.log('✅ Disconnected from database');
	}
}

// Run if called directly
if (require.main === module) {
	resetAllPlayersEnergy()
		.then(() => process.exit(0))
		.catch(error => {
			console.error('Fatal error:', error);
			process.exit(1);
		});
}

module.exports = resetAllPlayersEnergy;
