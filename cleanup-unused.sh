#!/bin/bash

# Script to remove unused imports based on TypeScript warnings
# This will process the most common unused imports from lucide-react

echo "Cleaning up unused imports..."

# List of files with unused imports (from the warnings)
files=(
  "app/dashboard/design-showcase/cards-crm.tsx"
  "app/dashboard/clients/page.tsx"
  "app/dashboard/dashboard-client.tsx"
  "app/dashboard/lumin-test/invoice-dashboard.tsx"
  "app/dashboard/lumin-test/twisty-dashboard.tsx"
  "app/dashboard/lumin-test/smart-home-dashboard.tsx"
  "app/dashboard/design-showcase/analytics-crm.tsx"
  "app/dashboard/design-showcase/aquaflow-landing-crm.tsx"
  "app/dashboard/finance/actions.ts"
  "app/dashboard/finance/expenses-client.tsx"
  "app/dashboard/finance/promocodes-client.tsx"
  "app/dashboard/finance/transactions-client.tsx"
  "app/dashboard/orders/[id]/order-actions.tsx"
  "app/dashboard/orders/orders-table.tsx"
  "app/dashboard/orders/status-badge-interactive.tsx"
  "app/dashboard/production/production-board.tsx"
  "app/dashboard/production/production-widgets.tsx"
  "app/dashboard/search-actions.ts"
  "app/dashboard/tasks/actions.ts"
  "app/dashboard/undo-actions.ts"
  "app/dashboard/warehouse/items/[id]/components/ItemGeneralInfo.tsx"
  "app/dashboard/warehouse/items/[id]/components/ItemHistorySection.tsx"
  "app/dashboard/warehouse/items/[id]/components/ItemInventorySection.tsx"
  "app/dashboard/warehouse/items/[id]/item-detail-client.tsx"
  "app/dashboard/warehouse/warehouse-widgets.tsx"
  "components/image-lightbox.tsx"
  "components/layout/command-menu.tsx"
  "components/layout/desktop-header.tsx"
  "components/layout/mobile-bottom-nav.tsx"
  "components/layout/mobile-header.tsx"
  "components/notifications/notification-manager.tsx"
  "lib/automations.ts"
  "lib/inventory.ts"
  "lib/notifications.ts"
  "lib/product.ts"
)

echo "Found ${#files[@]} files to process"
echo "This is a dry run - no files will be modified"
echo "To actually modify files, edit this script and remove the 'echo' commands"

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Would process: $file"
  else
    echo "File not found: $file"
  fi
done

echo "Done!"
