import { Client } from "pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const baseUri = process.env.DATABASE_URL || "";

async function tryConnect(name: string, connectionString: string) {
    console.log(`\n--- Testing: ${name} ---`);
    const client = new Client({
        connectionString,
        connectionTimeoutMillis: 10000,
    });

    const start = Date.now();
    try {
        await client.connect();
        console.log(`✅ SUCCESS: ${name} (took ${Date.now() - start}ms)`);
        await client.end();
        return true;
    } catch (err: any) {
        console.log(`❌ FAIL: ${name} (took ${Date.now() - start}ms)`);
        console.log(`   Error: ${err.message}`);
        // If it's a timeout or connection terminated, we know it's a network/protocol issue
        return false;
    }
}

async function main() {
    if (!baseUri) {
        console.error("DATABASE_URL not set");
        process.exit(1);
    }

    // Variations
    const variants = [
        { name: "Default", url: baseUri },
        { name: "SSL Mode Require", url: baseUri + (baseUri.includes('?') ? '&' : '?') + "sslmode=require" },
        { name: "SSL Mode Disable", url: baseUri + (baseUri.includes('?') ? '&' : '?') + "sslmode=disable" },
        { name: "Supavisor Session", url: baseUri + (baseUri.includes('?') ? '&' : '?') + "supavisor_session_id=debug" + Math.random().toString(36).substring(7) },
        { name: "PgBouncer Mode", url: baseUri + (baseUri.includes('?') ? '&' : '?') + "pgbouncer=true" },
    ];

    for (const v of variants) {
        await tryConnect(v.name, v.url);
    }
}

main();
