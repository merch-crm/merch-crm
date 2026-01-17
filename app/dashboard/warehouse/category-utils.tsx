import {
    Shirt, Package, Layers, Zap, Scissors, Box, Hourglass, Tag,
    ShoppingBag, Footprints, GraduationCap,
    Baby, Crown, User, Users, Gem, Handbag, Glasses,
    Truck, Archive, Barcode, ShoppingCart, Gift, Scale, Plane, Warehouse, ClipboardList,
    Pencil, Brush, Ruler, Hammer, Wrench, Eraser, PenTool, Pipette,
    Palette, Printer, FlaskConical,
    Shield, Info, Settings, Search, Bell, Calendar, Home, Mail, Lock,
    Eye
} from "lucide-react";
import { Category } from "./inventory-client";

export const ICON_GROUPS = [
    {
        id: "clothing",
        label: "Одежда",
        icons: [
            { name: "shirt", icon: Shirt, label: "Футболка" },
            { name: "handbag", icon: Handbag, label: "Сумки и аксессуары" },
            { name: "footprints", icon: Footprints, label: "Обувь" },
            { name: "graduation-cap", icon: GraduationCap, label: "Головные уборы" },
            { name: "tag", icon: Tag, label: "Бирки и этикетки" },
            { name: "shopping-bag", icon: ShoppingBag, label: "Шопперы" },
            { name: "crown", icon: Crown, label: "Премиум" },
            { name: "gem", icon: Gem, label: "Ювелирные изделия" },
            { name: "user", icon: User, label: "Мужская коллекция" },
            { name: "users", icon: Users, label: "Унисекс / Женская" },
            { name: "baby", icon: Baby, label: "Детская одежда" },
            { name: "glasses", icon: Glasses, label: "Очки и мерч" }
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
    { name: "indigo", class: "bg-indigo-500" },
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
    if (n.includes("футболк") || n.includes("лонгслив") || n.includes("поло")) return "shirt";
    if (n.includes("худи")) return "hourglass";
    if (n.includes("свитшот")) return "layers";
    if (n.includes("анорак")) return "wind";
    if (n.includes("зип")) return "zap";
    if (n.includes("штаны")) return "package";
    if (n.includes("упаковка") || n.includes("кепки")) return "box";
    if (n.includes("расходники")) return "scissors";
    if (n.includes("бирка")) return "tag";
    if (n.includes("пакет")) return "shopping-bag";
    return "package";
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
        "slate": "bg-slate-100/80 text-slate-600",
        "red": "bg-red-100/80 text-red-600",
        "orange": "bg-orange-100/80 text-orange-600",
        "amber": "bg-amber-100/80 text-amber-600",
        "yellow": "bg-yellow-100/80 text-yellow-600",
        "lime": "bg-lime-100/80 text-lime-600",
        "green": "bg-green-100/80 text-green-600",
        "emerald": "bg-emerald-100/80 text-emerald-600",
        "teal": "bg-teal-100/80 text-teal-600",
        "cyan": "bg-cyan-100/80 text-cyan-600",
        "sky": "bg-sky-100/80 text-sky-600",
        "blue": "bg-blue-100/80 text-blue-600",
        "indigo": "bg-indigo-100/80 text-indigo-600",
        "violet": "bg-violet-100/80 text-violet-600",
        "purple": "bg-purple-100/80 text-purple-600",
        "fuchsia": "bg-fuchsia-100/80 text-fuchsia-600",
        "pink": "bg-pink-100/80 text-pink-600",
        "rose": "bg-rose-100/80 text-rose-600",
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
    { name: "M", code: "M" },
    { name: "S-M", code: "SM" },
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
