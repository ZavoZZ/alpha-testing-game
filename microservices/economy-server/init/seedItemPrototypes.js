const mongoose = require('mongoose');

/**
 * Seed Initial Item Prototypes
 * Creates 15 items: Bread Q1-Q5, Newspaper Q1-Q5, Coffee Q1-Q5
 * Idempotent: Uses findOneAndUpdate with upsert
 */

const INITIAL_ITEMS = [
    // ====================================================================
    // FOOD CATEGORY - Restores Energy
    // ====================================================================
    {
        item_code: 'BREAD_Q1',
        name: 'Pâine Simplă',
        description: 'Pâine de bază, perfectă pentru o gustare rapidă',
        category: 'FOOD',
        rarity: 'COMMON',
        has_quality_tiers: false,  // Q1 is standalone
        base_effects: {
            energy_restore: 5,
            happiness_restore: 0
        },
        base_price_euro: '1.0000',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 300,  // 5 minutes
        is_perishable: true,
        shelf_life_hours: 72  // 3 days
    },
    {
        item_code: 'BREAD_Q2',
        name: 'Pâine Proaspătă',
        description: 'Pâine proaspătă de calitate medie',
        category: 'FOOD',
        rarity: 'COMMON',
        base_effects: {
            energy_restore: 10,  // Q2 = 2x
            happiness_restore: 1
        },
        base_price_euro: '2.5000',  // Q2 = 2.5x price
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 300,
        is_perishable: true,
        shelf_life_hours: 72
    },
    {
        item_code: 'BREAD_Q3',
        name: 'Pâine Artizanală',
        description: 'Pâine artizanală de calitate superioară',
        category: 'FOOD',
        rarity: 'UNCOMMON',
        base_effects: {
            energy_restore: 18,  // Q3 = 3.5x
            happiness_restore: 2
        },
        base_price_euro: '5.0000',  // Q3 = 5x price
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 300,
        is_perishable: true,
        shelf_life_hours: 48
    },
    {
        item_code: 'BREAD_Q4',
        name: 'Pâine Premium',
        description: 'Pâine premium cu ingrediente selectate',
        category: 'FOOD',
        rarity: 'RARE',
        base_effects: {
            energy_restore: 28,  // Q4 = 5.5x
            happiness_restore: 3
        },
        base_price_euro: '10.0000',  // Q4 = 10x price
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 300,
        is_perishable: true,
        shelf_life_hours: 24
    },
    {
        item_code: 'BREAD_Q5',
        name: 'Pâine de Lux',
        description: 'Pâine de lux, preparată de cei mai buni brutari',
        category: 'FOOD',
        rarity: 'EPIC',
        base_effects: {
            energy_restore: 50,  // Q5 = 10x
            happiness_restore: 5
        },
        base_price_euro: '25.0000',  // Q5 = 25x price
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 300,
        is_perishable: true,
        shelf_life_hours: 12
    },
    
    // ====================================================================
    // ENTERTAINMENT CATEGORY - Restores Happiness
    // ====================================================================
    {
        item_code: 'NEWSPAPER_Q1',
        name: 'Ziar Local',
        description: 'Ziar local cu știri de bază',
        category: 'ENTERTAINMENT',
        rarity: 'COMMON',
        base_effects: {
            energy_restore: 0,
            happiness_restore: 3
        },
        base_price_euro: '0.5000',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 600,  // 10 minutes
        is_perishable: true,
        shelf_life_hours: 24  // 1 day
    },
    {
        item_code: 'NEWSPAPER_Q2',
        name: 'Ziar Regional',
        description: 'Ziar regional cu articole interesante',
        category: 'ENTERTAINMENT',
        rarity: 'COMMON',
        base_effects: {
            energy_restore: 0,
            happiness_restore: 6
        },
        base_price_euro: '1.2500',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 600,
        is_perishable: true,
        shelf_life_hours: 24
    },
    {
        item_code: 'NEWSPAPER_Q3',
        name: 'Ziar Național',
        description: 'Ziar național cu investigații de calitate',
        category: 'ENTERTAINMENT',
        rarity: 'UNCOMMON',
        base_effects: {
            energy_restore: 0,
            happiness_restore: 11  // 3 × 3.5
        },
        base_price_euro: '2.5000',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 600,
        is_perishable: true,
        shelf_life_hours: 24
    },
    {
        item_code: 'NEWSPAPER_Q4',
        name: 'Revistă Premium',
        description: 'Revistă premium cu conținut exclusiv',
        category: 'ENTERTAINMENT',
        rarity: 'RARE',
        base_effects: {
            energy_restore: 0,
            happiness_restore: 17  // 3 × 5.5
        },
        base_price_euro: '5.0000',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 600,
        is_perishable: true,
        shelf_life_hours: 168  // 1 week
    },
    {
        item_code: 'NEWSPAPER_Q5',
        name: 'Publicație de Lux',
        description: 'Publicație de lux cu articole de top',
        category: 'ENTERTAINMENT',
        rarity: 'EPIC',
        base_effects: {
            energy_restore: 0,
            happiness_restore: 30  // 3 × 10
        },
        base_price_euro: '12.5000',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 600,
        is_perishable: true,
        shelf_life_hours: 168
    },
    
    // ====================================================================
    // HYBRID CATEGORY - Restores Both
    // ====================================================================
    {
        item_code: 'COFFEE_Q1',
        name: 'Cafea Instant',
        description: 'Cafea instant pentru o trezire rapidă',
        category: 'FOOD',
        rarity: 'COMMON',
        base_effects: {
            energy_restore: 3,
            happiness_restore: 2
        },
        base_price_euro: '1.5000',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 900,  // 15 minutes
        is_perishable: false
    },
    {
        item_code: 'COFFEE_Q2',
        name: 'Cafea Filtru',
        description: 'Cafea filtru de calitate medie',
        category: 'FOOD',
        rarity: 'COMMON',
        base_effects: {
            energy_restore: 6,
            happiness_restore: 4
        },
        base_price_euro: '3.7500',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 900,
        is_perishable: false
    },
    {
        item_code: 'COFFEE_Q3',
        name: 'Espresso',
        description: 'Espresso aromat și puternic',
        category: 'FOOD',
        rarity: 'UNCOMMON',
        base_effects: {
            energy_restore: 11,  // 3 × 3.5
            happiness_restore: 7
        },
        base_price_euro: '7.5000',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 900,
        is_perishable: false
    },
    {
        item_code: 'COFFEE_Q4',
        name: 'Cappuccino Premium',
        description: 'Cappuccino premium cu lapte de calitate',
        category: 'FOOD',
        rarity: 'RARE',
        base_effects: {
            energy_restore: 17,  // 3 × 5.5
            happiness_restore: 11
        },
        base_price_euro: '15.0000',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 900,
        is_perishable: false
    },
    {
        item_code: 'COFFEE_Q5',
        name: 'Cafea de Lux',
        description: 'Cafea de lux din boabe rare',
        category: 'FOOD',
        rarity: 'EPIC',
        base_effects: {
            energy_restore: 30,  // 3 × 10
            happiness_restore: 20
        },
        base_price_euro: '37.5000',
        is_tradeable: true,
        is_consumable: true,
        consumption_cooldown_seconds: 900,
        is_perishable: false
    }
];

