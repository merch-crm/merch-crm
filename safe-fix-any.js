const { execSync } = require('child_process');
const fs = require('fs');

const files = [
  "app/(main)/admin-panel/api-keys/page.tsx",
  "app/(main)/admin-panel/audit/audit-client.tsx",
  "app/(main)/admin-panel/audit/page.tsx",
  "app/(main)/admin-panel/roles-departments/page.tsx",
  "app/(main)/dashboard/clients/components/activity-status-tabs.tsx",
  "app/(main)/dashboard/orders/components/order-card.tsx",
  "app/(main)/dashboard/orders/components/order-table-row.tsx",
  "app/(main)/dashboard/orders/status-badge.tsx",
  "app/(main)/dashboard/portal/portal-client.tsx",
  "app/(main)/dashboard/production/calculators/components/GlobalSettingsModal.tsx",
  "app/(main)/dashboard/production/calculators/components/calculators-nav.tsx",
  "app/(main)/dashboard/production/calculators/page.tsx",
  "app/(main)/dashboard/production/components/bento/calculators-grid.tsx",
  "app/(main)/dashboard/production/components/bento/calculators-tabs.tsx",
  "app/(main)/dashboard/production/components/bento/equipment-status-card.tsx",
  "app/(main)/dashboard/production/components/bento/notifications-card.tsx",
  "app/(main)/dashboard/production/components/bento/production-stages-card.tsx",
  "app/(main)/dashboard/production/components/bento/quick-access-grid.tsx",
  "app/(main)/dashboard/production/components/bento/urgent-tasks-card.tsx",
  "app/(main)/dashboard/production/reports/components/metric-card.tsx",
  "app/(main)/dashboard/references/floating-panels-crm.tsx",
  "app/(main)/dashboard/references/icons-showcase-crm.tsx",
  "app/(main)/dashboard/references/sidebar-navigation-crm.tsx",
  "app/(staff)/staff/employees/employees-client.tsx",
  "app/(staff)/staff/reports/components/report-stats.tsx",
  "app/(staff)/staff/settings/settings-client.tsx",
  "app/(staff)/staff/staff-monitoring-client.tsx",
  "app/api/cron/clients/reactivation/route.ts",
  "app/api/cron/nps/route.ts",
  "app/api/v1/orders/route.ts",
  "app/ui-kit/dropdowns/page.tsx",
  "components/auth/permission-shield.tsx",
  "components/layout/header-search.tsx",
  "components/notifications/notification-center.tsx",
  "components/portal/ticket-modal.tsx",
  "components/staff/zone-editor.tsx",
  "components/ui/breadcrumbs.tsx",
  "components/ui/stat-card.tsx",
  "lib/audit.ts",
  "lib/services/clients/reactivation.service.ts",
  "lib/services/gamification.service.ts",
  "components/mockups/3d-viewer.tsx"
];

let fixed = 0;
let failedFiles = [];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  
  // Read and replace
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  content = content.replace(/ as any/g, ' as unknown');
  content = content.replace(/: any\b/g, ': unknown');
  content = content.replace(/<any>/g, '<unknown>');
  content = content.replace(/any\[\]/g, 'unknown[]');
  content = content.replace(/\(props: any\)/g, '(props: unknown)');
  
  if (content === original) continue; // no changes needed
  
  fs.writeFileSync(file, content);
  
  try {
    execSync('npx tsc --noEmit', { stdio: 'ignore' });
    console.log(`[SUCCESS] Fixed ${file}`);
    fixed++;
  } catch (e) {
    console.log(`[FAILED] Reverting ${file}`);
    fs.writeFileSync(file, original);
    failedFiles.push(file);
  }
}

console.log(`\nFixed ${fixed} files. Failed files:`, failedFiles);
