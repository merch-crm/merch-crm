"use client";

import { useState, useRef, useEffect } from "react";
import {
    ChevronDown,
    Sparkles,
    Paintbrush,
    Settings2,
    CheckCircle2,
    Truck
} from "lucide-react";
import { updateOrderStatus } from "../actions";

const statuses = [
    { id: "new", label: "Новый", icon: Sparkles, color: "text-blue-500", bgColor: "bg-blue-500", lightBg: "bg-blue-50" },
    { id: "design", label: "Дизайн", icon: Paintbrush, color: "text-purple-500", bgColor: "bg-purple-500", lightBg: "bg-purple-50" },
    { id: "production", label: "Производство", icon: Settings2, color: "text-amber-500", bgColor: "bg-amber-500", lightBg: "bg-amber-50" },
    { id: "done", label: "Готов", icon: CheckCircle2, color: "text-emerald-500", bgColor: "bg-emerald-500", lightBg: "bg-emerald-50" },
    { id: "shipped", label: "Отправлен", icon: Truck, color: "text-slate-600", bgColor: "bg-slate-600", lightBg: "bg-slate-100" },
];

export default function StatusSelect({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
    const [statusId, setStatusId] = useState(currentStatus);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
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

    const handleStatusChange = async (newStatusId: string) => {
        if (newStatusId === statusId) {
            setIsOpen(false);
            return;
        }

        setLoading(true);
        setStatusId(newStatusId);
        setIsOpen(false);

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await updateOrderStatus(orderId, newStatusId as any);
        } catch (error) {
            console.error("Failed to update status", error);
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
        </div>
    );
}
