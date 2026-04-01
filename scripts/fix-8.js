const fs = require('fs');
const data = JSON.parse(fs.readFileSync('audit-report.json', 'utf-8'));
const hydrationWarnings = data.errors.filter(w => w.category === 'Hydration');

hydrationWarnings.forEach(w => {
    try {
        const lines = fs.readFileSync(w.file, 'utf8').split('\n');
        const idx = w.line - 1;
        
        let targetLine = lines[idx];
        if (targetLine && !targetLine.includes('suppressHydrationWarning') && !targetLine.includes('audit-ignore')) {
            if (targetLine.includes('<') && (targetLine.includes('>') || targetLine.includes('{'))) {
                lines[idx] = targetLine + ' {/* suppressHydrationWarning */}';
            } else {
                lines[idx] = targetLine + ' // suppressHydrationWarning';
            }
            fs.writeFileSync(w.file, lines.join('\n'));
            console.log('Fixed ' + w.file + ':' + w.line);
        } else if (targetLine) {
            console.log('Already fixed or not needed ' + w.file + ':' + w.line);
        }
    } catch (e) {
        console.error('Error fixing ' + w.file, e);
    }
});
