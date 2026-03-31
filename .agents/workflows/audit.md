---
description: Run the full project audit script (audit.ts)
---
This workflow runs the comprehensive audit script combining TS, ESLint, UX, components, and security checks.

## Steps

// turbo
1. **Run Full Audit**
   ```bash
   npm run audit
   ```

2. **Send Link to Report**
   After the script finishes, just reply with a quick summary of the run and provide a clickable markdown link to `[audit-report.md](file:///Users/leonidmolchanov/Desktop/merch-crm/audit-report.md)`. Do not copy the contents of the report into the chat.
