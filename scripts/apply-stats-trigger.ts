import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";

const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

async function main() {
  console.log("🚀 Applying 0044_complete_client_stats_trigger.sql...");
  
  const { db, pool } = await import("../lib/db");
  const { sql } = await import("drizzle-orm");
  
  try {
    const sqlPath = path.resolve(process.cwd(), "drizzle/0044_complete_client_stats_trigger.sql");
    const sqlContent = fs.readFileSync(sqlPath, "utf8");
    
    // Split by semicolons for safer execution if needed, or just run whole block
    // Since it's a trigger function, we should run it as one block.
    await db.execute(sql.raw(sqlContent));
    
    console.log("✅ Trigger and function updated successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to apply trigger:");
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
