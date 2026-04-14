"use client";

import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { 
 CheckCircle,
 Zap
} from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';
import { Tooltip } from '@/components/ui/tooltip';

export default function TooltipsPage() {
 return (
  <CategoryPage title="Подсказки и контекстные хинты" description="3 эталонных компонента: от статусных до продвинутой визуализации данных.">
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-16">
   {/* 2. Status Variant Tooltips (Top/Bottom) */}
   <ComponentShowcase 
    title="Статусные подсказки" 
    source="custom" 
    desc="Тематические подсказки для отображения статусов выполнения. Поддерживают размещение сверху и снизу через стандартный проп side." 
    className="col-span-1 md:col-span-1 lg:col-span-2"
   >
    <div className="flex flex-col items-center gap-3 py-12">
      <div className="flex items-center gap-3 group/all">
        {/* Top variant */}
        <Tooltip 
         side="top"
         className="bg-emerald-950 border-none shadow-2xl px-4 py-2 rounded-xl"
         content={
           <div className="flex items-center gap-2 text-white text-[11px] font-black">
            <Zap className="size-3 text-emerald-400" /> Договор успешно подписан
           </div>
         }
        >
         <button className="px-6 py-3 rounded-2xl bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:bg-emerald-600 transition-colors">
           <CheckCircle className="size-4" /> Сверху
         </button>
        </Tooltip>

        {/* Bottom variant */}
        <Tooltip 
         side="bottom"
         className="bg-emerald-950 border-none shadow-2xl px-4 py-2 rounded-xl"
         content={
           <div className="flex items-center gap-2 text-white text-[11px] font-black">
            <Zap className="size-3 text-emerald-400" /> Готов к отправке
           </div>
         }
        >
         <button className="px-6 py-3 rounded-2xl bg-white border border-emerald-100 text-emerald-600 text-xs font-black shadow-lg shadow-emerald-500/5 flex items-center gap-2 hover:bg-emerald-50 transition-colors">
           <CheckCircle className="size-4" /> Снизу
         </button>
        </Tooltip>
      </div>
    </div>
   </ComponentShowcase>

   {/* 6. Chart Data Point Tooltip */}
   <ComponentShowcase 
    title="Визуализация данных" 
    source="custom" 
    desc="Визуальная подсказка для графиков и дашбордов." 
    className="col-span-1 md:col-span-1 lg:col-span-2"
   >
    <div className="flex items-center justify-center py-12 bg-slate-50 rounded-[3rem] border border-slate-100 mx-4 shadow-inner">
      <div className="relative group/chart">
       <div className="flex gap-2 items-end h-32 px-12">
         {[40, 70, 45, 90, 65].map((h, i) => (
          <div key={i} className={cn("w-8 bg-slate-200 rounded-t-xl transition-all duration-500", i === 3 ? "bg-primary-base rounded-b-xl" : "")} style={{ height: `${h}%` }} />
         ))}
       </div>
       <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/chart:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
         <div className="bg-slate-900 rounded-[1.5rem] p-4 shadow-2xl flex flex-col items-center min-w-[120px] border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Выручка</span>
          <span className="text-lg font-black text-white font-heading">₽1,420,000</span>
          <span className="text-[11px] font-bold text-emerald-400">+12.4% к прошлой неделе</span>
         </div>
       </div>
      </div>
    </div>
   </ComponentShowcase>

   {/* 8. Positioned Tooltips Demo */}
   <ComponentShowcase 
    title="Многонаправленные подсказки" 
    source="custom" 
    desc="Демонстрация позиционирования подсказок во всех четырех направлениях." 
    className="col-span-1 md:col-span-2 lg:col-span-4"
   >
    <div className="grid grid-cols-2 gap-3 py-12 max-w-sm mx-auto">
      {[
       { pos: 'Top', label: 'Сверху', cls: '-top-10 left-1/2 -translate-x-1/2', arrow: '-bottom-1 left-1/2 -translate-x-1/2' },
       { pos: 'Right', label: 'Справа', cls: 'top-1/2 -right-20 -translate-y-1/2', arrow: 'top-1/2 -left-1 -translate-y-1/2' },
       { pos: 'Bottom', label: 'Снизу', cls: '-bottom-10 left-1/2 -translate-x-1/2', arrow: '-top-1 left-1/2 -translate-x-1/2' },
       { pos: 'Left', label: 'Слева', cls: 'top-1/2 -left-20 -translate-y-1/2', arrow: 'top-1/2 -right-1 -translate-y-1/2' },
      ].map((d, i) => (
       <div key={i} className="relative group/dir">
        <button className="w-full py-4 rounded-2xl bg-gray-50 border border-gray-100 text-[11px] font-bold  text-gray-400 group-hover/dir:bg-white group-hover/dir:text-gray-900 group-hover/dir:border-primary-base/20 transition-all">
          {d.pos}
        </button>
        <div className={cn("absolute scale-75 opacity-0 group-hover/dir:scale-100 group-hover/dir:opacity-100 transition-all pointer-events-none z-10", d.cls)}>
          <div className="relative bg-slate-900 border border-slate-800 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
           Ориентация: {d.label}
           <div className={cn("absolute size-2 bg-slate-900 border-r border-b border-slate-800 rotate-45", d.arrow)} />
          </div>
        </div>
       </div>
      ))}
    </div>
   </ComponentShowcase>
   </div>
  </CategoryPage>
 );
}
