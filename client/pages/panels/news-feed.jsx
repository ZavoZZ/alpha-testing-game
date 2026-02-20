import React, { useState, useEffect, useRef } from 'react';
import dateFormat from 'dateformat';

const config = require('../../config');

const NewsFeed = props => {
	const [articles, setArticles] = useState([]);
	const aborter = useRef(new AbortController());

	useEffect(() => {
		fetch(`${config.NEWS_URI}/news`, {
			signal: aborter.current.signal
		})
			.then(blob => blob.json())
			.then(json => setArticles(json))
			.catch(e => null)
		;

		return () => aborter.current.abort();
	}, []);

	return (
		<div style={styles.container}>
			{articles.length === 0 ? (
				<div style={styles.emptyState}>
					<div style={styles.emptyIcon}>📰</div>
					<p style={styles.emptyText}>No news articles yet</p>
					<p style={styles.emptySubtext}>Check back later for updates!</p>
				</div>
			) : (
				articles.map((article, index) => (
					<div key={index} style={styles.articleCard} className="glass-container">
						<div style={styles.articleHeader}>
							<h3 style={styles.articleTitle}>{article.title}</h3>
							<div style={styles.articleMeta}>
								<span style={styles.metaItem}>
									<span style={styles.metaIcon}>✍️</span>
									{article.author}
								</span>
								<span style={styles.metaItem}>
									<span style={styles.metaIcon}>📅</span>
									{article.edits > 0 ? 
										`Updated ${dateFormat(article.updatedAt, 'mmm d, yyyy')}` :
										`${dateFormat(article.createdAt, 'mmm d, yyyy')}`
									}
								</span>
								{article.edits > 0 && (
									<span style={styles.editBadge}>
										{article.edits} edit{article.edits > 1 ? 's' : ''}
									</span>
								)}
							</div>
						</div>
						<div 
							style={styles.articleContent}
							dangerouslySetInnerHTML={{ __html: article.rendered }} 
						/>
					</div>
				))
			)}
		</div>
	);
};

const styles = {
	container: {
		display: 'flex',
		flexDirection: 'column',
		gap: '20px',
		width: '100%',
	},
	emptyState: {
		textAlign: 'center',
		padding: '60px 20px',
	},
	emptyIcon: {
		fontSize: '64px',
		marginBottom: '16px',
		opacity: 0.5,
	},
	emptyText: {
		fontSize: '18px',
		fontWeight: '600',
		color: 'rgba(255, 255, 255, 0.8)',
		marginBottom: '8px',
	},
	emptySubtext: {
		fontSize: '14px',
		color: 'rgba(255, 255, 255, 0.5)',
	},
	articleCard: {
		padding: '24px',
		transition: 'all 0.3s ease',
	},
	articleHeader: {
		marginBottom: '16px',
		borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
		paddingBottom: '16px',
	},
	articleTitle: {
		fontSize: '24px',
		fontWeight: '700',
		color: '#ffffff',
		marginBottom: '12px',
		lineHeight: '1.3',
	},
	articleMeta: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '16px',
		alignItems: 'center',
	},
	metaItem: {
		fontSize: '13px',
		color: 'rgba(255, 255, 255, 0.7)',
		display: 'flex',
		alignItems: 'center',
		gap: '6px',
	},
	metaIcon: {
		fontSize: '14px',
	},
	editBadge: {
		fontSize: '11px',
		padding: '4px 8px',
		background: 'rgba(102, 126, 234, 0.2)',
		border: '1px solid rgba(102, 126, 234, 0.3)',
		borderRadius: '8px',
		color: '#667eea',
		fontWeight: '600',
	},
	articleContent: {
		color: 'rgba(255, 255, 255, 0.9)',
		fontSize: '15px',
		lineHeight: '1.7',
	},
};

export default NewsFeed;
