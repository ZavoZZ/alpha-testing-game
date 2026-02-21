//environment variables
require('dotenv').config();

//libraries
const path = require('path');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');

// Decimal converter for proxy responses
const { convertJsonString } = require('./middleware/decimal-converter');

//create the server
const express = require('express');
const app = express();
const server = require('http').Server(app);

//security middleware
app.use((req, res, next) => {
	// Security headers
	res.setHeader('X-Content-Type-Options', 'nosniff');
	res.setHeader('X-Frame-Options', 'DENY');
	res.setHeader('X-XSS-Protection', '1; mode=block');
	res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

	// CORS - Allow access from any domain
	const allowedOrigins = process.env.ALLOWED_ORIGINS
		? process.env.ALLOWED_ORIGINS.split(',')
		: ['*'];
	const origin = req.headers.origin;

	if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
		res.setHeader('Access-Control-Allow-Origin', origin || '*');
	}

	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, DELETE, OPTIONS',
	);
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization, X-Game-Password',
	);
	res.setHeader('Access-Control-Allow-Credentials', 'true');

	if (req.method === 'OPTIONS') {
		return res.status(200).end();
	}

	next();
});

//config
app.use(express.json());
app.use(cookieParser());

//handle compressed files (middleware)
app.get(/.*\.js$/, (req, res, next) => {
	req.url = req.url + '.gz';
	res.set('Content-Encoding', 'gzip');
	res.set('Content-Type', 'text/javascript');
	next();
});

app.get(/.*\.css$/, (req, res, next) => {
	req.url = req.url + '.gz';
	res.set('Content-Encoding', 'gzip');
	res.set('Content-Type', 'text/css');
	next();
});

//database connection
const { connectDB } = require('./database');

//proxy to microservices
const AUTH_URI = process.env.AUTH_URI || 'http://auth-server:3200';
const NEWS_URI = process.env.NEWS_URI || 'http://news-server:3100';
const CHAT_URI = process.env.CHAT_URI || 'http://chat-server:3300';
const ECONOMY_URI = process.env.ECONOMY_URI || 'http://economy-server:3400';

// Proxy middleware for auth microservice
app.use('/api/auth-service', async (req, res) => {
	try {
		const url = `${AUTH_URI}${req.url}`;
		console.log(`[Auth Proxy] ${req.method} ${req.url} → ${url}`);

		const options = {
			method: req.method,
			headers: {
				'Content-Type': 'application/json',
				// Forward Authorization header (for JWT tokens)
				...(req.headers.authorization && {
					Authorization: req.headers.authorization,
				}),
			},
		};

		// Add body for POST, PUT, PATCH
		if (req.body && Object.keys(req.body).length > 0) {
			options.body = JSON.stringify(req.body);
		}

		const response = await fetch(url, options);

		// Forward cookies
		const cookies = response.headers.get('set-cookie');
		if (cookies) {
			res.setHeader('set-cookie', cookies);
		}

		// Get response text
		const text = await response.text();
		console.log(`[Auth Proxy] Response status: ${response.status}`);
		// Convert any $numberDecimal to regular numbers
		const convertedText = convertJsonString(text);
		res.status(response.status).send(convertedText);
	} catch (error) {
		console.error('[Auth Proxy] ❌ Error:', error.message);
		res.status(500).send('Proxy error: ' + error.message);
	}
});

// Proxy middleware for news microservice
app.use('/api/news-service', async (req, res) => {
	try {
		const url = `${NEWS_URI}${req.url}`;

		const options = {
			method: req.method,
			headers: {
				'Content-Type': 'application/json',
				...(req.headers.authorization && {
					Authorization: req.headers.authorization,
				}),
			},
		};

		if (req.body && Object.keys(req.body).length > 0) {
			options.body = JSON.stringify(req.body);
		}

		const response = await fetch(url, options);
		const text = await response.text();
		res.status(response.status).send(text);
	} catch (error) {
		console.error('News proxy error:', error);
		res.status(500).send('Proxy error: ' + error.message);
	}
});

