"use client";

import { ArrowLeft, Check, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Step {
    id: number;
    title: string;
    desc: string;
}

interface NewItemSidebarProps {
    step: number;
    steps: Step[];
    isSaving: boolean;
    hasSubCategories: boolean;
    handleBack: () => void;
    handleReset: () => void;
    onStepClick: (stepId: number) => void;
}

export function NewItemSidebar({
    step,
    steps,
    isSaving,
    hasSubCategories,
    handleBack,
    handleReset,
    onStepClick
}: NewItemSidebarProps) {
    return (
        <aside className={cn(
            "crm-card !rounded-3xl flex flex-col shrink-0 z-40 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden text-medium",
            "w-full xl:w-[320px] h-auto xl:h-full sticky xl:static top-0"
        )}>
            {/* Tablet/Mobile Horizontal Step View */}
            <div className="xl:hidden flex items-center gap-3 p-3 border-b border-slate-100">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    aria-label="Вернуться назад"
                    className="w-10 h-10 shrink-0 rounded-[14px] bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors active:scale-95 hover:bg-slate-100"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>

                <div className="flex-1 py-1">
                    <div className="flex items-center justify-between gap-1 w-full">
                        {steps.map((s, idx) => {
                            const isActive = step === s.id;
                            const isCompleted = step > s.id;

                            if (s.id === 1 && !hasSubCategories && step !== 1) return null;

                            return (
                                <Button
                                    key={idx}
                                    variant={isActive ? "default" : "ghost"}
                                    onClick={() => onStepClick(s.id)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 px-1 py-2 rounded-[12px] h-auto transition-all",
                                        isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                    )}
                                >
                                    <div className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                        isActive ? "bg-white text-slate-900 shadow-sm" : isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-white border border-slate-200"
                                    )}>
                                        {isCompleted ? <Check className="w-3 h-3" strokeWidth={3} /> : idx + 1}
                                    </div>
                                    <span className={cn(
                                        "text-[11px] font-bold whitespace-nowrap hidden sm:inline-block",
                                        isActive ? "text-white" : "text-slate-700"
                                    )}>
                                        {s.title}
                                    </span>
                                </Button>
                            );
                        })}
                    </div>
                </div>

                <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                    {isSaving ? (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-crm-blink shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    )}
                </div>
            </div>

            {/* Desktop Full View */}
            <div className="hidden xl:flex flex-col h-full">
                <div className="p-6 shrink-0">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold mb-4 transition-all group text-sm h-auto p-0 hover:bg-transparent justify-start"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Назад
                    </Button>

                    <h1 className="text-xl font-bold text-slate-900  leading-tight">
                        Новая позиция
                    </h1>
                    <p className="text-[11px] text-slate-500 font-bold  opacity-60 mt-1">
                        Создание карточки товара
                    </p>
                </div>

                <div className="flex-1 px-4 space-y-1 overflow-y-auto pb-10">
                    {steps.map((s, idx) => {
                        const isActive = step === s.id;
                        const isCompleted = step > s.id;

                        if (s.id === 1 && !hasSubCategories && step !== 1) return null;

                        return (
                            <Button
                                key={idx}
                                variant={isActive ? "default" : "ghost"}
                                onClick={() => onStepClick(s.id)}
                                className={cn(
                                    "relative w-full text-left p-4 rounded-[var(--radius)] h-auto transition-all duration-300 flex items-center justify-start gap-3 group",
                                    isActive ? "bg-primary text-white shadow-md shadow-black/10 hover:bg-primary" : "text-slate-400 hover:bg-slate-50 shadow-none"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-[var(--radius)] flex items-center justify-center shrink-0 border-2 transition-all duration-300",
                                    isActive ? "bg-white/20 border-white/30" : isCompleted ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-slate-50 border-slate-200"
                                )}>
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <span className="text-base font-bold">{idx + 1}</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className={cn("text-sm font-bold leading-none mb-1.5", isActive ? "text-white" : "text-slate-900")}>
                                        {s.title}
                                    </div>
                                    <div className={cn("text-[11px] font-bold truncate", isActive ? "text-white/60" : "text-slate-400")}>
                                        {s.desc}
                                    </div>
                                </div>

                                {isActive && (
                                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                )}
                            </Button>
                        );
                    })}
                </div>

                <div className="h-[80px] shrink-0 border-t border-slate-200 bg-white z-30 px-7 flex items-center">
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
                                <div className="text-xs font-bold  text-slate-400 mb-0.5">Черновик</div>
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
            </div>
        </aside>
    );
}
