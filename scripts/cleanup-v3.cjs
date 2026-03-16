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
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf-8');
    
    // 1. Убираем _Session по всему файлу
    content = content.replace(/\b_Session\b/g, 'Session');
    
    // 2. Разбираем на строки
    const lines = content.split('\n');
    let newLines = [];
    let sessionImportSeen = false;
    let authImportNeedsAuth = false;

    // Регулярные выражения для поиска любых импортов Session
    const sessionImportRegex = /import\s+.*Session.*from\s+["']@\/lib\/(auth|session)["'];?/i;
    
    for (const line of lines) {
        if (sessionImportRegex.test(line)) {
            // Если в строке есть 'auth' (кроме пути), значит импортируется и auth
            // Например: import { type Session as Session, auth } from "@/lib/auth";
            if (/\bauth\b/.test(line.replace(/["']@\/lib\/auth["']/, ''))) {
                authImportNeedsAuth = true;
            }
            // Пропускаем эту строку (удаляем импорт Session)
            continue;
        }
        newLines.push(line);
    }

    // Проверяем, используется ли Session
    const tempContent = newLines.join('\n');
    const isUsed = /\bSession\b/.test(tempContent);
    
    // Вставляем чистые импорты в начало (после первой строки комментариев или просто в начало)
    if (isUsed) {
        newLines.unshift('import type { Session } from "@/lib/session";');
    }
    if (authImportNeedsAuth) {
        // Проверяем, нет ли уже импорта auth
        if (!/\bimport\s+.*auth.*from\s+["']@\/lib\/auth["']/.test(tempContent)) {
            newLines.unshift('import { auth } from "@/lib/auth";');
        }
    }

    fs.writeFileSync(filePath, newLines.join('\n'), 'utf-8');
    console.log(`Cleaned v3: ${file}`);
});
