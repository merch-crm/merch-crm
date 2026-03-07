"use client";

import React from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, Shirt, Package, Scissors, Box } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
const steps = [
    { id: 1, name: "Категория", desc: "Выбор категории" },
    { id: 2, name: "Описание", desc: "Характеристики" },
    { id: 3, name: "Галерея", desc: "Фото и медиа" },
    { id: 4, name: "Склад", desc: "Остатки и хранение" },
    { id: 5, name: "Итог", desc: "Проверка и создание" },
];

const topCategories = [
    { id: "1", name: "Одежда", icon: Shirt, color: "#ec4899", active: true },
    { id: "2", name: "Аксессуары", icon: Package, color: "#84cc16", active: false },
    { id: "3", name: "Расходники", icon: Scissors, color: "#f97316", active: false },
    { id: "4", name: "Прочее", icon: Box, color: "#3b82f6", active: false },
];

const subCategories = [
    { id: "1-1", name: "Футболка", icon: Shirt, color: "#ec4899", active: true },
    { id: "1-2", name: "Худи", icon: Shirt, color: "#ec4899", active: false },
    { id: "1-3", name: "Кепка", icon: Package, color: "#ec4899", active: false },
    { id: "1-4", name: "Носки", icon: Package, color: "#ec4899", active: false },
];

