"use server";

import { db } from "@/lib/db";
import {
  inventoryItems,
  inventoryTransactions,
  inventoryCategories,
} from "@/lib/schema";
import { auditLogs } from "@/lib/schema/system";
import {
  eq,
  and,
  gte,
  ilike,
  or,
  count,
  sql,
} from "drizzle-orm";
import { getSession } from "@/lib/session";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// ============================================
// СХЕМЫ ВАЛИДАЦИИ
// ============================================

const getMaterialsSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  applicationTypeId: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

const reserveMaterialsSchema = z.object({
  orderId: z.string().min(1, "ID заказа обязателен"),
  materials: z.array(
    z.object({
      id: z.string().min(1),
      quantity: z.number().positive("Количество должно быть положительным"),
    })
  ).min(1, "Выберите хотя бы один материал"),
});

const consumeMaterialsSchema = z.object({
  orderId: z.string().min(1, "ID заказа обязателен"),
  taskId: z.string().optional(),
  materials: z.array(
    z.object({
      id: z.string().min(1),
      quantity: z.number().positive(),
    })
  ).min(1),
});

// ============================================
// ТИПЫ
// ============================================

interface WarehouseMaterialForCalculator {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  quantity: number;
  unit: string;
  price: number;
  minQuantity: number | null;
}

interface WarehouseCategory {
  id: string;
  name: string;
  count: number;
}

// ============================================
// ФУНКЦИИ ПОЛУЧЕНИЯ ДАННЫХ
// ============================================

export async function getWarehouseMaterialsForCalculator(
  input: z.infer<typeof getMaterialsSchema>
): Promise<{
  success: boolean;
  data?: WarehouseMaterialForCalculator[];
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Не авторизован" };
    }

    const validated = getMaterialsSchema.parse(input);
    const { search, category, limit, offset } = validated;

    // Формируем условия
    const conditions = [
      eq(inventoryItems.isArchived, false),
      gte(inventoryItems.quantity, 0),
    ];

    if (search) {
      conditions.push(
        or(
          ilike(inventoryItems.name, `%${search}%`),
          ilike(inventoryItems.sku, `%${search}%`)
        )!
      );
    }

    if (category) {
      conditions.push(eq(inventoryItems.categoryId, category));
    }

    const items = await db
      .select({
        id: inventoryItems.id,
        name: inventoryItems.name,
        sku: inventoryItems.sku,
        category: inventoryCategories.name,
        quantity: inventoryItems.quantity,
        unit: inventoryItems.unit,
        price: inventoryItems.sellingPrice,
        minQuantity: inventoryItems.lowStockThreshold,
      })
      .from(inventoryItems)
      .leftJoin(
        inventoryCategories,
        eq(inventoryItems.categoryId, inventoryCategories.id)
      )
      .where(and(...conditions))
      .orderBy(inventoryItems.name)
      .limit(limit)
      .offset(offset);

    const data: WarehouseMaterialForCalculator[] = (items || []).map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: Number(item.quantity) || 0,
      unit: item.unit || "шт.",
      price: Number(item.price) || 0,
      minQuantity: item.minQuantity ? Number(item.minQuantity) : null,
    }));

    return { success: true, data };
  } catch (error) {
    console.error("[getWarehouseMaterialsForCalculator]", error);
    
    if (error instanceof z.ZodError) {
      return { success: false, error: "Неверные параметры запроса" };
    }
    
    return { success: false, error: "Ошибка загрузки материалов" };
  }
}

export async function getWarehouseCategoriesForCalculator(): Promise<{
  success: boolean;
  data?: WarehouseCategory[];
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Не авторизован" };
    }

    const categories = await db
      .select({
        id: inventoryCategories.id,
        name: inventoryCategories.name,
        count: count(inventoryItems.id),
      })
      .from(inventoryCategories)
      .leftJoin(
        inventoryItems,
        and(
          eq(inventoryItems.categoryId, inventoryCategories.id),
          eq(inventoryItems.isArchived, false)
        )
      )
      .where(eq(inventoryCategories.isActive, true))
      .groupBy(inventoryCategories.id, inventoryCategories.name)
      .orderBy(inventoryCategories.name);

    const data: WarehouseCategory[] = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      count: cat.count || 0,
    }));

    return { success: true, data };
  } catch (error) {
    console.error("[getWarehouseCategoriesForCalculator]", error);
    return { success: false, error: "Ошибка загрузки категорий" };
  }
}

// ============================================
// ФУНКЦИИ РАБОТЫ С МАТЕРИАЛАМИ
// ============================================

