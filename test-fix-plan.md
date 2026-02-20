# План исправлений после тестирования

**Дата:** 21.02.2026
**Упавших тестов:** 124

---

## 1. таблица заказов адаптируется

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/adaptive.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: .crm-table, .crm-card, text=Заказы >> nth=0
Expected: visible
Error: Unexpected token "=" while parsing css selector ".crm-table, .crm-card, text=Заказы". Did you mean to CSS.escape it?

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for .crm-table, .crm-card, text=Заказы >> nth=0[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 2. Loads /admin-panel successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 3. Loads /admin-panel/roles successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 4. визуальный снимок дашборда

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/adaptive.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Главная</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 5. Loads /admin-panel/departments successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 6. Loads /admin-panel/monitoring successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 7. Loads /admin-panel/notifications successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, form').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, form').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 8. Loads /admin-panel/branding successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, form').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, form').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 9. Loads /admin-panel/storage successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 10. Loads /dashboard successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/dashboard-core.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('text=/Добро пожаловать|Главная/i').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('text=/Добро пожаловать|Главная/i').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Главная</h1>[22m
[2m      - unexpected value "hidden"[
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 11. Loads /dashboard/clients successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/dashboard-core.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, table, .crm-table').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Клиенты</h1>[22m
[2m      - unexpected va
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 12. Loads /dashboard/clients/new successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/dashboard-core.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, form').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, form').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Клиенты</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 13. Loads /dashboard/orders successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/dashboard-core.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, table, .crm-table').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Заказы</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 14. Loads /dashboard/orders/new successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/dashboard-core.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, form').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, form').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Заказы</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 15. Loads /dashboard/finance successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 16. Loads /dashboard/finance/salary successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 17. Loads /dashboard/finance/sales successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 18. Loads /dashboard/finance/promocodes successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, table, .crm-table').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected v
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 19. Loads /dashboard/finance/expenses successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 20. Loads /dashboard/finance/funds successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 21. Loads /dashboard/finance/pl successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 22. Loads /dashboard/production successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Производство</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 23. Loads /dashboard/tasks successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Задачи</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 24. Loads /dashboard/design successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Дизайн</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 25. Loads /dashboard/knowledge-base successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">База знаний</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 26. Loads /dashboard/references successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 27. Loads /dashboard/profile successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, form').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, form').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 28. Loads /dashboard/warehouse successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, table, .crm-table').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected valu
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 29. Loads /dashboard/warehouse/categories successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 30. Loads /dashboard/warehouse/items/new successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, form').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, form').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 31. Loads /dashboard/warehouse/characteristics successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 32. Loads /dashboard/warehouse/archive successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, table, .crm-table').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected valu
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 33. таблица заказов адаптируется

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/adaptive.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: .crm-table, .crm-card, text=Заказы >> nth=0
Expected: visible
Error: Unexpected token "=" while parsing css selector ".crm-table, .crm-card, text=Заказы". Did you mean to CSS.escape it?

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for .crm-table, .crm-card, text=Заказы >> nth=0[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 34. Loads /dashboard/warehouse/storage successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 35. Loads /dashboard/warehouse/history successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, table, .crm-table').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected valu
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 36. визуальный снимок дашборда

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/adaptive.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Главная</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 37. Loads /admin-panel successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 38. Loads /admin-panel/roles successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 39. Loads /admin-panel/notifications successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, form').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, form').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 40. Loads /admin-panel/departments successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 41. Loads /admin-panel/monitoring successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 42. Loads /admin-panel/storage successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 43. Loads /dashboard/clients/new successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/dashboard-core.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, form').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, form').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Клиенты</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 44. Loads /dashboard/clients successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/dashboard-core.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, table, .crm-table').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Клиенты</h1>[22m
[2m      - unexpected va
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 45. Loads /dashboard/orders/new successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/dashboard-core.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, form').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, form').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Заказы</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 46. Loads /dashboard/finance/transactions successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, table, .crm-table').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected v
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 47. Loads /dashboard/finance/promocodes successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, table, .crm-table').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected v
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 48. Loads /dashboard/finance/expenses successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 49. Loads /dashboard/finance/sales successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 50. Loads /dashboard/finance/salary successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 51. Loads /dashboard/finance/funds successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 52. Loads /dashboard/production successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Производство</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 53. Loads /dashboard/finance/pl successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 54. Loads /dashboard/tasks successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Задачи</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 55. Loads /dashboard/design successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Дизайн</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 56. Loads /dashboard/knowledge-base successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">База знаний</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 57. Loads /dashboard/references successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 58. Loads /dashboard/warehouse/storage successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 59. таблица заказов адаптируется

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/adaptive.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: .crm-table, .crm-card, text=Заказы >> nth=0
Expected: visible
Error: Unexpected token "=" while parsing css selector ".crm-table, .crm-card, text=Заказы". Did you mean to CSS.escape it?

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for .crm-table, .crm-card, text=Заказы >> nth=0[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 60. визуальный снимок дашборда

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/adaptive.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mpage[39m[2m).[22mtoHaveScreenshot[2m([22m[32mexpected[39m[2m)[22m failed

  Expected an image 390px by 664px, received 390px by 2633px. 159665 pixels (ratio 0.16 of all image pixels) are different.

  Snapshot: dashboard.png

Call log:
[2m  - Expect "toHaveScreenshot(dashboard.png)" with timeout 5000ms[22m
[2m    - verifying given screenshot expectation[22m
[2m  - taking page screenshot[22m
[2m    - disabled all CSS animations[22m
[2m  - waiting for 
```

**Рекомендация:** Визуальные различия. Обнови скриншот или исправь вёрстку.

- [ ] Исправить
- [ ] Проверить повторно

---

## 61. Loads /dashboard/warehouse/history successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, table, .crm-table').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected valu
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 62. Loads /dashboard/warehouse/archive successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, table, .crm-table').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected valu
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 63. Loads /dashboard/orders/new successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/dashboard-core.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('h1, h2, form').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, form').first()[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 64. таблица заказов адаптируется

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/adaptive.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: .crm-table, .crm-card, text=Заказы >> nth=0
Expected: visible
Error: Unexpected token "=" while parsing css selector ".crm-table, .crm-card, text=Заказы". Did you mean to CSS.escape it?

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for .crm-table, .crm-card, text=Заказы >> nth=0[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 65. Loads /admin-panel successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 66. визуальный снимок дашборда

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/adaptive.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Главная</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 67. навигация на мобильном

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/adaptive.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByRole('button', { name: /меню|toggle menu/i }).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for getByRole('button', { name: /меню|toggle menu/i }).first()[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 68. Loads /admin-panel/roles successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 69. Loads /admin-panel/departments successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 70. Loads /admin-panel/monitoring successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 71. Loads /admin-panel/notifications successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, form').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, form').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 72. Loads /admin-panel/branding successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, form').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, form').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 73. Loads /admin-panel/storage successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 74. Loads /dashboard/clients/new successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/dashboard-core.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, form').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, form').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Клиенты</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 75. Loads /dashboard/clients successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/dashboard-core.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, table, .crm-table').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Клиенты</h1>[22m
[2m      - unexpected va
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 76. Loads /dashboard successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/dashboard-core.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('text=/Добро пожаловать|Главная/i').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('text=/Добро пожаловать|Главная/i').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Главная</h1>[22m
[2m      - unexpected value "hidden"[
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 77. Loads /dashboard/orders successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/dashboard-core.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, table, .crm-table').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Заказы</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 78. Loads /dashboard/finance/promocodes successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, table, .crm-table').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected v
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 79. Loads /dashboard/orders/new successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/dashboard-core.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, form').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, form').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Заказы</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 80. Loads /dashboard/finance/expenses successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 81. Loads /dashboard/finance/transactions successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, table, .crm-table').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected v
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 82. Loads /dashboard/finance/sales successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 83. Loads /dashboard/finance/salary successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 84. Loads /dashboard/production successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Производство</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 85. Loads /dashboard/finance/funds successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 86. Loads /dashboard/finance/pl successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 87. Loads /dashboard/tasks successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Задачи</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 88. Loads /dashboard/design successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Дизайн</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 89. Loads /dashboard/knowledge-base successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">База знаний</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 90. Loads /dashboard/warehouse/items/new successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, form').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, form').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 91. Loads /dashboard/warehouse/categories successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 92. Loads /dashboard/warehouse successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, table, .crm-table').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected valu
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 93. Loads /dashboard/profile successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, form').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, form').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 94. Loads /dashboard/references successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    6 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 95. Loads /dashboard/warehouse/characteristics successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 96. Loads /dashboard/warehouse/archive successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, table, .crm-table').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected valu
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 97. Loads /dashboard/warehouse/history successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, table, .crm-table').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected valu
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 98. таблица заказов адаптируется

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/adaptive.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: .crm-table, .crm-card, text=Заказы >> nth=0
Expected: visible
Error: Unexpected token "=" while parsing css selector ".crm-table, .crm-card, text=Заказы". Did you mean to CSS.escape it?

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for .crm-table, .crm-card, text=Заказы >> nth=0[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 99. Loads /dashboard/warehouse/storage successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 100. визуальный снимок дашборда

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/adaptive.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Главная</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 101. Loads /admin-panel successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 102. Loads /admin-panel/departments successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 103. Loads /admin-panel/roles successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 104. Loads /admin-panel/notifications successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, form').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, form').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 105. Loads /admin-panel/storage successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 106. Loads /dashboard successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/dashboard-core.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('text=/Добро пожаловать|Главная/i').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('text=/Добро пожаловать|Главная/i').first()[22m
[2m    7 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Главная</h1>[22m
[2m      - unexpected value "hidden"[
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 107. Loads /admin-panel/branding successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, form').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, form').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Админ-панель</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 108. Loads /dashboard/clients/new successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/dashboard-core.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, form').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, form').first()[22m
[2m    7 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Клиенты</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 109. Loads /dashboard/clients successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/dashboard-core.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, table, .crm-table').first()[22m
[2m    6 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Клиенты</h1>[22m
[2m      - unexpected va
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 110. Loads /dashboard/orders successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/dashboard-core.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, table, .crm-table').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Заказы</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 111. Loads /dashboard/finance/funds successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 112. Loads /dashboard/finance/salary successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 113. Loads /dashboard/design successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    7 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Дизайн</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 114. Loads /dashboard/profile successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, form').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, form').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 115. Loads /dashboard/tasks successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Задачи</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 116. Loads /dashboard/knowledge-base successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">База знаний</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 117. Loads /dashboard/references successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">MerchCRM</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 118. Loads /dashboard/warehouse successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, table, .crm-table').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected valu
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 119. Loads /dashboard/warehouse/items/new successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, form').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, form').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 120. Loads /dashboard/warehouse/categories successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 121. Loads /dashboard/warehouse/characteristics successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, .grid').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, .grid').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 122. Loads /dashboard/warehouse/storage successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header').first()[22m
[2m    8 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 123. Loads /dashboard/warehouse/archive successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, table, .crm-table').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected valu
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 124. Loads /dashboard/warehouse/history successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/warehouse-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('h1, h2, .page-header, table, .crm-table').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('h1, h2, .page-header, table, .crm-table').first()[22m
[2m    9 × locator resolved to <h1 class="text-[17px] font-bold text-slate-900 tracking-tight">Склад</h1>[22m
[2m      - unexpected valu
```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

