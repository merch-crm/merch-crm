import {
    Package, Scissors, Box, Zap, Hourglass,
    Truck, Archive, Barcode, ShoppingCart, Gift, Scale, Plane, Warehouse, ClipboardList,
    Pencil, Brush, Ruler, Hammer, Wrench, Eraser, PenTool, Pipette,
    Palette, Printer, FlaskConical,
    Shield, Info, Settings, Search, Bell, Calendar, Home, Mail, Lock,
    Eye, Layers
} from "lucide-react";

// Phosphor Icons for clothing (much better clothing-specific icons)
import { Category } from "./inventory-client";

// Custom Clothing Icons (High quality, thematic)
import {
    TshirtIcon as CustomTshirt,
    HoodieIcon as CustomHoodie,
    SweatshirtIcon as CustomSweatshirt,
    LongsleeveIcon as CustomLongsleeve,
    AnorakIcon as CustomAnorak,
    ZipHoodieIcon as CustomZipHoodie,
    PantsIcon as CustomPants,
    PoloIcon as CustomPolo,
    CapIcon as CustomCap,
    PackageIcon as CustomPackage,
    SuppliesIcon as CustomSupplies,
    ToteBagIcon as CustomTote,
    BackpackIcon as CustomBackpack,
    SocksIcon as CustomSocks,
    BeanieIcon as CustomBeanie,
    JacketIcon as CustomJacket,
    SneakersIcon as CustomSneakers,
    ShortsIcon as CustomShorts,
    SkirtIcon as CustomSkirt,
    VestIcon as CustomVest,
    GlovesIcon as CustomGloves,
    ScarfIcon as CustomScarf,
    BadgeIcon as CustomBadge,
    StickerIcon as CustomSticker,
    MugIcon as CustomMug,
    NotebookIcon as CustomNotebook,
    UmbrellaIcon as CustomUmbrella
} from "./custom-clothing-icons";

