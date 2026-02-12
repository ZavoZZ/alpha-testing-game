/**
 * ============================================================================
 * WORK CALCULATOR - COMPREHENSIVE TEST SUITE
 * ============================================================================
 * 
 * Tests the Smart Productivity Algorithm with various scenarios:
 * - Optimal conditions (high energy + happiness)
 * - Exhaustion penalties (low energy)
 * - Depression penalties (low happiness)
 * - Combined penalties (both low)
 * - Edge cases (0 energy, 0 happiness)
 * - Productivity multipliers
 * 
 * Module: 2.2.A - The Salary Brain
 * 
 * Usage: node test-work-calculator.js
 */

const WorkCalculator = require('./services/WorkCalculator');
const gameConstants = require('./config/gameConstants');

// ANSI Colors for terminal output
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
};

// Test counter
let testsPassed = 0;
let testsFailed = 0;

/**
 * Print section header
 */
function printHeader(title) {
	console.log('');
	console.log('='.repeat(80));
	console.log(colors.bright + colors.cyan + title.toUpperCase() + colors.reset);
	console.log('='.repeat(80));
}

/**
 * Print test result
 */
function printTest(name, passed, actual, expected) {
	if (passed) {
		console.log(colors.green + '✅ PASS' + colors.reset + ': ' + name);
		if (actual !== undefined) {
			console.log('   Expected: ' + expected);
			console.log('   Actual:   ' + actual);
		}
		testsPassed++;
	} else {
		console.log(colors.red + '❌ FAIL' + colors.reset + ': ' + name);
		console.log('   Expected: ' + expected);
		console.log('   Actual:   ' + actual);
		testsFailed++;
	}
}

/**
 * Print user state
 */
function printUser(user) {
	console.log('');
	console.log(colors.yellow + '👤 USER STATE:' + colors.reset);
	console.log('   Energy:       ' + user.energy);
	console.log('   Happiness:    ' + user.happiness);
	console.log('   Productivity: ' + (user.productivity_multiplier || '1.0000'));
	console.log('');
}

/**
 * Print salary breakdown
 */
function printBreakdown(result) {
	if (!result.canWork) {
		console.log(colors.red + '❌ CANNOT WORK' + colors.reset);
		console.log('   Reason: ' + result.reason);
		console.log('   Message: ' + result.message);
		return;
	}
	
	const b = result.breakdown;
	
	console.log(colors.green + '✅ CAN WORK' + colors.reset);
	console.log('');
	console.log(colors.bright + '💰 SALARY BREAKDOWN:' + colors.reset);
	console.log('   Base Salary:  €' + b.baseSalary);
	console.log('   Gross Salary: €' + b.grossSalary + colors.yellow + ' (before tax)' + colors.reset);
	console.log('   Tax Amount:   €' + b.taxAmount + colors.red + ' (-' + b.taxation.ratePercentage + ')' + colors.reset);
	console.log('   ' + colors.green + colors.bright + 'Net Salary:   €' + b.netSalary + colors.reset);
	console.log('');
	console.log(colors.bright + '📊 MODIFIERS:' + colors.reset);
	console.log('   Energy Factor:    ' + (parseFloat(b.modifiers.energyFactor) * 100).toFixed(2) + '%' + 
		(b.modifiers.exhaustionPenaltyApplied ? colors.red + ' (EXHAUSTION PENALTY!)' + colors.reset : ''));
	console.log('   Happiness Factor: ' + (parseFloat(b.modifiers.happinessFactor) * 100).toFixed(2) + '%' +
		(b.modifiers.depressionPenaltyApplied ? colors.red + ' (DEPRESSION PENALTY!)' + colors.reset : ''));
	console.log('   Productivity:     ' + (parseFloat(b.modifiers.productivityMultiplier) * 100).toFixed(2) + '%');
	console.log('   Combined:         ' + b.efficiency.combinedPercentage);
	console.log('');
}

// ============================================================================
// TEST SCENARIOS
// ============================================================================

printHeader('Module 2.2.A - The Salary Brain - Test Suite');

// ----------------------------------------------------------------------------
// TEST 1: OPTIMAL CONDITIONS (100 energy, 100 happiness)
// ----------------------------------------------------------------------------

printHeader('Test 1: Optimal Conditions');

const user1 = {
	energy: 100,
	happiness: 100,
	productivity_multiplier: '1.0000'
};

printUser(user1);

const result1 = WorkCalculator.calculateSalaryCheck(user1);
printBreakdown(result1);

printTest(
	'Can work with optimal stats',
	result1.canWork === true,
	result1.canWork,
	true
);

printTest(
	'Energy factor = 1.0000 (no penalty)',
	result1.breakdown.modifiers.energyFactor === '1.0000',
	result1.breakdown.modifiers.energyFactor,
	'1.0000'
);

