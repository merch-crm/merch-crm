---
description: Startup routine to initialize SSH tunnel to remote Docker DB and start Next.js dev server.
---

// turbo-all

1. Clean up existing tunnels and clear port 5432.
```bash
lsof -ti:5432 | xargs kill -9 2>/dev/null || true
```

2. Establish a background SSH tunnel to the remote server (89.104.69.25). 
This links the remote Postgres in Docker to your local port 5432.
```bash
ssh -i ~/.ssh/antigravity_key -f -N -L 5432:localhost:5432 root@89.104.69.25
```

3. Verify database connectivity using the local environment settings.
```bash
node scripts/check-connection.js
```

4. Start the development server.
```bash
npm run dev
```
