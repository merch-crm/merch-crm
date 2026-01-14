"use client";

import { FileText, PlusCircle, Settings, CheckCircle2 } from "lucide-react";
import { Rouble } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface OrderStatsProps {
    stats: {
        total: number;
        new: number;
        inProduction: number;
        completed: number;
        revenue: number;
    };
    showFinancials?: boolean;
}

export function OrderStats({ stats, showFinancials }: OrderStatsProps) {
    const cards = [
        {
            label: "Всего заказов",
            value: stats.total,
            icon: FileText,
            color: "text-blue-500",
            bgColor: "bg-blue-50",
            visible: true,
        },
        {
            label: "Новые заказы",
            value: stats.new,
            icon: PlusCircle,
            color: "text-indigo-500",
            bgColor: "bg-indigo-50",
            visible: true,
        },
        {
            label: "В производстве",
            value: stats.inProduction,
            icon: Settings,
            color: "text-orange-500",
            bgColor: "bg-orange-50",
            visible: true,
        },
        {
            label: "Завершено",
            value: stats.completed,
            icon: CheckCircle2,
            color: "text-emerald-500",
            bgColor: "bg-emerald-50",
            visible: true,
        },
        {
            label: "Общая выручка",
            value: `${stats.revenue.toLocaleString("ru-RU")} ₽`,
            icon: Rouble,
            color: "text-violet-500",
            bgColor: "bg-violet-50",
            visible: showFinancials,
        },
    ].filter(card => card.visible);

    const gridCols = {
        4: "lg:grid-cols-4",
        5: "lg:grid-cols-5"
    };

    return (
        <div className={`grid grid-cols-1 md:grid-cols-3 ${gridCols[cards.length as keyof typeof gridCols]} gap-4 mb-8`}>
            {cards.map((card, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                        <p className="text-2xl font-black text-slate-900">{card.value}</p>
                    </div>
                    <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", card.bgColor)}>
                        <card.icon className={cn("w-6 h-6", card.color)} />
                    </div>
                </div>
            ))}
        </div>
    );
}
