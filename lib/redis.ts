
import Redis from "ioredis";
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

// Mock Redis for test environments without a real Redis server
class RedisMock {
  private data: Map<string, string> = new Map();
  
  async get(key: string) { return this.data.get(key) || null; }
  async set(key: string, value: string, _mode?: string, _duration?: number) { 
    this.data.set(key, value); 
    return "OK"; 
  }
  async del(key: string) { return this.data.delete(key) ? 1 : 0; }
  async incr(key: string) {
    const val = parseInt(this.data.get(key) || "0") + 1;
    this.data.set(key, val.toString());
    return val;
  }
  async expire(_key: string, _seconds: number) { return 1; }
  async ttl(_key: string) { return 60; }
  
  multi() {
    const commands: (() => Promise<unknown>)[] = [];
    const proxy = {
      incr: (key: string) => {
        commands.push(() => this.incr(key));
        return proxy;
      },
      expire: (key: string, seconds: number) => {
        commands.push(() => this.expire(key, seconds));
        return proxy;
      },
      ttl: (key: string) => {
        commands.push(() => this.ttl(key));
        return proxy;
      },
      exec: async () => {
        const results = [];
        for (const cmd of commands) {
          results.push([null, await cmd()]);
        }
        return results;
      }
    };
    return proxy;
  }

  async keys(pattern: string) {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    return Array.from(this.data.keys()).filter(key => regex.test(key));
  }
  
  async ping() { return "PONG"; }
  
  async flushall() { this.data.clear(); return "OK"; }
}

const isTest = process.env.NODE_ENV === "test" || process.env.VITEST === "true";

/** Singleton Redis instance */
declare global {
  // eslint-disable-next-line no-var
  var redis: Redis | RedisMock | undefined;
}

export const redis = global.redis || (isTest ? new RedisMock() : new Redis(redisOptions));

if (process.env.NODE_ENV !== "production") {
  global.redis = redis;
}

/** Invalidate cache pattern helper */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      // Use cast to void because we don't care about the return value of del
      await (redis as unknown as { del: (keys: string[]) => Promise<number> }).del(keys);
    }
  } catch (err) {
    console.error(`Redis invalidation error for pattern ${pattern}:`, err);
  }
}
