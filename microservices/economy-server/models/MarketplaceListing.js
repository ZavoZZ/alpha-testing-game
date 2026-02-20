const mongoose = require('mongoose');
const { Schema } = mongoose;

const marketplaceListingSchema = new Schema({
    seller_id: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true
    },
    
    seller_type: {
        type: String,
        required: true,
        enum: ['User', 'Company'],
        default: 'Company'
    },
    
    seller_name: {
        type: String,
        required: false,
        default: 'Unknown Seller'
    },
    
    inventory_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Inventory',
        unique: true,
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
        max: 5,
        index: true
    },
    
    quantity: {
        type: Schema.Types.Decimal128,
        required: true,
        get: (v) => v ? v.toString() : '0.0000'
    },
    
    price_per_unit_euro: {
        type: Schema.Types.Decimal128,
        required: true,
        get: (v) => v ? v.toString() : '0.0000',
        index: true
    },
    
    total_value_euro: {
        type: Schema.Types.Decimal128,
        required: true,
        get: (v) => v ? v.toString() : '0.0000'
    },
    
    listed_at: {
        type: Date,
        default: Date.now,
        index: true
    },
    
    expires_at: {
        type: Date,
        default: null,
        index: true
    },
    
    view_count: {
        type: Number,
        default: 0
    },
    
    is_featured: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

marketplaceListingSchema.index({ item_code: 1, quality: 1, price_per_unit_euro: 1 });
marketplaceListingSchema.index({ is_featured: -1, listed_at: -1 });
marketplaceListingSchema.index({ seller_id: 1, seller_type: 1 });

module.exports = mongoose.model('MarketplaceListing', marketplaceListingSchema);
