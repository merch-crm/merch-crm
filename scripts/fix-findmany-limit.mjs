import fs from 'fs/promises';
import path from 'path';

const targets = [
    'app/(main)/staff/actions',
    'app/(staff)/staff',
    'app/api/presence',
];

async function walk(dir, fileList = []) {
    let files;
    try { files = await fs.readdir(dir); } catch { return fileList; }
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) fileList = await walk(filePath, fileList);
        else if (file.endsWith('.ts') || file.endsWith('.tsx')) fileList.push(filePath);
    }
    return fileList;
}

async function fixLimits() {
    let files = [];
    for (const dir of targets) {
        files = files.concat(await walk(path.join(process.cwd(), dir)));
    }

    for (const file of files) {
        let content = await fs.readFile(file, 'utf8');
        // Add limit: 500 to findMany() calls that don't already have limit
        // Pattern: .findMany({ ... }) or .findMany() 
        // Only add if there's no existing limit key
        const updated = content.replace(
            /\.findMany\(\{(?![^}]*\blimit\b)([^}]*)\}\)/gs,
            (match, inner) => {
                // Don't add limit if there's already a where keyword that indicates it's a specific query with a key
                return `.findMany({\n        limit: 500,${inner}})`;
            }
        );

        // Handle findMany() with no args
        const updated2 = updated.replace(
            /\.findMany\(\)/g,
            '.findMany({ limit: 500 })'
        );

        if (content !== updated2) {
            await fs.writeFile(file, updated2, 'utf8');
            console.log(`Added limit to: ${file}`);
        }
    }
}

fixLimits().catch(console.error);
