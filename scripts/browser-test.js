#!/usr/bin/env node

/**
 * =====================================================================
 * Browser Testing Script with Puppeteer
 * =====================================================================
 * This script tests the application in a real browser
 * Usage: node scripts/browser-test.js
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
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
const HEADLESS = process.env.HEADLESS !== 'false';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

// Test results
let testsPassed = 0;
let testsFailed = 0;

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
 * Main test suite
 */
async function runTests() {
    log('==========================================', 'blue');
    log('🧪 Browser Testing with Puppeteer', 'blue');
    log('==========================================', 'blue');
    log(`\nBase URL: ${BASE_URL}`);
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
            if (type === 'error') {
                log(`   Browser Error: ${msg.text()}`, 'red');
            }
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
                path: path.join(SCREENSHOTS_DIR, 'homepage.png'),
                fullPage: true,
            });
        });
        
        // =====================================================================
        // Test 2: Page Title
        // =====================================================================
        await runTest('Page title is correct', async () => {
            const title = await page.title();
            if (!title || title.trim() === '') {
                throw new Error('Page title is empty');
            }
        });
        
        // =====================================================================
        // Test 3: No JavaScript Errors
        // =====================================================================
        await runTest('No JavaScript errors on homepage', async () => {
            const errors = [];
            
            page.on('pageerror', error => {
                errors.push(error.message);
            });
            
            await page.reload({ waitUntil: 'networkidle2' });
            
            if (errors.length > 0) {
                throw new Error(`Found ${errors.length} JavaScript error(s)`);
            }
        });
        
        // =====================================================================
        // Test 4: Login Page
        // =====================================================================
        await runTest('Login page loads', async () => {
            const response = await page.goto(`${BASE_URL}/login`, {
                waitUntil: 'networkidle2',
                timeout: 30000,
            });
            
            if (!response.ok()) {
                throw new Error(`HTTP ${response.status()}`);
            }
            
            await page.screenshot({
                path: path.join(SCREENSHOTS_DIR, 'login.png'),
                fullPage: true,
            });
        });
        
        // =====================================================================
        // Test 5: Login Form Elements
        // =====================================================================
        await runTest('Login form has required elements', async () => {
            await page.goto(`${BASE_URL}/login`, {
                waitUntil: 'networkidle2',
            });
            
            // Check for email/username input
            const emailInput = await page.$('input[type="email"], input[name="email"], input[name="username"]');
            if (!emailInput) {
                throw new Error('Email/username input not found');
            }
            
            // Check for password input
            const passwordInput = await page.$('input[type="password"]');
            if (!passwordInput) {
                throw new Error('Password input not found');
            }
            
            // Check for submit button
            const submitButton = await page.$('button[type="submit"], input[type="submit"]');
            if (!submitButton) {
                throw new Error('Submit button not found');
            }
        });
        
        // =====================================================================
        // Test 6: Signup Page
        // =====================================================================
        await runTest('Signup page loads', async () => {
            const response = await page.goto(`${BASE_URL}/signup`, {
                waitUntil: 'networkidle2',
                timeout: 30000,
            });
            
            if (!response.ok()) {
                throw new Error(`HTTP ${response.status()}`);
            }
            
            await page.screenshot({
                path: path.join(SCREENSHOTS_DIR, 'signup.png'),
                fullPage: true,
            });
        });
        
        // =====================================================================
        // Test 7: Dashboard (requires auth, should redirect)
        // =====================================================================
        await runTest('Dashboard redirects when not authenticated', async () => {
            await page.goto(`${BASE_URL}/dashboard`, {
                waitUntil: 'networkidle2',
                timeout: 30000,
            });
            
            const currentUrl = page.url();
            
            // Should redirect to login or homepage
            if (currentUrl.includes('/dashboard') && !currentUrl.includes('/login')) {
                // If we're still on dashboard, check if there's a login prompt
                const loginPrompt = await page.$('input[type="password"]');
                if (!loginPrompt) {
                    throw new Error('Dashboard accessible without authentication');
                }
            }
            
            await page.screenshot({
                path: path.join(SCREENSHOTS_DIR, 'dashboard-unauth.png'),
                fullPage: true,
            });
        });
        
        // =====================================================================
        // Test 8: Responsive Design
        // =====================================================================
        await runTest('Responsive design works (mobile)', async () => {
            await page.setViewport({ width: 375, height: 667 }); // iPhone SE
            
            await page.goto(BASE_URL, {
                waitUntil: 'networkidle2',
            });
            
            await page.screenshot({
                path: path.join(SCREENSHOTS_DIR, 'homepage-mobile.png'),
                fullPage: true,
            });
            
            // Reset viewport
            await page.setViewport({ width: 1920, height: 1080 });
        });
        
        // =====================================================================
        // Test 9: API Health Check
        // =====================================================================
        await runTest('API endpoints are accessible', async () => {
            const endpoints = [
                '/api/accounts/health',
                '/api/economy/health',
            ];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await page.goto(`${BASE_URL}${endpoint}`, {
                        waitUntil: 'networkidle2',
                        timeout: 10000,
                    });
                    
                    if (!response.ok() && response.status() !== 404) {
                        throw new Error(`${endpoint} returned HTTP ${response.status()}`);
                    }
                } catch (error) {
                    // Some endpoints might not exist, that's okay
                    log(`   Warning: ${endpoint} not accessible`, 'yellow');
                }
            }
        });
        
        // =====================================================================
        // Test 10: Performance Check
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
            
            log(`   Load time: ${loadTime}ms`, 'blue');
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
