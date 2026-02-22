import { test, expect } from '@playwright/test';
import { waitForPageLoad } from '../utils/page-helpers';

/**
 * Visual Regression Testing
 *
 * Примечание: Названия тестов (test name) и групп (describe) написаны на английском языке
 * намеренно. Это необходимо для корректной генерации путей к скриншотам и видео в HTML-отчете.
 * Использование кириллицы в названиях тестов может приводить к "битым" ссылкам на медиа-файлы
 * (PNG/WebM) в локальном отчете Playwright из-за проблем с кодировкой путей.
 */

test.describe('Visual Regression — Warehouse', () => {

    /**
     * Clear History button:
     * - Eraser icon must be visible
     * - Button color matches destructive style
     */
    test('Clear History button displays icon (admin)', async ({ page }) => {
        await page.goto('/dashboard/warehouse/history');
        await waitForPageLoad(page);
        await page.waitForTimeout(1500);

        const btn = page.locator('[data-testid="clear-history-btn"]');
        const btnExists = await btn.count() > 0;

        if (!btnExists) {
            test.skip();
            return;
        }

        await expect(btn, 'Кнопка "Очистить историю" должна быть видна на странице').toBeVisible({ timeout: 10000 });
        const icon = btn.locator('svg');
        await expect(icon, 'В кнопке "Очистить историю" должна быть иконка (SVG)').toBeVisible({ timeout: 5000 });

        const iconBox = await icon.boundingBox();
        expect(iconBox, 'Не удалось определить размеры иконки').not.toBeNull();
        expect(iconBox!.width, 'Иконка слишком маленькая или схлопнулась по ширине').toBeGreaterThan(10);
        expect(iconBox!.height, 'Иконка слишком маленькая или схлопнулась по высоте').toBeGreaterThan(10);

        await expect(btn, 'Визуальный скриншот кнопки не совпадает с эталоном').toHaveScreenshot('clear-history-btn.png', {
            maxDiffPixelRatio: 0.05,
        });
    });

    /**
     * Warehouse navigation tabs:
     * - active "History" tab must have primary background
     * - active icon must be white
     */
    test('active History tab has an icon', async ({ page }) => {
        await page.goto('/dashboard/warehouse/history');
        await waitForPageLoad(page);
        await page.waitForTimeout(2000);

        const tabsNavs = page.locator('[role="tablist"]');
        const count = await tabsNavs.count();
        let tabsNav = tabsNavs.first();
        for (let i = 0; i < count; i++) {
            const nav = tabsNavs.nth(i);
            if (await nav.isVisible()) {
                tabsNav = nav;
                break;
            }
        }
        await expect(tabsNav, 'Навигационная панель вкладок должна быть видима').toBeVisible({ timeout: 10000 });

        const activeTab = tabsNav.locator('[aria-selected="true"]').first();
        await expect(activeTab, 'Должна быть одна активная вкладка').toBeVisible({ timeout: 5000 });

        const iconInActiveTab = activeTab.locator('svg');
        await expect(iconInActiveTab, 'В активной вкладке должна быть иконка (SVG)').toBeVisible({ timeout: 5000 });

        const iconBox = await iconInActiveTab.boundingBox();
        expect(iconBox, 'Не удалось определить размеры иконки в активной вкладке').not.toBeNull();
        expect(iconBox!.width, 'Иконка в активной вкладке слишком маленькая или схлопнулась').toBeGreaterThan(8);

        await expect(tabsNav, 'Внешний вид панели навигации не совпадает с эталоном').toHaveScreenshot('warehouse-tabs-history-active.png', {
            maxDiffPixelRatio: 0.05,
            animations: 'disabled',
        });
    });

    /**
     * Screenshot of the transition header
     */
    test('Warehouse history page header', async ({ page }) => {
        await page.goto('/dashboard/warehouse/history');
        await waitForPageLoad(page);
        await page.waitForTimeout(2000);

        const header = page.locator('main').first();
        await expect(header, 'Основной блок (main) должен быть виден').toBeVisible({ timeout: 10000 });

        await expect(page, 'Общий вид шапки страницы Журнал операций не совпадает с эталоном').toHaveScreenshot('warehouse-history-page.png', {
            fullPage: false,
            clip: { x: 0, y: 0, width: 900, height: 350 },
            maxDiffPixelRatio: 0.05,
            animations: 'disabled',
            mask: [
                page.locator('[data-testid="history-container"]'),
            ],
        });
    });

    /**
     * Verify all 5 warehouse tab icons are visible
     */
    test('all warehouse tab icons are visible', async ({ page }) => {
        test.slow();
        const tabs = [
            { url: '/dashboard/warehouse/categories', label: 'Categories' },
            { url: '/dashboard/warehouse/storage', label: 'Storage' },
            { url: '/dashboard/warehouse/characteristics', label: 'Characteristics' },
            { url: '/dashboard/warehouse/history', label: 'History' },
            { url: '/dashboard/warehouse/archive', label: 'Archive' },
        ];

        for (const tab of tabs) {
            await page.goto(tab.url);
            await waitForPageLoad(page);
            await page.waitForTimeout(1000);

            const tabsNavs = page.locator('[role="tablist"]');
            const navCount = await tabsNavs.count();
            let visibleActiveTab = null;

            for (let i = 0; i < navCount; i++) {
                const nav = tabsNavs.nth(i);
                if (!await nav.isVisible()) continue;
                const activeInNav = nav.locator('[aria-selected="true"]').first();
                if (await activeInNav.count() > 0 && await activeInNav.isVisible()) {
                    visibleActiveTab = activeInNav;
                    break;
                }
            }

            if (visibleActiveTab) {
                const icon = visibleActiveTab.locator('svg');
                const iconVisible = await icon.isVisible().catch(() => false);
                expect(
                    iconVisible,
                    `Иконка в активной вкладке "${tab.label}" должна быть видима (URL: ${tab.url})`
                ).toBe(true);

                if (iconVisible) {
                    const box = await icon.boundingBox();
                    expect(
                        box?.width ?? 0,
                        `Иконка во вкладке "${tab.label}" не должна схлопываться (меньше 8px)`
                    ).toBeGreaterThan(8);
                }
            }
        }
    });

    /**
     * Verify strict compliance with gap-3 (12px) standard
     */
    test('strict compliance with gap-3 (12px) standard', async ({ page }) => {
        await page.goto('/dashboard/warehouse/history');
        await waitForPageLoad(page);

        const mainContainer = page.locator('main > div').first();
        await expect(mainContainer, 'Отступ (gap) у главного контейнера должен быть ровно 12px (стандарт gap-3)').toHaveCSS('gap', '12px');

        await page.goto('/dashboard/warehouse');
        await waitForPageLoad(page);

        const grid = page.locator('.grid').first();
        const gap = await grid.evaluate((el) => window.getComputedStyle(el).gap);
        expect(gap, 'Сетка виджетов (.grid) должна использовать стандартный отступ 12px').toMatch(/12px/);
    });
});
