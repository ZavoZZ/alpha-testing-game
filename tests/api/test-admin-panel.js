// Test Admin Panel functionality
const http = require('http');

// Login as admin
const loginData = JSON.stringify({
    email: 'yxud74@gmail.com',
    password: 'david555'
});

const loginOptions = {
    hostname: 'localhost',
    port: 3100,
    path: '/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
    }
};

console.log('=== Testing Admin Panel ===\n');

const loginReq = http.request(loginOptions, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const token = data.trim();
        
        if (!token.startsWith('eyJ')) {
            console.error('Login failed');
            return;
        }
        
        console.log('✅ Admin login successful\n');
        
        // Test 1: Get all users
        console.log('--- Test 1: Get All Users ---');
        const usersReq = http.request({
            hostname: 'localhost',
            port: 3100,
            path: '/auth/admin/users',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }, (res2) => {
            let data2 = '';
            res2.on('data', chunk => data2 += chunk);
            res2.on('end', () => {
                try {
                    const result = JSON.parse(data2);
                    if (result.users) {
                        console.log(`✅ Found ${result.users.length} users`);
                        result.users.forEach(u => console.log(`   - ${u.username} (${u.email}) - Role: ${u.role}`));
                    } else {
                        console.log('Result:', data2.substring(0, 200));
                    }
                } catch (e) {
                    console.log('Raw response:', data2.substring(0, 200));
                }
                
                // Test 2: Get Treasury
                console.log('\n--- Test 2: Get Treasury ---');
                const treasuryReq = http.request({
                    hostname: 'localhost',
                    port: 3400,
                    path: '/admin/treasury',
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                }, (res3) => {
                    let data3 = '';
                    res3.on('data', chunk => data3 += chunk);
                    res3.on('end', () => {
                        try {
                            const result = JSON.parse(data3);
                            if (result.success) {
                                console.log('✅ Treasury data:');
                                console.log(`   Work Tax: €${result.treasury?.collected_work_tax_euro || '0'}`);
                                console.log(`   Market Tax: €${result.treasury?.collected_market_tax_euro || '0'}`);
                                console.log(`   Transfer Tax: €${result.treasury?.collected_transfer_tax_euro || '0'}`);
                            } else {
                                console.log('Result:', data3.substring(0, 200));
                            }
                        } catch (e) {
                            console.log('Raw response:', data3.substring(0, 200));
                        }
                        
                        // Test 3: Get all companies
                        console.log('\n--- Test 3: Get All Companies ---');
                        const companiesReq = http.request({
                            hostname: 'localhost',
                            port: 3400,
                            path: '/companies',
                            method: 'GET',
                            headers: { 'Authorization': `Bearer ${token}` }
                        }, (res4) => {
                            let data4 = '';
                            res4.on('data', chunk => data4 += chunk);
                            res4.on('end', () => {
                                try {
                                    const result = JSON.parse(data4);
                                    if (result.companies) {
                                        console.log(`✅ Found ${result.companies.length} companies`);
                                        result.companies.forEach(c => console.log(`   - ${c.name} (€${c.funds_euro})`));
                                    } else if (Array.isArray(result)) {
                                        console.log(`✅ Found ${result.length} companies`);
                                        result.forEach(c => console.log(`   - ${c.name} (€${c.funds_euro})`));
                                    } else {
                                        console.log('Result:', data4.substring(0, 200));
                                    }
                                } catch (e) {
                                    console.log('Raw response:', data4.substring(0, 200));
                                }
                                
                                // Test 4: Get marketplace stats
                                console.log('\n--- Test 4: Get Marketplace Stats ---');
                                const statsReq = http.request({
                                    hostname: 'localhost',
                                    port: 3400,
                                    path: '/marketplace',
                                    method: 'GET',
                                    headers: { 'Authorization': `Bearer ${token}` }
                                }, (res5) => {
                                    let data5 = '';
                                    res5.on('data', chunk => data5 += chunk);
                                    res5.on('end', () => {
                                        try {
                                            const result = JSON.parse(data5);
                                            if (result.listings) {
                                                console.log(`✅ Found ${result.listings.length} marketplace listings`);
                                            } else if (Array.isArray(result)) {
                                                console.log(`✅ Found ${result.length} marketplace listings`);
                                            } else {
                                                console.log('Result:', data5.substring(0, 200));
                                            }
                                        } catch (e) {
                                            console.log('Raw response:', data5.substring(0, 200));
                                        }
                                        
                                        console.log('\n=== Admin Panel Tests Complete ===');
                                    });
                                });
                                statsReq.on('error', e => console.error('Stats error:', e.message));
                                statsReq.end();
                            });
                        });
                        companiesReq.on('error', e => console.error('Companies error:', e.message));
                        companiesReq.end();
                    });
                });
                treasuryReq.on('error', e => console.error('Treasury error:', e.message));
                treasuryReq.end();
            });
        });
        usersReq.on('error', e => console.error('Users error:', e.message));
        usersReq.end();
    });
});

loginReq.on('error', e => console.error('Login error:', e.message));
loginReq.write(loginData);
loginReq.end();
