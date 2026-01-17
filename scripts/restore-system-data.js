const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function restoreSystemData() {
    console.log('📖 Reading restore_source.json...');
    const rawData = fs.readFileSync('restore_source.json', 'utf8');
    const backup = JSON.parse(rawData);

    const departments = backup.data?.departments || [];
    const roles = backup.data?.roles || [];

    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();

        // 1. Restore Departments
        if (departments.length > 0) {
            console.log(`📦 Restoring ${departments.length} departments...`);
            for (const d of departments) {
                try {
                    await client.query(`
                        INSERT INTO departments (id, name, description, color, is_active, created_at)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        ON CONFLICT (id) DO UPDATE SET
                            name = EXCLUDED.name,
                            description = EXCLUDED.description,
                            color = EXCLUDED.color,
                            is_active = EXCLUDED.is_active
                     `, [d.id, d.name, d.description, d.color, d.isActive, d.createdAt]);
                } catch (e) {
                    console.warn(`⚠️ Could not restore department ${d.name}: ${e.message}`);
                }
            }
        }

        // 2. Restore Roles
        if (roles.length > 0) {
            console.log(`📦 Restoring ${roles.length} roles...`);
            for (const r of roles) {
                try {
                    await client.query(`
                        INSERT INTO roles (id, name, permissions, is_system, department_id, created_at)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        ON CONFLICT (id) DO UPDATE SET
                            name = EXCLUDED.name,
                            permissions = EXCLUDED.permissions,
                            is_system = EXCLUDED.is_system,
                            department_id = EXCLUDED.department_id
                    `, [r.id, r.name, r.permissions, r.isSystem, r.departmentId, r.createdAt]);
                } catch (e) {
                    console.warn(`⚠️ Could not restore role ${r.name}: ${e.message}`);
                }
            }
        }

        console.log(`\n✅ System data restored.`);
        await client.end();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Database connection error:', error.message);
        if (client) await client.end();
        process.exit(1);
    }
}

restoreSystemData();
