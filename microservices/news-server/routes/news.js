const express = require('express');

module.exports = (Article) => {
	const router = express.Router();

	// GET / - Get all published articles
	router.get('/', async (req, res) => {
		try {
			const page = parseInt(req.query.page) || 1;
			const limit = parseInt(req.query.limit) || 10;
			const skip = (page - 1) * limit;

			const articles = await Article
				.find({ published: true })
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.select('-__v');

			res.json(articles);
		} catch (error) {
			console.error('News fetch error:', error);
			res.status(500).json({ error: 'Server error' });
		}
	});

	// GET /:id - Get single article
	router.get('/:id', async (req, res) => {
		try {
			const article = await Article.findById(req.params.id);

			if (!article || !article.published) {
				return res.status(404).send('Article not found');
			}

			res.json(article);
		} catch (error) {
			console.error('Article fetch error:', error);
			res.status(500).json({ error: 'Server error' });
		}
	});

	// POST / - Create article (requires auth in future)
	router.post('/', async (req, res) => {
		try {
			const { title, content, author } = req.body;

			if (!title || !content || !author) {
				return res.status(400).send('Title, content, and author are required');
			}

			const article = await Article.create({
				title,
				content,
				rendered: content, // In future, process markdown/html
				author,
				published: true
			});

			console.log(`New article created: ${title} by ${author}`);
			res.status(201).json(article);
		} catch (error) {
			console.error('Article creation error:', error);
			res.status(500).send('Server error');
		}
	});

	// PUT /:id - Update article
	router.put('/:id', async (req, res) => {
		try {
			const { title, content } = req.body;

			const article = await Article.findById(req.params.id);

			if (!article) {
				return res.status(404).send('Article not found');
			}

			if (title) article.title = title;
			if (content) {
				article.content = content;
				article.rendered = content;
			}

			article.edits += 1;
			await article.save();

			console.log(`Article updated: ${article.title}`);
			res.json(article);
		} catch (error) {
			console.error('Article update error:', error);
			res.status(500).send('Server error');
		}
	});

	// DELETE /:id - Delete article
	router.delete('/:id', async (req, res) => {
		try {
			const article = await Article.findByIdAndDelete(req.params.id);

			if (!article) {
				return res.status(404).send('Article not found');
			}

			console.log(`Article deleted: ${article.title}`);
			res.send('Article deleted successfully');
		} catch (error) {
			console.error('Article deletion error:', error);
			res.status(500).send('Server error');
		}
	});

	return router;
};

module.exports = module.exports;
