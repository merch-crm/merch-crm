"use client";

import { LucideProps } from "lucide-react";
import { ComponentType, createElement } from "react";
import {
    TShirt, Hoodie, Pants, CoatHanger, Dress, Sneaker, Boot, BaseballCap,
    Eyeglasses, Watch, Handbag, Backpack, ShoppingBag, Tag, Baby,
    Crown, Sparkle, Percent, Heart, Star, Flame, Belt, Wallet, Umbrella,
    Package, Scissors, Coffee, Notebook, Truck, Warehouse, Van,
    IconProps
} from "@phosphor-icons/react";

/**
 * КАСТОМНЫЕ SVG ИКОНКИ ДЛЯ MERCH CRM (Phosphor Icons Set)
 * ====================================
 * Все иконки выполнены в стиле Phosphor Light (эквивалент 1.5px)
 */

type PhosphorIcon = ComponentType<IconProps>;

const wrap = (Icon: PhosphorIcon, displayName: string): ComponentType<LucideProps> => {
    const WrappedIcon = (props: LucideProps) => createElement(Icon, {
        weight: "light",
        ...props
    } as IconProps);
    WrappedIcon.displayName = displayName;
    return WrappedIcon;
};

// Одежда
export const TshirtIcon = wrap(TShirt, "TshirtIcon");
export const HoodieIcon = wrap(Hoodie, "HoodieIcon");
export const PantsIcon = wrap(Pants, "PantsIcon");
export const JacketIcon = wrap(CoatHanger, "JacketIcon"); // В сете Phosphor для куртки используется вешалка
export const DressIcon = wrap(Dress, "DressIcon");
export const SneakersIcon = wrap(Sneaker, "SneakersIcon");
export const BootsIcon = wrap(Boot, "BootsIcon");
export const CapIcon = wrap(BaseballCap, "CapIcon");
export const ShortsIcon = wrap(Pants, "ShortsIcon"); // У Phosphor нет отдельных шорт, используем Pants или другое
export const SkirtIcon = wrap(Dress, "SkirtIcon"); // Аналогично

// Аксессуары
export const GlassesIcon = wrap(Eyeglasses, "GlassesIcon");
export const WatchIcon = wrap(Watch, "WatchIcon");
export const HandbagIcon = wrap(Handbag, "HandbagIcon");
export const BackpackIcon = wrap(Backpack, "BackpackIcon");
export const ToteBagIcon = wrap(ShoppingBag, "ToteBagIcon");
export const WalletIcon = wrap(Wallet, "WalletIcon");
export const BeltIcon = wrap(Belt, "BeltIcon");
export const UmbrellaIcon = wrap(Umbrella, "UmbrellaIcon");

// Статусы и маркеры
export const MugIcon = wrap(Coffee, "MugIcon");
export const TagIcon = wrap(Tag, "TagIcon");
export const BabyIcon = wrap(Baby, "BabyIcon");
export const CrownIcon = wrap(Crown, "CrownIcon");
export const SparklesIcon = wrap(Sparkle, "SparklesIcon");
export const DiscountIcon = wrap(Percent, "DiscountIcon");
export const HeartIcon = wrap(Heart, "HeartIcon");
export const StarIcon = wrap(Star, "StarIcon");
export const FlameIcon = wrap(Flame, "FlameIcon");

// Склад и производство (для совместимости)
export const PackageIcon = wrap(Package, "PackageIcon");
export const SuppliesIcon = wrap(Scissors, "SuppliesIcon");
export const NotebookIcon = wrap(Notebook, "NotebookIcon");
export const TruckIcon = wrap(Truck, "TruckIcon");
export const WarehouseIcon = wrap(Warehouse, "WarehouseIcon");
export const VanIcon = wrap(Van, "VanIcon");

// Экспорт всех иконок в объекте
export const CUSTOM_CLOTHING_ICONS = {
    "tshirt": TshirtIcon,
    "hoodie": HoodieIcon,
    "pants": PantsIcon,
    "jacket": JacketIcon,
    "dress": DressIcon,
    "sneakers": SneakersIcon,
    "boots": BootsIcon,
    "cap": CapIcon,
    "glasses": GlassesIcon,
    "watch": WatchIcon,
    "handbag": HandbagIcon,
    "backpack": BackpackIcon,
    "totebag": ToteBagIcon,
    "tag": TagIcon,
    "baby": BabyIcon,
    "crown": CrownIcon,
    "sparkles": SparklesIcon,
    "discount": DiscountIcon,
    "heart": HeartIcon,
    "star": StarIcon,
    "flame": FlameIcon,
    "belt": BeltIcon,
    "wallet": WalletIcon,
    "umbrella": UmbrellaIcon,
    "package": PackageIcon,
    "supplies": SuppliesIcon,
    "mug": MugIcon,
    "notebook": NotebookIcon,
};

// Маппинг названий категорий на иконки
export const CATEGORY_ICON_MAP: Record<string, ComponentType<LucideProps>> = {
    "Футболки": TshirtIcon,
    "Худи": HoodieIcon,
    "Штаны": PantsIcon,
    "Куртка": JacketIcon,
    "Платье": DressIcon,
    "Кроссовки": SneakersIcon,
    "Ботинки": BootsIcon,
    "Кепка": CapIcon,
    "Очки": GlassesIcon,
    "Часы": WatchIcon,
    "Сумка": HandbagIcon,
    "Рюкзак": BackpackIcon,
    "Шоппер": ToteBagIcon,
    "Бирка": TagIcon,
    "Детское": BabyIcon,
    "Премиум": CrownIcon,
    "Блеск": SparklesIcon,
    "Скидка": DiscountIcon,
    "Любимое": HeartIcon,
    "Хит": StarIcon,
    "Горячее": FlameIcon,
    "Ремень": BeltIcon,
    "Кошелек": WalletIcon,
    "Зонт": UmbrellaIcon,
};

// Реэкспорты для обратной совместимости
export const TshirtCustomIcon = TshirtIcon;
export const HoodieCustomIcon = HoodieIcon;
export const PantsCustomIcon = PantsIcon;
export const JacketCustomIcon = JacketIcon;
export const DressCustomIcon = DressIcon;
export const SneakersCustomIcon = SneakersIcon;
export const BootsCustomIcon = BootsIcon;
export const CapCustomIcon = CapIcon;
export const GlassesCustomIcon = GlassesIcon;
export const WatchCustomIcon = WatchIcon;
export const HandbagCustomIcon = HandbagIcon;
export const BackpackCustomIcon = BackpackIcon;
export const ToteBagCustomIcon = ToteBagIcon;
export const TagCustomIcon = TagIcon;
export const BabyCustomIcon = BabyIcon;
export const CrownCustomIcon = CrownIcon;
export const SparklesCustomIcon = SparklesIcon;
export const DiscountCustomIcon = DiscountIcon;
export const HeartCustomIcon = HeartIcon;
export const StarCustomIcon = StarIcon;
export const FlameCustomIcon = FlameIcon;
export const BeltCustomIcon = BeltIcon;
export const WalletCustomIcon = WalletIcon;
export const UmbrellaCustomIcon = UmbrellaIcon;
export const PackagingCustomIcon = PackageIcon;
export const SuppliesCustomIcon = SuppliesIcon;
export const NotebookCustomIcon = NotebookIcon;
export const MugCustomIcon = MugIcon;
