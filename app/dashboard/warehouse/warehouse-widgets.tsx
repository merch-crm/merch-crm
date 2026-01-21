import { AlertTriangle, TrendingUp, Package, Layers, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { InventoryItem, Category } from "./inventory-client";
import { Transaction } from "./history-table";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface WarehouseWidgetsProps {
    items: InventoryItem[];
    categories: Category[];
    history: Transaction[];
}

export function WarehouseWidgets({ items, history }: WarehouseWidgetsProps) {
    const criticalItems = items.filter(item => item.quantity <= item.lowStockThreshold);

    // Stats calculations
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPos = items.length;


    // Recent activity trend (simplified for demo)
    const recentIns = history.filter(t => t.type === 'in').length;
    const recentOuts = history.filter(t => t.type === 'out').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Main Stats: Critical Stock - Span 8 */}
            <div className="col-span-12 lg:col-span-8 glass-panel p-6 md:p-8 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50/50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

                <div className="flex items-center gap-5 mb-6 relative z-10">
                    <div className="w-14 h-14 rounded-[18px] bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm border border-rose-100">
                        <AlertTriangle className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 leading-tight">Дефицит на складе</h3>
                        <p className="text-sm font-medium text-slate-400 mt-1">{criticalItems.length} позиций требуют пополнения</p>
                    </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar min-h-[120px] max-h-[240px]">
                    {criticalItems.length > 0 ? (
                        criticalItems.map((item) => {
                            const isCritical = item.quantity <= (item.criticalStockThreshold || 0);
                            return (
                                <Link
                                    key={item.id}
                                    href={`/dashboard/warehouse/items/${item.id}`}
                                    className="flex items-center justify-between p-4 bg-white/40 hover:bg-white/80 rounded-[18px] border border-slate-100/50 hover:border-rose-200 transition-all group/item backdrop-blur-sm"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-[18px] bg-white border border-slate-200/60 flex items-center justify-center text-slate-300 group-hover/item:text-rose-500 group-hover/item:border-rose-200 transition-colors shrink-0">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-bold text-slate-700 truncate group-hover/item:text-rose-600 transition-colors">{item.name}</span>
                                            <span className="text-[10px] font-bold text-slate-400  truncate mt-0.5">{item.sku || "N/A"}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end shrink-0 pl-4">
                                        <span className={cn("text-base font-bold leading-none mb-1", isCritical ? "text-rose-600" : "text-amber-500")}>
                                            {item.quantity} {item.unit}
                                        </span>
                                        <span className={cn("text-[10px] font-bold  px-1.5 py-0.5 rounded-[4px]", isCritical ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600")}>
                                            {isCritical ? "КРИТИЧНО" : "МАЛО"}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-60 min-h-[150px]">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                <TrendingUp className="w-8 h-8 text-emerald-500" />
                            </div>
                            <span className="text-sm font-medium text-center">Склад полностью укомплектован</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column Stats - Span 4 */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
                {/* Total Items */}
                <div className="flex-1 bg-slate-900 text-white rounded-[var(--radius-outer)] p-8 flex flex-col justify-between relative overflow-hidden group shadow-2xl shadow-slate-900/20 border border-slate-800">
                    {/* Ambient Glow Removed */}

                    <div className="flex justify-between items-start relative z-10">
                        <div className="w-12 h-12 rounded-[18px] bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                            <Layers className="w-6 h-6 text-indigo-300" />
                        </div>
                        <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded-[6px] text-indigo-200">Всего</span>
                    </div>

                    <div className="relative z-10 mt-4">
                        <div className="text-6xl font-bold mb-1 ">{totalItems}</div>
                        <div className="text-sm font-medium text-indigo-200/70">единиц товара</div>
                    </div>
                </div>

                {/* Unique Positions Count */}
                <div className="flex-1 bg-slate-900 text-white rounded-[var(--radius-outer)] p-8 flex flex-col justify-between relative overflow-hidden group shadow-2xl shadow-slate-900/10 border border-slate-800">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl opacity-50" />

                    <div className="flex justify-between items-start relative z-10">
                        <div className="w-12 h-12 rounded-[18px] bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded-[6px] text-white/80">Активно</span>
                    </div>

                    <div className="relative z-10 mt-4">
                        <div className="text-6xl font-bold mb-1 ">{totalPos}</div>
                        <div className="text-sm font-medium text-white/70">уникальных позиций</div>
                    </div>
                </div>
            </div>

            {/* Activity Trend - Span 12 */}
            <div className="col-span-12 glass-panel p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 via-transparent to-transparent opacity-50" />

                <div className="flex items-center gap-6 relative z-10 w-full">
                    <div className="w-16 h-16 rounded-[20px] bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100 shrink-0">
                        <Activity className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900">Активность склада</h4>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                                <span className="text-sm font-bold text-slate-600">{recentIns} <span className="text-slate-400 font-medium text-xs">приёмок</span></span>
                            </div>
                            <div className="w-px h-4 bg-slate-200 hidden sm:block" />
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                                    <ArrowDownRight className="w-3.5 h-3.5 text-orange-600" />
                                </div>
                                <span className="text-sm font-bold text-slate-600">{recentOuts} <span className="text-slate-400 font-medium text-xs">отгрузок</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:flex items-end gap-1.5 h-12 relative z-10 opacity-70">
                    {[0.3, 0.5, 0.4, 0.8, 0.6, 0.9, 0.7, 0.4, 0.6, 0.8].map((val, i) => (
                        <div
                            key={i}
                            className="w-1.5 bg-emerald-200 rounded-t-[2px] hover:bg-emerald-500 transition-all duration-300 cursor-pointer"
                            style={{ height: `${val * 100}%` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
