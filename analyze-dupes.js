const fs = require('fs');

const auditReport = fs.readFileSync('audit-report.md', 'utf-8');
const jscpdFull = fs.readFileSync('jscpd-full.txt', 'utf-8');

const regex = /\[([^\]]+)\]\([^)]+#L(\d+)\)\s*\|\s*\d+\s*\|\s*Дубликаты/g;
let match;
const targetDupes = [];

while ((match = regex.exec(auditReport)) !== null) {
    targetDupes.push({
        file: match[1],
        line: parseInt(match[2], 10)
    });
}

const jscpdBlocks = jscpdFull.split('Clone found');
const results = {};

for (const target of targetDupes) {
    const matches = [];
    for (const block of jscpdBlocks) {
        if (block.includes(target.file)) {
            // Ищем строку вида: - app/path/file.tsx [10:5 - 20:3]
            // или просто app/path/file.tsx [10:5 - 20:3]
            const lines = block.split('\n').filter(l => l.trim().length > 0);
            let foundMatchingRange = false;
            let otherFiles = [];

            lines.forEach(l => {
                // Извлекаем путь к файлу из ANSI escape sequence (jscpd использует цвета terminal)
                // \u001b[32mapp/file.ts\u001b[39m
                const cleanLine = l.replace(/\u001b\[\d+m/g, '').trim();
                const fileMatch = cleanLine.match(/([a-zA-Z0-9_./\-[\]]+)\s+\[(\d+):\d+\s+-\s+(\d+):\d+\]/);

                if (fileMatch) {
                    const [, filePath, startStr, endStr] = fileMatch;
                    const start = parseInt(startStr, 10);
                    const end = parseInt(endStr, 10);

                    if (filePath === target.file && target.line >= start && target.line <= end) {
                        foundMatchingRange = true;
                    } else {
                        otherFiles.push(`${filePath} (lines ${start}-${end})`);
                    }
                }
            });

            if (foundMatchingRange && otherFiles.length > 0) {
                matches.push(...otherFiles);
            }
        }
    }
    results[`${target.file}:${target.line}`] = [...new Set(matches)]; // убираем дубли
}

console.log("=== ДЕТАЛИ ДУБЛИКАТОВ ===");
for (const [key, files] of Object.entries(results)) {
    console.log(`\n🔴 ${key}:`);
    if (files.length > 0) {
        files.forEach(f => console.log(`   └─ дублируется с: ${f}`));
    } else {
        console.log(`   └─ Не удалось сопоставить в jscpd-full.txt`);
    }
}
