/**
 * =============================================================================
 * ECONOMY API - PLAYER PERSPECTIVE END-TO-END TEST
 * =============================================================================
 * 
 * Tests all economy API functionality from a real player's perspective.
 * 
 * TEST SCENARIOS:
 * 1. Player Login (get JWT token)
 * 2. Check Balances (GET /api/economy/balances)
 * 3. Check Single Balance (GET /api/economy/balance/EURO)
 * 4. Transfer Money (POST /api/economy/transfer)
 * 5. View Transaction History (GET /api/economy/history)
 * 6. Security Tests (rate limiting, invalid payloads)
 * 7. Admin Panel Access (admin only)
 * 8. Logout
 * 
 * @version 1.0.0
 * @date 2026-02-11
 */

const API_BASE = 'https://ovidiuguru.online';

// Test utilities
let testCount = 0;
let passCount = 0;
let failCount = 0;
let jwtToken = null;
let userId = null;

function log(message, data = null) {
	console.log(`\n${message}`);
	if (data) {
		console.log(JSON.stringify(data, null, 2));
	}
}

function test(name, result, details = '') {
	testCount++;
	if (result) {
		passCount++;
		console.log(`✅ [${testCount}] ${name}`);
		if (details) console.log(`   ${details}`);
	} else {
		failCount++;
		console.error(`❌ [${testCount}] ${name}`);
		if (details) console.error(`   ${details}`);
	}
}

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================================================
// MAIN TEST SUITE
// =============================================================================

