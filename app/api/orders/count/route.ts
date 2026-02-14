import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { count } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    try {
        const result = await db.select({ value: count() }).from(orders);
        return NextResponse.json({ count: result[0].value });
    } catch {
        return NextResponse.json({ error: "Не удалось загрузить count" }, { status: 500 });
    }
}
