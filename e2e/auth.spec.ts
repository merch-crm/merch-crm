/**
 * E2E тесты авторизации
 */

import { test, expect } from "@playwright/test";

test.describe("Авторизация", () => {
  test("должен показывать форму входа", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /вход/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/пароль/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /войти/i })).toBeVisible();
  });

  test("должен показывать ошибку при неверных данных", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/email/i).fill("wrong@example.com");
    await page.getByLabel(/пароль/i).fill("wrongpassword");
    await page.getByRole("button", { name: /войти/i }).click();

    await expect(page.getByText(/неверный email или пароль/i)).toBeVisible();
  });

  test("должен перенаправлять на дашборд после входа", async ({ page }) => {
    await page.goto("/login");

    // Используем тестовые credentials
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!);
    await page.getByLabel(/пароль/i).fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole("button", { name: /войти/i }).click();

    await expect(page).toHaveURL(/dashboard/);
  });
});
