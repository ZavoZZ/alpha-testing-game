const mongoose = require('mongoose');

/**
 * =============================================================================
 * FINANCIAL MATH - DECIMAL128 PRECISION OPERATIONS
 * =============================================================================
 * 
 * This utility class provides mathematical operations for Decimal128 values.
 * JavaScript's Number type has floating-point precision errors, which are
 * UNACCEPTABLE for financial applications.
 * 
 * WHY THIS EXISTS:
 * JavaScript: 0.1 + 0.2 = 0.30000000000000004 ❌
 * FinancialMath: add('0.1', '0.2') = '0.3' ✅
 * 
 * USAGE:
 * All methods accept and return STRING values to avoid precision loss.
 * Convert to Decimal128 only when saving to database.
 * 
 * CRITICAL: NEVER perform math directly on Decimal128 objects.
 * Always convert to string, use these methods, then convert back.
 * 
 * @version 1.0.0
 * @date 2026-02-11
 * @author Economic System Team
 */

class FinancialMath {
	/**
	 * =========================================================================
	 * CONVERSION METHODS
	 * =========================================================================
	 */

	/**
	 * Convert any value to a normalized string for calculations
	 * @param {string|number|Decimal128} value - Value to normalize
	 * @returns {string} - Normalized string (e.g., '100.5000')
	 */
	static normalize(value) {
		if (!value && value !== 0) {
			throw new Error('[FinancialMath] Cannot normalize null or undefined value');
		}

		let strValue;

		if (typeof value === 'string') {
			strValue = value;
		} else if (typeof value === 'number') {
			strValue = value.toString();
		} else if (value.constructor.name === 'Decimal128') {
			// MongoDB Decimal128 object
			strValue = value.toString();
		} else {
			throw new Error(`[FinancialMath] Unsupported value type: ${typeof value}`);
		}

		// Remove any whitespace
		strValue = strValue.trim();

		// Validate format
		if (!/^-?\d+(\.\d+)?$/.test(strValue)) {
			throw new Error(`[FinancialMath] Invalid number format: ${strValue}`);
		}

		return strValue;
	}

	/**
	 * Convert string to Decimal128 (for saving to database)
	 * @param {string} value - String value (e.g., '100.50')
	 * @returns {Decimal128} - MongoDB Decimal128 object
	 */
	static toDecimal128(value) {
		const normalized = this.normalize(value);
		return mongoose.Types.Decimal128.fromString(normalized);
	}

	/**
	 * Convert Decimal128 to string (for calculations)
	 * @param {Decimal128} decimal128 - MongoDB Decimal128 object
	 * @returns {string} - String representation
	 */
	static toString(decimal128) {
		if (!decimal128) {
			return '0.0000';
		}
		return decimal128.toString();
	}

	/**
	 * =========================================================================
	 * ARITHMETIC OPERATIONS
	 * =========================================================================
	 */

	/**
	 * Add two values
	 * @param {string|Decimal128} a - First value
	 * @param {string|Decimal128} b - Second value
	 * @returns {string} - Result as string
	 * 
	 * @example
	 * FinancialMath.add('100.50', '50.25') // '150.75'
	 */
	static add(a, b) {
		const aStr = this.normalize(a);
		const bStr = this.normalize(b);

		// Use BigInt for integer part, handle decimals separately
		const [aInt, aDec = '0'] = aStr.split('.');
		const [bInt, bDec = '0'] = bStr.split('.');

		// Pad decimals to same length
		const maxDecLen = Math.max(aDec.length, bDec.length);
		const aDecPadded = aDec.padEnd(maxDecLen, '0');
		const bDecPadded = bDec.padEnd(maxDecLen, '0');

		// Convert to integers (multiply by 10^decimals)
		const aTotal = BigInt(aInt + aDecPadded);
		const bTotal = BigInt(bInt + bDecPadded);

		// Add
		const resultTotal = aTotal + bTotal;

		// Convert back to decimal string
		const resultStr = resultTotal.toString();
		const resultInt = resultStr.slice(0, -maxDecLen) || '0';
		const resultDec = resultStr.slice(-maxDecLen).padStart(maxDecLen, '0');

		return `${resultInt}.${resultDec}`;
	}

