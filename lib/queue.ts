import { after } from "next/server";
import { recalculateClientStats } from "@/app/(main)/dashboard/clients/actions/stats.actions";

/**
 * Отложенное обновление статистики клиента (фона).
 * Помогает избежать блокировки основного потока (Promise.all или await) при высокой нагрузке.
 * Использует Next.js `after()` (или Promise-запуск), как альтернативу Redis pub/sub.
 */
export function queueClientStatsUpdate(clientId: string) {
    try {
        if (typeof after === 'function') {
            after(async () => {
                try {
                    await recalculateClientStats(clientId);
                } catch (e) {
                    console.error("[Queue] Failed to update client stats:", e);
                }
            });
        } else {
            // Фолбэк для систем без `after`
            Promise.resolve().then(async () => {
                try {
                    await recalculateClientStats(clientId);
                } catch (e) {
                    console.error("[Queue] Failed to update client stats:", e);
                }
            });
        }
    } catch (_e) {
        // Ignored
    }
}
