/**
 * ============================================================================
 * WORK CALCULATOR - THE SALARY BRAIN
 * ============================================================================
 * 
 * Complex economic algorithm for calculating work income with:
 * - Non-linear productivity scaling
 * - Exhaustion penalties (low energy)
 * - Depression penalties (low happiness)
 * - Progressive taxation
 * - Banking-grade precision (Decimal128)
 * 
 * Module: 2.2.A - Smart Productivity Algorithm
 * 
 * CRITICAL RULES:
 * - ALL financial calculations use FinancialMath (no native * or /)
 * - All monetary values rounded to 4 decimals
 * - No side effects (pure calculation function)
 * - Returns detailed breakdown (for UI and audit trail)
 * 
 * @version 1.0.0
 * @date 2026-02-12
 */

const FinancialMath = require('./FinancialMath');
const gameConstants = require('../config/gameConstants');

class WorkCalculator {
	/**
	 * ========================================================================
	 * MAIN CALCULATION METHOD
	 * ========================================================================
	 * 
	 * Calculate salary for a work shift with complete breakdown.
	 * 
	 * ALGORITHM (Smart Productivity):
	 * 
	 * 1. Energy Factor (Non-Linear):
	 *    - Base: energy / 100
	 *    - If energy < EXHAUSTION_THRESHOLD: apply EXHAUSTION_PENALTY
	 *    - Example: 40 energy → 0.40 * 0.85 = 0.34 (34% productivity)
	 * 
	 * 2. Happiness Factor (Non-Linear):
	 *    - Base: happiness / 100
	 *    - If happiness < CRITICAL_HAPPINESS_THRESHOLD: apply DEPRESSION_PENALTY
	 *    - Example: 15 happiness → 0.15 * 0.50 = 0.075 (7.5% productivity)
	 * 
	 * 3. Gross Salary:
	 *    - Gross = BASE_SALARY * energyFactor * happinessFactor * productivity
	 *    - Chain multiplication using FinancialMath
	 * 
	 * 4. Taxation:
	 *    - Tax = Gross * INCOME_TAX_PERCENTAGE
	 *    - Net = Gross - Tax
	 * 
	 * @param {Object} user - User document from database
	 * @param {number} user.energy - Current energy (0-100)
	 * @param {number} user.happiness - Current happiness (0-100)
	 * @param {number} user.health - Current health (0-100)
	 * @param {string} user.productivity_multiplier - Productivity (Decimal128 string)
	 * @param {Date} user.last_work_at - Last work timestamp
	 * 
	 * @returns {Object} Salary breakdown with all modifiers
	 * 
	 * @throws {Error} If user is null or missing required fields
	 */
	static calculateSalaryCheck(user) {
		// ====================================================================
		// STEP 0: VALIDATION & DEFENSIVE PROGRAMMING
		// ====================================================================
		
		if (!user) {
			throw new Error('[WorkCalculator] User object is required');
		}
		
		// Validate required fields
		if (typeof user.energy !== 'number') {
			throw new Error('[WorkCalculator] User energy is required (number)');
		}
		
		if (typeof user.happiness !== 'number') {
			throw new Error('[WorkCalculator] User happiness is required (number)');
		}
		
		// Clamp energy and happiness to valid ranges (0-100)
		const energy = Math.max(0, Math.min(100, user.energy));
		const happiness = Math.max(0, Math.min(100, user.happiness));
		
		// Default productivity to 1.0000 if missing
		const productivityMultiplier = user.productivity_multiplier || '1.0000';
		
		// Load constants
		const WORK = gameConstants.WORK;
		
		console.log('[WorkCalculator] ========================================');
		console.log('[WorkCalculator] 📊 Starting Salary Calculation');
		console.log('[WorkCalculator] Input State:');
		console.log(`[WorkCalculator]   Energy: ${energy}`);
		console.log(`[WorkCalculator]   Happiness: ${happiness}`);
		console.log(`[WorkCalculator]   Productivity: ${productivityMultiplier}`);
		console.log('[WorkCalculator] ========================================');
		
		// ====================================================================
		// STEP 1: CHECK IF USER CAN WORK (Minimum Energy)
		// ====================================================================
		
		if (energy < WORK.MIN_ENERGY_REQUIRED) {
			console.log(`[WorkCalculator] ❌ Insufficient energy (${energy} < ${WORK.MIN_ENERGY_REQUIRED})`);
			return {
				canWork: false,
				reason: 'INSUFFICIENT_ENERGY',
				message: `You need at least ${WORK.MIN_ENERGY_REQUIRED} energy to work. Rest and eat!`,
				breakdown: null
			};
		}
		
		console.log('[WorkCalculator] ✅ Energy check passed');
		
		// ====================================================================
		// STEP 2: CALCULATE ENERGY FACTOR (Non-Linear)
		// ====================================================================
		
		// Base energy factor (0.0 to 1.0)
		let energyFactor = energy / 100;
		let exhaustionPenaltyApplied = false;
		
		// Apply exhaustion penalty if below threshold
		if (energy < WORK.EXHAUSTION_THRESHOLD) {
			console.log(`[WorkCalculator] ⚠️  Exhaustion detected (${energy} < ${WORK.EXHAUSTION_THRESHOLD})`);
			
			// energyFactor = energyFactor * EXHAUSTION_PENALTY
			energyFactor = FinancialMath.multiply(
				energyFactor.toString(),
				WORK.EXHAUSTION_PENALTY
			);
			
			exhaustionPenaltyApplied = true;
			
			console.log(`[WorkCalculator]    Penalty applied: ${WORK.EXHAUSTION_PENALTY} (${(parseFloat(WORK.EXHAUSTION_PENALTY) * 100).toFixed(0)}% efficiency)`);
		}
		
		// Round to 4 decimals
		energyFactor = FinancialMath.round(energyFactor.toString(), 4);
		
		console.log(`[WorkCalculator] 💪 Energy Factor: ${energyFactor}`);
		
		// ====================================================================
		// STEP 3: CALCULATE HAPPINESS FACTOR (Non-Linear)
		// ====================================================================
		
		// Base happiness factor (0.0 to 1.0)
		let happinessFactor = happiness / 100;
		let depressionPenaltyApplied = false;
		
		// Apply depression penalty if below threshold
		if (happiness < WORK.CRITICAL_HAPPINESS_THRESHOLD) {
			console.log(`[WorkCalculator] 😞 Depression detected (${happiness} < ${WORK.CRITICAL_HAPPINESS_THRESHOLD})`);
			
			// happinessFactor = happinessFactor * DEPRESSION_PENALTY
			happinessFactor = FinancialMath.multiply(
				happinessFactor.toString(),
				WORK.DEPRESSION_PENALTY
			);
			
			depressionPenaltyApplied = true;
			
			console.log(`[WorkCalculator]    Penalty applied: ${WORK.DEPRESSION_PENALTY} (${(parseFloat(WORK.DEPRESSION_PENALTY) * 100).toFixed(0)}% efficiency)`);
		}
		
		// Round to 4 decimals
		happinessFactor = FinancialMath.round(happinessFactor.toString(), 4);
		
		console.log(`[WorkCalculator] 😊 Happiness Factor: ${happinessFactor}`);
		
		// ====================================================================
		// STEP 4: CALCULATE GROSS SALARY (Chain Multiplication)
		// ====================================================================
		
		console.log('[WorkCalculator] 💰 Calculating Gross Salary...');
		console.log(`[WorkCalculator]    Base: ${WORK.BASE_SALARY_EURO}`);
		console.log(`[WorkCalculator]    × Energy Factor: ${energyFactor}`);
		console.log(`[WorkCalculator]    × Happiness Factor: ${happinessFactor}`);
		console.log(`[WorkCalculator]    × Productivity: ${productivityMultiplier}`);
		
		// Gross = BASE_SALARY_EURO * energyFactor
		let grossSalary = FinancialMath.multiply(
			WORK.BASE_SALARY_EURO,
			energyFactor
		);
		
		// Gross = Gross * happinessFactor
		grossSalary = FinancialMath.multiply(
			grossSalary,
			happinessFactor
		);
		
		// Gross = Gross * productivityMultiplier
		grossSalary = FinancialMath.multiply(
			grossSalary,
			productivityMultiplier
		);
		
		// Round to 4 decimals
		grossSalary = FinancialMath.round(grossSalary, 4);
		
		console.log(`[WorkCalculator] 💵 Gross Salary: €${grossSalary}`);
		
		// ====================================================================
		// STEP 5: CALCULATE TAXATION (Government Revenue)
		// ====================================================================
		
		console.log('[WorkCalculator] 🏛️  Calculating Taxes...');
		console.log(`[WorkCalculator]    Tax Rate: ${WORK.INCOME_TAX_PERCENTAGE} (${(parseFloat(WORK.INCOME_TAX_PERCENTAGE) * 100).toFixed(0)}%)`);
		
		// TaxAmount = Gross * INCOME_TAX_PERCENTAGE
		const taxAmount = FinancialMath.multiply(
			grossSalary,
			WORK.INCOME_TAX_PERCENTAGE
		);
		
		// Round to 4 decimals
		const taxAmountRounded = FinancialMath.round(taxAmount, 4);
		
		console.log(`[WorkCalculator] 💸 Tax Amount: €${taxAmountRounded}`);
		
		// ====================================================================
		// STEP 6: CALCULATE NET SALARY (Take-Home Pay)
		// ====================================================================
		
		// NetSalary = Gross - Tax
		const netSalary = FinancialMath.subtract(
			grossSalary,
			taxAmountRounded
		);
		
		// Round to 4 decimals
		const netSalaryRounded = FinancialMath.round(netSalary, 4);
		
		console.log(`[WorkCalculator] ✅ Net Salary (Take-Home): €${netSalaryRounded}`);
		console.log('[WorkCalculator] ========================================');
		
		// ====================================================================
		// STEP 7: BUILD DETAILED BREAKDOWN (The Receipt)
		// ====================================================================
		
		const breakdown = {
			// Base values
			baseSalary: WORK.BASE_SALARY_EURO,
			grossSalary: grossSalary,
			taxAmount: taxAmountRounded,
			netSalary: netSalaryRounded,
			
			// Energy cost
			energyCost: WORK.ENERGY_COST,
			
			// Modifiers (for UI display and analysis)
			modifiers: {
				energyFactor: energyFactor,
				happinessFactor: happinessFactor,
				productivityMultiplier: productivityMultiplier,
				
				// Penalty flags
				exhaustionPenaltyApplied: exhaustionPenaltyApplied,
				depressionPenaltyApplied: depressionPenaltyApplied,
				
				// Penalty values (for UI explanation)
				exhaustionPenalty: exhaustionPenaltyApplied ? WORK.EXHAUSTION_PENALTY : null,
				depressionPenalty: depressionPenaltyApplied ? WORK.DEPRESSION_PENALTY : null,
			},
			
			// Tax details
			taxation: {
				rate: WORK.INCOME_TAX_PERCENTAGE,
				ratePercentage: (parseFloat(WORK.INCOME_TAX_PERCENTAGE) * 100).toFixed(2) + '%',
				amount: taxAmountRounded
			},
			
			// Efficiency metrics (for analytics)
			efficiency: {
				// Combined efficiency (0.0 to 1.0)
				combinedFactor: FinancialMath.round(
					FinancialMath.multiply(energyFactor, happinessFactor),
					4
				),
				
				// Percentage (for UI)
				combinedPercentage: (
					parseFloat(FinancialMath.multiply(energyFactor, happinessFactor)) * 100
				).toFixed(2) + '%',
			}
		};
		
		// ====================================================================
		// STEP 8: RETURN RESULT
		// ====================================================================
		
		return {
			canWork: true,
			breakdown: breakdown
		};
	}
	
