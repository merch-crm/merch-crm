import { checkTaskDeadlines } from "@/app/(main)/dashboard/tasks/notifications/deadline-checker";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Проверка авторизации (например, по секретному ключу в заголовке)
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (key !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await checkTaskDeadlines();
    return NextResponse.json(result);
  } catch (_error) {
    return NextResponse.json({ success: false, error: "Cron job failed" }, { status: 500 });
  }
}
