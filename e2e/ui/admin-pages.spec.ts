import { test, expect } from '@playwright/test';
import { waitForPageLoad } from '../utils/page-helpers';

test.describe('Admin Panel Pages', () => {

    const adminPages = [
        { path: '/admin-panel', name: 'Настройки CRM' },
        { path: '/admin-panel/users', name: 'Пользователи' },
        { path: '/admin-panel/roles', name: 'Роли' },
        { path: '/admin-panel/departments', name: 'Отделы' },
        { path: '/admin-panel/monitoring', name: 'Мониторинг' },
        { path: '/admin-panel/notifications', name: 'Уведомления' },
        { path: '/admin-panel/storage', name: 'Хранилище' },
        { path: '/admin-panel/branding', name: 'Брендинг' },
    ];

    for (const { path, name: _name } of adminPages) {
        test(`Loads ${path} successfully`, async ({ page }) => {
            await page.goto(path);
            await waitForPageLoad(page, { expectUrl: new RegExp(`.*${path.replace('/', '\\/')}`) });

            // Проверяем что main область видна и содержит контент
            const main = page.locator('main').first();
            await expect(main).toBeVisible({ timeout: 15000 });

            // Проверяем заголовок (используем data-testid или h1/h2)
            const header = page.locator('[data-testid="admin-page-header"], main h1, main h2, .page-header h1').first();
            if (await header.count() > 0) {
                await expect(header).toBeVisible();
            }

            // Проверяем что нет ошибок (например 404)
            await expect(page.locator('text=/404|Not Found|Ошибка/i').first()).not.toBeVisible();
        });
    }
});
