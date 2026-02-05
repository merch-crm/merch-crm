import {
    Package, Scissors, Box, Zap, Hourglass,
    Truck, Archive, Barcode, ShoppingCart, Gift, Scale, Plane, Warehouse, FileText,
    Pencil, Brush, Ruler, Hammer, Wrench, PenTool, Pipette,
    Palette, Printer, FlaskConical, Factory,
    Shield, Info, Settings, Search, Bell, Calendar, Home, Mail, Lock,
    Eye, Layers, CircleDollarSign, TrendingUp, Wallet, Users, UserCheck, Phone,
    CheckCircle2, Sparkles, Ship, Database, DollarSign, User, Trash
} from "lucide-react";

// Phosphor Icons for clothing (much better clothing-specific icons)
import { Category } from "./types";
import { cn } from "@/lib/utils";

// Custom Clothing Icons (High quality, thematic)
import {
    TshirtIcon as CustomTshirt,
    HoodieIcon as CustomHoodie,
    PantsIcon as CustomPants,
    JacketIcon as CustomJacket,
    DressIcon as CustomDress,
    SneakersIcon as CustomSneakers,
    BootsIcon as CustomBoots,
    CapIcon as CustomCap,
    GlassesIcon as CustomGlasses,
    WatchIcon as CustomWatch,
    HandbagIcon as CustomHandbag,
    BackpackIcon as CustomBackpack,
    ToteBagIcon as CustomToteBag,
    TagIcon as CustomTag,
    BabyIcon as CustomBaby,
    CrownIcon as CustomCrown,
    SparklesIcon as CustomSparkles,
    DiscountIcon as CustomDiscount,
    HeartIcon as CustomHeart,
    StarIcon as CustomStar,
    FlameIcon as CustomFlame,
    BeltIcon as CustomBelt,
    WalletIcon as CustomWallet,
    UmbrellaIcon as CustomUmbrella,
    PackageIcon as CustomPackage,
    SuppliesIcon as CustomSupplies,
    MugIcon as CustomMug,
    NotebookIcon as CustomNotebook
} from "./custom-clothing-icons";

