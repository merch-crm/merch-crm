#!/usr/bin/env npx tsx

/**
 * MerchCRM Security Audit Script v1.0
 *
 * Глубокий аудит безопасности, охватывающий каждую строку кода.
 * Проверяет: авторизацию, IDOR, XSS, SQL Injection, CSRF,
 * секреты, загрузки файлов, rate-limiting, RBAC и др.
 *
 * Использование:
 *   npx tsx scripts/security-audit.ts
 */

import * as fs from "fs";
import * as path from "path";

// ============================================
// ТИПЫ
// ============================================

interface Finding {
    file: string;
    line?: number;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
    category: string;
    title: string;
    detail: string;
    recommendation?: string;
    cwe?: string; // Common Weakness Enumeration
}

interface AuditSummary {
    totalFilesScanned: number;
    totalLinesScanned: number;
    findings: Finding[];
    categoryCounts: Record<string, number>;
    severityCounts: Record<string, number>;
    score: number;
    grade: string;
}

// ============================================
// УТИЛИТЫ
// ============================================

const C = {
    red: (s: string) => `\x1b[31m${s}\x1b[0m`,
    green: (s: string) => `\x1b[32m${s}\x1b[0m`,
    yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
    blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
    magenta: (s: string) => `\x1b[35m${s}\x1b[0m`,
    cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
    gray: (s: string) => `\x1b[90m${s}\x1b[0m`,
    bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
    bgRed: (s: string) => `\x1b[41m\x1b[37m${s}\x1b[0m`,
    bgYellow: (s: string) => `\x1b[43m\x1b[30m${s}\x1b[0m`,
};

function log(msg: string) { console.log(msg); }
function section(title: string) {
    log("\n" + C.bold(C.cyan(`═══════════════════════════════════════`)));
    log(C.bold(C.cyan(`  ${title}`)));
    log(C.bold(C.cyan(`═══════════════════════════════════════`)));
}
function check(title: string) { log("\n" + C.bold(C.blue(`  ▸ ${title}`))); }
function ok(msg: string) { log(C.green(`  ✓ ${msg}`)); }
function warn(msg: string) { log(C.yellow(`  ⚠ ${msg}`)); }
function fail(msg: string) { log(C.red(`  ✗ ${msg}`)); }
function info(msg: string) { log(C.gray(`    ${msg}`)); }

const SKIP_DIRS = ["node_modules", ".next", ".git", "dist", "build", "coverage", "ui-kit", "e2e"];

function getAllFiles(dir: string, exts = [".ts", ".tsx"]): string[] {
    const results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    for (const item of fs.readdirSync(dir)) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            if (!SKIP_DIRS.includes(item)) results.push(...getAllFiles(full, exts));
        } else if (exts.some(ext => item.endsWith(ext))) {
            results.push(full);
        }
    }
    return results;
}

function lineAt(content: string, idx: number): number {
    return content.substring(0, idx).split("\n").length;
}

function isSelfScript(f: string) {
    return f.includes("scripts/security-audit") || f.includes("scripts/audit.ts");
}

// ============================================
// 1. АВТОРИЗАЦИЯ SERVER ACTIONS
// ============================================

function auditServerActionAuth(): Finding[] {
    check("1. Авторизация Server Actions");
    const findings: Finding[] = [];

    const actionFiles = getAllFiles("app")
        .filter(f => f.endsWith("actions.ts") && !isSelfScript(f) && !f.includes(".test.") && !f.includes(".spec."));

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
    ]);

    for (const file of actionFiles) {
        const content = fs.readFileSync(file, "utf-8");
        const isBarrel = !content.includes("export async function") && !content.includes("export function");
        if (isBarrel) continue;

        const hasUseServer = content.includes('"use server"') || content.includes("'use server'");
        if (!hasUseServer) continue;

        // Найти все экспортируемые функции
        const funcRegex = /export\s+(async\s+)?function\s+(\w+)/g;
        let match;
        while ((match = funcRegex.exec(content)) !== null) {
            total++;
            const funcName = match[2];
            const funcStart = match.index;

            // Пропускаем функции из белого списка
            if (AUTH_WHITELIST.has(funcName)) continue;

            // Ищем тело функции — от начала до следующей экспортной функции или конца файла
            const nextFunc = content.indexOf("\nexport ", funcStart + 1);
            const funcBody = content.substring(funcStart, nextFunc > 0 ? nextFunc : content.length);

            const hasGetSession = funcBody.includes("getSession()") || funcBody.includes("getSession(") ||
                funcBody.includes("getAuthSession()") || funcBody.includes("getAuthSession(");
            const hasRequireAdmin = funcBody.includes("requireAdmin(");

            if (!hasGetSession && !hasRequireAdmin) {
                unprotected++;
                findings.push({
                    file,
                    line: lineAt(content, funcStart),
                    severity: "CRITICAL",
                    category: "Авторизация",
                    title: `Функция ${funcName}() без проверки авторизации`,
                    detail: `Server Action "${funcName}" не вызывает getSession() и не проверяет авторизацию. Любой пользователь может вызвать эту функцию напрямую.`,
                    recommendation: "Добавь const session = await getSession(); if (!session) return { success: false, error: 'Не авторизован' };",
                    cwe: "CWE-862",
                });
            }
        }
    }

    if (unprotected === 0) ok(`Все ${total} Server Action функций защищены`);
    else fail(`${unprotected} из ${total} функций без авторизации`);

    return findings;
}

