import { test, expect } from '@playwright/test';

test.describe('Admin Panel Pages Regression Pipeline', () => {

    test('Loads /admin-panel successfully', async ({ page }) => {
        await page.goto('/admin-panel');
        const header = page.locator('h1, h2, .page-header').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /admin-panel/users successfully', async ({ page }) => {
        await page.goto('/admin-panel/users');
        const header = page.locator('h1, h2, .page-header').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /admin-panel/roles successfully', async ({ page }) => {
        await page.goto('/admin-panel/roles');
        const header = page.locator('h1, h2, .page-header').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /admin-panel/departments successfully', async ({ page }) => {
        await page.goto('/admin-panel/departments');
        const header = page.locator('h1, h2, .page-header').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /admin-panel/monitoring successfully', async ({ page }) => {
        await page.goto('/admin-panel/monitoring');
        const header = page.locator('h1, h2, .page-header').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /admin-panel/notifications successfully', async ({ page }) => {
        await page.goto('/admin-panel/notifications');
        const header = page.locator('h1, h2, .page-header').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /admin-panel/storage successfully', async ({ page }) => {
        await page.goto('/admin-panel/storage');
        const header = page.locator('h1, h2, .page-header').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });

    test('Loads /admin-panel/branding successfully', async ({ page }) => {
        await page.goto('/admin-panel/branding');
        const header = page.locator('h1, h2, .page-header').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });
        await expect(header).toBeVisible();
    });
});
