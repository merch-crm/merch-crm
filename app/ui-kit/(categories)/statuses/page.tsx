"use client";

import React from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";


import { StatusChipsGroup } from "@/components/ui/premium/status-chips";
import { ChipStatuses } from "@/components/library/custom/components/status-chips";
import { StatusBadge } from "@/components/ui/status-timeline";
import { 
 ShieldAlert, 
 ShieldCheck, 
 Clock, 
 Zap, 
 RefreshCw, 
 X
} from 'lucide-react';

export default function StatusesPage() {
 return (
  <CategoryPage
   title="Бейджи и статусы"
   description="Визуальные индикаторы статусов, приоритетов, а также компактные теги и чипсеты для фильтрации."
   count={6}
  >
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-16">

    <ComponentShowcase 
     title="Премиум-статусы" 
     source="custom" 
     desc="Люксовые индикаторы состояния с мягкими цветами и Apple-эстетикой." 
     code={`<StatusChipsGroup />`}
    >
     <div className="flex justify-center w-full py-4">
       <StatusChipsGroup />
     </div>
    </ComponentShowcase>

    <ComponentShowcase 
     title="Чипсы статуса" 
     source="gravity" 
     desc="Компактные статусы в стиле Gravity UI с иконками." 
     code={`<ChipStatuses />`}
    >
     <div className="flex justify-center w-full py-4">
       <ChipStatuses />
     </div>
    </ComponentShowcase>

    {/* 4. Priority Flags */}
    <ComponentShowcase title="Флаги приоритетов" source="custom">
      <div className="flex flex-col gap-2 w-full max-w-[140px] mx-auto">
       <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
         <ShieldAlert size={12} />
         <span className="text-[11px] font-black ">P0 (High)</span>
       </div>
       <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-lg border border-orange-100">
         <Zap size={12} />
         <span className="text-[11px] font-black ">Normal</span>
       </div>
       <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-500 rounded-lg border border-slate-200">
         <Clock size={12} />
         <span className="text-[11px] font-black ">Low Priority</span>
       </div>
      </div>
    </ComponentShowcase>

    {/* 5. Interactive Status Chip */}
    <ComponentShowcase title="Статус-чип (Удаляемый)" source="custom">
      <div className="flex gap-2 justify-center">
       <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-950 text-white rounded-xl text-[11px] font-black border border-gray-900">
         <span>Стадия: Договор</span>
         <button type="button" className="p-0.5 hover:bg-gray-800 rounded transition-colors"><X size={12} /></button>
       </div>
       <div className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-primary-base/20 text-primary-base rounded-xl text-[11px] font-black">
         <span>Тег: Оптовик</span>
         <button type="button" className="p-0.5 hover:bg-primary-base/10 rounded transition-colors"><X size={12} /></button>
       </div>
      </div>
    </ComponentShowcase>



    {/* 7. Data Freshness/Cloud Sync */}
    <ComponentShowcase title="Синхронизация данных" source="custom">
      <div className="flex items-center gap-3 justify-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
       <div className="flex items-center gap-2 text-primary-base">
         <RefreshCw size={14} className="animate-spin" />
         <span className="text-[11px] font-bold">Синхронизация...</span>
       </div>
       <div className="w-[1px] h-4 bg-slate-100" />
       <div className="flex items-center gap-2 text-emerald-500">
         <ShieldCheck size={14} />
         <span className="text-[11px] font-bold">Обновлено</span>
       </div>
      </div>
    </ComponentShowcase>

    {/* 8. Status Badges (from dates) */}
    <ComponentShowcase title="Индикаторы статуса" source="custom">
     <div className="flex flex-wrap gap-3 justify-center">
      <StatusBadge status="processing" label="В работе" />
      <StatusBadge status="completed" label="Завершено" />
      <StatusBadge status="cancelled" label="Отменено" />
      <StatusBadge status="on_hold" label="Ожидание" />
     </div>
    </ComponentShowcase>







   </div>
  </CategoryPage>
 );
}
