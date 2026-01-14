const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function randomizeDates() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    try {
        const res = await client.query('SELECT id FROM orders');
        const orders = res.rows;

        console.log(`Found ${orders.length} orders. Randomizing dates...`);

        for (const order of orders) {
            // Random date between today and 365 days ago
            const daysAgo = Math.floor(Math.random() * 365);
            const randomDate = new Date();
            randomDate.setDate(randomDate.getDate() - daysAgo);

            // Random hour/minute/second
            randomDate.setHours(Math.floor(Math.random() * 24));
            randomDate.setMinutes(Math.floor(Math.random() * 60));
            randomDate.setSeconds(Math.floor(Math.random() * 60));

            await client.query('UPDATE orders SET created_at = $1 WHERE id = $2', [randomDate, order.id]);
        }

        console.log('Successfully randomized all order dates.');
    } catch (err) {
        console.error('Error during randomization:', err);
    } finally {
        await client.end();
    }
}

randomizeDates();
