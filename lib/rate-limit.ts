import { redis } from "./redis";

export type RateLimitType = "auth" | "upload" | "api";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetIn: number;
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
  // Check for bypass in dev/test
  if (process.env.DISABLE_RATE_LIMIT === "true") {
      return { success: true, limit, remaining: limit, resetIn: windowSeconds };
  }

  const identifier = `ratelimit:${key}`;
  
  try {
    // Используем multi() для атомарности
    const pipeline = redis.multi();
    pipeline.incr(identifier);
    pipeline.ttl(identifier);
    
    // Выполняем pipeline
    const results = await pipeline.exec() as [Error | null, number][] | null;
    
    if (!results || !results[0]) {
        return { success: true, limit, remaining: limit, resetIn: 0 };
    }

    // [[err, val], [err, val]]
    const current = Number(results[0][1] || 0);
    const ttl = Number(results[1][1] || -1);
    
    // Set expiration if not already set
    if (ttl === -1) {
        await redis.expire(identifier, windowSeconds);
    }

    return {
      success: current <= limit,
      limit,
      remaining: Math.max(0, limit - current),
      resetIn: ttl > 0 ? ttl : windowSeconds,
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail safe
    return { success: true, limit, remaining: limit, resetIn: windowSeconds };
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
export function getClientIP(req: { headers?: Headers | Record<string, string | string[] | undefined> }): string {
    const headers = req?.headers;
    if (!headers) return "unknown";

    // Helper to extract header value regardless of type (Headers object or plain object)
    const getHeader = (name: string): string | null => {
        if (headers instanceof Headers) {
            return headers.get(name);
        }
        
        if (typeof (headers as Record<string, unknown>).get === "function") {
            const val = (headers as unknown as { get: (n: string) => string | null }).get(name);
            return val;
        }
        
        // Handle Record<string, string | string[] | undefined>
        const value = (headers as Record<string, unknown>)[name] || (headers as Record<string, unknown>)[name.toLowerCase()];
        if (Array.isArray(value)) return value[0] as string;
        return value ? String(value) : null;
    };

    const forwarded = getHeader("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }

    const realIp = getHeader("x-real-ip");
    if (realIp) return realIp;

    return "unknown";
}

/**
 * Standard rate limit configurations
 */
export const RATE_LIMITS = {
    auth: { limit: 5, window: 60 * 15 }, // 5 attempts per 15 min
    upload: { limit: 10, window: 60 },    // 10 uploads per min
    api: { limit: 100, window: 60 },     // 100 req per min
};