printTest(
	'Happiness factor = 1.0000 (no penalty)',
	result1.breakdown.modifiers.happinessFactor === '1.0000',
	result1.breakdown.modifiers.happinessFactor,
	'1.0000'
);

printTest(
	'Gross salary = Base salary (no penalties)',
	result1.breakdown.grossSalary === gameConstants.WORK.BASE_SALARY_EURO,
	result1.breakdown.grossSalary,
	gameConstants.WORK.BASE_SALARY_EURO
);

printTest(
	'Net salary = Gross - Tax (15%)',
	result1.breakdown.netSalary === '8.5000',
	result1.breakdown.netSalary,
	'8.5000'
);

// ----------------------------------------------------------------------------
// TEST 2: EXHAUSTION PENALTY (40 energy, 100 happiness)
// ----------------------------------------------------------------------------

printHeader('Test 2: Exhaustion Penalty');

const user2 = {
	energy: 40,
	happiness: 100,
	productivity_multiplier: '1.0000'
};

printUser(user2);

const result2 = WorkCalculator.calculateSalaryCheck(user2);
printBreakdown(result2);

printTest(
	'Can work with low energy (>= 10)',
	result2.canWork === true,
	result2.canWork,
	true
);

printTest(
	'Exhaustion penalty applied',
	result2.breakdown.modifiers.exhaustionPenaltyApplied === true,
	result2.breakdown.modifiers.exhaustionPenaltyApplied,
	true
);

printTest(
	'Energy factor = 0.40 * 0.85 = 0.3400',
	result2.breakdown.modifiers.energyFactor === '0.3400',
	result2.breakdown.modifiers.energyFactor,
	'0.3400'
);

printTest(
	'Gross salary reduced by exhaustion',
	parseFloat(result2.breakdown.grossSalary) < parseFloat(gameConstants.WORK.BASE_SALARY_EURO),
	result2.breakdown.grossSalary + ' < ' + gameConstants.WORK.BASE_SALARY_EURO,
	'true'
);

// ----------------------------------------------------------------------------
// TEST 3: DEPRESSION PENALTY (100 energy, 15 happiness)
// ----------------------------------------------------------------------------

printHeader('Test 3: Depression Penalty');

const user3 = {
	energy: 100,
	happiness: 15,
	productivity_multiplier: '1.0000'
};

printUser(user3);

const result3 = WorkCalculator.calculateSalaryCheck(user3);
printBreakdown(result3);

printTest(
	'Can work with low happiness',
	result3.canWork === true,
	result3.canWork,
	true
);

printTest(
	'Depression penalty applied',
	result3.breakdown.modifiers.depressionPenaltyApplied === true,
	result3.breakdown.modifiers.depressionPenaltyApplied,
	true
);

printTest(
	'Happiness factor = 0.15 * 0.50 = 0.0750',
	result3.breakdown.modifiers.happinessFactor === '0.0750',
	result3.breakdown.modifiers.happinessFactor,
	'0.0750'
);

printTest(
	'Gross salary severely reduced by depression',
	parseFloat(result3.breakdown.grossSalary) < parseFloat(gameConstants.WORK.BASE_SALARY_EURO) * 0.1,
	result3.breakdown.grossSalary + ' < ' + (parseFloat(gameConstants.WORK.BASE_SALARY_EURO) * 0.1),
	'true'
);

// ----------------------------------------------------------------------------
// TEST 4: COMBINED PENALTIES (40 energy, 15 happiness)
// ----------------------------------------------------------------------------

printHeader('Test 4: Combined Penalties (Worst Case)');

const user4 = {
	energy: 40,
	happiness: 15,
	productivity_multiplier: '1.0000'
};

printUser(user4);

const result4 = WorkCalculator.calculateSalaryCheck(user4);
printBreakdown(result4);

printTest(
	'Both penalties applied',
	result4.breakdown.modifiers.exhaustionPenaltyApplied && result4.breakdown.modifiers.depressionPenaltyApplied,
	result4.breakdown.modifiers.exhaustionPenaltyApplied + ' AND ' + result4.breakdown.modifiers.depressionPenaltyApplied,
	'true AND true'
);

printTest(
	'Gross salary extremely low',
	parseFloat(result4.breakdown.grossSalary) < parseFloat(gameConstants.WORK.BASE_SALARY_EURO) * 0.05,
	result4.breakdown.grossSalary + ' < ' + (parseFloat(gameConstants.WORK.BASE_SALARY_EURO) * 0.05),
	'true'
);

// ----------------------------------------------------------------------------
// TEST 5: INSUFFICIENT ENERGY (5 energy, 100 happiness)
// ----------------------------------------------------------------------------

printHeader('Test 5: Insufficient Energy');

const user5 = {
	energy: 5,
	happiness: 100,
	productivity_multiplier: '1.0000'
};