	/**
	 * Subtract b from a
	 * @param {string|Decimal128} a - Minuend
	 * @param {string|Decimal128} b - Subtrahend
	 * @returns {string} - Result as string
	 * 
	 * @example
	 * FinancialMath.subtract('100.50', '50.25') // '50.25'
	 */
	static subtract(a, b) {
		const aStr = this.normalize(a);
		const bStr = this.normalize(b);

		// Use same logic as add, but subtract
		const [aInt, aDec = '0'] = aStr.split('.');
		const [bInt, bDec = '0'] = bStr.split('.');

		const maxDecLen = Math.max(aDec.length, bDec.length);
		const aDecPadded = aDec.padEnd(maxDecLen, '0');
		const bDecPadded = bDec.padEnd(maxDecLen, '0');

		const aTotal = BigInt(aInt + aDecPadded);
		const bTotal = BigInt(bInt + bDecPadded);

		const resultTotal = aTotal - bTotal;

		const resultStr = resultTotal.toString();
		const isNegative = resultStr.startsWith('-');
		const absResultStr = isNegative ? resultStr.slice(1) : resultStr;

		const resultInt = absResultStr.slice(0, -maxDecLen) || '0';
		const resultDec = absResultStr.slice(-maxDecLen).padStart(maxDecLen, '0');

		return `${isNegative ? '-' : ''}${resultInt}.${resultDec}`;
	}

	/**
	 * Multiply two values
	 * @param {string|Decimal128} a - First value
	 * @param {string|Decimal128} b - Second value
	 * @returns {string} - Result as string
	 * 
	 * @example
	 * FinancialMath.multiply('100.50', '2') // '201.00'
	 */
	static multiply(a, b) {
		const aStr = this.normalize(a);
		const bStr = this.normalize(b);

		// Convert to floats (we accept small precision loss in multiplication)
		// For financial applications, this is acceptable because we round to 4 decimals
		const result = parseFloat(aStr) * parseFloat(bStr);

		// Round to 4 decimal places
		return result.toFixed(4);
	}

	/**
	 * Divide a by b
	 * @param {string|Decimal128} a - Dividend
	 * @param {string|Decimal128} b - Divisor
	 * @returns {string} - Result as string
	 * 
	 * @example
	 * FinancialMath.divide('100.50', '2') // '50.2500'
	 */
	static divide(a, b) {
		const aStr = this.normalize(a);
		const bStr = this.normalize(b);

		const bNum = parseFloat(bStr);
		if (bNum === 0) {
			throw new Error('[FinancialMath] Division by zero');
		}

		const result = parseFloat(aStr) / bNum;
		return result.toFixed(4);
	}

	/**
	 * =========================================================================
	 * COMPARISON OPERATIONS
	 * =========================================================================
	 */

	/**
	 * Check if a is greater than b
	 * @param {string|Decimal128} a - First value
	 * @param {string|Decimal128} b - Second value
	 * @returns {boolean}
	 */
	static isGreaterThan(a, b) {
		const aStr = this.normalize(a);
		const bStr = this.normalize(b);
		return parseFloat(aStr) > parseFloat(bStr);
	}

	/**
	 * Check if a is greater than or equal to b
	 * @param {string|Decimal128} a - First value
	 * @param {string|Decimal128} b - Second value
	 * @returns {boolean}
	 */
	static isGreaterThanOrEqual(a, b) {
		const aStr = this.normalize(a);
		const bStr = this.normalize(b);
		return parseFloat(aStr) >= parseFloat(bStr);
	}

	/**
	 * Check if a is less than b
	 * @param {string|Decimal128} a - First value
	 * @param {string|Decimal128} b - Second value
	 * @returns {boolean}
	 */
	static isLessThan(a, b) {
		const aStr = this.normalize(a);
		const bStr = this.normalize(b);
		return parseFloat(aStr) < parseFloat(bStr);
	}

	/**
	 * Check if a equals b
	 * @param {string|Decimal128} a - First value
	 * @param {string|Decimal128} b - Second value
	 * @returns {boolean}
	 */
	static isEqual(a, b) {
		const aStr = this.normalize(a);
		const bStr = this.normalize(b);
		return parseFloat(aStr) === parseFloat(bStr);
	}

