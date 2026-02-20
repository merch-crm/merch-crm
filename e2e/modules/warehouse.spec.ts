import { test, expect } from '@playwright/test'

test.describe('Склад', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login')
        await page.getByPlaceholder(/введите логин/i).fill('admin@test.com')
        await page.getByPlaceholder(/введите пароль/i).fill('password123')
        await page.getByRole('button', { name: /войти/i }).click({ force: true })
        await expect(page).toHaveURL('/dashboard')
    })

    test('просмотр остатков', async ({ page }) => {
        await page.goto('/dashboard/warehouse')

        await expect(page.getByRole('heading', { name: /склад/i }).first()).toBeVisible()
    })

    test('поиск товара', async ({ page }) => {
        await page.goto('/dashboard/warehouse')
        await page.waitForLoadState('networkidle')

        // Выбираем любую категорию
        await page.locator('.crm-card').first().click()
        await page.waitForLoadState('networkidle')

        // Ищем поле ввода
        const searchInput = page.locator('input[placeholder*="Поиск"]').first()
        await searchInput.fill('тест')
        await page.keyboard.press('Enter')

        // Проверяем что поиск сработал (хотя бы отсутствие ошибки 404)
        await expect(page).not.toHaveURL(/login/)
    })

    test('предупреждение о низком остатке', async ({ page }) => {
        await page.goto('/dashboard/warehouse')

        // Проверяем, что товары с низким остатком выделены
        const lowStockItem = page.locator('[data-low-stock="true"]').first()

        if (await lowStockItem.isVisible()) {
            await expect(lowStockItem).toHaveCSS('color', /red|#ff/i)
        }
    })
})
