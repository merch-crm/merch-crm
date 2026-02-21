import Redis from "ioredis";
import { env } from "./env";
import { Readable } from 'stream';

const isE2E = process.env.NEXT_PUBLIC_E2E === 'true';

// Простая заглушка для Redis (in-memory)
class RedisMock {
    private data: Map<string, string> = new Map();
    async get(key: string) { return this.data.get(key) || null; }
    async set(key: string, value: string, ..._args: unknown[]) { this.data.set(key, value); return "OK"; }
    async del(key: string) { return this.data.delete(key) ? 1 : 0; }
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

// Хелпер для кэширования
export async function getOrSetCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM
): Promise<T> {
    const cached = await redis.get(key);
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (e) {
            console.error("Redis parse error", e);
        }
    }

    const data = await fetcher();
    if (data !== undefined && data !== null) {
        await redis.set(key, JSON.stringify(data), "EX", ttl);
    }
    return data;
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
