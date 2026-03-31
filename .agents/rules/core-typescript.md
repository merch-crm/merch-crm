---
description: "Запрет any в TypeScript. Применяется всегда."
activation: always
---

Абсолютный запрет типа `any`. Подробности: `vault/010-Стандарты/TypeScript-строгость.md`
НИКОГДА не используй `any`, `as any`, `@ts-ignore`.
Замены: unknown, Record<string, unknown>, Zod-парсинг, generics.
