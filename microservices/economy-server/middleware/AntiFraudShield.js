const rateLimit = require('express-rate-limit');

/**
 * =============================================================================
 * ANTI-FRAUD SHIELD - SECURITY MIDDLEWARE FOR ECONOMY API
 * =============================================================================
 * 
 * Multi-layered defense system protecting financial transaction endpoints.
 * 
 * LAYERS OF DEFENSE:
 * 1. Strict Payload Sanitization (validateFinancialPayload)
 * 2. Hard Rate Limiting (economyRateLimiter)
 * 3. [Future] Velocity Tracking (20 tx/hour freeze)
 * 4. [Future] IP Reputation System
 * 5. [Future] Pattern Analysis (fraud detection)
 * 
 * CRITICAL THREAT MODEL:
 * - Negative amounts injection
 * - Scientific notation bypass (1e10)
 * - Floating-point precision exploits
 * - High-frequency spam attacks
 * - Distributed attacks via multiple IPs
 * 
 * DEPLOYMENT CONTEXT:
 * - Behind Cloudflare (CDN + DDoS protection)
 * - Behind Nginx reverse proxy
 * - IP extraction uses X-Forwarded-For header
 * 
 * @version 1.0.0
 * @date 2026-02-11
 * @author Security Team
 */

// =============================================================================
// LAYER 1: STRICT PAYLOAD SANITIZATION
// =============================================================================

