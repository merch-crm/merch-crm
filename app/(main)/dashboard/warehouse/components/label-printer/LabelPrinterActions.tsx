"use client";
import React from "react";
import { Printer, Download, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PrinterConfig } from "./label-printer-types";

interface LabelPrinterActionsProps {
    config: PrinterConfig;
    setConfig: React.Dispatch<React.SetStateAction<PrinterConfig>>;
    handlePrint: () => void;
}

export function LabelPrinterActions({
    config,
    setConfig,
    handlePrint
}: LabelPrinterActionsProps) {
    return (
        <div className="flex-none px-6 pt-5 pb-6 bg-white border-t border-slate-200 z-50 space-y-4 shadow-[0_-12px_30px_-15px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900 ml-1">Тираж</label>
                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-[var(--radius-inner)]">
                    <Button type="button" size="icon" variant="outline" onClick={() => setConfig(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))} className="w-8 h-8 rounded-[var(--radius-inner)] bg-white border-slate-200 hover:bg-slate-100 text-slate-900 shadow-sm transition-all active:scale-90" aria-label="Уменьшить количество">
                        <Minus className="w-3.5 h-3.5" />
                    </Button>
                    <Input
                        type="number"
                        value={config.quantity}
                        onChange={(e) => setConfig(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                        className="w-12 h-8 bg-transparent text-center font-bold text-base text-slate-900 focus-visible:ring-0 border-none shadow-none p-0"
                    />
                    <Button type="button" size="icon" variant="outline" onClick={() => setConfig(prev => ({ ...prev, quantity: prev.quantity + 1 }))} className="w-8 h-8 rounded-[var(--radius-inner)] bg-white border-slate-200 hover:bg-slate-100 text-slate-900 shadow-sm transition-all active:scale-90" aria-label="Увеличить количество">
                        <Plus className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>
            <div className="flex gap-3 w-full">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11 rounded-[var(--radius-inner)] bg-white border-2 border-slate-200 text-slate-900 flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 group shadow-sm px-0"
                    aria-label="Скачать"
                >
                    <Download className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                </Button>
                <Button
                    type="button"
                    onClick={handlePrint}
                    className="flex-1 h-11 bg-slate-900 hover:bg-black text-white rounded-[var(--radius-inner)] font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] group"
                >
                    <Printer className="w-4 h-4 transition-transform" />
                    Печать
                </Button>
            </div>
        </div>
    );
}