// ============================================
// 2. РОЛЕВАЯ МОДЕЛЬ (RBAC)
// ============================================

function auditRBAC(): Finding[] {
    check("2. Ролевая модель (RBAC)");
    const findings: Finding[] = [];

    const SENSITIVE_PATTERNS = [
        { pattern: /delete|remove|destroy|drop/i, action: "удаление" },
        { pattern: /export|download|backup/i, action: "экспорт/бэкап" },
        { pattern: /update.*role|change.*role|assign.*role/i, action: "управление ролями" },
        { pattern: /create.*user|delete.*user|update.*user/i, action: "управление пользователями" },
        { pattern: /refund|payment|финанс/i, action: "финансовые операции" },
    ];

    const ALLOWED_ROLES = ["Администратор", "Руководство", "Отдел продаж"];

    const actionFiles = getAllFiles("app")
        .filter(f => f.endsWith("actions.ts") && !isSelfScript(f) && !f.includes(".test.") && !f.includes(".spec."));

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

            for (const { pattern, action } of SENSITIVE_PATTERNS) {
                if (pattern.test(funcName)) {
                    const hasRoleCheck =
                        funcBody.includes("roleName") ||
                        funcBody.includes("requireAdmin") ||
                        ALLOWED_ROLES.some(r => funcBody.includes(r));

                    if (!hasRoleCheck) {
                        issues++;
                        findings.push({
                            file,
                            line: lineAt(content, funcStart),
                            severity: "HIGH",
                            category: "RBAC",
                            title: `${funcName}() — ${action} без проверки роли`,
                            detail: `Функция выполняет "${action}", но не проверяет роль пользователя. Это может дать рядовым сотрудникам доступ к опасным операциям.`,
                            recommendation: `Добавь проверку: if (!["Администратор", "Руководство"].includes(session.roleName)) return { success: false, error: "Недостаточно прав" };`,
                            cwe: "CWE-285",
                        });
                    }
                }
            }
        }
    }

    if (issues === 0) ok("RBAC: все чувствительные функции проверяют роли");
    else warn(`${issues} чувствительных функций без проверки ролей`);

    return findings;
}

// ============================================
// 3. API ROUTES АВТОРИЗАЦИЯ
// ============================================

function auditApiRoutes(): Finding[] {
    check("3. API Routes авторизация");
    const findings: Finding[] = [];

    const routeFiles = getAllFiles("app/api", [".ts"])
        .filter(f => f.endsWith("route.ts") && !isSelfScript(f));

    let unprotected = 0;

    for (const file of routeFiles) {
        const content = fs.readFileSync(file, "utf-8");

        // Пропускаем login / health / callbacks
        if (file.includes("/auth/login") || file.includes("/health") || file.includes("/callback")) continue;

        const handlers = ["GET", "POST", "PUT", "PATCH", "DELETE"];
        for (const method of handlers) {
            const handlerRegex = new RegExp(`export\\s+async\\s+function\\s+${method}\\b`);
            const handlerMatch = handlerRegex.exec(content);
            if (!handlerMatch) continue;

            const hasAuth =
                content.includes("getSession") ||
                content.includes("requireAdmin") ||
                content.includes("Authorization") ||
                content.includes("CRON_SECRET") ||
                content.includes("Bearer") ||
                content.includes("API_KEY");

            if (!hasAuth) {
                unprotected++;
                findings.push({
                    file,
                    line: lineAt(content, handlerMatch.index),
                    severity: "CRITICAL",
                    category: "API Auth",
                    title: `${method} ${file.replace("app/api", "/api").replace("/route.ts", "")} — без авторизации`,
                    detail: `API эндпоинт не проверяет ни сессию, ни API ключ. Доступен публично.`,
                    recommendation: "Добавь проверку getSession() или Bearer токена",
                    cwe: "CWE-306",
                });
            }
        }
    }

    if (unprotected === 0) ok("Все API роуты защищены");
    else fail(`${unprotected} публичных API роутов`);

    return findings;
}

// ============================================
// 4. SQL INJECTION
// ============================================

