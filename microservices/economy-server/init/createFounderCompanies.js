/**
 * ============================================================================
 * GENESIS SCRIPT - FOUNDER COMPANIES
 * ============================================================================
 * 
 * Creates the first companies at server launch.
 * These are the economic foundation of the game world.
 * 
 * Module: 2.2.B - Corporate Infrastructure
 * 
 * PURPOSE:
 * - Ensure there's always a default employer for unemployed players
 * - Seed the economy with initial capital
 * - Create admin-owned companies for game operations
 * 
 * RUNS:
 * - Once at server startup
 * - Idempotent (safe to run multiple times)
 * 
 * @version 1.0.0
 * @date 2026-02-12
 */

const Company = global.Company;
const User = global.User;

/**
 * Create founder companies
 * 
 * This function:
 * 1. Finds the first admin user
 * 2. Creates "State Construction" (government company)
 * 3. Injects initial capital
 * 4. Sets as default employer
 * 
 * IDEMPOTENT: Safe to run multiple times (checks if exists first)
 */
async function createFounderCompanies() {
	try {
		console.log('[GENESIS] 🏢 Checking founder companies...');
		
		// ====================================================================
		// STEP 1: Check if government company already exists
		// ====================================================================
		
		const existingGovCompany = await Company.findOne({
			name: 'State Construction',
			is_government: true
		});
		
		if (existingGovCompany) {
			console.log('[GENESIS] ✅ Government company already exists:');
			console.log(`[GENESIS]    Name: ${existingGovCompany.name}`);
			console.log(`[GENESIS]    Owner: ${existingGovCompany.owner_id}`);
			console.log(`[GENESIS]    Funds: €${existingGovCompany.funds_euro}`);
			console.log(`[GENESIS]    Employees: ${existingGovCompany.employees.length}`);
			return;
		}
		
		console.log('[GENESIS] 📋 No government company found, creating...');
		
		// ====================================================================
		// STEP 2: Find first admin user
		// ====================================================================
		
		const adminUser = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
		
		if (!adminUser) {
			console.error('[GENESIS] ❌ No admin user found! Cannot create founder companies.');
			console.error('[GENESIS] 💡 Please create an admin user first.');
			return;
		}
		
		console.log(`[GENESIS] 👤 Found admin: ${adminUser.username} (${adminUser._id})`);
		
		// ====================================================================
		// STEP 3: Create "State Construction" (Government Company)
		// ====================================================================
		
		const stateConstruction = new Company({
			name: 'State Construction',
			owner_id: adminUser._id,
			type: 'GOVERNMENT',
			description: 'Government-owned construction company. Default employer for all citizens.',
			
			// Initial capital (from admin's "pocket")
			funds_euro: '10000.0000',  // €10,000 starting capital
			funds_gold: '0.0000',
			funds_ron: '0.0000',
			
			// Salary offer (matches BASE_SALARY from gameConstants)
			wage_offer: '10.0000',  // €10 per shift
			
			// No skill requirements (anyone can work)
			min_skill_required: 0,
			
			// Company settings
			max_employees: 1000,  // Can employ 1000 workers
			level: 1,
			status: 'ACTIVE',
			is_government: true,
			is_hiring: true,
			
			// Empty inventory (for now)
			inventory: [],
			
			// Stats
			total_salaries_paid: '0.0000',
			total_shifts_completed: 0
		});
		
		await stateConstruction.save();
		
		console.log('[GENESIS] ✅ Created government company:');
		console.log(`[GENESIS]    Name: ${stateConstruction.name}`);
		console.log(`[GENESIS]    Type: ${stateConstruction.type}`);
		console.log(`[GENESIS]    Owner: ${adminUser.username}`);
		console.log(`[GENESIS]    Initial Capital: €${stateConstruction.funds_euro}`);
		console.log(`[GENESIS]    Wage Offer: €${stateConstruction.wage_offer}/shift`);
		console.log(`[GENESIS]    Max Employees: ${stateConstruction.max_employees}`);
		console.log(`[GENESIS]    Status: ${stateConstruction.status}`);
		
		// ====================================================================
		// STEP 4: Future - Create additional founder companies
		// ====================================================================
		
		// TODO: Add more founder companies (newspapers, factories, etc)
		// These can be created by the admin in-game, but having some
		// pre-made companies helps jumpstart the economy.
		
		/*
		const alphaNews = new Company({
			name: 'Alpha News',
			owner_id: adminUser._id,
			type: 'NEWSPAPER',
			description: 'Official news outlet of the Alpha Republic.',
			funds_euro: '5000.0000',
			wage_offer: '12.0000',  // Journalists earn slightly more
			min_skill_required: 1,
			max_employees: 50,
			is_government: false,
			is_hiring: true
		});
		
		await alphaNews.save();
		console.log('[GENESIS] ✅ Created Alpha News company');
		*/
		
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
