require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3300;

// Middleware
app.use(cors({
	origin: process.env.WEB_ORIGIN || '*',
	credentials: true,
}));
app.use(express.json());

// Database connection
const connectDB = async () => {
	try {
		const uri = process.env.DB_URI || 'mongodb://mongodb:27017/game_db?replicaSet=rs0';
		await mongoose.connect(uri);
		console.log('MongoDB connected successfully');
	} catch (err) {
		console.error('MongoDB connection failed:', err.message);
		process.exit(1);
	}
};

// Message Model
const messageSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	userId: {
		type: String,
		required: true
	},
	message: {
		type: String,
		required: true,
		maxlength: 500
	},
	room: {
		type: String,
		default: 'global'
	}
}, {
	timestamps: true
});

messageSchema.index({ createdAt: -1 });
messageSchema.index({ room: 1 });

const Message = mongoose.model('Message', messageSchema);

// HTTP Server
const httpServer = require('http').createServer(app);

// Socket.IO
const io = new Server(httpServer, {
	cors: {
		origin: process.env.WEB_ORIGIN || '*',
		credentials: true,
	}
});

// Socket.IO connection handling
io.on('connection', (socket) => {
	console.log('User connected:', socket.id);

	// Join room
	socket.on('join', (room) => {
		socket.join(room || 'global');
		console.log(`User ${socket.id} joined room: ${room || 'global'}`);
	});

	// Handle message
	socket.on('message', async (data) => {
		try {
			const { username, userId, message, room } = data;

			// Save to database
			const msg = await Message.create({
				username,
				userId,
				message: message.slice(0, 500), // Limit length
				room: room || 'global'
			});

			// Broadcast to room
			io.to(room || 'global').emit('message', {
				id: msg._id,
				username: msg.username,
				message: msg.message,
				timestamp: msg.createdAt
			});

			console.log(`Message from ${username} in ${room || 'global'}: ${message}`);
		} catch (error) {
			console.error('Message error:', error);
		}
	});

	// Disconnect
	socket.on('disconnect', () => {
		console.log('User disconnected:', socket.id);
	});
});

// HTTP Routes
const chatRoutes = require('./routes/chat');
app.use('/chat', chatRoutes(Message));

// Health check
app.get('/health', (req, res) => {
	res.json({ 
		status: 'ok', 
		service: 'chat-server',
		timestamp: new Date().toISOString()
	});
});

// Start server
httpServer.listen(PORT, '0.0.0.0', async () => {
	await connectDB();
	console.log(`Chat Server listening on 0.0.0.0:${PORT}`);
	console.log(`Database: ${process.env.DB_URI || 'mongodb://mongodb:27017/game_db?replicaSet=rs0'}`);
	console.log(`Socket.IO ready`);
});
