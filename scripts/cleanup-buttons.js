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
    let content = fs.readFileSync(file, 'utf8');

    if (content.includes('@/components/ui/button') && !file.includes('components/ui/button.tsx')) {
        let newContent = content.replace(/["']@\/components\/ui\/button["']/g, '"@/components/ui/button"');
        
        newContent = newContent.replace(/\bButton\b/g, 'Button');
        newContent = newContent.replace(/\bbuttonVariants\b/g, 'buttonVariants');

        fs.writeFileSync(file, newContent, 'utf8');
        replacedFilesCount++;
        console.log(`Replaced in ${file}`);
    }
}
console.log(`Total replaced: ${replacedFilesCount}`);
