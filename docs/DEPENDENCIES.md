# Зависимости проекта MerchCRM

## Основные зависимости

### Фреймворк и UI
- `next` ^14.x — React фреймворк
- `react` ^18.x — UI библиотека
- `tailwindcss` ^3.x — CSS фреймворк

### База данных
- `drizzle-orm` — ORM для PostgreSQL
- `drizzle-kit` — Утилиты для миграций
- `pg` — PostgreSQL драйвер

### Аутентификация
- `better-auth` — Библиотека аутентификации

### UI компоненты
- `@radix-ui/*` — Примитивы для UI
- `lucide-react` — Иконки
- `class-variance-authority` — Утилита для вариантов классов
- `clsx` — Утилита для классов
- `tailwind-merge` — Слияние Tailwind классов

### Формы и валидация
- `react-hook-form` — Управление формами
- `zod` — Валидация схем
- `@hookform/resolvers` — Резолверы для react-hook-form

### Drag and Drop
- `@dnd-kit/core` — Ядро DnD
- `@dnd-kit/sortable` — Сортируемые списки
- `@dnd-kit/utilities` — Утилиты DnD

### Файлы и изображения
- `react-dropzone` — Загрузка файлов drag-and-drop
- `sharp` — Обработка изображений (WebP конвертация)
- `uuid` — Генерация UUID

### PDF генерация
- `jspdf` — Генерация PDF
- `jspdf-autotable` — Таблицы в PDF
- `qrcode` — Генерация QR-кодов

## Dev зависимости

### TypeScript
- `typescript` ^5.x
- `@types/react`
- `@types/node`
- `@types/uuid`
- `@types/qrcode`

### Тестирование
- `vitest` — Тест-раннер
- `@testing-library/react` — Тестирование React
- `msw` — Мокирование API

### Линтинг
- `eslint`
- `eslint-config-next`
- `prettier`

## Установка всех зависимостей

```bash
# Основные
npm install next react react-dom tailwindcss postcss autoprefixer
npm install drizzle-orm pg better-auth
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-switch @radix-ui/react-slider @radix-ui/react-tooltip @radix-ui/react-checkbox @radix-ui/react-accordion @radix-ui/react-tabs @radix-ui/react-alert-dialog @radix-ui/react-popover
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install react-hook-form zod @hookform/resolvers
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install react-dropzone sharp uuid
npm install jspdf jspdf-autotable qrcode

# Dev
npm install -D typescript @types/react @types/node @types/uuid @types/qrcode
npm install -D vitest @testing-library/react @testing-library/jest-dom msw
npm install -D eslint eslint-config-next prettier
npm install -D drizzle-kit
```
