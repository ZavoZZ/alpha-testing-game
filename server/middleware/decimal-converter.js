/**
 * Decimal Converter Middleware
 *
 * Convertește automat toate valorile Decimal128 din răspunsurile API
 * în numere pentru a preveni erorile React.
 *
 * @module decimal-converter
 */

/**
 * Convertește un obiect Decimal128 la number
 * @param {*} value - Valoarea de convertit
 * @returns {*} - Valoarea convertită
 */
const toNumber = (value) => {
	if (value === null || value === undefined) {
		return value;
	}

	// Dacă e obiect cu $numberDecimal (din JSON serializat)
	if (typeof value === 'object' && value.$numberDecimal !== undefined) {
		const parsed = parseFloat(value.$numberDecimal);
		return isNaN(parsed) ? 0 : parsed;
	}

	// Dacă e string
	if (typeof value === 'string') {
		const parsed = parseFloat(value);
		return isNaN(parsed) ? value : parsed;
	}

	// Dacă e deja number
	if (typeof value === 'number') {
		return value;
	}

	// Dacă e obiect Decimal128 (din MongoDB direct)
	if (typeof value === 'object' && typeof value.toString === 'function') {
		try {
			// Verifică dacă arată ca un Decimal128
			const str = value.toString();
			if (/^\d+\.?\d*$/.test(str)) {
				return parseFloat(str);
			}
		} catch (e) {
			// Nu e Decimal128
		}
	}

	return value;
};

/**
 * Convertește recursiv toate valorile Decimal128 dintr-un obiect
 * @param {*} obj - Obiectul de convertit
 * @returns {*} - Obiectul cu valorile convertite
 */
const convertDecimals = (obj) => {
	// Handle primitives
	if (obj === null || obj === undefined) {
		return obj;
	}

	// Handle arrays
	if (Array.isArray(obj)) {
		return obj.map(convertDecimals);
	}

	// Handle Date
	if (obj instanceof Date) {
		return obj;
	}

	// Handle objects
	if (typeof obj === 'object') {
		// Verifică dacă e un $numberDecimal
		if (obj.$numberDecimal !== undefined) {
			return toNumber(obj);
		}

		// Verifică dacă e Decimal128 din MongoDB
		if (obj.constructor && obj.constructor.name === 'Decimal128') {
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
 * Middleware pentru Express care convertește automat răspunsurile
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const decimalConverterMiddleware = (req, res, next) => {
	// Salvăm metoda originală json
	const originalJson = res.json.bind(res);

	// Override metoda json
	res.json = (data) => {
		// Convertește toate valorile Decimal128
		const convertedData = convertDecimals(data);
		return originalJson(convertedData);
	};

	next();
};

module.exports = {
	decimalConverterMiddleware,
	convertDecimals,
	toNumber,
};
