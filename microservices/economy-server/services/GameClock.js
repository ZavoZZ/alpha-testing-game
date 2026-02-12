const cron = require('node-cron');
const os = require('os');

/**
 * =============================================================================
 * GAME CLOCK - THE TIMEKEEPER (Orchestratorul Temporal)
 * =============================================================================
 * 
 * This service manages the "heartbeat" of the game - the Hourly Tick.
 * 
 * CRITICAL CHALLENGE: The server can run in multiple instances (replicas) or
 * restart exactly at the hour. We MUST guarantee that the tick runs EXACTLY
 * ONCE per hour, regardless of how many Node.js instances are active.
 * 
 * SOLUTION: Distributed Mutex using MongoDB's atomic operations.
 * 
 * ARCHITECTURE:
 * 1. Cron triggers every hour at minute 0 (0 * * * *)
 * 2. acquireLock() attempts to atomically set is_processing = true in SystemState
 * 3. If lock acquired → process tick → release lock
 * 4. If lock NOT acquired → skip (another instance is processing)
 * 
 * RACE-CONDITION PROOF:
 * - Uses MongoDB findOneAndUpdate with atomic conditions
 * - Lock timeout (5 minutes) prevents zombie processes from blocking forever
 * - Hostname + PID tracking for debugging
 * 
 * MODULE: 2.1.A - The Timekeeper
 * @version 1.0.0
 * @date 2026-02-12
 * @author Zavo Production
 */

class GameClock {
	constructor() {
		this.cronJob = null;
		this.isInitialized = false;
		this.lockHolderId = `${os.hostname()}-${process.pid}`;
		this.LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
		this.tickInProgress = false;
		
		console.log(`[TIMEKEEPER] Initialized with ID: ${this.lockHolderId}`);
	}
	
	/**
	 * =========================================================================
	 * INITIALIZATION & SELF-HEALING
	 * =========================================================================
	 */
	
	/**
	 * Initialize the GameClock service
	 * - Ensures SystemState singleton exists
	 * - Starts the cron scheduler
	 * 
	 * @returns {Promise<void>}
	 */
	async initialize() {
		try {
			console.log('[TIMEKEEPER] 🕐 Initializing Game Clock...');
			
			// Step 1: Ensure SystemState singleton exists (Self-Healing)
			await this.ensureSystemState();
			
			// Step 2: Check for zombie locks (cleanup from crashes)
			await this.cleanupZombieLocks();
			
			// Step 3: Start the cron scheduler
			this.startScheduler();
			
			this.isInitialized = true;
			console.log('[TIMEKEEPER] ✅ Game Clock initialized successfully');
			console.log(`[TIMEKEEPER] 📅 Hourly tick scheduled at minute 0 of every hour`);
			console.log(`[TIMEKEEPER] 🔐 Lock holder ID: ${this.lockHolderId}`);
			
		} catch (error) {
			console.error('[TIMEKEEPER] ❌ Initialization failed:', error);
			throw error;
		}
	}
	
	/**
	 * Ensure SystemState singleton exists in database
	 * If not, create it (Self-Healing Initialization)
	 */
	async ensureSystemState() {
		try {
			const SystemState = global.SystemState;
			
			if (!SystemState) {
				throw new Error('SystemState model not found in global scope');
			}
			
			const state = await SystemState.getSingleton();
			
			console.log('[TIMEKEEPER] 📊 SystemState singleton:', {
				key: state.key,
				last_tick: new Date(state.last_tick_epoch).toISOString(),
				is_processing: state.is_processing,
				total_ticks: state.total_ticks_processed,
				game_version: state.game_version
			});
			
			return state;
			
		} catch (error) {
			console.error('[TIMEKEEPER] ❌ Failed to ensure SystemState:', error);
			throw error;
		}
	}
	
	/**
	 * Cleanup zombie locks from crashed instances
	 * If a lock is held for >5 minutes, assume the process crashed and release it
	 */
	async cleanupZombieLocks() {
		try {
			const SystemState = global.SystemState;
			const now = new Date();
			const zombieThreshold = new Date(now.getTime() - this.LOCK_TIMEOUT_MS);
			
			const result = await SystemState.findOneAndUpdate(
				{
					key: 'UNIVERSE_CLOCK',
					is_processing: true,
					lock_timestamp: { $lt: zombieThreshold }
				},
				{
					$set: {
						is_processing: false,
						lock_holder: null,
						lock_timestamp: null
					}
				}
			);
			
			if (result) {
				console.log(`[TIMEKEEPER] ⚠️  Cleaned up zombie lock from: ${result.lock_holder}`);
				console.log(`[TIMEKEEPER] 🧹 Lock was held since: ${result.lock_timestamp}`);
			}
			
		} catch (error) {
			console.error('[TIMEKEEPER] ❌ Zombie lock cleanup failed:', error);
			// Don't throw - this is a best-effort cleanup
		}
	}
	
	/**
	 * =========================================================================
	 * CRON SCHEDULER
	 * =========================================================================
	 */
	
