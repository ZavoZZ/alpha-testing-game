import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router';

import ApplyToBody from './utilities/apply-to-body';
import { TokenContext } from './utilities/token-provider';
import NewsFeed from './panels/news-feed';

import '../styles/modern-game.css';

const HomePage = props => {
	const authTokens = useContext(TokenContext);

	if (authTokens.accessToken) {
		return <Navigate to='/dashboard' replace />;
	}

	return (
		<>
			<ApplyToBody className='homepage' />
			
			{/* Animated Background */}
			<div className="modern-background">
				<div className="liquid-blob blob-1"></div>
				<div className="liquid-blob blob-2"></div>
				<div className="liquid-blob blob-3"></div>
			</div>

			{/* Floating Particles */}
			<div className="particles">
				{[...Array(10)].map((_, i) => (
					<div key={i} className="particle"></div>
				))}
			</div>

			{/* Main Content */}
			<div style={styles.container}>
				<div style={styles.heroSection} className="animate-fade-in">
					{/* Logo/Icon */}
					<div style={styles.iconContainer} className="animate-slide-up">
						<div style={styles.icon}>🎮</div>
					</div>

					{/* Title */}
					<h1 className="gaming-title animate-slide-up" style={{animationDelay: '0.2s'}}>
						Test Joc
					</h1>

					{/* Subtitle */}
					<p className="gaming-subtitle animate-slide-up" style={{animationDelay: '0.3s'}}>
						Intră în lumea jocului
					</p>

					{/* CTA Buttons */}
					<div style={styles.buttonGroup} className="animate-slide-up" style={{animationDelay: '0.4s'}}>
						<Link to='/signup' style={styles.link}>
							<button className="modern-button" style={styles.primaryButton}>
								<span style={styles.buttonIcon}>⚡</span>
								Start Playing
							</button>
						</Link>
						<Link to='/login' style={styles.link}>
							<button className="modern-button secondary" style={styles.secondaryButton}>
								<span style={styles.buttonIcon}>🔓</span>
								Login
							</button>
						</Link>
					</div>

					{/* Stats/Features */}
					<div style={styles.statsContainer} className="animate-slide-up" style={{animationDelay: '0.5s'}}>
						<div className="glass-container" style={styles.statCard}>
							<div style={styles.statNumber}>1K+</div>
							<div style={styles.statLabel}>Active Players</div>
						</div>
						<div className="glass-container" style={styles.statCard}>
							<div style={styles.statNumber}>24/7</div>
							<div style={styles.statLabel}>Online</div>
						</div>
						<div className="glass-container" style={styles.statCard}>
							<div style={styles.statNumber}>100+</div>
							<div style={styles.statLabel}>Challenges</div>
						</div>
					</div>
				</div>

				{/* News Feed Section */}
				<div style={styles.newsSection} className="animate-fade-in" style={{animationDelay: '0.6s'}}>
					<div className="glass-container" style={styles.newsContainer}>
						<h2 style={styles.newsTitle}>
							<span style={styles.newsIcon}>📰</span>
							Latest Updates
						</h2>
						<NewsFeed />
					</div>
				</div>

				{/* Features Grid */}
				<div style={styles.featuresSection} className="animate-fade-in" style={{animationDelay: '0.7s'}}>
					<h2 className="gaming-subtitle" style={{marginBottom: '32px'}}>
						Game Features
					</h2>
					<div style={styles.featuresGrid}>
						<div className="glass-container" style={styles.featureCard}>
							<div style={styles.featureIcon}>⚔️</div>
							<h3 style={styles.featureTitle}>Epic Battles</h3>
							<p style={styles.featureDesc}>Engage in intense multiplayer battles</p>
						</div>
						<div className="glass-container" style={styles.featureCard}>
							<div style={styles.featureIcon}>🏆</div>
							<h3 style={styles.featureTitle}>Rankings</h3>
							<p style={styles.featureDesc}>Climb the leaderboards and prove yourself</p>
						</div>
						<div className="glass-container" style={styles.featureCard}>
							<div style={styles.featureIcon}>💎</div>
							<h3 style={styles.featureTitle}>Rewards</h3>
							<p style={styles.featureDesc}>Earn exclusive items and achievements</p>
						</div>
						<div className="glass-container" style={styles.featureCard}>
							<div style={styles.featureIcon}>🌍</div>
							<h3 style={styles.featureTitle}>Global</h3>
							<p style={styles.featureDesc}>Play with gamers worldwide</p>
						</div>
					</div>
				</div>

				{/* Footer CTA */}
				<div style={styles.footerCTA} className="animate-slide-up" style={{animationDelay: '0.8s'}}>
					<h2 className="gaming-subtitle" style={{marginBottom: '24px'}}>
						Ready to Start?
					</h2>
					<Link to='/signup' style={styles.link}>
						<button className="modern-button success" style={styles.ctaButton}>
							<span style={styles.buttonIcon}>🚀</span>
							Join Now - It's Free!
						</button>
					</Link>
				</div>
			</div>
		</>
	);
};

