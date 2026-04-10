"use client";

import React, { useState } from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { MerchStatusStepper, type MerchStatus } from "@/components/library/custom/components/merch/print-status-stepper";
import { ProductSizeGrid } from "@/components/library/custom/components/merch/product-size-grid";
import { cn } from "@/components/library/custom/utils/cn";

export default function MerchPage() {
 const [selectedStatus, setSelectedStatus] = useState<MerchStatus>('printing');

 return (
  <CategoryPage
   title="Merch-специфичные"
   description="Специализированные компоненты для управления производством, складом и характеристиками мерча."
  >
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-10">
    
    <ComponentShowcase title="Этапы производства" source="custom" desc="Интерактивный трекер жизненного цикла изделия." className="col-span-1 md:col-span-2 lg:col-span-4">
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl w-full">
       <div className="flex flex-wrap gap-2 mb-8 p-1 bg-gray-50 rounded-2xl w-full justify-center">
         {['queued', 'printing', 'drying', 'quality_check', 'packed', 'shipped'].map(s => (
          <button 
           key={s}
           onClick={() => setSelectedStatus(s as MerchStatus)}
           className={cn(
            "px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap",
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

    <ComponentShowcase title="Размерная сетка" source="custom" desc="Умная сетка выбора размеров с индикацией остатков." className="col-span-1 md:col-span-2 lg:col-span-4">
      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl w-full flex items-center justify-center min-h-[300px]">
       <div className="max-w-sm w-full">
        <ProductSizeGrid />
       </div>
      </div>
    </ComponentShowcase>

   </div>
  </CategoryPage>
 );
}
