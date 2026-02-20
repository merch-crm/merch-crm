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

test.describe('Finance & Other Modules Pipeline', () => {

    test('Loads /dashboard/finance successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/finance');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/finance/transactions successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/finance/transactions');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/finance/promocodes successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/finance/promocodes');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/finance/sales successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/finance/sales');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/finance/expenses successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/finance/expenses');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/finance/salary successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/finance/salary');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/finance/funds successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/finance/funds');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/finance/pl successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/finance/pl');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/production successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/production');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/design successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/design');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/tasks successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/tasks');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/knowledge-base successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/knowledge-base');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/references successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/references');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });

    test('Loads /dashboard/profile successfully', async ({ page }) => {
        await loginAndGoTo(page, '/dashboard/profile');
        await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    });
});
