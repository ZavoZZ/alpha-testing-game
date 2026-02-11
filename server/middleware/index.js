/**
 * =============================================================================
 * MIDDLEWARE EXPORTS - CENTRALIZED ACCESS
 * =============================================================================
 * 
 * Central export point for all server middleware.
 * 
 * @version 1.0.0
 * @date 2026-02-11
 */

const {
	validateFinancialPayload,
	economyRateLimiter,
	extractClientIP
} = require('./AntiFraudShield');

module.exports = {
	// Anti-Fraud Shield
	validateFinancialPayload,
	economyRateLimiter,
	extractClientIP
};
