// audit-ignore
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const actionsDir = './app';

function fixFile(filePath: string) {
    let content = readFileSync(filePath, 'utf-8');
    let isModified = false;

    // Только для файлов с "use server"
    if (content.includes('"use server"') || content.includes("'use server'")) {
        // Заменяем { success: true } на okVoid()
        const newContent = content.replace(
            /return\s*\{\s*success:\s*true\s*\}\s*;/g,
            'return okVoid();'
        ).replace(
            /return\s*\{\s*success:\s*true,\s*data:\s*undefined\s*\}\s*;/g,
            'return okVoid();'
        );
        
        if (newContent !== content) {
            content = newContent;
            isModified = true;
            
            // Если добавили okVoid, нужно добавить импорт
            if (content.includes('okVoid()') && !content.includes('import { okVoid }')) {
                // Пытаемся добавить в существующий импорт из @/lib/types
                if (content.includes('from "@/lib/types"')) {
                    content = content.replace(
                        /import\s*\{\s*([^}]+)\s*\}\s*from\s*["']@\/lib\/types["']/g,
                        (match, p1) => {
                            if (p1.includes('okVoid')) return match;
                            return `import { ${p1.trim()}, okVoid } from "@/lib/types"`;
                        }
                    );
                } else {
                    // Добавляем новый импорт после "use server"
                    content = content.replace(
                        /("|')use server("|');?\n/,
                        `$1use server$2;\n\nimport { okVoid } from "@/lib/types";\n`
                    );
                }
            }
        }
    }

    if (isModified) {
        writeFileSync(filePath, content);
        console.log(`Fixed: ${filePath}`);
    }
}

function walkDir(dir: string) {
    const files = readdirSync(dir);
    
    for (const file of files) {
        const filePath = join(dir, file);
        const stat = statSync(filePath);
        
        if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.')) {
            walkDir(filePath);
        } else if (file.endsWith('.ts') && (file.includes('actions') || file.includes('action'))) {
            fixFile(filePath);
        }
    }
}

console.log('Starting mass fix for ActionResults...');
walkDir(actionsDir);
console.log('Mass fix completed!');
