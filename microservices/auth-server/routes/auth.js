const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const SECRET_ACCESS = process.env.SECRET_ACCESS || 'default_secret_change_this';
const SECRET_REFRESH =
	process.env.SECRET_REFRESH || 'default_refresh_secret_change_this';

// Token expiry configurations
const TOKEN_EXPIRY = {
	normal: {
		access: '1h',
		refresh: '7d',
		cookieMaxAge: 7 * 24 * 60 * 60 * 1000,
	},
	rememberMe: {
		access: '24h',
		refresh: '30d',
		cookieMaxAge: 30 * 24 * 60 * 60 * 1000,
	},
};

module.exports = (User) => {
	const router = express.Router();

	// Helper: Generate tokens with optional rememberMe
	const generateTokens = (user, rememberMe = false) => {
		const payload = {
			id: user._id,
			username: user.username,
			email: user.email,
			role: user.role,
			admin: user.role === 'admin',
			mod: user.role === 'moderator' || user.role === 'admin',
		};

		const expiryConfig = rememberMe
			? TOKEN_EXPIRY.rememberMe
			: TOKEN_EXPIRY.normal;

		const accessToken = jwt.sign(payload, SECRET_ACCESS, {
			expiresIn: expiryConfig.access,
		});
		const refreshToken = jwt.sign(
			{ id: user._id, rememberMe },
			SECRET_REFRESH,
			{ expiresIn: expiryConfig.refresh },
		);

		return {
			accessToken,
			refreshToken,
			cookieMaxAge: expiryConfig.cookieMaxAge,
		};
	};

	// POST /signup
	router.post('/signup', async (req, res) => {
		try {
			const { email, username, password, contact } = req.body;

			if (!email || !username || !password) {
				return res
					.status(400)
					.send('Email, username, and password are required');
			}

			if (password.length < 8) {
				return res.status(400).send('Password must be at least 8 characters');
			}

			const existingUser = await User.findOne({
				$or: [{ email: email.toLowerCase() }, { username }],
			});

			if (existingUser) {
				return res
					.status(409)
					.send('User with this email or username already exists');
			}

			const hashedPassword = await bcrypt.hash(password, 10);

			const user = await User.create({
				// Authentication & Identity
				email: email.toLowerCase(),
				username,
				password: hashedPassword,
				role: 'user',
				isActive: true,

				// Economy Balances (CRITICAL: Initialize for new players!)
				balance_euro: mongoose.Types.Decimal128.fromString('0.0000'),
				balance_gold: mongoose.Types.Decimal128.fromString('0.0000'),
				balance_ron: mongoose.Types.Decimal128.fromString('0.0000'),

				// Tax Reserve Balances (for admin/system users)
				collected_transfer_tax_euro:
					mongoose.Types.Decimal128.fromString('0.0000'),
				collected_market_tax_euro:
					mongoose.Types.Decimal128.fromString('0.0000'),
				collected_work_tax_euro: mongoose.Types.Decimal128.fromString('0.0000'),

				// Security & Gameplay
				is_frozen_for_fraud: false,
				productivity_multiplier: mongoose.Types.Decimal128.fromString('1.0000'),

				// Statistics
				total_transactions: 0,
				total_volume_euro: mongoose.Types.Decimal128.fromString('0.0000'),

				// Timestamps
				last_transaction_at: null,
				economy_joined_at: new Date(),
			});

			console.log(`New user registered: ${username} (${email})`);
			res.status(201).send('Account created successfully! Please login.');
		} catch (error) {
			console.error('Signup error:', error);
			res.status(500).send('Server error during signup');
		}
	});

	// POST /login
	router.post('/login', async (req, res) => {
		try {
			console.log('[Login] Received request body:', {
				...req.body,
				password: '[REDACTED]',
			});
			const { email, password, rememberMe } = req.body;

			if (!email || !password) {
				console.log('[Login] Missing email or password');
				return res.status(400).send('Email and password are required');
			}

			const user = await User.findOne({ email: email.toLowerCase() });

			if (!user) {
				return res.status(401).send('Invalid email or password');
			}

			if (user.isBanned) {
				return res.status(403).send('Account is banned');
			}

			const isPasswordValid = await bcrypt.compare(password, user.password);

			if (!isPasswordValid) {
				return res.status(401).send('Invalid email or password');
			}

			user.lastLogin = new Date();
			await user.save();

			const { accessToken, refreshToken, cookieMaxAge } = generateTokens(
				user,
				rememberMe === true,
			);

			res.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: cookieMaxAge,
			});

			console.log(
				`User logged in: ${user.username} (rememberMe: ${rememberMe === true})`,
			);
			res.send(accessToken);
		} catch (error) {
			console.error('Login error:', error);
			res.status(500).send('Server error during login');
		}
	});

	// POST /recover
	router.post('/recover', async (req, res) => {
		try {
			const { email } = req.body;

			if (!email) {
				return res.status(400).send('Email is required');
			}

			const user = await User.findOne({ email: email.toLowerCase() });

			if (!user) {
				return res.send(
					'If an account with that email exists, a password reset link has been sent.',
				);
			}

			console.log(`Password reset requested for: ${email}`);
			res.send(
				'If an account with that email exists, a password reset link has been sent.',
			);
		} catch (error) {
			console.error('Recover error:', error);
			res.status(500).send('Server error during password recovery');
		}
	});

	// POST /refresh
	router.post('/refresh', async (req, res) => {
		try {
			const { refreshToken } = req.cookies;

			if (!refreshToken) {
				return res.status(401).send('No refresh token provided');
			}

			const decoded = jwt.verify(refreshToken, SECRET_REFRESH);
			const user = await User.findById(decoded.id);

			if (!user || user.isBanned) {
				return res.status(401).send('Invalid refresh token');
			}

			// Preserve rememberMe from the original token
			const rememberMe = decoded.rememberMe === true;
			const tokens = generateTokens(user, rememberMe);

			res.cookie('refreshToken', tokens.refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: tokens.cookieMaxAge,
			});

			res.send(tokens.accessToken);
		} catch (error) {
			console.error('Refresh error:', error);
			res.status(401).send('Invalid refresh token');
		}
	});

	// POST /logout
	router.post('/logout', (req, res) => {
		res.clearCookie('refreshToken');
		res.send('Logged out successfully');
	});

	// GET /verify - Verify token
	router.get('/verify', async (req, res) => {
		try {
			const authHeader = req.headers.authorization;

			if (!authHeader) {
				return res.status(401).json({ valid: false });
			}

			const token = authHeader.split(' ')[1];
			const decoded = jwt.verify(token, SECRET_ACCESS);

			const user = await User.findById(decoded.id);

			if (!user || user.isBanned) {
				return res.status(401).json({ valid: false });
			}

			res.json({ valid: true, user: decoded });
		} catch (error) {
			res.status(401).json({ valid: false });
		}
	});

	// ============= ADMIN ROUTES =============

	// Middleware: Verify admin
	const verifyAdmin = async (req, res, next) => {
		try {
			const authHeader = req.headers.authorization;
			if (!authHeader) {
				return res.status(401).send('No authorization header');
			}

			const token = authHeader.split(' ')[1];
			const decoded = jwt.verify(token, SECRET_ACCESS);

			if (!decoded.admin) {
				return res.status(403).send('Admin access required');
			}

			req.user = decoded;
			next();
		} catch (error) {
			res.status(401).send('Invalid token');
		}
	};

	// GET /admin/users - Get all users (Admin only)
	router.get('/admin/users', verifyAdmin, async (req, res) => {
		try {
			const users = await User.find()
				.select('-password')
				.sort({ createdAt: -1 });

			res.json({ users });
		} catch (error) {
			console.error('Error fetching users:', error);
			res.status(500).send('Failed to fetch users');
		}
	});

	// PUT /admin/users/:id/role - Update user role (Admin only)
	router.put('/admin/users/:id/role', verifyAdmin, async (req, res) => {
		try {
			const { id } = req.params;
			const { role } = req.body;

			if (!['user', 'moderator', 'admin'].includes(role)) {
				return res.status(400).send('Invalid role');
			}

			const user = await User.findByIdAndUpdate(
				id,
				{ role },
				{ new: true },
			).select('-password');

			if (!user) {
				return res.status(404).send('User not found');
			}

			res.json({ user, message: 'Role updated successfully' });
		} catch (error) {
			console.error('Error updating role:', error);
			res.status(500).send('Failed to update role');
		}
	});

	// PUT /admin/users/:id/ban - Ban/Unban user (Admin only)
	router.put('/admin/users/:id/ban', verifyAdmin, async (req, res) => {
		try {
			const { id } = req.params;
			const { isBanned } = req.body;

			const user = await User.findByIdAndUpdate(
				id,
				{ isBanned },
				{ new: true },
			).select('-password');

			if (!user) {
				return res.status(404).send('User not found');
			}

			res.json({
				user,
				message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
			});
		} catch (error) {
			console.error('Error updating ban status:', error);
			res.status(500).send('Failed to update ban status');
		}
	});

	// DELETE /admin/users/:id - Delete user (Admin only)
	router.delete('/admin/users/:id', verifyAdmin, async (req, res) => {
		try {
			const { id } = req.params;

			// Prevent admin from deleting themselves
			if (id === req.user.id) {
				return res.status(400).send('Cannot delete your own account');
			}

			const user = await User.findByIdAndDelete(id);

			if (!user) {
				return res.status(404).send('User not found');
			}

			res.json({ message: 'User deleted successfully' });
		} catch (error) {
			console.error('Error deleting user:', error);
			res.status(500).send('Failed to delete user');
		}
	});

	// POST /admin/users - Create new user (Admin only)
	router.post('/admin/users', verifyAdmin, async (req, res) => {
		try {
			const { email, username, password, role } = req.body;

			// Validation
			if (!email || !username || !password) {
				return res
					.status(400)
					.send('Email, username, and password are required');
			}

			if (password.length < 8) {
				return res.status(400).send('Password must be at least 8 characters');
			}

			if (!['user', 'moderator', 'admin'].includes(role || 'user')) {
				return res.status(400).send('Invalid role');
			}

			// Check if user already exists
			const existingUser = await User.findOne({
				$or: [{ email: email.toLowerCase() }, { username }],
			});

			if (existingUser) {
				return res
					.status(409)
					.send('User with this email or username already exists');
			}

			// Hash password
			const bcrypt = require('bcrypt');
			const hashedPassword = await bcrypt.hash(password, 10);

			// Create user
			const newUser = new User({
				username,
				email: email.toLowerCase(),
				password: hashedPassword,
				role: role || 'user',
				isActive: true,
				isBanned: false,
			});

			await newUser.save();

			// Return user without password
			const userResponse = newUser.toObject();
			delete userResponse.password;

			res.status(201).json({
				user: userResponse,
				message: 'User created successfully',
			});
		} catch (error) {
			console.error('Error creating user:', error);
			res.status(500).send('Failed to create user');
		}
	});

	return router;
};

module.exports = module.exports;
