/**
 * Test Work API - Module 2.2.B
 * 
 * Tests the work shift execution with real database
 */

const mongoose = require('mongoose');

// Load models FIRST (before services)
require('./server.js');  // This loads all models into global scope

const WorkService = require('./services/WorkService');

(async () => {
	try {
		console.log('\n========================================');
		console.log('TEST: Work Shift Execution');
		console.log('========================================\n');
		
		// Wait for models to be available
		await new Promise(resolve => setTimeout(resolve, 2000));
		
		const User = global.User;
		const Company = global.Company;
		
		if (!User) {
			throw new Error('User model not loaded');
		}
		
		// Get test user (admin)
		const testUser = await User.findOne({ role: 'admin' });
		
		if (!testUser) {
			throw new Error('No admin user found');
		}
		
		console.log('👤 User:', testUser.username);
		console.log('   Energy BEFORE:', testUser.energy);
		console.log('   Happiness:', testUser.happiness);
		console.log('   Balance BEFORE: €' + testUser.balance_euro);
		console.log('   Employer:', testUser.employer_id || 'None (unemployed)');
		console.log('');
		
		// Check company
		const company = await Company.findOne({ name: 'State Construction' });
		
		if (!company) {
			throw new Error('State Construction not found');
		}
		
		console.log('🏢 Company:', company.name);
		console.log('   Funds: €' + company.funds_euro);
		console.log('   Wage Offer: €' + company.wage_offer);
		console.log('');
		
		// Execute work shift
		console.log('💼 Executing work shift...\n');
		
		const result = await WorkService.processWorkShift(testUser._id.toString());
		
		console.log('\n========================================');
		console.log('✅ WORK SHIFT COMPLETE!');
		console.log('========================================\n');
		
		console.log('Company:', result.company.name);
		console.log('');
		console.log('Earnings:');
		console.log('  Gross: €' + result.earnings.gross);
		console.log('  Net: €' + result.earnings.net);
		console.log('');
		console.log('Taxes:');
		console.log('  Government: €' + result.earnings.taxes.government);
		console.log('  Master: €' + result.earnings.taxes.master);
		console.log('  Total: €' + result.earnings.taxes.total);
		console.log('');
		console.log('Modifiers:');
		console.log('  Energy Factor:', result.modifiers.energy_factor);
		console.log('  Happiness Factor:', result.modifiers.happiness_factor);
		console.log('  Combined Efficiency:', result.modifiers.combined_efficiency);
		console.log('  Exhaustion Penalty:', result.modifiers.exhaustion_penalty ? 'YES' : 'NO');
		console.log('  Depression Penalty:', result.modifiers.depression_penalty ? 'YES' : 'NO');
		console.log('');
		console.log('Costs:');
		console.log('  Energy Consumed:', result.costs.energy_consumed);
		console.log('  Energy Remaining:', result.costs.energy_remaining);
		console.log('');
		console.log('Stats:');
		console.log('  Total Shifts Worked:', result.stats.total_shifts_worked);
		console.log('  Total Work Earnings: €' + result.stats.total_work_earnings);
		console.log('  Current Balance: €' + result.stats.current_balance);
		console.log('');
		console.log('========================================');
		
		// Verify in database
		const updatedUser = await User.findById(testUser._id);
		const updatedCompany = await Company.findById(company._id);
		
		console.log('\n📊 DATABASE VERIFICATION:');
		console.log('User Balance: €' + updatedUser.balance_euro);
		console.log('Company Funds: €' + updatedCompany.funds_euro);
		console.log('User Energy:', updatedUser.energy);
		console.log('User Employer:', updatedUser.employer_id);
		console.log('Company Employees:', updatedCompany.employees.length);
		
		console.log('\n✅ TEST COMPLETE!\n');
		
		process.exit(0);
		
	} catch (error) {
		console.error('\n❌ TEST FAILED:', error.message);
		console.error('Stack:', error.stack);
		process.exit(1);
	}
})();
