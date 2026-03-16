const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const testDirs = ['tests', 'app', '__tests__'];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const allTests = testDirs.flatMap(dir => walk(path.join(process.cwd(), dir)));

console.log(`Found ${allTests.length} test files.`);

allTests.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Replace vi.mock('@/lib/auth' with vi.mock('@/lib/session' if it contains getSession
    // But be careful: some tests might still need @/lib/auth for other things.
    // The most common case is mocking getSession.

    if (content.includes("vi.mock('@/lib/auth'") && (content.includes('getSession') || content.includes('mockGetSession'))) {
        content = content.replace(/vi\.mock\('@\/lib\/auth'/g, "vi.mock('@/lib/session'");
        changed = true;
    }

    // Also update imports
    if (content.includes("import { getSession") && content.includes("from '@/lib/auth'")) {
        // Here we need to be careful not to break other imports from auth
        // If it's just getSession, we replace the whole line or move getSession to new line
        if (content.match(/import\s*{\s*getSession\s*}\s*from\s*'@\/lib\/auth'/)) {
             content = content.replace(/import\s*{\s*getSession\s*}\s*from\s*'@\/lib\/auth'/g, "import { getSession } from '@/lib/session'");
             changed = true;
        } else if (content.match(/import\s*{\s*[^}]*getSession[^}]*}\s*from\s*'@\/lib\/auth'/)) {
             // Complex import: import { getSession, other } from '@/lib/auth'
             // Move getSession to its own import
             content = content.replace(/import\s*{\s*([^}]*)getSession,?\s*([^}]*)}\s*from\s*'@\/lib\/auth'/g, (match, p1, p2) => {
                 let remaining = (p1 + p2).trim().replace(/,\s*$/, '').replace(/^\s*,/, '');
                 let newImport = `import { getSession } from '@/lib/session';\n`;
                 if (remaining) {
                     newImport += `import { ${remaining} } from '@/lib/auth';`;
                 }
                 return newImport;
             });
             changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(file, content);
        console.log(`Updated: ${file}`);
    }
});

console.log('Finished updating tests.');
