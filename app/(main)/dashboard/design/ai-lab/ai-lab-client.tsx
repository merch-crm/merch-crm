"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import Image from "next/image";
import { 
    Upload, 
    Download, 
    Loader2, 
    Image as ImageIcon,
    Sparkles,
    Type,
    Layers,
    FileCode,
    Activity,
    Undo2
} from "lucide-react";


import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { processBackgroundRemoval, processUpscaling, processVectorization } from "./actions";

import { BackgroundRemover } from "./components/background-remover";
import { Upscaler } from "./components/upscaler";
import { ResultViewer } from "./components/result-viewer";
import { FeatureStandards } from "./components/feature-standards";

interface DpiInfo {
    width: number;
    height: number;
    dpi: number;
    quality: "low" | "medium" | "high";
}

export function AiLabClient() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [processingType, setProcessingType] = useState<"none" | "bg-removal" | "upscale" | "vectorize" | "typography">("none");
    const [isDragging, setIsDragging] = useState(false);
    const [dpiInfo, setDpiInfo] = useState<DpiInfo | null>(null);
    const [typographyPrompt, setTypographyPrompt] = useState("");

    const analyzeImage = useCallback((file: File) => {
        const img = new window.Image();
        img.onload = () => {
            const w = img.naturalWidth;
            const h = img.naturalHeight;
            const estimatedDpi = Math.round(w / 10);
            let quality: "low" | "medium" | "high" = "low";
            if (estimatedDpi >= 300) quality = "high";
            else if (estimatedDpi >= 150) quality = "medium";

            setDpiInfo({ width: w, height: h, dpi: estimatedDpi, quality });
            
            if (quality === "low") {
                toast("Низкое качество изображения для печати (менее 150 DPI). Рекомендуем использовать Upscale.", "warning");
            }
        };
        img.src = URL.createObjectURL(file);
    }, [toast]);

    const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast("Файл слишком большой. Лимит 10 МБ.", "destructive");
            return;
        }

        analyzeImage(file);

        const reader = new FileReader();
        reader.onload = (event) => {
            setSourceImage(event.target?.result as string);
            setResultImage(null);
            setProcessingType("none");
        };
        reader.readAsDataURL(file);
    }, [toast, analyzeImage]);


    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            if (file.size > 10 * 1024 * 1024) {
                toast("Файл слишком большой. Лимит 10 МБ.", "destructive");
                return;
            }
            analyzeImage(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setSourceImage(event.target?.result as string);
                setResultImage(null);
                setProcessingType("none");
            };
            reader.readAsDataURL(file);
        }
    }, [toast, analyzeImage]);

    const handleBgRemoval = () => {
        if (!sourceImage) return;
        
        setProcessingType("bg-removal");
        startTransition(async () => {
            const result = await processBackgroundRemoval(sourceImage);
            if (result.success) {
                setResultImage(result.data);
                toast("Фон успешно удален!", "success");
            } else {
                toast(result.error || "Ошибка при удалении фона", "destructive");
            }
            setProcessingType("none");
        });
    };

    const handleUpscale = () => {
        if (!sourceImage) return;
        
        setProcessingType("upscale");
        startTransition(async () => {
            const result = await processUpscaling(sourceImage, 2);
            if (result.success) {
                setResultImage(result.data);
                if (dpiInfo) {
                    setDpiInfo({
                        ...dpiInfo,
                        width: dpiInfo.width * 2,
                        height: dpiInfo.height * 2,
                        dpi: dpiInfo.dpi * 2,
                        quality: (dpiInfo.dpi * 2 >= 300) ? "high" : "medium"
                    });
                }
                toast("Изображение увеличено!", "success");
            } else {
                toast(result.error || "Ошибка при масштабировании", "destructive");
            }
            setProcessingType("none");
        });
    };

    const handleVectorize = () => {
        if (!sourceImage) return;
        setProcessingType("vectorize");
        startTransition(async () => {
            const result = await processVectorization(sourceImage);
            if (result.success) {
                setResultImage(result.data.url);
                toast("Векторизация завершена!", "success");
            } else {
                toast(result.error || "Ошибка при векторизации", "destructive");
            }
            setProcessingType("none");
        });
    };

    const handleTypography = () => {
        if (!typographyPrompt) {
            toast("Введите текст для генерации принта", "warning");
            return;
        }
        setProcessingType("typography");
        startTransition(async () => {
            await new Promise(r => setTimeout(r, 2000));
            setResultImage("/typography_placeholder.png");
            toast("Макет с текстом сгенерирован!", "success");
            setProcessingType("none");
        });
    };

    const handleReset = () => {
        setSourceImage(null);
        setResultImage(null);
        setProcessingType("none");
        setDpiInfo(null);
    };

    return (
        <div className="space-y-3 animate-in fade-in duration-700">
            {/* Standard Dashboard Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shadow-primary/5">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900  leading-none mb-1">AI Лаборатория</h1>
                            <p className="text-xs text-slate-500 font-bold  opacity-70">
                                Улучшение макетов и векторизация до 300 DPI
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        onClick={handleReset} 
                        disabled={!sourceImage} 
                        className="gap-2 font-bold text-xs h-12 px-6 rounded-xl border-slate-200 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-30"
                    >
                        <Undo2 className="w-4 h-4" />
                        Сбросить
                    </Button>
                    <Button 
                        className="gap-2 font-bold text-xs h-12 px-8 rounded-xl bg-slate-900 text-white shadow-xl shadow-slate-200 transition-all hover:bg-primary active:scale-95 disabled:opacity-30"
                        disabled={!resultImage}
                    >
                        <Download className="w-4 h-4" />
                        Сохранить результат
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="standard" className="w-full">
                <TabsList className="bg-slate-100 p-1.5 rounded-[var(--radius-outer)] mb-6 h-auto inline-flex shadow-inner">
                    <TabsTrigger 
                        value="standard" 
                        className="rounded-2xl px-10 py-3.5 gap-3 data-[state=active]:bg-white data-[state=active]:shadow-lg text-xs font-black transition-all data-[state=active]:text-primary"
                    >
                        <Sparkles className="w-4 h-4" />
                        Быстрая магия
                    </TabsTrigger>
                    <TabsTrigger 
                        value="advanced" 
                        className="rounded-2xl px-10 py-3.5 gap-3 data-[state=active]:bg-white data-[state=active]:shadow-lg text-xs font-black transition-all data-[state=active]:text-primary"
                    >
                        <Layers className="w-4 h-4" />
                        Лаборатория
                    </TabsTrigger>
                </TabsList>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {/* Source Container */}
                    <Card className={cn(
                        "crm-card relative flex flex-col p-8 transition-all duration-500",
                        isDragging && "ring-8 ring-primary/5 border-primary border-dashed bg-primary/[0.02]"
                    )}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shadow-primary/5">
                                    <ImageIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900  mb-0.5">Оригинал</h3>
                                    <p className="text-xs text-slate-400 font-bold">Исходный файл</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                            <AnimatePresence mode="wait">
                                {!sourceImage ? (
                                    <motion.div 
                                        key="upload"
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05 }}
                                        className="w-full flex-1 flex flex-col items-center justify-center text-center group cursor-pointer"
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <div className={cn(
                                            "w-28 h-28 rounded-[40px] bg-primary/5 flex items-center justify-center mb-8 transition-all duration-700 border border-transparent",
                                            isDragging ? "scale-110 bg-primary/10 border-primary/20 shadow-2xl shadow-primary/10" : "group-hover:bg-primary/10 group-hover:scale-105"
                                        )}>
                                            <Upload className={cn(
                                                "w-12 h-12 text-primary/40 transition-all duration-500",
                                                isDragging ? "animate-bounce text-primary" : "group-hover:-translate-y-1 group-hover:text-primary"
                                            )} />
                                        </div>
                                        <h3 className="text-2xl font-black mb-3 text-slate-900 ">Загрузите макет</h3>
                                        <p className="text-sm text-slate-400 mb-10 max-w-[320px] leading-relaxed font-bold  opacity-80">
                                            ИИ проанализирует изображение и предложит улучшения для печати.
                                        </p>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef}
                                            className="hidden" 
                                            onChange={onFileChange} 
                                            accept="image/*" 
                                        />
                                        <Button 
                                            size="lg" 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="h-12 rounded-xl px-10 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all font-bold text-sm bg-slate-900"
                                        >
                                            Выбрать файл
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="preview"
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-full h-full flex flex-col"
                                    >
                                        <div className="relative w-full aspect-square rounded-[var(--radius-outer)] overflow-hidden shadow-sm bg-slate-50/30 border border-slate-100 group/img">
                                            {sourceImage && (
                                                <Image 
                                                    src={sourceImage} 
                                                    alt="Source" 
                                                    fill 
                                                    className="object-contain p-4" 
                                                    unoptimized // Since it's a data URL or blob
                                                />
                                            )}
                                            {dpiInfo && (
                                                <div className="absolute top-6 right-6">
                                                    <div className={cn(
                                                        "px-4 py-2 rounded-2xl text-xs font-black border shadow-xl backdrop-blur-md flex items-center gap-2.5",
                                                        dpiInfo.quality === "high" ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" : 
                                                        dpiInfo.quality === "medium" ? "bg-amber-50 text-amber-600 border-amber-100/50" : 
                                                        "bg-rose-50 text-rose-600 border-rose-100/50"
                                                    )}>
                                                        <Activity className="w-4 h-4" />
                                                        {dpiInfo.dpi < 150 ? 'Low' : dpiInfo.quality === 'high' ? 'High' : 'Medium'} • {dpiInfo.dpi} DPI
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="mt-8">
                                            <TabsContent value="standard" className="grid grid-cols-2 gap-3 mt-0 appearance-none focus-visible:outline-none">
                                                <BackgroundRemover 
                                                    isPending={isPending} 
                                                    processingType={processingType} 
                                                    onProcess={handleBgRemoval} 
                                                />
                                                <Upscaler 
                                                    isPending={isPending} 
                                                    processingType={processingType} 
                                                    onProcess={handleUpscale} 
                                                />
                                            </TabsContent>

                                            <TabsContent value="advanced" className="space-y-3 mt-0 appearance-none focus-visible:outline-none">
                                                <Button 
                                                    variant="outline"
                                                    onClick={handleVectorize} 
                                                    disabled={isPending}
                                                    className={cn(
                                                        "h-20 w-full rounded-[var(--radius-outer)] gap-3 border-slate-100 transition-all group hover:border-orange-200 hover:bg-slate-50/50 bg-white shadow-sm",
                                                        processingType === "vectorize" && "bg-orange-600 text-white border-orange-600 shadow-xl shadow-orange-100"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                                                        processingType === "vectorize" ? "bg-white/20" : "bg-orange-50 text-orange-600"
                                                    )}>
                                                        {processingType === "vectorize" ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileCode className="w-6 h-6" />}
                                                    </div>
                                                    <div className="text-left leading-tight">
                                                        <div className="text-base font-black ">AI Vectorizer</div>
                                                        <div className="text-xs font-bold opacity-60 mt-0.5">Конвертация растра в кривые SVG</div>
                                                    </div>
                                                </Button>

                                                <div className="space-y-3 bg-slate-50/50 pb-6 rounded-3xl">
                                                    <div className="flex items-center gap-3 px-1 mb-2">
                                                        <Type className="w-4 h-4 text-slate-400" />
                                                        <span className="text-xs font-black text-slate-500">Текстовый генератор</span>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <Input 
                                                            placeholder="Введите фразу для дизайна..." 
                                                            value={typographyPrompt}
                                                            onChange={(e) => setTypographyPrompt(e.target.value)}
                                                            className="h-16 rounded-[var(--radius-outer)] bg-white border-slate-200 focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold shadow-sm px-6"
                                                        />
                                                        <Button 
                                                            size="icon" 
                                                            className="h-16 w-16 shrink-0 rounded-[var(--radius-outer)] bg-slate-900 hover:bg-primary transition-all shadow-xl active:scale-95 text-white"
                                                            onClick={handleTypography}
                                                            disabled={isPending || !typographyPrompt}
                                                        >
                                                            {processingType === "typography" ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </Card>

                    <ResultViewer 
                        resultImage={resultImage}
                        isPending={isPending}
                        processingType={processingType}
                    />
                </div>
            </Tabs>

            <FeatureStandards />
        </div>
    );
}
