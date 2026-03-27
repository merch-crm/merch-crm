// __tests__/integration/services/calculators/calculator-actions.test.ts

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { db } from "@/lib/db";
import { calculationHistory, users, departments, roles } from "@/lib/schema";
import { saveCalculation, getCalculationHistory } from "@/lib/actions/calculators/history";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuccess } from "@/lib/types/common";
import { type CalculationHistoryItem } from "@/lib/types/calculators";

// Мокаем зависимости
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn(),
}));

describe("Calculator Actions Integration", () => {
  let testUserId: string;

  beforeAll(async () => {
    // 0. Очистка старых тестовых данных на случай прерванных тестов
    await db.delete(calculationHistory);
    await db.delete(users).where(eq(users.email, "calc-test@example.com"));
    await db.delete(roles).where(eq(roles.name, "Calc Admin"));
    await db.delete(departments).where(eq(departments.name, "Calc Test Dept"));

    // 1. Создаем департамент
    const [dept] = await db
      .insert(departments)
      .values({ name: "Calc Test Dept" })
      .returning();

    // 2. Создаем роль
    const [role] = await db
      .insert(roles)
      .values({ 
        name: "Calc Admin", 
        departmentId: dept.id, 
        permissions: { all: true } 
      })
      .returning();

    // 3. Создаем тестового пользователя
    const [user] = await db
      .insert(users)
      .values({
        name: "Calc Tester",
        email: "calc-test@example.com",
        roleId: role.id,
        departmentId: dept.id,
      })
      .returning();

    testUserId = user.id;
  });

  afterAll(async () => {
    // Очистка в обратном порядке
    await db.delete(calculationHistory).where(eq(calculationHistory.createdBy, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
    // Роли и департаменты можно оставить или тоже удалить аккуратно
  });

  beforeEach(() => {
    // Настраиваем мок пользователя перед каждым тестом
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: testUserId,
      name: "Calc Tester",
      email: "calc-test@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: true,
      twoFactorEnabled: false,
      banned: false,
    } as unknown as { id: string; name: string; email: string; createdAt: Date; updatedAt: Date; emailVerified: boolean; twoFactorEnabled: boolean | null; banned: boolean | null });
  });

  describe("saveCalculation", () => {
    it("должен сохранять новый расчет в историю", async () => {
      const testData = {
        name: "Тестовый расчет DTF",
        calculatorType: "dtf" as const,
        totalCost: 1000,
        sellingPrice: 1500,
        quantity: 10,
        pricePerItem: 150,
        marginPercent: 50,
        parameters: { foo: "bar" },
        designFiles: [],
      };

      const resultObj = await saveCalculation(testData);
      
      expect(isSuccess(resultObj)).toBe(true);
      if (!isSuccess(resultObj)) return;

      const result = resultObj.data;
      expect(result.id).toBeDefined();
      expect(result.name).toBe(testData.name);
      expect(result.calculationNumber).toMatch(/^CALC-\d{4}-\d{5}$/);

      // Проверяем наличие в базе
      const [saved] = await db
        .select()
        .from(calculationHistory)
        .where(eq(calculationHistory.id, result.id));
      
      expect(saved).toBeDefined();
      expect(Number(saved.totalCost)).toBe(1000);
    });
  });

  describe("getCalculationHistory", () => {
    it("должен возвращать список расчетов пользователя", async () => {
      const historyObj = await getCalculationHistory({ page: 1 });
      
      expect(isSuccess(historyObj)).toBe(true);
      if (!isSuccess(historyObj)) return;

      const history = historyObj.data;
      expect(history.items).toBeDefined();
      expect(history.items!.length).toBeGreaterThan(0);
      expect(history.items[0].createdBy).toBe(testUserId);
      expect(history.pagination.totalCount).toBeGreaterThan(0);
    });

    it("должен правильно фильтровать результаты", async () => {
        // Добавляем еще один расчет другого типа
        await saveCalculation({
            name: "Вышивка Тест",
            calculatorType: "embroidery",
            totalCost: 500,
            sellingPrice: 800,
            quantity: 1,
            pricePerItem: 800,
            marginPercent: 60,
            parameters: {},
            designFiles: [],
        });

        const dtfHistoryObj = await getCalculationHistory({ calculatorType: "dtf" });
        const embroideryHistoryObj = await getCalculationHistory({ calculatorType: "embroidery" });

        expect(isSuccess(dtfHistoryObj)).toBe(true);
        expect(isSuccess(embroideryHistoryObj)).toBe(true);
        
        if (!isSuccess(dtfHistoryObj) || !isSuccess(embroideryHistoryObj)) return;

        const dtfHistory = dtfHistoryObj.data;
        const embroideryHistory = embroideryHistoryObj.data;

        expect(dtfHistory.items.every((i: CalculationHistoryItem) => i.calculatorType === "dtf")).toBe(true);
        expect(embroideryHistory.items.every((i: CalculationHistoryItem) => i.calculatorType === "embroidery")).toBe(true);
    });
  });
});
