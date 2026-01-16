"use client";

import { AlertTriangle, TrendingUp, Package } from "lucide-react";
import { InventoryItem, Category } from "./inventory-client";
import { Transaction } from "./history-table";
import Link from "next/link";

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
            <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-[32px] p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900 tracking-tight uppercase">Критические остатки</h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{criticalItems.length} позиций требуют внимания</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                    {criticalItems.length > 0 ? (
                        criticalItems.map((item) => (
                            <Link
                                key={item.id}
                                href={`/dashboard/warehouse/items/${item.id}`}
                                className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50/30 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-rose-500 group-hover:border-rose-200 transition-colors">
                                        <Package className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-bold text-slate-700 truncate max-w-[120px]">{item.name}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.sku || "Без артикула"}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-black text-rose-600">{item.quantity} {item.unit}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Порог: {item.lowStockThreshold}</span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-8 flex flex-col items-center justify-center text-slate-400 bg-emerald-50/30 rounded-2xl border border-dashed border-emerald-100">
                            <TrendingUp className="w-8 h-8 text-emerald-400 mb-2" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Все товары в достаточном количестве</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
