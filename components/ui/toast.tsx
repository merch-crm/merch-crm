"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
}

export function Toast({ message, type = "info", duration = 4000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        error: <AlertCircle className="w-5 h-5 text-rose-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        info: <Info className="w-5 h-5 text-indigo-500" />,
    };

    const styles = {
        success: "border-emerald-100 bg-emerald-50/50 text-emerald-900",
        error: "border-rose-100 bg-rose-50/50 text-rose-900",
        warning: "border-amber-100 bg-amber-50/50 text-amber-900",
        info: "border-indigo-100 bg-indigo-50/50 text-indigo-900",
    };

    return (
        <div
            className={cn(
                "fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 ease-out flex items-center gap-3 px-6 py-4 rounded-[2rem] border backdrop-blur-md shadow-2xl",
                styles[type],
                isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95"
            )}
        >
            <div className="flex-shrink-0">{icons[type]}</div>
            <p className="text-sm font-bold tracking-tight whitespace-nowrap">{message}</p>
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="ml-2 text-slate-400 hover:text-slate-900 transition-colors p-1"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

let toastFn: (message: string, type?: ToastType) => void = () => { };

export function useToast() {
    return {
        toast: (message: string, type?: ToastType) => toastFn(message, type),
    };
}

export function ToastContainer() {
    const [activeToast, setActiveToast] = useState<{ message: string; type: ToastType; id: number } | null>(null);

    useEffect(() => {
        toastFn = (message: string, type: ToastType = "info") => {
            setActiveToast({ message, type, id: Date.now() });
        };
    }, []);

    if (!activeToast) return null;

    return (
        <Toast
            key={activeToast.id}
            message={activeToast.message}
            type={activeToast.type}
            onClose={() => setActiveToast(null)}
        />
    );
}