	/**
	 * Start the cron scheduler
	 * Runs at minute 0 of every hour (0 * * * *)
	 */
	startScheduler() {
		// Cron expression: minute hour day month weekday
		// 0 * * * * = At minute 0 of every hour
		this.cronJob = cron.schedule('0 * * * *', async () => {
			await this.onCronTrigger();
		}, {
			scheduled: true,
			timezone: 'UTC'  // Always use UTC for consistency
		});
		
		console.log('[TIMEKEEPER] ⏰ Cron scheduler started (0 * * * * UTC)');
	}
	
	/**
	 * Called when cron triggers
	 * This is the entry point for the hourly tick attempt
	 */
	async onCronTrigger() {
		const triggerTime = new Date().toISOString();
		console.log(`\n${'='.repeat(80)}`);
		console.log(`[TIMEKEEPER] 🔔 HOURLY TICK TRIGGERED at ${triggerTime}`);
		console.log(`${'='.repeat(80)}\n`);
		
		// Prevent re-entry if tick is already in progress (shouldn't happen, but safety first)
		if (this.tickInProgress) {
			console.log('[TIMEKEEPER] ⚠️  Tick already in progress, skipping...');
			return;
		}
		
		try {
			this.tickInProgress = true;
			
			// Step 1: Attempt to acquire the distributed lock
			const lockAcquired = await this.acquireLock();
			
			if (!lockAcquired) {
				// Another instance is processing, skip gracefully
				console.log('[TIMEKEEPER] ⏭️  Tick skipped - lock held by another instance');
				return;
			}
			
			// Step 2: We have the lock! Process the hourly tick
			console.log(`[TIMEKEEPER] 🔓 Lock acquired by ${this.lockHolderId}`);
			console.log('[TIMEKEEPER] ⚙️  Processing hourly tick...');
			
			const startTime = Date.now();
			
			await this.processHourlyTick();
			
			const duration = Date.now() - startTime;
			
			// Step 3: Release the lock and update state
			await this.releaseLock(duration);
			
			console.log(`[TIMEKEEPER] ✅ Tick completed successfully in ${duration}ms`);
			console.log(`${'='.repeat(80)}\n`);
			
		} catch (error) {
			console.error('[TIMEKEEPER] ❌ Tick processing failed:', error);
			
			// Release lock even on error (fail-safe)
			await this.forceReleaseLock(error);
			
		} finally {
			this.tickInProgress = false;
		}
	}
	
	/**
	 * =========================================================================
	 * DISTRIBUTED MUTEX (ATOMIC LOCK)
	 * =========================================================================
	 */
	
	/**
	 * Attempt to acquire the distributed lock
	 * Uses MongoDB's atomic findOneAndUpdate to ensure only ONE instance gets the lock
	 * 
	 * @returns {Promise<boolean>} - true if lock acquired, false otherwise
	 */
	async acquireLock() {
		try {
			const SystemState = global.SystemState;
			const now = new Date();
			const zombieThreshold = new Date(now.getTime() - this.LOCK_TIMEOUT_MS);
			
			// ATOMIC OPERATION: Only succeeds if is_processing is false OR lock is zombie
			const result = await SystemState.findOneAndUpdate(
				{
					key: 'UNIVERSE_CLOCK',
					$or: [
						{ is_processing: false },
						{ 
							is_processing: true,
							lock_timestamp: { $lt: zombieThreshold }
						}
					]
				},
				{
					$set: {
						is_processing: true,
						lock_timestamp: now,
						lock_holder: this.lockHolderId
					}
				},
				{
					new: false  // Return the document BEFORE update (to check if we got it)
				}
			);
			
			// If result is null, another instance already has the lock
			if (!result) {
				console.log('[TIMEKEEPER] 🔒 Lock acquisition failed - another instance is processing');
				return false;
			}
			
			// If result.is_processing was true, we rescued a zombie lock
			if (result.is_processing) {
				console.log(`[TIMEKEEPER] 🧟 Rescued zombie lock from: ${result.lock_holder}`);
			}
			
			return true;
			
		} catch (error) {
			console.error('[TIMEKEEPER] ❌ Lock acquisition error:', error);
			return false;
		}
	}
	
	/**
	 * Release the lock after successful tick processing
	 * 
	 * @param {number} duration - Duration of tick processing in milliseconds
	 */
	async releaseLock(duration) {
		try {
			const SystemState = global.SystemState;
			
			await SystemState.findOneAndUpdate(
				{ key: 'UNIVERSE_CLOCK' },
				{
					$set: {
						is_processing: false,
						lock_holder: null,
						lock_timestamp: null,
						last_tick_epoch: Date.now(),
						last_tick_duration_ms: duration,
						consecutive_failures: 0  // Reset failure counter on success
					},
					$inc: {
						total_ticks_processed: 1
					}
				}
			);
			
			console.log('[TIMEKEEPER] 🔓 Lock released successfully');
			
		} catch (error) {
			console.error('[TIMEKEEPER] ❌ Lock release error:', error);
			// Don't throw - we've already processed the tick
		}
	}
	
