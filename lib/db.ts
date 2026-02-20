import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "./env";

const connectionString = env.DATABASE_URL;

const pool = new Pool({
    connectionString: connectionString,
    // Standard SSL config. Reg.ru typically uses valid certificates.
    // If they use self-signed, user can add sslmode=no-verify to the connection string.
    ssl: (
        connectionString && (
            connectionString.includes('localhost') ||
            connectionString.includes('127.0.0.1') ||
            connectionString.includes('@db') ||
            connectionString.includes('sslmode=disable')
        )
    ) || process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

import * as schema from "./schema";



const globalForDb = global as unknown as { db: NodePgDatabase<typeof schema> };

export const db = globalForDb.db || drizzle(pool, {
    schema,
    logger: process.env.NODE_ENV === "development",
});


// Export pool for direct SQL queries when needed
export { pool };

if (process.env.NODE_ENV !== "production") globalForDb.db = db;
