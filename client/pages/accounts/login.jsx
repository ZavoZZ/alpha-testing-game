import React, { useContext, useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';

import ApplyToBody from '../utilities/apply-to-body';
import { TokenContext } from '../utilities/token-provider';

import '../../styles/modern-game.css';

const validateEmail = require('../../../common/utilities/validate-email');
const config = require('../../config');

const Login = props => {
	const navigate = useNavigate();
	const authTokens = useContext(TokenContext);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	// Check if already logged in on mount
	useEffect(() => {
		if (authTokens.accessToken) {
			console.log('Already logged in, redirecting to dashboard...');
			navigate('/dashboard', { replace: true });
		}
	}, [authTokens.accessToken, navigate]);

	const emailRef = useRef();
	const passwordRef = useRef();

	const handleLoginSubmit = async (evt) => {
		evt.preventDefault();
		setError('');
		setIsLoading(true);

		console.log('Attempting login...');
		const [err, accessToken] = await handleSubmit(emailRef.current.value, passwordRef.current.value);
		
		if (err) {
			console.error('Login error:', err);
			setError(err);
			setIsLoading(false);
			return;
		}

		if (accessToken) {
			console.log('Login successful! Token:', accessToken.substring(0, 20) + '...');
			authTokens.setAccessToken(accessToken);
			
			// Wait for token to be set, then navigate
			setTimeout(() => {
				console.log('Navigating to dashboard...');
				navigate('/dashboard', { replace: true });
			}, 200);
		} else {
			console.error('No token received');
			setError('Login failed - no token received');
			setIsLoading(false);
		}
	};

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
				{[...Array(10)].map((_, i) => (
					<div key={i} className="particle"></div>
				))}
			</div>

			<div style={styles.container}>
				<div className="glass-container animate-slide-up" style={styles.formCard}>
					{/* Header */}
					<div style={styles.header}>
						<div style={styles.iconContainer}>
							<div style={styles.icon}>🔓</div>
						</div>
						<h1 className="gaming-title" style={{fontSize: '42px', marginBottom: '8px'}}>
							Welcome Back
						</h1>
						<p className="gaming-subtitle" style={{fontSize: '16px', marginBottom: '32px'}}>
							Login to continue your adventure
						</p>
					</div>

					{/* Form */}
					<form onSubmit={handleLoginSubmit} style={styles.form}>
						<div style={styles.inputGroup}>
							<label style={styles.label}>
								<span style={styles.labelIcon}>📧</span>
								Email
							</label>
							<input
								type='email'
								name='email'
								placeholder='your@email.com'
								ref={emailRef}
								className="modern-input"
								disabled={isLoading}
								required
							/>
						</div>

						<div style={styles.inputGroup}>
							<label style={styles.label}>
								<span style={styles.labelIcon}>🔒</span>
								Password
							</label>
							<input
								type='password'
								name='password'
								placeholder='Enter your password'
								ref={passwordRef}
								className="modern-input"
								disabled={isLoading}
								required
							/>
						</div>

						{error && (
							<div style={styles.errorMessage} className="animate-slide-up">
								❌ {error}
							</div>
						)}

						<button
							type='submit'
							className="modern-button"
							style={styles.submitButton}
							disabled={isLoading}
						>
							{isLoading ? (
								<span style={styles.loadingText}>
									<span style={styles.spinner}>⏳</span>
									Logging in...
								</span>
							) : (
								<span>
									<span style={styles.buttonIcon}>🚀</span>
									Login
								</span>
							)}
						</button>
					</form>

					{/* Links */}
					<div style={styles.linksContainer}>
						<Link to='/recover' style={styles.link}>
							<div style={styles.textLink}>
								🔑 Forgot Password?
							</div>
						</Link>
						<Link to='/' style={styles.link}>
							<div style={styles.textLink}>
								🏠 Return Home
							</div>
						</Link>
					</div>

					{/* Sign Up Prompt */}
					<div style={styles.signupPrompt}>
						<p style={styles.promptText}>
							Don't have an account?
						</p>
						<Link to='/signup' style={styles.link}>
							<button className="modern-button secondary" style={styles.signupButton}>
								<span style={styles.buttonIcon}>⚡</span>
								Sign Up
							</button>
						</Link>
					</div>
				</div>
			</div>
		</>
	);
};

