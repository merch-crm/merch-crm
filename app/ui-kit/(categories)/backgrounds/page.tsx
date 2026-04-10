
"use client";

import React from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { Grid } from 'lucide-react';

export default function BackgroundsPage() {
 return (
  <CategoryPage 
   title="Системные Фоны и Паттерны" 
   description="Создание глубины и структуры: от математических сеток до динамических 3D-фонов и атмосферных сияний Aurora." 
   count={2}
  >
   
   {/* --- Section 1: Структурные сетки (Classic) --- */}
   <div className="mt-12 mb-12 w-full border-t border-border pt-20">
    <h2 className="text-3xl font-black font-heading mb-4 text-slate-400">Структурные сетки</h2>
   </div>
   
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-16">
    <ComponentShowcase title="Структурная сетка" source="custom">
      <div className="relative w-full h-[300px] rounded-[40px] bg-white border border-gray-100 shadow-xl overflow-hidden">
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
       <div className="relative z-10 size-full flex flex-col items-center justify-center">
         <Grid className="size-12 text-primary-base mb-4" />
         <h4 className="text-xl font-black text-gray-950 font-heading">Чертежи</h4>
       </div>
      </div>
    </ComponentShowcase>

    <ComponentShowcase title="Минимальные точки" source="custom">
      <div className="relative w-full h-[300px] rounded-[40px] bg-white border border-gray-100 shadow-xl overflow-hidden">
       <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
       <div className="relative z-10 size-full flex flex-col items-center justify-center p-8">
         <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 p-8 shadow-2xl flex flex-col items-center gap-2">
          <span className="text-sm font-black text-gray-950 font-heading ">Рабочее пространство</span>
         </div>
       </div>
      </div>
    </ComponentShowcase>
   </div>



   <style jsx>{`
    @keyframes slide-down {
     0% { transform: translateY(-100%); opacity: 0; }
     50% { opacity: 1; }
     100% { transform: translateY(100%); opacity: 0; }
    }
    .animate-slide-down { animation: slide-down 3s linear infinite; }
    .animate-spin-slow { animation: spin 12s linear infinite; }
   `}</style>
  </CategoryPage>
 );
}