export const ICON_GROUPS = [
    {
        id: "merch_custom",
        label: "Merch CRM (Эксклюзив)",
        icons: [
            { name: "tshirt-custom", icon: CustomTshirt, label: "Футболка" },
            { name: "hoodie-custom", icon: CustomHoodie, label: "Худи" },
            { name: "sweatshirt-custom", icon: CustomSweatshirt, label: "Свитшот" },
            { name: "longsleeve-custom", icon: CustomLongsleeve, label: "Лонгслив" },
            { name: "anorak-custom", icon: CustomAnorak, label: "Анорак" },
            { name: "ziphoodie-custom", icon: CustomZipHoodie, label: "Зип-худи" },
            { name: "pants-custom", icon: CustomPants, label: "Штаны" },
            { name: "polo-custom", icon: CustomPolo, label: "Поло" },
            { name: "cap-custom", icon: CustomCap, label: "Кепка" },
            { name: "jacket-custom", icon: CustomJacket, label: "Куртка" },
            { name: "sneakers-custom", icon: CustomSneakers, label: "Кроссовки" },
            { name: "beanie-custom", icon: CustomBeanie, label: "Шапка" },
            { name: "backpack-custom", icon: CustomBackpack, label: "Рюкзак" },
            { name: "totebag-custom", icon: CustomTote, label: "Шоппер" },
            { name: "socks-custom", icon: CustomSocks, label: "Носки" },
            { name: "packaging-custom", icon: CustomPackage, label: "Упаковка" },
            { name: "supplies-custom", icon: CustomSupplies, label: "Расходники" },
            { name: "shorts-custom", icon: CustomShorts, label: "Шорты" },
            { name: "skirt-custom", icon: CustomSkirt, label: "Юбка" },
            { name: "vest-custom", icon: CustomVest, label: "Жилетка" },
            { name: "gloves-custom", icon: CustomGloves, label: "Перчатки" },
            { name: "scarf-custom", icon: CustomScarf, label: "Шарф" },
            { name: "badge-custom", icon: CustomBadge, label: "Значок" },
            { name: "sticker-custom", icon: CustomSticker, label: "Стикер" },
            { name: "mug-custom", icon: CustomMug, label: "Кружка" },
            { name: "notebook-custom", icon: CustomNotebook, label: "Блокнот" },
            { name: "umbrella-custom", icon: CustomUmbrella, label: "Зонт" },
        ]
    },
    {
        id: "clothing",
        label: "Одежда",
        icons: [
            { name: "tshirt", icon: CustomTshirt, label: "Футболка" },
            { name: "hoodie", icon: CustomHoodie, label: "Худи" },
            { name: "pants", icon: CustomPants, label: "Штаны / Брюки" },
            { name: "coat", icon: CustomAnorak, label: "Куртка / Анорак" },
            { name: "sneaker", icon: CustomSneakers, label: "Кроссовки" },
            { name: "baseball-cap", icon: CustomCap, label: "Кепка" },
        ]
    },
    {
        id: "accessories",
        label: "Аксессуары",
        icons: [
            { name: "backpack", icon: CustomBackpack, label: "Рюкзак" },
            { name: "tote", icon: CustomTote, label: "Шоппер" },
            { name: "socks", icon: CustomSocks, label: "Носки" }
        ]
    },
    {
        id: "packaging",
        label: "Упаковка",
        icons: [
            { name: "box", icon: Box, label: "Коробка" },
            { name: "package", icon: Package, label: "Посылка" },
            { name: "archive", icon: Archive, label: "Архив" },
            { name: "truck", icon: Truck, label: "Доставка" },
            { name: "barcode", icon: Barcode, label: "Штрих-код" },
            { name: "scale", icon: Scale, label: "Весы" },
            { name: "plane", icon: Plane, label: "Авиадоставка" },
            { name: "gift", icon: Gift, label: "Подарочная упаковка" },
            { name: "shopping-cart", icon: ShoppingCart, label: "Корзины" },
            { name: "layers", icon: Layers, label: "Слои" },
            { name: "warehouse", icon: Warehouse, label: "Склад" },
            { name: "clipboard-list", icon: ClipboardList, label: "Накладные" }
        ]
    },
    {
        id: "supplies",
        label: "Расходники",
        icons: [
            { name: "pencil", icon: Pencil, label: "Карандаш" },
            { name: "brush", icon: Brush, label: "Кисть" },
            { name: "palette", icon: Palette, label: "Палитра" },
            { name: "scissors", icon: Scissors, label: "Ножницы" },
            { name: "ruler", icon: Ruler, label: "Линейка" },
            { name: "hammer", icon: Hammer, label: "Молоток" },
            { name: "wrench", icon: Wrench, label: "Ключ" },
            { name: "eraser", icon: Eraser, label: "Ластик" },
            { name: "pen-tool", icon: PenTool, label: "Перо" },
            { name: "pipette", icon: Pipette, label: "Пипетка" },
            { name: "flask", icon: FlaskConical, label: "Химия" },
            { name: "printer", icon: Printer, label: "Печать" }
        ]
    },
    {
        id: "general",
        label: "Общее",
        icons: [
            { name: "zap", icon: Zap, label: "Быстро" },
            { name: "shield", icon: Shield, label: "Защита" },
            { name: "info", icon: Info, label: "Инфо" },
            { name: "settings", icon: Settings, label: "Настройки" },
            { name: "search", icon: Search, label: "Поиск" },
            { name: "bell", icon: Bell, label: "Уведомление" },
            { name: "calendar", icon: Calendar, label: "Календарь" },
            { name: "home", icon: Home, label: "Главная" },
            { name: "mail", icon: Mail, label: "Почта" },
            { name: "lock", icon: Lock, label: "Замок" },
            { name: "eye", icon: Eye, label: "Обзор" },
            { name: "hourglass", icon: Hourglass, label: "Ожидание" }
        ]
    }
];

// Flat list for compatibility
export const ICONS = ICON_GROUPS.flatMap(group => group.icons);

export const getIconGroupForIcon = (iconName: string | null | undefined) => {
    if (!iconName) return null;
    return ICON_GROUPS.find(group => group.icons.some(i => i.name === iconName));
};

export const COLORS = [
    { name: "primary", class: "bg-primary" },
    { name: "rose", class: "bg-rose-500" },
    { name: "emerald", class: "bg-emerald-500" },
    { name: "amber", class: "bg-amber-500" },
    { name: "violet", class: "bg-violet-600" },
    { name: "cyan", class: "bg-cyan-500" },
    { name: "slate", class: "bg-slate-600" },
    { name: "orange", class: "bg-orange-500" },
];

