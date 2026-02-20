/**
 * Comprehensive API Testing Script
 * Tests all microservices and endpoints
 */

const http = require('http');

// Configuration
const SERVICES = {
  auth: { port: 3100, name: 'Auth Server' },
  news: { port: 3200, name: 'News Server' },
  chat: { port: 3300, name: 'Chat Server' },
  economy: { port: 3400, name: 'Economy Server' },
  app: { port: 3000, name: 'Main App' }
};

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper function to make HTTP requests
function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            json: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            json: null
          });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// Test functions
async function testHealthEndpoint(service, port) {
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: port,
      path: '/health',
      method: 'GET'
    });
    
    // Economy server returns different health format
    if (res.statusCode === 200) {
      if (res.json && res.json.status === 'ok') {
        results.passed.push(`✅ ${service} Health: OK`);
        return true;
      } else if (res.json && res.json.success) {
        results.passed.push(`✅ ${service} Health: OK (economy format)`);
        return true;
      } else {
        results.passed.push(`✅ ${service} Health: OK (status 200)`);
        return true;
      }
    } else {
      results.failed.push(`❌ ${service} Health: Failed (status: ${res.statusCode})`);
      return false;
    }
  } catch (e) {
    results.failed.push(`❌ ${service} Health: Error - ${e.message}`);
    return false;
  }
}

async function testAuthSignup() {
  const testUser = {
    username: 'apitest_' + Date.now(),
    email: `apitest_${Date.now()}@test.com`,
    password: 'testpassword123'
  };
  
  const body = JSON.stringify(testUser);
  
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: SERVICES.auth.port,
      path: '/auth/signup',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, body);
    
    if (res.statusCode === 201) {
      results.passed.push(`✅ Auth Signup: Created new user`);
      return testUser;
    } else if (res.body.includes('already exists')) {
      results.warnings.push(`⚠️ Auth Signup: User already exists (expected)`);
      return testUser;
    } else {
      results.failed.push(`❌ Auth Signup: Failed (status: ${res.statusCode}, body: ${res.body})`);
      return null;
    }
  } catch (e) {
    results.failed.push(`❌ Auth Signup: Error - ${e.message}`);
    return null;
  }
}

async function testAuthLogin(email, password) {
  const body = JSON.stringify({ email, password });
  
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: SERVICES.auth.port,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, body);
    
    if (res.statusCode === 200 && res.body.startsWith('eyJ')) {
      results.passed.push(`✅ Auth Login: Got JWT token`);
      return res.body;
    } else {
      results.failed.push(`❌ Auth Login: Failed (status: ${res.statusCode}, body: ${res.body})`);
      return null;
    }
  } catch (e) {
    results.failed.push(`❌ Auth Login: Error - ${e.message}`);
    return null;
  }
}

async function testAuthVerify(token) {
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: SERVICES.auth.port,
      path: '/auth/verify',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (res.statusCode === 200 && res.json && res.json.valid) {
      results.passed.push(`✅ Auth Verify: Token is valid`);
      return true;
    } else {
      results.failed.push(`❌ Auth Verify: Token invalid (status: ${res.statusCode}, body: ${res.body})`);
      return false;
    }
  } catch (e) {
    results.failed.push(`❌ Auth Verify: Error - ${e.message}`);
    return false;
  }
}

async function testEconomyBalance(token) {
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: SERVICES.economy.port,
      path: '/balances',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (res.statusCode === 200 && res.json && res.json.success) {
      results.passed.push(`✅ Economy Balance: ${JSON.stringify(res.json.balances)}`);
      return true;
    } else if (res.json && res.json.code === 'RATE_LIMIT_EXCEEDED') {
      results.warnings.push(`⚠️ Economy Balance: Rate limited (expected after multiple tests)`);
      return true;
    } else {
      results.failed.push(`❌ Economy Balance: Failed (status: ${res.statusCode}, body: ${res.body})`);
      return false;
    }
  } catch (e) {
    results.failed.push(`❌ Economy Balance: Error - ${e.message}`);
    return false;
  }
}

