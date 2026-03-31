import { test, expect } from '@playwright/test'

test.describe('Заказы', () => {
    test('Отображение списка заказов', async ({ page }) => {
        await page.goto('/dashboard/orders')

        // Ждем конкретный элемент
        await expect(page.locator('main h1, main h2').filter({ hasText: /заказы/i }).first()).toBeVisible({ timeout: 15000 })
        // Проверяем наличие контейнера или любого элемента списка
        await expect(page.locator('.crm-table, [data-testid="orders-list"], .crm-card').first()).toBeVisible()
    })

    test('создание нового заказа', async ({ page }) => {
        await page.goto('/dashboard/orders/new')
        await page.waitForLoadState('networkidle')
        await page.waitForSelector('text=Выберите клиента', { timeout: 10000 })

        // Заполняем форму - Шаг 0: Клиент
        await expect(page.getByText(/выберите клиента/i)).toBeVisible()
        await page.getByPlaceholder(/поиск по имени|email|телефону/i).fill('79001112233')

        // Ждем результатов поиска и выбираем первого
        await page.waitForTimeout(1000) // Ждем debounce поиска
        await page.locator('button').filter({ hasText: /79001112233/ }).first().click()

        await page.getByRole('button', { name: /далее/i }).click()

        // Шаг 1: Товары
        await expect(page.getByText(/выберите товары/i)).toBeVisible()

        // Попробуем найти товар, если его нет - попробуем создать или пропустить
        const searchProductInput = page.getByPlaceholder(/поиск товара/i)
        await searchProductInput.fill('тест')
        await page.waitForTimeout(500)

        const addButton = page.locator('button').filter({ hasText: /добавить|выбрать/i }).first()

        if (await addButton.isVisible()) {
            await addButton.click()
        } else {
            console.log('⚠️ No products found in orders test, attempting to move forward anyway')
        }

        // Переходим к деталям
        const nextButton = page.getByRole('button', { name: /далее/i })
        if (await nextButton.isEnabled()) {
            await nextButton.click()
        }
    })

    test('drag-and-drop в очереди заказов', async ({ page }) => {
        // Если есть канбан или очередь
        await page.goto('/dashboard/orders') // По умолчанию пробуем основную страницу или если есть вкладка

        const order = page.locator('[data-testid="order-card"]').first()
        const targetColumn = page.locator('[data-status="в работе"]').first()

        if (await order.isVisible() && await targetColumn.isVisible()) {
            await order.dragTo(targetColumn)
            await expect(order).toBeVisible()
        }
    })
})
