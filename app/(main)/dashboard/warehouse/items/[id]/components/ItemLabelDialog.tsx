"use client";

import React, { useRef } from "react";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { InventoryItem } from "../../../types";

interface ItemLabelDialogProps {
    item: InventoryItem;
    isOpen: boolean;
    onClose: () => void;
}

export function ItemLabelDialog({ item, isOpen, onClose }: ItemLabelDialogProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const content = printRef.current;
        if (!content) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${item.sku || item.id}`;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Печать этикетки - ${item.name}</title>
                    <style>
                        @page { size: 58mm 40mm; margin: 0; }
                        body { 
                            font-family: 'Inter', sans-serif; 
                            margin: 0; 
                            padding: 4mm;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .label {
                            width: 50mm;
                            height: 32mm;
                            border: 1px solid #eee;
                            display: flex;
                            flex-direction: column;
                            position: relative;
                            overflow: hidden;
                        }
                        .header {
                            font-size: 8pt;
                            font-weight: 900;
                            margin-bottom: 2mm;
                            line-height: 1.1;
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                        }
                        .content {
                            display: flex;
                            flex: 1;
                            gap: 2mm;
                        }
                        .qr {
                            width: 18mm;
                            height: 18mm;
                        }
                        .info {
                            flex: 1;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                        }
                        .sku {
                            font-size: 7pt;
                            font-weight: 700;
                            margin-bottom: 1mm;
                        }
                        .category {
                            font-size: 6pt;
                            color: #666;
                        }
                        .footer {
                            font-size: 5pt;
                            color: #999;
                            margin-top: auto;
                            text-align: right;
                        }
                    </style>
                </head>
                <body>
                    <div class="label">
                        <div class="header">${item.name}</div>
                        <div class="content">
                            <img src="${qrUrl}" class="qr" />
                            <div class="info">
                                <div class="sku">SKU: ${item.sku || 'N/A'}</div>
                                <div class="category">${item.category?.name || 'Без категории'}</div>
                            </div>
                        </div>
                        <div class="footer">${new Date().toLocaleDateString('ru-RU')}</div>
                    </div>
                    <script>
                        window.onload = () => {
                            window.print();
                            setTimeout(() => window.close(), 500);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg p-0 rounded-[var(--radius-outer)] border-none shadow-2xl overflow-visible bg-white">
                <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-primary/10 flex items-center justify-center shrink-0">
                            <Printer className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-slate-900 leading-tight">Печать этикетки</DialogTitle>
                            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Подготовка SKU-маркировки для принтера</p>
                        </div>
                    </div>


                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-[var(--radius-inner)] bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="px-6 py-6 space-y-8 bg-slate-50/30">
                    {/* Preview Label */}
                    <div className="flex flex-col items-center">
                        <label className="text-sm font-bold text-slate-500 mb-3">Предпросмотр (58x40мм)</label>
                        <div
                            ref={printRef}
                            className="w-[280px] h-[180px] bg-white shadow-2xl shadow-slate-200/50 rounded-[var(--radius-inner)] p-5 flex flex-col border border-slate-200 relative group transition-transform hover:scale-[1.02]"
                        >
                            <div className="text-[13px] font-bold text-slate-900 leading-tight mb-3 line-clamp-2 pr-2">
                                {item.name}
                            </div>

                            <div className="flex gap-4 items-center">
                                <div className="w-20 h-20 bg-white rounded-[var(--radius-inner)] flex items-center justify-center border border-slate-200 overflow-hidden shadow-inner p-1">
                                    <Image
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${item.sku || item.id}`}
                                        alt="QR Code"
                                        className="w-full h-full object-contain"
                                        width={80}
                                        height={80}
                                    />
                                </div>
                                <div className="flex-1 space-y-1.5">
                                    <div className="space-y-0.5">
                                        <div className="text-[8px] font-bold text-slate-400">Артикул</div>
                                        <div className="text-[13px] font-black text-slate-900 tabular-nums leading-none">{item.sku || "—"}</div>
                                    </div>
                                    <div className="inline-block px-1.5 py-0.5 bg-primary/5 text-primary text-[8px] font-bold rounded-md border border-primary/20">
                                        {item.category?.name || "Без категории"}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-2 border-t border-slate-200 flex items-center justify-between text-[7px] font-bold text-slate-300">
                                <span>Merch CRM System</span>
                                <span>{new Date().toLocaleDateString('ru-RU')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-[var(--radius-inner)] border border-slate-200 shadow-sm flex items-start gap-3">
                        <div className="w-10 h-10 rounded-[var(--radius-inner)] bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200">
                            <Printer className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-slate-900 mb-1">Настройка печати</p>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Этикетка оптимизирована для термопринтеров. Формат будет открыт в новом окне для отправки на печать.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 flex gap-3 bg-white rounded-b-[var(--radius-outer)] border-t border-slate-200">
                    <button
                        onClick={onClose}
                        className="flex-1 h-11 rounded-[var(--radius-inner)] text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-bold text-sm transition-all active:scale-95 border border-transparent"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex-[2] h-11 bg-primary text-white rounded-[var(--radius-inner)] font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        <Printer className="w-4 h-4 stroke-[3]" />
                        Печать этикетки
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
