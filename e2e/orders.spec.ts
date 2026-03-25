/**
 * E2E тесты заказов
 */

import { test, expect } from "@playwright/test";

test.describe("Заказы", () => {
  test.beforeEach(async ({ page }) => {
    // Логинимся перед каждым тестом
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!);
    await page.getByLabel(/пароль/i).fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole("button", { name: /войти/i }).click();
    await page.waitForURL(/dashboard/);
  });

  test("должен отображать список заказов", async ({ page }) => {
    await page.goto("/dashboard/orders");

    await expect(page.getByRole("heading", { name: /заказы/i })).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("должен открывать форму создания заказа", async ({ page }) => {
    await page.goto("/dashboard/orders");

    await page.getByRole("button", { name: /новый заказ/i }).click();

    await expect(page).toHaveURL(/orders\/new/);
    await expect(page.getByText(/выбор клиента/i)).toBeVisible();
  });

  test("должен создавать новый заказ", async ({ page }) => {
    await page.goto("/dashboard/orders/new");

    // Шаг 1: Выбор клиента
    await page.getByPlaceholder(/поиск клиента/i).fill("Иванов");
    await page.getByRole("option").first().click();
    await page.getByRole("button", { name: /далее/i }).click();

    // Шаг 2: Выбор товаров
    await page.getByRole("button", { name: /добавить товар/i }).click();
    await page.getByPlaceholder(/поиск товара/i).fill("Футболка");
    await page.getByRole("option").first().click();
    await page.getByLabel(/количество/i).fill("10");
    await page.getByRole("button", { name: /далее/i }).click();

    // Шаг 3: Детали заказа
    await page.getByRole("button", { name: /далее/i }).click();

    // Шаг 4: Подтверждение
    await page.getByRole("button", { name: /создать заказ/i }).click();

    // Проверяем успешное создание
    await expect(page.getByText(/заказ успешно создан/i)).toBeVisible();
  });

  test("должен фильтровать заказы по статусу", async ({ page }) => {
    await page.goto("/dashboard/orders");

    await page.getByRole("combobox", { name: /статус/i }).click();
    await page.getByRole("option", { name: /в производстве/i }).click();

    // Проверяем что URL обновился
    await expect(page).toHaveURL(/status=production/);
  });
});
