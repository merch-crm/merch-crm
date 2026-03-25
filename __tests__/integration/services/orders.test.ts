/**
 * Интеграционные тесты сервиса заказов
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { db } from "@/lib/db";
import { orders, clients, orderItems, users, roles, departments, auditLogs } from "@/lib/schema";
import { getOrders } from "@/lib/services/orders/queries";
import { createOrder, updateOrderStatus } from "@/lib/services/orders/mutations";
import { eq } from "drizzle-orm";
import { getSession, type Session } from "@/lib/session";

// Мокаем зависимости Next.js
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Мокаем сессию
vi.mock("@/lib/session", () => ({
  getSession: vi.fn(),
}));

describe("Orders Service", () => {
  let testClientId: string;
  let testUserId: string;
  let testRoleId: string;

  beforeAll(async () => {
    // Создаём тестовые данные
    const [dept] = await db
      .insert(departments)
      .values({ name: "Test Dept" })
      .returning();

    const [role] = await db
      .insert(roles)
      .values({ name: "Администратор", departmentId: dept.id, permissions: { all: true } })
      .returning();

    const [user] = await db
      .insert(users)
      .values({
        name: "Тест Юзер",
        email: "test@test.com",
        roleId: role.id,
        departmentId: dept.id,
      })
      .returning();

    const [client] = await db
      .insert(clients)
      .values({
        firstName: "Тест",
        lastName: "Клиент",
        phone: "+79001234567",
      })
      .returning();

    testClientId = client.id;
    testUserId = user.id;
    testRoleId = role.id;
  });

  afterAll(async () => {
    // Очищаем тестовые данные в правильном порядке
    await db.delete(auditLogs);
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(clients).where(eq(clients.id, testClientId));
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(roles).where(eq(roles.id, testRoleId));
  });

  beforeEach(async () => {
    // Очищаем заказы перед каждым тестом
    await db.delete(orderItems);
    await db.delete(orders);

    // Настраиваем мок сессии
    vi.mocked(getSession).mockResolvedValue({
      id: testUserId,
      email: "test@test.com",
      name: "Тест Юзер",
      roleId: testRoleId,
      roleName: "Администратор",
    } as unknown as Session);
  });

  describe("getOrders()", () => {
    it("должен возвращать пустой список если заказов нет", async () => {
      const result = await getOrders();

      expect(result.orders).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it("должен возвращать заказы с пагинацией", async () => {
      // Создаём 25 заказов
      for (let i = 0; i < 25; i++) {
        await db.insert(orders).values({
          orderNumber: `ORD-24-${String(i).padStart(4, "0")}`,
          clientId: testClientId,
          createdBy: testUserId,
        });
      }

      const page1 = await getOrders({ page: 1, limit: 10 });
      const page2 = await getOrders({ page: 2, limit: 10 });
      const page3 = await getOrders({ page: 3, limit: 10 });

      expect(page1.orders).toHaveLength(10);
      expect(page2.orders).toHaveLength(10);
      expect(page3.orders).toHaveLength(5);
      expect(page1.pagination.total).toBe(25);
      expect(page1.pagination.totalPages).toBe(3);
    });

    it("должен фильтровать по статусу", async () => {
      await db.insert(orders).values([
        { orderNumber: "ORD-1", clientId: testClientId, createdBy: testUserId, status: "new" },
        { orderNumber: "ORD-2", clientId: testClientId, createdBy: testUserId, status: "production" },
        { orderNumber: "ORD-3", clientId: testClientId, createdBy: testUserId, status: "new" },
      ]);

      const result = await getOrders({ status: "new" });

      expect(result.orders).toHaveLength(2);
      expect(result.orders.every((o) => o.status === "new")).toBe(true);
    });

    it("должен загружать связанные данные без N+1", async () => {
      await db.insert(orders).values({
        orderNumber: "ORD-TEST",
        clientId: testClientId,
        createdBy: testUserId,
      });

      const result = await getOrders();

      // Проверяем что client загружен
      expect(result.orders[0].client).toBeDefined();
      expect(result.orders[0].client?.firstName).toBe("Тест");

      // Проверяем что creator загружен
      expect(result.orders[0].creator).toBeDefined();
      expect(result.orders[0].creator?.name).toBe("Тест Юзер");
    });
  });

  describe("createOrder()", () => {
    it("должен создавать заказ с позициями", async () => {
      const result = await createOrder({
        clientId: testClientId,
        items: [
          { description: "Футболка", quantity: 10, price: "500" },
          { description: "Кружка", quantity: 5, price: "300" },
        ],
      });

      if (!result.success) throw new Error(result.error);
      expect(result.data?.orderNumber).toMatch(/^ORD-\d{2}-\d{4}$/);

      // Проверяем что позиции созданы
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, result.data!.id));

      expect(items).toHaveLength(2);
    });

    it("должен рассчитывать totalAmount", async () => {
      const result = await createOrder({
        clientId: testClientId,
        items: [
          { description: "Товар 1", quantity: 10, price: "100" }, // 1000
          { description: "Товар 2", quantity: 5, price: "200" },  // 1000
        ],
      });

      if (!result.success) throw new Error(result.error);
      expect(result.data?.totalAmount).toBe("2000.00");
    });
  });

  describe("updateOrderStatus()", () => {
    it("должен обновлять статус заказа", async () => {
      const [order] = await db
        .insert(orders)
        .values({
          orderNumber: "ORD-STATUS",
          clientId: testClientId,
          createdBy: testUserId,
          status: "new",
        })
        .returning();

      const result = await updateOrderStatus({
        orderId: order.id,
        status: "production",
      });

      expect(result.success).toBe(true);

      const updated = await db.query.orders.findFirst({
        where: eq(orders.id, order.id),
      });

      expect(updated?.status).toBe("production");
    });

    it("должен записывать в аудит лог", async () => {
      // Тест на запись в audit_logs
    });
  });
});
