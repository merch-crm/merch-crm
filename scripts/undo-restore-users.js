const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function undoRestore() {
    console.log('📖 Reading restore_source.json for IDs to remove...');
    const rawData = fs.readFileSync('restore_source.json', 'utf8');
    const backup = JSON.parse(rawData);

    const users = backup.data?.users || [];
    const roles = backup.data?.roles || [];
    const departments = backup.data?.departments || [];

    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();

        // 1. Delete Users
        if (users.length > 0) {
            console.log(`🗑️ Removing ${users.length} users...`);
            for (const user of users) {
                try {
                    await client.query('DELETE FROM users WHERE id = $1', [user.id]);
                } catch (err) {
                    console.warn(`⚠️ Could not delete user ${user.name}: ${err.message}`);
                }
            }
        }

        // 2. Delete Roles
        if (roles.length > 0) {
            console.log(`🗑️ Removing ${roles.length} roles...`);
            for (const role of roles) {
                try {
                    await client.query('DELETE FROM roles WHERE id = $1', [role.id]);
                } catch (err) {
                    // This is expected if strict rollback isn't possible or data is used elsewhere
                    console.warn(`⚠️ Could not delete role ${role.name}: ${err.message}`);
                }
            }
        }

        // 3. Delete Departments
        if (departments.length > 0) {
            console.log(`🗑️ Removing ${departments.length} departments...`);
            for (const dept of departments) {
                try {
                    await client.query('DELETE FROM departments WHERE id = $1', [dept.id]);
                } catch (err) {
                    console.warn(`⚠️ Could not delete department ${dept.name}: ${err.message}`);
                }
            }
        }

        console.log(`\n✅ Rollback attempt complete.`);
        await client.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (client) await client.end();
        process.exit(1);
    }
}

undoRestore();
