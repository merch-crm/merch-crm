---
tags:
  - стандарты
---

# Стандарт Server Actions (Unified v3.0)

## 7. Модульный импорт схем (Item 14)
Для минимизации времени холодного старта (Cold Start) в serverless-окружениях запрещено использовать монолитный импорт всей схемы через `import * as schema from "@/lib/schema"`.

**Правило**: Всегда импортируйте только необходимые таблицы из соответствующих модулей `lib/schema/`.

```typescript
// НЕПРАВИЛЬНО (загружает всю БД в память)
import { users } from "@/lib/schema";

// ПРАВИЛЬНО (загружает только нужный модуль)
import { users } from "@/lib/schema/users";
import { inventoryItems } from "@/lib/schema/warehouse/items";
```

Это критично для производительности и потребления ресурсов сервера.

---

В MerchCRM все серверные действия (Server Actions) должны создаваться через обертку `createSafeAction`. Это гарантирует единообразную обработку ошибок, валидацию данных и контроль доступа.

## Основной паттерн

Экшены располагаются в файлах `actions.ts` внутри модулей или в глобальной директории `app/actions/`.

```typescript
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";

// 1. Определение схемы входных данных
const CreateOrderSchema = z.object({
  clientId: z.string().uuid("Выберите клиента"),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1)
  })).min(1, "Добавьте хотя бы один товар")
});

// 2. Создание экшена
export const createOrderAction = createSafeAction({
  schema: CreateOrderSchema,
  roles: ["admin", "management", "sales"], // Опционально: ограничение ролей (используются slug)
  requireAuth: true, // По умолчанию true
  handler: async (input, ctx) => {
    // input гарантированно валидирован Zod
    // ctx содержит userId, roleName и roleSlug текущего пользователя
    
    const newOrder = await db.insert(orders).values({
      ...input,
      createdById: ctx.userId
    }).returning();

    return { 
      success: true, 
      data: newOrder[0] 
    };
  }
});
```

## Требования к реализации

1.  **Zod-валидация**: Каждый экшен ДОЛЖЕН иметь схему (параметр `schema`), если он принимает входные данные. Тексты ошибок в Zod должны быть на русском языке.
2.  **Тип возвращаемого значения**: Экшен всегда возвращает `ActionResult<T>`.
    -   Успех: `{ success: true, data: T }`
    -   Ошибка: `{ success: false, error: string, code: ErrorCode, issues?: string[] }`
3.  **Обработка ошибок**: Внутри `handler` не нужно использовать `try/catch` для обычных ошибок бизнес-логики. Достаточно выбросить `AppError` или вернуть объект с `success: false`.
    -   Используйте хелпер `err(message, code)` из `@/lib/types` для быстрых возвратов ошибок.
4.  **Контроль доступа**: Всегда указывайте параметр `roles`, если действие критично для бизнес-процессов.

## Использование на клиенте

На фронтенде рекомендуется использовать хук `useAction` (если реализован) или простую проверку `result.success`:

```typescript
const result = await createOrderAction(data);

if (!result.success) {
  toast.error(result.error); // Вывод ошибки пользователю
  return;
}

toast.success("Заказ создан");
router.push(`/orders/${result.data.id}`);
```

## Эволюция
Любые изменения в базовой логике `createSafeAction` должны отражаться в этом документе и в `CHANGELOG.md`.
