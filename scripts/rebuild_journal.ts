import fs from 'fs';
import path from 'path';

const drizzleDir = './drizzle';
const metaDir = path.join(drizzleDir, 'meta');
if (!fs.existsSync(metaDir)) fs.mkdirSync(metaDir);

const sqlFiles = fs.readdirSync(drizzleDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

const entries = sqlFiles.map((file, idx) => {
  const tag = file.replace('.sql', '');
  return {
    idx,
    version: '7',
    when: Date.now(),
    tag,
    breakpoints: true
  };
});

const journal = {
  version: '7',
  dialect: 'postgresql',
  entries
};

fs.writeFileSync(path.join(metaDir, '_journal.json'), JSON.stringify(journal, null, 2));
console.log(`✅ Rebuilt journal with ${entries.length} entries.`);
