import * as fs from 'fs';
import * as path from 'path';

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    const singleMatch = "vi.mock('@/lib/auth'";
    const singleReplacement = "vi.mock('@/lib/session'";
    
    const doubleMatch = 'vi.mock("@/lib/auth"';
    const doubleReplacement = 'vi.mock("@/lib/session"';

    if (content.includes(singleMatch)) {
        content = content.replaceAll(singleMatch, singleReplacement);
        modified = true;
    }
    if (content.includes(doubleMatch)) {
        content = content.replaceAll(doubleMatch, doubleReplacement);
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated mock in: ${filePath}`);
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

console.log('Finished updating test mocks.');
