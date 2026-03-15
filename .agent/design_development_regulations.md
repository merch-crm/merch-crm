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
# MerchCRM UX Standards

> Единый источник истины для дизайна и визуальных правил интерфейса.
> Последнее обновление: 16.02.2026

---

## 🔝 Приоритеты (для AI)
1. **БИБЛИОТЕКА ПРЕЖДЕ ВСЕГО**: ВСЕГДА проверяй директории `@/components/ui/` и `@/components/layout/` перед созданием нового компонента. Переиспользуй существующие UI-примитивы.
2. **РЕГИСТР**: НИКОГДА не используй `uppercase` в текстовом контенте (заголовки, кнопки, метки).
3. **КОМПАКТНОСТЬ**: Мы стремимся к высокой плотности данных без потери читаемости.

---

## 📐 Основы (Foundations)

### Отступы (Spacing)
Интерфейс строится по сетке 4px.

| Свойство | Значение | Tailwind | Описание |
| :--- | :--- | :--- | :--- |
| **Главный/Внешний Gap** | 12px | `gap-3` / `space-y-3` | Стандарт! Между крупными блоками, секциями внутри карточки |
| **Внутренний Gap** | 8px | `gap-2` / `space-y-2` | Между элементами внутри группы (инпуты, статы) |
| **Микро Gap** | 4-6px | `gap-1`, `gap-1.5` | Между иконкой и текстом, внутри бейджей |
| **Паддинг (Card)** | 24px | `p-6` | Стандарт для контента внутри всех карточек и диалогов |

> **Важно**: Мы полностью отказались от `gap-4/6/8` и `space-y-4/6/8` в пользу более компактного расположения элементов (`space-y-3`, `gap-3`). Это единый стандарт для всего проекта.

### Скругления (Border Radius)
Радиус зависит от размера элемента. Это обеспечивает визуальную консистентность.

| Категория | Высота элемента | Радиус | Tailwind | Примеры |
|-----------|-----------------|--------|----------|---------|
| **XL** | > 280px | 16px | `rounded-2xl` | Hero-карточки, большие модалки, таблицы |
| **L** | 150–280px | 12px | `rounded-xl` | Стандартные карточки, диалоги |
| **M** | 80–150px | 8px | `rounded-lg` | Action-карточки, компактные блоки |
| **S** | < 80px | 6px | `rounded-md` | Кнопки (DEFAULT), инпуты, бейджи |

#### 📐 Правило вложенности (Nesting Rule)
Внутренний элемент всегда должен иметь радиус меньше, чем родитель.
- **Принцип**: `inner_radius = outer_radius - padding`.
- ✅ Карточка (`rounded-xl`, 12px) → Кнопка внутри (`rounded-md`, 6px).
- ❌ Карточка (`rounded-xl`, 12px) → Кнопка внутри (`rounded-xl`, 12px).

#### 🤖 Инструкции для AI (Radius Implementation)
1. **Оцени высоту** блока (XL, L, M или S).
2. **Выбери радиус** по таблице.
3. **Для вложенных элементов** используй радиус на 1–2 уровня меньше родительского.

---

## 🎨 Цвета и Типографика

### Палитра
- **Акцентный**: `#5d00ff` (`--primary`). Применяется для главных действий и состояний.
- **Фон**: `#f8fafc` (`--background`). Чистый, светлый фон.
- **Текст**: `#0f172a` (Primary), `#64748b` (Secondary).

### Типографика
- **Шрифт**: Manrope (основной).
- **Кавычки**: Всегда «ёлочки».
- **Регистр**: **Запрещен `uppercase`**. Используйте обычный регистр.

### Динамический контраст (Светлое/Темное)
При использовании динамических цветов (индикаторы цвета товара, метки категорий) необходимо автоматически подбирать контрастный цвет для иконок или текста.

```typescript
const isLightColor = (hex: string) => {
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.65;
};
```

Правила:
1. Не задавайте цвет иконки вручную для динамических подложек.
2. Порог яркости: `0.65`.
3. Эффект объёма: на светлых цветах — тёмные внутренние тени, на тёмных — светлые.

### Метки Полей (Field Labels)
- **Стиль**: `text-sm`, `font-bold`, `text-slate-700`, `ml-1`.