function auditSqlInjection(): Finding[] {
    check("4. SQL Injection");
    const findings: Finding[] = [];

    const files = getAllFiles(".", [".ts", ".tsx"])
        .filter(f => !isSelfScript(f) && !f.includes(".test.") && !f.includes(".spec."));

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
                    findings.push({
                        file,
                        line: i + 1,
                        severity: "CRITICAL",
                        category: "SQL Injection",
                        title: "Потенциальная SQL Injection через db.execute()",
                        detail: `Строка содержит db.execute() с интерполяцией без sql tag. Это может привести к SQL injection.`,
                        recommendation: "Используй sql`...` tag из drizzle-orm для параметризации запросов",
                        cwe: "CWE-89",
                    });
                }
            }

            // Конкатенация строк в SQL
            if (/(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)\s/.test(line) && /\+\s*(req|params|body|query|input|search|filter|value)/.test(line)) {
                issues++;
                findings.push({
                    file,
                    line: i + 1,
                    severity: "CRITICAL",
                    category: "SQL Injection",
                    title: "Конкатенация пользовательского ввода в SQL запрос",
                    detail: `Обнаружена конкатенация переменных с SQL-ключевыми словами.`,
                    recommendation: "Используй параметризованные запросы через drizzle-orm",
                    cwe: "CWE-89",
                });
            }
        }
    }

    if (issues === 0) ok("SQL Injection уязвимостей не найдено");
    else fail(`${issues} потенциальных SQL Injection`);

    return findings;
}

// ============================================
// 5. XSS (Cross-Site Scripting)
// ============================================

function auditXSS(): Finding[] {
    check("5. XSS (Cross-Site Scripting)");
    const findings: Finding[] = [];

    const tsxFiles = getAllFiles(".", [".tsx"])
        .filter(f => !isSelfScript(f) && !f.includes(".test.") && !f.includes(".spec."));

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
                    findings.push({
                        file,
                        line: i + 1,
                        severity: "HIGH",
                        category: "XSS",
                        title: "dangerouslySetInnerHTML без санитизации",
                        detail: "Использование dangerouslySetInnerHTML без DOMPurify может привести к XSS.",
                        recommendation: "Используй DOMPurify.sanitize() перед вставкой HTML",
                        cwe: "CWE-79",
                    });
                }
            }

            // innerHTML в обработчиках
            if (/\.innerHTML\s*=/.test(line)) {
                issues++;
                findings.push({
                    file,
                    line: i + 1,
                    severity: "HIGH",
                    category: "XSS",
                    title: "Присвоение innerHTML",
                    detail: "Прямое присвоение innerHTML создает XSS уязвимость",
                    recommendation: "Используй textContent или React компоненты",
                    cwe: "CWE-79",
                });
            }

            // document.write
            if (/document\.write\s*\(/.test(line)) {
                if (!line.includes("printWindow")) {
                    issues++;
                    findings.push({
                        file,
                        line: i + 1,
                        severity: "HIGH",
                        category: "XSS",
                        title: "document.write()",
                        detail: "document.write() создает XSS уязвимость",
                        recommendation: "Используй DOM API или React",
                        cwe: "CWE-79",
                    });
                }
            }
        }
    }

    if (issues === 0) ok("XSS уязвимостей не найдено");
    else fail(`${issues} XSS уязвимостей`);

    return findings;
}

// ============================================
// 6. HARDCODED SECRETS
// ============================================

