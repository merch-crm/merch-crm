"use client";

import React from "react";

// Custom Clothing Icons (designed for this CRM)
import {
    TshirtCustomIcon, HoodieCustomIcon, SweatshirtCustomIcon,
    LongsleeveCustomIcon, AnorakCustomIcon, ZipHoodieCustomIcon,
    PantsCustomIcon, PoloCustomIcon, CapCustomIcon,
    PackagingCustomIcon, SuppliesCustomIcon, ToteBagCustomIcon,
    BackpackCustomIcon, SocksCustomIcon, BeanieCustomIcon,
    JacketCustomIcon, SneakersCustomIcon,
    ShortsCustomIcon, SkirtCustomIcon, VestCustomIcon,
    GlovesCustomIcon, ScarfCustomIcon, BadgeCustomIcon,
    StickerCustomIcon, MugCustomIcon, NotebookCustomIcon,
    UmbrellaCustomIcon
} from "../warehouse/custom-clothing-icons";

// Phosphor Icons (clothing-specific icons)
import {
    TShirt, Hoodie, Pants, CoatHanger, Dress, Sneaker, Boot,
    BaseballCap, Sunglasses, Watch, Handbag, Backpack,
    Tote, Tag, Baby, Crown, Sparkle,
    SealPercent, Heart, Star, Fire, Belt, Wallet, Umbrella
} from "@phosphor-icons/react";

// Lucide Icons (general purpose)
import {
    Package, Scissors, Box, Zap, Hourglass,
    Truck, Archive, Barcode, ShoppingCart, Gift, Scale, Plane, Warehouse, ClipboardList,
    Pencil, Brush, Ruler, Hammer, Wrench, Eraser, PenTool, Pipette,
    Palette, Printer, FlaskConical,
    Shield, Info, Settings, Search, Bell, Calendar, Home, Mail, Lock,
    Eye, Layers
} from "lucide-react";

// Tabler Icons
import {
    IconShirt, IconJacket, IconHanger, IconSock, IconShoe,
    IconChefHat, IconEyeglass, IconDeviceWatch, IconShoppingBag as TablerBag, IconBackpack as TablerBackpack,
    IconWallet, IconUmbrella, IconDiamond, IconCrown, IconStar,
    IconHeart, IconFlame, IconBolt, IconSnowflake, IconSun,
    IconMoon, IconCloud, IconRainbow, IconLeaf,
    IconBox, IconPackage, IconTruck, IconPlane, IconShip,
    IconBuildingWarehouse, IconClipboard, IconBarcode, IconScale,
    IconBrush, IconPencil, IconRuler, IconScissors, IconPalette,
    IconPrinter, IconEraser, IconSettings, IconSearch, IconBell,
    IconCalendar, IconHome, IconMail, IconLock, IconEye, IconShield
} from "@tabler/icons-react";

// React Icons (multiple packs)
import {
    FaTshirt, FaSocks, FaHatCowboy, FaGlasses, FaShoppingBag,
    FaGift, FaTruck, FaBox, FaWarehouse, FaStar, FaHeart, FaFire,
    FaBolt, FaSnowflake, FaSun, FaMoon, FaCloud, FaLeaf, FaGem,
    FaCrown, FaUmbrella, FaWallet, FaShoppingCart, FaArchive
} from "react-icons/fa";

import {
    BsWatch, BsBackpack, BsHandbag, BsScissors, BsBrush,
    BsPencil, BsRulers, BsPalette, BsPrinter, BsEraser,
    BsGear, BsSearch, BsBell, BsCalendar, BsHouse, BsEnvelope,
    BsLock, BsEye, BsShield, BsBoxSeam
} from "react-icons/bs";

import {
    HiOutlineShoppingBag, HiOutlineGift, HiOutlineTruck,
    HiOutlineCube, HiOutlineStar, HiOutlineHeart, HiOutlineFire,
    HiOutlineBolt, HiOutlineSun, HiOutlineMoon, HiOutlineCloud,
    HiOutlineCog, HiOutlineMagnifyingGlass, HiOutlineBell,
    HiOutlineCalendar, HiOutlineHome, HiOutlineEnvelope,
    HiOutlineLockClosed, HiOutlineEye, HiOutlineShieldCheck
} from "react-icons/hi2";

