"use client";

import React, { useState } from 'react';

import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { 
 Search, 
 CheckCircle, 
 AlertCircle,
 CreditCard,
 Plus,
 Settings,
 Command,
 ChevronRight,
 Users
} from 'lucide-react';
import { Select } from '@/components/ui/select';
import { DateRangePicker, DateRangePickerWithPresets, type DateRange } from "@/components/ui/date-range-picker";
import { subDays, startOfToday } from "date-fns";

export default function InputsPage() {
 const today = startOfToday();
 const [range, setRange] = useState<DateRange>({ from: subDays(today, 7), to: today });
 const [rangeWithPresets, setRangeWithPresets] = useState<DateRange>({ from: today, to: today });
 
 const selectOptions = [
  { id: '1', title: 'Активен', color: '#10b981' },
  { id: '2', title: 'Черновик', color: '#64748b' },
  { id: '3', title: 'Архив', color: '#f43f5e' },
 ];
 const [selectValue, setSelectValue] = useState('1');

 return (
  <CategoryPage 
   title="Инпуты и Селекты" 
   description="Текстовые поля, поиск, специализированные селекторы и командные меню в едином Midnight интерфейсе." 
   count={12}
  >
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-16">
    
    {/* 1. Basic Input */}
    <ComponentShowcase title="Базовое поле" source="custom">
     <div className="max-w-md w-full mx-auto space-y-3">
       <div className="group">
        <label className="text-[11px] font-black text-slate-400  ml-1 mb-1.5 block">Электронная почта</label>
        <input placeholder="admin@merchcrm.com" className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-5 py-3 text-sm font-medium focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-none" />
       </div>
     </div>
    </ComponentShowcase>

    {/* New Date Range Input */}
    <ComponentShowcase title="Выбор диапазона (Input)" source="custom" className="overflow-visible">
     <div className="w-full max-w-md mx-auto">
      <DateRangePicker 
       label="Даты проведения акции"
       value={range}
       onChange={setRange}
      />
     </div>
    </ComponentShowcase>

    {/* 2. Standard Select (Moved from Selects) */}
    <ComponentShowcase 
     title="Стандартный Select" 
     source="ui"
     desc="Базовый селект из библиотеки UI компонентов."
    >
      <div className="max-w-md w-full mx-auto">
        <Select 
          options={selectOptions}
          value={selectValue}
          onChange={setSelectValue}
          label="Статус заказа"
        />
      </div>
    </ComponentShowcase>

    {/* New Date Range Input with Presets */}
    <ComponentShowcase title="Диапазон с пресетами" source="custom" className="overflow-visible">
     <div className="w-full max-w-md mx-auto">
      <DateRangePickerWithPresets 
       label="Период отчета"
       value={rangeWithPresets}
       onChange={setRangeWithPresets}
      />
     </div>
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
       <button className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-primary-base text-white text-[11px] font-black rounded-xl  shadow-sm hover:bg-primary-dark active:scale-95 transition-all">Применить</button>
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

    {/* 10. Command Palette (Mock) */}
    <ComponentShowcase 
     title="Командная палитра" 
     source="custom" 
     description="Быстрый поиск и управление командами через горячие клавиши." 
    >
     <div className="w-full max-w-sm mx-auto border border-border rounded-xl bg-card shadow-lg p-2 overflow-hidden">
       <div className="flex items-center gap-3 px-3 py-2 border-b border-border mb-2">
        <Command className="size-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Введите команду или поиск...</span>
        <span className="ml-auto text-[11px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border">⌘K</span>
       </div>
       <div className="space-y-1">
        {[
         { label: 'Поиск сделок...', icon: Search },
         { label: 'Создать контакт', icon: Users },
         { label: 'Настройки', icon: Settings }
        ].map((item, i) => (
         <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
           <item.icon className="size-4 text-muted-foreground" />
           <span className="text-xs font-medium">{item.label}</span>
           <ChevronRight className="ml-auto size-3 text-muted-foreground/50" />
         </div>
        ))}
       </div>
     </div>
    </ComponentShowcase>



    </div>
  </CategoryPage>
 );
}
