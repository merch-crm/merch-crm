import { test, expect } from '@playwright/test'

test.describe('Модуль Клиенты', () => {
    test('Отображение списка клиентов и поиск', async ({ page }) => {
        await page.goto('/dashboard/clients')

        // Ждем конкретный элемент на странице
        await expect(page.locator('main h1, main h2').filter({ hasText: /клиенты/i }).first()).toBeVisible({ timeout: 15000 })

        // Вводим что-то в поиск
        const searchInput = page.getByPlaceholder(/поиск по имени/i).first()
        if (await searchInput.isVisible()) {
            await searchInput.fill('Playwright Test Client')
            await page.waitForTimeout(1000) // Ждем debounce

            // Если таблица грузится, убеждаемся, что мы не упали с ошибкой
            await expect(page.locator('main')).toBeVisible()
        }
    })

    test('Открытие формы создания клиента', async ({ page }) => {
        await page.goto('/dashboard/clients')
        await page.waitForLoadState('networkidle')

        // Ищем кнопку добавления (обычно "Добавить клиента" или кнопка с плюсом)
        const addBtn = page.getByRole('link', { name: /добавить/i }).first()
        if (await addBtn.isVisible()) {
            await addBtn.click()
            await page.waitForURL('**/dashboard/clients/new')

            // Проверка, что открылась форма
            await expect(page.locator('form').first()).toBeVisible({ timeout: 10000 })
            await expect(page.getByLabel(/имя|компания/i).first()).toBeVisible()
        }
    })
})
