import pg from 'pg';
const { Client } = pg;

async function debugDB() {
    const client = new Client({
        connectionString: "postgresql://postgres:5738870192e24949b02a700547743048@localhost:5433/postgres?sslmode=disable",
    });

    try {
        console.log('Connecting to localhost:5433...');
        await client.connect();
        
        console.log('Listing tables in public schema:');
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        
        if (res.rows.length === 0) {
            console.log('⚠️ No tables found in public schema!');
        } else {
            res.rows.forEach(row => console.log(' -', row.table_name));
        }

        await client.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

debugDB();
