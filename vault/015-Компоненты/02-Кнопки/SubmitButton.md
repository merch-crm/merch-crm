---
title: SubmitButton
description: Специализированная кнопка для отправки форм.
---

# SubmitButton

`SubmitButton` — это обертка над [[Button]], предназначенная для использования внутри форм. Она автоматически интегрируется с React `useFormStatus` и управляет состоянием загрузки.

## Импорт

```tsx
import { SubmitButton } from "@/components/ui/submit-button";
```

## Свойства (Props)

Наследует все свойства [[Button]], а также:

| Свойство | Тип | Описание |
|---|---|---|
| `text` | `string` | Текст кнопки (когда не загружается). |
| `loadingText` | `string` | Текст кнопки во время загрузки (по умолчанию "Загрузка..."). |
| `isLoading` | `boolean` | (Опционально) Ручное управление загрузкой. |

## Почему использовать SubmitButton?

1. **Автоматизация**: Он автоматически становится `disabled`, если `pending` из `useFormStatus()` равен `true`.
2. **Консистентность**: Гарантирует, что все кнопки отправки выглядят одинаково и имеют спиннеры.
3. **Безопасность**: Предотвращает множественные клики (double submission) во время отправки формы.

## Пример использования

```tsx
import { SubmitButton } from "@/components/ui/submit-button";

export function ProfileForm() {
  return (
    <form action={updateProfile}>
      <input name="name" />
      <SubmitButton 
        color="dark" 
        text="Сохранить профиль" 
      />
    </form>
  );
}
```
