import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0 && !key.startsWith('#')) {
                let val = valueParts.join('=').trim();
                if (val.startsWith('"') && val.endsWith('"')) {
                    val = val.slice(1, -1);
                }
                process.env[key.trim()] = val;
            }
        });
    }
}

async function runMigration() {
    loadEnv();
    
    // Fallback to localhost if connecting through SSH tunnel
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:5738870192e24949b02a700547743048@localhost:5432/postgres?sslmode=disable';

    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log("Connected to database.");

        const sql = `
            CREATE TABLE IF NOT EXISTS "notifications" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                "user_id" uuid NOT NULL,
                "title" text NOT NULL,
                "message" text NOT NULL,
                "type" "notification_type" DEFAULT 'info' NOT NULL,
                "priority" text DEFAULT 'normal' NOT NULL,
                "is_read" boolean DEFAULT false NOT NULL,
                "created_at" timestamp DEFAULT now() NOT NULL,
                "updated_at" timestamp DEFAULT now() NOT NULL
            );
            
            DO $$ BEGIN
             ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
            EXCEPTION
             WHEN duplicate_object THEN null;
            END $$;
            
            CREATE INDEX IF NOT EXISTS "notifications_user_idx" ON "notifications" ("user_id");
            CREATE INDEX IF NOT EXISTS "notifications_read_idx" ON "notifications" ("is_read");
            CREATE INDEX IF NOT EXISTS "notifications_created_idx" ON "notifications" ("created_at");
        `;
        
        console.log("Executing migration...");
        await client.query(sql);
        console.log("Migration executed successfully!");
        
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await client.end();
        console.log("Connection closed.");
    }
}

runMigration();
