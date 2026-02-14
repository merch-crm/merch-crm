const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:5738870192e24949b02a700547743048@127.0.0.1:5432/postgres"
});

async function checkAttributes() {
    await client.connect();

    console.log("Checking for duplicate attributes...");

    // 1. Check for duplicates by Name (case insensitive) within same Type
    const resName = await client.query(`
        SELECT type, lower(name) as lname, array_agg(name) as names, count(*) 
        FROM inventory_attributes 
        GROUP BY type, lower(name) 
        HAVING count(*) > 1
    `);

    if (resName.rows.length > 0) {
        console.log("Found duplicates by Name:");
        resName.rows.forEach(r => {
            console.log(`Type: ${r.type}, Names: [${r.names.join(', ')}]`);
        });
    } else {
        console.log("No duplicates by Name found.");
    }

    // 2. Check for duplicates by Value within same Type
    const resValue = await client.query(`
        SELECT type, value, count(*) 
        FROM inventory_attributes 
        GROUP BY type, value 
        HAVING count(*) > 1
    `);

    if (resValue.rows.length > 0) {
        console.log("Found duplicates by Value:");
        resValue.rows.forEach(r => {
            console.log(`Type: ${r.type}, Value: ${r.value} (Count: ${r.count})`);
        });
    } else {
        console.log("No duplicates by Value found.");
    }

    await client.end();
}

checkAttributes();