	/**
	 * Force release lock (on error)
	 * 
	 * @param {Error} error - The error that caused the failure
	 */
	async forceReleaseLock(error) {
		try {
			const SystemState = global.SystemState;
			
			await SystemState.findOneAndUpdate(
				{ key: 'UNIVERSE_CLOCK' },
				{
					$set: {
						is_processing: false,
						lock_holder: null,
						lock_timestamp: null,
						last_error: {
							message: error.message,
							timestamp: new Date(),
							stack: error.stack
						}
					},
					$inc: {
						consecutive_failures: 1
					}
				}
			);
			
			console.log('[TIMEKEEPER] 🔓 Lock force-released due to error');
			
		} catch (releaseError) {
			console.error('[TIMEKEEPER] ❌ CRITICAL: Failed to force-release lock:', releaseError);
			// This is critical - the lock might be stuck!
		}
	}
	
	/**
	 * =========================================================================
	 * HOURLY TICK PROCESSING
	 * =========================================================================
	 */
	
	/**
	 * Process the hourly tick
	 * 
	 * THIS IS THE CORE GAME LOGIC THAT RUNS EVERY HOUR
	 * 
	 * Currently a placeholder - will be expanded in Sub-section 2.1.B
	 * 
	 * TODO (Module 2.1.B - Life Simulation):
	 * - Decrease energy for all players
	 * - Decrease happiness for all players
	 * - Process passive income (work, investments)
	 * - Apply taxes and fees
	 * - Update global statistics
	 * - Trigger events and notifications
	 * 
	 * @returns {Promise<void>}
	 */
	async processHourlyTick() {
		console.log('[TIMEKEEPER] 🎮 Starting game tick processing...');
		
		// TODO: Implement actual game logic in Module 2.1.B
		
		// Placeholder: Update global stats
		await this.updateGlobalStatistics();
		
		// Simulate processing time (remove in production)
		await new Promise(resolve => setTimeout(resolve, 100));
		
		console.log('[TIMEKEEPER] 🎮 Game tick processing complete');
	}
	
	/**
	 * Update global statistics
	 * Collects data from the economy and stores it in SystemState
	 */
	async updateGlobalStatistics() {
		try {
			const User = global.User;
			const SystemState = global.SystemState;
			
			// Count active users (logged in within last 24 hours)
			const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
			const activeUsersCount = await User.countDocuments({
				lastLogin: { $gte: twentyFourHoursAgo },
				isActive: true,
				isBanned: false
			});
			
			// Calculate total economy (sum of all balances)
			const economyStats = await User.aggregate([
				{
					$match: {
						isActive: true,
						isBanned: false
					}
				},
				{
					$group: {
						_id: null,
						total_euro: { $sum: { $toDouble: '$balance_euro' } },
						total_gold: { $sum: { $toDouble: '$balance_gold' } },
						total_ron: { $sum: { $toDouble: '$balance_ron' } },
						user_count: { $sum: 1 }
					}
				}
			]);
			
			const stats = economyStats[0] || { 
				total_euro: 0, 
				total_gold: 0, 
				total_ron: 0, 
				user_count: 0 
			};
			
			const avgBalanceEuro = stats.user_count > 0 
				? (stats.total_euro / stats.user_count).toFixed(4)
				: '0.0000';
			
			// Update SystemState with new stats
			await SystemState.findOneAndUpdate(
				{ key: 'UNIVERSE_CLOCK' },
				{
					$set: {
						'global_stats.active_users_count': activeUsersCount,
						'global_stats.total_economy_euro': stats.total_euro.toFixed(4),
						'global_stats.total_economy_gold': stats.total_gold.toFixed(4),
						'global_stats.total_economy_ron': stats.total_ron.toFixed(4),
						'global_stats.average_balance_euro': avgBalanceEuro
					}
				}
			);
			
			console.log('[TIMEKEEPER] 📊 Global statistics updated:', {
				active_users: activeUsersCount,
				total_economy_euro: stats.total_euro.toFixed(4),
				average_balance: avgBalanceEuro
			});
			
		} catch (error) {
			console.error('[TIMEKEEPER] ❌ Statistics update failed:', error);
			// Don't throw - stats update failure shouldn't block the tick
		}
	}
	
	/**
	 * =========================================================================
	 * SHUTDOWN & CLEANUP
	 * =========================================================================
	 */
	
	/**
	 * Graceful shutdown
	 * Stops the cron scheduler and releases any held locks
	 */
	async shutdown() {
		console.log('[TIMEKEEPER] 🛑 Shutting down...');
		
		if (this.cronJob) {
			this.cronJob.stop();
			console.log('[TIMEKEEPER] ⏰ Cron scheduler stopped');
		}
		
		// Release lock if we're holding it
		if (this.tickInProgress) {
			console.log('[TIMEKEEPER] ⚠️  Tick in progress during shutdown, releasing lock...');
			await this.forceReleaseLock(new Error('Server shutdown'));
		}
		
		console.log('[TIMEKEEPER] ✅ Shutdown complete');
	}
}

// Export singleton instance
module.exports = new GameClock();
