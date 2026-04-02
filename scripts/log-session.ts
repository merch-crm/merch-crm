import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const VAULT_SESSIONS_PATH = 'vault/050-Сессии';

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function ensureTodaySession() {
  const today = getTodayDate();
  const filePath = path.join(VAULT_SESSIONS_PATH, `${today}.md`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`[LogSession] Session for ${today} not found. Running handoff...`);
    execSync('npx tsx scripts/session-handoff.ts', { stdio: 'inherit' });
  }
  
  return filePath;
}

function logTask(message: string, isDone: boolean = true) {
  const filePath = ensureTodaySession();
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const marker = '## ✅ Что сделано';
  const checkbox = isDone ? '- [x]' : '- [ ]';
  const entry = `${checkbox} ${message}`;
  
  if (content.includes(marker)) {
    // Check if task already exists
    if (content.includes(message)) {
      console.log(`[LogSession] Task already logged: ${message}`);
      return;
    }
    
    // Add after the marker or the last list item
    const lines = content.split('\n');
    const markerIndex = lines.findIndex(l => l.startsWith(marker));
    
    // Find where the list ends
    let insertIndex = markerIndex + 1;
    while (insertIndex < lines.length && (lines[insertIndex].trim() === '' || lines[insertIndex].startsWith('- [') || lines[insertIndex].startsWith('  -'))) {
      insertIndex++;
    }
    
    // Remove initial empty checkbox if it's there
    if (lines[markerIndex + 1].trim() === '- [ ]') {
      lines.splice(markerIndex + 1, 1);
      insertIndex--;
    }
    
    lines.splice(insertIndex, 0, entry);
    content = lines.join('\n');
    
    fs.writeFileSync(filePath, content);
    console.log(`[LogSession] Logged: ${message}`);
  } else {
    console.error(`[LogSession] Could not find '## ✅ Что сделано' in ${filePath}`);
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: npx tsx scripts/log-session.ts "task description"');
  process.exit(1);
}

logTask(args[0]);
