"use client";

import { useState, useEffect } from "react";
import { Undo2, X } from "lucide-react";
import { undoLastAction } from "@/app/dashboard/undo-actions";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function GlobalUndo() {
    const [isVisible, setIsVisible] = useState(false);
    const [isUndoing, setIsUndoing] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Listen for mutations. In a real app, you'd use a more robust way, 
        // but since we want "global", we can listen for successful mutation toasts or custom events.
        // For this task, we'll listen for a custom event 'crm:mutation'
        const handleMutation = () => {
            setIsVisible(true);
            const timer = setTimeout(() => setIsVisible(false), 8000); // Show for 8 seconds
            return () => clearTimeout(timer);
        };

        window.addEventListener("crm:mutation", handleMutation);
        return () => window.removeEventListener("crm:mutation", handleMutation);
    }, []);

    const handleUndo = async () => {
        setIsUndoing(true);
        const res = await undoLastAction();
        setIsUndoing(false);
        setIsVisible(false);

        if (res.success) {
            toast("Действие отменено", "success");
            // Optional: trigger a page refresh if needed, but undoLastAction should handle data
            window.location.reload();
        } else {
            toast(res.error || "Не удалось отменить", "error");
        }
    };

    if (!isVisible) return null;

    return (
        <div className={cn(
            "fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 bg-slate-900 text-white rounded-[24px] shadow-2xl z-50 animate-in slide-in-from-bottom-5 duration-500",
            isUndoing && "opacity-50 pointer-events-none"
        )}>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                    <Undo2 className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Последнее действие</span>
                    <span className="text-xs font-bold">Выполнено успешно</span>
                </div>
            </div>

            <div className="w-[1px] h-8 bg-slate-800" />

            <button
                onClick={handleUndo}
                className="h-10 px-6 rounded-xl bg-white text-slate-900 text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
            >
                {isUndoing ? "Отмена..." : "Отменить"}
            </button>

            <button
                onClick={() => setIsVisible(false)}
                className="p-2 text-slate-500 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// Helper to trigger the global undo
export function triggerMutation() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("crm:mutation"));
    }
}
