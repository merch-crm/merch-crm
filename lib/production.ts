import { db } from "./db";
import { orderItems, orders } from "./schema";
import { eq, and } from "drizzle-orm";

/**
 * Управление этапами производства для позиций заказа.
 * Этапы: Prep -> Print -> Application -> Packaging.
 */
export async function updateItemStage(
    orderItemId: string,
    stage: 'prep' | 'print' | 'application' | 'packaging',
    status: 'pending' | 'in_progress' | 'done' | 'failed'
) {
    const fieldMap: Record<string, any> = {
        prep: orderItems.stagePrepStatus,
        print: orderItems.stagePrintStatus,
        application: orderItems.stageApplicationStatus,
        packaging: orderItems.stagePackagingStatus,
    };

    const targetField = fieldMap[stage];
    if (!targetField) throw new Error("Неверный этап производства");

    await db.update(orderItems)
        .set({ [targetField.name]: status })
        .where(eq(orderItems.id, orderItemId));

    // Проверка: если все позиции заказа упакованы, переводим заказ в "done"
    await checkAndUpdateOrderStatus(orderItemId);
}

async function checkAndUpdateOrderStatus(orderItemId: string) {
    const item = await db.query.orderItems.findFirst({
        where: eq(orderItems.id, orderItemId),
    });

    if (!item) return;

    const orderId = item.orderId;

    const allItems = await db.query.orderItems.findMany({
        where: eq(orderItems.orderId, orderId),
    });

    const allPacked = allItems.every(i => i.stagePackagingStatus === 'done');

    if (allPacked) {
        await db.update(orders)
            .set({ status: 'done' })
            .where(eq(orders.id, orderId));
    }
}
