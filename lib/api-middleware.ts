import { NextResponse } from "next/server";
import { rateLimit, getClientIP } from "./rate-limit";
import { RATE_LIMITS, RateLimitType } from "./rate-limit-config";

interface RateLimitOptions {
    type: RateLimitType;
    keyPrefix?: string; // дополнительный префикс (например, userId)
}

/**
 * Обёртка для API-роутов с Rate Limiting
 */
export function withRateLimit(
    handler: (req: Request) => Promise<Response>,
    options: RateLimitOptions
) {
    return async (req: Request): Promise<Response> => {
        const config = RATE_LIMITS[options.type];
        const ip = getClientIP(req);
        const key = options.keyPrefix
            ? `${options.type}:${options.keyPrefix}:${ip}`
            : `${options.type}:${ip}`;

        const result = await rateLimit(key, config.limit, config.windowSec);

        if (!result.success) {
            return NextResponse.json(
                {
                    error: config.message,
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

        // Выполняем основной хендлер
        const response = await handler(req);

        // Добавляем заголовки к ответу
        // Клонируем response чтобы добавить заголовки (Response immutable в некоторых средах, но в Next.js App Router можно так)
        // Однако, если handler возвращает NextResponse, он мутируемый.
        // Если это нативный Response, нужно создавать новый.

        const headers = new Headers(response.headers);
        headers.set("X-RateLimit-Limit", String(config.limit));
        headers.set("X-RateLimit-Remaining", String(result.remaining));
        headers.set("X-RateLimit-Reset", String(result.resetIn));

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers
        });
    };
}
