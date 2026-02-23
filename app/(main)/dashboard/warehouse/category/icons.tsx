import {
    Box, Package, Scissors, Zap, Hourglass,
    Truck, Archive, Barcode, ShoppingCart, Gift, Scale, Plane, Warehouse, FileText,
    Pencil, Brush, Ruler, Hammer, Wrench, PenTool, Pipette,
    Palette, Printer, FlaskConical, Factory,
    Shield, Info, Settings, Search, Bell, Calendar, Home, Mail, Lock,
    Eye, Layers, CircleDollarSign, TrendingUp, Wallet, Users, UserCheck, Phone,
    CheckCircle2, Sparkles, Ship, Database, DollarSign, User, Trash
} from "lucide-react";

export { Box, Package };


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
} from "../custom-clothing-icons";

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
    }
];

export const ICONS = ICON_GROUPS.flatMap(group => group.icons);

export const getIconGroupForIcon = (iconName: string | null | undefined) => {
    if (!iconName) return null;
    return ICON_GROUPS.find(group => group.icons.some(i => i.name === iconName));
};

export const getIconNameFromName = (name: string): string => {
    if (!name) return "tshirt-custom";
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

import { Category } from "../types";

export const getCategoryIcon = (category: Partial<Category>) => {
    if (!category) return Package;
    if (category.icon) {
        const icon = ICONS.find(i => i.name === category.icon);
        return icon ? icon.icon : Package;
    }
    const iconName = getIconNameFromName(category.name || "");
    const icon = ICONS.find(i => i.name === iconName);
    return icon ? icon.icon : Package;
};

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
