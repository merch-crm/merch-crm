---
description: Deploy changes to production server (89.104.69.25)
---

This workflow deploys the latest code from the `main` branch to the production server.
It performs the following steps via SSH:
1. Pulls the latest code from GitHub.
2. Rebuilds the Docker image locally on the server (using Yandex mirror for speed).
3. Recreates the Docker containers to apply changes.

# Command

```bash
ssh -i ~/.ssh/antigravity_key -o StrictHostKeyChecking=no root@89.104.69.25 "cd merch-crm && git pull && docker build -t ghcr.io/merch-crm/merch-crm:latest . && docker compose up -d --force-recreate"
```
