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
                            text-transform: uppercase;
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
                            text-transform: uppercase;
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
            <DialogContent className="max-w-md bg-slate-50 border-none p-0 overflow-hidden rounded-[var(--radius-outer)]">
                <div className="p-8">
                    <DialogHeader className="mb-6">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-xl font-black text-slate-900 tracking-tighter uppercase">Печать Этикетки</DialogTitle>
                            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-slate-900 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </DialogHeader>

                    {/* Preview Label */}
                    <div className="flex justify-center mb-8">
                        <div
                            ref={printRef}
                            className="w-[280px] h-[180px] bg-white shadow-2xl rounded-xl p-6 flex flex-col border border-slate-200 relative"
                        >
                            <div className="text-[14px] font-black text-slate-900 uppercase leading-tight mb-3 line-clamp-2 pr-4 tracking-tighter">
                                {item.name}
                            </div>

                            <div className="flex gap-4 items-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 overflow-hidden">
                                    <Image
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${item.sku || item.id}`}
                                        alt="QR Code"
                                        className="w-full h-full object-contain"
                                        width={80}
                                        height={80}
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Артикул</div>
                                    <div className="text-sm font-black text-slate-900 tabular-nums whitespace-nowrap">{item.sku || "—"}</div>
                                    <div className="text-[9px] font-bold text-primary uppercase tracking-widest mt-2">
                                        {item.category?.name || "Без категории"}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto text-[8px] font-bold text-slate-300 text-right uppercase tracking-widest">
                                Merch CRM / {new Date().toLocaleDateString('ru-RU')}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-400 border-slate-200"
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handlePrint}
                            className="flex-[1.5] h-14 rounded-2xl btn-primary text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Печать (58x40мм)
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
