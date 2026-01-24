const { db } = require('./lib/db');
const { systemSettings } = require('./lib/schema');
const { eq } = require('drizzle-orm');

async function testDrizzle() {
    try {
        console.log('--- Testing Drizzle query.systemSettings.findFirst ---');
        const settings = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, "branding")
        });
        console.log('Result:', settings);

        console.log('\n--- Testing Drizzle select from systemSettings ---');
        const result = await db.select().from(systemSettings).where(eq(systemSettings.key, "branding"));
        console.log('Result:', result);

        process.exit(0);
    } catch (error) {
        console.error('❌ Drizzle Error:', error);
        process.exit(1);
    }
}

testDrizzle();
