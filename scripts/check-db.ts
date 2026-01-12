import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
    const { db } = await import("@/lib/db");
    const { sql } = await import("drizzle-orm");

    console.log("Database Connection Test...");
    try {
        const tables = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log("Tables found:", tables.rows.map((r: any) => r.table_name));

        const usersCols = await db.execute(sql`
            SELECT column_name FROM information_schema.columns WHERE table_name = 'users'
        `);
        console.log("Users columns:", usersCols.rows.map((r: any) => r.column_name));

        const clientsCols = await db.execute(sql`
            SELECT column_name FROM information_schema.columns WHERE table_name = 'clients'
        `);
        console.log("Clients columns:", clientsCols.rows.map((r: any) => r.column_name));

        const session = await db.execute(sql`SELECT count(*) FROM users`);
        console.log("Users count:", session.rows[0].count);

    } catch (error) {
        console.error("Database check failed:", error);
    }
    process.exit(0);
}

main();
