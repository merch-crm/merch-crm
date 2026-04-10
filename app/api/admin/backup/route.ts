import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles, departments, users } from "@/lib/schema/users";
import { clients } from "@/lib/schema/clients/main";
import { inventoryCategories, inventoryAttributeTypes } from "@/lib/schema/warehouse/categories";
import { storageLocations } from "@/lib/schema/storage";
import { inventoryItems } from "@/lib/schema/warehouse/items";
import { inventoryAttributes } from "@/lib/schema/warehouse/attributes";
import { inventoryStocks, inventoryTransactions, inventoryTransfers } from "@/lib/schema/warehouse/stock";
import { promocodes } from "@/lib/schema/promocodes";
import { orders, orderItems, orderAttachments } from "@/lib/schema/orders";
import { payments, expenses } from "@/lib/schema/finance";
import { tasks } from "@/lib/schema/tasks";
import { taskChecklists } from "@/lib/schema/task-checklists";
import { taskComments } from "@/lib/schema/task-comments";
import { taskHistory } from "@/lib/schema/task-history";
import { taskAttachments } from "@/lib/schema/task-attachments";
import { wikiFolders, wikiPages } from "@/lib/schema/wiki";
import { systemSettings, auditLogs, securityEvents } from "@/lib/schema/system";
import { getSession } from "@/lib/session";
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
      backupData.roles = await tx.select().from(roles);
      backupData.departments = await tx.select().from(departments);
      backupData.users = await tx.select().from(users);

      backupData.clients = await tx.select().from(clients);

      backupData.inventoryCategories = await tx.select().from(inventoryCategories);
      backupData.storageLocations = await tx.select().from(storageLocations);
      backupData.inventoryItems = await tx.select().from(inventoryItems);
      backupData.inventoryAttributes = await tx.select().from(inventoryAttributes);
      backupData.inventoryAttributeTypes = await tx.select().from(inventoryAttributeTypes);

      backupData.inventoryStocks = await tx.select().from(inventoryStocks);
      backupData.inventoryTransactions = await tx.select().from(inventoryTransactions);
      backupData.inventoryTransfers = await tx.select().from(inventoryTransfers);

      backupData.promocodes = await tx.select().from(promocodes);
      backupData.orders = await tx.select().from(orders);
      backupData.orderItems = await tx.select().from(orderItems);
      backupData.payments = await tx.select().from(payments);
      backupData.orderAttachments = await tx.select().from(orderAttachments);

      backupData.tasks = await tx.select().from(tasks);
      backupData.taskChecklists = await tx.select().from(taskChecklists);
      backupData.taskComments = await tx.select().from(taskComments);
      backupData.taskHistory = await tx.select().from(taskHistory);
      backupData.taskAttachments = await tx.select().from(taskAttachments);

      backupData.expenses = await tx.select().from(expenses);
      backupData.wikiFolders = await tx.select().from(wikiFolders);
      backupData.wikiPages = await tx.select().from(wikiPages);
      backupData.systemSettings = await tx.select().from(systemSettings);

      // Security logs are usually large, maybe exclude or make optional? 
      // Let's include them for full backup.
      backupData.auditLogs = await tx.select().from(auditLogs);
      backupData.securityEvents = await tx.select().from(securityEvents);

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