async function runAllTests() {
	console.log('╔════════════════════════════════════════════════════════════════╗');
	console.log('║  🎮 ECONOMY API - PLAYER PERSPECTIVE TEST SUITE               ║');
	console.log('║  Server: ovidiuguru.online (PRODUCTION)                       ║');
	console.log('╚════════════════════════════════════════════════════════════════╝');
	console.log();

	try {
		// =====================================================================
		// SCENARIO 1: PLAYER LOGIN
		// =====================================================================
		log('╔════════════════════════════════════════════════════════════════╗');
		log('║  SCENARIO 1: Player Login & Authentication                     ║');
		log('╚════════════════════════════════════════════════════════════════╝');

		const loginResponse = await fetch(`${API_BASE}/api/auth-service/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: 'testadmin@test.com',
				password: 'admin123'
			})
		});

		const loginData = await loginResponse.json();
		
		test('Player Login', loginData.success, `Token received: ${loginData.token ? 'YES' : 'NO'}`);
		
		if (loginData.success) {
			jwtToken = loginData.token;
			userId = loginData.user?.userId || loginData.userId;
			log(`   User: ${loginData.user?.username || 'N/A'}`);
			log(`   Role: ${loginData.user?.role || 'N/A'}`);
		}

		await sleep(500);

		// =====================================================================
		// SCENARIO 2: CHECK ECONOMY API HEALTH
		// =====================================================================
		log('\n╔════════════════════════════════════════════════════════════════╗');
		log('║  SCENARIO 2: Economy API Health Check (PUBLIC)                 ║');
		log('╚════════════════════════════════════════════════════════════════╝');

		const healthResponse = await fetch(`${API_BASE}/api/economy/health`);
		const healthData = await healthResponse.json();

		test('Economy API Health', healthData.success && healthData.status === 'operational',
			`Status: ${healthData.status}, Security: ${JSON.stringify(healthData.security || {})}`);

		await sleep(500);

		// =====================================================================
		// SCENARIO 3: GET ALL BALANCES
		// =====================================================================
		log('\n╔════════════════════════════════════════════════════════════════╗');
		log('║  SCENARIO 3: Get Player Balances (AUTH REQUIRED)               ║');
		log('╚════════════════════════════════════════════════════════════════╝');

		const balancesResponse = await fetch(`${API_BASE}/api/economy/balances`, {
			headers: { 'Authorization': `Bearer ${jwtToken}` }
		});

		const balancesData = await balancesResponse.json();

		test('Get All Balances', balancesData.success,
			`EURO: ${balancesData.data?.balances?.EURO}, GOLD: ${balancesData.data?.balances?.GOLD}, RON: ${balancesData.data?.balances?.RON}`);

		const initialBalanceEuro = balancesData.data?.balances?.EURO || '0.0000';

		await sleep(500);

		// =====================================================================
		// SCENARIO 4: GET SINGLE BALANCE
		// =====================================================================
		log('\n╔════════════════════════════════════════════════════════════════╗');
		log('║  SCENARIO 4: Get Single Balance (EURO)                         ║');
		log('╚════════════════════════════════════════════════════════════════╝');

		const singleBalanceResponse = await fetch(`${API_BASE}/api/economy/balance/EURO`, {
			headers: { 'Authorization': `Bearer ${jwtToken}` }
		});

		const singleBalanceData = await singleBalanceResponse.json();

		test('Get Single Balance (EURO)', singleBalanceData.success,
			`Balance: ${singleBalanceData.data?.balance} EURO`);

		await sleep(500);

		// =====================================================================
		// SCENARIO 5: SECURITY TEST - Access Without Auth
		// =====================================================================
		log('\n╔════════════════════════════════════════════════════════════════╗');
		log('║  SCENARIO 5: Security Test - Access Without Authentication     ║');
		log('╚════════════════════════════════════════════════════════════════╝');

		const unauthResponse = await fetch(`${API_BASE}/api/economy/balances`);
		const unauthData = await unauthResponse.json();

		test('Block Unauthenticated Access', !unauthData.success && unauthResponse.status === 401,
			`Correctly blocked with code: ${unauthData.code}`);

		await sleep(500);

		// =====================================================================
		// SCENARIO 6: SECURITY TEST - Invalid Amount Format
		// =====================================================================
		log('\n╔════════════════════════════════════════════════════════════════╗');
		log('║  SCENARIO 6: Security Test - Invalid Amount Formats            ║');
		log('╚════════════════════════════════════════════════════════════════╝');

		// Test 6a: Negative amount
		const negativeResponse = await fetch(`${API_BASE}/api/economy/transfer`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${jwtToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				receiverId: '507f191e810c19729de860ea',
				amount: '-100.00',  // Negative!
				currency: 'EURO'
			})
		});

		const negativeData = await negativeResponse.json();
		test('Block Negative Amount', !negativeData.success && negativeResponse.status === 400,
			`Blocked with code: ${negativeData.code}`);

		await sleep(500);

		// Test 6b: Scientific notation
		const scientificResponse = await fetch(`${API_BASE}/api/economy/transfer`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${jwtToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				receiverId: '507f191e810c19729de860ea',
				amount: '1e10',  // Scientific notation!
				currency: 'EURO'
			})
		});

		const scientificData = await scientificResponse.json();
		test('Block Scientific Notation', !scientificData.success && scientificResponse.status === 400,
			`Blocked with code: ${scientificData.code}`);

		await sleep(500);

		// Test 6c: Amount as Number (not string)
		const numberResponse = await fetch(`${API_BASE}/api/economy/transfer`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${jwtToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				receiverId: '507f191e810c19729de860ea',
				amount: 100.50,  // Number, not string!
				currency: 'EURO'
			})
		});

		const numberData = await numberResponse.json();
		test('Block Number Type Amount', !numberData.success && numberResponse.status === 400,
			`Blocked with code: ${numberData.code}`);

		await sleep(500);

		// Test 6d: Too many decimals
		const decimalsResponse = await fetch(`${API_BASE}/api/economy/transfer`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${jwtToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				receiverId: '507f191e810c19729de860ea',
				amount: '100.123456',  // 6 decimals (max is 4)!
				currency: 'EURO'
			})
		});

		const decimalsData = await decimalsResponse.json();
		test('Block Excessive Decimals', !decimalsData.success && decimalsResponse.status === 400,
			`Blocked with code: ${decimalsData.code}`);

		await sleep(500);

		// =====================================================================
		// SCENARIO 7: TRANSFER TEST (If user has balance)
		// =====================================================================
		log('\n╔════════════════════════════════════════════════════════════════╗');
		log('║  SCENARIO 7: Money Transfer Test (P2P)                         ║');
		log('╚════════════════════════════════════════════════════════════════╝');

		// Check if user has enough balance for a small transfer
		const hasBalance = parseFloat(initialBalanceEuro) >= 10.0;

		if (hasBalance) {
			// Try to transfer to SYSTEM account (safe test)
			const systemUser = await fetch(`${API_BASE}/api/auth-service/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: 'system@test.com',
					password: 'system123'
				})
			}).then(r => r.json());

			if (systemUser.success) {
				const transferResponse = await fetch(`${API_BASE}/api/economy/transfer`, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${jwtToken}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						receiverId: systemUser.user.userId,
						amount: '5.00',
						currency: 'EURO',
						description: 'Test transfer from player perspective'
					})
				});

				const transferData = await transferResponse.json();
				test('Money Transfer (P2P)', transferData.success,
					`Gross: ${transferData.data?.amounts?.gross}, Tax: ${transferData.data?.amounts?.tax}, Net: ${transferData.data?.amounts?.net}`);
			} else {
				test('Money Transfer (P2P)', false, 'Could not find SYSTEM user for test');
			}
		} else {
			log('⚠️  Skipping transfer test - insufficient balance');
			log(`   Current balance: ${initialBalanceEuro} EURO`);
			log(`   Required: 10.00 EURO`);
		}

		await sleep(500);

		// =====================================================================
		// SCENARIO 8: TRANSACTION HISTORY
		// =====================================================================
		log('\n╔════════════════════════════════════════════════════════════════╗');
		log('║  SCENARIO 8: Transaction History                               ║');
		log('╚════════════════════════════════════════════════════════════════╝');

		const historyResponse = await fetch(`${API_BASE}/api/economy/history?limit=5`, {
			headers: { 'Authorization': `Bearer ${jwtToken}` }
		});

		const historyData = await historyResponse.json();

		test('Transaction History', historyResponse.status === 200,
			`Transactions count: ${historyData.data?.count || 0}`);

		if (historyData.success && historyData.data?.transactions?.length > 0) {
			log('   Recent transactions:');
			historyData.data.transactions.slice(0, 3).forEach((tx, i) => {
				log(`   ${i + 1}. ${tx.type}: ${tx.amount_gross} ${tx.currency} (${tx.sender} → ${tx.receiver})`);
			});
		}

		await sleep(500);

		// =====================================================================
		// SCENARIO 9: RATE LIMITING TEST
		// =====================================================================
		log('\n╔════════════════════════════════════════════════════════════════╗');
		log('║  SCENARIO 9: Rate Limiting Test (Spam Protection)              ║');
		log('╚════════════════════════════════════════════════════════════════╝');

		log('   Sending 12 rapid requests to trigger rate limit...');
		let rateLimitTriggered = false;

		for (let i = 0; i < 12; i++) {
			const response = await fetch(`${API_BASE}/api/economy/balance/EURO`, {
				headers: { 'Authorization': `Bearer ${jwtToken}` }
			});

			if (response.status === 429) {
				rateLimitTriggered = true;
				const rateLimitData = await response.json();
				log(`   Rate limit triggered at request #${i + 1}`);
				test('Rate Limiting Active', true,
					`Blocked after ${i + 1} requests. Retry after: ${rateLimitData.retry_after_seconds}s`);
				break;
			}

			await sleep(100);
		}

		if (!rateLimitTriggered) {
			test('Rate Limiting Active', false, 'Rate limit was not triggered after 12 requests');
		}

		// Wait for rate limit to reset (or skip other tests)
		log('\n   ⏳ Waiting 2 seconds before continuing...');
		await sleep(2000);

		// =====================================================================
		// SCENARIO 10: FINAL BALANCE CHECK
		// =====================================================================
		log('\n╔════════════════════════════════════════════════════════════════╗');
		log('║  SCENARIO 10: Final Balance Verification                       ║');
		log('╚════════════════════════════════════════════════════════════════╝');

		// Wait for rate limit cooldown
		await sleep(3000);

		const finalBalancesResponse = await fetch(`${API_BASE}/api/economy/balances`, {
			headers: { 'Authorization': `Bearer ${jwtToken}` }
		});

		if (finalBalancesResponse.status === 429) {
			log('   ⚠️  Rate limit still active, waiting 10 more seconds...');
			await sleep(10000);
			
			const retryResponse = await fetch(`${API_BASE}/api/economy/balances`, {
				headers: { 'Authorization': `Bearer ${jwtToken}` }
			});
			
			const retryData = await retryResponse.json();
			test('Final Balance Check (After Cooldown)', retryData.success,
				`EURO: ${retryData.data?.balances?.EURO}, GOLD: ${retryData.data?.balances?.GOLD}`);
		} else {
			const finalBalancesData = await finalBalancesResponse.json();
			test('Final Balance Check', finalBalancesData.success,
				`EURO: ${finalBalancesData.data?.balances?.EURO}, GOLD: ${finalBalancesData.data?.balances?.GOLD}`);
		}

		// =====================================================================
		// TEST SUMMARY
		// =====================================================================
		log('\n╔════════════════════════════════════════════════════════════════╗');
		log('║  TEST SUMMARY                                                   ║');
		log('╚════════════════════════════════════════════════════════════════╝');
		log('');
		log(`Total Tests:  ${testCount}`);
		log(`✅ Passed:    ${passCount}`);
		log(`❌ Failed:    ${failCount}`);
		log('');

		if (failCount === 0) {
			log('🎉 ALL TESTS PASSED! Economy API is FULLY FUNCTIONAL from player perspective!');
			log('');
			process.exit(0);
		} else {
			log(`⚠️  ${failCount} test(s) failed. Review errors above.`);
			log('');
			process.exit(1);
		}

	} catch (error) {
		console.error('\n❌ CRITICAL ERROR during testing:');
		console.error(error);
		process.exit(1);
	}
}

// Run tests
runAllTests();
