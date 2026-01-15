---
description: Pre-deploy checklist to ensure stability and data integrity.
---

1. Run Linting and Type Checking to catch subtle bugs.
// turbo
```bash
npm run lint && npm run type-check
```

2. Check for missing environment variables in .env.local.
// turbo
```bash
node scripts/check-env.js
```

3. Verify DB Connection and Schema sync.
// turbo
```bash
npm run db:push
```

4. Check recent Audit Logs to ensure all administrative actions are being tracked.
```bash
# Verify manually in the /dashboard/admin/audit section
```

5. Confirm all new Client components use `router.refresh()` for sync.
```bash
# Search for moveInventoryItem or adjustInventoryStock usage
```
