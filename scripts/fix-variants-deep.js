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

    // We catch `variant='default'`, `variant={'default'}`, `variant={"default"}`
    content = content.replace(/variant=\{?['"]default['"]\}?/g, 'color="primary" variant="solid"');
    content = content.replace(/variant=\{?['"]secondary['"]\}?/g, 'color="neutral" variant="outline"');
    content = content.replace(/variant=\{?['"]destructive['"]\}?/g, 'color="danger" variant="solid"');
    content = content.replace(/variant=\{?['"]outline['"]\}?/g, 'color="neutral" variant="outline"');
    content = content.replace(/variant=\{?['"]ghost['"]\}?/g, 'color="neutral" variant="ghost"');
    content = content.replace(/variant=\{?['"]link['"]\}?/g, 'color="primary" variant="link"');
    
    // Some unique ones seen in logs
    content = content.replace(/variant=\{?['"]action['"]\}?/g, 'color="primary" variant="solid"');
    content = content.replace(/variant=\{?['"]btn-dark['"]\}?/g, 'color="primary" variant="solid"');
    content = content.replace(/variant=\{?['"]flat['"]\}?/g, 'color="neutral" variant="ghost"');

    // Make sure we didn't accidentally do color="..." variant="..." color="..." variant="..."
    for (let i = 0; i < 5; i++) {
        content = content.replace(/color="primary" variant="solid" color="primary" variant="solid"/g, 'color="primary" variant="solid"');
        content = content.replace(/color="neutral" variant="outline" color="neutral" variant="outline"/g, 'color="neutral" variant="outline"');
        content = content.replace(/color="danger" variant="solid" color="danger" variant="solid"/g, 'color="danger" variant="solid"');
        content = content.replace(/color="neutral" variant="ghost" color="neutral" variant="ghost"/g, 'color="neutral" variant="ghost"');
        content = content.replace(/color="primary" variant="link" color="primary" variant="link"/g, 'color="primary" variant="link"');
    }
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        replacedFilesCount++;
        console.log(`Replaced variants manually in ${file}`);
    }
}
console.log(`Deep manual replaced: ${replacedFilesCount}`);
