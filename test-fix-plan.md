# План исправлений после тестирования

**Дата:** 20.02.2026
**Упавших тестов:** 1

---

## 1. Попытка открыть модалку создания задачи

**Файл:** `/Users/leonidmolchanov/Desktop/merch-crm/e2e/modules/tasks.spec.ts`

**Ошибка:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByRole('dialog').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for getByRole('dialog').first()[22m

```

**Рекомендация:** Элемент не отображается. Проверь условия рендеринга или роутинг.

- [ ] Исправить
- [ ] Проверить повторно

---

