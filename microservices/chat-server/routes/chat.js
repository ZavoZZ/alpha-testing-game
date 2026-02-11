const express = require('express');

module.exports = (Message) => {
	const router = express.Router();

	// GET /history - Get chat history
	router.get('/history', async (req, res) => {
		try {
			const room = req.query.room || 'global';
			const limit = parseInt(req.query.limit) || 50;

			const messages = await Message
				.find({ room })
				.sort({ createdAt: -1 })
				.limit(limit)
				.select('-__v');

			res.json(messages.reverse()); // Return in chronological order
		} catch (error) {
			console.error('Chat history error:', error);
			res.status(500).json({ error: 'Server error' });
		}
	});

	// DELETE /clear - Clear chat history (admin only)
	router.delete('/clear', async (req, res) => {
		try {
			const room = req.query.room || 'global';
			
			const result = await Message.deleteMany({ room });
			
			console.log(`Cleared ${result.deletedCount} messages from ${room}`);
			res.json({ deleted: result.deletedCount });
		} catch (error) {
			console.error('Chat clear error:', error);
			res.status(500).json({ error: 'Server error' });
		}
	});

	return router;
};

module.exports = module.exports;
