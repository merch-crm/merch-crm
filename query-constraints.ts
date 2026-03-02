import { db } from "./lib/db";
import { sql } from "drizzle-orm";

async function run() {
    try {
        const res = await db.execute(sql`
            SELECT
                t.relname AS table_name,
                i.relname AS index_name,
                a.attname AS column_name
            FROM
                pg_class t,
                pg_class i,
                pg_index ix,
                pg_attribute a
            WHERE
                t.oid = ix.indrelid
                AND i.oid = ix.indexrelid
                AND a.attrelid = t.oid
                AND a.attnum = ANY(ix.indkey)
                AND t.relkind = 'r'
                AND t.relname = 'inventory_attribute_types'
                AND ix.indisunique = true;
        `);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
run();
