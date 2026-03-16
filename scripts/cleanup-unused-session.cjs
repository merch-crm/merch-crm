const fs = require('fs');
const path = require('path');

const files = [
    'tests/admin/admin.test.ts',
    'tests/clients/analytics.actions.test.ts',
    'tests/clients/contacts.actions.test.ts',
    'tests/clients/export.actions.test.ts',
    'tests/clients/funnel.actions.test.ts',
    'tests/clients/loyalty.actions.test.ts',
    'tests/clients/rfm.actions.test.ts',
    'tests/clients/stats.actions.test.ts',
    'tests/dashboard/clients.test.ts',
    'tests/dashboard/design-prints.test.ts',
    'tests/dashboard/design.test.ts',
    'tests/dashboard/finance.test.ts',
    'tests/dashboard/knowledge-base.test.ts',
    'tests/dashboard/production.test.ts',
    'tests/dashboard/profile.test.ts',
    'tests/dashboard/promocodes.test.ts',
    'tests/dashboard/tasks.test.ts',
    'tests/dashboard/warehouse-lines.test.ts',
    'tests/dashboard/warehouse.test.ts',
    'tests/staff/employees.actions.test.ts',
    'tests/staff/faces.actions.test.ts',
    'tests/staff/presence.actions.test.ts',
    'tests/staff/reports.actions.test.ts',
    'tests/staff/settings.actions.test.ts',
    'tests/staff/workstations.actions.test.ts',
    'tests/staff/xiaomi.actions.test.ts'
];

files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${file}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let modified = false;

    // Сначала удаляем ВСЕ импорты Session из любого места (@/lib/auth или @/lib/session)
    const patternsToRemove = [
        /import\s+type\s+{\s*Session\s*}\s+from\s+["']@\/lib\/session["'];?/g,
        /import\s+{\s*type\s+Session\s+as\s+_Session\s*}\s+from\s+["']@\/lib\/auth["'];?/g,
        /import\s+{\s*Session\s*}\s+from\s+["']@\/lib\/auth["'];?/g,
        /import\s+{\s*Session\s*}\s+from\s+["']@\/lib\/session["'];?/g,
        /import\s+type\s+Session\s+from\s+["']@\/lib\/session["'];?/g,
        /import\s+{\s*type\s+Session\s*}\s+from\s+["']@\/lib\/auth["'];?/g
    ];

    let foundSessionImport = false;
    let importPlaceholderIndex = -1;

    let newLines = lines.filter((line, index) => {
        const isMatch = patternsToRemove.some(p => p.test(line));
        if (isMatch) {
            modified = true;
            foundSessionImport = true;
            if (importPlaceholderIndex === -1) importPlaceholderIndex = index;
            return false;
        }
        return true;
    });

    if (foundSessionImport) {
        // Проверяем, используется ли Session в файле
        const remainingContent = newLines.join('\n');
        // Ищем \bSession\b, но не в комментариях (упрощенно)
        if (/\bSession\b/.test(remainingContent)) {
            // Вставляем правильный импорт на место первого удаленного (или в начало)
            const correctImport = 'import type { Session } from "@/lib/session";';
            newLines.splice(importPlaceholderIndex !== -1 ? importPlaceholderIndex : 0, 0, correctImport);
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, newLines.join('\n'), 'utf-8');
        console.log(`Fixed imports in: ${file}`);
    }
});
