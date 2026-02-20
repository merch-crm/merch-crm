import { test, expect } from '@playwright/test'

test.describe('Адаптивность интерфейса', () => {
    test('навигация на мобильном', async ({ page, isMobile }) => {
        await page.goto('/dashboard')
        // Ждем видимости любого заголовка как признака загрузки
        await page.locator('h1, h2, .page-header').first().waitFor({ state: 'visible', timeout: 15000 });
        await expect(page).toHaveURL('/dashboard')

        if (isMobile) {
            const burger = page.getByRole('button', { name: /меню|toggle menu/i }).first()
            await burger.waitFor({ state: 'visible' });
            await expect(burger).toBeVisible()

            await burger.click()
            await expect(page.getByRole('navigation')).toBeVisible()
        } else {
            const nav = page.getByRole('navigation').first();
            await nav.waitFor({ state: 'visible' });
            await expect(nav).toBeVisible()
        }
    })

    test('таблица заказов адаптируется', async ({ page, isMobile }) => {
        await page.goto('/dashboard/orders')

        // Ожидаем появления контейнера с данными
        const container = page.locator('.crm-table, .crm-card, text=Заказы').first();
        await container.waitFor({ state: 'visible', timeout: 15000 });
        await expect(container).toBeVisible()

        if (isMobile) {
            // На мобильном — карточки. Проверяем наличие текста ID/ORD
            const orderRef = page.locator('text=ORD-').first();
            await orderRef.waitFor({ state: 'visible' });
            await expect(orderRef).toBeVisible()
        } else {
            // На десктопе — таблица. Проверяем наличие заголовка ID / Дата
            const th = page.locator('th').filter({ hasText: /ID|Дата/i }).first();
            await th.waitFor({ state: 'visible' });
            await expect(th).toBeVisible()
        }
    })

    test('визуальный снимок дашборда', async ({ page }) => {
        await page.goto('/dashboard')

        // Ждем отрисовки основного контента
        const header = page.locator('h1, h2, .page-header').first();
        await header.waitFor({ state: 'visible', timeout: 15000 });

        await expect(page).toHaveScreenshot('dashboard.png', {
            fullPage: true,
            mask: [
                page.locator('[data-testid="chart"]'),
                page.locator('text=/\\d{1,2}:\\d{2}/'), // Маскируем время (ЧЧ:ММ)
                page.locator('text=/\\d{1,2} \\w+/'), // Маскируем дату (например "20 февраля")
            ],
        })
    })
})
