import * as dotenv from "dotenv";
import { pgTable, text } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });

async function checkDb() {
    const databaseUrl = process.env.DATABASE_URL;
    console.log("Checking DB connection...");

    const pool = new Pool({
        connectionString: databaseUrl,
    });

    try {
        const client = await pool.connect();
        console.log("✓ Connected successfully!");

        const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log("Tables in public schema:");
        res.rows.forEach(row => console.log("- " + row.table_name));

        const userCols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        console.log("\nColumns in 'users' table:");
        userCols.rows.forEach(row => console.log("- " + row.column_name));

        client.release();
    } catch (err) {
        console.error("Connection error:", err);
    } finally {
        await pool.end();
    }
}

checkDb();