printUser(user5);

const result5 = WorkCalculator.calculateSalaryCheck(user5);
printBreakdown(result5);

printTest(
	'Cannot work with energy < 10',
	result5.canWork === false,
	result5.canWork,
	false
);

printTest(
	'Reason is INSUFFICIENT_ENERGY',
	result5.reason === 'INSUFFICIENT_ENERGY',
	result5.reason,
	'INSUFFICIENT_ENERGY'
);

// ----------------------------------------------------------------------------
// TEST 6: PRODUCTIVITY MULTIPLIER (100 energy, 100 happiness, 2.0x productivity)
// ----------------------------------------------------------------------------

printHeader('Test 6: Productivity Multiplier');

const user6 = {
	energy: 100,
	happiness: 100,
	productivity_multiplier: '2.0000'
};

printUser(user6);

const result6 = WorkCalculator.calculateSalaryCheck(user6);
printBreakdown(result6);

printTest(
	'Gross salary doubled by productivity',
	result6.breakdown.grossSalary === '20.0000',
	result6.breakdown.grossSalary,
	'20.0000'
);

printTest(
	'Net salary = 20.0000 - (20 * 0.15) = 17.0000',
	result6.breakdown.netSalary === '17.0000',
	result6.breakdown.netSalary,
	'17.0000'
);

// ----------------------------------------------------------------------------
// TEST 7: EDGE CASE (0 energy) - Should fail
// ----------------------------------------------------------------------------

printHeader('Test 7: Edge Case - Zero Energy');

const user7 = {
	energy: 0,
	happiness: 100,
	productivity_multiplier: '1.0000'
};

printUser(user7);

const result7 = WorkCalculator.calculateSalaryCheck(user7);
printBreakdown(result7);

printTest(
	'Cannot work with 0 energy',
	result7.canWork === false,
	result7.canWork,
	false
);

// ----------------------------------------------------------------------------
// TEST 8: COOLDOWN CHECK
// ----------------------------------------------------------------------------

printHeader('Test 8: Cooldown Check');

const now = new Date();
const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

const cooldown1 = WorkCalculator.checkCooldown(null);
printTest(
	'First time work (no cooldown)',
	cooldown1.canWork === true,
	cooldown1.canWork,
	true
);

const cooldown2 = WorkCalculator.checkCooldown(oneHourAgo);
printTest(
	'Cooldown active (worked 1 hour ago)',
	cooldown2.canWork === false,
	cooldown2.canWork,
	false
);

const cooldown3 = WorkCalculator.checkCooldown(twentyFourHoursAgo);
printTest(
	'Cooldown expired (worked 24 hours ago)',
	cooldown3.canWork === true,
	cooldown3.canWork,
	true
);

// ----------------------------------------------------------------------------
// TEST 9: VALIDATION CHECK
// ----------------------------------------------------------------------------

printHeader('Test 9: Work Eligibility Validation');

const validUser = {
	energy: 50,
	happiness: 50,
	status_effects: { dead: false },
	vacation_mode: false,
	is_frozen_for_fraud: false,
	last_work_at: twentyFourHoursAgo
};

const validation1 = WorkCalculator.validateWorkEligibility(validUser);
printTest(
	'Valid user can work',
	validation1.canWork === true,
	validation1.canWork,
	true
);

const deadUser = { ...validUser, status_effects: { dead: true } };
const validation2 = WorkCalculator.validateWorkEligibility(deadUser);
printTest(
	'Dead user cannot work',
	validation2.canWork === false && validation2.reason === 'DEAD',
	validation2.reason,
	'DEAD'
);

const vacationUser = { ...validUser, vacation_mode: true };
const validation3 = WorkCalculator.validateWorkEligibility(vacationUser);
printTest(
	'Vacation mode user cannot work',
	validation3.canWork === false && validation3.reason === 'VACATION_MODE',
	validation3.reason,
	'VACATION_MODE'
);

// ============================================================================
// TEST SUMMARY
// ============================================================================

printHeader('Test Summary');

const total = testsPassed + testsFailed;
const passRate = ((testsPassed / total) * 100).toFixed(2);

console.log('');
console.log('Total Tests: ' + total);
console.log(colors.green + 'Passed: ' + testsPassed + colors.reset);
console.log(colors.red + 'Failed: ' + testsFailed + colors.reset);
console.log('Pass Rate: ' + passRate + '%');
console.log('');

if (testsFailed === 0) {
	console.log(colors.green + colors.bright + '🎉 ALL TESTS PASSED! THE SALARY BRAIN IS PERFECT!' + colors.reset);
	process.exit(0);
} else {
	console.log(colors.red + colors.bright + '❌ SOME TESTS FAILED! REVIEW ABOVE.' + colors.reset);
	process.exit(1);
}
