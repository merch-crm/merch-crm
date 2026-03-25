import { NextResponse, NextRequest } from "next/server";
import { rateLimit, getClientIP, RATE_LIMITS, RateLimitType } from "./rate-limit";

interface RateLimitOptions {
    type: RateLimitType;
    keyPrefix?: string;
}

/**
 * Обёртка для API-роутов с Rate Limiting
 */
export function withRateLimit(
    handler: (req: NextRequest) => Promise<Response>,
    options: RateLimitOptions
) {
    return async (req: NextRequest): Promise<Response> => {
        const config = RATE_LIMITS[options.type];
        const ip = getClientIP(req);
        const key = options.keyPrefix
            ? `${options.type}:${options.keyPrefix}:${ip}`
            : `${options.type}:${ip}`;

        const result = await rateLimit(key, config.limit, config.window);

        if (!result.success) {
            return NextResponse.json(
                {
                    error: "Превышен лимит запросов. Повторите позже.",
                    retryAfter: result.resetIn,
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(result.resetIn),
                        "X-RateLimit-Limit": String(config.limit),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": String(result.resetIn),
                    },
                }
            );
        }

        const response = await handler(req);

        const headers = new Headers(response.headers);
        headers.set("X-RateLimit-Limit", String(config.limit));
        headers.set("X-RateLimit-Remaining", String(result.remaining));
        headers.set("X-RateLimit-Reset", String(result.resetIn));

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
        });
    };
}
