"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Info, AlertCircle, CheckCircle2, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { markAsRead, markAllAsRead } from "./actions";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { formatDate } from "@/lib/formatters";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { formatCount } from "@/lib/pluralize";

import type { Notification, BrandingSettings } from "@/lib/types";

// Local interface Notification was here

// BrandingSettings is now imported from @/lib/types below

interface NotificationCenterProps {
    notifications: Notification[];
    unreadCount?: number;
    branding?: BrandingSettings;
}

const typeConfig: Record<string, { icon: React.ElementType, color: string, bg: string }> = {
    info: { icon: Info, color: "text-blue-500", bg: "bg-blue-50" },
    warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
    success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
    error: { icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" },
    transfer: { icon: ArrowRightLeft, color: "text-indigo-500", bg: "bg-indigo-50" },
    custom: { icon: Bell, color: "text-slate-500", bg: "bg-slate-50" },
    system: { icon: Bell, color: "text-slate-500", bg: "bg-slate-50" },
};

export function NotificationCenter({ notifications, unreadCount: manualUnreadCount, branding }: NotificationCenterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const isMobile = useMediaQuery("(max-width: 767px)");
    const [now, setNow] = useState<Date | null>(null);

    const unreadCount = manualUnreadCount !== undefined ? manualUnreadCount : notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        setTimeout(() => setNow(new Date()), 0);
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

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
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative h-12 w-12 rounded-2xl transition-all duration-300 group",
                    isOpen ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-slate-400 hover:text-primary hover:bg-white hover:shadow-md hover:shadow-slate-200/50"
                )}
            >
                <Bell className={cn("w-6 h-6 transition-transform duration-500", isOpen ? "rotate-12" : "group-hover:scale-110")} />
                {unreadCount > 0 && (
                    <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                )}
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Mobile Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] md:hidden"
                        />

                        {/* Dropdown/Curtain Panel */}
                        <motion.div
                            initial={isMobile
                                ? { y: "-100%", opacity: 0 }
                                : { opacity: 0, scaleY: 0.8, y: -10, originY: 0 }
                            }
                            animate={isMobile
                                ? { y: 0, opacity: 1 }
                                : { opacity: 1, scaleY: 1, y: 0 }
                            }
                            exit={isMobile
                                ? { y: "-100%", opacity: 0 }
                                : { opacity: 0, scaleY: 0.8, y: -10 }
                            }
                            transition={{
                                duration: 0.5,
                                ease: [0.16, 1, 0.3, 1],
                                opacity: { duration: 0.2 }
                            }}
                            drag={isMobile ? "y" : false}
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={{ top: 1, bottom: 0.1 }}
                            onDragEnd={(_, info) => {
                                if (info.offset.y < -50 || info.velocity.y < -300) {
                                    setIsOpen(false);
                                }
                            }}
                            className={cn(
                                "fixed top-0 left-0 w-full h-[65vh] rounded-b-[2.5rem] bg-white shadow-2xl z-[100] overflow-hidden flex flex-col md:absolute md:top-[calc(100%+16px)] md:left-auto md:right-[-4rem] md:w-[420px] md:h-auto md:max-h-[600px] md:rounded-[28px] md:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] md:ring-1 md:ring-slate-100 md:origin-top-right",
                                "sm:right-0"
                            )}
                        >
                            {/* Mobile Pull Indicator */}
                            <div className="flex md:hidden justify-center pt-4 pb-2">
                                <div className="w-12 h-1 bg-slate-100 rounded-full" />
                            </div>

                            {/* Header */}
                            <div className="p-6 md:p-8 md:pb-6 flex items-center justify-between bg-white z-10 relative shrink-0">
                                <div>
                                    <h3 className="text-xl font-black md:font-bold text-slate-900 tracking-tight md:tracking-normal">Уведомления</h3>
                                    <p className="text-slate-400 text-xs font-bold mt-1">
                                        {unreadCount > 0
                                            ? formatCount(unreadCount, 'непрочитанное сообщение', 'непрочитанных сообщения', 'непрочитанных сообщений')
                                            : "Все уведомления прочитаны"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleMarkAllAsRead}
                                            disabled={loading === "all"}
                                            className="h-9 px-4 text-xs font-bold"
                                        >
                                            {loading === "all" ? <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" /> : "Прочитать все"}
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsOpen(false)}
                                        className="md:hidden p-2 rounded-full"
                                    >
                                        <ArrowRightLeft className="h-5 w-5 rotate-90" />
                                    </Button>
                                </div>
                            </div>

                            {/* Notifications List */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 md:px-2 md:pb-2 md:max-h-[450px]">
                                {notifications.length === 0 ? (
                                    <div className="py-20 md:py-16 text-center flex flex-col items-center justify-center">
                                        <div className="w-20 h-20 bg-slate-100/50 rounded-full flex items-center justify-center mb-4">
                                            <Bell className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h4 className="text-slate-900 font-black md:font-bold mb-2">Нет новых уведомлений</h4>
                                        <p className="text-sm text-slate-400 max-w-[240px] leading-relaxed">В данный момент у вас нет непрочитанных сообщений</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5 md:space-y-1">
                                        {notifications.map((notification) => {
                                            const config = typeConfig[notification.type];
                                            const Icon = config.icon;

                                            return (
                                                <div
                                                    key={notification.id}
                                                    className={cn(
                                                        "p-5 md:p-4 rounded-[24px] md:rounded-[20px] transition-all group border border-transparent",
                                                        !notification.isRead ? "bg-primary/[0.03] hover:bg-primary/[0.06]" : "hover:bg-slate-50 hover:border-slate-100"
                                                    )}
                                                >
                                                    <div className="flex gap-4">
                                                        {/* Icon */}
                                                        <div className={cn(
                                                            "w-12 h-12 md:w-10 md:h-10 rounded-2xl md:rounded-xl flex items-center justify-center shrink-0 shadow-sm mt-0.5",
                                                            config.bg
                                                        )}>
                                                            <Icon className={cn("w-6 h-6 md:w-5 md:h-5", config.color)} />
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-4 mb-1.5 md:mb-1">
                                                                <h4 className={cn(
                                                                    "text-[15px] md:text-[14px] leading-snug transition-colors",
                                                                    !notification.isRead ? "font-black md:font-extrabold text-slate-900" : "font-bold text-slate-700"
                                                                )}>
                                                                    {notification.title}
                                                                </h4>
                                                                <span
                                                                    className="text-[11px] font-bold md:font-medium text-slate-400 whitespace-nowrap pt-0.5 cursor-help"
                                                                    title={formatDate(notification.createdAt, branding?.dateFormat || 'DD.MM.YYYY')}
                                                                >
                                                                    {now && (now.getTime() - new Date(notification.createdAt).getTime()) < 24 * 60 * 60 * 1000
                                                                        ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ru })
                                                                        : formatDate(notification.createdAt, branding?.dateFormat || 'DD.MM.YYYY')
                                                                    }
                                                                </span>
                                                            </div>

                                                            <p className="text-[14px] md:text-[13px] text-slate-600 md:text-slate-500 leading-relaxed mb-3 pr-2 break-words">
                                                                {notification.message}
                                                            </p>

                                                            {!notification.isRead && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleMarkAsRead(notification.id);
                                                                    }}
                                                                    disabled={loading === notification.id}
                                                                    className="flex items-center gap-1.5 h-auto py-1.5 md:py-1 px-3 md:px-2 text-[11px] font-black md:font-bold text-primary border-primary/10 hover:bg-primary/5 hover:border-primary/20 shadow-sm rounded-xl md:rounded-lg"
                                                                >
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                    Отметить прочитанным
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
