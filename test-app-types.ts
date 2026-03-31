import { db } from './lib/db';
import { applicationTypes } from './lib/schema';
import { eq, asc } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  try {
    const result = await db.select()
      .from(applicationTypes)
      .where(eq(applicationTypes.isActive, true))
      .orderBy(asc(applicationTypes.sortOrder), asc(applicationTypes.name));
    console.log("Success:", result.length);
  } catch (e) {
    console.error("Exact SQL Error:", e);
  }
}
run();
