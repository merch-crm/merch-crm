---
название: "Аутентификация-Better-Auth"
дата: 2026-03-31
обновлено: 2026-03-31
статус: активный
tags: 
  - решение
  - безопасность
  - аутентификация
---

# Аутентификация через Better-Auth

## Проблема
Необходима система аутентификации с поддержкой 2FA, управлением сессиями в БД (а не в JWT), RBAC и импесонацией пользователей для поддержки.

## Решение
Используется `better-auth` с Drizzle-адаптером для PostgreSQL.

### Конфигурация (`lib/auth.ts`)
```
better-auth
  ├── drizzleAdapter (PostgreSQL)
  ├── emailAndPassword (Argon2 хеширование)
  ├── plugins:
  │   ├── nextCookies() — интеграция с Next.js
  │   ├── twoFactor({ issuer: "MerchCRM" }) — TOTP 2FA
  │   └── admin({ impersonationSessionDuration: 1h }) — импесонация
  └── session:
      ├── expiresIn: 7 дней
      ├── updateAge: 1 день
      └── cookieCache: 5 минут
```

### Обогащение сессии (`lib/session.ts`)
Стандартная сессия better-auth содержит только `id`, `email`, `name`. Нам нужны ещё роль и отдел. Решение — **кеширование профиля в Redis**:

```typescript
const getSession = cache(async () => {
    const { session, user } = await auth.api.getSession({ headers });
    
    // Кеш профиля на 5 минут, чтобы не делать JOIN на каждый запрос
    const dbUser = await redisCache.getOrSet(
        `user-profile:${user.id}`,
        () => db.query.users.findFirst({ with: { role: true, department: true } }),
        { ttl: 300 }
    );
    
    return { id, email, name, roleName, departmentName, ... };
});
```

### Безопасность куки
- `httpOnly: true` — JavaScript не видит куку
- `sameSite: "lax"` — защита от CSRF
- `secure: true` в production — только HTTPS
- Кастомное имя: `merch_crm_session`

## Файлы
- `lib/auth.ts` — конфигурация Better-Auth
- `lib/session.ts` — обогащённая сессия с Redis-кешем
- `lib/password.ts` — хеширование Argon2

---
[[030-Модули/04-Система-и-Финансы/Роли-и-Права|← Роли и Права]]
