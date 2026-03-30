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
  "lib/services/clients/reactivation.service.ts",
  "lib/services/gamification.service.ts",
  "components/mockups/3d-viewer.tsx"
];

let fixedCount = 0;

for (const file of files) {
  if (!fs.existsSync(file)) continue;

  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/AnyType/g, 'any');

  if (content !== original) {
    fs.writeFileSync(file, content);
    fixedCount++;
  }
}
console.log(`Replaced 'AnyType' back to 'any' in ${fixedCount} files.`);
