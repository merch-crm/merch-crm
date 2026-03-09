type CacheValue<T> = {
    data: T;
    timestamp: number;
};

class InMemoryCache {
    private cache: Map<string, CacheValue<unknown>> = new Map();
    private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

    set(key: string, data: unknown, ttl: number = this.defaultTTL) {
        this.cache.set(key, {
            data,
            timestamp: Date.now() + ttl,
        });
    }

    get<T>(key: string): T | null {
        const value = this.cache.get(key);
        if (!value) return null;

        if (Date.now() > value.timestamp) {
            this.cache.delete(key);
            return null;
        }

        return value.data as T;
    }

    delete(key: string) {
        this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    invalidateByPattern(pattern: string | RegExp) {
        for (const key of this.cache.keys()) {
            if (typeof pattern === 'string' ? key.includes(pattern) : pattern.test(key)) {
                this.cache.delete(key);
            }
        }
    }
}

export const cache = new InMemoryCache();