function auditSecrets(): Finding[] {
    check("6. Захардкоженные секреты и ключи");
    const findings: Finding[] = [];

    const files = getAllFiles(".", [".ts", ".tsx", ".js", ".json"])
        .filter(f => !isSelfScript(f) && !f.includes("node_modules") && !f.includes(".next")
            && !f.includes(".test.") && !f.includes(".spec.") && !f.includes("package.json") && !f.includes("package-lock") && !f.includes(".env"));

    const SECRET_PATTERNS: Array<{ regex: RegExp; name: string; exclude?: RegExp }> = [
        { regex: /password\s*[:=]\s*["'](?!Error|Failed|Не удалось|Ошибка|Пароль|password|confirm|new|old|current|hash)[^"']{4,}["']/gi, name: "Хардкод пароля", exclude: /placeholder|example|label|hint|message|error|type=/i },
        { regex: /api[_-]?key\s*[:=]\s*["'][A-Za-z0-9_\-]{10,}["']/gi, name: "API ключ в коде" },
        { regex: /secret\s*[:=]\s*["'][A-Za-z0-9_\-]{10,}["']/gi, name: "Секрет в коде", exclude: /process\.env|CRON_SECRET|env\./i },
        { regex: /token\s*[:=]\s*["'][A-Za-z0-9_\-]{20,}["']/gi, name: "Токен в коде", exclude: /csrf|session|cookie|jwt/i },
        { regex: /private[_-]?key\s*[:=]\s*["'][^"']+["']/gi, name: "Приватный ключ в коде" },
        { regex: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g, name: "PEM ключ в коде" },
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
                    findings.push({
                        file,
                        line: i + 1,
                        severity: "CRITICAL",
                        category: "Secrets",
                        title: name,
                        detail: `Обнаружен секрет в исходном коде: ${line.trim().substring(0, 80)}...`,
                        recommendation: "Перенеси значение в .env файл и используй process.env.VARIABLE_NAME",
                        cwe: "CWE-798",
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
            findings.push({
                file: ".gitignore",
                severity: "CRITICAL",
                category: "Secrets",
                title: ".env файл не исключен из Git",
                detail: ".env файл может быть отправлен в репозиторий с секретами",
                recommendation: "Добавь .env* в .gitignore",
                cwe: "CWE-312",
            });
        }
    }

    if (issues === 0) ok("Захардкоженных секретов не найдено");
    else fail(`${issues} захардкоженных секретов`);

    return findings;
}

// ============================================
// 7. FILE UPLOAD SECURITY
// ============================================

function auditFileUploads(): Finding[] {
    check("7. Безопасность загрузки файлов");
    const findings: Finding[] = [];

    const files = getAllFiles(".", [".ts", ".tsx"])
        .filter(f => !isSelfScript(f) && !f.includes(".test.") && !f.includes(".spec."));

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
                    findings.push({
                        file,
                        line: i + 1,
                        severity: "HIGH",
                        category: "File Upload",
                        title: "Загрузка файлов без валидации типа/размера",
                        detail: "Файл записывается на диск без проверки MIME-типа и размера",
                        recommendation: "Добавь проверку MIME-типа (image/jpeg, image/png) и максимального размера (10MB)",
                        cwe: "CWE-434",
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
                    findings.push({
                        file,
                        line: i + 1,
                        severity: "HIGH",
                        category: "Path Traversal",
                        title: "Пользовательский ввод в пути к файлу",
                        detail: "Потенциальная атака Path Traversal: пользовательский ввод используется в пути файла без санитизации",
                        recommendation: "Используй path.basename() для извлечения имени файла и проверяй на ../",
                        cwe: "CWE-22",
                    });
                }
            }
        }
    }

    if (issues === 0) ok("Загрузка файлов безопасна");
    else warn(`${issues} проблем с загрузкой файлов`);

    return findings;
}

// ============================================
// 8. IDOR (Insecure Direct Object Reference)
// ============================================

function auditIDOR(): Finding[] {
    check("8. IDOR (Insecure Direct Object Reference)");
    const findings: Finding[] = [];

    const actionFiles = getAllFiles("app", [".ts"])
        .filter(f => f.endsWith("actions.ts") && !isSelfScript(f) && !f.includes(".test.") && !f.includes(".spec."));

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
                funcBody.includes("roleName");

            if (isDangerousAction && takesId && !checksOwnership) {
                issues++;
                findings.push({
                    file,
                    line: lineAt(content, funcStart),
                    severity: "MEDIUM",
                    category: "IDOR",
                    title: `${funcName}() — нет проверки принадлежности объекта`,
                    detail: `Функция принимает ID и выполняет мутацию, но не проверяет, принадлежит ли объект текущему пользователю или его роли.`,
                    recommendation: "Добавь проверку: где объект.createdBy === session.id или session имеет нужную роль",
                    cwe: "CWE-639",
                });
            }
        }
    }

    if (issues === 0) ok("IDOR уязвимостей не найдено");
    else warn(`${issues} потенциальных IDOR`);

    return findings;
}

// ============================================
// 9. EVAL И ДИНАМИЧЕСКОЕ ВЫПОЛНЕНИЕ
// ============================================

function auditCodeExecution(): Finding[] {
    check("9. Динамическое выполнение кода");
    const findings: Finding[] = [];

    const files = getAllFiles(".", [".ts", ".tsx"])
        .filter(f => !isSelfScript(f) && !f.includes(".test.") && !f.includes(".spec."));

    let issues = 0;

    const DANGEROUS = [
        { regex: /\beval\s*\(/g, name: "eval()", severity: "CRITICAL" as const },
        { regex: /new\s+Function\s*\(/g, name: "new Function()", severity: "HIGH" as const },
        { regex: /setTimeout\s*\(\s*["'`]/g, name: "setTimeout с строкой", severity: "HIGH" as const },
        { regex: /setInterval\s*\(\s*["'`]/g, name: "setInterval с строкой", severity: "HIGH" as const },
        { regex: /child_process|execSync\s*\(|spawn\s*\(/g, name: "Системная команда", severity: "HIGH" as const },
        { regex: /exec\s*\(/g, name: "eval/exec", severity: "HIGH" as const },
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
                    // Исключение для Redis multi.exec()
                    if (name === "eval/exec" && line.includes("multi.exec()")) continue;
                    issues++;
                    findings.push({
                        file,
                        line: i + 1,
                        severity,
                        category: "Code Execution",
                        title: `Опасный вызов: ${name}`,
                        detail: `Использование ${name} позволяет выполнить произвольный код`,
                        recommendation: "Избегай динамического выполнения кода. Используй безопасные альтернативы",
                        cwe: "CWE-94",
                    });
                }
            }
        }
    }

    if (issues === 0) ok("Опасных вызовов не найдено");
    else fail(`${issues} опасных вызовов`);

    return findings;
}

// ============================================
// 10. INPUT VALIDATION (Zod)
// ============================================

function auditInputValidation(): Finding[] {
    check("10. Валидация входных данных (Zod)");
    const findings: Finding[] = [];

    const actionFiles = getAllFiles("app", [".ts"])
        .filter(f => f.endsWith("actions.ts") && !isSelfScript(f) && !f.includes(".test.") && !f.includes(".spec."));

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
                    findings.push({
                        file,
                        line: lineAt(content, funcStart),
                        severity: "MEDIUM",
                        category: "Input Validation",
                        title: `${funcName}() без Zod валидации`,
                        detail: `Server Action принимает параметры, но не использует Zod для их валидации.`,
                        recommendation: "Добавь Zod-схему для валидации входных данных",
                        cwe: "CWE-20",
                    });
                }
            }
        }
    }

    if (unvalidated === 0) ok(`Все ${total} Server Action функций валидируют ввод`);
    else warn(`${unvalidated} из ${total} функций без валидации входных данных`);

    return findings;
}

// ============================================
// 11. CSRF PROTECTION
// ============================================

function auditCSRF(): Finding[] {
    check("11. CSRF Protection");
    const findings: Finding[] = [];

    // Проверяем cookie настройки
    const authFile = "lib/auth.ts";
    if (fs.existsSync(authFile)) {
        const content = fs.readFileSync(authFile, "utf-8");

        if (!content.includes("httpOnly: true") && !content.includes("httpOnly:true")) {
            findings.push({
                file: authFile,
                severity: "HIGH",
                category: "CSRF",
                title: "Cookie без флага httpOnly",
                detail: "Session cookie должен иметь httpOnly: true для защиты от XSS",
                recommendation: "Добавь httpOnly: true в cookie options",
                cwe: "CWE-1004",
            });
        }

        if (!content.includes("sameSite")) {
            findings.push({
                file: authFile,
                severity: "HIGH",
                category: "CSRF",
                title: "Cookie без SameSite",
                detail: "Session cookie должна иметь SameSite для CSRF-защиты",
                recommendation: 'Добавь sameSite: "lax" или "strict" в cookie options',
                cwe: "CWE-352",
            });
        }

        if (!content.includes("secure")) {
            findings.push({
                file: authFile,
                severity: "MEDIUM",
                category: "CSRF",
                title: "Cookie без флага Secure",
                detail: "Session cookie должна быть Secure в production",
                recommendation: 'Добавь secure: process.env.NODE_ENV === "production"',
                cwe: "CWE-614",
            });
        }
    }

    if (findings.length === 0) ok("CSRF защита в порядке (httpOnly + SameSite + Secure)");
    else fail(`${findings.length} проблем с CSRF`);

    return findings;
}

// ============================================
// 12. RATE LIMITING
// ============================================

function auditRateLimiting(): Finding[] {
    check("12. Rate Limiting");
    const findings: Finding[] = [];

    // Проверяем login роут
    const loginRoute = "app/api/auth/login/route.ts";
    if (fs.existsSync(loginRoute)) {
        const content = fs.readFileSync(loginRoute, "utf-8");
        if (!content.includes("rateLimit") && !content.includes("rate-limit") && !content.includes("throttle") && !content.includes("attempts") && !content.includes("lockout") && !content.includes("MAX_ATTEMPTS")) {
            findings.push({
                file: loginRoute,
                severity: "HIGH",
                category: "Rate Limiting",
                title: "Login без rate limiting",
                detail: "Эндпоинт логина не имеет ограничения на количество попыток. Уязвим к brute-force атакам.",
                recommendation: "Добавь rate limiting: максимум 5 попыток за 15 минут с блокировкой IP",
                cwe: "CWE-307",
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
                findings.push({
                    file,
                    severity: "MEDIUM",
                    category: "Rate Limiting",
                    title: "Чувствительный POST эндпоинт без rate limiting",
                    detail: "POST эндпоинт работает с паролями или финансами без ограничения частоты запросов",
                    recommendation: "Добавь rate limiting middleware",
                    cwe: "CWE-770",
                });
            }
        }
    }

    if (findings.length === 0) ok("Rate limiting в порядке");
    else warn(`${findings.length} эндпоинтов без rate limiting`);

    return findings;
}

// ============================================
// 13. SECURITY HEADERS
// ============================================

function auditSecurityHeaders(): Finding[] {
    check("13. Security Headers");
    const findings: Finding[] = [];

    // Проверяем next.config
    const configFiles = ["next.config.ts", "next.config.js", "next.config.mjs"];
    let configFile: string | null = null;
    for (const f of configFiles) {
        if (fs.existsSync(f)) { configFile = f; break; }
    }

    if (configFile) {
        const content = fs.readFileSync(configFile, "utf-8");

        const requiredHeaders = [
            { header: "X-Frame-Options", severity: "MEDIUM" as const },
            { header: "X-Content-Type-Options", severity: "MEDIUM" as const },
            { header: "Strict-Transport-Security", severity: "MEDIUM" as const },
            { header: "Content-Security-Policy", severity: "LOW" as const },
        ];

        for (const { header, severity } of requiredHeaders) {
            if (!content.includes(header)) {
                findings.push({
                    file: configFile,
                    severity,
                    category: "Security Headers",
                    title: `Отсутствует заголовок: ${header}`,
                    detail: `Заголовок безопасности ${header} не настроен в Next.js конфигурации.`,
                    recommendation: `Добавь ${header} в headers() функцию в next.config`,
                    cwe: "CWE-693",
                });
            }
        }
    }

    // Проверяем middleware.ts
    if (fs.existsSync("middleware.ts")) {
        const content = fs.readFileSync("middleware.ts", "utf-8");
        if (!content.includes("X-Frame-Options") && !content.includes("headers")) {
            findings.push({
                file: "middleware.ts",
                severity: "INFO",
                category: "Security Headers",
                title: "Middleware без security headers",
                detail: "Middleware существует, но не устанавливает заголовки безопасности",
                recommendation: "Рассмотри добавление security headers в middleware",
            });
        }
    }

    if (findings.length === 0) ok("Security headers настроены");
    else info(`${findings.length} рекомендаций по security headers`);

    return findings;
}

// ============================================
// 14. PASSWORD HASHING
// ============================================

function auditPasswordHandling(): Finding[] {
    check("14. Обработка паролей");
    const findings: Finding[] = [];

    const files = getAllFiles(".", [".ts", ".tsx"])
        .filter(f => !isSelfScript(f) && !f.includes(".test.") && !f.includes(".spec.") && !f.includes("node_modules"));

    for (const file of files) {
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // MD5/SHA1 для паролей
            if (/md5|sha1/i.test(line) && /password/i.test(line)) {
                if (!file.includes("cameras.actions.ts")) {
                    findings.push({
                        file,
                        line: i + 1,
                        severity: "CRITICAL",
                        category: "Password",
                        title: "Слабый алгоритм хеширования паролей",
                        detail: "MD5/SHA1 не подходят для хеширования паролей",
                        recommendation: "Используй bcrypt или argon2",
                        cwe: "CWE-328",
                    });
                }
            }

            // Логирование паролей
            if (/console\.(log|info|warn|error|debug)/.test(line) && /password/i.test(line) && !line.includes("hashPassword")) {
                if (!file.includes("setup-e2e.ts")) {
                    findings.push({
                        file,
                        line: i + 1,
                        severity: "HIGH",
                        category: "Password",
                        title: "Возможное логирование пароля",
                        detail: "Пароль может быть записан в лог",
                        recommendation: "Никогда не логируй пароли",
                        cwe: "CWE-532",
                    });
                }
            }
        }
    }

    if (findings.length === 0) ok("Обработка паролей безопасна");
    else fail(`${findings.length} проблем с паролями`);

    return findings;
}

// ============================================
// 15. MASS ASSIGNMENT
// ============================================

function auditMassAssignment(): Finding[] {
    check("15. Mass Assignment");
    const findings: Finding[] = [];

    const files = getAllFiles("app", [".ts"])
        .filter(f => f.endsWith("actions.ts") && !isSelfScript(f) && !f.includes(".test.") && !f.includes(".spec."));

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
                findings.push({
                    file,
                    line: i + 1,
                    severity: "HIGH",
                    category: "Mass Assignment",
                    title: "Spread оператор в запросе к БД",
                    detail: "Пользовательский ввод напрямую распространяется в запрос к БД через spread. Злоумышленник может перезаписать поля, которые не должны быть доступны (role, isAdmin и т.д.).",
                    recommendation: "Явно перечисли разрешенные поля вместо ...data",
                    cwe: "CWE-915",
                });
            }
        }
    }

    if (issues === 0) ok("Mass Assignment уязвимостей не найдено");
    else warn(`${issues} потенциальных Mass Assignment`);

    return findings;
}

// ============================================
// 16. OPEN REDIRECT
// ============================================

function auditOpenRedirect(): Finding[] {
    check("16. Open Redirect");
    const findings: Finding[] = [];

    const files = getAllFiles(".", [".ts", ".tsx"])
        .filter(f => !isSelfScript(f) && !f.includes(".test.") && !f.includes(".spec."));

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
                    findings.push({
                        file,
                        line: i + 1,
                        severity: "MEDIUM",
                        category: "Open Redirect",
                        title: "Redirect с пользовательским вводом",
                        detail: "URL перенаправления формируется из пользовательского ввода без валидации",
                        recommendation: "Проверяй что URL начинается с '/' и не содержит двойных слэшев",
                        cwe: "CWE-601",
                    });
                }
            }
        }
    }

    if (findings.length === 0) ok("Open Redirect не обнаружен");
    else warn(`${findings.length} потенциальных Open Redirect`);

    return findings;
}

