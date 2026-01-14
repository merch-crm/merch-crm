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
    ChevronDown,
    Printer,
    FileDown,
    UserPlus,
    Clock
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
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-12 duration-500 ease-out">
            <div className="bg-white/80 backdrop-blur-2xl px-2 py-2 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 flex items-center gap-1 min-w-[500px]">

                {/* Selection Badge Section */}
                <div className="flex items-center gap-4 pl-4 pr-6 border-r border-slate-100">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-lg text-white shadow-lg shadow-indigo-200 rotate-[-4deg]">
                            {selectedIds.length}
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">Выбрано</span>
                        <span className="text-sm font-bold text-slate-900">заказов</span>
                    </div>
                </div>

                {/* Primary Actions Group */}
                <div className="flex items-center gap-1 px-3">
                    {/* Status Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="group flex items-center gap-2.5 px-4 py-3 text-[13px] font-bold text-slate-700 hover:bg-slate-50 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                                disabled={isProcessing}
                            >
                                <CheckCircle2 className="w-5 h-5 text-indigo-500 transition-transform group-hover:scale-110" />
                                Статус
                                <ChevronDown className="w-3.5 h-3.5 text-slate-300 transition-transform group-hover:translate-y-0.5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="top" align="start" sideOffset={20} className="w-64 bg-white/95 backdrop-blur-xl rounded-[1.5rem] p-2 shadow-2xl border-white/40 border">
                            <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-3 py-2">Сменить этап работы</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <StatusMenuItem icon={Sparkles} color="text-blue-500" label="Новый" onClick={() => handleStatusUpdate("new")} />
                            <StatusMenuItem icon={Paintbrush} color="text-purple-500" label="Дизайн" onClick={() => handleStatusUpdate("design")} />
                            <StatusMenuItem icon={Settings2} color="text-amber-500" label="Производство" onClick={() => handleStatusUpdate("production")} />
                            <StatusMenuItem icon={CheckCircle2} color="text-emerald-500" label="Готов" onClick={() => handleStatusUpdate("done")} />
                            <StatusMenuItem icon={Truck} color="text-slate-500" label="Отправлен" onClick={() => handleStatusUpdate("shipped")} />
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Priority Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="group flex items-center gap-2.5 px-4 py-3 text-[13px] font-bold text-slate-700 hover:bg-slate-50 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                                disabled={isProcessing}
                            >
                                <Zap className="w-5 h-5 text-rose-500 transition-transform group-hover:scale-110" />
                                Приоритет
                                <ChevronDown className="w-3.5 h-3.5 text-slate-300 transition-transform group-hover:translate-y-0.5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="top" align="center" sideOffset={20} className="w-56 bg-white/95 backdrop-blur-xl rounded-[1.5rem] p-2 shadow-2xl border-white/40 border">
                            <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-3 py-2">Срочность заказа</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <DropdownMenuItem className="rounded-xl focus:bg-rose-50 cursor-pointer gap-3 px-3 py-3 font-bold text-[13px] text-slate-900" onClick={() => handlePriorityUpdate("high")}>
                                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-rose-600 fill-rose-600" />
                                </div>
                                Срочный
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl focus:bg-slate-50 cursor-pointer gap-3 px-3 py-3 font-bold text-[13px] text-slate-900" onClick={() => handlePriorityUpdate("normal")}>
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-slate-600" />
                                </div>
                                Обычный
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Quick Tools */}
                    <div className="h-8 w-px bg-slate-100 mx-2" />

                    <button
                        title="Печать бланков"
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active:scale-90"
                        onClick={() => alert("Печать бланков для " + selectedIds.length + " заказов")}
                    >
                        <Printer className="w-5 h-5" />
                    </button>

                    <button
                        title="Экспорт в Excel"
                        className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all active:scale-90"
                        onClick={() => alert("Экспорт данных...")}
                    >
                        <FileDown className="w-5 h-5" />
                    </button>

                    {isAdmin && (
                        <button
                            title="Удалить выбранные"
                            className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all active:scale-90"
                            onClick={handleDelete}
                            disabled={isProcessing}
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Dismiss Section */}
                <div className="pl-4 pr-1">
                    <button
                        onClick={onClear}
                        className="w-11 h-11 flex items-center justify-center rounded-[1.25rem] bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:rotate-90 active:scale-90"
                        disabled={isProcessing}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatusMenuItem({ icon: Icon, color, label, onClick }: { icon: any, color: string, label: string, onClick: () => void }) {
    return (
        <DropdownMenuItem
            className="rounded-xl focus:bg-slate-50 cursor-pointer gap-3 px-3 py-3 font-bold text-[13px] text-slate-900 group"
            onClick={onClick}
        >
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110", color.replace('text-', 'bg-').replace('-500', '-100'))}>
                <Icon className={cn("w-4 h-4", color)} />
            </div>
            {label}
        </DropdownMenuItem>
    );
}
