import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

        const backupData: Record<string, any[]> = {};

        // List of tables to dump
        // Using dynamic access to db.select().from(...) might be verbose, 
        // so we can use db.query[tableName].findMany() if available, or just raw selects.
        // For simplicity and coverage using check of keys in schema

        // Manual list to ensure order and selection of what matters
        const tables = [
            'roles', 'departments', 'users',
            'clients',
            'inventoryCategories', 'storageLocations', 'inventoryItems', 'inventoryAttributes', 'inventoryAttributeTypes',
            'inventoryStocks', 'inventoryTransactions', 'inventoryTransfers',
            'promocodes', 'orders', 'orderItems', 'payments', 'orderAttachments',
            'tasks', 'taskChecklists', 'taskComments', 'taskHistory', 'taskAttachments',
            'notifications', 'expenses',
            'wikiFolders', 'wikiPages',
            'systemSettings'
        ];

        // We can't easily iterate db.query keys safely with typing without being careful.
        // Let's do it explicitly for safety.

        backupData.roles = await db.select().from(schema.roles);
        backupData.departments = await db.select().from(schema.departments);
        backupData.users = await db.select().from(schema.users);

        backupData.clients = await db.select().from(schema.clients);

        backupData.inventoryCategories = await db.select().from(schema.inventoryCategories);
        backupData.storageLocations = await db.select().from(schema.storageLocations);
        backupData.inventoryItems = await db.select().from(schema.inventoryItems);
        backupData.inventoryAttributes = await db.select().from(schema.inventoryAttributes);
        backupData.inventoryAttributeTypes = await db.select().from(schema.inventoryAttributeTypes);

        backupData.inventoryStocks = await db.select().from(schema.inventoryStocks);
        backupData.inventoryTransactions = await db.select().from(schema.inventoryTransactions);
        backupData.inventoryTransfers = await db.select().from(schema.inventoryTransfers);

        backupData.promocodes = await db.select().from(schema.promocodes);
        backupData.orders = await db.select().from(schema.orders);
        backupData.orderItems = await db.select().from(schema.orderItems);
        backupData.payments = await db.select().from(schema.payments);
        backupData.orderAttachments = await db.select().from(schema.orderAttachments);

        backupData.tasks = await db.select().from(schema.tasks);
        backupData.taskChecklists = await db.select().from(schema.taskChecklists);
        backupData.taskComments = await db.select().from(schema.taskComments);
        backupData.taskHistory = await db.select().from(schema.taskHistory);
        backupData.taskAttachments = await db.select().from(schema.taskAttachments);

        backupData.expenses = await db.select().from(schema.expenses);
        backupData.wikiFolders = await db.select().from(schema.wikiFolders);
        backupData.wikiPages = await db.select().from(schema.wikiPages);
        backupData.systemSettings = await db.select().from(schema.systemSettings);

        // Security logs are usually large, maybe exclude or make optional? 
        // Let's include them for full backup.
        backupData.auditLogs = await db.select().from(schema.auditLogs);
        backupData.securityEvents = await db.select().from(schema.securityEvents);

        const data = JSON.stringify({
            meta: {
                version: "1.0",
                timestamp,
                generatedBy: user.email
            },
            data: backupData
        }, null, 2);

        await logAction("Скачан бэкап базы", "system", "backup", { size: data.length });

        return new NextResponse(data, {
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="crm_backup_${timestamp.split('T')[0]}.json"`,
            },
        });
    } catch (error) {
        console.error("Backup error:", error);
        return NextResponse.json({ error: "Backup failed" }, { status: 500 });
    }
}
