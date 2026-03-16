import * as fs from 'fs';
import * as path from 'path';

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace exact match
    const exactMatch = 'import { getSession } from "@/lib/auth";';
    const exactReplacement = 'import { getSession } from "@/lib/session";';
    
    // Replace single quotes match
    const singleMatch = "import { getSession } from '@/lib/auth';";
    const singleReplacement = "import { getSession } from '@/lib/session';";

    let modified = false;

    if (content.includes(exactMatch)) {
        content = content.replaceAll(exactMatch, exactReplacement);
        modified = true;
    }
    if (content.includes(singleMatch)) {
        content = content.replaceAll(singleMatch, singleReplacement);
        modified = true;
    }

    // RegEx match for mixed imports: import { something, getSession } from "@/lib/auth";
    // Actually we can do a simple global replace for "@/lib/auth" with "@/lib/session" ONLY IF we know getSession is the ONLY thing being imported, or we split them up.
    // For now, let's just do exact match.

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated: ${filePath}`);
    }
}

function traverseDir(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (!['node_modules', '.next', '.git', 'dist', 'build', 'coverage'].includes(item)) {
                traverseDir(fullPath);
            }
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            replaceInFile(fullPath);
        }
    }
}

const dirsToScan = ['app', 'components', 'lib', 'tests', 'hooks'];
dirsToScan.forEach(dir => traverseDir(dir));

console.log('Finished updating imports.');