// ============================================
// 17. SENSITIVE DATA EXPOSURE
// ============================================

function auditDataExposure(): Finding[] {
    check("17. Утечка чувствительных данных");
    const findings: Finding[] = [];

    const files = getAllFiles(".", [".ts", ".tsx"])
        .filter(f => !isSelfScript(f) && !f.includes(".test.") && !f.includes(".spec."));

    for (const file of files) {
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Возврат хешированных паролей клиенту
            if (/select\s*\(/.test(line) && /password/i.test(line) && !file.includes("login") && !file.includes("auth")) {
                if (!line.includes("exclude") && !line.includes("omit") && !line.includes("// Safe")) {
                    findings.push({
                        file,
                        line: i + 1,
                        severity: "HIGH",
                        category: "Data Exposure",
                        title: "Поле password в SELECT запросе",
                        detail: "Hash пароля может быть отправлен клиенту",
                        recommendation: "Исключи поле password из SELECT или используй columns: { password: false }",
                        cwe: "CWE-200",
                    });
                }
            }
        }
    }

    if (findings.length === 0) ok("Утечек данных не найдено");
    else warn(`${findings.length} потенциальных утечек`);

    return findings;
}

// ============================================
// ГЕНЕРАЦИЯ ОТЧЁТА
// ============================================

