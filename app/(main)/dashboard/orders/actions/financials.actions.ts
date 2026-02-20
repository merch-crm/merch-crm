"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { AddPaymentSchema, RefundOrderSchema } from "../validation";
import { ActionResult } from "@/lib/types";

const { orders, payments } = schema;

export async function refundOrder(orderId: string, amount: number, reason: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const validated = RefundOrderSchema.safeParse({ orderId, amount, reason });
        if (!validated.success) return { success: false, error: validated.error.issues[0].message };

        await db.transaction(async (tx) => {
            const order = await tx.query.orders.findFirst({ where: eq(orders.id, orderId) });
            if (!order) throw new Error("Заказ не найден");

            const refundAmount = -Math.abs(validated.data.amount);

            await tx.insert(payments).values({
                orderId,
                amount: String(refundAmount),
                method: "cash",
                isAdvance: false,
                comment: `Возврат: ${validated.data.reason}`
            });

            await logAction("Оформлен возврат", "order", orderId, {
                amount: refundAmount,
                reason: validated.data.reason
            }, tx);
        });

        revalidatePath("/dashboard/orders");
        revalidatePath(`/dashboard/orders/${orderId}`);
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/orders/refund", method: "refundOrder" });
        return { success: false, error: error instanceof Error ? error.message : "Ошибка" };
    }
}

export async function addPayment(orderId: string, amount: number, method: string, isAdvance: boolean, comment?: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const validated = AddPaymentSchema.safeParse({ orderId, amount, method, isAdvance, comment });
        if (!validated.success) return { success: false, error: validated.error.issues[0].message };

        await db.transaction(async (tx) => {
            await tx.insert(payments).values({
                orderId,
                amount: String(validated.data.amount),
                method: validated.data.method,
                isAdvance: validated.data.isAdvance,
                comment: validated.data.comment || (validated.data.isAdvance ? "Аванс" : "Оплата")
            });

            await logAction(validated.data.isAdvance ? "Внесен аванс" : "Внесена оплата", "order", orderId, {
                amount: validated.data.amount,
                method: validated.data.method,
                isAdvance: validated.data.isAdvance
            }, tx);
        });

        revalidatePath("/dashboard/orders");
        revalidatePath(`/dashboard/orders/${orderId}`);
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/orders/payment", method: "addPayment" });
        return { success: false, error: "Ошибка" };
    }
}
