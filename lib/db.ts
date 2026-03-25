import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "./env";

const connectionString = env.DATABASE_URL;

import * as schema from "./schema";

const globalForDb = global as unknown as {
    db: NodePgDatabase<typeof schema>;
    pool: Pool;
};

export const pool = globalForDb.pool || new Pool({
    connectionString: connectionString,
    // Standard SSL config. Reg.ru typically uses valid certificates.
    // If they use self-signed, user can add sslmode=no-verify to the connection string.
    ssl: (function() {
        const isLocalConnection = connectionString && (
            connectionString.includes('localhost') ||
            connectionString.includes('127.0.0.1') ||
            connectionString.includes('@db') ||
            connectionString.includes('sslmode=disable')
        );
        const forceDisableSsl = process.env.DB_SSL === 'false';

        if (isLocalConnection || forceDisableSsl) {
            return false;
        }
        
        return { rejectUnauthorized: false };
    })(),
    max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 10, // Оптимизировано для баланса serverless/standalone
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

import { queryMonitor } from "./db/query-monitor";

export const db = globalForDb.db || drizzle(pool, {
    schema,
    logger: process.env.NODE_ENV === "development" ? {
        logQuery(query: string, params: unknown[]): void {
            const start = performance.now();
            // We use a small timeout to capture the execution after results are returned
            // to get a better duration estimate if possible, 
            // but Drizzle's logger is usually called before execution.
            // For more accuracy, we could wrap the client, but this is a good start.
            setTimeout(() => {
                const duration = performance.now() - start;
                queryMonitor.logQuery(query, duration, params);
            }, 0);
        },
    } : undefined,
});

if (process.env.NODE_ENV !== "production") {
    globalForDb.db = db;
    globalForDb.pool = pool;
}


// Export pool for direct SQL queries when needed
// (Already exported above)
