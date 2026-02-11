import Redis from "ioredis";

const redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
});

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

    stream.on('data', async (keys) => {
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
