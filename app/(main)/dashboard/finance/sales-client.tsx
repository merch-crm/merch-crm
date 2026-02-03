"use client";

import {
    TrendingUp,
    CreditCard,
    ShoppingBag,
    Tags,
    Activity,
    Trash2,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import { FinancialStats } from "./actions";

interface SalesClientProps {
    salesData: FinancialStats;
}

export function SalesClient({ salesData }: SalesClientProps) {
    const statsCards = [
        {
            label: "Общая выручка",
            value: Number(salesData.summary.totalRevenue || 0).toLocaleString('ru-RU'),
            suffix: "₽",
            icon: DollarSign,
            color: "text-emerald-600",
            bgIcon: "bg-emerald-100",
            trend: "+12.5%",
            trendIcon: ArrowUpRight,
            trendColor: "text-emerald-600"
        },
        {
            label: "Чистая прибыль",
            value: Number(salesData.summary.netProfit || 0).toLocaleString('ru-RU'),
            suffix: "₽",
            icon: TrendingUp,
            color: "text-primary",
            bgIcon: "bg-primary/10",
            trend: "+8.3%",
            trendIcon: ArrowUpRight,
            trendColor: "text-primary"
        },
        {
            label: "Средний чек",
            value: Math.round(Number(salesData.summary.avgOrderValue || 0)).toLocaleString('ru-RU'),
            suffix: "₽",
            icon: CreditCard,
            color: "text-amber-600",
            bgIcon: "bg-amber-100",
            trend: "-2.1%",
            trendIcon: ArrowDownRight,
            trendColor: "text-rose-500"
        },
        {
            label: "Количество заказов",
            value: Number(salesData.summary.orderCount || 0),
            suffix: "шт.",
            icon: ShoppingBag,
            color: "text-blue-600",
            bgIcon: "bg-blue-100",
            trend: "+5.2%",
            trendIcon: ArrowUpRight,
            trendColor: "text-blue-600"
        },
        {
            label: "Средняя с/с изделия",
            value: Math.round(Number(salesData.summary.averageCost || 0)).toLocaleString('ru-RU'),
            suffix: "₽",
            icon: Tags,
            color: "text-violet-600",
            bgIcon: "bg-violet-100",
            trend: "~0%",
            trendIcon: Activity,
            trendColor: "text-slate-500"
        },
        {
            label: "Списания",
            value: Math.round(Number(salesData.summary.writeOffs || 0)).toLocaleString('ru-RU'),
            suffix: "₽",
            icon: Trash2,
            color: "text-rose-600",
            bgIcon: "bg-rose-100",
            trend: "+1.2%",
            trendIcon: ArrowUpRight,
            trendColor: "text-rose-500"
        }
    ];

    const categoryLabels: Record<string, { label: string, color: string }> = {
        print: { label: "Печать", color: "bg-primary" },
        embroidery: { label: "Вышивка", color: "bg-purple-500" },
        merch: { label: "Мерч", color: "bg-emerald-500" },
        other: { label: "Прочее", color: "bg-slate-500" }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-[var(--crm-grid-gap)]">
                {statsCards.map((card, i) => (
                    <div key={i} className="crm-card p-6 bg-white flex flex-col justify-between h-40 hover:scale-[1.02] transition-all duration-500 group border-none shadow-sm h-full">
                        <div className="flex justify-between items-start">
                            <div className={cn(
                                "h-10 w-10 rounded-[var(--radius-inner)] flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform duration-500",
                                card.bgIcon
                            )}>
                                <card.icon className={cn("h-5 w-5", card.color)} />
                            </div>
                            <div className={cn(
                                "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold",
                                card.trendColor.replace('text-', 'bg-') + "/10",
                                card.trendColor
                            )}>
                                <card.trendIcon className="w-3 h-3" />
                                <span>{card.trend}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-slate-400 text-[10px] font-bold tracking-tight mb-2 uppercase">{card.label}</p>
                            <div className="text-2xl font-black text-slate-900 leading-none">
                                {card.value} <span className="text-sm text-slate-400 font-bold">{card.suffix}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[var(--crm-grid-gap)]">
                {salesData.categories.map((cat, i) => {
                    const config = categoryLabels[cat.name] || categoryLabels.other;
                    const totalRev = Number(salesData.summary.totalRevenue || 0);
                    const percentage = totalRev > 0 ? (cat.revenue / totalRev) * 100 : 0;

                    return (
                        <div key={i} className="crm-card p-6 bg-white flex flex-col justify-between hover:scale-[1.02] transition-all duration-500 group border-none shadow-sm relative overflow-hidden h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className={cn(
                                    "h-11 w-11 rounded-[var(--radius-inner)] flex items-center justify-center font-bold shadow-inner transition-transform duration-500 group-hover:scale-110",
                                    config.color.replace('bg-', 'bg-') + "/10"
                                )}>
                                    <Package className={cn("h-5 w-5", config.color.replace('bg-', 'text-'))} />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-slate-900 leading-none mb-1">{Math.round(percentage)}%</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase leading-none">доля выручки</div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-slate-400 text-[10px] font-bold uppercase mb-2">{config.label}</p>
                                <div className="text-2xl font-black text-slate-900 leading-none mb-2">
                                    {cat.revenue.toLocaleString()} <span className="text-sm text-slate-400 font-bold">₽</span>
                                </div>
                                <div className="text-xs text-slate-400 font-bold italic opacity-75">{cat.count} {pluralize(cat.count, 'заказ', 'заказа', 'заказов')}</div>
                            </div>

                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full transition-all duration-1000", config.color)}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
