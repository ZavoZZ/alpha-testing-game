/**
 * ============================================================================
 * WORKSTATION COMPONENT - THE SALARY INTERFACE
 * ============================================================================
 * 
 * Complete work system interface with:
 * - Real-time salary preview
 * - Cooldown countdown timer
 * - Company solvency warnings
 * - Performance modifiers display
 * - Auto-hire to government company
 * 
 * Module: 2.2.C - The Workstation Interface & API Bridge
 * 
 * STATES:
 * - Loading: Fetching status from API
 * - No Job: Unemployed (show hire button)
 * - Ready: Can work (show paycheck preview + START SHIFT button)
 * - Cooldown: Must wait (show countdown timer)
 * - Blocked: Cannot work (low energy, insolvency, etc.)
 * 
 * @version 1.0.0
 * @date 2026-02-12
 */

import React, { useState, useEffect, useContext } from 'react';
import { TokenContext } from '../utilities/token-provider';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ovidiuguru.online';

const WorkStation = () => {
	const authTokens = useContext(TokenContext);
	
	// State management
	const [workStatus, setWorkStatus] = useState(null);
	const [loading, setLoading] = useState(true);
	const [working, setWorking] = useState(false);
	const [error, setError] = useState(null);
	const [countdown, setCountdown] = useState('');
	
	/**
	 * Fetch work status from API
	 */
	const fetchWorkStatus = async () => {
		try {
			setLoading(true);
			setError(null);
			
			const response = await fetch(`${API_BASE_URL}/api/economy/work/status`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${authTokens.accessToken}`,
					'Content-Type': 'application/json'
				}
			});
			
			const data = await response.json();
			
			if (!data.success) {
				throw new Error(data.message || 'Failed to fetch work status');
			}
			
			setWorkStatus(data);
			
		} catch (err) {
			console.error('[WorkStation] Error fetching status:', err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};
	
	/**
	 * Execute work shift
	 */
	const executeWorkShift = async () => {
		try {
			setWorking(true);
			setError(null);
			
			const response = await fetch(`${API_BASE_URL}/api/economy/work`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${authTokens.accessToken}`,
					'Content-Type': 'application/json'
				}
			});
			
			const data = await response.json();
			
			if (!data.success) {
				throw new Error(data.message || 'Work shift failed');
			}
			
			// Show success message
			alert(`✅ ${data.message}\n\nYou earned €${data.earnings.net}!`);
			
			// Refresh status
			await fetchWorkStatus();
			
		} catch (err) {
			console.error('[WorkStation] Error executing work:', err);
			setError(err.message);
		} finally {
			setWorking(false);
		}
	};
	
	/**
	 * Sign contract (auto-hire to government company)
	 */
	const signContract = async () => {
		try {
			setWorking(true);
			setError(null);
			
			// Execute first work shift (auto-hires to government)
			await executeWorkShift();
			
		} catch (err) {
			console.error('[WorkStation] Error signing contract:', err);
			setError(err.message);
		} finally {
			setWorking(false);
		}
	};
	
	/**
	 * Countdown timer effect
	 */
	useEffect(() => {
		if (!workStatus || !workStatus.cooldown || workStatus.cooldown.is_ready) {
			return;
		}
		
		const updateCountdown = () => {
			const now = Date.now();
			const nextAvailable = new Date(workStatus.cooldown.next_available_at).getTime();
			const remaining = nextAvailable - now;
			
			if (remaining <= 0) {
				setCountdown('Ready!');
				// Refresh status
				fetchWorkStatus();
				return;
			}
			
			const hours = Math.floor(remaining / (60 * 60 * 1000));
			const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
			const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
			
			setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
		};
		
		updateCountdown();
		const interval = setInterval(updateCountdown, 1000);
		
		return () => clearInterval(interval);
	}, [workStatus]);
	
	/**
	 * Fetch status on mount
	 */
	useEffect(() => {
		fetchWorkStatus();
	}, []);
	
	// ========================================================================
	// RENDER: LOADING STATE
	// ========================================================================
	
	if (loading) {
		return (
			<div className="glass-container animate-fade-in" style={styles.container}>
				<div style={styles.header}>
					<div style={styles.icon}>💼</div>
					<h2 style={styles.title}>WorkStation</h2>
				</div>
				
				<div style={styles.skeleton}>
					<div className="skeleton-line" style={{width: '60%', height: '24px', marginBottom: '12px'}}></div>
					<div className="skeleton-line" style={{width: '40%', height: '20px', marginBottom: '24px'}}></div>
					<div className="skeleton-line" style={{width: '100%', height: '100px'}}></div>
				</div>
			</div>
		);
	}
	
	// ========================================================================
	// RENDER: ERROR STATE
	// ========================================================================
	
	if (error) {
		return (
			<div className="glass-container animate-fade-in" style={styles.container}>
				<div style={styles.header}>
					<div style={styles.icon}>❌</div>
					<h2 style={styles.title}>Error</h2>
				</div>
				
				<div style={styles.errorBox}>
					<p style={styles.errorText}>{error}</p>
					<button 
						className="modern-button secondary" 
						onClick={fetchWorkStatus}
						style={{marginTop: '16px'}}
					>
						Retry
					</button>
				</div>
			</div>
		);
	}
	
	// ========================================================================
	// RENDER: NO JOB STATE
	// ========================================================================
	
	if (!workStatus.hasJob) {
		return (
			<div className="glass-container animate-fade-in" style={styles.container}>
				<div style={styles.header}>
					<div style={styles.icon}>📄</div>
					<h2 style={styles.title}>Employment Center</h2>
				</div>
				
				<div style={styles.noJobBox}>
					<p style={styles.noJobText}>
						You are currently <strong>unemployed</strong>.
					</p>
					<p style={styles.noJobSubtext}>
						Sign a contract with the government to start earning money!
					</p>
					
					{workStatus.suggestedEmployer && (
						<div style={styles.suggestedEmployer}>
							<div style={styles.companyName}>
								🏛️ {workStatus.suggestedEmployer.name}
							</div>
							<div style={styles.wageOffer}>
								Wage: €{workStatus.suggestedEmployer.wage_offer}/shift
							</div>
						</div>
					)}
					
					<button 
						className="modern-button primary animate-pulse"
						onClick={signContract}
						disabled={working}
						style={{marginTop: '24px', width: '100%', maxWidth: '300px'}}
					>
						{working ? 'Signing Contract...' : '📝 Sign Contract & Start Working'}
					</button>
				</div>
			</div>
		);
	}
	
	// ========================================================================
	// RENDER: HAS JOB - Paycheck Preview
	// ========================================================================
	
	const { company, player, canWork, blockedReason, salary_preview, cooldown, warnings } = workStatus;
	
	// Determine if cooldown is active
	const cooldownActive = cooldown && !cooldown.is_ready;
	
	return (
		<div className="glass-container animate-fade-in" style={styles.container}>
			{/* Header */}
			<div style={styles.header}>
				<div style={styles.icon}>💼</div>
				<h2 style={styles.title}>WorkStation</h2>
			</div>
			
			{/* Company Info */}
			<div style={styles.companyInfo}>
				<div style={styles.companyName}>🏢 {company.name}</div>
				<div style={styles.companyType}>{company.type}</div>
				<div style={styles.wageOffer}>Base Wage: €{company.wage_offer}/shift</div>
			</div>
			
			{/* Player Stats */}
			<div style={styles.statsGrid}>
				<div style={styles.statBox}>
					<div style={styles.statLabel}>Energy</div>
					<div style={{...styles.statValue, color: getStatColor(player.energy)}}>
						{player.energy}/100
					</div>
				</div>
				<div style={styles.statBox}>
					<div style={styles.statLabel}>Happiness</div>
					<div style={{...styles.statValue, color: getStatColor(player.happiness)}}>
						{player.happiness}/100
					</div>
				</div>
				<div style={styles.statBox}>
					<div style={styles.statLabel}>Health</div>
					<div style={{...styles.statValue, color: getStatColor(player.health)}}>
						{player.health}/100
					</div>
				</div>
			</div>
			
			{/* Warnings */}
			{warnings && warnings.length > 0 && (
				<div style={styles.warningsContainer}>
					{warnings.map((warning, idx) => (
						<div 
							key={idx}
							style={{
								...styles.warningBox,
								borderColor: warning.severity === 'critical' ? '#ff4444' : '#ffaa00'
							}}
						>
							<span style={styles.warningIcon}>
								{warning.severity === 'critical' ? '🚨' : '⚠️'}
							</span>
							<span style={styles.warningText}>{warning.message}</span>
						</div>
					))}
				</div>
			)}
			
			{/* Paycheck Preview (if can work and not on cooldown) */}
			{canWork && !cooldownActive && salary_preview && (
				<div style={styles.paycheckPreview} className="animate-slide-up">
					<div style={styles.paycheckTitle}>💰 Paycheck Preview</div>
					
					<div style={styles.paycheckRow}>
						<span style={styles.paycheckLabel}>Base Wage:</span>
						<span style={styles.paycheckValue}>€{salary_preview.base_wage}</span>
					</div>
					
					<div style={styles.paycheckRow}>
						<span style={styles.paycheckLabel}>Gross Salary:</span>
						<span style={styles.paycheckValue}>€{salary_preview.gross_estimated}</span>
					</div>
					
					<div style={styles.paycheckRow}>
						<span style={styles.paycheckLabel}>Income Tax (15%):</span>
						<span style={{...styles.paycheckValue, color: '#ff4444'}}>
							-€{salary_preview.tax_estimated}
						</span>
					</div>
					
					{salary_preview.modifiers.exhaustionPenaltyApplied && (
						<div style={styles.paycheckRow}>
							<span style={{...styles.paycheckLabel, color: '#ff4444'}}>
								⚠️ Exhaustion Penalty:
							</span>
							<span style={{...styles.paycheckValue, color: '#ff4444'}}>
								-15%
							</span>
						</div>
					)}
					
					{salary_preview.modifiers.depressionPenaltyApplied && (
						<div style={styles.paycheckRow}>
							<span style={{...styles.paycheckLabel, color: '#ff0000'}}>
								🚨 Depression Penalty:
							</span>
							<span style={{...styles.paycheckValue, color: '#ff0000'}}>
								-50%
							</span>
						</div>
					)}
					
					<div style={styles.paycheckDivider}></div>
					
					<div style={styles.paycheckRow}>
						<span style={{...styles.paycheckLabel, fontWeight: 'bold', fontSize: '18px'}}>
							Net Salary:
						</span>
						<span style={{...styles.paycheckValue, fontWeight: 'bold', fontSize: '24px', color: '#44ff88'}}>
							€{salary_preview.net_estimated}
						</span>
					</div>
					
					<div style={styles.efficiencyBar}>
						<div style={styles.efficiencyLabel}>
							Productivity: {salary_preview.efficiency.combinedPercentage}
						</div>
						<div style={styles.efficiencyBarBg}>
							<div 
								style={{
									...styles.efficiencyBarFill,
									width: salary_preview.efficiency.combinedPercentage
								}}
							></div>
						</div>
					</div>
					
					<div style={styles.costInfo}>
						⚡ Energy Cost: {salary_preview.energy_cost}
					</div>
				</div>
			)}
			
			{/* Cooldown Countdown */}
			{cooldownActive && (
				<div style={styles.cooldownBox} className="animate-pulse">
					<div style={styles.cooldownIcon}>⏰</div>
					<div style={styles.cooldownTitle}>Cooldown Active</div>
					<div style={styles.cooldownTimer}>{countdown}</div>
					<div style={styles.cooldownSubtext}>
						You can work again in {cooldown.time_remaining_formatted}
					</div>
				</div>
			)}
			
			{/* Action Button */}
			<div style={styles.actionContainer}>
				{cooldownActive ? (
					<button 
						className="modern-button secondary"
						disabled
						style={{width: '100%', opacity: 0.5}}
					>
						⏰ Next Shift: {countdown}
					</button>
				) : canWork ? (
					<button 
						className="modern-button primary animate-pulse"
						onClick={executeWorkShift}
						disabled={working}
						style={{width: '100%', fontSize: '18px', padding: '16px'}}
					>
						{working ? '⏳ Working...' : '💼 START SHIFT'}
					</button>
				) : (
					<button 
						className="modern-button secondary"
						disabled
						style={{width: '100%', opacity: 0.5}}
					>
						{blockedReason === 'INSUFFICIENT_ENERGY' ? '⚡ Insufficient Energy' :
						 blockedReason === 'COMPANY_INSOLVENT' ? '💸 Company Insolvent' :
						 blockedReason === 'DEAD' ? '💀 Cannot Work (Dead)' :
						 blockedReason === 'VACATION_MODE' ? '🏖️ Vacation Mode Active' :
						 '🚫 Cannot Work'}
					</button>
				)}
			</div>
			
			{/* Company Funds Warning */}
			{company && !company.can_afford_salary && (
				<div style={styles.insolvencyWarning}>
					<span style={styles.warningIcon}>🚨</span>
					<span style={styles.insolvencyText}>
						<strong>Company Insolvent!</strong> {company.name} has only €{company.funds} remaining.
						They cannot afford to pay your salary. Contact the owner!
					</span>
				</div>
			)}
			
			{/* Work Stats */}
			{player && player.total_shifts_worked > 0 && (
				<div style={styles.statsFooter}>
					<div style={styles.statItem}>
						<span style={styles.statLabel}>Total Shifts:</span>
						<span style={styles.statValue}>{player.total_shifts_worked}</span>
					</div>
					<div style={styles.statItem}>
						<span style={styles.statLabel}>Current Balance:</span>
						<span style={{...styles.statValue, color: '#44ff88'}}>€{player.balance}</span>
					</div>
				</div>
			)}
		</div>
	);
};

