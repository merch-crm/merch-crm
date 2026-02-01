import { LucideProps } from "lucide-react";
import { ComponentType } from "react";

/**
 * КАСТОМНЫЕ SVG ИКОНКИ ДЛЯ MERCH CRM
 * ====================================
 * Все иконки выполнены в едином стиле:
 * - ViewBox: 24x24
 * - Stroke: 1.5px (тонкие линии для элегантности)
 * - Rounded caps & joins
 * - Минималистичный outline дизайн
 */

// Футболка (T-Shirt) — классическая форма
export const TshirtIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Основа футболки */}
        <path d="M6 4L3 7v3h3v10h12V10h3V7l-3-3" />
        {/* Горловина */}
        <path d="M8 4c0 2 2 3 4 3s4-1 4-3" />
        {/* Линия плеч */}
        <path d="M6 4h12" />
    </svg>
);

// Худи (Hoodie) — с капюшоном и карманом
export const HoodieIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Тело */}
        <path d="M4 9v11a1 1 0 001 1h14a1 1 0 001-1V9" />
        {/* Капюшон */}
        <path d="M4 9a8 8 0 018-7 8 8 0 018 7" />
        {/* Внутренняя линия капюшона */}
        <path d="M8 5c0 2 2 4 4 4s4-2 4-4" />
        {/* Рукава */}
        <path d="M4 9H2v4h2" />
        <path d="M20 9h2v4h-2" />
        {/* Карман-кенгуру */}
        <rect x="8" y="14" width="8" height="4" rx="1" />
        {/* Шнурки */}
        <path d="M10 9v4" />
        <path d="M14 9v4" />
    </svg>
);

// Свитшот (Crewneck) — без капюшона
export const SweatshirtIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Тело */}
        <path d="M5 6v14a1 1 0 001 1h12a1 1 0 001-1V6" />
        {/* Горловина круглая */}
        <ellipse cx="12" cy="5" rx="4" ry="2" />
        {/* Плечи */}
        <path d="M5 6c0-2 3-4 7-4s7 2 7 4" />
        {/* Рукава длинные */}
        <path d="M5 6H2v10h3" />
        <path d="M19 6h3v10h-3" />
        {/* Резинка низа */}
        <path d="M6 19h12" />
    </svg>
);

// Лонгслив (Long Sleeve)
export const LongsleeveIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Тело */}
        <path d="M7 4h10v16H7z" />
        {/* Горловина V */}
        <path d="M7 4l5 3 5-3" />
        {/* Длинные рукава с манжетами */}
        <path d="M7 4L3 6v12l2 1V7" />
        <path d="M17 4l4 2v12l-2 1V7" />
        {/* Манжеты */}
        <path d="M3 17h2" />
        <path d="M19 17h2" />
    </svg>
);

// Анорак (Anorak/Windbreaker)
export const AnorakIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Тело */}
        <path d="M4 10v10a1 1 0 001 1h14a1 1 0 001-1V10" />
        {/* Капюшон большой */}
        <path d="M4 10c0-5 4-8 8-8s8 3 8 8" />
        {/* Молния половина */}
        <path d="M12 10v7" />
        <circle cx="12" cy="18" r="0.5" fill="currentColor" />
        {/* Рукава */}
        <path d="M4 10l-2 1v6l2 1" />
        <path d="M20 10l2 1v6l-2 1" />
        {/* Большой карман */}
        <path d="M6 17h5" />
        <path d="M13 17h5" />
    </svg>
);

// Зип-худи (Zip Hoodie)
export const ZipHoodieIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Тело */}
        <path d="M4 9v11a1 1 0 001 1h14a1 1 0 001-1V9" />
        {/* Капюшон */}
        <path d="M4 9c0-4 4-7 8-7s8 3 8 7" />
        {/* Молния полная */}
        <path d="M12 9v12" />
        {/* Зубцы молнии */}
        <path d="M10 11h4" />
        <path d="M10 14h4" />
        <path d="M10 17h4" />
        {/* Рукава */}
        <path d="M4 9H2v5h2" />
        <path d="M20 9h2v5h-2" />
        {/* Карманы по бокам */}
        <path d="M5 15l2-1v5" />
        <path d="M19 15l-2-1v5" />
    </svg>
);

