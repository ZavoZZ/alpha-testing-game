import React, { useContext, useState } from 'react';
import { Link, Navigate } from 'react-router';

import ApplyToBody from './utilities/apply-to-body';
import { TokenContext } from './utilities/token-provider';
import Logout from './accounts/panels/logout';
import WorkStation from './panels/WorkStation';  // Module 2.2.C
import InventoryPanel from './panels/InventoryPanel';  // Module 2.3
import MarketplacePanel from './panels/MarketplacePanel';  // Module 2.3
import NewsFeed from './panels/news-feed';

import '../styles/modern-game.css';

const Dashboard = props => {
	const authTokens = useContext(TokenContext);
	const [activeTab, setActiveTab] = useState('work');

	console.log('Dashboard - accessToken:', authTokens.accessToken ? 'EXISTS' : 'MISSING');

	if (!authTokens.accessToken) {
		console.log('No token, redirecting to homepage');
		return <Navigate to='/' replace />;
	}

	let payload;
	try {
		payload = authTokens.getPayload();
		console.log('Dashboard - User:', payload.username);
	} catch (error) {
		console.error('Error getting payload:', error);
		return <Navigate to='/' replace />;
	}

	return (
		<>
			<ApplyToBody className='dashboard' />
			
			{/* Animated Background */}
			<div className="modern-background">
				<div className="liquid-blob blob-1"></div>
				<div className="liquid-blob blob-2"></div>
				<div className="liquid-blob blob-3"></div>
			</div>

			{/* Floating Particles */}
			<div className="particles">
				{[...Array(15)].map((_, i) => (
					<div key={i} className="particle"></div>
				))}
			</div>

			<div style={styles.container}>
				{/* Welcome Header */}
				<div className="glass-container animate-fade-in" style={styles.welcomeCard}>
					<h1 className="gaming-title" style={{fontSize: '48px', marginBottom: '8px', textAlign: 'center'}}>
						Welcome, <span style={styles.username}>{payload.username || 'Player'}</span>!
					</h1>
					<p style={{fontSize: '16px', color: '#aaa', textAlign: 'center', marginBottom: '32px'}}>
						🎮 Alpha Testing Game - Module 2.3 Active
					</p>
				</div>
				
				{/* Tab Navigation */}
				<div className="tab-navigation glass-container" style={styles.tabNav}>
					<button 
						className={activeTab === 'work' ? 'tab-button active' : 'tab-button'}
						onClick={() => setActiveTab('work')}
					>
						💼 Muncă
					</button>
					<button 
						className={activeTab === 'inventory' ? 'tab-button active' : 'tab-button'}
						onClick={() => setActiveTab('inventory')}
					>
						📦 Inventar
					</button>
					<button 
						className={activeTab === 'marketplace' ? 'tab-button active' : 'tab-button'}
						onClick={() => setActiveTab('marketplace')}
					>
						🏪 Piață
					</button>
					<button 
						className={activeTab === 'news' ? 'tab-button active' : 'tab-button'}
						onClick={() => setActiveTab('news')}
					>
						📰 Știri
					</button>
				</div>
				
				{/* Tab Content */}
				<div className="tab-content" style={styles.tabContent}>
					{activeTab === 'work' && <WorkStation />}
					{activeTab === 'inventory' && <InventoryPanel />}
					{activeTab === 'marketplace' && <MarketplacePanel />}
					{activeTab === 'news' && <NewsFeed />}
				</div>
				
				{/* Work in Progress Section */}
				<div className="glass-container animate-fade-in" style={{...styles.wipCard, marginTop: '32px'}}>
					<div style={styles.header}>
						<div style={styles.iconContainer} className="animate-bounce">
							<div style={styles.icon}>🚧</div>
						</div>
						<h2 className="gaming-subtitle" style={{fontSize: '32px', marginBottom: '16px'}}>
							More Features Coming Soon
						</h2>
						<p style={styles.description}>
							🎮 More game modules are in active development!
						</p>
					</div>

					{/* Features Coming Soon */}
					<div style={styles.featuresGrid} className="animate-slide-up" style={{animationDelay: '0.4s'}}>
						<div className="glass-container" style={styles.featureCard}>
							<div style={styles.featureIcon}>🎯</div>
							<div style={styles.featureTitle}>Missions</div>
							<div style={styles.featureStatus}>Coming Soon</div>
						</div>

						<div className="glass-container" style={styles.featureCard}>
							<div style={styles.featureIcon}>⚔️</div>
							<div style={styles.featureTitle}>PvP Arena</div>
							<div style={styles.featureStatus}>Coming Soon</div>
						</div>

						<div className="glass-container" style={styles.featureCard}>
							<div style={styles.featureIcon}>🏆</div>
							<div style={styles.featureTitle}>Leaderboard</div>
							<div style={styles.featureStatus}>Coming Soon</div>
						</div>

						<div className="glass-container" style={styles.featureCard}>
							<div style={styles.featureIcon}>💬</div>
							<div style={styles.featureTitle}>Chat</div>
							<div style={styles.featureStatus}>Coming Soon</div>
						</div>
					</div>

					{/* Quick Links */}
					<div style={styles.quickLinks} className="animate-slide-up" style={{animationDelay: '0.5s'}}>
						<Link to='/account' style={styles.link}>
							<button className="modern-button secondary" style={styles.quickButton}>
								<span style={styles.buttonIcon}>👤</span>
								My Account
							</button>
						</Link>

						{payload.admin && (
							<Link to='/admin' style={styles.link}>
								<button className="modern-button" style={styles.quickButton}>
									<span style={styles.buttonIcon}>⚙️</span>
									Admin Panel
								</button>
							</Link>
						)}

						{payload.mod && !payload.admin && (
							<Link to='/mod' style={styles.link}>
								<button className="modern-button" style={styles.quickButton}>
									<span style={styles.buttonIcon}>🛡️</span>
									Moderator
								</button>
							</Link>
						)}
					</div>

					{/* Logout */}
					<div style={styles.logoutContainer} className="animate-slide-up" style={{animationDelay: '0.6s'}}>
						<Logout />
					</div>
				</div>

				{/* Status Bar */}
				<div style={styles.statusBar} className="animate-slide-up" style={{animationDelay: '0.7s'}}>
					<div style={styles.statusItem}>
						<span style={styles.statusIcon}>✅</span>
						<span style={styles.statusText}>Logged in as {payload.username}</span>
					</div>
					<div style={styles.statusItem}>
						<span style={styles.statusIcon}>🔒</span>
						<span style={styles.statusText}>Role: {payload.role || 'user'}</span>
					</div>
					<div style={styles.statusItem}>
						<span style={styles.statusIcon}>🕐</span>
						<span style={styles.statusText}>Version: Alpha 0.1</span>
					</div>
				</div>
			</div>
		</>
	);
};

