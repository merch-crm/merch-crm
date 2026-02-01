"use server";

import { db } from "@/lib/db";
import { orders, tasks, users } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function getUserStats(userId: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        // Basic user info
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            with: { role: true, department: true }
        });

        if (!user) return { error: "User not found" };

        // Helper to get start of current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // 1. Orders Stats (Created by user)
        const ordersStats = await db.select({
            totalCount: sql<number>`count(*)`,
            totalRevenue: sql<string>`coalesce(sum(${orders.totalAmount}), 0)`,
            monthCount: sql<number>`count(*) filter (where ${orders.createdAt} >= ${startOfMonth})`,
            monthRevenue: sql<string>`coalesce(sum(${orders.totalAmount}) filter (where ${orders.createdAt} >= ${startOfMonth}), 0)`
        })
            .from(orders)
            .where(eq(orders.createdBy, userId));

        // 2. Tasks Stats (Assigned to user)
        const tasksStats = await db.select({
            total: sql<number>`count(*)`,
            completed: sql<number>`count(*) filter (where ${tasks.status} = 'done')`,
            monthCompleted: sql<number>`count(*) filter (where ${tasks.status} = 'done' and ${tasks.createdAt} >= ${startOfMonth})` // Using createdAt as proxy
        })
            .from(tasks)
            .where(eq(tasks.assignedToUserId, userId));

        // 3. Efficiency (Placeholder logic)
        // E.g. completed tasks / total tasks (if total > 0)
        const taskEfficiency = tasksStats[0].total > 0
            ? Math.round((tasksStats[0].completed / tasksStats[0].total) * 100)
            : 0;

        return {
            data: {
                user: {
                    name: user.name,
                    role: user.role?.name || "N/A",
                    avatar: user.avatar
                },
                orders: {
                    total: ordersStats[0].totalCount,
                    totalRevenue: Math.round(Number(ordersStats[0].totalRevenue)),
                    month: ordersStats[0].monthCount,
                    monthRevenue: Math.round(Number(ordersStats[0].monthRevenue))
                },
                tasks: {
                    total: tasksStats[0].total,
                    completed: tasksStats[0].completed,
                    monthCompleted: tasksStats[0].monthCompleted,
                    efficiency: taskEfficiency
                }
            }
        };
    } catch (error) {
        console.error("Error fetching user stats:", error);
        return { error: "Failed to fetch stats" };
    }
}
