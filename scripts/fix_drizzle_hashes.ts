import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import 'dotenv/config';

async function run() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL is not set');
        process.exit(1);
    }

    const client = new Client({ connectionString, ssl: false });
    await client.connect();

    try {
        console.log('--- Step 1: Syncing Database Hashes ---');
        const journalPath = path.join(process.cwd(), 'drizzle/meta/_journal.json');
        const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
        const entries = journal.entries;

        await client.query('BEGIN');
        
        // Truncate current migration records
        console.log('Truncating drizzle.__drizzle_migrations...');
        await client.query('TRUNCATE TABLE drizzle.__drizzle_migrations');

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const sqlFileName = `${entry.tag}.sql`;
            const sqlPath = path.join(process.cwd(), 'drizzle', sqlFileName);
            
            if (!fs.existsSync(sqlPath)) {
                console.error(`Missing SQL file: ${sqlPath}`);
                continue;
            }

            const content = fs.readFileSync(sqlPath, 'utf8');
            const hash = crypto.createHash('sha256').update(content).digest('hex');
            
            const dbId = i + 1; // drizzle-orm migrator uses 1-based IDs
            console.log(`[${dbId}] Inserting hash for ${entry.tag}...`);
            
            await client.query(
                `INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES ($1, $2, $3)`,
                [dbId, hash, Date.now().toString()]
            );
        }

        await client.query('COMMIT');
        console.log('✅ Database hashes synchronized successfully!');

        console.log('\n--- Step 2: Fixing Meta Snapshots ---');
        // We will move all snapshots to index-based names matching the journal
        const metaDir = path.join(process.cwd(), 'drizzle/meta');
        const snapshots = fs.readdirSync(metaDir).filter(f => f.endsWith('_snapshot.json'));
        
        console.log(`Found ${snapshots.length} existing snapshots.`);

        // The safest way is to just let Drizzle generate a FRESH snapshot for the last index.
        // But we can try to preserve the latest one.
        const lastEntry = entries[entries.length - 1];
        const lastIdx = (entries.length - 1).toString().padStart(4, '0');
        const targetSnapshot = path.join(metaDir, `${lastIdx}_snapshot.json`);

        // If we have a snapshot that represents the "Latest" state, we should rename it to the lastIdx.
        // Based on our previous check, 0053 is the latest entry.
        // We'll rename the currently highest snapshot to 0053.
        let highestSnapshot = -1;
        let highestFile = '';
        for (const f of snapshots) {
            const match = f.match(/^(\d+)_snapshot\.json$/);
            if (match) {
                const idx = parseInt(match[1]);
                if (idx > highestSnapshot) {
                    highestSnapshot = idx;
                    highestFile = f;
                }
            }
        }

        if (highestFile) {
            const lastTagSnapshot = path.join(metaDir, `${lastIdx}_snapshot.json`);
            if (highestFile !== `${lastIdx}_snapshot.json`) {
                console.log(`Renaming highest snapshot ${highestFile} to ${lastIdx}_snapshot.json...`);
                fs.renameSync(path.join(metaDir, highestFile), lastTagSnapshot);
            }
        }

        console.log('✅ Meta snapshots re-aligned to last index!');

    } catch (err) {
        console.error('❌ Error during stabilization:', err);
        await client.query('ROLLBACK');
    } finally {
        await client.end();
    }
}

run();
