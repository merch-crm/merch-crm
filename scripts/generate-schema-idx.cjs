const fs = require('fs');
const path = require('path');

const schemaDir = path.join(process.cwd(), 'lib/schema');

function getExports(content) {
  const values = [];
  const types = [];
  const regex = /export\s+(const|function|enum|class|type|interface)\s+([a-zA-Z0-9_]+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
      if (match[1] === 'type' || match[1] === 'interface') {
          types.push(match[2]);
      } else {
          values.push(match[2]);
      }
  }
  return { values, types };
}

function scanDir(dir, baseDir = '') {
  let result = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'index.ts') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      result = result.concat(scanDir(fullPath, path.join(baseDir, file)));
    } else if (file.endsWith('.ts')) {
      if (file === "enums.ts") continue; 
      
      const content = fs.readFileSync(fullPath, 'utf8');
      const { values, types } = getExports(content);
      
      if (values.length > 0 || types.length > 0) {
        const importPath = './' + path.posix.join(baseDir, file.replace('.ts', ''));
        result.push(`// ${importPath}`);
        if (values.length > 0) result.push(`export { ${values.join(', ')} } from "${importPath}";`);
        if (types.length > 0) result.push(`export type { ${types.join(', ')} } from "${importPath}";`);
      }
    }
  }
  return result;
}

const allExports = scanDir(schemaDir);
allExports.unshift('// Enums\nexport * from "./enums";\n');

fs.writeFileSync(path.join(schemaDir, 'index.ts'), allExports.join('\n'));
console.log('Successfully generated modular schema exports (separated types/values)!');
