const fs = require('fs');
const path = require('path');

function getFiles(dir, matchFiles) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== '.next') {
            files.push(...getFiles(fullPath, matchFiles));
        } else if (entry.isFile() && matchFiles.test(entry.name)) {
            files.push(fullPath);
        }
    }
    return files;
}

const allFiles = [...getFiles(path.join(process.cwd(), 'app'), /\.(tsx|ts)$/), ...getFiles(path.join(process.cwd(), 'components'), /\.(tsx|ts)$/)];
let replacedFilesCount = 0;

for (const file of allFiles) {
    if (file.includes('button.tsx')) continue;

    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // We look for Button instances and transform variant="..." props
    // We'll replace it simply if it matches standard patterns.
    
    // variant="solid" color="primary" -> color="primary" variant="solid"
    content = content.replace(/<Button([^>]*)variant=(["'])default\2/g, '<Button$1color="primary" variant="solid"');
    
    // variant="solid" color="neutral" -> color="neutral" variant="outline"
    content = content.replace(/<Button([^>]*)variant=(["'])secondary\2/g, '<Button$1color="neutral" variant="outline"');

    // variant="solid" color="danger" -> color="danger" variant="solid"
    content = content.replace(/<Button([^>]*)variant=(["'])destructive\2/g, '<Button$1color="danger" variant="solid"');

    // variant="outline" -> color="neutral" variant="outline"
    content = content.replace(/<Button([^>]*)variant=(["'])outline\2/g, '<Button$1color="neutral" variant="outline"');

    // variant="ghost" -> color="neutral" variant="ghost"
    content = content.replace(/<Button([^>]*)variant=(["'])ghost\2/g, '<Button$1color="neutral" variant="ghost"');

    // variant="link" -> color="primary" variant="link"
    content = content.replace(/<Button([^>]*)variant=(["'])link\2/g, '<Button$1color="primary" variant="link"');

    // Remove duplicates like color="primary" variant="solid" color="primary" variant="solid" if they happen
    content = content.replace(/color="primary" variant="solid" color="primary" variant="solid"/g, 'color="primary" variant="solid"');
    
    // Some places had variant={...} logic, but we only have a few left to fix manually if we do basic strings.
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        replacedFilesCount++;
        console.log(`Fixed variants in ${file}`);
    }
}
console.log(`Total replaced: ${replacedFilesCount}`);
