
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkImages() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        const result = await client.query('SELECT name, image, image_back, image_side, image_details FROM inventory_items');
        const broken = result.rows.filter(r => r.image && !r.image.startsWith('/api/storage/local'));
        console.log("Items with non-API paths:", JSON.stringify(broken, null, 2));
        console.log("Total items:", result.rows.length);
        await client.end();
    } catch (error) {
        console.error(error);
        if (client) await client.end();
    }
}

checkImages();
