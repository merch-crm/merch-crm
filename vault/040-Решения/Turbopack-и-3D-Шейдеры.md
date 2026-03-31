---
название: "Turbopack-и-3D-Шейдеры"
дата: 2026-03-31
обновлено: 2026-03-31
статус: активный
теги:
  - решение
  - bugfix
  - 3д
---

# Turbopack и конфликт 3D-шейдеров

## Проблема
При сборке с Turbopack (Next.js dev) модуль `troika-three-text` вызывал критическую ошибку:
```
WebGLProgram: Shader Error 0 - VALIDATE_STATUS false
ERROR: 0:75: 'troika_position_1' : redefinition
ERROR: 0:642: 'uTroikaSDFTextureSize' : redefinition
```
Библиотека `troika` динамически модифицирует шейдеры Three.js, вставляя свои uniform/attribute-переменные. Turbopack при tree-shaking дублировал эти вставки.

## Решение
Добавить все 3D-библиотеки в `transpilePackages` в `next.config.ts`:

```typescript
transpilePackages: [
    "three",
    "@react-three/drei", 
    "@react-three/fiber",
    "troika-three-text"
]
```

Это заставляет Turbopack транспилировать эти пакеты через собственный пайплайн вместо попытки их tree-shake, что устраняет дублирование шейдерного кода.

## Дополнительно
- Страница мокапов загружается через `dynamic(() => import(...), { ssr: false })` — WebGL не работает на сервере.
- После изменения `next.config.ts` требуется полный перезапуск dev-сервера.

## Файлы
- `next.config.ts` строка 9 — `transpilePackages`
- `components/mockups/3d-viewer.tsx` — компонент, использующий troika
- `app/(main)/dashboard/design/mockups/page.tsx` — динамический импорт

---
[[030-Модули/02-Производство-и-Склад/3D-Мокапы|← 3D-Мокапы]]