const styles = {
	container: {
		minHeight: '100vh',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		padding: '20px',
		position: 'relative',
		zIndex: 1,
		gap: '20px',
	},
	welcomeCard: {
		maxWidth: '900px',
		width: '100%',
		padding: '32px 48px',
	},
	wipCard: {
		maxWidth: '900px',
		width: '100%',
		padding: '60px 48px',
	},
	header: {
		textAlign: 'center',
		marginBottom: '48px',
	},
	iconContainer: {
		marginBottom: '24px',
	},
	icon: {
		fontSize: '96px',
		display: 'inline-block',
		filter: 'drop-shadow(0 8px 20px rgba(255, 193, 7, 0.5))',
	},
	username: {
		color: '#667eea',
		fontWeight: '700',
		textShadow: '0 0 10px rgba(102, 126, 234, 0.5)',
	},
	description: {
		fontSize: '18px',
		color: 'rgba(255, 255, 255, 0.8)',
		lineHeight: '1.6',
		maxWidth: '600px',
		margin: '0 auto',
	},
	featuresGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
		gap: '16px',
		marginBottom: '40px',
	},
	featureCard: {
		padding: '24px',
		textAlign: 'center',
		transition: 'all 0.3s ease',
		cursor: 'default',
	},
	featureIcon: {
		fontSize: '48px',
		marginBottom: '12px',
		filter: 'grayscale(50%)',
		opacity: 0.7,
	},
	featureTitle: {
		fontSize: '18px',
		fontWeight: '600',
		color: '#ffffff',
		marginBottom: '8px',
	},
	featureStatus: {
		fontSize: '12px',
		color: 'rgba(255, 193, 7, 0.8)',
		textTransform: 'uppercase',
		letterSpacing: '1px',
		fontWeight: '600',
	},
	quickLinks: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '12px',
		justifyContent: 'center',
		marginBottom: '32px',
	},
	link: {
		textDecoration: 'none',
	},
	quickButton: {
		minWidth: '160px',
		padding: '12px 24px',
		fontSize: '16px',
	},
	buttonIcon: {
		marginRight: '8px',
		fontSize: '20px',
	},
	logoutContainer: {
		paddingTop: '24px',
		borderTop: '1px solid rgba(255, 255, 255, 0.1)',
		display: 'flex',
		justifyContent: 'center',
	},
	statusBar: {
		maxWidth: '900px',
		width: '100%',
		padding: '16px 24px',
		background: 'rgba(0, 0, 0, 0.3)',
		backdropFilter: 'blur(10px)',
		borderRadius: '12px',
		border: '1px solid rgba(255, 255, 255, 0.1)',
		display: 'flex',
		flexWrap: 'wrap',
		gap: '20px',
		justifyContent: 'center',
	},
	statusItem: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
	},
	statusIcon: {
		fontSize: '18px',
	},
	statusText: {
		fontSize: '14px',
		color: 'rgba(255, 255, 255, 0.8)',
	},
	tabNav: {
		maxWidth: '900px',
		width: '100%',
		padding: '12px',
		display: 'flex',
		gap: '8px',
		justifyContent: 'center',
		flexWrap: 'wrap',
	},
	tabContent: {
		maxWidth: '900px',
		width: '100%',
		marginTop: '16px',
	},
};

export default Dashboard;
