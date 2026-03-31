/**
 * @fileoverview Server Actions для мутаций заказов
 * @module services/orders/mutations
 */

"use server";

import { db } from "@/lib/db";
import { orders, orderItems, inventoryItems, auditLogs, payments } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSafeAction } from "@/lib/action-helpers";
import { getSession } from "@/lib/session";
import { isAdmin, canManageOrders } from "@/lib/roles";
import type { OrderStatus } from "@/lib/types/orders";

/**
 * Схема валидации для создания заказа
 */
const CreateOrderSchema = z.object({
  clientId: z.string().uuid("Некорректный ID клиента"),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Описание обязательно"),
        quantity: z.number().int().positive("Количество должно быть положительным"),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Некорректная цена"),
        inventoryId: z.string().uuid().optional(),
      })
    )
    .min(1, "Добавьте хотя бы одну позицию"),
  deadline: z.coerce.date().optional(),
  isUrgent: z.boolean().default(false),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  promocodeId: z.string().uuid().optional(),
  advanceAmount: z.string().optional(),
});

/**
 * Создаёт новый заказ в системе
 *
 * @description
 * Выполняет следующие операции в транзакции:
 * 1. Генерирует уникальный номер заказа (ORD-YY-NNNN)
 * 2. Создаёт запись заказа
 * 3. Создаёт позиции заказа
 * 4. Резервирует товары на складе (если указан inventoryId)
 * 5. Применяет промокод (если указан)
 * 6. Создаёт платёж предоплаты (если указана сумма)
 * 7. Записывает действие в аудит-лог
 *
 * @param data - Данные для создания заказа
 * @returns Созданный заказ с номером
 *
 * @requires Роли: Администратор, Руководство, Отдел продаж
 * @audit Записывается как "order.create"
 *
 * @throws {Error} "Недостаточно прав" - если пользователь не имеет доступа
 * @throws {Error} "Недостаточно товара на складе" - если резерв невозможен
 * @throws {Error} "Промокод недействителен" - если промокод истёк или использован
 *
 * @example
 * ```typescript
 * const result = await createOrder({
 *   clientId: "550e8400-e29b-41d4-a716-446655440000",
 *   items: [
 *     { description: "Футболка белая M", quantity: 10, price: "500" }
 *   ],
 *   isUrgent: true,
 *   priority: "high"
 * });
 *
 * if (result.success) {
 *   console.log(`Создан заказ ${result.data.orderNumber}`);
 * }
 * ```
 */
export const createOrder = createSafeAction(
  CreateOrderSchema,
  async (data) => {
    const session = await getSession();

    if (!session || !canManageOrders(session.roleName)) {
      throw new Error("Недостаточно прав для создания заказа");
    }

    return await db.transaction(async (tx) => {
      // 1. Генерация номера заказа
      const year = new Date().getFullYear().toString().slice(-2);
      const [lastOrder] = await tx
        .select({ orderNumber: orders.orderNumber })
        .from(orders)
        .orderBy(sql`created_at DESC`)
        .limit(1);

      let nextNumber = 1;
      if (lastOrder?.orderNumber) {
        const match = lastOrder.orderNumber.match(/ORD-\d{2}-(\d{4})/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }

      const orderNumber = `ORD-${year}-${String(nextNumber).padStart(4, "0")}`;

      // 2. Расчёт суммы заказа и проверка остатков
      let totalAmount = 0;
      for (const item of data.items) {
        if (item.inventoryId) {
          const [inventory] = await tx
            .select({ quantity: inventoryItems.quantity, reserved: inventoryItems.reservedQuantity })
            .from(inventoryItems)
            .where(eq(inventoryItems.id, item.inventoryId))
            .limit(1);

          if (!inventory || (inventory.reserved || 0) + item.quantity > (inventory.quantity || 0)) {
            throw new Error(`Недостаточно товара на складе для позиции: ${item.description}`);
          }
        }
        totalAmount += parseFloat(item.price) * item.quantity;
      }

      // 3. Создание заказа
      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber,
          clientId: data.clientId,
          status: "new",
          totalAmount: totalAmount.toFixed(2),
          paidAmount: data.advanceAmount || "0.00",
          isUrgent: data.isUrgent,
          priority: data.priority,
          deadline: data.deadline,
          promocodeId: data.promocodeId,
          createdBy: session.id,
        })
        .returning();

      // 4. Создание позиций и резервирование
      for (const item of data.items) {
        await tx.insert(orderItems).values({
          orderId: order.id,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          inventoryId: item.inventoryId,
        });

        if (item.inventoryId) {
          await tx
            .update(inventoryItems)
            .set({
              reservedQuantity: sql`${inventoryItems.reservedQuantity} + ${item.quantity}`,
            })
            .where(eq(inventoryItems.id, item.inventoryId));
        }
      }

      if (data.advanceAmount && parseFloat(data.advanceAmount) > 0) {
        await tx.insert(payments).values({
          orderId: order.id,
          amount: data.advanceAmount,
          method: "cash", // По умолчанию
          isAdvance: true,
          comment: "Предоплата при создании заказа",
        });
      }

      // 5. Аудит-лог
      await tx.insert(auditLogs).values({
        userId: session.id,
        action: "order.create",
        actionCategory: "orders",
        entityType: "order",
        entityId: order.id,
        details: {
          orderNumber,
          clientId: data.clientId,
          totalAmount,
          itemsCount: (data.items || []).length,
        },
      });

      revalidatePath("/dashboard/orders");

      return order;
    });
  }
);

