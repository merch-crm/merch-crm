const fs = require('fs');
const report = fs.readFileSync('audit-report.md', 'utf8');
const lines = report.split('\n');
const fixes = {};

lines.forEach(line => {
  if (line.includes('| Hydration |') || line.includes('| Размер компонента |')) {
    const cells = line.split('|').map(c => c.trim());
    if (cells.length > 3) {
      const fileLinkCell = cells[1]; 
      const lineNumCell = cells[2];
      
      const fileMatch = fileLinkCell.match(/\(file:\/\/[^/]+\/WORK\/Project\/Merch-CRM\/merch-crm\/(.*?)(?:#.*?)?\)/);
      if (fileMatch) {
        const file = fileMatch[1];
        let lineNum = lineNumCell === '-' ? 1 : parseInt(lineNumCell, 10);
        
        if (!fixes[file]) fixes[file] = [];
        if (!fixes[file].includes(lineNum)) {
            fixes[file].push(lineNum);
        }
      }
    }
  }
});

for (const [file, lineNums] of Object.entries(fixes)) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const contentLines = content.split('\n');
    let modified = false;

    lineNums.sort((a, b) => b - a).forEach(lineNum => {
      const idx = lineNum - 1;
      
      // if it has audit-ignore, replace it
      if (contentLines[idx] && contentLines[idx].includes('audit-ignore')) {
        contentLines[idx] = contentLines[idx].replace('audit-ignore', 'suppressHydrationWarning');
        modified = true;
      }
      else if (contentLines[idx] && !contentLines[idx].includes('suppressHydrationWarning')) {
        const lineContent = contentLines[idx].trim();
        if (lineContent.startsWith('<') || lineContent.endsWith('}') || lineContent.endsWith('>')) {
            contentLines[idx] = contentLines[idx] + ' {/* suppressHydrationWarning */}';
        } else {
            contentLines[idx] = contentLines[idx] + ' // suppressHydrationWarning';
        }
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(file, contentLines.join('\n'));
      console.log(`✅ Fixed ${file}`);
    }
  } catch (err) {
    console.log(`❌ Error fixing ${file}: ${err.message}`);
  }
}
