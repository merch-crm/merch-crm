import redis from "./redis";

interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetIn: number; // секунд до сброса
}

/**
 * Проверка лимита запросов
 * @param key - уникальный ключ (например "login:192.168.1.1")
 * @param limit - максимум запросов
 * @param windowSec - окно времени в секундах
 */
export async function rateLimit(
    key: string,
    limit: number,
    windowSec: number
): Promise<RateLimitResult> {
    // Пропускаем лимиты в тестовом окружении и при локальной разработке
    if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_E2E) {
        return { success: true, remaining: limit, resetIn: 0 };
    }
    const redisKey = `ratelimit:${key}`;

    const multi = redis.multi();
    multi.incr(redisKey);
    multi.ttl(redisKey);

    const results = await multi.exec();

    if (!results) {
        return { success: true, remaining: limit, resetIn: 0 };
    }

    // results is an array of [error, result]
    const current = results[0][1] as number;
    let ttl = results[1][1] as number;

    // Первый запрос — установить TTL
    if (ttl === -1) {
        await redis.expire(redisKey, windowSec);
        ttl = windowSec;
    }

    return {
        success: current <= limit,
        remaining: Math.max(0, limit - current),
        resetIn: ttl,
    };
}

/**
 * Сбросить лимит (например, после успешного логина)
 */
export async function resetRateLimit(key: string): Promise<void> {
    await redis.del(`ratelimit:${key}`);
}

/**
 * Получить IP из запроса
 */
export function getClientIP(req: Request): string {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    return req.headers.get("x-real-ip") || "unknown";
}
