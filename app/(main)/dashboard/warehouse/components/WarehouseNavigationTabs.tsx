"use client";

import React from "react";
import { LayoutGrid, Layers, MapPin, TableProperties, RotateCcw, Archive } from "lucide-react";
import { NavTabs, NavTabItem } from "@/components/ui/nav-tabs";

export const WAREHOUSE_TABS: NavTabItem[] = [
  { id: "overview", label: "Обзор", icon: LayoutGrid, href: "/dashboard/warehouse/overview" },
  { id: "categories", label: "Категории", icon: Layers, href: "/dashboard/warehouse/categories" },
  { id: "storage", label: "Хранение", icon: MapPin, href: "/dashboard/warehouse/storage" },
  { id: "characteristics", label: "Характеристики", icon: TableProperties, href: "/dashboard/warehouse/characteristics" },
  { 
    id: "history", 
    label: "История", 
    icon: RotateCcw, 
    href: "/dashboard/warehouse/history", 
    activeColor: "bg-[#550bf5]", 
    shadowColor: "shadow-[#550bf5]/25" 
  },
  { 
    id: "archive", 
    label: "Архив", 
    icon: Archive, 
    href: "/dashboard/warehouse/archive", 
    activeColor: "bg-amber-500", 
    shadowColor: "shadow-amber-500/25" 
  }
];

export const WAREHOUSE_TAB_INFO: Record<string, { title: string; description: string }> = {
  "/dashboard/warehouse/overview": { title: "Обзор склада", description: "Сводные показатели, активность и критические остатки" }, 
  "/dashboard/warehouse/categories": { title: "Категории", description: "Управление структурой каталога, категориями и актуальными остатками" }, 
  "/dashboard/warehouse/storage": { title: "Места хранения", description: "Мониторинг складов, ячеек и перемещений продукции" }, 
  "/dashboard/warehouse/characteristics": { title: "Характеристики", description: "Настройка характеристик, типов атрибутов и параметров SKU" }, 
  "/dashboard/warehouse/history": { title: "Журнал операций", description: "Детальная история всех складских транзакций и изменений" }, 
  "/dashboard/warehouse/archive": { title: "Архив продукции", description: "Список позиций, выведенных из эксплуатации или удаленных" }, 
  "/dashboard/warehouse/items/new": { title: "Новая позиция", description: "Создание новой карточки товара в системе" }
};

interface WarehouseNavigationTabsProps {
  activeTab: string;
}

export function WarehouseNavigationTabs({ activeTab }: WarehouseNavigationTabsProps) {
  return (
    <NavTabs 
      tabs={WAREHOUSE_TABS} 
      activeTab={activeTab} 
    />
  );
}
