// scripts/analyze-cards.js
const fs = require('fs');
const path = require('path');

const results = {
    files: [],
    totalOccurrences: 0,
    nestedCases: [],
};

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    let occurrences = 0;
    let inCrmCard = 0;

    lines.forEach((line, index) => {
        // Считаем открытие crm-card
        const openMatches = (line.match(/crm-card(?!-)/g) || []).length;
        const closeMatches = (line.match(/<\/div>/g) || []).length;

        if (openMatches > 0) {
            if (inCrmCard > 0) {
                // Нашли вложенный crm-card!
                results.nestedCases.push({
                    file: filePath,
                    line: index + 1,
                    content: line.trim(),
                    depth: inCrmCard + 1,
                });
            }
            inCrmCard += openMatches;
            occurrences += openMatches;
        }

        // Упрощённый подсчёт закрытий (не идеальный, но даёт представление)
        if (inCrmCard > 0 && closeMatches > 0) {
            inCrmCard = Math.max(0, inCrmCard - closeMatches);
        }
    });

    if (occurrences > 0) {
        results.files.push({
            path: filePath,
            occurrences,
        });
        results.totalOccurrences += occurrences;
    }
}

function scanDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!['node_modules', '.next', '.git', 'dist'].includes(item)) {
                scanDirectory(fullPath);
            }
        } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
            scanFile(fullPath);
        }
    }
}

// Запуск
console.log('🔍 Анализ использования crm-card...\n');
scanDirectory('./app');
scanDirectory('./components');

console.log('📊 Результаты:\n');
console.log(`Всего файлов с crm-card: ${results.files.length}`);
console.log(`Всего использований: ${results.totalOccurrences}`);
console.log(`Вложенных случаев: ${results.nestedCases.length}\n`);

if (results.nestedCases.length > 0) {
    console.log('⚠️  Вложенные crm-card (требуют замены на crm-card-body):\n');
    results.nestedCases.forEach(c => {
        console.log(`  ${c.file}:${c.line}`);
        console.log(`  Глубина: ${c.depth}`);
        console.log(`  ${c.content}\n`);
    });
}

// Сохраняем отчёт
fs.writeFileSync(
    'card-migration-report.json',
    JSON.stringify(results, null, 2)
);
console.log('💾 Отчёт сохранён в card-migration-report.json');
