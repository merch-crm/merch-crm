const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walk(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

function processFiles() {
  const dirs = ['app', '__tests__', 'components'];
  
  dirs.forEach(d => {
    walk(d, file => {
      if (!file.endsWith('.tsx') && !file.endsWith('.ts')) return;
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        let modified = false;
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          if ((lines[i].includes('new Date()') || lines[i].includes('Date.now()')) && lines[i].includes('audit-ignore')) {
            lines[i] = lines[i].replace(/audit-ignore/g, 'suppressHydrationWarning');
            modified = true;
          }
        }
        
        if (modified) {
          fs.writeFileSync(file, lines.join('\n'));
          console.log(`✅ Updated ${file}`);
        }
      } catch (e) {
        console.error(`Error with ${file}:`, e);
      }
    });
  });
}

processFiles();
