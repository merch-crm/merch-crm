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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500 print:hidden">
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white rounded-[24px] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col">
                <div className="p-8 pb-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Печать этикеток</h2>
                        <p className="text-sm font-medium text-slate-500 mt-1">Подготовка SKU-маркировки для товара</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full w-12 h-12 hover:bg-slate-50"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </Button>
                </div>

                <div className="flex-1 p-8 bg-slate-50/50 flex flex-col md:flex-row gap-8 items-center justify-center">
                    {/* Label Preview */}
                    <div id="label-to-print" className="bg-white p-6 rounded-lg shadow-xl border border-slate-200 flex flex-col items-center gap-4 w-[280px] aspect-[1/1.4] justify-between">
                        <div className="w-full text-center">
                            <h4 className="font-black text-slate-900 leading-tight text-sm uppercase mb-1">{item.category?.name || "Без категории"}</h4>
                            <p className="text-[11px] font-bold text-slate-500 truncate w-full px-2">{item.name}</p>
                        </div>

                        <div className="flex-1 flex items-center justify-center w-full py-4">
                            <QRCode value={item.sku || "NO-SKU"} size={160} className="border-none shadow-none p-0" />
                        </div>

                        <div className="w-full text-center">
                            <div className="bg-slate-900 text-white py-1.5 px-4 rounded-full font-black text-sm tracking-widest mb-1">
                                {item.sku || "NO-SKU"}
                            </div>

                        </div>
                    </div>

                    <div className="flex flex-col gap-6 w-full max-w-[240px]">
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Количество копий</label>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCopies(Math.max(1, copies - 1))}
                                    className="rounded-xl h-12 w-12 border-slate-200"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <div className="flex-1 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-black text-lg">
                                    {copies}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCopies(copies + 1)}
                                    className="rounded-xl h-12 w-12 border-slate-200"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-2">
                            <div className="flex items-center gap-2 text-amber-600">
                                <Printer className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase">Настройка печати</span>
                            </div>
                            <p className="text-[10px] text-amber-500/80 font-medium leading-relaxed">
                                Оптимизировано для термопринтеров 58x40мм или 58x60мм.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-slate-100 flex gap-4 bg-white rounded-b-[24px]">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-14 rounded-xl font-bold text-slate-500 border-slate-200"
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handlePrint}
                        className="flex-[2] h-14 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                    >
                        <Printer className="w-5 h-5" />
                        Распечатать ({copies})
                    </Button>
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
