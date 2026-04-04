"use client";

import React from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { PipelineBar } from "@/components/library/custom/components/pipeline-bar";
import { DealCard } from "@/components/library/custom/components/pipeline/deal-card";
import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, Filter } from 'lucide-react';
import { cn } from "@/components/library/custom/utils/cn";

const STAGES = [
  { label: 'Leads', value: 340, color: 'bg-indigo-500' },
  { label: 'Queries', value: 210, color: 'bg-blue-500' },
  { label: 'Quotes', value: 145, color: 'bg-sky-400' },
  { label: 'Orders', value: 89, color: 'bg-emerald-500' },
];

export default function PipelinePage() {
  return (
    <CategoryPage
      title="Микро-пайплайны"
      description="Визуализация воронки продаж, управление сделками и мониторинг финансового прогресса."
      count={5}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-10">
        
        <ComponentShowcase title="Линейный прогресс сделок" source="custom" desc="Компактное отображение распределения лидов по стадиям.">
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl w-full">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-gray-900  ">Текущий квартал Q2</span>
                  <span className="text-[11px] font-bold text-gray-400 italic">Сводка по всем каналам продаж</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                  <TrendingUp className="size-3 text-emerald-500" />
                  <span className="text-[11px] font-black text-emerald-600  ">+12% vs Q1</span>
                </div>
              </div>
              <PipelineBar stages={STAGES} height="lg" />
           </div>
        </ComponentShowcase>

        <ComponentShowcase title="Карточка сделки (Premium)" source="custom" desc="Информативный блок для канбан-доски или списков.">
           <div className="w-full max-w-sm mx-auto">
             <DealCard 
               title="Тираж худи для Google I/O"
               client="Alphabet Inc."
               value={124500}
               stage="Ожидает оплаты"
               daysAtStage={3}
               priority="high"
               confidence={85}
             />
           </div>
        </ComponentShowcase>

        <ComponentShowcase title="Воронка конверсии" source="custom" desc="Визуализация потерь и переходов в SVG.">
           <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-base/5 to-transparent pointer-events-none" />
              
              <div className="flex flex-col gap-2 w-full max-w-[280px]">
                 {[
                    { label: 'Охват', value: '1.2M', pct: 100, color: 'bg-white/20' },
                    { label: 'Клик', value: '45.2K', pct: 75, color: 'bg-white/10' },
                    { label: 'Лид', value: '1,204', pct: 50, color: 'bg-primary-base' },
                    { label: 'Продажа', value: '412', pct: 25, color: 'bg-emerald-500' },
                 ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ scaleX: 0.8, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative flex flex-col items-center group cursor-pointer"
                    >
                       <div 
                         className={cn("h-12 flex items-center justify-between px-4 rounded-xl border border-white/5 transition-all group-hover:scale-[1.02]", item.color)}
                         style={{ width: `${item.pct}%`, minWidth: '80px' }}
                       >
                          <span className="text-[11px] font-black  text-white ">{item.label}</span>
                          <span className="text-[11px] font-black text-white italic opacity-80">{item.value}</span>
                       </div>
                       {i < 3 && (
                          <div className="h-2 w-px bg-white/10 my-0.5" />
                       )}
                    </motion.div>
                 ))}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 w-full border-t border-white/5 pt-6">
                 <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black text-gray-500  tracking-[0.2em] mb-1">CPA (avg)</span>
                    <span className="text-sm font-black text-white italic">₽340.00</span>
                 </div>
                 <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black text-gray-500  tracking-[0.2em] mb-1">ROAS</span>
                    <span className="text-sm font-black text-primary-base italic">4.2x</span>
                 </div>
              </div>
           </div>
        </ComponentShowcase>

        <ComponentShowcase title="Статусные индикаторы" source="custom">
           <div className="grid grid-cols-2 gap-3 w-full">
              {[
                 { label: 'Новое', icon: Target, weight: '900', color: 'text-indigo-500 bg-indigo-50 border-indigo-100' },
                 { label: 'В работе', icon: Zap, weight: '700', color: 'text-amber-500 bg-amber-50 border-amber-100' },
                 { label: 'Фильтр', icon: Filter, weight: '800', color: 'text-gray-500 bg-gray-50 border-gray-100' },
                 { label: 'Конверсия', icon: TrendingUp, weight: '950', color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
              ].map((s, i) => (
                <div key={i} className={cn("flex flex-col items-center justify-center p-6 rounded-3xl border gap-3 transition-transform hover:-translate-y-1", s.color)}>
                   <s.icon className="size-6" />
                   <span className="text-[11px]  font-black  text-center">{s.label}</span>
                </div>
              ))}
           </div>
        </ComponentShowcase>

      </div>
    </CategoryPage>
  );
}
