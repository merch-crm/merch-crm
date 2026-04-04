"use client";

import React from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";

import { BentoHeroText } from "@/components/library/custom/components/typography/bento-hero-text";
import { BentoGlassBlockquote } from "@/components/library/custom/components/typography/bento-glass-blockquote";
import { BentoAnimatedQuote } from "@/components/library/custom/components/typography/bento-animated-quote";
import { BentoCodeDiff } from "@/components/library/custom/components/typography/bento-code-diff";
import { BentoTypewriterHint } from "@/components/library/custom/components/typography/bento-typewriter-hint";
import { BentoMaskedText } from "@/components/library/custom/components/typography/bento-masked-text";
import { BentoPerspectiveScrollText } from "@/components/library/custom/components/typography/bento-perspective-scroll-text";
import { BentoGradientText } from "@/components/library/custom/components/typography/bento-gradient-text";

import { FlipWords } from "@/components/library/aceternity/components/flip-words";
import { TypewriterEffect } from "@/components/library/aceternity/components/typewriter-effect";
import { RotatingText } from "@/components/library/custom/components/rotating-text";

export default function TypographyPage() {
  const words = ["быстрее", "продуктивнее", "умнее", "эффективнее"];

  return (
    <CategoryPage
      title="Типографика"
      description="Текстовые блоки, заголовки, цитаты, анимированные фразы и кодовые диффы."
      count={12}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-10">

        <ComponentShowcase title="Стандартные заголовки" source="custom">
          <div className="flex flex-col gap-3 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <h1 className="text-4xl font-black text-gray-900 border-b pb-4">Заголовок H1</h1>
            <h2 className="text-2xl font-bold text-gray-800">Заголовок H2</h2>
            <h3 className="text-lg font-medium text-gray-600">Заголовок H3</h3>
          </div>
        </ComponentShowcase>

        <ComponentShowcase title="Брендовый блок Hero" source="custom">
           <BentoHeroText />
        </ComponentShowcase>

        <ComponentShowcase title="Стеклянная цитата" source="custom">
           <BentoGlassBlockquote />
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

        <ComponentShowcase title="Просмотр диффов кода" source="custom">
           <BentoCodeDiff />
        </ComponentShowcase>

        <ComponentShowcase title="Консоль «Печатная машинка»" source="custom">
           <BentoTypewriterHint text="Загрузка метаданных CRM..." />
        </ComponentShowcase>

        <ComponentShowcase title="Анимированные фразы" source="custom">
             <BentoAnimatedQuote />
        </ComponentShowcase>

        <ComponentShowcase title="Вращающийся текст" source="reactbits" desc="Плавная смена ключевых слов.">
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

        <ComponentShowcase title="Переворот слов" source="aceternity" desc="Динамическая смена ключевых слов в предложении.">
           <div className="h-[200px] flex items-center justify-center bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
              <div className="text-3xl font-black text-gray-900 font-heading  text-center">
                 Ваш офис станет <br/>
                 <FlipWords words={words} className="text-primary-base" />
              </div>
           </div>
        </ComponentShowcase>

        <ComponentShowcase title="Эффект печати" source="aceternity" desc="Интерактивный эффект печати с поддержкой выделения.">
           <div className="flex flex-col items-center justify-center h-[200px] bg-slate-950 rounded-[2.5rem] p-8 border border-white/5">
              <TypewriterEffect 
                words={[
                  { text: "Создавайте", className: "text-white" },
                  { text: "лучший", className: "text-white" },
                  { text: "мерч", className: "text-primary-base font-black" },
                  { text: "вместе", className: "text-white" },
                  { text: "с", className: "text-white" },
                  { text: "нами.", className: "text-emerald-400" },
                ]}
              />
           </div>
        </ComponentShowcase>

      </div>
    </CategoryPage>
  );
}
