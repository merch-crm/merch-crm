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
import { updateOrderStatus } from "./actions/status.actions";;
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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

        const res = await updateOrderStatus(orderId, newId);
        if (!res.success) {
            setCurrentStatus(prevStatus);
        }
        setLoading(false);
    };

    return (
        <div role="button" tabIndex={0} className="relative inline-block" ref={containerRef} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} onClick={(e) => e.stopPropagation()}>
            <div role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} onClick={() => !loading && setIsOpen(!isOpen)}
                className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold  cursor-pointer transition-all hover:scale-105 active:scale-95 select-none",
                    activeItem.lightBg,
                    activeItem.color,
                    loading && "opacity-50 cursor-wait"
                )}
            >
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", activeItem.color.replace("text-", "bg-"))} />
                {activeItem.label}
                <ChevronDown className={cn("w-3 h-3 ml-0.5 transition-transform", isOpen && "rotate-180")} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scaleY: 0.8, y: -10, originY: 0 }}
                        animate={{ opacity: 1, scaleY: 1, y: 0 }}
                        exit={{ opacity: 0, scaleY: 0.8, y: -10 }}
                        transition={{
                            duration: 0.3,
                            ease: [0.23, 1, 0.32, 1],
                            opacity: { duration: 0.2 }
                        }}
                        className="absolute top-[calc(100%+8px)] left-0 min-w-[170px] bg-white border border-slate-200 rounded-[22px] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.25),0_4px_16px_-4px_rgba(0,0,0,0.1)] z-[70] p-1.5 overflow-hidden ring-1 ring-slate-900/5"
                    >
                        {statuses.map((s) => (
                            <Button
                                key={s.id}
                                variant="ghost"
                                onClick={() => handleChange(s.id)}
                                className={cn(
                                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[16px] transition-all text-left group h-auto justify-start",
                                    s.id === currentStatus ? "bg-primary/5 text-primary shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <div className={cn("w-2 h-2 rounded-full ring-2 ring-white shadow-sm", s.dot)} />
                                <span className="text-[11px] font-bold flex-1">
                                    {s.label}
                                </span>
                                {s.id === currentStatus && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                            </Button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
