import { pool } from "@/lib/db";
import { poolMonitor } from "@/lib/db/pool-monitor";

let isShuttingDown = false;

export async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log(`\n[Shutdown] Получен сигнал ${signal}, начинаем завершение...`);
  
  poolMonitor.stop();
  
  const timeout = 30000;
  const startTime = Date.now();
  
  while (pool.totalCount - pool.idleCount > 0) {
    if (Date.now() - startTime > timeout) {
      console.warn("[Shutdown] Таймаут ожидания активных запросов");
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  try {
    await pool.end();
    console.log("[Shutdown] Пул соединений закрыт");
  } catch (error) {
    console.error("[Shutdown] Ошибка закрытия пула:", error);
  }
  
  console.log("[Shutdown] Завершение выполнено");
  process.exit(0);
}

if (typeof process !== "undefined") {
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}
