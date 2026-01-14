"use client";

import { AlertTriangle, TrendingUp, Package, Clock, ArrowRight, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { InventoryItem, Category } from "./inventory-client";
import { Transaction } from "./history-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface WarehouseWidgetsProps {
    items: InventoryItem[];
    categories: Category[];
    history: Transaction[];
}

export function WarehouseWidgets({ items, categories, history }: WarehouseWidgetsProps) {
    const criticalItems = items.filter(item => item.quantity <= item.lowStockThreshold);

    // Get recent history (last 5)
    // History prop might be empty or smaller than 5
    const recentHistory = history.slice(0, 5);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Widget 1: Critical Stock */}
            <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-[32px] p-6 flex flex-col gap-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    {criticalItems.length > 0 ? (
                        criticalItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50/30 transition-all group">
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
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 py-8 flex flex-col items-center justify-center text-slate-400 bg-emerald-50/30 rounded-2xl border border-dashed border-emerald-100">
                            <TrendingUp className="w-8 h-8 text-emerald-400 mb-2" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Все товары в достаточном количестве</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Widget 2: Recent Activity Timeline */}
            <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 text-white flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-white tracking-tight uppercase">Недавняя история</h3>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Последние операции</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {recentHistory.map((tr) => (
                        <div key={tr.id} className="flex gap-4 relative group">
                            <div className="flex flex-col items-center mt-1">
                                <div className={cn(
                                    "w-3 h-3 rounded-full border-2 border-slate-900 z-10",
                                    tr.type === "in" ? "bg-emerald-500" : "bg-rose-500"
                                )} />
                                <div className="w-[1px] h-full bg-slate-800 absolute top-3 bottom-0 group-last:hidden" />
                            </div>
                            <div className="flex flex-col gap-1 pb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-black text-slate-500 uppercase">
                                        {format(new Date(tr.createdAt), "d MMM, HH:mm", { locale: ru })}
                                    </span>
                                    {tr.type === "in" ? (
                                        <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                                    ) : (
                                        <ArrowDownRight className="w-3 h-3 text-rose-500" />
                                    )}
                                </div>
                                <span className="text-[13px] font-bold text-slate-300 leading-tight">
                                    {tr.type === "in" ? "Приход" : "Расход"} <span className="text-white">{tr.item.name}</span> ({tr.changeAmount > 0 ? `+${tr.changeAmount}` : tr.changeAmount} {tr.item.unit})
                                </span>
                            </div>
                        </div>
                    ))}

                    {recentHistory.length === 0 && (
                        <div className="py-10 text-center text-slate-600">
                            <span className="text-[11px] font-black uppercase tracking-widest">История пуста</span>
                        </div>
                    )}
                </div>

                <button className="mt-auto w-full h-11 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 group">
                    Смотреть всю историю
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