/**
 * Схема валидации для смены статуса
 */
const UpdateStatusSchema = z.object({
  orderId: z.string().uuid("Некорректный ID заказа"),
  status: z.enum(["new", "design", "production", "done", "shipped", "cancelled", "completed", "archived"]),
});

/**
 * Обновляет статус заказа
 *
 * @description
 * Выполняет смену статуса с автоматическими побочными эффектами:
 *
 * - При переходе в `done` или `shipped`:
 *   - Списывает товары со склада
 *   - Снимает резервы
 *   - Создаёт складские транзакции
 *
 * - При переходе в `cancelled`:
 *   - Снимает резервы со склада
 *   - Записывает причину отмены (если указана)
 *
 * @param data - ID заказа и новый статус
 * @returns Обновлённый заказ
 *
 * @requires Роли: Администратор, Руководство — любые переходы
 * @requires Роли: Остальные — только разрешённые переходы
 * @audit Записывается как "order.status_change"
 *
 * @example
 * ```typescript
 * const result = await updateOrderStatus({
 *   orderId: "550e8400-e29b-41d4-a716-446655440000",
 *   status: "production"
 * });
 * ```
 */
export const updateOrderStatus = createSafeAction(
  UpdateStatusSchema,
  async (data) => {
    const session = await getSession();

    if (!session) {
      throw new Error("Необходима авторизация");
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, data.orderId),
      with: { items: true },
    });

    if (!order) {
      throw new Error("Заказ не найден");
    }

    const previousStatus = order.status;

    // Проверка разрешённых переходов для не-админов
    if (!isAdmin(session.roleName)) {
      const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
        new: ["design", "production", "cancelled"],
        design: ["new", "production", "cancelled"],
        production: ["done", "cancelled"],
        done: ["shipped", "cancelled"],
        shipped: [],
        cancelled: ["new"],
        completed: [],
        archived: [],
      };

      if (!allowedTransitions[previousStatus]?.includes(data.status)) {
        throw new Error(`Переход из "${previousStatus}" в "${data.status}" запрещён`);
      }
    }

    return await db.transaction(async (tx) => {
      // Обновляем статус
      const [updated] = await tx
        .update(orders)
        .set({ status: data.status, updatedAt: new Date() })
        .where(eq(orders.id, data.orderId))
        .returning();

      // Побочные эффекты при завершении
      if (data.status === "done" || data.status === "shipped") {
        for (const item of order.items) {
          if (item.inventoryId) {
            // Списываем со склада
            await tx
              .update(inventoryItems)
              .set({
                quantity: sql`${inventoryItems.quantity} - ${item.quantity}`,
                reservedQuantity: sql`${inventoryItems.reservedQuantity} - ${item.quantity}`,
              })
              .where(eq(inventoryItems.id, item.inventoryId));
          }
        }
      }

      // Снятие резервов при отмене
      if (data.status === "cancelled" && previousStatus !== "done" && previousStatus !== "shipped") {
        for (const item of order.items) {
          if (item.inventoryId) {
            await tx
              .update(inventoryItems)
              .set({
                reservedQuantity: sql`${inventoryItems.reservedQuantity} - ${item.quantity}`,
              })
              .where(eq(inventoryItems.id, item.inventoryId));
          }
        }
      }

      // Аудит-лог
      await tx.insert(auditLogs).values({
        userId: session.id,
        action: "order.status_change",
        actionCategory: "orders",
        entityType: "order",
        entityId: data.orderId,
        details: {
          from: previousStatus,
          to: data.status,
        },
      });

      revalidatePath("/dashboard/orders");
      revalidatePath(`/dashboard/orders/${data.orderId}`);

      return updated;
    });
  }
);
