"use client";

import React from "react";
import { ArrowLeft, Check, User, Package, Clock, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Step {
    id: number;
    title: string;
    desc: string;
    icon: LucideIcon;
}

interface OrderSidebarProps {
    steps: Step[];
    currentStep: number;
    onStepClick: (stepId: number) => void;
    onBack: () => void;
    selectedClientName: string;
}

export function OrderSidebar({
    steps,
    currentStep,
    onStepClick,
    onBack,
    selectedClientName
}: OrderSidebarProps) {
    return (
        <aside className="crm-card w-full lg:w-[320px] flex-shrink-0 h-fit sticky top-6 z-10 hidden lg:block overflow-hidden h-auto lg:h-full">
            <div className="p-6 shrink-0">
                <Button variant="ghost" onClick={onBack} className="pl-0 gap-2 text-muted-foreground hover:text-foreground font-bold mb-4 group h-auto hover:bg-transparent">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Назад
                </Button>
                <h1 className="text-2xl font-bold text-foreground leading-tight">Новый заказ</h1>
                <p className="text-[11px] text-muted-foreground font-bold opacity-60 mt-1">Оформление в CRM</p>
            </div>

            <div className="flex-1 px-4 space-y-1 overflow-y-auto pb-10">
                {steps.map((s, idx) => (
                    <Button
                        key={idx}
                        asChild
                        variant="ghost"
                        className="p-0 border-none bg-transparent hover:bg-transparent shadow-none w-full h-auto"
                    >
                        <button
                            type="button"
                            onClick={() => onStepClick(s.id)}
                            className={cn(
                                "relative w-full text-left p-4 rounded-[var(--radius)] transition-all duration-300 flex items-center gap-3 group",
                                currentStep === s.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted active:scale-[0.98]"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-[var(--radius)] flex items-center justify-center shrink-0 border-2 transition-all duration-300",
                                currentStep === s.id ? "bg-white/10 border-white/20" : currentStep > s.id ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-muted border-border"
                            )}>
                                {currentStep > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                                <div className={cn("text-xs font-bold leading-none mb-1", currentStep === s.id ? "text-primary-foreground" : "text-foreground")}>{s.title}</div>
                                <div className={cn("text-xs font-bold truncate", currentStep === s.id ? "text-primary-foreground/60" : "text-muted-foreground")}>{s.desc}</div>
                            </div>
                        </button>
                    </Button>
                ))}
            </div>

            <div className="h-[80px] border-t border-border bg-card px-7 flex items-center">
                <div className="text-xs font-bold text-muted-foreground truncate">
                    {selectedClientName || "Клиент не выбран"}
                </div>
            </div>
        </aside>
    );
}