const phosphorIcons = [
    { name: "TShirt", icon: TShirt, label: "Футболка" },
    { name: "Hoodie", icon: Hoodie, label: "Худи" },
    { name: "Pants", icon: Pants, label: "Штаны" },
    { name: "CoatHanger", icon: CoatHanger, label: "Куртка" },
    { name: "Dress", icon: Dress, label: "Платье" },
    { name: "Sneaker", icon: Sneaker, label: "Кроссовки" },
    { name: "Boot", icon: Boot, label: "Ботинки" },
    { name: "BaseballCap", icon: BaseballCap, label: "Кепка" },
    { name: "Sunglasses", icon: Sunglasses, label: "Очки" },
    { name: "Watch", icon: Watch, label: "Часы" },
    { name: "Handbag", icon: Handbag, label: "Сумка" },
    { name: "Backpack", icon: Backpack, label: "Рюкзак" },
    { name: "Tote", icon: Tote, label: "Шоппер" },
    { name: "Tag", icon: Tag, label: "Бирка" },
    { name: "Baby", icon: Baby, label: "Детское" },
    { name: "Crown", icon: Crown, label: "Премиум" },
    { name: "Sparkle", icon: Sparkle, label: "Блеск" },
    { name: "SealPercent", icon: SealPercent, label: "Скидка" },
    { name: "Heart", icon: Heart, label: "Любимое" },
    { name: "Star", icon: Star, label: "Хит" },
    { name: "Fire", icon: Fire, label: "Горячее" },
    { name: "Belt", icon: Belt, label: "Ремень" },
    { name: "Wallet", icon: Wallet, label: "Кошелёк" },
    { name: "Umbrella", icon: Umbrella, label: "Зонт" },
];

const customIcons = [
    { name: "TshirtCustomIcon", icon: TshirtCustomIcon, label: "Футболка" },
    { name: "HoodieCustomIcon", icon: HoodieCustomIcon, label: "Худи" },
    { name: "SweatshirtCustomIcon", icon: SweatshirtCustomIcon, label: "Свитшот" },
    { name: "LongsleeveCustomIcon", icon: LongsleeveCustomIcon, label: "Лонгслив" },
    { name: "AnorakCustomIcon", icon: AnorakCustomIcon, label: "Анорак" },
    { name: "ZipHoodieCustomIcon", icon: ZipHoodieCustomIcon, label: "Зип-худи" },
    { name: "PantsCustomIcon", icon: PantsCustomIcon, label: "Штаны" },
    { name: "PoloCustomIcon", icon: PoloCustomIcon, label: "Поло" },
    { name: "CapCustomIcon", icon: CapCustomIcon, label: "Кепка" },
    { name: "PackagingCustomIcon", icon: PackagingCustomIcon, label: "Упаковка" },
    { name: "SuppliesCustomIcon", icon: SuppliesCustomIcon, label: "Расходники" },
    { name: "ToteBagCustomIcon", icon: ToteBagCustomIcon, label: "Шоппер" },
    { name: "BackpackCustomIcon", icon: BackpackCustomIcon, label: "Рюкзак" },
    { name: "SocksCustomIcon", icon: SocksCustomIcon, label: "Носки" },
    { name: "BeanieCustomIcon", icon: BeanieCustomIcon, label: "Шапка" },
    { name: "JacketCustomIcon", icon: JacketCustomIcon, label: "Куртка" },
    { name: "SneakersCustomIcon", icon: SneakersCustomIcon, label: "Кроссовки" },
    { name: "ShortsCustomIcon", icon: ShortsCustomIcon, label: "Шорты" },
    { name: "SkirtCustomIcon", icon: SkirtCustomIcon, label: "Юбка" },
    { name: "VestCustomIcon", icon: VestCustomIcon, label: "Жилетка" },
    { name: "GlovesCustomIcon", icon: GlovesCustomIcon, label: "Перчатки" },
    { name: "ScarfCustomIcon", icon: ScarfCustomIcon, label: "Шарф" },
    { name: "BadgeCustomIcon", icon: BadgeCustomIcon, label: "Значок" },
    { name: "StickerCustomIcon", icon: StickerCustomIcon, label: "Стикер" },
    { name: "MugCustomIcon", icon: MugCustomIcon, label: "Кружка" },
    { name: "NotebookCustomIcon", icon: NotebookCustomIcon, label: "Блокнот" },
    { name: "UmbrellaCustomIcon", icon: UmbrellaCustomIcon, label: "Зонт" },
];

