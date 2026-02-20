import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router';
import { TokenContext } from '../utilities/token-provider';

const config = require('../../config');

const AdminPanel = () => {
	const navigate = useNavigate();
	const authTokens = useContext(TokenContext);
	const [users, setUsers] = useState([]);
	const [stats, setStats] = useState({ total: 0, admins: 0, moderators: 0, banned: 0 });
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [selectedUser, setSelectedUser] = useState(null);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [newUser, setNewUser] = useState({
		email: '',
		username: '',
		password: '',
		role: 'user'
	});

	// Check if user is admin
	useEffect(() => {
		const checkAdmin = async () => {
			if (!authTokens.accessToken) {
				navigate('/login');
				return;
			}

			// Decode JWT to check if admin
			try {
				const payload = JSON.parse(atob(authTokens.accessToken.split('.')[1]));
				if (!payload.admin) {
					setError('⛔ Access Denied - Admin only');
					setTimeout(() => navigate('/dashboard'), 2000);
					return;
				}
				fetchUsers();
			} catch (err) {
				navigate('/login');
			}
		};

		checkAdmin();
	}, [authTokens.accessToken, navigate]);

	const fetchUsers = async () => {
		setIsLoading(true);
		setError('');

		try {
			const response = await fetch(`${config.AUTH_URI}/auth/admin/users`, {
				headers: {
					'Authorization': `Bearer ${authTokens.accessToken}`
				}
			});

			if (!response.ok) {
				throw new Error('Failed to fetch users');
			}

			const data = await response.json();
			setUsers(data.users);
			
			// Calculate stats
			const stats = {
				total: data.users.length,
				admins: data.users.filter(u => u.role === 'admin').length,
				moderators: data.users.filter(u => u.role === 'moderator').length,
				banned: data.users.filter(u => u.isBanned).length
			};
			setStats(stats);
		} catch (err) {
			setError('Failed to load users: ' + err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const updateUserRole = async (userId, newRole) => {
		try {
			const response = await fetch(`${config.AUTH_URI}/auth/admin/users/${userId}/role`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${authTokens.accessToken}`
				},
				body: JSON.stringify({ role: newRole })
			});

			if (!response.ok) {
				throw new Error('Failed to update role');
			}

			setSuccessMessage(`✅ User role updated to ${newRole}`);
			setTimeout(() => setSuccessMessage(''), 3000);
			fetchUsers();
		} catch (err) {
			setError('Failed to update role: ' + err.message);
		}
	};

	const toggleBanUser = async (userId, currentBanStatus) => {
		try {
			const response = await fetch(`${config.AUTH_URI}/auth/admin/users/${userId}/ban`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${authTokens.accessToken}`
				},
				body: JSON.stringify({ isBanned: !currentBanStatus })
			});

			if (!response.ok) {
				throw new Error('Failed to update ban status');
			}

			setSuccessMessage(`✅ User ${!currentBanStatus ? 'banned' : 'unbanned'} successfully`);
			setTimeout(() => setSuccessMessage(''), 3000);
			fetchUsers();
		} catch (err) {
			setError('Failed to update ban status: ' + err.message);
		}
	};

	const deleteUser = async (userId) => {
		if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone!')) {
			return;
		}

		try {
			const response = await fetch(`${config.AUTH_URI}/auth/admin/users/${userId}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${authTokens.accessToken}`
				}
			});

			if (!response.ok) {
				throw new Error('Failed to delete user');
			}

			setSuccessMessage('✅ User deleted successfully');
			setTimeout(() => setSuccessMessage(''), 3000);
			fetchUsers();
		} catch (err) {
			setError('Failed to delete user: ' + err.message);
		}
	};

	const createUser = async (e) => {
		e.preventDefault();
		setError('');

		try {
			const response = await fetch(`${config.AUTH_URI}/auth/admin/users`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${authTokens.accessToken}`
				},
				body: JSON.stringify(newUser)
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText);
			}

			setSuccessMessage('✅ User created successfully');
			setTimeout(() => setSuccessMessage(''), 3000);
			
			// Reset form and close modal
			setNewUser({ email: '', username: '', password: '', role: 'user' });
			setShowCreateForm(false);
			
			fetchUsers();
		} catch (err) {
			setError('Failed to create user: ' + err.message);
		}
	};

	return (
		<div style={styles.container}>
			<div style={styles.overlay}></div>
			
			<div style={styles.content}>
				{/* Header */}
				<div style={styles.header}>
					<div style={styles.headerLeft}>
						<div style={styles.adminIcon}>👑</div>
						<div>
							<h1 style={styles.title}>Admin Panel</h1>
							<p style={styles.subtitle}>User Management & Statistics</p>
						</div>
					</div>
					<button 
						style={styles.backButton}
						onClick={() => navigate('/dashboard')}
					>
						← Back to Game
					</button>
				</div>

				{/* Stats Cards */}
				<div style={styles.statsGrid}>
					<div style={{...styles.statCard, ...styles.statCardPrimary}}>
						<div style={styles.statIcon}>👥</div>
						<div style={styles.statValue}>{stats.total}</div>
						<div style={styles.statLabel}>Total Users</div>
					</div>
					<div style={{...styles.statCard, ...styles.statCardSuccess}}>
						<div style={styles.statIcon}>👑</div>
						<div style={styles.statValue}>{stats.admins}</div>
						<div style={styles.statLabel}>Admins</div>
					</div>
					<div style={{...styles.statCard, ...styles.statCardWarning}}>
						<div style={styles.statIcon}>🛡️</div>
						<div style={styles.statValue}>{stats.moderators}</div>
						<div style={styles.statLabel}>Moderators</div>
					</div>
					<div style={{...styles.statCard, ...styles.statCardDanger}}>
						<div style={styles.statIcon}>🚫</div>
						<div style={styles.statValue}>{stats.banned}</div>
						<div style={styles.statLabel}>Banned</div>
					</div>
				</div>

				{/* Messages */}
				{error && (
					<div style={styles.errorMessage}>
						❌ {error}
					</div>
				)}
				
				{successMessage && (
					<div style={styles.successMessage}>
						{successMessage}
					</div>
				)}

				{/* Users Table */}
				<div style={styles.tableCard}>
					<div style={styles.tableHeader}>
						<h2 style={styles.tableTitle}>
							<span style={styles.tableIcon}>📋</span>
							All Users
						</h2>
						<div style={styles.tableHeaderActions}>
							<button 
								style={styles.addUserButton}
								onClick={() => setShowCreateForm(true)}
							>
								➕ Add New User
							</button>
							<button 
								style={styles.refreshButton}
								onClick={fetchUsers}
								disabled={isLoading}
							>
								{isLoading ? '⏳' : '🔄'} Refresh
							</button>
						</div>
					</div>

					{/* Create User Modal */}
					{showCreateForm && (
						<div style={styles.modalOverlay} onClick={() => setShowCreateForm(false)}>
							<div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
								<div style={styles.modalHeader}>
									<h3 style={styles.modalTitle}>➕ Create New User</h3>
									<button 
										style={styles.modalCloseButton}
										onClick={() => setShowCreateForm(false)}
									>
										✕
									</button>
								</div>
								
								<form onSubmit={createUser} style={styles.modalForm}>
									<div style={styles.formGroup}>
										<label style={styles.formLabel}>Email</label>
										<input
											type="email"
											style={styles.formInput}
											value={newUser.email}
											onChange={(e) => setNewUser({...newUser, email: e.target.value})}
											placeholder="user@example.com"
											required
										/>
									</div>

									<div style={styles.formGroup}>
										<label style={styles.formLabel}>Username</label>
										<input
											type="text"
											style={styles.formInput}
											value={newUser.username}
											onChange={(e) => setNewUser({...newUser, username: e.target.value})}
											placeholder="username"
											required
											minLength={3}
										/>
									</div>

									<div style={styles.formGroup}>
										<label style={styles.formLabel}>Password</label>
										<input
											type="password"
											style={styles.formInput}
											value={newUser.password}
											onChange={(e) => setNewUser({...newUser, password: e.target.value})}
											placeholder="Minimum 8 characters"
											required
											minLength={8}
										/>
									</div>

									<div style={styles.formGroup}>
										<label style={styles.formLabel}>Role</label>
										<select
											style={styles.formSelect}
											value={newUser.role}
											onChange={(e) => setNewUser({...newUser, role: e.target.value})}
										>
											<option value="user">User</option>
											<option value="moderator">Moderator</option>
											<option value="admin">Admin</option>
										</select>
									</div>

									<div style={styles.modalActions}>
										<button
											type="button"
											style={styles.cancelButton}
											onClick={() => setShowCreateForm(false)}
										>
											Cancel
										</button>
										<button
											type="submit"
											style={styles.submitButton}
										>
											Create User
										</button>
									</div>
								</form>
							</div>
						</div>
					)}

					{isLoading ? (
						<div style={styles.loadingContainer}>
							<div style={styles.spinner}>⏳</div>
							<p style={styles.loadingText}>Loading users...</p>
						</div>
					) : (
						<div style={styles.tableWrapper}>
							<table style={styles.table}>
								<thead>
									<tr style={styles.tableHeaderRow}>
										<th style={styles.th}>User</th>
										<th style={styles.th}>Email</th>
										<th style={styles.th}>Role</th>
										<th style={styles.th}>Status</th>
										<th style={styles.th}>Last Login</th>
										<th style={styles.th}>Actions</th>
									</tr>
								</thead>
								<tbody>
									{users.map(user => (
										<tr key={user._id} style={styles.tableRow}>
											<td style={styles.td}>
												<div style={styles.userCell}>
													<div style={styles.userAvatar}>
														{user.username[0].toUpperCase()}
													</div>
													<span style={styles.username}>{user.username}</span>
												</div>
											</td>
											<td style={styles.td}>{user.email}</td>
											<td style={styles.td}>
												<span style={{
													...styles.badge,
													...(user.role === 'admin' ? styles.badgeAdmin : 
														user.role === 'moderator' ? styles.badgeMod : 
														styles.badgeUser)
												}}>
													{user.role === 'admin' && '👑 '}
													{user.role === 'moderator' && '🛡️ '}
													{user.role}
												</span>
											</td>
											<td style={styles.td}>
												{user.isBanned ? (
													<span style={styles.badgeBanned}>🚫 Banned</span>
												) : (
													<span style={styles.badgeActive}>✅ Active</span>
												)}
											</td>
											<td style={styles.td}>
												{user.lastLogin ? 
													new Date(user.lastLogin).toLocaleDateString() : 
													'Never'}
											</td>
											<td style={styles.td}>
												<div style={styles.actionsCell}>
													<select
														style={styles.roleSelect}
														value={user.role}
														onChange={(e) => updateUserRole(user._id, e.target.value)}
													>
														<option value="user">User</option>
														<option value="moderator">Moderator</option>
														<option value="admin">Admin</option>
													</select>
													
													<button
														style={{
															...styles.actionButton,
															...(user.isBanned ? styles.actionButtonSuccess : styles.actionButtonWarning)
														}}
														onClick={() => toggleBanUser(user._id, user.isBanned)}
													>
														{user.isBanned ? '✅' : '🚫'}
													</button>
													
													<button
														style={{...styles.actionButton, ...styles.actionButtonDanger}}
														onClick={() => deleteUser(user._id)}
													>
														🗑️
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
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
		background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		overflow: 'auto',
		fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
	},
	overlay: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
		opacity: 0.3,
		pointerEvents: 'none',
	},
	content: {
		position: 'relative',
		maxWidth: '1400px',
		margin: '0 auto',
		padding: '40px 20px',
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: '32px',
		padding: '24px',
		background: 'white',
		borderRadius: '20px',
		boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
	},
	headerLeft: {
		display: 'flex',
		alignItems: 'center',
		gap: '16px',
	},
	adminIcon: {
		fontSize: '48px',
		animation: 'bounce 2s infinite',
	},
	title: {
		fontSize: '32px',
		fontWeight: '700',
		color: '#2d3748',
		margin: 0,
	},
	subtitle: {
		fontSize: '14px',
		color: '#718096',
		margin: '4px 0 0 0',
	},
	backButton: {
		padding: '12px 24px',
		fontSize: '14px',
		fontWeight: '600',
		color: '#667eea',
		background: '#f7fafc',
		border: '2px solid #667eea',
		borderRadius: '12px',
		cursor: 'pointer',
		transition: 'all 0.3s ease',
	},
	statsGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
		gap: '20px',
		marginBottom: '32px',
	},
	statCard: {
		background: 'white',
		borderRadius: '16px',
		padding: '24px',
		boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
		textAlign: 'center',
		transition: 'transform 0.3s ease',
	},
	statCardPrimary: {
		borderTop: '4px solid #667eea',
	},
	statCardSuccess: {
		borderTop: '4px solid #48bb78',
	},
	statCardWarning: {
		borderTop: '4px solid #ed8936',
	},
	statCardDanger: {
		borderTop: '4px solid #f56565',
	},
	statIcon: {
		fontSize: '32px',
		marginBottom: '8px',
	},
	statValue: {
		fontSize: '36px',
		fontWeight: '700',
		color: '#2d3748',
		marginBottom: '4px',
	},
	statLabel: {
		fontSize: '14px',
		color: '#718096',
		fontWeight: '500',
	},
	errorMessage: {
		padding: '16px 24px',
		background: '#fff5f5',
		border: '2px solid #fc8181',
		borderRadius: '12px',
		color: '#c53030',
		marginBottom: '24px',
		fontWeight: '500',
	},
	successMessage: {
		padding: '16px 24px',
		background: '#f0fff4',
		border: '2px solid #68d391',
		borderRadius: '12px',
		color: '#2f855a',
		marginBottom: '24px',
		fontWeight: '500',
	},
	tableCard: {
		background: 'white',
		borderRadius: '20px',
		padding: '24px',
		boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
	},
	tableHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: '24px',
		paddingBottom: '16px',
		borderBottom: '2px solid #e2e8f0',
	},
	tableTitle: {
		fontSize: '24px',
		fontWeight: '700',
		color: '#2d3748',
		margin: 0,
		display: 'flex',
		alignItems: 'center',
		gap: '12px',
	},
	tableIcon: {
		fontSize: '28px',
	},
	tableHeaderActions: {
		display: 'flex',
		gap: '12px',
		alignItems: 'center',
	},
	addUserButton: {
		padding: '10px 20px',
		fontSize: '14px',
		fontWeight: '600',
		color: 'white',
		background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
		border: 'none',
		borderRadius: '10px',
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)',
	},
	refreshButton: {
		padding: '10px 20px',
		fontSize: '14px',
		fontWeight: '600',
		color: 'white',
		background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		border: 'none',
		borderRadius: '10px',
		cursor: 'pointer',
		transition: 'all 0.3s ease',
	},
	loadingContainer: {
		textAlign: 'center',
		padding: '60px',
	},
	spinner: {
		fontSize: '48px',
		marginBottom: '16px',
		display: 'inline-block',
		animation: 'spin 1s linear infinite',
	},
	loadingText: {
		fontSize: '16px',
		color: '#718096',
	},
	tableWrapper: {
		overflowX: 'auto',
	},
	table: {
		width: '100%',
		borderCollapse: 'collapse',
	},
	tableHeaderRow: {
		background: '#f7fafc',
		borderRadius: '12px',
	},
	th: {
		padding: '16px',
		textAlign: 'left',
		fontSize: '14px',
		fontWeight: '700',
		color: '#2d3748',
		borderBottom: '2px solid #e2e8f0',
	},
	tableRow: {
		borderBottom: '1px solid #e2e8f0',
		transition: 'background 0.2s ease',
	},
	td: {
		padding: '16px',
		fontSize: '14px',
		color: '#4a5568',
	},
	userCell: {
		display: 'flex',
		alignItems: 'center',
		gap: '12px',
	},
	userAvatar: {
		width: '40px',
		height: '40px',
		borderRadius: '50%',
		background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		color: 'white',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontWeight: '700',
		fontSize: '16px',
	},
	username: {
		fontWeight: '600',
		color: '#2d3748',
	},
	badge: {
		display: 'inline-block',
		padding: '6px 12px',
		borderRadius: '8px',
		fontSize: '12px',
		fontWeight: '600',
	},
	badgeAdmin: {
		background: '#faf089',
		color: '#744210',
	},
	badgeMod: {
		background: '#fed7d7',
		color: '#742a2a',
	},
	badgeUser: {
		background: '#bee3f8',
		color: '#2c5282',
	},
	badgeBanned: {
		background: '#fed7d7',
		color: '#c53030',
		padding: '6px 12px',
		borderRadius: '8px',
		fontSize: '12px',
		fontWeight: '600',
	},
	badgeActive: {
		background: '#c6f6d5',
		color: '#22543d',
		padding: '6px 12px',
		borderRadius: '8px',
		fontSize: '12px',
		fontWeight: '600',
	},
	actionsCell: {
		display: 'flex',
		gap: '8px',
		alignItems: 'center',
	},
	roleSelect: {
		padding: '8px 12px',
		fontSize: '12px',
		borderRadius: '8px',
		border: '2px solid #e2e8f0',
		background: 'white',
		cursor: 'pointer',
		fontWeight: '500',
	},
	actionButton: {
		padding: '8px 12px',
		fontSize: '16px',
		border: 'none',
		borderRadius: '8px',
		cursor: 'pointer',
		transition: 'all 0.3s ease',
	},
	actionButtonWarning: {
		background: '#fed7aa',
	},
	actionButtonSuccess: {
		background: '#c6f6d5',
	},
	actionButtonDanger: {
		background: '#fed7d7',
	},
	// Modal styles
	modalOverlay: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		background: 'rgba(0, 0, 0, 0.6)',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1000,
		backdropFilter: 'blur(4px)',
	},
	modalContent: {
		background: 'white',
		borderRadius: '20px',
		padding: '32px',
		maxWidth: '500px',
		width: '90%',
		boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
		animation: 'slideUp 0.3s ease-out',
	},
	modalHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: '24px',
		paddingBottom: '16px',
		borderBottom: '2px solid #e2e8f0',
	},
	modalTitle: {
		fontSize: '24px',
		fontWeight: '700',
		color: '#2d3748',
		margin: 0,
	},
	modalCloseButton: {
		background: 'none',
		border: 'none',
		fontSize: '24px',
		color: '#a0aec0',
		cursor: 'pointer',
		padding: '4px 8px',
		transition: 'color 0.2s ease',
	},
	modalForm: {
		display: 'flex',
		flexDirection: 'column',
		gap: '20px',
	},
	formGroup: {
		display: 'flex',
		flexDirection: 'column',
		gap: '8px',
	},
	formLabel: {
		fontSize: '14px',
		fontWeight: '600',
		color: '#2d3748',
	},
	formInput: {
		padding: '12px 16px',
		fontSize: '14px',
		border: '2px solid #e2e8f0',
		borderRadius: '10px',
		outline: 'none',
		transition: 'all 0.3s ease',
		fontFamily: 'inherit',
	},
	formSelect: {
		padding: '12px 16px',
		fontSize: '14px',
		border: '2px solid #e2e8f0',
		borderRadius: '10px',
		outline: 'none',
		background: 'white',
		cursor: 'pointer',
		fontFamily: 'inherit',
	},
	modalActions: {
		display: 'flex',
		gap: '12px',
		marginTop: '8px',
	},
	cancelButton: {
		flex: 1,
		padding: '12px',
		fontSize: '14px',
		fontWeight: '600',
		color: '#718096',
		background: '#f7fafc',
		border: '2px solid #e2e8f0',
		borderRadius: '10px',
		cursor: 'pointer',
		transition: 'all 0.3s ease',
	},
	submitButton: {
		flex: 1,
		padding: '12px',
		fontSize: '14px',
		fontWeight: '600',
		color: 'white',
		background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
		border: 'none',
		borderRadius: '10px',
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)',
	},
};

// Add CSS animations
if (typeof document !== 'undefined') {
	const styleSheet = document.createElement('style');
	styleSheet.textContent = `
		@keyframes bounce {
			0%, 100% { transform: translateY(0); }
			50% { transform: translateY(-10px); }
		}
		@keyframes spin {
			from { transform: rotate(0deg); }
			to { transform: rotate(360deg); }
		}
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
		button:hover:not(:disabled) {
			transform: translateY(-2px);
			box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
		}
		.stat-card:hover {
			transform: translateY(-5px);
		}
		tr:hover {
			background: #f7fafc !important;
		}
		input:focus, select:focus {
			border-color: #667eea !important;
			box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
		}
	`;
	document.head.appendChild(styleSheet);
}

export default AdminPanel;
