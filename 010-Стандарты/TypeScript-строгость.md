---
tags:
  - стандарты
  - стандарт
  - typescript
  - типы
обновлено: 2026-03-30
related:
  - "[[Безопасность]]"
  - "[[Server-Actions]]"
  - "[[Известные-Проблемы]]"
---
# TypeScript — абсолютный запрет `any`

Нулевая толерантность. Ни один файл проекта не должен содержать тип `any`.

## Таблица замен

| Было (ЗАПРЕЩЕНО)                          | Стало (ОБЯЗАТЕЛЬНО)                              |
|-------------------------------------------|--------------------------------------------------|
| `param: any`                              | `param: unknown` + сужение типа через type guard  |
| `obj: any`                                | `Record<string, unknown>` или конкретный интерфейс |
| `(data as any).field`                     | Zod-парсинг: `schema.parse(data).field`           |
| `arr: any[]`                              | `arr: T[]` с generic                              |
| `callback: (...args: any) => any`         | `callback: (arg: ConcreteType) => ReturnType`     |
| `JSON.parse(str) as any`                  | `const result: unknown = JSON.parse(str)`         |
| `// @ts-ignore`                           | Исправить корневую причину                        |

## Централизация типов
Все разделяемые типы живут в `@/lib/types`. Импортируй оттуда.

## Возвращаемые типы
Все [[Server-Actions]] и сервисные функции — с явным return type.

## JSDoc (на русском)
Все server actions, сервисы и сложная логика — с JSDoc.
Обязательные теги для мутаций: `@requires` (роли), `@audit` (категория).
Для React-компонентов: `@example`.

---
[[Merch-CRM|Назад к оглавлению]]
