/**
 * ============================================================================
 * GAME CONSTANTS - CENTRAL CONFIGURATION
 * ============================================================================
 * 
 * All game balance values in one place for easy tuning.
 * 
 * CRITICAL: Financial values use strings (Decimal128 compatible)
 * CRITICAL: Percentages use strings for precision (0.15 = 15%)
 * 
 * Module: 2.2.A - Smart Productivity Algorithm
 * 
 * @version 1.0.0
 * @date 2026-02-12
 */

module.exports = {
	/**
	 * ========================================================================
	 * WORK SYSTEM (Module 2.2.A)
	 * ========================================================================
	 * 
	 * The "Salary Brain" - Complex economic algorithm with:
	 * - Non-linear productivity scaling
	 * - Exhaustion penalties
	 * - Depression penalties
	 * - Progressive taxation
	 * - Energy consumption
	 */
	WORK: {
		// ====================================================================
		// BASE ECONOMICS
		// ====================================================================
		
		/**
		 * Base gross salary (before modifiers and taxes)
		 * This is the "standard" hourly wage for a healthy, happy worker
		 * 
		 * Formula: ACTUAL_SALARY = BASE * EnergyFactor * HappinessFactor * Productivity
		 */
		BASE_SALARY_EURO: '10.0000',
		
		/**
		 * Energy consumed per work shift
		 * Working is exhausting! Players must manage energy carefully.
		 */
		ENERGY_COST: 10,
		
		/**
		 * Minimum energy required to work
		 * Below this threshold, player is too exhausted to work
		 * 
		 * Design: Players must maintain at least 10% energy to be productive
		 */
		MIN_ENERGY_REQUIRED: 10,
		
		/**
		 * Cooldown between work shifts (in hours)
		 * Prevents spam-working and forces strategic timing
		 * 
		 * Design: One work shift per day encourages daily login
		 */
		COOLDOWN_HOURS: 24,
		
		// ====================================================================
		// TAXATION (Government Revenue)
		// ====================================================================
		
		/**
		 * Income tax percentage (flat tax for simplicity)
		 * Government takes 15% of gross income
		 * 
		 * Design: Balances player income vs. treasury growth
		 * Future: Can become progressive (higher earners pay more)
		 */
		INCOME_TAX_PERCENTAGE: '0.15',  // 15%
		
		// ====================================================================
		// EXHAUSTION SYSTEM (Energy Penalties)
		// ====================================================================
		
		/**
		 * Energy threshold below which exhaustion penalties apply
		 * Players working while tired are less productive
		 * 
		 * Design: Encourages energy management (food, rest)
		 */
		EXHAUSTION_THRESHOLD: 50,  // 50 energy (50%)
		
		/**
		 * Productivity penalty when exhausted
		 * Player receives only 85% of what they would normally earn
		 * 
		 * Example: 40 energy normally = 40% productivity
		 *          With penalty: 40% * 0.85 = 34% productivity
		 * 
		 * Design: Significant but not devastating
		 * Players can still work, but at reduced efficiency
		 */
		EXHAUSTION_PENALTY: '0.85',  // 85% efficiency (15% penalty)
		
		// ====================================================================
		// DEPRESSION SYSTEM (Happiness Penalties)
		// ====================================================================
		
		/**
		 * Happiness threshold below which depression penalties apply
		 * Severely unhappy players suffer massive productivity loss
		 * 
		 * Design: Happiness matters! Players must engage in fun activities
		 */
		CRITICAL_HAPPINESS_THRESHOLD: 20,  // 20 happiness (20%)
		
		/**
		 * Productivity penalty when depressed
		 * Player receives only 50% of what they would normally earn
		 * This represents a "mental strike" - unable to focus
		 * 
		 * Design: SEVERE penalty to encourage happiness management
		 * Depression is a serious debuff that must be avoided
		 */
		DEPRESSION_PENALTY: '0.50',  // 50% efficiency (50% penalty)
		
		// ====================================================================
		// FUTURE EXTENSIONS (Placeholders)
		// ====================================================================
		
		/**
		 * Minimum productivity multiplier (future: skills, training)
		 * Players start at 1.0 (100%) and can improve through gameplay
		 */
		MIN_PRODUCTIVITY_MULTIPLIER: '1.0000',
		
		/**
		 * Maximum productivity multiplier (future: prevent exploits)
		 * Cap at 5x base salary (highly skilled workers)
		 */
		MAX_PRODUCTIVITY_MULTIPLIER: '5.0000',
		
		/**
		 * Bonus for working at optimal conditions
		 * Future: Extra reward for working at high energy + happiness
		 */
		OPTIMAL_CONDITIONS_BONUS: '0.10',  // +10% when energy>80 AND happiness>80
		
		/**
		 * Overtime multiplier (future: work multiple times per day)
		 * Future: Allow paying gems to work extra shifts at reduced rate
		 */
		OVERTIME_PENALTY: '0.75',  // 75% efficiency for overtime shifts
	},
	
	/**
	 * ========================================================================
	 * LIFE SIMULATION (Module 2.1.B - Reference)
	 * ========================================================================
	 */
	ENTROPY: {
		ENERGY_DECAY: 5,           // -5 energy per hour
		HAPPINESS_DECAY: 2,        // -2 happiness per hour
		HEALTH_DAMAGE_EXHAUSTED: 10,   // -10 health per hour if exhausted
		HEALTH_DAMAGE_DEPRESSED: 5,    // -5 health per hour if depressed
	},
	
	/**
	 * ========================================================================
	 * GAME VERSION
	 * ========================================================================
	 */
	GAME_VERSION: 'Alpha 0.2.1',
	
	/**
	 * ========================================================================
	 * DECIMAL PRECISION
	 * ========================================================================
	 */
	DECIMAL_PLACES: 4,  // All financial calculations to 4 decimals
};
