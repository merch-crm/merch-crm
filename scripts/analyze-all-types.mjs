import pkg from 'pg';
const { Pool } = pkg;

async function analyzeAll() {
    const connectionString = "postgresql://postgres:5738870192e24949b02a700547743048@localhost:5432/postgres?sslmode=disable";
    const pool = new Pool({ connectionString });

    try {
        const res = await pool.query('SELECT DISTINCT type FROM inventory_attributes');
        console.log("Found types:", res.rows.map(r => r.type));

        const allRes = await pool.query('SELECT * FROM inventory_attributes');
        const byType = {};
        allRes.rows.forEach(a => {
            if (!byType[a.type]) byType[a.type] = [];
            byType[a.type].push({ name: a.name, value: a.value, meta: a.meta });
        });

        for (const type in byType) {
            console.log(`\n--- Type: ${type} ---`);
            byType[type].forEach(a => {
                console.log(`Name: ${a.name} | Value: ${a.value} | Meta:`, a.meta);
            });
        }

        await pool.end();
        process.exit(0);
    } catch (e) {
        console.error(e);
        if (pool) await pool.end();
        process.exit(1);
    }
}
analyzeAll();
