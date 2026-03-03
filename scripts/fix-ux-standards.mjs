import fs from 'fs/promises';
import path from 'path';

const dirs = [
    'app/(main)',
    'app/(staff)',
    'components/staff',
    'components/ui'
];

async function walk(dir, fileList = []) {
    const files = await fs.readdir(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
            fileList = await walk(filePath, fileList);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

// target files exactly mentioned in audit log, to avoid replacing intentional cases globally maybe? 
// No, the audit report is just saying what it found.

async function fixUxFiles() {
    let files = [];
    for (const dir of dirs) {
        files = files.concat(await walk(path.join(process.cwd(), dir)));
    }

    for (const file of files) {
        let content = await fs.readFile(file, 'utf8');
        let newContent = content;

        // replace uppercase
        newContent = newContent.replace(/\buppercase\b/g, '');
        // replace tracking-widest
        newContent = newContent.replace(/\btracking-widest\b/g, '');
        // replace text-[10px] -> text-[11px] leading-tight text-neutral-500
        newContent = newContent.replace(/text-\[10px\]/g, 'text-[11px] leading-tight text-neutral-500');
        // replace text-[9px] -> text-[11px] leading-tight text-neutral-500 
        newContent = newContent.replace(/text-\[9px\]/g, 'text-[11px] leading-tight text-neutral-500');

        // fix gaps (gap-4, gap-5, gap-6, gap-8 => gap-3)
        newContent = newContent.replace(/\bgap-[4-9]\b/g, 'gap-3');
        newContent = newContent.replace(/\bgap-1[0-9]\b/g, 'gap-3');

        // fix space (space-y-4, space-x-4 => space-y-3, space-x-3)
        newContent = newContent.replace(/\bspace-(x|y)-[4-9]\b/g, 'space-$1-3');
        newContent = newContent.replace(/\bspace-(x|y)-1[0-9]\b/g, 'space-$1-3');

        // fix empty classes that might be left
        newContent = newContent.replace(/className="\s+/g, 'className="');
        newContent = newContent.replace(/\s+"/g, '"');
        newContent = newContent.replace(/className={cn\(\s+"/g, 'className={cn("');

        if (content !== newContent) {
            await fs.writeFile(file, newContent, 'utf8');
            console.log(`Updated UX in: ${file}`);
        }
    }
}

fixUxFiles().catch(console.error);
