import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load .env.local if it exists (not present in Docker containers)
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

// In Docker migrator context, skip env validation (only DATABASE_URL is needed)
if (!process.env.SKIP_ENV_VALIDATION) {
  process.env.SKIP_ENV_VALIDATION = "true";
}

async function main() {
  console.log("🚀 Starting database migrations...");
  
  // Dynamically import db and pool AFTER dotenv has been configured
  const { db, pool } = await import("../lib/db");
  const { migrate } = await import("drizzle-orm/node-postgres/migrator");
  
  try {
    // This will run all pending migrations from the 'drizzle' folder
    // It uses a migration table in the database to keep track of which migrations have been run
    await migrate(db, { 
      migrationsFolder: path.resolve(process.cwd(), "drizzle") 
    });
    
    console.log("✅ Migrations completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:");
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
