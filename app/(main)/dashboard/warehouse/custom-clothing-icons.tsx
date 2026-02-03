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

const wrap = (Icon: PhosphorIcon): ComponentType<LucideProps> => {
    return (props: LucideProps) => createElement(Icon, {
        weight: "light",
        ...props
    } as any);
};

// Одежда
export const TshirtIcon = wrap(TShirt);
export const HoodieIcon = wrap(Hoodie);
export const PantsIcon = wrap(Pants);
export const JacketIcon = wrap(CoatHanger); // В сете Phosphor для куртки используется вешалка
export const DressIcon = wrap(Dress);
export const SneakersIcon = wrap(Sneaker);
export const BootsIcon = wrap(Boot);
export const CapIcon = wrap(BaseballCap);
export const ShortsIcon = wrap(Pants); // У Phosphor нет отдельных шорт, используем Pants или другое
export const SkirtIcon = wrap(Dress); // Аналогично

// Аксессуары
export const GlassesIcon = wrap(Eyeglasses);
export const WatchIcon = wrap(Watch);
export const HandbagIcon = wrap(Handbag);
export const BackpackIcon = wrap(Backpack);
export const ToteBagIcon = wrap(ShoppingBag);
export const WalletIcon = wrap(Wallet);
export const BeltIcon = wrap(Belt);
export const UmbrellaIcon = wrap(Umbrella);

// Статусы и маркеры
export const MugIcon = wrap(Coffee);
export const TagIcon = wrap(Tag);
export const BabyIcon = wrap(Baby);
export const CrownIcon = wrap(Crown);
export const SparklesIcon = wrap(Sparkle);
export const DiscountIcon = wrap(Percent);
export const HeartIcon = wrap(Heart);
export const StarIcon = wrap(Star);
export const FlameIcon = wrap(Flame);

// Склад и производство (для совместимости)
export const PackageIcon = wrap(Package);
export const SuppliesIcon = wrap(Scissors);
export const NotebookIcon = wrap(Notebook);
export const TruckIcon = wrap(Truck);
export const WarehouseIcon = wrap(Warehouse);
export const VanIcon = wrap(Van);

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