/**
 * Seed function - idempotent
 */
async function seedItemPrototypes() {
    try {
        console.log('🌱 Starting Item Prototypes seed...');
        
        // Ensure ItemPrototype model is loaded
        const ItemPrototype = global.ItemPrototype || require('../models/ItemPrototype');
        
        let created = 0;
        let updated = 0;
        let skipped = 0;
        
        for (const itemData of INITIAL_ITEMS) {
            const result = await ItemPrototype.findOneAndUpdate(
                { item_code: itemData.item_code },
                { $set: itemData },
                { 
                    upsert: true, 
                    new: true,
                    runValidators: true 
                }
            );
            
            if (result.isNew) {
                created++;
                console.log(`  ✅ Created: ${itemData.item_code} - ${itemData.name}`);
            } else {
                updated++;
                console.log(`  🔄 Updated: ${itemData.item_code} - ${itemData.name}`);
            }
        }
        
        console.log('\n📊 Seed Summary:');
        console.log(`  ✅ Created: ${created}`);
        console.log(`  🔄 Updated: ${updated}`);
        console.log(`  ⏭️  Skipped: ${skipped}`);
        console.log(`  📦 Total: ${INITIAL_ITEMS.length}`);
        console.log('\n✅ Item Prototypes seed complete!');
        
        return {
            success: true,
            created,
            updated,
            skipped,
            total: INITIAL_ITEMS.length
        };
        
    } catch (error) {
        console.error('❌ Error seeding Item Prototypes:', error);
        throw error;
    }
}

// Allow running standalone
if (require.main === module) {
    const mongoose = require('mongoose');
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/game-economy';
    
    mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(async () => {
        console.log('📡 Connected to MongoDB');
        await seedItemPrototypes();
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    });
}

module.exports = seedItemPrototypes;
