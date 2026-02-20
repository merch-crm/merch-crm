const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = 'postgresql://postgres:5738870192e24949b02a700547743048@localhost:5432/postgres?sslmode=disable';

async function main() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to database');

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('password', salt);

        // Находим роль Администратор
        const roleRes = await client.query("SELECT id FROM roles WHERE name = 'Администратор' LIMIT 1");
        if (roleRes.rowCount === 0) {
            console.error('Role Administrator not found');
            process.exit(1);
        }
        const roleId = roleRes.rows[0].id;

        // Вставляем пользователя
        await client.query(`
            INSERT INTO users (id, name, email, password_hash, role_id, created_at)
            VALUES (gen_random_uuid(), 'Administrator', 'admin@crm.com', $1, $2, NOW())
            ON CONFLICT (email) DO UPDATE SET password_hash = $1
        `, [hash, roleId]);

        console.log('✓ User admin@crm.com created/updated with password: password');
    } catch (err) {
        console.error('Error creating user:', err);
    } finally {
        await client.end();
    }
}

main();
