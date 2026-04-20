const fs = require('fs');

const path = '/Users/leonidmolchanov/Desktop/WORK/Project/Merch-CRM/merch-crm/app/ui-kit/(categories)/statuses/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace using literal indices or split by line
const lines = content.split('\n');

// Find the line with Primary Pack
let startIndex = -1;
for (let i = 0; i < lines.length; i++) {
   if (lines[i].includes('{/* 2. Primary Pack */}')) {
       startIndex = i;
       break;
   }
}

if (startIndex !== -1) {
   lines.splice(
       startIndex, 
       8, 
       '          {/* 2. Primary Pack */}',
       '          <div className="flex flex-col items-center gap-3">',
       '            <QuantityIconBadge value={100} unit="уп." icon={Archive} />',
       '            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">С иконкой</span>',
       '          </div>'
   );
   fs.writeFileSync(path, lines.join('\n'));
   console.log('Successfully replaced Primary Pack');
} else {
   console.log('Could not find Primary Pack');
}
