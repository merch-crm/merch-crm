import { test, expect } from '@playwright/test'

test('детальная отладка входа', async ({ page }) => {
    // Подписка на ошибки консоли
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER EXCEPTION:', err.message));

    await page.goto('/login');
    console.log('Current URL:', page.url());

    await page.locator('input[name="email"]').fill('admin@test.com');
    await page.locator('input[name="password"]').fill('password123');

    console.log('Clicking login button...');
    // Используем селектор по типу, чтобы точно попасть в кнопку отправки
    await page.click('button[type="submit"]');

    // Ждем либо редиректа, либо появления ошибки
    try {
        await page.waitForURL('**/dashboard', { timeout: 5000 });
        console.log('Login successful! URL is now /dashboard');
    } catch (e) {
        console.log('Login failed or timed out. URL is:', page.url());
        const errorText = await page.locator('.text-red-600').innerText().catch(() => 'No error text found');
        console.log('Visible error message:', errorText);

        // Сделаем скриншот для истории (хотя я его не увижу, Playwright сохранит)
        await page.screenshot({ path: 'login-debug.png' });
    }
});