// Штаны (Pants/Trousers)
export const PantsIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Пояс */}
        <rect x="5" y="2" width="14" height="3" rx="0.5" />
        {/* Левая штанина */}
        <path d="M8 5l-1 17h4l1-10" />
        {/* Правая штанина */}
        <path d="M16 5l1 17h-4l-1-10" />
        {/* Ширинка */}
        <path d="M12 5v7" />
        {/* Карманы */}
        <path d="M7 6v2" />
        <path d="M17 6v2" />
    </svg>
);

// Поло (Polo Shirt)
export const PoloIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Основа */}
        <path d="M6 5L3 8v2h3v10h12V10h3V8l-3-3" />
        {/* Воротник */}
        <path d="M8 3l4 3 4-3" />
        <path d="M6 5h12" />
        {/* Планка с пуговицами */}
        <path d="M12 6v6" />
        <circle cx="12" cy="8" r="0.5" fill="currentColor" />
        <circle cx="12" cy="10" r="0.5" fill="currentColor" />
    </svg>
);

// Кепка (Baseball Cap)
export const CapIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Купол */}
        <path d="M4 14c0-5 4-9 8-9s8 4 8 9" />
        {/* Обруч */}
        <ellipse cx="12" cy="14" rx="8" ry="2" />
        {/* Козырёк */}
        <path d="M4 14c-1 0-2 1-2 2s1 2 3 2h4c1 0 2-1 1-2l-2-2" />
        {/* Пуговка сверху */}
        <circle cx="12" cy="6" r="1" />
        {/* Панели */}
        <path d="M12 6v8" />
    </svg>
);

// Упаковка (Package/Box)
export const PackageIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Коробка 3D */}
        <path d="M12 3L3 8v8l9 5 9-5V8l-9-5z" />
        {/* Грань */}
        <path d="M12 12l9-4" />
        <path d="M12 12L3 8" />
        <path d="M12 12v9" />
        {/* Лента */}
        <path d="M7.5 5.5l4.5 2.5 4.5-2.5" />
    </svg>
);

// Расходники (Scissors/Supplies)
export const SuppliesIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Ножницы */}
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M20 4L8.12 15.88" />
        <path d="M14.47 14.48L20 20" />
        <path d="M8.12 8.12L12 12" />
    </svg>
);

// Шоппер/Тоут (Tote Bag)
export const ToteBagIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Тело сумки */}
        <path d="M5 9h14l-1 12H6L5 9z" />
        {/* Ручки */}
        <path d="M8 9V6a4 4 0 018 0v3" />
    </svg>
);

// Рюкзак (Backpack)
export const BackpackIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Основной корпус */}
        <path d="M5 10v10a2 2 0 002 2h10a2 2 0 002-2V10" />
        {/* Верх закругленный */}
        <path d="M5 10a7 7 0 0114 0" />
        {/* Ручка сверху */}
        <path d="M9 4h6a1 1 0 011 1v2H8V5a1 1 0 011-1z" />
        {/* Передний карман */}
        <rect x="8" y="14" width="8" height="5" rx="1" />
        {/* Молния кармана */}
        <path d="M12 14v5" />
    </svg>
);

// Носки (Socks)
export const SocksIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Носок */}
        <path d="M6 2h6v3c0 2 0 6-2 8l-3 3a3 3 0 003 5h3a2 2 0 002-2V2" />
        {/* Резинка */}
        <path d="M6 4h9" />
        {/* Полоски */}
        <path d="M6 6h9" />
    </svg>
);

// Шапка-бини (Beanie)
export const BeanieIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Шапка */}
        <path d="M4 12c0-4.5 3.5-8 8-8s8 3.5 8 8" />
        <path d="M4 12v4c0 2 3.5 4 8 4s8-2 8-4v-4" />
        {/* Резинка */}
        <path d="M4 14h16" />
        {/* Помпон */}
        <circle cx="12" cy="5" r="2" />
    </svg>
);

