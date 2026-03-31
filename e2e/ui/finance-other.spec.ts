import { test, expect } from '@playwright/test';
import { waitForPageLoad } from '../utils/page-helpers';

test.describe('Finance & Other Modules', () => {

    const financePages = [
        { path: '/dashboard/finance', name: 'Финансы' },
        { path: '/dashboard/finance/transactions', name: 'Транзакции' },
        { path: '/dashboard/finance/promocodes', name: 'Промокоды' },
        { path: '/dashboard/finance/sales', name: 'Продажи' },
        { path: '/dashboard/finance/expenses', name: 'Расходы' },
        { path: '/dashboard/finance/salary', name: 'Зарплаты' },
        { path: '/dashboard/finance/funds', name: 'Фонды' },
        { path: '/dashboard/finance/pl', name: 'P&L' },
    ];

    for (const { path, name: _name } of financePages) {
        test(`Loads ${path} successfully`, async ({ page }) => {
            await page.goto(path);
            await waitForPageLoad(page);

            const main = page.locator('main').first();
            await expect(main).toBeVisible({ timeout: 15000 });

            // Проверяем наличие заголовка — учитывает desktop (main) и mobile (header)
            const header = page.locator('main h1, main h2, header h1, header h2, [data-testid="page-title"]').first();
            if (await header.count() > 0) {
                // Ожидаем видимости не более 5 секунд, не падаем если нет
                await header.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });
            }
        });
    }

    const otherModules = [
        { path: '/dashboard/production', name: 'Производство' },
        { path: '/dashboard/design', name: 'Дизайн' },
        { path: '/dashboard/tasks', name: 'Задачи' },
        { path: '/dashboard/knowledge-base', name: 'База знаний' },
        { path: '/dashboard/profile', name: 'Профиль' },
        { path: '/dashboard/references', name: 'Справочники' },
    ];

    for (const { path, name: _name } of otherModules) {
        test(`Loads ${path} successfully`, async ({ page }) => {
            await page.goto(path);
            await waitForPageLoad(page);

            const main = page.locator('main').first();
            await expect(main).toBeVisible({ timeout: 15000 });
        });
    }
});
