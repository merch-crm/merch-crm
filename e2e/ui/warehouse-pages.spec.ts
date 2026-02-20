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

test.describe('Warehouse Pages Pipeline', () => {

    test('Loads /dashboard/warehouse successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/warehouse');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/warehouse/new successfully', async ({ page }) => {
        // Checking for a dynamic segment base or a creation route if it exists, fallback to list if redirected
        await loginAndGoTo(page, '/dashboard/warehouse/new');
        // It might redirect or show a form
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/warehouse/items/new successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/warehouse/items/new');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/warehouse/categories successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/warehouse/categories');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/warehouse/characteristics successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/warehouse/characteristics');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/warehouse/storage successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/warehouse/storage');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/warehouse/archive successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/warehouse/archive');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/warehouse/history successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/warehouse/history');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });
});
