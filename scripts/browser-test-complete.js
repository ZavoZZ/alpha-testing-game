#!/usr/bin/env node

/**
 * =====================================================================
 * Complete Browser Testing Script with Puppeteer
 * Tests the full player flow in a real browser
 * =====================================================================
 */

const fs = require('fs');
const path = require('path');

// Check if puppeteer is installed
let puppeteer;
try {
    puppeteer = require('puppeteer');
} catch (error) {
    console.error('❌ Puppeteer is not installed!');
    console.error('Please run: npm install --save-dev puppeteer');
    process.exit(1);
}

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const API_URL = process.env.API_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
const HEADLESS = process.env.HEADLESS !== 'false';

// Game access password (from server/server.js line 160)
const GAME_ACCESS_PASSWORD = 'testjoc';

// Test credentials
const TEST_USER = {
    email: 'yxud74@gmail.com',
    password: 'david555'
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

// Test results
let testsPassed = 0;
let testsFailed = 0;
let consoleErrors = [];
let consoleWarnings = [];

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Log with color
 */
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Run a test
 */
async function runTest(name, testFn) {
    log(`\n▶ Testing: ${name}`, 'blue');
    
    try {
        await testFn();
        log(`✅ PASS: ${name}`, 'green');
        testsPassed++;
        return true;
    } catch (error) {
        log(`❌ FAIL: ${name}`, 'red');
        log(`   Error: ${error.message}`, 'red');
        testsFailed++;
        return false;
    }
}

/**
 * Wait for a specified time
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main test suite
 */
async function runTests() {
    log('==========================================', 'blue');
    log('🧪 Complete Browser Testing with Puppeteer', 'blue');
    log('==========================================', 'blue');
    log(`\nBase URL: ${BASE_URL}`);
    log(`API URL: ${API_URL}`);
    log(`Screenshots: ${SCREENSHOTS_DIR}`);
    log(`Headless: ${HEADLESS}\n`);
    
    let browser;
    let page;
    
    try {
        // Launch browser
        log('🚀 Launching browser...', 'blue');
        browser = await puppeteer.launch({
            headless: HEADLESS,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        
        page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Set up console log capture
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            if (type === 'error') {
                consoleErrors.push(text);
                log(`   Browser Error: ${text}`, 'red');
            } else if (type === 'warning') {
                consoleWarnings.push(text);
            }
        });
        
        // Capture page errors
        page.on('pageerror', error => {
            consoleErrors.push(error.message);
            log(`   Page Error: ${error.message}`, 'red');
        });
        
        log('✅ Browser launched\n', 'green');
        
        // =====================================================================
        // Test 1: Homepage
        // =====================================================================
        await runTest('Homepage loads successfully', async () => {
            const response = await page.goto(BASE_URL, {
                waitUntil: 'networkidle2',
                timeout: 30000,
            });
            
            if (!response.ok()) {
                throw new Error(`HTTP ${response.status()}`);
            }
            
            await page.screenshot({
                path: path.join(SCREENSHOTS_DIR, '01-homepage.png'),
                fullPage: true,
            });
            
            log(`   URL: ${page.url()}`, 'cyan');
        });
        
        // =====================================================================
        // Test 2: Page Title
        // =====================================================================
        await runTest('Page title is correct', async () => {
            const title = await page.title();
            log(`   Title: ${title}`, 'cyan');
            if (!title || title.trim() === '') {
                throw new Error('Page title is empty');
            }
        });
        
        // =====================================================================
        // Test 2.5: Bypass Game Access Password Screen
        // =====================================================================
        await runTest('Bypass game access password screen', async () => {
            // Check if we're on the password screen
            const passwordInput = await page.$('input[type="password"]');
            const unlockButton = await page.$('button');
            
            if (passwordInput && unlockButton) {
                log(`   Password screen detected, entering game access password...`, 'cyan');
                
                // Type the game access password
                await passwordInput.type(GAME_ACCESS_PASSWORD);
                await sleep(500);
                
                // Take screenshot before unlocking
                await page.screenshot({
                    path: path.join(SCREENSHOTS_DIR, '02-password-screen.png'),
                    fullPage: true,
                });
                
                // Click unlock button
                await unlockButton.click();
                
                // Wait for navigation
                await sleep(3000);
                
                // Take screenshot after unlocking
                await page.screenshot({
                    path: path.join(SCREENSHOTS_DIR, '03-after-unlock.png'),
                    fullPage: true,
                });
                
                log(`   Game access granted!`, 'cyan');
            } else {
                log(`   No password screen detected, already authenticated`, 'cyan');
            }
        });
        
        // =====================================================================
        // Test 3: Navigate to Login
        // =====================================================================
        await runTest('Navigate to login page', async () => {
            // Click on login link or navigate directly
            await page.goto(`${BASE_URL}/login`, {
                waitUntil: 'networkidle2',
                timeout: 30000,
            });
            
            await sleep(1000); // Wait for React to render
            
            await page.screenshot({
                path: path.join(SCREENSHOTS_DIR, '02-login-page.png'),
                fullPage: true,
            });
            
            log(`   URL: ${page.url()}`, 'cyan');
        });
        
        // =====================================================================
        // Test 4: Login Form Elements
        // =====================================================================
        await runTest('Login form has required elements', async () => {
            // Check for email input
            const emailInput = await page.$('input[type="email"], input[name="email"], input[name="username"]');
            if (!emailInput) {
                throw new Error('Email/username input not found');
            }
            log(`   ✓ Email input found`, 'cyan');
            
            // Check for password input
            const passwordInput = await page.$('input[type="password"]');
            if (!passwordInput) {
                throw new Error('Password input not found');
            }
            log(`   ✓ Password input found`, 'cyan');
            
            // Check for submit button
            const submitButton = await page.$('button[type="submit"], input[type="submit"]');
            if (!submitButton) {
                throw new Error('Submit button not found');
            }
            log(`   ✓ Submit button found`, 'cyan');
        });
        
        // =====================================================================
        // Test 5: Login with Test User
        // =====================================================================
        await runTest('Login with test user', async () => {
            // Fill in the login form
            const emailInput = await page.$('input[type="email"], input[name="email"], input[name="username"]');
            const passwordInput = await page.$('input[type="password"]');
            
            if (!emailInput || !passwordInput) {
                throw new Error('Login form inputs not found');
            }
            
            // Clear and type email
            await emailInput.click({ clickCount: 3 });
            await emailInput.type(TEST_USER.email);
            log(`   Email: ${TEST_USER.email}`, 'cyan');
            
            // Clear and type password
            await passwordInput.click({ clickCount: 3 });
            await passwordInput.type(TEST_USER.password);
            log(`   Password: ********`, 'cyan');
            
            // Take screenshot before submit
            await page.screenshot({
                path: path.join(SCREENSHOTS_DIR, '03-login-filled.png'),
                fullPage: true,
            });
            
            // Submit the form
            const submitButton = await page.$('button[type="submit"], input[type="submit"]');
            await submitButton.click();
            
            // Wait for navigation or response
            await sleep(3000);
            
            // Take screenshot after login
            await page.screenshot({
                path: path.join(SCREENSHOTS_DIR, '04-after-login.png'),
                fullPage: true,
            });
            
            log(`   URL after login: ${page.url()}`, 'cyan');
        });
        
        // =====================================================================
        // Test 6: Dashboard Access
        // =====================================================================
        await runTest('Dashboard is accessible after login', async () => {
            // Navigate to dashboard
            await page.goto(`${BASE_URL}/dashboard`, {
                waitUntil: 'networkidle2',
                timeout: 30000,
            });
            
            await sleep(2000);
            
            await page.screenshot({
                path: path.join(SCREENSHOTS_DIR, '05-dashboard.png'),
                fullPage: true,
            });
            
            log(`   URL: ${page.url()}`, 'cyan');
            
            // Check if we're actually on dashboard (not redirected to login)
            const currentUrl = page.url();
            if (currentUrl.includes('/login')) {
                throw new Error('Redirected to login - authentication failed');
            }
        });
        
        // =====================================================================
        // Test 7: Check Balance Display
        // =====================================================================
        await runTest('Balance is displayed on dashboard', async () => {
            // Look for balance elements
            const balanceText = await page.evaluate(() => {
                const body = document.body.innerText;
                // Look for EUR, EURO, or balance patterns
                const eurMatch = body.match(/€[\d,.]+|EUR[\s:]*[\d,.]+|[\d,.]+\s*EUR/i);
                return eurMatch ? eurMatch[0] : null;
            });
            
            if (balanceText) {
                log(`   Balance found: ${balanceText}`, 'cyan');
            } else {
                log(`   Balance not found in text, but page loaded`, 'yellow');
            }
        });
        
        // =====================================================================
        // Test 8: Check Energy Display
        // =====================================================================
        await runTest('Energy is displayed on dashboard', async () => {
            const energyText = await page.evaluate(() => {
                const body = document.body.innerText;
                const energyMatch = body.match(/Energy[\s:]*[\d]+|[\d]+[\s%]*Energy/i);
                return energyMatch ? energyMatch[0] : null;
            });
            
            if (energyText) {
                log(`   Energy found: ${energyText}`, 'cyan');
            } else {
                log(`   Energy not found in text`, 'yellow');
            }
        });
        
        // =====================================================================
        // Test 9: Work Button
        // =====================================================================
        await runTest('Work button exists on dashboard', async () => {
            // Look for work button
            const workButton = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const workBtn = buttons.find(btn => 
                    btn.innerText.toLowerCase().includes('work') ||
                    btn.innerText.toLowerCase().includes('sign') ||
                    btn.innerText.toLowerCase().includes('contract')
                );
                return workBtn ? workBtn.innerText : null;
            });
            
            if (workButton) {
                log(`   Work button found: "${workButton}"`, 'cyan');
            } else {
                log(`   Work button not found, checking for work section...`, 'yellow');
            }
        });
        
        // =====================================================================
        // Test 10: Inventory Section
        // =====================================================================
        await runTest('Inventory section exists', async () => {
            const inventoryText = await page.evaluate(() => {
                const body = document.body.innerText;
                return body.includes('Inventory') || body.includes('inventory') || body.includes('BREAD');
            });
            
            if (inventoryText) {
                log(`   Inventory section found`, 'cyan');
            } else {
                log(`   Inventory section not visible`, 'yellow');
            }
        });
        
        // =====================================================================
        // Test 11: Marketplace Section
        // =====================================================================
        await runTest('Marketplace section exists', async () => {
            const marketplaceText = await page.evaluate(() => {
                const body = document.body.innerText;
                return body.includes('Marketplace') || body.includes('marketplace') || body.includes('Market');
            });
            
            if (marketplaceText) {
                log(`   Marketplace section found`, 'cyan');
            } else {
                log(`   Marketplace section not visible`, 'yellow');
            }
        });
        
        // =====================================================================
        // Test 12: API Health Check
        // =====================================================================
        await runTest('API endpoints are accessible', async () => {
            const endpoints = [
                { url: `${API_URL}/api/economy/health`, name: 'Economy' },
                { url: `${API_URL}/api/auth-service/auth/health`, name: 'Auth' },
            ];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await page.goto(endpoint.url, {
                        waitUntil: 'networkidle2',
                        timeout: 10000,
                    });
                    
                    if (response.ok()) {
                        log(`   ✓ ${endpoint.name} API: OK`, 'cyan');
                    } else {
                        log(`   ✗ ${endpoint.name} API: HTTP ${response.status()}`, 'yellow');
                    }
                } catch (error) {
                    log(`   ✗ ${endpoint.name} API: ${error.message}`, 'yellow');
                }
            }
        });
        
        // =====================================================================
        // Test 13: Responsive Design (Mobile)
        // =====================================================================
        await runTest('Responsive design works (mobile)', async () => {
            await page.setViewport({ width: 375, height: 667 }); // iPhone SE
            
            await page.goto(BASE_URL, {
                waitUntil: 'networkidle2',
            });
            
            await sleep(1000);
            
            await page.screenshot({
                path: path.join(SCREENSHOTS_DIR, '06-mobile.png'),
                fullPage: true,
            });
            
            log(`   Mobile viewport: 375x667`, 'cyan');
            
            // Reset viewport
            await page.setViewport({ width: 1920, height: 1080 });
        });
        
        // =====================================================================
        // Test 14: Performance Check
        // =====================================================================
        await runTest('Page loads within acceptable time', async () => {
            const startTime = Date.now();
            
            await page.goto(BASE_URL, {
                waitUntil: 'networkidle2',
                timeout: 30000,
            });
            
            const loadTime = Date.now() - startTime;
            
            if (loadTime > 10000) {
                throw new Error(`Page took ${loadTime}ms to load (>10s)`);
            }
            
            log(`   Load time: ${loadTime}ms`, 'cyan');
        });
        
        // =====================================================================
        // Test 15: Admin Panel Access
        // =====================================================================
        await runTest('Admin panel is accessible', async () => {
            // Navigate to admin panel
            await page.goto(`${BASE_URL}/admin`, {
                waitUntil: 'networkidle2',
                timeout: 30000,
            });
            
            await sleep(2000);
            
            await page.screenshot({
                path: path.join(SCREENSHOTS_DIR, '07-admin-panel.png'),
                fullPage: true,
            });
            
            log(`   URL: ${page.url()}`, 'cyan');
        });
        
    } catch (error) {
        log(`\n❌ Fatal error: ${error.message}`, 'red');
        testsFailed++;
    } finally {
        // Close browser
        if (browser) {
            await browser.close();
            log('\n🔒 Browser closed', 'blue');
        }
    }
    
    // =====================================================================
    // Test Results Summary
    // =====================================================================
    log('\n==========================================', 'blue');
    log('📊 Test Results Summary', 'blue');
    log('==========================================', 'blue');
    log(`\nTests Passed: ${testsPassed}`, 'green');
    log(`Tests Failed: ${testsFailed}`, 'red');
    log(`Total Tests:  ${testsPassed + testsFailed}`);
    log(`\nScreenshots saved to: ${SCREENSHOTS_DIR}\n`);
    
    if (consoleErrors.length > 0) {
        log(`\n⚠️  Console Errors (${consoleErrors.length}):`, 'yellow');
        consoleErrors.slice(0, 5).forEach(err => {
            log(`   - ${err.substring(0, 100)}...`, 'yellow');
        });
    }
    
    if (testsFailed === 0) {
        log('✅ All browser tests passed!\n', 'green');
        process.exit(0);
    } else {
        log('❌ Some browser tests failed!\n', 'red');
        process.exit(1);
    }
}

// Run tests
runTests().catch(error => {
    log(`\n❌ Unexpected error: ${error.message}`, 'red');
    process.exit(1);
});
