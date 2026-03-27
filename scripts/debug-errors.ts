import { db } from '../lib/db';
import { systemErrors } from '../lib/schema';
import { desc } from 'drizzle-orm';

async function run() {
  try {
    const errors = await db.query.systemErrors.findMany({
      limit: 10,
      orderBy: [desc(systemErrors.createdAt)],
    });
    console.log('---ERRORS_START---');
    console.log(JSON.stringify(errors, null, 2));
    console.log('---ERRORS_END---');
  } catch (e) {
    console.error('Database query error:', e);
  }
  process.exit(0);
}

run();
