---
название: "Инфраструктура CI/CD"
tags:
  - архитектура
  - devops
  - github-actions
---

# 🚀 Инфраструктура CI/CD

Система автоматизации MerchCRM построена на базе GitHub Actions и Docker, обеспечивая безопасное внесение изменений и детерминированное развертывание.

## 1. Схема Пайплайна

```mermaid
flowchart TD
    subgraph Local[Локальная разработка]
        L1[Изменение схемы/кода] --> L2[npm run db:generate]
        L2 --> L3[git commit & push]
    end

    subgraph GitHub[GitHub Infrastructure]
        L3 --> PR[Pull Request]
        PR --> CI[ci.yml: ci-check]
        CI -->|Lint/Type/Test| PR_Approve[Approval & Merge]
        
        PR_Approve --> Push_Main[Push to main]
        Push_Main --> Deploy[deploy.yml]
        
        subgraph Deploy_Jobs[Jobs: deploy.yml]
            D1[Check: tests] --> D2[Build: Docker Images]
            D2 --> D3[Push: GHCR Registry]
            D3 --> D4[Execute: SSH Deploy]
        end
    end

    subgraph Prod[Production Server]
        D4 --> S1[Docker Compose Pull]
        S1 --> S2[Migrator Container]
        S2 -->|Applying SQL| DB[(PostgreSQL)]
        S2 -->|Success| S3[App Container]
    end
```

## 2. Workflows

### CI Checks (`ci.yml`)
Запускается при каждом Pull Request в ветку `main`.
- **Задачи**: `lint`, `type-check`, `vitest`.
- **База**: Поднимает временные PostgreSQL и Redis в Docker для тестов.
- **Блокировка**: Настроена Branch Protection — мердж невозможен без прохождения всех статус-чеков.

### Deploy (`deploy.yml`)
Запускается при пуше в `main`.
- **Этапы**:
  1. **Check**: Финальный прогон тестов.
  2. **Build-and-push**: Сборка двух образов (`merch-crm` и `merch-crm-migrator`).
  3. **Deploy**: Вызов SSH-команд на сервере для обновления контейнеров.

## 3. Механизм Миграций

Вместо опасного `drizzle-kit push` используется двухэтапный процесс:

### Этап 1: Генерация (Local)
Разработчик создает SQL-файл миграции локально:
```bash
npm run db:generate
```

### Этап 2: Применение (Docker)
На сервере запускается микро-сервис `migrator`:
- **Образ**: `ghcr.io/merch-crm/merch-crm-migrator`.
- **Скрипт**: `scripts/db-migrate.ts`.
- **Особенности**:
  - Использует `tsx` для выполнения TypeScript.
  - Ждет готовности БД.
  - Прогоняет все новые файлы из `/drizzle`.

## 4. Полезные команды

- **Просмотр логов деплоя**: Вкладка "Actions" на GitHub.
- **Проверка статуса миграций на сервере**:
  ```bash
  docker logs merch-crm-migrate
  ```

---
[[020-Архитектура/Deploy|К руководству по развертыванию]] | [[Merch-CRM|В начало]]
