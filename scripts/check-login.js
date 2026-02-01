const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    connectionString: 'postgres://postgres:da1c8fe9f308039384edeecbe252fdda51f305d59cae0c94@127.0.0.1:5432/postgres'
});

async function checkLogin() {
    try {
        const email = 'admin@crm.local';
        const password = '12345678';

        console.log(`Checking login for: ${email}`);

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            console.log('❌ User not found!');
            return;
        }

        const user = result.rows[0];
        console.log('✓ User found:', { id: user.id, email: user.email, name: user.name });
        console.log('Password hash:', user.password_hash);
        console.log('Hash length:', user.password_hash?.length);

        if (!user.password_hash) {
            console.log('❌ Password hash is NULL or empty!');
            console.log('Generating new hash...');
            const newHash = await bcrypt.hash(password, 10);
            console.log('New hash:', newHash);

            // Update the password
            await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id]);
            console.log('✓ Password updated!');
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            console.log('❌ Password does not match! Updating password...');
            const newHash = await bcrypt.hash(password, 10);
            await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id]);
            console.log('✓ Password updated to:', password);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkLogin();
