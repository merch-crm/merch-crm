"use server";

import { okVoid } from "@/lib/types";

import { db } from"@/lib/db";
import * as schema from"@/lib/schema";
import { revalidatePath } from"next/cache";
import { getSession } from "@/lib/session";
import { logAction } from"@/lib/audit";
import { logError } from"@/lib/error-logger";
import { OrderIdSchema } from"../validation";
import { ActionResult } from"@/lib/types";

const { orderAttachments } = schema;

export async function uploadOrderFile(orderId: string, formData: FormData): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error:"Не авторизован" };

    const validatedId = OrderIdSchema.safeParse({ orderId });
    if (!validatedId.success) return { success: false, error: validatedId.error.issues[0].message };

    const file = formData.get("file") as File;
    if (!file) return { success: false, error:"Файл не предоставлен" };

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const { uploadFile } = await import("@/lib/storage");
        const fileKey = `uploads/${Date.now()}-${file.name}`;
        // Enable compression for order attachments
        const { key, url } = await uploadFile(fileKey, buffer, file.type, { compress: true });

        await db.transaction(async (tx) => {
            await tx.insert(orderAttachments).values({
                orderId,
                fileName: file.name,
                fileKey: key,
                fileUrl: url,
                fileSize: file.size,
                contentType: file.type,
                createdBy: session.id,
            });

            await logAction("Загружен файл заказа","s3_storage", orderId, {
                fileName: file.name,
                fileKey: key,
                orderId
            }, tx);
        });

        revalidatePath("/dashboard/orders");
        revalidatePath(`/dashboard/orders/${orderId}`);
        return okVoid();
    } catch (error) {
        await logError({
            error,
            path: `/dashboard/orders/${orderId}`,
            method:"uploadOrderFile",
            details: { orderId, fileName: file.name }
        });
        return { success: false, error:"Не удалось загрузить файл" };
    }
}
