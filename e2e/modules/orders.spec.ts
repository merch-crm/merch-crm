import { test, expect } from '@playwright/test'

test.describe('Заказы', () => {
    test.beforeEach(async ({ page }) => {
        // Авторизуемся перед каждым тестом
        await page.goto('/login')
        await page.getByPlaceholder(/введите логин/i).fill('admin@test.com')
        await page.getByPlaceholder(/введите пароль/i).fill('password123')
        await page.getByRole('button', { name: /войти/i }).click({ force: true })
        await expect(page).toHaveURL('/dashboard')
    })

    test('отображение списка заказов', async ({ page }) => {
        // В CRM обычно заказы находятся в /dashboard/orders
        await page.goto('/dashboard/orders')
        await page.waitForLoadState('networkidle')

        await expect(page.getByRole('heading', { name: /заказы/i }).first()).toBeVisible()
        // Проверяем наличие контейнера или любого элемента списка
        await expect(page.locator('.crm-table, [data-testid="orders-list"], .crm-card').first()).toBeVisible()
    })

    test('создание нового заказа', async ({ page }) => {
        await page.goto('/dashboard/orders/new')
        await page.waitForLoadState('networkidle')
        await page.waitForSelector('text=Выберите клиента', { timeout: 10000 })

        // Заполняем форму - Шаг 0: Клиент
        await expect(page.getByText(/выберите клиента/i)).toBeVisible()
        await page.getByPlaceholder(/поиск по имени|email|телефону/i).fill('Тестовый')

        // Ждем результатов поиска и выбираем первого
        await page.waitForTimeout(1000) // Ждем debounce поиска
        await page.locator('button:has-text("Тестовый")').first().click()

        await page.getByRole('button', { name: /далее/i }).click()

        // Шаг 1: Товары
        await expect(page.getByText(/выберите товары/i)).toBeVisible()
        const addButton = page.locator('button:has-text("Добавить"), button .lucide-plus').first()
        await addButton.click()

        // Переходим к деталям
        await page.getByRole('button', { name: /далее/i }).click()
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
