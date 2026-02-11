const jwt = require('jsonwebtoken');

/**
 * =============================================================================
 * AUTHENTICATION MIDDLEWARE - JWT VERIFICATION
 * =============================================================================
 * 
 * Middleware for verifying JSON Web Tokens (JWT) in protected routes.
 * 
 * SECURITY:
 * - Verifies JWT signature
 * - Checks token expiration
 * - Extracts user ID and attaches to request
 * - Blocks requests without valid token
 * 
 * USAGE:
 * router.get('/protected', verifyToken, (req, res) => {
 *   // req.user contains decoded JWT payload
 *   console.log(req.user.userId);
 * });
 * 
 * @version 1.0.0
 * @date 2026-02-11
 */

/**
 * Middleware to verify JWT token from Authorization header
 * 
 * EXPECTED HEADER:
 * Authorization: Bearer <token>
 * 
 * TOKEN PAYLOAD (from auth-server):
 * {
 *   userId: "user_id_here",
 *   username: "username_here",
 *   role: "user|moderator|admin",
 *   iat: 1234567890,  // Issued at
 *   exp: 1234567890   // Expires at
 * }
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function verifyToken(req, res, next) {
	try {
		// Extract token from Authorization header
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			return res.status(401).json({
				success: false,
				error: 'Authentication required',
				message: 'No authorization header provided',
				code: 'NO_AUTH_HEADER'
			});
		}

		// Authorization header format: "Bearer <token>"
		const parts = authHeader.split(' ');

		if (parts.length !== 2 || parts[0] !== 'Bearer') {
			return res.status(401).json({
				success: false,
				error: 'Authentication required',
				message: 'Invalid authorization header format. Expected: Bearer <token>',
				code: 'INVALID_AUTH_FORMAT'
			});
		}

		const token = parts[1];

		// Verify token
		const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
		
		jwt.verify(token, JWT_SECRET, (err, decoded) => {
			if (err) {
				if (err.name === 'TokenExpiredError') {
					return res.status(401).json({
						success: false,
						error: 'Token expired',
						message: 'Your session has expired. Please log in again.',
						code: 'TOKEN_EXPIRED'
					});
				}

				if (err.name === 'JsonWebTokenError') {
					return res.status(401).json({
						success: false,
						error: 'Invalid token',
						message: 'Authentication token is invalid.',
						code: 'INVALID_TOKEN'
					});
				}

				// Other JWT errors
				return res.status(401).json({
					success: false,
					error: 'Authentication failed',
					message: err.message,
					code: 'JWT_ERROR'
				});
			}

			// Token is valid - attach user info to request
			req.user = {
				userId: decoded.userId,
				username: decoded.username,
				role: decoded.role || 'user'
			};

			console.log('[Auth] ✅ Token verified for user:', req.user.username);

			// Continue to next middleware
			next();
		});

	} catch (error) {
		console.error('[Auth] ❌ Verification error:', error);

		return res.status(500).json({
			success: false,
			error: 'Authentication error',
			message: 'An error occurred during authentication',
			code: 'AUTH_ERROR'
		});
	}
}

/**
 * Middleware to verify user is admin
 * MUST be used AFTER verifyToken middleware
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function verifyAdmin(req, res, next) {
	if (!req.user) {
		return res.status(401).json({
			success: false,
			error: 'Authentication required',
			message: 'No user information found',
			code: 'NO_USER_INFO'
		});
	}

	if (req.user.role !== 'admin') {
		console.warn('[Auth] ❌ Admin access denied for user:', req.user.username);

		return res.status(403).json({
			success: false,
			error: 'Access denied',
			message: 'Admin privileges required',
			code: 'NOT_ADMIN'
		});
	}

	console.log('[Auth] ✅ Admin access granted for user:', req.user.username);
	next();
}

/**
 * Middleware to verify user is moderator or admin
 * MUST be used AFTER verifyToken middleware
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function verifyModerator(req, res, next) {
	if (!req.user) {
		return res.status(401).json({
			success: false,
			error: 'Authentication required',
			message: 'No user information found',
			code: 'NO_USER_INFO'
		});
	}

	if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
		console.warn('[Auth] ❌ Moderator access denied for user:', req.user.username);

		return res.status(403).json({
			success: false,
			error: 'Access denied',
			message: 'Moderator or Admin privileges required',
			code: 'NOT_MODERATOR'
		});
	}

	console.log('[Auth] ✅ Moderator access granted for user:', req.user.username);
	next();
}

module.exports = {
	verifyToken,
	verifyAdmin,
	verifyModerator
};