const tablerIcons = [
    { name: "IconShirt", icon: IconShirt, label: "Рубашка" },
    { name: "IconJacket", icon: IconJacket, label: "Куртка" },
    { name: "IconHanger", icon: IconHanger, label: "Вешалка" },
    { name: "IconSock", icon: IconSock, label: "Носки" },
    { name: "IconShoe", icon: IconShoe, label: "Обувь" },
    { name: "IconChefHat", icon: IconChefHat, label: "Шапка" },
    { name: "IconEyeglass", icon: IconEyeglass, label: "Очки" },
    { name: "IconDeviceWatch", icon: IconDeviceWatch, label: "Часы" },
    { name: "IconShoppingBag", icon: TablerBag, label: "Сумка" },
    { name: "IconBackpack", icon: TablerBackpack, label: "Рюкзак" },
    { name: "IconWallet", icon: IconWallet, label: "Кошелёк" },
    { name: "IconUmbrella", icon: IconUmbrella, label: "Зонт" },
    { name: "IconDiamond", icon: IconDiamond, label: "Бриллиант" },
    { name: "IconCrown", icon: IconCrown, label: "Корона" },
    { name: "IconStar", icon: IconStar, label: "Звезда" },
    { name: "IconHeart", icon: IconHeart, label: "Сердце" },
    { name: "IconFlame", icon: IconFlame, label: "Огонь" },
    { name: "IconBolt", icon: IconBolt, label: "Молния" },
    { name: "IconSnowflake", icon: IconSnowflake, label: "Снежинка" },
    { name: "IconSun", icon: IconSun, label: "Солнце" },
    { name: "IconMoon", icon: IconMoon, label: "Луна" },
    { name: "IconCloud", icon: IconCloud, label: "Облако" },
    { name: "IconRainbow", icon: IconRainbow, label: "Радуга" },
    { name: "IconLeaf", icon: IconLeaf, label: "Лист" },
    { name: "IconBox", icon: IconBox, label: "Коробка" },
    { name: "IconPackage", icon: IconPackage, label: "Посылка" },
    { name: "IconTruck", icon: IconTruck, label: "Грузовик" },
    { name: "IconPlane", icon: IconPlane, label: "Самолёт" },
    { name: "IconShip", icon: IconShip, label: "Корабль" },
    { name: "IconBuildingWarehouse", icon: IconBuildingWarehouse, label: "Склад" },
    { name: "IconClipboard", icon: IconClipboard, label: "Планшет" },
    { name: "IconBarcode", icon: IconBarcode, label: "Штрих-код" },
    { name: "IconScale", icon: IconScale, label: "Весы" },
    { name: "IconBrush", icon: IconBrush, label: "Кисть" },
    { name: "IconPencil", icon: IconPencil, label: "Карандаш" },
    { name: "IconRuler", icon: IconRuler, label: "Линейка" },
    { name: "IconScissors", icon: IconScissors, label: "Ножницы" },
    { name: "IconPalette", icon: IconPalette, label: "Палитра" },
    { name: "IconPrinter", icon: IconPrinter, label: "Принтер" },
    { name: "IconEraser", icon: IconEraser, label: "Ластик" },
    { name: "IconSettings", icon: IconSettings, label: "Настройки" },
    { name: "IconSearch", icon: IconSearch, label: "Поиск" },
    { name: "IconBell", icon: IconBell, label: "Звонок" },
    { name: "IconCalendar", icon: IconCalendar, label: "Календарь" },
    { name: "IconHome", icon: IconHome, label: "Дом" },
    { name: "IconMail", icon: IconMail, label: "Почта" },
    { name: "IconLock", icon: IconLock, label: "Замок" },
    { name: "IconEye", icon: IconEye, label: "Глаз" },
    { name: "IconShield", icon: IconShield, label: "Щит" },
];

