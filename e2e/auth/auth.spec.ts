import { test, expect } from '@playwright/test'

test.describe('Авторизация', () => {
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
        await page.locator('input[name="email"]').fill('admin@test.com')
        await page.locator('input[name="password"]').fill('wrongpassword')
        await page.getByRole('button', { name: /войти/i }).click()

        // Проверяем наличие сообщения об ошибке (в CRM оно обычно в блоке с красным текстом)
        await expect(page.locator('text=/пароль|ошибка|неверн/i').first()).toBeVisible()
        await expect(page).toHaveURL('/login')
    })

    test('редирект на логин без авторизации', async ({ page }) => {
        await page.goto('/dashboard')

        await expect(page).toHaveURL(/login/)
    })
})