// Куртка (Jacket)
export const JacketIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Тело */}
        <path d="M6 4l-4 3v13h6V10h8v10h6V7l-4-3" />
        {/* Горловина */}
        <path d="M6 4h12" />
        <path d="M8 4l4 4 4-4" />
        {/* Молния */}
        <path d="M12 8v12" />
        {/* Карманы */}
        <path d="M4 14h4" />
        <path d="M16 14h4" />
    </svg>
);

// Кроссовки (Sneakers)
export const SneakersIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Подошва */}
        <path d="M3 17h18c1 0 1 3 0 3H3c-1 0-1-3 0-3z" />
        {/* Верх кроссовка */}
        <path d="M3 17c0-2 1-4 3-5l5-4h4l5 2c2 1 3 4 3 7" />
        {/* Язычок */}
        <path d="M8 12l3-4h2" />
        {/* Шнуровка */}
        <path d="M10 11h3" />
        <path d="M11 14h4" />
    </svg>
);

// Шорты (Shorts)
export const ShortsIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M5 4h14v5l-2 11h-4l-1-6-1 6H7L5 9z" />
        <path d="M5 9h14" />
        <path d="M12 4v5" />
    </svg>
);

// Юбка (Skirt)
export const SkirtIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M8 4h8l4 16H4z" />
        <path d="M6 10h12" />
        <path d="M5 15h14" />
    </svg>
);

// Жилетка (Vest)
export const VestIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M6 4L3 7v3h3v10h12V10h3V7l-3-3" />
        <path d="M8 4v16" />
        <path d="M16 4v16" />
        <path d="M6 4h12" />
        <path d="M11 4l1 1 1-1" />
    </svg>
);

// Перчатки (Gloves)
export const GlovesIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M8 10V4a2 2 0 014 0v6" />
        <path d="M12 10V2a2 2 0 014 0v8" />
        <path d="M16 10V4a2 2 0 014 0v10a6 6 0 01-12 0v-4" />
        <path d="M4 14a2 2 0 012-2h2v4a2 2 0 01-2 2H4" />
        <path d="M8 18h10" />
    </svg>
);

// Шарф (Scarf)
export const ScarfIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M6 4h12a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
        <path d="M6 10v10l2-2 2 2v-10" />
        <path d="M14 10v10l2-2 2 2v-10" />
    </svg>
);

// Значок (Badge/Pin)
export const BadgeIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
        <circle cx="12" cy="12" r="4" />
    </svg>
);

// Стикер (Sticker)
export const StickerIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M10 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2v-4" />
        <path d="M20 2v14l-6-6z" />
        <path d="M14 14v4l4-4h-4z" />
    </svg>
);

// Кружка (Mug)
export const MugIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M17 8H6a1 1 0 00-1 1v10a2 2 0 002 2h10a2 2 0 002-2V9a1 1 0 00-1-1z" />
        <path d="M18 10a3 3 0 010 6h-1" />
        <path d="M5 10c0-3 3-4 7-4s7 1 7 4" />
    </svg>
);

// Блокнот (Notebook)
export const NotebookIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 3v18" />
        <path d="M12 7h4" />
        <path d="M12 11h4" />
        <path d="M12 15h4" />
    </svg>
);

// Зонт (Umbrella)
export const UmbrellaIcon: ComponentType<LucideProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M22 11a10 10 0 10-20 0h20z" />
        <path d="M12 11V3" />
        <path d="M12 11v8a2 2 0 004 0" />
    </svg>
);

// =====================================
// ЭКСПОРТ
// =====================================