const reactIconsFa = [
    { name: "FaTshirt", icon: FaTshirt, label: "Футболка" },
    { name: "FaSocks", icon: FaSocks, label: "Носки" },
    { name: "FaHatCowboy", icon: FaHatCowboy, label: "Шляпа" },
    { name: "FaGlasses", icon: FaGlasses, label: "Очки" },
    { name: "FaShoppingBag", icon: FaShoppingBag, label: "Сумка" },
    { name: "FaGift", icon: FaGift, label: "Подарок" },
    { name: "FaTruck", icon: FaTruck, label: "Грузовик" },
    { name: "FaBox", icon: FaBox, label: "Коробка" },
    { name: "FaWarehouse", icon: FaWarehouse, label: "Склад" },
    { name: "FaStar", icon: FaStar, label: "Звезда" },
    { name: "FaHeart", icon: FaHeart, label: "Сердце" },
    { name: "FaFire", icon: FaFire, label: "Огонь" },
    { name: "FaBolt", icon: FaBolt, label: "Молния" },
    { name: "FaSnowflake", icon: FaSnowflake, label: "Снежинка" },
    { name: "FaSun", icon: FaSun, label: "Солнце" },
    { name: "FaMoon", icon: FaMoon, label: "Луна" },
    { name: "FaCloud", icon: FaCloud, label: "Облако" },
    { name: "FaLeaf", icon: FaLeaf, label: "Лист" },
    { name: "FaGem", icon: FaGem, label: "Бриллиант" },
    { name: "FaCrown", icon: FaCrown, label: "Корона" },
    { name: "FaUmbrella", icon: FaUmbrella, label: "Зонт" },
    { name: "FaWallet", icon: FaWallet, label: "Кошелёк" },
    { name: "FaShoppingCart", icon: FaShoppingCart, label: "Корзина" },
    { name: "FaArchive", icon: FaArchive, label: "Архив" },
];

const reactIconsBs = [
    { name: "BsWatch", icon: BsWatch, label: "Часы" },
    { name: "BsBackpack", icon: BsBackpack, label: "Рюкзак" },
    { name: "BsHandbag", icon: BsHandbag, label: "Сумка" },
    { name: "BsScissors", icon: BsScissors, label: "Ножницы" },
    { name: "BsBrush", icon: BsBrush, label: "Кисть" },
    { name: "BsPencil", icon: BsPencil, label: "Карандаш" },
    { name: "BsRulers", icon: BsRulers, label: "Линейка" },
    { name: "BsPalette", icon: BsPalette, label: "Палитра" },
    { name: "BsPrinter", icon: BsPrinter, label: "Принтер" },
    { name: "BsEraser", icon: BsEraser, label: "Ластик" },
    { name: "BsGear", icon: BsGear, label: "Шестерёнка" },
    { name: "BsSearch", icon: BsSearch, label: "Поиск" },
    { name: "BsBell", icon: BsBell, label: "Звонок" },
    { name: "BsCalendar", icon: BsCalendar, label: "Календарь" },
    { name: "BsHouse", icon: BsHouse, label: "Дом" },
    { name: "BsEnvelope", icon: BsEnvelope, label: "Конверт" },
    { name: "BsLock", icon: BsLock, label: "Замок" },
    { name: "BsEye", icon: BsEye, label: "Глаз" },
    { name: "BsShield", icon: BsShield, label: "Щит" },
    { name: "BsBoxSeam", icon: BsBoxSeam, label: "Коробка" },
];

