const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		minlength: 3,
		maxlength: 50
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true
	},
	password: {
		type: String,
		required: true,
		minlength: 8
	},
	role: {
		type: String,
		enum: ['user', 'moderator', 'admin'],
		default: 'user'
	},
	isActive: {
		type: Boolean,
		default: true
	},
	isBanned: {
		type: Boolean,
		default: false
	},
	lastLogin: {
		type: Date,
		default: null
	}
}, {
	timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
