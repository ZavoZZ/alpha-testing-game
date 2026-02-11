/**
 * =============================================================================
 * SERVICES - CENTRALIZED EXPORT
 * =============================================================================
 * 
 * This file exports all service modules for the economic system.
 * 
 * SERVICES:
 * - FinancialMath: Decimal128 precision mathematical operations
 * - EconomyEngine: ACID transaction processor (heart of the economy)
 * 
 * USAGE:
 * const { EconomyEngine, FinancialMath } = require('./services');
 * 
 * @version 1.0.0
 * @date 2026-02-11
 */

const EconomyEngine = require('./EconomyEngine');
const FinancialMath = require('./FinancialMath');

module.exports = {
	EconomyEngine,
	FinancialMath
};
