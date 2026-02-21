import { test, expect } from '@playwright/test';
import { waitForPageLoad } from '../utils/page-helpers';

/**
 * Визуальные тесты (Visual Regression Testing)
 *
 * Эти тесты делают попиксельное сравнение скриншотов, чтобы поймать
 * визуальные баги, которые обычный .toBeVisible() не обнаружит:
 * - пропавшие иконки
 * - неправильные цвета
 * - съехавшие элементы
 * - пустые кнопки без контента
 */

test.describe('Visual Regression — Склад', () => {

    /**
     * Проверяет кнопку "Очистить историю":
     * - иконка Eraser должна быть видна внутри кнопки
     * - цвет кнопки должен соответствовать destructive стилю
     */
    test('кнопка Очистить историю отображает иконку (admin)', async ({ page }) => {
        await page.goto('/dashboard/warehouse/history');
        await waitForPageLoad(page);

        // Ждём полной отрисовки layout
        await page.waitForTimeout(1500);

        const btn = page.locator('[data-testid="clear-history-btn"]');
        const btnExists = await btn.count() > 0;

        if (!btnExists) {
            // Кнопка видна только администраторам — тест пропускается для других ролей
            test.skip();
            return;
        }

        await expect(btn).toBeVisible({ timeout: 10000 });

        // Проверяем что внутри кнопки есть SVG иконка
        const icon = btn.locator('svg');
        await expect(icon).toBeVisible({ timeout: 5000 });

        // Проверяем что иконка имеет реальный размер (не схлопнулась)
        const iconBox = await icon.boundingBox();
        expect(iconBox).not.toBeNull();
        expect(iconBox!.width).toBeGreaterThan(10);
        expect(iconBox!.height).toBeGreaterThan(10);

        // Делаем скриншот кнопки для визуального контроля
        await expect(btn).toHaveScreenshot('clear-history-btn.png', {
            maxDiffPixelRatio: 0.05,
        });
    });

    /**
     * Проверяет навигационные вкладки склада:
     * - активная вкладка "История" должна иметь фиолетовый фон
     * - иконка активной вкладки должна быть белой (не серой)
     */
    test('активная вкладка История имеет иконку', async ({ page }) => {
        await page.goto('/dashboard/warehouse/history');
        await waitForPageLoad(page);

        // Ждём отрисовки анимации tabs
        await page.waitForTimeout(2000);

        // Берём первый ВИДИМЫЙ tablist (на Desktop первый [role=tablist] — мобильный, sm:hidden)
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
        await expect(tabsNav).toBeVisible({ timeout: 10000 });

        // Активная вкладка
        const activeTab = tabsNav.locator('[aria-selected="true"]').first();
        await expect(activeTab).toBeVisible({ timeout: 5000 });

        // Проверяем что внутри активной вкладки есть SVG иконка
        const iconInActiveTab = activeTab.locator('svg');
        await expect(iconInActiveTab).toBeVisible({ timeout: 5000 });

        const iconBox = await iconInActiveTab.boundingBox();
        expect(iconBox).not.toBeNull();
        expect(iconBox!.width).toBeGreaterThan(8);

        // Скриншот видимой панели навигации
        await expect(tabsNav).toHaveScreenshot('warehouse-tabs-history-active.png', {
            maxDiffPixelRatio: 0.05,
            animations: 'disabled',
        });
    });

    /**
     * Скриншот всего header страницы Журнал операций
     * (заголовок + кнопки действий + вкладки)
     */
    test('шапка страницы Журнал операций', async ({ page }) => {
        await page.goto('/dashboard/warehouse/history');
        await waitForPageLoad(page);

        await page.waitForTimeout(2000);

        // Скриншот всего верхнего блока
        const header = page.locator('main').first();
        await expect(header).toBeVisible({ timeout: 10000 });

        await expect(page).toHaveScreenshot('warehouse-history-page.png', {
            fullPage: false,
            clip: { x: 0, y: 0, width: 900, height: 350 },
            maxDiffPixelRatio: 0.05,
            animations: 'disabled',
            mask: [
                // Маскируем динамический контент
                page.locator('[data-testid="history-container"]'),
            ],
        });
    });

    /**
     * Проверяет что иконки активных вкладок НЕ схлопываются в flex-контейнере.
     * Тестирует все 5 вкладок склада по очереди.
     */
    test('иконки всех вкладок склада видимы', async ({ page }) => {
        const tabs = [
            { url: '/dashboard/warehouse/categories', label: 'Категории' },
            { url: '/dashboard/warehouse/storage', label: 'Хранение' },
            { url: '/dashboard/warehouse/characteristics', label: 'Характеристики' },
            { url: '/dashboard/warehouse/history', label: 'История' },
            { url: '/dashboard/warehouse/archive', label: 'Архив' },
        ];

        for (const tab of tabs) {
            await page.goto(tab.url);
            await waitForPageLoad(page);
            await page.waitForTimeout(1000);

            // Находим первый ВИДИМЫЙ tablist (мобильный nav может быть скрыт на Desktop)
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
                    `Иконка в активной вкладке "${tab.label}" должна быть видима`
                ).toBe(true);

                if (iconVisible) {
                    const box = await icon.boundingBox();
                    expect(
                        box?.width ?? 0,
                        `Иконка в вкладке "${tab.label}" не должна схлопываться`
                    ).toBeGreaterThan(8);
                }
            }
        }
    });
});
