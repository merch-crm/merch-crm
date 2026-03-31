---
название: "CSP-и-Безопасность-Заголовков"
дата: 2026-03-31
обновлено: 2026-03-31
статус: активный
теги:
  - решение
  - безопасность
---

# CSP и Безопасность Заголовков

## Проблема
Приложение работает с пользовательским контентом (дизайны, изображения, файлы). Необходимо защитить от XSS, Clickjacking и MitM-атак без поломки функциональности.

## Решение
Двойной уровень защиты: **middleware (динамический nonce)** + **next.config.ts (статические заголовки)**.

### Middleware (`middleware.ts`)
Генерирует уникальный `nonce` для каждого запроса:
```
script-src 'self' 'nonce-{random}' 'strict-dynamic'
```
Это разрешает выполнение только тех скриптов, которые имеют правильный `nonce`. Сторонние инъекции блокируются.

### Next.config.ts — статические заголовки
```
X-Frame-Options: DENY          — запрет встраивания в iframe
X-Content-Type-Options: nosniff — запрет подмены MIME
X-XSS-Protection: 1; mode=block
HSTS: max-age=31536000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
```

### Исключения
- Калькуляторы (`/dashboard/production/calculators`) исключены из middleware — они используют WebGL Workers, которым нужен `blob:` без nonce.
- В dev-режиме разрешены WebSocket-соединения (`ws: wss:`) для HMR.

## Файлы
- `middleware.ts` — генерация nonce и динамический CSP
- `next.config.ts` → `headers()` — статические заголовки безопасности

---
[[010-Стандарты/Безопасность|← Стандарт безопасности]]
