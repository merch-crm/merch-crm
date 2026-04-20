const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Match classNames containing sm:w-auto
  const regex = /className=(?:\{cn\(["']|["'])([^"'\n]*sm:w-auto[^"'\n]*)(["']|\)\})/g;
  let match;
  let found = false;
  while ((match = regex.exec(content)) !== null) {
    const cls = match[1];
    if (cls.includes('h-10') || cls.includes('h-11')) {
      const hasTextXs = cls.includes('text-xs');
      const hasTextSm = cls.includes('text-sm');
      const hasTextBase = cls.includes('text-base');
      
      console.log(`\nFile: ${filePath}`);
      console.log(`Class: ${cls.replace(/\s+/g, ' ')}`);
      
      let textState = 'Missing text sizing (will use default text-base)';
      if (hasTextXs && hasTextSm) textState = 'text-xs sm:text-sm ✅';
      else if (hasTextSm) textState = 'text-sm only';
      else if (hasTextXs) textState = 'text-xs only';
      
      console.log(`Status: ${textState}`);
    }
  }
}

const files = execSync('grep -rl "sm:w-auto" app components').toString().split('\n').filter(Boolean);
files.forEach(scanFile);