---

## 📦 Компоненты

### 🤖 Обязательные компоненты (Mandatory)
**Путь**: `@/components/ui/` и `@/components/layout/`
AI обязан использовать эти компоненты вместо кастомной верстки:

1. **`ResponsiveModal`**: Для всех диалогов.
2. **`SubmitButton`**: Для всех форм (вместо обычной кнопки).
3. **`Select`**: Для всех выпадающих списков.
4. **`ConfirmDialog`**: Для подтверждения удаления или опасных действий.
5. **`CardHeader`**: Для заголовков внутри карточек.
6. **`ResponsiveDataView`**: Для адаптивных таблиц (десктоп + мобильные карточки).
7. **`DataTable`**: Универсальная таблица с сортировкой и фильтрами (вместо ручной верстки `table`).
8. **`Skeleton*`**: Готовые скелетоны (`SkeletonTable`, `SkeletonCard`, `SkeletonForm`) для состояний загрузки.
9. **`Spinner*`**: Индикаторы загрузки (`Spinner`, `LoadingOverlay`, `LoadingBlock`).
10. **`Progress*`**: Прогресс-бары и шаги (`Progress`, `StepsProgress`, `FileUploadProgress`).
11. **`Tooltip*`**: Подсказки (`Tooltip`, `TooltipRich`, `TooltipIcon`).
12. **`Slider*`**: Ползунки (`Slider`, `RangeSlider`, `PriceRangeSlider`, `QuantitySlider`).
13. **`Radio*`**: Выбор опций (`RadioGroup`, `RadioCards`, `RadioSegments`).
14. **`DateRangePicker`**: Выбор периода (`DateRangePicker`, `DateRangePickerWithPresets`).
15. **`FileUpload`**: Загрузка файлов (`FileUpload`, `ImageUpload`, `ImageGalleryUpload`).
16. **`Accordion*`**: Аккордеоны (`Accordion`, `AccordionCards`, `AccordionFAQ`, `AccordionSettings`).
17. **`ScrollArea*`**: Кастомные скроллбары (`ScrollArea`, `ScrollAreaTable`, `ScrollAreaHorizontalList`).
18. **`TimeTracker`**: Учет времени (`TimeTracker`, `TimeTrackerWidget`, `TimeTrackerCompact`).
19. **`StatusTimeline`**: История статусов (`StatusTimeline`, `StatusTimelineHorizontal`, `StatusTimelineCard`).
20. **`DeliveryTracker`**: Отслеживание доставки (`DeliveryTracker`, `DeliveryTrackerCompact`, `DeliveryBadge`).
21. **`PriceBreakdown`**: Калькуляция стоимости (`PriceBreakdown`, `ProductPriceCalculator`, `PriceComparison`).
22. **`OrderQueueCard`**: Карточка в очереди (`OrderQueueCard`, `OrderQueueCardCompact`, `OrderQueueCardDetailed`, `OrderKanbanCard`).

### Классы для Карточек и Bento-бокс элементов (Cards)
Все крупные визуальные блоки-виджеты на страницах дашборда (Bento grid) должны иметь единый внешний вид и поведение теней, чтобы выглядеть как операционная система:

1. **Базовый класс `crm-card`**: Обязателен для всех внешних виджетов-блоков.
    - Включает в себя правильное скругление (`rounded-[24px]`/`rounded-2xl`), отступы внутри (`p-6`), тени и цвет фона. На мобильных устройствах радиус плавно уменьшается (`max-sm:rounded-[20px]`).
    - Использовать так: `<div className="crm-card">...</div>`
2. **Внутреннее разделение блоков**: Если виджет состоит из шапки с заголовком и внутреннего контента, внутренний контент часто изолируется серым фоном.
    - Разделитель (горизонтальная линия во всю ширину карточки, игнорирующая паддинг): `<div className="card-breakout border-b border-slate-100" />`
    - Радиус внутренних серых блоков (`bg-slate-50` и др.) должен использовать переменную радиуса: `rounded-[var(--radius-inner)]` или `rounded-[calc(var(--radius)-8px)]`.
3. Обязательно добавлять анимацию появления и ховера для кликабельных виджетов: `hover:shadow-md transition-shadow duration-300`.

