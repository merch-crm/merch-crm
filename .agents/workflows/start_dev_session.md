---
description: Startup routine to initialize SSH tunnel to remote Docker DB and start Next.js dev server.
---

This workflow starts the local development session for MerchCRM.
It sets up an adaptive SSH tunnel to the remote PostgreSQL + Redis database and launches the Next.js dev server.

## Steps

1. **Start the automated dev session**
   ```bash
   npm run dev:ssh
   ```
   This command will:
   - Identify ports from `.env.local`
   - Automatically detect Redis container IP on the server
   - Establish the adaptive SSH tunnel
   - Sync the DB password
   - Verify connectivity
   - Start the Next.js dev server

2. **Wait for completion**
   The app will be available at http://localhost:3000 once the scripts finish.

> **Note:** You are working with the PRODUCTION database. All data changes will affect real data.
