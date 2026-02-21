import { test, expect } from '@playwright/test'
import { waitForPageLoad } from '../utils/page-helpers';

test.describe('Адаптивность интерфейса', () => {

    test('навигация на мобильном', async ({ page, isMobile }) => {
        await page.goto('/dashboard');
        await waitForPageLoad(page, { expectUrl: /.*dashboard/ });

        if (isMobile) {
            // На мобильном ищем бургер-меню
            const burger = page.locator('[data-testid="mobile-menu-toggle"]').first();

            // ВАЖНО: iPad Pro 11 имеет isMobile: true, но ширину 834px, что больше md (768px).
            // Поэтому бургер может быть скрыт, а десктопное меню - видно.
            // Мы не ждем бургера через waitFor, а проверяем его наличие.
            const isBurgerVisible = await burger.isVisible().catch(() => false);

            if (isBurgerVisible) {
                await burger.click({ force: true });
                // Проверяем что навигация открылась (директория или нав)
                const nav = page.locator('[role="dialog"], [data-state="open"] nav, aside').filter({ visible: true }).first();
                await expect(nav).toBeVisible({ timeout: 10000 });
            } else {
                // Планшет или крупный мобильник с десктопной навигацией
                const desktopNav = page.locator('[data-testid="desktop-navbar"]').first();
                const sidebar = page.locator('[data-testid="sidebar"]').first();

                // Проверяем что хоть какая-то навигация видна
                const navVisible = await desktopNav.isVisible() || await sidebar.isVisible();
                if (!navVisible) {
                    // Если ничего не видно, пробуем подождать десктопную навигацию
                    await expect(desktopNav.or(sidebar).first()).toBeVisible({ timeout: 15000 });
                }
            }
        }
        else {
            // На десктопе навигация должна быть видна сразу
            const nav = page.locator('[data-testid="desktop-navbar"], [data-testid="sidebar"]').first();
            await expect(nav).toBeVisible({ timeout: 15000 });
        }
    });

    test('таблица заказов адаптируется', async ({ page, isMobile }) => {
        await page.goto('/dashboard/orders');
        await waitForPageLoad(page, { expectUrl: /.*orders/ });

        if (isMobile) {
            // На мобильном/планшете проверяем наличие контента
            const mainContent = page.locator('main').first();
            await expect(mainContent).toBeVisible();

            // Ищем или таблицу (на планшетах) или карточки (на мобилках)
            const content = page.locator('main table, main .crm-table, main .crm-card, [data-testid="orders-list"]').first();
            await expect(content).toBeVisible({ timeout: 15000 });
        } else {
            // На десктопе ожидаем таблицу
            const table = page.locator('main table, main .crm-table').first();
            await expect(table).toBeVisible({ timeout: 15000 });
        }
    });

    test('визуальный снимок дашборда', async ({ page }) => {
        await page.goto('/dashboard');
        await waitForPageLoad(page);

        // Даем время на отрисовку графиков и анимаций
        await page.waitForTimeout(3000);

        await expect(page).toHaveScreenshot('dashboard.png', {
            fullPage: true,
            mask: [
                page.locator('[data-testid="chart"]'),
                page.locator('time'),
                page.locator('[data-testid="current-time"]'),
                page.locator('.stat-value'),
            ],
            // Увеличиваем порог для Safari, так как рендеринг шрифтов может чуть отличаться
            maxDiffPixelRatio: 0.05,
        });
    });
});
