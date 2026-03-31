import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Авторизация', () => {
    test.beforeEach(async ({ context }) => {
        // Дополнительная принудительная очистка кук для надежности
        await context.clearCookies();
    });

    test('успешный вход', async ({ page }) => {
        await page.goto('/login')
        // Ждем пока исчезнут скелетоны брендинга (если они есть)
        await page.locator('.animate-pulse').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => { });

        await page.getByPlaceholder(/введите логин/i).fill('admin@test.com')
        await page.getByPlaceholder(/введите пароль/i).fill('password123')
        await page.getByRole('button', { name: /войти/i }).click()

        await expect(page).toHaveURL('/dashboard')
        await expect(page.getByText(/добро пожаловать|dashboard/i).first()).toBeVisible()
    })

    test('ошибка при неверном пароле', async ({ page }) => {
        await page.goto('/login')
        await page.getByPlaceholder(/введите логин/i).fill('admin@test.com')
        await page.getByPlaceholder(/введите пароль/i).fill('wrongpassword')
        await page.getByRole('button', { name: /войти/i }).click()

        // Проверяем наличие сообщения об ошибке
        await expect(page.getByText('Неверный email или пароль')).toBeVisible({ timeout: 20000 });
        await expect(page).toHaveURL(/login/)
    })

    test('редирект на логин без авторизации', async ({ page }) => {
        await page.goto('/dashboard')

        await expect(page).toHaveURL(/login/)
    })
})
