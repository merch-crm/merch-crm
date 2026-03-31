import { test, expect } from '@playwright/test';
import { expectPageLoaded, waitForPageLoad } from '../utils/page-helpers';

test.describe('Dashboard Core Pages', () => {

    test('Loads /dashboard successfully', async ({ page }) => {
        await page.goto('/dashboard');
        await waitForPageLoad(page, { expectUrl: /.*dashboard/ });

        // Используем более надёжный селектор - ищем в main области
        const welcomeText = page.locator('main').getByText(/Добро пожаловать|Главная/i).first();
        await expect(welcomeText).toBeVisible({ timeout: 15000 });
    });

    test('Loads /dashboard/clients successfully', async ({ page }) => {
        await page.goto('/dashboard/clients');
        await expectPageLoaded(page, { title: /Клиенты/i });

        // Проверяем что есть таблица или список клиентов. 
        // Если база пуста, может быть EmptyState, поэтому ищем и его.
        const content = page.locator('main table, main .crm-table, main [data-testid="clients-list"], main .empty-state').first();
        await expect(content).toBeVisible({ timeout: 15000 });
    });

    test('Loads /dashboard/clients/new successfully', async ({ page }) => {
        await page.goto('/dashboard/clients/new');
        await waitForPageLoad(page, { expectUrl: /.*clients\/new/ });

        // Ищем форму внутри main
        const form = page.locator('main form, main [data-testid="client-form"], main .crm-card').first();
        await expect(form).toBeVisible({ timeout: 15000 });
    });

    test('Loads /dashboard/orders successfully', async ({ page }) => {
        await page.goto('/dashboard/orders');
        await expectPageLoaded(page, { title: /Заказы/i });

        const content = page.locator('main table, main .crm-table, main [data-testid="orders-list"], main .empty-state').first();
        await expect(content).toBeVisible({ timeout: 15000 });
    });

    test('Loads /dashboard/orders/new successfully', async ({ page }) => {
        await page.goto('/dashboard/orders/new');
        await expectPageLoaded(page, { title: /Новый заказ/i });

        // Ищем форму или контейнер заказа, фильтруя только видимые элементы
        const container = page.locator('[data-testid="order-form"], main form, main .crm-card').filter({ visible: true }).first();
        await expect(container).toBeVisible({ timeout: 20000 });
    });
});
