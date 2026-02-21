import { test, expect } from '@playwright/test';
import { expectPageLoaded, waitForPageLoad } from '../utils/page-helpers';

test.describe('Warehouse Pages', () => {

    test('Loads /dashboard/warehouse successfully', async ({ page }) => {
        await page.goto('/dashboard/warehouse');
        await waitForPageLoad(page);
        await expect(page).toHaveURL(/.*warehouse\/(categories|storage)/);
    });

    test('Loads /dashboard/warehouse/items/new successfully', async ({ page }) => {
        await page.goto('/dashboard/warehouse/items/new');
        await waitForPageLoad(page, { expectUrl: /.*items\/new/ });

        const container = page.locator('main .crm-card, main [data-testid="item-form"]').first();
        await expect(container).toBeVisible({ timeout: 15000 });
    });

    test('Loads /dashboard/warehouse/categories successfully', async ({ page }) => {
        await page.goto('/dashboard/warehouse/categories');
        await expectPageLoaded(page, { title: /Склад|Категории/i });

        const content = page.locator('[data-testid="categories-list"], main .crm-grid, main [data-testid="empty-state"], main .crm-card').first();
        await expect(content).toBeVisible({ timeout: 15000 });
    });

    test('Loads /dashboard/warehouse/characteristics successfully', async ({ page }) => {
        await page.goto('/dashboard/warehouse/characteristics');
        await expectPageLoaded(page, { title: /Характеристики|Склад/i });

        const content = page.locator('main').first();
        await expect(content).toBeVisible();
    });

    test('Loads /dashboard/warehouse/storage successfully', async ({ page }) => {
        await page.goto('/dashboard/warehouse/storage');
        await expectPageLoaded(page, { title: /Хранение|Склад/i });

        const content = page.locator('[data-testid="storage-list"], [data-testid="empty-state"], main table, main .crm-table').first();
        await expect(content).toBeVisible({ timeout: 15000 });
    });

    test('Loads /dashboard/warehouse/archive successfully', async ({ page }) => {
        await page.goto('/dashboard/warehouse/archive');
        await expectPageLoaded(page, { title: /Архив|Склад/i });

        const content = page.locator('[data-testid="archive-table"], [data-testid="empty-state"], main table, main .crm-table').first();
        await expect(content).toBeVisible({ timeout: 15000 });
    });

    test('Loads /dashboard/warehouse/history successfully', async ({ page }) => {
        await page.goto('/dashboard/warehouse/history');
        await expectPageLoaded(page, { title: /Журнал операций|История|Склад/i });

        // history-container рендерится всегда (включая placeholder), Safari Safari Safari
        const content = page.locator('[data-testid="history-container"]').first();
        await expect(content).toBeVisible({ timeout: 20000 });
    });
});