export const CUSTOM_CLOTHING_ICONS = {
    "tshirt": TshirtIcon,
    "hoodie": HoodieIcon,
    "sweatshirt": SweatshirtIcon,
    "longsleeve": LongsleeveIcon,
    "anorak": AnorakIcon,
    "ziphoodie": ZipHoodieIcon,
    "pants": PantsIcon,
    "polo": PoloIcon,
    "cap": CapIcon,
    "package": PackageIcon,
    "supplies": SuppliesIcon,
    "totebag": ToteBagIcon,
    "backpack": BackpackIcon,
    "socks": SocksIcon,
    "beanie": BeanieIcon,
    "jacket": JacketIcon,
    "sneakers": SneakersIcon,
    "shorts": ShortsIcon,
    "skirt": SkirtIcon,
    "vest": VestIcon,
    "gloves": GlovesIcon,
    "scarf": ScarfIcon,
    "badge": BadgeIcon,
    "sticker": StickerIcon,
    "mug": MugIcon,
    "notebook": NotebookIcon,
    "umbrella": UmbrellaIcon,
};

// Маппинг названий категорий на иконки
export const CATEGORY_ICON_MAP: Record<string, ComponentType<LucideProps>> = {
    "Футболки": TshirtIcon,
    "Футболка": TshirtIcon,
    "Худи": HoodieIcon,
    "Свитшот": SweatshirtIcon,
    "Лонгслив": LongsleeveIcon,
    "Анорак": AnorakIcon,
    "Зип-худи": ZipHoodieIcon,
    "Штаны": PantsIcon,
    "Брюки": PantsIcon,
    "Поло": PoloIcon,
    "Кепки": CapIcon,
    "Кепка": CapIcon,
    "Упаковка": PackageIcon,
    "Расходники": SuppliesIcon,
    "Шоппер": ToteBagIcon,
    "Сумка": ToteBagIcon,
    "Рюкзак": BackpackIcon,
    "Носки": SocksIcon,
    "Шапка": BeanieIcon,
    "Бини": BeanieIcon,
    "Куртка": JacketIcon,
    "Кроссовки": SneakersIcon,
    "Обувь": SneakersIcon,
    "Шорты": ShortsIcon,
    "Юбка": SkirtIcon,
    "Жилетка": VestIcon,
    "Перчатки": GlovesIcon,
    "Варежки": GlovesIcon,
    "Шарф": ScarfIcon,
    "Значок": BadgeIcon,
    "Пин": BadgeIcon,
    "Стикер": StickerIcon,
    "Наклейка": StickerIcon,
    "Кружка": MugIcon,
    "Блокнот": NotebookIcon,
    "Зонт": UmbrellaIcon,
};

// Реэкспорт с суффиксом Custom для обратной совместимости
export const TshirtCustomIcon = TshirtIcon;
export const HoodieCustomIcon = HoodieIcon;
export const SweatshirtCustomIcon = SweatshirtIcon;
export const LongsleeveCustomIcon = LongsleeveIcon;
export const AnorakCustomIcon = AnorakIcon;
export const ZipHoodieCustomIcon = ZipHoodieIcon;
export const PantsCustomIcon = PantsIcon;
export const PoloCustomIcon = PoloIcon;
export const CapCustomIcon = CapIcon;
export const PackagingCustomIcon = PackageIcon;
export const SuppliesCustomIcon = SuppliesIcon;
export const ToteBagCustomIcon = ToteBagIcon;
export const BackpackCustomIcon = BackpackIcon;
export const SocksCustomIcon = SocksIcon;
export const BeanieCustomIcon = BeanieIcon;
export const JacketCustomIcon = JacketIcon;
export const SneakersCustomIcon = SneakersIcon;
export const ShortsCustomIcon = ShortsIcon;
export const SkirtCustomIcon = SkirtIcon;
export const VestCustomIcon = VestIcon;
export const GlovesCustomIcon = GlovesIcon;
export const ScarfCustomIcon = ScarfIcon;
export const BadgeCustomIcon = BadgeIcon;
export const StickerCustomIcon = StickerIcon;
export const MugCustomIcon = MugIcon;
export const NotebookCustomIcon = NotebookIcon;
export const UmbrellaCustomIcon = UmbrellaIcon;
