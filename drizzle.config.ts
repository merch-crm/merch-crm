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
    // WARNING: Critical tables below are managed separately from Drizzle (e.g., via raw SQL or external tools).
    // Do NOT remove them from the filter unless you are implementing their schema in Drizzle.
    // ВНИМАНИЕ: Таблицы логирования, безопасности и складских транзакций управляются отдельно.
    tablesFilter: ["!audit_logs_*", "!security_events_*", "!inventory_transactions_*", "!system_errors_*", "!*_old"],
});
