"use client";

import React from "react";
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { Typo } from "@/components/ui/typo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Box, Layers, PanelTop, Sparkles } from "lucide-react";

const tokenData = [
 {
 name: "rounded-element",
 value: "16px",
 usage: "Кнопки, инпуты, селекты, дропдауны, чекбоксы",
 cssVar: "--radius-element",
 color: "bg-emerald-50 text-emerald-700 border-emerald-200",
 },
 {
 name: "rounded-card",
 value: "24px",
 usage: "Карточки, модальные окна, контейнеры графиков, Bento-блоки",
 cssVar: "--radius-card",
 color: "bg-blue-50 text-blue-700 border-blue-200",
 },
 {
 name: "rounded-full",
 value: "9999px",
 usage: "Бейджи, фильтры-теги, круглые кнопки-иконки, аватары",
 cssVar: "—",
 color: "bg-amber-50 text-amber-700 border-amber-200",
 },
];

export default function ShapesPage() {
 return (
 <CategoryPage title="Скругления и Формы"
 description={<Typo>Семантические токены border-radius и структурные CSS-классы проекта. Все скругления задаются явно через Tailwind-утилиты в JSX — глобальных CSS-правил нет.</Typo>}
 >
 {/* ==========================================
 SECTION 1: Токены скругления
 ========================================== */}
 <ComponentShowcase
 title="Токены скругления"
 source="custom"
 description="Три семантических уровня скругления, покрывающие 100% потребностей проекта: от мелких элементов до крупных Bento-карт."
 importPath='import { tokenData } from "@/app/ui-kit/(with-sidebar)/shapes/page";'
 >
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
 {tokenData.map((token) => (
 <div
 key={token.name}
 className="flex flex-col gap-4 p-6 bg-white rounded-card border border-slate-100 shadow-sm"
 >
 <div className="flex items-center justify-between">
 <code className={`text-xs font-black px-2.5 py-1 rounded-full border ${token.color}`}>
 {token.name}
 </code>
 <span className="text-xs font-black text-slate-400 tabular-nums">{token.value}</span>
 </div>

 {/* Visual preview */}
 <div className="bg-slate-50 rounded-element p-6 flex items-center justify-center min-h-[100px]">
 <div
 className="w-full h-16 bg-slate-200 border border-slate-300 shadow-inner flex items-center justify-center"
 style={{ borderRadius: token.value === "9999px" ? "9999px" : token.value }}
 >
 <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
 {token.value}
 </span>
 </div>
 </div>

 <p className="text-xs text-slate-500 font-medium leading-relaxed">{token.usage}</p>

 {token.cssVar !== "—" && (
 <code className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded-md self-start">
 CSS: var({token.cssVar})
 </code>
 )}
 </div>
 ))}
 </div>
 </ComponentShowcase>

 {/* ==========================================
 SECTION 2: Визуальное сравнение
 ========================================== */}
 <ComponentShowcase
 title="Визуальное сравнение"
 source="custom"
 description="Наглядное сопоставление всех трех токенов в реальном масштабе для понимания визуальной иерархии."
 importPath='import { tokenData } from "@/app/ui-kit/(with-sidebar)/shapes/page";'
 >
 <div className="flex gap-6 items-end flex-wrap w-full justify-center p-8 bg-slate-50 rounded-card">
 {/* element */}
 <div className="flex flex-col items-center gap-3">
 <div className="w-32 h-20 bg-white border-2 border-emerald-300 rounded-element shadow-sm flex items-center justify-center">
 <span className="text-[10px] font-black text-emerald-600 uppercase">element</span>
 </div>
 <span className="text-[10px] font-bold text-slate-400">16px</span>
 </div>
 {/* card */}
 <div className="flex flex-col items-center gap-3">
 <div className="w-40 h-28 bg-white border-2 border-blue-300 rounded-card shadow-sm flex items-center justify-center">
 <span className="text-[10px] font-black text-blue-600 uppercase">card</span>
 </div>
 <span className="text-[10px] font-bold text-slate-400">24px</span>
 </div>
 {/* full */}
 <div className="flex flex-col items-center gap-3">
 <div className="w-32 h-10 bg-white border-2 border-amber-300 rounded-full shadow-sm flex items-center justify-center">
 <span className="text-[10px] font-black text-amber-600 uppercase">full</span>
 </div>
 <span className="text-[10px] font-bold text-slate-400">9999px</span>
 </div>
 </div>
 </ComponentShowcase>

 {/* ==========================================
 SECTION 3: Живые компоненты
 ========================================== */}
 <ComponentShowcase
 title="Применение в компонентах"
 source="custom"
 description="Демонстрация использования токенов в реальных интерфейсных элементах: кнопках, инпутах и карточках."
 importPath='import { Button } from "@/components/ui/button";'
 >
 <div className="flex flex-col gap-6 w-full">
 {/* rounded-element */}
 <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-element border border-slate-100">
 <code className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">rounded-element</code>
 <div className="flex gap-3 flex-wrap">
 <Button size="sm" className="rounded-element ">Кнопка</Button>
 <div className="h-10 w-48 bg-white rounded-element border border-slate-200 flex items-center px-3">
 <span className="text-xs text-slate-400 font-medium">Инпут ввода</span>
 </div>
 <div className="h-10 w-36 bg-white rounded-element border border-slate-200 flex items-center justify-between px-3">
 <span className="text-xs text-slate-400 font-medium">Селект</span>
 <span className="text-slate-300">▾</span>
 </div>
 </div>
 </div>

 {/* rounded-card */}
 <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-element border border-slate-100">
 <code className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 shrink-0 mt-1">rounded-card</code>
 <div className="flex gap-3 flex-wrap flex-1">
 <div className="crm-card rounded-card p-5 flex-1 min-w-[180px] bg-white border border-slate-100 shadow-sm">
 <div className="text-xs font-black text-slate-900">Bento-карточка</div>
 <div className="text-[10px] text-slate-400 mt-1">crm-card rounded-card</div>
 </div>
 <div className="glass-panel rounded-card p-5 flex-1 min-w-[180px] bg-white border border-slate-100 shadow-sm">
 <div className="text-xs font-black text-slate-900">Glass Panel</div>
 <div className="text-[10px] text-slate-400 mt-1">glass-panel rounded-card</div>
 </div>
 </div>
 </div>

 {/* rounded-full */}
 <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-element border border-slate-100">
 <code className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">rounded-full</code>
 <div className="flex gap-3 flex-wrap">
 <Badge color="success" icon={CheckCircle}>Готово</Badge>
 <Badge color="info" icon={Sparkles}>Новое</Badge>
 <Button variant="outline" color="neutral" className="rounded-full shadow-none border-slate-300 text-xs">
 Фильтр: Активные
 </Button>
 <Button variant="solid" color="primary" className="rounded-full size-10 p-0 flex items-center justify-center text-lg">
 +
 </Button>
 </div>
 </div>
 </div>
 </ComponentShowcase>

 {/* ==========================================
 SECTION 4: Структурные CSS-классы
 ========================================== */}
 <ComponentShowcase
 title="Структурные CSS-классы"
 source="custom"
 description="Базовые CSS-утилиты для Bento-дизайна. Классы определяют структуру, тени и фон, а скругление всегда задается явно через Tailwind."
 importPath='import "@/app/globals.css";'
 >
 <div className="flex flex-col gap-6 w-full">
 {/* crm-card */}
 <div className="flex flex-col gap-3">
 <div className="flex items-center gap-3">
 <Box size={16} className="text-slate-400" />
 <h4 className="text-sm font-black text-slate-900">crm-card</h4>
 <code className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
 padding + border + shadow + bg
 </code>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="crm-card rounded-card bg-white border border-slate-100 shadow-sm">
 <div className="text-xs font-black text-slate-900">Стандартный</div>
 <div className="text-[10px] text-slate-400 mt-1">crm-card rounded-card</div>
 </div>
 <div className="crm-card crm-card--elevated rounded-card bg-white">
 <div className="text-xs font-black text-slate-900">Приподнятый</div>
 <div className="text-[10px] text-slate-400 mt-1">crm-card--elevated</div>
 </div>
 <div className="crm-card crm-card--ghost rounded-card">
 <div className="text-xs font-black text-slate-900">Призрачный</div>
 <div className="text-[10px] text-slate-400 mt-1">crm-card--ghost</div>
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="crm-card crm-card--compact rounded-card bg-white border border-slate-100 shadow-sm">
 <div className="text-xs font-black text-slate-900">Компактный</div>
 <div className="text-[10px] text-slate-400 mt-1">crm-card--compact (padding: 22px)</div>
 </div>
 <div className="crm-card crm-card--spacious rounded-card bg-white border border-slate-100 shadow-sm">
 <div className="text-xs font-black text-slate-900">Просторный</div>
 <div className="text-[10px] text-slate-400 mt-1">crm-card--spacious (padding-xl)</div>
 </div>
 </div>
 </div>

 {/* glass-panel */}
 <div className="flex flex-col gap-3">
 <div className="flex items-center gap-3">
 <Layers size={16} className="text-slate-400" />
 <h4 className="text-sm font-black text-slate-900">glass-panel</h4>
 <code className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
 bg + border + shadow + transition
 </code>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="glass-panel rounded-card p-6">
 <div className="text-xs font-black text-slate-900">Glass Panel</div>
 <div className="text-[10px] text-slate-400 mt-1">Используется для лёгких панелей и ref-блоков. Скругление задаётся в JSX.</div>
 </div>
 <div className="glass-panel rounded-element p-6">
 <div className="text-xs font-black text-slate-900">Glass Panel (rounded-element)</div>
 <div className="text-[10px] text-slate-400 mt-1">Пример переопределения скругления на element-уровень</div>
 </div>
 </div>
 </div>

 {/* bento-grid */}
 <div className="flex flex-col gap-3">
 <div className="flex items-center gap-3">
 <PanelTop size={16} className="text-slate-400" />
 <h4 className="text-sm font-black text-slate-900">bento-grid</h4>
 <code className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
 12-column grid + gap
 </code>
 </div>
 <div className="bento-grid">
 <div className="col-span-4 crm-card rounded-card bg-white border border-slate-100 shadow-sm">
 <div className="text-xs font-black text-slate-900">col-span-4</div>
 </div>
 <div className="col-span-8 crm-card rounded-card bg-white border border-slate-100 shadow-sm">
 <div className="text-xs font-black text-slate-900">col-span-8</div>
 </div>
 <div className="col-span-6 crm-card rounded-card bg-white border border-slate-100 shadow-sm">
 <div className="text-xs font-black text-slate-900">col-span-6</div>
 </div>
 <div className="col-span-6 crm-card rounded-card bg-white border border-slate-100 shadow-sm">
 <div className="text-xs font-black text-slate-900">col-span-6</div>
 </div>
 </div>
 </div>
 </div>
 </ComponentShowcase>

 {/* ==========================================
 SECTION 5: Правила использования
 ========================================== */}
 <ComponentShowcase
 title="Правила использования"
 source="custom"
 description="Критически важный чек-лист для разработчиков по соблюдению геометрического стиля MerchCRM."
 importPath='import { CategoryPage } from "@/components/ui-kit";'
 >
 <div className="w-full max-w-2xl">
 <div className="flex flex-col gap-3 text-sm">
 <div className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-element border border-emerald-100">
 <span className="text-emerald-500 text-lg leading-none">✓</span>
 <div>
 <span className="font-black text-slate-900">Всегда</span>
 <span className="text-slate-600"> указывай скругление явно: </span>
 <code className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">rounded-card</code>
 <span className="text-slate-600"> или </span>
 <code className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">rounded-element</code>
 </div>
 </div>
 <div className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-element border border-emerald-100">
 <span className="text-emerald-500 text-lg leading-none">✓</span>
 <div>
 <span className="font-black text-slate-900">crm-card</span>
 <span className="text-slate-600"> + </span>
 <code className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">rounded-card</code>
 <span className="text-slate-600"> — стандарт для любого Bento-блока</span>
 </div>
 </div>
 <div className="flex items-start gap-3 p-3 bg-rose-50/50 rounded-element border border-rose-100">
 <span className="text-rose-500 text-lg leading-none">✗</span>
 <div>
 <span className="font-black text-slate-900">Никогда</span>
 <span className="text-slate-600"> не используй </span>
 <code className="text-[11px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md line-through">rounded-[20px]</code>
 <span className="text-slate-600"> — только семантические классы</span>
 </div>
 </div>
 <div className="flex items-start gap-3 p-3 bg-rose-50/50 rounded-element border border-rose-100">
 <span className="text-rose-500 text-lg leading-none">✗</span>
 <div>
 <span className="font-black text-slate-900">Никогда</span>
 <span className="text-slate-600"> не добавляй </span>
 <code className="text-[11px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md line-through">border-radius</code>
 <span className="text-slate-600"> в глобальные CSS-файлы</span>
 </div>
 </div>
 </div>
 </div>
 </ComponentShowcase>
 </CategoryPage>
 );
}
