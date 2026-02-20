import { db } from "./db";
import { orderItems, orders } from "./schema";
import { eq } from "drizzle-orm";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DBOrTx = any;

/**
 * Управление этапами производства для позиций заказа.
 * Этапы: Prep -> Print -> Application -> Packaging.
 */
export async function updateItemStage(
    orderItemId: string,
    stage: 'prep' | 'print' | 'application' | 'packaging',
    status: 'pending' | 'in_progress' | 'done' | 'failed',
    tx?: DBOrTx
) {
    const d: DBOrTx = tx || db;

    const updates: Partial<typeof orderItems.$inferInsert> = {};

    switch (stage) {
        case 'prep': updates.stagePrepStatus = status; break;
        case 'print': updates.stagePrintStatus = status; break;
        case 'application': updates.stageApplicationStatus = status; break;
        case 'packaging': updates.stagePackagingStatus = status; break;
        default: throw new Error("Неверный этап производства");
    }

    await d.update(orderItems)
        .set(updates)
        .where(eq(orderItems.id, orderItemId));

    // Проверка: если все позиции заказа упакованы, переводим заказ в "done"
    await checkAndUpdateOrderStatus(orderItemId, tx);
}

async function checkAndUpdateOrderStatus(orderItemId: string, tx?: DBOrTx) {
    const d = (tx || db);
    const item = await d.query.orderItems.findFirst({
        where: eq(orderItems.id, orderItemId),
    });

    if (!item) return;

    const orderId = item.orderId;

    const allItems = await db.query.orderItems.findMany({
        where: eq(orderItems.orderId, orderId),
        limit: 100
    });

    const allPacked = allItems.every(i => i.stagePackagingStatus === 'done');

    if (allPacked) {
        await d.update(orders)
            .set({ status: 'done' })
            .where(eq(orders.id, orderId));
    }
}
