const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const config = {
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'merch_crm',
};

const client = new Client(config);

async function seed() {
    try {
        await client.connect();
        console.log('Connected to DB');

        // 1. Check if role exists
        let roleId;
        const roleCheck = await client.query("SELECT id FROM roles WHERE name = 'Administrator'");
        if (roleCheck.rowCount > 0) {
            roleId = roleCheck.rows[0].id;
            console.log('Administrator role already exists:', roleId);
        } else {
            const roleRes = await client.query(`
            INSERT INTO roles (id, name, is_system, permissions, created_at)
            VALUES (gen_random_uuid(), 'Administrator', true, '{"admin": true}', NOW())
            RETURNING id
        `);
            roleId = roleRes.rows[0].id;
            console.log('Created Administrator Role:', roleId);
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('password', salt);

        // 3. Create User
        const userCheck = await client.query("SELECT id FROM users WHERE email = 'admin@crm.com'");
        if (userCheck.rowCount > 0) {
            // Update password if user exists
            await client.query("UPDATE users SET password_hash = $1 WHERE email = 'admin@crm.com'", [hash]);
            console.log('Updated existing admin user password');
        } else {
            await client.query(`
            INSERT INTO users (id, name, email, password_hash, role_id, created_at)
            VALUES (gen_random_uuid(), 'Admin User', 'admin@crm.com', $1, $2, NOW())
        `, [hash, roleId]);
            console.log('Created Admin User: admin@crm.com / password');
        }

    } catch (err) {
        console.error('Error seeding admin:', err);
    } finally {
        await client.end();
    }
}

seed();
