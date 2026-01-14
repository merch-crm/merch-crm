import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
    try {
        // Проверка подключения к базе данных
        await db.execute(sql`SELECT 1`);

        return NextResponse.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            database: "connected"
        });
    } catch (error) {
        console.error("Healthcheck failed:", error);
        return NextResponse.json({
            status: "error",
            database: "disconnected",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
