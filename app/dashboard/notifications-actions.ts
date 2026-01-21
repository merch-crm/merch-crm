"use server";

import { db } from "@/lib/db";
import { systemSettings, users, clients, orders, notifications, roles } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

export async function checkAndRunNotifications() {
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

        console.log("Running daily notification checks...");

        // UPDATE timestamp immediately to prevent double runs
        await db.insert(systemSettings)
            .values({ key: SETTING_KEY, value: now.toISOString() })
            .onConflictDoUpdate({ target: systemSettings.key, set: { value: now.toISOString() } });

        // 2. Run Checks

        // A. Birthdays (Users)
        // Check users whose birthday is today (ignoring year)
        // Postgres: extract(month from birthday) = extract(month from now) AND extract(day from birthday) = extract(day from now)
        const birthdayUsers = await db.select()
            .from(users)
            .where(
                sql`EXTRACT(MONTH FROM ${users.birthday}) = EXTRACT(MONTH FROM CURRENT_DATE) 
                AND EXTRACT(DAY FROM ${users.birthday}) = EXTRACT(DAY FROM CURRENT_DATE)`
            );

        if (birthdayUsers.length > 0) {
            // Notify everyone about birthdays? Or just Admins? Usually everyone.
            // Let's create a "General" notification or notify all active users.
            // For simplicity, let's notify all users.
            const allUsers = await db.select({ id: users.id }).from(users).where(eq(users.isSystem, false));

            for (const bDayUser of birthdayUsers) {
                const message = `Сегодня день рождения у сотрудника ${bDayUser.name}! 🎉`;

                // Bulk insert notifications
                const notifs = allUsers.map(u => ({
                    userId: u.id,
                    title: "День рождения!",
                    message: message,
                    type: "info" as const,
                    isRead: false
                }));

                if (notifs.length > 0) {
                    await db.insert(notifications).values(notifs);
                }
            }
        }

        // B. Lost Clients (No orders for 90 days)
        // Find clients with last order > 90 days ago OR no orders created > 90 days ago?
        // Usually "Active clients who stopped ordering".
        // Let's define "Lost" as: Has at least one completed order, but last order is older than 90 days.

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const lostClientsResult = await db.execute(sql`
            SELECT c.id, c.name, c.company, c.manager_id, MAX(o.created_at) as last_order_date
            FROM ${clients} c
            JOIN ${orders} o ON c.id = o.client_id
            GROUP BY c.id, c.name, c.company, c.manager_id
            HAVING MAX(o.created_at) < ${threeMonthsAgo.toISOString()}
            AND MAX(o.created_at) > ${new Date(threeMonthsAgo.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()} -- Only notify if "just" became lost (e.g. within last week window to avoid spamming every day)
        `);

        // Note: The "just became lost" logic (HAVING clause) is important to avoid daily spam.
        // We check if last order was between 90 days ago and 97 days ago. 
        // If we just check < 90, we will re-notify every day.

        for (const client of lostClientsResult.rows) {
            // Notify Manager and Admins
            const targetUserIds = new Set<string>();
            if (client.manager_id) targetUserIds.add(client.manager_id as string);

            // Get admins
            // Simplified: Fetch users with role "Администратор"
            const adminUsers = await db.select({ id: users.id })
                .from(users)
                .leftJoin(systemSettings, sql`TRUE`) // Dummy join
                // Better: join roles
                .innerJoin(roles, eq(users.roleId, roles.id))
                .where(eq(roles.name, 'Администратор'));

            adminUsers.forEach(a => targetUserIds.add(a.id));

            const message = `Клиент ${client.name} (${client.company || 'Без компании'}) не делал заказов более 3 месяцев.`;

            const notifs = Array.from(targetUserIds).map(uid => ({
                userId: uid,
                title: "Потерянный клиент",
                message: message,
                type: "warning" as const,
                isRead: false
            }));

            if (notifs.length > 0) {
                await db.insert(notifications).values(notifs);
            }
        }

        console.log("Daily notifications check completed.");

    } catch (error) {
        console.error("Error running daily notifications:", error);
    }
}
