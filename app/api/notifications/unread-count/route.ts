import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ count: 0 });

    try {
        const result = await db.query.notifications.findMany({
            where: and(
                eq(notifications.userId, session.id),
                eq(notifications.isRead, false)
            ),
            columns: { id: true }
        });

        return NextResponse.json({ count: result.length });
    } catch (error) {
        return NextResponse.json({ count: 0 });
    }
}
