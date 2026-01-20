import { db } from "./db";
import { inventoryItems, inventoryStocks, inventoryTransactions } from "./schema";
import { eq, sql, and } from "drizzle-orm";

/**
 * Логика резервирования товара.
 * При создании заказа или добавлении позиции, мы должны увеличить reserved_quantity.
 * Если доступный остаток (quantity - reserved_quantity) меньше запрашиваемого, возвращаем ошибку.
 */
export async function reserveStock(itemId: string, requestedQuantity: number) {
    const item = await db.query.inventoryItems.findFirst({
        where: eq(inventoryItems.id, itemId),
    });

    if (!item) throw new Error("Товар не найден");

    const available = item.quantity - item.reservedQuantity;

    if (available < requestedQuantity) {
        throw new Error(`Недостаточно товара на складе. Доступно: ${available}, Требуется: ${requestedQuantity}`);
    }

    await db.update(inventoryItems)
        .set({
            reservedQuantity: sql`${inventoryItems.reservedQuantity} + ${requestedQuantity}`
        })
        .where(eq(inventoryItems.id, itemId));
}

/**
 * Снятие резерва (например, при отмене заказа или после отгрузки).
 */
export async function releaseStock(itemId: string, amount: number) {
    await db.update(inventoryItems)
        .set({
            reservedQuantity: sql`GREATEST(0, ${inventoryItems.reservedQuantity} - ${amount})`
        })
        .where(eq(inventoryItems.id, itemId));
}

/**
 * Фактическое списание со склада (после упаковки/отгрузки).
 * Уменьшает и общее количество, и резерв.
 */
export async function commitStock(itemId: string, amount: number) {
    await db.update(inventoryItems)
        .set({
            quantity: sql`${inventoryItems.quantity} - ${amount}`,
            reservedQuantity: sql`GREATEST(0, ${inventoryItems.reservedQuantity} - ${amount})`
        })
        .where(eq(inventoryItems.id, itemId));
}
