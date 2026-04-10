"use client";

import React from "react";

// Custom Clothing Icons (designed for this CRM)
import {
  TshirtCustomIcon, HoodieCustomIcon,
  PantsCustomIcon, CapCustomIcon,
  PackagingCustomIcon, SuppliesCustomIcon, ToteBagCustomIcon,
  BackpackCustomIcon,
  JacketCustomIcon, SneakersCustomIcon,
  MugCustomIcon, NotebookCustomIcon,
  UmbrellaCustomIcon
} from "../warehouse/custom-clothing-icons";

// Lucide Icons (general purpose)
import {
  Package, Scissors, Box, Zap, Hourglass,
  Truck, Archive, Barcode, ShoppingCart, Gift, Scale, Plane, Warehouse, ClipboardList,
  Pencil, Brush, Ruler, Hammer, Wrench, Eraser, PenTool, Pipette,
  Palette, Printer, FlaskConical,
  Shield, Info, Settings, Search, Bell, Calendar, Home, Mail, Lock,
  Eye, Layers
} from "lucide-react";


const customIcons = [
  { name: "TshirtCustomIcon", icon: TshirtCustomIcon, label: "Футболка" },
  { name: "HoodieCustomIcon", icon: HoodieCustomIcon, label: "Худи" },
  { name: "PantsCustomIcon", icon: PantsCustomIcon, label: "Штаны" },
  { name: "JacketCustomIcon", icon: JacketCustomIcon, label: "Куртка" },
  { name: "SneakersCustomIcon", icon: SneakersCustomIcon, label: "Кроссовки" },
  { name: "CapCustomIcon", icon: CapCustomIcon, label: "Кепка" },
  { name: "BackpackCustomIcon", icon: BackpackCustomIcon, label: "Рюкзак" },
  { name: "ToteBagCustomIcon", icon: ToteBagCustomIcon, label: "Шоппер" },
  { name: "UmbrellaCustomIcon", icon: UmbrellaCustomIcon, label: "Зонт" },
  { name: "PackagingCustomIcon", icon: PackagingCustomIcon, label: "Упаковка" },
  { name: "SuppliesCustomIcon", icon: SuppliesCustomIcon, label: "Расходники" },
  { name: "MugCustomIcon", icon: MugCustomIcon, label: "Кружка" },
  { name: "NotebookCustomIcon", icon: NotebookCustomIcon, label: "Блокнот" },
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
  icons: { name: string; icon: React.ComponentType<{ className?: string }>; label: string }[];
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
            <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600 text-center leading-tight truncate w-full">
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
    <section className="space-y-3">
      <div className="glass-panel p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Иконки</h2>
        <p className="text-slate-500 text-sm mb-8">
          В проекте используется единая библиотека иконок: Lucide. Это позволяет экономить размер бандла и упрощает поддержку.
        </p>

        <IconSection title="⭐ Кастомные иконки — Специально для Merch CRM (на базе Lucide)" color="bg-gradient-to-r from-primary to-violet-500" hoverColor="group-hover:text-primary group-hover:border-primary/50" icons={customIcons} packageName="custom-clothing-icons.tsx" />

        <IconSection title="Lucide React — Общие" color="bg-emerald-500" hoverColor="group-hover:text-emerald-500 group-hover:border-emerald-200" icons={lucideIcons} packageName="lucide-react" />

        {/* Usage Example */}
        <div className="mt-10 p-6 bg-slate-900 rounded-2xl">
          <h4 className="text-sm font-bold text-white mb-3">Пример использования</h4>
          <pre className="text-xs text-slate-300 overflow-x-auto">
            {`// Lucide React
import { Package, Box, Truck } from "lucide-react";

// В компоненте
<Package className="w-6 h-6" />`}
          </pre>
        </div>
      </div>
    </section>
  );
}
