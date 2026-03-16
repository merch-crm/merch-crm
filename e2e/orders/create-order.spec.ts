import { test, expect } from '@playwright/test'

test.describe('Создание заказа', () => {
  test('создание заказа с минимальными данными', async ({ page }) => {
    await page.goto('/dashboard/orders/new')
    
    // Выбираем клиента (предполагаем наличие селекта с поиском)
    await page.click('button:has-text("Выберите клиента")')
    await page.fill('input[placeholder*="Поиск"]', 'Иванов')
    // Ждём появления результата и кликаем
    await page.click('text=Иванов Иван')
    
    // Добавляем позицию
    await page.click('text=Добавить позицию')
    await page.fill('input[name="items.0.description"]', 'Футболка белая XL')
    await page.fill('input[name="items.0.quantity"]', '10')
    await page.fill('input[name="items.0.price"]', '500')
    
    // Отправляем форму
    await page.click('button[type="submit"]')
    
    // Проверяем редирект на страницу заказа
    await expect(page).toHaveURL(/\/dashboard\/orders\/[a-f0-9-]+/)
    
    // Проверяем данные заказа в UI
    await expect(page.locator('text=5 000')).toBeVisible()
  })
})
