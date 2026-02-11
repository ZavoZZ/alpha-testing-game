const mongoose = require('mongoose');

const connectDB = async () => {
	try {
		// CRITICAL: Use auth_db where users are stored (shared with Auth-Server)
		const uri = process.env.DB_URI || 'mongodb://localhost:27017/auth_db';
		
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