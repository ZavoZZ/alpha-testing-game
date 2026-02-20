const mongoose = require('mongoose');

const connectDB = async () => {
	try {
		// CRITICAL: Use game_db as the main database (shared across all services)
		// In Docker: use 'mongodb' container name
		// In Codespaces: use environment variable DB_URI
		const uri = process.env.DB_URI || 'mongodb://mongodb:27017/game_db?replicaSet=rs0';
		
		await mongoose.connect(uri, {
			// These options are set by default in Mongoose 6+
		});
		
		console.log('MongoDB connected successfully');
		
		mongoose.connection.on('error', (err) => {
			console.error('MongoDB connection error:', err);
		});
		
		mongoose.connection.on('disconnected', () => {
			console.log('MongoDB disconnected');
		});
		
	} catch (err) {
		console.error('MongoDB connection failed:', err.message);
		process.exit(1);
	}
};

module.exports = { connectDB, mongoose };