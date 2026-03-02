import { db } from "./lib/db";
import { systemErrors } from "./lib/schema";
import { desc } from "drizzle-orm";

async function run() {
    try {
        const errors = await db.select().from(systemErrors).orderBy(desc(systemErrors.createdAt)).limit(10);
        console.log("ERRORS:", JSON.stringify(errors.map(e => ({ msg: e.message, path: e.path, details: e.details, time: e.createdAt, stack: e.stack })), null, 2));
    } catch (e) {
        console.error("FAILED:", e);
    }
    process.exit(0);
}
run();
