"use client";

import { LucideProps } from "lucide-react";
import { ComponentType } from "react";
import {
    Shirt, ShoppingBag, Watch, Glasses, Umbrella, Wallet, Tag, Baby,
    Crown, Sparkles, Percent, Heart, Star, Flame, Package, Scissors,
    Coffee, Notebook, Truck, Warehouse
} from "lucide-react";

/**
 * КАСТОМНЫЕ ИКОНКИ ДЛЯ MERCH CRM (Lucide Icons Set)
 * ====================================
 * Теперь используются только Lucide иконки для оптимизации бандла.
 */

// Одежда
export const TshirtIcon = Shirt;
export const HoodieIcon = Shirt;
export const PantsIcon = ShoppingBag;
export const JacketIcon = Shirt;
export const DressIcon = Shirt;
export const SneakersIcon = ShoppingBag;
export const BootsIcon = ShoppingBag;
export const CapIcon = Shirt;
export const ShortsIcon = ShoppingBag;
export const SkirtIcon = Shirt;

// Аксессуары
export const GlassesIcon = Glasses;
export const WatchIcon = Watch;
export const HandbagIcon = ShoppingBag;
export const BackpackIcon = ShoppingBag;
export const ToteBagIcon = ShoppingBag;
export const WalletIcon = Wallet;
export const BeltIcon = Tag;
export const UmbrellaIcon = Umbrella;

// Статусы и маркеры
export const MugIcon = Coffee;
export const TagIcon = Tag;
export const BabyIcon = Baby;
export const CrownIcon = Crown;
export const SparklesIcon = Sparkles;
export const DiscountIcon = Percent;
export const HeartIcon = Heart;
export const StarIcon = Star;
export const FlameIcon = Flame;

// Склад и производство
export const PackageIcon = Package;
export const SuppliesIcon = Scissors;
export const NotebookIcon = Notebook;
export const TruckIcon = Truck;
export const WarehouseIcon = Warehouse;
export const VanIcon = Truck;

// Экспорт всех иконок в объекте
export const CUSTOM_CLOTHING_ICONS = {
    "tshirt": TshirtIcon, "hoodie": HoodieIcon, "pants": PantsIcon, "jacket": JacketIcon,
    "dress": DressIcon, "sneakers": SneakersIcon, "boots": BootsIcon, "cap": CapIcon,
    "glasses": GlassesIcon, "watch": WatchIcon, "handbag": HandbagIcon, "backpack": BackpackIcon,
    "totebag": ToteBagIcon, "tag": TagIcon, "baby": BabyIcon, "crown": CrownIcon,
    "sparkles": SparklesIcon, "discount": DiscountIcon, "heart": HeartIcon, "star": StarIcon,
    "flame": FlameIcon, "belt": BeltIcon, "wallet": WalletIcon, "umbrella": UmbrellaIcon,
    "package": PackageIcon, "supplies": SuppliesIcon, "mug": MugIcon, "notebook": NotebookIcon,
};

// Маппинг названий категорий на иконки
export const CATEGORY_ICON_MAP: Record<string, ComponentType<LucideProps>> = {
    "Футболки": TshirtIcon, "Худи": HoodieIcon, "Штаны": PantsIcon, "Куртка": JacketIcon,
    "Платье": DressIcon, "Кроссовки": SneakersIcon, "Ботинки": BootsIcon, "Кепка": CapIcon,
    "Очки": GlassesIcon, "Часы": WatchIcon, "Сумка": HandbagIcon, "Рюкзак": BackpackIcon,
    "Шоппер": ToteBagIcon, "Бирка": TagIcon, "Детское": BabyIcon, "Премиум": CrownIcon,
    "Блеск": SparklesIcon, "Скидка": DiscountIcon, "Любимое": HeartIcon, "Хит": StarIcon,
    "Горячее": FlameIcon, "Ремень": BeltIcon, "Кошелек": WalletIcon, "Зонт": UmbrellaIcon,
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
