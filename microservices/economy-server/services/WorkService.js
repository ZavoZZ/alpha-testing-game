/**
 * ============================================================================
 * WORK SERVICE - B2P TRANSACTIONS (Business to Player)
 * ============================================================================
 * 
 * Handles work shifts with complex ACID transactions:
 * - Company pays worker from its own funds (zero-sum economy)
 * - Tax collection (government + master/referral)
 * - Energy consumption
 * - Statistics tracking
 * - Audit trail (Ledger)
 * 
 * Module: 2.2.B - Corporate Infrastructure & Payroll
 * 
 * CRITICAL: This is NOT "free money"!
 * - Money comes from company's funds
 * - If company can't pay → INSOLVENCY → Worker can't work
 * - Creates realistic economic pressure
 * 
 * @version 1.0.0
 * @date 2026-02-12
 */

const mongoose = require('mongoose');
const WorkCalculator = require('./WorkCalculator');
const FinancialMath = require('./FinancialMath');
const gameConstants = require('../config/gameConstants');

class WorkService {
	/**
	 * ========================================================================
	 * MAIN METHOD: Process Work Shift
	 * ========================================================================
	 * 
	 * Complete flow:
	 * 1. Load user + validate (energy, cooldown, status)
	 * 2. Assign employer if unemployed (auto-hire to government company)
	 * 3. Load company + validate (funds, status)
	 * 4. Calculate salary (using WorkCalculator)
	 * 5. Execute ACID transaction:
	 *    - Deduct from company funds
	 *    - Add to worker balance
	 *    - Collect taxes (government + master)
	 *    - Update energy
	 *    - Update stats
	 *    - Create Ledger entries
	 * 6. Return detailed receipt
	 * 
	 * @param {string} userId - User ObjectId
	 * @returns {Promise<Object>} - Work result with salary breakdown
	 * 
	 * @throws {Error} Various errors (InsufficientEnergy, CooldownActive, CompanyInsolvent, etc.)
	 */
	static async processWorkShift(userId) {
		console.log('[WorkService] ========================================');
		console.log('[WorkService] 💼 Processing work shift');
		console.log(`[WorkService] User ID: ${userId}`);
		console.log('[WorkService] ========================================');
		
		const User = global.User;
		const Company = global.Company;
		const Treasury = global.Treasury;
		const Ledger = global.Ledger;
		
		// ====================================================================
		// STEP 1: LOAD & VALIDATE USER
		// ====================================================================
		
		const user = await User.findById(userId);
		
		if (!user) {
			throw new Error('User not found');
		}
		
		console.log(`[WorkService] 👤 User: ${user.username}`);
		console.log(`[WorkService]    Energy: ${user.energy}`);
		console.log(`[WorkService]    Happiness: ${user.happiness}`);
		console.log(`[WorkService]    Current Employer: ${user.employer_id || 'None (unemployed)'}`);
		
		// Validate work eligibility
		const eligibility = WorkCalculator.validateWorkEligibility(user);
		
		if (!eligibility.canWork) {
			console.log(`[WorkService] ❌ Cannot work: ${eligibility.reason}`);
			throw new Error(eligibility.message);
		}
		
		console.log('[WorkService] ✅ User eligible to work');
		
		// ====================================================================
		// STEP 2: ASSIGN EMPLOYER (if unemployed)
		// ====================================================================
		
		let company;
		
		if (!user.employer_id) {
			console.log('[WorkService] 📋 User is unemployed, auto-assigning to government company...');
			
			// Find government company
			const govCompany = await Company.findGovernmentEmployer();
			
			if (!govCompany) {
				throw new Error('No government company available. Please contact administrator.');
			}
			
			// Assign user to government company
			user.employer_id = govCompany._id;
			company = govCompany;
			
			// Add user to company's employee list
			company.addEmployee(user._id);
			
			console.log(`[WorkService] ✅ Assigned to: ${company.name}`);
			
		} else {
			// Load existing employer
			company = await Company.findById(user.employer_id);
			
			if (!company) {
				throw new Error('Your employer company no longer exists. Please find a new job.');
			}
			
			console.log(`[WorkService] 🏢 Employer: ${company.name}`);
		}
		
		// ====================================================================
		// STEP 3: VALIDATE COMPANY
		// ====================================================================
		
		if (company.status !== 'ACTIVE') {
			throw new Error(`Company is ${company.status}. Cannot work here.`);
		}
		
		if (!company.is_hiring) {
			throw new Error('Company is not currently hiring.');
		}
		
		console.log(`[WorkService] 🏢 Company Status: ${company.status}`);
		console.log(`[WorkService] 💰 Company Funds: €${company.funds_euro}`);
		console.log(`[WorkService] 💵 Wage Offer: €${company.wage_offer}/shift`);
		
		// ====================================================================
		// STEP 4: CALCULATE SALARY
		// ====================================================================
		
		console.log('[WorkService] 📊 Calculating salary...');
		
		// Override BASE_SALARY with company's wage_offer
		const salaryCheck = WorkCalculator.calculateSalaryCheck({
			...user.toObject(),
			// Use company's wage offer instead of global constant
			base_salary_override: company.wage_offer
		});
		
		if (!salaryCheck.canWork) {
			throw new Error(salaryCheck.message || 'Cannot work');
		}
		
		const breakdown = salaryCheck.breakdown;
		
		// Use company's wage offer for gross calculation
		const grossSalary = FinancialMath.multiply(
			company.wage_offer,
			breakdown.modifiers.energyFactor
		);
		const grossSalary2 = FinancialMath.multiply(
			grossSalary,
			breakdown.modifiers.happinessFactor
		);
		const grossSalaryFinal = FinancialMath.multiply(
			grossSalary2,
			breakdown.modifiers.productivityMultiplier
		);
		const grossSalaryRounded = FinancialMath.round(grossSalaryFinal, 4);
		
		console.log(`[WorkService] 💵 Gross Salary: €${grossSalaryRounded}`);
		
		// ====================================================================
		// STEP 5: CHECK COMPANY SOLVENCY (CRITICAL!)
		// ====================================================================
		
		if (!company.canAffordSalary(grossSalaryRounded)) {
			console.log(`[WorkService] ❌ COMPANY INSOLVENCY!`);
			console.log(`[WorkService]    Required: €${grossSalaryRounded}`);
			console.log(`[WorkService]    Available: €${company.funds_euro}`);
			
			// Mark company as insolvent
			company.status = 'INSOLVENT';
			company.last_insolvency_at = new Date();
			await company.save();
			
			throw new Error(`Company "${company.name}" cannot afford to pay your salary. They are now insolvent. Please find a new job.`);
		}
		
		console.log('[WorkService] ✅ Company can afford salary');
		
		// ====================================================================
		// STEP 6: CALCULATE TAXES
		// ====================================================================
		
		console.log('[WorkService] 💸 Calculating taxes...');
		
		const WORK = gameConstants.WORK;
		
		// Government tax (15% of gross)
		const governmentTax = FinancialMath.multiply(
			grossSalaryRounded,
			WORK.INCOME_TAX_PERCENTAGE
		);
		const governmentTaxRounded = FinancialMath.round(governmentTax, 4);
		
		console.log(`[WorkService] 🏛️  Government Tax (15%): €${governmentTaxRounded}`);
		
		// Master/Referral tax (10% of government tax, if master exists)
		let masterTax = '0.0000';
		let masterTaxRounded = '0.0000';
		let governmentNetTax = governmentTaxRounded;
		let masterUser = null;
		
		if (user.master_id) {
			console.log('[WorkService] 👑 User has a master (referral system)');
			
			masterUser = await User.findById(user.master_id);
			
			if (masterUser) {
				// Master gets 10% of the government tax
				masterTax = FinancialMath.multiply(governmentTaxRounded, '0.10');
				masterTaxRounded = FinancialMath.round(masterTax, 4);
				
				// Government gets the remaining 90%
				governmentNetTax = FinancialMath.subtract(
					governmentTaxRounded,
					masterTaxRounded
				);
				
				console.log(`[WorkService] 👑 Master: ${masterUser.username}`);
				console.log(`[WorkService] 💰 Master Tax (10% of gov tax): €${masterTaxRounded}`);
				console.log(`[WorkService] 🏛️  Government Net Tax (90%): €${governmentNetTax}`);
			}
		}
		
		// Net salary (worker receives)
		const netSalary = FinancialMath.subtract(grossSalaryRounded, governmentTaxRounded);
		const netSalaryRounded = FinancialMath.round(netSalary, 4);
		
		console.log(`[WorkService] ✅ Net Salary (worker receives): €${netSalaryRounded}`);
		
		// ====================================================================
		// STEP 7: EXECUTE ACID TRANSACTION
		// ====================================================================
		
		console.log('[WorkService] 💳 Starting ACID transaction...');
		
		const session = await mongoose.startSession();
		session.startTransaction();
		
		try {
			// ================================================================
			// TRANSACTION STEP 1: Deduct from company
			// ================================================================
			
			console.log('[WorkService] 📤 Deducting from company...');
			
			company.deductSalary(grossSalaryRounded);
			await company.save({ session });
			
			console.log(`[WorkService] ✅ Company balance: €${company.funds_euro}`);
			
			// ================================================================
			// TRANSACTION STEP 2: Pay worker
			// ================================================================
			
			console.log('[WorkService] 📥 Paying worker...');
			
			user.balance_euro = FinancialMath.add(user.balance_euro, netSalaryRounded);
			
			console.log(`[WorkService] ✅ Worker balance: €${user.balance_euro}`);
			
			// ================================================================
			// TRANSACTION STEP 3: Collect government tax
			// ================================================================
			
			console.log('[WorkService] 🏛️  Collecting government tax...');
			
			const treasury = await Treasury.findOne({ session });
			if (!treasury) {
				throw new Error('Treasury not found');
			}
			
			treasury.collected_work_tax_euro = FinancialMath.add(
				treasury.collected_work_tax_euro,
				governmentNetTax
			);
			treasury.total_collected = FinancialMath.add(
				treasury.total_collected,
				governmentNetTax
			);
			
			await treasury.save({ session });
			
			console.log(`[WorkService] ✅ Treasury collected: €${governmentNetTax}`);
			
			// ================================================================
			// TRANSACTION STEP 4: Pay master (if exists)
			// ================================================================
			
			if (masterUser && FinancialMath.compare(masterTaxRounded, '0.0000') > 0) {
				console.log('[WorkService] 👑 Paying master referral bonus...');
				
				masterUser.balance_euro = FinancialMath.add(
					masterUser.balance_euro,
					masterTaxRounded
				);
				masterUser.total_referral_earnings_euro = FinancialMath.add(
					masterUser.total_referral_earnings_euro,
					masterTaxRounded
				);
				
				await masterUser.save({ session });
				
				console.log(`[WorkService] ✅ Master received: €${masterTaxRounded}`);
			}
			
			// ================================================================
			// TRANSACTION STEP 5: Update user stats
			// ================================================================
			
			console.log('[WorkService] 📊 Updating user stats...');
			
			// Deduct energy
			user.energy = Math.max(0, user.energy - WORK.ENERGY_COST);
			
			// Update work stats
			user.last_work_at = new Date();
			user.total_shifts_worked += 1;
			user.total_work_earnings_euro = FinancialMath.add(
				user.total_work_earnings_euro,
				netSalaryRounded
			);
			
			// Update general economy stats
			user.total_transactions += 1;
			user.total_volume_euro = FinancialMath.add(
				user.total_volume_euro,
				netSalaryRounded
			);
			user.last_transaction_at = new Date();
			
			await user.save({ session });
			
			console.log(`[WorkService] ✅ User stats updated`);
			console.log(`[WorkService]    Energy: ${user.energy} (-${WORK.ENERGY_COST})`);
			console.log(`[WorkService]    Total Shifts: ${user.total_shifts_worked}`);
			
			// ================================================================
			// TRANSACTION STEP 6: Create Ledger entries (Audit Trail)
			// ================================================================
			
			console.log('[WorkService] 📜 Creating ledger entries...');
			
			// Ledger: Company → Worker (gross payment)
			await Ledger.create([{
				type: 'WORK_PAYMENT',
				from_user: company.owner_id,  // Company owner
				to_user: user._id,
				amount_euro: grossSalaryRounded,
				tax_euro: governmentTaxRounded,
				net_amount_euro: netSalaryRounded,
				company_id: company._id,
				company_name: company.name,
				description: `Work payment from ${company.name}`,
				metadata: {
					wage_offer: company.wage_offer,
					energy_factor: breakdown.modifiers.energyFactor,
					happiness_factor: breakdown.modifiers.happinessFactor,
					productivity: breakdown.modifiers.productivityMultiplier,
					energy_cost: WORK.ENERGY_COST,
					exhaustion_penalty: breakdown.modifiers.exhaustionPenaltyApplied,
					depression_penalty: breakdown.modifiers.depressionPenaltyApplied
				}
			}], { session });
			
			// Ledger: Worker → Government (tax)
			await Ledger.create([{
				type: 'TAX_COLLECTION',
				from_user: user._id,
				to_user: null,  // Treasury (system)
				amount_euro: governmentNetTax,
				tax_euro: '0.0000',
				net_amount_euro: governmentNetTax,
				description: `Income tax from work at ${company.name}`,
				metadata: {
					tax_type: 'WORK_INCOME_TAX',
					tax_rate: WORK.INCOME_TAX_PERCENTAGE,
					gross_salary: grossSalaryRounded
				}
			}], { session });
			
			// Ledger: Worker → Master (referral bonus) - if applicable
			if (masterUser && FinancialMath.compare(masterTaxRounded, '0.0000') > 0) {
				await Ledger.create([{
					type: 'REFERRAL_BONUS',
					from_user: user._id,
					to_user: masterUser._id,
					amount_euro: masterTaxRounded,
					tax_euro: '0.0000',
					net_amount_euro: masterTaxRounded,
					description: `Referral bonus from ${user.username}'s work`,
					metadata: {
						referral_type: 'WORK_TAX_SHARE',
						referral_percentage: '0.10',
						total_tax: governmentTaxRounded
					}
				}], { session });
			}
			
			console.log('[WorkService] ✅ Ledger entries created');
			
			// ================================================================
			// COMMIT TRANSACTION
			// ================================================================
			
			await session.commitTransaction();
			console.log('[WorkService] ✅ Transaction committed');
			
		} catch (error) {
			// Rollback transaction on error
			await session.abortTransaction();
			console.error('[WorkService] ❌ Transaction failed, rolled back:', error);
			throw error;
			
		} finally {
			session.endSession();
		}
		
		// ====================================================================
		// STEP 8: BUILD RESPONSE (The Receipt)
		// ====================================================================
		
		console.log('[WorkService] 📄 Building response...');
		
		const response = {
			success: true,
			message: `You worked at ${company.name} and earned €${netSalaryRounded}!`,
			
			company: {
				name: company.name,
				type: company.type,
				wage_offer: company.wage_offer,
				remaining_funds: company.funds_euro
			},
			
			earnings: {
				gross: grossSalaryRounded,
				net: netSalaryRounded,
				taxes: {
					government: governmentNetTax,
					master: masterTaxRounded,
					total: governmentTaxRounded
				}
			},
			
			modifiers: {
				energy_factor: breakdown.modifiers.energyFactor,
				happiness_factor: breakdown.modifiers.happinessFactor,
				productivity: breakdown.modifiers.productivityMultiplier,
				combined_efficiency: breakdown.efficiency.combinedPercentage,
				exhaustion_penalty: breakdown.modifiers.exhaustionPenaltyApplied,
				depression_penalty: breakdown.modifiers.depressionPenaltyApplied
			},
			
			costs: {
				energy_consumed: WORK.ENERGY_COST,
				energy_remaining: user.energy
			},
			
			stats: {
				total_shifts_worked: user.total_shifts_worked,
				total_work_earnings: user.total_work_earnings_euro,
				current_balance: user.balance_euro
			},
			
			master: masterUser ? {
				username: masterUser.username,
				bonus_received: masterTaxRounded
			} : null,
			
			next_work_available_at: new Date(Date.now() + (WORK.COOLDOWN_HOURS * 60 * 60 * 1000))
		};
		
		console.log('[WorkService] ========================================');
		console.log('[WorkService] ✅ Work shift complete!');
		console.log(`[WorkService] 💰 Net Earned: €${netSalaryRounded}`);
		console.log(`[WorkService] ⚡ Energy: ${user.energy}/${100}`);
		console.log('[WorkService] ========================================');
		
		return response;
	}
}

module.exports = WorkService;
