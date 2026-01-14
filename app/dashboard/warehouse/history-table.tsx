"use client";

import Image from "next/image";

import { Package, ArrowUpRight, ArrowDownLeft, User, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Pagination } from "@/components/ui/pagination";

export interface Transaction {
    id: string;
    type: "in" | "out";
    changeAmount: number;
    reason: string | null;
    createdAt: Date;
    item: {
        name: string;
        unit: string;
        sku: string | null;
        storageLocation: {
            name: string;
        } | null;
    };
    creator: {
        name: string;
        avatar: string | null;
        role: {
            name: string;
        } | null;
    } | null;
}

interface HistoryTableProps {
    transactions: Transaction[];
}

export function HistoryTable({ transactions }: HistoryTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;


    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = transactions.slice(startIndex, startIndex + itemsPerPage);

    const isAllSelected = currentItems.length > 0 && currentItems.every(t => selectedIds.includes(t.id));

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(prev => prev.filter(id => !currentItems.some(t => t.id === id)));
        } else {
            const newSelected = currentItems.map(t => t.id);
            setSelectedIds(prev => Array.from(new Set([...prev, ...newSelected])));
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    if (transactions.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 mb-6 border border-slate-100 shadow-sm">
                    <Clock className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">История пуста</h3>
                <p className="text-slate-500 mt-2 max-w-[320px] font-medium leading-relaxed">Здесь будут отображаться все перемещения товаров, списания и поставки.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="w-[50px] px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Тип / Дата</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Товар</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Склад</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Изменение</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Причина</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Пользователь</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentItems.map((t) => {
                                const isIn = t.type === "in";
                                const amount = Math.abs(t.changeAmount);
                                const isSelected = selectedIds.includes(t.id);

                                return (
                                    <tr
                                        key={t.id}
                                        onClick={() => {
                                            /* Movement details */
                                        }}
                                        className={cn(
                                            "hover:bg-gray-50 transition-colors group cursor-pointer",
                                            isSelected ? "bg-indigo-50/30" : ""
                                        )}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                                                checked={isSelected}
                                                onChange={() => handleSelectRow(t.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
                                                    isIn ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                                                )}>
                                                    {isIn ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900 leading-tight">
                                                        {isIn ? "Приход" : "Расход"}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400 mt-0.5 whitespace-nowrap">
                                                        {format(new Date(t.createdAt), "d MMM, HH:mm", { locale: ru })}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                    <Package className="w-4 h-4" />
                                                </div>
                                                <div className="max-w-[200px]">
                                                    <div className="text-sm font-bold text-slate-900 truncate tracking-tight">{t.item.name}</div>
                                                    {t.item.sku && (
                                                        <div className="text-[10px] font-bold text-slate-400 mt-0.5 font-mono">{t.item.sku}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {t.item.storageLocation ? (
                                                <Badge variant="outline" className="text-xs font-medium text-slate-600 bg-slate-50 border-slate-200">
                                                    {t.item.storageLocation.name}
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Badge className={cn(
                                                "px-3 py-1 font-black text-xs border-none",
                                                isIn ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                            )}>
                                                {isIn ? "+" : "-"}{amount} {t.item.unit}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-2">
                                                <Info className="w-3.5 h-3.5 text-slate-300 mt-0.5 shrink-0" />
                                                <span className="text-sm font-medium text-slate-500 leading-snug">
                                                    {t.reason || "Без описания"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2.5">
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-slate-900 whitespace-nowrap">{t.creator?.name || "Система"}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">
                                                        {t.creator?.role?.name || (t.creator ? "Оператор" : "Система")}
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden shrink-0 relative">
                                                    {t.creator?.avatar ? (
                                                        <Image src={t.creator.avatar} alt={t.creator.name} width={32} height={32} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-4 h-4" />
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {transactions.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={transactions.length}
                    pageSize={itemsPerPage}
                    onPageChange={setCurrentPage}
                    itemName="записей"
                />
            )}
        </div>
    );
}
