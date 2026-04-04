"use client";

import React, { useState } from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { MerchStatusStepper, type MerchStatus } from "@/components/library/custom/components/merch/print-status-stepper";
import { ProductSizeGrid } from "@/components/library/custom/components/merch/product-size-grid";
import { motion } from 'framer-motion';
import { Shirt, Trash2, Edit3, Fingerprint, Layers, CloudRain } from 'lucide-react';
import { cn } from "@/components/library/custom/utils/cn";

export default function MerchPage() {
  const [selectedStatus, setSelectedStatus] = useState<MerchStatus>('printing');

  return (
    <CategoryPage
      title="Merch-специфичные"
      description="Специализированные компоненты для управления производством, складом и характеристиками мерча."
      count={6}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-10">
        
        <ComponentShowcase title="Этапы производства" source="custom" desc="Интерактивный трекер жизненного цикла изделия.">
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl w-full">
              <div className="flex gap-2 mb-8 p-1 bg-gray-50 rounded-2xl w-fit">
                 {['queued', 'printing', 'drying', 'quality_check', 'packed', 'shipped'].map(s => (
                   <button 
                     key={s}
                     onClick={() => setSelectedStatus(s as MerchStatus)}
                     className={cn(
                       "px-3 py-1.5 text-[11px] font-black   rounded-xl transition-all",
                       selectedStatus === s ? "bg-primary-base text-white shadow-md" : "text-gray-400 hover:text-gray-600"
                     )}
                   >
                     {s.replace('_', ' ')}
                   </button>
                 ))}
              </div>
              <MerchStatusStepper currentStatus={selectedStatus} />
           </div>
        </ComponentShowcase>

        <ComponentShowcase title="Размерная сетка" source="custom" desc="Умная сетка выбора размеров с индикацией остатков.">
           <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl w-full flex items-center justify-center min-h-[300px]">
              <div className="max-w-sm w-full">
                <ProductSizeGrid />
              </div>
           </div>
        </ComponentShowcase>

        <ComponentShowcase title="Материалы и ткани" source="custom" desc="Визуальные карточки характеристик материала.">
           <div className="grid grid-cols-2 gap-3 w-full">
              {[
                { name: '100% Хлопок', type: 'Натуральный', density: '180г/м²', icon: Fingerprint, color: 'bg-orange-50 text-orange-600 border-orange-100' },
                { name: 'Полиэстер', type: 'Спорт-тек', density: '140г/м²', icon: Layers, color: 'bg-blue-50 text-blue-600 border-blue-100' },
                { name: 'Футер 3-х нитка', type: 'Начёс', density: '320г/м²', icon: CloudRain, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
              ].map((m, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  className={cn("p-5 rounded-3xl border flex flex-col gap-3", m.color)}
                >
                  <div className="size-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                     <m.icon className="size-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black  ">{m.name}</span>
                    <span className="text-[11px] font-bold opacity-60 italic">{m.type} · {m.density}</span>
                  </div>
                </motion.div>
              ))}
           </div>
        </ComponentShowcase>

        <ComponentShowcase title="Пакет превью заказа" source="custom">
           <div className="w-full bg-slate-900 p-8 rounded-[2.5rem] flex flex-col gap-3 relative overflow-hidden border border-white/5 shadow-2xl">
              <div className="absolute top-0 right-0 p-4">
                 <div className="size-32 rounded-full bg-primary-base/10 blur-3xl" />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="size-16 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                   <Shirt className="size-8" />
                </div>
                <div className="flex flex-col">
                   <span className="text-sm font-black text-white  ">Оверсайз Худи «Lumin»</span>
                   <span className="text-[11px] font-bold text-gray-400">ID: #ORD-7729-X</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="block text-[8px] font-black text-gray-500   mb-1">Количество</span>
                    <span className="text-xl font-black text-white italic">450 <span className="text-xs not-italic text-gray-500">шт</span></span>
                 </div>
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="block text-[8px] font-black text-gray-500   mb-1">Тираж</span>
                    <span className="text-xl font-black text-primary-base italic">3 <span className="text-xs not-italic text-gray-500">дня</span></span>
                 </div>
              </div>

              <div className="flex gap-3">
                 <button className="flex-1 h-10 bg-white rounded-xl text-[11px] font-black   text-black hover:bg-gray-100 transition-colors">Спецификация</button>
                 <button className="size-10 bg-red-500/10 rounded-xl text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors">
                    <Trash2 className="size-4" />
                 </button>
                 <button className="size-10 bg-white/10 rounded-xl text-white flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Edit3 className="size-4" />
                 </button>
              </div>
           </div>
        </ComponentShowcase>

      </div>
    </CategoryPage>
  );
}
