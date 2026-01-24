# Реализация настройки миниатюры (Smart Thumbnail Cropping)

В этом документе описана реализация логики настройки миниатюры изображения с функциями масштабирования (zoom) и позиционирования (pan), корректно работающая с границами изображения.

## Основная концепция

Задача: позволить пользователю выбрать область изображения для отображения в квадратном контейнере, не выходя за границы самого изображения (чтобы не было белых полей).

Для этого используется комбинация:
1. `object-contain` для изображения.
2. CSS `transform` для масштабирования и сдвига.
3. Вычисляемый `baseScale` для заполнения контейнера.
4. Вычисляемые `maxBounds` для ограничения перемещения.

## Структура данных

В объекте товара (`InventoryItem`) или формы используется поле `thumbnailSettings`:

```typescript
thumbnailSettings: {
    zoom: number; // Множитель масштаба (от 1.0 до 3.0)
    x: number;    // Смещение по X в %
    y: number;    // Смещение по Y в %
}
```

## Реализация (React / Next.js)

### 1. Состояние и Хуки

Необходимо знать соотношение сторон изображения (`aspectRatio`) для расчетов.

```typescript
// Состояние соотношения сторон загруженного изображения
const [aspectRatio, setAspectRatio] = useState<number | null>(null);

// Текущие настройки (из пропсов или стейта формы)
const thumbSettings = editData.thumbnailSettings || { zoom: 1, x: 0, y: 0 };

// 1. Вычисление базового масштаба (Base Scale)
// Это масштаб, при котором изображение "Cover" (полностью заполняет) квадратный контейнер.
// object-contain по умолчанию вписывает всё фото, мы увеличиваем его так, чтобы MIN(w, h) стал 100%.
const baseScale = useMemo(() => {
    if (!aspectRatio) return 1;
    return Math.max(aspectRatio, 1 / aspectRatio);
}, [aspectRatio]);

// 2. Вычисление границ перемещения (Dynamic Boundaries)
// Определяет, насколько далеко можно сдвинуть изображение по X и Y, чтобы не появились пустые поля.
const maxBounds = useMemo(() => {
    if (!aspectRatio) return { x: 0, y: 0 };

    // Итоговый эффективный масштаб
    const s = (thumbSettings.zoom || 1) * baseScale;

    const ar = aspectRatio;
    // Нормализованные размеры относительно квадратного контейнера
    const normalizedW = ar >= 1 ? 1 : ar;
    const normalizedH = ar <= 1 ? 1 : 1 / ar;

    // Формула лимитов (50% - половина от "лишнего" пространства)
    const limitX = Math.max(0, 50 * (normalizedW - 1 / s));
    const limitY = Math.max(0, 50 * (normalizedH - 1 / s));

    return { x: limitX, y: limitY };
}, [aspectRatio, thumbSettings.zoom, baseScale]);

// 3. Авто-коррекция координат (Auto-clamp)
// При изменении зума (уменьшении) текущие координаты могут выйти за допустимые пределы.
// Этот эффект "возвращает" картинку в центр, если она уехала в пустоту.
useEffect(() => {
    const { x, y } = thumbSettings;
    let newX = x;
    let newY = y;

    const limitX = Math.max(0, maxBounds.x);
    const limitY = Math.max(0, maxBounds.y);

    if (newX > limitX) newX = limitX;
    else if (newX < -limitX) newX = -limitX;

    if (newY > limitY) newY = limitY;
    else if (newY < -limitY) newY = -limitY;

    if (newX !== x || newY !== y) {
        updateThumb({ x: newX, y: newY });
    }
}, [maxBounds, thumbSettings, updateThumb]);
```

### 2. Рендер изображения

Используется `Image` из `next/image`.
Важно: используется `object-contain`, а всё позиционирование делается через `transform`.

```tsx
<Image
    src={item.image}
    alt="Thumbnail"
    fill
    // object-contain гарантирует, что мы видим всё фото целиком, если scale=1
    className="object-contain transition-transform duration-500 ease-out"
    
    // Получаем aspectRatio при загрузке
    onLoadingComplete={(img) => {
        setAspectRatio(img.naturalWidth / img.naturalHeight);
    }}
    
    style={{
        // Сначала Scale (базовый * зум пользователя), затем Translate (% от ширины контейнера)
        transform: `scale(${((thumbSettings.zoom ?? 1) * baseScale)}) translate(${thumbSettings.x ?? 0}%, ${thumbSettings.y ?? 0}%)`,
        transformOrigin: 'center center',
        cursor: isEditing ? 'grab' : 'zoom-in'
    }}
/>
```

### 3. UI Элементы управления (Sliders)

#### Zoom Slider
```tsx
<input
    type="range"
    min="1"
    max="3"
    step="0.05"
    value={thumbSettings.zoom ?? 1}
    onChange={(e) => updateThumb({ zoom: parseFloat(e.target.value) })}
/>
```

#### X/Y Sliders (с визуализацией лимитов)
Слайдеры должны быть заблокированы (`disabled`), если перемещение по этой оси невозможно (например, фото узкое и высокое — по X двигать нельзя).

```tsx
// Пример слайдера X
<input
    type="range"
    // Диапазон от -limit до +limit
    min={-Math.max(1, maxBounds.x)}
    max={Math.max(1, maxBounds.x)}
    step="1"
    value={thumbSettings.x ?? 0}
    disabled={maxBounds.x <= 0} // Блокировка если лимит 0
    onChange={(e) => updateThumb({ x: parseInt(e.target.value) })}
/>
```

## Примечания

*   **Logic**: `baseScale` превращает `zoom: 1` в режим "Cover". Это база. Пользовательский `zoom` накладывается поверх.
*   **UX**: Плавная анимация (`transition-transform`) важна для приятного ощущения при возврате координат (clamping).
*   **Storage**: Сохраняются относительные координаты (%, zoom factor), что делает настройки независимыми от реального размера пикселей экрана.
