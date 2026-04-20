"use client";
import React from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { User, Users, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

// New Bento Imports
import { BentoCollaboratorGrid } from "@/components/library/custom/components/avatars/bento-collaborator-grid";

export default function AvatarsPage() {
 return (
  <CategoryPage
   title="Пользователи"
   description="20+ премиальных компонентов идентификации: от «жидких» групп до 3D-карточек профилей и анимированных статусов."
  >

   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 gap-y-12 pb-32">
    




    <ComponentShowcase title="Статус пользователя (Online)" source="custom" className="col-span-1 md:col-span-1 lg:col-span-2">
      <div className="flex flex-col gap-3 p-6 bg-white rounded-[32px] border border-gray-100 shadow-crm-md max-w-sm mx-auto w-full h-full justify-between">
       <div className="flex items-center gap-3">
         <div className="relative group/avatar">
          <div className="size-16 rounded-[24px] bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden isolate shadow-sm transition-transform hover:scale-105 duration-500">
            <User size={40} className="mt-2 opacity-50 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-base/10 to-transparent rounded-[24px] z-0" />
          </div>
          <div className="absolute -bottom-1 -right-1 size-5 bg-emerald-500 rounded-full border-4 border-white shadow-lg animate-pulse-slow" />
         </div>
         <div className="flex flex-col">
          <h4 className="text-sm font-black text-slate-900 ">Вероника М.</h4>
          <p className="text-[11px] text-slate-500 font-bold  mt-0.5">В сети • Работает</p>
         </div>
       </div>

       <div className="bg-slate-50 rounded-2xl p-3 flex items-center justify-between">
         <div className="flex items-center gap-2">
          <div className="size-2 bg-emerald-500 rounded-full" />
          <span className="text-[11px] font-black text-slate-600 ">Доступна для звонков</span>
         </div>
         <div className="flex -space-x-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="size-5 rounded-full border-2 border-white bg-slate-200" />
          ))}
         </div>
       </div>

       <div className="grid grid-cols-2 gap-2">
         <button type="button" className="py-2.5 rounded-xl bg-primary-base text-white text-[11px] font-black  hover:bg-primary-dark transition-all">Профиль</button>
         <button type="button" className="py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[11px] font-black  hover:border-primary-base transition-all">Чат</button>
       </div>
      </div>
    </ComponentShowcase>

    <ComponentShowcase title="Сетка коллабораторов" source="custom" className="col-span-1 md:col-span-1 lg:col-span-2">
      <div className="h-full flex items-center justify-center w-full">
       <BentoCollaboratorGrid />
      </div>
    </ComponentShowcase>

    <ComponentShowcase title="Стеки аватаров" source="custom" className="col-span-1 md:col-span-1 lg:col-span-2">
      <div className="flex flex-col items-center gap-3 py-12 bg-gray-50 rounded-[40px] border border-gray-100 shadow-sm mx-auto w-full max-w-sm">
       <div className="flex flex-col items-center gap-2">
         <div className="flex -space-x-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="size-14 rounded-full border-[3px] border-white bg-slate-100 shadow-crm-sm flex items-center justify-center text-slate-900 text-xs font-black transition-transform hover:-translate-y-2 cursor-pointer">
             {i === 5 ? "+4" : "JD"}
            </div>
          ))}
         </div>
         <span className="text-[11px] font-black text-gray-400 tracking-[0.2em] mt-2">Команда маркетинга</span>
       </div>
       
       <div className="flex items-center gap-3">
         <div className="relative">
          <div className="size-20 rounded-[28px] bg-slate-100 p-0.5 shadow-sm">
            <div className="w-full h-full rounded-[26px] bg-white p-1">
             <div className="w-full h-full rounded-[24px] bg-slate-100 overflow-hidden">
               <User size={40} className="w-full h-full mt-2 opacity-50 text-slate-400" />
             </div>
            </div>
          </div>
          <div className="absolute -top-1 -right-1 bg-primary-base text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg border-2 border-white ">PRO</div>
         </div>

         <div className="flex flex-col gap-1.5">
          <div className="size-2 bg-emerald-500 rounded-full animate-pulse-slow shadow-[0_0_12px_rgba(16,185,129,0.3)]" />
          <div className="size-2 bg-slate-200 rounded-full" />
          <div className="size-2 bg-slate-200 rounded-full" />
         </div>
       </div>
      </div>
    </ComponentShowcase>

    <ComponentShowcase title="Профиль клиента" source="custom" className="col-span-1 md:col-span-1 lg:col-span-2">
      <div className="w-full max-w-md p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 group cursor-pointer h-full">
       <div className="size-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden relative">
         <Users className="size-6" />
         <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
       </div>
       <div className="flex-1">
         <h4 className="text-base font-black text-slate-900">Леонид Молчанов</h4>
         <p className="text-xs text-slate-500 font-medium">VIP Клиент • MerchPro</p>
       </div>
       <Button color="neutral" variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
         <ChevronRight className="size-5" />
       </Button>
      </div>
    </ComponentShowcase>




   </div>
  </CategoryPage>
 );
}
