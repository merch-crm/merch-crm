import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({
    connectionString: connectionString,
    // Standard SSL config. Reg.ru typically uses valid certificates.
    // If they use self-signed, user can add sslmode=no-verify to the connection string.
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

import * as schema from "./schema";

const globalForDb = global as unknown as { db: any };

export const db = globalForDb.db || drizzle(pool, { schema });

if (process.env.NODE_ENV !== "production") globalForDb.db = db;
