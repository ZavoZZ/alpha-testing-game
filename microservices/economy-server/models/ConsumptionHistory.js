const mongoose = require('mongoose');
const { Schema } = mongoose;

const consumptionHistorySchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true
    },
    
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
        max: 5
    },
    
    quantity_consumed: {
        type: Schema.Types.Decimal128,
        required: true,
        get: (v) => v ? v.toString() : '0.0000'
    },
    
    effects_applied: {
        energy_restored: { type: Number, default: 0 },
        happiness_restored: { type: Number, default: 0 },
        health_restored: { type: Number, default: 0 }
    },
    
    state_before: {
        energy: { type: Number, required: true },
        happiness: { type: Number, required: true },
        health: { type: Number, required: true }
    },
    
    state_after: {
        energy: { type: Number, required: true },
        happiness: { type: Number, required: true },
        health: { type: Number, required: true }
    },
    
    consumed_at: {
        type: Date,
        default: Date.now,
        index: true
    },
    
    ip_address: {
        type: String,
        default: null
    }
}, {
    timestamps: false,
    toJSON: { getters: true },
    toObject: { getters: true }
});

consumptionHistorySchema.index({ user_id: 1, consumed_at: -1 });
consumptionHistorySchema.index({ item_code: 1, consumed_at: -1 });

module.exports = mongoose.model('ConsumptionHistory', consumptionHistorySchema);
