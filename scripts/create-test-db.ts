import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function createTestDb() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined in .env.local');
    process.exit(1);
  }

  // Use the connection to 'postgres' database to create the test database
  const connectionString = process.env.DATABASE_URL.replace(/\/merch_crm$/, '/postgres');
  const client = new Client({
    connectionString
  });

  try {
    await client.connect();
    // Check if database exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname='merch_crm_test'");
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE merch_crm_test');
      console.log('Database merch_crm_test created successfully');
    } else {
      console.log('Database merch_crm_test already exists');
    }
  } catch (err) {
    console.error('Error creating database:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTestDb();
