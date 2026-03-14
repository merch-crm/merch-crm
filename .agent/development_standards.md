# Технические стандарты разработки MerchCRM

Этот документ содержит **технические** правила и паттерны разработки.

> **ВАЖНО**: Общение ИИ (Antigravity) с пользователем, комментарии к коду и описание изменений должны всегда осуществляться на **русском языке**.

> 📐 **Визуальные стандарты** (spacing, radius, цвета, компоненты, адаптивность) вынесены в отдельный документ: [`.agent/UX_STANDARDS.md`](.agent/UX_STANDARDS.md). AI обязан сверяться с ним при любой работе с UI.

---

## 0. Технологический стек
- **Framework**: Next.js 16.1.6 (App Router + Turbopack)
- **Runtime**: Node.js 20+
- **Styling**: Tailwind CSS v4 (Engine: Oxide)
- **Database**: PostgreSQL (Managed on Reg.ru)
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth (Redis-based sessions)

---

## 1. Уведомления и взаимодействие с пользователем
- **Никаких стандартных браузерных уведомлений**: Не используйте `alert()`, `confirm()` или `prompt()`.
- **Кастомные уведомления (Toasts)**: Используйте хук `useToast` из `@/components/ui/toast`.
- **Системные уведомления (Notifications)**:
  - Для важных событий бизнеса (критический остаток, новый заказ) используйте `sendStaffNotifications` из `@/lib/notifications`.
  - Эти уведомления сохраняются в БД и видны персоналу в панели.
- **Подтверждение действий**: Вместо `confirm()` используйте `ConfirmDialog` из `@/components/ui/confirm-dialog` или `ResponsiveModal`.

## 2. Работа с данными (БД и Drizzle ORM)
- **Server Actions**: Все изменения данных (INSERT, UPDATE, DELETE) должны проходить через Server Actions в соответствующих файлах `actions.ts`.
- **ORM**: Используйте методы `db.query` для чтения (Type-safe) и билдеры для записи.
- **Запрет SQL**: Избегайте прямых `sql` запросов, если это можно сделать через ORM методы (`findMany`, `eq`).
- **Индексы (Indexes)**:
  - **Обязательно**: Создавайте индексы для всех полей, используемых в `WHERE` (фильтрация, поиск) и `JOIN` (внешние ключи).
  - **Foreign Keys**: Все поля `xxx_id` (например, `roleId`, `orderId`) ОБЯЗАНЫ иметь индекс.
  - **Статусы и Даты**: Поля `status`, `isArchived`, `createdAt` часто используются для сортировки и фильтров — индексируйте их.
  - **Именование**: Используйте паттерн `tableName_columnName_idx`.
    ```typescript
    (table) => ({
        userIdx: index("users_role_idx").on(table.roleId),
        createdIdx: index("users_created_idx").on(table.createdAt),
    })
    ```
- **Валидация**: Используйте `zod` для валидации данных на стороне сервера.
- **Логирование**: Все важные действия (создание, удаление, изменение настроек) должны записываться в таблицу `audit_logs` через `db.insert(auditLogs)`.

## 3. Язык и локализация
- **Интерфейс**: Весь текст интерфейса должен быть на **русском языке**.
- **Общение с ИИ**: Ответы Antigravity, пояснения к коду, отчеты о проделанной работе и любые другие текстовые взаимодействия должны быть исключительно на **русском языке**.

- **Грамматика и склонения (Pluralization)**: 
  - **Обязательное правило**: Везде, где в интерфейсе выводятся числа, счетчики или динамические списки (например: "5 товаров", "Выбрано 3 файла"), **СТРОГО ОБЯЗАТЕЛЬНО** применять функции склонения.
  - **Запрещено**: Использовать конструкции вида "файл(ов)", "товар(ы)" или статичный текст, не согласованный с числом.
  - **Инструмент**: Используйте `@/lib/pluralize`.
    - `pluralize(count, 'товар', 'товара', 'товаров')` — для существительных.
    - `sentence(...)` — для построения фраз с согласованием глаголов ("Найдена 1 запись" / "Найдено 5 записей").
  - Пример:
    ```tsx
    import { pluralize, sentence } from "@/lib/pluralize";
    
    // ✅ Правильно:
    <span>{count} {pluralize(count, 'позиция', 'позиции', 'позиций')}</span>
    
    // ✅ Правильно (согласование рода и числа):
    <p>{sentence(count, 'f', { one: 'Удалена', many: 'Удалено' }, { one: 'категория', few: 'категории', many: 'категорий' })}</p>
    ```

- **Даты**: Для форматирования дат используйте функции из `@/lib/formatters` (обертки над `date-fns`).
  ```tsx
  import { formatDate, formatDateTime } from "@/lib/formatters";
  formatDate(date); // "dd.MM.yyyy"
  ```

