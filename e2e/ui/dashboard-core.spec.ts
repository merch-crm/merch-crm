import { test, expect } from '@playwright/test';

test.describe('Dashboard Core Pages Pipeline', () => {

    test('Loads /dashboard successfully', async ({ page }) => {
        await page.goto('/dashboard');
        const header = page.locator('h1, h2, .page-header, text=/Добро пожаловать|Главная/i').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /dashboard/clients successfully', async ({ page }) => {
        await page.goto('/dashboard/clients');
        const header = page.locator('h1, h2, .page-header, table, .crm-table').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /dashboard/clients/new successfully', async ({ page }) => {
        await page.goto('/dashboard/clients/new');
        const form = page.locator('h1, h2, form').first();
        await form.waitFor({ state: 'visible', timeout: 15000 });
        await expect(form).toBeVisible();
    });

    test('Loads /dashboard/orders successfully', async ({ page }) => {
        await page.goto('/dashboard/orders');
        const table = page.locator('h1, h2, .page-header, table, .crm-table').first();
        await table.waitFor({ state: 'visible', timeout: 15000 });
        await expect(table).toBeVisible();
    });

    test('Loads /dashboard/orders/new successfully', async ({ page }) => {
        await page.goto('/dashboard/orders/new');
        const form = page.locator('h1, h2, form').first();
        await form.waitFor({ state: 'visible', timeout: 15000 });
        await expect(form).toBeVisible();
    });
});
