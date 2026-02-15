/**
 * Test script to verify all Module 2.3 models load correctly
 */

const mongoose = require('mongoose');

async function testModels() {
    try {
        console.log('🧪 Testing Module 2.3 Models...\n');
        
        // Load models
        console.log('📦 Loading models...');
        const ItemPrototype = require('./models/ItemPrototype');
        const Inventory = require('./models/Inventory');
        const MarketplaceListing = require('./models/MarketplaceListing');
        const ConsumptionHistory = require('./models/ConsumptionHistory');
        
        console.log('✅ All models loaded successfully!\n');
        
        // Check model names
        console.log('📋 Model Names:');
        console.log(`  - ItemPrototype: ${ItemPrototype.modelName}`);
        console.log(`  - Inventory: ${Inventory.modelName}`);
        console.log(`  - MarketplaceListing: ${MarketplaceListing.modelName}`);
        console.log(`  - ConsumptionHistory: ${ConsumptionHistory.modelName}\n`);
        
        // Check indexes
        console.log('🔍 Index Counts:');
        console.log(`  - ItemPrototype: ${ItemPrototype.schema.indexes().length} indexes`);
        console.log(`  - Inventory: ${Inventory.schema.indexes().length} indexes`);
        console.log(`  - MarketplaceListing: ${MarketplaceListing.schema.indexes().length} indexes`);
        console.log(`  - ConsumptionHistory: ${ConsumptionHistory.schema.indexes().length} indexes\n`);
        
        // Check required fields
        console.log('📝 Required Fields:');
        
        const itemPrototypeRequired = Object.keys(ItemPrototype.schema.paths)
            .filter(path => ItemPrototype.schema.paths[path].isRequired);
        console.log(`  - ItemPrototype: ${itemPrototypeRequired.join(', ')}`);
        
        const inventoryRequired = Object.keys(Inventory.schema.paths)
            .filter(path => Inventory.schema.paths[path].isRequired);
        console.log(`  - Inventory: ${inventoryRequired.join(', ')}`);
        
        const marketplaceRequired = Object.keys(MarketplaceListing.schema.paths)
            .filter(path => MarketplaceListing.schema.paths[path].isRequired);
        console.log(`  - MarketplaceListing: ${marketplaceRequired.join(', ')}`);
        
        const consumptionRequired = Object.keys(ConsumptionHistory.schema.paths)
            .filter(path => ConsumptionHistory.schema.paths[path].isRequired);
        console.log(`  - ConsumptionHistory: ${consumptionRequired.join(', ')}\n`);
        
        console.log('✅ All model tests passed!');
        console.log('✅ Models are ready for use!');
        
    } catch (error) {
        console.error('❌ Error testing models:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run tests
testModels();
