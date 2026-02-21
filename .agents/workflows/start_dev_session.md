---
description: Startup routine to initialize SSH tunnel to remote Docker DB and start Next.js dev server.
---

This workflow starts the local development session for MerchCRM.
It sets up an SSH tunnel to the remote PostgreSQL + Redis database and launches the Next.js dev server.

## Steps

1. **Kill existing processes on ports 3000, 5432, 6379**
   ```bash
   fuser -k 3000/tcp 2>/dev/null || true
   lsof -ti:5432 | xargs kill -9 2>/dev/null || true
   lsof -ti:6379 | xargs kill -9 2>/dev/null || true
   ```

// turbo
2. **Establish SSH tunnel to remote DB (PostgreSQL on 5432, Redis on 6379)**
   ```bash
   ssh -i ~/.ssh/antigravity_key -f -N -L 5432:127.0.0.1:5432 -L 6379:127.0.0.1:6379 root@89.104.69.25
   ```
   Wait 2 seconds after this step.

3. **Sync DB password (in case it was reset on the server)**
   ```bash
   ssh -i ~/.ssh/antigravity_key root@89.104.69.25 "docker exec merch-crm-db psql -U postgres -c \"ALTER USER postgres WITH PASSWORD '5738870192e24949b02a700547743048';\""
   ```

4. **Verify DB connection**
   ```bash
   node scripts/check-connection.js
   ```
   If this fails, stop and ask the user to check the SSH key or VPN connection.

// turbo
5. **Start the Next.js dev server**
   ```bash
   npm run dev
   ```
   The app will be available at http://localhost:3000.

> **Note:** You are working with the PRODUCTION database. All data changes will affect real data.