function generateReport(summary: AuditSummary): string {
    let md = `# 🛡️ MerchCRM Security Audit Report\n\n`;
    md += `**Дата:** ${new Date().toLocaleString("ru-RU")}\n\n`;

    // Здоровье
    const emoji: Record<string, string> = { A: "🟢", B: "🟡", C: "🟠", D: "🔴", F: "⛔" };
    md += `## ${emoji[summary.grade]} Безопасность: ${summary.grade} (${summary.score}/100)\n\n`;

    // Статистика
    md += `## 📊 Статистика\n\n`;
    md += `| Метрика | Значение |\n|---------|----------|\n`;
    md += `| Просканировано файлов | ${summary.totalFilesScanned} |\n`;
    md += `| Просканировано строк | ${summary.totalLinesScanned.toLocaleString()} |\n`;
    md += `| Критических | ${summary.severityCounts["CRITICAL"] || 0} |\n`;
    md += `| Высоких | ${summary.severityCounts["HIGH"] || 0} |\n`;
    md += `| Средних | ${summary.severityCounts["MEDIUM"] || 0} |\n`;
    md += `| Низких | ${summary.severityCounts["LOW"] || 0} |\n`;
    md += `| Инфо | ${summary.severityCounts["INFO"] || 0} |\n\n`;

    // По категориям
    if (Object.keys(summary.categoryCounts).length > 0) {
        md += `### По категориям\n\n`;
        md += `| Категория | Количество |\n|-----------|------------|\n`;
        for (const [cat, count] of Object.entries(summary.categoryCounts).sort((a, b) => b[1] - a[1])) {
            md += `| ${cat} | ${count} |\n`;
        }
        md += "\n";
    }

    // Findings по severity
    const formatFindings = (items: Finding[]) => {
        let table = `| Файл | Строка | Категория | Проблема | CWE |\n|------|--------|-----------|---------|-----|\n`;
        for (const f of items) {
            const fullPath = path.resolve(f.file);
            const fileLink = `[${f.file}](file://${fullPath}${f.line ? `#L${f.line}` : ""})`;
            table += `| ${fileLink} | ${f.line || "-"} | ${f.category} | ${f.title} | ${f.cwe || "-"} |\n`;
        }
        return table + "\n";
    };

    const critical = summary.findings.filter(f => f.severity === "CRITICAL");
    const high = summary.findings.filter(f => f.severity === "HIGH");
    const medium = summary.findings.filter(f => f.severity === "MEDIUM");
    const low = summary.findings.filter(f => f.severity === "LOW");
    const infos = summary.findings.filter(f => f.severity === "INFO");

    if (critical.length > 0) md += `## 🔴 Критические (${critical.length})\n\n${formatFindings(critical)}`;
    if (high.length > 0) md += `## 🟠 Высокие (${high.length})\n\n${formatFindings(high)}`;
    if (medium.length > 0) md += `## 🟡 Средние (${medium.length})\n\n${formatFindings(medium)}`;
    if (low.length > 0) md += `## 🔵 Низкие (${low.length})\n\n${formatFindings(low)}`;
    if (infos.length > 0) md += `## ℹ️ Информация (${infos.length})\n\n${formatFindings(infos)}`;

    if (summary.findings.length === 0) {
        md += `## ✅ Уязвимостей не обнаружено\n\nВсе 17 проверок прошли успешно.\n`;
    }

    return md;
}

