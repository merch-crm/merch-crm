// scripts/migrate-cards.js
const fs = require('fs');
const path = require('path');

const DRY_RUN = !process.argv.includes('--apply');
let totalReplacements = 0;
let modifiedFiles = [];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    const crmCardCount = (content.match(/className="[^"]*crm-card(?!-)[^"]*"/g) || []).length;

    if (crmCardCount > 1) {
        console.log(`⚠️  ${filePath} — ${crmCardCount} карточек, требует ручной проверки`);
    }

    let isFirstCard = true;
    content = content.replace(/className="([^"]*\s)?crm-card(\s[^"]*)?"/g, (match, before, after) => {
        if (isFirstCard) {
            isFirstCard = false;
            return match;
        }
        totalReplacements++;
        const newBefore = before || '';
        const newAfter = after || '';
        return `className="${newBefore}crm-card-body${newAfter}"`;
    });

    if (content !== originalContent) {
        if (!DRY_RUN) {
            fs.writeFileSync(filePath, content);
        }
        modifiedFiles.push(filePath);
        console.log(`✏️  ${filePath} — ${DRY_RUN ? 'подготовлен к изменению (dry-run)' : 'изменён'}`);
    }

    isFirstCard = true;
}

function scanDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!['node_modules', '.next', '.git'].includes(item)) {
                scanDirectory(fullPath);
            }
        } else if (item.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

console.log(`🔄 Миграция crm-card → crm-card-body... ${DRY_RUN ? '(DRY RUN — не применяет изменения)' : '(ПРИМЕНЕНИЕ)'}\n`);
scanDirectory('./app');
scanDirectory('./components');

console.log(`\n📊 Итого:`);
console.log(`   Файлов для изменения: ${modifiedFiles.length}`);
console.log(`   Замен подготовлено: ${totalReplacements}`);
if (DRY_RUN) {
    console.log(`\n⚠️  Режим предпросмотра. Для применения: node scripts/migrate-cards.js --apply`);
}
