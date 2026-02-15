/**
 * Complete database seeding for Module 2.3
 * Run this to initialize a fresh database with all required data
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.envdev') });

// Import seeding functions
const seedItemPrototypes = require('./seedItemPrototypes');
const createFounderCompanies = require('./createFounderCompanies');

// Import models
const ItemPrototype = require('../models/ItemPrototype');
const Company = require('../models/Company');
const MarketplaceListing = require('../models/MarketplaceListing');

/**
 * Create initial marketplace listings
 * This simulates admin/system creating initial market supply
 */
async function createInitialMarketplace() {
    console.log('🏪 Creating initial marketplace listings...');
    
    try {
        // Get all item prototypes
        const items = await ItemPrototype.find({});
        
        if (items.length === 0) {
            console.log('⚠️  No items found. Skipping marketplace creation.');
            return;
        }
        
        // Create listings for each item type (quality 1-3)
        const listings = [];
        
        for (const item of items) {
            // Only create listings for consumable items
            if (item.category === 'FOOD' || item.category === 'DRINK') {
                for (let quality = 1; quality <= 3; quality++) {
                    // Calculate base price (increases with quality)
                    const basePrice = item.baseValue * quality * 1.5;
                    
                    listings.push({
                        sellerId: new mongoose.Types.ObjectId(), // System seller
                        sellerUsername: 'System',
                        itemCode: item.itemCode,
                        quality: quality,
                        quantity: 100, // Initial stock
                        price: basePrice,
                        listedAt: new Date(),
                        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                    });
                }
            }
        }
        
        // Clear existing listings
        await MarketplaceListing.deleteMany({});
        
        // Insert new listings
        await MarketplaceListing.insertMany(listings);
        
        console.log(`✅ Created ${listings.length} marketplace listings`);
    } catch (error) {
        console.error('❌ Error creating marketplace:', error);
        throw error;
    }
}

/**
 * Verify database state
 */
async function verifyDatabase() {
    console.log('\n🔍 Verifying database state...');
    
    try {
        const itemCount = await ItemPrototype.countDocuments();
        const companyCount = await Company.countDocuments();
        const listingCount = await MarketplaceListing.countDocuments();
        
        console.log(`📦 ItemPrototypes: ${itemCount}`);
        console.log(`🏢 Companies: ${companyCount}`);
        console.log(`🏪 Marketplace Listings: ${listingCount}`);
        
        // Verify companies have work rewards
        const companiesWithRewards = await Company.countDocuments({
            'work_rewards': { $exists: true, $ne: [] }
        });
        
        console.log(`💼 Companies with work rewards: ${companiesWithRewards}`);
        
        if (itemCount === 0) {
            console.warn('⚠️  WARNING: No ItemPrototypes found!');
        }
        
        if (companyCount === 0) {
            console.warn('⚠️  WARNING: No Companies found!');
        }
        
        if (companiesWithRewards === 0) {
            console.warn('⚠️  WARNING: No companies have work rewards!');
        }
        
        if (listingCount === 0) {
            console.warn('⚠️  WARNING: No marketplace listings found!');
        }
        
        return {
            items: itemCount,
            companies: companyCount,
            listings: listingCount,
            companiesWithRewards
        };
    } catch (error) {
        console.error('❌ Error verifying database:', error);
        throw error;
    }
}

/**
 * Main seeding function
 */
async function seedDatabase() {
    console.log('🌱 SEEDING DATABASE FOR MODULE 2.3');
    console.log('===================================\n');
    
    try {
        // Connect to MongoDB
        console.log('📡 Connecting to MongoDB...');
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-game';
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ Connected to MongoDB\n');
        
        // Step 1: Seed ItemPrototypes
        console.log('📦 Step 1: Seeding ItemPrototypes...');
        console.log('-------------------------------------');
        await seedItemPrototypes();
        console.log('');
        
        // Step 2: Create Founder Companies with work rewards
        console.log('🏢 Step 2: Creating Founder Companies...');
        console.log('-----------------------------------------');
        await createFounderCompanies();
        console.log('');
        
        // Step 3: Create initial marketplace listings
        console.log('🏪 Step 3: Creating Marketplace Listings...');
        console.log('--------------------------------------------');
        await createInitialMarketplace();
        console.log('');
        
        // Step 4: Verify everything
        const stats = await verifyDatabase();
        
        console.log('\n✅ DATABASE SEEDING COMPLETE!');
        console.log('=============================\n');
        
        console.log('Summary:');
        console.log(`  ✅ ${stats.items} item prototypes`);
        console.log(`  ✅ ${stats.companies} companies`);
        console.log(`  ✅ ${stats.companiesWithRewards} companies with work rewards`);
        console.log(`  ✅ ${stats.listings} marketplace listings`);
        console.log('');
        
        console.log('Next steps:');
        console.log('  1. Start the economy server: npm start');
        console.log('  2. Run tests: ../../test-module-2.3-complete.sh');
        console.log('  3. Test economic loop: ../../test-economic-loop-2.3.sh');
        console.log('');
        
    } catch (error) {
        console.error('\n❌ SEEDING FAILED:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('📡 Disconnected from MongoDB');
    }
}

// Run if called directly
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('\n🎉 All done!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Fatal error:', error);
            process.exit(1);
        });
}

module.exports = seedDatabase;
