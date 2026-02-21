/**
 * Decimal Utilities - Conversie și formatare Decimal128 MongoDB
 *
 * MongoDB stochează valori Decimal128 care nu pot fi randate direct în React.
 * Acest modul oferă funcții pentru conversie și formatare.
 *
 * @module decimal-utils
 * @author AI Assistant
 * @version 1.0.0
 */

/**
 * Convertește un obiect Decimal128 MongoDB la number
 *
 * @param {*} value - Valoare care poate fi:
 *   - Object cu {$numberDecimal: "123.45"} (din JSON serializat)
 *   - Decimal128 object (din MongoDB direct)
 *   - String "123.45"
 *   - Number 123.45
 * @returns {number} - Valoarea numerică (0 dacă invalid)
 *
 * @example
 * toNumber({$numberDecimal: "100.5000"}) // 100.5
 * toNumber("50.25") // 50.25
 * toNumber(null) // 0
 */
export const toNumber = (value) => {
	// Handle null/undefined
	if (value === null || value === undefined) {
		return 0;
	}

	// Dacă e obiect cu $numberDecimal (din JSON serializat)
	if (typeof value === 'object' && value.$numberDecimal !== undefined) {
		const parsed = parseFloat(value.$numberDecimal);
		return isNaN(parsed) ? 0 : parsed;
	}

	// Dacă e string
	if (typeof value === 'string') {
		const parsed = parseFloat(value);
		return isNaN(parsed) ? 0 : parsed;
	}

	// Dacă e deja number
	if (typeof value === 'number') {
		return isNaN(value) ? 0 : value;
	}

	// Dacă e obiect Decimal128 (din MongoDB direct - are method toString)
	if (typeof value === 'object' && typeof value.toString === 'function') {
		try {
			const str = value.toString();
			const parsed = parseFloat(str);
			return isNaN(parsed) ? 0 : parsed;
		} catch (e) {
			return 0;
		}
	}

	return 0;
};

/**
 * Convertește un număr la string cu un număr specificat de zecimale
 *
 * @param {*} value - Valoarea de convertit
 * @param {number} decimals - Numărul de zecimale (default: 2)
 * @returns {string} - Valoarea formatată
 *
 * @example
 * toFixed({$numberDecimal: "100.5"}, 4) // "100.5000"
 * toFixed(50.256, 2) // "50.26"
 */
export const toFixed = (value, decimals = 2) => {
	const num = toNumber(value);
	return num.toFixed(decimals);
};

/**
 * Formatează un număr ca valută
 *
 * @param {*} value - Valoarea numerică
 * @param {string} currency - Codul monedei (EUR, RON, GOLD)
 * @param {string} locale - Locale pentru formatare (default: ro-RO)
 * @returns {string} - Valoare formatată
 *
 * @example
 * formatCurrency({$numberDecimal: "100.50"}, 'EUR') // "100,50 €"
 * formatCurrency(1000, 'RON') // "1.000,00 RON"
 */
export const formatCurrency = (value, currency = 'EUR', locale = 'ro-RO') => {
	const num = toNumber(value);

	// Pentru GOLD, folosim un format simplu
	if (currency === 'GOLD') {
		return `${num.toFixed(4)} GOLD`;
	}

	try {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 4,
		}).format(num);
	} catch (e) {
		// Fallback dacă currency nu e valid
		return `${num.toFixed(2)} ${currency}`;
	}
};

/**
 * Formatează un număr cu separator de mii
 *
 * @param {*} value - Valoarea numerică
 * @param {number} decimals - Numărul de zecimale (default: 2)
 * @param {string} locale - Locale pentru formatare (default: ro-RO)
 * @returns {string} - Valoare formatată
 *
 * @example
 * formatNumber(1000000.5) // "1.000.000,50"
 */
export const formatNumber = (value, decimals = 2, locale = 'ro-RO') => {
	const num = toNumber(value);
	return new Intl.NumberFormat(locale, {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(num);
};

/**
 * Convertește recursiv toate câmpurile Decimal128 dintr-un obiect
 *
 * @param {*} obj - Obiectul de convertit
 * @returns {*} - Obiectul cu valorile convertite
 *
 * @example
 * convertDecimals({
 *   balance: {$numberDecimal: "100.50"},
 *   items: [{price: {$numberDecimal: "10.00"}}]
 * })
 * // {balance: 100.5, items: [{price: 10}]}
 */
export const convertDecimals = (obj) => {
	// Handle primitives
	if (obj === null || obj === undefined) {
		return obj;
	}

	// Handle arrays
	if (Array.isArray(obj)) {
		return obj.map(convertDecimals);
	}

	// Handle objects
	if (typeof obj === 'object') {
		// Verifică dacă e un $numberDecimal
		if (obj.$numberDecimal !== undefined) {
			return toNumber(obj);
		}

		// Convertește recursiv toate proprietățile
		const result = {};
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				result[key] = convertDecimals(obj[key]);
			}
		}
		return result;
	}

	// Return primitives as-is
	return obj;
};

/**
 * Verifică dacă o valoare este Decimal128
 *
 * @param {*} value - Valoarea de verificat
 * @returns {boolean} - true dacă e Decimal128
 */
export const isDecimal128 = (value) => {
	if (value === null || value === undefined) {
		return false;
	}

	// Obiect cu $numberDecimal
	if (typeof value === 'object' && value.$numberDecimal !== undefined) {
		return true;
	}

	// Decimal128 object din MongoDB
	if (
		typeof value === 'object' &&
		value.constructor &&
		value.constructor.name === 'Decimal128'
	) {
		return true;
	}

	return false;
};

/**
 * Adună două valori Decimal128
 *
 * @param {*} a - Prima valoare
 * @param {*} b - A doua valoare
 * @returns {number} - Suma
 */
export const addDecimals = (a, b) => {
	return toNumber(a) + toNumber(b);
};

/**
 * Scade două valori Decimal128
 *
 * @param {*} a - Prima valoare
 * @param {*} b - A doua valoare
 * @returns {number} - Diferența
 */
export const subtractDecimals = (a, b) => {
	return toNumber(a) - toNumber(b);
};

/**
 * Înmulțește două valori Decimal128
 *
 * @param {*} a - Prima valoare
 * @param {*} b - A doua valoare
 * @returns {number} - Produsul
 */
export const multiplyDecimals = (a, b) => {
	return toNumber(a) * toNumber(b);
};

/**
 * Împarte două valori Decimal128
 *
 * @param {*} a - Numărătorul
 * @param {*} b - Numitorul
 * @returns {number} - Câtul (0 dacă împărțire la 0)
 */
export const divideDecimals = (a, b) => {
	const divisor = toNumber(b);
	if (divisor === 0) {
		return 0;
	}
	return toNumber(a) / divisor;
};

/**
 * Compară două valori Decimal128
 *
 * @param {*} a - Prima valoare
 * @param {*} b - A doua valoare
 * @returns {number} - -1 dacă a < b, 0 dacă a == b, 1 dacă a > b
 */
export const compareDecimals = (a, b) => {
	const numA = toNumber(a);
	const numB = toNumber(b);

	if (numA < numB) return -1;
	if (numA > numB) return 1;
	return 0;
};

// Export default cu toate funcțiile
export default {
	toNumber,
	toFixed,
	formatCurrency,
	formatNumber,
	convertDecimals,
	isDecimal128,
	addDecimals,
	subtractDecimals,
	multiplyDecimals,
	divideDecimals,
	compareDecimals,
};
