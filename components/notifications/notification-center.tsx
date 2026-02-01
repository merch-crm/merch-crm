"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Info, AlertCircle, CheckCircle2, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { markAsRead, markAllAsRead } from "./actions";
import { useRouter } from "next/navigation";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "success" | "error" | "transfer";
    isRead: boolean;
    createdAt: Date;
}

interface NotificationCenterProps {
    notifications: Notification[];
}

const typeConfig = {
    info: { icon: Info, color: "text-blue-500", bg: "bg-blue-50" },
    warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
    success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
    error: { icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" },
    transfer: { icon: ArrowRightLeft, color: "text-indigo-500", bg: "bg-indigo-50" },
};

export function NotificationCenter({ notifications }: NotificationCenterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        setLoading(id);
        await markAsRead(id);
        setLoading(null);
        router.refresh();
    };

    const handleMarkAllAsRead = async () => {
        setLoading("all");
        await markAllAsRead();
        setLoading(null);
        router.refresh();
    };

    return (
        <div className="relative" ref={containerRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative p-2.5 rounded-xl transition-all group",
                    isOpen ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-primary hover:bg-primary/10"
                )}
            >
                <Bell className="w-[22px] h-[22px] transition-transform duration-300 group-hover:scale-110" />
                {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white animate-in fade-in zoom-in duration-300" />
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-[380px] bg-white/90 backdrop-blur-xl border border-white/50 rounded-[18px] shadow-crm-xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Уведомления</h3>
                            <p className="text-xs text-slate-400 mt-0.5">{unreadCount} непрочитанных</p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={loading === "all"}
                                className="text-xs font-bold text-#5d00ff hover:text-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {loading === "all" ? "..." : "Прочитать все"}
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                                <p className="text-sm text-slate-400">Нет уведомлений</p>
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const config = typeConfig[notification.type];
                                const Icon = config.icon;

                                return (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "p-4 border-b border-slate-200 hover:bg-slate-50/50 transition-all group",
                                            !notification.isRead && "bg-indigo-50/30"
                                        )}
                                    >
                                        <div className="flex gap-3">
                                            <div className={cn("w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0", config.bg)}>
                                                <Icon className={cn("w-4 h-4", config.color)} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className="text-sm font-bold text-slate-900 leading-tight">{notification.title}</h4>
                                                    {!notification.isRead && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            disabled={loading === notification.id}
                                                            className="shrink-0 p-1 rounded-[6px] hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100"
                                                            title="Отметить как прочитанное"
                                                        >
                                                            <Check className="w-3.5 h-3.5 text-slate-400" />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-600 leading-relaxed mb-2">{notification.message}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">
                                                    {new Date(notification.createdAt).toLocaleString('ru-RU', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
