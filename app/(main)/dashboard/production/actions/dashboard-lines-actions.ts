"use server";

import { db } from "@/lib/db";
import { z } from "zod";
import {
    productionTasks,
    productionLines,
} from "@/lib/schema/production";
import { eq, and, sql, count, sum } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { LineLoad } from "../types";

const LineLoadSchema = z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
    color: z.string().nullable(),
    tasksCount: z.number(),
    totalQuantity: z.number(),
    inProgress: z.number(),
});

export async function getTasksByLine(): Promise<{
    success: boolean;
    data?: LineLoad[];
    error?: string;
}> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const lines = await db
            .select({
                id: productionLines.id,
                name: productionLines.name,
                code: productionLines.code,
                color: productionLines.color,
            })
            .from(productionLines)
            .where(eq(productionLines.isActive, true));

        const data = await Promise.all(
            lines.map(async (line) => {
                const [tasksResult] = await db
                    .select({
                        count: count(),
                        quantity: sum(productionTasks.quantity),
                    })
                    .from(productionTasks)
                    .where(
                        and(
                            eq(productionTasks.lineId, line.id),
                            sql`${productionTasks.status} NOT IN ('completed', 'cancelled')`
                        )
                    );

                const [inProgressResult] = await db
                    .select({ count: count() })
                    .from(productionTasks)
                    .where(
                        and(
                            eq(productionTasks.lineId, line.id),
                            eq(productionTasks.status, "in_progress")
                        )
                    );

                const response = {
                    id: line.id,
                    name: line.name,
                    code: line.code,
                    color: line.color,
                    tasksCount: tasksResult?.count || 0,
                    totalQuantity: Number(tasksResult?.quantity || 0),
                    inProgress: inProgressResult?.count || 0,
                };

                return LineLoadSchema.parse(response);
            })
        );

        return { success: true, data };
    } catch (error) {
        console.error("Error getting tasks by line:", error);
        return { success: false, error: "Не удалось получить данные" };
    }
}
