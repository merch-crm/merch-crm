"use client";

import React, { useState } from 'react';

import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { 
  Search, 
  CheckCircle, 
  AlertCircle,
  CreditCard,
  Plus,
  Settings
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select } from '@/components/ui/select';

export default function InputsPage() {
  return (
    <CategoryPage 
      title="Инпуты и Селекты" 
      description="Текстовые поля, поиск, специализированные селекторы и командные меню в едином Midnight интерфейсе." 
      count={10}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-16">
        
        {/* 1. Basic Input */}
        <ComponentShowcase title="Базовое поле" source="custom">
          <div className="max-w-md w-full mx-auto space-y-3">
             <div className="group">
                <label className="text-[11px] font-black text-slate-400   ml-1 mb-1.5 block">Электронная почта</label>
                <input placeholder="admin@merchcrm.com" className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-5 py-3 text-sm font-medium focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-none" />
             </div>
          </div>
        </ComponentShowcase>

        {/* 2. Standard Select (Moved from Selects) */}
        <ComponentShowcase 
          title="Стандартный Select" 
          source="custom" 
          desc="Базовый селектор с кастомной стилизацией и анимациями." 
        >
          <SelectDemo />
        </ComponentShowcase>

        {/* 3. Number Stepper */}
        <ComponentShowcase title="Числовой селектор" source="custom">
           <div className="flex items-center gap-3 w-fit mx-auto bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
              <button className="size-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center font-bold text-slate-400 hover:text-slate-950 active:scale-95 transition-all">−</button>
              <span className="w-12 text-center text-sm font-black">12</span>
              <button className="size-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center font-bold text-slate-400 hover:text-slate-950 active:scale-95 transition-all">+</button>
           </div>
        </ComponentShowcase>

        {/* 4. Textarea */}
        <ComponentShowcase title="Многострочный ввод" source="custom">
           <div className="max-w-md w-full mx-auto">
              <textarea placeholder="Опишите детали сделки..." rows={3} className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm font-medium focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-none resize-none" />
           </div>
        </ComponentShowcase>

        {/* 5. Action Button Input */}
        <ComponentShowcase title="Поле с кнопкой" source="custom">
           <div className="max-w-md w-full mx-auto relative group">
              <input placeholder="Промокод" className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-5 py-3 text-sm font-medium outline-none pr-24" />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#1A2233] text-white text-[11px] font-black rounded-xl   shadow-sm hover:bg-[#252E44] active:scale-95 transition-all">Применить</button>
           </div>
        </ComponentShowcase>

        {/* 6. Command Menu Preview (Moved from Selects) */}
        <ComponentShowcase 
          title="Командное меню" 
          source="custom" 
          desc="CMD+K интерфейс для быстрой навигации." 
        >
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden mx-auto">
             <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
                <Search className="size-5 text-slate-400" />
                <input placeholder="Найти..." className="flex-1 bg-transparent text-sm font-bold text-slate-900 outline-none" />
                <kbd className="h-6 px-1.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-black text-slate-400">Esc</kbd>
             </div>
             <div className="p-4 space-y-1">
                {[
                  { icon: Plus, label: 'Новая сделка', shortcut: 'N D' },
                  { icon: Settings, label: 'Настройки', shortcut: ',' }
                ].map((a, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-slate-50 cursor-pointer group transition-all">
                     <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all"><a.icon className="size-4" /></div>
                        <span className="text-sm font-bold text-slate-700">{a.label}</span>
                     </div>
                     <span className="text-[11px] font-black text-slate-300">{a.shortcut}</span>
                  </div>
                ))}
             </div>
          </div>
        </ComponentShowcase>

        {/* 7. Success State */}
        <ComponentShowcase title="Успешная валидация" source="custom">
           <div className="max-w-md w-full mx-auto relative group">
              <input value="leonid.m" readOnly className="w-full rounded-2xl bg-emerald-50 border-2 border-emerald-100 px-5 py-3 text-sm font-medium text-emerald-700 outline-none" />
              <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-emerald-500" />
           </div>
        </ComponentShowcase>

        {/* 8. Error State */}
        <ComponentShowcase title="Ошибка ввода" source="custom">
           <div className="max-w-md w-full mx-auto relative group">
              <input value="invalid-email" readOnly className="w-full rounded-2xl bg-red-50 border-2 border-red-100 px-5 py-3 text-sm font-medium text-red-700 outline-none" />
              <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-red-500 animate-pulse" />
           </div>
        </ComponentShowcase>

        {/* 9. Credit Card Input */}
        <ComponentShowcase title="Маска (Карта)" source="custom">
           <div className="max-w-md w-full mx-auto relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input placeholder="0000 0000 0000 0000" className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-11 py-3 text-sm font-medium outline-none" />
           </div>
        </ComponentShowcase>

        {/* 10. Search & Input (Merged) */}
        <ComponentShowcase title="Инпуты и Поиск" source="custom">
          <div className="max-w-md w-full mx-auto space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input className="pl-10 h-11" placeholder="Поиск данных..." />
            </div>
            <Input type="email" placeholder="Email адрес" className="h-11 border-dashed" />
          </div>
        </ComponentShowcase>

      </div>
    </CategoryPage>
  );
}

function SelectDemo() {
  const [value, setValue] = useState("active");
  const options = [
    { id: "new", title: "Новый лид" },
    { id: "active", title: "В работе" },
    { id: "closed", title: "Успешно закрыт" }
  ];
  return (
    <div className="max-w-xs w-full mx-auto py-8">
      <Select options={options} value={value} onChange={setValue} placeholder="Выберите статус" />
    </div>
  );
}
