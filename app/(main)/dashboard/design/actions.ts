"use server";

import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/error-logger";
import { ActionResult } from "@/lib/types";

export async function getDesignStats(): Promise<ActionResult<{
    newTasks: number;
    pendingApproval: number;
    completed: number;
    efficiency: number;
}>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const designOrders = await db.query.orders.findMany({
            where: eq(orders.status, "design"),
            limit: 100 // Safety limit
        });

        const newTasks = designOrders.length;
        const pendingApproval = designOrders.filter(o => o.priority === "high" || o.priority === "urgent").length;

        // Mock data for completed and efficiency
        const completed = 24;
        const efficiency = 95;

        return {
            success: true,
            data: {
                newTasks,
                pendingApproval,
                completed,
                efficiency
            }
        };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/design",
            method: "getDesignStats"
        });
        return { success: false, error: "Не удалось загрузить статистику дизайна" };
    }
}

import { z } from "zod";
import { Order } from "@/lib/types/order";

const GetDesignOrdersSchema = z.object({
    page: z.number().int().positive().optional().default(1),
    limit: z.number().int().positive().max(100).optional().default(50),
});

export async function getDesignOrders(input: z.input<typeof GetDesignOrdersSchema> = {}): Promise<ActionResult<Order[]>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validated = GetDesignOrdersSchema.safeParse(input);
    if (!validated.success) {
        return { success: false, error: "Некорректные параметры: " + validated.error.issues[0].message };
    }

    const { page, limit } = validated.data;
    const offset = (page - 1) * limit;

    try {
        const designOrders = await db.query.orders.findMany({
            where: eq(orders.status, "design"),
            with: {
                client: true,
                items: true,
            },
            limit,
            offset,
            orderBy: [desc(orders.createdAt)]
        });

        return { success: true, data: designOrders as unknown as Order[] };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/design",
            method: "getDesignOrders",
            details: { page, limit }
        });
        return { success: false, error: "Не удалось загрузить список заказов" };
    }
}
