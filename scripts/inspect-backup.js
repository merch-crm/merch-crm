
const fs = require('fs');
const path = require('path');

const backupPath = 'public/uploads/backups/backup_2026-01-15T02-27-29-884Z.json';

try {
    const rawData = fs.readFileSync(backupPath, 'utf8');
    const backup = JSON.parse(rawData);

    console.log("Backup Version:", backup.version);
    console.log("Backup Timestamp:", backup.timestamp);
    console.log("Keys in 'data':", Object.keys(backup.data));

    if (backup.data.inventoryItems) {
        console.log("Found inventoryItems! Count:", backup.data.inventoryItems.length);
        if (backup.data.inventoryItems.length > 0) {
            console.log("Sample Item:", JSON.stringify(backup.data.inventoryItems[0], null, 2));
        }
        const uniqueAttributes = {};

        backup.data.inventoryItems.forEach(item => {
            if (item.attributes) {
                // Handle stringified JSON or object
                let attrs = item.attributes;
                if (typeof attrs === 'string') {
                    try { attrs = JSON.parse(attrs); } catch (e) { }
                }

                Object.keys(attrs).forEach(key => {
                    if (!uniqueAttributes[key]) uniqueAttributes[key] = new Set();
                    const val = attrs[key];
                    if (Array.isArray(val)) {
                        val.forEach(v => uniqueAttributes[key].add(v));
                    } else {
                        uniqueAttributes[key].add(val);
                    }
                });
            }
        });

        console.log("\n--- Discovered Attributes from Items ---");
        Object.keys(uniqueAttributes).forEach(key => {
            console.log(`Key: ${key}`);
            console.log(`Values:`, Array.from(uniqueAttributes[key]));
        });
    }

} catch (e) {
    console.error("Error reading backup:", e.message);
}
