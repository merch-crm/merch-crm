"use server";

import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function getDesignStats() {
    const session = await getSession();
    if (!session) return { newTasks: 0, pendingApproval: 0, completed: 0, efficiency: 95 };

    try {
        const designOrders = await db.query.orders.findMany({
            where: eq(orders.status, "design"),
        });

        const newTasks = designOrders.length;
        const pendingApproval = designOrders.filter(o => o.priority === "high").length;

        // Mock data for completed and efficiency
        const completed = 24;
        const efficiency = 95;

        return {
            newTasks,
            pendingApproval,
            completed,
            efficiency
        };
    } catch (error) {
        console.error("Error fetching design stats:", error);
        return { newTasks: 0, pendingApproval: 0, completed: 0, efficiency: 0 };
    }
}

export async function getDesignOrders() {
    const session = await getSession();
    if (!session) return [];

    try {
        const designOrders = await db.query.orders.findMany({
            where: eq(orders.status, "design"),
            with: {
                client: true,
                items: true,
            }
        });

        return designOrders;
    } catch (error) {
        console.error("Error fetching design orders:", error);
        return [];
    }
}
