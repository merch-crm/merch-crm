import Redis from "ioredis";
import { env } from "./env";
import { Readable } from 'stream';

const isE2E = process.env.NEXT_PUBLIC_E2E === 'true' || process.env.NODE_ENV === 'test';

// Простая заглушка для Redis (in-memory)
class RedisMock {
    private data: Map<string, string> = new Map();
    async get(key: string) { return this.data.get(key) || null; }
    async set(key: string, value: string, ..._args: unknown[]) { this.data.set(key, value); return "OK"; }
    async del(key: string) { return this.data.delete(key) ? 1 : 0; }
    async mget(...keys: string[]) {
        return keys.map(key => this.data.get(key) || null);
    }
    async unlink(keys: string[]) { keys.forEach(k => this.data.delete(k)); return keys.length; }
    scanStream(options: { match?: string; count?: number }) {
        const s = new Readable({ objectMode: true });
        s._read = () => {
            const keys = Array.from(this.data.keys()).filter(k => {
                if (!options.match) return true;
                const regex = new RegExp(options.match.replace(/\*/g, '.*'));
                return regex.test(k);
            });
            s.push(keys);
            s.push(null);
        };
        return s;
    }
    async ping() { return "PONG"; }
    async expire(_key: string, _seconds: number) { return 1; }
    multi() {
        return {
            incr: (_key: string) => this,
            ttl: (_key: string) => this,
            expire: (_key: string, _seconds: number) => this,
            exec: async () => [[null, 1], [null, 60]]
        };
    }
    on(_event: string, _callback: (...args: unknown[]) => void) { return this; }
}

let redis: Redis | RedisMock;

if (isE2E) {
    console.log("ℹ️ Using in-memory Redis mock for E2E");
    redis = new RedisMock() as unknown as Redis;
} else {
    redis = new Redis({
        host: env.REDIS_HOST,
        port: 6379,
        password: env.REDIS_PASSWORD,
        maxRetriesPerRequest: 1, // Минимальное кол-во ретраев
        connectTimeout: 2000,    // Быстрый таймаут для локальной разработки
        retryStrategy: (times) => {
            if (times > 3) return null; // Перестаем пытаться после 3 раз
            return Math.min(times * 50, 2000);
        }
    });

    redis.on("error", (_err) => {
        if (!isE2E) console.warn("⚠️ Redis connection error, continuing without cache");
    });
}

export default redis;

export const CACHE_TTL = {
    SHORT: 60 * 5, // 5 minutes
    MEDIUM: 60 * 60, // 1 hour
    LONG: 60 * 60 * 24, // 1 day
};

// Хелпер для кэширования с продвинутой поддержкой stale-while-revalidate и защитой от cache stampede
export async function getOrSetCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM,
    staleTime: number = 60 // возвращать stale данные ещё 60 сек
): Promise<T> {
    const [cached, metadata] = await redis.mget(key, `${key}:meta`);
    
    if (cached) {
        try {
            const data = JSON.parse(cached);
            const meta = metadata ? JSON.parse(metadata) : null;
            const isStale = meta && Date.now() > meta.expiresAt;
            
            if (isStale) {
                // Фоновое обновление с блокировкой (fire-and-forget)
                (async () => {
                    const lockKey = `${key}:lock`;
                    const lock = await redis.set(lockKey, '1', 'EX', 10, 'NX');
                    if (lock) {
                        try {
                            const fresh = await fetcher();
                            if (fresh !== undefined && fresh !== null) {
                                await redis.set(key, JSON.stringify(fresh), "EX", ttl + staleTime);
                                await redis.set(`${key}:meta`, JSON.stringify({ expiresAt: Date.now() + ttl * 1000 }), "EX", ttl + staleTime);
                            }
                        } catch (e) {
                            console.error(`[Redis] SWR bg fetch error for ${key}:`, e);
                        } finally {
                            await redis.del(lockKey);
                        }
                    }
                })();
            }
            
            return data;
        } catch (e) {
            console.error("[Redis] Parse error", e);
        }
    }

    // Cache miss или ошибка парсинга: полный fetch
    const fresh = await fetcher();
    if (fresh !== undefined && fresh !== null) {
        await redis.set(key, JSON.stringify(fresh), "EX", ttl + staleTime);
        await redis.set(`${key}:meta`, JSON.stringify({ expiresAt: Date.now() + ttl * 1000 }), "EX", ttl + staleTime);
    }
    return fresh;
}

export async function invalidateCache(pattern: string) {
    const stream = redis.scanStream({
        match: pattern,
        count: 100
    });

    stream.on('data', async (keys: string[]) => {
        if (keys.length) {
            await redis.unlink(keys);
        }
    });

    return new Promise((resolve) => {
        stream.on('end', () => {
            resolve(true);
        });
    });
}
