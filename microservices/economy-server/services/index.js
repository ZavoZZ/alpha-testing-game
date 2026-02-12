/**
 * Services exports for Economy Server
 */

const EconomyEngine = require('./EconomyEngine');
const FinancialMath = require('./FinancialMath');
const GameClock = require('./GameClock');
const WorkCalculator = require('./WorkCalculator'); // Module 2.2.A
const WorkService = require('./WorkService'); // Module 2.2.B

module.exports = {
	EconomyEngine,
	FinancialMath,
	GameClock,
	WorkCalculator,
	WorkService
};
