/**
 * =============================================================================
 * DATABASE MODELS - ENTERPRISE ECONOMIC SYSTEM
 * =============================================================================
 * 
 * This file exports all Mongoose models for the Zero-Sum P2P economy.
 * 
 * MODELS:
 * - User: Player accounts with Decimal128 financial balances
 * - Treasury: Singleton model for government tax collections
 * - Ledger: Immutable blockchain-style transaction audit trail
 * 
 * PRECISION GUARANTEE:
 * All monetary amounts use Decimal128 to prevent JavaScript floating-point errors.
 * 
 * IMMUTABILITY:
 * Ledger transactions cannot be modified or deleted after creation.
 * 
 * @version 2.0.0
 * @date 2026-02-11
 */

const User = require('./User');
const Treasury = require('./Treasury');
const Ledger = require('./Ledger');

module.exports = {
	User,
	Treasury,
	Ledger
};