"use client";

import React from "react";
import {
    History,
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCcw,
    User,
    Calendar,
    ArrowRightLeft,
    Settings2
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-slate-400" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">История транзакций</h3>
                </div>
                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-200 text-slate-400">
                    ЗАПИСЕЙ: {history.length}
                </Badge>
            </div>

            <div className="bg-white rounded-[20px] border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Тип</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Количество</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Причина / Склад</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Исполнитель</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Дата</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {history.map((tx) => {
                                const isPositive = tx.changeAmount > 0;
                                const isTransfer = tx.type === "transfer";
                                const isAttrChange = tx.type === "attribute_change";

                                return (
                                    <tr key={tx.id} className="group hover:bg-slate-50/50 transition-colors duration-300">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
                                                    isAttrChange ? "bg-amber-50 text-amber-600" :
                                                        isTransfer ? "bg-indigo-50 text-indigo-600" :
                                                            isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                )}>
                                                    {isAttrChange ? <Settings2 className="w-3.5 h-3.5" /> :
                                                        isTransfer ? <ArrowRightLeft className="w-3.5 h-3.5" /> :
                                                            isPositive ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-tighter text-slate-900">
                                                    {tx.type === "in" ? "Приход" :
                                                        tx.type === "out" ? "Расход" :
                                                            tx.type === "transfer" ? "Перенос" : "Инфо"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                "text-xs font-black",
                                                isAttrChange ? "text-slate-400" :
                                                    isPositive ? "text-emerald-600" : "text-rose-600"
                                            )}>
                                                {isAttrChange ? "—" : `${isPositive ? "+" : ""}${tx.changeAmount}`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 max-w-[200px] truncate group-hover:whitespace-normal transition-all duration-300">
                                                    {tx.reason || "—"}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase uppercase tracking-tighter">
                                                        {tx.storageLocation?.name || "???"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <User className="w-3 h-3 text-slate-400" />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-600">{tx.creator?.name || "Система"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex items-center gap-2 text-slate-400">
                                                <Calendar className="w-3 h-3" />
                                                <span className="text-[9px] font-black uppercase tracking-tighter">
                                                    {format(new Date(tx.createdAt), "dd MMM HH:mm", { locale: ru })}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {history.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-300">
                                        <p className="text-[10px] font-black uppercase tracking-widest">История транзакций отсутствует</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
