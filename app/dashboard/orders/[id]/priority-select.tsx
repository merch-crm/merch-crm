"use client";

import { useState, useRef, useEffect } from "react";
import {
    ChevronDown,
    Zap,
    Circle
} from "lucide-react";
import { updateOrderPriority } from "../actions";

const priorities = [
    { id: "normal", label: "Обычный", icon: Circle, color: "text-slate-400", bgColor: "bg-slate-400", lightBg: "bg-slate-50" },
    { id: "high", label: "Срочный", icon: Zap, color: "text-rose-500", bgColor: "bg-rose-500", lightBg: "bg-rose-50" },
];

export default function PrioritySelect({ orderId, currentPriority }: { orderId: string, currentPriority: string }) {
    const [priorityId, setPriorityId] = useState(currentPriority);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const activePriority = priorities.find(p => p.id === priorityId) || priorities[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePriorityChange = async (newPriorityId: string) => {
        if (newPriorityId === priorityId) {
            setIsOpen(false);
            return;
        }

        setLoading(true);
        setPriorityId(newPriorityId);
        setIsOpen(false);

        try {
            await updateOrderPriority(orderId, newPriorityId);
        } catch (error) {
            console.error("Failed to update priority", error);
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
                    ${activePriority.lightBg} border border-slate-200 rounded-2xl shadow-sm
                    hover:border-indigo-300 hover:shadow-md transition-all duration-200
                    active:scale-[0.98] group relative overflow-hidden
                    ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                `}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${activePriority.bgColor} shadow-[0_0_8px_rgba(0,0,0,0.1)] group-hover:scale-125 transition-transform ${priorityId === 'high' ? 'animate-pulse' : ''}`} />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-[0.15em]">
                        {activePriority.label}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <activePriority.icon className={`w-4 h-4 ${activePriority.color} opacity-80`} />
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-20" />

                    {priorities.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => handlePriorityChange(p.id)}
                            className={`
                                w-full flex items-center justify-between px-5 py-3 
                                hover:bg-slate-50 transition-all group/item
                                ${p.id === priorityId ? 'bg-indigo-50/50' : ''}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${p.bgColor} ${p.id === priorityId ? 'scale-125' : 'opacity-40 group-hover/item:opacity-100'} transition-all`} />
                                <span className={`text-[13px] font-bold ${p.id === priorityId ? 'text-indigo-600' : 'text-slate-600 group-hover/item:text-slate-900'} transition-colors`}>
                                    {p.label}
                                </span>
                            </div>
                            <p.icon className={`w-4 h-4 ${p.id === priorityId ? p.color : 'text-slate-300 group-hover/item:text-slate-400'} transition-colors`} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
