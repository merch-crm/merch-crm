#!/usr/bin/env npx tsx

import * as fs from 'fs';
import * as path from 'path';

/**
 * Скрипт синхронизации списка тестов с Obsidian Vault.
 * Сканирует проект на наличие .test.ts(x) файлов и обновляет реестры в vault/090-Тесты/.
 */

const CONFIG = {
    vaultBase: 'vault/090-Тесты',
    categories: {
        '01-Unit-Тесты': {
            title: 'Unit-Тесты (Модульные)',
            fileName: 'Unit-Тесты.md',
            patterns: ['__tests__/unit', 'lib/__tests__', 'hooks/', 'lib/utils/'],
            description: 'Тестирование отдельных функций, хуков и логики в изоляции.'
        },
        '02-Интеграционные-Тесты': {
            title: 'Интеграционные Тесты',
            fileName: 'Интеграционные-Тесты.md',
            patterns: ['__tests__/integration', '__tests__/actions', 'tests/clients', 'actions/'],
            description: 'Проверка взаимодействия модулей, Server Actions и работы с БД.'
        },
        '03-E2E-Тесты': {
            title: 'E2E-Тесты (Сквозные)',
            fileName: 'E2E-Тесты.md',
            patterns: ['tests/dashboard', 'tests/admin', 'tests/staff'],
            description: 'Сценарии Playwright, имитирующие действия реальных пользователей.'
        },
        '04-Компонентные-Тесты': {
            title: 'Компонентные Тесты (UI)',
            fileName: 'Компонентные-Тесты.md',
            patterns: ['components/ui/'],
            description: 'Тестирование визуальных элементов интерфейса в изоляции.'
        }
    }
};

function getAllFiles(dir: string): string[] {
    const files: string[] = [];
    if (!fs.existsSync(dir)) return files;

    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!['node_modules', '.next', '.git', 'vault'].includes(item)) {
                files.push(...getAllFiles(fullPath));
            }
        } else if (item.includes('.test.ts') || item.includes('.test.tsx')) {
            files.push(fullPath);
        }
    }
    return files;
}

function sync() {
    console.log('🚀 Начинаю синхронизацию тестов с Obsidian...');
    
    const allTestFiles = getAllFiles('.');
    console.log(`📊 Найдено файлов тестов: ${allTestFiles.length}`);

    const categorized: Record<string, string[]> = {
        '01-Unit-Тесты': [],
        '02-Интеграционные-Тесты': [],
        '03-E2E-Тесты': [],
        '04-Компонентные-Тесты': []
    };

    allTestFiles.forEach(file => {
        const normalizedPath = file.replace(/\\/g, '/');
        
        // Приоритет E2E (т.к. они в папке tests/)
        if (CONFIG.categories['03-E2E-Тесты'].patterns.some(p => normalizedPath.includes(p))) {
            categorized['03-E2E-Тесты'].push(normalizedPath);
        } else if (CONFIG.categories['04-Компонентные-Тесты'].patterns.some(p => normalizedPath.includes(p))) {
            categorized['04-Компонентные-Тесты'].push(normalizedPath);
        } else if (CONFIG.categories['02-Интеграционные-Тесты'].patterns.some(p => normalizedPath.includes(p))) {
            categorized['02-Интеграционные-Тесты'].push(normalizedPath);
        } else {
            categorized['01-Unit-Тесты'].push(normalizedPath);
        }
    });

    for (const [key, files] of Object.entries(categorized)) {
        const cat = CONFIG.categories[key as keyof typeof CONFIG.categories];
        const filePath = path.join(CONFIG.vaultBase, key, cat.fileName);
        
        let content = `# 🧪 ${cat.title}\n\n${cat.description}\n\n## 📁 Реестр файлов (Автоматическое обновление)\n\n`;
        
        if (files.length === 0) {
            content += '_Тесты не найдены._\n';
        } else {
            files.sort().forEach(f => {
                content += `- \`${f}\`\n`;
            });
        }
        
        content += `\n---\n[[090-Тесты/Тесты|Назад к общему разделу]]\n`;
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ Обновлен: ${filePath} (${files.length} файлов)`);
    }

    console.log('✨ Синхронизация завершена успешно!');
}

sync();
