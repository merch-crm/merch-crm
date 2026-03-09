"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, ArrowLeft, ArrowRight, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaginationVariantsPage() {
    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full w-10 h-10 hover:bg-slate-100"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-tight">Варианты Пагинации</h1>
                        <p className="text-sm text-slate-500 font-medium" suppressHydrationWarning>30 уникальных UI/UX концептов для таблиц и списков</p>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-10 space-y-12">

                {/* Variant 1 */}
                <VariantSection title="1. Классический (Default CRM)">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between w-full">
                        <div className="text-sm text-slate-500">
                            Показано <strong className="text-slate-900 font-semibold">1 - 12</strong> из <strong className="text-slate-900 font-semibold">17</strong> подкатегорий
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-400 cursor-not-allowed">
                                <ChevronLeft className="w-4 h-4" /> Пред
                            </button>
                            <div className="flex items-center gap-1">
                                <button className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold text-sm shadow-md">1</button>
                                <button className="w-8 h-8 rounded-full text-slate-600 font-medium text-sm hover:bg-slate-100 transition-colors">2</button>
                            </div>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-900 hover:text-primary transition-colors">
                                След <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 2 */}
                <VariantSection title="2. Карточка (Card Block) - Используется сейчас для подкатегорий">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between w-full">
                        <div className="text-sm text-slate-500">
                            Показано <strong className="text-slate-900 font-semibold">1 - 12</strong> из <strong className="text-slate-900 font-semibold">17</strong> подкатегорий
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-400 bg-slate-50 rounded-full cursor-not-allowed border border-transparent">
                                <ChevronLeft className="w-4 h-4" /> Пред
                            </button>
                            <div className="flex items-center gap-1">
                                <button className="w-10 h-10 rounded-full bg-slate-900 text-white font-semibold text-sm shadow-[0_4px_12px_rgba(15,23,42,0.15)] transform hover:scale-105 transition-all">1</button>
                                <button className="w-10 h-10 rounded-full text-slate-600 font-medium text-sm hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all">2</button>
                            </div>
                            <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-full hover:border-primary hover:text-primary shadow-sm hover:shadow-md transition-all active:scale-95">
                                След <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 3 */}
                <VariantSection title="3. Минималистичный (Minimalistic Pill)">
                    <div className="flex justify-center w-full">
                        <div className="bg-white p-1.5 rounded-full shadow-sm border border-slate-200 inline-flex items-center gap-1">
                            <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 cursor-not-allowed">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center px-2 gap-1 text-sm font-medium text-slate-600">
                                <button className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">1</button>
                                <button className="w-8 h-8 rounded-full hover:bg-slate-100 transition-colors">2</button>
                                <button className="w-8 h-8 rounded-full hover:bg-slate-100 transition-colors">3</button>
                                <div className="w-8 h-8 flex items-center justify-center text-slate-400"><MoreHorizontal className="w-4 h-4" /></div>
                                <button className="w-8 h-8 rounded-full hover:bg-slate-100 transition-colors">12</button>
                            </div>
                            <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 4 */}
                <VariantSection title="4. Строгий и компактный (Contained Blocks)">
                    <div className="flex justify-center w-full">
                        <div className="inline-flex rounded-lg border border-slate-200 shadow-sm overflow-hidden bg-white">
                            <button className="px-3 py-2 flex items-center text-slate-400 border-r border-slate-200 cursor-not-allowed bg-slate-50">
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                <span className="text-sm font-medium">Назад</span>
                            </button>
                            <button className="px-4 py-2 text-sm font-semibold border-r border-slate-200 bg-primary text-white">1</button>
                            <button className="px-4 py-2 text-sm font-medium border-r border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">2</button>
                            <button className="px-4 py-2 text-sm font-medium border-r border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">3</button>
                            <div className="px-3 py-2 flex items-center justify-center border-r border-slate-200 text-slate-400">
                                <MoreHorizontal className="w-4 h-4" />
                            </div>
                            <button className="px-4 py-2 text-sm font-medium border-r border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">10</button>
                            <button className="px-3 py-2 flex items-center text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                                <span className="text-sm font-medium">Далее</span>
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 5 */}
                <VariantSection title="5. Креативный с прогрессом (Progressive Segmented)">
                    <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-200 w-full max-w-xl mx-auto flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-sm font-semibold text-slate-900">Страница 2 из 8</span>
                            <span className="text-xs font-medium text-slate-500">20 из 78 записей</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 hover:text-slate-900 transition-colors shrink-0">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="flex-1 flex gap-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: '25%' }} />
                                <div className="h-full bg-transparent border-l border-white" style={{ width: '12.5%' }} />
                                <div className="h-full bg-transparent border-l border-white" style={{ width: '12.5%' }} />
                                <div className="h-full bg-transparent border-l border-white" style={{ width: '12.5%' }} />
                                <div className="h-full bg-transparent border-l border-white" style={{ width: '12.5%' }} />
                                <div className="h-full bg-transparent border-l border-white" style={{ width: '12.5%' }} />
                                <div className="h-full bg-transparent border-l border-white" style={{ width: '12.5%' }} />
                            </div>
                            <button className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-hover shadow-lg shadow-primary/30 transition-all active:scale-95 shrink-0">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 6 */}
                <VariantSection title="6. Современный Глассморфизм (Glassmorphism Float)">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-10 rounded-3xl w-full flex justify-center items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

                        <div className="bg-white/60 backdrop-blur-xl border border-white p-2 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex items-center gap-1 relative z-10">
                            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-400 rounded-xl">
                                <ArrowLeft className="w-4 h-4" /> Назад
                            </button>
                            <div className="w-px h-6 bg-slate-200/50 mx-2" />
                            <div className="flex gap-1">
                                <button className="w-10 h-10 rounded-xl bg-white text-primary font-bold shadow-sm border border-slate-100">1</button>
                                <button className="w-10 h-10 rounded-xl text-slate-600 font-medium hover:bg-white/80 transition-all">2</button>
                                <button className="w-10 h-10 rounded-xl text-slate-600 font-medium hover:bg-white/80 transition-all">3</button>
                            </div>
                            <div className="w-px h-6 bg-slate-200/50 mx-2" />
                            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-800 hover:text-primary hover:bg-white rounded-xl transition-all">
                                Далее <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 7 */}
                <VariantSection title="7. Плиточная навигация (Tiles Layout)">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 w-full">
                        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-8">
                            <button className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center cursor-not-allowed">
                                <ChevronLeft className="w-6 h-6" />
                            </button>

                            <div className="flex items-center justify-center flex-wrap gap-2">
                                <button className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-[0_8px_16px_rgba(79,70,229,0.25)] flex items-center justify-center">1</button>
                                <button className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 font-medium text-lg hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center">2</button>
                                <button className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 font-medium text-lg hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center">3</button>
                                <button className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 font-medium text-lg hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center">4</button>
                                <div className="w-12 h-12 flex items-center justify-center text-slate-400"><MoreHorizontal className="w-6 h-6" /></div>
                                <button className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 font-medium text-lg hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center">12</button>
                            </div>

                            <button className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center shadow-lg active:scale-95">
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 8 */}
                <VariantSection title="8. Простая строка (Simple Inline)">
                    <div className="w-full flex items-center justify-between px-2 py-4 border-t border-slate-200 text-sm">
                        <span className="text-slate-500">Показываются результаты с 1 по 10 (всего 45)</span>
                        <div className="flex items-center gap-6">
                            <button className="font-semibold text-slate-400 cursor-not-allowed uppercase tracking-wider text-xs">Пред</button>
                            <div className="flex items-center gap-4 text-slate-600 font-medium">
                                <button className="text-primary font-bold border-b-2 border-primary pb-0.5">1</button>
                                <button className="hover:text-slate-900 pb-0.5 border-b-2 border-transparent hover:border-slate-300 transition-all">2</button>
                                <button className="hover:text-slate-900 pb-0.5 border-b-2 border-transparent hover:border-slate-300 transition-all">3</button>
                                <span className="text-slate-400">...</span>
                                <button className="hover:text-slate-900 pb-0.5 border-b-2 border-transparent hover:border-slate-300 transition-all">5</button>
                            </div>
                            <button className="font-semibold text-slate-900 hover:text-primary transition-colors uppercase tracking-wider text-xs">След</button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 9 */}
                <VariantSection title="9. Мобильный дружелюбный (Mobile First Large Tap Areas)">
                    <div className="bg-white rounded-3xl border border-slate-200 p-2 shadow-sm max-w-sm mx-auto w-full">
                        <div className="flex items-center justify-between">
                            <button className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div className="flex flex-col items-center">
                                <span className="text-slate-900 font-bold text-lg">Страница 1</span>
                                <span className="text-slate-400 font-medium text-xs uppercase tracking-wide">из 12</span>
                            </div>
                            <button className="w-14 h-14 flex items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 active:scale-95 transition-all">
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 10 */}
                <VariantSection title="10. Плавающая панель с выбором кол-ва (Floating Bar + Select)">
                    <div className="w-full h-32 bg-slate-200/50 rounded-2xl border border-slate-200 border-dashed relative flex items-end justify-center pb-6">
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">Зона контента</span>

                        <div className="bg-slate-900 text-white p-2 rounded-2xl shadow-2xl flex items-center gap-4 relative z-10 w-max max-w-[90%]">
                            <div className="pl-4 pr-2 flex items-center gap-2 border-r border-slate-700 h-8">
                                <span className="text-xs font-medium text-slate-400">Показывать по:</span>
                                <select className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer appearance-none pr-4 relative">
                                    <option value="10" className="text-slate-900">10</option>
                                    <option value="20" className="text-slate-900">20</option>
                                    <option value="50" className="text-slate-900">50</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-1 pr-2">
                                <button className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-800 transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="px-2 text-sm font-bold">
                                    1 <span className="text-slate-500 font-medium mx-1">/</span> 5
                                </div>
                                <button className="w-8 h-8 rounded-xl flex items-center justify-center text-white hover:bg-slate-800 transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 11 */}
                <VariantSection title="11. Техно / Неоморфизм (Dark Neumorphism)">
                    <div className="bg-slate-900 p-8 rounded-[32px] w-full flex justify-center border border-slate-800 shadow-[inset_0_0_80px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-2xl backdrop-blur-md border border-slate-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                            <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-[inset_1px_1px_2px_rgba(255,255,255,0.1),_0_4px_12px_rgba(0,0,0,0.5)]">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-2 px-2">
                                <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary text-white font-bold text-lg shadow-[0_0_20px_rgba(var(--primary-rgb),0.4),_inset_1px_1px_2px_rgba(255,255,255,0.2)]">1</button>
                                <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 font-medium text-lg hover:text-white hover:bg-slate-700 transition-all shadow-[inset_1px_1px_2px_rgba(255,255,255,0.1),_0_4px_12px_rgba(0,0,0,0.5)]">2</button>
                                <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 font-medium text-lg hover:text-white hover:bg-slate-700 transition-all shadow-[inset_1px_1px_2px_rgba(255,255,255,0.1),_0_4px_12px_rgba(0,0,0,0.5)]">3</button>
                                <span className="text-slate-500 font-bold tracking-widest px-1">...</span>
                                <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 font-medium text-lg hover:text-white hover:bg-slate-700 transition-all shadow-[inset_1px_1px_2px_rgba(255,255,255,0.1),_0_4px_12px_rgba(0,0,0,0.5)]">8</button>
                            </div>
                            <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-[inset_1px_1px_2px_rgba(255,255,255,0.1),_0_4px_12px_rgba(0,0,0,0.5)]">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 12 */}
                <VariantSection title="12. Линейный индикатор (Line Indicator)">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 w-full flex flex-col items-center gap-6">
                        <div className="flex items-center gap-12 w-full max-w-lg justify-between">
                            <button className="text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2 font-medium">
                                <ArrowLeft className="w-4 h-4" /> Пред
                            </button>
                            <div className="flex-1 flex justify-between relative px-4">
                                {/* Base line */}
                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
                                {/* Active progress line */}
                                <div className="absolute top-1/2 left-0 w-1/3 h-0.5 bg-primary -translate-y-1/2 z-0" />

                                <button className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold z-10 shadow-md ring-4 ring-white">1</button>
                                <button className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center text-sm font-bold z-10 hover:border-slate-400 hover:text-slate-600 transition-colors">2</button>
                                <button className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center text-sm font-bold z-10 hover:border-slate-400 hover:text-slate-600 transition-colors">3</button>
                                <button className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center text-sm font-bold z-10 hover:border-slate-400 hover:text-slate-600 transition-colors">4</button>
                            </div>
                            <button className="text-slate-900 hover:text-primary transition-colors flex items-center gap-2 font-bold">
                                След <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 13 */}
                <VariantSection title="13. Крупные цифры с подчеркиванием (Big Numbers Underlined)">
                    <div className="w-full flex justify-center py-4">
                        <div className="flex items-end gap-2 sm:gap-6">
                            <button className="p-2 text-slate-300 cursor-not-allowed mb-2">
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                            <button className="text-4xl font-black text-slate-900 border-b-4 border-primary pb-2 px-2 hover:border-primary transition-all">1</button>
                            <button className="text-3xl font-bold text-slate-300 border-b-4 border-transparent hover:text-slate-600 hover:border-slate-300 pb-2 px-2 transition-all">2</button>
                            <button className="text-3xl font-bold text-slate-300 border-b-4 border-transparent hover:text-slate-600 hover:border-slate-300 pb-2 px-2 transition-all">3</button>
                            <button className="text-3xl font-bold text-slate-300 border-b-4 border-transparent hover:text-slate-600 hover:border-slate-300 pb-2 px-2 transition-all">4</button>
                            <button className="p-2 text-slate-900 hover:text-primary transition-colors mb-2">
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 14 */}
                <VariantSection title="14. Скрывающийся скролл (Scrollable Pill)">
                    <div className="bg-white p-2 rounded-full border border-slate-200 shadow-sm w-full max-w-sm mx-auto flex items-center justify-between">
                        <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 bg-slate-50 cursor-not-allowed shrink-0">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex-1 overflow-x-auto no-scrollbar px-2 flex items-center gap-2 max-w-[200px]" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
                            <div className="flex items-center justify-start min-w-max px-4">
                                <button className="px-3 py-1.5 rounded-full bg-slate-900 text-white font-bold text-sm shadow-md">1</button>
                                <button className="px-3 py-1.5 rounded-full text-slate-500 font-medium text-sm hover:bg-slate-100 transition-colors">2</button>
                                <button className="px-3 py-1.5 rounded-full text-slate-500 font-medium text-sm hover:bg-slate-100 transition-colors">3</button>
                                <button className="px-3 py-1.5 rounded-full text-slate-500 font-medium text-sm hover:bg-slate-100 transition-colors">4</button>
                                <button className="px-3 py-1.5 rounded-full text-slate-500 font-medium text-sm hover:bg-slate-100 transition-colors">5</button>
                                <button className="px-3 py-1.5 rounded-full text-slate-500 font-medium text-sm hover:bg-slate-100 transition-colors">6</button>
                                <button className="px-3 py-1.5 rounded-full text-slate-500 font-medium text-sm hover:bg-slate-100 transition-colors">7</button>
                            </div>
                        </div>
                        <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </VariantSection>

                {/* Variant 15 */}
                <VariantSection title="15. Прямоугольный с иконками (Squared Outline)">
                    <div className="flex justify-center w-full">
                        <div className="flex items-center gap-2">
                            <button className="w-10 h-10 border-2 border-slate-200 rounded-lg flex items-center justify-center text-slate-400 cursor-not-allowed">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 border-2 border-primary bg-primary/10 rounded-lg flex items-center justify-center font-bold text-primary">1</button>
                            <button className="w-10 h-10 border-2 border-slate-200 rounded-lg flex items-center justify-center font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors">2</button>
                            <button className="w-10 h-10 border-2 border-slate-200 rounded-lg flex items-center justify-center font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors">3</button>
                            <button className="w-10 h-10 border-2 border-slate-200 rounded-lg flex items-center justify-center font-medium text-slate-400 border-dashed">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                            <button className="w-10 h-10 border-2 border-slate-200 rounded-lg flex items-center justify-center font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors">8</button>
                            <button className="w-10 h-10 border-2 border-slate-200 rounded-lg flex items-center justify-center text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 16 */}
                <VariantSection title="16. Вертикальный стек (Vertical Sidebar Pagination)">
                    <div className="bg-white border border-slate-200 rounded-2xl w-24 mx-auto p-4 flex flex-col items-center gap-4 shadow-sm">
                        <button className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-colors">
                            <ChevronLeft className="w-5 h-5 rotate-90" />
                        </button>

                        <div className="flex flex-col items-center gap-2">
                            <button className="w-12 h-12 rounded-xl bg-primary text-white font-bold shadow-md shadow-primary/20">1</button>
                            <button className="w-12 h-12 rounded-xl text-slate-500 font-medium hover:bg-slate-100 hover:text-slate-900 transition-colors">2</button>
                            <button className="w-12 h-12 rounded-xl text-slate-500 font-medium hover:bg-slate-100 hover:text-slate-900 transition-colors">3</button>
                            <div className="w-12 h-6 flex items-center justify-center text-slate-300"><MoreHorizontal className="w-4 h-4 rotate-90" /></div>
                            <button className="w-12 h-12 rounded-xl text-slate-500 font-medium hover:bg-slate-100 hover:text-slate-900 transition-colors">12</button>
                        </div>

                        <button className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 shadow-md transition-colors active:scale-95">
                            <ChevronRight className="w-5 h-5 rotate-90" />
                        </button>
                    </div>
                </VariantSection>

                {/* Variant 17 */}
                <VariantSection title="17. Переключатель вкладок (Segmented Control Mode)">
                    <div className="w-full max-w-lg mx-auto bg-slate-100 p-1.5 rounded-2xl flex items-center shadow-inner">
                        <button className="flex-1 py-3 text-sm font-bold bg-white text-slate-900 rounded-xl shadow-sm border border-slate-200/50">1</button>
                        <button className="flex-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all">2</button>
                        <button className="flex-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all">3</button>
                        <button className="flex-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all">4</button>
                        <div className="flex-[0.5] py-3 text-sm font-bold text-slate-400 flex justify-center"><MoreHorizontal className="w-5 h-5" /></div>
                        <button className="flex-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all">10</button>
                    </div>
                </VariantSection>

                {/* Variant 18 */}
                <VariantSection title="18. Эко/Био стиль (Soft Organic Colors)">
                    <div className="bg-[#f2f7f4] p-6 rounded-[32px] w-full border border-[#e2ece5] flex items-center justify-center">
                        <div className="flex items-center gap-3 bg-white p-3 rounded-full shadow-sm">
                            <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#9dbcb0] cursor-not-allowed">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <button className="w-12 h-12 rounded-full bg-[#3b8064] text-white font-bold text-lg shadow-[0_4px_16px_rgba(59,128,100,0.3)]">1</button>
                            <button className="w-12 h-12 rounded-full bg-[#eef5f1] text-[#3b8064] font-medium text-lg hover:bg-[#dfece5] transition-colors">2</button>
                            <button className="w-12 h-12 rounded-full bg-[#eef5f1] text-[#3b8064] font-medium text-lg hover:bg-[#dfece5] transition-colors">3</button>
                            <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#3b8064] hover:bg-[#eef5f1] transition-colors">
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 19 */}
                <VariantSection title="19. Индикатор с кнопками загрузки (Load More Style)">
                    <div className="w-full flex flex-col items-center gap-6 py-4">
                        <div className="text-sm font-medium text-slate-500">
                            Вы посмотрели 12 из 145 элементов
                        </div>
                        <div className="w-full max-w-sm h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-900 rounded-full" style={{ width: '8.2%' }} />
                        </div>
                        <div className="flex gap-4">
                            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-900 font-bold rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center gap-2">
                                <RefreshCcw className="w-4 h-4" /> Загрузить еще
                            </button>
                            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1">
                                <button className="px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="w-px h-4 bg-slate-200" />
                                <button className="px-4 py-2 text-sm font-bold text-slate-800 hover:text-primary transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 20 */}
                <VariantSection title="20. Скрытый номер (Revealing Hover Mode)">
                    <div className="flex justify-center w-full group py-4">
                        <div className="flex items-center gap-1.5">
                            <button className="w-14 h-14 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-900 shadow-sm hover:border-primary hover:text-primary transition-all">
                                <ArrowLeft className="w-6 h-6" />
                            </button>

                            <div className="w-0 overflow-hidden group-hover:w-[320px] transition-all duration-500 ease-out flex items-center px-1">
                                <div className="flex w-max gap-1.5 py-2">
                                    <button className="w-12 h-12 bg-primary text-white font-bold rounded-xl shadow-md">1</button>
                                    <button className="w-12 h-12 bg-white text-slate-600 font-medium rounded-xl border border-slate-200 hover:border-slate-400 transition-colors">2</button>
                                    <button className="w-12 h-12 bg-white text-slate-600 font-medium rounded-xl border border-slate-200 hover:border-slate-400 transition-colors">3</button>
                                    <button className="w-12 h-12 bg-white text-slate-600 font-medium rounded-xl border border-slate-200 hover:border-slate-400 transition-colors">4</button>
                                    <div className="w-10 h-12 flex items-center justify-center text-slate-400"><MoreHorizontal className="w-5 h-5" /></div>
                                    <button className="w-12 h-12 bg-white text-slate-600 font-medium rounded-xl border border-slate-200 hover:border-slate-400 transition-colors">15</button>
                                </div>
                            </div>

                            <button className="w-14 h-14 border border-slate-200 rounded-2xl flex items-center justify-center text-white bg-slate-900 shadow-md hover:bg-slate-800 hover:scale-105 transition-all">
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 21 */}
                <VariantSection title="21. Киберпанк (Cyberpunk Terminal)">
                    <div className="bg-[#0a0a0c] p-10 rounded-xl w-full flex justify-center border border-[#0f1f1a]">
                        <div className="flex items-center gap-1 font-mono text-[#00ff88] select-none">
                            <button className="px-3 py-1 border border-[#00ff88]/30 hover:bg-[#00ff88]/10 hover:border-[#00ff88] transition-all relative group overflow-hidden">
                                <span className="relative z-10">&lt; SYS.PREV</span>
                                <div className="absolute inset-0 bg-[#00ff88]/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                            </button>
                            <span className="text-[#00ff88]/50 px-2">||</span>
                            <button className="px-4 py-1 bg-[#00ff88] text-[#0a0a0c] font-bold shadow-[0_0_15px_rgba(0,255,136,0.6)]">01</button>
                            <button className="px-4 py-1 border border-transparent hover:border-[#00ff88]/50 transition-colors">02</button>
                            <button className="px-4 py-1 border border-transparent hover:border-[#00ff88]/50 transition-colors">03</button>
                            <button className="px-4 py-1 border border-transparent hover:border-[#00ff88]/50 transition-colors">04</button>
                            <span className="text-[#00ff88]/50 px-2">||</span>
                            <button className="px-3 py-1 border border-[#00ff88]/30 hover:bg-[#00ff88]/10 hover:border-[#00ff88] transition-all relative group overflow-hidden">
                                <span className="relative z-10">SYS.NEXT &gt;</span>
                                <div className="absolute inset-0 bg-[#00ff88]/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 22 */}
                <VariantSection title="22. Ретро Windows 95 (Retro UI)">
                    <div className="bg-[#c0c0c0] p-8 rounded-sm w-full flex justify-center border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black/80 font-[ms-sans-serif,Arial]">
                        <div className="flex items-center gap-1">
                            <button className="px-4 py-1.5 bg-[#c0c0c0] text-black border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#808080] active:border-t-2 active:border-l-2 active:border-[#808080] active:border-b-2 active:border-r-2 active:border-white shadow-[inset_-1px_-1px_#0a0a0a] active:shadow-[inset_1px_1px_#0a0a0a] disabled:text-[#808080] disabled:active:border-t-2 disabled:active:border-l-2 disabled:active:border-white disabled:active:border-b-2 disabled:active:border-r-2 disabled:active:border-[#808080] disabled:active:shadow-[inset_-1px_-1px_#0a0a0a]" disabled>
                                &lt;&lt; Назад
                            </button>

                            <div className="flex bg-white border-t-2 border-l-2 border-[#808080] border-b-2 border-r-2 border-white mx-2 p-1 gap-1">
                                <button className="w-8 h-8 flex items-center justify-center bg-[#000080] text-white cursor-default">1</button>
                                <button className="w-8 h-8 flex items-center justify-center hover:bg-[#000080] hover:text-white cursor-default">2</button>
                                <button className="w-8 h-8 flex items-center justify-center hover:bg-[#000080] hover:text-white cursor-default">3</button>
                                <button className="w-8 h-8 flex items-center justify-center hover:bg-[#000080] hover:text-white cursor-default">4</button>
                            </div>

                            <button className="px-4 py-1.5 bg-[#c0c0c0] text-black border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#808080] active:border-t-2 active:border-l-2 active:border-[#808080] active:border-b-2 active:border-r-2 active:border-white shadow-[inset_-1px_-1px_#0a0a0a] active:shadow-[inset_1px_1px_#0a0a0a]">
                                Вперед &gt;&gt;
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 23 */}
                <VariantSection title="23. Слайдер навигации (Slider Range)">
                    <div className="bg-white p-10 rounded-3xl w-full border border-slate-200">
                        <div className="max-w-md mx-auto relative flex flex-col gap-6">
                            <div className="flex items-center justify-between text-slate-500 font-medium font-mono text-sm">
                                <span>Str. 1</span>
                                <span className="text-slate-900 font-bold bg-slate-100 px-3 py-1 rounded-full text-base">4</span>
                                <span>Str. 12</span>
                            </div>

                            <div className="relative h-3 bg-slate-100 rounded-full w-full">
                                <div className="absolute top-0 left-0 h-full bg-primary rounded-full" style={{ width: '33%' }} />
                                <div className="absolute top-1/2 left-[33%] -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-white border-4 border-primary rounded-full shadow-lg cursor-grab hover:scale-110 transition-transform" />
                            </div>

                            <div className="flex justify-between w-full mt-2">
                                <button className="text-slate-500 hover:text-slate-900 font-medium text-sm flex items-center gap-1 group">
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Предыдущая
                                </button>
                                <button className="text-slate-900 font-bold text-sm flex items-center gap-1 group hover:text-primary">
                                    Следующая <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 24 */}
                <VariantSection title="24. Пузырьки (Bubble Layout)">
                    <div className="w-full flex justify-center py-6">
                        <div className="flex items-end gap-2 px-6 py-4 bg-slate-900/5 rounded-[40px] shadow-inner backdrop-blur-sm border border-slate-200/50">
                            <button className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95 shadow-sm mb-1">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-indigo-500 text-white font-bold text-lg shadow-[0_8px_20px_rgba(79,70,229,0.4)] flex items-center justify-center">1</button>
                            <button className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 font-medium flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95 shadow-sm shrink-0 mb-1 hover:-translate-y-1">2</button>
                            <button className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 font-medium flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95 shadow-sm shrink-0 mb-1 hover:-translate-y-1">3</button>
                            <button className="w-8 h-8 rounded-full bg-transparent text-slate-400 font-medium flex items-center justify-center mb-2">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 font-medium flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95 shadow-sm shrink-0 mb-1 hover:-translate-y-1">9</button>
                            <button className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 hover:text-primary transition-all active:scale-95 shadow-sm mb-1">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 25 */}
                <VariantSection title="25. Журнальный индекс (Magazine Serif Options)">
                    <div className="bg-[#fcfbf9] w-full p-10 border-t-4 border-b-4 border-[#222]">
                        <div className="flex justify-between items-center max-w-2xl mx-auto">
                            <button className="text-[#222] font-serif tracking-widest uppercase text-xs sm:text-sm font-bold opacity-30 cursor-not-allowed">
                                Предыдущая
                            </button>
                            <div className="flex gap-4 sm:gap-8 font-serif italic text-lg sm:text-2xl text-[#666]">
                                <button className="text-[#222] font-semibold border-b border-[#222]">I.</button>
                                <button className="hover:text-[#222] transition-colors">II.</button>
                                <button className="hover:text-[#222] transition-colors">III.</button>
                                <button className="hover:text-[#222] transition-colors">IV.</button>
                            </div>
                            <button className="text-[#222] font-serif tracking-widest uppercase text-xs sm:text-sm font-bold hover:text-primary transition-colors">
                                Следующая
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 26 */}
                <VariantSection title="26. Боковой FAB (Floating Action Toolbar)">
                    <div className="w-full h-40 bg-slate-100 rounded-3xl border border-slate-200 border-dashed flex items-center justify-end pr-8 relative overflow-hidden">
                        <span className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Контент страницы</span>

                        <div className="bg-white rounded-full p-2 shadow-2xl border border-slate-100 flex flex-col items-center gap-2">
                            <button className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors">
                                <ChevronLeft className="w-4 h-4 rotate-90" />
                            </button>
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold shadow-md">1</div>
                            <div className="w-10 h-10 hover:bg-slate-50 rounded-full flex items-center justify-center text-slate-600 font-medium cursor-pointer transition-colors">2</div>
                            <button className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow-md">
                                <ChevronRight className="w-4 h-4 rotate-90" />
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 27 */}
                <VariantSection title="27. Материальный дизайн 3 (Material You)">
                    <div className="bg-[#f0ebf8] p-6 rounded-[32px] w-full flex justify-center border border-[#e8dff4]">
                        <div className="flex items-center gap-2">
                            <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#4a4458] hover:bg-[#e8dff4] transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-[#e8dff4] hover:bg-[#dfd4ec] text-[#1d192b] font-medium transition-colors">1</button>
                            <button className="w-12 h-12 rounded-full bg-[#6750a4] text-white font-medium shadow-sm flex items-center justify-center transition-colors">2</button>
                            <button className="w-10 h-10 rounded-full bg-[#e8dff4] hover:bg-[#dfd4ec] text-[#1d192b] font-medium transition-colors">3</button>
                            <button className="w-10 h-10 rounded-full bg-[#e8dff4] hover:bg-[#dfd4ec] text-[#1d192b] font-medium transition-colors">4</button>
                            <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#4a4458] hover:bg-[#e8dff4] transition-colors">
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 28 */}
                <VariantSection title="28. Тонкие линии (Hairline Elegance)">
                    <div className="w-full flex flex-col items-center p-8 bg-white border border-slate-100 rounded-lg">
                        <div className="flex w-full max-w-md border-t border-slate-200">
                            <button className="flex-1 py-4 flex flex-col items-start gap-1 group hover:border-[#111] border-t border-transparent -mt-px transition-colors">
                                <span className="text-xs font-bold uppercase tracking-widest text-[#999] group-hover:text-[#111] transition-colors">Previous</span>
                                <span className="text-sm font-serif text-[#111]">Introduction</span>
                            </button>

                            <div className="px-4 py-4 flex items-center gap-4 text-sm font-serif">
                                <button className="text-[#999] hover:text-[#111] transition-colors">1</button>
                                <button className="text-[#111] font-bold border-b border-[#111]">2</button>
                                <button className="text-[#999] hover:text-[#111] transition-colors">3</button>
                            </div>

                            <button className="flex-1 py-4 flex flex-col items-end gap-1 group hover:border-[#111] border-t border-transparent -mt-px transition-colors text-right">
                                <span className="text-xs font-bold uppercase tracking-widest text-[#999] group-hover:text-[#111] transition-colors">Next</span>
                                <span className="text-sm font-serif text-[#111]">Key Features</span>
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 29 */}
                <VariantSection title="29. Экстремальный контраст (Brutalism)">
                    <div className="w-full bg-[#eef556] p-8 border-4 border-black shadow-[8px_8px_0_0_#000]">
                        <div className="flex gap-4 justify-between w-full font-mono font-bold text-xl uppercase">
                            <button className="border-4 border-black bg-white px-6 py-3 hover:bg-black hover:text-white transition-colors">
                                PRV
                            </button>

                            <div className="flex gap-2">
                                <button className="border-4 border-black px-4 py-3 bg-black text-[#eef556]">01</button>
                                <button className="border-4 border-black px-4 py-3 bg-white hover:bg-[#ff88eb] transition-colors">02</button>
                                <button className="border-4 border-black px-4 py-3 bg-white hover:bg-[#88ffff] transition-colors">03</button>
                                <button className="border-4 border-transparent px-4 py-3 bg-transparent">...</button>
                                <button className="border-4 border-black px-4 py-3 bg-white hover:bg-white transition-colors">09</button>
                            </div>

                            <button className="border-4 border-black bg-white px-6 py-3 hover:bg-black hover:text-[#eef556] transition-colors shadow-[4px_4px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none">
                                NXT
                            </button>
                        </div>
                    </div>
                </VariantSection>

                {/* Variant 30 */}
                <VariantSection title="30. Гимн клавиатуре (Keyboard Shortcuts UI)">
                    <div className="w-full flex justify-center py-8">
                        <div className="flex gap-4 items-center font-mono">
                            <div className="flex items-center gap-2">
                                <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 border-b-2 rounded text-xs font-bold text-slate-500 shadow-sm">⌘</kbd>
                                <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 border-b-2 rounded text-xs font-bold text-slate-500 shadow-sm">←</kbd>
                            </div>

                            <div className="h-6 w-px bg-slate-200 mx-2" />

                            <div className="flex items-center gap-2">
                                <button className="w-10 h-10 border border-slate-300 bg-white rounded-lg flex items-center justify-center font-bold text-slate-900 shadow-[0_2px_0_0_#cbd5e1] active:translate-y-[2px] active:shadow-none transition-all">1</button>
                                <button className="w-10 h-10 border border-slate-300 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400 shadow-[0_2px_0_0_#cbd5e1] active:translate-y-[2px] active:shadow-none transition-all hover:bg-white hover:text-slate-600">2</button>
                                <button className="w-10 h-10 border border-slate-300 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400 shadow-[0_2px_0_0_#cbd5e1] active:translate-y-[2px] active:shadow-none transition-all hover:bg-white hover:text-slate-600">3</button>
                            </div>

                            <div className="h-6 w-px bg-slate-200 mx-2" />

                            <div className="flex items-center gap-2">
                                <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 border-b-2 rounded text-xs font-bold text-slate-500 shadow-sm">⌘</kbd>
                                <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 border-b-2 rounded text-xs font-bold text-white shadow-sm">→</kbd>
                            </div>
                        </div>
                    </div>
                </VariantSection>

            </main>
        </div>
    );
}

function VariantSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-700 pl-2">{title}</h2>
            <div className="bg-slate-50 p-6 sm:p-10 rounded-[32px] border border-slate-200 flex items-center justify-center overflow-x-auto">
                {children}
            </div>
        </div>
    );
}
