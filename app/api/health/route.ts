import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import redis from '@/lib/redis';

export const dynamic = 'force-dynamic'; // Отключить кэширование
export const revalidate = 0;

interface HealthStatus {
    status: 'ok' | 'degraded' | 'error';
    timestamp: string;
    uptime: number;
    checks: {
        database: { status: 'ok' | 'error'; latency?: number; error?: string };
        redis: { status: 'ok' | 'error' | 'skipped'; latency?: number; error?: string };
        storage: { status: 'ok' | 'error' | 'skipped' };
    };
    version?: string;
}

const startTime = Date.now();

export async function GET() {
    const health: HealthStatus = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - startTime) / 1000),
        checks: {
            database: { status: 'ok' },
            redis: { status: 'skipped' },
            storage: { status: 'skipped' },
        },
        version: process.env.npm_package_version || '0.1.0',
    };

    // Проверка PostgreSQL
    try {
        const dbStart = Date.now();
        await db.execute(sql`SELECT 1`);
        health.checks.database = {
            status: 'ok',
            latency: Date.now() - dbStart,
        };
    } catch (error) {
        health.status = 'error';
        health.checks.database = {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }

    // Проверка Redis (если используется)
    try {
        const redisStart = Date.now();
        await redis.ping();
        health.checks.redis = {
            status: 'ok',
            latency: Date.now() - redisStart,
        };
    } catch (error) {
        // Redis не критичен — статус degraded, не error
        if (health.status === 'ok') health.status = 'degraded';
        health.checks.redis = {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }

    const httpStatus = health.status === 'error' ? 503 : 200;

    return Response.json(health, {
        status: httpStatus,
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
    });
}
