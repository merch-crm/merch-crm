"use client";

import React from 'react';
import { Package, Building2, PackageCheck, Layers, Archive, Component } from 'lucide-react';
import { cn } from "@/lib/utils";

// Mock Data
const mockStats = [
    { label: "Всего складов", value: 2, icon: Building2, color: "text-blue-500", bgGlow: "bg-blue-500/10", borderColor: "border-blue-500/20" },
    { label: "Всего SKU", value: 1420, icon: Package, color: "text-indigo-500", bgGlow: "bg-indigo-500/10", borderColor: "border-indigo-500/20" },
    { label: "Всего товаров", value: "32,450", icon: PackageCheck, color: "text-emerald-500", bgGlow: "bg-emerald-500/10", borderColor: "border-emerald-500/20" },
    { label: "Всего категорий", value: 15, icon: Layers, color: "text-sky-500", bgGlow: "bg-sky-500/10", borderColor: "border-sky-500/20" },
    { label: "В резерве", value: 450, icon: Component, color: "text-orange-500", bgGlow: "bg-orange-500/10", borderColor: "border-orange-500/20" },
    { label: "Архив", value: 12, icon: Archive, color: "text-slate-400", bgGlow: "bg-slate-400/10", borderColor: "border-slate-400/20" },
];

export default function StatVariantsPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] p-8 pb-32">
            <div className="max-w-5xl mx-auto space-y-16">

                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-900">Варианты статистики</h1>
                    <p className="text-slate-500">Сравнение 3 концептуальных подходов к отображению сводной информации.</p>
                </div>

                {/* VARIANT 1: Base Compact (Current) */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">1</span>
                            Вариант 1: Базовый (Софт)
                        </h2>
                        <span className="text-sm font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">Текущий</span>
                    </div>

                    <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                <Layers className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 leading-tight">Общая статистика</h2>
                                <p className="text-sm text-slate-500">Сводка по складу</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                            {mockStats.map((stat, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors duration-200">
                                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <div className="text-xs font-bold text-slate-500 leading-tight truncate mt-0.5">
                                            {stat.label}
                                        </div>
                                        <div className="text-xl font-black text-slate-900 tabular-nums leading-none ">
                                            {stat.value}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* VARIANT 2: Glassmorphism / Floating */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">2</span>
                            Вариант 2: &quot;Воздушный&quot; (Glass / Упор на белый)
                        </h2>
                    </div>

                    {/* Note: The enclosing container here uses a very light subtle gradient to show off the white cards */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-[28px] border border-slate-200/60 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,1)]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                                <Layers className="w-6 h-6 text-slate-700" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 leading-tight">Общая статистика</h2>
                                <p className="text-sm font-medium text-slate-500">Сводка по складу</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                            {mockStats.map((stat, i) => (
                                <div key={i} className="group flex items-center gap-3.5 p-3 rounded-[24px] bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300">
                                    <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors", stat.bgGlow)}>
                                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                                    </div>
                                    <div className="flex flex-col min-w-0 py-0.5">
                                        <div className="text-xs font-bold text-slate-400 leading-none   truncate mb-1.5">
                                            {stat.label}
                                        </div>
                                        <div className="text-xl font-black text-slate-800 tabular-nums leading-none ">
                                            {stat.value}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* VARIANT 3: Strict Outline  */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">3</span>
                            Вариант 3: Очерк (Outline / Технический)
                        </h2>
                    </div>

                    <div className="bg-white rounded-[20px] border border-slate-200 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <Layers className="w-6 h-6 text-slate-900" strokeWidth={2.5} />
                            <h2 className="text-2xl font-black text-slate-900  ">Статистика</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                            {mockStats.map((stat, i) => (
                                <div key={i} className={cn(
                                    "flex flex-col p-4 rounded-2xl border border-slate-200/80 bg-transparent hover:bg-slate-50/50 transition-colors duration-200",
                                    // Use subtle left border accent
                                    "border-l-4", stat.borderColor
                                )}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-xs font-bold text-slate-500   truncate pr-2">
                                            {stat.label}
                                        </div>
                                        <stat.icon className={cn("w-4 h-4 opacity-70", stat.color)} />
                                    </div>
                                    <div className="text-2xl font-black text-slate-900 tabular-nums leading-none ">
                                        {stat.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
