const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const index = line.indexOf('=');
            if (index !== -1) {
                const key = line.substring(0, index).trim();
                const value = line.substring(index + 1).trim().replace(/^"(.*)"$/, '$1');
                process.env[key] = value;
            }
        });
    }
}

loadEnv();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:5738870192e24949b02a700547743048@localhost:5432/postgres';

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
