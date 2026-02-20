/**
 * Seed Local Database Script
 * Creates companies, treasury, and marketplace listings for local testing
 */

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017';
const DB_NAME = 'game_db';

async function seedDatabase() {
    console.log('🌱 Starting database seed...\n');
    
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db(DB_NAME);
        
        // Get admin user
        const admin = await db.collection('users').findOne({ role: 'admin' });
        if (!admin) {
            console.error('❌ No admin user found!');
            return;
        }
        console.log(`👤 Found admin: ${admin.username} (${admin._id})\n`);
        
        // Create Companies
        console.log('🏢 Creating companies...');
        
        const companies = [
            {
                _id: new ObjectId(),
                name: 'State Food Company',
                owner_id: admin._id,
                type: 'GOVERNMENT',
                description: 'Government-owned food production company. Workers receive bread as bonus.',
                funds_euro: '10000.0000',
                funds_gold: '0.0000',
                funds_ron: '0.0000',
                wage_offer: '10.0000',
                work_rewards: [{ item_code: 'BREAD_Q1', quantity: '1.0000' }],
                min_skill_required: 0,
                max_employees: 1000,
                employee_count: 0,
                level: 1,
                status: 'ACTIVE',
                is_government: true,
                is_hiring: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: new ObjectId(),
                name: 'State News Company',
                owner_id: admin._id,
                type: 'GOVERNMENT',
                description: 'Government-owned news company. Workers receive newspapers as bonus.',
                funds_euro: '10000.0000',
                funds_gold: '0.0000',
                funds_ron: '0.0000',
                wage_offer: '10.0000',
                work_rewards: [{ item_code: 'NEWSPAPER_Q1', quantity: '1.0000' }],
                min_skill_required: 0,
                max_employees: 1000,
                employee_count: 0,
                level: 1,
                status: 'ACTIVE',
                is_government: true,
                is_hiring: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: new ObjectId(),
                name: 'State Construction Company',
                owner_id: admin._id,
                type: 'GOVERNMENT',
                description: 'Government-owned construction company for general work.',
                funds_euro: '10000.0000',
                funds_gold: '0.0000',
                funds_ron: '0.0000',
                wage_offer: '8.0000',
                work_rewards: [],
                min_skill_required: 0,
                max_employees: 1000,
                employee_count: 0,
                level: 1,
                status: 'ACTIVE',
                is_government: true,
                is_hiring: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        
        for (const company of companies) {
            const existing = await db.collection('companies').findOne({ name: company.name, is_government: true });
            if (!existing) {
                await db.collection('companies').insertOne(company);
                console.log(`   ✅ Created: ${company.name}`);
            } else {
                console.log(`   ⚠️  Already exists: ${company.name}`);
            }
        }
        
        // Create Treasury
        console.log('\n💰 Creating treasury...');
        const existingTreasury = await db.collection('treasuries').findOne({ singleton: true });
        if (!existingTreasury) {
            await db.collection('treasuries').insertOne({
                collected_income_tax_euro: '0.0000',
                collected_work_tax_euro: '0.0000',
                collected_transfer_tax_euro: '0.0000',
                collected_market_tax_euro: '0.0000',
                total_collected: '0.0000',
                singleton: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log('   ✅ Created Treasury');
        } else {
            console.log('   ⚠️  Treasury already exists');
        }
        
        // Create Marketplace Listings
        console.log('\n🏪 Creating marketplace listings...');
        
        // Get a company for listings
        const foodCompany = await db.collection('companies').findOne({ name: 'State Food Company' });
        
        if (foodCompany) {
            // Get item prototypes
            const breadQ1 = await db.collection('itemprototypes').findOne({ item_code: 'BREAD_Q1' });
            const newspaperQ1 = await db.collection('itemprototypes').findOne({ item_code: 'NEWSPAPER_Q1' });
            
            const listings = [];
            
            if (breadQ1) {
                // Create inventory for company
                const inventoryId = new ObjectId();
                await db.collection('inventories').insertOne({
                    _id: inventoryId,
                    owner_id: foodCompany._id,
                    owner_type: 'Company',
                    item_code: 'BREAD_Q1',
                    quality: 1,
                    quantity: '100.0000',
                    is_listed: true,
                    acquired_at: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                
                listings.push({
                    _id: new ObjectId(),
                    seller_id: foodCompany._id,
                    seller_type: 'Company',
                    inventory_id: inventoryId,
                    item_code: 'BREAD_Q1',
                    quality: 1,
                    quantity: '100.0000',
                    price_per_unit_euro: '1.0000',
                    listed_at: new Date(),
                    status: 'ACTIVE',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
            
            if (newspaperQ1) {
                const inventoryId = new ObjectId();
                await db.collection('inventories').insertOne({
                    _id: inventoryId,
                    owner_id: foodCompany._id,
                    owner_type: 'Company',
                    item_code: 'NEWSPAPER_Q1',
                    quality: 1,
                    quantity: '50.0000',
                    is_listed: true,
                    acquired_at: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                
                listings.push({
                    _id: new ObjectId(),
                    seller_id: foodCompany._id,
                    seller_type: 'Company',
                    inventory_id: inventoryId,
                    item_code: 'NEWSPAPER_Q1',
                    quality: 1,
                    quantity: '50.0000',
                    price_per_unit_euro: '0.5000',
                    listed_at: new Date(),
                    status: 'ACTIVE',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
            
            if (listings.length > 0) {
                await db.collection('marketplacelistings').insertMany(listings);
                console.log(`   ✅ Created ${listings.length} marketplace listings`);
            } else {
                console.log('   ⚠️  No item prototypes found for listings');
            }
        }
        
        // Final stats
        console.log('\n📊 Database State:');
        console.log(`   Companies: ${await db.collection('companies').countDocuments()}`);
        console.log(`   ItemPrototypes: ${await db.collection('itemprototypes').countDocuments()}`);
        console.log(`   Treasuries: ${await db.collection('treasuries').countDocuments()}`);
        console.log(`   Inventories: ${await db.collection('inventories').countDocuments()}`);
        console.log(`   MarketplaceListings: ${await db.collection('marketplacelistings').countDocuments()}`);
        
        console.log('\n✅ Seed complete!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

seedDatabase();
