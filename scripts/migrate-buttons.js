const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../');

const componentsToSearch = [
    'app',
    'components'
];

const variantsMap = {
    'action': 'color="purple" variant="solid"',
    'actionOutline': 'color="purple" variant="outline"',
    'actionGhost': 'color="purple" variant="ghost"',
    'danger': 'color="red" variant="solid"',
    'dangerOutline': 'color="red" variant="outline"',
    'dangerGhost': 'color="red" variant="ghost"',
    'success': 'color="green" variant="solid"',
    'successOutline': 'color="green" variant="outline"',
    'successGhost': 'color="green" variant="ghost"',
    'warning': 'color="yellow" variant="solid"',
    'warningOutline': 'color="yellow" variant="outline"',
    'warningGhost': 'color="yellow" variant="ghost"',
    'neutral': 'color="gray" variant="solid"',
    'neutralOutline': 'color="gray" variant="outline"',
    'neutralGhost': 'color="gray" variant="ghost"',
    'brand': 'color="brand" variant="solid"',
    'brandOutline': 'color="brand" variant="outline"',
    'brandGhost': 'color="brand" variant="ghost"',
};

function migrateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Handle Imports
    const oldImport = /import\s+{\s*CrmButton\s*(?:,\s*CrmButtonProps\s*)?}\s*from\s*["']@\/components\/ui\/crm-button["']/g;
    const oldImportSingle = /import\s+{\s*CrmButton\s*}\s*from\s*["']\.\/crm-button["']/g;

    if (oldImport.test(content)) {
        content = content.replace(oldImport, 'import { Button } from "@/components/ui/button"');
        changed = true;
    }
    if (oldImportSingle.test(content)) {
        content = content.replace(oldImportSingle, 'import { Button } from "./button"');
        changed = true;
    }

    // Handle just the component name replacement
    if (content.includes('CrmButton')) {
        content = content.replace(/CrmButton/g, 'Button');
        changed = true;
    }

    // 2. Map Variants
    Object.entries(variantsMap).forEach(([oldVariant, newProps]) => {
        const variantRegex = new RegExp(`variant=["']${oldVariant}["']`, 'g');
        if (variantRegex.test(content)) {
            content = content.replace(variantRegex, newProps);
            changed = true;
        }
    });

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Migrated: ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                walkDir(filePath);
            }
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            migrateFile(filePath);
        }
    }
}

componentsToSearch.forEach(dir => {
    const fullPath = path.join(srcDir, dir);
    if (fs.existsSync(fullPath)) {
        walkDir(fullPath);
    }
});

console.log('Migration complete.');