const handleSubmit = async (email, password) => {
	email = email.trim();

	const err = handleValidation(email, password);

	if (err) {
		return [err, false];
	}

	try {
		//send to the auth server
		const result = await fetch(`${config.AUTH_URI}/auth/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email,
				password,
			}),
			credentials: 'include'
		});

		//handle errors
		if (!result.ok) {
			const err = await result.text();
			console.error(`Login failed: ${result.status} - ${err}`);
			return [err, false];
		}

		//return the new auth tokens
		const accessToken = await result.text();
		console.log('Login successful, token received');
		return [null, accessToken];
	} catch (error) {
		console.error('Login request failed:', error);
		return ['Connection error. Please check if the server is running.', false];
	}
};

const handleValidation = (email, password) => {
	if (!validateEmail(email)) {
		return 'Invalid email address';
	}

	if (password.length < 8) {
		return 'Password must be at least 8 characters';
	}

	return null;
};

const styles = {
	container: {
		minHeight: '100vh',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		padding: '20px',
		position: 'relative',
		zIndex: 1,
	},
	formCard: {
		maxWidth: '480px',
		width: '100%',
		padding: '48px',
	},
	header: {
		textAlign: 'center',
		marginBottom: '32px',
	},
	iconContainer: {
		marginBottom: '16px',
	},
	icon: {
		fontSize: '64px',
		display: 'inline-block',
		animation: 'bounce 2s infinite',
		filter: 'drop-shadow(0 5px 15px rgba(102, 126, 234, 0.5))',
	},
	form: {
		display: 'flex',
		flexDirection: 'column',
		gap: '20px',
	},
	inputGroup: {
		display: 'flex',
		flexDirection: 'column',
		gap: '8px',
	},
	label: {
		fontSize: '14px',
		fontWeight: '600',
		color: 'rgba(255, 255, 255, 0.9)',
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
	},
	labelIcon: {
		fontSize: '16px',
	},
	errorMessage: {
		padding: '12px 16px',
		background: 'rgba(245, 87, 108, 0.1)',
		border: '1px solid rgba(245, 87, 108, 0.3)',
		borderRadius: '12px',
		color: '#ff6b6b',
		fontSize: '14px',
		fontWeight: '500',
		textAlign: 'center',
	},
	submitButton: {
		width: '100%',
		marginTop: '8px',
		padding: '16px',
		fontSize: '16px',
	},
	buttonIcon: {
		marginRight: '8px',
		fontSize: '18px',
	},
	loadingText: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '8px',
	},
	spinner: {
		display: 'inline-block',
		animation: 'spin 1s linear infinite',
	},
	linksContainer: {
		display: 'flex',
		flexDirection: 'column',
		gap: '12px',
		marginTop: '24px',
		paddingTop: '24px',
		borderTop: '1px solid rgba(255, 255, 255, 0.1)',
	},
	link: {
		textDecoration: 'none',
	},
	textLink: {
		color: 'rgba(255, 255, 255, 0.8)',
		fontSize: '14px',
		textAlign: 'center',
		padding: '8px',
		borderRadius: '8px',
		transition: 'all 0.3s ease',
		cursor: 'pointer',
	},
	signupPrompt: {
		marginTop: '32px',
		textAlign: 'center',
		paddingTop: '24px',
		borderTop: '1px solid rgba(255, 255, 255, 0.1)',
	},
	promptText: {
		color: 'rgba(255, 255, 255, 0.7)',
		fontSize: '14px',
		marginBottom: '16px',
	},
	signupButton: {
		width: '100%',
		padding: '14px',
	},
};

// Add spin animation keyframe
if (typeof document !== 'undefined') {
	const style = document.createElement('style');
	style.textContent = `
		@keyframes spin {
			from { transform: rotate(0deg); }
			to { transform: rotate(360deg); }
		}
		.text-link:hover {
			background: rgba(255, 255, 255, 0.05);
			color: rgba(255, 255, 255, 1);
		}
	`;
	document.head.appendChild(style);
}

export default Login;
