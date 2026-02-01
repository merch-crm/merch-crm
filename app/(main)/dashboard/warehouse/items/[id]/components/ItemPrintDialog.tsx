"use client";

import { X, Printer, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCode } from "@/components/ui/qr-code";
import { InventoryItem } from "../../../types";
import { useState } from "react";

interface ItemPrintDialogProps {
    item: InventoryItem;
    isOpen: boolean;
    onClose: () => void;
}

export function ItemPrintDialog({ item, isOpen, onClose }: ItemPrintDialogProps) {
    const [copies, setCopies] = useState(1);

    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-500 print:hidden" role="dialog" aria-modal="true" data-dialog-open="true">
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white rounded-[var(--radius-outer)] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-primary/10 flex items-center justify-center shrink-0">
                            <Printer className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">Печать этикеток</h2>
                            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Подготовка SKU-маркировки для товара</p>
                        </div>
                    </div>


                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-[var(--radius-inner)] bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="px-6 py-6 space-y-6 bg-slate-50/30">
                    {/* Label Preview */}
                    <div className="flex flex-col items-center">
                        <label className="text-sm font-bold text-slate-500 mb-3">Предпросмотр</label>
                        <div id="label-to-print" className="bg-white p-5 rounded-[var(--radius-inner)] shadow-2xl shadow-slate-200/50 border border-slate-200 flex flex-col items-center gap-4 w-[240px] aspect-[1/1.4] justify-between transition-transform hover:scale-[1.02]">
                            <div className="w-full text-center">
                                <h4 className="font-extrabold text-slate-900 leading-tight text-[11px] mb-1">{item.category?.name || "Без категории"}</h4>
                                <p className="text-[10px] font-bold text-slate-400 truncate w-full px-2">{item.name}</p>
                            </div>

                            <div className="flex-1 flex items-center justify-center w-full py-2">
                                <QRCode value={item.sku || "NO-SKU"} size={140} className="border-none shadow-none p-0" />
                            </div>

                            <div className="w-full text-center">
                                <div className="bg-slate-900 text-white py-2 px-4 rounded-[var(--radius-inner)] font-black text-xs shadow-lg shadow-slate-900/20">
                                    {item.sku || "NO-SKU"}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 bg-white p-4 rounded-[var(--radius-inner)] border border-slate-200 shadow-sm">
                        <div className="flex-1 space-y-1">
                            <label className="text-sm font-bold text-slate-500 ml-1">Копии</label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCopies(Math.max(1, copies - 1))}
                                    className="w-10 h-10 rounded-[var(--radius-inner)] border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all active:scale-90"
                                >
                                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                                </button>
                                <div className="flex-1 h-10 bg-slate-50 rounded-[var(--radius-inner)] flex items-center justify-center font-bold text-sm text-slate-900 border border-slate-200 tabular-nums">
                                    {copies}
                                </div>
                                <button
                                    onClick={() => setCopies(copies + 1)}
                                    className="w-10 h-10 rounded-[var(--radius-inner)] border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all active:scale-90"
                                >
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-amber-50/50 p-3 rounded-[var(--radius-inner)] border border-amber-100/50">
                            <div className="flex items-center gap-2 text-amber-600 mb-1">
                                <Printer className="w-3 h-3" />
                                <span className="text-[9px] font-bold">Термопечать</span>
                            </div>
                            <p className="text-[9px] text-amber-600/70 font-medium leading-tight">
                                Оптимизировано для ленты 58x40мм.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 flex gap-3 bg-white rounded-b-[var(--radius-outer)]">
                    <button
                        onClick={onClose}
                        className="flex-1 h-11 rounded-[var(--radius-inner)] text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-bold text-xs transition-all active:scale-95"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex-[2] h-11 bg-primary text-white rounded-[var(--radius-inner)] font-bold text-xs shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        <Printer className="w-4 h-4 stroke-[3]" />
                        Печать ({copies})
                    </button>
                </div>
            </div>

            {/* Print Only Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: 58mm 80mm;
                        margin: 0;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #label-to-print, #label-to-print * {
                        visibility: visible;
                    }
                    #label-to-print {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 58mm;
                        height: 80mm;
                        border: none;
                        padding: 5mm;
                        box-shadow: none;
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: space-between !important;
                    }
                    .print-hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
