import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { users, roles, departments, clients, orders, inventoryCategories, inventoryItems, storageLocations, tasks, auditLogs } from "@/lib/schema";
import { PgTable } from "drizzle-orm/pg-core";

export async function performDatabaseBackup(initiatedByUserId: string | null = null, trigger: "manual" | "auto" | "cron" = "manual") {
    try {
        const backupDir = path.join(process.cwd(), "public", "uploads", "backups");
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const fileName = `backup_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
        const filePath = path.join(backupDir, fileName);

        const writeStream = fs.createWriteStream(filePath);

        const write = (str: string) => new Promise<void>((resolve) => {
            if (!writeStream.write(str)) {
                writeStream.once('drain', resolve);
            } else {
                process.nextTick(resolve);
            }
        });

        await write('{\n  "version": "1.1",\n  "timestamp": "' + new Date().toISOString() + '",\n  "data": {\n');

        const tablesToBackup = [
            { name: "users", table: users },
            { name: "roles", table: roles },
            { name: "departments", table: departments },
            { name: "clients", table: clients },
            { name: "orders", table: orders },
            { name: "inventoryCategories", table: inventoryCategories },
            { name: "inventoryItems", table: inventoryItems },
            { name: "storageLocations", table: storageLocations },
            { name: "tasks", table: tasks }
        ];

        for (let i = 0; i < tablesToBackup.length; i++) {
            const { name, table } = tablesToBackup[i];
            await write(`    "${name}": [\n`);

            let offset = 0;
            const limit = 500;
            let isFirstRow = true;

            while (true) {
                const chunk = await db.select().from(table as PgTable).limit(limit).offset(offset);
                if (chunk.length === 0) break;

                for (const row of chunk) {
                    if (!isFirstRow) await write(',\n');
                    await write('      ' + JSON.stringify(row));
                    isFirstRow = false;
                }

                if (chunk.length < limit) break;
                offset += limit;
            }

            await write('\n    ]');

            if (i < tablesToBackup.length - 1) {
                await write(',\n');
            } else {
                await write('\n');
            }
        }

        await write('  }\n}');
        writeStream.end();

        await new Promise<void>((resolve) => writeStream.on('finish', () => resolve()));

        // Audit log
        if (initiatedByUserId) {
            await db.insert(auditLogs).values({
                userId: initiatedByUserId,
                action: `Создана резервная копия БД: ${fileName}`,
                entityType: "system",
                entityId: initiatedByUserId,
                details: { fileName, streaming: true, trigger }
            });
        }

        return { success: true, fileName };

    } catch (error) {
        console.error("Backup creation error:", error);
        return { success: false, error: "Не удалось создать резервную копию" };
    }
}
