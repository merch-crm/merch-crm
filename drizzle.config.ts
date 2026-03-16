import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default defineConfig({
    schema: "./lib/schema/index.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    tablesFilter: ["!audit_logs_*", "!security_events_*", "!inventory_transactions_*", "!system_errors_*", "!*_old"],
});
