const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    console.log("Connected to DB.");

    try {
        const sql = fs.readFileSync('drizzle/0019_common_network.sql', 'utf8');
        // split by statement-breakpoint if needed, or just execute block
        const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);

        for (const statement of statements) {
            console.log(`Executing: ${statement.slice(0, 50)}...`);
            try {
                await client.query(statement);
            } catch (err) {
                if (err.message.includes('already exists')) {
                    console.log('Ignored already exists error.');
                } else {
                    throw err;
                }
            }
        }
        console.log("Migration applied successfully!");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await client.end();
    }
}

run();