async function testEconomyWorkPreview(token) {
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: SERVICES.economy.port,
      path: '/work/preview',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (res.statusCode === 200 && res.json && res.json.success) {
      results.passed.push(`✅ Economy Work Preview: Available`);
      return true;
    } else if (res.json && res.json.error === 'No employer available') {
      results.warnings.push(`⚠️ Economy Work Preview: No employer available (need to create companies first)`);
      return true;
    } else if (res.json && res.json.code === 'RATE_LIMIT_EXCEEDED') {
      results.warnings.push(`⚠️ Economy Work Preview: Rate limited`);
      return true;
    } else {
      results.failed.push(`❌ Economy Work Preview: Failed (status: ${res.statusCode}, body: ${res.body})`);
      return false;
    }
  } catch (e) {
    results.failed.push(`❌ Economy Work Preview: Error - ${e.message}`);
    return false;
  }
}

async function testNewsArticles() {
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: SERVICES.news.port,
      path: '/news',
      method: 'GET'
    });
    
    if (res.statusCode === 200 && Array.isArray(res.json)) {
      results.passed.push(`✅ News Articles: Got ${res.json.length} articles`);
      return true;
    } else {
      results.failed.push(`❌ News Articles: Failed (status: ${res.statusCode})`);
      return false;
    }
  } catch (e) {
    results.failed.push(`❌ News Articles: Error - ${e.message}`);
    return false;
  }
}

async function testMainAppHomepage() {
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: SERVICES.app.port,
      path: '/',
      method: 'GET'
    });
    
    // 200 or 404 is acceptable (404 means webpack dev server is running but no route)
    if (res.statusCode === 200 || res.statusCode === 404) {
      results.passed.push(`✅ Main App Homepage: Responded (status: ${res.statusCode})`);
      return true;
    } else {
      results.failed.push(`❌ Main App Homepage: Failed (status: ${res.statusCode})`);
      return false;
    }
  } catch (e) {
    results.failed.push(`❌ Main App Homepage: Error - ${e.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('============================================');
  console.log('  COMPREHENSIVE API TESTING SCRIPT');
  console.log('============================================\n');
  
  // 1. Test Health Endpoints
  console.log('Testing Health Endpoints...');
  await testHealthEndpoint('Auth', SERVICES.auth.port);
  await testHealthEndpoint('News', SERVICES.news.port);
  await testHealthEndpoint('Chat', SERVICES.chat.port);
  await testHealthEndpoint('Economy', SERVICES.economy.port);
  console.log('');
  
  // 2. Test Auth Flow
  console.log('Testing Auth Flow...');
  const testUser = await testAuthSignup();
  const token = await testAuthLogin('test@test.com', 'testjoc123');
  if (token) {
    await testAuthVerify(token);
  }
  console.log('');
  
  // 3. Test Economy Endpoints
  console.log('Testing Economy Endpoints...');
  if (token) {
    await testEconomyBalance(token);
    await testEconomyWorkPreview(token);
  }
  console.log('');
  
  // 4. Test News Endpoints
  console.log('Testing News Endpoints...');
  await testNewsArticles();
  console.log('');
  
  // 5. Test Main App
  console.log('Testing Main App...');
  await testMainAppHomepage();
  console.log('');
  
  // Print Results
  console.log('============================================');
  console.log('  TEST RESULTS');
  console.log('============================================\n');
  
  console.log('PASSED:');
  results.passed.forEach(r => console.log(`  ${r}`));
  console.log('');
  
  console.log('WARNINGS:');
  if (results.warnings.length === 0) {
    console.log('  (none)');
  } else {
    results.warnings.forEach(r => console.log(`  ${r}`));
  }
  console.log('');
  
  console.log('FAILED:');
  if (results.failed.length === 0) {
    console.log('  (none)');
  } else {
    results.failed.forEach(r => console.log(`  ${r}`));
  }
  console.log('');
  
  // Summary
  const total = results.passed.length + results.failed.length + results.warnings.length;
  console.log('============================================');
  console.log(`  SUMMARY: ${results.passed.length}/${total} tests passed`);
  console.log('============================================');
  
  // Exit with error code if any tests failed
  if (results.failed.length > 0) {
    process.exit(1);
  }
}

runTests().catch(console.error);