export default function CategoryBentoUiKit() {
    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-[1480px] mx-auto space-y-24">

                {/* Header */}
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">UI Kit: Category Bento</h1>
                    <p className="text-lg text-slate-500">5 различных вариантов бенто-дизайна для страницы выбора категории (Новая позиция).</p>
                </div>

                {/* Variant 1: Apple Glass Bento (Vibrant & Soft) */}
                <section>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">1. Apple Glass Bento (Vibrant & Soft)</h2>
                        <p className="text-slate-500">Глубокие тени, полупрозрачность, крупные скругления и яркие акценты.</p>
                    </div>
                    <div className="flex gap-4 p-8 rounded-[48px] bg-slate-100/50 border border-white max-w-6xl shadow-[inset_0_4px_24px_rgba(255,255,255,0.8)] mx-auto h-[800px] overflow-hidden">

                        {/* Sidebar */}
                        <aside className="w-[320px] shrink-0 bg-white/80 backdrop-blur-3xl rounded-[36px] border border-white/60 shadow-xl shadow-slate-200/50 p-6 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                            <button className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors mb-10 w-fit">
                                <ChevronLeft className="w-4 h-4" strokeWidth={3} /> Назад
                            </button>
                            <h2 className="text-2xl font-bold mb-10">Новая позиция<br /><span className="text-sm text-slate-400 font-medium">Создание карточки товара</span></h2>

                            <div className="space-y-4 flex-1">
                                {steps.map(step => (
                                    <div key={step.id} className={cn(
                                        "flex items-center gap-4 p-4 rounded-3xl transition-all",
                                        step.id === 1 ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-slate-400 opacity-60"
                                    )}>
                                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center font-bold", step.id === 1 ? "bg-white/20" : "bg-slate-100 text-slate-500")}>
                                            {step.id}
                                        </div>
                                        <div>
                                            <div className="font-bold">{step.name}</div>
                                            <div className={cn("text-xs", step.id === 1 ? "text-white/80" : "text-slate-400")}>{step.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto h-[80px] bg-slate-50/50 rounded-3xl border border-white flex items-center justify-between px-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400">Черновик</div>
                                        <div className="text-xs font-bold text-slate-900">Сохранено</div>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content Area (Bento Layout) */}
                        <main className="flex-1 flex flex-col gap-4 overflow-hidden">
                            {/* Top Level Category Selection */}
                            <div className="bg-white/80 backdrop-blur-3xl rounded-[36px] border border-white/60 shadow-xl shadow-slate-200/50 p-8 flex-1 min-h-[300px] flex flex-col">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                                        <LayoutGrid className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900">Выберите категорию</h3>
                                        <p className="text-sm font-medium text-slate-500">От категории зависят доступные поля и характеристики</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-4 flex-1">
                                    {topCategories.map(cat => (
                                        <div key={cat.id} className={cn(
                                            "rounded-3xl border-2 p-6 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group",
                                            cat.active ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
                                        )}>
                                            <div className={cn(
                                                "w-16 h-16 rounded-2xl flex items-center justify-center text-white transition-all shadow-lg",
                                                cat.active ? "scale-110" : "group-hover:scale-105"
                                            )} style={{ backgroundColor: cat.color, boxShadow: `0 8px 24px -8px ${cat.color}` }}>
                                                <cat.icon className="w-8 h-8 stroke-[2]" />
                                            </div>
                                            <span className={cn("font-bold text-lg", cat.active ? "text-slate-900" : "text-slate-600")}>{cat.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Subcategory Selection & Footer Bento Block */}
                            <div className="flex gap-4 shrink-0 h-[280px]">
                                <div className="bg-white/80 backdrop-blur-3xl rounded-[36px] border border-white/60 shadow-xl shadow-slate-200/50 p-8 flex-1 flex flex-col relative overflow-hidden">
                                    <div className="flex items-center gap-4 mb-6 relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                                            <LayoutGrid className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-900">Подкатегория</h4>
                                            <p className="text-xs font-medium text-slate-500">Уточните тип для «Одежда»</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3 relative z-10">
                                        {subCategories.map(sub => (
                                            <div key={sub.id} className={cn(
                                                "px-4 py-3 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all font-bold",
                                                sub.active ? "border-pink-500 bg-pink-50 shadow-md shadow-pink-500/10 text-pink-700" : "border-slate-100 bg-white hover:border-slate-200 text-slate-600 shadow-sm"
                                            )}>
                                                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm")} style={{ backgroundColor: sub.color }}>
                                                    <sub.icon className="w-4 h-4 stroke-2" />
                                                </div>
                                                {sub.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="w-[320px] bg-slate-900 rounded-[36px] shadow-2xl shadow-slate-900/40 p-8 flex flex-col items-center justify-center relative overflow-hidden text-center cursor-pointer group">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-50 pointer-events-none" />
                                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                                        <ChevronRight className="w-8 h-8 stroke-[2.5]" />
                                    </div>
                                    <h4 className="text-white font-bold text-xl mb-1">Продолжить</h4>
                                    <p className="text-slate-400 text-sm">Перейти к описанию</p>
                                </div>
                            </div>
                        </main>
                    </div>
                </section>

                {/* Variant 2: Neo-Brutalist Bento */}
                <section>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">2. Neo-Brutalist Bento</h2>
                        <p className="text-slate-500">Жесткие черные рамки, плотные смещенные тени, контрастные цвета и никакой размытости.</p>
                    </div>
                    <div className="flex gap-6 p-8 rounded-none bg-[#f4f4f0] border-4 border-black max-w-6xl mx-auto h-[800px] shadow-[16px_16px_0_0_rgba(0,0,0,1)]">

                        {/* Sidebar */}
                        <aside className="w-[300px] shrink-0 bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 flex flex-col">
                            <button className="flex items-center gap-2 text-black font-black uppercase text-sm mb-10 w-fit border-b-2 border-black pb-1 hover:bg-black hover:text-white transition-colors">
                                &lt; Назад
                            </button>
                            <h2 className="text-3xl font-black mb-10 uppercase tracking-tight">Новая<br />Позиция</h2>

                            <div className="space-y-4 flex-1">
                                {steps.map(step => (
                                    <div key={step.id} className={cn(
                                        "flex items-center gap-4 p-3 border-2 border-black transition-all",
                                        step.id === 1 ? "bg-yellow-300 shadow-[4px_4px_0_0_rgba(0,0,0,1)] -translate-y-1 -translate-x-1" : "bg-white opacity-50 grayscale"
                                    )}>
                                        <div className="w-10 h-10 border-2 border-black flex items-center justify-center font-black bg-white">
                                            {step.id}
                                        </div>
                                        <div>
                                            <div className="font-black uppercase text-sm leading-tight">{step.name}</div>
                                            <div className="text-[10px] font-bold uppercase">{step.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto h-[70px] bg-white border-4 border-black flex items-center justify-between px-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                                <span className="font-black uppercase text-sm">Draft // Saved</span>
                                <div className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-black" />
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <main className="flex-1 flex flex-col gap-6 overflow-hidden">
                            {/* Top Level Category */}
                            <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8 flex-1 min-h-[300px] flex flex-col">
                                <div className="flex items-start justify-between border-b-4 border-black pb-6 mb-8">
                                    <div>
                                        <h3 className="text-4xl font-black uppercase">Выбор категории</h3>
                                        <p className="text-sm font-bold uppercase mt-2 bg-yellow-300 inline-block px-2 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">Шаг 1</p>
                                    </div>
                                    <div className="w-16 h-16 bg-blue-400 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex items-center justify-center">
                                        <LayoutGrid className="w-8 h-8 text-black" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-6 flex-1">
                                    {topCategories.map(cat => (
                                        <div key={cat.id} className={cn(
                                            "border-4 border-black p-6 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer font-black uppercase text-center",
                                            cat.active ? "bg-pink-400 shadow-[8px_8px_0_0_rgba(0,0,0,1)] -translate-y-2 -translate-x-2" : "bg-white hover:bg-slate-100 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
                                        )}>
                                            <div className="w-16 h-16 border-4 border-black bg-white flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                                                <cat.icon className="w-8 h-8 text-black stroke-[3]" />
                                            </div>
                                            {cat.name}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Subcategory & Footer */}
                            <div className="flex gap-6 shrink-0 h-[260px]">
                                <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8 flex-1 flex flex-col">
                                    <h4 className="text-2xl font-black uppercase mb-6 pb-2 border-b-4 border-black inline-block">Подкатегория</h4>
                                    <div className="flex flex-wrap gap-4">
                                        {subCategories.map(sub => (
                                            <div key={sub.id} className={cn(
                                                "px-4 py-3 border-4 border-black flex items-center gap-3 cursor-pointer transition-all font-black uppercase",
                                                sub.active ? "bg-yellow-300 shadow-[4px_4px_0_0_rgba(0,0,0,1)] -translate-y-1 -translate-x-1" : "bg-white hover:bg-slate-100 shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                                            )}>
                                                {sub.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button className="w-[300px] bg-black border-4 border-black shadow-[8px_8px_0_0_rgba(236,72,153,1)] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-pink-500 hover:text-black text-white hover:shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 transition-all group">
                                    <h4 className="font-black text-3xl mb-2 uppercase group-hover:block">Далее</h4>
                                    <ChevronRight className="w-12 h-12 stroke-[4]" />
                                </button>
                            </div>
                        </main>
                    </div>
                </section>

                {/* Variant 3: Dark Mode Cyber Bento */}
                <section>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">3. Dark Mode Cyber Bento</h2>
                        <p className="text-slate-500">Глубокий темный фон (slate-950), неоновые акценты (border, свечение), моноширинные шрифты (детали).</p>
                    </div>
                    <div className="flex gap-4 p-6 rounded-[32px] bg-slate-950 border border-slate-800 max-w-6xl mx-auto h-[800px] relative overflow-hidden">
                        {/* Background glow lines */}
                        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
                        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-pink-500/30 to-transparent" />

                        {/* Sidebar */}
                        <aside className="w-[280px] shrink-0 bg-slate-900/50 backdrop-blur-xl rounded-[24px] border border-slate-800 p-6 flex flex-col relative">
                            <button className="flex items-center gap-2 text-slate-500 font-mono text-xs hover:text-primary transition-colors mb-10 w-fit">
                                &lt; RET_TO_PREV
                            </button>
                            <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest">N_ITEM</h2>
                            <div className="text-[10px] font-mono text-slate-500 mb-10 w-full border-b border-slate-800 pb-2">SYS.INIT_PROCEDURE</div>

                            <div className="space-y-2 flex-1 relative">
                                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-800/80 -z-10" />
                                {steps.map(step => (
                                    <div key={step.id} className={cn(
                                        "flex items-center gap-4 p-3 rounded-2xl transition-all",
                                        step.id === 1 ? "bg-slate-800/80 border border-slate-700 shadow-[0_0_15px_rgba(93,0,255,0.2)]" : "opacity-50"
                                    )}>
                                        <div className={cn(
                                            "w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs z-10",
                                            step.id === 1 ? "bg-primary text-white shadow-[0_0_10px_rgba(93,0,255,0.5)]" : "bg-slate-900 border border-slate-700 text-slate-500"
                                        )}>
                                            0{step.id}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-white uppercase">{step.name}</div>
                                            <div className="text-[9px] font-mono text-slate-400 uppercase">{step.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto h-[60px] bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between px-4">
                                <span className="font-mono text-[10px] text-slate-500">STATUS: SAVED</span>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <main className="flex-1 flex flex-col gap-4">
                            {/* Top Level Category */}
                            <div className="bg-slate-900/50 backdrop-blur-md rounded-[24px] border border-slate-800 p-8 flex-1 min-h-[300px] flex flex-col relative overflow-hidden group/main">
                                {/* Ambient glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none opacity-50" />

                                <div className="flex justify-between items-start mb-10 relative z-10 border-b border-slate-800 pb-4">
                                    <div>
                                        <h3 className="text-3xl font-black text-white uppercase tracking-wider mb-1">Select_Category</h3>
                                        <div className="text-xs font-mono text-slate-500">REQ_INPUT: TRUE // VAR: TYPE</div>
                                    </div>
                                    <div className="text-xs font-mono text-primary border border-primary/30 px-3 py-1 rounded bg-primary/10">STEP 01</div>
                                </div>

                                <div className="grid grid-cols-4 gap-4 flex-1 relative z-10">
                                    {topCategories.map(cat => (
                                        <div key={cat.id} className={cn(
                                            "rounded-[20px] border p-6 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer relative overflow-hidden group",
                                            cat.active ? "border-pink-500 bg-pink-500/10 shadow-[0_0_20px_rgba(236,72,153,0.15)]" : "border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-800"
                                        )}>
                                            {cat.active && <div className="absolute top-0 left-0 w-full h-1 bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]" />}
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                                                cat.active ? "text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)] scale-110" : "text-slate-500 group-hover:text-slate-300"
                                            )}>
                                                <cat.icon className="w-8 h-8 stroke-[1.5]" />
                                            </div>
                                            <span className={cn("font-bold uppercase tracking-wide text-sm", cat.active ? "text-white" : "text-slate-400")}>{cat.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Subcategory & Footer */}
                            <div className="flex gap-4 shrink-0 h-[220px]">
                                <div className="bg-slate-900/50 backdrop-blur-md rounded-[24px] border border-slate-800 p-6 flex-1 flex flex-col relative">
                                    <div className="text-[10px] font-mono text-slate-500 mb-4 uppercase">Refine_Properties();</div>
                                    <div className="flex flex-wrap gap-3">
                                        {subCategories.map(sub => (
                                            <div key={sub.id} className={cn(
                                                "px-4 py-2 rounded-xl border flex items-center gap-3 cursor-pointer transition-all font-mono text-xs uppercase",
                                                sub.active ? "border-pink-500 bg-pink-500/10 text-pink-400 shadow-[inset_0_0_10px_rgba(236,72,153,0.2)]" : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white"
                                            )}>
                                                {sub.active && <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_5px_rgba(236,72,153,0.8)]" />}
                                                {sub.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button className="w-[180px] bg-primary rounded-[24px] border border-primary shadow-[0_0_30px_rgba(93,0,255,0.3)] p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-primary-hover hover:scale-95 transition-all group">
                                    <ChevronRight className="w-10 h-10 stroke-[2] text-white group-hover:translate-x-1 transition-transform mb-2" />
                                    <span className="font-mono text-xs uppercase text-white font-bold opacity-80">Execute_Next</span>
                                </button>
                            </div>
                        </main>
                    </div>
                </section>

                {/* Variant 4: Pastel Soft Bento */}
                <section>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">4. Pastel Soft Bento</h2>
                        <p className="text-slate-500">Пастельные заливки блоков, отсутствие границ (только фон), очень круглые формы, мягкость.</p>
                    </div>
                    <div className="flex gap-4 p-8 rounded-[48px] bg-white border border-slate-100 max-w-6xl mx-auto h-[800px] shadow-sm">

                        {/* Sidebar */}
                        <aside className="w-[300px] shrink-0 bg-rose-50 rounded-[32px] p-8 flex flex-col">
                            <button className="flex items-center gap-2 text-rose-300 font-bold hover:text-rose-600 transition-colors mb-8 w-fit">
                                <ChevronLeft className="w-5 h-5" strokeWidth={3} /> Вернуться
                            </button>
                            <h2 className="text-2xl font-black text-rose-950 mb-10">Новая позиция</h2>

                            <div className="space-y-2 flex-1 relative">
                                {steps.map(step => (
                                    <div key={step.id} className={cn(
                                        "flex items-center gap-4 p-4 rounded-[24px] transition-all",
                                        step.id === 1 ? "bg-white shadow-sm text-rose-950" : "text-rose-400/60"
                                    )}>
                                        <div className={cn(
                                            "w-12 h-12 rounded-[16px] flex items-center justify-center font-bold text-lg",
                                            step.id === 1 ? "bg-rose-100/50 text-rose-600" : "bg-transparent"
                                        )}>
                                            {step.id}
                                        </div>
                                        <div>
                                            <div className="font-bold">{step.name}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto h-[80px] bg-white rounded-[24px] flex items-center justify-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                <span className="font-bold text-sm text-slate-700">В черновике</span>
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <main className="flex-1 flex flex-col gap-4">
                            {/* Top Level Category */}
                            <div className="bg-slate-50 rounded-[32px] p-8 flex-1 min-h-[300px] flex flex-col">
                                <h3 className="text-3xl font-black text-slate-800 mb-8 text-center pt-4">Какую позицию добавляем?</h3>

                                <div className="grid grid-cols-4 gap-4 flex-1">
                                    {topCategories.map(cat => (
                                        <div key={cat.id} className={cn(
                                            "rounded-[32px] p-6 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group",
                                            cat.active ? "bg-white shadow-md shadow-slate-200/50 scale-105 z-10" : "bg-slate-200/50 hover:bg-slate-200"
                                        )}>
                                            <div className={cn(
                                                "w-20 h-20 rounded-full flex items-center justify-center transition-all",
                                                cat.active ? "" : "opacity-50 group-hover:opacity-80"
                                            )} style={{ backgroundColor: cat.active ? cat.color + '20' : 'transparent', color: cat.active ? cat.color : '#64748b' }}>
                                                <cat.icon className="w-10 h-10 stroke-[2]" />
                                            </div>
                                            <span className={cn("font-bold text-lg", cat.active ? "text-slate-800" : "text-slate-500")}>{cat.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Subcategory & Footer */}
                            <div className="flex gap-4 shrink-0 h-[240px]">
                                <div className="bg-indigo-50/70 rounded-[32px] p-8 flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden">
                                    {/* Subtle background element */}
                                    <LayoutGrid className="absolute -left-10 -bottom-10 w-64 h-64 text-indigo-900/[0.03] pointer-events-none" />
                                    <h4 className="text-xl font-bold text-indigo-950 mb-6 relative z-10">Уточнить категорию товара</h4>
                                    <div className="flex flex-wrap justify-center gap-2 relative z-10">
                                        {subCategories.map(sub => (
                                            <div key={sub.id} className={cn(
                                                "px-6 py-4 rounded-full flex items-center gap-2 cursor-pointer transition-all font-bold text-sm",
                                                sub.active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-white text-indigo-900/60 hover:bg-white/80"
                                            )}>
                                                {sub.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button className="w-[240px] bg-slate-900 rounded-[32px] p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-all group shadow-xl shadow-slate-900/10">
                                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
                                        <ChevronRight className="w-8 h-8 stroke-[2.5] text-white" />
                                    </div>
                                    <span className="font-bold text-white text-lg">Продолжить</span>
                                </button>
                            </div>
                        </main>
                    </div>
                </section>

                {/* Variant 5: Seamless Minimal Bento */}
                <section>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">5. Seamless Minimal Bento</h2>
                        <p className="text-slate-500">Минимум рамок, разделение тонкими 1px линиями, монохром внутри, упор на гигантскую типографику и четкую сетку.</p>
                    </div>
                    <div className="flex p-0 rounded-none bg-white border border-slate-200 max-w-6xl mx-auto h-[800px] shadow-sm">

                        {/* Sidebar */}
                        <aside className="w-[320px] shrink-0 bg-white border-r border-slate-200 p-8 flex flex-col">
                            <button className="flex items-center gap-2 text-slate-400 font-medium hover:text-black hover:underline transition-colors mb-16 w-fit text-sm">
                                ← Back to inventory
                            </button>
                            <h2 className="text-4xl font-light tracking-tight text-black mb-16">Create<br /><span className="font-semibold">New Item</span></h2>

                            <div className="space-y-8 flex-1">
                                {steps.map((step, idx) => (
                                    <div key={step.id} className={cn(
                                        "flex items-baseline gap-4",
                                        step.id === 1 ? "text-black" : "text-slate-300"
                                    )}>
                                        <div className="font-mono text-xs w-4">0{idx + 1}</div>
                                        <div>
                                            <div className="text-xl font-medium tracking-tight leading-none mb-1">{step.name}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto pt-8 border-t border-slate-100 flex items-center justify-between">
                                <span className="font-medium text-sm text-slate-500">Draft Status</span>
                                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-900">SAVED</span>
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <main className="flex-1 flex flex-col">
                            {/* Top Level Category */}
                            <div className="bg-white p-12 flex-1 min-h-[400px] flex flex-col">
                                <h3 className="text-6xl font-black text-black tracking-tighter mb-12">Category.</h3>

                                <div className="grid grid-cols-2 gap-x-8 gap-y-8 flex-1">
                                    {topCategories.map(cat => (
                                        <div key={cat.id} className={cn(
                                            "border-b-2 pb-6 flex items-end justify-between transition-all cursor-pointer group",
                                            cat.active ? "border-black" : "border-slate-100 hover:border-slate-300"
                                        )}>
                                            <div className="flex flex-col gap-4">
                                                <div className={cn("w-12 h-12 flex items-center justify-center rounded-full transition-colors", cat.active ? "bg-black text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100")}>
                                                    <cat.icon className="w-5 h-5 stroke-[1.5]" />
                                                </div>
                                                <span className={cn("text-3xl font-medium tracking-tight", cat.active ? "text-black" : "text-slate-400")}>{cat.name}</span>
                                            </div>
                                            {cat.active && <div className="w-4 h-4 rounded-full bg-black mb-2" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Subcategory & Footer */}
                            <div className="flex border-t border-slate-200 shrink-0 h-[280px]">
                                <div className="bg-white p-12 flex-1 border-r border-slate-200">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">Refine Search</h4>
                                    <div className="flex flex-col gap-3">
                                        {subCategories.map(sub => (
                                            <div key={sub.id} className={cn(
                                                "flex items-center gap-4 cursor-pointer group w-fit",
                                                sub.active ? "text-black" : "text-slate-400"
                                            )}>
                                                <div className={cn("w-6 h-px transition-all", sub.active ? "bg-black w-8" : "bg-transparent group-hover:bg-slate-300")} />
                                                <span className="text-2xl font-light">{sub.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button className="w-[320px] bg-white hover:bg-black hover:text-white p-12 flex flex-col items-start justify-between cursor-pointer transition-colors group">
                                    <span className="text-sm font-bold uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">Next Step</span>
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-5xl font-light">Proceed</span>
                                        <ChevronRight className="w-12 h-12 stroke-[1]" />
                                    </div>
                                </button>
                            </div>
                        </main>
                    </div>
                </section>

                {/* Footer padding */}
                <div className="h-24"></div>
            </div>
        </div>
    );
}
