import { db } from "./db";
import { tasks, orders } from "./schema";
import { eq } from "drizzle-orm";

export async function autoGenerateTasks(orderId: string, status: string, userId: string) {
    try {
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
            with: { client: true }
        });

        if (!order) return;

        // Automation rules
        if (status === "design") {
            // Task for designers
            const designerRole = await db.query.roles.findFirst({
                where: (r, { eq }) => eq(r.name, "Дизайнер")
            });

            await db.insert(tasks).values({
                title: `Дизайн для заказа #${order.orderNumber || order.id.slice(0, 8)}`,
                description: `Подготовить макеты для клиента ${order.client?.name || "Неизвестно"}`,
                status: "new",
                priority: order.priority === "high" ? "high" : "normal",
                type: "design",
                orderId: order.id,
                createdBy: userId,
                assignedToRoleId: designerRole?.id || null,
                dueDate: order.deadline,
            });
        }

        if (status === "production") {
            // Task for production department
            const productionRole = await db.query.roles.findFirst({
                where: (r, { eq }) => eq(r.name, "Производство")
            });

            await db.insert(tasks).values({
                title: `Производство заказа #${order.orderNumber || order.id.slice(0, 8)}`,
                description: `Начать производство продукции по утвержденным макетам. Клиент: ${order.client?.name || "Неизвестно"}`,
                status: "new",
                priority: order.priority === "high" ? "high" : "normal",
                type: "production",
                orderId: order.id,
                createdBy: userId,
                assignedToRoleId: productionRole?.id || null,
                dueDate: order.deadline,
            });
        }
    } catch (error) {
        console.error("Error in autoGenerateTasks:", error);
    }
}