## 4. Доступ и Безопасность (Auth)
- **Сессии**: Для получения текущего пользователя используйте ТОЛЬКО `import { getSession } from "@/lib/auth"`. Не парсить куки вручную.
- **API Routes**: Все API роуты обязаны проверять сессию:
  ```ts
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  ```
- **Проверка прав**: Всегда проверяйте права пользователя (роль) как на стороне клиента (для скрытия элементов UI), так и на стороне сервера (в Server Actions).
- **Администратор**: Полный доступ ко всем настройкам и логам.

## 5. Исправление ошибок и Рефакторинг
- **Сохранение дизайна**: При исправлении ошибок линтинга, типов (TypeScript) или техническом рефакторинге СТРОГО ЗАПРЕЩЕНО менять визуальный вид страницы, расположение элементов, отступы или логику UI.
- **Восстановление**: Если техническое исправление требует изменения структуры кода (например, разделения на компоненты), необходимо гарантировать, что итоговый рендер полностью соответствует оригиналу.
- **Проверка**: Перед коммитом технических правок сверяйте текущий вид страницы с предыдущим состоянием.

## 6. State Persistence
- Все клиентские табы, активные секции и важные состояния ДОЛЖНЫ быть синхронизированы с URL через `useSearchParams` / `router.replace('?tab=...', { scroll: false })`.
- **Хлебные крошки**: Технические сегменты пути (например, `finance`, `promocodes`) ДОЛЖНЫ быть отражены в словаре `routeLabels` в `components/layout/breadcrumbs.tsx`.

## 7. TypeScript

- **Запрет `any`**: СТРОГО ЗАПРЕЩЕНО использовать тип `any`. Всегда указывайте конкретный тип или используйте `unknown` с последующей проверкой.
- **Исключения**: Допускается только в крайних случаях с комментарием `// eslint-disable-next-line @typescript-eslint/no-explicit-any` и объяснением причины.

```tsx
// ❌ Запрещено
const data: any = response;
function process(item: any) {}

// ✅ Правильно
const data: User = response;
function process(item: unknown) {
  if (isUser(item)) { ... }
}

// ✅ Для сложных случаев — generic
function process<T>(item: T): T { ... }
```

## 8. Типы

- Все типы данных импортировать из `@/lib/types`
- Запрещено создавать локальные интерфейсы для Order, Client, Product, User
- При необходимости расширить тип — редактировать `lib/types/`, а не создавать новый

## 9. Обязательные компоненты (Technical Essentials)

**Путь**: `@/components/ui/` и `@/components/layout/`

AI обязан использовать существующие компоненты вместо написания кастомного кода:

| Задача | Компонент | Путь |
|--------|-----------|------|
| Дата-таблицы | `DataTable` | `@/components/ui/data-table` |
| Скелетоны | `Skeleton*` | `@/components/ui/skeleton` |
| Спиннеры | `Spinner*` | `@/components/ui/spinner` |
| Прогресс | `Progress*` | `@/components/ui/progress` |
| Тултипы | `Tooltip*` | `@/components/ui/tooltip` |
| Слайдеры | `Slider*` | `@/components/ui/slider` |
| Радио-кнопки | `Radio*` | `@/components/ui/radio-group` |
| Выбор дат | `DateRangePicker` | `@/components/ui/date-range-picker` |
| Загрузка файлов | `FileUpload` | `@/components/ui/file-upload` |
| Аккордеоны | `Accordion*` | `@/components/ui/accordion` |
| Скроллбары | `ScrollArea*` | `@/components/ui/scroll-area` |
| Учет времени | `TimeTracker` | `@/components/ui/time-tracker` |
| История статусов | `StatusTimeline` | `@/components/ui/status-timeline` |
| Отслеживание доставки | `DeliveryTracker` | `@/components/ui/delivery-tracker` |
| Калькуляция стоимости | `PriceBreakdown` | `@/components/ui/price-breakdown` |
| Карточка в очереди | `OrderQueueCard` | `@/components/ui/order-queue-card` |
| Уведомления | `useToast` | `@/components/ui/toast` |
| Подтверждения | `ConfirmDialog` | `@/components/ui/confirm-dialog` |
| Валидация | `zod` | — |
| Склонения | `pluralize`, `sentence` | `@/lib/pluralize` |
| Даты | `formatDate` | `@/lib/formatters` |

> **Правило**: Перед созданием нового компонента — проверь, нет ли готового в `/components`.

- **Конвертация в WebP**: При загрузке **любого** изображения оно должно автоматически конвертироваться в формат `.webp` для оптимизации.
- **Инструментарий**: 
  - На сервере (Server Actions): Используйте библиотеку `sharp` для быстрой и качественной обработки.
  - На клиенте: Используйте функцию `compressImage` из `@/lib/image-processing.ts`.
  ```tsx
  import { compressImage } from "@/lib/image-processing";
  const { file, preview } = await compressImage(originalFile, { type: "image/webp" });
  ```

