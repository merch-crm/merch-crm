"use client";

import { useState, useRef, useEffect } from "react";
import {
    ChevronDown,
    Sparkles,
    Paintbrush,
    Settings2,
    CheckCircle2,
    Truck,
    XCircle,
    MessageSquare
} from "lucide-react";
import { updateOrderStatus } from "../actions";
import { useToast } from "@/components/ui/toast";

const statuses = [
    { id: "new", label: "Новый", icon: Sparkles, color: "text-blue-500", bgColor: "bg-blue-500", lightBg: "bg-blue-50" },
    { id: "design", label: "Дизайн", icon: Paintbrush, color: "text-purple-500", bgColor: "bg-purple-500", lightBg: "bg-purple-50" },
    { id: "production", label: "Производство", icon: Settings2, color: "text-amber-500", bgColor: "bg-amber-500", lightBg: "bg-amber-50" },
    { id: "done", label: "Готов", icon: CheckCircle2, color: "text-emerald-500", bgColor: "bg-emerald-500", lightBg: "bg-emerald-50" },
    { id: "shipped", label: "Отправлен", icon: Truck, color: "text-slate-600", bgColor: "bg-slate-600", lightBg: "bg-slate-100" },
    { id: "cancelled", label: "Отменен", icon: XCircle, color: "text-rose-500", bgColor: "bg-rose-500", lightBg: "bg-rose-50" },
];

export default function StatusSelect({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
    const [statusId, setStatusId] = useState(currentStatus);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const { toast } = useToast();
    const containerRef = useRef<HTMLDivElement>(null);

    const activeStatus = statuses.find(s => s.id === statusId) || statuses[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleStatusChange = async (newStatusId: string, reason?: string) => {
        if (newStatusId === statusId && !reason) {
            setIsOpen(false);
            return;
        }

        if (newStatusId === "cancelled" && !reason) {
            setShowCancelDialog(true);
            setIsOpen(false);
            return;
        }

        setLoading(true);
        setStatusId(newStatusId);
        setIsOpen(false);
        setShowCancelDialog(false);

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = await updateOrderStatus(orderId, newStatusId as any, reason);
            if (res.error) {
                toast(res.error, "error");
                setStatusId(currentStatus); // Rollback local state
            } else {
                toast(`Статус заказа успешно изменен на "${statuses.find(s => s.id === newStatusId)?.label}"`, "success", { mutation: true });
            }
        } catch (error) {
            console.error("Failed to update status", error);
            toast("Ошибка соединения с сервером", "error");
            setStatusId(currentStatus);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger Button */}
            <button
                onClick={() => !loading && setIsOpen(!isOpen)}
                disabled={loading}
                className={`
                    w-full flex items-center justify-between px-4 py-3.5 
                    ${activeStatus.lightBg} border border-slate-200 rounded-2xl shadow-sm
                    hover:border-indigo-300 hover:shadow-md transition-all duration-200
                    active:scale-[0.98] group relative overflow-hidden
                    ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                `}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${activeStatus.bgColor} shadow-[0_0_8px_rgba(0,0,0,0.1)] group-hover:scale-125 transition-transform animate-pulse`} />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-[0.15em]">
                        {activeStatus.label}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <activeStatus.icon className={`w-4 h-4 ${activeStatus.color} opacity-80`} />
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-20" />

                    {statuses.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => handleStatusChange(s.id)}
                            className={`
                                w-full flex items-center justify-between px-5 py-3 
                                hover:bg-slate-50 transition-all group/item
                                ${s.id === statusId ? 'bg-indigo-50/50' : ''}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${s.bgColor} ${s.id === statusId ? 'scale-125' : 'opacity-40 group-hover/item:opacity-100'} transition-all`} />
                                <span className={`text-[13px] font-bold ${s.id === statusId ? 'text-indigo-600' : 'text-slate-600 group-hover/item:text-slate-900'} transition-colors`}>
                                    {s.label}
                                </span>
                            </div>
                            <s.icon className={`w-4 h-4 ${s.id === statusId ? s.color : 'text-slate-300 group-hover/item:text-slate-400'} transition-colors`} />
                        </button>
                    ))}
                </div>
            )}
            {/* Cancel Dialog */}
            {showCancelDialog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl p-8 border border-white animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
                            <XCircle className="w-8 h-8 text-rose-500" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Отмена заказа</h3>
                        <p className="text-sm font-medium text-slate-500 mb-6">Пожалуйста, укажите причину отмены. Это поле обязательно для заполнения.</p>

                        <div className="relative mb-6">
                            <div className="absolute top-4 left-4">
                                <MessageSquare className="w-5 h-5 text-slate-400" />
                            </div>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Напишите причину..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none resize-none h-32"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowCancelDialog(false)}
                                className="h-12 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-50 transition-colors uppercase tracking-widest"
                            >
                                Назад
                            </button>
                            <button
                                disabled={!cancelReason.trim() || loading}
                                onClick={() => handleStatusChange("cancelled", cancelReason)}
                                className="h-12 bg-rose-500 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {loading ? "Отмена..." : "Отменить заказ"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
