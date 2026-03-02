import { test, expect } from '@playwright/test';

test.describe('Характеристики склада', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to characteristics page. Adjust the exact URL to match the tab mapping
        await page.goto('/dashboard/warehouse?tab=attributes');
        // Wait for characteristic elements to load
        await page.waitForLoadState('networkidle');
    });

    test('Создание, редактирование и удаление динамической характеристики', async ({ page }) => {
        // Unique identifier for dynamic test characteristic
        const uniqueId = Date.now().toString();
        const charName = `TestChar_${uniqueId}`;
        const valName = `TestVal_${uniqueId}`;

        // 1. Create a new characteristic
        const addBtn = page.getByRole('button', { name: /Новая характеристика/i });
        await expect(addBtn).toBeVisible({ timeout: 10000 });
        await addBtn.click();

        // Ensure modal is open 
        const characteristicModal = page.locator('div[role="dialog"]');
        await expect(characteristicModal).toBeVisible();

        // Fill form
        await page.getByPlaceholder('Напр: Ткань, Плотность, Цвет').fill(charName);

        // Select 'Text' (Общая) type for simplicity, or any other type like 'Габариты'
        // Using visible text click on select option if necessary. But 'Общая' is default.

        await page.getByRole('button', { name: /Создать/i, exact: false }).click();

        // Wait for success toast (creation)
        const toast = page.locator('.Toastify__toast--success, [data-sonner-toast]');
        await expect(toast).toContainText(/создан/i, { timeout: 10000 });
        // wait for modal to close
        await expect(characteristicModal).toBeHidden();

        // 2. Refresh / reload attributes list to ensure it's available and visible
        // Usually NextJS auto-refreshes, but in e2e we sometimes need to make sure we find it
        const newCharCard = page.locator('.crm-card').filter({ hasText: charName });
        await expect(newCharCard).toBeVisible({ timeout: 10000 });

        // Open the created characteristic configuration (Edit Type Dialog)
        await newCharCard.click();

        // Ensure Edit Type Modal is open
        const editModal = page.locator('div[role="dialog"]').filter({ hasText: 'Настройка раздела' });
        await expect(editModal).toBeVisible();

        // Verify the title holds our name
        await expect(editModal.getByRole('heading', { level: 2 }).first()).toContainText(charName);

        // 3. Add a value to the characteristic
        const addValueBtn = editModal.getByRole('button', { name: /Добавить значение/i });
        await addValueBtn.click();

        // Now ValueForm should be open (usually right column or separate modal)
        // Fill the new value name
        await page.getByPlaceholder(/Введите название/i).fill(valName);

        // Save value
        await page.getByRole('button', { name: /Сохранить значение/i, exact: false }).click();

        // Wait for success
        const valToast = page.locator('.Toastify__toast--success, [data-sonner-toast]').last();
        await expect(valToast).toContainText(/успешно/i, { timeout: 10000 });

        // Ensure the value appeared in the list
        await expect(editModal.locator('div[role="button"]').filter({ hasText: valName }).first()).toBeVisible();

        // 4. Cleanup: Delete the value and characteristic
        // First delete the section entirely: click 'Удалить раздел'
        const deleteTypeBtn = editModal.getByRole('button', { name: /Удалить раздел/i });
        await deleteTypeBtn.click();

        // Confirm deletion in alert dialog, type 'УДАЛИТЬ'
        const deleteConfirmDialog = page.locator('div[role="alertdialog"]');
        await expect(deleteConfirmDialog).toBeVisible();
        await deleteConfirmDialog.getByPlaceholder('УДАЛИТЬ').fill('УДАЛИТЬ');
        await deleteConfirmDialog.getByRole('button', { name: /Подтвердить удаление/i, exact: false }).click();

        // Wait for deletion success toast
        const deleteToast = page.locator('.Toastify__toast--success, [data-sonner-toast]').last();
        await expect(deleteToast).toContainText(/удален/i, { timeout: 10000 });

        // Ensure the characteristic is no longer visible on the page
        await expect(newCharCard).toBeHidden({ timeout: 10000 });
    });
});
