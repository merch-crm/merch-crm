import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const url = new URL(process.env.DATABASE_URL!);
  const client = new Client({
    host: url.hostname, port: parseInt(url.port) || 5432,
    user: url.username, password: url.password, database: url.pathname.slice(1),
    ssl: false
  });
  await client.connect();
  // Show actual columns in application_types
  const res = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'application_types' ORDER BY ordinal_position`
  );
  console.log("Columns:", (res?.rows || []).map(r => r.column_name));
  await client.end();
}
main().catch(e => console.error(e));
