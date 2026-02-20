"use client";

import { useState, useEffect } from "react";
import { Undo2, X } from "lucide-react";
import { undoLastAction } from "@/app/(main)/dashboard/undo-actions";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GlobalUndo() {
    const router = useRouter();
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
            router.refresh();
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
                    <span className="text-xs font-bold  text-slate-500">Последнее действие</span>
                    <span className="text-xs font-bold">Выполнено успешно</span>
                </div>
            </div>

            <div className="w-[1px] h-8 bg-slate-800" />

            <Button
                onClick={handleUndo}
                className="bg-white text-slate-900 hover:bg-slate-100 h-10 px-6 rounded-[18px] text-[11px] font-bold"
            >
                {isUndoing ? "Отмена..." : "Отменить"}
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsVisible(false)}
                className="text-slate-500 hover:text-white hover:bg-white/10 h-8 w-8 rounded-full"
            >
                <X className="w-4 h-4" />
            </Button>
        </div>
    );
}

// Helper to trigger the global undo
export function triggerMutation() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("crm:mutation"));
    }
}
