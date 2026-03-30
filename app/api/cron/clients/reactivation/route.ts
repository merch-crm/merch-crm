import { ReactivationService } from "@/lib/services/clients/reactivation.service";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Ежедневная задача для реактивации клиентов.
 * Находит клиентов без заказов > 90 дней и создает задачи для менеджеров.
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    
    try {
        const results = await ReactivationService.processInactiveClients();
        const count = results?.length || 0;
        
        return NextResponse.json({ 
            success: true, 
            message: `Reactivation check completed. Created ${count} tasks.`,
            timestamp: new Date().toISOString()
        });
    } catch (error: unknown) {
        console.error("[Cron] Reactivation Error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ 
            success: false, 
            error: errorMessage 
        }, { status: 500 });
    }
}
