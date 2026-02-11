import React, { useContext, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import ApplyToBody from '../utilities/apply-to-body';
import { TokenContext } from '../utilities/token-provider';

import '../../styles/modern-game.css';

const validateEmail = require('../../../common/utilities/validate-email');
const validateUsername = require('../../../common/utilities/validate-username');
const config = require('../../config');

const Signup = props => {
	const navigate = useNavigate();
	const authTokens = useContext(TokenContext);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	if (authTokens.accessToken) {
		navigate("/");
	}

	const emailRef = useRef();
	const usernameRef = useRef();
	const passwordRef = useRef();
	const retypeRef = useRef();
	const contactRef = useRef();

	const handleSignupSubmit = async (evt) => {
		evt.preventDefault();
		setError('');
		setIsLoading(true);

		const [result, redirect] = await handleSubmit(
			emailRef.current.value,
			usernameRef.current.value,
			passwordRef.current.value,
			retypeRef.current.value,
			contactRef.current.checked
		);

		if (result) {
			if (redirect) {
				// Success - redirect immediately to login page
				navigate("/login");
			} else {
				// Error message
				setError(result);
				setIsLoading(false);
			}
		} else {
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
							<div style={styles.icon}>⚡</div>
						</div>
						<h1 className="gaming-title" style={{fontSize: '42px', marginBottom: '8px'}}>
							Join the Game
						</h1>
						<p className="gaming-subtitle" style={{fontSize: '16px', marginBottom: '32px'}}>
							Create your account and start playing
						</p>
					</div>

					{/* Form */}
					<form onSubmit={handleSignupSubmit} style={styles.form}>
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
								<span style={styles.labelIcon}>👤</span>
								Username
							</label>
							<input
								type='text'
								name='username'
								placeholder='Choose a username'
								ref={usernameRef}
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
								placeholder='Create a password'
								ref={passwordRef}
								className="modern-input"
								disabled={isLoading}
								required
							/>
							<span style={styles.hint}>Minimum 8 characters</span>
						</div>

						<div style={styles.inputGroup}>
							<label style={styles.label}>
								<span style={styles.labelIcon}>✓</span>
								Confirm Password
							</label>
							<input
								type='password'
								name='retype'
								placeholder='Confirm your password'
								ref={retypeRef}
								className="modern-input"
								disabled={isLoading}
								required
							/>
						</div>

						<div style={styles.checkboxGroup}>
							<label style={styles.checkboxLabel}>
								<input
									type='checkbox'
									name='contact'
									ref={contactRef}
									defaultChecked={true}
									style={styles.checkbox}
									disabled={isLoading}
								/>
								<span style={styles.checkboxText}>
									<span style={styles.labelIcon}>📬</span>
									Allow email notifications
								</span>
							</label>
						</div>

						{error && (
							<div style={styles.errorMessage} className="animate-slide-up">
								❌ {error}
							</div>
						)}

						<button
							type='submit'
							className="modern-button success"
							style={styles.submitButton}
							disabled={isLoading}
						>
							{isLoading ? (
								<span style={styles.loadingText}>
									<span style={styles.spinner}>⏳</span>
									Creating account...
								</span>
							) : (
								<span>
									<span style={styles.buttonIcon}>🚀</span>
									Create Account
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

					{/* Login Prompt */}
					<div style={styles.loginPrompt}>
						<p style={styles.promptText}>
							Already have an account?
						</p>
						<Link to='/login' style={styles.link}>
							<button className="modern-button secondary" style={styles.loginButton}>
								<span style={styles.buttonIcon}>🔓</span>
								Login
							</button>
						</Link>
					</div>
				</div>
			</div>
		</>
	);
};

const handleSubmit = async (email, username, password, retype, contact) => {
	email = email.trim();
	username = username.trim();

	const err = handleValidation(email, username, password, retype);

	if (err) {
		return [err];
	}

	try {
		//send to the auth server
		const result = await fetch(`${config.AUTH_URI}/auth/signup`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email,
				username,
				password,
				contact
			})
		});

		if (!result.ok) {
			const err = await result.text();
			console.error(`Signup failed: ${result.status} - ${err}`);
			return [err, false];
		}

		console.log('Signup successful');
		return [await result.text(), true];
	} catch (error) {
		console.error('Signup request failed:', error);
		return ['Connection error. Please check if the server is running.', false];
	}
};

const handleValidation = (email, username, password, retype) => {
	if (!validateEmail(email)) {
		return 'Invalid email address';
	}

	if (!validateUsername(username)) {
		return 'Invalid username (3-20 characters, alphanumeric)';
	}

	if (password.length < 8) {
		return 'Password must be at least 8 characters';
	}

	if (password !== retype) {
		return 'Passwords do not match';
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
		maxWidth: '500px',
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
		filter: 'drop-shadow(0 5px 15px rgba(79, 172, 254, 0.5))',
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
	hint: {
		fontSize: '12px',
		color: 'rgba(255, 255, 255, 0.5)',
		fontStyle: 'italic',
	},
	checkboxGroup: {
		marginTop: '8px',
	},
	checkboxLabel: {
		display: 'flex',
		alignItems: 'center',
		gap: '12px',
		cursor: 'pointer',
		padding: '12px',
		borderRadius: '12px',
		transition: 'background 0.3s ease',
	},
	checkbox: {
		width: '20px',
		height: '20px',
		cursor: 'pointer',
		accentColor: '#667eea',
	},
	checkboxText: {
		fontSize: '14px',
		color: 'rgba(255, 255, 255, 0.8)',
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
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
	loginPrompt: {
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
	loginButton: {
		width: '100%',
		padding: '14px',
	},
};

export default Signup;
