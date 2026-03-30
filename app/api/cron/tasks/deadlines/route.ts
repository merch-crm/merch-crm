import { checkTaskDeadlines } from "@/app/(main)/dashboard/tasks/notifications/deadline-checker";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await checkTaskDeadlines();
    return NextResponse.json(result);
  } catch (_error) {
    return NextResponse.json({ success: false, error: "Cron job failed" }, { status: 500 });
  }
}
