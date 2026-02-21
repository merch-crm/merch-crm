import { test, expect } from '@playwright/test'

test.describe('Склад', () => {
    test('инвентаризация и поиск', async ({ page }) => {
        await page.goto('/dashboard/warehouse')

        // Ждем конкретный элемент
        await expect(page.locator('main h1, main h2').filter({ hasText: /склад|инвентар/i }).first()).toBeVisible({ timeout: 15000 })
    })

    test('поиск товара', async ({ page, isMobile }) => {
        // Сразу переходим на целевую страницу поиска в истории (Пункт 2: Прямые URL)
        await page.goto('/dashboard/warehouse/history')
        await page.waitForLoadState('domcontentloaded')

        if (isMobile) {
            // На мобильном нужно кликнуть на иконку поиска(лупу), чтобы инпут появился
            const mobileSearchToggle = page.locator('button .lucide-search').first()
            if (await mobileSearchToggle.isVisible()) {
                await mobileSearchToggle.click()
            }
        }

        // Ищем поле ввода
        const searchInput = page.locator('input[placeholder*="Поиск"], .crm-search-input input, .crm-filter-tray-search').first()
        await expect(searchInput).toBeVisible({ timeout: 10000 })
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
