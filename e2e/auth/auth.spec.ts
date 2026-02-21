import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Авторизация', () => {
    test.beforeEach(async ({ context }) => {
        // Дополнительная принудительная очистка кук для надежности
        await context.clearCookies();
    });

    test('успешный вход', async ({ page }) => {
        await page.goto('/login')

        await page.getByPlaceholder(/введите логин/i).fill('admin@test.com')
        await page.getByPlaceholder(/введите пароль/i).fill('password123')
        await page.getByRole('button', { name: /войти/i }).click({ force: true })

        await expect(page).toHaveURL('/dashboard')
        await expect(page.getByText(/добро пожаловать|dashboard/i).first()).toBeVisible()
    })

    test('ошибка при неверном пароле', async ({ page }) => {
        await page.goto('/login')
        await page.getByPlaceholder(/введите логин/i).fill('admin@test.com')
        await page.getByPlaceholder(/введите пароль/i).fill('wrongpassword')
        await page.getByRole('button', { name: /войти/i }).click({ force: true })

        // Проверяем наличие сообщения об ошибке (в CRM оно обычно в блоке с красным текстом)
        await expect(page.getByText(/неверный email или пароль/i)).toBeVisible({ timeout: 10000 })
        await expect(page).toHaveURL('/login')
    })

    test('редирект на логин без авторизации', async ({ page }) => {
        await page.goto('/dashboard')

        await expect(page).toHaveURL(/login/)
    })
})
