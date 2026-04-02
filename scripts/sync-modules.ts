import fs from 'fs';
import path from 'path';

const VAULT_MODULES_PATH = 'vault/030-Модули';
const TEMPLATE_PATH = 'vault/070-Шаблоны/Tpl-Модуль.md';

const MAPPING: Record<string, string> = {
  '01-Заказы': 'orders',
  '02-Клиенты': 'clients',
  '03-Склад': 'warehouse',
  '04-Производство': 'production',
  '05-Дизайн': 'design',
  '06-Финансы': 'finance',
  '07-Админ-Панель': 'admin',
  '08-Пользователи': 'users',
  '09-Аналитика': 'analytics',
  '10-Система': 'core',
  '11-Авторизация': 'auth',
};

// Inverse mapping for code-to-vault lookup
const CODE_TO_VAULT: Record<string, string> = Object.fromEntries(
  Object.entries(MAPPING).map(([k, v]) => [v, k])
);

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function updateTechnicalImplementation(content: string, moduleCode: string) {
  const schemaDir = path.join('lib/schema', moduleCode);
  const appDir = path.join('app/(main)/dashboard', moduleCode);
  
  let schemaFiles: string[] = [];
  if (fs.existsSync(schemaDir)) {
    schemaFiles = fs.readdirSync(schemaDir).filter(f => f.endsWith('.ts')).map(f => `lib/schema/${moduleCode}/${f}`);
  } else if (fs.existsSync(`lib/schema/${moduleCode}.ts`)) {
    schemaFiles = [`lib/schema/${moduleCode}.ts`];
  }

  let appFiles: string[] = [appDir];

  const techSection = `## 🛠 Техническая реализация
- **Схема БД**: 
${schemaFiles.map(f => `  - \`${f}\``).join('\n')}
- **Логика**: \`app/(main)/dashboard/${moduleCode}/actions.ts\` (если имеется)
- **Интерфейс**: \`app/(main)/dashboard/${moduleCode}/\``;

  const regex = /## 🛠️? Техническая реализация[\s\S]*?(##|---|$)/i;
  
  if (regex.test(content)) {
    return content.replace(regex, `${techSection}\n\n$1`);
  } else {
    return content + `\n\n${techSection}`;
  }
}

function sync() {
  console.log('🚀 Starting Obsidian Documentation Sync...');
  
  const vaultModules = fs.readdirSync(VAULT_MODULES_PATH).filter(d => fs.statSync(path.join(VAULT_MODULES_PATH, d)).isDirectory());

  vaultModules.forEach(vaultDir => {
    const moduleCode = MAPPING[vaultDir];
    if (!moduleCode) return;

    const indexPath = path.join(VAULT_MODULES_PATH, vaultDir, `${vaultDir}.md`);
    if (fs.existsSync(indexPath)) {
      console.log(`📦 Syncing ${vaultDir}...`);
      let content = fs.readFileSync(indexPath, 'utf-8');
      
      content = updateTechnicalImplementation(content, moduleCode);
      
      // Update date
      content = content.replace(/обновлено: .*/, `обновлено: ${new Date().toISOString().replace('T', ' ').substring(0, 19)}`);
      content = content.replace(/\*\*Обновлено\*\*: .*/, `**Обновлено**: ${getTodayDate()}`);

      fs.writeFileSync(indexPath, content);
    }
  });

  // Check for new modules in app/
  const dashboardModules = fs.readdirSync('app/(main)/dashboard').filter(d => fs.statSync(path.join('app/(main)/dashboard', d)).isDirectory());
  
  dashboardModules.forEach(moduleCode => {
    const vaultDir = CODE_TO_VAULT[moduleCode];
    if (!vaultDir) return; // Skip if no mapping exists yet

    const moduleDirPath = path.join(VAULT_MODULES_PATH, vaultDir);
    if (!fs.existsSync(moduleDirPath)) {
      console.log(`✨ Creating new vault directory: ${vaultDir}`);
      fs.mkdirSync(moduleDirPath, { recursive: true });
    }

    const indexPath = path.join(moduleDirPath, `${vaultDir}.md`);
    if (!fs.existsSync(indexPath)) {
      console.log(`🆕 Creating new module documentation: ${indexPath}`);
      let template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
      
      let content = template
        .replace(/<% tp\.file\.title %>/g, vaultDir.split('-').slice(1).join('-'))
        .replace(/<% tp\.file\.creation_date\("YYYY-MM-DD"\) %>/g, getTodayDate())
        .replace(/<% tp\.date\.now\("YYYY-MM-DD HH:mm:ss"\) %>/g, new Date().toISOString().replace('T', ' ').substring(0, 19))
        .replace(/<% tp\.date\.now\("YYYY-MM-DD", 0\) %>/g, getTodayDate());
      
      content = updateTechnicalImplementation(content, moduleCode);
      fs.writeFileSync(indexPath, content);
    }
  });

  console.log('✅ Documentation Sync Complete.');
}

sync();
