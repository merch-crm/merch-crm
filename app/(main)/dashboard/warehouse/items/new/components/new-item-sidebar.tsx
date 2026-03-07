"use client";

import { ArrowLeft, Check, Loader2, RotateCcw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Step {
    id: number;
    title: string;
    desc: string;
}

interface NewItemSidebarProps {
    step: number;
    maxStep: number;
    steps: Step[];
    isSaving: boolean;
    hasSubCategories: boolean;
    handleBack: () => void;
    handleReset: () => void;
    onStepClick: (stepId: number) => void;
}

export function NewItemSidebar({
    step,
    maxStep,
    steps,
    isSaving,
    hasSubCategories,
    handleBack,
    handleReset,
    onStepClick
}: NewItemSidebarProps) {
    return (
        <>
            {/* Tablet/Mobile Horizontal Step View - Ultra Compact */}
            {/* Tablet/Mobile Horizontal Step View - Tall Card */}
            <div className="xl:hidden crm-card !rounded-[24px] px-5 py-6 min-h-[80px] mb-5 flex items-center justify-between gap-3 sticky top-4 z-50 shadow-md">
                <div className="flex items-center gap-3 min-w-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        aria-label="Вернуться назад"
                        className="w-8 h-8 shrink-0 rounded-[10px] text-slate-400 hover:text-slate-900 transition-colors active:scale-95 hover:bg-slate-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>

                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-400 tracking-wider mb-0.5 leading-none">
                            Шаг {steps.findIndex(s => s.id === step) !== -1 ? steps.findIndex(s => s.id === step) + 1 : 1} из {steps.filter(s => !(s.id === 1 && !hasSubCategories)).length}
                        </span>
                        <span className="text-sm font-bold text-slate-900 truncate leading-none">
                            {steps.find(s => s.id === step)?.title || "Создание"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleReset}
                        className="w-8 h-8 rounded-[10px] text-slate-400 hover:text-slate-900 transition-colors active:scale-95 hover:bg-slate-200"
                        title="Начать зановo"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-400 leading-none mb-0.5">Черновик</span>
                        <span className="text-xs font-bold text-slate-900 leading-none whitespace-nowrap">
                            {isSaving ? "Сохранение..." : "Сохранено"}
                        </span>
                    </div>
                    <div className="w-4 h-8 flex items-center justify-end">
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        ) : (
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-crm-blink shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop Full View */}
            <aside className={cn("hidden xl:flex flex-col shrink-0 z-40 transition-all duration-300 text-medium", "crm-card !rounded-3xl shadow-sm p-8", "w-[360px] h-full"
            )}>
                <div className="pb-6 shrink-0">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold mb-4 transition-all group text-sm h-auto p-0 hover:bg-transparent justify-start"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Назад
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                            <Plus className="w-6 h-6 text-white" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 leading-tight">
                                Новая позиция
                            </h1>
                            <p className="text-xs font-bold text-slate-700 opacity-60">
                                Создание карточки товара
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto overflow-x-visible pb-10 -mx-4 px-4 pt-2 custom-scrollbar">
                    {steps.map((s, idx) => {
                        const isActive = step === s.id;
                        const isCompleted = maxStep > s.id || step > s.id;
                        const isLocked = maxStep < s.id && step < s.id; // Cannot click future steps directly unless current is valid

                        if (s.id === 1 && !hasSubCategories && step !== 1) return null;

                        return (
                            <Button
                                key={idx}
                                variant="ghost"
                                onClick={() => !isLocked && onStepClick(s.id)}
                                disabled={isLocked}
                                className={cn("relative w-full text-left py-4 pl-4 pr-4 rounded-2xl h-auto flex items-center justify-start gap-3 group overflow-hidden outline-none focus:outline-none focus:ring-0 focus-visible:ring-0",
                                    isActive ? "bg-black text-white !shadow-[0_14px_28px_-6px_rgba(0,0,0,0.4),0_4px_12px_-2px_rgba(0,0,0,0.2)] border border-black hover:bg-black" : "text-slate-400 border border-transparent shadow-none hover:bg-transparent",
                                    isLocked && "opacity-40 cursor-not-allowed"
                                )}
                            >
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300",
                                    isActive ? "bg-white/15 border-white/20 text-white" : isCompleted ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-slate-50/50 border-slate-100 text-slate-400"
                                )}>
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <span className="text-base font-bold">{idx + 1}</span>
                                    )}
                                </div>
                                <div className="min-w-0 relative z-10">
                                    <div className={cn("text-sm font-bold leading-none mb-1.5 transition-colors",
                                        isActive ? "text-white" : isCompleted ? "text-[#3e3e3e]" : "text-slate-400"
                                    )}>
                                        {s.title}
                                    </div>
                                    <div className={cn("text-[11px] font-bold truncate transition-colors",
                                        isActive ? "text-white/70" : isCompleted ? "text-slate-500" : "text-slate-400/60"
                                    )}>
                                        {s.desc}
                                    </div>
                                </div>

                                {isActive && (
                                    <>
                                        {/* Seamless Radial Glow confined to button array */}
                                        <div
                                            className="absolute inset-0 pointer-events-none rounded-2xl animate-pulse"
                                            style={{
                                                background: "radial-gradient(circle 120px at 85% 50%, rgba(16, 185, 129, 0.4), transparent)"
                                            }}
                                        />
                                        {/* Physical Dot */}
                                        <div className="absolute right-10 top-1/2 -translate-y-1/2 z-20 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] pointer-events-none" />
                                    </>
                                )}
                            </Button>
                        );
                    })}
                </div>

                <div className="h-[88px] shrink-0 border-t border-slate-200 bg-white z-30 flex items-center -mx-[var(--radius-padding)] -mb-[var(--radius-padding)] px-[var(--radius-padding)] rounded-b-3xl">
                    <div className="flex items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-[var(--radius)] bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                {isSaving ? (
                                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-crm-blink shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                )}
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 mb-0.5">Черновик</div>
                                <div className="text-xs font-bold text-slate-900 whitespace-nowrap">
                                    {isSaving ? "Сохранение..." : "Сохранено"}
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            onClick={handleReset}
                            className="flex items-center gap-1.5 px-3 py-2 h-auto rounded-2xl hover:bg-slate-50 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all text-xs font-bold text-slate-400 hover:text-slate-900 group"
                        >
                            <RotateCcw className="w-3 h-3 group-hover:rotate-[-90deg] transition-transform duration-300" />
                            Начать заново
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    );
}
