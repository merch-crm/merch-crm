"use server";

import { db } from "@/lib/db";
import { clients } from "@/lib/schema/clients/main";
import { eq, ne, or, ilike, sql, type SQL, desc, and } from "drizzle-orm";
import { logError } from "@/lib/error-logger";
import { ActionResult } from "@/lib/types";

export async function checkClientDuplicates(data: {
    phone?: string;
    email?: string;
    lastName?: string;
    firstName?: string;
    company?: string;
    excludeClientId?: string;
}): Promise<ActionResult<(typeof clients.$inferSelect)[]>> {
    try {
        const conditions: (SQL | undefined)[] = [];

        if (data.phone) {
            const digits = data.phone.replace(/\D/g, "");
            if (digits.length >= 6) {
                conditions.push(sql`regexp_replace(${clients.phone}, '\\D', '', 'g') LIKE ${'%' + digits + '%'}`);
            }
        }

        if (data.email && data.email.trim().length > 3 && data.email.includes("@")) {
            conditions.push(ilike(clients.email, data.email.trim()));
        }

        if (data.lastName && data.firstName && data.lastName.trim().length > 1 && data.firstName.trim().length > 1) {
            conditions.push(and(
                ilike(clients.lastName, data.lastName.trim()),
                ilike(clients.firstName, data.firstName.trim())
            ));
        }

        if (data.company && data.company.trim().length >= 3) {
            const companyPattern = `%${data.company.trim()}%`;
            conditions.push(ilike(clients.company, companyPattern));
        }

        if (conditions.length === 0) {
            return { success: true, data: [] };
        }

        const filtered = conditions.filter((c): c is SQL => !!c);
        if (filtered.length === 0) {
            return { success: true, data: [] };
        }

        const duplicates = await db.select()
            .from(clients)
            .where(
                and(
                    eq(clients.isArchived, false),
                    data.excludeClientId ? ne(clients.id, data.excludeClientId) : undefined,
                    or(...filtered)
                )
            )
            .orderBy(desc(clients.createdAt))
            .limit(5);

        return { success: true, data: duplicates };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients/actions", method: "checkClientDuplicates" });
        return { success: false, error: "Ошибка при проверке дубликатов" };
    }
}


