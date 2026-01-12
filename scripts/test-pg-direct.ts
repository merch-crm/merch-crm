import { Client } from "pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function test() {
    const connStr = process.env.DATABASE_URL?.replace('aws-1-eu-west-2.pooler.supabase.com', '13.41.127.111') + (process.env.DATABASE_URL?.includes('?') ? '&' : '?') + 'sslmode=require';
    const client = new Client({
        connectionString: connStr,
    });

    console.log("Connecting...");
    try {
        await client.connect();
        console.log("Connected successfully!");
        const res = await client.query("SELECT NOW()");
        console.log("Query result:", res.rows[0]);
        await client.end();
    } catch (err) {
        console.error("Connection error:", err);
    }
}

test();
