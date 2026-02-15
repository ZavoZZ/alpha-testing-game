/**
 * ============================================================================
 * MIGRATION: Add Work Rewards to Existing Companies
 * ============================================================================
 * 
 * This migration adds work_rewards field to existing companies.
 * 
 * Module: 2.3 - Item System Integration
 * 
 * PURPOSE:
 * - Update State Food Company with BREAD_Q1 reward
 * - Update State News Company with NEWSPAPER_Q1 reward
 * - Update State Construction Company with BREAD_Q1 + COFFEE_Q1 rewards
 * 
 * USAGE:
 * node microservices/economy-server/migrations/add-work-rewards.js
 * 
 * @version 1.0.0
 * @date 2026-02-14
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function addWorkRewards() {
	try {
		console.log('[MIGRATION] 🔄 Starting work rewards migration...');
		
		// Connect to MongoDB
		const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-game';
		await mongoose.connect(mongoUri);
		console.log('[MIGRATION] ✅ Connected to MongoDB');
		
		// Get Company model
		const Company = mongoose.model('Company');
		
		// ====================================================================
		// Update State Food Company
		// ====================================================================
		
		console.log('[MIGRATION] 🍞 Updating State Food Company...');
		
		const foodCompany = await Company.findOneAndUpdate(
			{ name: 'State Food Company' },
			{ 
				$set: { 
					work_rewards: [
						{ item_code: 'BREAD_Q1', quantity: '1.0000' }
					] 
				} 
			},
			{ new: true }
		);
		
		if (foodCompany) {
			console.log('[MIGRATION] ✅ State Food Company updated');
			console.log(`[MIGRATION]    Rewards: ${JSON.stringify(foodCompany.work_rewards)}`);
		} else {
			console.log('[MIGRATION] ⚠️  State Food Company not found (may not exist yet)');
		}
		
		// ====================================================================
		// Update State News Company
		// ====================================================================
		
		console.log('[MIGRATION] 📰 Updating State News Company...');
		
		const newsCompany = await Company.findOneAndUpdate(
			{ name: 'State News Company' },
			{ 
				$set: { 
					work_rewards: [
						{ item_code: 'NEWSPAPER_Q1', quantity: '1.0000' }
					] 
				} 
			},
			{ new: true }
		);
		
		if (newsCompany) {
			console.log('[MIGRATION] ✅ State News Company updated');
			console.log(`[MIGRATION]    Rewards: ${JSON.stringify(newsCompany.work_rewards)}`);
		} else {
			console.log('[MIGRATION] ⚠️  State News Company not found (may not exist yet)');
		}
		
		// ====================================================================
		// Update State Construction Company
		// ====================================================================
		
		console.log('[MIGRATION] 🏗️  Updating State Construction Company...');
		
		const constructionCompany = await Company.findOneAndUpdate(
			{ name: 'State Construction Company' },
			{ 
				$set: { 
					work_rewards: [
						{ item_code: 'BREAD_Q1', quantity: '0.5000' },
						{ item_code: 'COFFEE_Q1', quantity: '0.5000' }
					] 
				} 
			},
			{ new: true }
		);
		
		if (constructionCompany) {
			console.log('[MIGRATION] ✅ State Construction Company updated');
			console.log(`[MIGRATION]    Rewards: ${JSON.stringify(constructionCompany.work_rewards)}`);
		} else {
			console.log('[MIGRATION] ⚠️  State Construction Company not found (may not exist yet)');
		}
		
		// ====================================================================
		// Summary
		// ====================================================================
		
		console.log('[MIGRATION] 🎉 Migration complete!');
		console.log('[MIGRATION] Summary:');
		console.log(`[MIGRATION]    - State Food Company: ${foodCompany ? '✅ Updated' : '⚠️  Not found'}`);
		console.log(`[MIGRATION]    - State News Company: ${newsCompany ? '✅ Updated' : '⚠️  Not found'}`);
		console.log(`[MIGRATION]    - State Construction Company: ${constructionCompany ? '✅ Updated' : '⚠️  Not found'}`);
		
		await mongoose.disconnect();
		console.log('[MIGRATION] ✅ Disconnected from MongoDB');
		
	} catch (error) {
		console.error('[MIGRATION] ❌ Migration failed:', error);
		console.error('[MIGRATION] Stack trace:', error.stack);
		process.exit(1);
	}
}

// Run migration
addWorkRewards()
	.then(() => {
		console.log('[MIGRATION] ✅ All done!');
		process.exit(0);
	})
	.catch((error) => {
		console.error('[MIGRATION] ❌ Fatal error:', error);
		process.exit(1);
	});
