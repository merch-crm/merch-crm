"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Info, AlertCircle, CheckCircle2, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { markAsRead, markAllAsRead } from "./actions";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { formatDate } from "@/lib/formatters";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "success" | "error" | "transfer";
    isRead: boolean;
    createdAt: string | Date;
}

interface NotificationCenterProps {
    notifications: Notification[];
    branding?: { dateFormat?: string; timezone?: string;[key: string]: any };
}

const typeConfig = {
    info: { icon: Info, color: "text-blue-500", bg: "bg-blue-50" },
    warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
    success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
    error: { icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" },
    transfer: { icon: ArrowRightLeft, color: "text-indigo-500", bg: "bg-indigo-50" },
};

export function NotificationCenter({ notifications, branding }: NotificationCenterProps) {
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
                    "relative p-3 rounded-2xl transition-all duration-300 group",
                    isOpen ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-slate-400 hover:text-primary hover:bg-white hover:shadow-md hover:shadow-slate-200/50"
                )}
            >
                <Bell className={cn("w-6 h-6 transition-transform duration-500", isOpen ? "rotate-12" : "group-hover:scale-110")} />
                {unreadCount > 0 && (
                    <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute top-[calc(100%+16px)] -right-16 sm:right-0 w-[calc(100vw-32px)] sm:w-[420px] bg-white rounded-[28px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] ring-1 ring-slate-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 origin-top-right">
                    {/* Header */}
                    <div className="p-8 pb-6 flex items-center justify-between bg-white z-10 relative">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-normal">Уведомления</h3>
                            <p className="text-slate-400 text-[10px] font-bold tracking-normal mt-1 uppercase">
                                {unreadCount > 0
                                    ? `${unreadCount} непрочитанных сообщений`
                                    : "Все уведомления прочитаны"}
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={loading === "all"}
                                className="h-9 px-4 rounded-[var(--radius-inner)] bg-primary/5 text-primary text-[10px] font-bold hover:bg-primary/10 transition-colors disabled:opacity-50 uppercase tracking-normal"
                            >
                                {loading === "all" ? <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" /> : "Прочитать все"}
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[450px] overflow-y-auto custom-scrollbar px-2 pb-2">
                        {notifications.length === 0 ? (
                            <div className="py-16 text-center flex flex-col items-center justify-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <Bell className="w-8 h-8 text-slate-300" />
                                </div>
                                <h4 className="text-slate-900 font-bold mb-1">Нет новых уведомлений</h4>
                                <p className="text-sm text-slate-400 max-w-[200px] leading-relaxed">В данный момент у вас нет непрочитанных сообщений</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {notifications.map((notification) => {
                                    const config = typeConfig[notification.type];
                                    const Icon = config.icon;

                                    return (
                                        <div
                                            key={notification.id}
                                            className={cn(
                                                "p-4 rounded-[20px] transition-all group border border-transparent",
                                                !notification.isRead ? "bg-primary/[0.03] hover:bg-primary/[0.06]" : "hover:bg-slate-50 hover:border-slate-100"
                                            )}
                                        >
                                            <div className="flex gap-4">
                                                {/* Icon */}
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm mt-1",
                                                    config.bg
                                                )}>
                                                    <Icon className={cn("w-5 h-5", config.color)} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-1">
                                                        <h4 className={cn(
                                                            "text-[14px] leading-snug transition-colors",
                                                            !notification.isRead ? "font-extrabold text-slate-900" : "font-bold text-slate-700"
                                                        )}>
                                                            {notification.title}
                                                        </h4>
                                                        <span
                                                            className="text-[11px] font-medium text-slate-400 whitespace-nowrap pt-0.5 cursor-help"
                                                            title={formatDate(notification.createdAt, branding?.dateFormat || 'DD.MM.YYYY')}
                                                        >
                                                            {/* Show relative time if less than 24h, else showing formatted date */}
                                                            {(Date.now() - new Date(notification.createdAt).getTime()) < 24 * 60 * 60 * 1000
                                                                ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ru })
                                                                : formatDate(notification.createdAt, branding?.dateFormat || 'DD.MM.YYYY')
                                                            }
                                                        </span>
                                                    </div>

                                                    <p className="text-[13px] text-slate-500 leading-relaxed mb-3 pr-2 break-words">
                                                        {notification.message}
                                                    </p>

                                                    {!notification.isRead && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMarkAsRead(notification.id);
                                                            }}
                                                            disabled={loading === notification.id}
                                                            className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors bg-white px-2 py-1 rounded-lg border border-primary/10 hover:border-primary/20 shadow-sm"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            Отметить прочитанным
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
