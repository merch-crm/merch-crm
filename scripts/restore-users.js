const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function restoreUsers() {
    console.log('📖 Reading restore_source.json...');
    const rawData = fs.readFileSync('restore_source.json', 'utf8');
    const backup = JSON.parse(rawData);

    // We need deps and roles to ensure users can be inserted with valid FKs
    const departments = backup.data?.departments || [];
    const roles = backup.data?.roles || [];
    const users = backup.data?.users || [];

    if (users.length === 0) {
        console.error('❌ No users found in backup data.');
        process.exit(1);
    }

    console.log(`🔍 Found ${users.length} users. checking dependencies...`);

    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();

        // 1. Restore Departments (if any) to satisfy FKs
        if (departments.length > 0) {
            console.log(`📦 Restoring ${departments.length} departments (required for roles/users)...`);
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

        // 2. Restore Roles (if any)
        if (roles.length > 0) {
            console.log(`📦 Restoring ${roles.length} roles (required for users)...`);
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

        // 3. Restore Users
        console.log(`👤 Restoring ${users.length} users...`);
        let successCount = 0;
        let errorCount = 0;

        for (const user of users) {
            try {
                const query = `
                    INSERT INTO users (
                        id, name, email, password_hash, role_id, phone, birthday, avatar, 
                        telegram, instagram, social_max, department, department_id, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        email = EXCLUDED.email,
                        password_hash = EXCLUDED.password_hash,
                        role_id = EXCLUDED.role_id,
                        phone = EXCLUDED.phone,
                        birthday = EXCLUDED.birthday,
                        avatar = EXCLUDED.avatar,
                        telegram = EXCLUDED.telegram,
                        instagram = EXCLUDED.instagram,
                        social_max = EXCLUDED.social_max,
                        department = EXCLUDED.department,
                        department_id = EXCLUDED.department_id,
                        created_at = EXCLUDED.created_at
                `;

                const values = [
                    user.id,
                    user.name,
                    user.email,
                    user.passwordHash,
                    user.roleId,
                    user.phone || null,
                    user.birthday || null,
                    user.avatar || null,
                    user.telegram || null,
                    user.instagram || null,
                    user.socialMax || null,
                    user.department || user.departmentLegacy || null,
                    user.departmentId || null,
                    user.createdAt
                ];

                await client.query(query, values);
                successCount++;
                process.stdout.write('.');
            } catch (err) {
                console.error(`\n❌ Failed to import user ${user.email}: ${err.message}`);
                errorCount++;
            }
        }

        console.log(`\n\n✅ Restore complete.`);
        console.log(`Success: ${successCount}`);
        console.log(`Errors: ${errorCount}`);

        await client.end();
        process.exit(0); // Exit 0 even if errors, we did our best

    } catch (error) {
        console.error('\n❌ Database connection error:', error.message);
        if (client) await client.end();
        process.exit(1);
    }
}

restoreUsers();
