import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const VAULT_SESSIONS_PATH = 'vault/050-Сессии';
const TEMPLATE_PATH = 'vault/070-Шаблоны/Tpl-Сессия.md';

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function getLatestSessionFile() {
  const files = fs.readdirSync(VAULT_SESSIONS_PATH)
    .filter(f => f.endsWith('.md') && /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .sort()
    .reverse();
  return files.length > 0 ? files[0] : null;
}

function finalizeOldSession(filePath: string, nextDate: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Update status
  content = content.replace(/статус: в-работе/g, 'статус: завершено');
  
  // Find pending tasks in Next Steps
  const nextStepsMatch = content.match(/## 🔜 Следующие шаги([\s\S]*?)(##|---|$)/);
  const pendingTasks: string[] = [];
  
  if (nextStepsMatch) {
    const lines = nextStepsMatch[1].split('\n');
    const updatedLines = lines.map(line => {
      if (line.includes('[ ]')) {
        const taskText = line.replace(/\[ \]/, '').trim();
        pendingTasks.push(taskText);
        return line.replace(/\[ \]/, `[>]`) + ` (Перенесено в [[${nextDate}]])`;
      }
      return line;
    });
    content = content.replace(nextStepsMatch[1], updatedLines.join('\n'));
  }
  
  fs.writeFileSync(filePath, content);
  return pendingTasks;
}

function createNewSession(date: string, carriedTasks: string[]) {
  const filePath = path.join(VAULT_SESSIONS_PATH, `${date}.md`);
  if (fs.existsSync(filePath)) {
    console.log(`[Session] Session for ${date} already exists.`);
    return;
  }

  let template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const now = new Date();
  const timeStr = `${date} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Simple template replacement (since we don't have Templater's logic here)
  let content = template
    .replace(/<% tp\.date\.now\("YYYY-MM-DD HH:mm"\) %>/g, timeStr)
    .replace(/<% tp\.file\.creation_date\("YYYY-MM-DD"\) %>/g, date)
    .replace(/<% tp\.date\.now\("YYYY-MM-DD"\) %>/g, date)
    .replace(/<% tp\.date\.now\("YYYY-MM"\) %>/g, date.substring(0, 7));

  if (carriedTasks.length > 0) {
    const taskList = carriedTasks.map((t, i) => `${i + 1}. [ ] ${t}`).join('\n');
    content = content.replace(/## ✅ Что сделано\n- \[ \] \n/g, `## ✅ Что сделано\n- [ ] Перенос задач из предыдущей сессии\n`);
    content = content.replace(/## 🔜 Следующие шаги\n1\. \[ \] \n2\. \[ \] \n/g, `## 🔜 Следующие шаги (Перенесено)\n${taskList}\n`);
  }

  fs.writeFileSync(filePath, content);
  console.log(`[Session] Created new session document: ${filePath}`);
}

function run() {
  console.log('🔍 Checking session status...');
  const today = getTodayDate();
  const latestFile = getLatestSessionFile();

  if (!latestFile) {
    console.log('[Session] No sessions found. Creating today\'s session...');
    createNewSession(today, []);
    return;
  }

  const latestDate = latestFile.replace('.md', '');

  if (latestDate < today) {
    console.log(`[Session] Day changed: ${latestDate} -> ${today}`);
    const latestFilePath = path.join(VAULT_SESSIONS_PATH, latestFile);
    
    // Only finalize if it wasn't already closed
    const content = fs.readFileSync(latestFilePath, 'utf-8');
    if (content.includes('статус: в-работе')) {
      console.log(`[Session] Finalizing previous session: ${latestFile}`);
      const carriedTasks = finalizeOldSession(latestFilePath, today);
      createNewSession(today, carriedTasks);
    } else {
      console.log(`[Session] Previous session was already closed. Creating new session...`);
      createNewSession(today, []);
    }
  } else {
    console.log(`[Session] Session for ${today} is up to date.`);
  }
}

run();
