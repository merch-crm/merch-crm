import { Client } from "pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const baseUri = process.env.DATABASE_URL || "";

async function main() {
    if (!baseUri) {
        console.error("DATABASE_URL not set");
        process.exit(1);
    }

    try {
        const url = new URL(baseUri);
        const password = url.password;
        const encodedPassword = encodeURIComponent(password);

        // Reconstruct URL with encoded password
        const encodedUri = baseUri.replace(password, encodedPassword) + (baseUri.includes('?') ? '&' : '?') + "sslmode=require";

        console.log(`\n--- Testing with Encoded Password ---`);
        const client = new Client({
            connectionString: encodedUri,
            connectionTimeoutMillis: 15000,
        });

        const start = Date.now();
        try {
            await client.connect();
            console.log(`✅ SUCCESS (took ${Date.now() - start}ms)`);
            await client.end();
        } catch (err: any) {
            console.log(`❌ FAIL (took ${Date.now() - start}ms)`);
            console.log(`   Error: ${err.message}`);
        }
    } catch (e: any) {
        console.error(`Error: ${e.message}`);
    }
}

main();
