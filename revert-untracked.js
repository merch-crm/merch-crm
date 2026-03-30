const fs = require('fs');
const path = require('path');

const untrackedFiles = [
  "app/(main)/admin-panel/api-keys/page.tsx",
  "app/(main)/admin-panel/audit/audit-client.tsx",
  "app/(main)/admin-panel/audit/page.tsx",
  "app/(main)/admin-panel/roles-departments/page.tsx",
  "app/(main)/dashboard/portal/portal-client.tsx",
  "app/api/cron/clients/reactivation/route.ts",
  "app/api/cron/nps/route.ts",
  "app/api/v1/orders/route.ts",
  "components/auth/permission-shield.tsx",
  "components/portal/ticket-modal.tsx",
];

for (const file of untrackedFiles) {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Reverse replacements
    content = content.replace(/ as unknown/g, ' as any');
    content = content.replace(/: unknown\b/g, ': any');
    content = content.replace(/<unknown>/g, '<any>');
    content = content.replace(/unknown\[\]/g, 'any[]');
    content = content.replace(/\(props: unknown\)/g, '(props: any)');
    
    fs.writeFileSync(fullPath, content);
    console.log(`Reverted in ${file}`);
  }
}
