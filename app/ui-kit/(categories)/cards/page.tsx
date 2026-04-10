"use client";

import React from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { CrmButton } from "@/components/ui/crm-button";
import { 
 TrendingUp, 
 Users, 
 ChevronRight
} from 'lucide-react';

export default function CardsPage() {
 return (
  <CategoryPage
   title="Карточки и Виджеты"
   description="Информационные блоки для CRM в стиле Midnight: глубокие тени, строгая типографика и акцент на данные."
   count={2}
  >
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
    

    {/* 2. Stat Widget */}
    <ComponentShowcase title="Виджет статистики" source="custom">
      <div className="w-full max-w-sm p-6 bg-[#1A2233] rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
       <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
        <TrendingUp size={80} />
       </div>
       <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-8 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
           <TrendingUp className="size-4 text-indigo-400" />
          </div>
          <span className="text-[11px] font-black  text-indigo-300">Денежный поток</span>
        </div>
        <div className="text-4xl font-black mb-2 ">$142,500</div>
        <div className="flex items-center gap-2 text-xs text-indigo-200/60 font-medium">
          <span className="text-indigo-400 font-bold">+12.5%</span> за этот месяц
        </div>
       </div>
      </div>
    </ComponentShowcase>

    {/* 3. User Tile */}
    <ComponentShowcase title="Профиль клиента" source="custom">
      <div className="w-full max-w-md p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 group cursor-pointer">
       <div className="size-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden relative">
         <Users className="size-6" />
         <div className="absolute inset-0 bg-slate-900 opacity-0 group-hover:opacity-10 transition-opacity" />
       </div>
       <div className="flex-1">
         <h4 className="text-base font-black text-slate-900">Леонид Молчанов</h4>
         <p className="text-xs text-slate-500 font-medium">VIP Клиент • MerchPro</p>
       </div>
       <CrmButton variant="neutralGhost" size="icon" className="group-hover:translate-x-1 transition-transform">
         <ChevronRight className="size-5" />
       </CrmButton>
      </div>
    </ComponentShowcase>

   </div>
  </CategoryPage>
 );
}
