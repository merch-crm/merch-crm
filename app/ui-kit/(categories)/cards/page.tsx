"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { SpotlightCard } from "@/components/library/reactbits";
import { BorderGlow } from "@/components/library/custom/components/border-glow";

const Lanyard3D = dynamic(
  () => import("@/components/library/custom/components/lanyard-3d").then((mod) => mod.Lanyard3D),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center text-slate-500 font-medium animate-pulse">Загрузка 3D движка...</div> }
);
import { CrmButton } from "@/components/ui/crm-button";
import { 
  TrendingUp, 
  Users, 
  Zap, 
  ChevronRight,
  MousePointer2
} from 'lucide-react';

export default function CardsPage() {
  return (
    <CategoryPage
      title="Карточки и Виджеты"
      description="Информационные блоки для CRM в стиле Midnight: глубокие тени, строгая типографика и акцент на данные."
      count={5}
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
                   <span className="text-[11px] font-black   text-indigo-300">Денежный поток</span>
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


        {/* Lanyard 3D */}
        <ComponentShowcase title="Интерактивный Бейдж 3D" source="reactbits" desc="Полноценная 3D физика (Three.js + Rapier). Тяните за бейдж, чтобы увидеть инерцию и столкновения.">
           <div className="w-full max-w-sm bg-slate-950/50 mx-auto rounded-3xl h-[500px] border border-white/5 overflow-hidden shadow-2xl relative">
             <Lanyard3D />
           </div>
        </ComponentShowcase>

        {/* BorderGlow */}
        <ComponentShowcase title="Светящаяся кромка" source="reactbits" desc="Интерактивное свечение по краям, реагирующее на мышь">
           <BorderGlow className="w-full h-48 max-w-sm mx-auto rounded-[24px]">
              <div className="flex flex-col items-center justify-center p-8 w-full h-full text-white">
                <Zap className="size-8 mb-4 text-indigo-400" />
                <h4 className="text-xl font-bold">Border Glow</h4>
              </div>
           </BorderGlow>
        </ComponentShowcase>

        {/* 4. Spotlight Card (ReactBits) */}
        <ComponentShowcase title="Интерактивный Spotlight" source="reactbits" desc="Эффект фонарика, следующего за курсором.">
           <SpotlightCard className="w-full max-w-md mx-auto bg-slate-900 border-slate-800 rounded-3xl p-8 cursor-crosshair group">
              <div className="size-12 rounded-2xl bg-primary-base flex items-center justify-center text-white mb-6 group-hover:rotate-12 transition-transform">
                 <MousePointer2 className="size-6" />
              </div>
              <h4 className="text-white text-xl font-black font-heading">Адаптивный свет</h4>
              <p className="text-slate-400 text-xs font-bold mt-2">Свет следует за вами, открывая детали интерфейса.</p>
           </SpotlightCard>
        </ComponentShowcase>
      </div>
    </CategoryPage>
  );
}
