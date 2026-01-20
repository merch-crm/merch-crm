"use client";

import React from "react";
import {
    History,
    ArrowUpRight,
    ArrowDownLeft,
    User,
    Calendar,
    ArrowRightLeft,
    Settings2,
    ChevronRight,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ItemHistoryTransaction } from "../../../types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";

interface ItemHistorySectionProps {
    history: ItemHistoryTransaction[];
}

export function ItemHistorySection({ history }: ItemHistorySectionProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Minimalist List for Mobile/Modern Web */}
            <div className="space-y-4">
                {history.length > 0 ? (
                    history.map((tx, idx) => {
                        const isPositive = tx.changeAmount > 0;
                        const isTransfer = tx.type === "transfer";
                        const isAttrChange = tx.type === "attribute_change";

                        return (
                            <div
                                key={tx.id || idx}
                                className="group flex items-center gap-6 p-6 rounded-[18px] bg-white border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all duration-500 cursor-pointer"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                {/* Transaction Icon Circle */}
                                <div className={
                                    cn(
                                        "w-12 h-12 rounded-[18px] flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shrink-0",
                                        isAttrChange ? "bg-slate-900 text-white" :
                                            isTransfer ? "bg-indigo-600 text-white" :
                                                isPositive ? "bg-indigo-50 text-indigo-600" : "bg-rose-50 text-rose-500"
                                    )}>
                                    {isAttrChange ? <Settings2 className="w-6 h-6" /> :
                                        isTransfer ? <ArrowRightLeft className="w-6 h-6" /> :
                                            isPositive ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-base font-bold text-slate-950 flex items-center gap-2">
                                            {tx.type === "in" ? "Приход" :
                                                tx.type === "out" ? "Расход" :
                                                    tx.type === "transfer" ? "Трансфер" : "Обновление"}
                                            {isPositive && !isTransfer && !isAttrChange && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+ запас</span>}
                                            {!isPositive && !isTransfer && !isAttrChange && <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">- запас</span>}
                                        </h4>
                                        <span className={cn(
                                            "text-xl font-bold tabular-nums",
                                            isAttrChange ? "text-slate-300" :
                                                isPositive ? "text-slate-900" : "text-rose-600"
                                        )}>
                                            {isAttrChange ? "Инфо" : `${isPositive ? "+" : ""}${tx.changeAmount}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
                                        <p className="text-xs font-semibold text-slate-500 truncate max-w-[300px]">{tx.reason || "Регулярная операция по ведомостям"}</p>
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            {tx.storageLocation?.name || "Global Store"}
                                        </div>
                                    </div>
                                </div>

                                {/* Meta Info */}
                                <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-slate-400">{tx.creator?.name || "Admin System"}</span>
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                            <User className="w-3 h-3 text-slate-500" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <Calendar className="w-3 h-3" />
                                        <span className="text-[10px] font-semibold">
                                            {format(new Date(tx.createdAt), "dd MMM, HH:mm", { locale: ru })}
                                        </span>
                                    </div>
                                </div>

                                <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-black transition-colors shrink-0" />
                            </div>
                        );
                    })
                ) : (
                    <div className="py-20 text-center bg-slate-50/50 rounded-[18px] border-2 border-dashed border-slate-200">
                        <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-sm font-bold text-slate-300">Пусто в логах</p>
                    </div>
                )}
            </div >

            {/* Pagination / Load More Simulation */}
            {
                history.length > 5 && (
                    <button className="w-full py-6 rounded-[18px] bg-white border border-slate-200 text-[13px] font-bold text-slate-500 hover:bg-slate-900 hover:text-white hover:border-transparent transition-all duration-500 shadow-sm">
                        Показать больше записей (+{history.length - 5})
                    </button>
                )
            }
        </div >
    );
}
