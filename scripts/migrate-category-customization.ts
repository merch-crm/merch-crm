import dotenv from "dotenv";
import path from "path";
import fs from "fs";
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import { db } from "@/lib/db";

async function main() {
    console.log("Starting migration: add_category_customization...");

    try {
        const sqlPath = path.join(process.cwd(), "migrations", "add_category_customization.sql");
        const sql = fs.readFileSync(sqlPath, "utf8");

        // Split by semicolon to handle multiple statements if any, though here simple exec might work
        const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

        for (const statement of statements) {
            await db.execute(statement);
        }

        console.log("Migration applied successfully!");
    } catch (error) {
        console.error("Migration failed:", error);
    }
    process.exit(0);
}

main();
