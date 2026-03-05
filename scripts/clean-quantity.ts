import { Pool } from "pg";
import { config } from "dotenv";

config({ path: ".env" });
config({ path: ".env.local" });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function main() {
    console.log("Starting cleanup of 'quantity' attributes via raw SQL...");
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const typesRes = await client.query(`SELECT slug FROM "inventory_attribute_types" WHERE "data_type" = $1`, ['quantity']);
        const slugs = typesRes?.rows?.map(r => r.slug) || [];

        console.log(`Found ${slugs.length} AttributeType records with dataType='quantity'.`);

        if (slugs.length > 0) {
            // Because IN ($1, $2...) requires expanding, let's use ANY
            const deletedAttrs = await client.query(`DELETE FROM "inventory_attributes" WHERE "type" = ANY($1) RETURNING id`, [slugs]);
            console.log(`Deleted ${deletedAttrs.rowCount} Attribute records related to 'quantity'.`);
        }

        const deletedTypes = await client.query(`DELETE FROM "inventory_attribute_types" WHERE "data_type" = $1 RETURNING id`, ['quantity']);
        console.log(`Deleted ${deletedTypes.rowCount} AttributeType records.`);

        await client.query('COMMIT');
        console.log("Cleanup complete!");
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Error during cleanup:", e);
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(console.error);
