const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../components')
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;

      // UX fixes
      content = content.replace(/\bgap-[4-9]\b|\bgap-1[0-9]\b|\bgap-20\b/g, 'gap-3');
      content = content.replace(/\bgap-(x|y)-([4-9]|1[0-9])\b/g, 'gap-$1-3');
      content = content.replace(/\buppercase\b/g, '');
      content = content.replace(/text-\[(9|10|11)px\]/g, 'text-xs');

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

dirs.forEach(d => {
  if (fs.existsSync(d)) {
    processDir(d);
  }
});

console.log('UX fixes applied!');
