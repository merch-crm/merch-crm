const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['app', 'components'];
const EXTENSIONS = ['.tsx', '.ts', '.css'];

const REPLACEMENTS = [
    // Element size (10px to 22px)
    { regex: /!rounded-\[1[0-9]px\]/g, replacement: 'rounded-element' },
    { regex: /rounded-\[1[0-9]px\]/g, replacement: 'rounded-element' },
    { regex: /!rounded-\[2[0-2]px\]/g, replacement: 'rounded-element' },
    { regex: /rounded-\[2[0-2]px\]/g, replacement: 'rounded-element' },
    { regex: /rounded-2xl/g, replacement: 'rounded-element' },
    { regex: /!rounded-2xl/g, replacement: 'rounded-element' },
    { regex: /rounded-\[var\(--radius-inner\)\]/g, replacement: 'rounded-element' },
    { regex: /!rounded-\[var\(--radius-inner\)\]/g, replacement: 'rounded-element' },

    // Micro sizes
    { regex: /!rounded-\[[1-3]px\]/g, replacement: 'rounded-sm' },
    { regex: /rounded-\[[1-3]px\]/g, replacement: 'rounded-sm' },
    { regex: /!rounded-\[4px\]/g, replacement: 'rounded' },
    { regex: /rounded-\[4px\]/g, replacement: 'rounded' },
    { regex: /!rounded-\[6px\]/g, replacement: 'rounded-md' },
    { regex: /rounded-\[6px\]/g, replacement: 'rounded-md' },
    { regex: /!rounded-\[8px\]/g, replacement: 'rounded-lg' },
    { regex: /rounded-\[8px\]/g, replacement: 'rounded-lg' },

    // Rem measurements
    { regex: /!rounded-\[[0-1]\.[0-9]+rem\]/g, replacement: 'rounded-element' },
    { regex: /rounded-\[[0-1]\.[0-9]+rem\]/g, replacement: 'rounded-element' },
    { regex: /!rounded-\[[2-9]rem\]/g, replacement: 'rounded-card' },
    { regex: /rounded-\[[2-9]rem\]/g, replacement: 'rounded-card' },
    { regex: /!rounded-\[[2-9]\.[0-9]+rem\]/g, replacement: 'rounded-card' },
    { regex: /rounded-\[[2-9]\.[0-9]+rem\]/g, replacement: 'rounded-card' },

    // Card size (23px to 64px)
    { regex: /!rounded-\[2[3-9]px\]/g, replacement: 'rounded-card' },
    { regex: /rounded-\[2[3-9]px\]/g, replacement: 'rounded-card' },
    { regex: /!rounded-\[[3-6][0-9]px\]/g, replacement: 'rounded-card' },
    { regex: /rounded-\[[3-6][0-9]px\]/g, replacement: 'rounded-card' },
    { regex: /rounded-3xl/g, replacement: 'rounded-card' },
    { regex: /!rounded-3xl/g, replacement: 'rounded-card' },
    { regex: /rounded-\[var\(--radius\)\]/g, replacement: 'rounded-card' },
    { regex: /!rounded-\[var\(--radius\)\]/g, replacement: 'rounded-card' },
    { regex: /rounded-\[var\(--radius-outer\)\]/g, replacement: 'rounded-card' },
    { regex: /!rounded-\[var\(--radius-outer\)\]/g, replacement: 'rounded-card' },

    // Clean up !rounded-full
    { regex: /!rounded-full/g, replacement: 'rounded-full' },
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;
    let modified = false;

    for (const rule of REPLACEMENTS) {
        if (rule.regex.test(content)) {
            content = content.replace(rule.regex, rule.replacement);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated: ${filePath}`);
    }
}

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (stat.isFile() && EXTENSIONS.includes(path.extname(fullPath))) {
            processFile(fullPath);
        }
    }
}

const targetDirs = process.argv.slice(2);
const dirsToProcess = targetDirs.length > 0 ? targetDirs : DIRECTORIES;

console.log(`Starting migration on: ${dirsToProcess.join(', ')}`);
dirsToProcess.forEach(dir => processDirectory(path.join(__dirname, '..', dir)));
console.log('Migration completed.');
