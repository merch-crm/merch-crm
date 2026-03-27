#!/usr/bin/env npx tsx

/**
 * MerchCRM Full Project Audit Script v5.0
 * 33 категории проверок (включая БД)
 * 
 * Исправлены ложные срабатывания на самом себе.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ============================================
// КОНФИГУРАЦИЯ
// ============================================

const CONFIG = {
    srcDir: '.',
    pagesDir: 'app',
    componentsDir: 'components',
    libDir: 'lib',
    typesDir: 'lib/types',
    hooksDir: 'hooks',
    apiDir: 'app/api',
};

const ARGS = process.argv.slice(2);
const INCLUDE_TESTS = ARGS.includes('--include-tests');

// ============================================
// ТИПЫ
// ============================================

interface AuditError {
    file: string;
    line?: number;
    column?: number;
    severity: 'critical' | 'error' | 'warning' | 'info' | 'suggestion';
    category: string;
    rule?: string;
    message: string;
    suggestion?: string;
    code?: string;
}

interface AuditStats {
    totalFiles: number;
    totalLines: number;
    totalSize: number;
    pagesCount: number;
    componentsCount: number;
    hooksCount: number;
    actionsCount: number;
    typesCount: number;
    apiRoutesCount: number;
    formsCount: number;
    testsCount: number;
    tablesCount: number;
    migrationsCount: number;

    typescriptErrors: number;
    lintErrors: number;
    lintWarnings: number;

    byCategory: Record<string, number>;
}

interface ProjectHealth {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    summary: string;
    recommendations: string[];
}

interface AuditResult {
    timestamp: string;
    duration: number;
    projectName: string;
    errors: AuditError[];
    stats: AuditStats;
    health: ProjectHealth;
}

// ============================================
// УТИЛИТЫ
// ============================================

const colors = {
    red: (s: string) => `\x1b[31m${s}\x1b[0m`,
    green: (s: string) => `\x1b[32m${s}\x1b[0m`,
    yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
    blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
    magenta: (s: string) => `\x1b[35m${s}\x1b[0m`,
    cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
    gray: (s: string) => `\x1b[90m${s}\x1b[0m`,
    bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

function log(message: string) { console.log(message); }
function logSection(title: string) {
    log('\n' + colors.bold(colors.cyan(`═══════════════════════════════════════`)));
    log(colors.bold(colors.cyan(`  ${title}`)));
    log(colors.bold(colors.cyan(`═══════════════════════════════════════`)));
}
function logSubSection(title: string) { log('\n' + colors.bold(colors.blue(`  ▸ ${title}`))); }
function logSuccess(message: string) { log(colors.green(`  ✓ ${message}`)); }
function logError(message: string) { log(colors.red(`  ✗ ${message}`)); }
function logWarning(message: string) { log(colors.yellow(`  ⚠ ${message}`)); }
function logInfo(message: string) { log(colors.blue(`  ℹ ${message}`)); }
function logDetail(message: string) { log(colors.gray(`    ${message}`)); }

function getAllFiles(dir: string, extensions: string[] = ['.ts', '.tsx']): string[] {
    const files: string[] = [];
    if (!fs.existsSync(dir)) return files;

    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!['node_modules', '.next', '.git', 'dist', 'build', 'coverage', 'ui-kit'].includes(item)) {
                files.push(...getAllFiles(fullPath, extensions));
            }
        } else if (extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
        }
    }
    return files;
}

function getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
}

function getFileSize(filePath: string): number {
    return fs.statSync(filePath).size;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function isTestFile(filePath: string): boolean {
    return filePath.includes('.test.') ||
        filePath.includes('.spec.') ||
        filePath.includes('/tests/') ||
        filePath.includes('/__tests__/') ||
        filePath.includes('/e2e/');
}

function execCommand(command: string): { success: boolean; output: string } {
    try {
        const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe', maxBuffer: 50 * 1024 * 1024 });
        return { success: true, output };
    } catch (error: unknown) {
        const err = error as { stdout?: string; stderr?: string; message?: string };
        return { success: false, output: err.stdout || err.stderr || err.message || '' };
    }
}

// ============================================
// 1. TYPESCRIPT
// ============================================

function checkTypeScript(): { errors: AuditError[]; count: number } {
    logSubSection('1. TypeScript Compiler');

    const result = execCommand('npx tsc --noEmit --pretty false 2>&1');
    const errors: AuditError[] = [];

    if (result.success) {
        logSuccess('Ошибок компиляции нет');
        return { errors: [], count: 0 };
    }

    const errorRegex = /(.+)\((\d+),(\d+)\): error (TS\d+): (.+)/g;
    let match;

    while ((match = errorRegex.exec(result.output)) !== null) {
        errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            severity: 'error',
            category: 'TypeScript',
            rule: match[4],
            message: match[5],
        });
    }

    const filteredErrors = errors.filter(e => !e.file.includes('references') && (INCLUDE_TESTS || !isTestFile(e.file)));
    logError(`Найдено ${filteredErrors.length} ошибок TypeScript ${INCLUDE_TESTS ? '(тесты включены)' : '(тесты скрыты)'}`);
    filteredErrors.slice(0, 5).forEach(e => {
        logDetail(`${e.file}:${e.line} - ${e.rule}: ${e.message}`);
    });
    if (filteredErrors.length > 5) logDetail(`... и ещё ${filteredErrors.length - 5} ошибок`);

    return { errors: filteredErrors, count: filteredErrors.length };
}

// ============================================
// 2. ESLINT
// ============================================

function checkESLint(): { errors: AuditError[]; errorCount: number; warningCount: number } {
    logSubSection('2. ESLint');

    const result = execCommand('npx eslint . --format json');
    const errors: AuditError[] = [];
    let errorCount = 0;
    let warningCount = 0;

    try {
        const jsonMatch = result.output.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (!jsonMatch) throw new Error("No JSON found");
        const lintResults = JSON.parse(jsonMatch[0]);

        for (const file of lintResults) {
            for (const msg of file.messages || []) {
                const severity = msg.severity === 2 ? 'error' : 'warning';
                if (severity === 'error') errorCount++;
                else warningCount++;

                errors.push({
                    file: file.filePath,
                    line: msg.line,
                    column: msg.column,
                    severity: severity as 'error' | 'warning',
                    category: 'ESLint',
                    rule: msg.ruleId,
                    message: msg.message,
                });
            }
        }
    } catch {
        if (result.output.includes('error')) {
            logError('Ошибка парсинга ESLint');
            return { errors: [], errorCount: 1, warningCount: 0 };
        }
    }

    const finalErrors = errors.filter(e => !e.file.includes('references') && !isTestFile(e.file));
    const finalErrorCount = finalErrors.filter(e => e.severity === 'error').length;
    const finalWarningCount = finalErrors.filter(e => e.severity === 'warning').length;

    if (finalErrorCount === 0 && finalWarningCount === 0) {
        logSuccess('Ошибок линтера нет');
    } else if (finalErrorCount === 0) {
        logWarning(`${finalWarningCount} предупреждений`);
    } else {
        logError(`${finalErrorCount} ошибок, ${finalWarningCount} предупреждений`);
    }

    return { errors: finalErrors, errorCount: finalErrorCount, warningCount: finalWarningCount };
}

// ============================================
// 4. ТИПИЗАЦИЯ
// ============================================

function checkTypes(files: string[]): AuditError[] {
    logSubSection('4. Типизация');

    const errors: AuditError[] = [];

    const patterns = [
        { regex: /:\s*any\b/g, severity: 'error' as const, message: 'Тип any запрещён', suggestion: 'Укажи конкретный тип или unknown' },
        { regex: /as\s+any\b/g, severity: 'error' as const, message: 'Приведение к any запрещено', suggestion: 'Используй as unknown as T' },
        { regex: /<any>/g, severity: 'error' as const, message: 'Generic any запрещён', suggestion: 'Укажи конкретный тип' },
        { regex: /interface\s+Order\s*\{/g, severity: 'warning' as const, message: 'Локальный интерфейс Order', suggestion: 'Импортируй из @/lib/types' },
        { regex: /interface\s+Client\s*\{/g, severity: 'warning' as const, message: 'Локальный интерфейс Client', suggestion: 'Импортируй из @/lib/types' },
        { regex: /interface\s+User\s*\{/g, severity: 'warning' as const, message: 'Локальный интерфейс User', suggestion: 'Импортируй из @/lib/types' },
        { regex: /interface\s+Product\s*\{/g, severity: 'warning' as const, message: 'Локальный интерфейс Product', suggestion: 'Импортируй из @/lib/types' },
        { regex: /@ts-ignore/g, severity: 'warning' as const, message: '@ts-ignore скрывает ошибку', suggestion: 'Исправь тип' },
    ];

    let anyCount = 0;
    let localTypeCount = 0;

    for (const file of files) {
        if (file.includes('lib/types/') || file.includes('scripts/') || isTestFile(file)) continue;

        const content = fs.readFileSync(file, 'utf-8');

        for (const { regex, severity, message, suggestion } of patterns) {
            const matches = [...content.matchAll(new RegExp(regex))];

            for (const match of matches) {
                if (message.includes('any')) anyCount++;
                if (message.includes('Локальный')) localTypeCount++;

                errors.push({
                    file,
                    line: getLineNumber(content, match.index || 0),
                    severity,
                    category: 'Типизация',
                    message,
                    suggestion,
                });
            }
        }
    }

    if (anyCount === 0 && localTypeCount === 0) {
        logSuccess('Типизация в порядке');
    } else {
        if (anyCount > 0) logError(`any используется ${anyCount} раз`);
        if (localTypeCount > 0) logWarning(`Локальных типов: ${localTypeCount}`);
    }

    return errors;
}

// ============================================
// 5. UX STANDARDS
// ============================================

function checkUXStandards(files: string[]): AuditError[] {
    logSubSection('5. UX Standards');

    const errors: AuditError[] = [];

    const forbiddenPatterns = [
        { regex: /\bgap-[4-9]\b|\bgap-1[0-9]\b|\bgap-20\b/g, message: 'Нестандартный gap (запрещено > gap-3)', suggestion: 'Используй gap-3 (12px)' },
        { regex: /\bgap-(x|y)-[4-9]\b|\bgap-(x|y)-1[0-9]\b/g, message: 'Нестандартный gap-x/y (запрещено > gap-3)', suggestion: 'Используй gap-3 (12px)' },
        { regex: /\bspace-(y|x)-[4-9]\b|\bspace-(y|x)-1[0-9]\b/g, message: 'Нестандартный space (запрещено > space-3)', suggestion: 'Используй space-3 (12px)' },
        { regex: /\buppercase\b/g, message: 'uppercase запрещён', suggestion: 'Убери uppercase' },
        { regex: /\btracking-widest\b/g, message: 'tracking-widest запрещён', suggestion: 'Используй tracking-normal' },
        { regex: /text-\[10px\]/g, message: 'text-[10px] слишком мелкий', suggestion: 'Минимум text-xs' },
        { regex: /text-\[9px\]/g, message: 'text-[9px] слишком мелкий', suggestion: 'Минимум text-xs' },
        { regex: /\balert\s*\(/g, message: 'alert() запрещён', suggestion: 'Используй useToast' },
        { regex: /\bconfirm\s*\(/g, message: 'confirm() запрещён', suggestion: 'Используй ConfirmDialog' },
        { regex: /\bprompt\s*\(/g, message: 'prompt() запрещён', suggestion: 'Используй модальное окно' },
        { regex: /console\.log\s*\(/g, message: 'console.log в production', suggestion: 'Удали или используй условную логику' },
    ];

    let violationCount = 0;

    for (const file of files) {
        if (!file.endsWith('.tsx') || file.includes('scripts/') || isTestFile(file)) continue;

        const content = fs.readFileSync(file, 'utf-8');

        for (const { regex, message, suggestion } of forbiddenPatterns) {
            const matches = [...content.matchAll(new RegExp(regex))];

            for (const match of matches) {
                violationCount++;
                errors.push({
                    file,
                    line: getLineNumber(content, match.index || 0),
                    severity: 'warning',
                    category: 'UX Standards',
                    message,
                    suggestion,
                });
            }
        }
    }

    if (violationCount === 0) {
        logSuccess('UX стандарты соблюдены');
    } else {
        logWarning(`Нарушений: ${violationCount}`);
    }

    return errors;
}

// ============================================
// 3. BUILD
// ============================================

function checkBuild(): { success: boolean; errors: AuditError[] } {
    logSubSection('3. Production Build');

    const result = execCommand('npm run build 2>&1');
    const errors: AuditError[] = [];

    if (result.success) {
        logSuccess('Сборка успешна');

        if (fs.existsSync('.next')) {
            const getSize = (dir: string): number => {
                let size = 0;
                if (fs.existsSync(dir)) {
                    const files = fs.readdirSync(dir);
                    for (const file of files) {
                        const filePath = path.join(dir, file);
                        const stat = fs.statSync(filePath);
                        size += stat.isDirectory() ? getSize(filePath) : stat.size;
                    }
                }
                return size;
            };

            const totalSize = getSize('.next');
            logInfo(`Размер .next: ${formatBytes(totalSize)}`);

            if (totalSize > 100 * 1024 * 1024) {
                errors.push({
                    file: '.next',
                    severity: 'warning',
                    category: 'Build',
                    message: `Размер сборки: ${formatBytes(totalSize)}`,
                    suggestion: 'Проанализируй бандл через @next/bundle-analyzer',
                });
            }
        }

        return { success: true, errors };
    }

    logError('Ошибка сборки');
    errors.push({
        file: 'build',
        severity: 'critical',
        category: 'Build',
        message: 'Сборка не удалась',
    });

    return { success: false, errors };
}

// ============================================
// 6. КОМПОНЕНТЫ
// ============================================

function checkComponents(files: string[]): AuditError[] {
    logSubSection('6. Использование компонентов');

    const errors: AuditError[] = [];

    const antiPatterns = [
        {
            regex: /from\s+["']@radix-ui\/react-dialog["']/g,
            message: 'Прямой импорт Dialog из Radix',
            suggestion: 'Используй ResponsiveModal',
            exclude: ['responsive-modal', 'dialog.tsx'],
        },
        {
            regex: /from\s+["']@radix-ui\/react-alert-dialog["']/g,
            message: 'Прямой импорт AlertDialog из Radix',
            suggestion: 'Используй ConfirmDialog',
            exclude: ['confirm-dialog', 'alert-dialog.tsx'],
        },
        {
            regex: /from\s+["']@radix-ui\/react-select["']/g,
            message: 'Прямой импорт Select из Radix',
            suggestion: 'Используй Select',
            exclude: ['select.tsx'],
        },
        {
            regex: /<select[ \n\t>]/g,
            message: 'Нативный <select> запрещён',
            suggestion: 'Используй Select',
            exclude: [],
        },
    ];

    let issueCount = 0;

    for (const file of files) {
        if (!file.endsWith('.tsx') || file.includes('scripts/') || isTestFile(file)) continue;

        const content = fs.readFileSync(file, 'utf-8');

        for (const { regex, message, suggestion, exclude } of antiPatterns) {
            if (exclude.some(ex => file.includes(ex))) continue;

            const matches = [...content.matchAll(new RegExp(regex))];

            for (const match of matches) {
                issueCount++;
                errors.push({
                    file,
                    line: getLineNumber(content, match.index || 0),
                    severity: 'error',
                    category: 'Компоненты',
                    message,
                    suggestion,
                });
            }
        }
    }

    if (issueCount === 0) {
        logSuccess('Компоненты используются правильно');
    } else {
        logError(`Проблем: ${issueCount}`);
    }

    return errors;
}

// ============================================
// 7. NULL SAFETY
// ============================================

function checkNullSafety(files: string[]): AuditError[] {
    logSubSection('7. Null Safety');

    const errors: AuditError[] = [];
    const dangerousVars = ['items', 'data', 'orders', 'clients', 'users', 'products', 'results', 'list', 'rows'];

    for (const file of files) {
        if (file.includes('scripts/audit.ts')) continue;

        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            for (const varName of dangerousVars) {
                const patterns = [
                    new RegExp(`\\b${varName}\\.map\\s*\\(`, 'g'),
                    new RegExp(`\\b${varName}\\.filter\\s*\\(`, 'g'),
                    new RegExp(`\\b${varName}\\.forEach\\s*\\(`, 'g'),
                    new RegExp(`\\b${varName}\\.length\\b`, 'g'),
                ];

                for (const pattern of patterns) {
                    if (pattern.test(line)) {
                        const hasOptional = line.includes(`${varName}?.`) || line.includes(`${varName}!.`);
                        const hasFallback = line.includes(`${varName} || []`) || line.includes(`${varName} ?? []`) || line.includes(`Array.isArray(${varName})`);
                        const hasCheck = lines.slice(Math.max(0, i - 5), i).some(l =>
                            l.includes(`if (${varName})`) ||
                            l.includes(`${varName} &&`) ||
                            l.includes(`Array.isArray(${varName})`) ||
                            l.includes(`!${varName}`) // guard clauses
                        ) || line.includes(`Array.isArray(${varName})`) || line.includes(`${varName} &&`);

                        if (!hasOptional && !hasFallback && !hasCheck) {
                            errors.push({
                                file,
                                line: i + 1,
                                severity: 'warning',
                                category: 'Null Safety',
                                message: `Потенциальный null: ${varName}`,
                                suggestion: `Используй ${varName}?.method() или (${varName} || [])`,
                            });
                        }
                    }
                }
            }
        }
    }

    const uniqueErrors = errors.filter((error, index, self) =>
        index === self.findIndex(e => e.file === error.file && e.line === error.line && e.message === error.message)
    );

    if (uniqueErrors.length === 0) {
        logSuccess('Проблем не найдено');
    } else {
        logWarning(`Потенциальных проблем: ${uniqueErrors.length}`);
    }

    return uniqueErrors;
}

// ============================================
// 8. СТРАНИЦЫ
// ============================================

function checkPages(): AuditError[] {
    logSubSection('8. Страницы (App Router)');

    const errors: AuditError[] = [];
    const pagesDir = CONFIG.pagesDir;

    if (!fs.existsSync(pagesDir)) {
        logWarning('Директория app не найдена');
        return errors;
    }

    const pageFiles = getAllFiles(pagesDir).filter(f => f.endsWith('page.tsx') && !f.includes('references'));
    log(`    Найдено страниц: ${pageFiles.length}`);

    for (const pageFile of pageFiles) {
        if (pageFile.includes('scripts/audit.ts')) continue;

        const content = fs.readFileSync(pageFile, 'utf-8');
        const dir = path.dirname(pageFile);
        const routePath = dir.replace(pagesDir, '') || '/';

        if (!fs.existsSync(path.join(dir, 'error.tsx')) && !routePath.includes('(')) {
            errors.push({
                file: pageFile,
                severity: 'info',
                category: 'Страницы',
                message: `${routePath} без error.tsx`,
                suggestion: 'Добавь error.tsx',
            });
        }

        const hasLoading = fs.existsSync(path.join(dir, 'loading.tsx')) ||
            content.includes('Skeleton') || content.includes('Spinner');

        if (!hasLoading && !routePath.includes('(')) {
            errors.push({
                file: pageFile,
                severity: 'info',
                category: 'Страницы',
                message: `${routePath} без loading`,
                suggestion: 'Добавь loading.tsx или Skeleton',
            });
        }

        const hasMetadata = content.includes('export const metadata') || content.includes('generateMetadata');
        if (!hasMetadata && !routePath.includes('(') && !routePath.includes('api')) {
            errors.push({
                file: pageFile,
                severity: 'info',
                category: 'SEO',
                message: `${routePath} без metadata`,
                suggestion: 'Добавь metadata для SEO',
            });
        }
    }

    logInfo(`Проверено ${pageFiles.length} страниц`);
    return errors;
}

// ============================================
// 9. SERVER ACTIONS
// ============================================

function checkServerActions(): AuditError[] {
    logSubSection('9. Server Actions');

    const errors: AuditError[] = [];
    const actionFiles = getAllFiles(CONFIG.srcDir).filter(f => f.endsWith('actions.ts') && !f.includes('references') && !f.includes('scripts/'));

    log(`    Найдено файлов: ${actionFiles.length}`);

    for (const file of actionFiles) {
        if (file.includes('scripts/audit.ts')) continue;

        const content = fs.readFileSync(file, 'utf-8');

        const hasUseServer = content.includes('"use server"') || content.includes("'use server'");
        const hasDirectExports = (content.match(/export\s+(async\s+)?function/g) || []).length > 0;
        const isBarrel = (content.includes('export {') && content.includes('} from')) || content.includes('export * from');

        if (!hasUseServer && (hasDirectExports || !isBarrel)) {
            errors.push({
                file,
                severity: 'critical',
                category: 'Server Actions',
                message: 'Отсутствует "use server"',
            });
        }

        const hasZod = content.includes('zod') || content.includes('.parse(') || content.includes('.safeParse(');
        if (!hasZod && !isBarrel) {
            errors.push({
                file,
                severity: 'warning',
                category: 'Server Actions',
                message: 'Нет zod валидации',
                suggestion: 'Добавь валидацию через zod',
            });
        }

        const exportCount = (content.match(/export\s+(async\s+)?function/g) || []).length;
        const tryCatchCount = (content.match(/try\s*\{/g) || []).length;
        const withAuthCount = (content.match(/return\s+withAuth(<[^>]+>)?\s*\(/g) || []).length;
        const safeActionCount = (content.match(/createSafeAction\s*\(/g) || []).length;

        const safeCount = tryCatchCount + withAuthCount + safeActionCount;
        if (exportCount > 0 && safeCount < exportCount) {
            errors.push({
                file,
                severity: 'warning',
                category: 'Server Actions',
                message: `Не все функции имеют try-catch или withAuth (нашел ${exportCount} ф-ций, ${tryCatchCount} try-catch, ${withAuthCount} withAuth, ${safeActionCount} safeAction)`,
            });
        }
    }

    if (errors.filter(e => e.category === 'Server Actions').length === 0) {
        logSuccess('Server Actions в порядке');
    }

    return errors;
}

// ============================================
// 10. БЕЗОПАСНОСТЬ
// ============================================

// ============================================
// 10. РАСШИРЕННАЯ БЕЗОПАСНОСТЬ (22 категории)
// ============================================

// 1. АВТОРИЗАЦИЯ SERVER ACTIONS
// ============================================

function auditServerActionAuth(): AuditError[] {
    logSubSection('1. Авторизация Server Actions');
    const errors: AuditError[] = [];

    const actionFiles = getAllFiles("app")
        .filter(f => f.endsWith("actions.ts") && !(f.includes("scripts/audit.ts") || f.includes("scripts/audit.ts")) && !f.includes(".test.") && !f.includes(".spec."));

    let unprotected = 0;
    let total = 0;

    // Функции, которые по дизайну не требуют авторизации
    const AUTH_WHITELIST = new Set([
        "loginAction",           // Страница логина — до авторизации
        "logout",                // Выход — должен работать всегда
        "getBrandingAction",     // Настройки оформления — нужны на странице логина
        "getBrandingSettings",   // Обёртка над getBrandingAction
        "updateBrandingSettings",// Делегирует в updateBrandingAction (requireAdmin)
        "getIconGroups",         // Категории иконок — нужны публично
        "getArchivedItems",      // Делегирует в getInventoryItems (с getSession)
        "recordPresenceEvent",   // Вызывается Python ML-сервисом (не пользователем)
        "createAutoTask",        // Системная функция, вызывается из backend
    ]);

    for (const file of actionFiles) {
        const content = fs.readFileSync(file, "utf-8");
        const isBarrel = !content.includes("export async function") && !content.includes("export function");
        if (isBarrel) continue;

        const hasUseServer = content.includes('"use server"') || content.includes("'use server'");
        if (!hasUseServer) continue;

        // Если файл в целом содержит getSession - скорее всего всё OK (вызывается через вспомогательную функцию)
        const fileHasAuth = content.includes("getSession") || content.includes("requireAdmin") || content.includes("withAuth");

        // Найти все экспортируемые функции
        const funcRegex = /export\s+(async\s+)?function\s+(\w+)/g;
        let match;
        while ((match = funcRegex.exec(content)) !== null) {
            total++;
            const funcName = match[2];
            const funcStart = match.index;

            // Пропускаем функции из белого списка
            if (AUTH_WHITELIST.has(funcName)) continue;

            // Get/fetch/read-only префиксы — не мутируют данные, audit-ignore их как warning
            const isReadOnly = /^(get|fetch|read|list|find|search|count|check|is|has|can|validate)/.test(funcName);

            // Ищем тело функции — от начала до следующей экспортной функции или конца файла
            const nextFunc = content.indexOf("\nexport ", funcStart + 1);
            const funcBody = content.substring(funcStart, nextFunc > 0 ? nextFunc : content.length);

            const hasGetSession = funcBody.includes("getSession") || funcBody.includes("getAuthSession") || funcBody.includes("getCurrentUser");
            const hasRequireAdmin = funcBody.includes("requireAdmin(");
            const hasWithAuth = funcBody.includes("withAuth") || funcBody.includes("withSession") || funcBody.includes("createSafeAction");
            const isIgnored = funcBody.includes("audit-ignore");

            if (!hasGetSession && !hasRequireAdmin && !hasWithAuth && !isIgnored) {
                // Если файл имеет auth в нём — понижаем до warning (функция косвенно защищена)
                const severity = fileHasAuth || isReadOnly ? 'warning' as const : 'critical' as const;
                unprotected++;
                errors.push({
                    file,
                    line: getLineNumber(content, funcStart),
                    severity,
                    category: "Авторизация",
                    message: `${funcName}() без явной проверки авторизации`,
                    suggestion: "Добавь const session = await getSession(); if (!session) return { error: 'Не авторизован' };",
                });
            }
        }
    }

    if (unprotected === 0) logSuccess(`Все ${total} Server Action функций защищены`);
    else logError(`${unprotected} из ${total} функций без авторизации`);

    return errors;
}

// ============================================
// 2. РОЛЕВАЯ МОДЕЛЬ (RBAC)
// ============================================

function auditRBAC(): AuditError[] {
    logSubSection('2. Ролевая модель (RBAC)');
    const errors: AuditError[] = [];

    const SENSITIVE_PATTERNS = [
        { pattern: /delete|remove|destroy|drop/i, action: "удаление" },
        { pattern: /export|download|backup/i, action: "экспорт/бэкап" },
        { pattern: /update.*role|change.*role|assign.*role/i, action: "управление ролями" },
        { pattern: /create.*user|delete.*user|update.*user/i, action: "управление пользователями" },
        { pattern: /refund|payment|финанс/i, action: "финансовые операции" },
    ];

    const ALLOWED_ROLES = ["Администратор", "Руководство", "Отдел продаж"];

    const actionFiles = getAllFiles("app")
        .filter(f => f.endsWith("actions.ts") && !(f.includes("scripts/audit.ts") || f.includes("scripts/audit.ts")) && !f.includes(".test.") && !f.includes(".spec."));

    let issues = 0;

    for (const file of actionFiles) {
        const content = fs.readFileSync(file, "utf-8");
        if (!content.includes('"use server"')) continue;

        // Пропускаем модуль задач — удаление своих items доступно всем авторизованным
        if (file.includes("/tasks/actions/")) continue;

        const funcRegex = /export\s+(async\s+)?function\s+(\w+)/g;
        let match;
        while ((match = funcRegex.exec(content)) !== null) {
            const funcName = match[2];
            const funcStart = match.index;
            const nextFunc = content.indexOf("\nexport ", funcStart + 1);
            const funcBody = content.substring(funcStart, nextFunc > 0 ? nextFunc : content.length);

            for (const { pattern, action } of SENSITIVE_PATTERNS) {
                if (pattern.test(funcName)) {
                    const hasRoleCheck =
                        funcBody.includes("roleName") ||
                        funcBody.includes("requireAdmin") ||
                        funcBody.includes("audit-ignore") ||
                        funcBody.includes("ROLE_GROUPS") ||
                        funcBody.includes("roles:") ||
                        funcBody.includes("session.role") ||
                        ALLOWED_ROLES.some(r => funcBody.includes(r));

                    if (!hasRoleCheck) {
                        issues++;
                        errors.push({
                            file,
                            line: getLineNumber(content, funcStart),
                            severity: 'error',
                            category: "RBAC",
                            message: `${funcName}() — ${action} без проверки роли` + ' - ' + `Функция выполняет "${action}", но не проверяет роль пользователя. Это может дать рядовым сотрудникам доступ к опасным операциям.`,
                            suggestion: `Добавь проверку: if (!["Администратор", "Руководство"].includes(session.roleName)) return { success: false, error: "Недостаточно прав" };`,
                            
                        });
                    }
                }
            }
        }
    }

    if (issues === 0) logSuccess("RBAC: все чувствительные функции проверяют роли");
    else logWarning(`${issues} чувствительных функций без проверки ролей`);

    return errors;
}

// ============================================
// 3. API ROUTES АВТОРИЗАЦИЯ
// ============================================

function auditApiRoutes(): AuditError[] {
    logSubSection('3. API Routes авторизация');
    const errors: AuditError[] = [];

    const routeFiles = getAllFiles("app/api", [".ts"])
        .filter(f => f.endsWith("route.ts") && !(f.includes("scripts/audit.ts") || f.includes("scripts/audit.ts")));

    let unprotected = 0;

    for (const file of routeFiles) {
        const content = fs.readFileSync(file, "utf-8");

        // Пропускаем login / health / callbacks / csrf (публичные по дизайну)
        if (file.includes("/auth/login") || file.includes("/health") || file.includes("/callback") || file.includes("/csrf")) continue;

        const handlers = ["GET", "POST", "PUT", "PATCH", "DELETE"];
        for (const method of handlers) {
            const handlerRegex = new RegExp(`export\\s+async\\s+function\\s+${method}\\b`);
            const handlerMatch = handlerRegex.exec(content);
            if (!handlerMatch) continue;

            const hasAuth =
                content.includes("getSession") ||
                content.includes("getCurrentUser") ||
                content.includes("requireAdmin") ||
                content.includes("Authorization") ||
                content.includes("CRON_SECRET") ||
                content.includes("Bearer") ||
                content.includes("audit-ignore") ||
                content.includes("createSafeAction") ||
                content.includes("API_KEY");

            if (!hasAuth) {
                unprotected++;
                errors.push({
                    file,
                    line: getLineNumber(content, handlerMatch.index),
                    severity: 'critical',
                    category: "API Auth",
                    message: `${method} ${file.replace("app/api", "/api").replace("/route.ts", "")} — без авторизации — API эндпоинт не проверяет ни сессию, ни API ключ. Доступен публично.`,
                    suggestion: "Добавь проверку getSession() или Bearer токена",
                });
            }
        }
    }

    if (unprotected === 0) logSuccess("Все API роуты защищены");
    else logError(`${unprotected} публичных API роутов`);

    return errors;
}

// ============================================
// 4. SQL INJECTION
// ============================================

function auditSqlInjection(): AuditError[] {
    logSubSection('4. SQL Injection');
    const errors: AuditError[] = [];

    const files = getAllFiles(".", [".ts", ".tsx"])
        .filter(f => !(f.includes("scripts/") || f.includes("test-utils/")) && !f.includes(".test.") && !f.includes(".spec."));

    let issues = 0;

    for (const file of files) {
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes("audit-ignore")) continue;

            // Шаблонные строки в sql`` с переменными через ${} — нормально для drizzle-orm sql tag,
            // но опасно для db.execute(sql`...${userInput}...`) с raw input
            if (line.includes("db.execute(") && line.includes("${")) {
                // Проверяем, параметризован ли запрос через sql`` tag
                if (!line.includes("sql`") && !line.includes("sql(")) {
                    issues++;
                    errors.push({
                        file,
                        line: i + 1,
                        severity: 'critical',
                        category: "SQL Injection",
                        message: "Потенциальная SQL Injection через db.execute()" + ' - ' + `Строка содержит db.execute() с интерполяцией без sql tag. Это может привести к SQL injection.`,
                        suggestion: "Используй sql`...` tag из drizzle-orm для параметризации запросов",
                        
                    });
                }
            }

            // Конкатенация строк в SQL
            if (/(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)\s/.test(line) && /\+\s*(req|params|body|query|input|search|filter|value)/.test(line)) {
                issues++;
                errors.push({
                    file,
                    line: i + 1,
                    severity: 'critical',
                    category: "SQL Injection",
                    message: "Конкатенация пользовательского ввода в SQL запрос" + ' - ' + `Обнаружена конкатенация переменных с SQL-ключевыми словами.`,
                    suggestion: "Используй параметризованные запросы через drizzle-orm",
                    
                });
            }
        }
    }

    if (issues === 0) logSuccess("SQL Injection уязвимостей не найдено");
    else logError(`${issues} потенциальных SQL Injection`);

    return errors;
}

// ============================================
// 5. XSS (Cross-Site Scripting)
// ============================================

function auditXSS(): AuditError[] {
    logSubSection('5. XSS (Cross-Site Scripting)');
    const errors: AuditError[] = [];

    const tsxFiles = getAllFiles(".", [".tsx"])
        .filter(f => !(f.includes("scripts/audit.ts") || f.includes("scripts/audit.ts")) && !f.includes(".test.") && !f.includes(".spec."));

    let issues = 0;

    for (const file of tsxFiles) {
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // dangerouslySetInnerHTML
            if (line.includes("dangerouslySetInnerHTML")) {
                // Проверяем наличие DOMPurify
                const hasSanitize = content.includes("DOMPurify") || content.includes("sanitize") || content.includes("purify");
                if (!hasSanitize) {
                    issues++;
                    errors.push({
                        file,
                        line: i + 1,
                        severity: 'error',
                        category: "XSS",
                        message: "dangerouslySetInnerHTML без санитизации" + ' - ' + "Использование dangerouslySetInnerHTML без DOMPurify может привести к XSS.",
                        suggestion: "Используй DOMPurify.sanitize() перед вставкой HTML",
                        
                    });
                }
            }

            // innerHTML в обработчиках
            if (/\.innerHTML\s*=/.test(line)) {
                issues++;
                errors.push({
                    file,
                    line: i + 1,
                    severity: 'error',
                    category: "XSS",
                    message: "Присвоение innerHTML" + ' - ' + "Прямое присвоение innerHTML создает XSS уязвимость",
                    suggestion: "Используй textContent или React компоненты",
                    
                });
            }

            // document.write
            if (/document\.write\s*\(/.test(line)) {
                if (!line.includes("printWindow")) {
                    issues++;
                    errors.push({
                        file,
                        line: i + 1,
                        severity: 'error',
                        category: "XSS",
                        message: "document.write()" + ' - ' + "document.write() создает XSS уязвимость",
                        suggestion: "Используй DOM API или React",
                        
                    });
                }
            }
        }
    }

    if (issues === 0) logSuccess("XSS уязвимостей не найдено");
    else logError(`${issues} XSS уязвимостей`);

    return errors;
}

// ============================================
// 6. HARDCODED SECRETS
// ============================================

function auditSecrets(): AuditError[] {
    logSubSection('6. Захардкоженные секреты и ключи');
    const errors: AuditError[] = [];

    const files = getAllFiles(".", [".ts", ".tsx", ".js", ".json"])
        .filter(f => !f.includes("scripts/") && !f.includes("test-utils/") && !f.includes("node_modules") && !f.includes(".next")
            && !f.includes(".test.") && !f.includes(".spec.") && !f.includes("package.json") && !f.includes("package-lock") && !f.includes(".env"));

    const SECRET_PATTERNS: Array<{ regex: RegExp; name: string; exclude?: RegExp }> = [
        { regex: /password\s*[:=]\s*["'](?!Error|Failed|Не удалось|Ошибка|Пароль|password|confirm|new|old|current|hash)[^"']{4,}["']/gi, name: "Хардкод пароля", exclude: /placeholder|example|label|hint|message|error|type=/i },
        { regex: /api[_-]?key\s*[:=]\s*["'][A-Za-z0-9_\-]{10,}["']/gi, name: "API ключ в коде" },
        { regex: /secret\s*[:=]\s*["'][A-Za-z0-9_\-]{10,}["']/gi, name: "Секрет в коде", exclude: /process\.env|CRON_SECRET|env\./i },
        { regex: /token\s*[:=]\s*["'][A-Za-z0-9_\-]{20,}["']/gi, name: "Токен в коде", exclude: /csrf|session|cookie|jwt/i },
        { regex: /private[_-]?key\s*[:=]\s*["'][^"']+["']/gi, name: "Приватный ключ в коде" },
        { regex: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g, name: "PEM ключ в коде" },
        { regex: /process\.env\.([^ \t\n\r.;,(){}[\]]+)/g, name: "Доступ к env напрямую (не через lib/env)" },
    ];

    let issues = 0;

    for (const file of files) {
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes("// audit-ignore") || line.includes("// Safe") || line.includes("process.env")) continue;

            for (const { regex, name, exclude } of SECRET_PATTERNS) {
                const re = new RegExp(regex.source, regex.flags);
                if (re.test(line)) {
                    if (exclude && exclude.test(line)) continue;
                    issues++;
                    errors.push({
                        file,
                        line: i + 1,
                        severity: 'critical',
                        category: "Secrets",
                        message: name + ' - ' + `Обнаружен секрет в исходном коде: ${line.trim().substring(0, 80)}...`,
                        suggestion: "Перенеси значение в .env файл и используй process.env.VARIABLE_NAME",
                        
                    });
                }
            }
        }
    }

    // Проверка .env в .gitignore
    if (fs.existsSync(".gitignore")) {
        const gitignore = fs.readFileSync(".gitignore", "utf-8");
        if (!gitignore.includes(".env")) {
            issues++;
            errors.push({
                file: ".gitignore",
                severity: 'critical',
                category: "Secrets",
                message: ".env файл не исключен из Git" + ' - ' + ".env файл может быть отправлен в репозиторий с секретами",
                suggestion: "Добавь .env* в .gitignore",
                
            });
        }
    }

    if (issues === 0) logSuccess("Захардкоженных секретов не найдено");
    else logError(`${issues} захардкоженных секретов`);

    return errors;
}

// ============================================
// 7. FILE UPLOAD SECURITY
// ============================================

function auditFileUploads(): AuditError[] {
    logSubSection('7. Безопасность загрузки файлов');
    const errors: AuditError[] = [];

    const files = getAllFiles(".", [".ts", ".tsx"])
        .filter(f => !(f.includes("scripts/audit.ts") || f.includes("scripts/audit.ts")) && !f.includes(".test.") && !f.includes(".spec."));

    let issues = 0;

    for (const file of files) {
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // writeFile без валидации
            if ((line.includes("writeFile(") || line.includes("writeFileSync(")) && file.includes("route")) {
                const surroundingCode = lines.slice(Math.max(0, i - 15), i + 5).join("\n");
                const hasValidation =
                    surroundingCode.includes("mime") ||
                    surroundingCode.includes("fileType") ||
                    surroundingCode.includes("extension") ||
                    surroundingCode.includes("allowedTypes") ||
                    surroundingCode.includes("MAX_SIZE") ||
                    surroundingCode.includes("maxSize") ||
                    surroundingCode.includes("size >") ||
                    surroundingCode.includes("image/");

                if (!hasValidation) {
                    issues++;
                    errors.push({
                        file,
                        line: i + 1,
                        severity: 'error',
                        category: "File Upload",
                        message: "Загрузка файлов без валидации типа/размера" + ' - ' + "Файл записывается на диск без проверки MIME-типа и размера",
                        suggestion: "Добавь проверку MIME-типа (image/jpeg, image/png) и максимального размера (10MB)",
                        
                    });
                }
            }

            // Path traversal через пользовательский ввод в путях
            if ((line.includes("path.join") || line.includes("path.resolve")) && file.includes("route")) {
                const surroundingCode = lines.slice(Math.max(0, i - 5), i + 5).join("\n");
                if ((surroundingCode.includes("req.") || surroundingCode.includes("params") || surroundingCode.includes("body")) &&
                    !surroundingCode.includes("path.basename") &&
                    !surroundingCode.includes("sanitize") &&
                    !surroundingCode.includes("replace(/\\.\\./")) {
                    issues++;
                    errors.push({
                        file,
                        line: i + 1,
                        severity: 'error',
                        category: "Path Traversal",
                        message: "Пользовательский ввод в пути к файлу" + ' - ' + "Потенциальная атака Path Traversal: пользовательский ввод используется в пути файла без санитизации",
                        suggestion: "Используй path.basename() для извлечения имени файла и проверяй на ../",
                        
                    });
                }
            }
        }
    }

    if (issues === 0) logSuccess("Загрузка файлов безопасна");
    else logWarning(`${issues} проблем с загрузкой файлов`);

    return errors;
}

// ============================================
// 8. IDOR (Insecure Direct Object Reference)
// ============================================

function auditIDOR(): AuditError[] {
    logSubSection('8. IDOR (Insecure Direct Object Reference)');
    const errors: AuditError[] = [];

    const actionFiles = getAllFiles("app", [".ts"])
        .filter(f => f.endsWith("actions.ts") && !(f.includes("scripts/audit.ts") || f.includes("scripts/audit.ts")) && !f.includes(".test.") && !f.includes(".spec."));

    let issues = 0;

    for (const file of actionFiles) {
        const content = fs.readFileSync(file, "utf-8");
        if (!content.includes('"use server"')) continue;

        const funcRegex = /export\s+(async\s+)?function\s+(\w+)/g;
        let match;
        while ((match = funcRegex.exec(content)) !== null) {
            const funcName = match[2];
            const funcStart = match.index;
            const nextFunc = content.indexOf("\nexport ", funcStart + 1);
            const funcBody = content.substring(funcStart, nextFunc > 0 ? nextFunc : content.length);

            // Функции удаления/обновления которые принимают ID, но не проверяют владельца
            const isDangerousAction = /delete|remove|update|edit/i.test(funcName);
            const takesId = /\b(id|clientId|orderId|itemId|userId)\b/.test(funcBody.split("\n")[0]);
            const checksOwnership =
                funcBody.includes("session.id") ||
                funcBody.includes("createdBy") ||
                funcBody.includes("managerId") ||
                funcBody.includes("assignedTo") ||
                funcBody.includes("requireAdmin") ||
                funcBody.includes("ROLE_GROUPS") ||
                funcBody.includes("roles:") ||
                funcBody.includes("createSafeAction") ||
                funcBody.includes("roleName");

            if (isDangerousAction && takesId && !checksOwnership) {
                issues++;
                errors.push({
                    file,
                    line: getLineNumber(content, funcStart),
                    severity: 'warning',
                    category: "IDOR",
                    message: `${funcName}() — нет проверки принадлежности объекта` + ' - ' + `Функция принимает ID и выполняет мутацию, но не проверяет, принадлежит ли объект текущему пользователю или его роли.`,
                    suggestion: "Добавь проверку: где объект.createdBy === session.id или session имеет нужную роль",
                    
                });
            }
        }
    }

    if (issues === 0) logSuccess("IDOR уязвимостей не найдено");
    else logWarning(`${issues} потенциальных IDOR`);

    return errors;
}

// ============================================
// 9. EVAL И ДИНАМИЧЕСКОЕ ВЫПОЛНЕНИЕ
// ============================================

function auditCodeExecution(): AuditError[] {
    logSubSection('9. Динамическое выполнение кода');
    const errors: AuditError[] = [];

    const files = getAllFiles(".", [".ts", ".tsx"])
        .filter(f => !(f.includes("scripts/audit.ts") || f.includes("scripts/audit.ts")) && !f.includes(".test.") && !f.includes(".spec."));

    let issues = 0;

    const DANGEROUS = [
        { regex: /\beval\s*\(/g, name: "eval()", severity: 'critical' as const },
        { regex: /new\s+Function\s*\(/g, name: "new Function()", severity: 'error' as const },
        { regex: /setTimeout\s*\(\s*["'`]/g, name: "setTimeout с строкой", severity: 'error' as const },
        { regex: /setInterval\s*\(\s*["'`]/g, name: "setInterval с строкой", severity: 'error' as const },
        { regex: /child_process|execSync\s*\(|spawn\s*\(/g, name: "Системная команда", severity: 'error' as const },
    ];

    for (const file of files) {
        // Исключаем скрипты из scripts/ т.к. они не являются частью runtime
        if (file.startsWith("scripts/")) continue;

        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*")) continue;

            for (const { regex, name, severity } of DANGEROUS) {
                if (new RegExp(regex.source, regex.flags).test(line)) {
                    // Исключение для Redis multi.exec() или audit-ignore
                    if (line.includes("audit-ignore")) continue;
                    if (name === "eval/exec" && line.includes("multi.exec()")) continue;
                    issues++;
                    errors.push({
                        file,
                        line: i + 1,
                        severity,
                        category: "Code Execution",
                        message: `Опасный вызов: ${name}` + ' - ' + `Использование ${name} позволяет выполнить произвольный код`,
                        suggestion: "Избегай динамического выполнения кода. Используй безопасные альтернативы",
                        
                    });
                }
            }
        }
    }

    if (issues === 0) logSuccess("Опасных вызовов не найдено");
    else logError(`${issues} опасных вызовов`);

    return errors;
}

// ============================================
// 10. INPUT VALIDATION (Zod)
// ============================================

function auditInputValidation(): AuditError[] {
    logSubSection('10. Валидация входных данных (Zod)');
    const errors: AuditError[] = [];

    const actionFiles = getAllFiles("app", [".ts"])
        .filter(f => f.endsWith("actions.ts") && !(f.includes("scripts/audit.ts") || f.includes("scripts/audit.ts")) && !f.includes(".test.") && !f.includes(".spec."));

    let unvalidated = 0;
    let total = 0;

    for (const file of actionFiles) {
        const content = fs.readFileSync(file, "utf-8");
        if (!content.includes('"use server"')) continue;

        const hasZod = content.includes("zod") || content.includes(".parse(") || content.includes(".safeParse(") || content.includes("Schema");

        const funcRegex = /export\s+(async\s+)?function\s+(\w+)/g;
        let match;
        while ((match = funcRegex.exec(content)) !== null) {
            total++;
            const funcName = match[2];
            const funcStart = match.index;
            const nextFunc = content.indexOf("\nexport ", funcStart + 1);
            const funcBody = content.substring(funcStart, nextFunc > 0 ? nextFunc : content.length);

            // Имеет параметры содержательные (не void, не пустые)
            const paramsMatch = funcBody.match(/function\s+\w+\s*\(([^)]*)\)/);
            const params = paramsMatch ? paramsMatch[1].trim() : "";
            const hasParams = params.length > 0;

            if (hasParams && !hasZod) {
                const funcHasValidation = funcBody.includes(".parse(") || funcBody.includes(".safeParse(") || funcBody.includes("Schema") || funcBody.includes("z.string()");

                if (!funcHasValidation) {
                    unvalidated++;
                    errors.push({
                        file,
                        line: getLineNumber(content, funcStart),
                        severity: 'warning',
                        category: "Input Validation",
                        message: `${funcName}() без Zod валидации` + ' - ' + `Server Action принимает параметры, но не использует Zod для их валидации.`,
                        suggestion: "Добавь Zod-схему для валидации входных данных",
                        
                    });
                }
            }
        }
    }

    if (unvalidated === 0) logSuccess(`Все ${total} Server Action функций валидируют ввод`);
    else logWarning(`${unvalidated} из ${total} функций без валидации входных данных`);

    return errors;
}

// ============================================
// 11. CSRF PROTECTION
// ============================================

function auditCSRF(): AuditError[] {
    logSubSection('11. CSRF Protection');
    const errors: AuditError[] = [];

    // Проверяем cookie настройки
    const authFile = "lib/auth.ts";
    if (fs.existsSync(authFile)) {
        const content = fs.readFileSync(authFile, "utf-8");

        if (!content.includes("httpOnly: true") && !content.includes("httpOnly:true")) {
            errors.push({
                file: authFile,
                severity: 'error',
                category: "CSRF",
                message: "Cookie без флага httpOnly" + ' - ' + "Session cookie должен иметь httpOnly: true для защиты от XSS",
                suggestion: "Добавь httpOnly: true в cookie options",
                
            });
        }

        if (!content.includes("sameSite")) {
            errors.push({
                file: authFile,
                severity: 'error',
                category: "CSRF",
                message: "Cookie без SameSite" + ' - ' + "Session cookie должна иметь SameSite для CSRF-защиты",
                suggestion: 'Добавь sameSite: "lax" или "strict" в cookie options',
                
            });
        }

        if (!content.includes("secure")) {
            errors.push({
                file: authFile,
                severity: 'warning',
                category: "CSRF",
                message: "Cookie без флага Secure" + ' - ' + "Session cookie должна быть Secure в production",
                suggestion: 'Добавь secure: process.env.NODE_ENV === "production"',
                
            });
        }
    }

    if (errors.length === 0) logSuccess("CSRF защита в порядке (httpOnly + SameSite + Secure)");
    else logError(`${errors.length} проблем с CSRF`);

    return errors;
}

// ============================================
// 12. RATE LIMITING
// ============================================

function auditRateLimiting(): AuditError[] {
    logSubSection('12. Rate Limiting');
    const errors: AuditError[] = [];

    // Проверяем login роут
    const loginRoute = "app/api/auth/login/route.ts";
    if (fs.existsSync(loginRoute)) {
        const content = fs.readFileSync(loginRoute, "utf-8");
        if (!content.includes("rateLimit") && !content.includes("rate-limit") && !content.includes("throttle") && !content.includes("attempts") && !content.includes("lockout") && !content.includes("MAX_ATTEMPTS")) {
            errors.push({
                file: loginRoute,
                severity: 'error',
                category: "Rate Limiting",
                message: "Login без rate limiting" + ' - ' + "Эндпоинт логина не имеет ограничения на количество попыток. Уязвим к brute-force атакам.",
                suggestion: "Добавь rate limiting: максимум 5 попыток за 15 минут с блокировкой IP",
                
            });
        }
    }

    // Проверяем другие чувствительные роуты
    const sensitiveRoutes = getAllFiles("app/api", [".ts"]).filter(f => f.endsWith("route.ts"));
    for (const file of sensitiveRoutes) {
        if (file.includes("login") || file.includes("health")) continue;
        const content = fs.readFileSync(file, "utf-8");

        if (content.includes("POST") && (content.includes("password") || content.includes("payment") || content.includes("refund"))) {
            if (!content.includes("rateLimit") && !content.includes("rate-limit") && !content.includes("throttle")) {
                errors.push({
                    file,
                    severity: 'warning',
                    category: "Rate Limiting",
                    message: "Чувствительный POST эндпоинт без rate limiting" + ' - ' + "POST эндпоинт работает с паролями или финансами без ограничения частоты запросов",
                    suggestion: "Добавь rate limiting middleware",
                    
                });
            }
        }
    }

    if (errors.length === 0) logSuccess("Rate limiting в порядке");
    else logWarning(`${errors.length} эндпоинтов без rate limiting`);

    return errors;
}

// ============================================
// 13. SECURITY HEADERS
// ============================================

function auditSecurityHeaders(): AuditError[] {
    logSubSection('13. Security Headers');
    const errors: AuditError[] = [];

    // Проверяем next.config
    const configFiles = ["next.config.ts", "next.config.js", "next.config.mjs"];
    let configFile: string | null = null;
    for (const f of configFiles) {
        if (fs.existsSync(f)) { configFile = f; break; }
    }

    if (configFile) {
        const content = fs.readFileSync(configFile, "utf-8");

        const requiredHeaders = [
            { header: "X-Frame-Options", severity: 'warning' as const },
            { header: "X-Content-Type-Options", severity: 'warning' as const },
            { header: "Strict-Transport-Security", severity: 'warning' as const },
            { header: "Content-Security-Policy", severity: 'info' as const },
        ];

        for (const { header, severity } of requiredHeaders) {
            if (!content.includes(header)) {
                errors.push({
                    file: configFile,
                    severity,
                    category: "Security Headers",
                    message: `Отсутствует заголовок: ${header}` + ' - ' + `Заголовок безопасности ${header} не настроен в Next.js конфигурации.`,
                    suggestion: `Добавь ${header} в headers() функцию в next.config`,
                    
                });
            }
        }
    }

    // Проверяем middleware.ts
    if (fs.existsSync("middleware.ts")) {
        const content = fs.readFileSync("middleware.ts", "utf-8");
        if (!content.includes("X-Frame-Options") && !content.includes("headers")) {
            errors.push({
                file: "middleware.ts",
                severity: 'info',
                category: "Security Headers",
                message: "Middleware без security headers" + ' - ' + "Middleware существует, но не устанавливает заголовки безопасности",
                suggestion: "Рассмотри добавление security headers в middleware",
            });
        }
    }

    if (errors.length === 0) logSuccess("Security headers настроены");
    else logInfo(`${errors.length} рекомендаций по security headers`);

    return errors;
}

// ============================================
// 14. PASSWORD HASHING
// ============================================

function auditPasswordHandling(): AuditError[] {
    logSubSection('14. Обработка паролей');
    const errors: AuditError[] = [];

    const files = getAllFiles(".", [".ts", ".tsx"])
        .filter(f => !f.includes("scripts/") && !f.includes("test-utils/") && !f.includes(".test.") && !f.includes(".spec.") && !f.includes("node_modules"));

    for (const file of files) {
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // MD5/SHA1 для паролей
            if (/md5|sha1/i.test(line) && /password/i.test(line)) {
                if (!file.includes("cameras.actions.ts")) {
                    errors.push({
                        file,
                        line: i + 1,
                        severity: 'critical',
                        category: "Password",
                        message: "Слабый алгоритм хеширования паролей" + ' - ' + "MD5/SHA1 не подходят для хеширования паролей",
                        suggestion: "Используй bcrypt или argon2",
                        
                    });
                }
            }

            // Логирование паролей
            if (/console\.(log|info|warn|error|debug)/.test(line) && /password/i.test(line) && !line.includes("hashPassword")) {
                if (!file.includes("setup-e2e.ts")) {
                    errors.push({
                        file,
                        line: i + 1,
                        severity: 'error',
                        category: "Password",
                        message: "Возможное логирование пароля" + ' - ' + "Пароль может быть записан в лог",
                        suggestion: "Никогда не логируй пароли",
                        
                    });
                }
            }
        }
    }

    if (errors.length === 0) logSuccess("Обработка паролей безопасна");
    else logError(`${errors.length} проблем с паролями`);

    return errors;
}

// ============================================
// 15. MASS ASSIGNMENT
// ============================================

function auditMassAssignment(): AuditError[] {
    logSubSection('15. Mass Assignment');
    const errors: AuditError[] = [];

    const files = getAllFiles("app", [".ts"])
        .filter(f => f.endsWith("actions.ts") && !(f.includes("scripts/audit.ts") || f.includes("scripts/audit.ts")) && !f.includes(".test.") && !f.includes(".spec."));

    let issues = 0;

    for (const file of files) {
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Прямое распространение пользовательского ввода в .set() или .values()
            if (/\.set\(\s*\.\.\.\s*(data|body|input|params|values|formData)/.test(line) ||
                /\.values\(\s*\.\.\.\s*(data|body|input|params|values|formData)/.test(line)) {
                issues++;
                errors.push({
                    file,
                    line: i + 1,
                    severity: 'error',
                    category: "Mass Assignment",
                    message: "Spread оператор в запросе к БД" + ' - ' + "Пользовательский ввод напрямую распространяется в запрос к БД через spread. Злоумышленник может перезаписать поля, которые не должны быть доступны (role, isAdmin и т.д.).",
                    suggestion: "Явно перечисли разрешенные поля вместо ...data",
                    
                });
            }
        }
    }

    if (issues === 0) logSuccess("Mass Assignment уязвимостей не найдено");
    else logWarning(`${issues} потенциальных Mass Assignment`);

    return errors;
}

// ============================================
// 16. OPEN REDIRECT
// ============================================

function auditOpenRedirect(): AuditError[] {
    logSubSection('16. Open Redirect');
    const errors: AuditError[] = [];

    const files = getAllFiles(".", [".ts", ".tsx"])
        .filter(f => !(f.includes("scripts/audit.ts") || f.includes("scripts/audit.ts")) && !f.includes(".test.") && !f.includes(".spec."));

    for (const file of files) {
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes("audit-ignore")) continue;

            // redirect с пользовательским вводом
            if (/redirect\s*\(/.test(line) && (line.includes("searchParams") || line.includes("query") || line.includes("req.url") || line.includes("callbackUrl"))) {
                const hasValidation = lines.slice(Math.max(0, i - 5), i + 5).join("\n");
                if (!hasValidation.includes("startsWith") && !hasValidation.includes("allowedUrls") && !hasValidation.includes("whitelist")) {
                    errors.push({
                        file,
                        line: i + 1,
                        severity: 'warning',
                        category: "Open Redirect",
                        message: "Redirect с пользовательским вводом" + ' - ' + "URL перенаправления формируется из пользовательского ввода без валидации",
                        suggestion: "Проверяй что URL начинается с '/' и не содержит двойных слэшев",
                        
                    });
                }
            }
        }
    }

    if (errors.length === 0) logSuccess("Open Redirect не обнаружен");
    else logWarning(`${errors.length} потенциальных Open Redirect`);

    return errors;
}

// ============================================
// 17. SENSITIVE DATA EXPOSURE
// ============================================

function auditDataExposure(): AuditError[] {
    logSubSection('17. Утечка чувствительных данных');
    const errors: AuditError[] = [];

    const files = getAllFiles(".", [".ts", ".tsx"])
        .filter(f => !(f.includes("scripts/audit.ts") || f.includes("scripts/audit.ts")) && !f.includes(".test.") && !f.includes(".spec."));

    for (const file of files) {
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Возврат хешированных паролей клиенту
            if (/select\s*\(/.test(line) && /password/i.test(line) && !file.includes("login") && !file.includes("auth")) {
                if (!line.includes("exclude") && !line.includes("omit") && !line.includes("// Safe")) {
                    errors.push({
                        file,
                        line: i + 1,
                        severity: 'error',
                        category: "Data Exposure",
                        message: "Поле password в SELECT запросе" + ' - ' + "Hash пароля может быть отправлен клиенту",
                        suggestion: "Исключи поле password из SELECT или используй columns: { password: false }",
                        
                    });
                }
            }
        }
    }

    if (errors.length === 0) logSuccess("Утечек данных не найдено");
    else logWarning(`${errors.length} потенциальных утечек`);

    return errors;
}

// ============================================
// 18. AUTH CONFIG (SESSION LIFESPAN, ALGORITHMS)
// ============================================

function auditAuthConfig(): AuditError[] {
    logSubSection('18. Настройки авторизации');
    const errors: AuditError[] = [];

    const authFile = "lib/auth.ts";
    if (fs.existsSync(authFile)) {
        const content = fs.readFileSync(authFile, "utf-8");

        // Rule 1: Session lifespan (max 7 days)
        const expMatch = content.match(/\.setExpirationTime\("([^"]+)"\)/);
        if (expMatch) {
            const time = expMatch[1];
            const isTooLong = /days|d|week/i.test(time) && (parseInt(time) > 7 || time.includes("8") || time.includes("9"));
            if (isTooLong || /month|y/i.test(time)) {
                errors.push({
                    file: authFile,
                    severity: 'error',
                    category: "Auth Config",
                    message: "Слишком большой срок жизни JWT" + ' - ' + `Срок жизни сессии установлен на "${time}". Правило 1 рекомендует максимум 7 дней.`,
                    suggestion: "Установи .setExpirationTime(\"7d\") или меньше.",
                });
            }
        }

        // Rule 2: Auth Provider (Check for homegrown auth)
        if (content.includes("SignJWT") && !content.includes("clerk") && !content.includes("supabase") && !content.includes("auth0")) {
            errors.push({
                file: authFile,
                severity: 'info',
                category: "Auth Config",
                message: "Используется кастомная JWT авторизация" + ' - ' + "Правило 2 рекомендует использовать готовые решения (Clerk, Supabase Auth, Auth0) вместо самописных.",
            });
        }
    }

    if (errors.length === 0) logSuccess("Настройки авторизации в норме");
    else logWarning(`${errors.length} замечаний к конфигурации авторизации`);

    return errors;
}

// ============================================
// 19. CONSOLE LOGS CLEANUP
// ============================================

function auditConsoleLogs(): AuditError[] {
    logSubSection('19. Очистка console.log');
    const errors: AuditError[] = [];

    const files = getAllFiles("app", [".ts", ".tsx"]).concat(getAllFiles("components", [".ts", ".tsx"]));
    let issues = 0;

    for (const file of files) {
        if (file.includes(".test.") || file.includes(".spec.")) continue;
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes("console.log(") && !line.includes("// audit-ignore")) {
                issues++;
                errors.push({
                    file,
                    line: i + 1,
                    severity: 'info',
                    category: "Logging",
                    message: "Обнаружен console.log" + ' - ' + "В production коде не должно быть console.log (Правило 11).",
                    suggestion: "Удали логи перед релизом или используй Winston/Pino.",
                });
            }
        }
    }

    if (issues === 0) logSuccess("console.log не обнаружены в приложении");
    else logInfo(`Найдено ${issues} вызовов console.log`);

    return errors;
}

// ============================================
// 20. WEBHOOK SECURITY
// ============================================

function auditWebhookSecurity(): AuditError[] {
    logSubSection('20. Проверка подписей Webhook');
    const errors: AuditError[] = [];

    const webhookFiles = getAllFiles("app/api/webhooks", [".ts"]);
    let unchecked = 0;

    for (const file of webhookFiles) {
        const content = fs.readFileSync(file, "utf-8");
        const hasSignatureCheck =
            content.includes("verifySignature") ||
            content.includes("stripe.webhooks.constructEvent") ||
            content.includes("svix") ||
            content.includes("crypto.createHmac") ||
            content.includes("verifyWebhookSignature");

        if (!hasSignatureCheck) {
            unchecked++;
            errors.push({
                file,
                severity: 'critical',
                category: "Webhooks",
                message: "Вебхук без проверки подписи" + ' - ' + "Эндпоинт вебхука не проверяет подпись запроса (Правило 21). Любой может отправить фейковые данные.",
                suggestion: "Реализуй проверку HMAC или используй SDK провайдера (Stripe, Svix).",
                
            });
        }
    }

    if (unchecked === 0) logSuccess("Все вебхуки имеют проверку подписи");
    else logError(`${unchecked} вебхуков без защиты`);

    return errors;
}

// ============================================
// 21. CORS & REDIRECT POLICIES
// ============================================

function auditPolicies(): AuditError[] {
    logSubSection('21. Политики CORS и Redirect');
    const errors: AuditError[] = [];

    const middlewareFile = "middleware.ts";
    if (fs.existsSync(middlewareFile)) {
        const content = fs.readFileSync(middlewareFile, "utf-8");
        if (content.includes("Access-Control-Allow-Origin") && /Access-Control-Allow-Origin['"],\s*['"]\*(['"])/.test(content)) {
            errors.push({
                file: middlewareFile,
                severity: 'error',
                category: "CORS",
                message: "CORS Wildcard (*)" + ' - ' + "Разрешен доступ с любых доменов. Правило 12 рекомендует разрешать только production-домен.",
                suggestion: "Замени '*' на конкретный URL (env.NEXT_PUBLIC_APP_URL).",
                
            });
        }
    }

    if (errors.length === 0) logSuccess("Политики CORS и Redirect соответствуют стандартам");
    else logWarning(`${errors.length} нарушений политик`);

    return errors;
}

// ============================================
// 22. CRITICAL ACTIONS LOGGING
// ============================================

function auditActionLogging(): AuditError[] {
    logSubSection('22. Логирование критических действий');
    const errors: AuditError[] = [];

    const actionFiles = getAllFiles("app", [".ts"]).filter(f => f.endsWith("actions.ts"));
    let issues = 0;

    const CRITICAL_KEYWORDS = ["delete", "remove", "updateRole", "refund", "export", "archive"];

    for (const file of actionFiles) {
        const content = fs.readFileSync(file, "utf-8");
        const funcRegex = /export\s+(async\s+)?function\s+(\w+)/g;
        let match;

        while ((match = funcRegex.exec(content)) !== null) {
            const funcName = match[2];
            if (CRITICAL_KEYWORDS.some(k => funcName.toLowerCase().includes(k.toLowerCase()))) {
                const funcStart = match.index;
                const nextFunc = content.indexOf("\nexport ", funcStart + 1);
                const funcBody = content.substring(funcStart, nextFunc > 0 ? nextFunc : content.length);

                const hasLogging =
                    funcBody.includes("auditLogs") ||
                    funcBody.includes("logAction") ||
                    funcBody.includes("createLog") ||
                    funcBody.includes("db.insert(logs)") ||
                    funcBody.includes("db.insert(auditLogs)") ||
                    funcBody.includes("logTaskHistory") ||
                    funcBody.includes("insert(taskHistory)") ||
                    funcBody.includes("recordActivity") ||
                    funcBody.includes("audit-ignore");

                if (!hasLogging) {
                    issues++;
                    errors.push({
                        file,
                        line: getLineNumber(content, funcStart),
                        severity: 'warning',
                        category: "Auditing",
                        message: `Критическое действие ${funcName} без логирования` + ' - ' + "Удаление, смена ролей или экспорт должны записываться в системный лог (Правило 26).",
                        suggestion: "Добавь запись в таблицу audit_logs.",
                        
                    });
                }
            }
        }
    }

    if (issues === 0) logSuccess("Критические действия логируются");
    else logInfo(`${issues} действий требуют внедрения логирования`);

    return errors;
}

// ============================================


// 11. ПРОИЗВОДИТЕЛЬНОСТЬ
// ============================================

function checkPerformance(files: string[]): AuditError[] {
    logSubSection('11. Производительность');

    const errors: AuditError[] = [];

    const performancePatterns = [
        { regex: /\.map\s*\([^)]+\)\s*\.map\s*\(/g, message: 'Цепочка .map()', suggestion: 'Объедини или используй useMemo' },
        { regex: /import\s+\*\s+as\s+\w+\s+from\s+["']lodash["']/g, message: 'Импорт всего lodash', suggestion: 'Импортируй отдельные функции' },
        { regex: /import\s+moment\s+from\s+["']moment["']/g, message: 'Moment.js слишком тяжёлый', suggestion: 'Используй date-fns' },
    ];

    for (const file of files) {
        if (file.includes('scripts/') || isTestFile(file)) continue;

        const content = fs.readFileSync(file, 'utf-8');

        for (const { regex, message, suggestion } of performancePatterns) {
            const matches = [...content.matchAll(new RegExp(regex))];

            for (const match of matches) {
                errors.push({
                    file,
                    line: getLineNumber(content, match.index || 0),
                    severity: 'info',
                    category: 'Производительность',
                    message,
                    suggestion,
                });
            }
        }

        // Custom check for useEffect without dependencies (to avoid false positives with nested braces)
        const useEffectRegex = /useEffect\s*\(/g;
        let useEffectMatch;
        while ((useEffectMatch = useEffectRegex.exec(content)) !== null) {
            let depth = 1;
            let pos = useEffectMatch.index + useEffectMatch[0].length;
            let hasComma = false;
            let isInString = false;
            let stringChar = '';

            // Simple scanner to find matching parenthesis and comma at depth 1
            while (pos < content.length && depth > 0) {
                const char = content[pos];
                if (!isInString) {
                    if (char === '"' || char === "'" || char === "`") {
                        isInString = true;
                        stringChar = char;
                    }
                } else if (char === stringChar) {
                    // Check for escaped char
                    if (content[pos - 1] !== '\\') {
                        isInString = false;
                    }
                }

                if (!isInString && char === '(') depth++;
                if (!isInString && char === ')') depth--;

                if (!isInString && depth === 1 && char === ',') {
                    hasComma = true;
                }
                pos++;
            }

            if (!hasComma && depth === 0) {
                errors.push({
                    file,
                    line: getLineNumber(content, useEffectMatch.index),
                    severity: 'info',
                    category: 'Производительность',
                    message: 'useEffect без зависимостей',
                    suggestion: 'Добавь []',
                });
            }
        }

        const fileSize = getFileSize(file);
        const isBase64Font = file.endsWith('-base64.ts');
        
        if (fileSize > 50 * 1024 && !isBase64Font) {
            errors.push({
                file,
                severity: 'warning',
                category: 'Производительность',
                message: `Файл большой: ${formatBytes(fileSize)}`,
                suggestion: 'Разбей на части',
            });
        }

        const lineCount = content.split('\n').length;
        if (lineCount > 500 && !file.includes('staff/cameras') && !isBase64Font) {
            errors.push({
                file,
                severity: 'info',
                category: 'Производительность',
                message: `Файл длинный: ${lineCount} строк`,
            });
        }
    }

    if (errors.length === 0) {
        logSuccess('Проблем не найдено');
    } else {
        logInfo(`Замечаний: ${errors.length}`);
    }

    return errors;
}

// ============================================
// 12. ДОСТУПНОСТЬ (a11y)
// ============================================

function checkAccessibility(files: string[]): AuditError[] {
    logSubSection('12. Доступность (a11y)');

    const errors: AuditError[] = [];

    const a11yPatterns = [
        { regex: /<img(?![^>]*\balt=)[^>]*>/gi, message: 'Изображение без alt' },
        { regex: /<Image\b(?![^>]*\balt=)[^>]*>/gi, message: 'Next Image без alt' },
        { regex: /<button(?![^>]*\btype=)[^>]*>/g, message: 'Кнопка без type' },
        { regex: /<a[^>]*href=["']#["'][^>]*>/gi, message: 'Ссылка с href="#"' },
        { regex: /<div(?![^>]*\brole=["']button["'])[^>]*onClick/gi, message: 'Кликабельный div', suggestion: 'Используй button или добавь role="button"' },
        { regex: /<span(?![^>]*\brole=["']button["'])[^>]*onClick/gi, message: 'Кликабельный span', suggestion: 'Используй button или добавь role="button"' },
    ];

    for (const file of files) {
        if (!file.endsWith('.tsx') || file.includes('scripts/audit.ts')) continue;

        const content = fs.readFileSync(file, 'utf-8');

        for (const { regex, message, suggestion } of a11yPatterns) {
            const matches = [...content.matchAll(new RegExp(regex))];

            for (const match of matches) {
                errors.push({
                    file,
                    line: getLineNumber(content, match.index || 0),
                    severity: 'info',
                    category: 'Доступность',
                    message,
                    suggestion,
                });
            }
        }
    }

    if (errors.length === 0) {
        logSuccess('Проблем не найдено');
    } else {
        logInfo(`Замечаний: ${errors.length}`);
    }

    return errors;
}

// ============================================
// 13. HOOKS
// ============================================

function checkHooks(files: string[]): AuditError[] {
    logSubSection('13. React Hooks');

    const errors: AuditError[] = [];

    for (const file of files) {
        if (file.includes('scripts/audit.ts')) continue;

        const content = fs.readFileSync(file, 'utf-8');

        const asyncEffectMatches = [...content.matchAll(/useEffect\s*\(\s*async\s*\(/g)];
        for (const match of asyncEffectMatches) {
            errors.push({
                file,
                line: getLineNumber(content, match.index || 0),
                severity: 'error',
                category: 'Hooks',
                message: 'async напрямую в useEffect',
                suggestion: 'Создай async функцию внутри',
            });
        }

        const conditionalMatches = [...content.matchAll(/if\s*\([^)]+\)\s*\{[^}]*\buse[A-Z]/g)];
        for (const match of conditionalMatches) {
            errors.push({
                file,
                line: getLineNumber(content, match.index || 0),
                severity: 'error',
                category: 'Hooks',
                message: 'Условный вызов хука',
                suggestion: 'Хуки вызывай безусловно',
            });
        }
    }

    if (errors.length === 0) {
        logSuccess('Проблем не найдено');
    } else {
        logWarning(`Проблем: ${errors.length}`);
    }

    return errors;
}

// ============================================
// 14. ИМПОРТЫ
// ============================================

function checkImports(files: string[]): AuditError[] {
    logSubSection('14. Импорты');

    const errors: AuditError[] = [];

    for (const file of files) {
        if (file.includes('scripts/audit.ts')) continue;

        const content = fs.readFileSync(file, 'utf-8');
        if (content.includes('audit-ignore')) continue;

        const relativeMatches = [...content.matchAll(/from\s+["']\.\.\/\.\.\/\.\.\/[^"']+["']/g)];
        for (const match of relativeMatches) {
            errors.push({
                file,
                line: getLineNumber(content, match.index || 0),
                severity: 'info',
                category: 'Импорты',
                message: 'Глубокий относительный импорт',
                suggestion: 'Используй @/',
            });
        }

        const importLines = content.match(/import\s+.+\s+from\s+["'][^"']+["']/g) || [];
        const importSources = importLines.map(line => {
            const match = line.match(/from\s+["']([^"']+)["']/);
            return match ? match[1] : '';
        });

        const duplicates = importSources.filter((item, index) => importSources.indexOf(item) !== index);
        if (duplicates.length > 0) {
            errors.push({
                file,
                severity: 'warning',
                category: 'Импорты',
                message: `Дубликаты: ${[...new Set(duplicates)].join(', ')}`,
            });
        }
    }

    if (errors.length === 0) {
        logSuccess('Импорты в порядке');
    } else {
        logInfo(`Замечаний: ${errors.length}`);
    }

    return errors;
}

// ============================================
// 15. ЛОКАЛИЗАЦИЯ
// ============================================

function checkLocalization(files: string[]): AuditError[] {
    logSubSection('15. Локализация');

    const errors: AuditError[] = [];

    for (const file of files) {
        if (file.includes('scripts/audit.ts')) continue;

        const content = fs.readFileSync(file, 'utf-8');

        // Only check files that import format from date-fns
        if (!content.includes('date-fns')) continue;
        if (!content.match(/import\s+.*\{[^}]*\bformat\b.*\}\s+from\s+['"]date-fns['"]/)) continue;

        let currentIndex = 0;
        while (true) {
            const match = content.indexOf('format(', currentIndex);
            if (match === -1) break;

            // Ensure word boundary
            if (match > 0 && /[a-zA-Z0-9_]/.test(content[match - 1])) {
                currentIndex = match + 1;
                continue;
            }

            // Get balanced parentheses
            let depth = 0;
            let i = match + 6; // index of '('
            let end = -1;
            for (; i < content.length; i++) {
                if (content[i] === '(') depth++;
                else if (content[i] === ')') {
                    depth--;
                    if (depth === 0) {
                        end = i;
                        break;
                    }
                }
            }

            if (end !== -1) {
                const formatCall = content.substring(match, end + 1);
                if (!formatCall.includes('locale')) {
                    errors.push({
                        file,
                        line: getLineNumber(content, match),
                        severity: 'info',
                        category: 'Локализация',
                        message: 'format() без locale',
                        suggestion: 'Добавь { locale: ru }',
                    });
                }
            }
            currentIndex = match + 7;
        }
    }

    if (errors.length === 0) {
        logSuccess('Локализация в порядке');
    } else {
        logInfo(`Замечаний: ${errors.length}`);
    }


    return errors;
}

// ============================================
// 16. ЗАВИСИМОСТИ
// ============================================

function checkDependencies(): AuditError[] {
    logSubSection('16. Зависимости');

    const errors: AuditError[] = [];

    if (!fs.existsSync('package.json')) {
        logWarning('package.json не найден');
        return errors;
    }

    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    const problematic: Record<string, string> = {
        'moment': 'Используй date-fns',
        'jquery': 'Не нужен с React',
        'request': 'Используй fetch',
    };

    for (const [pkg, reason] of Object.entries(problematic)) {
        if (deps[pkg]) {
            errors.push({
                file: 'package.json',
                severity: 'warning',
                category: 'Зависимости',
                message: `Проблемный пакет: ${pkg}`,
                suggestion: reason,
            });
        }
    }

    const auditResult = execCommand('npm audit --json');
    try {
        const jsonMatch = auditResult.output.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found");
        const audit = JSON.parse(jsonMatch[0]);
        let highCount = 0;
        let criticalCount = 0;

        // Игнорируем известную уязвимость minimatch, которую нельзя обновить из-за ESLint 9 FlatCompat
        const ignoredVulns = [
            'minimatch', '@eslint/config-array', '@eslint/eslintrc',
            '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser',
            '@typescript-eslint/type-utils', '@typescript-eslint/typescript-estree',
            '@typescript-eslint/utils', 'eslint', 'eslint-config-next',
            'eslint-plugin-import', 'eslint-plugin-jsx-a11y', 'eslint-plugin-react'
        ];

        if (audit.vulnerabilities) {
            for (const [pkgName, vuln] of Object.entries(audit.vulnerabilities)) {
                if (ignoredVulns.includes(pkgName)) continue;

                const severity = (vuln as any).severity;
                if (severity === 'high') highCount++;
                if (severity === 'critical') criticalCount++;
            }
        } else {
            highCount = audit.metadata?.vulnerabilities?.high || 0;
            criticalCount = audit.metadata?.vulnerabilities?.critical || 0;
        }

        const total = highCount + criticalCount;

        if (total > 0) {
            errors.push({
                file: 'package.json',
                severity: 'error',
                category: 'Зависимости',
                message: `Уязвимости: ${criticalCount} крит., ${highCount} высоких`,
                suggestion: 'npm audit fix',
            });
        }
    } catch {
        // ignore
    }

    if (errors.length === 0) {
        logSuccess('Зависимости в порядке');
    } else {
        logWarning(`Проблем: ${errors.length}`);
    }

    return errors;
}

// ============================================
// 17. СТРУКТУРА ПРОЕКТА
// ============================================

function checkProjectStructure(): AuditError[] {
    logSubSection('17. Структура проекта');

    const errors: AuditError[] = [];

    const requiredDirs = [
        'app',
        'components',
        'components/ui',
        'lib',
        'lib/types',
    ];

    for (const dir of requiredDirs) {
        if (!fs.existsSync(dir)) {
            errors.push({
                file: dir,
                severity: 'warning',
                category: 'Структура',
                message: `Отсутствует: ${dir}`,
            });
        }
    }

    if (errors.length === 0) {
        logSuccess('Структура в порядке');
    } else {
        logInfo(`Замечаний: ${errors.length}`);
    }

    return errors;
}

// ============================================
// 18. ИМЕНОВАНИЕ
// ============================================

function checkNamingConventions(files: string[]): AuditError[] {
    logSubSection('18. Именование');

    const errors: AuditError[] = [];

    for (const file of files) {
        const fileName = path.basename(file);

        if (file.includes('/components/') && file.endsWith('.tsx')) {
            const isKebab = /^[a-z0-9]+(-[a-z0-9]+)*\.tsx$/.test(fileName);
            const isPascal = /^[A-Z][a-zA-Z0-9]+\.tsx$/.test(fileName);

            if (!isKebab && !isPascal && !fileName.startsWith('use')) {
                errors.push({
                    file,
                    severity: 'info',
                    category: 'Именование',
                    message: `Нестандартное имя: ${fileName}`,
                    suggestion: 'kebab-case или PascalCase',
                });
            }
        }

        if (file.includes('/hooks/') && file.endsWith('.ts')) {
            if (!fileName.startsWith('use')) {
                errors.push({
                    file,
                    severity: 'warning',
                    category: 'Именование',
                    message: `Хук без "use": ${fileName}`,
                });
            }
        }

        const content = fs.readFileSync(file, 'utf-8');
        const booleanMatches = [...content.matchAll(/(?:const|let)\s+(\w+)\s*(?::\s*boolean)?\s*=\s*(?:true|false|!\w)/g)];

        for (const match of booleanMatches) {
            const name = match[1];
            const validPrefixes = ['is', 'has', 'can', 'should', 'will', 'show', 'hide', 'enable', 'disable', 'loading', 'open', 'visible', 'active', 'selected', 'checked', 'disabled'];

            if (name.length > 3 && !validPrefixes.some(p => name.toLowerCase().startsWith(p))) {
                errors.push({
                    file,
                    line: getLineNumber(content, match.index || 0),
                    severity: 'info',
                    category: 'Именование',
                    message: `Boolean "${name}" лучше с is/has/can`,
                });
            }
        }
    }

    if (errors.length === 0) {
        logSuccess('Именование в порядке');
    } else {
        logInfo(`Замечаний: ${errors.length}`);
    }

    return errors;
}

// ============================================
// 19. ДУБЛИКАТЫ КОДА
// ============================================

function checkDuplicates(files: string[]): AuditError[] {
    logSubSection('19. Дубликаты кода');

    const errors: AuditError[] = [];
    const codeBlocks: Map<string, { file: string; line: number }[]> = new Map();

    // Паттерны типичных мелких UI-элементов — не требуют рефакторинга
    const TRIVIAL_PATTERNS = [
        /^flex\s+items-center/,
        /^w-\d+\s+h-\d+/,
        /crm-t[dhr]/,
        /animate-spin/,
        /\bw-4\s+h-4\b/,
        /\bw-5\s+h-5\b/,
        /\bw-6\s+h-6\b/,
        /\btext-xs\s+font-(bold|medium)\b/,
        /\bfont-bold\s+text-slate/,
        /^text-slate-\d+$/,
    ];

    for (const file of files) {
        if (!file.endsWith('.tsx') || file.includes('scripts/audit.ts')) continue;

        const content = fs.readFileSync(file, 'utf-8');

        // Повышен порог длины с 60 до 100 символов — исключает мелкие однострочные классы
        const classNameMatches = [...content.matchAll(/className=["'`]([^"'`]{100,})["'`]/g)];

        for (const match of classNameMatches) {
            const className = match[1];

            // Пропускаем типовые UI-паттерны
            if (TRIVIAL_PATTERNS.some(p => p.test(className.trim()))) continue;

            // Нормализуем: сортируем классы для устойчивого сравнения
            const normalized = className.split(/\s+/).filter(Boolean).sort().join(' ');

            if (!codeBlocks.has(normalized)) {
                codeBlocks.set(normalized, []);
            }

            codeBlocks.get(normalized)!.push({
                file,
                line: getLineNumber(content, match.index || 0),
            });
        }
    }

    for (const [, occurrences] of codeBlocks) {
        // Повышен порог: минимум 4 вхождения в 3+ разных файлах
        if (occurrences.length >= 4) {
            const uniqueFiles = [...new Set(occurrences.map(o => o.file))];

            if (uniqueFiles.length >= 3) {
                errors.push({
                    file: occurrences[0].file,
                    line: occurrences[0].line,
                    severity: 'suggestion',
                    category: 'Дубликаты',
                    message: `Повторяется в ${occurrences.length} местах`,
                    suggestion: 'Вынеси в компонент или @apply',
                });
            }
        }
    }

    if (errors.length === 0) {
        logSuccess('Дубликатов не найдено');
    } else {
        logInfo(`Потенциальных: ${errors.length}`);
    }

    return errors;
}
function checkTodoComments(files: string[]): AuditError[] {
    logSubSection('20. TODO/FIXME комментарии');

    const errors: AuditError[] = [];

    const patterns = [
        { regex: /\/\/\s*TODO[:\s]*(.*)/gi, type: 'TODO', severity: 'info' as const },
        { regex: /\/\/\s*FIXME[:\s]*(.*)/gi, type: 'FIXME', severity: 'warning' as const },
        { regex: /\/\/\s*HACK[:\s]*(.*)/gi, type: 'HACK', severity: 'warning' as const },
        { regex: /\/\/\s*BUG[:\s]*(.*)/gi, type: 'BUG', severity: 'error' as const },
        { regex: /\/\/\s*TEMP[:\s]*(.*)/gi, type: 'TEMP', severity: 'warning' as const },
    ];

    const stats: Record<string, number> = {};

    for (const file of files) {
        if (file.includes('scripts/audit.ts')) continue;

        const content = fs.readFileSync(file, 'utf-8');

        for (const { regex, type, severity } of patterns) {
            const matches = [...content.matchAll(new RegExp(regex))];

            for (const match of matches) {
                stats[type] = (stats[type] || 0) + 1;

                errors.push({
                    file,
                    line: getLineNumber(content, match.index || 0),
                    severity,
                    category: 'TODO/FIXME',
                    message: `${type}: ${match[1]?.trim().substring(0, 50) || '(без описания)'}`,
                });
            }
        }
    }

    if (errors.length === 0) {
        logSuccess('TODO/FIXME нет');
    } else {
        const summary = Object.entries(stats).map(([k, v]) => `${k}: ${v}`).join(', ');
        logInfo(summary);
    }

    return errors;
}

// ============================================
// 21. РАЗМЕР КОМПОНЕНТОВ
// ============================================

function checkComponentSize(files: string[]): AuditError[] {
    logSubSection('21. Размер компонентов');

    const errors: AuditError[] = [];

    for (const file of files) {
        if (!file.endsWith('.tsx') || file.includes('scripts/audit.ts')) continue;

        const content = fs.readFileSync(file, 'utf-8');

        const useStateCount = (content.match(/useState/g) || []).length;
        if (useStateCount > 7) {
            errors.push({
                file,
                severity: 'warning',
                category: 'Размер компонента',
                message: `Много useState: ${useStateCount}`,
                suggestion: 'Используй useReducer или кастомный хук',
            });
        }

        const useEffectCount = (content.match(/useEffect/g) || []).length;
        if (useEffectCount > 5) {
            errors.push({
                file,
                severity: 'warning',
                category: 'Размер компонента',
                message: `Много useEffect: ${useEffectCount}`,
                suggestion: 'Вынеси логику в хуки',
            });
        }

        const propsMatch = content.match(/(?:interface|type)\s+\w*Props\s*(?:=\s*)?{([^}]+)}/);
        if (propsMatch) {
            const propsCount = (propsMatch[1].match(/\w+\??:/g) || []).length;
            if (propsCount > 15) {
                errors.push({
                    file,
                    severity: 'warning',
                    category: 'Размер компонента',
                    message: `Много пропсов: ${propsCount}`,
                    suggestion: 'Сгруппируй или разбей компонент',
                });
            }
        }
    }

    if (errors.length === 0) {
        logSuccess('Размеры в норме');
    } else {
        logWarning(`Проблем: ${errors.length}`);
    }

    return errors;
}

// ============================================
// 22. API ROUTES
// ============================================

function checkApiRoutes(): AuditError[] {
    logSubSection('22. API Routes');

    const errors: AuditError[] = [];
    const apiDir = CONFIG.apiDir;

    if (!fs.existsSync(apiDir)) {
        logInfo('API директория не найдена');
        return errors;
    }

    const routeFiles = getAllFiles(apiDir).filter(f => f.endsWith('route.ts'));
    log(`    Найдено роутов: ${routeFiles.length}`);

    for (const file of routeFiles) {
        if (file.includes('scripts/audit.ts')) continue;

        const content = fs.readFileSync(file, 'utf-8');

        const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
        const exported = methods.filter(m => content.includes(`export async function ${m}`) || content.includes(`export function ${m}`));

        if (exported.length === 0) {
            errors.push({
                file,
                severity: 'error',
                category: 'API Routes',
                message: 'Нет HTTP методов',
            });
        }

        if (!content.includes('try {')) {
            errors.push({
                file,
                severity: 'warning',
                category: 'API Routes',
                message: 'Нет обработки ошибок',
            });
        }

        if (!content.includes('NextResponse') && !content.includes('Response')) {
            errors.push({
                file,
                severity: 'warning',
                category: 'API Routes',
                message: 'Нет явного Response',
            });
        }

        const authPatterns = [
            'getServerSession',
            'getSession',
            'auth(',
            'token',
            'Authorization',
            "searchParams.get('key')",
            'searchParams.get("key")',
            "searchParams.get('secret')",
            'searchParams.get("secret")',
            'BetterAuth',
            'auth.handler',
            'getCurrentUser'
        ];
        const hasAuth = authPatterns.some(p => content.includes(p));
        const isPublic = file.includes('/public/') || file.includes('/webhook');

        if (!hasAuth && !isPublic && !content.includes('// audit-ignore')) {
            errors.push({
                file,
                severity: 'info',
                category: 'API Routes',
                message: 'Нет проверки авторизации',
            });
        }
    }

    if (errors.length === 0) {
        logSuccess('API роуты в порядке');
    }

    return errors;
}

// ============================================
// 23. ФОРМЫ
// ============================================

function checkForms(files: string[]): AuditError[] {
    logSubSection('23. Формы');

    const errors: AuditError[] = [];
    let formsCount = 0;

    for (const file of files) {
        if (!file.endsWith('.tsx') || file.includes('scripts/audit.ts')) continue;

        const content = fs.readFileSync(file, 'utf-8');

        if (!content.includes('<form') && !content.includes('<Form ') && !content.includes('<Form\n')) continue;
        formsCount++;

        // Проверка обработчика формы: onSubmit или action= (Server Actions)
        const hasHandler = content.includes('onSubmit') || /\<form[^>]*action\s*[={]/i.test(content);
        if (!hasHandler) {
            errors.push({
                file,
                severity: 'warning',
                category: 'Формы',
                message: 'Форма без onSubmit / action',
            });
        }

        // Проверка валидации: zod/yup, HTML required, или ручная валидация (if (!field, trim(), length)
        const hasValidation = content.includes('zod')
            || content.includes('yup')
            || content.includes('required')
            || /if\s*\(\s*!/.test(content)
            || content.includes('.trim()')
            || content.includes('fieldErrors');
        if (!hasValidation && !file.includes('staff/cameras')) {
            errors.push({
                file,
                severity: 'info',
                category: 'Формы',
                message: 'Форма без валидации',
            });
        }

        // Проверка loading state: различные паттерны именования
        const hasLoading = content.includes('loading')
            || content.includes('Loading')
            || content.includes('isSubmitting')
            || content.includes('pending')
            || content.includes('isSaving')
            || content.includes('SubmitButton')
            || content.includes('useFormStatus')
            || content.includes('disabled={');
        if (!hasLoading) {
            errors.push({
                file,
                severity: 'info',
                category: 'Формы',
                message: 'Форма без loading state',
            });
        }
    }

    log(`    Найдено форм: ${formsCount}`);

    if (errors.length === 0) {
        logSuccess('Формы в порядке');
    } else {
        logInfo(`Замечаний: ${errors.length}`);
    }

    return errors;
}

// ============================================
// 24. ИЗОБРАЖЕНИЯ И МЕДИА
// ============================================

function checkMedia(files: string[]): AuditError[] {
    logSubSection('24. Изображения и медиа');

    const errors: AuditError[] = [];

    for (const file of files) {
        if (!file.endsWith('.tsx') || file.includes('scripts/audit.ts')) continue;

        const content = fs.readFileSync(file, 'utf-8');

        const imgMatches = [...content.matchAll(/<img\s+[^>]*src=/gi)];
        for (const match of imgMatches) {
            if (!match[0].includes('.svg')) {
                errors.push({
                    file,
                    line: getLineNumber(content, match.index || 0),
                    severity: 'warning',
                    category: 'Медиа',
                    message: 'Используй next/image вместо <img>',
                });
            }
        }

        const heroMatches = [...content.matchAll(/<Image[^>]*(?:hero|banner|main)[^>]*>/gi)];
        for (const match of heroMatches) {
            if (!match[0].includes('priority')) {
                errors.push({
                    file,
                    line: getLineNumber(content, match.index || 0),
                    severity: 'info',
                    category: 'Медиа',
                    message: 'Hero изображение без priority',
                });
            }
        }
    }

    if (errors.length === 0) {
        logSuccess('Изображения в порядке');
    } else {
        logInfo(`Замечаний: ${errors.length}`);
    }

    return errors;
}

// ============================================
// 25. ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ
// ============================================

function checkEnvUsage(files: string[]): AuditError[] {
    logSubSection('25. Переменные окружения');

    const errors: AuditError[] = [];
    const usedEnvVars: Set<string> = new Set();

    for (const file of files) {
        if (file.includes('scripts/audit.ts')) continue;

        const content = fs.readFileSync(file, 'utf-8');

        const envMatches = [...content.matchAll(/process\.env\.(\w+)/g)];
        for (const match of envMatches) {
            usedEnvVars.add(match[1]);
        }

        if (file.includes('/api/') || file.includes('actions.ts')) {
            const publicMatches = [...content.matchAll(/process\.env\.(NEXT_PUBLIC_\w+)/g)];
            for (const match of publicMatches) {
                errors.push({
                    file,
                    line: getLineNumber(content, match.index || 0),
                    severity: 'info',
                    category: 'Env',
                    message: `NEXT_PUBLIC_ в серверном коде: ${match[1]}`,
                });
            }
        }

        if (content.includes('"use client"') || content.includes("'use client'")) {
            const serverMatches = [...content.matchAll(/process\.env\.(?!NEXT_PUBLIC_)(\w+)/g)];
            for (const match of serverMatches) {
                errors.push({
                    file,
                    line: getLineNumber(content, match.index || 0),
                    severity: 'error',
                    category: 'Env',
                    message: `Серверная env в клиенте: ${match[1]}`,
                });
            }
        }
    }

    log(`    Найдено env: ${usedEnvVars.size}`);

    if (errors.length === 0) {
        logSuccess('Env в порядке');
    } else {
        logWarning(`Проблем: ${errors.length}`);
    }

    return errors;
}

// ============================================
// 26. ТЕСТЫ
// ============================================

function checkTests(): AuditError[] {
    logSubSection('26. Тесты');

    const errors: AuditError[] = [];

    const testDirs = ['__tests__', 'tests', 'test', 'src/__tests__'];
    let testFiles: string[] = [];

    for (const dir of testDirs) {
        if (fs.existsSync(dir)) {
            testFiles.push(...getAllFiles(dir, ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx']));
        }
    }

    testFiles.push(...getAllFiles('.', ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx']));

    if (testFiles.length === 0) {
        errors.push({
            file: 'project',
            severity: 'info',
            category: 'Тесты',
            message: 'Тесты не найдены',
            suggestion: 'Рассмотри добавление тестов',
        });
    } else {
        log(`    Найдено тестов: ${testFiles.length}`);

        const criticalFiles = getAllFiles('.').filter(f =>
            f.includes('actions.ts') || f.includes('/hooks/')
        );

        for (const file of criticalFiles) {
            if (file.includes('scripts/audit.ts') || file.includes('staff/cameras') || file.includes('.test.') || file.includes('.spec.')) continue;

            const baseName = path.basename(file, path.extname(file));
            const hasTest = testFiles.some(t => t.includes(baseName + '.test') || t.includes(baseName + '.spec'));

            if (!hasTest && !file.includes('types') && !file.includes('index')) {
                errors.push({
                    file,
                    severity: 'info',
                    category: 'Тесты',
                    message: `Нет теста для ${baseName}`,
                });
            }
        }

        // Проверка на использование any в тестах
        for (const testFile of testFiles) {
            const content = fs.readFileSync(testFile, 'utf-8');
            const anyMatches = [...content.matchAll(/:\s*any\b|as\s+any\b/g)];

            for (const match of anyMatches) {
                const lineNum = getLineNumber(content, match.index || 0);
                const lineContent = content.split('\n')[lineNum - 1] || '';

                if (lineContent.includes('// audit-ignore') || 
                    lineContent.includes('// Safe') || 
                    lineContent.includes('eslint-disable')) continue;

                errors.push({
                    file: testFile,
                    line: lineNum,
                    severity: 'warning',
                    category: 'Тесты',
                    message: 'Использование "any" в тестах запрещено',
                    suggestion: 'Используй конкретные типы или unknown',
                });
            }
        }
    }

    const hasConfig = fs.existsSync('jest.config.js') || fs.existsSync('jest.config.ts') || fs.existsSync('vitest.config.ts');

    if (!hasConfig && testFiles.length > 0) {
        errors.push({
            file: 'project',
            severity: 'warning',
            category: 'Тесты',
            message: 'Нет конфигурации тестов',
        });
    }

    if (errors.filter(e => e.severity !== 'info').length === 0 && testFiles.length > 0) {
        logSuccess('Тесты в порядке');
    }

    return errors;
}

// ============================================
// 27. БАЗА ДАННЫХ
// ============================================

function checkDatabase(): { errors: AuditError[]; tablesCount: number; migrationsCount: number } {
    logSubSection('27. База данных');

    const errors: AuditError[] = [];
    let tablesCount = 0;
    let migrationsCount = 0;

    const hasDrizzle = fs.existsSync('drizzle.config.ts') || fs.existsSync('lib/db/schema.ts') || fs.existsSync('lib/schema.ts');
    const hasPrisma = fs.existsSync('prisma/schema.prisma');

    if (!hasDrizzle && !hasPrisma) {
        logInfo('ORM не обнаружен');
        return { errors, tablesCount, migrationsCount };
    }

    const orm = hasDrizzle ? 'Drizzle' : 'Prisma';
    log(`    ORM: ${orm}`);

    if (hasDrizzle) {
        let schemaPaths: string[] = [];
        if (fs.existsSync('drizzle/schema')) {
            schemaPaths = getAllFiles('drizzle/schema', ['.ts']);
        } else if (fs.existsSync('lib/schema') && fs.statSync('lib/schema').isDirectory()) {
            schemaPaths = getAllFiles('lib/schema', ['.ts']);
        } else {
            const standardFiles = ['lib/db/schema.ts', 'db/schema.ts', 'lib/schema.ts'];
            const existing = standardFiles.filter(f => fs.existsSync(f));
            if (existing.length > 0) {
                schemaPaths = existing;
            } else {
                const allFiles = getAllFiles('.', ['.ts']);
                const found = allFiles.find(f => f.includes('schema') && !f.includes('.test'));
                if (found) schemaPaths = [found];
            }
        }

        for (const schemaPath of schemaPaths) {
            const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

            const tables = schemaContent.match(/export\s+const\s+(\w+)\s*=\s*(?:pgTable|mysqlTable|sqliteTable)/g) || [];
            tablesCount += tables.length;
            log(`    Таблиц: ${tablesCount}`);

            // Find all pgTable definitions
            const tableDefinitions = [...schemaContent.matchAll(/export\s+const\s+(\w+)\s*=\s*(?:pgTable|mysqlTable|sqliteTable)\s*\(\s*["'](\w+)["']\s*,/g)];

            for (const match of tableDefinitions) {
                const varName = match[1];
                const tableName = match[2];
                const startIndex = match.index! + match[0].length;

                // Helper to get balanced content
                const getBalanced = (str: string, start: number): { content: string; end: number } => {
                    let depth = 0;
                    let i = start;
                    while (i < str.length && (str[i] !== "{" && str[i] !== "(" && str[i] !== "[")) i++;
                    if (i >= str.length) return { content: "", end: i };

                    const open = str[i];
                    const close = open === "{" ? "}" : (open === "(" ? ")" : "]");
                    const startToken = i;

                    for (; i < str.length; i++) {
                        if (str[i] === open) depth++;
                        else if (str[i] === close) {
                            depth--;
                            if (depth === 0) return { content: str.substring(startToken, i + 1), end: i + 1 };
                        }
                    }
                    return { content: "", end: i };
                };

                const { content: tableBody, end: bodyEnd } = getBalanced(schemaContent, startIndex);

                // Check for index builder (3rd argument)
                let indexBody = "";
                const remaining = schemaContent.substring(bodyEnd).trim();
                if (remaining.startsWith(",")) {
                    const arrowStart = schemaContent.indexOf("=>", bodyEnd);
                    if (arrowStart !== -1) {
                        // The index block starts after =>
                        const { content: indexContent } = getBalanced(schemaContent, arrowStart + 2);
                        indexBody = indexContent;
                        // log(`DEBUG: Table ${tableName} IndexBody: ${indexBody.substring(0, 50)}...`);
                    }
                }

                const searchableFields = ['email', 'phone', 'status', 'createdAt', 'userId', 'clientId', 'orderId'];

                for (const field of searchableFields) {
                    const hasField = new RegExp(`(?:^|\\s)${field}\\s*[:\\s]`).test(tableBody);
                    if (!hasField) continue;

                    // Support all Drizzle index syntaxes by checking for table.field or t.field in the index block
                    const tableFieldRegex = `table\\.${field}\\b`;
                    const hasManualIndex = indexBody.includes(`table.${field}`)
                        || indexBody.includes(`t.${field}`)
                        || new RegExp(`\\.${field}\\b`).test(indexBody);

                    const isPrimaryKey = tableBody.includes(`${field}.primaryKey()`) || tableBody.includes(`primaryKey({ columns: [table.${field}`);
                    const isUnique = tableBody.includes(`${field}.unique()`)
                        || indexBody.includes(`unique_${field}`)
                        || indexBody.includes(`unique("${tableName}_${field}_unique")`)
                        || (indexBody.includes(`unique(`) && hasManualIndex);

                    if (!isPrimaryKey && !isUnique && !hasManualIndex) {
                        errors.push({
                            file: schemaPath,
                            severity: 'info',
                            category: 'База данных',
                            message: `${tableName}.${field} — возможно нужен индекс`,
                            suggestion: 'Добавь индекс для часто используемых полей',
                        });
                    }
                }

                if (!tableBody.includes('createdAt') && !varName.toLowerCase().includes('relations')) {
                    errors.push({
                        file: schemaPath,
                        severity: 'info',
                        category: 'База данных',
                        message: `${tableName} без createdAt`,
                    });
                }
            }

            const hasRelations = schemaContent.includes('relations(');
            const isServiceFile = schemaPath.includes('enums.ts') || schemaPath.includes('index.ts');
            if (tables.length > 0 && !hasRelations && !isServiceFile) {
                errors.push({
                    file: schemaPath,
                    severity: 'info',
                    category: 'База данных',
                    message: 'Нет определённых relations',
                    suggestion: 'Добавь relations для типобезопасных джойнов',
                });
            }
        }

        const migrationsDir = 'drizzle';
        if (fs.existsSync(migrationsDir)) {
            const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
            migrationsCount = migrations.length;
            log(`    Миграций: ${migrationsCount}`);
        }

        if (fs.existsSync('drizzle.config.ts')) {
            const configContent = fs.readFileSync('drizzle.config.ts', 'utf-8');
            if (!configContent.includes('process.env')) {
                errors.push({
                    file: 'drizzle.config.ts',
                    severity: 'warning',
                    category: 'База данных',
                    message: 'DATABASE_URL не из env',
                });
            }
        }
    }

    if (errors.length === 0) {
        logSuccess('База данных в порядке');
    } else {
        const warns = errors.filter(e => e.severity === 'warning' || e.severity === 'error').length;
        if (warns > 0) logWarning(`Проблем: ${warns}`);
        else logInfo(`Замечаний: ${errors.length}`);
    }

    return { errors, tablesCount, migrationsCount };
}

// ============================================
// 28. СИНХРОНИЗАЦИЯ СХЕМЫ И ТИПОВ
// ============================================

function checkSchemaTypesSync(): AuditError[] {
    logSubSection('28. Синхронизация схемы и типов');

    const errors: AuditError[] = [];
    const typesDir = CONFIG.typesDir;

    if (!fs.existsSync(typesDir)) {
        logInfo('Директория типов не найдена');
        return errors;
    }

    const typeFiles = getAllFiles(typesDir, ['.ts']);
    const definedTypes: Map<string, Set<string>> = new Map();

    for (const file of typeFiles) {
        if (!fs.existsSync(file)) continue;
        const content = fs.readFileSync(file, 'utf-8');

        const interfaceRegex = /(?:interface|type)\s+(\w+)\s*(?:extends\s+(\w+)\s*)?(?:=\s*)?\{/g;
        let match;

        while ((match = interfaceRegex.exec(content)) !== null) {
            const typeName = match[1];
            const extendsType = match[2];
            const startIndex = match.index + match[0].length;

            let braceCount = 1;
            let currentIndex = startIndex;
            let body = '';

            while (braceCount > 0 && currentIndex < content.length) {
                const char = content[currentIndex];
                if (char === '{') braceCount++;
                if (char === '}') braceCount--;
                if (braceCount > 0) body += char;
                currentIndex++;
            }

            const fields = new Set<string>();

            // Add base fields if extends BaseEntity
            if (extendsType === 'BaseEntity') {
                fields.add('id');
                fields.add('createdAt');
                fields.add('updatedAt');
            }

            // Extract fields from body
            const fieldMatches = [...body.matchAll(/(\w+)\??:/g)];
            fieldMatches.forEach(m => fields.add(m[1]));

            definedTypes.set(typeName, fields);
        }
    }

    const schemaFiles = ['lib/db/schema.ts', 'db/schema.ts', 'lib/schema.ts'];
    const schemaPath = schemaFiles.find(f => fs.existsSync(f));

    if (schemaPath) {
        const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

        const tableMatches = [...schemaContent.matchAll(/export\s+const\s+(\w+)\s*=\s*(?:pgTable|mysqlTable|sqliteTable)\s*\(\s*["'](\w+)["']\s*,\s*\{/g)];

        const entityMapping: Record<string, string> = {
            'users': 'User',
            'orders': 'Order',
            'clients': 'Client',
            'products': 'Product',
            'payments': 'Payment',
            'notifications': 'Notification',
            'orderItems': 'OrderItem',
            'order_items': 'OrderItem',
        };

        for (const match of tableMatches) {
            const tableVar = match[1];
            const tableName = match[2];

            // Brace balancing to find the table body
            const startIndex = match.index + match[0].length;
            let braceCount = 1;
            let currentIndex = startIndex;
            let tableBody = '';

            while (braceCount > 0 && currentIndex < schemaContent.length) {
                const char = schemaContent[currentIndex];
                if (char === '{') braceCount++;
                if (char === '}') braceCount--;
                if (braceCount > 0) tableBody += char;
                currentIndex++;
            }

            const typeName = entityMapping[tableName] || entityMapping[tableVar];
            if (!typeName || !definedTypes.has(typeName)) continue;

            const typeFields = definedTypes.get(typeName)!;

            // Simplified column matching to catch all field names defined in the schema object
            const columnMatches = [...tableBody.matchAll(/^\s*(\w+):/gm)];
            const schemaColumns = new Set(columnMatches.map(m => m[1]));

            for (const column of schemaColumns) {
                const camelColumn = column.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

                if (!typeFields.has(column) && !typeFields.has(camelColumn)) {
                    errors.push({
                        file: schemaPath,
                        severity: 'warning',
                        category: 'Синхронизация',
                        message: `${tableName}.${column} нет в типе ${typeName}`,
                        suggestion: `Добавь ${camelColumn} в lib/types`,
                    });
                }
            }
        }
    }

    if (errors.length === 0) {
        logSuccess('Схема и типы синхронизированы');
    } else {
        logWarning(`Расхождений: ${errors.length}`);
    }

    return errors;
}

// ============================================
// 29. ПРОИЗВОДИТЕЛЬНОСТЬ ЗАПРОСОВ
// ============================================

function checkQueryPerformance(files: string[]): AuditError[] {
    logSubSection('29. Производительность запросов');

    const errors: AuditError[] = [];

    for (const file of files) {
        if (file.includes('scripts/audit.ts')) continue;

        const content = fs.readFileSync(file, 'utf-8');

        // N+1 проблема
        const loopQueryPatterns = [
            /for\s*\([^)]+\)\s*\{[^}]*(?:findUnique|findFirst|db\.query|db\.select)/g,
            /\.map\s*\(\s*async[^)]+\)\s*=>\s*(?:await)?\s*(?:prisma|db)\./g,
            /\.forEach\s*\(\s*async[^)]+\)\s*=>\s*(?:await)?\s*(?:prisma|db)\./g,
        ];

        for (const pattern of loopQueryPatterns) {
            const matches = [...content.matchAll(pattern)];
            for (const match of matches) {
                errors.push({
                    file,
                    line: getLineNumber(content, match.index || 0),
                    severity: 'warning',
                    category: 'Запросы',
                    message: 'Возможная N+1 проблема',
                    suggestion: 'Используй один запрос с include/with',
                });
            }
        }

        // SQL инъекция
        const rawSqlPatterns = [
            // SQL ключевые слова как отдельные SQL-операторы (не часть имён переменных)
            /(?<!sql)`[^`]*\$\{[^}]+\}[^`]*\b(?:SELECT\s|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM)\b/gi,
            // Ищем конкатенацию строк в execute
            /db\.execute\s*\(\s*["'][^"']+\s*\+\s*\w+/g,
        ];

        for (const pattern of rawSqlPatterns) {
            const matches = [...content.matchAll(pattern)];
            for (const match of matches) {
                errors.push({
                    file,
                    line: getLineNumber(content, match.index || 0),
                    severity: 'error',
                    category: 'Запросы',
                    message: 'Потенциальная SQL инъекция',
                    suggestion: 'Используй параметризованные запросы',
                });
            }
        }

        // Запросы без limit (Улучшенная версия)
        const findQueries = (startPattern: RegExp, stopAtSemicolon: boolean) => {
            const results: { content: string, index: number, fullMatch: string }[] = [];
            let match;
            const contentCopy = content;
            while ((match = startPattern.exec(contentCopy)) !== null) {
                let depth = 0;
                let i = match.index + match[0].indexOf('('); // Start counting from first '('

                // 1. Scan to end of initial function call arguments
                while (i < contentCopy.length) {
                    if (contentCopy[i] === '{' || contentCopy[i] === '(') depth++;
                    else if (contentCopy[i] === '}' || contentCopy[i] === ')') depth--;
                    i++;
                    if (depth === 0) break;
                }

                // 2. Continue scanning for chained methods until semicolon or end of chain
                if (stopAtSemicolon) {
                    while (i < contentCopy.length) {
                        const char = contentCopy[i];

                        // Track depth to properly handle multiline arguments in chained methods
                        if (char === '{' || char === '(') depth++;
                        else if (char === '}' || char === ')') depth--;

                        // Stop at semicolon if we are at top level (depth === 0)
                        if (char === ';' && depth === 0) break;

                        // Robust chain detection:
                        // Only check for chain break (newline not followed by dot) if at top level
                        if (char === '\n' && depth === 0) {
                            const remaining = contentCopy.slice(i + 1);
                            const trimmed = remaining.trim();
                            if (!trimmed.startsWith('.')) {
                                break; // Chain broken
                            }
                        }

                        i++;
                    }
                }

                const fullMatch = contentCopy.slice(match.index, i);
                results.push({
                    content: fullMatch,
                    index: match.index,
                    fullMatch
                });
            }
            return results;
        };

        const findManyMatches = findQueries(/findMany\s*\(\s*\{/g, false);
        const selectMatches = findQueries(/db\.select\s*\(/g, true);

        const allMatches = [
            ...findManyMatches.map(m => ({ ...m, type: 'findMany' })),
            ...selectMatches.map(m => ({ ...m, type: 'select' }))
        ];

        for (const match of allMatches) {
            const blockContent = match.content;

            // Skip if it has limit or take
            // Check for limit:, .limit(, or shorthand limit
            const hasLimit = blockContent.includes('limit:') ||
                blockContent.includes('.limit(') ||
                /\blimit\b/.test(blockContent);

            if (hasLimit) continue;

            // Skip point queries by ID
            if (blockContent.includes('where:') && (blockContent.includes('id:') || blockContent.includes('.id'))) continue;

            // Skip count queries
            if (blockContent.includes('count(')) continue;

            // Skip aggregate queries (SUM, AVG, MAX, MIN, COUNT, etc.)
            if (/\b(SUM|AVG|MAX|MIN|COUNT|GROUP_CONCAT)\s*\(/i.test(blockContent)) continue;
            if (blockContent.includes('sql<number>')) continue; // Drizzle aggregate queries

            // Skip queries with groupBy (they're typically aggregations)
            if (blockContent.includes('groupBy')) continue;

            // Skip backup routes (they intentionally dump entire database)
            if (file.includes('/backup/')) continue;

            // Improved script detection
            const isScript = file.includes('/scripts/') ||
                path.basename(file).endsWith('.ts') && !file.includes('app/') && !file.includes('components/') && !file.includes('lib/') ||
                file.includes('seed') ||
                file.includes('migrate') ||
                file.includes('check-') ||
                file.includes('cleanup-') ||
                file.includes('create-test') ||
                file.includes('restore-') ||
                file.includes('sync-') ||
                file.includes('test-') ||
                file.includes('update-');
            if (isScript) continue;

            errors.push({
                file,
                line: getLineNumber(content, match.index),
                severity: 'info',
                category: 'Запросы',
                message: `Запрос без limit (${match.type})`,
                suggestion: 'Добавь take/limit для больших таблиц',
            });
        }

        // Транзакции (проверка внутри функций)
        if (file.includes('actions')) {
            const functionBlocks = [...content.matchAll(/async\s+function\s+\w+\s*\([^)]*\)\s*\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g)];
            const arrowFunctions = [...content.matchAll(/const\s+\w+\s*=\s*async\s*\([^)]*\)\s*=>\s*\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g)];
            const allBlocks = [...functionBlocks, ...arrowFunctions];

            for (const blockMatch of allBlocks) {
                const block = blockMatch[0];
                const mutations = (block.match(/(?:\.create\(|\.update\(|\.delete\(|db\.insert|db\.update|db\.delete)/g) || []).length;

                if (mutations > 1 && !block.includes('transaction') && !block.includes('$transaction') && !block.includes('audit-ignore: transaction') && !file.includes('staff/cameras')) {
                    errors.push({
                        file,
                        line: getLineNumber(content, blockMatch.index),
                        severity: 'info',
                        category: 'Запросы',
                        message: 'Несколько мутаций в одной функции без транзакции',
                        suggestion: 'Оберни в transaction для атомарности или добавь // audit-ignore: transaction',
                    });
                }
            }
        }
    }

    if (errors.length === 0) {
        logSuccess('Запросы оптимизированы');
    } else {
        const warns = errors.filter(e => e.severity === 'warning' || e.severity === 'error').length;
        if (warns > 0) logWarning(`Проблем: ${warns}`);
        else logInfo(`Замечаний: ${errors.length}`);
    }

    return errors;
}

// ============================================
// 30. ПЛЮРАЛИЗАЦИЯ
// ============================================

function checkPluralization(files: string[]): AuditError[] {
    logSubSection('30. Плюрализация');

    const errors: AuditError[] = [];
    const pluralPatterns = [
        { regex: /\${[^}]+}\s+[а-яА-Я]{2,}\b/g, message: 'Возможно жестко задано склонение', suggestion: 'Используй pluralize() из @/lib/pluralize' },
        { regex: /[а-яА-Я]{2,}\s+\${[^}]+}/g, message: 'Возможно жестко задано склонение', suggestion: 'Используй pluralize() из @/lib/pluralize' },
        { regex: /count\s*%[^;]+===/g, message: 'Ручное склонение (модуль)', suggestion: 'Используй pluralize() из @/lib/pluralize' },
    ];

    for (const file of files) {
        if (!file.endsWith('.tsx') || file.includes('scripts/audit.ts') || file.includes('lib/pluralize.ts')) continue;

        const content = fs.readFileSync(file, 'utf-8');

        for (const { regex, message, suggestion } of pluralPatterns) {
            const matches = [...content.matchAll(new RegExp(regex))];

            for (const match of matches) {
                const matchText = match[0];

                // Исключаем случаи, где уже используется pluralize
                if (content.includes('pluralize') || content.includes('formatCount') || content.includes('formatPlural')) continue;

                // Исключаем разрешенные сокращения и слова
                // Исключаем разрешенные сокращения и слова
                const allowedWords = [
                    'шт', 'мин', 'сек', 'поз', 'ед', 'пак', 'упак', 'руб', 'гр', 'кг', 'см', 'мм', 'мл', 'л', 'макс', 'мин',
                    'всего', 'доступно', 'выбрано', 'найдено', 'загружено', 'удалено', 'создано', 'обновлено', 'готово', 'скрыто', 'показано', 'наличии',
                    'до', 'от', 'сумма', 'на', 'с', 'по', 'в', 'из', 'для', 'за', 'успешно', 'неудачно', 'ошибкой',
                    'без', 'размер', 'файлов', 'заказов', 'клиентов', 'товаров', 'к', 'миниатюра', '№', 'шаг', 'этап', 'просмотр',
                    'объем', 'вес', 'viewbox', 'width', 'height', 'изображению', 'шагу', 'заказу', 'фото', 'файл', 'оплачено', 'заказ', 'товара', 'товар'
                ];

                // Extract text before the variable substitution
                const textBeforeVar = matchText.substring(0, matchText.lastIndexOf('$')).trim();
                // Get the last word, handling punctuation
                const lastWord = textBeforeVar.split(/[\s\-:;.,!?]+/).pop()?.toLowerCase();

                const isAllowed = lastWord && allowedWords.includes(lastWord);

                if (isAllowed) continue;

                // Heuristic: check if variable name implies it's a string avoiding false positives
                const varMatch = matchText.match(/\${([^}]+)}/);
                if (varMatch) {
                    const varExpr = varMatch[1].toLowerCase();

                    const stringIndicators = ['name', 'title', 'text', 'sku', 'code', 'id', 'date', 'time', 'url', 'src', 'file', 'path', 'label', 'desc', 'msg', 'message', 'error', 'warn', 'icon', 'color', 'bg', 'class', 'style', 'type', 'status', 'email', 'phone', 'address', 'key', 'token', 'user', 'client', 'role', 'input', 'comment', 'note', 'align', 'format', 'lower', 'upper', 'join', 'string', 'html', 'json', 'link', 'symbol', 'active', 'enabled', 'visible', 'show', 'hide'];
                    const numberIndicators = ['count', 'length', 'size', 'qty', 'quantity', 'amount', 'total', 'sum', 'num', 'limit', 'threshold', 'min', 'max', 'val', 'price', 'cost', 'balance', 'diff', 'index', 'idx', 'weight', 'width', 'height', 'depth', 'capacity', 'volume', 'stock', 'year', 'month', 'day', 'hour', 'minute', 'second'];

                    const isLikelyString = stringIndicators.some(ind => varExpr.includes(ind));
                    const isLikelyNumber = numberIndicators.some(ind => varExpr.includes(ind));

                    // Check for property access suffixes that strongly indicate a string
                    // e.g. "item.label" -> string, even if "item" has no indicators or conflicting ones
                    const stringSuffixes = ['.name', '.title', '.text', '.label', '.desc', '.description', '.code', '.id', '.key', '.type', '.status', '.email', '.phone', '.url', '.src', '.path', '.user', '.date', '.time', '.message', '.msg', '.error'];
                    const endsWithStringSuffix = stringSuffixes.some(suffix => varExpr.trim().endsWith(suffix) || varExpr.trim().endsWith(suffix + ')')); // handle function calls at end

                    if (endsWithStringSuffix) continue;

                    // If it looks like a string and NOT like a number (e.g. "fileName" ok, "nameLength" -> number)
                    if (isLikelyString && !isLikelyNumber) continue;
                }

                errors.push({
                    file,
                    line: getLineNumber(content, match.index || 0),
                    severity: 'suggestion',
                    category: 'Плюрализация',
                    message,
                    suggestion,
                });
            }
        }
    }

    if (errors.length === 0) {
        logSuccess('Проблем не найдено');
    } else {
        logInfo(`Замечаний: ${errors.length}`);
    }

    return errors;
}

// ============================================
// 31. ОБРАБОТКА ИЗОБРАЖЕНИЙ
// ============================================

function checkImageProcessing(files: string[]): AuditError[] {
    logSubSection('31. Обработка изображений');

    const errors: AuditError[] = [];

    for (const file of files) {
        if (!file.includes('actions.ts') || file.includes('scripts/audit.ts')) continue;

        const content = fs.readFileSync(file, 'utf-8');

        if (content.includes('uploadFile') || content.includes('PutObjectCommand')) {
            const hasCompression =
                content.includes('compressImage') ||
                content.includes('{ compress: true }') ||
                content.includes('sharp(');

            if (!hasCompression) {
                errors.push({
                    file,
                    severity: 'warning',
                    category: 'Медиа',
                    message: 'Загрузка изображения без сжатия',
                    suggestion: 'Используй compressImage на клиенте или серверное сжатие через sharp/{ compress: true }',
                });
            }
        }
    }

    if (errors.length === 0) {
        logSuccess('Проблем не найдено');
    } else {
        logWarning(`Проблем: ${errors.length}`);
    }

    return errors;
}

// ============================================
// 32. КЕШИРОВАНИЕ (SERVER ACTIONS)
// ============================================

function checkCacheInvalidation(files: string[]): AuditError[] {
    logSubSection('32. Кеширование (Server Actions)');

    const errors: AuditError[] = [];

    for (const file of files) {
        if (!file.includes('actions.ts') || file.includes('scripts/audit.ts')) continue;

        const content = fs.readFileSync(file, 'utf-8');

        // Ищем функции (async function и стрелочные)
        const functionBlocks = [...content.matchAll(/async\s+function\s+\w+\s*\([^)]*\)\s*\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g)];
        const arrowFunctions = [...content.matchAll(/const\s+\w+\s*=\s*async\s*\([^)]*\)\s*=>\s*\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g)];
        const allBlocks = [...functionBlocks, ...arrowFunctions];

        for (const blockMatch of allBlocks) {
            const block = blockMatch[0];
            const hasMutation = /(?:\.create\(|\.update\(|\.delete\(|db\.insert|db\.update|db\.delete)/.test(block);
            
            if (hasMutation) {
                const hasRevalidation = block.includes('revalidatePath') || block.includes('revalidateTag');
                
                if (!hasRevalidation && !block.includes('// audit-ignore: cache') && !block.includes('revalidate:') && !file.includes('staff/cameras')) {
                    errors.push({
                        file,
                        line: getLineNumber(content, blockMatch.index),
                        severity: 'warning',
                        category: 'Кеширование',
                        message: 'Мутация БД без инвалидации кеша',
                        suggestion: 'Добавь revalidatePath/revalidateTag или // audit-ignore: cache',
                    });
                }
            }
        }
    }

    if (errors.length === 0) {
        logSuccess('Инвалидация кеша в порядке');
    } else {
        logWarning(`Проблем: ${errors.length}`);
    }

    return errors;
}

// ============================================
// 33. УТЕЧКИ СЕРВЕРНОГО КОДА ("USE CLIENT")
// ============================================

function checkServerLeaks(files: string[]): AuditError[] {
    logSubSection('33. Утечки серверного кода');

    const errors: AuditError[] = [];
    const serverPackages = ['server-only', 'fs', 'child_process', 'crypto', 'bcrypt', 'bcryptjs', 'drizzle-orm', 'pg', '@lib/db', '@/lib/db'];

    for (const file of files) {
        if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue;
        if (file.includes('scripts/audit.ts') || file.includes('scripts/audit.ts') || file.includes('drizzle.config.ts')) continue;

        const content = fs.readFileSync(file, 'utf-8');

        if (content.includes('"use client"') || content.includes("'use client'")) {
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                for (const pkg of serverPackages) {
                    if (line.includes(`from "${pkg}"`) || line.includes(`from '${pkg}'`) || line.includes(`require("${pkg}")`) || line.includes(`require('${pkg}')`)) {
                        // Игнорируем type-only импорты (import type { X } или import { type X })
                        if (line.includes('import type') || line.match(/import\s*\{\s*type\s+/)) {
                            continue;
                        }

                        errors.push({
                            file,
                            line: i + 1,
                            severity: 'critical',
                            category: 'Архитектура',
                            message: `Серверный модуль "${pkg}" в клиентском компоненте`,
                            suggestion: 'Удали импорт или используй import type',
                        });
                    }
                }
            }
        }
    }

    if (errors.length === 0) {
        logSuccess('Серверных утечек нет');
    } else {
        logError(`Утечек: ${errors.length}`);
    }

    return errors;
}

// ============================================
// РАСЧЁТ ЗДОРОВЬЯ ПРОЕКТА
// ============================================

function calculateHealth(stats: AuditStats, errors: AuditError[]): ProjectHealth {
    let score = 100;
    const recommendations: string[] = [];

    const criticalCount = errors.filter(e => e.severity === 'critical').length;
    score -= Math.min(criticalCount * 20, 60);
    if (criticalCount > 0) recommendations.push(`Исправь ${criticalCount} критических ошибок`);

    score -= Math.min(stats.typescriptErrors * 2, 20);
    if (stats.typescriptErrors > 0) recommendations.push(`Исправь ${stats.typescriptErrors} ошибок TypeScript`);

    score -= Math.min(stats.lintErrors, 10);
    if (stats.lintErrors > 5) recommendations.push('Исправь ошибки ESLint');

    const localTypes = stats.byCategory['Типизация'] || 0;
    score -= Math.min(localTypes * 0.5, 5);
    if (localTypes > 3) recommendations.push('Мигрируй локальные типы в lib/types');

    const uxViolations = stats.byCategory['UX Standards'] || 0;
    score -= Math.min(uxViolations * 0.5, 5);
    if (uxViolations > 5) recommendations.push('Исправь нарушения UX стандартов');

    const dbIssues = (stats.byCategory['База данных'] || 0) + (stats.byCategory['Запросы'] || 0);
    score -= Math.min(dbIssues * 0.3, 5);
    if (dbIssues > 5) recommendations.push('Оптимизируй работу с БД');

    const securityCritical = errors.filter(e => e.category === 'Безопасность' && e.severity === 'critical').length;
    if (securityCritical > 0) {
        score -= 30;
        recommendations.push(`СРОЧНО: ${securityCritical} проблем безопасности`);
    }

    const sqlInjections = errors.filter(e => e.message?.includes('SQL инъекция')).length;
    if (sqlInjections > 0) {
        score -= 20;
        recommendations.push(`СРОЧНО: ${sqlInjections} потенциальных SQL инъекций`);
    }

    score = Math.max(0, Math.round(score));

    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    let summary: string;

    if (score >= 90) { grade = 'A'; summary = 'Отличное состояние'; }
    else if (score >= 75) { grade = 'B'; summary = 'Хорошее состояние'; }
    else if (score >= 60) { grade = 'C'; summary = 'Удовлетворительно'; }
    else if (score >= 40) { grade = 'D'; summary = 'Требуется внимание'; }
    else { grade = 'F'; summary = 'Критическое состояние'; }

    return { score, grade, summary, recommendations };
}

// ============================================
// ГЕНЕРАЦИЯ ОТЧЁТА
// ============================================

function generateReport(result: AuditResult): string {
    const { errors, stats, health } = result;

    let report = `# 🔍 MerchCRM Audit Report\n\n`;
    report += `**Дата:** ${result.timestamp}\n`;
    report += `**Время:** ${result.duration}ms\n\n`;

    const gradeEmoji: Record<string, string> = { A: '🟢', B: '🟡', C: '🟠', D: '🔴', F: '⛔' };
    report += `## ${gradeEmoji[health.grade]} Здоровье: ${health.grade} (${health.score}/100)\n\n`;
    report += `**${health.summary}**\n\n`;

    if (health.recommendations.length > 0) {
        report += `### Рекомендации\n`;
        health.recommendations.forEach(r => report += `- ${r}\n`);
        report += '\n';
    }

    report += `## 📊 Статистика\n\n`;
    report += `| Метрика | Значение |\n|---------|----------|\n`;
    report += `| Файлов | ${stats.totalFiles} |\n`;
    report += `| Строк | ${stats.totalLines.toLocaleString()} |\n`;
    report += `| Размер | ${formatBytes(stats.totalSize)} |\n`;
    report += `| Страниц | ${stats.pagesCount} |\n`;
    report += `| Компонентов | ${stats.componentsCount} |\n`;
    report += `| API роутов | ${stats.apiRoutesCount} |\n`;
    report += `| Тестов | ${stats.testsCount} |\n`;
    report += `| Таблиц БД | ${stats.tablesCount} |\n`;
    report += `| Миграций | ${stats.migrationsCount} |\n\n`;

    report += `### По категориям\n\n`;
    report += `| Категория | Количество |\n|-----------|------------|\n`;
    for (const [category, count] of Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])) {
        report += `| ${category} | ${count} |\n`;
    }
    report += '\n';

    const critical = errors.filter(e => e.severity === 'critical');
    const errorLevel = errors.filter(e => e.severity === 'error');
    const warnings = errors.filter(e => e.severity === 'warning');
    const info = errors.filter(e => e.severity === 'info' || e.severity === 'suggestion');

    const formatTable = (items: AuditError[], limit = 10000) => {
        let table = `| Файл | Строка | Категория | Сообщение |\n|------|--------|-----------|----------|\n`;
        for (const e of items.slice(0, limit)) {
            const fullPath = path.resolve(e.file);
            const displayFile = e.file.replace(/^src\//, '');
            const fileLink = `[${displayFile}](file://${fullPath}${e.line ? `#L${e.line}` : ''})`;
            table += `| ${fileLink} | ${e.line || '-'} | ${e.category} | ${e.message} |\n`;
        }
        if (items.length > limit) table += `| ... | | | и ещё ${items.length - limit} |\n`;
        return table + '\n';
    };

    if (critical.length > 0) { report += `## 🔴 Критические (${critical.length})\n\n${formatTable(critical)}`; }
    if (errorLevel.length > 0) { report += `## 🟠 Ошибки (${errorLevel.length})\n\n${formatTable(errorLevel)}`; }
    if (warnings.length > 0) { report += `## 🟡 Предупреждения (${warnings.length})\n\n${formatTable(warnings)}`; }
    if (info.length > 0) { report += `## 🔵 Информация (${info.length})\n\n${formatTable(info)}`; }

    return report;
}

// ============================================
// ГЛАВНАЯ ФУНКЦИЯ
// ============================================

async function main() {
    const startTime = Date.now();

    log(colors.bold('\n🔍 MerchCRM Full Project Audit v5.0\n'));
    log(colors.gray('33 категории проверок (включая БД)\n'));

    const allErrors: AuditError[] = [];

    // Сбор файлов (исключаем тесты из всех проверок, кроме подсчета статистики, если не указан флаг)
    const rawFiles = getAllFiles(CONFIG.srcDir).filter(f => !f.includes('references'));
    const allFiles = rawFiles.filter(f => INCLUDE_TESTS ? true : !isTestFile(f));
    const tsxFiles = allFiles.filter(f => f.endsWith('.tsx'));
    const pageFiles = getAllFiles(CONFIG.pagesDir).filter(f => f.includes('page.') && !f.includes('references'));
    const componentFiles = getAllFiles(CONFIG.componentsDir).filter(f => !f.includes('references'));
    const hookFiles = getAllFiles(CONFIG.hooksDir || 'hooks').filter(f => !f.includes('references'));
    const actionFiles = allFiles.filter(f => f.includes('actions.ts'));
    const apiFiles = getAllFiles(CONFIG.apiDir || 'app/api').filter(f => f.endsWith('route.ts') && !f.includes('references'));
    const testFiles = getAllFiles('.', ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx']).filter(f => !f.includes('references'));

    let totalLines = 0;
    let totalSize = 0;
    for (const file of allFiles) {
        if (!fs.existsSync(file)) continue;
        const content = fs.readFileSync(file, 'utf-8');
        totalLines += content.split('\n').length;
        totalSize += getFileSize(file);
    }

    logSection('ПРОВЕРКИ (33)');

    // 1-29
    const tsResult = checkTypeScript();
    allErrors.push(...tsResult.errors);

    const lintResult = checkESLint();
    allErrors.push(...lintResult.errors);

    allErrors.push(...checkTypes(allFiles));
    allErrors.push(...checkUXStandards(tsxFiles));
    allErrors.push(...checkComponents(tsxFiles));
    allErrors.push(...checkNullSafety(allFiles));
    allErrors.push(...checkPages());
    allErrors.push(...checkServerActions());
    
    allErrors.push(...auditServerActionAuth());
    allErrors.push(...auditRBAC());
    allErrors.push(...auditApiRoutes());
    allErrors.push(...auditSqlInjection());
    allErrors.push(...auditXSS());
    allErrors.push(...auditSecrets());
    allErrors.push(...auditFileUploads());
    allErrors.push(...auditIDOR());
    allErrors.push(...auditCodeExecution());
    allErrors.push(...auditInputValidation());
    allErrors.push(...auditCSRF());
    allErrors.push(...auditRateLimiting());
    allErrors.push(...auditSecurityHeaders());
    allErrors.push(...auditPasswordHandling());
    allErrors.push(...auditMassAssignment());
    allErrors.push(...auditOpenRedirect());
    allErrors.push(...auditDataExposure());
    allErrors.push(...auditAuthConfig());
    allErrors.push(...auditConsoleLogs());
    allErrors.push(...auditWebhookSecurity());
    allErrors.push(...auditPolicies());
    allErrors.push(...auditActionLogging());

    allErrors.push(...checkPerformance(allFiles));
    allErrors.push(...checkAccessibility(tsxFiles));
    allErrors.push(...checkHooks(allFiles));
    allErrors.push(...checkImports(allFiles));
    allErrors.push(...checkLocalization(tsxFiles));
    allErrors.push(...checkDependencies());
    allErrors.push(...checkProjectStructure());
    allErrors.push(...checkNamingConventions(allFiles));
    allErrors.push(...checkDuplicates(tsxFiles));
    allErrors.push(...checkTodoComments(allFiles));
    allErrors.push(...checkComponentSize(tsxFiles));
    allErrors.push(...checkApiRoutes());
    allErrors.push(...checkForms(tsxFiles));
    allErrors.push(...checkMedia(tsxFiles));
    allErrors.push(...checkEnvUsage(allFiles));
    allErrors.push(...checkTests());

    const dbResult = checkDatabase();
    allErrors.push(...dbResult.errors);

    allErrors.push(...checkSchemaTypesSync());
    allErrors.push(...checkQueryPerformance(allFiles));
    allErrors.push(...checkPluralization(tsxFiles));
    allErrors.push(...checkImageProcessing(allFiles));
    allErrors.push(...checkCacheInvalidation(allFiles));
    allErrors.push(...checkServerLeaks(allFiles));

    // Фильтруем ошибки, исключая сам скрипт аудита и ui-kit
    const filteredErrors = allErrors.filter(e =>
        !e.file.includes('scripts/audit.ts') &&
        !e.file.includes('ui-kit')
    );

    // Статистика
    const byCategory: Record<string, number> = {};
    for (const error of filteredErrors) {
        byCategory[error.category] = (byCategory[error.category] || 0) + 1;
    }

    const stats: AuditStats = {
        totalFiles: allFiles.length,
        totalLines,
        totalSize,
        pagesCount: pageFiles.length,
        componentsCount: componentFiles.length,
        hooksCount: hookFiles.length,
        actionsCount: actionFiles.length,
        typesCount: getAllFiles(CONFIG.typesDir).length,
        apiRoutesCount: apiFiles.length,
        formsCount: tsxFiles.filter(f => {
            const c = fs.readFileSync(f, 'utf-8');
            return c.includes('<form') || c.includes('<Form');
        }).length,
        testsCount: testFiles.length,
        tablesCount: dbResult.tablesCount,
        migrationsCount: dbResult.migrationsCount,

        typescriptErrors: tsResult.count,
        lintErrors: lintResult.errorCount,
        lintWarnings: lintResult.warningCount,

        byCategory,
    };

    const health = calculateHealth(stats, filteredErrors);

    const result: AuditResult = {
        timestamp: new Date().toLocaleString('ru-RU'),
        duration: Date.now() - startTime,
        projectName: 'MerchCRM',
        errors: filteredErrors,
        stats,
        health,
    };

    const report = generateReport(result);
    fs.writeFileSync('audit-report.md', report);
    fs.writeFileSync('audit-report.json', JSON.stringify(result, null, 2));

    // Итоги
    logSection('ИТОГИ');

    const gradeColors: Record<string, (s: string) => string> = {
        A: colors.green, B: colors.green, C: colors.yellow, D: colors.red, F: colors.red,
    };

    log(`\n  ${colors.bold('Здоровье:')} ${gradeColors[health.grade](health.grade)} (${health.score}/100)`);
    log(`  ${colors.gray(health.summary)}\n`);

    log(`  📊 ${colors.bold('Статистика:')}`);
    log(`     Файлов: ${stats.totalFiles} | Строк: ${stats.totalLines.toLocaleString()} | Размер: ${formatBytes(stats.totalSize)}`);
    log(`     Страниц: ${stats.pagesCount} | Компонентов: ${stats.componentsCount} | API: ${stats.apiRoutesCount}`);
    log(`     Таблиц БД: ${stats.tablesCount} | Миграций: ${stats.migrationsCount} | Тестов: ${stats.testsCount}\n`);

    log(`  📋 ${colors.bold('Проблемы:')}`);
    log(`     ${colors.red(`Критических: ${filteredErrors.filter(e => e.severity === 'critical').length}`)}`);
    log(`     ${colors.yellow(`Ошибок: ${filteredErrors.filter(e => e.severity === 'error').length}`)}`);
    log(`     ${colors.blue(`Предупреждений: ${filteredErrors.filter(e => e.severity === 'warning').length}`)}`);
    log(`     ${colors.gray(`Информация: ${filteredErrors.filter(e => e.severity === 'info').length}`)}\n`);

    if (health.recommendations.length > 0) {
        log(`  💡 ${colors.bold('Рекомендации:')}`);
        health.recommendations.slice(0, 5).forEach(r => log(`     • ${r}`));
        log('');
    }

    log(`  📄 Отчёты: ${colors.cyan('audit-report.md')} | ${colors.cyan('audit-report.json')}\n`);

    const hasCritical = filteredErrors.some(e => e.severity === 'critical');
    process.exit(hasCritical ? 1 : 0);
}

main().catch(console.error);
