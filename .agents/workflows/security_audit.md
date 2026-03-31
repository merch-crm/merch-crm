---
description: AI-powered security audit with 18 specialized agents
---

This workflow performs a deep security audit of the project using Ship Safe.

1. Install dependencies (if not already installed)
```bash
npm install
```

2. Run a full security audit
// turbo
```bash
npm run security:audit
```

3. Run an adversarial "Red Team" scan
// turbo
```bash
npm run security:red-team
```

4. Check security "vibe" and emojis
```bash
npm run security:vibe-check
```

5. (Optional) For deep analysis using LLMs (requires API keys), run:
```bash
npm run security:audit:deep
```

Findings will be output to the console and a detailed HTML report will be generated in the root directory.
