import { test, expect } from '@playwright/test'

test.describe('Адаптивность интерфейса', () => {
    test('навигация на мобильном', async ({ page, isMobile }) => {
        await page.goto('/login')
        await page.getByPlaceholder(/введите логин/i).fill('admin@test.com')
        await page.getByPlaceholder(/введите пароль/i).fill('password123')
        await page.getByRole('button', { name: /войти/i }).click({ force: true })
        await expect(page).toHaveURL('/dashboard')

        if (isMobile) {
            const burger = page.getByRole('button', { name: /меню/i }).first()
            await expect(burger).toBeVisible()

            await burger.click()
            await expect(page.getByRole('navigation')).toBeVisible()
        } else {
            await expect(page.getByRole('navigation').first()).toBeVisible()
        }
    })

    test('таблица заказов адаптируется', async ({ page, isMobile }) => {
        // Сначала логин
        await page.goto('/login')
        await page.getByPlaceholder(/введите логин/i).fill('admin@test.com')
        await page.getByPlaceholder(/введите пароль/i).fill('password123')
        await page.getByRole('button', { name: /войти/i }).click({ force: true })
        await expect(page).toHaveURL('/dashboard')

        await page.goto('/dashboard/orders')
        await page.waitForLoadState('networkidle')
        await page.waitForSelector('.crm-table, .crm-card', { timeout: 10000 })

        if (isMobile) {
            // На мобильном — карточки. Проверяем наличие текста ID/ORD
            await expect(page.locator('text=ORD-').first()).toBeVisible()
        } else {
            // На десктопе — таблица. Проверяем наличие заголовка ID / Дата
            await expect(page.locator('th').filter({ hasText: 'ID / Дата' }).first()).toBeVisible()
        }
    })

    test('визуальный снимок дашборда', async ({ page }) => {
        await page.goto('/login')
        await page.getByPlaceholder(/введите логин/i).fill('admin@test.com')
        await page.getByPlaceholder(/введите пароль/i).fill('password123')
        await page.getByRole('button', { name: /войти/i }).click({ force: true })
        await page.waitForURL('/dashboard')

        await page.goto('/dashboard')
        await page.waitForLoadState('networkidle')

        await expect(page).toHaveScreenshot('dashboard.png', {
            fullPage: true,
        })
    })
})
