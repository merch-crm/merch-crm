/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch({ channel: 'chrome' }); 
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    try {
        await page.goto('http://localhost:3000/login');
        await page.fill('input[type="email"]', 'admin@crm.local');
        await page.fill('input[type="password"]', '12345678');
        
        await Promise.all([
          page.waitForNavigation({ url: '**/dashboard/**', timeout: 5000 }),
          page.click('button[type="submit"]')
        ]);
    } catch(e) {
        console.log("Login err or bypass:", e.message);
    }

    try {
        await page.goto('http://localhost:3000/dashboard/production');
        await page.waitForTimeout(3000);
        await page.screenshot({ path: '.agent/test-screenshots/production-overview.png', fullPage: true });
        console.log("Screenshot 1 saved");

        await page.goto('http://localhost:3000/dashboard/production/tasks');
        await page.waitForTimeout(3000);
        await page.screenshot({ path: '.agent/test-screenshots/production-tasks.png', fullPage: true });
        console.log("Screenshot 2 saved");

    } catch(e) {
        console.log("Error during navigation/screenshot:", e);
    }

    await browser.close();
})();
