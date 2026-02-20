"use client";

import React from "react";
import Image from "next/image";
import {
    ResponsiveModal
} from "@/components/ui/responsive-modal";

import { Printer } from "lucide-react";
import { InventoryItem } from "@/app/(main)/dashboard/warehouse/types";
import { Button } from "@/components/ui/button";
import { escapeHtml } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface ItemLabelDialogProps {
    item: InventoryItem;
    isOpen: boolean;
    onClose: () => void;
}

export function ItemLabelDialog({ item, isOpen, onClose }: ItemLabelDialogProps) {
    const { toast } = useToast();
    const handlePrint = () => {

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast("Браузер заблокировал всплывающее окно. Разрешите всплывающие окна для печати.", "error");
            return;
        }

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(item.sku || item.id)}`;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Печать этикетки - ${escapeHtml(item.name)}</title>
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
                        <div class="header">${escapeHtml(item.name)}</div>
                        <div class="content">
                            <${"img"} src="${qrUrl}" class="qr" />
                            <div class="info">
                                <div class="sku">SKU: ${escapeHtml(item.sku || 'N/A')}</div>
                                <div class="category">${escapeHtml(item.category?.name || 'Без категории')}</div>
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
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title="Печать этикетки"
            description="Подготовка SKU-маркировки для принтера"
            footer={
                <div className="flex items-center justify-end gap-3 w-full">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="hidden md:flex h-11 px-8 rounded-2xl text-muted-foreground hover:text-foreground font-bold text-sm"
                    >
                        Закрыть
                    </Button>
                    <Button
                        onClick={handlePrint}
                        className="h-11 w-full md:w-auto md:px-10 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <Printer className="w-4 h-4 stroke-[3]" />
                        Печать этикетки
                    </Button>
                </div>
            }
        >
            <div className="px-6 py-6 space-y-4 bg-card flex-1">
                {/* Preview Label */}
                <div className="flex flex-col items-center">
                    <label className="text-sm font-bold text-foreground mb-3">Предпросмотр (58x40мм)</label>
                    <div
                        className="w-[280px] h-[180px] bg-card shadow-2xl shadow-border/50 rounded-2xl p-5 flex flex-col border border-border relative group transition-all"
                    >
                        <div className="text-[13px] font-bold text-foreground leading-tight mb-3 line-clamp-2 pr-2">
                            {item.name}
                        </div>

                        <div className="flex gap-3 items-center">
                            <div className="w-20 h-20 bg-card rounded-2xl flex items-center justify-center border border-border overflow-hidden shadow-inner p-1">
                                <Image
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${item.sku || item.id}`}
                                    alt="QR Code"
                                    className="w-full h-full object-contain invert dark:invert-0"
                                    width={80}
                                    height={80}
                                />
                            </div>
                            <div className="flex-1 space-y-1.5">
                                <div className="space-y-0.5">
                                    <div className="text-xs font-bold text-muted-foreground">Артикул</div>
                                    <div className="text-[13px] font-black text-foreground tabular-nums leading-none">{item.sku || "—"}</div>
                                </div>
                                <div className="inline-block px-1.5 py-0.5 bg-primary/5 text-primary text-xs font-bold rounded-md border border-primary/20">
                                    {item.category?.name || "Без категории"}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-2 border-t border-border flex items-center justify-between text-[7px] font-bold text-muted-foreground">
                            <span>Merch CRM System</span>
                            <span>{new Date().toLocaleDateString('ru-RU')}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center shrink-0 border border-border">
                        <Printer className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-foreground mb-1">Настройка печати</p>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">Этикетка оптимизирована для термопринтеров. Формат будет открыт в новом окне для отправки на печать.</p>
                    </div>
                </div>
            </div>
        </ResponsiveModal>
    );
}
