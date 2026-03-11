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
    ]).catch(() => console.log('Login bypass'));

    await page.goto('http://localhost:3000/dashboard/clients/new');
    await page.waitForTimeout(2000);
    
    // Fill first step
    await page.fill('input[name="lastName"]', 'Тестовиков');
    await page.fill('input[name="firstName"]', 'Иван');
    await page.click('button:has-text("Далее")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '.agent/test-screenshots/clients-add-step2.png' });

    // Fill second step (assuming contacts)
    const phoneInput = await page.$('input[name="phone"]') || await page.$('input[type="tel"]');
    if (phoneInput) await phoneInput.fill('+79998887766');
    await page.click('button:has-text("Далее")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '.agent/test-screenshots/clients-add-step3.png' });
    
    // Click final submit button
    const submitBtn = await page.$('button:has-text("Сохранить")') || await page.$('button:has-text("Создать")');
    if (submitBtn) {
        await Promise.all([
          page.waitForURL('**/dashboard/clients**', { timeout: 5000 }).catch(() => null),
          submitBtn.click()
        ]);
        await page.waitForTimeout(2000);
        await page.screenshot({ path: '.agent/test-screenshots/clients-list-after.png', fullPage: true });
    }

    await browser.close();
})();