## 11. Стандартные утилиты (Utils)

Запрещено дублировать код. Используйте готовые функции:

| Функция | Путь | Описание |
|---------|------|----------|
| `cn` | `@/lib/utils` | Объединение классов (Tailwind merge) |
| `formatCurrency` | `@/lib/formatters` | Форматирование валют (1 200 ₽) |
| `formatDate` | `@/lib/formatters` | Форматирование дат (DD.MM.YYYY) |
| `formatUnit` | `@/lib/utils` | Форматирование ед. изм. (шт., кг) |
| `slugify` | `@/lib/utils` | Генерация slug из кириллицы |
| `escapeHtml` | `@/lib/utils` | Экранирование HTML тегов |
| `getSession` | `@/lib/auth` | Получение сессии пользователя |
| `sendStaffNotifications` | `@/lib/notifications` | Отправка системных уведомлений |

## 12. Server Actions и директивы

### 12.1 Обязательные директивы

- **Файлы с Server Actions** ОБЯЗАНЫ содержать директиву в самом начале:
```tsx
"use server"
```
- **Клиентские компоненты** (особенно с хуками `useState`, `useEffect`) ОБЯЗАНЫ содержать директиву:
```tsx
"use client"
```

### 12.2 Структура Server Actions (Reference)

Пример правильной реализации `actions.ts`:
```tsx
"use server"

import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1),
})

export async function createItem(formData: FormData) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")
  
  const validated = schema.parse(Object.fromEntries(formData))
  
  // Логика создания
  // ...
  
  revalidatePath("/dashboard/items")
  return { success: true }
}
```

### 12.3 Запрещённые паттерны в Server Actions

- **❌ ЗАПРЕЩЕНО: Хардкод секретов**
  ```tsx
  const password = "admin123";
  ```
- **✅ ПРАВИЛЬНО: Переменные окружения**
  ```tsx
  const password = process.env.ADMIN_PASSWORD;
  ```
- **❌ ЗАПРЕЩЕНО: Возврат чувствительных данных клиенту**
  ```tsx
  return { user, passwordHash };
  ```
- **✅ ПРАВИЛЬНО: Фильтрация данных**
  ```tsx
  return { user: { id: user.id, name: user.name } };
  ```

## 13. Безопасность SQL-запросов и Валидация

### 13.1 Запрет интерполяции строк

- **❌ КРИТИЧЕСКАЯ УЯЗВИМОСТЬ: SQL-инъекция**
  ```ts
  const result = await db.execute(`SELECT * FROM users WHERE id = '${userId}'`) // ❌
  ```

- **✅ ПРАВИЛЬНО: Drizzle ORM методы (предпочтительно)**
  ```ts
  const result = await db.select().from(users).where(eq(users.id, userId))
  ```

- **✅ ПРАВИЛЬНО: Параметризованные запросы**
  ```ts
  import { sql } from "drizzle-orm"
  const result = await db.execute(sql`SELECT * FROM users WHERE id = ${userId}`)
  ```

- **✅ ПРАВИЛЬНО: Prepared statements**
  ```ts
  const prepared = db.select().from(users).where(eq(users.id, sql.placeholder('id'))).prepare()
  const result = await prepared.execute({ id: userId })
  ```

### 13.2 Валидация входных данных

Все данные от пользователя ОБЯЗАНЫ проходить валидацию.

```ts
import { z } from "zod"

const searchSchema = z.object({
  query: z.string().max(100).regex(/^[a-zA-Zа-яА-Я0-9\s]+$/),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export async function searchItems(params: unknown) {
  const { query, page, limit } = searchSchema.parse(params) // ✅ Валидация
  // безопасно использовать
}
```

## 14. React Hooks — Правила использования

### 14.1 Условия и хуки

Никогда не используйте хуки внутри условий, циклов или вложенных функций.

- **❌ ЗАПРЕЩЕНО:**
  ```tsx
  if (isOpen) {
    useEffect(() => { ... }, []) // 🚫 Нарушение правил React
  }
  ```

- **✅ ПРАВИЛЬНО:**
  ```tsx
  useEffect(() => {
    if (!isOpen) return // Проверка внутри эффекта
    // логика
  }, [isOpen])
  ```
- **✅ ПРАВИЛЬНО (Early Return):**
  ```tsx
  function Component({ enabled }: { enabled: boolean }) {
    const [state, setState] = useState(false)
    if (!enabled) return null // Проверка после объявления хуков
    // ...
  }
  ```

### 14.2 Загрузка данных в useEffect

