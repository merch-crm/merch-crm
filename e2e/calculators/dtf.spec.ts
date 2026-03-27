import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('DTF Calculator Flow', () => {
  test('должен рассчитывать стоимость DTF и сохранять в историю', async ({ page }) => {
    // 1. Перейти на страницу калькулятора DTF
    await page.goto('/dashboard/production/calculators/dtf');
    
    // Ждем загрузки формы
    const quantityInput = page.getByLabel(/количество изделий/i);
    await expect(quantityInput).toBeVisible({ timeout: 15000 });
    
    // 2. Указать количество
    await quantityInput.fill('10');
    
    // 3. Загрузить файл дизайна (используем fixtures)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/test.png'));
    
    // Подождать пока файл загрузится и появится в списке
    await expect(page.getByText('test.png')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/успешно добавлен/i)).toBeVisible({ timeout: 10000 });
    
    // 4. Нажать кнопку расчета
    const calcButton = page.getByRole('button', { name: /рассчитать стоимость/i });
    await expect(calcButton).toBeVisible({ timeout: 10000 });
    await calcButton.click();
    
    // Ждём появления результата расчёта (цена)
    // В UI цена обычно отображается крупно в карточке итога
    await expect(page.getByText(/₽/)).toBeVisible({ timeout: 15000 });
    
    // 5. Сохранить расчет
    const saveButton = page.getByRole('button', { name: /сохранить расчёт/i });
    await expect(saveButton).toBeEnabled({ timeout: 10000 });
    await saveButton.click();
    
    // Ввод названия в модалке сохранения
    const modalNameInput = page.getByLabel(/название расчёта/i).or(page.getByPlaceholder(/название/i));
    await expect(modalNameInput).toBeVisible({ timeout: 10000 });
    await modalNameInput.fill(`E2E DTF Test ${new Date().toISOString()}`);
    
    // Подтвердить сохранение в модалке
    const confirmSave = page.getByRole('button', { name: /сохранить|подтвердить/i }).filter({ hasNotText: /отмена/i }).last();
    await confirmSave.click();
    
    // Проверить успешное сохранение по тосту
    await expect(page.getByText(/успешно сохранён/i)).toBeVisible({ timeout: 15000 });
  });
});
