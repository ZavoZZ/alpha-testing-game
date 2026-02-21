/**
 * Decimal Converter Middleware
 *
 * Convertește automat toate valorile Decimal128 din răspunsurile API
 * în numere pentru a preveni erorile React.
 *
 * @module decimal-converter
 */

/**
 * Verifică dacă un obiect este Decimal128 (BSON/Mongoose)
 * @param {*} value - Valoarea de verificat
 * @returns {boolean} - True dacă este Decimal128
 */
const isDecimal128 = (value) => {
	if (value === null || value === undefined) return false;
	if (typeof value !== 'object') return false;

	// Verifică _bsontype (specific BSON pentru Mongoose 7+)
	if (value._bsontype === 'Decimal128') return true;

	// Verifică constructor name
	const constructorName = value.constructor?.name;
	if (constructorName === 'Decimal128') return true;

	// Verifică dacă are $numberDecimal (JSON serializat)
	if (value.$numberDecimal !== undefined) return true;

	// Verifică dacă are metode specifice Decimal128
	if (
		typeof value.toString === 'function' &&
		typeof value.toJSON === 'function'
	) {
		// Încearcă să detecteze prin toString
		try {
			const str = value.toString();
			// Decimal128 toString returnează un număr decimal
			if (/^-?\d+\.?\d*$/.test(str) && value.toJSON) {
				const json = value.toJSON();
				if (json && json.$numberDecimal !== undefined) {
					return true;
				}
			}
		} catch (e) {
			// Nu e Decimal128
		}
	}

	return false;
};

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
			const str = value.toString();
			// Verifică dacă arată ca un număr (inclusiv negative)
			if (/^-?\d+\.?\d*$/.test(str)) {
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
 * @param {number} depth - Adâncimea curentă (pentru debugging)
 * @returns {*} - Obiectul cu valorile convertite
 */
const convertDecimals = (obj, depth = 0) => {
	// Limit depth to prevent infinite recursion
	if (depth > 20) {
		return obj;
	}

	// Handle null/undefined
	if (obj === null || obj === undefined) {
		return obj;
	}

	// Handle primitives (string, number, boolean)
	if (typeof obj !== 'object') {
		return obj;
	}

	// Handle arrays
	if (Array.isArray(obj)) {
		return obj.map((item) => convertDecimals(item, depth + 1));
	}

	// Handle Date
	if (obj instanceof Date) {
		return obj;
	}

	// Handle $numberDecimal object (JSON serialized)
	if (obj.$numberDecimal !== undefined && Object.keys(obj).length === 1) {
		return toNumber(obj);
	}

	// Handle Decimal128 from BSON/Mongoose
	if (isDecimal128(obj)) {
		return toNumber(obj);
	}

	// Handle regular objects - convert all properties
	const result = {};
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			result[key] = convertDecimals(obj[key], depth + 1);
		}
	}
	return result;
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

/**
 * Convert JSON string with $numberDecimal to regular numbers
 * This is useful for proxy servers that receive already-serialized JSON
 * @param {string} jsonString - JSON string that may contain $numberDecimal
 * @returns {string} - JSON string with numbers instead of $numberDecimal
 */
const convertJsonString = (jsonString) => {
	try {
		const data = JSON.parse(jsonString);
		const converted = convertDecimals(data);
		return JSON.stringify(converted);
	} catch (e) {
		// If not valid JSON, return as-is
		return jsonString;
	}
};

module.exports = {
	decimalConverterMiddleware,
	convertDecimals,
	toNumber,
	isDecimal128,
	convertJsonString,
};
