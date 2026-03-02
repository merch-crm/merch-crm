import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error("DATABASE_URL not found in .env / .env.local");
    process.exit(1);
}

const sslLocal =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1") ||
    connectionString.includes("@db") ||
    connectionString.includes("sslmode=disable") ||
    process.env.DB_SSL === "false";

const pool = new Pool({
    connectionString,
    ssl: sslLocal ? false : { rejectUnauthorized: false },
});

async function main() {
    const client = await pool.connect();
    try {
        const res = await client.query(
            `UPDATE inventory_attribute_types
             SET name = $1
             WHERE data_type = 'text' AND name = $2`,
            ["Общая", "Текст"]
        );
        console.log(`✅ Updated ${res.rowCount} row(s)`);
    } catch (e) {
        console.error("❌ Error updating:", e);
    } finally {
        client.release();
        await pool.end();
        process.exit(0);
    }
}

main();
