"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
    Package, ArrowUpRight, ArrowDownLeft, Clock, Building2,
    ArrowRight, ArrowLeftRight, Book, LayoutGrid, User
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn, formatUnit } from "@/lib/utils";
import { type Transaction } from "../history-types";

interface HistoryDesktopTableProps {
    currentItems: Transaction[];
    selectedIds: string[];
    isAllSelected: boolean;
    handleSelectAll: () => void;
    handleSelectRow: (id: string) => void;
}

export function HistoryDesktopTable({
    currentItems,
    selectedIds,
    isAllSelected,
    handleSelectAll,
    handleSelectRow
}: HistoryDesktopTableProps) {
    const router = useRouter();

    return (
        <div className="table-container hidden md:block">
            <table className="crm-table">
                <thead className="crm-thead">
                    <tr>
                        <th className="crm-th w-[40px]">
                            <Checkbox
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th className="crm-th md:w-[120px]">
                            <div className="crm-th-content">
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span>ТИП</span>
                            </div>
                        </th>
                        <th className="crm-th">
                            <div className="crm-th-content">
                                <Package className="w-3.5 h-3.5" />
                                <span>ТОВАР</span>
                            </div>
                        </th>
                        <th className="crm-th">
                            <div className="crm-th-content">
                                <Building2 className="w-3.5 h-3.5" />
                                <span>СКЛАД</span>
                            </div>
                        </th>
                        <th className="crm-th text-center">
                            <div className="crm-th-content justify-center">
                                <ArrowLeftRight className="w-3.5 h-3.5" />
                                <span>ИЗМ.</span>
                            </div>
                        </th>
                        <th className="crm-th hidden xl:table-cell">
                            <div className="crm-th-content">
                                <Book className="w-3.5 h-3.5" />
                                <span>ПРИЧИНА</span>
                            </div>
                        </th>
                        <th className="crm-th hidden lg:table-cell text-right">
                            <div className="crm-th-content justify-end">
                                <User className="w-3.5 h-3.5" />
                                <span>АВТОР</span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody className="crm-tbody">
                    {currentItems.map((t) => {
                        const isIn = t.type === "in";
                        const amount = Math.abs(t.changeAmount);
                        const isSelected = selectedIds.includes(t.id);

                        return (
                            <tr
                                key={t.id}
                                className={cn(
                                    "crm-tr-clickable",
                                    isSelected && "crm-tr-selected"
                                )}
                            >
                                <td className="crm-td" onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={isSelected}
                                        onChange={() => handleSelectRow(t.id)}
                                    />
                                </td>
                                <td className="crm-td">
                                    <div className="flex items-center">
                                        <div className={cn(
                                            "w-10 h-10 rounded-[var(--radius-inner)] flex items-center justify-center shadow-sm transition-transform",
                                            t.type === "transfer"
                                                ? "bg-primary/5 text-primary border border-primary/20"
                                                : t.type === "attribute_change"
                                                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                                                    : t.type === "archive"
                                                        ? "bg-rose-50 text-rose-600 border border-rose-100"
                                                        : t.type === "restore"
                                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                            : isIn
                                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                                : "bg-rose-50 text-rose-600 border border-rose-100"
                                        )}>
                                            {t.type === "transfer" ? (
                                                <ArrowLeftRight className="w-5 h-5" />
                                            ) : t.type === "attribute_change" ? (
                                                <Book className="w-5 h-5" />
                                            ) : t.type === "archive" ? (
                                                <Clock className="w-5 h-5" />
                                            ) : t.type === "restore" ? (
                                                <Package className="w-5 h-5" />
                                            ) : isIn ? (
                                                <ArrowDownLeft className="w-5 h-5" />
                                            ) : (
                                                <ArrowUpRight className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div className="hidden xl:block ml-4">
                                            <div className="text-sm font-bold text-slate-900 leading-tight">
                                                {t.type === "transfer" ? "Перемещение" :
                                                    t.type === "attribute_change" ? "Характеристика" :
                                                        t.type === "archive" ? "Архивация" :
                                                            t.type === "restore" ? "Восстановление" :
                                                                isIn ? "Приход" : "Расход"}
                                            </div>
                                            <div className="text-xs font-bold text-slate-400 mt-0.5 whitespace-nowrap">
                                                {format(new Date(t.createdAt), "d MMM, HH:mm", { locale: ru })}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="crm-td">
                                    {t.item ? (
                                        <button
                                            type="button"
                                            className="flex items-center gap-3 cursor-pointer group/item hover:opacity-80 transition-all p-0 border-none bg-transparent text-left"
                                            onClick={() => router.push(`/dashboard/warehouse/items/${t.item?.id}`)}
                                        >
                                            <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover/item:bg-primary/5 group-hover/item:text-primary transition-colors">
                                                <Package className="w-4 h-4" />
                                            </div>
                                            <div className="max-w-[150px] lg:max-w-[220px] xl:max-w-[300px]">
                                                <div className="text-sm font-bold text-slate-900 truncate group-hover/item:text-primary transition-colors">{t.item.name}</div>
                                                {t.item.sku && (
                                                    <div className="text-xs font-bold text-slate-400 mt-0.5 font-mono">Арт.: {t.item.sku}</div>
                                                )}
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-3 py-1">
                                            <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                                                <Book className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 ">Характеристики</div>
                                                <div className="text-xs font-bold text-slate-400 mt-0.5">
                                                    {t.reason?.includes("категория") ? "Категории" :
                                                        t.reason?.includes("атрибут") ? "Атрибуты" : "Система"}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td className="crm-td">
                                    {t.type === "transfer" ? (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 max-w-[150px]" title={t.fromStorageLocation?.name || "???"}>
                                                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span className="font-medium truncate">{t.fromStorageLocation?.name || "Неизвестно"}</span>
                                            </div>
                                            <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                                            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 max-w-[150px]" title={t.storageLocation?.name || "???"}>
                                                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span className="font-medium truncate">{t.storageLocation?.name || "Неизвестно"}</span>
                                            </div>
                                        </div>
                                    ) : t.storageLocation ? (
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-[var(--radius-inner)] border border-slate-200 w-fit">
                                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-xs font-medium text-slate-700">{t.storageLocation.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400">Склад не указан</span>
                                    )}
                                </td>
                                <td className="crm-td text-center">
                                    {t.type === "attribute_change" ? (
                                        <Badge className="bg-amber-100/50 text-amber-700 border border-amber-200/50 px-3 py-1 font-semibold text-xs shadow-none hover:bg-amber-100/70">
                                            {t.reason?.includes("Создана") || t.reason?.includes("Добавлен") ? "Создание" :
                                                t.reason?.includes("Удален") ? "Удаление" : "Изменение"}
                                        </Badge>
                                    ) : (
                                        <Badge className={cn(
                                            "px-3 py-1 font-semibold text-xs border-none shadow-none",
                                            t.type === "transfer"
                                                ? "bg-primary/5 text-primary hover:bg-primary/10"
                                                : isIn
                                                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-50"
                                                    : "bg-rose-50 text-rose-600 hover:bg-rose-50"
                                        )}>
                                            {t.type === "transfer" ? "" : isIn ? "+" : "-"}{amount} {formatUnit(t.item?.unit || "")}
                                        </Badge>
                                    )}
                                </td>
                                <td className="crm-td hidden xl:table-cell">
                                    <div className="flex items-start gap-2">
                                        <span className="text-sm font-medium text-slate-500 leading-snug">
                                            {(() => {
                                                const transferMatch = t.reason?.match(/(?:Перемещение|Получено) со склада "(.+)" на "(.+)"(?:\. Причина: (.+))?/);

                                                if (transferMatch) {
                                                    const from = transferMatch[1];
                                                    const to = transferMatch[2];
                                                    const comment = transferMatch[3];

                                                    return (
                                                        <span className="flex flex-col gap-0.5">
                                                            <span className="font-bold text-slate-700 flex items-center gap-1.5 text-left">
                                                                {from} <ArrowRight className="w-3 h-3 text-slate-400" /> {to}
                                                            </span>
                                                            {comment && <span className="text-slate-500 font-normal text-left">{comment}</span>}
                                                        </span>
                                                    );
                                                }

                                                return t.reason || "Без описания";
                                            })()}
                                        </span>
                                    </div>
                                </td>
                                <td className="crm-td hidden lg:table-cell text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-slate-900 whitespace-nowrap">{t.creator?.name || "Система"}</div>
                                        <div className="text-xs font-bold text-slate-400 mt-0.5 whitespace-nowrap">
                                            {t.creator?.role?.name || (t.creator ? "Оператор" : "Система")}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
