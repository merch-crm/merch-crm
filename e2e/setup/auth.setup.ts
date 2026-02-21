import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
    // Навигация на страницу логина
    await page.goto('/login');

    // Ждём загрузки формы
    await page.waitForLoadState('networkidle');

    // Заполнение формы - используем более гибкие селекторы
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="логин" i], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await emailInput.fill('admin@test.com');
    await passwordInput.fill('password123');

    // Клик по кнопке входа
    const submitButton = page.locator('button[type="submit"], button:has-text("Войти")').first();
    await submitButton.click();

    // Ожидание перехода на дашборд с увеличенным таймаутом
    await page.waitForURL('**/dashboard**', { timeout: 30000 });

    // Проверяем что авторизация успешна - ищем элементы авторизованного пользователя
    const authIndicator = page.locator('[data-testid="user-menu"], [data-testid="user-avatar"], nav, aside').first();
    await expect(authIndicator).toBeVisible({ timeout: 15000 });

    // Сохранение состояния сессии
    await page.context().storageState({ path: authFile });

    console.log('✅ Authentication successful, state saved to:', authFile);
});