	/**
	 * ========================================================================
	 * HELPER: Check Cooldown (Utility Method)
	 * ========================================================================
	 * 
	 * Check if enough time has passed since last work.
	 * 
	 * @param {Date} lastWorkAt - Last work timestamp
	 * @returns {Object} Cooldown status
	 */
	static checkCooldown(lastWorkAt) {
		const COOLDOWN_MS = gameConstants.WORK.COOLDOWN_HOURS * 60 * 60 * 1000;
		
		if (!lastWorkAt) {
			// Never worked before
			return {
				canWork: true,
				cooldownRemaining: 0,
				cooldownRemainingFormatted: '0h 0m'
			};
		}
		
		const now = Date.now();
		const lastWorkMs = new Date(lastWorkAt).getTime();
		const timeSinceWork = now - lastWorkMs;
		
		if (timeSinceWork >= COOLDOWN_MS) {
			// Cooldown expired
			return {
				canWork: true,
				cooldownRemaining: 0,
				cooldownRemainingFormatted: '0h 0m'
			};
		}
		
		// Cooldown still active
		const cooldownRemaining = COOLDOWN_MS - timeSinceWork;
		const hoursRemaining = Math.floor(cooldownRemaining / (60 * 60 * 1000));
		const minutesRemaining = Math.floor((cooldownRemaining % (60 * 60 * 1000)) / (60 * 1000));
		
		return {
			canWork: false,
			cooldownRemaining: cooldownRemaining,
			cooldownRemainingFormatted: `${hoursRemaining}h ${minutesRemaining}m`
		};
	}
	