- **✅ ПРАВИЛЬНО: Использовать AbortController**
  ```tsx
  useEffect(() => {
    const controller = new AbortController()
    
    fetch(url, { signal: controller.signal })
      // ...
      .catch(err => {
        if (err.name !== 'AbortError') setError(err)
      })
    
    return () => controller.abort() // Очистка
  }, [url])
  ```

### 14.3 Зависимости useEffect

Все переменные, используемые внутри эффекта, ДОЛЖНЫ быть в массиве зависимостей.

- **❌ НЕПРАВИЛЬНО:**
  ```tsx
  useEffect(() => {
    fetchData(userId) // userId не в зависимостях
  }, [])
  ```

- **✅ ПРАВИЛЬНО:**
  ```tsx
  useEffect(() => {
    fetchData(userId)
  }, [userId])
  ```

## 15. Компоненты UI — Обязательные правила

### 15.1 Запрет нативных элементов
Не используйте стандартные HTML-элементы ввода, так как они ломают единый стиль.
- **❌ ЗАПРЕЩЕНО:**
  ```tsx
  <select>...</select>
  <input type="checkbox" />
  <input type="radio" />
  ```
- **✅ ПРАВИЛЬНО: Компоненты из UI библиотеки**
  ```tsx
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
  import { Checkbox } from "@/components/ui/checkbox"
  import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
  ```

### 15.2 Работа с изображениями
- **❌ ЗАПРЕЩЕНО:** Тег `<img>` (нет оптимизации).
  ```tsx
  <img src={url} alt="..." />
  ```
- **✅ ПРАВИЛЬНО: Next.js Image**
  ```tsx
  import Image from "next/image"

  // Фиксированные размеры
  <Image src={url} alt="..." width={200} height={150} />

  // Адаптивное изображение
  <div className="relative aspect-video">
    <Image src={url} alt="..." fill className="object-cover" />
  </div>

  // Приоритетная загрузка (LCP)
  <Image src={url} alt="..." priority />
  ```

### 15.3 Импорт Radix UI
Не импортируйте Radix Primitives напрямую, используйте наши styled-компоненты.
- **❌ ЗАПРЕЩЕНО:**
  ```tsx
  import * as Dialog from "@radix-ui/react-dialog"
  ```
- **✅ ПРАВИЛЬНО:**
  ```tsx
  import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
  ```

## 16. Оптимизация производительности (React Performance)

### 16.1 Мемоизация тяжелых компонентов
```tsx
import { memo, useMemo, useCallback } from "react"

// ✅ memo для компонентов списков (если рендерится много элементов)
const ListItem = memo(function ListItem({ item }: Props) {
  return <div>{item.name}</div>
})
```

### 16.2 useMemo для вычислений
```tsx
// ✅ useMemo для тяжёлых вычислений (фильтрация, сортировка массивов)
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
)
```

### 16.3 useCallback для функций
```tsx
// ✅ useCallback для стабильных колбэков, передаваемых в дочерние memo-компоненты
const handleClick = useCallback((id: string) => {
  // ...
}, [dependency]) // не забывайте про зависимости!
```

## 17. Обработка ошибок и Логирование (Error Handling)

### 17.1 Системные ошибки (logError)
При возникновении исключений в критических операциях (Server Actions, API) **ОБЯЗАТЕЛЬНО** используйте `logError`.
```tsx
import { logError } from "@/lib/error-logger";

try {
  // логика
} catch (error) {
  await logError({
    error,
    severity: "critical", // info | warning | error | critical
    path: "/dashboard/orders",
    method: "createOrder",
    details: { clientId, amount }
  });
  return { success: false, error: "Произошла системная ошибка" };
}
```

### 17.2 ActionResult Pattern
Все Server Actions должны возвращать объект типа `ActionResult`.
```tsx
export type ActionResult<T = void> = 
  | { success: true; data: T } 
  | { success: false; error: string };
```

## 18. Продвинутая работа с БД (Advanced DB)

### 18.1 Транзакции (Transactions)
Любое изменение данных, затрагивающее более одной записи или таблицы (например, создание заказа + списание склада), **ДОЛЖНО** выполняться внутри транзакции.
```tsx
await db.transaction(async (tx) => {
  await tx.insert(orders).values(...);
  await tx.update(inventoryItems).set(...);
});
```

### 18.2 Атомарные обновления (Counters)
Для обновления счетчиков (остатки, количество) используйте SQL-выражения, чтобы избежать race conditions.
- **❌ НЕПРАВИЛЬНО:** `quantity: item.quantity - 1` (умножение данных в JS).
- **✅ ПРАВИЛЬНО:** 
```tsx
await tx.update(inventoryItems)
  .set({ quantity: sql`${inventoryItems.quantity} - 1` })
  .where(eq(inventoryItems.id, id));
```