const reactIconsHi = [
    { name: "HiShoppingBag", icon: HiOutlineShoppingBag, label: "Сумка" },
    { name: "HiGift", icon: HiOutlineGift, label: "Подарок" },
    { name: "HiTruck", icon: HiOutlineTruck, label: "Грузовик" },
    { name: "HiCube", icon: HiOutlineCube, label: "Куб" },
    { name: "HiStar", icon: HiOutlineStar, label: "Звезда" },
    { name: "HiHeart", icon: HiOutlineHeart, label: "Сердце" },
    { name: "HiFire", icon: HiOutlineFire, label: "Огонь" },
    { name: "HiBolt", icon: HiOutlineBolt, label: "Молния" },
    { name: "HiSun", icon: HiOutlineSun, label: "Солнце" },
    { name: "HiMoon", icon: HiOutlineMoon, label: "Луна" },
    { name: "HiCloud", icon: HiOutlineCloud, label: "Облако" },
    { name: "HiCog", icon: HiOutlineCog, label: "Шестерёнка" },
    { name: "HiSearch", icon: HiOutlineMagnifyingGlass, label: "Поиск" },
    { name: "HiBell", icon: HiOutlineBell, label: "Звонок" },
    { name: "HiCalendar", icon: HiOutlineCalendar, label: "Календарь" },
    { name: "HiHome", icon: HiOutlineHome, label: "Дом" },
    { name: "HiEnvelope", icon: HiOutlineEnvelope, label: "Конверт" },
    { name: "HiLock", icon: HiOutlineLockClosed, label: "Замок" },
    { name: "HiEye", icon: HiOutlineEye, label: "Глаз" },
    { name: "HiShield", icon: HiOutlineShieldCheck, label: "Щит" },
];

const lucideIcons = [
    { name: "Package", icon: Package, label: "Посылка" },
    { name: "Scissors", icon: Scissors, label: "Ножницы" },
    { name: "Box", icon: Box, label: "Коробка" },
    { name: "Zap", icon: Zap, label: "Молния" },
    { name: "Hourglass", icon: Hourglass, label: "Часы" },
    { name: "Truck", icon: Truck, label: "Доставка" },
    { name: "Archive", icon: Archive, label: "Архив" },
    { name: "Barcode", icon: Barcode, label: "Штрих-код" },
    { name: "ShoppingCart", icon: ShoppingCart, label: "Корзина" },
    { name: "Gift", icon: Gift, label: "Подарок" },
    { name: "Scale", icon: Scale, label: "Весы" },
    { name: "Plane", icon: Plane, label: "Самолёт" },
    { name: "Warehouse", icon: Warehouse, label: "Склад" },
    { name: "ClipboardList", icon: ClipboardList, label: "Список" },
    { name: "Pencil", icon: Pencil, label: "Карандаш" },
    { name: "Brush", icon: Brush, label: "Кисть" },
    { name: "Ruler", icon: Ruler, label: "Линейка" },
    { name: "Hammer", icon: Hammer, label: "Молоток" },
    { name: "Wrench", icon: Wrench, label: "Ключ" },
    { name: "Eraser", icon: Eraser, label: "Ластик" },
    { name: "PenTool", icon: PenTool, label: "Перо" },
    { name: "Pipette", icon: Pipette, label: "Пипетка" },
    { name: "Palette", icon: Palette, label: "Палитра" },
    { name: "Printer", icon: Printer, label: "Принтер" },
    { name: "FlaskConical", icon: FlaskConical, label: "Колба" },
    { name: "Shield", icon: Shield, label: "Щит" },
    { name: "Info", icon: Info, label: "Инфо" },
    { name: "Settings", icon: Settings, label: "Настройки" },
    { name: "Search", icon: Search, label: "Поиск" },
    { name: "Bell", icon: Bell, label: "Звонок" },
    { name: "Calendar", icon: Calendar, label: "Календарь" },
    { name: "Home", icon: Home, label: "Дом" },
    { name: "Mail", icon: Mail, label: "Почта" },
    { name: "Lock", icon: Lock, label: "Замок" },
    { name: "Eye", icon: Eye, label: "Глаз" },
    { name: "Layers", icon: Layers, label: "Слои" },
];

interface IconSectionProps {
    title: string;
    color: string;
    hoverColor: string;
    icons: { name: string; icon: React.ElementType; label: string }[];
    packageName: string;
}

