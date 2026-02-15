/**
 * Services exports for Economy Server
 */

const EconomyEngine = require('./EconomyEngine');
const FinancialMath = require('./FinancialMath');
const GameClock = require('./GameClock');
const WorkCalculator = require('./WorkCalculator'); // Module 2.2.A
const WorkService = require('./WorkService'); // Module 2.2.B
const MarketplaceService = require('./MarketplaceService'); // Module 2.3.C
const ConsumptionService = require('./ConsumptionService'); // Module 2.3.C

module.exports = {
	EconomyEngine,
	FinancialMath,
	GameClock,
	WorkCalculator,
	WorkService,
	MarketplaceService,
	ConsumptionService
};
