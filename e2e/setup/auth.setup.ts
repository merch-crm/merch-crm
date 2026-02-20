import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
    // Навигация на страницу логина
    await page.goto('/login');

    // Заполнение формы
    await page.getByPlaceholder(/введите логин/i).fill('admin@test.com');
    await page.getByPlaceholder(/введите пароль/i).fill('password123');

    // Клик по кнопке входа
    await page.getByRole('button', { name: /войти/i }).click();

    // Ожидание перехода на дашборд
    await page.waitForURL('/dashboard', { timeout: 15000 });

    // Дополнительная проверка, что мы действительно вошли
    await expect(page.locator('text=/Добро пожаловать/i').first()).toBeVisible();

    // Сохранение состояния сессии (куки, localStorage)
    await page.context().storageState({ path: authFile });
});
