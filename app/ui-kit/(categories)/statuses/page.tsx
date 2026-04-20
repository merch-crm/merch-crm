"use client";

import React from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { 
  ShieldAlert, 
  Clock, 
  Zap, 
  X,
  Activity,
  Check,
  Archive,
  Info,
  Filter,
  Star
} from "lucide-react";
import { PillBadge } from '@/components/ui/pill-badge';
import { PriorityFlag } from '@/components/ui/priority-flag';
import { StatusChip } from '@/components/ui/status-chip';
import { QuantityBadge } from '@/components/ui/quantity-badge';
import { QuantityIconBadge } from '@/components/ui/quantity-icon-badge';
import { SplitBadge } from '@/components/ui/split-badge';

export default function StatusesPage() {
 return (
  <CategoryPage
   title="Статус"
   description="Визуальные индикаторы статусов, приоритетов, а также компактные теги и чипсеты для фильтрации."
  >
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-16">





     {/* 4. Priority Flags */}
     <ComponentShowcase 
       title="Флаги приоритетов" 
       code={`import { PriorityFlag } from "@/components/ui/priority-flag";`}
       className="col-span-1 md:col-span-1 lg:col-span-2"
     >
       <div className="flex flex-col gap-2 w-full max-w-[140px] mx-auto">
        <PriorityFlag color="red" icon={<ShieldAlert size={12} />}>P0 (Высокий)</PriorityFlag>
        <PriorityFlag color="yellow" icon={<Zap size={12} />}>Обычный</PriorityFlag>
        <PriorityFlag color="gray" icon={<Clock size={12} />}>Низкий приоритет</PriorityFlag>
        <PriorityFlag color="green" icon={<Check size={12} />}>Завершено</PriorityFlag>
       </div>
     </ComponentShowcase>

     {/* 12. StatusChip */}
      <ComponentShowcase 
        title="Статус-чип (Удаляемый)" 
        code={`import { StatusChip } from "@/components/ui/status-chip";`}
        className="col-span-1 md:col-span-2 lg:col-span-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-8">
          {/* Solid Styles */}
          <div className="space-y-4">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2 border-l-2 border-slate-200">Solid Style</h5>
            <div className="flex flex-wrap gap-2">
              <StatusChip color="purple" onRemove={() => {}}>Стадия: Договор</StatusChip>
              <StatusChip color="green" onRemove={() => {}}>Активен</StatusChip>
              <StatusChip color="yellow" onRemove={() => {}}>Ожидание</StatusChip>
              <StatusChip color="red" onRemove={() => {}}>Критично</StatusChip>
              <StatusChip color="black" onRemove={() => {}}>Midnight</StatusChip>
              <StatusChip color="gray" onRemove={() => {}}>Basic</StatusChip>
            </div>
          </div>

          {/* Outline Styles */}
          <div className="space-y-4">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2 border-l-2 border-slate-200">Outline Style</h5>
            <div className="flex flex-wrap gap-2">
              <StatusChip variant="outline" color="purple" icon={<Filter size={12} />} onRemove={() => {}}>Тег: Оптовик</StatusChip>
              <StatusChip variant="outline" color="green" icon={<Check size={12} />} onRemove={() => {}}>Готово</StatusChip>
              <StatusChip variant="outline" color="yellow" icon={<Clock size={12} />} onRemove={() => {}}>В работе</StatusChip>
              <StatusChip variant="outline" color="red" icon={<ShieldAlert size={12} />} onRemove={() => {}}>Ошибка</StatusChip>
              <StatusChip variant="outline" color="black" icon={<Activity size={12} />} onRemove={() => {}}>System</StatusChip>
              <StatusChip variant="outline" color="gray" icon={<Info size={12} />} onRemove={() => {}}>Info</StatusChip>
            </div>
          </div>
        </div>
      </ComponentShowcase>







     {/* 9. Pill Badges (Modern) */}
     <ComponentShowcase 
       title="Pill Badges (Акцентные)" 
       code={`import { PillBadge } from "@/components/ui/pill-badge";`}
       className="col-span-1 md:col-span-2 lg:col-span-4"
     >
       <div className="space-y-8 py-4">
         {/* Variants x Colors */}
         <div className="space-y-4">
           <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Solid (Насыщенные)</h4>
           <div className="flex flex-wrap gap-x-4 gap-y-6 justify-center">
             <div className="flex flex-col items-center gap-2">
               <PillBadge color="black">Черный</PillBadge>
               <span className="text-[9px] font-bold text-slate-300">Базовый</span>
             </div>
             <div className="flex flex-col items-center gap-2">
               <PillBadge color="gray" icon={<Archive size={12} />}>Архив</PillBadge>
               <span className="text-[9px] font-bold text-slate-300">С иконкой</span>
             </div>
             <div className="flex flex-col items-center gap-2">
               <PillBadge color="green" icon={<Check size={12} />}>Активен</PillBadge>
               <span className="text-[9px] font-bold text-slate-300">С иконкой</span>
             </div>
             <div className="flex flex-col items-center gap-2">
               <PillBadge color="yellow" icon={<Clock size={12} />}>В ожидании</PillBadge>
               <span className="text-[9px] font-bold text-slate-300">С иконкой</span>
             </div>
             <div className="flex flex-col items-center gap-2">
               <PillBadge color="red" icon={<ShieldAlert size={12} />}>Критично</PillBadge>
               <span className="text-[9px] font-bold text-slate-300">С иконкой</span>
             </div>
             <div className="flex flex-col items-center gap-2">
               <PillBadge color="purple" icon={<Star size={12} />}>Бренд</PillBadge>
               <span className="text-[9px] font-bold text-slate-300">С иконкой</span>
             </div>
           </div>
         </div>
 
         {/* Sizes */}
         <div className="space-y-4 pt-8 border-t border-slate-100">
           <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Размеры</h4>
           <div className="flex items-end justify-center gap-8">
             <div className="flex flex-col items-center gap-2">
               <PillBadge size="sm" color="green">Маленький</PillBadge>
               <span className="text-[9px] font-black text-slate-300 italic">sm</span>
             </div>
             <div className="flex flex-col items-center gap-2">
               <PillBadge size="md" color="green" icon={<Activity size={12} />}>Средний</PillBadge>
               <span className="text-[9px] font-black text-slate-300 italic">md</span>
             </div>
             <div className="flex flex-col items-center gap-2">
               <PillBadge size="lg" color="green" icon={<Info size={14} />}>Большой бейдж</PillBadge>
               <span className="text-[9px] font-black text-slate-300 italic">lg</span>
             </div>
           </div>
         </div>
       </div>
     </ComponentShowcase>







      {/* 10. QuantityBadge */}
      <ComponentShowcase 
        title="Бейдж количества" 
        code={`import { QuantityBadge } from "@/components/ui/quantity-badge";`}
        className="col-span-1 md:col-span-1 lg:col-span-1"
      >
        <div className="flex flex-col items-center gap-2 py-4">
          <QuantityBadge value={250} unit="шт." color="green" />
          <QuantityBadge value={12} unit="уп." color="yellow" />
          <QuantityBadge value={0} unit="шт." color="red" />
          <QuantityBadge value={10} unit="шт." color="gray" />
          <QuantityBadge value={44} unit="кг." color="black" />
          <QuantityBadge value={5} unit="шт." color="gray" />
        </div>
      </ComponentShowcase>

      {/* 11. QuantityIconBadge */}
      <ComponentShowcase 
        title="Бейдж с иконкой" 
        code={`import { QuantityIconBadge } from "@/components/ui/quantity-icon-badge";`}
        className="col-span-1 md:col-span-1 lg:col-span-1"
      >
        <div className="flex flex-col items-center gap-2 py-4">
          <QuantityIconBadge value={250} unit="шт." icon={Archive} color="green" />
          <QuantityIconBadge value={12} unit="уп." icon={Archive} color="yellow" />
          <QuantityIconBadge value={0} unit="шт." icon={Archive} color="red" />
          <QuantityIconBadge value={100} unit="уп." icon={Archive} color="gray" />
          <QuantityIconBadge value={44} unit="кг." icon={Archive} color="black" />
          <QuantityIconBadge value={5} unit="шт." icon={Archive} color="gray" />
        </div>
      </ComponentShowcase>

      {/* 12. SplitBadge */}
      <ComponentShowcase 
        title="Сплит-метка" 
        code={`import { SplitBadge } from "@/components/ui/split-badge";`}
        className="col-span-1 md:col-span-1 lg:col-span-2"
      >
        <div className="flex flex-col items-center gap-2 py-4">
          <SplitBadge label="Остаток" value={500} unit="шт." color="green" />
          <SplitBadge label="Мало" value={8} unit="уп." color="yellow" />
          <SplitBadge label="Нет" value={0} unit="шт." color="red" />
          <SplitBadge label="Остаток" value={100} unit="шт." color="gray" />
          <SplitBadge label="Всего" value={1200} unit="кг." color="purple" />
          <SplitBadge label="Резерв" value={15} unit="шт." color="gray" />
        </div>
      </ComponentShowcase>


      {/* 11. Custom Status Badges */}
      <ComponentShowcase 
        title="Кастомные Статусные Бейджи (6 Вариантов)" 
        code={`// Специализированные варианты для разных контекстов\n<div className="inline-flex...">`}
        className="col-span-1 md:col-span-2 lg:col-span-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 justify-items-center w-full py-8 overflow-hidden relative">
          
          {/* 1. Success Soft */}
           <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[linear-gradient(90deg,#ecfdf5_0%,#d1fae5_50%,#ecfdf5_100%)] bg-[length:200%_auto] animate-rb-gradient border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold shadow-[0_2px_10px_rgba(16,185,129,0.15)] transition-transform hover:scale-105 cursor-default">
             <Check className="w-3.5 h-3.5 text-emerald-600 drop-shadow-sm" />
             <span className="relative z-10">Выполнено</span>
           </div>

          {/* 2. Warning Striped */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 border border-amber-300 text-amber-800 rounded-full text-xs font-black animate-stripe-flow"
               style={{ backgroundImage: 'linear-gradient(45deg, rgba(251, 191, 36, 0.3) 25%, transparent 25%, transparent 50%, rgba(251, 191, 36, 0.3) 50%, rgba(251, 191, 36, 0.3) 75%, transparent 75%, transparent)', backgroundSize: '16px 16px' }}
          >
            <Clock className="w-3.5 h-3.5" />
            Ожидание
          </div>

          {/* 3. Error Bold */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 text-white rounded-full text-xs font-black border border-rose-800/80 overflow-hidden relative cursor-default shadow-[0_0_15px_rgba(225,29,72,0.4)] hover:shadow-[0_0_25px_rgba(225,29,72,0.6)] transition-shadow duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-700 via-rose-500 to-rose-700 animate-rb-glitch-1 opacity-40\" />
            <X className="w-3.5 h-3.5 relative z-10 drop-shadow-[0_0_6px_rgba(255,100,100,0.8)]" />
            <span className="relative z-10 drop-shadow-[0_0_2px_rgba(0,0,0,0.3)]">Отклонено</span>
          </div>

          {/* 4. Verified Premium */}
           <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-100/80 border border-amber-300 text-amber-800 rounded-full text-xs font-black overflow-hidden relative group cursor-default shadow-[0_0_15px_rgba(251,191,36,0.25)] hover:shadow-[0_0_20px_rgba(251,191,36,0.45)] transition-all duration-300">
             <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,35%,rgba(251,191,36,0.6),50%,transparent,65%,rgba(251,191,36,0.6),80%,transparent)] bg-[length:200%_100%] animate-rb-shine opacity-100" />
             <div className="absolute inset-0 bg-white/20 mix-blend-overlay"></div>
             <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500 relative z-10 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
             <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">Верифицирован</span>
           </div>

          {/* 5. Urgent Pulse */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-xs font-bold relative overflow-hidden group hover:border-rose-300 transition-colors cursor-default">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ring-4 ring-rose-500/20" />
            Критичный
          </div>

          {/* 6. VIP Modern */}
           <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 border border-purple-400/70 text-white rounded-full text-xs font-black overflow-hidden relative group cursor-default shadow-[0_0_20px_rgba(192,132,252,0.5)] hover:shadow-[0_0_30px_rgba(192,132,252,0.8)] transition-all duration-300">
             <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,35%,rgba(192,132,252,0.4),50%,transparent,65%,rgba(192,132,252,0.4),80%,transparent)] bg-[length:200%_100%] animate-rb-shine opacity-100" />
             <ShieldAlert className="w-3.5 h-3.5 text-purple-300 relative z-10 drop-shadow-[0_0_10px_rgba(192,132,252,0.9)]" />
             <span className="relative z-10 drop-shadow-[0_0_6px_rgba(192,132,252,0.9)] text-white">VIP Клиент</span>
           </div>

        </div>
      </ComponentShowcase>

   </div>
  </CategoryPage>
 );
}
