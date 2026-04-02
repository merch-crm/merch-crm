import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "./env";

const connectionString = env.DATABASE_URL;
if (process.env.NODE_ENV === "development") {
    const maskedUrl = connectionString?.replace(/:([^:@]+)@/, ":****@");
    console.log(`[DB] Using connection string: ${maskedUrl}`);
}

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
        // Local connections or explicit disable flag
        const isLocalConnection = connectionString && (
            connectionString.includes('localhost') ||
            connectionString.includes('127.0.0.1') ||
            connectionString.includes('@db')
        );
        const sslModeDisable = connectionString?.includes('sslmode=disable');
        const forceDisableSsl = process.env.DB_SSL === 'false';

        if (isLocalConnection || sslModeDisable || forceDisableSsl) {
            return false;
        }
        
        // Production Hardening (Reg.ru / External DB)
        // If CA certificate is provided, use it for validation.
        // In production, we strongly prefer rejectUnauthorized: true.
        if (env.NODE_ENV === "production") {
            return {
                rejectUnauthorized: true,
                ca: process.env.DATABASE_CA_CERT || undefined,
            };
        }

        // Development/Staging fallback if no cert is provided
        return { rejectUnauthorized: false };
    })(),
    max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 10, // Оптимизировано для баланса serverless/standalone
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

export const db = globalForDb.db || drizzle(pool, {
    schema,
});

if (process.env.NODE_ENV !== "production") {
    globalForDb.db = db;
    globalForDb.pool = pool;
}


// Export pool for direct SQL queries when needed
// (Already exported above)
