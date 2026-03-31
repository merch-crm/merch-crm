"use client";

import { Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { StepFooter } from "./step-footer";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface PrintDesign {
    id: string;
    name: string;
    preview: string | null;
    versionsCount: number;
}

interface PrintSelectionStepProps {
    collectionName: string;
    prints: PrintDesign[];
    selectedPrintIds: string[];
    onSelectionChange: (ids: string[]) => void;
    onBack: () => void;
    onNext: () => void;
    errors?: Record<string, string>;
}

export function PrintSelectionStep({
    collectionName,
    prints,
    selectedPrintIds,
    onSelectionChange,
    onBack,
    onNext,
    errors,
}: PrintSelectionStepProps) {
    const togglePrint = (id: string) => {
        if (selectedPrintIds.includes(id)) {
            onSelectionChange(selectedPrintIds.filter((p) => p !== id));
        } else {
            onSelectionChange([...selectedPrintIds, id]);
        }
    };

    const selectAll = () => {
        onSelectionChange(prints.map((p) => p.id));
    };

    const selectNone = () => {
        onSelectionChange([]);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 p-8 space-y-3">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Выбор принтов</h2>
                    <p className="text-slate-500">
                        Выберите дизайны из коллекции &quot;{collectionName}&quot;, которые будут включены в линейку
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                            Выбрано: {selectedPrintIds.length} из {prints.length}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={selectAll}
                            className="text-xs font-bold text-primary hover:text-primary hover:bg-primary/10"
                        >
                            Выбрать все
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={selectNone}
                            className="text-xs font-bold text-slate-400 hover:text-slate-900"
                        >
                            Сбросить
                        </Button>
                    </div>
                </div>

                {/* Grid */}
                <ScrollArea className="h-[calc(100vh-450px)] pr-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {prints.map((print) => {
                            const isSelected = selectedPrintIds.includes(print.id);
                            return (
                                <button
                                    key={print.id}
                                    type="button"
                                    onClick={() => togglePrint(print.id)}
                                    className={cn(
                                        "group relative aspect-square rounded-2xl border-2 transition-all cursor-pointer overflow-hidden w-full",
                                        isSelected
                                            ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                                            : "border-slate-100 hover:border-slate-300"
                                    )}
                                >
                                    {/* Preview */}
                                    {print.preview ? (
                                        <Image
                                            src={print.preview}
                                            alt={print.name}
                                            fill
                                            className={cn(
                                                "object-cover transition-transform duration-500",
                                                isSelected ? "scale-105" : "group-hover:scale-110"
                                            )}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                            <span className="text-xs font-bold">Нет фото</span>
                                        </div>
                                    )}

                                    {/* Overlay */}
                                    <div className={cn(
                                        "absolute inset-0 flex flex-col justify-end p-3 transition-opacity duration-300",
                                        isSelected ? "bg-primary/20" : "bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100"
                                    )}>
                                        <p className="text-xs font-bold text-white truncate drop-shadow-md">
                                            {print.name}
                                        </p>
                                    </div>

                                    {/* Badge */}
                                    <div className={cn(
                                        "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                                        isSelected
                                            ? "bg-primary text-white scale-100 shadow-lg"
                                            : "bg-white/90 text-slate-400 scale-0 group-hover:scale-100 shadow-md"
                                    )}>
                                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </ScrollArea>

                {errors?.prints && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 text-sm font-bold">
                        <Info className="w-4 h-4" />
                        {errors.prints}
                    </div>
                )}
            </div>

            <StepFooter
                onBack={onBack}
                onNext={onNext}
                isNextDisabled={selectedPrintIds.length === 0}
                validationError={errors?.prints}
            />
        </div>
    );
}
