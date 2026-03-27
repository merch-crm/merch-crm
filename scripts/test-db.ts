import { db, pool } from "../lib/db.ts";
import { systemSettings } from "../lib/schema/index.ts";

async function test() {
  try {
    console.log("Testing connection...");
    const res = await pool.query("SELECT 1");
    console.log("Connection successful:", res.rows);

    console.log("Testing systemSettings query...");
    const settings = await db.select().from(systemSettings).limit(1);
    console.log("Settings query successful:", settings);
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await pool.end();
  }
}

test();
