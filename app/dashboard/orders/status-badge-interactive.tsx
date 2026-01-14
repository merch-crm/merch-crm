"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
    ChevronDown,
    Sparkles,
    Paintbrush,
    Settings2,
    CheckCircle2,
    Truck
} from "lucide-react";
import { updateOrderStatus } from "./actions";

const statuses = [
    { id: "new", label: "Новый", icon: Sparkles, color: "text-blue-600", lightBg: "bg-blue-50 border-blue-100", dot: "bg-blue-500" },
    { id: "design", label: "Дизайн", icon: Paintbrush, color: "text-purple-600", lightBg: "bg-purple-50 border-purple-100", dot: "bg-purple-500" },
    { id: "production", label: "Производство", icon: Settings2, color: "text-amber-600", lightBg: "bg-amber-50 border-amber-100", dot: "bg-amber-500" },
    { id: "done", label: "Готов", icon: CheckCircle2, color: "text-emerald-600", lightBg: "bg-emerald-50 border-emerald-100", dot: "bg-emerald-500" },
    { id: "shipped", label: "Отправлен", icon: Truck, color: "text-slate-600", lightBg: "bg-slate-100 border-slate-200", dot: "bg-slate-600" },
];

export default function StatusBadgeInteractive({ orderId, status }: { orderId: string, status: string }) {
    const [currentStatus, setCurrentStatus] = useState(status);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const activeItem = statuses.find(s => s.id === currentStatus) || statuses[0];
    const Icon = activeItem.icon;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = async (newId: string) => {
        if (newId === currentStatus) {
            setIsOpen(false);
            return;
        }

        setLoading(true);
        const prevStatus = currentStatus;
        setCurrentStatus(newId);
        setIsOpen(false);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await updateOrderStatus(orderId, newId as any);
        if (res.error) {
            setCurrentStatus(prevStatus);
        }
        setLoading(false);
    };

    return (
        <div className="relative inline-block" ref={containerRef} onClick={(e) => e.stopPropagation()}>
            <Badge
                variant="outline"
                onClick={() => !loading && setIsOpen(!isOpen)}
                className={`
                    rounded-md font-bold text-[10px] uppercase tracking-wider gap-1.5 px-2 py-0.5 cursor-pointer
                    transition-all hover:shadow-sm active:scale-95 select-none
                    ${activeItem.lightBg} ${activeItem.color}
                    ${loading ? 'opacity-50' : 'opacity-100'}
                `}
            >
                <Icon className="w-3 h-3" />
                {activeItem.label}
                <ChevronDown className={`w-2.5 h-2.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Badge>

            {isOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 min-w-[140px] bg-white border border-slate-100 rounded-lg shadow-xl z-[70] py-1 animate-in fade-in slide-in-from-top-1 duration-200 overflow-hidden">
                    {statuses.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => handleChange(s.id)}
                            className={`
                                w-full flex items-center gap-2 px-3 py-2 
                                hover:bg-slate-50 transition-all text-left
                                ${s.id === currentStatus ? 'bg-indigo-50/50' : ''}
                            `}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${s.id === currentStatus ? 'text-indigo-600' : 'text-slate-600'}`}>
                                {s.label}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
