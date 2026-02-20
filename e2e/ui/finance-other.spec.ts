import { test, expect } from '@playwright/test';

test.describe('Finance & Other Modules Pipeline', () => {

    test('Loads /dashboard/finance successfully', async ({ page }) => {
        await page.goto('/dashboard/finance');
        const header = page.locator('h1, h2, .page-header, .grid').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /dashboard/finance/transactions successfully', async ({ page }) => {
        await page.goto('/dashboard/finance/transactions');
        const table = page.locator('h1, h2, .page-header, table, .crm-table').first();
        await table.waitFor({ state: 'visible', timeout: 15000 });
        await expect(table).toBeVisible();
    });

    test('Loads /dashboard/finance/promocodes successfully', async ({ page }) => {
        await page.goto('/dashboard/finance/promocodes');
        const table = page.locator('h1, h2, .page-header, table, .crm-table').first();
        await table.waitFor({ state: 'visible', timeout: 15000 });
        await expect(table).toBeVisible();
    });

    test('Loads /dashboard/finance/sales successfully', async ({ page }) => {
        await page.goto('/dashboard/finance/sales');
        const header = page.locator('h1, h2, .page-header, .grid').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /dashboard/finance/expenses successfully', async ({ page }) => {
        await page.goto('/dashboard/finance/expenses');
        const header = page.locator('h1, h2, .page-header, .grid').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /dashboard/finance/salary successfully', async ({ page }) => {
        await page.goto('/dashboard/finance/salary');
        const header = page.locator('h1, h2, .page-header, .grid').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /dashboard/finance/funds successfully', async ({ page }) => {
        await page.goto('/dashboard/finance/funds');
        const header = page.locator('h1, h2, .page-header, .grid').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /dashboard/finance/pl successfully', async ({ page }) => {
        await page.goto('/dashboard/finance/pl');
        const header = page.locator('h1, h2, .page-header, .grid').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /dashboard/production successfully', async ({ page }) => {
        await page.goto('/dashboard/production');
        const header = page.locator('h1, h2, .page-header').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /dashboard/design successfully', async ({ page }) => {
        await page.goto('/dashboard/design');
        const header = page.locator('h1, h2, .page-header').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /dashboard/tasks successfully', async ({ page }) => {
        await page.goto('/dashboard/tasks');
        const header = page.locator('h1, h2, .page-header').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /dashboard/knowledge-base successfully', async ({ page }) => {
        await page.goto('/dashboard/knowledge-base');
        const header = page.locator('h1, h2, .page-header, .grid').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /dashboard/references successfully', async ({ page }) => {
        await page.goto('/dashboard/references');
        const header = page.locator('h1, h2, .page-header, .grid').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /dashboard/profile successfully', async ({ page }) => {
        await page.goto('/dashboard/profile');
        const form = page.locator('h1, h2, .page-header, form').first();
        await form.waitFor({ state: 'visible', timeout: 15000 });
        await expect(form).toBeVisible();
    });
});
