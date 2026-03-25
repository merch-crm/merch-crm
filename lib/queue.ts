import { after } from "next/server";
import { recalculateClientStats } from "@/app/(main)/dashboard/clients/actions/stats.actions";

/** Максимальное количество повторных попыток */
const MAX_RETRIES = 3;

/** Задержка между попытками (ms) */
const RETRY_DELAYS = [1000, 5000, 15000];

/**
 * Отложенное обновление статистики клиента
 * 
 * @description Использует Next.js after() для фоновой обработки.
 * Включает retry-логику и логирование ошибок.
 * 
 * @param clientId - ID клиента для обновления статистики
 */
export function queueClientStatsUpdate(clientId: string) {
  const executeWithRetry = async (attempt = 0): Promise<void> => {
    try {
      await recalculateClientStats(clientId);
      
      if (process.env.NODE_ENV === "development") {
        console.log(`[Queue] Статистика клиента ${clientId} обновлена`);
      }
    } catch (error) {
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAYS[attempt] || 15000;
        console.warn(
          `[Queue] Ошибка обновления статистики клиента ${clientId}, ` +
          `попытка ${attempt + 1}/${MAX_RETRIES}, повтор через ${delay}ms`
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeWithRetry(attempt + 1);
      }
      
      console.error(
        `[Queue] Не удалось обновить статистику клиента ${clientId} ` +
        `после ${MAX_RETRIES} попыток:`,
        error
      );
    }
  };

  // Используем after() если доступен, иначе setImmediate
  if (typeof after === "function") {
    try {
      after(() => executeWithRetry());
    } catch {
      // Fallback if after is called outside a request scope (e.g. in tests)
      setImmediate(() => executeWithRetry());
    }
  } else {
    setImmediate(() => executeWithRetry());
  }
}

/**
 * Универсальная функция для добавления задачи в очередь
 */
export function queueTask(
  taskName: string,
  task: () => Promise<void>,
  options: { maxRetries?: number; context?: Record<string, unknown> } = {}
) {
  const { maxRetries = MAX_RETRIES } = options;
  
  const executeWithRetry = async (attempt = 0): Promise<void> => {
    try {
      await task();
    } catch (error) {
      if (attempt < maxRetries) {
        const delay = RETRY_DELAYS[attempt] || 15000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeWithRetry(attempt + 1);
      }
      console.error(`[Queue Failed] ${taskName}: `, error);
    }
  };

  if (typeof after === "function") {
    try {
      after(() => executeWithRetry());
    } catch {
      setImmediate(() => executeWithRetry());
    }
  } else {
    setImmediate(() => executeWithRetry());
  }
}
