const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * ============================================================================
 * ITEM PROTOTYPE - MASTER ITEM DEFINITIONS
 * ============================================================================
 * 
 * This is the "blueprint" for all items in the game.
 * Defines what items exist and their base properties.
 * 
 * Module: 2.3.A - Item Prototype System
 * @version 1.0.0
 * @date 2026-02-14
 */

const itemPrototypeSchema = new Schema({
    // Basic Information
    item_code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        index: true
    },
    
    name: {
        type: String,
        required: true
    },
    
    description: {
        type: String,
        required: true,
        maxlength: 500
    },
    
    // Categorization
    category: {
        type: String,
        required: true,
        enum: ['FOOD', 'ENTERTAINMENT', 'WEAPON', 'RAW_MATERIAL', 'FINISHED_GOOD', 'TOOL', 'PROPERTY', 'LUXURY'],
        index: true
    },
    
    rarity: {
        type: String,
        required: true,
        enum: ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'],
        default: 'COMMON'
    },
    
    // Quality System
    has_quality_tiers: {
        type: Boolean,
        default: true
    },
    
    // Base Effects (at Q1)
    base_effects: {
        energy_restore: { type: Number, default: 0, min: 0, max: 100 },
        happiness_restore: { type: Number, default: 0, min: 0, max: 100 },
        health_restore: { type: Number, default: 0, min: 0, max: 100 },
        attack_power: { type: Number, default: 0, min: 0 },
        defense_power: { type: Number, default: 0, min: 0 },
        productivity_boost: {
            type: Schema.Types.Decimal128,
            default: '0.0000',
            get: (v) => v ? v.toString() : '0.0000'
        }
    },
    
    // Economic Properties
    base_price_euro: {
        type: Schema.Types.Decimal128,
        required: true,
        get: (v) => v ? v.toString() : '0.0000'
    },
    
    is_tradeable: {
        type: Boolean,
        default: true
    },
    
    is_consumable: {
        type: Boolean,
        default: false
    },
    
    // Consumption Mechanics
    consumption_cooldown_seconds: {
        type: Number,
        default: 0,
        min: 0
    },
    
    is_perishable: {
        type: Boolean,
        default: false
    },
    
    shelf_life_hours: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Production (Future)
    is_producible: {
        type: Boolean,
        default: false
    },
    
    production_recipe: {
        required_items: [{
            item_code: String,
            quantity: Number,
            quality: Number
        }],
        production_time_hours: { type: Number, default: 0 },
        production_cost_euro: {
            type: Schema.Types.Decimal128,
            default: '0.0000',
            get: (v) => v ? v.toString() : '0.0000'
        }
    },
    
    // Metadata
    icon_url: {
        type: String,
        default: ''
    },
    
    is_active: {
        type: Boolean,
        default: true,
        index: true
    },
    
    admin_notes: {
        type: String,
        default: ''
    }
    
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

// Indexes for performance
itemPrototypeSchema.index({ category: 1, is_active: 1 });
itemPrototypeSchema.index({ rarity: 1, is_active: 1 });
itemPrototypeSchema.index({ is_tradeable: 1, is_active: 1 });

module.exports = mongoose.model('ItemPrototype', itemPrototypeSchema);