// Proxy middleware for chat microservice
app.use('/api/chat-service', async (req, res) => {
	try {
		const url = `${CHAT_URI}${req.url}`;

		const options = {
			method: req.method,
			headers: {
				'Content-Type': 'application/json',
				...(req.headers.authorization && {
					Authorization: req.headers.authorization,
				}),
			},
		};

		if (req.body && Object.keys(req.body).length > 0) {
			options.body = JSON.stringify(req.body);
		}

		const response = await fetch(url, options);
		const text = await response.text();
		res.status(response.status).send(text);
	} catch (error) {
		console.error('Chat proxy error:', error);
		res.status(500).send('Proxy error: ' + error.message);
	}
});

//password protection API
const GAME_PASSWORD = process.env.GAME_PASSWORD || 'testjoc';
const SESSION_SECRET =
	process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// Session storage (in-memory for simplicity, could use Redis for production)
const activeSessions = new Map();

app.post('/api/auth/verify', (req, res) => {
	const { password } = req.body;

	if (password === GAME_PASSWORD) {
		// Generate session token
		const sessionToken = crypto.randomBytes(32).toString('hex');
		const sessionData = {
			createdAt: Date.now(),
			expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
		};

		activeSessions.set(sessionToken, sessionData);

		res.json({
			success: true,
			token: sessionToken,
			message: 'Access granted',
		});
	} else {
		res.status(401).json({
			success: false,
			message: 'Invalid password',
		});
	}
});

app.post('/api/auth/validate', (req, res) => {
	const { token } = req.body;

	if (!token) {
		return res
			.status(401)
			.json({ success: false, message: 'No token provided' });
	}

	const session = activeSessions.get(token);

	if (session && session.expiresAt > Date.now()) {
		res.json({ success: true, message: 'Session valid' });
	} else {
		if (session) {
			activeSessions.delete(token);
		}
		res
			.status(401)
			.json({ success: false, message: 'Session expired or invalid' });
	}
});

app.post('/api/auth/logout', (req, res) => {
	const { token } = req.body;

	if (token) {
		activeSessions.delete(token);
	}

	res.json({ success: true, message: 'Logged out' });
});

// Proxy middleware for economy microservice
app.use('/api/economy', async (req, res) => {
	try {
		const url = `${ECONOMY_URI}${req.url}`;

		const options = {
			method: req.method,
			headers: {
				'Content-Type': 'application/json',
				// Forward Authorization header (critical for JWT!)
				...(req.headers.authorization && {
					Authorization: req.headers.authorization,
				}),
				// Forward X-Forwarded-For for rate limiting
				...(req.headers['x-forwarded-for'] && {
					'X-Forwarded-For': req.headers['x-forwarded-for'],
				}),
			},
		};

		// Add body for POST, PUT, PATCH
		if (req.body && Object.keys(req.body).length > 0) {
			options.body = JSON.stringify(req.body);
		}

		const response = await fetch(url, options);
		const text = await response.text();

		// Convert any $numberDecimal to regular numbers
		const convertedText = convertJsonString(text);

		res.status(response.status).send(convertedText);
	} catch (error) {
		console.error('Economy proxy error:', error);
		res.status(500).json({
			success: false,
			error: 'Economy service unavailable',
			message: error.message,
		});
	}
});

console.log(
	'[Server] ✅ Economy API proxy registered at /api/economy/* → economy-server:3400',
);

//send static files
app.use('/', express.static(path.resolve(__dirname, '..', 'public')));

//fallback to the index file (SPA routing - React Router)
// This must be AFTER all API routes to avoid intercepting them
app.use((req, res, next) => {
	// If request is for an API endpoint that doesn't exist, return 404
	if (req.url.startsWith('/api/')) {
		return res.status(404).json({
			success: false,
			error: 'API endpoint not found',
			path: req.url,
		});
	}
	// Otherwise, serve the React app (SPA)
	res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
});

//startup
server.listen(process.env.WEB_PORT || 3000, '0.0.0.0', async (err) => {
	await connectDB();
	console.log(`Server listening on 0.0.0.0:${process.env.WEB_PORT || 3000}`);
	console.log(
		`Database connected to: ${process.env.DB_URI || 'mongodb://mongodb:27017/game_db?replicaSet=rs0'}`,
	);
	console.log(
		`Game password protection: ${process.env.GAME_PASSWORD ? 'ENABLED' : 'DISABLED'}`,
	);
	console.log('---');
	console.log('Access from external devices using: http://<SERVER_IP>:3000');
});
