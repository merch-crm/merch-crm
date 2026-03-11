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
        console.log("Logged in");
    } catch(e) {
        console.log("Login err or bypass:", e.message);
    }

    try {
        await page.goto('http://localhost:3000/dashboard/design/prints');
        await page.waitForTimeout(3000);
        await page.screenshot({ path: '.agent/test-screenshots/design-prints-list.png', fullPage: true });
        console.log("Screenshot 1 saved");

        const firstCollection = await page.$('a[href^="/dashboard/design/prints/"]');
        if (firstCollection) {
           await Promise.all([
              page.waitForNavigation(),
              firstCollection.click()
           ]);
           await page.waitForTimeout(3000);
           await page.screenshot({ path: '.agent/test-screenshots/design-collection-detail.png', fullPage: true });
           console.log("Screenshot 2 saved");
        } else {
           console.log("Could not find any collections to click. Found no a tags starting with /dashboard/design/prints/");
        }
    } catch(e) {
        console.log("Error during navigation/screenshot:", e);
    }

    await browser.close();
})();
