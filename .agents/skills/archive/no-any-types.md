---
name: No Any Types
description: Запрещает использование типа any в TypeScript и предлагает безопасные альтернативы.
---

# Запрет типа any

## Правило
НИКОГДА не используй тип `any`. Это строгое требование проекта.

## Вместо any используй:

### Неизвестные данные:
```typescript
// ❌ Плохо
function process(data: any) {}

// ✅ Хорошо
function process(data: unknown) {
 if (typeof data === 'string') {
  // теперь data это string
 }
}
```

### Объекты с неизвестной структурой:
```typescript
// ❌ Плохо
const config: any = {};

// ✅ Хорошо
const config: Record<string, unknown> = {};
```

### API ответы — всегда через Zod:
```typescript
// ❌ Плохо
const data: any = await response.json();

// ✅ Хорошо
const schema = z.object({
 id: z.string(),
 name: z.string(),
});
const data = schema.parse(await response.json());
```

### Generic функции:
```typescript
// ❌ Плохо
function first(arr: any[]): any {}

// ✅ Хорошо
function first<T>(arr: T[]): T | undefined {}
```

### При ошибках типизации
Не используй `any` как "затычку". Разберись с типом или спроси пользователя.
