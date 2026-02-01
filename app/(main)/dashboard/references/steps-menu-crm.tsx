"use client";

import React, { useState } from "react";
import {
    Check,
    ChevronLeft,
    Settings,
    Image as ImageIcon,
    Box,
    FileText,
    MousePointer2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StepsMenuCRM() {
    const [activeStep, setActiveStep] = useState(2);

    const steps = [
        { id: 1, title: "Тип позиции", sub: "Категория и вид", icon: <Settings /> },
        { id: 2, title: "Описание", sub: "Характеристики", icon: <FileText /> },
        { id: 3, title: "Галерея", sub: "Фото и медиа", icon: <ImageIcon /> },
        { id: 4, title: "Склад", sub: "Остатки и хранение", icon: <Box /> },
    ];

    return (
        <div className="w-full glass-panel p-8 rounded-[var(--radius-outer)] mt-10 overflow-hidden relative min-h-[600px] flex items-center justify-center bg-slate-50/20">
            {/* Ambient backgrounds */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(223,255,0,0.05),transparent_40%)] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full max-w-6xl relative z-10">

                {/* Sidebar Menu (based on Photo 1) */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-[24px] border border-slate-200 shadow-crm-xl overflow-hidden flex flex-col min-h-[500px]">
                        {/* Header part */}
                        <div className="p-8 pb-6">
                            <button className="flex items-center gap-2 text-[10px] font-bold  tracking-normal text-slate-400 hover:text-slate-900 transition-colors mb-6 group">
                                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Назад
                            </button>
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">Новая позиция</h2>
                            <p className="text-[10px] font-bold  tracking-normal text-slate-400 mt-2">Создание карточки товара</p>
                        </div>

                        {/* Steps (with Photo 2 glow effect + Light Frosted Glass) */}
                        <div className="flex-1 px-4 space-y-3 py-6">
                            {steps.map((step) => {
                                const isActive = activeStep === step.id;
                                const isCompleted = activeStep > step.id;

                                return (
                                    <button
                                        key={step.id}
                                        onClick={() => setActiveStep(step.id)}
                                        className={cn(
                                            "w-full text-left relative transition-all duration-500 rounded-[var(--radius)] group overflow-hidden border transition-shadow",
                                            isActive
                                                ? "bg-[#f4f4f5]/80 backdrop-blur-2xl shadow-xl shadow-[#00d685]/10 border-slate-200 ring-1 ring-[#00d685]/10"
                                                : "hover:bg-slate-50 border-transparent"
                                        )}
                                    >
                                        {/* PHOTO 2 EFFECT: Glowing lateral bar (Matched to green checkmark color #00d685) */}
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[6px] h-10 bg-[#00d685] rounded-r-full shadow-[0_0_20px_#00d685] z-20" />
                                        )}

                                        {/* Green neon glow behind the content (Photo 2 style) */}
                                        {isActive && (
                                            <div className="absolute -left-10 top-0 bottom-0 w-32 bg-[#00d685]/10 blur-[30px] rounded-full pointer-events-none" />
                                        )}

                                        <div className={cn(
                                            "flex items-center gap-5 p-5 transition-all relative z-10",
                                            isActive ? "translate-x-1" : "translate-x-0"
                                        )}>
                                            {/* Step Indicator */}
                                            <div className={cn(
                                                "w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500 font-bold text-sm",
                                                isCompleted
                                                    ? "bg-[#00d685] border-[#00d685] text-white shadow-[0_0_15px_rgba(0,214,133,0.3)]"
                                                    : isActive
                                                        ? "bg-[#00d685]/10 border-[#00d685]/30 text-[#00d685]"
                                                        : "bg-white border-slate-200 text-slate-300"
                                            )}>
                                                {isCompleted ? <Check className="w-5 h-5 stroke-[3px]" /> : step.id}
                                            </div>

                                            {/* Labels */}
                                            <div className="flex flex-col">
                                                <span className={cn(
                                                    "text-sm font-bold  tracking-wider transition-colors",
                                                    isActive ? "text-slate-900" : "text-slate-900"
                                                )}>
                                                    {step.title}
                                                </span>
                                                <span className={cn(
                                                    "text-[10px] font-bold  tracking-normal mt-1",
                                                    isActive ? "text-[#00d685]" : "text-slate-400"
                                                )}>
                                                    {step.sub}
                                                </span>
                                            </div>

                                            {/* Active Marker Dot (Photo 2 style) */}
                                            {isActive && (
                                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00d685] shadow-[0_0_8px_#00d685] animate-pulse" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer - Frosted Glass Style */}
                        <div className="p-6 pt-0 mt-auto">
                            <div className="flex items-center justify-between p-5 bg-slate-50/50 backdrop-blur-md rounded-[var(--radius)] border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/40 pointer-events-none" />
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#00d685] shadow-[0_0_8px_#00d685]" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold  tracking-normal text-[#a1a1aa]">Черновик</span>
                                        <span className="text-[11px] font-extrabold text-[#18181b]">Сохранено</span>
                                    </div>
                                </div>
                                <button className="text-[11px] font-bold  tracking-normal text-[#5d00ff] hover:text-[#4a00cc] transition-colors relative z-10">Начать заново</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Placeholder */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="crm-card h-full p-12 flex flex-col justify-center items-center text-center">
                        <div className="w-24 h-24 rounded-[32px] bg-slate-50 flex items-center justify-center text-slate-200 mb-8 border-2 border-dashed border-slate-200">
                            <MousePointer2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-4">Step {activeStep} Content</h3>
                        <p className="max-w-md text-slate-400 font-medium leading-relaxed">
                            This is where the configuration for <strong>{steps.find(s => s.id === activeStep)?.title}</strong> would appear.
                            Select other steps to see the glowing transition effect on the menu.
                        </p>

                        <div className="mt-12 w-full grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-20 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200" />
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
