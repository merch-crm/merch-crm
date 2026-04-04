"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Activity, Zap, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ResultViewerProps {
    resultImage: string | null;
    isPending: boolean;
    processingType: string;
}

export function ResultViewer({ resultImage, isPending, processingType }: ResultViewerProps) {
    return (
        <Card className="crm-card relative flex flex-col p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shadow-primary/5">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900  mb-0.5">Результат</h3>
                        <p className="text-xs text-slate-400 font-bold">AI Обработка</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] relative">
                {isPending && (
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full scale-50" 
                    />
                )}

                <AnimatePresence mode="wait">
                    {!resultImage ? (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center gap-3 relative z-10"
                        >
                            {isPending ? (
                                <div className="space-y-3 text-center">
                                    <div className="relative mx-auto w-24 h-24">
                                        <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Zap className="w-10 h-10 text-primary animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-2xl font-black text-slate-900 ">Магия в процессе...</h4>
                                        <p className="text-xs font-black text-slate-400 opacity-60">
                                            Настраиваем пиксели и векторы
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 group text-center">
                                    <div className="w-28 h-28 rounded-[40px] bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto transition-all duration-700 group-hover:scale-105 shadow-sm group-hover:bg-white group-hover:shadow-2xl group-hover:shadow-slate-200">
                                        <Activity className="w-12 h-12 text-slate-200 group-hover:text-primary/50 transition-colors" />
                                    </div>
                                    <p className="text-sm text-slate-400 max-w-[280px] mx-auto leading-relaxed font-bold  opacity-80">
                                        Здесь появится финальный вариант после обработки.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="result"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full h-full flex flex-col"
                        >
                            <div className="relative w-full aspect-square rounded-[var(--radius-outer)] overflow-hidden shadow-2xl shadow-slate-200 bg-white border border-slate-100 p-6">
                                {resultImage && (
                                    <Image 
                                        src={resultImage} 
                                        alt="Result" 
                                        fill 
                                        className="object-contain p-6" 
                                        unoptimized
                                    />
                                )}
                                
                                <div className="absolute inset-x-0 bottom-8 px-8 flex justify-center gap-3">
                                    <div className="px-5 py-2.5 rounded-2xl bg-white/95 border border-slate-100 flex items-center gap-3 shadow-2xl backdrop-blur-md">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs font-black text-slate-700">
                                            {processingType === 'vectorize' ? 'Vector SVG' : 'AI Enhanced'}
                                        </span>
                                    </div>
                                    <div className="px-5 py-2.5 rounded-2xl bg-emerald-500 flex items-center gap-3 shadow-xl shadow-emerald-200">
                                        <Check className="w-4 h-4 text-white" />
                                        <span className="text-xs font-black text-white">300 DPI Ready</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-8 grid grid-cols-2 gap-3">
                                <Button variant="outline" className="rounded-xl border-slate-200 text-xs font-bold h-12 w-full shadow-sm hover:bg-slate-50 transition-all">
                                    Скачать PNG
                                </Button>
                                <Button className="rounded-xl bg-slate-900 hover:bg-primary transition-all gap-3 text-xs font-bold h-12 w-full shadow-lg shadow-slate-200 text-white group/btn">
                                    Применить
                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
    );
}