/**
 * Validates financial payload before it reaches the database
 * 
 * SECURITY CHECKS:
 * ✅ Amount must be a STRING (reject Number to prevent JSON manipulation)
 * ✅ No negative amounts (prevent theft via negative transfers)
 * ✅ No scientific notation (prevent 1e10 exploits)
 * ✅ Maximum 4 decimal places (prevent sub-cent exploits)
 * ✅ No special characters (prevent injection attacks)
 * ✅ Reasonable maximum value (prevent overflow attacks)
 * 
 * ATTACK VECTORS BLOCKED:
 * ❌ { "amount": -100 }                    // Negative number
 * ❌ { "amount": 1e10 }                    // Scientific notation
 * ❌ { "amount": "100.123456" }            // Too many decimals
 * ❌ { "amount": "-50.00" }                // Negative string
 * ❌ { "amount": "100 OR 1=1" }            // SQL injection attempt
 * ❌ { "amount": "999999999999999.9999" }  // Overflow attempt
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function validateFinancialPayload(req, res, next) {
	const startTime = Date.now();

	try {
		// Extract amount from request body
		const { amount } = req.body;

		// =====================================================================
		// CHECK 1: Amount must exist
		// =====================================================================
		if (amount === undefined || amount === null) {
			console.warn('[AntiFraudShield] ❌ Blocked request: Missing amount field', {
				ip: extractClientIP(req),
				path: req.path,
				body: req.body
			});

			return res.status(400).json({
				success: false,
				error: 'Invalid financial payload format',
				message: 'Amount field is required',
				code: 'MISSING_AMOUNT'
			});
		}

		// =====================================================================
		// CHECK 2: Amount must be a STRING (not Number)
		// =====================================================================
		// WHY: Numbers lose precision in JSON serialization
		// Example: 100.12345 → 100.12344999999999
		// ATTACK: Attacker could exploit floating-point errors
		if (typeof amount !== 'string') {
			console.warn('[AntiFraudShield] ❌ Blocked request: Amount is not a string', {
				ip: extractClientIP(req),
				path: req.path,
				amount: amount,
				type: typeof amount
			});

			return res.status(400).json({
				success: false,
				error: 'Invalid financial payload format',
				message: 'Amount must be a string for precision safety',
				code: 'AMOUNT_NOT_STRING',
				received_type: typeof amount
			});
		}

		// =====================================================================
		// CHECK 3: Strict Format Validation (Regex)
		// =====================================================================
		// ALLOWED: "100", "100.50", "0.0001"
		// BLOCKED: "-100", "1e10", "100.", ".50", "abc", "100,50"
		const validAmountRegex = /^[0-9]+(\.[0-9]{1,4})?$/;

		if (!validAmountRegex.test(amount)) {
			console.warn('[AntiFraudShield] ❌ Blocked request: Invalid amount format', {
				ip: extractClientIP(req),
				path: req.path,
				amount: amount,
				reason: 'Does not match valid format'
			});

			return res.status(400).json({
				success: false,
				error: 'Invalid financial payload format',
				message: 'Amount must be a positive number with maximum 4 decimal places',
				code: 'INVALID_AMOUNT_FORMAT',
				received: amount,
				expected_format: '123.4567 (positive number, max 4 decimals)'
			});
		}

		// =====================================================================
		// CHECK 4: No Negative Amounts (Paranoid check)
		// =====================================================================
		// Even though regex blocks "-", double-check for safety
		if (amount.includes('-')) {
			console.error('[AntiFraudShield] 🚨 CRITICAL: Negative amount bypassed regex!', {
				ip: extractClientIP(req),
				path: req.path,
				amount: amount,
				alert: 'POTENTIAL REGEX BYPASS ATTACK'
			});

			return res.status(400).json({
				success: false,
				error: 'Invalid financial payload format',
				message: 'Negative amounts are not allowed',
				code: 'NEGATIVE_AMOUNT_BLOCKED'
			});
		}

		// =====================================================================
		// CHECK 5: No Scientific Notation (Paranoid check)
		// =====================================================================
		if (amount.toLowerCase().includes('e')) {
			console.error('[AntiFraudShield] 🚨 CRITICAL: Scientific notation detected!', {
				ip: extractClientIP(req),
				path: req.path,
				amount: amount,
				alert: 'POTENTIAL SCIENTIFIC NOTATION ATTACK'
			});

			return res.status(400).json({
				success: false,
				error: 'Invalid financial payload format',
				message: 'Scientific notation is not allowed',
				code: 'SCIENTIFIC_NOTATION_BLOCKED'
			});
		}

		// =====================================================================
		// CHECK 6: Maximum Value Check (Prevent overflow)
		// =====================================================================
		// Max: 999,999,999.9999 (1 billion - 1 cent)
		const MAX_AMOUNT = 999999999.9999;
		const amountFloat = parseFloat(amount);

		if (isNaN(amountFloat)) {
			console.error('[AntiFraudShield] 🚨 CRITICAL: Amount is NaN after parseFloat!', {
				ip: extractClientIP(req),
				path: req.path,
				amount: amount
			});

			return res.status(400).json({
				success: false,
				error: 'Invalid financial payload format',
				message: 'Amount could not be parsed',
				code: 'AMOUNT_PARSE_ERROR'
			});
		}

		if (amountFloat > MAX_AMOUNT) {
			console.warn('[AntiFraudShield] ❌ Blocked request: Amount exceeds maximum', {
				ip: extractClientIP(req),
				path: req.path,
				amount: amount,
				max_allowed: MAX_AMOUNT
			});

			return res.status(400).json({
				success: false,
				error: 'Invalid financial payload format',
				message: 'Amount exceeds maximum allowed value',
				code: 'AMOUNT_TOO_LARGE',
				max_allowed: MAX_AMOUNT.toFixed(4)
			});
		}

		// =====================================================================
		// CHECK 7: Minimum Value Check (Prevent dust attacks)
		// =====================================================================
		// Min: 0.0001 (smallest tradeable unit)
		const MIN_AMOUNT = 0.0001;

		if (amountFloat < MIN_AMOUNT) {
			console.warn('[AntiFraudShield] ❌ Blocked request: Amount below minimum', {
				ip: extractClientIP(req),
				path: req.path,
				amount: amount,
				min_allowed: MIN_AMOUNT
			});

			return res.status(400).json({
				success: false,
				error: 'Invalid financial payload format',
				message: 'Amount is below minimum allowed value',
				code: 'AMOUNT_TOO_SMALL',
				min_allowed: MIN_AMOUNT.toFixed(4)
			});
		}

		// =====================================================================
		// ✅ ALL CHECKS PASSED - PAYLOAD IS SAFE
		// =====================================================================
		const validationTime = Date.now() - startTime;

		console.log('[AntiFraudShield] ✅ Payload validated successfully', {
			ip: extractClientIP(req),
			path: req.path,
			amount: amount,
			validation_time_ms: validationTime
		});

		// Continue to next middleware
		next();

	} catch (error) {
		console.error('[AntiFraudShield] ❌ Validation error:', error);

		return res.status(500).json({
			success: false,
			error: 'Security validation error',
			message: 'An error occurred during security validation',
			code: 'VALIDATION_ERROR'
		});
	}
}

// =============================================================================
// LAYER 2: HARD RATE LIMITING
// =============================================================================

/**
 * Extracts the real client IP address
 * 
 * DEPLOYMENT ARCHITECTURE:
 * Internet → Cloudflare → Nginx Reverse Proxy → Docker Container
 * 
 * IP EXTRACTION PRIORITY:
 * 1. X-Forwarded-For (from Cloudflare/Nginx) - first IP in chain
 * 2. req.ip (fallback for direct connections)
 * 
 * SECURITY CONSIDERATIONS:
 * - Cloudflare adds client IP to X-Forwarded-For header
 * - Nginx preserves and forwards this header
 * - We trust the FIRST IP in X-Forwarded-For (closest to client)
 * - Subsequent IPs are proxies (Cloudflare, Nginx)
 * 
 * @param {Request} req - Express request object
 * @returns {string} - Client IP address
 */
function extractClientIP(req) {
	// X-Forwarded-For format: "client_ip, proxy1_ip, proxy2_ip, ..."
	const xForwardedFor = req.headers['x-forwarded-for'];
	
	if (xForwardedFor) {
		// Extract first IP (client IP)
		const clientIP = xForwardedFor.split(',')[0].trim();
		return clientIP;
	}

	// Fallback to req.ip (direct connection without proxy)
	return req.ip || 'unknown';
}

