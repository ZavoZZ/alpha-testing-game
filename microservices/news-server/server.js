require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3100;

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

// News Article Model
const articleSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true
	},
	content: {
		type: String,
		required: true
	},
	rendered: {
		type: String,
		required: true
	},
	author: {
		type: String,
		required: true
	},
	authorId: {
		type: String,
		default: null
	},
	edits: {
		type: Number,
		default: 0
	},
	published: {
		type: Boolean,
		default: false
	}
}, {
	timestamps: true
});

articleSchema.index({ createdAt: -1 });
articleSchema.index({ published: 1 });

const Article = mongoose.model('Article', articleSchema);

// Routes
const newsRoutes = require('./routes/news');
app.use('/news', newsRoutes(Article));

// Health check
app.get('/health', (req, res) => {
	res.json({ 
		status: 'ok', 
		service: 'news-server',
		timestamp: new Date().toISOString()
	});
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
	await connectDB();
	console.log(`News Server listening on 0.0.0.0:${PORT}`);
	console.log(`Database: ${process.env.DB_URI || 'mongodb://mongodb:27017/game_db?replicaSet=rs0'}`);
});
