const fs = require('fs');
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
let foundCount = 0;

for (const [key, value] of Object.entries(lock.packages || {})) {
  if (key !== '' && typeof value === 'object') {
    if (!value.version && !value.link && !value.inBundle) {
      console.log('Missing version in packages:', key);
      foundCount++;
    } else if (value.version === '') {
      console.log('Empty version in packages:', key);
      foundCount++;
    }
  }
}

for (const [key, value] of Object.entries(lock.dependencies || {})) {
  if (typeof value === 'object') {
    if (!value.version) {
      console.log('Missing version in dependencies:', key);
      foundCount++;
    } else if (value.version === '') {
      console.log('Empty version in dependencies:', key);
      foundCount++;
    }
  }
}

if (foundCount === 0) console.log('All packages have versions');
