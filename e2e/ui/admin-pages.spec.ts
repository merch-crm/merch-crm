import { test, expect } from '@playwright/test';

// Use standard UI browser contexts
test.use({ storageState: undefined });

// Reusable login function for setup
async function loginAndGoTo(page: any, url: string) {
    await page.goto('/login');
    await page.getByPlaceholder(/введите логин/i).fill('admin@test.com');
    await page.getByPlaceholder(/введите пароль/i).fill('password123');
    await page.getByRole('button', { name: /войти/i }).click({ force: true });
    await page.waitForURL('/dashboard');
    await page.goto(url);
    await page.waitForLoadState('networkidle');
}

test.describe('Admin Panel Pages Regression Pipeline', () => {

    test('Loads /admin-panel successfully', async ({ page }) => {
        await loginAndGoTo(page, '/admin-panel');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /admin-panel/users successfully', async ({ page }) => {
        await loginAndGoTo(page, '/admin-panel/users');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /admin-panel/roles successfully', async ({ page }) => {
        await loginAndGoTo(page, '/admin-panel/roles');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /admin-panel/departments successfully', async ({ page }) => {
        await loginAndGoTo(page, '/admin-panel/departments');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /admin-panel/monitoring successfully', async ({ page }) => {
        await loginAndGoTo(page, '/admin-panel/monitoring');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /admin-panel/notifications successfully', async ({ page }) => {
        await loginAndGoTo(page, '/admin-panel/notifications');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /admin-panel/storage successfully', async ({ page }) => {
        await loginAndGoTo(page, '/admin-panel/storage');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /admin-panel/branding successfully', async ({ page }) => {
        await loginAndGoTo(page, '/admin-panel/branding');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });
});
