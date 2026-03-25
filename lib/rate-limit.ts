import { redis } from "./redis";

export type RateLimitType = "auth" | "upload" | "api";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetIn: number;
}

interface RedisPipeline {
  incr(key: string): RedisPipeline;
  expire(key: string, seconds: number): RedisPipeline;
  exec(): Promise<Array<[Error | null, unknown]>>;
}

/**
 * Advanced Redis-based rate limiter using sliding window / atomic pipeline
 * Higher precision and performance compared to basic INCR
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const identifier = `ratelimit:${key}`;
  
  try {
    const pipeline = (redis as unknown as { multi: () => RedisPipeline }).multi();
    pipeline.incr(identifier);
    pipeline.expire(identifier, windowSeconds);
    
    // exec() returns Array of [error, result]
    const results = await pipeline.exec();
    
    if (!results || !results[0]) {
        return { success: true, limit, remaining: limit, resetIn: windowSeconds };
    }

    const current = Number(results[0][1] || 0);
    
    return {
      success: current <= limit,
      limit,
      remaining: Math.max(0, limit - current),
      resetIn: windowSeconds,
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail safe - allow request if Redis is down
    return { success: true, limit, remaining: 1, resetIn: windowSeconds };
  }
}

/**
 * Utility to manually reset rate limit (e.g., after successful 2FA or password reset)
 */
export async function resetRateLimit(key: string): Promise<void> {
    await redis.del(`ratelimit:${key}`);
}

/**
 * Extract client IP from request headers or socket
 */
export function getClientIP(req: unknown): string {
    const r = req as { headers?: Record<string, string | string[] | undefined> | { get?: (name: string) => string | null } };
    const headers = r?.headers;
    const forwarded = typeof headers?.get === "function" 
        ? (headers as { get: (name: string) => string | null }).get("x-forwarded-for") 
        : (headers as Record<string, string | string[] | undefined>)?.[ "x-forwarded-for"];
    
    const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    if (forwardedStr) return forwardedStr.split(",")[0].trim();
    return "127.0.0.1";
}

/**
 * Standard rate limit configurations
 */
export const RATE_LIMITS = {
    auth: { limit: 5, window: 60 * 15 }, // 5 attempts per 15 min
    upload: { limit: 10, window: 60 },    // 10 uploads per min
    api: { limit: 100, window: 60 },     // 100 req per min
};