### Кнопки (Button)
- **Иконки**: Все основные кнопки действий (Сохранить, Создать, Переместить) **обязательно** должны содержать иконку.
- **Скругление**: По умолчанию `rounded-md`.
- **Анимации**: При создании новых страниц или крупных блоков добавляйте `animate-in fade-in duration-500`.
- **Адаптивный текст**: Текст скрывается на мобильном, иконка остаётся: `<span className="hidden sm:inline">Добавить</span>`.

### Select (выпадающие списки)
Компонент автоматически определяет оптимальный layout:

| Опций | Средняя длина текста | Layout |
|-------|---------------------|--------|
| 1-3 | любая | Вертикальный список |
| 4-8 | ≤ 10 символов | Grid 2 колонки |
| 9-15 | ≤ 4 символов | Grid 3 колонки |
| 16+ | любая | Вертикальный список + поиск |

```tsx
// Автоматический layout (по умолчанию)
<Select options={options} value={value} onChange={onChange} />
// Принудительный grid 2 колонки
<Select options={options} value={value} onChange={onChange} gridColumns={2} />
```

### Диалоги и Модальные окна
Используем `ResponsiveModal` для всех всплывающих окон.
- **Закрытие**: Системная кнопка закрытия предоставляется компонентом автоматически. **НЕ добавляйте** вторую ручную кнопку X.

**Стандарт футера (Ideal Footer Style):**
Используйте проп `footer` для изоляции логики подвала. Это обеспечивает липкость (sticky) и правильные отступы.

```tsx
<ResponsiveModal
  title="Название"
  footer={
    <div className="dialog-footer">
      <Button variant="ghost" className="text-rose-500 hover:text-rose-600">Удалить</Button>
      <div className="dialog-footer-actions">
        <Button variant="ghost" onClick={onClose}>Отмена</Button>
        <SubmitButton icon={<Check />} label="Сохранить" />
      </div>
    </div>
  }
>
  <div className="space-y-4">
    {/* Контент */}
  </div>
</ResponsiveModal>
```

#### Структура диалога (ручная, если без пропа footer):
```tsx
<ResponsiveModal isOpen={isOpen} onClose={onClose}>
    <div className="flex flex-col h-full overflow-hidden">
        {/* Header - НЕ скроллится */}
        <div className="p-6 pb-2 shrink-0">...</div>
        
        {/* Content - СКРОЛЛИТСЯ */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
            <form className="space-y-4">...</form>
        </div>
        
        {/* Footer - НЕ скроллится, закреплён внизу */}
        <div className="sticky bottom-0 z-10 p-5 pt-3 flex flex-row items-center justify-between gap-3 shrink-0 bg-white border-t border-slate-100">
            <button className="h-11 flex-1 w-0 lg:flex-none lg:w-auto lg:px-8 px-4">Отмена</button>
            <Button className="h-11 flex-1 w-0 lg:flex-none lg:w-auto lg:px-10 px-4 btn-dark rounded-[var(--radius-inner)]">Сохранить</Button>
        </div>
    </div>
</ResponsiveModal>
```

Ключевые моменты:
1. Родительский контейнер: `flex flex-col h-full overflow-hidden`.
2. Скроллящаяся область: `flex-1 overflow-y-auto`.
3. Футер: `sticky bottom-0 shrink-0`.
4. Кнопки: `flex-1 w-0` — равная ширина (50/50).

---

## 📊 Работа с таблицами

- **Скругление**: `rounded-2xl` (таблица как XL-элемент, высота > 280px).
- **Чек-боксы**: Каждая таблица ДОЛЖНА иметь колонку с чек-боксами для массового выбора.
- **Пагинация**: Использовать `Pagination` из `@/components/ui/pagination`.
- **Адаптивность**: Каждая таблица ДОЛЖНА иметь мобильный вид (карточки). Использовать `ResponsiveDataView` с `renderTable` + `renderCard`, или `hidden md:block` + `md:hidden`.

```tsx
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";

<ResponsiveDataView
    data={items}
    mobileGridClassName="flex flex-col divide-y divide-slate-100 md:hidden"
    desktopClassName="hidden md:block"
    renderTable={() => (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>...</thead>
                <tbody>{items.map(item => <tr key={item.id}>...</tr>)}</tbody>
            </table>
        </div>
    )}
    renderCard={(item) => (
        <div key={item.id} className="p-4">{/* Карточка */}</div>
    )}
/>
```

