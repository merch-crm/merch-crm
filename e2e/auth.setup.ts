import { test as setup, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const authDir = path.join(__dirname, '../playwright/.auth')
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true })
}
const authFile = path.join(authDir, 'user.json')

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'admin@test.com')
  await page.fill('input[name="password"]', 'testpassword123')
  await page.click('button[type="submit"]')
  
  // Ждём успешной авторизации (переход на дашборд)
  await expect(page).toHaveURL(/\/dashboard/)
  
  // Сохраняем состояние аутентификации
  await page.context().storageState({ path: authFile })
})