// ============================================
// MAIN
// ============================================

function main() {
    const startTime = Date.now();

    log(C.bold("\n🛡️  MerchCRM Security Audit v1.0\n"));
    log(C.gray("17 категорий проверок безопасности\n"));

    const allFiles = getAllFiles(".", [".ts", ".tsx"]).filter(f => !isSelfScript(f) && !f.includes(".test.") && !f.includes(".spec."));
    let totalLines = 0;
    for (const file of allFiles) {
        totalLines += fs.readFileSync(file, "utf-8").split("\n").length;
    }

    section(`ПРОВЕРКИ (17)`);

    const findings: Finding[] = [];
    findings.push(...auditServerActionAuth());
    findings.push(...auditRBAC());
    findings.push(...auditApiRoutes());
    findings.push(...auditSqlInjection());
    findings.push(...auditXSS());
    findings.push(...auditSecrets());
    findings.push(...auditFileUploads());
    findings.push(...auditIDOR());
    findings.push(...auditCodeExecution());
    findings.push(...auditInputValidation());
    findings.push(...auditCSRF());
    findings.push(...auditRateLimiting());
    findings.push(...auditSecurityHeaders());
    findings.push(...auditPasswordHandling());
    findings.push(...auditMassAssignment());
    findings.push(...auditOpenRedirect());
    findings.push(...auditDataExposure());

    // Подсчёт
    const categoryCounts: Record<string, number> = {};
    const severityCounts: Record<string, number> = {};

    for (const f of findings) {
        categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
        severityCounts[f.severity] = (severityCounts[f.severity] || 0) + 1;
    }

    // Оценка
    const critCount = severityCounts["CRITICAL"] || 0;
    const highCount = severityCounts["HIGH"] || 0;
    const medCount = severityCounts["MEDIUM"] || 0;
    const lowCount = severityCounts["LOW"] || 0;

    let score = 100 - (critCount * 25) - (highCount * 10) - (medCount * 3) - (lowCount * 1);
    score = Math.max(0, Math.min(100, score));

    let grade = "A";
    if (score < 50) grade = "F";
    else if (score < 60) grade = "D";
    else if (score < 75) grade = "C";
    else if (score < 90) grade = "B";

    const summary: AuditSummary = {
        totalFilesScanned: allFiles.length,
        totalLinesScanned: totalLines,
        findings,
        categoryCounts,
        severityCounts,
        score,
        grade,
    };

    // Отчёт
    const report = generateReport(summary);
    fs.writeFileSync("security-report.md", report);
    fs.writeFileSync("security-report.json", JSON.stringify(summary, null, 2));

    // Итоги
    section("ИТОГИ");

    const duration = Date.now() - startTime;
    const gradeColors: Record<string, (s: string) => string> = {
        A: C.green, B: C.green, C: C.yellow, D: C.red, F: C.red,
    };

    log(`\n  ${C.bold("Безопасность:")} ${gradeColors[grade](`${grade} (${score}/100)`)}`);
    log(`  ${C.gray(`Время: ${duration}ms`)}\n`);

    log(`  📊 ${C.bold("Сканирование:")}`);
    log(`     Файлов: ${allFiles.length} | Строк: ${totalLines.toLocaleString()}\n`);

    log(`  📋 ${C.bold("Проблемы:")}`);
    log(`     ${C.red(`Критических: ${critCount}`)}`);
    log(`     ${C.yellow(`Высоких: ${highCount}`)}`);
    log(`     ${C.blue(`Средних: ${medCount}`)}`);
    log(`     ${C.gray(`Низких: ${lowCount}`)}`);
    log(`     ${C.gray(`Информация: ${severityCounts["INFO"] || 0}`)}\n`);

    log(`  📄 Отчёты: ${C.cyan("security-report.md")} | ${C.cyan("security-report.json")}\n`);

    process.exit(critCount > 0 ? 1 : 0);
}

main();
