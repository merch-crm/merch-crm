"use client";

import { AlertTriangle, TrendingUp, Package } from "lucide-react";
import { InventoryItem, Category } from "./inventory-client";
import { Transaction } from "./history-table";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface WarehouseWidgetsProps {
    items: InventoryItem[];
    categories: Category[];
    history: Transaction[];
}

export function WarehouseWidgets({ items }: WarehouseWidgetsProps) {
    const criticalItems = items.filter(item => item.quantity <= item.lowStockThreshold);

    return (
        <div className="mb-2">
            {/* Widget 1: Critical Stock */}
            <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-[14px] p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[14px] bg-rose-50 flex items-center justify-center text-rose-500">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900 tracking-tight uppercase">ТРЕБУЕТСЯ ПОПОЛНЕНИЕ</h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{criticalItems.length} позиций требуют внимания</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[178px] overflow-y-auto pr-2 custom-scrollbar">
                    {criticalItems.length > 0 ? (
                        criticalItems.map((item) => {
                            const isCritical = item.quantity <= (item.criticalStockThreshold || 0);
                            return (
                                <Link
                                    key={item.id}
                                    href={`/dashboard/warehouse/items/${item.id}`}
                                    className="flex items-center justify-between p-4 bg-slate-50/50 rounded-[14px] border border-slate-100 hover:border-rose-200 hover:bg-rose-50/30 transition-all group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-[14px] bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-rose-500 group-hover:border-rose-200 transition-colors shrink-0">
                                            <Package className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[13px] font-bold text-slate-700 truncate">{item.name}</span>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate mt-0.5">{item.sku || "Без артикула"}</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex justify-center px-4">
                                        <span className={cn(
                                            "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-[14px] shrink-0",
                                            isCritical ? "bg-rose-500 text-white shadow-sm shadow-rose-100" : "bg-amber-400 text-white shadow-sm shadow-amber-100"
                                        )}>
                                            {isCritical ? "склад пустой" : "заканчивается"}
                                        </span>
                                    </div>

                                    <div className="flex flex-col items-end shrink-0">
                                        <span className={cn("text-[13px] font-black leading-none mb-1", isCritical ? "text-rose-600" : "text-amber-600")}>
                                            {item.quantity} {item.unit}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Порог: {item.lowStockThreshold}</span>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-8 flex flex-col items-center justify-center text-slate-400 bg-emerald-50/30 rounded-[14px] border border-dashed border-emerald-100">
                            <TrendingUp className="w-8 h-8 text-emerald-400 mb-2" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Все товары в достаточном количестве</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
