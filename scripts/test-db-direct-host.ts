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
        const username = url.username; // Usually postgres.[PROJECT_ID]
        if (username.includes('.')) {
            const projectId = username.split('.')[1];
            console.log(`Extracted Project ID: ${projectId}`);

            // Reconstruct direct URL
            // Format: postgresql://[user]:[pass]@db.[project-id].supabase.co:5432/postgres
            const directUrl = baseUri
                .replace(url.hostname, `db.${projectId}.supabase.co`)
                .replace(':6543', ':5432');

            console.log(`\n--- Testing Direct Connection: db.${projectId}.supabase.co ---`);
            const client = new Client({
                connectionString: directUrl + (directUrl.includes('?') ? '&' : '?') + "sslmode=require",
                connectionTimeoutMillis: 15000,
            });

            const start = Date.now();
            try {
                await client.connect();
                console.log(`✅ SUCCESS (took ${Date.now() - start}ms)`);
                const res = await client.query("SELECT NOW()");
                console.log("Query result:", res.rows[0]);
                await client.end();
            } catch (err: any) {
                console.log(`❌ FAIL (took ${Date.now() - start}ms)`);
                console.log(`   Error: ${err.message}`);
                console.log(`   Direct URL used (masked pass): ${directUrl.replace(url.password, '********')}`);
            }
        } else {
            console.log("Username format doesn't match postgres.[PROJECT_ID]. Cannot guess direct host.");
        }
    } catch (e: any) {
        console.error(`Error parsing URL: ${e.message}`);
    }
}

main();
