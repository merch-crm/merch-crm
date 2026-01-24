"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Zap, Circle, ChevronDown } from "lucide-react";
import { updateOrderField } from "./actions";

const priorities = [
    { id: "normal", label: "Обычный", icon: Circle, color: "text-slate-500", lightBg: "bg-slate-50 border-slate-100", dot: "bg-slate-400" },
    { id: "high", label: "Срочный", icon: Zap, color: "text-rose-600", lightBg: "bg-rose-50 border-rose-100", dot: "bg-rose-500" },
];

export default function PriorityBadgeInteractive({ orderId, priority }: { orderId: string, priority: string }) {
    const [currentPriority, setCurrentPriority] = useState(priority);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const activeItem = priorities.find(p => p.id === currentPriority) || priorities[0];
    const isHigh = currentPriority === "high";

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
        if (newId === currentPriority) {
            setIsOpen(false);
            return;
        }

        setLoading(true);
        const prevPriority = currentPriority;
        setCurrentPriority(newId);
        setIsOpen(false);

        const res = await updateOrderField(orderId, "priority", newId);
        if (res.error) {
            setCurrentPriority(prevPriority);
        }
        setLoading(false);
    };

    return (
        <div className="relative inline-block" ref={containerRef} onClick={(e) => e.stopPropagation()}>
            <Badge
                variant="outline"
                onClick={() => !loading && setIsOpen(!isOpen)}
                className={`
                    rounded-md font-bold text-[10px]  tracking-wider gap-1.5 px-2 py-0.5 cursor-pointer
                    transition-all hover:shadow-sm active:scale-95 select-none
                    ${activeItem.lightBg} ${activeItem.color}
                    ${loading ? 'opacity-50' : 'opacity-100'}
                `}
            >
                {isHigh ? (
                    <Zap className="w-3 h-3 fill-rose-600" />
                ) : (
                    <Circle className="w-2.5 h-2.5 fill-slate-400 border-none" />
                )}
                {activeItem.label}
                <ChevronDown className={`w-2.5 h-2.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Badge>

            {isOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 min-w-[120px] bg-white border border-slate-100 rounded-[18px] shadow-xl z-[70] py-1 animate-in fade-in slide-in-from-top-1 duration-200 overflow-hidden">
                    {priorities.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => handleChange(p.id)}
                            className={`
                                w-full flex items-center gap-2 px-3 py-2 
                                hover:bg-slate-50 transition-all text-left
                                ${p.id === currentPriority ? 'bg-primary/5' : ''}
                            `}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                            <span className={`text-[11px] font-bold  tracking-wider ${p.id === currentPriority ? 'text-primary' : 'text-slate-600'}`}>
                                {p.label}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
