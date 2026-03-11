/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch({ channel: 'chrome' });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'admin@crm.local');
    await page.fill('input[type="password"]', '12345678');
    await Promise.all([
        page.waitForNavigation({ url: '**/dashboard/**', timeout: 5000 }),
        page.click('button[type="submit"]')
    ]).catch(() => { });

    const dir = '.agent/test-screenshots/';
    const shots = [
        ['http://localhost:3000/dashboard/warehouse', 'e2e-warehouse.png'],
        ['http://localhost:3000/dashboard/design/prints', 'e2e-prints-collection.png'],
        ['http://localhost:3000/dashboard/design/prints/0176032b-9448-4449-ad53-e57a1f2672ae', 'e2e-zodiac-designs.png'],
        ['http://localhost:3000/dashboard/clients', 'e2e-clients.png'],
        ['http://localhost:3000/dashboard/orders', 'e2e-orders.png'],
        ['http://localhost:3000/dashboard/orders/74276f80-2d72-434b-ad98-2f23b8933b87', 'e2e-order-detail.png'],
        ['http://localhost:3000/dashboard/production', 'e2e-production.png'],
    ];

    for (const [url, file] of shots) {
        try {
            await page.goto(url, { timeout: 10000 });
            await page.waitForTimeout(3000);
            await page.screenshot({ path: dir + file, fullPage: true });
            console.log('OK:', file);
        } catch (e) {
            console.log('ERR:', file, e.message);
        }
    }

    await browser.close();
    console.log('Done!');
})();