const styles = {
	container: {
		minHeight: '100vh',
		padding: '20px',
		position: 'relative',
		zIndex: 1,
	},
	heroSection: {
		maxWidth: '1200px',
		margin: '0 auto',
		paddingTop: '60px',
		paddingBottom: '60px',
		textAlign: 'center',
	},
	iconContainer: {
		marginBottom: '24px',
	},
	icon: {
		fontSize: '80px',
		display: 'inline-block',
		animation: 'bounce 2s infinite',
		filter: 'drop-shadow(0 10px 20px rgba(102, 126, 234, 0.5))',
	},
	buttonGroup: {
		display: 'flex',
		gap: '16px',
		justifyContent: 'center',
		flexWrap: 'wrap',
		marginTop: '40px',
		marginBottom: '60px',
	},
	link: {
		textDecoration: 'none',
	},
	primaryButton: {
		minWidth: '200px',
		fontSize: '18px',
		padding: '18px 36px',
	},
	secondaryButton: {
		minWidth: '200px',
		fontSize: '18px',
		padding: '18px 36px',
	},
	buttonIcon: {
		marginRight: '8px',
		fontSize: '20px',
	},
	statsContainer: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
		gap: '20px',
		maxWidth: '600px',
		margin: '0 auto',
	},
	statCard: {
		padding: '24px',
		textAlign: 'center',
		minHeight: 'auto',
	},
	statNumber: {
		fontSize: '36px',
		fontWeight: '800',
		color: '#ffffff',
		marginBottom: '8px',
		background: 'linear-gradient(135deg, #ffffff 0%, #667eea 100%)',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
	},
	statLabel: {
		fontSize: '14px',
		color: 'rgba(255, 255, 255, 0.7)',
		fontWeight: '500',
	},
	newsSection: {
		maxWidth: '1000px',
		margin: '80px auto',
	},
	newsContainer: {
		padding: '40px',
	},
	newsTitle: {
		fontSize: '32px',
		fontWeight: '700',
		color: '#ffffff',
		marginBottom: '32px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '12px',
	},
	newsIcon: {
		fontSize: '36px',
	},
	featuresSection: {
		maxWidth: '1200px',
		margin: '80px auto',
		textAlign: 'center',
	},
	featuresGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
		gap: '24px',
	},
	featureCard: {
		padding: '32px',
		textAlign: 'center',
		transition: 'all 0.3s ease',
	},
	featureIcon: {
		fontSize: '48px',
		marginBottom: '16px',
		display: 'inline-block',
	},
	featureTitle: {
		fontSize: '20px',
		fontWeight: '700',
		color: '#ffffff',
		marginBottom: '12px',
	},
	featureDesc: {
		fontSize: '14px',
		color: 'rgba(255, 255, 255, 0.7)',
		lineHeight: '1.6',
	},
	footerCTA: {
		maxWidth: '600px',
		margin: '80px auto 40px',
		textAlign: 'center',
	},
	ctaButton: {
		minWidth: '250px',
		fontSize: '18px',
		padding: '20px 40px',
	},
};

// Media queries via inline styles alternative
const mediaQuery = window.matchMedia('(max-width: 768px)');
if (mediaQuery.matches) {
	styles.icon.fontSize = '60px';
	styles.primaryButton.minWidth = '160px';
	styles.primaryButton.fontSize = '16px';
	styles.secondaryButton.minWidth = '160px';
	styles.secondaryButton.fontSize = '16px';
}

export default HomePage;
