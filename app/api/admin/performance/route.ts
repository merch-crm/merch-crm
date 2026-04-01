import { NextResponse } from "next/server";
import { queryMonitor } from "@/lib/db/query-monitor";
import { redisCache } from "@/lib/cache";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/roles";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !isAdmin(session.roleSlug)) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const [queryStats, cacheStats] = await Promise.all([
      Promise.resolve(queryMonitor.getStats()),
      redisCache.getStats(),
    ]);

    return NextResponse.json({
      queries: {
        total: queryStats.totalQueries,
        slow: queryStats.slowQueries,
        avgDuration: queryStats.avgDuration.toFixed(2),
        maxDuration: queryStats.maxDuration.toFixed(2),
        slowPatterns: queryMonitor.getSlowPatterns(5),
      },
      cache: cacheStats,
    });
  } catch (error) {
    console.error("[Performance API]:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
