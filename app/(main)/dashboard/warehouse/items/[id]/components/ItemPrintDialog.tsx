"use client";

import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { QRCode } from "@/components/ui/qr-code";
import { InventoryItem } from "../../../types";
import { useState } from "react";
import { Printer, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ItemPrintDialogProps {
    item: InventoryItem;
    isOpen: boolean;
    onClose: () => void;
}

export function ItemPrintDialog({ item, isOpen, onClose }: ItemPrintDialogProps) {
    const [copies, setCopies] = useState(1);

    const handlePrint = () => {
        window.print();
    };

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title="Печать этикеток"
            description="Подготовка SKU-маркировки для товара"
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
                        Печать ({copies})
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col h-full print:hidden">
                <div className="px-6 py-6 space-y-6 bg-card flex-1">
                    {/* Label Preview */}
                    <div className="flex flex-col items-center">
                        <label className="text-sm font-bold text-foreground mb-3">Предпросмотр</label>
                        <div id="label-to-print" className="bg-card p-5 rounded-2xl shadow-2xl shadow-border/50 border border-border flex flex-col items-center gap-4 w-[240px] aspect-[1/1.4] justify-between transition-transform hover:scale-[1.02]">
                            <div className="w-full text-center">
                                <h4 className="font-extrabold text-foreground leading-tight text-[11px] mb-1">{(item.category as { name?: string })?.name || "Без категории"}</h4>
                                <p className="text-[10px] font-bold text-muted-foreground truncate w-full px-2">{item.name}</p>
                            </div>

                            <div className="flex-1 flex items-center justify-center w-full py-2">
                                <QRCode value={item.sku || "NO-SKU"} size={140} className="border-none shadow-none p-0" />
                            </div>

                            <div className="w-full text-center">
                                <div className="bg-foreground text-background py-2 px-4 rounded-2xl font-black text-xs shadow-lg shadow-foreground/20">
                                    {item.sku || "NO-SKU"}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 bg-card p-4 rounded-2xl border border-border shadow-sm">
                        <div className="flex-1 space-y-1">
                            <label className="text-sm font-bold text-foreground ml-1">Копии</label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCopies(Math.max(1, copies - 1))}
                                    className="w-10 h-10 rounded-2xl border-border hover:bg-muted transition-all active:scale-90 shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                                </Button>
                                <div className="flex-1 h-10 bg-muted rounded-2xl flex items-center justify-center font-bold text-sm text-foreground border border-border tabular-nums min-w-[60px]">
                                    {copies}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCopies(copies + 1)}
                                    className="w-10 h-10 rounded-2xl border-border hover:bg-muted transition-all active:scale-90 shadow-sm"
                                >
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 bg-amber-50/50 p-3 rounded-2xl border border-amber-100/50">
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
            </div>
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
        </ResponsiveModal>
    );
}