const IconSection = ({ title, color, hoverColor, icons, packageName }: IconSectionProps) => (
    <div className="mb-10">
        <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${color}`}></span>
            {title}
        </h3>
        <p className="text-xs text-slate-400 mb-4 font-mono">{packageName}</p>
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
            {icons.map((item) => {
                const Icon = item.icon;
                return (
                    <div
                        key={item.name}
                        className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-slate-100/50 border border-transparent hover:border-slate-200 transition-all cursor-pointer`}
                        title={item.name}
                    >
                        <div className={`w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 ${hoverColor} group-hover:scale-110 transition-all shadow-sm`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[8px] font-medium text-slate-400 group-hover:text-slate-600 text-center leading-tight truncate w-full">
                            {item.label}
                        </span>
                    </div>
                );
            })}
        </div>
    </div>
);

export default function IconsShowcaseCRM() {
    return (
        <section className="space-y-8">
            <div className="glass-panel p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Иконки</h2>
                <p className="text-slate-500 text-sm mb-8">
                    Все доступные иконки из 6 пакетов: Custom, Phosphor, Tabler, React Icons (FA, BS, HI), Lucide
                </p>

                <IconSection
                    title="⭐ Кастомные иконки — Специально для Merch CRM"
                    color="bg-gradient-to-r from-primary to-violet-500"
                    hoverColor="group-hover:text-primary group-hover:border-primary/50"
                    icons={customIcons}
                    packageName="custom-clothing-icons.tsx"
                />

                <IconSection
                    title="Phosphor Icons — Одежда и аксессуары"
                    color="bg-primary"
                    hoverColor="group-hover:text-primary group-hover:border-primary/30"
                    icons={phosphorIcons}
                    packageName="@phosphor-icons/react"
                />

                <IconSection
                    title="Tabler Icons"
                    color="bg-cyan-500"
                    hoverColor="group-hover:text-cyan-500 group-hover:border-cyan-200"
                    icons={tablerIcons}
                    packageName="@tabler/icons-react"
                />

                <IconSection
                    title="React Icons — Font Awesome"
                    color="bg-blue-500"
                    hoverColor="group-hover:text-blue-500 group-hover:border-blue-200"
                    icons={reactIconsFa}
                    packageName="react-icons/fa"
                />

                <IconSection
                    title="React Icons — Bootstrap"
                    color="bg-purple-500"
                    hoverColor="group-hover:text-purple-500 group-hover:border-purple-200"
                    icons={reactIconsBs}
                    packageName="react-icons/bs"
                />

                <IconSection
                    title="React Icons — Heroicons"
                    color="bg-indigo-500"
                    hoverColor="group-hover:text-indigo-500 group-hover:border-indigo-200"
                    icons={reactIconsHi}
                    packageName="react-icons/hi2"
                />

                <IconSection
                    title="Lucide React — Общие"
                    color="bg-emerald-500"
                    hoverColor="group-hover:text-emerald-500 group-hover:border-emerald-200"
                    icons={lucideIcons}
                    packageName="lucide-react"
                />

                {/* Usage Example */}
                <div className="mt-10 p-6 bg-slate-900 rounded-2xl">
                    <h4 className="text-sm font-bold text-white mb-3">Пример использования</h4>
                    <pre className="text-xs text-slate-300 overflow-x-auto">
                        {`// Phosphor Icons (одежда)
import { TShirt, Hoodie, Pants } from "@phosphor-icons/react";

// Tabler Icons (48 иконок)
import { IconShirt, IconJacket, IconSock } from "@tabler/icons-react";

// React Icons - Font Awesome
import { FaTshirt, FaSocks } from "react-icons/fa";

// React Icons - Bootstrap
import { BsWatch, BsBackpack } from "react-icons/bs";

// React Icons - Heroicons
import { HiOutlineShoppingBag } from "react-icons/hi2";

// Lucide React
import { Package, Box, Truck } from "lucide-react";

// В компоненте
<TShirt className="w-6 h-6" />
<IconShirt size={24} />
<FaTshirt size={24} />
<BsWatch size={24} />
<HiOutlineShoppingBag className="w-6 h-6" />
<Package className="w-6 h-6" />`}
                    </pre>
                </div>
            </div>
        </section>
    );
}
