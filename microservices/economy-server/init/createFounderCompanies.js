/**
 * ============================================================================
 * GENESIS SCRIPT - FOUNDER COMPANIES
 * ============================================================================
 * 
 * Creates the first companies at server launch.
 * These are the economic foundation of the game world.
 * 
 * Module: 2.2.B - Corporate Infrastructure
 * Module: 2.3 - Item System Integration
 * 
 * PURPOSE:
 * - Ensure there's always a default employer for unemployed players
 * - Seed the economy with initial capital
 * - Create admin-owned companies for game operations
 * - Provide work rewards (items) to workers
 * 
 * RUNS:
 * - Once at server startup
 * - Idempotent (safe to run multiple times)
 * 
 * @version 2.0.0
 * @date 2026-02-14
 */

const Company = global.Company;
const User = global.User;

/**
 * Create founder companies
 * 
 * This function:
 * 1. Finds the first admin user
 * 2. Creates three government companies:
 *    - State Food Company (produces bread)
 *    - State News Company (produces newspapers)
 *    - State Construction Company (general work)
 * 3. Injects initial capital
 * 4. Sets work rewards (items given to workers)
 * 
 * IDEMPOTENT: Safe to run multiple times (checks if exists first)
 */
async function createFounderCompanies() {
	try {
		console.log('[GENESIS] 🏢 Checking founder companies...');
		
		// ====================================================================
		// STEP 1: Find first admin user
		// ====================================================================
		
		const adminUser = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
		
		if (!adminUser) {
			console.error('[GENESIS] ❌ No admin user found! Cannot create founder companies.');
			console.error('[GENESIS] 💡 Please create an admin user first.');
			return;
		}
		
		console.log(`[GENESIS] 👤 Found admin: ${adminUser.username} (${adminUser._id})`);
		
		// ====================================================================
		// STEP 2: Create State Food Company
		// ====================================================================
		
		const existingFoodCompany = await Company.findOne({
			name: 'State Food Company',
			is_government: true
		});
		
		if (!existingFoodCompany) {
			console.log('[GENESIS] 🍞 Creating State Food Company...');
			
			const stateFoodCompany = new Company({
				name: 'State Food Company',
				owner_id: adminUser._id,
				type: 'GOVERNMENT',
				description: 'Government-owned food production company. Workers receive bread as bonus.',
				
				// Initial capital
				funds_euro: '10000.0000',  // €10,000 starting capital
				funds_gold: '0.0000',
				funds_ron: '0.0000',
				
				// Salary offer
				wage_offer: '10.0000',  // €10 per shift
				
				// Work rewards (Module 2.3)
				work_rewards: [
					{ item_code: 'BREAD_Q1', quantity: '1.0000' }
				],
				
				// No skill requirements
				min_skill_required: 0,
				
				// Company settings
				max_employees: 1000,
				level: 1,
				status: 'ACTIVE',
				is_government: true,
				is_hiring: true,
				
				// Empty inventory
				inventory: [],
				
				// Stats
				total_salaries_paid: '0.0000',
				total_shifts_completed: 0
			});
			
			await stateFoodCompany.save();
			
			console.log('[GENESIS] ✅ Created State Food Company');
			console.log(`[GENESIS]    Wage: €${stateFoodCompany.wage_offer}/shift`);
			console.log(`[GENESIS]    Rewards: 1x BREAD_Q1`);
		} else {
			console.log('[GENESIS] ✅ State Food Company already exists');
		}
		
		// ====================================================================
		// STEP 3: Create State News Company
		// ====================================================================
		
		const existingNewsCompany = await Company.findOne({
			name: 'State News Company',
			is_government: true
		});
		
		if (!existingNewsCompany) {
			console.log('[GENESIS] 📰 Creating State News Company...');
			
			const stateNewsCompany = new Company({
				name: 'State News Company',
				owner_id: adminUser._id,
				type: 'NEWSPAPER',
				description: 'Government-owned news company. Workers receive newspapers as bonus.',
				
				// Initial capital
				funds_euro: '10000.0000',  // €10,000 starting capital
				funds_gold: '0.0000',
				funds_ron: '0.0000',
				
				// Salary offer
				wage_offer: '12.0000',  // €12 per shift (journalists earn more)
				
				// Work rewards (Module 2.3)
				work_rewards: [
					{ item_code: 'NEWSPAPER_Q1', quantity: '1.0000' }
				],
				
				// Minimal skill requirements
				min_skill_required: 1,
				
				// Company settings
				max_employees: 500,
				level: 1,
				status: 'ACTIVE',
				is_government: true,
				is_hiring: true,
				
				// Empty inventory
				inventory: [],
				
				// Stats
				total_salaries_paid: '0.0000',
				total_shifts_completed: 0
			});
			
			await stateNewsCompany.save();
			
			console.log('[GENESIS] ✅ Created State News Company');
			console.log(`[GENESIS]    Wage: €${stateNewsCompany.wage_offer}/shift`);
			console.log(`[GENESIS]    Rewards: 1x NEWSPAPER_Q1`);
		} else {
			console.log('[GENESIS] ✅ State News Company already exists');
		}
		
		// ====================================================================
		// STEP 4: Create State Construction Company
		// ====================================================================
		
		const existingConstructionCompany = await Company.findOne({
			name: 'State Construction Company',
			is_government: true
		});
		
		if (!existingConstructionCompany) {
			console.log('[GENESIS] 🏗️  Creating State Construction Company...');
			
			const stateConstructionCompany = new Company({
				name: 'State Construction Company',
				owner_id: adminUser._id,
				type: 'CONSTRUCTION',
				description: 'Government-owned construction company. Workers receive food and coffee as bonus.',
				
				// Initial capital
				funds_euro: '10000.0000',  // €10,000 starting capital
				funds_gold: '0.0000',
				funds_ron: '0.0000',
				
				// Salary offer
				wage_offer: '15.0000',  // €15 per shift (construction pays well)
				
				// Work rewards (Module 2.3)
				work_rewards: [
					{ item_code: 'BREAD_Q1', quantity: '0.5000' },
					{ item_code: 'COFFEE_Q1', quantity: '0.5000' }
				],
				
				// No skill requirements
				min_skill_required: 0,
				
				// Company settings
				max_employees: 1000,
				level: 1,
				status: 'ACTIVE',
				is_government: true,
				is_hiring: true,
				
				// Empty inventory
				inventory: [],
				
				// Stats
				total_salaries_paid: '0.0000',
				total_shifts_completed: 0
			});
			
			await stateConstructionCompany.save();
			
			console.log('[GENESIS] ✅ Created State Construction Company');
			console.log(`[GENESIS]    Wage: €${stateConstructionCompany.wage_offer}/shift`);
			console.log(`[GENESIS]    Rewards: 0.5x BREAD_Q1, 0.5x COFFEE_Q1`);
		} else {
			console.log('[GENESIS] ✅ State Construction Company already exists');
		}
		
		console.log('[GENESIS] 🎉 Founder companies creation complete!');
		
	} catch (error) {
		console.error('[GENESIS] ❌ Error creating founder companies:', error);
		console.error('[GENESIS] Stack trace:', error.stack);
		
		// Don't throw - just log. Server should still start even if genesis fails.
		// Admins can manually create companies via API if needed.
	}
}

/**
 * Initialize Genesis
 * Called from server startup
 */
async function initializeGenesis() {
	console.log('[GENESIS] 🌍 Starting Genesis Protocol...');
	
	await createFounderCompanies();
	
	console.log('[GENESIS] ✅ Genesis Protocol complete');
}

module.exports = {
	initializeGenesis,
	createFounderCompanies
};