	/**
	 * ========================================================================
	 * HELPER: Validate User State (Pre-Work Check)
	 * ========================================================================
	 * 
	 * Complete validation before allowing work action.
	 * Combines energy check + cooldown check + status effects.
	 * 
	 * @param {Object} user - User document
	 * @returns {Object} Validation result with detailed reason
	 */
	static validateWorkEligibility(user) {
		const WORK = gameConstants.WORK;
		
		// Check if dead
		if (user.status_effects && user.status_effects.dead) {
			return {
				canWork: false,
				reason: 'DEAD',
				message: 'Dead players cannot work. Please resurrect first.'
			};
		}
		
		// Check vacation mode
		if (user.vacation_mode) {
			return {
				canWork: false,
				reason: 'VACATION_MODE',
				message: 'You are in vacation mode. Disable it to work.'
			};
		}
		
		// Check frozen account
		if (user.is_frozen_for_fraud) {
			return {
				canWork: false,
				reason: 'ACCOUNT_FROZEN',
				message: 'Your account is frozen due to suspected fraud.'
			};
		}
		
		// Check energy
		if (user.energy < WORK.MIN_ENERGY_REQUIRED) {
			return {
				canWork: false,
				reason: 'INSUFFICIENT_ENERGY',
				message: `You need at least ${WORK.MIN_ENERGY_REQUIRED} energy to work. Current: ${user.energy}`
			};
		}
		
		// Check cooldown
		const cooldownCheck = this.checkCooldown(user.last_work_at);
		if (!cooldownCheck.canWork) {
			return {
				canWork: false,
				reason: 'COOLDOWN_ACTIVE',
				message: `You can work again in ${cooldownCheck.cooldownRemainingFormatted}`,
				cooldown: cooldownCheck
			};
		}
		
		// All checks passed
		return {
			canWork: true,
			reason: 'OK',
			message: 'You are eligible to work'
		};
	}
}

module.exports = WorkCalculator;
