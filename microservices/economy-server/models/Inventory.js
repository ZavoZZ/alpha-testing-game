const mongoose = require('mongoose');
const { Schema } = mongoose;
const FinancialMath = require('../services/FinancialMath');

/**
 * ============================================================================
 * INVENTORY - UNIVERSAL ITEM STORAGE (POLYMORPHIC)
 * ============================================================================
 * 
 * Stores items for BOTH Users AND Companies using polymorphic pattern.
 * One model to rule them all (DRY principle).
 * 
 * Module: 2.3.B - Polymorphic Inventory System
 * @version 1.0.0
 * @date 2026-02-14
 */

const inventorySchema = new Schema({
    // ====================================================================
    // OWNERSHIP (POLYMORPHIC)
    // ====================================================================
    
    owner_id: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true
    },
    
    owner_type: {
        type: String,
        required: true,
        enum: ['User', 'Company'],
        index: true
    },
    
    // ====================================================================
    // ITEM REFERENCE
    // ====================================================================
    
    item_code: {
        type: String,
        required: true,
        uppercase: true,
        index: true
    },
    
    quality: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        default: 1
    },
    
    // ====================================================================
    // QUANTITY & STACKING
    // ====================================================================
    
    quantity: {
        type: Schema.Types.Decimal128,
        required: true,
        default: '0.0000',
        get: (v) => v ? v.toString() : '0.0000'
    },
    
    // ====================================================================
    // ACQUISITION METADATA
    // ====================================================================
    
    acquisition_source: {
        type: String,
        enum: ['WORK_REWARD', 'MARKET_PURCHASE', 'PRODUCTION', 'ADMIN_GRANT', 'TRADE', 'QUEST_REWARD', 'LOOT'],
        default: 'MARKET_PURCHASE'
    },
    
    acquired_at: {
        type: Date,
        default: Date.now,
        index: true
    },
    
    // ====================================================================
    // EXPIRATION (FOR PERISHABLES)
    // ====================================================================
    
    is_perishable: {
        type: Boolean,
        default: false
    },
    
    expires_at: {
        type: Date,
        default: null,
        index: true
    },
    
    // ====================================================================
    // MARKETPLACE LISTING (IF LISTED)
    // ====================================================================
    
    is_listed: {
        type: Boolean,
        default: false,
        index: true
    },
    
    listing_price_euro: {
        type: Schema.Types.Decimal128,
        default: null,
        get: (v) => v ? v.toString() : null
    },
    
    listed_at: {
        type: Date,
        default: null
    }
    
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

// ====================================================================
// COMPOUND INDEXES (CRITICAL FOR PERFORMANCE)
// ====================================================================

// Find all items owned by specific user/company
inventorySchema.index({ owner_id: 1, owner_type: 1 });

// Find specific item in inventory
inventorySchema.index({ owner_id: 1, owner_type: 1, item_code: 1, quality: 1 });

// Find all marketplace listings
inventorySchema.index({ is_listed: 1, item_code: 1, quality: 1 });

// Find expired items (for cleanup cron job)
inventorySchema.index({ is_perishable: 1, expires_at: 1 });

// ====================================================================
// VIRTUAL METHODS
// ====================================================================

/**
 * Get full item details (joins with ItemPrototype)
 */
inventorySchema.virtual('item_details', {
    ref: 'ItemPrototype',
    localField: 'item_code',
    foreignField: 'item_code',
    justOne: true
});

/**
 * Calculate actual effects based on quality
 */
inventorySchema.methods.getEffects = async function() {
    const ItemPrototype = mongoose.model('ItemPrototype');
    const prototype = await ItemPrototype.findOne({ item_code: this.item_code });
    
    if (!prototype) {
        throw new Error(`ItemPrototype not found: ${this.item_code}`);
    }
    
    // Quality multipliers
    const qualityMultipliers = {
        1: 1.0,   // Q1 = 100% of base
        2: 2.0,   // Q2 = 200% of base
        3: 3.5,   // Q3 = 350% of base
        4: 5.5,   // Q4 = 550% of base
        5: 10.0   // Q5 = 1000% of base
    };
    
    const multiplier = qualityMultipliers[this.quality] || 1.0;
    
    return {
        energy_restore: Math.floor(prototype.base_effects.energy_restore * multiplier),
        happiness_restore: Math.floor(prototype.base_effects.happiness_restore * multiplier),
        health_restore: Math.floor(prototype.base_effects.health_restore * multiplier),
        attack_power: Math.floor(prototype.base_effects.attack_power * multiplier),
        defense_power: Math.floor(prototype.base_effects.defense_power * multiplier),
        productivity_boost: FinancialMath.multiply(
            prototype.base_effects.productivity_boost,
            multiplier.toString()
        )
    };
};

/**
 * Calculate market price based on quality
 */
inventorySchema.methods.getMarketPrice = async function() {
    const ItemPrototype = mongoose.model('ItemPrototype');
    const prototype = await ItemPrototype.findOne({ item_code: this.item_code });
    
    if (!prototype) {
        throw new Error(`ItemPrototype not found: ${this.item_code}`);
    }
    
    // Price multipliers (exponential growth)
    const priceMultipliers = {
        1: 1.0,    // Q1 = 100% of base
        2: 2.5,    // Q2 = 250% of base
        3: 5.0,    // Q3 = 500% of base
        4: 10.0,   // Q4 = 1000% of base
        5: 25.0    // Q5 = 2500% of base
    };
    
    const multiplier = priceMultipliers[this.quality] || 1.0;
    
    return FinancialMath.multiply(
        prototype.base_price_euro,
        multiplier.toString()
    );
};

module.exports = mongoose.model('Inventory', inventorySchema);