---

## 🎯 Панели быстрых действий (Bulk Actions Panel)

Все панели массовых действий должны иметь одинаковый дизайн:
- **Расположение**: `fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]`.
- **Контейнер**: `bg-white/90`, `backdrop-blur-3xl`, `rounded-full` (pill), `p-2.5 px-8`, `gap-4/6`.
- **Анимация**: `animate-in slide-in-from-bottom-10 fade-in duration-500`.
- **Счетчик**: `w-10 h-10 rounded-full bg-primary text-white shadow-lg shadow-primary/20`.
- **Кнопки**: `rounded-full`, `hover:bg-slate-100`, `transition-all`.
- **Разделители**: `w-px h-8 bg-slate-200`.

```tsx
<div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center bg-white/90 backdrop-blur-3xl p-2.5 px-8 gap-6 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-10 fade-in duration-500 border border-slate-200/60">
    <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20 text-white">
            {selectedIds.length}
        </div>
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Выбрано</span>
    </div>
    <div className="w-px h-8 bg-slate-200 mx-2" />
    <button className="flex items-center gap-2 px-4 py-2.5 rounded-full hover:bg-slate-100 transition-all group">
        <Icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
        <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Действие</span>
    </button>
</div>
```

---

## 🔍 Панели фильтров и тулбары (Filter Trays)

- **Контейнер**: `.crm-filter-tray` — `bg-slate-100/50`, `p-1.5`, `rounded-[20px]`, `border border-slate-200/30`, `shadow-inner`.
- **Поиск**: `h-11`, `rounded-[14px]`, `bg-white`, `shadow-sm`, `text-[13px] font-bold`.
- **Табы**: ОБЯЗАТЕЛЬНО `framer-motion` + `layoutId` для анимации перетекающего фона.
  - Активный: `text-white`, `bg-primary`, `shadow-lg shadow-primary/25`.
  - Неактивный: `text-slate-500`, `hover:text-slate-900`.

---

## 📱 Адаптивная вёрстка

> **Весь функционал доступен на ВСЕХ устройствах.** Нет "урезанной" мобильной версии.

### Брейкпоинты

| Префикс | Ширина | Устройства | Способ открытия контента |
|---------|--------|------------|--------------------------|
| (нет) | 0-639px | Телефоны | Bottom Sheet |
| `sm:` | ≥640px | Большие телефоны | Bottom Sheet |
| `md:` | ≥768px | Планшеты | Sheet справа |
| `lg:` | ≥1024px | Ноутбуки | Dialog / inline |
| `xl:` | ≥1280px | Десктопы | Dialog / inline |
| `2xl:` | ≥1536px | Большие мониторы | Dialog / inline |

### Адаптивные сетки
```tsx
// ✅ Правильно — адаптивная сетка
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

// ❌ Неправильно — фиксированная сетка
<div className="grid grid-cols-4 gap-4">
```

---

## 🚫 Антипаттерны

- ❌ Использовать `gap-8` или `space-y-6/8`.
- ❌ Оставлять кнопки без иконок.
- ❌ Использовать `uppercase`.
- ❌ Хардкодить футеры внутри основного контента диалога.
- ❌ `import { Dialog }` из `@/components/ui/dialog` — используй `ResponsiveModal`.
- ❌ `<table>` без мобильной альтернативы — используй `ResponsiveDataView`.
- ❌ `grid-cols-N` без `grid-cols-1` базы.
- ❌ Фиксированная ширина (`w-[500px]`) — используй `w-full max-w-[500px]`.

### Чеклист перед коммитом
- [ ] Все модальные окна используют `ResponsiveModal`
- [ ] Все таблицы имеют мобильный вид (карточки)
- [ ] Все сетки начинаются с `grid-cols-1`
- [ ] Нет фиксированных ширин без `max-w-`
- [ ] Текст кнопок скрыт на мобильном (`hidden sm:inline`)
- [ ] Нет прямых импортов `Dialog` / `DialogContent`

---
**Версия 4.0 (Design System) — 16.02.2026**
