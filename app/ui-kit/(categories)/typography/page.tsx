"use client";

import React from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";

// Hero & Headings
import { BentoHeroText } from "@/components/library/custom/components/typography/bento-hero-text";
import { BentoLayeredHeading } from "@/components/library/custom/components/typography/bento-layered-heading";
import { BentoSplitHeading } from "@/components/library/custom/components/typography/bento-split-heading";

// Animation & Effects
import { BentoBlurText } from "@/components/ui/typography/bento-blur-text";
import { BentoFlipWords } from "@/components/ui/typography/bento-flip-words";
import { BentoRotatingText } from "@/components/ui/typography/bento-rotating-text";
import { BentoPerspectiveScrollText } from "@/components/library/custom/components/typography/bento-perspective-scroll-text";
import { BentoGradientText } from "@/components/library/custom/components/typography/bento-gradient-text";
import { BentoMaskedText } from "@/components/library/custom/components/typography/bento-masked-text";

// Interactive & System
import { BentoTypewriter } from "@/components/ui/typography/bento-typewriter";
import { BentoTypewriterHint } from "@/components/library/custom/components/typography/bento-typewriter-hint";
import { BentoCodeDiff } from "@/components/library/custom/components/typography/bento-code-diff";
import { BentoAnimatedQuote } from "@/components/library/custom/components/typography/bento-animated-quote";
import { BentoGlassBlockquote } from "@/components/library/custom/components/typography/bento-glass-blockquote";

export default function TypographyPage() {

 return (
  <CategoryPage
   title="Типографика"
   description="Полный набор текстовых стилей: от базовых шрифтов до сложных анимированных заголовков и интерактивных эффектов."
   count={17}
  >
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-12">

    {/* Section: Standard Elements */}
    <ComponentShowcase title="Стандартные заголовки" source="base">
     <div className="flex flex-col gap-4 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
      <h1 className="text-4xl font-black text-gray-950 border-b pb-4">Заголовок H1</h1>
      <h2 className="text-2xl font-bold text-gray-900 leading-tight">Заголовок H2: Основные секции</h2>
      <h3 className="text-lg font-semibold text-gray-800">Заголовок H3: Подразделы</h3>
      <h4 className="text-base font-bold text-gray-700 tracking-wide uppercase">H4: Метка секции</h4>
     </div>
    </ComponentShowcase>

    <ComponentShowcase title="Стили основного текста" source="base">
     <div className="flex flex-col gap-5 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
      <div>
       <span className="text-[10px] font-black text-primary-base uppercase tracking-widest mb-1 block">Lead Text</span>
       <p className="text-lg text-gray-600 font-medium leading-relaxed">
        Укрупненный текст для вводных абзацев и важных описаний.
       </p>
      </div>
      <div>
       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Base Body</span>
       <p className="text-sm text-gray-500 leading-relaxed">
        Стандартный текст для большинства контента. Хорошо читается на любых экранах.
       </p>
      </div>
      <div className="flex gap-8">
       <div className="flex-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Small</span>
        <p className="text-xs text-gray-400 font-medium leading-tight italic">Второстепенные примечания и сноски.</p>
       </div>
       <div className="flex-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Tiny</span>
        <p className="text-[10px] text-gray-400 font-bold leading-none uppercase">Технические метки</p>
       </div>
      </div>
     </div>
    </ComponentShowcase>

    <ComponentShowcase title="Списки и цитаты" source="base">
     <div className="flex flex-col gap-6 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
      <ul className="space-y-2">
       {['Современная эстетика', 'Высокая производительность', 'Типографика 2025'].map((item, i) => (
        <li key={i} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
         <div className="size-1.5 rounded-full bg-primary-base" />
         {item}
        </li>
       ))}
      </ul>
      <blockquote className="border-l-4 border-primary-base/30 pl-4 py-1 italic text-gray-500 text-sm font-medium">
       &quot;Хороший дизайн очевиден. Отличный дизайн незаметен.&quot; — Джо Спарано
      </blockquote>
     </div>
    </ComponentShowcase>

    {/* Section: Bento Specialized */}
    <ComponentShowcase title="Брендовый блок Hero" source="custom">
      <BentoHeroText />
    </ComponentShowcase>

    <ComponentShowcase title="Стеклянная цитата" source="custom">
      <BentoGlassBlockquote />
    </ComponentShowcase>

    <ComponentShowcase title="Многослойный заголовок" source="custom">
      <BentoLayeredHeading title="MERCH" />
    </ComponentShowcase>

    <ComponentShowcase title="Интерактивный сплит" source="custom">
      <BentoSplitHeading text="CREATIVE" />
    </ComponentShowcase>

    <ComponentShowcase title="Размытый текст (Blur)" source="custom">
      <div className="p-6 bg-slate-950 rounded-[32px] overflow-hidden">
        <BentoBlurText 
          text="Плавное появление элементов интерфейса с эффектом блюра"
          className="text-white text-xl font-bold"
          animateBy="words"
        />
      </div>
    </ComponentShowcase>

    <ComponentShowcase title="Переворачивание (Flip)" source="custom">
      <div className="p-10 bg-white rounded-[32px] border border-gray-100 shadow-crm-md flex flex-col items-center justify-center gap-2">
        <span className="text-xs font-black text-primary-base tracking-widest">МЫ СОЗДАЕМ</span>
        <BentoFlipWords 
          words={["БУДУЩЕЕ", "ИНТЕРФЕЙСЫ", "ДИЗАЙН-СИСТЕМЫ", "ПЕРФОРМАНС"]}
          className="text-4xl font-black text-gray-950"
        />
      </div>
    </ComponentShowcase>

    <ComponentShowcase title="Бегущая строка (Rotating)" source="custom">
      <div className="p-10 bg-indigo-600 rounded-[28px] flex flex-col gap-1 items-start">
        <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Статус системы</span>
        <div className="text-2xl font-black text-white flex items-center gap-2">
          Система <BentoRotatingText 
            texts={["АКТИВНА", "СТАБИЛЬНА", "ОПТИМАЛЬНА"]} 
            mainClassName="bg-white/10 px-2 rounded-lg"
          />
        </div>
      </div>
    </ComponentShowcase>

    <ComponentShowcase title="Мерцающий градиент" source="custom">
      <BentoGradientText />
    </ComponentShowcase>

    <ComponentShowcase title="Поток в перспективе" source="custom">
      <BentoPerspectiveScrollText />
    </ComponentShowcase>

    <ComponentShowcase title="Безопасная маскировка" source="custom">
      <BentoMaskedText />
    </ComponentShowcase>

    <ComponentShowcase title="Печатная машинка (Full)" source="custom">
      <div className="p-8 bg-zinc-950 rounded-[32px] min-h-[160px] flex items-center justify-center">
        <BentoTypewriter 
          words={[
            { text: "Автоматизация" },
            { text: "бизнес-процессов", className: "text-blue-500" },
            { text: "MerchCRM." }
          ]}
          className="text-2xl text-white"
        />
      </div>
    </ComponentShowcase>

    <ComponentShowcase title="Типизация (Hint)" source="custom">
      <BentoTypewriterHint text="Загрузка метаданных CRM..." />
    </ComponentShowcase>

    <ComponentShowcase title="Просмотр диффов кода" source="custom">
      <BentoCodeDiff />
    </ComponentShowcase>

    <ComponentShowcase title="Анимированные фразы" source="custom">
       <BentoAnimatedQuote />
    </ComponentShowcase>

   </div>
  </CategoryPage>
 );
}