export const getIconNameFromName = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("футболк") || n.includes("лонгслив") || n.includes("поло")) return "tshirt-custom";
    if (n.includes("худи")) return "hoodie-custom";
    if (n.includes("свитшот")) return "sweatshirt-custom";
    if (n.includes("анорак") || n.includes("куртк") || n.includes("ветровк")) return "anorak-custom";
    if (n.includes("зип")) return "ziphoodie-custom";
    if (n.includes("штан") || n.includes("брюк")) return "pants-custom";
    if (n.includes("кепк") || n.includes("бейсболк")) return "cap-custom";
    if (n.includes("обув") || n.includes("кроссовк")) return "sneakers-custom";
    if (n.includes("ботинк")) return "sneakers-custom";
    if (n.includes("плать")) return "anorak-custom";
    if (n.includes("сумк")) return "totebag-custom";
    if (n.includes("шоппер") || n.includes("тот")) return "totebag-custom";
    if (n.includes("рюкзак")) return "backpack-custom";
    if (n.includes("очк")) return "eye";
    if (n.includes("упаковка")) return "packaging-custom";
    if (n.includes("расходник")) return "supplies-custom";
    if (n.includes("бирк")) return "tag";
    return "tshirt-custom";
};

export const getCategoryIcon = (category: Partial<Category>) => {
    if (category.icon) {
        const icon = ICONS.find(i => i.name === category.icon);
        return icon ? icon.icon : Package;
    }
    const iconName = getIconNameFromName(category.name || "");
    const icon = ICONS.find(i => i.name === iconName);
    return icon ? icon.icon : Package;
};

export const getColorStyles = (color: string | null | undefined) => {
    const c = color || "slate";
    const styles: Record<string, string> = {
        "slate": "bg-slate-50 border border-slate-200 text-slate-600",
        "red": "bg-rose-50 border border-rose-100 text-rose-500",
        "orange": "bg-orange-50 border border-orange-100 text-orange-500",
        "amber": "bg-amber-50 border border-amber-100 text-amber-500",
        "yellow": "bg-yellow-50 border border-yellow-100 text-yellow-500",
        "lime": "bg-lime-50 border border-lime-100 text-lime-600",
        "green": "bg-emerald-50 border border-emerald-100 text-emerald-500",
        "emerald": "bg-emerald-50 border border-emerald-100 text-emerald-500",
        "teal": "bg-teal-50 border border-teal-100 text-teal-600",
        "cyan": "bg-cyan-50 border border-cyan-100 text-cyan-500",
        "sky": "bg-sky-50 border border-sky-100 text-sky-500",
        "blue": "bg-blue-50 border border-blue-100 text-blue-500",
        "primary": "bg-primary/5 border border-primary/10 text-primary",
        "indigo": "bg-primary/5 border border-primary/10 text-primary",
        "violet": "bg-violet-50 border border-violet-100 text-violet-500",
        "purple": "bg-purple-50 border border-purple-100 text-purple-500",
        "fuchsia": "bg-fuchsia-50 border border-fuchsia-100 text-fuchsia-500",
        "pink": "bg-pink-50 border border-pink-100 text-pink-500",
        "rose": "bg-rose-50 border border-rose-100 text-rose-500",
    };
    return styles[c] || styles["slate"];
};

export const CLOTHING_COLORS = [
    { name: "Белый", code: "WHT", hex: "#FFFFFF" },
    { name: "Черный", code: "BLK", hex: "#000000" },
    { name: "Молочный", code: "MILK", hex: "#F5F5DC" },
    { name: "Шоколад", code: "CHOC", hex: "#7B3F00" },
    { name: "Графит", code: "GRAF", hex: "#383838" },
    { name: "Баблгам", code: "BUB", hex: "#FFC1CC" },
];

export const CLOTHING_SIZES = [
    { name: "Kids", code: "KDS" },
    { name: "S", code: "S" },
    { name: "S-M", code: "SM" },
    { name: "M", code: "M" },
    { name: "L", code: "L" },
    { name: "XL", code: "XL" },
];

export const CLOTHING_QUALITIES = [
    { name: "Base", code: "BS" },
    { name: "Premium", code: "PRM" },
];

export const CLOTHING_MATERIALS = [
    { name: "Кулирка", code: "KUL" },
    { name: "Френч-терри", code: "FT" },
];
