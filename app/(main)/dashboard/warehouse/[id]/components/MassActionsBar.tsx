"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Tag, Download, Archive, X, LucideIcon } from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { exportToCSV } from "@/lib/export-utils";
import { InventoryItem, StorageLocation } from "../../types";

interface MassActionsBarProps {
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
    items: InventoryItem[];
    storageLocations: StorageLocation[];
    isAnyModalOpen: boolean;
    onBulkMove: () => void;
    onBulkPrint: () => void;
    onArchive: () => void;
    toast: (msg: string, type: "success" | "error") => void;
}

interface ActionBtnProps {
    icon: LucideIcon;
    label: string;
    title: string;
    ariaLabel: string;
    onClick: () => void;
}

function ActionBtn({ icon: Icon, label, title, ariaLabel, onClick }: ActionBtnProps) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClick}
            className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full hover:bg-slate-100 transition-all group shrink-0"
            title={title}
            aria-label={ariaLabel}
        >
            <Icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
            <span className="hidden md:inline text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">{label}</span>
        </Button>
    );
}

export const MassActionsBar = React.memo(({
    selectedIds,
    setSelectedIds,
    items = [],
    storageLocations,
    isAnyModalOpen,
    onBulkMove,
    onBulkPrint,
    onArchive,
    toast
}: MassActionsBarProps) => {
    return createPortal(
        <AnimatePresence>
            {selectedIds.length > 0 && !isAnyModalOpen && (
                <>
                    {/* Bottom Progressive Gradient Blur Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-x-0 bottom-0 h-80 pointer-events-none z-[100]"
                        style={{
                            maskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                            background: 'linear-gradient(to top, #ffffff 0%, rgba(255, 255, 255, 0.8) 40%, transparent 100%)'
                        }}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 100, x: "-50%", scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                        exit={{ opacity: 0, y: 100, x: "-50%", scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.8 }}
                        className="fixed bottom-10 left-1/2 z-[110] flex items-center bg-white p-1.5 md:p-2 gap-1.5 md:gap-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 w-[calc(100%-2rem)] md:w-auto overflow-x-auto no-scrollbar"
                    >
                        <div className="flex items-center gap-2 md:gap-3 pl-1 shrink-0">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-[11px] md:text-sm font-bold text-white shrink-0">
                                {selectedIds.length}
                            </div>
                            <span className="hidden lg:inline text-xs font-bold text-slate-500 whitespace-nowrap pr-1">Позиций</span>
                        </div>

                        <div className="w-px h-6 bg-slate-200 mx-1 shrink-0" />

                        <div className="flex items-center gap-0.5 md:gap-1 flex-1 justify-around md:justify-start">
                            <ActionBtn
                                icon={MapPin}
                                label="Переместить"
                                title="Переместить"
                                ariaLabel="Переместить выбранные товары"
                                onClick={onBulkMove}
                            />
                            <ActionBtn
                                icon={Tag}
                                label="Этикетки"
                                title="Этикетки"
                                ariaLabel="Печать этикеток для выбранных товаров"
                                onClick={onBulkPrint}
                            />
                            <ActionBtn
                                icon={Download}
                                label="Экспорт"
                                title="Экспорт"
                                ariaLabel="Экспортировать выбранные товары в CSV"
                                onClick={() => {
                                    const itemsToExport = (items || []).filter(i => selectedIds.includes(i.id));
                                    exportToCSV(itemsToExport, "inventory_export", [
                                        { header: "ID", key: "id" },
                                        { header: "Название", key: "name" },
                                        { header: "Артикул", key: (item: InventoryItem) => item.sku || "" },
                                        { header: "Количество", key: "quantity" },
                                        { header: "Ед.изм", key: "unit" },
                                        { header: "Категория", key: (item: InventoryItem) => item.category?.name || "" },
                                        {
                                            header: "Склад", key: (item: InventoryItem) => {
                                                if (item.stocks && item.stocks.length > 0) {
                                                    const stocksStr = item.stocks
                                                        .filter((s: { storageLocationId: string; quantity: number }) => s.quantity > 0)
                                                        .map((s: { storageLocationId: string; quantity: number }) => {
                                                            const locName = storageLocations.find(l => l.id === s.storageLocationId)?.name || "Неизвестно";
                                                            return `${locName} (${s.quantity})`;
                                                        })
                                                        .join("; ");
                                                    if (stocksStr) return stocksStr;
                                                }
                                                return "";
                                            }
                                        },
                                        { header: "Себестоимость", key: (item: InventoryItem) => item.costPrice || 0 },
                                        { header: "Цена продажи", key: (item: InventoryItem) => item.sellingPrice || 0 }
                                    ]);
                                }}
                            />


                            <div className="w-px h-8 bg-slate-200 mx-1" />

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    const itemsToArchive = (items || []).filter(i => selectedIds.includes(i.id));
                                    const hasStock = itemsToArchive.some(i => i.quantity > 0);
                                    if (hasStock) {
                                        toast("Нельзя архивировать товары с остатком > 0", "error");
                                        return;
                                    }
                                    onArchive();
                                }}
                                aria-label="Архивировать выбранные товары"
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all"
                            >
                                <Archive className="w-4 h-4" />
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedIds([])}
                                aria-label="Снять выделение"
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
});

MassActionsBar.displayName = "MassActionsBar";
