"use client";

import { motion } from "framer-motion";
import {
    ShoppingCart,
    TrendingUp,
    CreditCard,
    Calendar,
    AlertTriangle,
    Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface ClientStatsWidgetProps {
    stats: {
        totalOrdersCount: number | null;
        totalOrdersAmount: number | null;
        averageCheck: number | null;
        lastOrderAt: Date | null;
        firstOrderAt: Date | null;
        daysSinceLastOrder: number | null;
    };
    currencySymbol?: string;
    className?: string;
}

export function ClientStatsWidget({
    stats,
    currencySymbol = "₽",
    className,
}: ClientStatsWidgetProps) {
    const isAtRisk = stats.daysSinceLastOrder !== null && stats.daysSinceLastOrder >= 90;
    const isInactive = stats.daysSinceLastOrder !== null && stats.daysSinceLastOrder >= 180;

    const statItems = [
        {
            label: "Заказов",
            value: stats.totalOrdersCount || 0,
            icon: ShoppingCart,
            color: "text-blue-500",
            bgColor: "bg-blue-50",
        },
        {
            label: "Выручка",
            value: `${(stats.totalOrdersAmount || 0).toLocaleString()} ${currencySymbol}`,
            icon: TrendingUp,
            color: "text-emerald-500",
            bgColor: "bg-emerald-50",
        },
        {
            label: "Средний чек",
            value: `${(stats.averageCheck || 0).toLocaleString()} ${currencySymbol}`,
            icon: CreditCard,
            color: "text-violet-500",
            bgColor: "bg-violet-50",
        },
        {
            label: "Последний заказ",
            value: stats.lastOrderAt
                ? formatDistanceToNow(new Date(stats.lastOrderAt), {
                    addSuffix: true,
                    locale: ru,
                })
                : "Нет заказов",
            icon: Calendar,
            color: isAtRisk ? "text-orange-500" : "text-slate-500",
            bgColor: isAtRisk ? "bg-orange-50" : "bg-slate-50",
        },
    ];

    return (
        <div className={cn("space-y-3", className)}>
            {/* Предупреждение о риске */}
            {isAtRisk && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                        "p-4 rounded-2xl flex items-center gap-3 border shadow-sm",
                        isInactive
                            ? "bg-red-50/50 border-red-100 text-red-900"
                            : "bg-orange-50/50 border-orange-100 text-orange-900"
                    )}
                >
                    <div
                        className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                            isInactive ? "bg-red-100" : "bg-orange-100"
                        )}
                    >
                        <AlertTriangle
                            className={cn(
                                "w-5 h-5",
                                isInactive ? "text-red-600" : "text-orange-600"
                            )}
                        />
                    </div>
                    <div>
                        <p className="font-bold text-sm leading-tight">
                            {isInactive ? "Клиент неактивен" : "Клиент в зоне риска"}
                        </p>
                        <p className="text-xs opacity-70 mt-0.5">
                            {stats.daysSinceLastOrder} дней без заказов
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Статистика */}
            <div className="grid grid-cols-2 gap-3">
                {statItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center",
                                        item.bgColor
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4", item.icon === Calendar && isAtRisk ? "text-orange-500" : item.color)} />
                                </div>
                                <p className="text-xs font-bold text-slate-900 leading-none">{item.label}</p>
                            </div>
                            <p className="font-bold text-slate-900 text-sm ">{item.value}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Дополнительная информация */}
            {stats.firstOrderAt && (
                <div className="flex items-center gap-2 px-1 text-xs font-medium text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                        Клиент с{" "}
                        {new Date(stats.firstOrderAt).toLocaleDateString("ru-RU", {
                            year: "numeric",
                            month: "long",
                        })}
                    </span>
                </div>
            )}
        </div>
    );
}
