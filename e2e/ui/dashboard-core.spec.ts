import { test, expect } from '@playwright/test';

async function loginAndGoTo(page: any, url: string) {
    await page.goto('/login');
    await page.getByPlaceholder(/введите логин/i).fill('admin@test.com');
    await page.getByPlaceholder(/введите пароль/i).fill('password123');
    await page.getByRole('button', { name: /войти/i }).click({ force: true });
    await page.waitForURL('/dashboard');
    await page.goto(url);
    await page.waitForLoadState('networkidle');
}

test.describe('Dashboard Core Pages Pipeline', () => {

    test('Loads /dashboard successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/clients successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/clients');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/clients/new successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/clients/new');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    // Note: We skip `[id]` dynamic routes for exact match unless we inject a known ID. 
    // They are usually covered well enough by their parent listing or will be caught in specific module tests

    test('Loads /dashboard/orders successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/orders');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/orders/new successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/orders/new');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });
});
