#!/usr/bin/env node

const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Check signup page
    console.log('\n=== CHECKING SIGNUP PAGE ===');
    await page.goto('http://localhost:3001/signup', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    
    let inputs = await page.$$('input');
    console.log('=== SIGNUP INPUTS ===');
    for (const input of inputs) {
        const info = await input.evaluate(el => ({
            name: el.name,
            type: el.type,
            placeholder: el.placeholder
        }));
        console.log('Input:', JSON.stringify(info));
    }
    
    let buttons = await page.$$('button');
    console.log('\n=== SIGNUP BUTTONS ===');
    for (const btn of buttons) {
        const text = await btn.evaluate(el => el.innerText);
        console.log('Button:', text);
    }
    
    // Check homepage for login link
    console.log('\n=== CHECKING HOMEPAGE ===');
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    
    const links = await page.$$('a');
    console.log('=== HOMEPAGE LINKS ===');
    for (const link of links) {
        const text = await link.evaluate(el => el.innerText);
        const href = await link.evaluate(el => el.href);
        console.log(`Link: "${text}" -> ${href}`);
    }
    
    // Check the actual login component
    console.log('\n=== CHECKING /accounts/login ===');
    await page.goto('http://localhost:3001/accounts/login', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    
    inputs = await page.$$('input');
    console.log('=== ACCOUNTS/LOGIN INPUTS ===');
    for (const input of inputs) {
        const info = await input.evaluate(el => ({
            name: el.name,
            type: el.type,
            placeholder: el.placeholder
        }));
        console.log('Input:', JSON.stringify(info));
    }
    
    buttons = await page.$$('button');
    console.log('\n=== ACCOUNTS/LOGIN BUTTONS ===');
    for (const btn of buttons) {
        const text = await btn.evaluate(el => el.innerText);
        console.log('Button:', text);
    }
    
    await browser.close();
})().catch(console.error);
