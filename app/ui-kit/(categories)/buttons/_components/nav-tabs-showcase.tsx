"use client";

import React, { useState } from "react";
import { LayoutGrid, Layers, MapPin, TableProperties, RotateCcw, Archive } from "lucide-react";
import { NavTabs, NavTabItem } from "@/components/ui/nav-tabs";
import { ComponentShowcase } from "@/components/ui-kit";

const DEMO_TABS: NavTabItem[] = [
  { id: "overview", label: "Обзор", icon: LayoutGrid },
  { id: "categories", label: "Категории", icon: Layers },
  { id: "storage", label: "Хранение", icon: MapPin },
  { id: "characteristics", label: "Характеристики", icon: TableProperties },
  { id: "history", label: "История", icon: RotateCcw },
  { id: "archive", label: "Архив", icon: Archive },
];

export function NavTabsShowcase() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <ComponentShowcase 
      title="08. Навигационные табы / NavTabs" 
      source="custom" 
      code='import { NavTabs } from "@/components/ui/nav-tabs";'
      desc="Универсальный компонент для переключения разделов с плавной анимацией и адаптивностью под мобильные устройства."
    >
      <div className="flex flex-col gap-6 w-full max-w-4xl">
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Демонстрация навигации</p>
          <NavTabs 
            tabs={DEMO_TABS} 
            activeTab={activeTab} 
            onChange={setActiveTab} 
          />
        </div>

        <div className="p-8 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Активный раздел: {DEMO_TABS.find(t => t.id === activeTab)?.label}</h3>
            <p className="text-sm text-slate-500 mt-2">Контент раздела подгружается динамически при смене таба.</p>
          </div>
        </div>
      </div>
    </ComponentShowcase>
  );
}
