"use server";

import { db } from "@/lib/db";
import { systemSettings, users, clients, orders, notifications, roles } from "@/lib/schema";
import { eq, sql, type InferInsertModel } from "drizzle-orm";
import { z } from "zod";

const checkSchema = z.void();

export async function checkAndRunNotifications() {
    checkSchema.parse(undefined); // Validation check

    try {
        const SETTING_KEY = "last_notification_check";
        const now = new Date();

        // 1. Check last run time
        const setting = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, SETTING_KEY)
        });

        let shouldRun = false;
        if (!setting) {
            shouldRun = true;
        } else {
            const lastRun = new Date(setting.value as string);
            // Check if 24 hours passed
            const diff = now.getTime() - lastRun.getTime();
            if (diff > 24 * 60 * 60 * 1000) {
                shouldRun = true;
            } else {
                // Check if it's a different day (simple check to ensure daily run even if server restarted)
                if (lastRun.getDate() !== now.getDate()) {
                    shouldRun = true;
                }
            }
        }

        if (!shouldRun) return;

        await db.transaction(async (tx) => {
            // A. Birthdays (Users)
            const birthdayUsers = await tx.select()
                .from(users)
                .where(
                    sql`TO_CHAR(${users.birthday}, 'MM-DD') = TO_CHAR(CURRENT_DATE, 'MM-DD')`
                );

            if (birthdayUsers.length > 0) {
                const allUsers = await tx.select({ id: users.id }).from(users).where(eq(users.isSystem, false));

                for (const bDayUser of birthdayUsers) {
                    const message = `Сегодня день рождения у сотрудника ${bDayUser.name}! 🎉`;

                    const notifs = allUsers.map(u => ({
                        userId: u.id,
                        title: "День рождения!",
                        message: message,
                        type: "info" as const,
                        isRead: false
                    }));

                    if (notifs.length > 0) {
                        await tx.insert(notifications).values(notifs);
                    }
                }
            }

            // B. Lost Clients (No orders for 90 days)
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            const lostClientsResult = await tx.execute(sql`
                SELECT c.id, c.name, c.company, c.manager_id, MAX(o.created_at) as last_order_date
                FROM ${clients} c
                JOIN ${orders} o ON c.id = o.client_id
                GROUP BY c.id, c.name, c.company, c.manager_id
                HAVING MAX(o.created_at) < ${threeMonthsAgo.toISOString()}
                AND MAX(o.created_at) > ${new Date(threeMonthsAgo.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()}
            `);

            const adminUsers = await tx.select({ id: users.id })
                .from(users)
                .innerJoin(roles, eq(users.roleId, roles.id))
                .where(eq(roles.name, 'Администратор'));

            const adminUserIds = adminUsers.map(u => u.id);
            const allNotificationsToInsert: InferInsertModel<typeof notifications>[] = [];

            for (const client of lostClientsResult.rows) {
                const targetUserIds = new Set<string>();
                if (client.manager_id && typeof client.manager_id === 'string') targetUserIds.add(client.manager_id);
                adminUserIds.forEach(id => targetUserIds.add(id));

                const message = `Клиент ${client.name} (${client.company || 'Без компании'}) не делал заказов более 3 месяцев.`;

                targetUserIds.forEach(uid => {
                    allNotificationsToInsert.push({
                        userId: uid,
                        title: "Потерянный клиент",
                        message: message,
                        type: "warning" as const,
                        isRead: false
                    });
                });
            }

            if (allNotificationsToInsert.length > 0) {
                await tx.insert(notifications).values(allNotificationsToInsert);
            }

            // UPDATE timestamp at the end of successful run
            await tx.insert(systemSettings)
                .values({ key: SETTING_KEY, value: now.toISOString() })
                .onConflictDoUpdate({ target: systemSettings.key, set: { value: now.toISOString() } });
        });


    } catch (error) {
        console.error("Error running daily notifications:", error);
    }
}