/**
 * Helper: Get color based on stat value
 */
function getStatColor(value) {
	if (value >= 70) return '#44ff88';  // Green (good)
	if (value >= 40) return '#ffaa00';  // Yellow (warning)
	return '#ff4444';  // Red (critical)
}

/**
 * ============================================================================
 * STYLES (GLASSMORPHISM)
 * ============================================================================
 */
const styles = {
	container: {
		maxWidth: '600px',
		margin: '0 auto',
		padding: '32px'
	},
	
	header: {
		textAlign: 'center',
		marginBottom: '32px'
	},
	
	icon: {
		fontSize: '64px',
		marginBottom: '16px'
	},
	
	title: {
		fontSize: '32px',
		fontWeight: 'bold',
		color: '#fff',
		margin: '0',
		textShadow: '0 0 20px rgba(68, 255, 136, 0.5)'
	},
	
	// Company Info
	companyInfo: {
		background: 'rgba(255, 255, 255, 0.05)',
		borderRadius: '16px',
		padding: '20px',
		marginBottom: '24px',
		border: '1px solid rgba(255, 255, 255, 0.1)'
	},
	
	companyName: {
		fontSize: '24px',
		fontWeight: 'bold',
		color: '#fff',
		marginBottom: '8px'
	},
	
	companyType: {
		fontSize: '14px',
		color: '#aaa',
		marginBottom: '12px',
		textTransform: 'uppercase',
		letterSpacing: '1px'
	},
	
	wageOffer: {
		fontSize: '16px',
		color: '#44ff88'
	},
	
	// Stats Grid
	statsGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(3, 1fr)',
		gap: '16px',
		marginBottom: '24px'
	},
	
	statBox: {
		background: 'rgba(255, 255, 255, 0.05)',
		borderRadius: '12px',
		padding: '16px',
		textAlign: 'center',
		border: '1px solid rgba(255, 255, 255, 0.1)'
	},
	
	statLabel: {
		fontSize: '12px',
		color: '#aaa',
		marginBottom: '8px',
		textTransform: 'uppercase'
	},
	
	statValue: {
		fontSize: '20px',
		fontWeight: 'bold'
	},
	
	// Warnings
	warningsContainer: {
		marginBottom: '24px'
	},
	
	warningBox: {
		background: 'rgba(255, 170, 0, 0.1)',
		border: '2px solid',
		borderRadius: '12px',
		padding: '12px 16px',
		marginBottom: '12px',
		display: 'flex',
		alignItems: 'center',
		gap: '12px'
	},
	
	warningIcon: {
		fontSize: '24px'
	},
	
	warningText: {
		flex: 1,
		fontSize: '14px',
		color: '#fff'
	},
	
	// Paycheck Preview
	paycheckPreview: {
		background: 'linear-gradient(135deg, rgba(68, 255, 136, 0.1), rgba(68, 136, 255, 0.1))',
		borderRadius: '16px',
		padding: '24px',
		marginBottom: '24px',
		border: '2px solid rgba(68, 255, 136, 0.3)'
	},
	
	paycheckTitle: {
		fontSize: '20px',
		fontWeight: 'bold',
		color: '#44ff88',
		marginBottom: '20px',
		textAlign: 'center'
	},
	
	paycheckRow: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: '8px 0',
		fontSize: '16px'
	},
	
	paycheckLabel: {
		color: '#ccc'
	},
	
	paycheckValue: {
		fontWeight: 'bold',
		color: '#fff'
	},
	
	paycheckDivider: {
		height: '2px',
		background: 'linear-gradient(90deg, transparent, rgba(68, 255, 136, 0.5), transparent)',
		margin: '16px 0'
	},
	
	efficiencyBar: {
		marginTop: '20px'
	},
	
	efficiencyLabel: {
		fontSize: '14px',
		color: '#aaa',
		marginBottom: '8px'
	},
	
	efficiencyBarBg: {
		width: '100%',
		height: '8px',
		background: 'rgba(255, 255, 255, 0.1)',
		borderRadius: '4px',
		overflow: 'hidden'
	},
	
	efficiencyBarFill: {
		height: '100%',
		background: 'linear-gradient(90deg, #44ff88, #4488ff)',
		borderRadius: '4px',
		transition: 'width 0.5s ease'
	},
	
	costInfo: {
		fontSize: '14px',
		color: '#ffaa00',
		marginTop: '12px',
		textAlign: 'center'
	},
	
	// Cooldown
	cooldownBox: {
		background: 'rgba(255, 170, 0, 0.1)',
		borderRadius: '16px',
		padding: '32px',
		marginBottom: '24px',
		textAlign: 'center',
		border: '2px solid rgba(255, 170, 0, 0.3)'
	},
	
	cooldownIcon: {
		fontSize: '64px',
		marginBottom: '16px'
	},
	
	cooldownTitle: {
		fontSize: '20px',
		fontWeight: 'bold',
		color: '#ffaa00',
		marginBottom: '16px'
	},
	
	cooldownTimer: {
		fontSize: '48px',
		fontWeight: 'bold',
		color: '#fff',
		marginBottom: '8px',
		fontFamily: 'monospace',
		textShadow: '0 0 20px rgba(255, 170, 0, 0.5)'
	},
	
	cooldownSubtext: {
		fontSize: '14px',
		color: '#aaa'
	},
	
	// No Job
	noJobBox: {
		textAlign: 'center',
		padding: '40px 20px'
	},
	
	noJobText: {
		fontSize: '18px',
		color: '#fff',
		marginBottom: '12px'
	},
	
	noJobSubtext: {
		fontSize: '14px',
		color: '#aaa',
		marginBottom: '24px'
	},
	
	suggestedEmployer: {
		background: 'rgba(68, 255, 136, 0.1)',
		borderRadius: '12px',
		padding: '20px',
		marginBottom: '24px',
		border: '1px solid rgba(68, 255, 136, 0.3)'
	},
	
	// Action Button Container
	actionContainer: {
		marginTop: '24px'
	},
	
	// Insolvency Warning
	insolvencyWarning: {
		background: 'rgba(255, 68, 68, 0.1)',
		border: '2px solid #ff4444',
		borderRadius: '12px',
		padding: '16px',
		marginTop: '24px',
		display: 'flex',
		alignItems: 'center',
		gap: '12px'
	},
	
	insolvencyText: {
		fontSize: '14px',
		color: '#fff',
		flex: 1
	},
	
	// Stats Footer
	statsFooter: {
		marginTop: '32px',
		paddingTop: '24px',
		borderTop: '1px solid rgba(255, 255, 255, 0.1)',
		display: 'flex',
		justifyContent: 'space-around'
	},
	
	statItem: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: '8px'
	},
	
	// Error
	errorBox: {
		textAlign: 'center',
		padding: '40px 20px'
	},
	
	errorText: {
		fontSize: '16px',
		color: '#ff4444'
	},
	
	// Skeleton
	skeleton: {
		padding: '40px 20px'
	}
};

export default WorkStation;
