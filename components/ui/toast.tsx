"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning" | "destructive";

interface ToastAction {
    label: string;
    onClick: () => void;
}

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    action?: ToastAction;
    onClose: () => void;
}

export function Toast({ message, type = "info", duration = 4000, action, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timerIn = setTimeout(() => setIsVisible(true), 10);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => {
            clearTimeout(timer);
            clearTimeout(timerIn);
        };
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        error: <AlertCircle className="w-5 h-5 text-rose-500" />,
        destructive: <AlertCircle className="w-5 h-5 text-rose-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        info: <Info className="w-5 h-5 text-primary" />,
    };

    const styles = {
        success: "border-emerald-500/20 bg-white text-emerald-900 shadow-[0_8px_30px_rgb(16,185,129,0.1)]",
        error: "border-rose-500/20 bg-white text-rose-900 shadow-[0_8px_30px_rgb(244,63,94,0.1)]",
        destructive: "border-rose-500/20 bg-white text-rose-900 shadow-[0_8px_30px_rgb(244,63,94,0.1)]",
        warning: "border-amber-500/20 bg-white text-amber-900 shadow-[0_8px_30px_rgb(245,158,11,0.1)]",
        info: "border-primary/20 bg-white text-primary shadow-[0_8px_30px_rgb(93,0,255,0.1)]",
    };

    return (
        <div
            className={cn(
                "fixed left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 ease-out flex items-center gap-3 px-6 py-4 rounded-[2rem] border shadow-2xl",
                "bottom-8 top-auto",
                styles[type],
                isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95"
            )}
        >
            <div className="flex-shrink-0">{icons[type]}</div>
            <p className="text-sm font-bold tracking-tight whitespace-nowrap">{message}</p>

            {
                action && (
                    <button
                        onClick={() => {
                            action.onClick();
                            setIsVisible(false);
                            setTimeout(onClose, 300);
                        }}
                        className="ml-4 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[10px] font-bold  tracking-normal text-slate-900 transition-all flex items-center gap-1.5"
                    >
                        <Undo2 className="w-3 h-3" />
                        {action.label}
                    </button>
                )
            }

            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="ml-2 text-slate-400 hover:text-slate-900 transition-colors p-1"
            >
                <X className="w-4 h-4" />
            </button>
        </div >
    );
}

interface ToastState {
    message: string;
    type: ToastType;
    id: number;
    action?: ToastAction;
}

let toastFn: (message: string, type?: ToastType, options?: { action?: ToastAction, mutation?: boolean }) => void = () => { };

const toastApi = {
    toast: (message: string, type?: ToastType, options?: { action?: ToastAction, mutation?: boolean }) => toastFn(message, type, options),
};

export function useToast() {
    return toastApi;
}

import { triggerMutation } from "../global-undo";

export function ToastContainer() {
    const [activeToast, setActiveToast] = useState<ToastState | null>(null);

    useEffect(() => {
        toastFn = (message: string, type: ToastType = "info", options = {}) => {
            setActiveToast({ message, type, id: Date.now(), action: options.action });

            if (options.mutation) {
                triggerMutation();
            }

            // Play sound for success and warning
            if (type === "success" || type === "warning") {
                const audio = new Audio("/sounds/notification.mp3");
                audio.play().catch(() => {
                    // Ignore errors as browsers might block autoplay
                });
            }
        };
    }, []);

    if (!activeToast) return null;

    const handleClose = () => setActiveToast(null);

    return (
        <Toast
            key={activeToast.id}
            message={activeToast.message}
            type={activeToast.type}
            action={activeToast.action}
            onClose={handleClose}
        />
    );
}
