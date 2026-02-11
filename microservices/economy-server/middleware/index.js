/**
 * Middleware exports for Economy Server
 */

const {
	validateFinancialPayload,
	economyRateLimiter,
	extractClientIP
} = require('./AntiFraudShield');

const {
	verifyToken,
	verifyAdmin,
	verifyModerator
} = require('./auth');

module.exports = {
	// Anti-Fraud Shield
	validateFinancialPayload,
	economyRateLimiter,
	extractClientIP,
	
	// Authentication
	verifyToken,
	verifyAdmin,
	verifyModerator
};
