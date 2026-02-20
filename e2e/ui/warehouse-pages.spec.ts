import { test, expect } from '@playwright/test';

test.describe('Warehouse Pages Pipeline', () => {

    test('Loads /dashboard/warehouse successfully', async ({ page }) => {
        await page.goto('/dashboard/warehouse');
        const header = page.locator('h1, h2, .page-header, table, .crm-table').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /dashboard/warehouse/items/new successfully', async ({ page }) => {
        await page.goto('/dashboard/warehouse/items/new');
        const form = page.locator('h1, h2, form').first();
        await form.waitFor({ state: 'visible', timeout: 15000 });
        await expect(form).toBeVisible();
    });

    test('Loads /dashboard/warehouse/categories successfully', async ({ page }) => {
        await page.goto('/dashboard/warehouse/categories');
        const header = page.locator('h1, h2, .page-header, .grid').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /dashboard/warehouse/characteristics successfully', async ({ page }) => {
        await page.goto('/dashboard/warehouse/characteristics');
        const header = page.locator('h1, h2, .page-header, .grid').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /dashboard/warehouse/storage successfully', async ({ page }) => {
        await page.goto('/dashboard/warehouse/storage');
        const header = page.locator('h1, h2, .page-header').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /dashboard/warehouse/archive successfully', async ({ page }) => {
        await page.goto('/dashboard/warehouse/archive');
        const header = page.locator('h1, h2, .page-header, table, .crm-table').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /dashboard/warehouse/history successfully', async ({ page }) => {
        await page.goto('/dashboard/warehouse/history');
        const header = page.locator('h1, h2, .page-header, table, .crm-table').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });
});
