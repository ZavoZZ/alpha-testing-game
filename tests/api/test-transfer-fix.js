// Test transfer functionality after fix
const http = require('http');

// First, login to get a fresh token
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

console.log('=== Testing Transfer After Fix ===\n');

const loginReq = http.request(loginOptions, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            // Auth server returns token directly, not JSON
            const token = data.trim();
            
            if (token.startsWith('eyJ')) {
                console.log('✅ Login successful');
                console.log('Token:', token.substring(0, 50) + '...');
            } else {
                console.error('Login failed - unexpected response:', data);
                return;
            }
            
            // Now test transfer
            const transferData = JSON.stringify({
                receiverId: '6997a52fcd3051219c297080',
                amount: '1.00',
                currency: 'EURO',
                description: 'Test transfer after fix'
            });
            
            const transferOptions = {
                hostname: 'localhost',
                port: 3400,
                path: '/transfer',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Length': Buffer.byteLength(transferData)
                }
            };
            
            console.log('\n--- Testing Transfer ---');
            const transferReq = http.request(transferOptions, (res2) => {
                let data2 = '';
                res2.on('data', chunk => data2 += chunk);
                res2.on('end', () => {
                    console.log('Status:', res2.statusCode);
                    try {
                        const result = JSON.parse(data2);
                        console.log('Result:', JSON.stringify(result, null, 2));
                        
                        if (result.success) {
                            console.log('\n✅ TRANSFER SUCCESSFUL!');
                            console.log('Transaction ID:', result.data?.transaction_id);
                            console.log('Amount:', result.data?.amounts);
                        } else {
                            console.log('\n❌ Transfer failed:', result.error || result.message);
                        }
                    } catch (e) {
                        console.log('Raw response:', data2);
                    }
                });
            });
            
            transferReq.on('error', e => console.error('Transfer error:', e.message));
            transferReq.write(transferData);
            transferReq.end();
            
        } catch (e) {
            console.error('Parse error:', e.message);
            console.log('Raw data:', data);
        }
    });
});

loginReq.on('error', e => console.error('Login error:', e.message));
loginReq.write(loginData);
loginReq.end();