export const ICON_GROUPS = [
    {
        name: "ОДЕЖДА",
        icons: [
            { name: "tshirt-custom", icon: CustomTshirt, label: "Футболка" },
            { name: "hoodie-custom", icon: CustomHoodie, label: "Худи" },
            { name: "pants-custom", icon: CustomPants, label: "Штаны" },
            { name: "jacket-custom", icon: CustomJacket, label: "Куртка" },
            { name: "dress-custom", icon: CustomDress, label: "Платье" },
            { name: "sneakers-custom", icon: CustomSneakers, label: "Кроссовки" },
            { name: "boots-custom", icon: CustomBoots, label: "Ботинки" },
            { name: "cap-custom", icon: CustomCap, label: "Кепка" },
            { name: "glasses-custom", icon: CustomGlasses, label: "Очки" },
            { name: "watch-custom", icon: CustomWatch, label: "Часы" },
            { name: "handbag-custom", icon: CustomHandbag, label: "Сумка" },
            { name: "backpack-custom", icon: CustomBackpack, label: "Рюкзак" },
            { name: "totebag-custom", icon: CustomToteBag, label: "Шоппер" },
            { name: "tag-custom", icon: CustomTag, label: "Бирка" },
            { name: "baby-custom", icon: CustomBaby, label: "Детское" },
            { name: "crown-custom", icon: CustomCrown, label: "Премиум" },
            { name: "sparkles-custom", icon: CustomSparkles, label: "Блеск" },
            { name: "discount-custom", icon: CustomDiscount, label: "Скидка" },
            { name: "heart-custom", icon: CustomHeart, label: "Любимое" },
            { name: "star-custom", icon: CustomStar, label: "Хит" },
            { name: "flame-custom", icon: CustomFlame, label: "Горячее" },
            { name: "belt-custom", icon: CustomBelt, label: "Ремень" },
            { name: "wallet-custom", icon: CustomWallet, label: "Кошелек" },
            { name: "umbrella-custom", icon: CustomUmbrella, label: "Зонт" },
        ]
    },
    {
        name: "СКЛАД И ЛОГИСТИКА",
        icons: [
            { name: "box", icon: Box, label: "Коробка" },
            { name: "package", icon: Package, label: "Посылка" },
            { name: "warehouse", icon: Warehouse, label: "Склад" },
            { name: "truck", icon: Truck, label: "Грузовик" },
            { name: "plane", icon: Plane, label: "Самолет" },
            { name: "ship", icon: Ship, label: "Корабль" },
            { name: "barcode", icon: Barcode, label: "Штрихкод" },
            { name: "layers", icon: Layers, label: "Слои" },
            { name: "database", icon: Database, label: "База данных" },
            { name: "scale", icon: Scale, label: "Весы" },
            { name: "inventory-custom", icon: CustomPackage, label: "Инвентарь" },
        ]
    },
    {
        name: "ПРОИЗВОДСТВО И ИНСТРУМЕНТЫ",
        icons: [
            { name: "factory", icon: Factory, label: "Завод" },
            { name: "printer", icon: Printer, label: "Принтер" },
            { name: "pen-tool", icon: PenTool, label: "Дизайн" },
            { name: "palette", icon: Palette, label: "Палитра" },
            { name: "scissors", icon: Scissors, label: "Ножницы" },
            { name: "hammer", icon: Hammer, label: "Молоток" },
            { name: "wrench", icon: Wrench, label: "Ключ" },
            { name: "ruler", icon: Ruler, label: "Линейка" },
            { name: "brush", icon: Brush, label: "Кисть" },
            { name: "pipette", icon: Pipette, label: "Пипетка" },
            { name: "flask-conical", icon: FlaskConical, label: "Химия" },
            { name: "supplies-custom", icon: CustomSupplies, label: "Расходники" },
        ]
    },
    {
        name: "ФИНАНСЫ И ПРОДАЖИ",
        icons: [
            { name: "dollar-sign", icon: DollarSign, label: "Доллар" },
            { name: "wallet", icon: Wallet, label: "Кошелек" },
            { name: "trending-up", icon: TrendingUp, label: "Рост" },
            { name: "shopping-cart", icon: ShoppingCart, label: "Корзина" },
            { name: "gift", icon: Gift, label: "Подарок / Бонус" },
            { name: "wallet-custom", icon: CustomWallet, label: "Кошелек (Ph)" },
        ]
    },
    {
        name: "БИЗНЕС И КЛИЕНТЫ",
        icons: [
            { name: "users", icon: Users, label: "Клиенты" },
            { name: "user", icon: User, label: "Профиль" },
            { name: "mail", icon: Mail, label: "Почта" },
            { name: "phone", icon: Phone, label: "Телефон" },
            { name: "home", icon: Home, label: "Главная" },
            { name: "file-text", icon: FileText, label: "Документ" },
            { name: "mug-custom", icon: CustomMug, label: "Кружка" },
        ]
    },
    {
        name: "СИСТЕМНЫЕ И СТАТУС",
        icons: [
            { name: "settings", icon: Settings, label: "Настройки" },
            { name: "bell", icon: Bell, label: "Уведомления" },
            { name: "shield", icon: Shield, label: "Безопасность" },
            { name: "check-circle", icon: CheckCircle2, label: "Готово" },
            { name: "zap", icon: Zap, label: "Быстро" },
            { name: "info", icon: Info, label: "Инфо" },
            { name: "search", icon: Search, label: "Поиск" },
            { name: "trash", icon: Trash, label: "Корзина" },
            { name: "calendar", icon: Calendar, label: "Календарь" },
            { name: "hourglass", icon: Hourglass, label: "Ожидание" },
            { name: "eye", icon: Eye, label: "Обзор" },
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
    { name: "lime", class: "bg-lime-500" },
    { name: "blue", class: "bg-blue-600" },
    { name: "slate", class: "bg-slate-600" },
    { name: "orange", class: "bg-orange-500" },
    { name: "sky", class: "bg-sky-500" },
    { name: "fuchsia", class: "bg-fuchsia-500" },
];

const RUSSIAN_TO_LATIN_MAP: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
};

export const generateCategoryPrefix = (name: string): string => {
    if (!name) return "";
    const words = name.trim().split(/\s+/);
    let result = "";

    if (words.length >= 2) {
        // First letters of first two words
        result = words.slice(0, 2).map(w => w[0]).join("");
    } else {
        // First three characters of the first word
        const word = words[0];
        result = word.slice(0, Math.min(word.length, 3));
    }

    return result.toLowerCase()
        .split('')
        .map(char => RUSSIAN_TO_LATIN_MAP[char] || char)
        .join('')
        .replace(/[^a-z0-9]/g, '')
        .toUpperCase();
};

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
    if (n.includes("плать")) return "dress-custom";
    if (n.includes("сумк")) return "totebag-custom";
    if (n.includes("шоппер") || n.includes("тот")) return "totebag-custom";
    if (n.includes("рюкзак")) return "backpack-custom";
    if (n.includes("очк")) return "glasses-custom";
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

// --- Icon Registry & Serialization Helpers ---

export const ALL_ICONS_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    // Lucide Icons
    "box": Box, "package": Package, "warehouse": Warehouse, "truck": Truck, "plane": Plane,
    "archive": Archive, "barcode": Barcode, "layers": Layers, "file-text": FileText, "scale": Scale,
    "factory": Factory, "printer": Printer, "brush": Brush, "palette": Palette, "scissors": Scissors,
    "hammer": Hammer, "wrench": Wrench, "ruler": Ruler, "pencil": Pencil, "pen-tool": PenTool,
    "pipette": Pipette, "flask-conical": FlaskConical, "flask": FlaskConical,
    "circle-dollar-sign": CircleDollarSign, "dollar": CircleDollarSign, "wallet": Wallet,
    "trending-up": TrendingUp, "shopping-cart": ShoppingCart, "gift": Gift,
    "users": Users, "user-check": UserCheck, "mail": Mail, "phone": Phone, "home": Home,
    "settings": Settings, "lock": Lock, "shield": Shield, "check-circle": CheckCircle2,
    "zap": Zap, "info": Info, "search": Search, "bell": Bell, "calendar": Calendar,
    "hourglass": Hourglass, "eye": Eye, "sparkles": Sparkles,
    "ship": Ship, "database": Database, "dollar-sign": DollarSign, "user": User, "trash": Trash,

    // Custom Icons (Legacy Mapping to Phosphor Set)
    "tshirt-custom": CustomTshirt,
    "hoodie-custom": CustomHoodie,
    "sweatshirt-custom": CustomHoodie, // Redirect to Hoodie
    "longsleeve-custom": CustomTshirt, // Redirect to Tshirt
    "anorak-custom": CustomJacket,     // Redirect to Jacket
    "ziphoodie-custom": CustomHoodie,  // Redirect to Hoodie
    "pants-custom": CustomPants,
    "polo-custom": CustomTshirt,       // Redirect to Tshirt
    "cap-custom": CustomCap,
    "jacket-custom": CustomJacket,
    "sneakers-custom": CustomSneakers,
    "beanie-custom": CustomCap,        // Redirect to Cap
    "backpack-custom": CustomBackpack,
    "totebag-custom": CustomToteBag,
    "socks-custom": CustomBoots,       // Redirect to Boots
    "shorts-custom": CustomPants,      // Redirect to Pants
    "skirt-custom": CustomDress,       // Redirect to Dress
    "vest-custom": CustomJacket,       // Redirect to Jacket
    "gloves-custom": CustomBackpack,   // Redirect to Backpack
    "scarf-custom": CustomBelt,        // Redirect to Belt
    "badge-custom": CustomTag,         // Redirect to Tag
    "sticker-custom": CustomSparkles,  // Redirect to Sparkles
    "mug-custom": CustomMug,
    "notebook-custom": CustomNotebook,
    "umbrella-custom": CustomUmbrella,
    "inventory-custom": CustomPackage,
    "packaging-custom": CustomPackage,
    "supplies-custom": CustomSupplies,
    "dress-custom": CustomDress,
    "boots-custom": CustomBoots,
    "glasses-custom": CustomGlasses,
    "watch-custom": CustomWatch,
    "handbag-custom": CustomHandbag,
    "tag-custom": CustomTag,
    "baby-custom": CustomBaby,
    "crown-custom": CustomCrown,
    "sparkles-custom": CustomSparkles,
    "discount-custom": CustomDiscount,
    "heart-custom": CustomHeart,
    "star-custom": CustomStar,
    "flame-custom": CustomFlame,
    "belt-custom": CustomBelt,
    "wallet-custom": CustomWallet,
};

