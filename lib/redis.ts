
import Redis from "ioredis";
import type { RedisMock } from "./redis-mock";
import { env } from "@/lib/env";

const redisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  connectTimeout: 2000,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  maxRetriesPerRequest: 1,
};

// RedisMock вынесен в lib/redis-mock.ts и загружается динамически для оптимизации Production bundle

const isTest = process.env.NODE_ENV === "test" || process.env.VITEST === "true";
const skipRedis = process.env.SKIP_REDIS === "true";

/** Singleton Redis instance */
declare global {
   
  var redis: Redis | RedisMock | undefined;
}

// Загрузка инстанса (TLA - Top Level Await безопасен для сервера Next.js)
let redisInstance: Redis | RedisMock;

if (global.redis) {
  redisInstance = global.redis;
} else if (isTest || skipRedis) {
  // Динамический импорт: Webpack вынесет этот код в отдельный файл (Chunk),
  // что гарантирует чистоту Production bundle от тестовых моков.
  const { RedisMock } = await import("./redis-mock");
  redisInstance = new RedisMock();
} else {
  redisInstance = new Redis(redisOptions);
}

export const redis = redisInstance;

if (process.env.NODE_ENV !== "production") {
  global.redis = redis;
}

/** Invalidate cache pattern helper using SCAN (non-blocking) */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    let cursor = "0";
    do {
      // Ищем ключи пачками по 100 штук
      const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100) as [string, string[]];
      cursor = nextCursor;

      if (keys.length > 0) {
        // Удаляем локальные батчи, чтобы не нагружать Redis
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  } catch (err) {
    console.error(`Redis invalidation error for pattern ${pattern}:`, err);
  }
}
