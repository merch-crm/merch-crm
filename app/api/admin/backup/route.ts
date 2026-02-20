import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
        }

        const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, session.id),
            with: { role: true }
        });

        if (user?.role?.name !== "Администратор") {
            return NextResponse.json({ error: "Forbidden: Only admins can download backups" }, { status: 403 });
        }

        // Fetch all data from key tables
        // We use a mapping to ensure we capture everything useful
        const timestamp = new Date().toISOString();

        const backupData: Record<string, unknown[]> = {};

        // List of tables to dump
        // Using dynamic access to db.select().from(...) might be verbose, 
        // so we can use db.query[tableName].findMany() if available, or just raw selects.
        // For simplicity and coverage using check of keys in schema

        // Manual list to ensure order and selection of what matters
        // const tables = [...]; // Removed unused variable


        // We can't easily iterate db.query keys safely with typing without being careful.
        // Let's do it explicitly for safety.

        const data = await db.transaction(async (tx) => {
            backupData.roles = await tx.select().from(schema.roles);
            backupData.departments = await tx.select().from(schema.departments);
            backupData.users = await tx.select().from(schema.users);

            backupData.clients = await tx.select().from(schema.clients);

            backupData.inventoryCategories = await tx.select().from(schema.inventoryCategories);
            backupData.storageLocations = await tx.select().from(schema.storageLocations);
            backupData.inventoryItems = await tx.select().from(schema.inventoryItems);
            backupData.inventoryAttributes = await tx.select().from(schema.inventoryAttributes);
            backupData.inventoryAttributeTypes = await tx.select().from(schema.inventoryAttributeTypes);

            backupData.inventoryStocks = await tx.select().from(schema.inventoryStocks);
            backupData.inventoryTransactions = await tx.select().from(schema.inventoryTransactions);
            backupData.inventoryTransfers = await tx.select().from(schema.inventoryTransfers);

            backupData.promocodes = await tx.select().from(schema.promocodes);
            backupData.orders = await tx.select().from(schema.orders);
            backupData.orderItems = await tx.select().from(schema.orderItems);
            backupData.payments = await tx.select().from(schema.payments);
            backupData.orderAttachments = await tx.select().from(schema.orderAttachments);

            backupData.tasks = await tx.select().from(schema.tasks);
            backupData.taskChecklists = await tx.select().from(schema.taskChecklists);
            backupData.taskComments = await tx.select().from(schema.taskComments);
            backupData.taskHistory = await tx.select().from(schema.taskHistory);
            backupData.taskAttachments = await tx.select().from(schema.taskAttachments);

            backupData.expenses = await tx.select().from(schema.expenses);
            backupData.wikiFolders = await tx.select().from(schema.wikiFolders);
            backupData.wikiPages = await tx.select().from(schema.wikiPages);
            backupData.systemSettings = await tx.select().from(schema.systemSettings);

            // Security logs are usually large, maybe exclude or make optional? 
            // Let's include them for full backup.
            backupData.auditLogs = await tx.select().from(schema.auditLogs);
            backupData.securityEvents = await tx.select().from(schema.securityEvents);

            const json = JSON.stringify({
                meta: {
                    version: "1.0",
                    timestamp,
                    generatedBy: user.email
                },
                data: backupData
            }, null, 2);

            await logAction("Скачан бэкап базы", "system", "backup", { size: json.length }, tx);
            return json;
        });



        return new NextResponse(data, {
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="crm_backup_${timestamp.split('T')[0]}.json"`,
            },
        });
    } catch (error) {
        console.error("Backup error:", error);
        return NextResponse.json({ error: "Ошибка резервного копирования" }, { status: 500 });
    }
}