// Types for icon group serialization
export interface IconGroupInput {
    name: string;
    groupIcon?: React.ComponentType<{ className?: string }>;
    groupIconName?: string;
    icons: Array<{ name: string; label: string; svgContent?: string; icon?: React.ComponentType<{ className?: string }> }>;
}

export interface SerializedIconGroup {
    name: string;
    groupIconName: string;
    icons: Array<{ name: string; label: string; svgContent?: string }>;
}

// Functions to serialize/deserialize for DB storage
export function serializeIconGroups(groups: IconGroupInput[]): SerializedIconGroup[] {
    return groups.map(group => ({
        name: group.name,
        // Store groupIcon as string name only if it's a function (component)
        groupIconName: typeof group.groupIcon === 'function' ?
            Object.keys(ALL_ICONS_MAP).find(key => ALL_ICONS_MAP[key] === group.groupIcon) || "box"
            : group.groupIconName || "box",
        icons: group.icons.map((icon) => ({
            name: icon.name,
            label: icon.label,
            svgContent: icon.svgContent
        }))
    }));
}

export const createSvgIcon = (svgContent: string) => {
    const SvgIcon = ({ className }: { className?: string }) => (
        <div
            className={cn("flex items-center justify-center", className)}
            dangerouslySetInnerHTML={{
                __html: svgContent.includes('<svg') ? svgContent : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${svgContent}</svg>`
            }}
        />
    );
    SvgIcon.displayName = 'SvgIcon';
    return SvgIcon;
};

export function hydrateIconGroups(storedGroups: SerializedIconGroup[]) {
    if (!storedGroups || !Array.isArray(storedGroups)) return ICON_GROUPS;

    return storedGroups.map(group => {
        // Find group icon component
        const GroupIconComponent = ALL_ICONS_MAP[group.groupIconName] || Box;

        return {
            ...group,
            groupIcon: GroupIconComponent,
            icons: group.icons.map((icon) => ({
                ...icon,
                icon: icon.svgContent ? createSvgIcon(icon.svgContent) : (ALL_ICONS_MAP[icon.name] || Box)
            }))
        };
    });
}
