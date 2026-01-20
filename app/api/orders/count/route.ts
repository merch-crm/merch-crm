import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { count } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await db.select({ value: count() }).from(orders);
        return NextResponse.json({ count: result[0].value });
    } catch {
        return NextResponse.json({ error: "Failed to fetch count" }, { status: 500 });
    }
}
