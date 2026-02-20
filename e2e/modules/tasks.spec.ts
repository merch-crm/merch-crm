import { test, expect } from '@playwright/test'

test.describe('Модуль Задачи', () => {
    test.beforeEach(async ({ page }) => {
        // Авторизация
        await page.goto('/login')
        await page.getByPlaceholder(/введите логин/i).fill('admin@test.com')
        await page.getByPlaceholder(/введите пароль/i).fill('password123')
        await page.getByRole('button', { name: /войти/i }).click({ force: true })
        await expect(page).toHaveURL('/dashboard')
    })

    test('Отображение канбан-доски', async ({ page }) => {
        await page.goto('/dashboard/tasks')
        await page.waitForLoadState('networkidle')

        // Проверяем наличие заголовка
        await expect(page.locator('main h1, main h2, main .page-header').filter({ hasText: /рабочие процессы/i }).first()).toBeVisible({ timeout: 10000 })

        // Проверяем наличие колонок канбана (To Do, In Progress и тд)
        await expect(page.locator('[data-status], .kanban-column, .task-column').first()).toBeVisible()
    })

    test('Попытка открыть модалку создания задачи', async ({ page }) => {
        await page.goto('/dashboard/tasks')
        await page.waitForLoadState('networkidle')

        // Находим кнопку создания задачи ("Новая задача", "Добавить")
        const createBtn = page.locator('button[title="Создать задачу"]').first()

        if (await createBtn.isVisible()) {
            await createBtn.click()

            // Проверяем, что появилось модальное окно (ищем уникальный текст формы)
            const modalHeader = page.getByText('Что нужно сделать?').first()
            await expect(modalHeader).toBeVisible({ timeout: 5000 })

            // Заполняем поле
            await page.getByPlaceholder(/Например: Закупить материалы/i).fill('Тестовая задача Playwright')

            // Закрываем модалку через Escape
            await page.keyboard.press('Escape')
            await expect(modalHeader).toBeHidden({ timeout: 2000 })
        }
    })
})