export async function reserveMaterialsForOrder(
  input: z.infer<typeof reserveMaterialsSchema>
): Promise<{
  success: boolean;
  data?: { reservedCount: number; totalCost: number };
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Не авторизован" };
    }

    const validated = reserveMaterialsSchema.parse(input);
    const { orderId, materials } = validated;

    let reservedCount = 0;
    let totalCost = 0;

    // Выполняем в транзакции
    await db.transaction(async (tx) => {
      for (const material of materials) {
        // Проверяем наличие
        const [item] = await tx
          .select({
            id: inventoryItems.id,
            quantity: inventoryItems.quantity,
            price: inventoryItems.sellingPrice,
            name: inventoryItems.name,
          })
          .from(inventoryItems)
          .where(
            and(
              eq(inventoryItems.id, material.id),
              eq(inventoryItems.isArchived, false)
            )
          )
          .for("update"); // Блокируем строку

        if (!item) {
          throw new Error(`Материал ${material.id} не найден`);
        }

        const currentQty = Number(item.quantity) || 0;
        if (currentQty < material.quantity) {
          throw new Error(
            `Недостаточно материала "${item.name}". Доступно: ${currentQty}`
          );
        }

        // Создаём транзакцию резервирования
        await tx.insert(inventoryTransactions).values({
          itemId: material.id,
          type: "adjustment", // No specific "reserve" type in schema, using adjustment or we should check if we can add it
          changeAmount: -material.quantity,
          orderId,
          createdBy: session.id,
          reason: `Резервирование для заказа ${orderId}`,
        });

        // Обновляем количество
        await tx
          .update(inventoryItems)
          .set({
            quantity: sql`${inventoryItems.quantity} - ${material.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(inventoryItems.id, material.id));

        reservedCount++;
        totalCost += Number(item.price) * material.quantity;
      }

      // Логируем в audit_logs
      await tx.insert(auditLogs).values({
        id: crypto.randomUUID(), // id is part of PK
        userId: session.id,
        action: "reserve_materials",
        entityType: "order",
        entityId: orderId,
        details: {
          materialsCount: materials.length,
          totalCost,
        },
      });
    });

    revalidatePath("/dashboard/warehouse");
    revalidatePath("/dashboard/production");

    return {
      success: true,
      data: { reservedCount, totalCost: Math.round(totalCost) },
    };
  } catch (error) {
    console.error("[reserveMaterialsForOrder]", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: "Неверные данные" };
    }

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Ошибка резервирования материалов" };
  }
}

export async function consumeMaterialsForOrder(
  input: z.infer<typeof consumeMaterialsSchema>
): Promise<{
  success: boolean;
  data?: { consumedCount: number; totalCost: number };
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Не авторизован" };
    }

    const validated = consumeMaterialsSchema.parse(input);
    const { orderId, taskId, materials } = validated;

    let consumedCount = 0;
    let totalCost = 0;

    await db.transaction(async (tx) => {
      for (const material of materials) {
        const [item] = await tx
          .select({
            id: inventoryItems.id,
            price: inventoryItems.sellingPrice,
            name: inventoryItems.name,
          })
          .from(inventoryItems)
          .where(
            and(
              eq(inventoryItems.id, material.id),
              eq(inventoryItems.isArchived, false)
            )
          );

        if (!item) {
          throw new Error(`Материал ${material.id} не найден`);
        }

        // Создаём транзакцию списания
        await tx.insert(inventoryTransactions).values({
          itemId: material.id,
          type: "out",
          changeAmount: -material.quantity,
          orderId,
          // taskId is not in inventoryTransactions schema, adding to reason
          createdBy: session.id,
          reason: `Списание для заказа ${orderId}${taskId ? `, задача ${taskId}` : ""}`,
        });

        consumedCount++;
        totalCost += Number(item.price) * material.quantity;
      }

      // Логируем
      await tx.insert(auditLogs).values({
        id: crypto.randomUUID(),
        userId: session.id,
        action: "consume_materials",
        entityType: "order",
        entityId: orderId,
        details: {
          taskId,
          materialsCount: materials.length,
          totalCost,
        },
      });
    });

    revalidatePath("/dashboard/warehouse");
    revalidatePath("/dashboard/production");

    return {
      success: true,
      data: { consumedCount, totalCost: Math.round(totalCost) },
    };
  } catch (error) {
    console.error("[consumeMaterialsForOrder]", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: "Неверные данные" };
    }

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Ошибка списания материалов" };
  }
}

export async function releaseMaterialsReservation(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Не авторизован" };
    }

    if (!orderId) {
      return { success: false, error: "ID заказа обязателен" };
    }

    await db.transaction(async (tx) => {
      // Находим все резервы по заказу (in this case adjustment with the specific reason)
      const reservations = await tx
        .select({
          id: inventoryTransactions.id,
          itemId: inventoryTransactions.itemId,
          changeAmount: inventoryTransactions.changeAmount,
        })
        .from(inventoryTransactions)
        .where(
          and(
            eq(inventoryTransactions.orderId, orderId),
            eq(inventoryTransactions.type, "adjustment"),
            ilike(inventoryTransactions.reason, "Резервирование%")
          )
        );

      for (const reservation of reservations) {
        if (!reservation.itemId) continue;

        // Возвращаем на склад (changeAmount отрицательный, поэтому вычитаем)
        await tx
          .update(inventoryItems)
          .set({
            quantity: sql`${inventoryItems.quantity} - ${reservation.changeAmount}`,
            updatedAt: new Date(),
          })
          .where(eq(inventoryItems.id, reservation.itemId));

        // Создаём обратную транзакцию
        await tx.insert(inventoryTransactions).values({
          itemId: reservation.itemId,
          type: "in",
          changeAmount: Math.abs(Number(reservation.changeAmount)),
          orderId,
          createdBy: session.id,
          reason: `Отмена резервирования для заказа ${orderId}`,
        });
      }

      // Логируем
      await tx.insert(auditLogs).values({
        id: crypto.randomUUID(),
        userId: session.id,
        action: "release_reservation",
        entityType: "order",
        entityId: orderId,
        details: {
          releasedCount: reservations.length,
        },
      });
    });

    revalidatePath("/dashboard/warehouse");
    revalidatePath("/dashboard/production");

    return { success: true };
  } catch (error) {
    console.error("[releaseMaterialsReservation]", error);
    return { success: false, error: "Ошибка отмены резервирования" };
  }
}
