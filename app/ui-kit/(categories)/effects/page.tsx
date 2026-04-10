"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";

// Typography-related effects
import { FlipWords } from "@/components/ui/flip-words";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { RotatingText } from "@/components/library/custom/components/rotating-text";

// Visual effects
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { BorderGlow } from "@/components/library/custom/components/border-glow";
import { Zap, MousePointer2 } from 'lucide-react';

const Lanyard3D = dynamic(
  () => import("@/components/library/custom/components/lanyard-3d").then((mod) => mod.Lanyard3D),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center text-slate-500 font-medium animate-pulse">Загрузка 3D движка...</div> }
);

export default function EffectsPage() {
  const words = ["быстрее", "продуктивнее", "умнее", "эффективнее"];

  return (
    <CategoryPage
      title="Визуальные Эффекты"
      description="Премиальные анимации, 3D физика, световые эффекты и динамическая типографика для создания 'WOW-эффекта'."
      count={6}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-10">

        {/* 1. Lanyard 3D */}
        <ComponentShowcase title="Интерактивный Бейдж 3D" source="custom" desc="Полноценная 3D физика (Three.js + Rapier). Тяните за бейдж, чтобы увидеть инерцию и столкновения.">
          <div className="w-full max-w-sm bg-slate-50 mx-auto rounded-3xl h-[500px] border border-slate-100 overflow-hidden shadow-inner relative">
            <Lanyard3D />
          </div>
        </ComponentShowcase>

        {/* 2. BorderGlow */}
        <ComponentShowcase title="Светящаяся кромка" source="custom" desc="Интерактивное свечение по краям, реагирующее на мышь">
          <BorderGlow className="w-full h-[500px] max-w-sm mx-auto rounded-[24px]">
            <div className="flex flex-col items-center justify-center p-8 w-full h-full text-slate-900 bg-white rounded-[24px]">
              <Zap className="size-8 mb-4 text-primary-base" />
              <h4 className="text-xl font-bold">Border Glow</h4>
              <p className="text-sm text-slate-500 mt-2 text-center">Двигайте мышью, чтобы увидеть эффект</p>
            </div>
          </BorderGlow>
        </ComponentShowcase>

        {/* 3. Rotating Text */}
        <ComponentShowcase title="Вращающийся текст" source="custom" desc="Плавная смена ключевых слов с эффектом пружины.">
          <div className="h-[200px] flex items-center justify-center bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden text-3xl font-black text-gray-900 font-heading ">
            Анимация: 
            <RotatingText
              texts={['быстро', 'четко', 'понятно', 'ReactBits']}
              mainClassName="px-4 sm:px-4 md:px-5 bg-primary-base text-white overflow-hidden py-1.5 sm:py-2 md:py-2.5 flex justify-center rounded-xl inline-flex ml-3"
              staggerFrom={"last"}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="pb-1 sm:pb-1.5 md:pb-2"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
            />
          </div>
        </ComponentShowcase>

        {/* 4. Flip Words */}
        <ComponentShowcase title="Переворот слов" source="custom" desc="Динамическая смена ключевых слов в предложений.">
          <div className="h-[200px] flex items-center justify-center bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
            <div className="text-3xl font-black text-gray-900 font-heading text-center">
              Ваш офис станет <br/>
              <FlipWords words={words} className="text-primary-base" />
            </div>
          </div>
        </ComponentShowcase>

        {/* 5. Spotlight Card */}
        <ComponentShowcase title="Интерактивный Spotlight" source="custom" desc="Эффект фонарика, следующего за курсором.">
          <SpotlightCard className="w-full max-w-md mx-auto bg-white border border-slate-100 rounded-3xl h-[200px] p-8 cursor-crosshair group flex flex-col justify-center shadow-crm-sm">
            <div className="size-12 rounded-2xl bg-primary-base flex items-center justify-center text-white mb-6 group-hover:rotate-12 transition-transform">
              <MousePointer2 className="size-6" />
            </div>
            <h4 className="text-slate-900 text-xl font-black font-heading">Адаптивный свет</h4>
            <p className="text-slate-400 text-xs font-bold mt-2">Свет следует за вами, открывая детали интерфейса.</p>
          </SpotlightCard>
        </ComponentShowcase>

        {/* 6. Typewriter Effect */}
        <ComponentShowcase title="Эффект печати" source="custom" desc="Интерактивный текст с поддержкой выделения.">
          <div className="flex flex-col items-center justify-center h-[200px] bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 shadow-inner">
            <TypewriterEffect 
              words={[
                { text: "Создавайте", className: "text-slate-900" },
                { text: "лучший", className: "text-slate-900" },
                { text: "мерч", className: "text-primary-base font-black" },
                { text: "вместе", className: "text-slate-900" },
                { text: "с", className: "text-slate-900" },
                { text: "нами.", className: "text-emerald-500" },
              ]}
            />
          </div>
        </ComponentShowcase>

      </div>
    </CategoryPage>
  );
}
