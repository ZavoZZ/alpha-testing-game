/**
 * ============================================================================
 * CONSUMPTION SERVICE - METABOLISM SYSTEM
 * ============================================================================
 * 
 * Handles item consumption with ACID transactions:
 * - Consume food/entertainment items
 * - Restore energy/happiness/health
 * - Enforce cooldowns
 * - Track consumption history
 * 
 * Module: 2.3.C - Marketplace & Metabolism
 * 
 * CRITICAL: Quality scaling!
 * - Q1 = 100% of base effects
 * - Q2 = 200% of base effects
 * - Q3 = 350% of base effects
 * - Q4 = 550% of base effects
 * - Q5 = 1000% of base effects
 * 
 * @version 1.0.0
 * @date 2026-02-14
 */

const mongoose = require('mongoose');
const FinancialMath = require('./FinancialMath');

class ConsumptionService {
    /**
     * ========================================================================
     * Consume item (ATOMIC TRANSACTION)
     * ========================================================================
     */
    static async consumeItem(userId, itemCode, quality, quantity) {
        console.log('[ConsumptionService] ========================================');
        console.log('[ConsumptionService] 🍽️  Processing item consumption');
        console.log(`[ConsumptionService] User: ${userId}`);
        console.log(`[ConsumptionService] Item: ${itemCode} Q${quality}`);
        console.log(`[ConsumptionService] Quantity: ${quantity}`);
        console.log('[ConsumptionService] ========================================');
        
        const User = global.User;
        const Inventory = global.Inventory;
        const ItemPrototype = global.ItemPrototype;
        const ConsumptionHistory = global.ConsumptionHistory;
        
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            // ================================================================
            // STEP 1: Check cooldown
            // ================================================================
            
            const user = await User.findById(userId).session(session);
            
            if (!user) {
                throw new Error('User not found');
            }
            
            console.log(`[ConsumptionService] 👤 User: ${user.username}`);
            console.log(`[ConsumptionService] 💪 Energy: ${user.energy}`);
            console.log(`[ConsumptionService] 😊 Happiness: ${user.happiness}`);
            console.log(`[ConsumptionService] ❤️  Health: ${user.health}`);
            
            // Check cooldown
            if (user.consumption_cooldown_until) {
                const now = new Date();
                if (now < user.consumption_cooldown_until) {
                    const remainingMs = user.consumption_cooldown_until - now;
                    const remainingSeconds = Math.ceil(remainingMs / 1000);
                    throw new Error(`Consumption cooldown active. Wait ${remainingSeconds} seconds.`);
                }
            }
            
            console.log('[ConsumptionService] ✅ No cooldown active');
            
            // ================================================================
            // STEP 2: Find inventory item
            // ================================================================
            
            const inventory = await Inventory.findOne({
                owner_id: userId,
                owner_type: 'User',
                item_code: itemCode.toUpperCase(),
                quality: parseInt(quality)
            }).session(session);
            
            if (!inventory) {
                throw new Error('Item not found in inventory');
            }
            
            console.log(`[ConsumptionService] 📦 Inventory quantity: ${inventory.quantity}`);
            
            const quantityStr = quantity.toString();
            
            if (FinancialMath.isGreaterThan(quantityStr, inventory.quantity.toString())) {
                throw new Error(`Insufficient quantity. Available: ${inventory.quantity}`);
            }
            
            // ================================================================
            // STEP 3: Get effects from ItemPrototype
            // ================================================================
            
            const prototype = await ItemPrototype.findOne({ 
                item_code: itemCode.toUpperCase() 
            }).session(session);
            
            if (!prototype) {
                throw new Error(`Item prototype not found: ${itemCode}`);
            }
            
            console.log(`[ConsumptionService] 📋 Item: ${prototype.name}`);
            console.log(`[ConsumptionService] 📊 Base effects:`, prototype.base_effects);
            
            // Verify item is consumable
            if (!prototype.is_consumable) {
                throw new Error(`Item ${prototype.name} is not consumable`);
            }
            
            // ================================================================
            // STEP 4: Calculate quality-scaled effects
            // ================================================================
            
            const qualityMultipliers = {
                1: 1.0,   // Q1 = 100% of base
                2: 2.0,   // Q2 = 200% of base
                3: 3.5,   // Q3 = 350% of base
                4: 5.5,   // Q4 = 550% of base
                5: 10.0   // Q5 = 1000% of base
            };
            
            const multiplier = qualityMultipliers[parseInt(quality)] || 1.0;
            const quantityNum = parseFloat(quantityStr);
            
            // Calculate effects (base × quality × quantity)
            const energyRestore = Math.floor(
                prototype.base_effects.energy_restore * multiplier * quantityNum
            );
            const happinessRestore = Math.floor(
                prototype.base_effects.happiness_restore * multiplier * quantityNum
            );
            const healthRestore = Math.floor(
                prototype.base_effects.health_restore * multiplier * quantityNum
            );
            
            console.log(`[ConsumptionService] ✨ Scaled effects (Q${quality} × ${quantityStr}):`);
            console.log(`[ConsumptionService]    Energy: +${energyRestore}`);
            console.log(`[ConsumptionService]    Happiness: +${happinessRestore}`);
            console.log(`[ConsumptionService]    Health: +${healthRestore}`);
            
            // ================================================================
            // STEP 5: Reduce inventory quantity
            // ================================================================
            
            console.log('[ConsumptionService] 📦 Reducing inventory...');
            
            inventory.quantity = FinancialMath.subtract(
                inventory.quantity.toString(),
                quantityStr
            );
            
            // If quantity reaches 0, delete the inventory item
            if (FinancialMath.isLessThanOrEqual(inventory.quantity.toString(), '0.0000')) {
                await Inventory.findByIdAndDelete(inventory._id).session(session);
                console.log('[ConsumptionService] 🗑️  Inventory depleted, deleted');
            } else {
                await inventory.save({ session });
                console.log(`[ConsumptionService] ✅ Inventory reduced to: ${inventory.quantity}`);
            }
            
            // ================================================================
            // STEP 6: Update user energy/happiness/health (cap at 100)
            // ================================================================
            
            console.log('[ConsumptionService] 💪 Applying effects...');
            
            const stateBefore = {
                energy: user.energy,
                happiness: user.happiness,
                health: user.health
            };
            
            user.energy = Math.min(100, user.energy + energyRestore);
            user.happiness = Math.min(100, user.happiness + happinessRestore);
            user.health = Math.min(100, user.health + healthRestore);
            
            const stateAfter = {
                energy: user.energy,
                happiness: user.happiness,
                health: user.health
            };
            
            console.log(`[ConsumptionService] ✅ Energy: ${stateBefore.energy} → ${stateAfter.energy}`);
            console.log(`[ConsumptionService] ✅ Happiness: ${stateBefore.happiness} → ${stateAfter.happiness}`);
            console.log(`[ConsumptionService] ✅ Health: ${stateBefore.health} → ${stateAfter.health}`);
            
            // Update status effects based on new values
            user.status_effects.exhausted = user.energy === 0;
            user.status_effects.depressed = user.happiness === 0;
            user.status_effects.sick = user.health < 30;
            user.status_effects.dying = user.health < 10;
            user.status_effects.dead = user.health === 0;
            
            // ================================================================
            // STEP 7: Set cooldown
            // ================================================================
            
            console.log('[ConsumptionService] ⏰ Setting cooldown...');
            
            const cooldownSeconds = prototype.consumption_cooldown_seconds || 300; // Default 5 minutes
            const cooldownUntil = new Date(Date.now() + cooldownSeconds * 1000);
            
            user.consumption_cooldown_until = cooldownUntil;
            
            console.log(`[ConsumptionService] ✅ Cooldown set: ${cooldownSeconds}s (until ${cooldownUntil.toISOString()})`);
            
            await user.save({ session });
            
            // ================================================================
            // STEP 8: Create ConsumptionHistory
            // ================================================================
            
            console.log('[ConsumptionService] 📝 Creating consumption history...');
            
            const history = new ConsumptionHistory({
                user_id: userId,
                item_code: itemCode.toUpperCase(),
                quality: parseInt(quality),
                quantity_consumed: mongoose.Types.Decimal128.fromString(quantityStr),
                effects_applied: {
                    energy_restored: energyRestore,
                    happiness_restored: happinessRestore,
                    health_restored: healthRestore
                },
                state_before: stateBefore,
                state_after: stateAfter,
                consumed_at: new Date()
            });
            
            await history.save({ session });
            
            console.log('[ConsumptionService] ✅ History entry created');
            
            // ================================================================
            // COMMIT TRANSACTION
            // ================================================================
            
            await session.commitTransaction();
            
            console.log('[ConsumptionService] ========================================');
            console.log('[ConsumptionService] ✅ CONSUMPTION COMPLETE!');
            console.log('[ConsumptionService] ========================================');
            
            return {
                success: true,
                consumption: {
                    item_code: itemCode.toUpperCase(),
                    item_name: prototype.name,
                    quality: parseInt(quality),
                    quantity: quantityStr,
                    effects_applied: {
                        energy_restored: energyRestore,
                        happiness_restored: happinessRestore,
                        health_restored: healthRestore
                    },
                    state_before: stateBefore,
                    state_after: stateAfter,
                    cooldown_until: cooldownUntil.toISOString(),
                    cooldown_seconds: cooldownSeconds
                }
            };
            
        } catch (error) {
            await session.abortTransaction();
            console.error('[ConsumptionService] ❌ Transaction failed:', error.message);
            throw error;
        } finally {
            session.endSession();
        }
    }
    
    /**
     * ========================================================================
     * Check consumption cooldown status
     * ========================================================================
     */
    static async checkCooldown(userId) {
        console.log('[ConsumptionService] ⏰ Checking cooldown status...');
        
        const User = global.User;
        
        const user = await User.findById(userId);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        const now = new Date();
        
        if (!user.consumption_cooldown_until) {
            console.log('[ConsumptionService] ✅ No cooldown active');
            return {
                on_cooldown: false,
                can_consume: true,
                cooldown_until: null,
                remaining_seconds: 0
            };
        }
        
        if (now >= user.consumption_cooldown_until) {
            console.log('[ConsumptionService] ✅ Cooldown expired');
            return {
                on_cooldown: false,
                can_consume: true,
                cooldown_until: null,
                remaining_seconds: 0
            };
        }
        
        const remainingMs = user.consumption_cooldown_until - now;
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        
        console.log(`[ConsumptionService] ⏳ Cooldown active: ${remainingSeconds}s remaining`);
        
        return {
            on_cooldown: true,
            can_consume: false,
            cooldown_until: user.consumption_cooldown_until.toISOString(),
            remaining_seconds: remainingSeconds
        };
    }
    
    /**
     * ========================================================================
     * Get consumption history
     * ========================================================================
     */
    static async getHistory(userId, { page = 1, limit = 50 }) {
        console.log('[ConsumptionService] 📜 Fetching consumption history...');
        console.log(`[ConsumptionService] User: ${userId}`);
        console.log(`[ConsumptionService] Page: ${page}, Limit: ${limit}`);
        
        const ConsumptionHistory = global.ConsumptionHistory;
        const ItemPrototype = global.ItemPrototype;
        
        const skip = (page - 1) * limit;
        
        // Get history with item details
        const history = await ConsumptionHistory.find({ user_id: userId })
            .sort({ consumed_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        
        // Get total count
        const total = await ConsumptionHistory.countDocuments({ user_id: userId });
        
        // Enrich with item names
        const enrichedHistory = await Promise.all(
            history.map(async (entry) => {
                const prototype = await ItemPrototype.findOne({ 
                    item_code: entry.item_code 
                });
                
                return {
                    ...entry,
                    item_name: prototype ? prototype.name : entry.item_code,
                    quantity_consumed: entry.quantity_consumed.toString()
                };
            })
        );
        
        console.log(`[ConsumptionService] ✅ Found ${history.length} entries (${total} total)`);
        
        return {
            history: enrichedHistory,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
}

module.exports = ConsumptionService;
