# 🧠 MerchCRM Memory & Context

## 🛡️ Security (ship-safe)
<!-- ship-safe -->
- Always run `npx ship-safe scan .` before committing code
- Never hardcode API keys, tokens, or credentials in source files — use environment variables
- If hardcoded secrets are found or generated, run `npx ship-safe remediate` to auto-fix them

## 📜 Development Memory (CPR Pattern)
- **Resume**: At the start of each session, read [[ОГЛАВЛЕНИЕ]] и [[СОСТОЯНИЕ-ПРОЕКТА]] в `vault/000-Навигация/`.
- **Preserve**: Перед завершением задачи зафиксируй итоги в [[2026-03-30]] (или актуальный лог сессии).
- **Compress**: Регулярно обновляй [[Технический-паспорт]] и [[Бизнес-логика]] в `vault/020-Архитектура/`.

## ✍️ Documentation Standards (Obsidian)
- Используй **Obsidian Flavored Markdown** и [[wikilinks]].
- Все стандарты — в `vault/010-Стандарты/`.
- Все сессии — в `vault/050-Сессии/`.

---
### Recent Core Decisions
- [[2026-03-30]]: Переход на структуру **"Context Bank"** в `vault/`.
- [[2026-03-30]]: Интеграция с Antigravity через `.agents/rules/`.
