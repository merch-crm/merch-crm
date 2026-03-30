const fs = require('fs');
const path = require('path');

const filesToFix = [
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
  "app/(staff)/staff/employees/employees-client.tsx",
  "app/(staff)/staff/reports/components/report-stats.tsx",
  "app/(staff)/staff/settings/settings-client.tsx",
  "app/(staff)/staff/staff-monitoring-client.tsx",
  "app/api/cron/clients/reactivation/route.ts",
  "app/api/cron/nps/route.ts",
  "app/api/v1/orders/route.ts",
  "components/auth/permission-shield.tsx",
  "components/layout/header-search.tsx",
  "components/notifications/notification-center.tsx",
  "components/portal/ticket-modal.tsx",
  "components/staff/zone-editor.tsx",
  "components/ui/breadcrumbs.tsx",
  "components/ui/stat-card.tsx",
  "lib/audit.ts",
];

for (const file of filesToFix) {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace ' as any' with ' as unknown'
    content = content.replace(/ as any/g, ' as unknown');
    
    // Replace ': any' with ': unknown'
    content = content.replace(/: any\b/g, ': unknown');
    
    // Replace '<any>' with '<unknown>'
    content = content.replace(/<any>/g, '<unknown>');
    
    // Replace 'any[]' with 'unknown[]'
    content = content.replace(/any\[\]/g, 'unknown[]');

    // 'any' in destructured params like `(props: any)`
    content = content.replace(/\(props: any\)/g, '(props: unknown)');
    
    fs.writeFileSync(fullPath, content);
    console.log(`Replaced in ${file}`);
  } else {
    console.log(`Not found: ${file}`);
  }
}
