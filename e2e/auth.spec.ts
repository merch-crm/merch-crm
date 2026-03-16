import { test, expect } from '@playwright/test'

test.describe('Авторизация', () => {
  test('успешный вход в систему', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'testpassword123')
    await page.click('button[type="submit"]')
    
    // Ожидаем редирект на дашборд
    await expect(page).toHaveURL(/\/dashboard/)
    
    // Проверяем наличие меню пользователя
    await expect(page.locator('button:has-text("Администратор")')).toBeVisible()
  })

  test('ошибка при неверном пароле', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Остаёмся на странице входа
    await expect(page).toHaveURL(/\/login/)
    
    // Отображается ошибка (используем текст из sonner или сообщения об ошибке)
    await expect(page.locator('text=/неверный|ошибка|пароль/i')).toBeVisible()
  })
})
