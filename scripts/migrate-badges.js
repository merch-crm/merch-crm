const fs = require('fs');
const path = require('path');

const mapping = {
    default: 'color="neutral"',
    secondary: 'color="neutral" color="outline"',
    destructive: 'color="danger" color="solid"',
    outline: 'color="neutral" color="outline"',
    success: 'color="success"',
    warning: 'color="warning"',
    info: 'color="info"',
    purple: 'color="primary"',
    gray: 'color="neutral"',
};

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;

    // Fast fail
    if (!content.includes('@/components/ui/badge')) return;

    const badgePattern = "import { Badge } from \"@/components/ui/badge\"";
    const badgePatternSingle = "import { Badge } from '@/components/ui/badge'";

    // 1. Process explicit single line imports (most common)
    if (content.includes(badgePattern) || content.includes(badgePatternSingle) || content.includes('import { Badge } from "@/components/ui/badge";')) {
        content = content.replace(/import\s*\{\s*Badge\s*\}\s*from\s*['"]@\/components\/ui\/badge['"];?/g, 
            'import { Badge } from "@/components/ui/badge";');
    } else {
        // Multi-line or mixed imports
        const genericImportRegex = /import\s*\{([^}]+)\}\s*from\s*['"]@\/components\/ui\/badge['"];?/g;
        content = content.replace(genericImportRegex, (match, importsStr) => {
            const parts = importsStr.split(',').map(s => s.trim()).filter(Boolean);
            if (parts.includes('Badge')) {
                const newParts = parts.filter(p => p !== 'Badge' && p !== 'type BadgeProps' && p !== 'BadgeProps');
                let result = `import { Badge } from "@/components/ui/badge";\n`;
                if (newParts.length > 0) {
                    result += `import { ${newParts.join(', ')} } from "@/components/ui/badge";`;
                }
                return result;
            }
            return match;
        });
    }

    // 2. Wrap tags replacing
    const badgeOpenTagRegex = /<Badge([^>]*)>/g;
    content = content.replace(badgeOpenTagRegex, (match, attrs) => {
        let newAttrs = attrs;
        let mappedColorAndVariant = '';

        // Extract and remove color="..."
        const variantRegex = /\s+color=(["'])(.*?)\1/;
        const variantMatch = newAttrs.match(variantRegex);
        if (variantMatch) {
            const oldVariant = variantMatch[2];
            newAttrs = newAttrs.replace(variantMatch[0], ''); // Remove variant
            mappedColorAndVariant = ' ' + (mapping[oldVariant] || mapping['default']);
        }

        // Return new tag
        return `<Badge rounded="inner"${mappedColorAndVariant}${newAttrs}>`;
    });

    // Replace closing tags
    content = content.replace(/<\/Badge>/g, '</Badge>');

    // 3. Make sure we don't have dangling multiple empty lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ Updated: ${filePath}`);
    }
}

function findFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (['node_modules', '.next', '.git'].includes(file)) continue;
            findFiles(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

console.log('🚀 Запуск исправленной миграции Badge -> Badge...');
findFiles(path.join(__dirname, '../app'));
findFiles(path.join(__dirname, '../components'));
console.log('🎉 Миграция завершена!');
