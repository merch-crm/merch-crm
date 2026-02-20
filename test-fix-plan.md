# План исправлений после тестирования

**Дата:** 21.02.2026
**Упавших тестов:** 13

---

## 1. визуальный снимок дашборда

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/adaptive.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mpage[39m[2m).[22mtoHaveScreenshot[2m([22m[32mexpected[39m[2m)[22m failed

  257 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: dashboard.png

Call log:
[2m  - Expect "toHaveScreenshot(dashboard.png)" with timeout 5000ms[22m
[2m    - verifying given screenshot expectation[22m
[2m  - taking page screenshot[22m
[2m    - disabled all CSS animations[22m
[2m  - waiting for fonts to load...[22m
[2m  - fonts loaded[22m
[2m  - 257 pix
```

**Рекомендация:** Визуальные различия. Обнови скриншот или исправь вёрстку.

- [ ] Исправить
- [ ] Проверить повторно

---

## 2. визуальный снимок дашборда

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/adaptive.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mpage[39m[2m).[22mtoHaveScreenshot[2m([22m[32mexpected[39m[2m)[22m failed

  Expected an image 390px by 664px, received 390px by 2633px. 158637 pixels (ratio 0.16 of all image pixels) are different.

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

## 3. Loads /admin-panel/users successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('main').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('main').first()[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 4. Loads /admin-panel/users successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('main').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('main').first()[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 5. навигация на мобильном

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/adaptive.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByRole('button', { name: /меню/i }).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for getByRole('button', { name: /меню/i }).first()[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 6. визуальный снимок дашборда

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/adaptive.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mpage[39m[2m).[22mtoHaveScreenshot[2m([22m[32mexpected[39m[2m)[22m failed

  Expected an image 834px by 1194px, received 834px by 1682px. 345198 pixels (ratio 0.25 of all image pixels) are different.

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

## 7. таблица заказов адаптируется

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/adaptive.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator:  locator('text=ORD-').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('text=ORD-').first()[22m
[2m    9 × locator resolved to <span class="text-sm font-black text-slate-900 truncate">ORD-c7d398</span>[22m
[2m      - unexpected value "hidden"[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 8. Loads /admin-panel/users successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('main').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('main').first()[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 9. Loads /dashboard/finance successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/finance-other.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('main').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('main').first()[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 10. визуальный снимок дашборда

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/adaptive.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mpage[39m[2m).[22mtoHaveScreenshot[2m([22m[32mexpected[39m[2m)[22m failed

  Expected an image 1280px by 720px, received 1280px by 1278px. 283457 pixels (ratio 0.18 of all image pixels) are different.

  Snapshot: dashboard.png

Call log:
[2m  - Expect "toHaveScreenshot(dashboard.png)" with timeout 5000ms[22m
[2m    - verifying given screenshot expectation[22m
[2m  - taking page screenshot[22m
[2m    - disabled all CSS animations[22m
[2m  - waiting fo
```

**Рекомендация:** Визуальные различия. Обнови скриншот или исправь вёрстку.

- [ ] Исправить
- [ ] Проверить повторно

---

## 11. Loads /admin-panel/users successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('main').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('main').first()[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

## 12. визуальный снимок дашборда

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/adaptive.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mpage[39m[2m).[22mtoHaveScreenshot[2m([22m[32mexpected[39m[2m)[22m failed

  Expected an image 1280px by 720px, received 1280px by 1272px. 254345 pixels (ratio 0.16 of all image pixels) are different.

  Snapshot: dashboard.png

Call log:
[2m  - Expect "toHaveScreenshot(dashboard.png)" with timeout 5000ms[22m
[2m    - verifying given screenshot expectation[22m
[2m  - taking page screenshot[22m
[2m    - disabled all CSS animations[22m
[2m  - waiting fo
```

**Рекомендация:** Визуальные различия. Обнови скриншот или исправь вёрстку.

- [ ] Исправить
- [ ] Проверить повторно

---

## 13. Loads /admin-panel/users successfully

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/ui/admin-pages.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('main').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('main').first()[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

