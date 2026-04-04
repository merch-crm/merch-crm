"use client";

import React, { useState } from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { Check, X, ShieldCheck, Zap, Crown } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [isYearly] = useState(false);

  const plans = [
    {
      name: "Старт",
      price: isYearly ? "0" : "0",
      description: "Для небольших команд и фрилансеров",
      features: ["До 3 пользователей", "100 сделок в месяц", "Базовая воронка", "Поддержка в чате"],
      notIncluded: ["API доступ", "Расширенная аналитика", "Удаление брендинга"],
      icon: <Zap className="size-5 text-blue-500" />,
      buttonText: "Выбрать",
      featured: false
    },
    {
      name: "Бизнес",
      price: isYearly ? "2 490" : "2 990",
      description: "Растущий бизнес с глубокой аналитикой",
      features: ["До 15 пользователей", "Безлимитно сделок", "Автоматизация воронок", "API и Вебхуки", "Техподдержка 24/7"],
      notIncluded: ["Персональный менеджер", "SLA гарантии"],
      icon: <Crown className="size-5 text-indigo-500" />,
      buttonText: "Перейти на Бизнес",
      featured: true,
      tag: "Популярный"
    },
    {
      name: "Enterprise",
      price: "Индивид.",
      description: "Масштабируемые решения для корпораций",
      features: ["Любое кол-во пользователей", "Выделенный сервер", "Кастомные интеграции", "SLA 99.9%", "Обучение персонала"],
      notIncluded: [],
      icon: <ShieldCheck className="size-5 text-emerald-500" />,
      buttonText: "Связаться с нами",
      featured: false
    }
  ];

  return (
    <CategoryPage
      title="Тарифы и монетизация"
      description="Премиум-подписки, сводки по биллингу и управление лимитами для Enterprise SaaS."
      count={2}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-16">
        {/* 3. Pricing Grid (Compact Section) */}
        <ComponentShowcase title="Сетка тарифов (Группа)" source="custom" className="lg:col-span-2">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-5xl mx-auto px-4">
              {plans.map(plan => (
                <div key={plan.name} className={cn("p-6 rounded-3xl border flex flex-col", plan.featured ? "border-primary-base/30 shadow-xl shadow-primary-base/5 ring-1 ring-primary-base/20 bg-primary-base/[0.02]" : "border-slate-100 bg-white shadow-sm")}>
                   <div className="flex items-center justify-between mb-4">
                      {plan.icon}
                      {plan.tag && <Badge className="text-[8px] bg-primary-base/10 text-primary-base border-none font-black ">{plan.tag}</Badge>}
                   </div>
                   <h4 className="text-lg font-black text-slate-900 mb-1">{plan.name}</h4>
                   <p className="text-[11px] text-slate-400 font-medium mb-4 leading-tight">{plan.description}</p>
                   
                   <div className="mb-6">
                      <span className="text-2xl font-black text-slate-900">{plan.price} ₽</span>
                      {plan.price !== "Индивид." && <span className="text-[11px] font-bold text-slate-400 ml-1">/мес</span>}
                   </div>

                   <div className="space-y-2.5 mb-8 flex-1">
                      {plan.features.map(f => (
                        <div key={f} className="flex items-start gap-2.5">
                           <Check size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                           <span className="text-[11px] font-bold text-slate-600 leading-tight">{f}</span>
                        </div>
                      ))}
                      {plan.notIncluded.map(f => (
                        <div key={f} className="flex items-start gap-2.5 opacity-40">
                           <X size={12} className="text-slate-400 mt-0.5 shrink-0" />
                           <span className="text-[11px] font-bold text-slate-600 leading-tight">{f}</span>
                        </div>
                      ))}
                   </div>

                   <button className={cn("w-full h-10 rounded-xl text-xs font-black transition-all", plan.featured ? "bg-primary-base text-white shadow-lg shadow-primary-base/20 hover:bg-primary-hover" : "border-2 border-slate-100 text-slate-600 hover:bg-slate-50")}>
                      {plan.buttonText}
                   </button>
                </div>
              ))}
           </div>
        </ComponentShowcase>





        {/* 10. Billing Method Card */}
        <ComponentShowcase title="Платежный метод" source="custom">
          <div className="w-full max-w-sm mx-auto p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-slate-900 rounded flex items-center justify-center text-[11px] text-white font-black">VISA</div>
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-slate-800">•••• 4412</span>
                   <span className="text-[11px] text-slate-400 font-bold ">Exp 12/26</span>
                </div>
             </div>
             <button className="text-[11px] font-black text-primary-base   hover:underline">Изменить</button>
          </div>
        </ComponentShowcase>












      </div>
    </CategoryPage>
  );
}
