# 🚀 Merch-CRM (Unified v3.0)

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-yellow?logo=drizzle)](https://orm.drizzle.team/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.5-blue)](https://better-auth.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: Private](https://img.shields.io/badge/License-Private-red.svg)](#)

**Merch-CRM** — это высокопроизводительная ERP/CRM система нового поколения, разработанная специально для производственных компаний в сфере печати и производства мерча. Система объединяет управление производством, складской учет 2.0, финансовую аналитику и продвинутые инструменты дизайна.

---

## ✨ Основные модули

### 🏭 Производство и Логистика
- **Учет времени работы**: Точный замер трудозатрат сотрудников (`presence`).
- **Журнал брака**: Фиксация дефектов и автоматическое списание бланков.
- **Версионность макетов**: Полная история изменений макетов с хранением в S3.
- **Живая очередь**: Визуализация производственного процесса для цеха.

### 📦 Склад 2.0
- **Мульти-локации**: Управление остатками на разных складах (Цех, Витрина, Основной).
- **Аудит транзакций**: Детальный лог всех перемещений и списаний.
- **Критические остатки**: Автоматические уведомления о необходимости закупок.

### 📊 Финансы и Аналитика
- **P&L Отчет**: Детальный мониторинг прибылей и убытков.
- **RFM-анализ**: Сегментация клиентской базы для маркетинга.
- **LTV Мониторинг**: Расчет жизненного цикла ценности каждого клиента.
- **Расчет зарплат**: Автоматизация сдельной оплаты труда.

### 🔐 Безопасность и Персонал
- **Better Auth Integration**: Сессии в БД, надежная защита и гибкие роли.
- **2FA (TOTP)**: Двухфакторная аутентификация через Google Authenticator.
- **Presence Hardware**: Интеграция с оборудованием для распознавания присутствия на рабочих местах.

### 🎨 Дизайн и Редактор
- **Встроенный редактор**: Управление проектами и экспортами на базе Fabric.js.
- **3D Визуализация**: Предпросмотр изделий с использованием Three.js и Fiber.

---

## 🛠 Технологический стек

- **Core**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [PostgreSQL](https://www.postgresql.org/) + [Redis](https://redis.io/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Auth**: [Better Auth](https://better-auth.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **Components**: Radix UI
- **Storage**: AWS S3 / Local Storage
- **Emails**: [Resend](https://resend.com/)

---

## 🚀 Быстрый старт

### Требования
- Node.js 20+
- PostgreSQL
- Redis (для сессий и кэширования)

### Установка
```bash
# Клонирование репозитория
git clone <your-repo-url>
cd merch-crm

# Установка зависимостей
npm install
```

### Настройка окружения
Создайте файл `.env.local` на основе `.env.example` и заполните необходимые переменные.

### Запуск в режиме разработки
```bash
# Стандартный запуск
npm run dev

# Запуск с SSH туннелем до удаленной БД
npm run dev:ssh
```

---

## 📁 Структура проекта

- `/app` — Роутинг и страницы (Next.js App Router).
- `/components` — Общие UI компоненты и сложные виджеты.
- `/lib` — Ядро системы:
  - `/lib/schema` — Схемы базы данных (Drizzle).
  - `/lib/auth` — Конфигурация Better Auth.
- `/vault` — **Obsidian Knowledge Vault**. Вся проектная документация, стандарты и роадмап.
- `/scripts` — Утилитные скрипты для миграций, аудита и автоматизации.

---

## 🧪 Тестирование и Качество

Мы поддерживаем высокие стандарты качества кода:
- **Unit**: `npm run test` (Vitest)
- **E2E**: `npm run test:e2e` (Playwright)
- **Audit**: `npm run audit` (Кастомный скрипт технической проверки)
- **Security**: `npm run security:audit` (Ship-safe)

---

## 📚 Документация
Вся подробная техническая документация находится в папке `/vault`. 
Рекомендуется использовать [Obsidian](https://obsidian.md/) для удобной навигации по модулям, архитектурным решениям и роадмапу.

---
© 2026 Merch-CRM Team. Private Property.

# CI Test
This is a test commit to trigger GitHub Actions.
