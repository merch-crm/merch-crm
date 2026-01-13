"use client";

import { useState } from "react";
import {
    Trash2,
    X,
    CheckCircle2,
    Sparkles,
    Paintbrush,
    Settings2,
    Truck,
    Zap,
    Circle,
    ChevronDown
} from "lucide-react";
import {
    bulkUpdateOrderStatus,
    bulkUpdateOrderPriority,
    bulkDeleteOrders
} from "./actions";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BulkActionsPanelProps {
    selectedIds: string[];
    onClear: () => void;
    isAdmin: boolean;
}

export function BulkActionsPanel({ selectedIds, onClear, isAdmin }: BulkActionsPanelProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    if (selectedIds.length === 0) return null;

    const handleStatusUpdate = async (status: string) => {
        setIsProcessing(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await bulkUpdateOrderStatus(selectedIds, status as any);
        if (res.success) {
            onClear();
        }
        setIsProcessing(false);
    };

    const handlePriorityUpdate = async (priority: string) => {
        setIsProcessing(true);
        const res = await bulkUpdateOrderPriority(selectedIds, priority);
        if (res.success) {
            onClear();
        }
        setIsProcessing(false);
    };

    const handleDelete = async () => {
        if (!confirm(`Вы уверены, что хотите удалить ${selectedIds.length} заказов?`)) return;
        setIsProcessing(true);
        const res = await bulkDeleteOrders(selectedIds);
        if (res.success) {
            onClear();
        }
        setIsProcessing(false);
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-3 flex items-center gap-4">
                    {/* Counter Section */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center font-bold text-sm text-white">
                            {selectedIds.length}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Выбрано</span>
                            <span className="text-[10px] text-slate-500">заказов</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-8 w-px bg-gray-200" />

                    {/* Actions Section */}
                    <div className="flex items-center gap-2">
                        {/* Status Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
                                    disabled={isProcessing}
                                >
                                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                                    Статус
                                    <ChevronDown className="w-3 h-3 text-slate-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" sideOffset={8} align="center" className="w-56 bg-white rounded-xl p-1 shadow-md border-gray-200">
                                <DropdownMenuLabel className="text-[10px] uppercase font-medium tracking-wider text-muted-foreground px-2 py-1.5">Изменить статус</DropdownMenuLabel>
                                <DropdownMenuItem className="rounded-md focus:bg-gray-50 cursor-pointer gap-2 font-medium text-sm" onClick={() => handleStatusUpdate("new")}>
                                    <Sparkles className="w-4 h-4 text-blue-500" /> Новый
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-md focus:bg-gray-50 cursor-pointer gap-2 font-medium text-sm" onClick={() => handleStatusUpdate("design")}>
                                    <Paintbrush className="w-4 h-4 text-purple-500" /> Дизайн
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-md focus:bg-gray-50 cursor-pointer gap-2 font-medium text-sm" onClick={() => handleStatusUpdate("production")}>
                                    <Settings2 className="w-4 h-4 text-amber-500" /> Производство
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-md focus:bg-gray-50 cursor-pointer gap-2 font-medium text-sm" onClick={() => handleStatusUpdate("done")}>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Готов
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-md focus:bg-gray-50 cursor-pointer gap-2 font-medium text-sm" onClick={() => handleStatusUpdate("shipped")}>
                                    <Truck className="w-4 h-4 text-slate-500" /> Отправлен
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Priority Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
                                    disabled={isProcessing}
                                >
                                    <Zap className="w-4 h-4 text-rose-500" />
                                    Приоритет
                                    <ChevronDown className="w-3 h-3 text-slate-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" sideOffset={8} align="center" className="w-56 bg-white rounded-xl p-1 shadow-md border-gray-200">
                                <DropdownMenuLabel className="text-[10px] uppercase font-medium tracking-wider text-muted-foreground px-2 py-1.5">Изменить приоритет</DropdownMenuLabel>
                                <DropdownMenuItem className="rounded-md focus:bg-gray-50 cursor-pointer gap-2 font-medium text-sm" onClick={() => handlePriorityUpdate("high")}>
                                    <Zap className="w-4 h-4 text-rose-500 fill-rose-500" /> Срочный
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-md focus:bg-gray-50 cursor-pointer gap-2 font-medium text-sm" onClick={() => handlePriorityUpdate("normal")}>
                                    <Circle className="w-4 h-4 text-slate-400 fill-slate-400" /> Обычный
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Delete Button - Admin Only */}
                        {isAdmin && (
                            <>
                                <div className="h-8 w-px bg-gray-200" />
                                <button
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50"
                                    onClick={handleDelete}
                                    disabled={isProcessing}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Удалить
                                </button>
                            </>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="h-8 w-px bg-gray-200" />

                    {/* Close Button */}
                    <button
                        onClick={onClear}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-50 text-slate-400 hover:text-slate-900 transition-colors"
                        disabled={isProcessing}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
