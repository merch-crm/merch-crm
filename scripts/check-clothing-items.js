const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgres://postgres:postgres@127.0.0.1:5432/merch_crm'
});

pool.query(`
    SELECT 
        i.name, 
        i.sku, 
        i.quantity, 
        i.unit, 
        c.name as category 
    FROM inventory_items i 
    LEFT JOIN inventory_categories c ON i.category_id = c.id 
    WHERE c.parent_id = (SELECT id FROM inventory_categories WHERE name = 'Одежда') 
    ORDER BY c.name
`).then(res => {
    console.log('\n📦 Позиции одежды:\n');
    res.rows.forEach(r => {
        console.log(`${r.category.padEnd(15)} | ${r.sku.padEnd(8)} | ${r.name.padEnd(35)} | ${r.quantity} ${r.unit}`);
    });
    pool.end();
}).catch(e => {
    console.error(e);
    process.exit(1);
});
