/**
 * Complete Player Flow Test Script
 * Tests all game functionality from a player's perspective
 */

const http = require('http');

// Use environment variables with localhost fallback for local testing
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:3100';
const ECONOMY_URL = process.env.ECONOMY_URL || 'http://localhost:3400';

// Test user credentials
const TEST_USER = {
    email: 'yxud74@gmail.com',
    password: 'david555'
};

let authToken = null;
let userId = null;

// Helper function for HTTP requests
function makeRequest(url, options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const result = {
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body,
                        data: body ? JSON.parse(body) : null
                    };
                    resolve(result);
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body,
                        data: null
                    });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function test(name, fn) {
    try {
        await fn();
        console.log(`✅ ${name}`);
        return true;
    } catch (error) {
        console.log(`❌ ${name}`);
        console.log(`   Error: ${error.message}`);
        return false;
    }
}

async function runTests() {
    console.log('\n========================================');
    console.log('🎮 COMPLETE PLAYER FLOW TEST');
    console.log('========================================\n');
    
    let passed = 0;
    let failed = 0;
    
    // ========================================
    // 1. AUTHENTICATION TESTS
    // ========================================
    console.log('📋 1. AUTHENTICATION TESTS\n');
    
    // Test 1.1: Login
    if (await test('1.1 Login with test user', async () => {
        const data = JSON.stringify(TEST_USER);
        const result = await makeRequest(`${AUTH_URL}/api/auth-service/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, data);
        
        if (result.statusCode !== 200) {
            throw new Error(`Login failed: ${result.statusCode} - ${result.body}`);
        }
        if (!result.data || !result.data.token) {
            throw new Error('No token in response');
        }
        
        authToken = result.data.token;
        userId = result.data.user?.userId;
        console.log(`   Token: ${authToken.substring(0, 20)}...`);
        console.log(`   User ID: ${userId}`);
    })) passed++; else failed++;
    
    // Test 1.2: Verify Token
    if (await test('1.2 Verify token works', async () => {
        const result = await makeRequest(`${AUTH_URL}/api/auth-service/auth/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (result.statusCode !== 200) {
            throw new Error(`Verify failed: ${result.statusCode}`);
        }
    })) passed++; else failed++;
    
    // ========================================
    // 2. ECONOMY API TESTS
    // ========================================
    console.log('\n📋 2. ECONOMY API TESTS\n');
    
    // Test 2.1: Health Check
    if (await test('2.1 Economy health check', async () => {
        const result = await makeRequest(`${ECONOMY_URL}/api/economy/health`, {
            method: 'GET'
        });
        
        if (result.statusCode !== 200) {
            throw new Error(`Health check failed: ${result.statusCode}`);
        }
        console.log(`   Status: ${result.data?.status || 'OK'}`);
    })) passed++; else failed++;
    
    // Test 2.2: Get Balance
    if (await test('2.2 Get user balance', async () => {
        const result = await makeRequest(`${ECONOMY_URL}/api/economy/balances`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (result.statusCode !== 200) {
            throw new Error(`Balance failed: ${result.statusCode}`);
        }
        console.log(`   Balances: EUR=${result.data?.data?.balances?.EURO || 'N/A'}`);
    })) passed++; else failed++;
    
    // Test 2.3: Get Companies
    if (await test('2.3 Get available companies', async () => {
        const result = await makeRequest(`${ECONOMY_URL}/api/economy/companies`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (result.statusCode !== 200) {
            throw new Error(`Companies failed: ${result.statusCode}`);
        }
        const companies = result.data?.data?.companies || [];
        console.log(`   Found ${companies.length} companies`);
        if (companies.length > 0) {
            console.log(`   First: ${companies[0].name}`);
        }
    })) passed++; else failed++;
    
    // Test 2.4: Get Inventory
    if (await test('2.4 Get user inventory', async () => {
        const result = await makeRequest(`${ECONOMY_URL}/api/economy/inventory`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (result.statusCode !== 200) {
            throw new Error(`Inventory failed: ${result.statusCode}`);
        }
        const items = result.data?.data?.items || [];
        console.log(`   Items: ${items.length}`);
    })) passed++; else failed++;
    
    // Test 2.5: Get Marketplace
    if (await test('2.5 Browse marketplace', async () => {
        const result = await makeRequest(`${ECONOMY_URL}/api/economy/marketplace`, {
            method: 'GET'
        });
        
        if (result.statusCode !== 200) {
            throw new Error(`Marketplace failed: ${result.statusCode}`);
        }
        const listings = result.data?.data?.listings || [];
        console.log(`   Listings: ${listings.length}`);
        if (listings.length > 0) {
            console.log(`   First: ${listings[0].item_code} @ €${listings[0].price_per_unit_euro}`);
        }
    })) passed++; else failed++;
    
    // Test 2.6: Work Preview
    if (await test('2.6 Work preview', async () => {
        const result = await makeRequest(`${ECONOMY_URL}/api/economy/work/preview`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (result.statusCode !== 200) {
            throw new Error(`Work preview failed: ${result.statusCode}`);
        }
        console.log(`   Can work: ${result.data?.data?.canWork || 'N/A'}`);
        console.log(`   Estimated salary: €${result.data?.data?.estimatedSalary || 'N/A'}`);
    })) passed++; else failed++;
    
    // Test 2.7: Work (Sign Contract)
    if (await test('2.7 Work - Sign Contract', async () => {
        const data = JSON.stringify({});
        const result = await makeRequest(`${ECONOMY_URL}/api/economy/work`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, data);
        
        if (result.statusCode !== 200) {
            const errorMsg = result.data?.error || result.data?.message || result.body;
            throw new Error(`Work failed: ${result.statusCode} - ${errorMsg}`);
        }
        console.log(`   Salary: €${result.data?.data?.salary || 'N/A'}`);
        console.log(`   Items received: ${result.data?.data?.itemsReceived?.length || 0}`);
    })) passed++; else failed++;
    
    // Test 2.8: Check Balance After Work
    if (await test('2.8 Check balance after work', async () => {
        const result = await makeRequest(`${ECONOMY_URL}/api/economy/balances`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (result.statusCode !== 200) {
            throw new Error(`Balance check failed: ${result.statusCode}`);
        }
        const euro = result.data?.data?.balances?.EURO || '0';
        console.log(`   EUR Balance: €${euro}`);
        if (parseFloat(euro) <= 0) {
            throw new Error('Balance should be positive after work');
        }
    })) passed++; else failed++;
    
    // Test 2.9: Check Inventory After Work
    if (await test('2.9 Check inventory after work', async () => {
        const result = await makeRequest(`${ECONOMY_URL}/api/economy/inventory`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (result.statusCode !== 200) {
            throw new Error(`Inventory check failed: ${result.statusCode}`);
        }
        const items = result.data?.data?.items || [];
        console.log(`   Items: ${items.length}`);
        if (items.length > 0) {
            console.log(`   First item: ${items[0].item_code} x${items[0].quantity}`);
        }
    })) passed++; else failed++;
    
    // ========================================
    // 3. MARKETPLACE PURCHASE TEST
    // ========================================
    console.log('\n📋 3. MARKETPLACE PURCHASE TEST\n');
    
    // Test 3.1: Purchase Item
    if (await test('3.1 Purchase item from marketplace', async () => {
        // First get a listing
        const listingsResult = await makeRequest(`${ECONOMY_URL}/api/economy/marketplace`, {
            method: 'GET'
        });
        
        if (listingsResult.statusCode !== 200 || !listingsResult.data?.data?.listings?.length) {
            throw new Error('No listings available');
        }
        
        const listing = listingsResult.data.data.listings[0];
        const data = JSON.stringify({
            listingId: listing._id,
            quantity: '1.0000'
        });
        
        const result = await makeRequest(`${ECONOMY_URL}/api/economy/marketplace/purchase`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, data);
        
        if (result.statusCode !== 200) {
            const errorMsg = result.data?.error || result.data?.message || result.body;
            throw new Error(`Purchase failed: ${result.statusCode} - ${errorMsg}`);
        }
        console.log(`   Purchased: ${listing.item_code}`);
        console.log(`   Price: €${listing.price_per_unit_euro}`);
    })) passed++; else failed++;
    
    // ========================================
    // 4. CONSUMPTION TEST
    // ========================================
    console.log('\n📋 4. CONSUMPTION TEST\n');
    
    // Test 4.1: Consume Item
    if (await test('4.1 Consume item', async () => {
        // Get inventory
        const invResult = await makeRequest(`${ECONOMY_URL}/api/economy/inventory`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (invResult.statusCode !== 200 || !invResult.data?.data?.items?.length) {
            throw new Error('No items in inventory');
        }
        
        const item = invResult.data.data.items.find(i => i.item_code?.includes('BREAD'));
        if (!item) {
            throw new Error('No bread found in inventory');
        }
        
        const data = JSON.stringify({
            itemCode: item.item_code,
            quality: item.quality || 1,
            quantity: '1.0000'
        });
        
        const result = await makeRequest(`${ECONOMY_URL}/api/economy/consume`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, data);
        
        if (result.statusCode !== 200) {
            const errorMsg = result.data?.error || result.data?.message || result.body;
            throw new Error(`Consume failed: ${result.statusCode} - ${errorMsg}`);
        }
        console.log(`   Consumed: ${item.item_code}`);
        console.log(`   Energy restored: ${result.data?.data?.effects?.energyRestored || 'N/A'}`);
    })) passed++; else failed++;
    
    // ========================================
    // 5. ADMIN TESTS
    // ========================================
    console.log('\n📋 5. ADMIN TESTS\n');
    
    // Test 5.1: Admin Panel Access
    if (await test('5.1 Admin panel access', async () => {
        const result = await makeRequest(`${BASE_URL}/api/auth-service/auth/admin/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (result.statusCode !== 200) {
            throw new Error(`Admin access failed: ${result.statusCode}`);
        }
        const users = result.data?.users || [];
        console.log(`   Users found: ${users.length}`);
    })) passed++; else failed++;
    
    // Test 5.2: Treasury Check
    if (await test('5.2 Treasury status', async () => {
        const result = await makeRequest(`${ECONOMY_URL}/api/economy/admin/treasury`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (result.statusCode !== 200) {
            throw new Error(`Treasury check failed: ${result.statusCode}`);
        }
        console.log(`   Total collected: €${result.data?.data?.treasury?.total_collected || '0'}`);
    })) passed++; else failed++;
    
    // ========================================
    // SUMMARY
    // ========================================
    console.log('\n========================================');
    console.log('📊 TEST SUMMARY');
    console.log('========================================');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round(passed / (passed + failed) * 100)}%`);
    console.log('========================================\n');
    
    if (failed === 0) {
        console.log('🎉 ALL TESTS PASSED! The game is fully functional.\n');
    } else {
        console.log('⚠️  Some tests failed. Please check the errors above.\n');
    }
}

runTests().catch(console.error);