/**
 * Creates a rate limiter for economy endpoints
 * 
 * RATE LIMIT CONFIGURATION:
 * - Max Requests: 10 per IP
 * - Time Window: 5 minutes (300 seconds)
 * - Result: ~2 transactions per minute per IP (very restrictive)
 * 
 * WHY SO RESTRICTIVE?
 * - Normal gameplay: 1-2 transactions per minute
 * - Bots/Scripts: 10+ transactions per minute
 * - This blocks 99% of automated attacks
 * 
 * ATTACK VECTORS BLOCKED:
 * ❌ High-frequency trading bots
 * ❌ Spam transaction attacks
 * ❌ Balance draining attempts
 * ❌ Distributed DoS via economy endpoints
 * 
 * LEGITIMATE USE CASES:
 * ✅ Normal player transfers (2-3 per minute)
 * ✅ Market purchases (1-2 per minute)
 * ✅ Salary collection (once per hour)
 * ✅ Quest rewards (occasional)
 * 
 * @type {Function} - Express middleware
 */
const economyRateLimiter = rateLimit({
	// Time window: 5 minutes
	windowMs: 5 * 60 * 1000,

	// Maximum 10 requests per window
	max: 10,

	// Message returned when limit exceeded
	message: {
		success: false,
		error: 'Rate limit exceeded',
		message: 'Too many transaction requests. Please wait before trying again.',
		code: 'RATE_LIMIT_EXCEEDED',
		retry_after_seconds: 300
	},

	// HTTP status code for rate limit errors
	statusCode: 429,

	// Extract IP using our custom function
	keyGenerator: (req) => {
		const ip = extractClientIP(req);
		console.log('[AntiFraudShield] Rate limit check for IP:', ip);
		return ip;
	},

	// Handler called when rate limit is exceeded
	handler: (req, res) => {
		const ip = extractClientIP(req);
		
		console.warn('[AntiFraudShield] 🚨 RATE LIMIT EXCEEDED', {
			ip: ip,
			path: req.path,
			method: req.method,
			user_agent: req.headers['user-agent'],
			alert: 'POTENTIAL BOT/SPAM ATTACK'
		});

		res.status(429).json({
			success: false,
			error: 'Rate limit exceeded',
			message: 'Too many transaction requests. Please wait 5 minutes before trying again.',
			code: 'RATE_LIMIT_EXCEEDED',
			retry_after_seconds: 300,
			blocked_ip: ip
		});
	},

	// Skip failed requests (don't count them against limit)
	skipFailedRequests: false,

	// Skip successful requests (count ALL requests)
	skipSuccessfulRequests: false,

	// Use default store (memory)
	// TODO: For production with multiple servers, use Redis store
	standardHeaders: true, // Return rate limit info in headers
	legacyHeaders: false   // Disable X-RateLimit-* headers
});

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
	// Layer 1: Payload validation
	validateFinancialPayload,

	// Layer 2: Rate limiting
	economyRateLimiter,

	// Utility: IP extraction (exported for use in other modules)
	extractClientIP
};

// =============================================================================
// USAGE EXAMPLE
// =============================================================================
/*

In your economy routes file (e.g., server/routes/economy.js):

const express = require('express');
const router = express.Router();
const { validateFinancialPayload, economyRateLimiter } = require('../middleware/AntiFraudShield');
const { EconomyEngine } = require('../services');

// Apply BOTH middleware to ALL economy endpoints
router.use('/economy/*', economyRateLimiter);           // Layer 2: Rate limiting
router.use('/economy/*', validateFinancialPayload);     // Layer 1: Payload validation

// Transfer endpoint (protected by both layers)
router.post('/economy/transfer', async (req, res) => {
	try {
		const { amount, receiverId, currency } = req.body;
		
		// At this point:
		// ✅ Rate limit passed (< 10 requests in 5 min)
		// ✅ Amount is validated (string, positive, 4 decimals max)
		
		const result = await EconomyEngine.executeAtomicTransaction({
			senderId: req.user._id,
			receiverId,
			amountStr: amount,
			currency,
			transactionType: 'TRANSFER',
			ipAddress: extractClientIP(req),
			userAgent: req.headers['user-agent']
		});
		
		res.json(result);
	} catch (error) {
		res.status(400).json({ success: false, error: error.message });
	}
});

module.exports = router;

*/

// =============================================================================
// SECURITY MONITORING
// =============================================================================
/*

RECOMMENDED MONITORING:

1. Alert on high rate limit blocks (> 10/hour from single IP)
2. Alert on payload validation failures (potential attack patterns)
3. Daily report of blocked IPs and attack patterns
4. Integration with IP reputation services (e.g., AbuseIPDB)

FUTURE ENHANCEMENTS:

Layer 3: Velocity Tracking
- Track total transactions per user per hour
- Freeze account if > 20 transactions/hour
- Alert admins for manual review

Layer 4: IP Reputation
- Integrate with AbuseIPDB, IPQualityScore
- Block known VPN/Proxy/Tor exit nodes
- Whitelist trusted IPs

Layer 5: Pattern Analysis
- Machine learning for fraud detection
- Unusual transaction patterns
- Geographical anomalies
- Time-based anomalies

*/
