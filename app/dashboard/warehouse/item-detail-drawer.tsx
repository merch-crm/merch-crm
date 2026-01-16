"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { X, Package, MapPin, Info, ArrowUpRight, ArrowDownLeft, Clock, BarChart3, Check } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getItemHistory, getItemStocks } from "./actions";
import { InventoryItem } from "./inventory-client";


// Local types for this component's data requirements
interface ItemHistoryTransaction {
    id: string;
    type: "in" | "out" | "transfer";
    changeAmount: number;
    reason: string | null;
    createdAt: Date;
    creator: { name: string } | null;
    storageLocation: { name: string } | null;
}

interface ItemStock {
    id: string;
    quantity: number;
    updatedAt: Date;
    storageLocation: { name: string } | null;
}

interface ItemDetailDrawerProps {
    item: InventoryItem;
    onClose: () => void;
}

export function ItemDetailDrawer({ item, onClose }: ItemDetailDrawerProps) {
    const [history, setHistory] = useState<ItemHistoryTransaction[]>([]);
    const [stocks, setStocks] = useState<ItemStock[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const [historyRes, stocksRes] = await Promise.all([
                getItemHistory(item.id),
                getItemStocks(item.id)
            ]);

            if (historyRes.data) setHistory(historyRes.data);
            if (stocksRes.data) setStocks(stocksRes.data);

            setIsLoading(false);
        }
        fetchData();
    }, [item.id]);

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-500"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                {/* Image Placeholder or Actual Image */}
                <div className="relative h-64 w-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                    ) : (
                        <Package className="w-20 h-20 text-slate-200" />
                    )}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-2xl bg-white/80 backdrop-blur-md border border-white/50 shadow-xl transition-all hover:scale-110 active:scale-95 z-20"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white relative">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100 shrink-0">
                            <Package className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{item.name}</h2>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Арт.: {item.sku || "Без артикула"}</span>
                                <Badge className={cn(
                                    "px-2 py-0.5 text-[10px] font-black border-none",
                                    (item.quantity - (item.reservedQuantity || 0)) <= item.lowStockThreshold ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                                )}>
                                    {item.quantity - (item.reservedQuantity || 0)} {item.unit} ДОСТУПНО
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    {/* Primary Info Highlights */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-500 shadow-sm">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Остаток</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900 leading-none">{item.quantity} <span className="text-[10px] text-slate-400 uppercase block mt-1">{item.unit}</span></div>
                        </div>
                        <div className="bg-rose-50/50 rounded-[2rem] p-6 border border-rose-100/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Бронь</span>
                            </div>
                            <div className="text-2xl font-black text-rose-600 leading-none">{item.reservedQuantity || 0} <span className="text-[10px] text-rose-400 uppercase block mt-1">{item.unit}</span></div>
                        </div>
                        <div className="bg-emerald-50/50 rounded-[2rem] p-6 border border-emerald-100/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm">
                                    <Check className="w-5 h-5 stroke-[3]" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Доступно</span>
                            </div>
                            <div className="text-2xl font-black text-emerald-600 leading-none">{item.quantity - (item.reservedQuantity || 0)} <span className="text-[10px] text-emerald-400 uppercase block mt-1">{item.unit}</span></div>
                        </div>
                    </div>

                    {/* Stock Breakdown */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Распределение по складам</h3>
                            </div>
                        </div>

                        {stocks.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {stocks.map(stock => (
                                    <div key={stock.id} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm group hover:border-indigo-100 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900">{stock.storageLocation?.name || "Неизвестный склад"}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Обновлено {format(new Date(stock.updatedAt), "d MMM, HH:mm", { locale: ru })}</div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 px-4 py-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <span className="text-lg font-black">{stock.quantity}</span>
                                            <span className="text-[10px] font-bold ml-1 uppercase">{item.unit}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 text-center text-slate-400 text-sm font-medium">
                                Данные о распределении отсутствуют. Используйте перемещение или корректировку складского остатка.
                            </div>
                        )}
                    </div>

                    {/* Attributes */}
                    {item.attributes && Object.keys(item.attributes).length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <Info className="w-4 h-4 text-slate-400" />
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Характеристики</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(item.attributes).map(([key, value]) => (
                                    <div key={key} className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-0.5">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{key}</span>
                                        <span className="text-xs font-black text-slate-900">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Info className="w-4 h-4 text-slate-400" />
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Описание товара</h3>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 text-slate-600 leading-relaxed font-medium">
                            {item.description || "Описание отсутствует."}
                        </div>
                    </div>

                    {/* History Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">История операций</h3>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4 animate-pulse">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl" />)}
                            </div>
                        ) : history.length > 0 ? (
                            <div className="space-y-3">
                                {history.map((t) => {
                                    const isIn = t.type === "in";
                                    const isTransfer = t.type === "transfer";
                                    return (
                                        <div key={t.id} className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-white border border-slate-100 hover:border-slate-200 transition-all hover:bg-slate-50/30 group">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0",
                                                isTransfer ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : (isIn ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100")
                                            )}>
                                                {isTransfer ? <ArrowUpRight className="w-5 h-5 opacity-50" /> : (isIn ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <div className="text-sm font-black text-slate-900">
                                                        {isTransfer ? "Перемещение" : (isIn ? "Приход" : "Расход")}
                                                        {t.storageLocation && <span className="ml-2 py-0.5 px-2 bg-slate-100 rounded text-[10px] text-slate-500 uppercase font-black">{t.storageLocation.name}</span>}
                                                    </div>
                                                    <div className={cn("text-sm font-black", isTransfer ? "text-indigo-600" : (isIn ? "text-emerald-600" : "text-rose-600"))}>
                                                        {isTransfer ? "" : (isIn ? "+" : "-")}{Math.abs(t.changeAmount)} {item.unit}
                                                    </div>
                                                </div>
                                                <div className="text-xs font-medium text-slate-500 truncate">{t.reason || "Без причины"}</div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-[10px] font-bold text-slate-900">{t.creator?.name || "Сист."}</div>
                                                <div className="text-[9px] font-bold text-slate-400 mt-0.5">{format(new Date(t.createdAt), "d MMM, HH:mm", { locale: ru })}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center bg-slate-50 rounded-[2rem] border border-slate-100">
                                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm font-bold text-slate-400">Операций пока не зафиксировано</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 h-14 rounded-2xl bg-white border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </div >
    );
}
