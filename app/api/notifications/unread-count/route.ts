import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { notifications } from "@/lib/schema/system";
import { eq, and, count } from "drizzle-orm";

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ count: 0 });

    try {
        const [result] = await db
            .select({ value: count() })
            .from(notifications)
            .where(
                and(
                    eq(notifications.userId, session.id),
                    eq(notifications.isRead, false)
                )
            );

        return NextResponse.json({ count: result?.value || 0 });
    } catch {
        return NextResponse.json({ count: 0 });
    }
}
