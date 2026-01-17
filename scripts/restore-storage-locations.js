const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function restoreStorageLocations() {
    console.log('📖 Reading restore_source.json...');
    const rawData = fs.readFileSync('restore_source.json', 'utf8');
    const backup = JSON.parse(rawData);

    const storageLocations = backup.data?.storageLocations || [];

    if (storageLocations.length === 0) {
        console.error('❌ No storage locations found in backup data.');
        process.exit(1);
    }

    console.log(`🔍 Found ${storageLocations.length} storage locations to restore.`);

    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();

        let successCount = 0;
        let errorCount = 0;

        for (const location of storageLocations) {
            try {
                const query = `
                    INSERT INTO storage_locations (id, name, address, description, responsible_user_id, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        address = EXCLUDED.address,
                        description = EXCLUDED.description,
                        responsible_user_id = EXCLUDED.responsible_user_id
                `;

                const values = [
                    location.id,
                    location.name,
                    location.address,
                    location.description || null,
                    location.responsibleUserId || null,
                    location.createdAt
                ];

                await client.query(query, values);
                successCount++;
                console.log(`✅ ${location.name} (${location.address})`);
            } catch (err) {
                console.error(`\n❌ Failed to import storage location ${location.name}: ${err.message}`);
                errorCount++;
            }
        }

        console.log(`\n\n✅ Restore complete.`);
        console.log(`Success: ${successCount}`);
        console.log(`Errors: ${errorCount}`);

        await client.end();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Database connection error:', error.message);
        if (client) await client.end();
        process.exit(1);
    }
}

restoreStorageLocations();
