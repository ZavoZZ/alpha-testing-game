import React, { useContext, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import ApplyToBody from '../utilities/apply-to-body';
import { TokenContext } from '../utilities/token-provider';

import '../../styles/modern-game.css';

const validateEmail = require('../../../common/utilities/validate-email');
const config = require('../../config');

const Recover = props => {
	const navigate = useNavigate();
	const authTokens = useContext(TokenContext);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	if (authTokens.accessToken) {
		navigate("/");
	}

	const emailRef = useRef();

	const handleRecoverSubmit = async (evt) => {
		evt.preventDefault();
		setError('');
		setSuccess('');
		setIsLoading(true);

		const [result, redirect] = await handleSubmit(emailRef.current.value);

		if (result) {
			if (redirect) {
				setSuccess(result);
				setTimeout(() => navigate("/"), 2000);
			} else {
				setError(result);
			}
		}

		setIsLoading(false);
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
							<div style={styles.icon}>🔑</div>
						</div>
						<h1 className="gaming-title" style={{fontSize: '42px', marginBottom: '8px'}}>
							Forgot Password
						</h1>
						<p className="gaming-subtitle" style={{fontSize: '16px', marginBottom: '32px'}}>
							Enter your email to recover your account
						</p>
					</div>

					{/* Form */}
					<form onSubmit={handleRecoverSubmit} style={styles.form}>
						<div style={styles.inputGroup}>
							<label style={styles.label}>
								<span style={styles.labelIcon}>📧</span>
								Email Address
							</label>
							<input
								type='email'
								name='email'
								placeholder='Enter your email'
								ref={emailRef}
								className="modern-input"
								disabled={isLoading}
								required
							/>
							<span style={styles.hint}>We'll send you a password reset link</span>
						</div>

						{error && (
							<div style={styles.errorMessage} className="animate-slide-up">
								❌ {error}
							</div>
						)}

						{success && (
							<div style={styles.successMessage} className="animate-slide-up">
								✅ {success}
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
									Sending...
								</span>
							) : (
								<span>
									<span style={styles.buttonIcon}>📨</span>
									Send Reset Link
								</span>
							)}
						</button>
					</form>

					{/* Links */}
					<div style={styles.linksContainer}>
						<Link to='/login' style={styles.link}>
							<div style={styles.textLink}>
								🔓 Back to Login
							</div>
						</Link>
						<Link to='/' style={styles.link}>
							<div style={styles.textLink}>
								🏠 Return Home
							</div>
						</Link>
					</div>
				</div>
			</div>
		</>
	);
};

const handleSubmit = async (email) => {
	email = email.trim();

	const err = handleValidation(email);

	if (err) {
		return [err];
	}

	//send to the auth server
	const result = await fetch(`${config.AUTH_URI}/auth/recover`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			email
		})
	});

	if (!result.ok) {
		const err = `${result.status}: ${await result.text()}`;
		console.error(err);
		return [err, false];
	}

	return [await result.text(), true];
};

const handleValidation = (email) => {
	if (!validateEmail(email)) {
		return 'Please enter a valid email address';
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
	successMessage: {
		padding: '12px 16px',
		background: 'rgba(79, 172, 254, 0.1)',
		border: '1px solid rgba(79, 172, 254, 0.3)',
		borderRadius: '12px',
		color: '#4facfe',
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
};

export default Recover;
