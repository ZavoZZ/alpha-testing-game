/**
 * ============================================================================
 * MARKETPLACE SERVICE - P2P TRANSACTIONS (Player to Player)
 * ============================================================================
 * 
 * Handles marketplace operations with ACID transactions:
 * - Browse listings with filters
 * - Purchase items (buyer pays seller + VAT to Treasury)
 * - List items for sale
 * - Delist items
 * 
 * Module: 2.3.C - Marketplace & Metabolism
 * 
 * CRITICAL: All purchases include 10% VAT to Treasury!
 * - Buyer pays: price + VAT
 * - Seller receives: price (net)
 * - Treasury receives: VAT
 * 
 * @version 1.0.0
 * @date 2026-02-14
 */

const mongoose = require('mongoose');
const FinancialMath = require('./FinancialMath');
const gameConstants = require('../config/gameConstants');

class MarketplaceService {
    /**
     * ========================================================================
     * Browse marketplace listings with filters
     * ========================================================================
     */
    static async browseListings({ category, quality, minPrice, maxPrice, sortBy = 'listed_at', page = 1, limit = 20 }) {
        console.log('[MarketplaceService] 🛒 Browsing marketplace...');
        console.log(`[MarketplaceService] Filters: category=${category}, quality=${quality}, price=${minPrice}-${maxPrice}`);
        
        const MarketplaceListing = global.MarketplaceListing;
        const ItemPrototype = global.ItemPrototype;
        
        // Build query
        const query = {};
        
        // Build filter pipeline
        const pipeline = [];
        
        // Stage 1: Match basic filters
        const matchStage = {};
        
        if (quality) {
            matchStage.quality = parseInt(quality);
        }
        
        if (minPrice || maxPrice) {
            matchStage.price_per_unit_euro = {};
            if (minPrice) {
                matchStage.price_per_unit_euro.$gte = mongoose.Types.Decimal128.fromString(minPrice);
            }
            if (maxPrice) {
                matchStage.price_per_unit_euro.$lte = mongoose.Types.Decimal128.fromString(maxPrice);
            }
        }
        
        pipeline.push({ $match: matchStage });
        
        // Stage 2: Lookup item details
        pipeline.push({
            $lookup: {
                from: 'itemprototypes',
                localField: 'item_code',
                foreignField: 'item_code',
                as: 'item_details'
            }
        });
        
        pipeline.push({
            $unwind: '$item_details'
        });
        
        // Stage 3: Filter by category if specified
        if (category) {
            pipeline.push({
                $match: {
                    'item_details.category': category.toUpperCase()
                }
            });
        }
        
        // Stage 4: Calculate VAT-inclusive prices
        pipeline.push({
            $addFields: {
                price_with_vat: {
                    $multiply: ['$price_per_unit_euro', 1.10]
                },
                total_with_vat: {
                    $multiply: ['$total_value_euro', 1.10]
                }
            }
        });
        
        // Stage 5: Sort
        const sortStage = {};
        switch (sortBy) {
            case 'price_asc':
                sortStage.price_per_unit_euro = 1;
                break;
            case 'price_desc':
                sortStage.price_per_unit_euro = -1;
                break;
            case 'quality':
                sortStage.quality = -1;
                break;
            case 'newest':
                sortStage.listed_at = -1;
                break;
            default:
                sortStage.listed_at = -1;
        }
        pipeline.push({ $sort: sortStage });
        
        // Stage 6: Pagination
        const skip = (page - 1) * limit;
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });
        
        // Execute aggregation
        const listings = await MarketplaceListing.aggregate(pipeline);
        
        // Get total count for pagination
        const countPipeline = [...pipeline.slice(0, -2)]; // Remove skip and limit
        countPipeline.push({ $count: 'total' });
        const countResult = await MarketplaceListing.aggregate(countPipeline);
        const total = countResult.length > 0 ? countResult[0].total : 0;
        
        console.log(`[MarketplaceService] ✅ Found ${listings.length} listings (${total} total)`);
        
        return {
            listings: listings.map(listing => ({
                ...listing,
                price_per_unit_euro: listing.price_per_unit_euro.toString(),
                total_value_euro: listing.total_value_euro.toString(),
                quantity: listing.quantity.toString(),
                price_with_vat: FinancialMath.round(listing.price_with_vat.toString(), 4),
                total_with_vat: FinancialMath.round(listing.total_with_vat.toString(), 4)
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    
    /**
     * ========================================================================
     * Purchase item from marketplace (ATOMIC TRANSACTION)
     * ========================================================================
     */
    static async purchaseItem(userId, listingId, quantity) {
        console.log('[MarketplaceService] ========================================');
        console.log('[MarketplaceService] 💰 Processing marketplace purchase');
        console.log(`[MarketplaceService] Buyer: ${userId}`);
        console.log(`[MarketplaceService] Listing: ${listingId}`);
        console.log(`[MarketplaceService] Quantity: ${quantity}`);
        console.log('[MarketplaceService] ========================================');
        
        const User = global.User;
        const Company = global.Company;
        const MarketplaceListing = global.MarketplaceListing;
        const Inventory = global.Inventory;
        const Treasury = global.Treasury;
        const Ledger = global.Ledger;
        
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            // ================================================================
            // STEP 1: Validate listing exists
            // ================================================================
            
            const listing = await MarketplaceListing.findById(listingId).session(session);
            
            if (!listing) {
                throw new Error('Listing not found');
            }
            
            console.log(`[MarketplaceService] 📦 Item: ${listing.item_code} Q${listing.quality}`);
            console.log(`[MarketplaceService] 💵 Price per unit: €${listing.price_per_unit_euro}`);
            console.log(`[MarketplaceService] 📊 Available: ${listing.quantity}`);
            
            // Validate quantity
            const quantityStr = quantity.toString();
            if (FinancialMath.isGreaterThan(quantityStr, listing.quantity.toString())) {
                throw new Error(`Insufficient quantity. Available: ${listing.quantity}`);
            }
            
            // ================================================================
            // STEP 2: Load buyer
            // ================================================================
            
            const buyer = await User.findById(userId).session(session);
            
            if (!buyer) {
                throw new Error('Buyer not found');
            }
            
            // Prevent self-purchase
            if (listing.seller_type === 'User' && listing.seller_id.toString() === userId.toString()) {
                throw new Error('Cannot purchase your own listing');
            }
            
            console.log(`[MarketplaceService] 👤 Buyer: ${buyer.username}`);
            console.log(`[MarketplaceService] 💰 Buyer balance: €${buyer.balance_euro}`);
            
            // ================================================================
            // STEP 3: Calculate costs (price + VAT 10%)
            // ================================================================
            
            const VAT_RATE = '0.10'; // 10%
            
            const netPrice = FinancialMath.multiply(
                listing.price_per_unit_euro.toString(),
                quantityStr
            );
            
            const vat = FinancialMath.multiply(netPrice, VAT_RATE);
            const grossPrice = FinancialMath.add(netPrice, vat);
            
            const netPriceRounded = FinancialMath.round(netPrice, 4);
            const vatRounded = FinancialMath.round(vat, 4);
            const grossPriceRounded = FinancialMath.round(grossPrice, 4);
            
            console.log(`[MarketplaceService] 💵 Net price (to seller): €${netPriceRounded}`);
            console.log(`[MarketplaceService] 🏛️  VAT (10%): €${vatRounded}`);
            console.log(`[MarketplaceService] 💰 Gross price (buyer pays): €${grossPriceRounded}`);
            
            // ================================================================
            // STEP 4: Check buyer has funds
            // ================================================================
            
            if (FinancialMath.isLessThan(buyer.balance_euro.toString(), grossPriceRounded)) {
                throw new Error(`Insufficient funds. Required: €${grossPriceRounded}, Available: €${buyer.balance_euro}`);
            }
            
            console.log('[MarketplaceService] ✅ Buyer has sufficient funds');
            
            // ================================================================
            // STEP 5: Load seller
            // ================================================================
            
            let seller;
            if (listing.seller_type === 'User') {
                seller = await User.findById(listing.seller_id).session(session);
                if (!seller) {
                    throw new Error('Seller not found');
                }
                console.log(`[MarketplaceService] 👤 Seller: ${seller.username} (User)`);
            } else {
                seller = await Company.findById(listing.seller_id).session(session);
                if (!seller) {
                    throw new Error('Seller company not found');
                }
                console.log(`[MarketplaceService] 🏢 Seller: ${seller.name} (Company)`);
            }
            
            // ================================================================
            // STEP 6: Deduct from buyer
            // ================================================================
            
            console.log('[MarketplaceService] 📤 Deducting from buyer...');
            
            const buyerBalanceBefore = buyer.balance_euro.toString();
            buyer.balance_euro = FinancialMath.subtract(buyer.balance_euro.toString(), grossPriceRounded);
            
            console.log(`[MarketplaceService] ✅ Buyer balance: €${buyer.balance_euro}`);
            
            // ================================================================
            // STEP 7: Add net to seller
            // ================================================================
            
            console.log('[MarketplaceService] 📥 Paying seller...');
            
            let sellerBalanceBefore;
            if (listing.seller_type === 'User') {
                sellerBalanceBefore = seller.balance_euro.toString();
                seller.balance_euro = FinancialMath.add(seller.balance_euro.toString(), netPriceRounded);
                console.log(`[MarketplaceService] ✅ Seller balance: €${seller.balance_euro}`);
            } else {
                sellerBalanceBefore = seller.funds_euro.toString();
                seller.funds_euro = FinancialMath.add(seller.funds_euro.toString(), netPriceRounded);
                console.log(`[MarketplaceService] ✅ Company funds: €${seller.funds_euro}`);
            }
            
            // ================================================================
            // STEP 8: Add VAT to Treasury
            // ================================================================
            
            console.log('[MarketplaceService] 🏛️  Collecting VAT...');
            
            const treasury = await Treasury.findOne().session(session);
            if (!treasury) {
                throw new Error('Treasury not found');
            }
            
            treasury.collected_market_tax_euro = FinancialMath.add(
                treasury.collected_market_tax_euro.toString(),
                vatRounded
            );
            treasury.total_collected = FinancialMath.add(
                treasury.total_collected.toString(),
                vatRounded
            );
            
            await treasury.save({ session });
            
            console.log(`[MarketplaceService] ✅ Treasury collected: €${vatRounded}`);
            
            // ================================================================
            // STEP 9: Transfer inventory ownership
            // ================================================================
            
            console.log('[MarketplaceService] 📦 Transferring inventory...');
            
            // Get seller's inventory item
            const sellerInventory = await Inventory.findById(listing.inventory_id).session(session);
            
            if (!sellerInventory) {
                throw new Error('Seller inventory not found');
            }
            
            // Reduce seller's quantity
            sellerInventory.quantity = FinancialMath.subtract(
                sellerInventory.quantity.toString(),
                quantityStr
            );
            
            // If quantity reaches 0, delete the inventory item
            if (FinancialMath.isLessThanOrEqual(sellerInventory.quantity.toString(), '0.0000')) {
                await Inventory.findByIdAndDelete(sellerInventory._id).session(session);
                console.log('[MarketplaceService] 🗑️  Seller inventory depleted, deleted');
            } else {
                await sellerInventory.save({ session });
                console.log(`[MarketplaceService] ✅ Seller inventory reduced to: ${sellerInventory.quantity}`);
            }
            
            // Create or update buyer's inventory
            let buyerInventory = await Inventory.findOne({
                owner_id: userId,
                owner_type: 'User',
                item_code: listing.item_code,
                quality: listing.quality
            }).session(session);
            
            if (buyerInventory) {
                buyerInventory.quantity = FinancialMath.add(
                    buyerInventory.quantity.toString(),
                    quantityStr
                );
                await buyerInventory.save({ session });
                console.log(`[MarketplaceService] ✅ Buyer inventory updated: ${buyerInventory.quantity}`);
            } else {
                buyerInventory = new Inventory({
                    owner_id: userId,
                    owner_type: 'User',
                    item_code: listing.item_code,
                    quality: listing.quality,
                    quantity: mongoose.Types.Decimal128.fromString(quantityStr),
                    acquisition_source: 'MARKET_PURCHASE',
                    acquired_at: new Date()
                });
                await buyerInventory.save({ session });
                console.log(`[MarketplaceService] ✅ Buyer inventory created: ${buyerInventory.quantity}`);
            }
            
            // ================================================================
            // STEP 10: Update/delete listing
            // ================================================================
            
            console.log('[MarketplaceService] 📋 Updating listing...');
            
            listing.quantity = FinancialMath.subtract(
                listing.quantity.toString(),
                quantityStr
            );
            
            if (FinancialMath.isLessThanOrEqual(listing.quantity.toString(), '0.0000')) {
                // Unmark seller's inventory as listed
                if (sellerInventory && !sellerInventory.isDeleted) {
                    sellerInventory.is_listed = false;
                    sellerInventory.listing_price_euro = null;
                    sellerInventory.listed_at = null;
                    await sellerInventory.save({ session });
                }
                
                await MarketplaceListing.findByIdAndDelete(listingId).session(session);
                console.log('[MarketplaceService] 🗑️  Listing depleted, deleted');
            } else {
                listing.total_value_euro = FinancialMath.multiply(
                    listing.price_per_unit_euro.toString(),
                    listing.quantity.toString()
                );
                await listing.save({ session });
                console.log(`[MarketplaceService] ✅ Listing updated: ${listing.quantity} remaining`);
            }
            
            // ================================================================
            // STEP 11: Update stats
            // ================================================================
            
            console.log('[MarketplaceService] 📊 Updating stats...');
            
            buyer.total_transactions += 1;
            buyer.total_volume_euro = FinancialMath.add(
                buyer.total_volume_euro.toString(),
                grossPriceRounded
            );
            buyer.last_transaction_at = new Date();
            
            await buyer.save({ session });
            
            if (listing.seller_type === 'User') {
                seller.total_transactions += 1;
                seller.total_volume_euro = FinancialMath.add(
                    seller.total_volume_euro.toString(),
                    netPriceRounded
                );
                seller.last_transaction_at = new Date();
                await seller.save({ session });
            }
            
            // ================================================================
            // STEP 12: Create Ledger entry
            // ================================================================
            
            console.log('[MarketplaceService] 📝 Creating ledger entry...');
            
            const ledgerEntry = new Ledger({
                transaction_type: 'MARKET',
                sender: userId,
                receiver: listing.seller_id,
                currency: 'EURO',
                amount_gross: mongoose.Types.Decimal128.fromString(grossPriceRounded),
                amount_tax: mongoose.Types.Decimal128.fromString(vatRounded),
                amount_net: mongoose.Types.Decimal128.fromString(netPriceRounded),
                tax_rate: mongoose.Types.Decimal128.fromString(VAT_RATE),
                sender_balance_before: mongoose.Types.Decimal128.fromString(buyerBalanceBefore),
                sender_balance_after: mongoose.Types.Decimal128.fromString(buyer.balance_euro.toString()),
                receiver_balance_before: mongoose.Types.Decimal128.fromString(sellerBalanceBefore),
                receiver_balance_after: mongoose.Types.Decimal128.fromString(
                    listing.seller_type === 'User' ? seller.balance_euro.toString() : seller.funds_euro.toString()
                ),
                metadata: {
                    item_code: listing.item_code,
                    quality: listing.quality,
                    quantity: quantityStr,
                    listing_id: listingId.toString(),
                    seller_type: listing.seller_type
                }
            });
            
            await ledgerEntry.save({ session });
            
            console.log('[MarketplaceService] ✅ Ledger entry created');
            
            // ================================================================
            // COMMIT TRANSACTION
            // ================================================================
            
            await session.commitTransaction();
            
            console.log('[MarketplaceService] ========================================');
            console.log('[MarketplaceService] ✅ PURCHASE COMPLETE!');
            console.log('[MarketplaceService] ========================================');
            
            return {
                success: true,
                purchase: {
                    item_code: listing.item_code,
                    quality: listing.quality,
                    quantity: quantityStr,
                    net_price: netPriceRounded,
                    vat: vatRounded,
                    gross_price: grossPriceRounded,
                    buyer_balance: buyer.balance_euro.toString(),
                    seller_name: listing.seller_name,
                    seller_type: listing.seller_type
                }
            };
            
        } catch (error) {
            await session.abortTransaction();
            console.error('[MarketplaceService] ❌ Transaction failed:', error.message);
            throw error;
        } finally {
            session.endSession();
        }
    }
    
    /**
     * ========================================================================
     * List item on marketplace (Admin/Company)
     * ========================================================================
     */
    static async listItem(sellerId, sellerType, itemCode, quality, quantity, pricePerUnit) {
        console.log('[MarketplaceService] 📝 Listing item on marketplace...');
        console.log(`[MarketplaceService] Seller: ${sellerId} (${sellerType})`);
        console.log(`[MarketplaceService] Item: ${itemCode} Q${quality}`);
        console.log(`[MarketplaceService] Quantity: ${quantity}`);
        console.log(`[MarketplaceService] Price: €${pricePerUnit}`);
        
        const User = global.User;
        const Company = global.Company;
        const Inventory = global.Inventory;
        const MarketplaceListing = global.MarketplaceListing;
        
        // ================================================================
        // STEP 1: Verify seller owns item
        // ================================================================
        
        const inventory = await Inventory.findOne({
            owner_id: sellerId,
            owner_type: sellerType,
            item_code: itemCode.toUpperCase(),
            quality: parseInt(quality)
        });
        
        if (!inventory) {
            throw new Error('Item not found in inventory');
        }
        
        const quantityStr = quantity.toString();
        
        if (FinancialMath.isGreaterThan(quantityStr, inventory.quantity.toString())) {
            throw new Error(`Insufficient quantity. Available: ${inventory.quantity}`);
        }
        
        // ================================================================
        // STEP 2: Get seller name
        // ================================================================
        
        let sellerName;
        if (sellerType === 'User') {
            const user = await User.findById(sellerId);
            if (!user) throw new Error('Seller not found');
            sellerName = user.username;
        } else {
            const company = await Company.findById(sellerId);
            if (!company) throw new Error('Company not found');
            sellerName = company.name;
        }
        
        // ================================================================
        // STEP 3: Mark inventory as listed
        // ================================================================
        
        inventory.is_listed = true;
        inventory.listing_price_euro = mongoose.Types.Decimal128.fromString(pricePerUnit);
        inventory.listed_at = new Date();
        await inventory.save();
        
        // ================================================================
        // STEP 4: Create MarketplaceListing
        // ================================================================
        
        const totalValue = FinancialMath.multiply(pricePerUnit, quantityStr);
        
        const listing = new MarketplaceListing({
            seller_id: sellerId,
            seller_type: sellerType,
            seller_name: sellerName,
            inventory_id: inventory._id,
            item_code: itemCode.toUpperCase(),
            quality: parseInt(quality),
            quantity: mongoose.Types.Decimal128.fromString(quantityStr),
            price_per_unit_euro: mongoose.Types.Decimal128.fromString(pricePerUnit),
            total_value_euro: mongoose.Types.Decimal128.fromString(totalValue),
            listed_at: new Date()
        });
        
        await listing.save();
        
        console.log('[MarketplaceService] ✅ Item listed successfully');
        
        return {
            success: true,
            listing: {
                id: listing._id,
                item_code: listing.item_code,
                quality: listing.quality,
                quantity: listing.quantity.toString(),
                price_per_unit_euro: listing.price_per_unit_euro.toString(),
                total_value_euro: listing.total_value_euro.toString(),
                seller_name: sellerName
            }
        };
    }
    
    /**
     * ========================================================================
     * Delist item from marketplace
     * ========================================================================
     */
    static async delistItem(listingId, userId) {
        console.log('[MarketplaceService] 🗑️  Delisting item...');
        console.log(`[MarketplaceService] Listing: ${listingId}`);
        console.log(`[MarketplaceService] User: ${userId}`);
        
        const MarketplaceListing = global.MarketplaceListing;
        const Inventory = global.Inventory;
        
        // ================================================================
        // STEP 1: Verify ownership
        // ================================================================
        
        const listing = await MarketplaceListing.findById(listingId);
        
        if (!listing) {
            throw new Error('Listing not found');
        }
        
        // Only seller or admin can delist
        if (listing.seller_id.toString() !== userId.toString()) {
            const User = global.User;
            const user = await User.findById(userId);
            if (!user || user.role !== 'admin') {
                throw new Error('Unauthorized: Only the seller or admin can delist this item');
            }
        }
        
        // ================================================================
        // STEP 2: Unmark inventory
        // ================================================================
        
        const inventory = await Inventory.findById(listing.inventory_id);
        
        if (inventory) {
            inventory.is_listed = false;
            inventory.listing_price_euro = null;
            inventory.listed_at = null;
            await inventory.save();
        }
        
        // ================================================================
        // STEP 3: Delete listing
        // ================================================================
        
        await MarketplaceListing.findByIdAndDelete(listingId);
        
        console.log('[MarketplaceService] ✅ Item delisted successfully');
        
        return {
            success: true,
            message: 'Item delisted successfully'
        };
    }
}

module.exports = MarketplaceService;
