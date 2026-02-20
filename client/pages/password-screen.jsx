import React, { useState, useContext } from 'react';
import { GameAuthContext } from './utilities/game-auth-provider';

const PasswordScreen = () => {
	const { login } = useContext(GameAuthContext);
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		const result = await login(password);

		if (!result.success) {
			setError(result.message || 'Invalid password');
			setPassword('');
		}

		setIsLoading(false);
	};

	return (
		<div style={styles.container}>
			<div style={styles.overlay}></div>
			<div style={styles.card}>
				<div style={styles.logoContainer}>
					<div style={styles.logo}>🎮</div>
					<h1 style={styles.title}>Game Access</h1>
					<p style={styles.subtitle}>Enter password to continue</p>
				</div>

				<form onSubmit={handleSubmit} style={styles.form}>
					<div style={styles.inputGroup}>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter password"
							style={{
								...styles.input,
								...(error ? styles.inputError : {})
							}}
							disabled={isLoading}
							autoFocus
						/>
						{error && (
							<div style={styles.errorMessage}>
								❌ {error}
							</div>
						)}
					</div>

					<button
						type="submit"
						style={{
							...styles.button,
							...(isLoading ? styles.buttonDisabled : {})
						}}
						disabled={isLoading || !password}
					>
						{isLoading ? (
							<span style={styles.spinner}>⏳</span>
						) : (
							'🔓 Unlock'
						)}
					</button>
				</form>

				<div style={styles.footer}>
					<p style={styles.footerText}>
						🔒 Secure Testing Environment
					</p>
				</div>
			</div>
		</div>
	);
};

const styles = {
	container: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
		zIndex: 10000,
	},
	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
		opacity: 0.3,
	},
	card: {
		position: 'relative',
		background: 'white',
		borderRadius: '20px',
		padding: '48px 40px',
		maxWidth: '400px',
		width: '90%',
		boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
		animation: 'slideUp 0.4s ease-out',
	},
	logoContainer: {
		textAlign: 'center',
		marginBottom: '32px',
	},
	logo: {
		fontSize: '64px',
		marginBottom: '16px',
		animation: 'bounce 2s infinite',
	},
	title: {
		fontSize: '28px',
		fontWeight: '700',
		color: '#2d3748',
		margin: '0 0 8px 0',
	},
	subtitle: {
		fontSize: '14px',
		color: '#718096',
		margin: 0,
	},
	form: {
		width: '100%',
	},
	inputGroup: {
		marginBottom: '24px',
	},
	input: {
		width: '100%',
		padding: '16px 20px',
		fontSize: '16px',
		border: '2px solid #e2e8f0',
		borderRadius: '12px',
		outline: 'none',
		transition: 'all 0.3s ease',
		boxSizing: 'border-box',
	},
	inputError: {
		borderColor: '#fc8181',
		animation: 'shake 0.5s',
	},
	errorMessage: {
		color: '#e53e3e',
		fontSize: '14px',
		marginTop: '8px',
		fontWeight: '500',
	},
	button: {
		width: '100%',
		padding: '16px',
		fontSize: '16px',
		fontWeight: '600',
		color: 'white',
		background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		border: 'none',
		borderRadius: '12px',
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
	},
	buttonDisabled: {
		opacity: 0.6,
		cursor: 'not-allowed',
	},
	spinner: {
		display: 'inline-block',
		animation: 'spin 1s linear infinite',
	},
	footer: {
		marginTop: '32px',
		paddingTop: '24px',
		borderTop: '1px solid #e2e8f0',
		textAlign: 'center',
	},
	footerText: {
		fontSize: '13px',
		color: '#a0aec0',
		margin: 0,
	},
};

// Add CSS animations via style tag
if (typeof document !== 'undefined') {
	const styleSheet = document.createElement('style');
	styleSheet.textContent = `
		@keyframes slideUp {
			from {
				opacity: 0;
				transform: translateY(20px);
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}
		@keyframes bounce {
			0%, 100% {
				transform: translateY(0);
			}
			50% {
				transform: translateY(-10px);
			}
		}
		@keyframes shake {
			0%, 100% { transform: translateX(0); }
			10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
			20%, 40%, 60%, 80% { transform: translateX(5px); }
		}
		@keyframes spin {
			from { transform: rotate(0deg); }
			to { transform: rotate(360deg); }
		}
		input:focus {
			border-color: #667eea !important;
			box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
		}
		button:hover:not(:disabled) {
			transform: translateY(-2px);
			box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5) !important;
		}
		button:active:not(:disabled) {
			transform: translateY(0);
		}
	`;
	document.head.appendChild(styleSheet);
}

export default PasswordScreen;
