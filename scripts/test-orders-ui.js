/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch({ channel: 'chrome' }); 
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'admin@crm.local');
    await page.fill('input[type="password"]', '12345678');
    
    await Promise.all([
      page.waitForNavigation({ url: '**/dashboard/**', timeout: 5000 }),
      page.click('button[type="submit"]')
    ]).catch(() => console.log('Login bypass or already authed'));

    // Go to Orders List
    await page.goto('http://localhost:3000/dashboard/orders');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '.agent/test-screenshots/orders-list.png', fullPage: true });

    // Click Add Order link
    const addLink = await page.$('a:has-text("Новый заказ")') || await page.$('a:has-text("Добавить")') || await page.$('a[href="/dashboard/orders/new"]');
    if (addLink) {
       await Promise.all([
          page.waitForNavigation(),
          addLink.click()
       ]);
       await page.waitForTimeout(3000);
       await page.screenshot({ path: '.agent/test-screenshots/orders-add-form.png', fullPage: true });
    } else {
       console.log("Could not find add order link");
       // Try direct navigation just in case
       await page.goto('http://localhost:3000/dashboard/orders/new');
       await page.waitForTimeout(3000);
       await page.screenshot({ path: '.agent/test-screenshots/orders-add-form.png', fullPage: true });
    }

    await browser.close();
})();
