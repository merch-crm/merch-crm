import { NPSService } from "@/lib/services/nps.service";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Ежедневная задача для обработки NPS запросов.
 * Находит доставленные заказы (> 3 дней назад) и создает/отправляет запросы NPS.
 * 
 * В продакшене вызывается через Vercel Cron или GitHub Actions.
 * Пример настройки в vercel.json:
 * {
 *  "crons": [{
 *   "path": "/api/cron/nps",
 *   "schedule": "0 10 * * *"
 *  }]
 * }
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    await NPSService.processPendingNPS();
    
    return NextResponse.json({ 
      success: true, 
      message: "NPS requests processed successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    console.error("Cron NPS Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}
