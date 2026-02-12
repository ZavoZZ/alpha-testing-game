/**
 * Services exports for Economy Server
 */

const EconomyEngine = require('./EconomyEngine');
const FinancialMath = require('./FinancialMath');
const GameClock = require('./GameClock');
const WorkCalculator = require('./WorkCalculator'); // Module 2.2.A - The Salary Brain

module.exports = {
	EconomyEngine,
	FinancialMath,
	GameClock,
	WorkCalculator
};