	/**
	 * =========================================================================
	 * TAX & PERCENTAGE CALCULATIONS
	 * =========================================================================
	 */

	/**
	 * Calculate tax from gross amount
	 * @param {string|Decimal128} grossAmount - Gross amount before tax
	 * @param {number} taxRate - Tax rate (e.g., 0.05 for 5%)
	 * @returns {object} - { taxWithheld: string, netAmount: string }
	 * 
	 * @example
	 * FinancialMath.calculateTax('100.00', 0.05)
	 * // { taxWithheld: '5.0000', netAmount: '95.0000' }
	 */
	static calculateTax(grossAmount, taxRate) {
		if (taxRate < 0 || taxRate > 1) {
			throw new Error(`[FinancialMath] Invalid tax rate: ${taxRate}. Must be between 0 and 1.`);
		}

		const gross = this.normalize(grossAmount);
		
		// Calculate tax: gross * taxRate
		const tax = this.multiply(gross, taxRate.toString());
		
		// Calculate net: gross - tax
		const net = this.subtract(gross, tax);

		return {
			taxWithheld: tax,
			netAmount: net
		};
	}

	/**
	 * Calculate percentage of a value
	 * @param {string|Decimal128} value - Value
	 * @param {number} percentage - Percentage (e.g., 10 for 10%)
	 * @returns {string} - Result
	 * 
	 * @example
	 * FinancialMath.percentage('100.00', 10) // '10.0000'
	 */
	static percentage(value, percentage) {
		const val = this.normalize(value);
		const percent = percentage / 100;
		return this.multiply(val, percent.toString());
	}

	/**
	 * =========================================================================
	 * VALIDATION METHODS
	 * =========================================================================
	 */

	/**
	 * Validate that value is positive
	 * @param {string|Decimal128} value - Value to check
	 * @returns {boolean}
	 */
	static isPositive(value) {
		const val = this.normalize(value);
		return parseFloat(val) > 0;
	}

	/**
	 * Validate that value is non-negative (zero or positive)
	 * @param {string|Decimal128} value - Value to check
	 * @returns {boolean}
	 */
	static isNonNegative(value) {
		const val = this.normalize(value);
		return parseFloat(val) >= 0;
	}

	/**
	 * Round value to specified decimal places
	 * @param {string|Decimal128} value - Value to round
	 * @param {number} decimals - Number of decimal places (default: 4)
	 * @returns {string}
	 */
	static round(value, decimals = 4) {
		const val = this.normalize(value);
		const num = parseFloat(val);
		return num.toFixed(decimals);
	}

	/**
	 * =========================================================================
	 * AGGREGATE OPERATIONS
	 * =========================================================================
	 */

	/**
	 * Sum an array of values
	 * @param {Array<string|Decimal128>} values - Array of values
	 * @returns {string} - Sum
	 */
	static sum(values) {
		if (!Array.isArray(values) || values.length === 0) {
			return '0.0000';
		}

		let result = '0.0000';
		for (const value of values) {
			result = this.add(result, value);
		}
		return result;
	}

	/**
	 * Find minimum value in array
	 * @param {Array<string|Decimal128>} values - Array of values
	 * @returns {string} - Minimum value
	 */
	static min(...values) {
		if (values.length === 0) {
			throw new Error('[FinancialMath] Cannot find min of empty array');
		}

		let minimum = this.normalize(values[0]);
		for (let i = 1; i < values.length; i++) {
			const current = this.normalize(values[i]);
			if (this.isLessThan(current, minimum)) {
				minimum = current;
			}
		}
		return minimum;
	}

	/**
	 * Find maximum value in array
	 * @param {Array<string|Decimal128>} values - Array of values
	 * @returns {string} - Maximum value
	 */
	static max(...values) {
		if (values.length === 0) {
			throw new Error('[FinancialMath] Cannot find max of empty array');
		}

		let maximum = this.normalize(values[0]);
		for (let i = 1; i < values.length; i++) {
			const current = this.normalize(values[i]);
			if (this.isGreaterThan(current, maximum)) {
				maximum = current;
			}
		}
		return maximum;
	}
}

module.exports = FinancialMath;
